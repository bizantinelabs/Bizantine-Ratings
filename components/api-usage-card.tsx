import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface APIUsageCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  delta?: string
  deltaTone?: 'up' | 'down' | 'neutral'
  hint?: string
  className?: string
}

export function APIUsageCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaTone = 'neutral',
  hint,
  className,
}: APIUsageCardProps) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-lg border border-border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</span>
        {delta && (
          <span
            className={cn(
              'text-xs font-medium tabular-nums',
              deltaTone === 'up' && 'text-success',
              deltaTone === 'down' && 'text-destructive',
              deltaTone === 'neutral' && 'text-muted-foreground',
            )}
          >
            {delta}
          </span>
        )}
      </div>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}
