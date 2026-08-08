import 'server-only'

import { DDRunResultSchema, type DDRunResult } from '@/lib/dd/contracts'
import { createAdminClient } from '@/lib/supabase/admin'

export async function persistDDRunResult(rawResult: unknown) {
  const result = DDRunResultSchema.parse(rawResult)
  const admin = createAdminClient()

  const { data: run, error: runError } = await admin
    .from('dd_runs')
    .select('assessment_id,status')
    .eq('id', result.run_id)
    .single()

  if (runError || !run) throw new Error('DD run not found while persisting result')
  if (run.status === 'canceled') return result

  await Promise.all([
    admin.from('evidence_items').delete().eq('dd_run_id', result.run_id),
    admin.from('subscore_results').delete().eq('dd_run_id', result.run_id),
    admin.from('findings').delete().eq('dd_run_id', result.run_id),
    admin.from('assessment_calculations').delete().eq('dd_run_id', result.run_id),
  ])

  const operations = [
    admin.from('evidence_items').insert(
      result.evidence_items.map((item) => ({
        dd_run_id: result.run_id,
        assessment_id: run.assessment_id,
        ...item,
      })),
    ),
    admin.from('subscore_results').insert(
      result.subscore_results.map((item) => ({
        dd_run_id: result.run_id,
        assessment_id: run.assessment_id,
        ...item,
      })),
    ),
    admin.from('findings').insert(
      result.findings.map((item) => ({
        dd_run_id: result.run_id,
        assessment_id: run.assessment_id,
        ...item,
      })),
    ),
    admin.from('assessment_calculations').insert({
      dd_run_id: result.run_id,
      assessment_id: run.assessment_id,
      auto_public_score: result.rating_calculation.public_score,
      auto_band: result.rating_calculation.band,
      final_public_score: null,
      final_band: null,
      gates: result.rating_calculation.gates,
      caps: result.rating_calculation.caps,
      track_scores: result.rating_calculation.track_scores,
      evidence_coverage: result.rating_calculation.evidence_coverage,
      confidence: result.rating_calculation.confidence,
      result_hash: result.rating_calculation.result_hash,
      is_draft: true,
    }),
  ]

  const writes = await Promise.all(operations)
  const writeError = writes.find((entry) => entry.error)?.error
  if (writeError) throw new Error(writeError.message)

  const finalStatus = result.validation.errors.length > 0 ? 'needs_review' : 'completed'
  const completedAt = new Date().toISOString()

  const { error: updateError } = await admin
    .from('dd_runs')
    .update({
      status: finalStatus,
      progress_percent: 100,
      current_stage: 'final_validation',
      completed_at: completedAt,
      methodology_hash: result.methodology_hash,
      engine_version: result.engine_version,
      git_commit_sha: result.git_commit_sha ?? null,
      output_payload: result,
      validation_errors: result.validation.errors,
      validation_warnings: result.validation.warnings,
    })
    .eq('id', result.run_id)

  if (updateError) throw new Error(updateError.message)

  await Promise.all([
    admin
      .from('assessments')
      .update({ status: 'needs_review', completion: 85, updated_at: completedAt })
      .eq('id', run.assessment_id),
    admin.from('dd_run_events').insert({
      dd_run_id: result.run_id,
      stage: 'final_validation',
      level: result.validation.errors.length ? 'warning' : 'info',
      message: result.validation.errors.length
        ? 'Automated DD completed with validation issues requiring analyst review.'
        : 'Automated DD completed. Draft results are ready for analyst review.',
      payload: {
        evidence_count: result.evidence_items.length,
        finding_count: result.findings.length,
        result_hash: result.rating_calculation.result_hash,
      },
    }),
  ])

  return result
}
