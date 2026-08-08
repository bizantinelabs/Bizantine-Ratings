import type {
  Decision,
  EventSeverity,
  FindingSeverity,
  MonitoringStatus,
  RatingBand,
} from '@/types'

// Map a numeric score (0-100) to a semantic tone used across score bars/gauges.
export function scoreTone(score: number): 'strong' | 'good' | 'moderate' | 'weak' {
  if (score >= 80) return 'strong'
  if (score >= 70) return 'good'
  if (score >= 55) return 'moderate'
  return 'weak'
}

export const scoreToneClass: Record<ReturnType<typeof scoreTone>, string> = {
  strong: 'text-success',
  good: 'text-primary',
  moderate: 'text-warning',
  weak: 'text-destructive',
}

export const scoreToneBg: Record<ReturnType<typeof scoreTone>, string> = {
  strong: 'bg-success',
  good: 'bg-primary',
  moderate: 'bg-warning',
  weak: 'bg-destructive',
}

// Map a weighted aggregate score to a rating band and its display label.
// Mirrors the public rating scale (A/B/C/D + Not Approved).
export function scoreToBand(score: number): { band: RatingBand; label: string } {
  if (score >= 85) return { band: 'A', label: 'A' }
  if (score >= 70) return { band: 'B', label: 'BBB' }
  if (score >= 55) return { band: 'C', label: 'BB' }
  if (score >= 40) return { band: 'D', label: 'B' }
  return { band: 'Not Approved', label: 'NR' }
}

export function bandClass(band: RatingBand): string {
  switch (band) {
    case 'A':
      return 'bg-success/12 text-success border-success/25'
    case 'B':
      return 'bg-primary/12 text-primary border-primary/25'
    case 'C':
      return 'bg-warning/12 text-warning border-warning/25'
    case 'D':
      return 'bg-destructive/12 text-destructive border-destructive/25'
    case 'Not Approved':
      return 'bg-muted text-muted-foreground border-border'
  }
}

export function decisionClass(decision: Decision): string {
  switch (decision) {
    case 'Approved':
      return 'text-success'
    case 'Approved with Constraints':
      return 'text-warning'
    case 'Not Approved':
      return 'text-destructive'
  }
}

export function monitoringClass(status: MonitoringStatus): {
  dot: string
  text: string
} {
  switch (status) {
    case 'Stable':
      return { dot: 'bg-success', text: 'text-success' }
    case 'Under Review':
      return { dot: 'bg-warning', text: 'text-warning' }
    case 'Critical':
      return { dot: 'bg-destructive', text: 'text-destructive' }
  }
}

export function severityClass(severity: FindingSeverity | EventSeverity): string {
  switch (severity) {
    case 'Critical':
      return 'bg-destructive/15 text-destructive border-destructive/30'
    case 'High':
      return 'bg-destructive/10 text-destructive border-destructive/20'
    case 'Medium':
      return 'bg-warning/12 text-warning border-warning/25'
    case 'Low':
      return 'bg-primary/10 text-primary border-primary/20'
    case 'Info':
    case 'Informational':
      return 'bg-muted text-muted-foreground border-border'
  }
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatDate(iso: string): string {
  if (!iso || iso === '—') return '—'
  const d = new Date(iso.length <= 7 ? `${iso}-01` : iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  })
}

export function truncateAddress(address?: string): string {
  if (!address) return '—'
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
