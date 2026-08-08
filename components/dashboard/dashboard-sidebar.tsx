'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ClipboardList,
  Database,
  Gauge,
  Inbox,
  KeyRound,
  ScrollText,
  type LucideIcon,
} from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: number
}

const nav: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: Gauge },
  { href: '/dashboard/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/dashboard/review-queue', label: 'Review queue', icon: Inbox, badge: 3 },
  { href: '/dashboard/evidence', label: 'Evidence library', icon: Database },
  { href: '/dashboard/methodology', label: 'Methodology', icon: ScrollText },
  { href: '/dashboard/api-clients', label: 'API clients', icon: KeyRound },
]

export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active =
          item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
            )}
          >
            <item.icon className={cn('size-4', active ? 'text-primary' : '')} />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-xs font-medium tabular-nums text-primary">
                {item.badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Link href="/">
          <BrandMark />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="px-3 pb-2 text-xs uppercase tracking-widest text-muted-foreground">Analyst workspace</p>
        <DashboardNav />
      </div>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            RO
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">R. Okonkwo</p>
            <p className="truncate text-xs text-muted-foreground">Senior Analyst</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
