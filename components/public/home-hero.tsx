import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { RatingSearch } from '@/components/public/rating-search'
import { cn } from '@/lib/utils'

export function HomeHero({
  objectsRated,
  chainsCovered,
  methodologyVersion,
}: {
  objectsRated: number
  chainsCovered: number
  methodologyVersion: string
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--color-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--color-foreground) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success" />
          Methodology {methodologyVersion} · Independent onchain risk ratings
        </div>
        <h1 className="mt-6 max-w-3xl text-balance font-serif text-4xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
          Institutional-grade risk ratings for onchain assets and protocols
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Bizantine assigns transparent, evidence-backed ratings across assets, protocols, vaults, and
          chains — so allocators can size exposure with confidence.
        </p>

        <div className="mt-8 max-w-xl">
          <RatingSearch />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/ratings" className={cn(buttonVariants({ size: 'lg' }))}>
            Explore the registry
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/methodology"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
          >
            Read the methodology
          </Link>
        </div>

        <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-8 border-t border-border pt-8">
          <div>
            <dt className="text-sm text-muted-foreground">Objects rated</dt>
            <dd className="mt-1 font-mono text-3xl font-semibold tabular-nums text-foreground">
              {objectsRated}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Chains covered</dt>
            <dd className="mt-1 font-mono text-3xl font-semibold tabular-nums text-foreground">
              {chainsCovered}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Rating scale</dt>
            <dd className="mt-1 font-mono text-3xl font-semibold tabular-nums text-foreground">
              AAA–D
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
