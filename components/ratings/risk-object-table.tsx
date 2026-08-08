import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { RatingBadge } from '@/components/rating-badge'
import { MonitoringStatusBadge } from '@/components/monitoring-status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { decisionClass, formatDate, scoreTone, scoreToneClass } from '@/lib/domain'
import type { RatingResult, RiskObject } from '@/types'

export interface RatingRow {
  object: RiskObject
  rating: RatingResult
}

export function RiskObjectTable({
  rows,
  density = 'comfortable',
  className,
}: {
  rows: RatingRow[]
  density?: 'comfortable' | 'compact'
  className?: string
}) {
  const cell = density === 'compact' ? 'py-1.5' : 'py-3'
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border bg-card', className)}>
      <Table className="min-w-[880px]">
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="pl-4">Object</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Chain</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Decision</TableHead>
            <TableHead className="text-right">Confidence</TableHead>
            <TableHead>Monitoring</TableHead>
            <TableHead className="pr-4 text-right">Last Reviewed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ object, rating }) => (
            <TableRow key={object.id} className="group border-border">
              <TableCell className={cn('pl-4', cell)}>
                <Link
                  href={`/ratings/${object.objectId}`}
                  className="inline-flex items-center gap-1.5 font-medium text-foreground outline-none hover:text-primary focus-visible:text-primary"
                >
                  {object.canonicalName}
                  <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <div className="mt-0.5 text-xs text-muted-foreground">{object.publicCategory}</div>
              </TableCell>
              <TableCell className={cn('text-sm text-muted-foreground', cell)}>{object.objectClass}</TableCell>
              <TableCell className={cn('text-sm text-muted-foreground', cell)}>{object.chains.join(', ')}</TableCell>
              <TableCell className={cn('text-right', cell)}>
                <span className={cn('font-mono text-sm font-semibold tabular-nums', scoreToneClass[scoreTone(rating.publicScore)])}>
                  {rating.publicScore}
                </span>
              </TableCell>
              <TableCell className={cell}>
                <RatingBadge rating={rating.publicRating} band={rating.ratingBand} />
              </TableCell>
              <TableCell className={cn('text-sm', cell, decisionClass(rating.decision))}>{rating.decision}</TableCell>
              <TableCell className={cn('text-right font-mono text-sm tabular-nums text-muted-foreground', cell)}>
                {rating.confidence}%
              </TableCell>
              <TableCell className={cell}>
                <MonitoringStatusBadge status={object.monitoringStatus} />
              </TableCell>
              <TableCell className={cn('pr-4 text-right text-sm text-muted-foreground tabular-nums', cell)}>
                {formatDate(rating.publishedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
