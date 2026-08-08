'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, X } from 'lucide-react'
import { RatingBadge } from '@/components/rating-badge'
import { MonitoringStatusBadge } from '@/components/monitoring-status-badge'
import { SelectFilter } from '@/components/select-filter'
import { cn } from '@/lib/utils'
import { decisionClass, formatDate, scoreTone, scoreToneClass } from '@/lib/domain'
import type { RatingResult, RiskObject, TrackScores } from '@/types'

interface Row {
  object: RiskObject
  rating: RatingResult
}

const trackRows: { key: keyof TrackScores; label: string }[] = [
  { key: 'general', label: 'General track' },
  { key: 'asset', label: 'Asset track' },
  { key: 'protocolOpportunity', label: 'Protocol / Opportunity track' },
  { key: 'blockchain', label: 'Blockchain track' },
]

export function CompareTool({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<string[]>(() => rows.slice(0, 3).map((r) => r.object.objectId))
  const [adding, setAdding] = useState(false)

  const chosen = selected
    .map((id) => rows.find((r) => r.object.objectId === id))
    .filter((r): r is Row => Boolean(r))

  const available = rows.filter((r) => !selected.includes(r.object.objectId))

  function remove(id: string) {
    setSelected((s) => s.filter((x) => x !== id))
  }
  function add(id: string) {
    if (id && !selected.includes(id)) setSelected((s) => [...s, id])
    setAdding(false)
  }

  const metrics: { label: string; render: (r: Row) => React.ReactNode }[] = [
    {
      label: 'Public score',
      render: (r) => (
        <span className={cn('font-mono text-xl font-semibold tabular-nums', scoreToneClass[scoreTone(r.rating.publicScore)])}>
          {r.rating.publicScore}
        </span>
      ),
    },
    { label: 'Rating', render: (r) => <RatingBadge rating={r.rating.publicRating} band={r.rating.ratingBand} /> },
    { label: 'Decision', render: (r) => <span className={cn('text-sm', decisionClass(r.rating.decision))}>{r.rating.decision}</span> },
    { label: 'Outlook', render: (r) => <span className="text-sm text-foreground">{r.rating.outlook}</span> },
    { label: 'Confidence', render: (r) => <span className="font-mono text-sm tabular-nums">{r.rating.confidence}%</span> },
    { label: 'Evidence coverage', render: (r) => <span className="font-mono text-sm tabular-nums">{r.rating.evidenceCoverage}%</span> },
    { label: 'Object class', render: (r) => <span className="text-sm text-muted-foreground">{r.object.objectClass}</span> },
    { label: 'Chains', render: (r) => <span className="text-sm text-muted-foreground">{r.object.chains.join(', ')}</span> },
    { label: 'Monitoring', render: (r) => <MonitoringStatusBadge status={r.object.monitoringStatus} /> },
    ...trackRows.map((t) => ({
      label: t.label,
      render: (r: Row) => <span className="font-mono text-sm tabular-nums text-foreground">{r.rating.trackScores[t.key]}</span>,
    })),
    { label: 'Active gates', render: (r) => <span className="text-sm text-muted-foreground">{r.rating.activeGates.length || '—'}</span> },
    { label: 'Active caps', render: (r) => <span className="text-sm text-muted-foreground">{r.rating.activeCaps.length || '—'}</span> },
    { label: 'Published', render: (r) => <span className="text-sm tabular-nums text-muted-foreground">{formatDate(r.rating.publishedAt)}</span> },
  ]

  const gridCols = { gridTemplateColumns: `minmax(9rem,1fr) repeat(${Math.max(chosen.length, 1)}, minmax(9rem,1fr)) auto` }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <div className="min-w-[640px]">
        {/* Header row */}
        <div className="grid items-stretch border-b border-border" style={gridCols}>
          <div className="p-4 text-xs uppercase tracking-wide text-muted-foreground">Metric</div>
          {chosen.map((r) => (
            <div key={r.object.objectId} className="relative border-l border-border p-4">
              <button
                onClick={() => remove(r.object.objectId)}
                className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${r.object.canonicalName}`}
              >
                <X className="size-3.5" />
              </button>
              <Link href={`/ratings/${r.object.objectId}`} className="text-sm font-medium text-foreground hover:text-primary">
                {r.object.canonicalName}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">{r.object.publicCategory}</p>
            </div>
          ))}
          <div className="flex items-center border-l border-border p-4">
            {adding ? (
              <SelectFilter
                value=""
                onChange={add}
                placeholder="Select object"
                ariaLabel="Add object to comparison"
                options={available.map((r) => ({ value: r.object.objectId, label: r.object.canonicalName }))}
                className="w-40"
              />
            ) : (
              <button
                onClick={() => setAdding(true)}
                disabled={available.length === 0}
                className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
              >
                <Plus className="size-4" />
                Add object
              </button>
            )}
          </div>
        </div>

        {/* Metric rows */}
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={cn('grid items-center', i !== metrics.length - 1 && 'border-b border-border')}
            style={gridCols}
          >
            <div className="p-4 text-sm text-muted-foreground">{m.label}</div>
            {chosen.map((r) => (
              <div key={r.object.objectId} className="border-l border-border p-4">
                {m.render(r)}
              </div>
            ))}
            <div className="border-l border-border p-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
