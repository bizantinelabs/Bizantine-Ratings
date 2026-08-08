'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { FindingSeverityBadge } from '@/components/finding-severity-badge'
import { EmptyState } from '@/components/empty-state'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/domain'
import type { EventSeverity, MonitoringEvent } from '@/types'

const SEVERITIES: (EventSeverity | 'All')[] = ['All', 'Critical', 'High', 'Medium', 'Low', 'Info']

const rail: Record<EventSeverity, string> = {
  Critical: 'bg-destructive',
  High: 'bg-destructive/70',
  Medium: 'bg-warning',
  Low: 'bg-primary',
  Info: 'bg-muted-foreground/50',
}

export function MonitoringFeed({ events }: { events: MonitoringEvent[] }) {
  const [filter, setFilter] = useState<EventSeverity | 'All'>('All')

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: events.length }
    for (const s of SEVERITIES) if (s !== 'All') c[s] = events.filter((e) => e.severity === s).length
    return c
  }, [events])

  const filtered = useMemo(
    () =>
      [...events]
        .filter((e) => filter === 'All' || e.severity === filter)
        .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()),
    [events, filter],
  )

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by severity">
        {SEVERITIES.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={filter === s}
            onClick={() => setFilter(s)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors',
              filter === s
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {s}
            <span className="font-mono text-xs tabular-nums opacity-70">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {filtered.map((e) => (
            <li
              key={e.id}
              className="relative overflow-hidden rounded-lg border border-border bg-card p-4 pl-5"
            >
              <span className={cn('absolute inset-y-0 left-0 w-1', rail[e.severity])} aria-hidden />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <FindingSeverityBadge severity={e.severity} />
                    <span className="text-sm font-medium text-foreground">{e.type}</span>
                    <span className="text-xs text-muted-foreground">· {e.chain}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
                  <Link
                    href={`/ratings/${e.objectId}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {e.objectName}
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>
                <time className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {formatDateTime(e.detectedAt)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState className="mt-6" title="No events at this severity" description="Adjust the filter to view other monitoring signals." />
      )}
    </div>
  )
}
