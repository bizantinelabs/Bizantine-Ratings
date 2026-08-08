import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Methodology',
  description:
    'How Bizantine derives structured, evidence-backed risk ratings: object classes, scoring tracks, gates, caps, and the rating scale.',
}

const bands = [
  { band: 'A', label: 'Strong', range: '80–100', tone: 'text-success', desc: 'Robust across all applicable tracks; suitable for institutional exposure.' },
  { band: 'B', label: 'Adequate', range: '70–79', tone: 'text-primary', desc: 'Sound with identified constraints; exposure warranted with monitoring.' },
  { band: 'C', label: 'Weak', range: '55–69', tone: 'text-warning', desc: 'Material weaknesses; exposure requires active risk controls.' },
  { band: 'D', label: 'Poor', range: '0–54', tone: 'text-destructive', desc: 'Severe deficiencies; exposure discouraged.' },
  { band: 'Not Approved', label: '', range: '—', tone: 'text-muted-foreground', desc: 'A hard gate was triggered; the object cannot be approved regardless of score.' },
]

const tracks = [
  {
    name: 'General',
    desc: 'Governance, disclosure quality, operational maturity, and organizational accountability that apply to every object class.',
  },
  {
    name: 'Asset',
    desc: 'Backing composition, redemption mechanics, peg stability, and reserve attestation for tokenized value.',
  },
  {
    name: 'Protocol / Opportunity',
    desc: 'Smart-contract surface, upgrade authority, audit depth, economic design, and liquidity resilience.',
  },
  {
    name: 'Blockchain',
    desc: 'Consensus security, validator decentralization, client diversity, and settlement finality of the host chain.',
  },
]

const steps = [
  { n: '01', title: 'Scope the object', body: 'Each object is classified (asset, protocol, vault, chain, organization, or opportunity), which selects the applicable scoring tracks and criteria.' },
  { n: '02', title: 'Collect evidence', body: 'Analysts assemble onchain data, documentation, audits, monitoring feeds, and legal artifacts. Every criterion is linked to its supporting evidence.' },
  { n: '03', title: 'Score criteria', body: 'Criteria are scored on a normalized 0–100 scale, weighted within their track, and assigned a confidence level reflecting evidence strength.' },
  { n: '04', title: 'Apply gates & caps', body: 'Hard gates (e.g. unresolved critical findings) can force Not Approved. Caps limit the maximum score when specific risks are present.' },
  { n: '05', title: 'Publish & monitor', body: 'The composite score maps to a rating band and decision. Continuous monitoring can trigger reassessment or place a rating under review.' },
]

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader
        eyebrow="Framework v2.4"
        title="Rating methodology"
        description="Bizantine ratings are produced by a structured, evidence-driven process designed to be transparent, reproducible, and comparable across the onchain risk universe."
      />

      <section className="mt-10">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">The rating scale</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A composite score from 0 to 100 maps to a letter band. A decision layer — Approved, Approved with
          Constraints, or Not Approved — sits alongside the band to capture hard risk gates.
        </p>
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          {bands.map((b, i) => (
            <div
              key={b.band}
              className={cn(
                'grid grid-cols-[3.5rem_1fr] items-start gap-4 p-4 sm:grid-cols-[6rem_5rem_1fr]',
                i !== bands.length - 1 && 'border-b border-border',
              )}
            >
              <div className="flex items-baseline gap-2">
                <span className={cn('font-mono text-2xl font-semibold', b.tone)}>{b.band}</span>
              </div>
              <div className="hidden font-mono text-sm tabular-nums text-muted-foreground sm:block">{b.range}</div>
              <div>
                {b.label && <p className={cn('text-sm font-medium', b.tone)}>{b.label}</p>}
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Scoring tracks</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The composite score aggregates up to four tracks. Only the tracks applicable to an object&apos;s class
          contribute — a stablecoin is scored across General and Asset, while a lending protocol adds Protocol.
        </p>
        <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {tracks.map((t) => (
            <div key={t.name} className="bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">How a rating is produced</h2>
        <ol className="mt-6 space-y-5">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-5">
              <span className="font-mono text-sm text-primary">{s.n}</span>
              <div className="flex-1 border-b border-border pb-5">
                <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground">Gates and caps</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Gates and caps encode non-negotiable risk boundaries. A <span className="text-foreground">gate</span> can
          force a Not Approved decision irrespective of the composite score — for example, an unresolved critical
          finding or an unverifiable reserve claim. A <span className="text-foreground">cap</span> sets a ceiling on
          the achievable score while a specific risk persists, such as an upgradeable proxy without a timelock. Both
          are disclosed on every rating so allocators can see exactly what is constraining an opinion.
        </p>
      </section>
    </div>
  )
}
