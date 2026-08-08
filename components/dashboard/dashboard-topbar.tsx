'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Globe, LogOut, Menu, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BrandMark } from '@/components/brand-mark'
import { DashboardNav } from '@/components/dashboard/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const TITLES: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p === '/dashboard', title: 'Overview' },
  { match: (p) => p.startsWith('/dashboard/assessments'), title: 'Assessments' },
  { match: (p) => p.startsWith('/dashboard/review-queue'), title: 'Review queue' },
  { match: (p) => p.startsWith('/dashboard/evidence'), title: 'Evidence library' },
  { match: (p) => p.startsWith('/dashboard/methodology'), title: 'Methodology governance' },
  { match: (p) => p.startsWith('/dashboard/api-clients'), title: 'API clients' },
]

export function DashboardTopbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const title = TITLES.find((t) => t.match(pathname))?.title ?? 'Dashboard'

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open menu" />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>
              <BrandMark />
            </SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <DashboardNav onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <h1 className="text-sm font-semibold text-foreground">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search objects…" className="h-9 w-56 pl-8" aria-label="Search objects" />
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
          <Bell className="size-4.5" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/" />}>
          <Globe className="size-4" />
          <span className="hidden sm:inline">Public site</span>
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={signOut} aria-label="Sign out">
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
