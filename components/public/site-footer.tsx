import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'

const columns = [
  {
    heading: 'Product',
    links: [
      { label: 'Ratings Registry', href: '/ratings' },
      { label: 'Monitoring', href: '/monitoring' },
      { label: 'Compare', href: '/compare' },
      { label: 'Methodology', href: '/methodology' },
    ],
  },
  {
    heading: 'Data',
    links: [
      { label: 'Commercial API', href: '/#api' },
      { label: 'Analyst Workspace', href: '/dashboard' },
      { label: 'Review Queue', href: '/dashboard/review' },
      { label: 'API Clients', href: '/dashboard/api' },
    ],
  },
  {
    heading: 'Governance',
    links: [
      { label: 'Rating Scale', href: '/methodology' },
      { label: 'Conflicts Policy', href: '/methodology' },
      { label: 'Coverage', href: '/ratings' },
      { label: 'Disclosures', href: '/methodology' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
          <BrandMark />
          <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
            Independent, evidence-backed risk intelligence for onchain markets. Ratings are informational and do not
            constitute investment advice.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.heading} className="flex flex-col gap-3">
            <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{col.heading}</h3>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Bizantine Ratings. All rights reserved.</p>
          <p>Ratings do not imply endorsement. Paid access never influences rating outcomes.</p>
        </div>
      </div>
    </footer>
  )
}
