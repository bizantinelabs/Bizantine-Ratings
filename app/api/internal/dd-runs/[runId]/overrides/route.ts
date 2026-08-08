import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const OverrideSchema = z.object({
  subscoreId: z.string().uuid(),
  score: z.number().min(0).max(100).nullable(),
  rationale: z.string().trim().min(12).max(2000),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = OverrideSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid override', issues: parsed.error.flatten() }, { status: 400 })

  const { data: subscore } = await supabase
    .from('subscore_results')
    .select('id,assessment_id,criterion_code,auto_score,override_score,override_rationale')
    .eq('id', parsed.data.subscoreId)
    .eq('dd_run_id', runId)
    .single()

  if (!subscore) return NextResponse.json({ error: 'Subscore not found' }, { status: 404 })

  const isClearing = parsed.data.score === null
  const now = new Date().toISOString()
  const { data: updated, error } = await supabase
    .from('subscore_results')
    .update({
      override_score: parsed.data.score,
      override_rationale: isClearing ? null : parsed.data.rationale,
      overridden_by: isClearing ? null : user.id,
      overridden_at: isClearing ? null : now,
    })
    .eq('id', subscore.id)
    .select('*')
    .single()

  if (error || !updated) return NextResponse.json({ error: error?.message ?? 'Unable to save override' }, { status: 400 })

  await Promise.all([
    supabase.from('analyst_audit_log').insert({
      assessment_id: subscore.assessment_id,
      dd_run_id: runId,
      actor: user.id,
      action: isClearing ? 'override_cleared' : 'override_applied',
      target: `subscore.${subscore.criterion_code}`,
      original_value: { score: subscore.override_score ?? subscore.auto_score, rationale: subscore.override_rationale },
      new_value: { score: parsed.data.score, rationale: parsed.data.rationale },
      rationale: parsed.data.rationale,
    }),
    supabase.from('assessments').update({ status: 'in_review', updated_at: now }).eq('id', subscore.assessment_id),
  ])

  return NextResponse.json({ data: updated })
}
