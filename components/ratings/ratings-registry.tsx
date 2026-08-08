'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { RiskObjectTable, type RatingRow } from '@/components/ratings/risk-object-table'
import { SelectFilter } from '@/components/select-filter'
import { EmptyState } from '@/components/empty-state'
import { Input } from '@/components/ui/input'
import type { ObjectClass, RatingBand } from '@/types'

const CLASS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All classes' },
  { value: 'Asset', label: 'Asset' },
  { value: 'Protocol', label: 'Protocol' },
  { value: 'Pool/Vault/Market', label: 'Pool / Vault / Market' },
  { value: 'Chain', label: 'Chain' },
  { value: 'Organization', label: 'Organization' },
  { value: 'Opportunity', label: 'Opportunity' },
]

const BAND_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All ratings' },
  { value: 'A', label: 'A — Strong' },
  { value: 'B', label: 'B — Adequate' },
  { value: 'C', label: 'C — Weak' },
  { value: 'D', label: 'D — Poor' },
  { value: 'Not Approved', label: 'Not Approved' },
]

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'score-desc', label: 'Score: high to low' },
  { value: 'score-asc', label: 'Score: low to high' },
  { value: 'recent', label: 'Recently reviewed' },
  { value: 'name', label: 'Name (A–Z)' },
]

export function RatingsRegistry({
  rows,
  initialQuery = '',
}: {
  rows: RatingRow[]
  initialQuery?: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [objectClass, setObjectClass] = useState<string>('all')
  const [band, setBand] = useState<string>('all')
  const [sort, setSort] = useState<string>('score-desc')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let result = rows.filter(({ object, rating }) => {
      if (objectClass !== 'all' && object.objectClass !== (objectClass as ObjectClass)) return false
      if (band !== 'all' && rating.ratingBand !== (band as RatingBand)) return false
      if (q) {
        const haystack = [
          object.canonicalName,
          object.publicCategory,
          object.objectClass,
          object.chains.join(' '),
          object.contractAddress ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'score-asc':
          return a.rating.publicScore - b.rating.publicScore
        case 'recent':
          return new Date(b.rating.publishedAt).getTime() - new Date(a.rating.publishedAt).getTime()
        case 'name':
          return a.object.canonicalName.localeCompare(b.object.canonicalName)
        default:
          return b.rating.publicScore - a.rating.publicScore
      }
    })
    return result
  }, [rows, query, objectClass, band, sort])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, chain, or address"
            className="h-11 pl-9"
            aria-label="Search ratings"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <SelectFilter value={objectClass} onChange={setObjectClass} options={CLASS_OPTIONS} placeholder="Class" ariaLabel="Filter by object class" className="w-full sm:w-44" />
          <SelectFilter value={band} onChange={setBand} options={BAND_OPTIONS} placeholder="Rating" ariaLabel="Filter by rating band" className="w-full sm:w-40" />
          <SelectFilter value={sort} onChange={setSort} options={SORT_OPTIONS} placeholder="Sort" ariaLabel="Sort ratings" className="w-full sm:w-48" />
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono tabular-nums text-foreground">{filtered.length}</span> of{' '}
          <span className="font-mono tabular-nums">{rows.length}</span> rated objects
        </p>
      </div>

      {filtered.length > 0 ? (
        <RiskObjectTable rows={filtered} />
      ) : (
        <EmptyState
          title="No matching ratings"
          description="Try adjusting your search terms or clearing the active filters."
        />
      )}
    </div>
  )
}
