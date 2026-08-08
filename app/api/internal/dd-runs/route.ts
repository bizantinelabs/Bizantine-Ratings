import { after, NextResponse } from 'next/server'
import { StartDDRunSchema } from '@/lib/dd/contracts'
import { dispatchToExternalEngine } from '@/lib/dd/engine'
import { runDDSimulator } from '@/lib/dd/simulator'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = StartDDRunSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid DD intake', issues: parsed.error.flatten() }, { status: 400 })
  }
  const input = parsed.data

  const { data: assessment } = await supabase
    .from('assessments')
    .select('id,rated_object_id')
    .eq('id', input.assessmentId)
    .single()

  if (!assessment || assessment.rated_object_id !== input.ratedObjectId) {
    return NextResponse.json({ error: 'Assessment or rated object not found' }, { status: 404 })
  }

  const { data: activeRun } = await supabase
    .from('dd_runs')
    .select('id,status')
    .eq('assessment_id', input.assessmentId)
    .in('status', ['queued', 'running'])
    .maybeSingle()

  if (activeRun) {
    return NextResponse.json({ error: 'An active DD run already exists', data: activeRun }, { status: 409 })
  }

  const executionMode = process.env.DD_ENGINE_URL && process.env.DD_ENGINE_API_KEY ? 'external' : 'simulator'
  const { data: run, error } = await supabase
    .from('dd_runs')
    .insert({
      assessment_id: input.assessmentId,
      rated_object_id: input.ratedObjectId,
      methodology_version: input.methodologyVersion,
      requested_by: user.id,
      input_payload: input,
      engine_version: executionMode === 'external' ? 'pending-engine-response' : 'simulator-contract-fixture-1.0.0',
      execution_mode: executionMode,
      current_stage: 'scope_validation',
    })
    .select('*')
    .single()

  if (error || !run) return NextResponse.json({ error: error?.message ?? 'Unable to create DD run' }, { status: 400 })

  await Promise.all([
    supabase.from('analyst_audit_log').insert({
      assessment_id: input.assessmentId,
      dd_run_id: run.id,
      actor: user.id,
      action: 'run_started',
      target: 'dd_run',
      new_value: { run_id: run.id, execution_mode: executionMode },
      rationale: input.analystNotes || 'Automated DD requested by analyst.',
    }),
    supabase.from('assessments').update({ status: 'automated_running', updated_at: new Date().toISOString() }).eq('id', input.assessmentId),
    supabase.from('dd_run_events').insert({
      dd_run_id: run.id,
      stage: 'scope_validation',
      level: 'info',
      message: `DD run queued in ${executionMode} mode.`,
      payload: { requested_by: user.id },
    }),
  ])

  try {
    const dispatch = await dispatchToExternalEngine(run.id, input)
    if (dispatch.mode === 'simulator') after(() => runDDSimulator(run.id, input))
  } catch (dispatchError) {
    const message = dispatchError instanceof Error ? dispatchError.message : 'Unable to dispatch DD run'
    const admin = createAdminClient()
    await Promise.all([
      admin.from('dd_runs').update({ status: 'failed', error_message: message, completed_at: new Date().toISOString() }).eq('id', run.id),
      admin.from('dd_run_events').insert({ dd_run_id: run.id, stage: 'scope_validation', level: 'error', message }),
    ])
    return NextResponse.json({ error: message, data: { ...run, status: 'failed' } }, { status: 502 })
  }

  return NextResponse.json({ data: run }, { status: 202 })
}
