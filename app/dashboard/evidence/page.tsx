import type { Metadata } from 'next'
import Link from 'next/link'
import { Database, FileCheck2, FileText, ScrollText, ShieldCheck } from 'lucide-react'
import { getAssessments, getFindings } from '@/lib/api/client'
import { evidenceSummary, riskObjects } from '@/lib/mock-data'
import type { EvidenceCategory } from '@/types'
import { EvidenceCoverage } from '@/components/evidence-coverage'
import { Badge } from '@/components/ui/badge'

const CATEGORY_META: Record<
  EvidenceCategory,
  { icon: typeof Database; blurb: string }
> = {
  Onchain: { icon: Database, blurb: 'Verifiable contract state, balances, and event history.' },
  Documentation: { icon: FileText, blurb: 'Whitepapers, specs, and protocol documentation.' },
  Audit: { icon: ShieldCheck, blurb: 'Third-party security reviews and formal verification.' },
  Monitoring: { icon: FileCheck2, blurb: 'Continuous alerting and operational telemetry.' },
  'Legal / organizational': {
    icon: ScrollText,
    blurb: 'Entity structure, custody terms, and disclosures.',
  },
}

export const metadata: Metadata = {
  title: 'Evidence library · Bizantine Ratings',
}

export default async function EvidencePage() {
  const assessments = await getAssessments()

  // Aggregate evidence category counts across every object that has a summary.
  const categoryTotals = new Map<EvidenceCategory, number>()
  for (const summaries of Object.values(evidenceSummary)) {
    for (const s of summaries) {
      categoryTotals.set(s.category, (categoryTotals.get(s.category) ?? 0) + s.count)
    }
  }
  const categories = (Object.keys(CATEGORY_META) as EvidenceCategory[]).map((category) => ({
    category,
    count: categoryTotals.get(category) ?? 0,
    ...CATEGORY_META[category],
  }))
  const totalArtifacts = categories.reduce((s, c) => s + c.count, 0)

  // Per-object evidence coverage, sourced from active assessments joined to objects.
  const objectRows = assessments
    .map((a) => {
      const object = riskObjects.find((o) => o.objectId === a.objectId)
      return { assessment: a, object }
    })
    .filter((r) => r.object)
    .sort((a, b) => b.assessment.evidenceCoverage - a.assessment.evidenceCoverage)

  const findingsByObject = await Promise.all(
    objectRows.map(async (r) => (await getFindings(r.assessment.objectId)).length),
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-foreground">Evidence library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalArtifacts} tracked artifacts across {categories.length} evidence categories, linked to
          scoring criteria and audit trails.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {categories.map((c) => (
          <div key={c.category} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <c.icon className="size-5 text-primary" />
              <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
                {c.count}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{c.category}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.blurb}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Coverage by object</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Object</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Class</th>
                <th className="px-4 py-2.5 font-medium">Coverage</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Open findings</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Methodology</th>
              </tr>
            </thead>
            <tbody>
              {objectRows.map((r, i) => (
                <tr
                  key={r.assessment.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/ratings/${r.assessment.objectId}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {r.object!.canonicalName}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Badge variant="outline" className="font-mono text-[0.7rem]">
                      {r.object!.objectClass}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <EvidenceCoverage value={r.assessment.evidenceCoverage} className="max-w-40" />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={
                        findingsByObject[i] > 0
                          ? 'font-mono text-sm tabular-nums text-warning'
                          : 'font-mono text-sm tabular-nums text-muted-foreground'
                      }
                    >
                      {findingsByObject[i]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground lg:table-cell">
                    {r.assessment.methodologyVersion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
