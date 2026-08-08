import Link from 'next/link'
import {
  Boxes,
  FileSearch,
  Gauge,
  Layers,
  Radar,
  ShieldCheck,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const pipeline = [
  {
    icon: FileSearch,
    title: 'Evidence collection',
    body: 'Onchain data, audits, documentation, and legal disclosures are gathered and licensed into a single dossier.',
  },
  {
    icon: Gauge,
    title: 'Multi-track scoring',
    body: 'Criteria are scored across General, Asset, Protocol, and Blockchain tracks with confidence and coverage weighting.',
  },
  {
    icon: ShieldCheck,
    title: 'Committee review',
    body: 'Gates and caps are applied, analysts justify overrides, and a rating committee approves before publication.',
  },
  {
    icon: Radar,
    title: 'Continuous monitoring',
    body: 'Published ratings are watched for upgrades, admin changes, and incidents — triggering review when thresholds break.',
  },
]

const classes = [
  { icon: Boxes, label: 'Assets', desc: 'Tokens, stablecoins, LSTs' },
  { icon: Layers, label: 'Protocols', desc: 'Lending, DEX, derivatives' },
  { icon: Boxes, label: 'Pools / Vaults', desc: 'Markets & yield strategies' },
  { icon: Layers, label: 'Chains', desc: 'L1s, L2s, rollups' },
]

export function HomeHowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">The process</p>
        <h2 className="mt-3 text-balance font-serif text-3xl tracking-tight text-foreground md:text-4xl">
          How a rating is built
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          Every Bizantine rating follows the same auditable pipeline, from raw evidence to a published
          decision under continuous surveillance.
        </p>
      </div>
      <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
        {pipeline.map((step, i) => (
          <div key={step.title} className="flex flex-col bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="size-4.5" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="mt-4 font-medium text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeObjectClasses() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Coverage</p>
            <h2 className="mt-3 text-balance font-serif text-3xl tracking-tight text-foreground md:text-4xl">
              One framework, every object class
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Assets, protocols, pools, and chains are rated on a common scale, so a vault and the
              chain beneath it can be compared on the same terms.
            </p>
          </div>
          <Link href="/ratings" className={cn(buttonVariants({ variant: 'outline' }))}>
            Browse all ratings
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {classes.map((c) => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                <c.icon className="size-4.5" />
              </span>
              <h3 className="mt-4 font-medium text-foreground">{c.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 md:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 20%, var(--color-primary) 0, transparent 45%)',
          }}
        />
        <div className="relative max-w-2xl">
          <h2 className="text-balance font-serif text-3xl tracking-tight text-foreground md:text-4xl">
            Bring Bizantine ratings into your risk workflow
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Access the full registry, methodology, and real-time monitoring through the analyst
            workspace, or license the data via the ratings API.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className={cn(buttonVariants({ size: 'lg' }))}>
              Open the workspace
            </Link>
            <Link
              href="/dashboard/api-clients"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              View API access
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
