import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HomeHero } from '@/components/public/home-hero'
import {
  HomeCta,
  HomeHowItWorks,
  HomeObjectClasses,
} from '@/components/public/home-sections'
import { RatingDistributionChart } from '@/components/public/rating-distribution-chart'
import { RiskObjectTable } from '@/components/ratings/risk-object-table'
import { getRatingsWithObjects } from '@/lib/api/client'

const BANDS = ['A', 'B', 'C', 'D', 'Not Approved'] as const

export default function HomePage() {
  const rows = getRatingsWithObjects()
  const chains = new Set(rows.flatMap((r) => r.object.chains))
  const featured = [...rows].sort((a, b) => b.rating.publicScore - a.rating.publicScore).slice(0, 6)
  const distribution = BANDS.map((band) => ({
    band,
    count: rows.filter((r) => r.rating.ratingBand === band).length,
  }))

  return (
    <>
      <HomeHero
        objectsRated={rows.length}
        chainsCovered={chains.size}
        methodologyVersion="v2.4"
      />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-primary">
                  Latest ratings
                </p>
                <h2 className="mt-3 font-serif text-2xl tracking-tight text-foreground md:text-3xl">
                  Recently published
                </h2>
              </div>
              <Link
                href="/ratings"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <RiskObjectTable rows={featured} />
          </div>
          <div className="lg:pt-[4.5rem]">
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Rating distribution
              </p>
              <p className="mt-1 mb-4 text-sm text-foreground">
                Coverage across {rows.length} rated objects
              </p>
              <RatingDistributionChart data={distribution} />
            </div>
          </div>
        </div>
      </section>

      <HomeHowItWorks />
      <HomeObjectClasses />
      <HomeCta />
    </>
  )
}
