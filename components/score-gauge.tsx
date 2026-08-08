import { cn } from '@/lib/utils'
import { scoreTone, scoreToneClass } from '@/lib/domain'

interface ScoreGaugeProps {
  score: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

// A radial score gauge rendered with a single SVG ring. No external chart needed.
export function ScoreGauge({
  score,
  max = 100,
  size = 132,
  strokeWidth = 8,
  label = 'Public Score',
  className,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(Math.max(score / max, 0), 1)
  const dash = circumference * pct
  const tone = scoreTone(score)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label}: ${score} of ${max}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={cn(
            tone === 'strong' && 'stroke-success',
            tone === 'good' && 'stroke-primary',
            tone === 'moderate' && 'stroke-warning',
            tone === 'weak' && 'stroke-destructive',
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-mono text-3xl font-semibold tabular-nums leading-none', scoreToneClass[tone])}>
          {score}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">/ {max}</span>
      </div>
    </div>
  )
}
