import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FlaskConical, ShieldAlert } from 'lucide-react'
import { StartDDForm } from '@/components/dd/start-dd-form'
import { createClient } from '@/lib/supabase/server'
import { getMethodologyStatus } from '@/lib/methodology/queries'

export default async function StartDDPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = await params
  const supabase = await createClient()
  const { data: assessment } = await supabase.from('assessments').select('*').eq('id', assessmentId).single()
  if (!assessment) notFound()
  const { data: ratedObject } = await supabase.from('rated_objects').select('*').eq('id', assessment.rated_object_id).single()
  if (!ratedObject) notFound()
  const methodology = await getMethodologyStatus(assessment.methodology_version)
  const isPilot = methodology?.status === 'pilot'

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/dashboard/assessments/${assessmentId}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Assessment</Link>
      <header className="mt-5 border-b border-border pb-6">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary"><FlaskConical className="size-4" />Automated due diligence</div>
        <h1 className="mt-3 text-balance font-serif text-3xl text-foreground sm:text-4xl">Start DD run</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Configure the evidence envelope and queue an asynchronous run. The Python service remains the sole methodology executor.</p>
      </header>
      {isPilot && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/8 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
          <div className="text-sm">
            <p className="font-medium text-foreground">
              Pilot methodology — {assessment.methodology_version}
            </p>
            <p className="mt-1 leading-6 text-muted-foreground">
              This run executes under a methodology that is in controlled pilot. The resulting rating
              will be labeled pilot internally and must not be exposed as an unrestricted production
              rating unless explicitly approved by an authorized publisher.
            </p>
          </div>
        </div>
      )}
      <div className="mt-6"><StartDDForm assessment={assessment} ratedObject={ratedObject} isPilot={isPilot} /></div>
    </div>
  )
}
