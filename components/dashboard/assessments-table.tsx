'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Plus } from 'lucide-react'
import type { Assessment, AssessmentStatus } from '@/types'
import { AssessmentProgress } from '@/components/assessment-progress'
import { AssessmentStatusBadge } from '@/components/dashboard/assessment-status-badge'
import { EvidenceCoverage } from '@/components/evidence-coverage'
import { SelectFilter } from '@/components/select-filter'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/domain'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'In Review', label: 'In Review' },
  { value: 'Returned', label: 'Returned' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Published', label: 'Published' },
  { value: 'Rejected', label: 'Rejected' },
]

const CLASS_OPTIONS = [
  { value: 'all', label: 'All classes' },
  { value: 'Asset', label: 'Asset' },
  { value: 'Protocol', label: 'Protocol' },
  { value: 'Chain', label: 'Chain' },
  { value: 'Stablecoin', label: 'Stablecoin' },
]

export function AssessmentsTable({ assessments }: { assessments: Assessment[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [objectClass, setObjectClass] = useState('all')

  const filtered = useMemo(() => {
    return assessments.filter((a) => {
      if (status !== 'all' && a.status !== status) return false
      if (objectClass !== 'all' && a.objectClass !== objectClass) return false
      if (query) {
        const q = query.toLowerCase()
        return (
          a.objectName.toLowerCase().includes(q) ||
          a.assessmentId.toLowerCase().includes(q) ||
          a.leadAnalyst.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [assessments, query, status, objectClass])

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by object, ID, or analyst…"
          className="h-9 sm:max-w-xs"
          aria-label="Search assessments"
        />
        <div className="flex gap-2">
          <SelectFilter
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            placeholder="Status"
            ariaLabel="Filter by status"
            className="w-full sm:w-40"
          />
          <SelectFilter
            value={objectClass}
            onChange={setObjectClass}
            options={CLASS_OPTIONS}
            placeholder="Class"
            ariaLabel="Filter by class"
            className="w-full sm:w-36"
          />
        </div>
        <Button size="sm" className="sm:ml-auto">
          <Plus className="size-4" />
          New assessment
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No assessments match"
          description="Adjust your filters or search to find assessments in the pipeline."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Object</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Status</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Analyst</th>
                <th className="px-4 py-2.5 font-medium">Completion</th>
                <th className="hidden px-4 py-2.5 font-medium xl:table-cell">Evidence</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Deadline</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="group border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/assessments/${a.assessmentId}`} className="block">
                      <span className="font-medium text-foreground">{a.objectName}</span>
                      <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                        {a.assessmentId} · {a.objectClass}
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <AssessmentStatusBadge status={a.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {a.leadAnalyst}
                  </td>
                  <td className="px-4 py-3">
                    <AssessmentProgress completion={a.completion} className="min-w-28 max-w-40" />
                  </td>
                  <td className="hidden px-4 py-3 xl:table-cell">
                    <EvidenceCoverage value={a.evidenceCoverage} />
                  </td>
                  <td
                    className={cn(
                      'hidden px-4 py-3 font-mono text-xs sm:table-cell',
                      a.deadline ? 'text-muted-foreground' : 'text-muted-foreground/40',
                    )}
                  >
                    {a.deadline ? formatDate(a.deadline) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/assessments/${a.assessmentId}`}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Open
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
