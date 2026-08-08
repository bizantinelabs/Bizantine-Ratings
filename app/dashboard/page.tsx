import Link from 'next/link'
import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  Clock,
  FileWarning,
  Inbox,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { AssessmentStatusBadge } from '@/components/dashboard/assessment-status-badge'
import { FindingSeverityBadge } from '@/components/finding-severity-badge'
import { AssessmentProgress } from '@/components/assessment-progress'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate, formatDateTime } from '@/lib/domain'
import { assessments, dashboardMetrics, monitoringEvents } from '@/lib/mock-data'

function Panel({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string
  href?: string
  linkLabel?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            {linkLabel}
            <ArrowUpRight className="size-3" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export default function DashboardOverviewPage() {
  const reviewQueue = assessments.filter((a) => a.status === 'In Review' || a.status === 'Returned')
  const activeWork = assessments
    .filter((a) => a.status === 'Draft' || a.status === 'In Review')
    .sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))
    .slice(0, 5)
  const alerts = monitoringEvents
    .filter((e) => e.severity === 'Critical' || e.severity === 'High')
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Welcome back, R. Okonkwo. Here&apos;s the state of the assessment pipeline.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Draft assessments" value={dashboardMetrics.draftAssessments} icon={ClipboardList} sublabel="Across all analysts" />
        <StatCard label="In review" value={dashboardMetrics.inReview} icon={Inbox} sublabel="Awaiting committee" />
        <StatCard label="Ratings under review" value={dashboardMetrics.underReviewRatings} icon={AlertTriangle} sublabel="Triggered by monitoring" />
        <StatCard label="Open high-sev findings" value={dashboardMetrics.openHighSeverityFindings} icon={FileWarning} sublabel="Require resolution" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="My active assessments" href="/dashboard/assessments" linkLabel="All assessments">
            <ul className="divide-y divide-border">
              {activeWork.map((a) => (
                <li key={a.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/assessments/${a.assessmentId}`}
                        className="truncate text-sm font-medium text-foreground hover:text-primary"
                      >
                        {a.objectName}
                      </Link>
                      <AssessmentStatusBadge status={a.status} />
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{a.assessmentId} · {a.objectClass}</p>
                  </div>
                  <div className="flex items-center gap-6 sm:w-64">
                    <AssessmentProgress completion={a.completion} className="flex-1" />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      {a.deadline ? formatDate(a.deadline) : '—'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Review queue" href="/dashboard/review-queue" linkLabel="Open queue">
            <ul className="divide-y divide-border">
              {reviewQueue.map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <Link
                    href={`/dashboard/assessments/${a.assessmentId}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {a.objectName}
                  </Link>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{a.leadAnalyst}</span>
                    <AssessmentStatusBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title="Elevated monitoring signals" href="/monitoring" linkLabel="Full feed">
        <ul className="divide-y divide-border">
          {alerts.map((e) => (
            <li key={e.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <FindingSeverityBadge severity={e.severity} />
                <div>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{e.objectName}</span> — {e.type}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{e.description}</p>
                </div>
              </div>
              <time className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                {formatDateTime(e.detectedAt)}
              </time>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/assessments" className={cn(buttonVariants({ size: 'lg' }))}>
          <ClipboardList className="size-4" />
          New assessment
        </Link>
        <Link href="/dashboard/evidence" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
          Evidence library
        </Link>
      </div>
    </div>
  )
}
