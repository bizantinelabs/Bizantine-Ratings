'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { AssessmentCalculation, DDRun, DDRunEvent } from '@/types/dd'

export interface DDRunBundle {
  run: DDRun
  events: DDRunEvent[]
  evidence: Array<Record<string, unknown>>
  subscores: Array<Record<string, unknown>>
  findings: Array<Record<string, unknown>>
  calculation: AssessmentCalculation | null
  audit: Array<Record<string, unknown>>
  assessment: Record<string, unknown> | null
  publication: Record<string, unknown> | null
}

const fetcher = async (url: string): Promise<DDRunBundle> => {
  const response = await fetch(url)
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error ?? 'Unable to load DD run')
  return payload.data
}

export function useDDRun(runId: string) {
  const swr = useSWR(`/api/internal/dd-runs/${runId}`, fetcher, {
    refreshInterval: (data) => data && ['queued', 'running'].includes(data.run.status) ? 5000 : 0,
    revalidateOnFocus: true,
  })

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`dd-run-${runId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dd_runs', filter: `id=eq.${runId}` }, () => swr.mutate())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dd_run_events', filter: `dd_run_id=eq.${runId}` }, () => swr.mutate())
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [runId, swr.mutate])

  return swr
}
