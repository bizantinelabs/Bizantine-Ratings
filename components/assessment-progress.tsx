import { cn } from '@/lib/utils'

export function AssessmentProgress({
  completion,
  className,
  showLabel = true,
}: {
  completion: number
  className?: string
  showLabel?: boolean
}) {
  const value = Math.max(0, Math.min(100, Math.round(completion ?? 0)))
  const tone = value >= 100 ? 'bg-success' : value >= 60 ? 'bg-primary' : 'bg-warning'
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 w-full min-w-14 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${value}%` }} />
      </div>
      {showLabel && (
        <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
          {value}%
        </span>
      )}
    </div>
  )
}
