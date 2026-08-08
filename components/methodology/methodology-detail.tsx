'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  CircleSlash,
  Lock,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import type { MethodologyDetail } from '@/lib/methodology/queries'
import {
  METHODOLOGY_STATUS_CLASS,
  METHODOLOGY_STATUS_LABELS,
  SUBSCORE_STATUS_CLASS,
} from '@/lib/methodology/labels'
import { allowedTransitions } from '@/lib/methodology/validation'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type Tab = 'readiness' | 'subscores' | 'weights' | 'structure'

export function MethodologyDetailView({ detail }: { detail: MethodologyDetail }) {
  const { methodology, readiness, weightGroups, subscores, tracks, criteria, profiles } = detail
  const [tab, setTab] = useState<Tab>('readiness')
  const passed = readiness.checks.filter((c) => c.passed).length
  const canActivate =
    allowedTransitions(methodology.status).includes('active') && readiness.ready
  const isPilot = methodology.status === 'pilot'

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <header className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-mono text-lg font-semibold text-foreground">{methodology.version}</h2>
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
              METHODOLOGY_STATUS_CLASS[methodology.status],
            )}
          >
            {METHODOLOGY_STATUS_LABELS[methodology.status]}
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-foreground">{methodology.name}</p>
        {methodology.description && (
          <p className="mt-2 max-w-3xl text-pretty text-sm text-muted-foreground">
            {methodology.description}
          </p>
        )}
      </header>

      {isPilot && (
        <Card className="mb-5 flex items-start gap-3 border-warning/30 bg-warning/8 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Controlled pilot only</p>
            <p className="mt-1 text-muted-foreground">
              Approved for application, schema, workflow testing, controlled pilot assessments,
              validation, and report-generation testing. Not approved for unrestricted production
              scoring. Ratings created under this version are labeled pilot internally.
            </p>
          </div>
        </Card>
      )}

      {/* Activation gate */}
      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Production activation</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {passed}/{readiness.checks.length} readiness checks passing
            </p>
          </div>
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium',
              canActivate
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-border bg-muted text-muted-foreground',
            )}
          >
            <Lock className="size-4" />
            {canActivate ? 'Eligible for activation' : 'Activation blocked'}
          </div>
        </div>
        {!canActivate && (
          <p className="mt-3 text-xs text-muted-foreground">
            A version cannot become <span className="font-medium">active</span> until every
            readiness check passes. Until then it remains available for controlled pilot assessments
            only.
          </p>
        )}
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="mb-4 flex w-full flex-wrap">
          <TabsTrigger value="readiness">Readiness</TabsTrigger>
          <TabsTrigger value="subscores">Subscores</TabsTrigger>
          <TabsTrigger value="weights">Weights</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="readiness">
          <div className="flex flex-col gap-2">
            {readiness.checks.map((c) => (
              <Card key={c.key} className="flex items-start gap-3 p-3.5">
                {c.passed ? (
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 size-4.5 shrink-0 text-destructive" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.label}</p>
                  <p className="mt-0.5 text-pretty text-xs text-muted-foreground">{c.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscores">
          <div className="flex flex-col gap-2">
            {subscores.map((s) => (
              <SubscoreRow key={s.code} subscore={s} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weights">
          <div className="flex flex-col gap-4">
            {(['criterion', 'track', 'instrument_profile'] as const).map((scope) => {
              const groups = weightGroups.filter((g) => g.scope === scope)
              if (!groups.length) return null
              const scopeLabel =
                scope === 'criterion'
                  ? 'Subscore → criterion'
                  : scope === 'track'
                    ? 'Criterion → track'
                    : 'Track → instrument profile'
              return (
                <div key={scope}>
                  <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                    {scopeLabel}
                  </p>
                  <div className="flex flex-col gap-2">
                    {groups.map((g) => (
                      <Card
                        key={g.key}
                        className="flex items-center justify-between gap-3 p-3.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{g.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {g.members} member{g.members === 1 ? '' : 's'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm tabular-nums text-foreground">
                            {g.total.toFixed(3)}
                            <span className="text-muted-foreground"> / {g.expected.toFixed(1)}</span>
                          </span>
                          {g.reconciled ? (
                            <CheckCircle2 className="size-4 text-success" />
                          ) : (
                            <XCircle className="size-4 text-destructive" />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="structure">
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                Instrument profiles
              </p>
              <div className="flex flex-col gap-2">
                {profiles.map((p) => (
                  <Card key={p.code} className="p-3.5">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{p.code}</p>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                Tracks &amp; criteria
              </p>
              <div className="flex flex-col gap-2">
                {tracks.map((t) => (
                  <Card key={t.code} className="p-3.5">
                    <p className="font-medium text-foreground">
                      {t.title} <span className="font-mono text-xs text-muted-foreground">{t.code}</span>
                    </p>
                    <ul className="mt-2 flex flex-col gap-1">
                      {criteria
                        .filter((c) => c.trackCode === t.code)
                        .map((c) => (
                          <li
                            key={c.code}
                            className="flex items-center justify-between text-xs text-muted-foreground"
                          >
                            <span>
                              {c.title}{' '}
                              <span className="font-mono">{c.code}</span>
                            </span>
                            <span className="font-mono tabular-nums">w {c.weight.toFixed(2)}</span>
                          </li>
                        ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SubscoreRow({
  subscore,
}: {
  subscore: MethodologyDetail['subscores'][number]
}) {
  const [open, setOpen] = useState(false)
  const scored = subscore.valueType !== 'manual'
  const hasAnchors = subscore.scoringAnchors.length > 0
  const incomplete = scored && !hasAnchors

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-3.5 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-foreground">{subscore.code}</span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                SUBSCORE_STATUS_CLASS[subscore.status],
              )}
            >
              {subscore.status}
            </span>
            {incomplete && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive">
                <CircleSlash className="size-3" /> no anchors
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-foreground">{subscore.title}</p>
          <p className="text-xs text-muted-foreground">
            {subscore.trackCode} · {subscore.criterionCode} · {subscore.valueType} · w{' '}
            {subscore.weight.toFixed(2)}
          </p>
        </div>
        <ChevronDown
          className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="border-t border-border p-3.5 text-xs">
          {subscore.description && (
            <p className="mb-3 text-pretty text-muted-foreground">{subscore.description}</p>
          )}
          <div className="mb-3 grid grid-cols-2 gap-2 text-muted-foreground">
            <span>Range: {subscore.minimumScore}–{subscore.maximumScore}</span>
            <span>Mechanism: {subscore.mechanismCode}</span>
            <span>Required facts: {subscore.requiredFactKeys.join(', ') || '—'}</span>
            <span>Caps: {subscore.capCodes.join(', ') || '—'}</span>
          </div>
          {subscore.missingEvidenceRule && (
            <div className="mb-3 rounded-md border border-border bg-muted/40 p-2.5">
              <p className="font-medium text-foreground">Missing-evidence rule</p>
              <p className="mt-1 text-muted-foreground">
                Unknown result stays explicitly unknown
                {subscore.missingEvidenceRule.reducesCoverage && ', reduces coverage'}
                {subscore.missingEvidenceRule.reducesConfidence && ', reduces confidence'}
                {subscore.missingEvidenceRule.activatesCapCode &&
                  `, activates ${subscore.missingEvidenceRule.activatesCapCode}`}
                . Never silently excluded from aggregation.
              </p>
            </div>
          )}
          <p className="mb-1.5 font-medium text-foreground">
            Scoring anchors ({subscore.scoringAnchors.length})
          </p>
          {hasAnchors ? (
            <div className="flex flex-col gap-1.5">
              {subscore.scoringAnchors.map((a) => (
                <div
                  key={a.anchorId}
                  className="flex items-start justify-between gap-3 rounded-md border border-border p-2"
                >
                  <div className="min-w-0">
                    <p className="text-foreground">
                      <span className="font-mono text-muted-foreground">#{a.precedence}</span>{' '}
                      {a.label}
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {JSON.stringify(a.condition)}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono tabular-nums text-foreground">{a.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-destructive">
              No deterministic anchors defined — blocks activation.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
