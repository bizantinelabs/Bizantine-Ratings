import type { MethodologyStatus, SubscoreStatus } from './types'

export const METHODOLOGY_STATUS_LABELS: Record<MethodologyStatus, string> = {
  draft: 'Draft',
  implementation_ready: 'Implementation ready',
  pilot: 'Pilot',
  active: 'Active',
  retired: 'Retired',
}

// Tailwind classes keyed to design tokens (no raw colors).
export const METHODOLOGY_STATUS_CLASS: Record<MethodologyStatus, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  implementation_ready: 'bg-primary/12 text-primary border-primary/25',
  pilot: 'bg-warning/12 text-warning border-warning/30',
  active: 'bg-success/12 text-success border-success/25',
  retired: 'bg-muted text-muted-foreground border-border',
}

export const SUBSCORE_STATUS_CLASS: Record<SubscoreStatus, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  pilot: 'bg-warning/12 text-warning border-warning/30',
  active: 'bg-success/12 text-success border-success/25',
  retired: 'bg-muted text-muted-foreground border-border',
}
