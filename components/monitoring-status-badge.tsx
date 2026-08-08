import { cn } from '@/lib/utils'
import { monitoringClass } from '@/lib/domain'
import type { MonitoringStatus } from '@/types'

export function MonitoringStatusBadge({
  status,
  className,
}: {
  status: MonitoringStatus
  className?: string
}) {
  const c = monitoringClass(status)
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', c.text, className)}>
      <span className={cn('size-1.5 rounded-full', c.dot)} aria-hidden />
      {status}
    </span>
  )
}
