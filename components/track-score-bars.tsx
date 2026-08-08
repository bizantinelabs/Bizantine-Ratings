import { cn } from '@/lib/utils'
import { scoreTone, scoreToneBg } from '@/lib/domain'
import type { TrackScores } from '@/types'

const trackLabels: { key: keyof TrackScores; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'asset', label: 'Asset' },
  { key: 'protocolOpportunity', label: 'Protocol / Opportunity' },
  { key: 'blockchain', label: 'Blockchain' },
]

export function TrackScoreBars({ scores, className }: { scores: TrackScores; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3.5', className)}>
      {trackLabels.map(({ key, label }) => {
        const value = scores[key]
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-mono text-sm font-medium tabular-nums text-foreground">{value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full', scoreToneBg[scoreTone(value)])}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
