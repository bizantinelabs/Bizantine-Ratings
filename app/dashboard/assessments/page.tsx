import type { Metadata } from 'next'
import { getAssessments } from '@/lib/api/client'
import { AssessmentsTable } from '@/components/dashboard/assessments-table'

export const metadata: Metadata = {
  title: 'Assessments · Bizantine Ratings',
}

export default async function AssessmentsPage() {
  const assessments = await getAssessments()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-foreground">Assessment pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {assessments.length} assessments across all analysts and object classes.
        </p>
      </div>
      <AssessmentsTable assessments={assessments} />
    </div>
  )
}
