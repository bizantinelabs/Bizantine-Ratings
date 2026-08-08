import 'server-only'

import { createHash } from 'node:crypto'
import { DDRunResultSchema, DD_STAGES, type StartDDRunInput } from '@/lib/dd/contracts'
import { persistDDRunResult } from '@/lib/dd/persist-result'
import { createAdminClient } from '@/lib/supabase/admin'

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const STAGE_MESSAGES: Record<(typeof DD_STAGES)[number], string> = {
  scope_validation: 'Scope and intake payload validated.',
  evidence_collection: 'Onchain and document adapters returned evidence.',
  evidence_normalization: 'Raw observations normalized to canonical fact keys.',
  mechanism_activation: 'Applicable mechanism branches identified.',
  subscore_calculation: 'Python-engine fixture subscores received.',
  gate_evaluation: 'Hard-gate checks completed.',
  cap_evaluation: 'Approval-cap checks completed.',
  report_generation: 'Draft rating report generated.',
  final_validation: 'Output contract and package integrity validated.',
}

/**
 * Preview-only fixture runner. It simulates orchestration stages and emits a
 * fixed validated engine response; it does not implement BL-APB scoring logic.
 */
export async function runDDSimulator(runId: string, input: StartDDRunInput) {
  const admin = createAdminClient()

  try {
    for (const [index, stage] of DD_STAGES.entries()) {
      const { data: current } = await admin.from('dd_runs').select('status').eq('id', runId).single()
      if (current?.status === 'canceled') return

      const progress = Math.min(94, 8 + index * 11)
      const now = new Date().toISOString()
      await Promise.all([
        admin
          .from('dd_runs')
          .update({
            status: 'running',
            started_at: index === 0 ? now : undefined,
            progress_percent: progress,
            current_stage: stage,
          })
          .eq('id', runId),
        admin.from('dd_run_events').insert({
          dd_run_id: runId,
          stage,
          level: 'info',
          message: STAGE_MESSAGES[stage],
          payload: stage === 'mechanism_activation' ? { active_mechanisms: ['admin_control', 'oracle_dependency', 'liquidity_exit'] } : null,
        }),
      ])
      await sleep(550)
    }

    const resultHash = createHash('sha256')
      .update(`${runId}:${input.ratedObjectId}:${input.methodologyVersion}`)
      .digest('hex')

    // Static fixture values mirror the Python API contract only. No score is
    // derived here; the external Python engine remains the sole methodology executor.
    const result = DDRunResultSchema.parse({
      run_id: runId,
      methodology_version: input.methodologyVersion,
      methodology_hash: 'sha256:fixture-bl-apb-v0.2.0',
      engine_version: 'simulator-contract-fixture-1.0.0',
      git_commit_sha: null,
      active_mechanisms: ['admin_control', 'oracle_dependency', 'liquidity_exit'],
      missing_facts: ['legal.insolvency_remoteness_opinion'],
      evidence_items: [
        { fact_key: 'admin.timelock_hours', category: 'governance', source: 'Onchain adapter', source_type: 'rpc', value: 48, confidence: 98 },
        { fact_key: 'oracle.provider', category: 'market', source: 'Contract inspection', source_type: 'rpc', value: 'Chainlink', confidence: 96 },
        { fact_key: 'audit.latest_date', category: 'security', source: 'Uploaded audit report', source_type: 'document', value: input.dataCutoff.slice(0, 10), confidence: 89 },
        { fact_key: 'liquidity.exit_depth_usd', category: 'liquidity', source: 'DEX market adapter', source_type: 'api', value: 12400000, confidence: 92 },
      ],
      subscore_results: [
        { track: 'General', criterion_code: 'K_ADMIN_TIMELOCK', criterion_label: 'Administrative timelock', weight: 0.2, auto_score: 76, evidence_refs: ['admin.timelock_hours'] },
        { track: 'Asset', criterion_code: 'K_ORACLE_RESILIENCE', criterion_label: 'Oracle resilience', weight: 0.25, auto_score: 82, evidence_refs: ['oracle.provider'] },
        { track: 'Protocol Opportunity', criterion_code: 'K_LIQUIDITY_EXIT', criterion_label: 'Exit liquidity', weight: 0.35, auto_score: 71, evidence_refs: ['liquidity.exit_depth_usd'] },
        { track: 'Blockchain', criterion_code: 'K_CHAIN_SECURITY', criterion_label: 'Chain security', weight: 0.2, auto_score: 85, evidence_refs: [] },
      ],
      findings: [
        { severity: 'medium', title: 'Legal opinion not supplied', detail: 'Insolvency-remoteness evidence remains outstanding.', track: 'General' },
        { severity: 'low', title: 'Concentrated oracle dependency', detail: 'Primary pricing depends on one provider.', track: 'Asset' },
      ],
      rating_calculation: {
        public_score: 76,
        band: 'BBB',
        track_scores: { General: 76, Asset: 82, 'Protocol Opportunity': 71, Blockchain: 85 },
        evidence_coverage: 84,
        confidence: 90,
        gates: [{ code: 'GATE_UNVERIFIABLE_CONTROL', label: 'Control verifiability', status: 'passed', detail: 'Control paths are observable onchain.' }],
        caps: [{ code: 'CAP_LEGAL_EVIDENCE', label: 'Legal evidence cap', status: 'triggered', detail: 'Draft cannot exceed BBB until legal evidence is reviewed.' }],
        result_hash: resultHash,
      },
      validation: {
        errors: [],
        warnings: [{ code: 'MISSING_LEGAL_FACT', message: 'Legal insolvency-remoteness opinion is missing.', path: 'legal.insolvency_remoteness_opinion', severity: 'warning' }],
      },
      report: '# Draft automated due-diligence report\n\nThis contract fixture demonstrates the report boundary. Production reports are generated only by the Bizantine DD Engine.',
    })

    await persistDDRunResult(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown simulator failure'
    await Promise.all([
      admin
        .from('dd_runs')
        .update({ status: 'failed', error_message: message, completed_at: new Date().toISOString() })
        .eq('id', runId),
      admin.from('dd_run_events').insert({
        dd_run_id: runId,
        stage: 'final_validation',
        level: 'error',
        message: `DD run failed: ${message}`,
      }),
    ])
  }
}
