import { cn } from '@/lib/utils'
import { bandClass } from '@/lib/domain'
import type { RatingBand } from '@/types'

interface RatingBadgeProps {
  rating: string
  band: RatingBand
  className?: string
}

export function RatingBadge({ rating, band, className }: RatingBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums',
        bandClass(band),
        className,
      )}
    >
      {rating}
    </span>
  )
}
