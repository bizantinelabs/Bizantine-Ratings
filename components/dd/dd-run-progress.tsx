'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, Circle, Clock3, FlaskConical, LoaderCircle, RotateCcw, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DD_STAGES } from '@/lib/dd/contracts'
import { useDDRun } from '@/hooks/use-dd-run'
import { cn } from '@/lib/utils'

const labels: Record<string, string> = {
  scope_validation: 'Scope validation',
  evidence_collection: 'Evidence collection',
  evidence_normalization: 'Evidence normalization',
  mechanism_activation: 'Mechanism activation',
  subscore_calculation: 'Subscore calculation',
  gate_evaluation: 'Gate evaluation',
  cap_evaluation: 'Cap evaluation',
  report_generation: 'Report generation',
  final_validation: 'Final validation',
}

export function DDRunProgress({ runId, assessmentId }: { runId: string; assessmentId: string }) {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useDDRun(runId)
  const [action, setAction] = useState<'cancel' | 'retry' | null>(null)

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={error?.message ?? 'Run unavailable'} />

  const { run, events } = data
  const activeIndex = DD_STAGES.indexOf(run.current_stage as (typeof DD_STAGES)[number])
  const terminal = ['completed', 'needs_review', 'failed', 'canceled'].includes(run.status)
  const ready = ['completed', 'needs_review'].includes(run.status)

  async function cancel() {
    setAction('cancel')
    await fetch(`/api/internal/dd-runs/${runId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel', rationale: 'Canceled by analyst from live progress view.' }) })
    await mutate()
    setAction(null)
  }

  async function retry() {
    setAction('retry')
    const response = await fetch('/api/internal/dd-runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(run.input_payload) })
    const payload = await response.json()
    if (response.ok) router.push(`/dashboard/assessments/${assessmentId}/dd/runs/${payload.data.id}`)
    else setAction(null)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="flex flex-col gap-6">
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2"><span className={cn('size-2 rounded-full', terminal ? ready ? 'bg-success' : 'bg-destructive' : 'animate-pulse bg-primary')} /><span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{run.status.replace('_', ' ')}</span></div>
              <h2 className="mt-3 font-serif text-2xl text-foreground">{terminal ? ready ? 'Draft package ready' : 'Run stopped' : labels[run.current_stage ?? 'scope_validation']}</h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{run.id}</p>
            </div>
            <span className="w-fit rounded-md border border-border bg-muted/30 px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{run.execution_mode}</span>
          </div>
          <div className="mt-6 flex items-end justify-between gap-4"><span className="text-sm text-muted-foreground">Overall progress</span><span className="font-mono text-2xl font-semibold tabular-nums text-foreground">{run.progress_percent}%</span></div>
          <Progress value={run.progress_percent} className="mt-3 h-2" />
          {run.error_message && <div className="mt-5 flex gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><span>{run.error_message}</span></div>}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {ready && <Button nativeButton={false} render={<Link href={`/dashboard/assessments/${assessmentId}/dd/runs/${runId}/results`} />}><Check className="size-4" />Review results</Button>}
            {!terminal && <Button variant="outline" onClick={cancel} disabled={action !== null}><Square className="size-3.5" />{action === 'cancel' ? 'Canceling…' : 'Cancel run'}</Button>}
            {(run.status === 'failed' || run.status === 'canceled') && <Button onClick={retry} disabled={action !== null}><RotateCcw className="size-4" />{action === 'retry' ? 'Queuing…' : 'Retry run'}</Button>}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-foreground">Execution stages</h2>
          <ol className="mt-5 flex flex-col">
            {DD_STAGES.map((stage, index) => {
              const done = ready || index < activeIndex
              const active = !terminal && index === activeIndex
              return <li key={stage} className="flex gap-3"><div className="flex flex-col items-center"><span className={cn('flex size-7 items-center justify-center rounded-full border', done ? 'border-success/50 bg-success/10 text-success' : active ? 'border-primary/60 bg-primary/10 text-primary' : 'border-border text-muted-foreground')}>{done ? <Check className="size-3.5" /> : active ? <LoaderCircle className="size-3.5 animate-spin" /> : <Circle className="size-2.5" />}</span>{index < DD_STAGES.length - 1 && <span className={cn('h-8 w-px', done ? 'bg-success/40' : 'bg-border')} />}</div><div className="pt-1"><p className={cn('text-sm', done || active ? 'text-foreground' : 'text-muted-foreground')}>{labels[stage]}</p></div></li>
            })}
          </ol>
        </section>
      </div>

      <aside className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2"><Clock3 className="size-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Live execution log</h2></div>
        <div className="mt-5 flex max-h-[40rem] flex-col gap-4 overflow-y-auto">
          {[...events].reverse().map((event) => <div key={event.id} className="border-l border-border pl-3"><p className={cn('text-sm leading-5', event.level === 'error' ? 'text-destructive' : event.level === 'warning' ? 'text-warning' : 'text-foreground')}>{event.message}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{labels[event.stage] ?? event.stage} · {new Date(event.occurred_at).toLocaleTimeString()}</p></div>)}
          {events.length === 0 && <p className="text-sm text-muted-foreground">Waiting for the first engine event…</p>}
        </div>
      </aside>
    </div>
  )
}

function LoadingState() { return <div className="flex min-h-64 items-center justify-center rounded-lg border border-border bg-card"><LoaderCircle className="size-6 animate-spin text-primary" /><span className="sr-only">Loading DD run</span></div> }
function ErrorState({ message }: { message: string }) { return <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6"><FlaskConical className="size-5 text-destructive" /><h2 className="mt-3 font-semibold text-foreground">Unable to load run</h2><p className="mt-1 text-sm text-muted-foreground">{message}</p></div> }
