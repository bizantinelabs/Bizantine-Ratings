'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowUpRight, Check, RotateCcw, X } from 'lucide-react'
import type { Assessment } from '@/types'
import { AssessmentStatusBadge } from '@/components/dashboard/assessment-status-badge'
import { EvidenceCoverage } from '@/components/evidence-coverage'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/domain'

type Decision = 'approved' | 'returned' | 'rejected'

export function ReviewQueue({ assessments }: { assessments: Assessment[] }) {
  const queue = useMemo(
    () => assessments.filter((a) => a.status === 'In Review' || a.status === 'Returned'),
    [assessments],
  )
  const [decided, setDecided] = useState<Record<string, Decision>>({})

  function decide(a: Assessment, decision: Decision) {
    setDecided((prev) => ({ ...prev, [a.id]: decision }))
    const verb =
      decision === 'approved' ? 'approved' : decision === 'returned' ? 'returned to analyst' : 'rejected'
    toast.success(`${a.objectName} ${verb}`, {
      description: `${a.assessmentId} · decision recorded to the committee log`,
    })
  }

  if (queue.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">The review queue is empty.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {queue.map((a) => {
        const decision = decided[a.id]
        return (
          <div
            key={a.id}
            className="rounded-lg border border-border bg-card p-5 transition-opacity data-[decided=true]:opacity-60"
            data-decided={Boolean(decision)}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href={`/dashboard/assessments/${a.assessmentId}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {a.objectName}
                  </Link>
                  <AssessmentStatusBadge status={a.status} />
                  {decision && (
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      → {decision}
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {a.assessmentId} · {a.objectClass} · Lead {a.leadAnalyst} · Submitted{' '}
                  {formatDate(a.lastModified)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Stat label="Confidence" value={`${a.confidence}%`} />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      Evidence
                    </span>
                    <EvidenceCoverage value={a.evidenceCoverage} />
                  </div>
                  <Stat label="Methodology" value={a.methodologyVersion} mono />
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/dashboard/assessments/${a.assessmentId}`} />}
                  nativeButton={false}
                >
                  Open
                  <ArrowUpRight className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={Boolean(decision)}
                  onClick={() => decide(a, 'returned')}
                >
                  <RotateCcw className="size-4" />
                  Return
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={Boolean(decision)}
                  onClick={() => decide(a, 'rejected')}
                >
                  <X className="size-4" />
                  Reject
                </Button>
                <Button size="sm" disabled={Boolean(decision)} onClick={() => decide(a, 'approved')}>
                  <Check className="size-4" />
                  Approve
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono text-sm text-foreground' : 'text-sm text-foreground'}>
        {value}
      </span>
    </div>
  )
}
