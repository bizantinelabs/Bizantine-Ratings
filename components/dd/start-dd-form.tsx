'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, DatabaseZap, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AssessmentRecord, RatedObjectRecord } from '@/types/dd'

const adapterOptions = [
  { value: 'onchain_rpc', label: 'Onchain RPC', note: 'Contracts, controls, ownership' },
  { value: 'market_data', label: 'Market data', note: 'Liquidity and volatility' },
  { value: 'document_parser', label: 'Document parser', note: 'Audits and legal evidence' },
]

export function StartDDForm({
  assessment,
  ratedObject,
  isPilot = false,
}: {
  assessment: AssessmentRecord
  ratedObject: RatedObjectRecord
  isPilot?: boolean
}) {
  const router = useRouter()
  const [adapters, setAdapters] = useState(adapterOptions.map((item) => item.value))
  const [addresses, setAddresses] = useState('')
  const [deploymentSize, setDeploymentSize] = useState('1000000')
  const [cutoff, setCutoff] = useState(new Date().toISOString().slice(0, 10))
  const [documents, setDocuments] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleAdapter(value: string) {
    setAdapters((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }

  async function startRun(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const response = await fetch('/api/internal/dd-runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentId: assessment.id,
        ratedObjectId: ratedObject.id,
        objectClass: ratedObject.object_class,
        instrumentProfile: ratedObject.instrument_profile ?? 'standard_deployment',
        chains: ratedObject.chains,
        contractAddresses: addresses.split(',').map((item) => item.trim()).filter(Boolean),
        targetDeploymentSize: Number(deploymentSize),
        methodologyVersion: assessment.methodology_version,
        dataCutoff: new Date(`${cutoff}T23:59:59.000Z`).toISOString(),
        adapters,
        uploadedDocuments: documents.split(',').map((item) => item.trim()).filter(Boolean),
        analystNotes: notes,
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error ?? 'Unable to start the run.')
      setLoading(false)
      return
    }

    router.push(`/dashboard/assessments/${assessment.id}/dd/runs/${payload.data.id}`)
  }

  return (
    <form onSubmit={startRun} className="flex flex-col gap-6">
      <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><ShieldCheck className="size-4" /></div>
          <div><h2 className="font-semibold text-foreground">Run scope</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Confirm the object and deployment context sent to the DD Engine.</p></div>
        </div>
        <dl className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <Info label="Rated object" value={ratedObject.name} />
          <Info label="Assessment" value={assessment.id} mono />
          <Info label="Object class" value={ratedObject.object_class} />
          <Info label="Instrument profile" value={ratedObject.instrument_profile ?? 'Standard'} />
          <Info label="Chains" value={ratedObject.chains.join(', ')} />
          <div>
            <dt className="text-xs text-muted-foreground">Methodology</dt>
            <dd className="mt-1 flex items-center gap-2 font-mono text-sm text-foreground">
              {assessment.methodology_version}
              {isPilot && (
                <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/12 px-2 py-0.5 font-sans text-xs font-medium text-warning">
                  Pilot
                </span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <div className="flex items-start gap-3"><DatabaseZap className="mt-0.5 size-5 text-primary" /><div><h2 className="font-semibold text-foreground">Deployment inputs</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Inputs are validated before the run is queued.</p></div></div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2"><Label htmlFor="addresses">Contract addresses</Label><Input id="addresses" value={addresses} onChange={(event) => setAddresses(event.target.value)} placeholder="0x… , 0x…" /><p className="text-xs text-muted-foreground">Comma-separated; optional for document-led assessments.</p></div>
          <div className="grid gap-2"><Label htmlFor="deployment">Target deployment size (USD)</Label><Input id="deployment" type="number" min="0" step="1000" required value={deploymentSize} onChange={(event) => setDeploymentSize(event.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="cutoff">Data cutoff</Label><div className="relative"><CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="cutoff" type="date" required className="pl-9" value={cutoff} onChange={(event) => setCutoff(event.target.value)} /></div></div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="font-semibold text-foreground">Evidence adapters</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {adapterOptions.map((adapter) => (
            <label key={adapter.value} className="flex cursor-pointer gap-3 rounded-md border border-border p-3 transition-colors has-checked:border-primary/60 has-checked:bg-primary/5">
              <input type="checkbox" checked={adapters.includes(adapter.value)} onChange={() => toggleAdapter(adapter.value)} className="mt-1 accent-primary" />
              <span><span className="block text-sm font-medium text-foreground">{adapter.label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{adapter.note}</span></span>
            </label>
          ))}
        </div>
        <div className="mt-5 grid gap-2"><Label htmlFor="documents">Uploaded document references</Label><div className="relative"><FileText className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="documents" className="pl-9" value={documents} onChange={(event) => setDocuments(event.target.value)} placeholder="audit-2026.pdf, legal-opinion.pdf" /></div></div>
        <div className="mt-5 grid gap-2"><Label htmlFor="notes">Analyst notes</Label><textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" placeholder="Scope decisions, known gaps, or handling instructions…" /></div>
      </section>

      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button><Button type="submit" disabled={loading || adapters.length === 0}>{loading ? 'Queuing run…' : isPilot ? 'Start pilot DD run' : 'Start automated DD'}</Button></div>
    </form>
  )
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className={`mt-1 text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{value}</dd></div>
}
