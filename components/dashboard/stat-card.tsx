import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
  className,
}: {
  label: string
  value: string | number
  sublabel?: string
  icon?: LucideIcon
  trend?: { value: string; positive?: boolean }
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium tabular-nums',
              trend.positive ? 'text-success' : 'text-destructive',
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  )
}
