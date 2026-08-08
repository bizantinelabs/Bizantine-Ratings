import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2, FlaskConical, Send, Save } from 'lucide-react'
import { getAssessmentById, getScoringCriteria } from '@/lib/api/client'
import { AssessmentStatusBadge } from '@/components/dashboard/assessment-status-badge'
import { ScoringWorkspace } from '@/components/dashboard/scoring-workspace'
import { AssessmentProgress } from '@/components/assessment-progress'
import { EvidenceCoverage } from '@/components/evidence-coverage'
import { RatingBadge } from '@/components/rating-badge'
import { Button } from '@/components/ui/button'
import { scoreToBand, formatDate } from '@/lib/domain'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ assessmentId: string }>
}): Promise<Metadata> {
  const { assessmentId } = await params
  const assessment = await getAssessmentById(assessmentId)
  return {
    title: assessment
      ? `${assessment.objectName} · Assessment · Bizantine Ratings`
      : 'Assessment · Bizantine Ratings',
  }
}

export default async function AssessmentWorkspacePage({
  params,
}: {
  params: Promise<{ assessmentId: string }>
}) {
  const { assessmentId } = await params
  const [assessment, criteria] = await Promise.all([
    getAssessmentById(assessmentId),
    getScoringCriteria(),
  ])

  if (!assessment) notFound()

  // Weighted aggregate of applicable criteria — the proposed rating.
  const applicable = criteria.filter((c) => c.applicable)
  const totalWeight = applicable.reduce((s, c) => s + c.weight, 0)
  const proposedScore = Math.round(
    applicable.reduce((s, c) => s + c.normalizedScore * c.weight, 0) / totalWeight,
  )
  const proposed = scoreToBand(proposedScore)
  const overrides = criteria.filter((c) => c.manualOverride).length
  const flags = criteria.reduce((s, c) => s + c.qualityFlags.length, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/assessments"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Assessments
      </Link>

      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl text-foreground">{assessment.objectName}</h1>
            <AssessmentStatusBadge status={assessment.status} />
          </div>
          <p className="mt-1.5 font-mono text-xs text-muted-foreground">
            {assessment.assessmentId} · {assessment.objectClass} · {assessment.methodologyVersion} ·
            Lead {assessment.leadAnalyst}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button size="sm" nativeButton={false} render={<Link href={`/dashboard/assessments/${assessmentId}/dd/start`} />}>
            <FlaskConical className="size-4" />
            Start automated DD
          </Button>
          <Button variant="outline" size="sm">
            <Save className="size-4" />
            Save draft
          </Button>
          <Button variant="outline" size="sm">
            <CheckCircle2 className="size-4" />
            Run validation
          </Button>
          <Button size="sm">
            <Send className="size-4" />
            Submit for review
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="order-2 lg:order-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Scoring criteria</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {applicable.length} applicable · {overrides} override{overrides === 1 ? '' : 's'}
            </span>
          </div>
          <ScoringWorkspace criteria={criteria} />
        </div>

        <aside className="order-1 space-y-4 lg:order-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Proposed rating
            </p>
            <div className="mt-3 flex items-center gap-3">
              <RatingBadge rating={proposed.label} band={proposed.band} className="text-base" />
              <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                {proposedScore}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Weighted aggregate of applicable criteria under {assessment.methodologyVersion}.
            </p>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-card p-5">
            <SummaryRow label="Completion">
              <AssessmentProgress completion={assessment.completion} showLabel />
            </SummaryRow>
            <SummaryRow label="Evidence coverage">
              <EvidenceCoverage value={assessment.evidenceCoverage} />
            </SummaryRow>
            <SummaryRow label="Confidence">
              <span className="font-mono text-sm tabular-nums text-foreground">
                {assessment.confidence}%
              </span>
            </SummaryRow>
            <SummaryRow label="Open quality flags">
              <span
                className={
                  flags > 0
                    ? 'font-mono text-sm tabular-nums text-warning'
                    : 'font-mono text-sm tabular-nums text-success'
                }
              >
                {flags}
              </span>
            </SummaryRow>
            {assessment.deadline && (
              <SummaryRow label="Deadline">
                <span className="font-mono text-sm text-foreground">
                  {formatDate(assessment.deadline)}
                </span>
              </SummaryRow>
            )}
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground">
            Ratings are advisory opinions on relative risk, not investment advice. All criteria must
            clear validation before submission to the review committee.
          </div>
        </aside>
      </div>
    </div>
  )
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-center justify-end">{children}</div>
    </div>
  )
}
