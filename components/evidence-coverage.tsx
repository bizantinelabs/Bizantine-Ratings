import { cn } from '@/lib/utils'

// Compact horizontal coverage meter used in tables and cards.
export function EvidenceCoverage({
  value,
  showLabel = true,
  className,
}: {
  value: number
  showLabel?: boolean
  className?: string
}) {
  const tone =
    value >= 85 ? 'bg-success' : value >= 70 ? 'bg-primary' : value >= 55 ? 'bg-warning' : 'bg-destructive'
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${value}%` }} />
      </div>
      {showLabel && (
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{value}%</span>
      )}
    </div>
  )
}
