import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const PublishSchema = z.object({
  rationale: z.string().trim().min(12).max(2000),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = PublishSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Publication rationale is required' }, { status: 400 })

  const { data: assessment } = await supabase
    .from('assessments')
    .select('id,status,methodology_version')
    .eq('id', assessmentId)
    .single()

  if (!assessment || assessment.status !== 'approved') {
    return NextResponse.json({ error: 'Assessment must be approved before publication' }, { status: 409 })
  }

  const { data: run } = await supabase
    .from('dd_runs')
    .select('*')
    .eq('assessment_id', assessmentId)
    .in('status', ['completed', 'needs_review'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!run || run.validation_errors?.length) {
    return NextResponse.json({ error: 'A validated engine result is required before publication' }, { status: 409 })
  }

  const [{ data: calculation }, { count: overrideCount }] = await Promise.all([
    supabase.from('assessment_calculations').select('*').eq('dd_run_id', run.id).single(),
    supabase.from('subscore_results').select('id', { count: 'exact', head: true }).eq('dd_run_id', run.id).not('override_score', 'is', null),
  ])

  if (!calculation) return NextResponse.json({ error: 'Calculation snapshot not found' }, { status: 404 })
  if (overrideCount) {
    return NextResponse.json({ error: 'Overrides require Python engine recomputation before publication' }, { status: 409 })
  }

  const admin = createAdminClient()
  const snapshot = {
    assessment_id: assessmentId,
    dd_run_id: run.id,
    calculation_id: calculation.id,
    public_score: calculation.auto_public_score,
    band: calculation.auto_band,
    result_hash: calculation.result_hash,
    methodology_version: run.methodology_version,
    methodology_hash: run.methodology_hash,
    engine_version: run.engine_version,
    published_by: user.id,
    snapshot: { calculation, engine_output: run.output_payload },
  }

  const { data: published, error } = await admin.from('published_rating_snapshots').insert(snapshot).select('*').single()
  if (error || !published) return NextResponse.json({ error: error?.message ?? 'Unable to publish rating' }, { status: 400 })

  await Promise.all([
    admin.from('assessments').update({ status: 'published', published_score: calculation.auto_public_score, published_band: calculation.auto_band, completion: 100, updated_at: published.published_at }).eq('id', assessmentId),
    admin.from('assessment_calculations').update({ final_public_score: calculation.auto_public_score, final_band: calculation.auto_band, is_draft: false }).eq('id', calculation.id),
    admin.from('analyst_audit_log').insert({
      assessment_id: assessmentId,
      dd_run_id: run.id,
      actor: user.id,
      action: 'published',
      target: 'published_rating_snapshot',
      original_value: null,
      new_value: { snapshot_id: published.id, score: published.public_score, band: published.band, result_hash: published.result_hash },
      rationale: parsed.data.rationale,
    }),
  ])

  return NextResponse.json({ data: published }, { status: 201 })
}
