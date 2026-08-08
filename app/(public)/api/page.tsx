import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Ratings API',
  description: 'Programmatic access to Bizantine risk ratings, scores, evidence coverage, and monitoring signals.',
}

const plans = [
  {
    name: 'Developer',
    price: 'Free',
    desc: 'Prototype against published ratings.',
    features: ['Public ratings & bands', '1,000 requests / month', 'Rating history endpoints', 'Community support'],
    cta: 'Get a key',
    featured: false,
  },
  {
    name: 'Professional',
    price: '$1,200/mo',
    desc: 'Production access with monitoring webhooks.',
    features: ['Everything in Developer', 'Track-level scores', 'Monitoring event webhooks', '100,000 requests / month', 'Priority support'],
    cta: 'Start trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Redistribution rights and dedicated coverage.',
    features: ['Everything in Professional', 'Redistribution license', 'Custom coverage requests', 'Unlimited requests', 'Dedicated analyst liaison'],
    cta: 'Contact sales',
    featured: false,
  },
]

const sample = `curl https://api.bizantine.io/v1/ratings/fxrp-vault \\
  -H "Authorization: Bearer $BIZANTINE_API_KEY"

{
  "object_id": "fxrp-vault",
  "public_score": 76,
  "public_rating": "B-Approved",
  "rating_band": "B",
  "decision": "Approved with Constraints",
  "confidence": 87,
  "evidence_coverage": 91,
  "outlook": "Stable",
  "methodology_version": "v2.4"
}`

export default function ApiPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        eyebrow="Commercial API"
        title="Ratings API"
        description="Integrate Bizantine risk intelligence directly into allocation systems, risk engines, and dashboards. Structured, versioned, and monitoring-aware."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl tracking-tight text-foreground">Query a rating in one call</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Every rating is exposed as a stable, versioned resource. Fetch composite scores, track breakdowns,
            evidence coverage, and decision state — or subscribe to monitoring events as they happen.
          </p>
          <Link href="/dashboard/api-clients" className={cn(buttonVariants({ size: 'lg' }), 'mt-6')}>
            Manage API access
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-border bg-card p-5 font-mono text-xs leading-relaxed text-muted-foreground">
          {sample}
        </pre>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={cn(
              'flex flex-col rounded-lg border bg-card p-6',
              p.featured ? 'border-primary/50' : 'border-border',
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
              {p.featured && (
                <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                  Popular
                </span>
              )}
            </div>
            <p className="mt-4 font-mono text-2xl font-semibold text-foreground">{p.price}</p>
            <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/api-clients"
              className={cn(
                buttonVariants({ variant: p.featured ? 'default' : 'outline', size: 'sm' }),
                'mt-6 w-full',
              )}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
