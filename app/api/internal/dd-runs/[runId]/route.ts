import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [runResult, eventsResult, evidenceResult, subscoresResult, findingsResult, calculationResult, auditResult] = await Promise.all([
    supabase.from('dd_runs').select('*').eq('id', runId).single(),
    supabase.from('dd_run_events').select('*').eq('dd_run_id', runId).order('id'),
    supabase.from('evidence_items').select('*').eq('dd_run_id', runId).order('collected_at'),
    supabase.from('subscore_results').select('*').eq('dd_run_id', runId).order('track'),
    supabase.from('findings').select('*').eq('dd_run_id', runId).order('created_at'),
    supabase.from('assessment_calculations').select('*').eq('dd_run_id', runId).maybeSingle(),
    supabase.from('analyst_audit_log').select('*').eq('dd_run_id', runId).order('id'),
  ])

  if (runResult.error || !runResult.data) {
    return NextResponse.json({ error: 'DD run not found' }, { status: 404 })
  }

  const [assessmentResult, publicationResult] = await Promise.all([
    supabase.from('assessments').select('*').eq('id', runResult.data.assessment_id).single(),
    supabase.from('published_rating_snapshots').select('*').eq('dd_run_id', runId).maybeSingle(),
  ])

  return NextResponse.json({
    data: {
      run: runResult.data,
      events: eventsResult.data ?? [],
      evidence: evidenceResult.data ?? [],
      subscores: subscoresResult.data ?? [],
      findings: findingsResult.data ?? [],
      calculation: calculationResult.data,
      audit: auditResult.data ?? [],
      assessment: assessmentResult.data,
      publication: publicationResult.data,
    },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (body?.action !== 'cancel') return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })

  const { data: run } = await supabase
    .from('dd_runs')
    .select('id,assessment_id,status,execution_mode')
    .eq('id', runId)
    .single()

  if (!run) return NextResponse.json({ error: 'DD run not found' }, { status: 404 })
  if (!['queued', 'running'].includes(run.status)) {
    return NextResponse.json({ error: 'Only active runs can be canceled' }, { status: 409 })
  }

  const now = new Date().toISOString()
  const [{ error }] = await Promise.all([
    supabase.from('dd_runs').update({ status: 'canceled', completed_at: now, error_message: 'Canceled by analyst.' }).eq('id', runId),
    supabase.from('dd_run_events').insert({ dd_run_id: runId, stage: 'canceled', level: 'warning', message: 'Run canceled by analyst.' }),
    supabase.from('assessments').update({ status: 'draft', updated_at: now }).eq('id', run.assessment_id),
    supabase.from('analyst_audit_log').insert({
      assessment_id: run.assessment_id,
      dd_run_id: runId,
      actor: user.id,
      action: 'run_canceled',
      target: 'dd_run.status',
      original_value: run.status,
      new_value: 'canceled',
      rationale: body.rationale || 'Canceled from job progress screen.',
    }),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data: { id: runId, status: 'canceled' } })
}
