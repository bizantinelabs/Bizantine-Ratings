import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { CompareTool } from '@/components/ratings/compare-tool'
import { getRatingsWithObjects } from '@/lib/api/client'

export const metadata: Metadata = {
  title: 'Compare Ratings',
  description: 'Compare Bizantine risk ratings side by side across scores, tracks, gates, caps, and monitoring status.',
}

export default function ComparePage() {
  const rows = getRatingsWithObjects()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        eyebrow="Analysis tool"
        title="Compare ratings"
        description="Place rated objects side by side to compare composite scores, track-level detail, and active risk constraints. Add or remove objects to build your own view."
      />
      <div className="mt-8">
        <CompareTool rows={rows} />
      </div>
    </div>
  )
}
