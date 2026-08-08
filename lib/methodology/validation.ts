// Structural validators for methodology configuration.
// These NEVER compute ratings — they only verify that the versioned config is
// complete and internally consistent before a methodology may be activated.

import type { MethodologyStatus } from './types'

const TOLERANCE = 1e-6

export type WeightGroup = {
  scope: 'criterion' | 'track' | 'instrument_profile'
  key: string
  label: string
  total: number
  expected: number
  reconciled: boolean
  members: number
}

export type ReconciliationInput = {
  tracks: Array<{ code: string; title: string }>
  criteria: Array<{ code: string; trackCode: string; title: string; weight: number }>
  subscoreWeights: Array<{
    subscoreCode: string
    trackCode: string
    criterionCode: string
    weight: number
  }>
  profiles: Array<{ code: string; name: string }>
  profileTrackWeights: Array<{ profileCode: string; trackCode: string; weight: number }>
}

function approxEqual(a: number, b: number) {
  return Math.abs(a - b) <= TOLERANCE
}

// Reconcile every weighted grouping to its required total (1.0).
export function reconcileWeights(input: ReconciliationInput): WeightGroup[] {
  const groups: WeightGroup[] = []

  // Subscore weights sum to 1.0 within each criterion.
  const byCriterion = new Map<string, { total: number; members: number }>()
  for (const w of input.subscoreWeights) {
    const g = byCriterion.get(w.criterionCode) ?? { total: 0, members: 0 }
    g.total += w.weight
    g.members += 1
    byCriterion.set(w.criterionCode, g)
  }
  for (const c of input.criteria) {
    const g = byCriterion.get(c.code) ?? { total: 0, members: 0 }
    groups.push({
      scope: 'criterion',
      key: c.code,
      label: `${c.title} (${c.code})`,
      total: g.total,
      expected: 1,
      reconciled: g.members > 0 && approxEqual(g.total, 1),
      members: g.members,
    })
  }

  // Criterion weights sum to 1.0 within each track.
  const byTrack = new Map<string, { total: number; members: number }>()
  for (const c of input.criteria) {
    const g = byTrack.get(c.trackCode) ?? { total: 0, members: 0 }
    g.total += c.weight
    g.members += 1
    byTrack.set(c.trackCode, g)
  }
  for (const t of input.tracks) {
    const g = byTrack.get(t.code) ?? { total: 0, members: 0 }
    groups.push({
      scope: 'track',
      key: t.code,
      label: `${t.title} (${t.code})`,
      total: g.total,
      expected: 1,
      reconciled: g.members > 0 && approxEqual(g.total, 1),
      members: g.members,
    })
  }

  // Track weights sum to 1.0 within each instrument profile.
  const byProfile = new Map<string, { total: number; members: number }>()
  for (const w of input.profileTrackWeights) {
    const g = byProfile.get(w.profileCode) ?? { total: 0, members: 0 }
    g.total += w.weight
    g.members += 1
    byProfile.set(w.profileCode, g)
  }
  for (const p of input.profiles) {
    const g = byProfile.get(p.code) ?? { total: 0, members: 0 }
    groups.push({
      scope: 'instrument_profile',
      key: p.code,
      label: `${p.name} (${p.code})`,
      total: g.total,
      expected: 1,
      reconciled: g.members === input.tracks.length && approxEqual(g.total, 1),
      members: g.members,
    })
  }

  return groups
}

export type ReadinessCheck = {
  key: string
  label: string
  passed: boolean
  detail: string
}

export type ReadinessInput = {
  methodologyHash: string | null
  independentApprovalRecorded: boolean
  crossFormatFixturesPass: boolean
  subscores: Array<{
    code: string
    valueType: string
    status: string
    hasWeight: boolean
    anchorCount: number
    hasApprovedManualRule: boolean
    hasMissingDataRule: boolean
    gateCodes: string[]
    capCodes: string[]
  }>
  weightGroups: WeightGroup[]
  resolvableGateCodes: string[]
  resolvableCapCodes: string[]
}

// The production-safety control. A methodology cannot become `active` unless
// every check passes.
export function evaluateReadiness(input: ReadinessInput): {
  checks: ReadinessCheck[]
  ready: boolean
} {
  const checks: ReadinessCheck[] = []
  const scored = input.subscores.filter((s) => s.valueType !== 'manual')

  // 1. Every required atomic subscore has a weight.
  const missingWeights = input.subscores.filter((s) => !s.hasWeight)
  checks.push({
    key: 'weights_present',
    label: 'Every atomic subscore has a weight',
    passed: input.subscores.length > 0 && missingWeights.length === 0,
    detail: missingWeights.length
      ? `Missing weight: ${missingWeights.map((s) => s.code).join(', ')}`
      : 'All subscores carry a weight.',
  })

  // 2. Weights reconcile to required criterion and track totals.
  const unreconciled = input.weightGroups.filter((g) => !g.reconciled)
  checks.push({
    key: 'weights_reconcile',
    label: 'Weights reconcile to criterion, track, and profile totals',
    passed: input.weightGroups.length > 0 && unreconciled.length === 0,
    detail: unreconciled.length
      ? `Unreconciled: ${unreconciled.map((g) => `${g.key} (${g.total.toFixed(3)})`).join(', ')}`
      : 'All weighted groups sum to 1.0.',
  })

  // 3. Every scored subscore has deterministic anchors or an approved manual rule.
  const missingAnchors = scored.filter((s) => s.anchorCount === 0 && !s.hasApprovedManualRule)
  const manualUnapproved = input.subscores.filter(
    (s) => s.valueType === 'manual' && !s.hasApprovedManualRule,
  )
  checks.push({
    key: 'anchors_present',
    label: 'Every scored subscore has deterministic anchors or an approved manual rule',
    passed: missingAnchors.length === 0 && manualUnapproved.length === 0,
    detail:
      missingAnchors.length || manualUnapproved.length
        ? `Needs anchors/manual rule: ${[...missingAnchors, ...manualUnapproved].map((s) => s.code).join(', ')}`
        : 'All scored subscores have deterministic anchors.',
  })

  // 4. Every missing-evidence rule is defined.
  const missingRules = input.subscores.filter(
    (s) => s.valueType !== 'manual' && !s.hasMissingDataRule,
  )
  checks.push({
    key: 'missing_data_rules',
    label: 'Every scored subscore defines a missing-evidence rule',
    passed: missingRules.length === 0,
    detail: missingRules.length
      ? `Missing rule: ${missingRules.map((s) => s.code).join(', ')}`
      : 'All missing-evidence rules defined.',
  })

  // 5. All gate and cap references resolve.
  const gateSet = new Set(input.resolvableGateCodes)
  const capSet = new Set(input.resolvableCapCodes)
  const unresolved: string[] = []
  for (const s of input.subscores) {
    for (const g of s.gateCodes) if (!gateSet.has(g)) unresolved.push(`gate:${g}`)
    for (const c of s.capCodes) if (!capSet.has(c)) unresolved.push(`cap:${c}`)
  }
  checks.push({
    key: 'references_resolve',
    label: 'All gate and cap references resolve',
    passed: unresolved.length === 0,
    detail: unresolved.length
      ? `Unresolved: ${[...new Set(unresolved)].join(', ')}`
      : 'All gate/cap references resolve.',
  })

  // 6. Every instrument profile has complete track weights.
  const incompleteProfiles = input.weightGroups.filter(
    (g) => g.scope === 'instrument_profile' && !g.reconciled,
  )
  checks.push({
    key: 'profile_track_weights',
    label: 'Every instrument profile has complete track weights',
    passed:
      input.weightGroups.some((g) => g.scope === 'instrument_profile') &&
      incompleteProfiles.length === 0,
    detail: incompleteProfiles.length
      ? `Incomplete: ${incompleteProfiles.map((g) => g.key).join(', ')}`
      : 'All instrument profiles have complete track weights.',
  })

  // 7. Cross-format fixtures pass.
  checks.push({
    key: 'cross_format_fixtures',
    label: 'Cross-format fixtures (JSON/Markdown/PDF/CSV) pass',
    passed: input.crossFormatFixturesPass,
    detail: input.crossFormatFixturesPass
      ? 'Cross-format deterministic validation passed.'
      : 'Cross-format fixture validation has not been run and passed.',
  })

  // 8. Methodology hashes are generated.
  checks.push({
    key: 'methodology_hash',
    label: 'Methodology hashes are generated',
    passed: Boolean(input.methodologyHash),
    detail: input.methodologyHash
      ? `Hash present (${input.methodologyHash.slice(0, 12)}…).`
      : 'Methodology hash has not been generated.',
  })

  // 9. Independent methodology approval is recorded.
  checks.push({
    key: 'independent_approval',
    label: 'Independent methodology approval is recorded',
    passed: input.independentApprovalRecorded,
    detail: input.independentApprovalRecorded
      ? 'Independent approval recorded.'
      : 'No independent methodology approval on record.',
  })

  return { checks, ready: checks.every((c) => c.passed) }
}

// Lifecycle state machine. `active` requires a passing readiness evaluation.
const ALLOWED_TRANSITIONS: Record<MethodologyStatus, MethodologyStatus[]> = {
  draft: ['implementation_ready', 'retired'],
  implementation_ready: ['pilot', 'draft', 'retired'],
  pilot: ['active', 'implementation_ready', 'retired'],
  active: ['retired'],
  retired: [],
}

export function canTransition(
  from: MethodologyStatus,
  to: MethodologyStatus,
  ready: boolean,
): { allowed: boolean; reason?: string } {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    return { allowed: false, reason: `Cannot move from ${from} to ${to}.` }
  }
  if (to === 'active' && !ready) {
    return {
      allowed: false,
      reason: 'Activation blocked: production-readiness checklist is incomplete.',
    }
  }
  return { allowed: true }
}

export function allowedTransitions(from: MethodologyStatus): MethodologyStatus[] {
  return ALLOWED_TRANSITIONS[from]
}
