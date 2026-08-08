'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, FileText, LoaderCircle, Save, Send, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDDRun } from '@/hooks/use-dd-run'
import { cn } from '@/lib/utils'

const tabNames = ['summary', 'evidence', 'mechanisms', 'subscores', 'gates', 'findings', 'validation', 'report', 'metadata', 'comparison'] as const

export function DDResultsReview({ runId, assessmentId }: { runId: string; assessmentId: string }) {
  const { data, error, isLoading, mutate } = useDDRun(runId)
  const [busy, setBusy] = useState<string | null>(null)

  if (isLoading) return <div className="flex min-h-64 items-center justify-center"><LoaderCircle className="size-6 animate-spin text-primary" /><span className="sr-only">Loading results</span></div>
  if (error || !data) return <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">{error?.message ?? 'Results unavailable'}</div>

  const output = data.run.output_payload
  const assessment = data.assessment ?? {}
  const approved = assessment.status === 'approved'
  const published = assessment.status === 'published' || Boolean(data.publication)

  async function setStatus(status: 'in_review' | 'approved' | 'rejected') {
    setBusy(status)
    const response = await fetch(`/api/internal/assessments/${assessmentId}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, rationale: `Assessment moved to ${status.replace('_', ' ')} from results review.` }),
    })
    const payload = await response.json()
    if (response.ok) { toast.success(`Assessment ${status.replace('_', ' ')}`); await mutate() } else toast.error(payload.error ?? 'Status update failed')
    setBusy(null)
  }

  async function publishRating() {
    setBusy('publish')
    const response = await fetch(`/api/internal/assessments/${assessmentId}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId }) })
    const payload = await response.json()
    if (response.ok) { toast.success('Immutable rating snapshot published'); await mutate() } else toast.error(payload.error ?? 'Publication failed')
    setBusy(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/dashboard/assessments/${assessmentId}/dd/runs/${runId}`} />} className="-ml-2 mb-3"><ArrowLeft className="size-4" />Run progress</Button>
          <div className="flex flex-wrap items-center gap-2"><span className="rounded border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">Draft engine result</span>{published && <span className="rounded border border-success/30 bg-success/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-success">Published</span>}</div>
          <h1 className="mt-3 font-serif text-2xl text-foreground sm:text-3xl">Due-diligence results</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{runId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!approved && !published && <Button variant="outline" onClick={() => setStatus('in_review')} disabled={busy !== null}><ShieldCheck className="size-4" />Send to review</Button>}
          {!approved && !published && <Button onClick={() => setStatus('approved')} disabled={busy !== null}><CheckCircle2 className="size-4" />Approve</Button>}
          {approved && !published && <Button onClick={publishRating} disabled={busy !== null}><Send className="size-4" />Publish rating</Button>}
        </div>
      </div>

      <Tabs defaultValue="summary">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <TabsList variant="line" className="min-w-max justify-start">
            {tabNames.map((tab) => <TabsTrigger key={tab} value={tab} className="px-2.5 text-xs capitalize">{tab}</TabsTrigger>)}
          </TabsList>
        </div>
        <TabsContent value="summary"><Summary data={data} /></TabsContent>
        <TabsContent value="evidence"><Evidence items={data.evidence} /></TabsContent>
        <TabsContent value="mechanisms"><Mechanisms items={output?.active_mechanisms ?? []} missing={output?.missing_facts ?? []} /></TabsContent>
        <TabsContent value="subscores"><Subscores data={data} runId={runId} onSaved={mutate} /></TabsContent>
        <TabsContent value="gates"><Gates calculation={data.calculation} /></TabsContent>
        <TabsContent value="findings"><Findings items={data.findings} /></TabsContent>
        <TabsContent value="validation"><Validation errors={data.run.validation_errors} warnings={data.run.validation_warnings} /></TabsContent>
        <TabsContent value="report"><Report text={output?.report ?? ''} /></TabsContent>
        <TabsContent value="metadata"><Metadata data={data} /></TabsContent>
        <TabsContent value="comparison"><Comparison data={data} /></TabsContent>
      </Tabs>
    </div>
  )
}

function Summary({ data }: { data: ReturnType<typeof useDDRun>['data'] }) {
  if (!data) return null
  const c = data.calculation
  const cards = [['Automated score', c?.auto_public_score ?? '—'], ['Rating band', c?.auto_band ?? '—'], ['Evidence coverage', c ? `${c.evidence_coverage}%` : '—'], ['Confidence', c ? `${c.confidence}%` : '—']]
  return <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="rounded-lg border border-border bg-card p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</p></div>)}</div>
}

function Evidence({ items }: { items: Array<Record<string, unknown>> }) {
  return <Panel title="Normalized evidence" count={items.length}>{items.map((item, i) => <Row key={String(item.id ?? i)} title={String(item.fact_key)} meta={`${item.category} · ${item.source_type}`} value={`${item.confidence}% confidence`} />)}</Panel>
}

function Mechanisms({ items, missing }: { items: string[]; missing: string[] }) {
  return <div className="grid gap-4 pt-4 md:grid-cols-2"><Panel title="Active mechanism branches" count={items.length}>{items.map((item) => <Row key={item} title={item.replaceAll('_', ' ')} meta="Activated by engine" value="Active" />)}</Panel><Panel title="Missing fact keys" count={missing.length}>{missing.length ? missing.map((item) => <Row key={item} title={item} meta="Analyst evidence requested" value="Missing" warning />) : <Empty text="No missing facts reported." />}</Panel></div>
}

function Subscores({ data, runId, onSaved }: { data: NonNullable<ReturnType<typeof useDDRun>['data']>; runId: string; onSaved: () => Promise<unknown> }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [score, setScore] = useState('')
  const [rationale, setRationale] = useState('')
  const [saving, setSaving] = useState(false)
  async function save(id: string) {
    setSaving(true)
    const response = await fetch(`/api/internal/dd-runs/${runId}/overrides`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscoreId: id, score: Number(score), rationale }) })
    const payload = await response.json()
    if (response.ok) { toast.success('Override saved to audit trail'); setEditing(null); setScore(''); setRationale(''); await onSaved() } else toast.error(payload.error ?? 'Override failed')
    setSaving(false)
  }
  return <Panel title="Criterion-level subscores" count={data.subscores.length}>{data.subscores.map((item, i) => { const id = String(item.id); const open = editing === id; return <div key={id || i} className="border-b border-border py-4 last:border-0"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-foreground">{String(item.criterion_label)}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{String(item.track)} · {String(item.criterion_code)} · weight {Number(item.weight) * 100}%</p></div><div className="text-right"><p className="font-mono text-lg font-semibold text-foreground">{String(item.override_score ?? item.auto_score)}</p>{item.override_score != null && <p className="font-mono text-[9px] uppercase text-warning">Auto {String(item.auto_score)}</p>}</div></div>{open ? <div className="mt-4 grid gap-3 rounded-md border border-border bg-background p-3"><Input type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} placeholder="Replacement score" aria-label="Replacement score" /><Input value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Required rationale" aria-label="Override rationale" /><div className="flex gap-2"><Button size="sm" onClick={() => save(id)} disabled={saving || !score || rationale.trim().length < 12}><Save className="size-3.5" />Save override</Button><Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div><p className="text-xs text-muted-foreground">The UI records this override but does not recalculate methodology. Re-run the Python engine to produce a revised aggregate.</p></div> : <Button size="sm" variant="ghost" className="mt-2" onClick={() => { setEditing(id); setScore(String(item.override_score ?? item.auto_score)); setRationale(String(item.override_rationale ?? '')) }}>Review / override</Button>}</div>})}</Panel>
}

function Gates({ calculation }: { calculation: ReturnType<typeof useDDRun>['data'] extends infer T ? T extends { calculation: infer C } ? C : never : never }) {
  const gates = calculation?.gates ?? []; const caps = calculation?.caps ?? []
  return <div className="grid gap-4 pt-4 md:grid-cols-2"><DecisionList title="Hard gates" items={gates} /><DecisionList title="Approval caps" items={caps} /></div>
}
function DecisionList({ title, items }: { title: string; items: Array<Record<string, unknown>> }) { return <Panel title={title} count={items.length}>{items.map((item, i) => <Row key={String(item.code ?? i)} title={String(item.label ?? item.code)} meta={String(item.detail ?? '')} value={String(item.status ?? '')} warning={item.status === 'triggered'} />)}</Panel> }
function Findings({ items }: { items: Array<Record<string, unknown>> }) { return <Panel title="Engine findings" count={items.length}>{items.map((item, i) => <Row key={String(item.id ?? i)} title={String(item.title)} meta={`${item.track ?? 'general'} · ${item.detail ?? ''}`} value={String(item.severity)} warning={['critical', 'high'].includes(String(item.severity))} />)}</Panel> }
function Validation({ errors, warnings }: { errors: Array<Record<string, unknown>>; warnings: Array<Record<string, unknown>> }) { return <div className="grid gap-4 pt-4 md:grid-cols-2"><Panel title="Validation errors" count={errors.length}>{errors.length ? errors.map((x, i) => <Row key={i} title={String(x.code)} meta={String(x.message)} value="Error" warning />) : <Empty text="No blocking validation errors." />}</Panel><Panel title="Warnings" count={warnings.length}>{warnings.length ? warnings.map((x, i) => <Row key={i} title={String(x.code)} meta={String(x.message)} value="Warning" warning />) : <Empty text="No validation warnings." />}</Panel></div> }
function Report({ text }: { text: string }) { return <div className="mt-4 rounded-lg border border-border bg-card p-4 sm:p-6"><div className="flex items-center gap-2"><FileText className="size-4 text-primary" /><h2 className="text-sm font-semibold">Generated report</h2></div><pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-6 text-muted-foreground">{text || 'No report generated.'}</pre></div> }
function Metadata({ data }: { data: NonNullable<ReturnType<typeof useDDRun>['data']> }) { const rows = [['Run ID', data.run.id], ['Engine', data.run.engine_version], ['Execution mode', data.run.execution_mode], ['Methodology', data.run.methodology_version], ['Methodology hash', data.run.methodology_hash ?? '—'], ['Git commit', data.run.git_commit_sha ?? '—'], ['Result hash', data.calculation?.result_hash ?? '—']]; return <Panel title="Deterministic run metadata" count={rows.length}>{rows.map(([a,b]) => <Row key={a} title={a} meta="" value={b} />)}</Panel> }

function Comparison({ data }: { data: NonNullable<ReturnType<typeof useDDRun>['data']> }) {
  const automated = data.calculation?.auto_public_score ?? null
  const overrides = data.subscores.filter((x) => x.override_score != null)
  const prior = Number(data.assessment?.published_score ?? 0) || null
  const columns = [{ label: 'Automated result', score: automated, note: 'Python engine output' }, { label: 'Analyst-edited', score: overrides.length ? 'Pending engine re-run' : automated, note: `${overrides.length} audited override${overrides.length === 1 ? '' : 's'}` }, { label: 'Prior published', score: prior, note: String(data.assessment?.published_band ?? 'No prior rating') }]
  return <div className="pt-4"><div className="grid gap-3 md:grid-cols-3">{columns.map((column) => <div key={column.label} className="rounded-lg border border-border bg-card p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{column.label}</p><p className={cn('mt-4 font-mono font-semibold text-foreground', typeof column.score === 'number' ? 'text-3xl' : 'text-base leading-6')}>{column.score ?? '—'}</p><p className="mt-2 text-xs text-muted-foreground">{column.note}</p></div>)}</div><Panel title="Change audit" count={data.audit.length}>{data.audit.length ? data.audit.map((entry, i) => <Row key={String(entry.id ?? i)} title={String(entry.action).replaceAll('_', ' ')} meta={`${entry.rationale ?? 'No rationale'} · ${new Date(String(entry.occurred_at)).toLocaleString()}`} value={String(entry.target ?? 'assessment')} />) : <Empty text="No analyst changes recorded." />}</Panel></div>
}

function Panel({ title, count, children }: { title: string; count: number; children: React.ReactNode }) { return <section className="mt-4 rounded-lg border border-border bg-card p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-foreground">{title}</h2><span className="font-mono text-xs text-muted-foreground">{count}</span></div><div className="mt-3">{children}</div></section> }
function Row({ title, meta, value, warning = false }: { title: string; meta: string; value: string; warning?: boolean }) { return <div className="flex flex-col gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-sm font-medium text-foreground capitalize">{title}</p>{meta && <p className="mt-1 text-xs leading-5 text-muted-foreground">{meta}</p>}</div><span className={cn('w-fit shrink-0 rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-wider', warning ? 'border-warning/30 bg-warning/10 text-warning' : 'border-border bg-muted/30 text-muted-foreground')}>{value}</span></div> }
function Empty({ text }: { text: string }) { return <div className="flex gap-2 py-5 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-success" />{text}</div> }
