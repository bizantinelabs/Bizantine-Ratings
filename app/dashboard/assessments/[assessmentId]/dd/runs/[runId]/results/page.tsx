import type { Metadata } from 'next'
import { DDResultsReview } from '@/components/dd/dd-results-review'

export const metadata: Metadata = { title: 'DD Results Review' }

export default async function DDResultsPage({ params }: { params: Promise<{ assessmentId: string; runId: string }> }) {
  const { assessmentId, runId } = await params
  return <DDResultsReview assessmentId={assessmentId} runId={runId} />
}
