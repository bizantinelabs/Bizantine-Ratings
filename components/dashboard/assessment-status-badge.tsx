import { cn } from '@/lib/utils'
import type { AssessmentStatus } from '@/types'

const statusStyle: Record<AssessmentStatus, string> = {
  Draft: 'bg-muted text-muted-foreground border-border',
  'In Review': 'bg-primary/12 text-primary border-primary/25',
  Returned: 'bg-warning/12 text-warning border-warning/25',
  Approved: 'bg-success/12 text-success border-success/25',
  Published: 'bg-success/15 text-success border-success/30',
  Rejected: 'bg-destructive/12 text-destructive border-destructive/25',
}

export function AssessmentStatusBadge({
  status,
  className,
}: {
  status: AssessmentStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        statusStyle[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
