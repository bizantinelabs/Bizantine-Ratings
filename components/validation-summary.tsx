import { AlertTriangle, CheckCircle2, CircleDashed, FileWarning } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ValidationState {
  activeComplete: number
  activeTotal: number
  missingEvidence: number
  staleEvidence: number
  unresolvedConflicts: number
}

export function ValidationSummary({
  state,
  className,
}: {
  state: ValidationState
  className?: string
}) {
  const ready =
    state.activeComplete >= state.activeTotal &&
    state.missingEvidence === 0 &&
    state.unresolvedConflicts === 0
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border bg-card/80 px-4 py-3 backdrop-blur',
        className,
      )}
    >
      <Metric
        icon={CheckCircle2}
        tone="neutral"
        label={`${state.activeComplete} of ${state.activeTotal} active criteria complete`}
      />
      <Metric icon={FileWarning} tone={state.missingEvidence ? 'warn' : 'neutral'} label={`${state.missingEvidence} missing evidence`} />
      <Metric icon={CircleDashed} tone={state.staleEvidence ? 'warn' : 'neutral'} label={`${state.staleEvidence} stale evidence items`} />
      <Metric icon={AlertTriangle} tone={state.unresolvedConflicts ? 'error' : 'neutral'} label={`${state.unresolvedConflicts} unresolved conflict${state.unresolvedConflicts === 1 ? '' : 's'}`} />
      <div className="ml-auto">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs font-medium',
            ready
              ? 'border-success/25 bg-success/12 text-success'
              : 'border-warning/25 bg-warning/12 text-warning',
          )}
        >
          <span className={cn('size-1.5 rounded-full', ready ? 'bg-success' : 'bg-warning')} aria-hidden />
          {ready ? 'Ready for review' : 'Not ready for review'}
        </span>
      </div>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof CheckCircle2
  label: string
  tone: 'neutral' | 'warn' | 'error'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs',
        tone === 'neutral' && 'text-muted-foreground',
        tone === 'warn' && 'text-warning',
        tone === 'error' && 'text-destructive',
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}
