import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { MonitoringFeed } from '@/components/monitoring/monitoring-feed'
import { monitoringEvents } from '@/lib/mock-data'

export const metadata: Metadata = {
  title: 'Monitoring Feed',
  description:
    'Real-time risk signals across rated objects: contract upgrades, admin-role changes, liquidity shifts, incidents, and rating actions.',
}

export default function MonitoringPage() {
  const critical = monitoringEvents.filter((e) => e.severity === 'Critical' || e.severity === 'High').length

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader
        eyebrow="Continuous surveillance"
        title="Monitoring feed"
        description="Bizantine continuously monitors rated objects for events that could affect their risk profile. Elevated signals can trigger a reassessment or place a rating under review."
      />

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        <span className="text-muted-foreground">
          Surveillance active ·{' '}
          <span className="font-medium text-foreground">{monitoringEvents.length}</span> events in the last 30 days ·{' '}
          <span className="font-medium text-destructive">{critical}</span> elevated
        </span>
      </div>

      <div className="mt-8">
        <MonitoringFeed events={monitoringEvents} />
      </div>
    </div>
  )
}
