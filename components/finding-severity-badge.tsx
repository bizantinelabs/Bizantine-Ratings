import { cn } from '@/lib/utils'
import { severityClass } from '@/lib/domain'
import type { EventSeverity, FindingSeverity } from '@/types'

export function FindingSeverityBadge({
  severity,
  className,
}: {
  severity: FindingSeverity | EventSeverity
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-wide',
        severityClass(severity),
        className,
      )}
    >
      {severity}
    </span>
  )
}
