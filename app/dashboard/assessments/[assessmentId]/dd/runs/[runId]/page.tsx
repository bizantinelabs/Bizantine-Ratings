import Link from 'next/link'
import { ArrowLeft, Radio } from 'lucide-react'
import { DDRunProgress } from '@/components/dd/dd-run-progress'

export default async function DDRunPage({ params }: { params: Promise<{ assessmentId: string; runId: string }> }) {
  const { assessmentId, runId } = await params
  return (
    <div className="mx-auto max-w-6xl">
      <Link href={`/dashboard/assessments/${assessmentId}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Assessment</Link>
      <header className="mt-5 border-b border-border pb-6">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary"><Radio className="size-4" />Live orchestration</div>
        <h1 className="mt-3 text-balance font-serif text-3xl text-foreground sm:text-4xl">Due-diligence run</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Realtime stage events and validated engine state. You can leave this page while the job continues.</p>
      </header>
      <div className="mt-6"><DDRunProgress runId={runId} assessmentId={assessmentId} /></div>
    </div>
  )
}
