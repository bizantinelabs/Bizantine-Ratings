import type { Metadata } from 'next'
import { getAssessments } from '@/lib/api/client'
import { ReviewQueue } from '@/components/dashboard/review-queue'

export const metadata: Metadata = {
  title: 'Review queue · Bizantine Ratings',
}

export default async function ReviewQueuePage() {
  const assessments = await getAssessments()
  const pending = assessments.filter(
    (a) => a.status === 'In Review' || a.status === 'Returned',
  ).length

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-foreground">Committee review queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pending} assessment{pending === 1 ? '' : 's'} awaiting a committee decision. Approvals
          publish the rating; returns send it back to the lead analyst with notes.
        </p>
      </div>
      <ReviewQueue assessments={assessments} />
    </div>
  )
}
