import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react'
import { RatingBadge } from '@/components/rating-badge'
import { MonitoringStatusBadge } from '@/components/monitoring-status-badge'
import { ScoreGauge } from '@/components/score-gauge'
import { TrackScoreBars } from '@/components/track-score-bars'
import { RatingHistoryChart } from '@/components/rating-history-chart'
import { EvidenceCoverage } from '@/components/evidence-coverage'
import {
  EvidenceBreakdown,
  FindingsList,
  GatesAndCaps,
} from '@/components/ratings/object-detail-sections'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getEvidenceSummary,
  getFindings,
  getLatestRating,
  getRatingHistory,
  getRiskObjectById,
} from '@/lib/api/client'
import { decisionClass, formatDate, formatDateTime, truncateAddress } from '@/lib/domain'

interface Params {
  params: Promise<{ objectId: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { objectId } = await params
  const object = await getRiskObjectById(objectId)
  if (!object) return { title: 'Rating not found' }
  return {
    title: `${object.canonicalName} — Risk Rating`,
    description: `Bizantine risk rating and evidence summary for ${object.canonicalName} (${object.publicCategory}).`,
  }
}

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  )
}

function Panel({
  title,
  aside,
  children,
  className,
}: {
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border border-border bg-card p-5', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export default async function ObjectDetailPage({ params }: Params) {
  const { objectId } = await params
  const [object, rating, history, findings, evidence] = await Promise.all([
    getRiskObjectById(objectId),
    getLatestRating(objectId),
    getRatingHistory(objectId),
    getFindings(objectId),
    getEvidenceSummary(objectId),
  ])

  if (!object || !rating) notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/ratings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Registry
      </Link>

      {/* Header */}
      <div className="mt-5 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-serif text-3xl tracking-tight text-foreground">{object.canonicalName}</h1>
            <RatingBadge rating={rating.publicRating} band={rating.ratingBand} className="text-sm" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {object.objectClass} · {object.publicCategory} · {object.chains.join(', ')}
          </p>
          {object.contractAddress && (
            <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Copy className="size-3" />
              {truncateAddress(object.contractAddress)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className={cn('text-sm font-medium', decisionClass(rating.decision))}>{rating.decision}</p>
            <div className="mt-1 flex justify-end">
              <MonitoringStatusBadge status={object.monitoringStatus} />
            </div>
          </div>
          <ScoreGauge score={rating.publicScore} />
        </div>
      </div>

      {/* Rating metadata strip */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-border py-6 sm:grid-cols-3 lg:grid-cols-5">
        <InfoField label="Outlook">{rating.outlook}</InfoField>
        <InfoField label="Confidence">
          <span className="font-mono tabular-nums">{rating.confidence}%</span>
        </InfoField>
        <InfoField label="Evidence coverage">
          <EvidenceCoverage value={rating.evidenceCoverage} />
        </InfoField>
        <InfoField label="Methodology">{rating.methodologyVersion}</InfoField>
        <InfoField label="Published">{formatDate(rating.publishedAt)}</InfoField>
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel
            title="Rating history"
            aside={<span className="text-xs text-muted-foreground">Public score over time</span>}
          >
            {history.length > 0 ? (
              <RatingHistoryChart data={history} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Historical score series is not yet published for this object.
              </p>
            )}
          </Panel>

          <Panel title="Findings">
            <FindingsList findings={findings} />
          </Panel>

          <Panel title="Gates & scoring caps">
            <GatesAndCaps gates={rating.activeGates} caps={rating.activeCaps} />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Track scores">
            <TrackScoreBars scores={rating.trackScores} />
          </Panel>

          <Panel
            title="Evidence base"
            aside={
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {rating.evidenceCoverage}% coverage
              </span>
            }
          >
            <EvidenceBreakdown summary={evidence} />
          </Panel>

          <Panel title="Data provenance">
            <dl className="space-y-3">
              <InfoField label="Data cutoff">{formatDate(rating.dataCutoffAt)}</InfoField>
              <InfoField label="Rating ID">
                <span className="font-mono text-xs">{rating.ratingId}</span>
              </InfoField>
            </dl>
            <Link
              href="/methodology"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4 w-full')}
            >
              How this rating is derived
              <ExternalLink className="size-3.5" />
            </Link>
          </Panel>
        </div>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        This rating reflects Bizantine&apos;s independent opinion as of {formatDateTime(rating.publishedAt + 'T00:00:00Z')} and is provided
        for informational purposes only. It is not investment advice, an offer, or a solicitation. Ratings may be
        revised or withdrawn at any time based on monitoring signals.
      </p>
    </div>
  )
}
