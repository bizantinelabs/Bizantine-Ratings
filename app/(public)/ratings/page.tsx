import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { RatingsRegistry } from '@/components/ratings/ratings-registry'
import { getRatingsWithObjects } from '@/lib/api/client'

export const metadata: Metadata = {
  title: 'Ratings Registry',
  description:
    'Browse the full registry of published Bizantine risk ratings across assets, protocols, vaults, chains, and organizations.',
}

export default async function RatingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const rows = getRatingsWithObjects()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        eyebrow="Public registry"
        title="Ratings registry"
        description="Every published rating, updated as monitoring signals and reassessments are finalized. Ratings reflect Bizantine's independent opinion and are not investment advice."
      />
      <div className="mt-8">
        <RatingsRegistry rows={rows} initialQuery={q ?? ''} />
      </div>
    </div>
  )
}
