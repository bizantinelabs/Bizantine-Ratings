import type { Metadata } from 'next'
import { Activity, Building2, KeyRound, Zap } from 'lucide-react'
import { getAPIClients } from '@/lib/api/client'
import { APIUsageCard } from '@/components/api-usage-card'
import { ClientStatusBadge } from '@/components/dashboard/client-status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/domain'

export const metadata: Metadata = {
  title: 'API clients · Bizantine Ratings',
}

export default async function APIClientsPage() {
  const clients = await getAPIClients()

  const totalUsage = clients.reduce((s, c) => s + c.monthlyUsage, 0)
  const activeCount = clients.filter((c) => c.status === 'Active').length
  const enterpriseCount = clients.filter((c) => c.plan === 'Enterprise').length
  const redistributors = clients.filter((c) => c.redistributionRights).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-foreground">API clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Commercial access to the ratings feed, history, and monitoring webhooks.
          </p>
        </div>
        <Button size="sm">
          <KeyRound className="size-4" />
          Provision client
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <APIUsageCard
          label="Monthly requests"
          value={formatNumber(totalUsage)}
          icon={Activity}
          delta="+12.4%"
          deltaTone="up"
          hint="Across all active clients"
        />
        <APIUsageCard label="Active clients" value={activeCount} icon={Building2} hint={`${clients.length} total`} />
        <APIUsageCard label="Enterprise" value={enterpriseCount} icon={Zap} hint="Top-tier agreements" />
        <APIUsageCard
          label="Redistribution rights"
          value={redistributors}
          icon={KeyRound}
          hint="Licensed to redistribute"
        />
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Organization</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Plan</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">Monthly usage</th>
              <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Rate limit</th>
              <th className="hidden px-4 py-2.5 font-medium xl:table-cell">Scopes</th>
              <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Renewal</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr
                key={c.id}
                className="border-b border-border/60 align-top transition-colors last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{c.organization}</span>
                  {c.redistributionRights && (
                    <span className="mt-0.5 block font-mono text-[0.7rem] uppercase tracking-wider text-primary">
                      Redistribution licensed
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">
                    {c.plan}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <ClientStatusBadge status={c.status} />
                </td>
                <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-foreground md:table-cell">
                  {formatNumber(c.monthlyUsage)}
                </td>
                <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground lg:table-cell">
                  {c.rateLimit}
                </td>
                <td className="hidden max-w-xs px-4 py-3 xl:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {c.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground lg:table-cell">
                  {c.renewalDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
