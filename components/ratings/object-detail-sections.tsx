import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { FindingSeverityBadge } from '@/components/finding-severity-badge'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/domain'
import type { Finding } from '@/types'

const statusClass: Record<Finding['status'], string> = {
  Open: 'text-destructive',
  Mitigated: 'text-warning',
  Resolved: 'text-success',
  Accepted: 'text-muted-foreground',
}

export function FindingsList({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No open findings recorded for this object in the current review cycle.
      </p>
    )
  }
  return (
    <ul className="divide-y divide-border">
      {findings.map((f) => (
        <li key={f.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <FindingSeverityBadge severity={f.severity} />
            <div>
              <p className="text-sm font-medium text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">
                Detected {formatDate(f.detectedAt)} · Updated {formatDate(f.updatedAt)}
              </p>
            </div>
          </div>
          <span className={cn('text-xs font-medium tabular-nums', statusClass[f.status])}>{f.status}</span>
        </li>
      ))}
    </ul>
  )
}

export function GatesAndCaps({ gates, caps }: { gates: string[]; caps: string[] }) {
  if (gates.length === 0 && caps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No active gates or scoring caps. The rating reflects the uncapped model output.
      </p>
    )
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <ShieldAlert className="size-4 text-destructive" />
          Active gates
        </div>
        {gates.length > 0 ? (
          <ul className="space-y-1.5">
            {gates.map((g) => (
              <li key={g} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-destructive" />
                {g}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">None</p>
        )}
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <AlertTriangle className="size-4 text-warning" />
          Scoring caps
        </div>
        {caps.length > 0 ? (
          <ul className="space-y-1.5">
            {caps.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-warning" />
                {c}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">None</p>
        )}
      </div>
    </div>
  )
}

export function EvidenceBreakdown({
  summary,
}: {
  summary: { category: string; count: number; licensed?: boolean }[]
}) {
  const total = summary.reduce((acc, s) => acc + s.count, 0)
  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No evidence artifacts catalogued yet.</p>
  }
  return (
    <ul className="space-y-2.5">
      {summary.map((s) => (
        <li key={s.category} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{s.category}</span>
          <span className="flex items-center gap-2">
            {s.licensed && (
              <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                Licensed
              </span>
            )}
            <span className="font-mono tabular-nums text-foreground">{s.count}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
