import type { ClientStatus } from '@/types'
import { cn } from '@/lib/utils'

const styles: Record<ClientStatus, string> = {
  Active: 'border-success/30 bg-success/10 text-success',
  Trialing: 'border-primary/30 bg-primary/10 text-primary',
  'Past Due': 'border-warning/30 bg-warning/10 text-warning',
  Suspended: 'border-destructive/30 bg-destructive/10 text-destructive',
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        styles[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
