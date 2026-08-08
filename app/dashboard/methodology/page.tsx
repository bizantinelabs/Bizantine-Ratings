import Link from 'next/link'
import { ArrowRight, ShieldAlert } from 'lucide-react'
import { getMethodologies } from '@/lib/methodology/queries'
import { METHODOLOGY_STATUS_CLASS, METHODOLOGY_STATUS_LABELS } from '@/lib/methodology/labels'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function MethodologyPage() {
  const methodologies = await getMethodologies()
  const pilots = methodologies.filter((m) => m.status === 'pilot')

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <header className="mb-6">
        <h2 className="text-balance text-xl font-semibold text-foreground">Methodology suite</h2>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          Lifecycle governance for the Bizantine Labs ratings methodology. Versions must pass the
          production-readiness checklist before they can be activated for unrestricted scoring.
        </p>
      </header>

      {pilots.length > 0 && (
        <Card className="mb-6 flex items-start gap-3 border-warning/30 bg-warning/8 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Pilot methodology in use</p>
            <p className="mt-1 text-muted-foreground">
              {pilots.map((p) => p.version).join(', ')} {pilots.length === 1 ? 'is' : 'are'} in{' '}
              <span className="font-medium text-warning">pilot</span>. Ratings produced under a pilot
              methodology are labeled internally and must not be exposed as unrestricted production
              ratings unless explicitly approved by an authorized publisher.
            </p>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {methodologies.map((m) => (
          <Link key={m.version} href={`/dashboard/methodology/${encodeURIComponent(m.version)}`}>
            <Card className="group flex items-center gap-4 p-4 transition-colors hover:border-primary/40">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">{m.version}</span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                      METHODOLOGY_STATUS_CLASS[m.status],
                    )}
                  >
                    {METHODOLOGY_STATUS_LABELS[m.status]}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{m.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.subscoreCount} atomic subscore{m.subscoreCount === 1 ? '' : 's'}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
