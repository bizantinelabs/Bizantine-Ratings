'use client'

import { useState } from 'react'
import { AlertTriangle, ChevronDown, FileText, PencilLine } from 'lucide-react'
import type { ScoringCriterion } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function scoreTone(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 65) return 'text-primary'
  if (score >= 50) return 'text-warning'
  return 'text-destructive'
}

export function CriterionCard({ criterion }: { criterion: ScoringCriterion }) {
  const [open, setOpen] = useState(false)
  const c = criterion

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-4 px-4 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{c.title}</span>
            <Badge variant="outline" className="font-mono text-[0.7rem]">
              {c.track}
            </Badge>
            {c.manualOverride && (
              <Badge className="gap-1 border-warning/30 bg-warning/10 text-warning">
                <PencilLine className="size-3" />
                Override
              </Badge>
            )}
            {c.qualityFlags.map((flag) => (
              <Badge key={flag} className="gap-1 border-destructive/30 bg-destructive/10 text-destructive">
                <AlertTriangle className="size-3" />
                {flag}
              </Badge>
            ))}
          </div>
          <p className="mt-1.5 line-clamp-1 text-sm text-muted-foreground">{c.mechanism}</p>
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <div className="hidden text-right sm:block">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Weight</p>
            <p className="font-mono text-sm tabular-nums text-foreground">{Math.round(c.weight * 100)}%</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Score</p>
            <p className={cn('font-mono text-lg font-semibold tabular-nums', scoreTone(c.normalizedScore))}>
              {c.normalizedScore}
            </p>
          </div>
          <ChevronDown
            className={cn('size-5 text-muted-foreground transition-transform', open && 'rotate-180')}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Normalized" value={String(c.normalizedScore)} tone={scoreTone(c.normalizedScore)} />
            <Metric label="BL-APB base" value={String(c.blApbScore)} />
            <Metric label="Confidence" value={`${c.confidence}%`} />
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <Field label="Analyst rationale">{c.rationale}</Field>
            {c.manualOverride && c.overrideJustification && (
              <Field label="Override justification" tone="warning">
                {c.overrideJustification}
              </Field>
            )}
            <Field label="Scoring guidance">{c.guidance}</Field>
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Methodology reference
              </p>
              <p className="mt-1 font-serif text-sm italic text-foreground/80">{c.methodologyExcerpt}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="size-3.5" />
            {c.linkedEvidence} linked evidence artifacts
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
      <p className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 font-mono text-base font-semibold tabular-nums text-foreground', tone)}>
        {value}
      </p>
    </div>
  )
}

function Field({
  label,
  children,
  tone,
}: {
  label: string
  children: React.ReactNode
  tone?: 'warning'
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 leading-relaxed', tone === 'warning' ? 'text-warning' : 'text-foreground/90')}>
        {children}
      </p>
    </div>
  )
}
