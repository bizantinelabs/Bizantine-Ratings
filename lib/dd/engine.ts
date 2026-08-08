import 'server-only'

import { EngineAcceptedResponseSchema, type StartDDRunInput } from '@/lib/dd/contracts'
import { createAdminClient } from '@/lib/supabase/admin'

export type EngineDispatch =
  | { mode: 'simulator' }
  | { mode: 'external'; accepted: { run_id: string; status?: string } }

export async function dispatchToExternalEngine(runId: string, input: StartDDRunInput): Promise<EngineDispatch> {
  const engineUrl = process.env.DD_ENGINE_URL
  const apiKey = process.env.DD_ENGINE_API_KEY

  if (!engineUrl && !apiKey) return { mode: 'simulator' }
  if (!engineUrl || !apiKey) {
    throw new Error('DD Engine is partially configured. Both DD_ENGINE_URL and DD_ENGINE_API_KEY are required.')
  }

  const response = await fetch(`${engineUrl.replace(/\/$/, '')}/v1/dd-runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-API-Key': apiKey,
    },
    body: JSON.stringify({
      run_id: runId,
      assessment_id: input.assessmentId,
      rated_object_id: input.ratedObjectId,
      methodology_version: input.methodologyVersion,
      input_data: input,
    }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) throw new Error(`DD Engine rejected the run (${response.status}).`)
  const accepted = EngineAcceptedResponseSchema.parse(await response.json())
  if (accepted.run_id !== runId) throw new Error('DD Engine returned a mismatched run id.')

  const admin = createAdminClient()
  await Promise.all([
    admin.from('dd_runs').update({ execution_mode: 'external' }).eq('id', runId),
    admin.from('dd_run_events').insert({
      dd_run_id: runId,
      stage: 'scope_validation',
      level: 'info',
      message: 'Run accepted by the external Bizantine DD Engine.',
    }),
  ])

  return { mode: 'external', accepted }
}
