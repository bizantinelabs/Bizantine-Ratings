import 'server-only'
import { createClient } from '@/lib/supabase/server'
import {
  reconcileWeights,
  evaluateReadiness,
  type WeightGroup,
  type ReadinessCheck,
} from './validation'
import type { AtomicSubscoreDefinition, Methodology, ScoringAnchor } from './types'

export type MethodologyListItem = Methodology & { subscoreCount: number }

export async function getMethodologies(): Promise<MethodologyListItem[]> {
  const supabase = await createClient()
  const [{ data: methodologies }, { data: subscores }] = await Promise.all([
    supabase.from('methodologies').select('*').order('version', { ascending: false }),
    supabase.from('atomic_subscores').select('methodology_version'),
  ])
  const counts = new Map<string, number>()
  for (const s of subscores ?? []) {
    counts.set(s.methodology_version, (counts.get(s.methodology_version) ?? 0) + 1)
  }
  return (methodologies ?? []).map((m) => ({
    version: m.version,
    name: m.name,
    status: m.status,
    description: m.description,
    methodologyHash: m.methodology_hash,
    independentApprovalRecorded: m.independent_approval_recorded,
    approvedBy: m.approved_by,
    approvedAt: m.approved_at,
    activatedAt: m.activated_at,
    retiredAt: m.retired_at,
    subscoreCount: counts.get(m.version) ?? 0,
  }))
}

export async function getMethodologyStatus(
  version: string,
): Promise<{ status: string; description: string | null } | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('methodologies')
    .select('status, description')
    .eq('version', version)
    .maybeSingle()
  return data ?? null
}

export type MethodologyDetail = {
  methodology: Methodology
  profiles: Array<{ code: string; name: string; description: string | null }>
  tracks: Array<{ code: string; title: string; description: string | null }>
  criteria: Array<{ code: string; trackCode: string; title: string; weight: number }>
  subscores: AtomicSubscoreDefinition[]
  weightGroups: WeightGroup[]
  readiness: { checks: ReadinessCheck[]; ready: boolean }
}

export async function getMethodologyDetail(version: string): Promise<MethodologyDetail | null> {
  const supabase = await createClient()
  const { data: m } = await supabase.from('methodologies').select('*').eq('version', version).single()
  if (!m) return null

  const [
    { data: profiles },
    { data: tracks },
    { data: criteria },
    { data: subscoreRows },
    { data: anchors },
    { data: weights },
    { data: applicability },
    { data: missingRules },
    { data: profileWeights },
  ] = await Promise.all([
    supabase.from('instrument_profiles').select('*').eq('methodology_version', version),
    supabase.from('methodology_tracks').select('*').eq('methodology_version', version),
    supabase.from('methodology_criteria').select('*').eq('methodology_version', version),
    supabase.from('atomic_subscores').select('*').eq('methodology_version', version).order('code'),
    supabase.from('scoring_anchors').select('*').eq('methodology_version', version).order('precedence'),
    supabase.from('subscore_weights').select('*').eq('methodology_version', version),
    supabase.from('subscore_applicability_rules').select('*').eq('methodology_version', version),
    supabase.from('subscore_missing_data_rules').select('*').eq('methodology_version', version),
    supabase.from('instrument_profile_track_weights').select('*').eq('methodology_version', version),
  ])

  const anchorsBySubscore = new Map<string, ScoringAnchor[]>()
  for (const a of anchors ?? []) {
    const list = anchorsBySubscore.get(a.subscore_code) ?? []
    list.push({
      anchorId: a.anchor_id,
      subscoreCode: a.subscore_code,
      label: a.label,
      description: a.description,
      score: Number(a.score),
      condition: a.condition,
      requiredEvidence: a.required_evidence,
      minimumConfidence: a.minimum_confidence,
      precedence: a.precedence,
    })
    anchorsBySubscore.set(a.subscore_code, list)
  }
  const weightSet = new Set((weights ?? []).map((w) => w.subscore_code))
  const applicabilityBy = new Map((applicability ?? []).map((r) => [r.subscore_code, r.rule]))
  const missingBy = new Map((missingRules ?? []).map((r) => [r.subscore_code, r]))

  const subscores: AtomicSubscoreDefinition[] = (subscoreRows ?? []).map((s) => {
    const missing = missingBy.get(s.code)
    return {
      code: s.code,
      methodologyVersion: s.methodology_version,
      trackCode: s.track_code,
      criterionCode: s.criterion_code,
      mechanismCode: s.mechanism_code,
      title: s.title,
      description: s.description,
      valueType: s.value_type,
      minimumScore: Number(s.minimum_score),
      maximumScore: Number(s.maximum_score),
      weight: Number(s.weight),
      applicabilityRule: applicabilityBy.get(s.code) ?? null,
      scoringAnchors: anchorsBySubscore.get(s.code) ?? [],
      missingEvidenceRule: missing
        ? {
            reducesCoverage: missing.reduces_coverage,
            reducesConfidence: missing.reduces_confidence,
            activatesCapCode: missing.activates_cap_code,
            excludedFromAggregation: missing.excluded_from_aggregation,
            rule: missing.rule,
          }
        : null,
      confidenceRule: null,
      requiredFactKeys: s.required_fact_keys,
      optionalFactKeys: s.optional_fact_keys,
      gateCodes: s.gate_codes,
      capCodes: s.cap_codes,
      effectiveFrom: s.effective_from,
      effectiveTo: s.effective_to,
      status: s.status,
    }
  })

  const criteriaMapped = (criteria ?? []).map((c) => ({
    code: c.code,
    trackCode: c.track_code,
    title: c.title,
    weight: Number(c.weight),
  }))
  const tracksMapped = (tracks ?? []).map((t) => ({
    code: t.code,
    title: t.title,
    description: t.description,
  }))
  const profilesMapped = (profiles ?? []).map((p) => ({
    code: p.code,
    name: p.name,
    description: p.description,
  }))

  const weightGroups = reconcileWeights({
    tracks: tracksMapped,
    criteria: criteriaMapped,
    subscoreWeights: (weights ?? []).map((w) => ({
      subscoreCode: w.subscore_code,
      trackCode: w.track_code,
      criterionCode: w.criterion_code,
      weight: Number(w.weight),
    })),
    profiles: profilesMapped,
    profileTrackWeights: (profileWeights ?? []).map((w) => ({
      profileCode: w.instrument_profile_code,
      trackCode: w.track_code,
      weight: Number(w.weight),
    })),
  })

  // Resolvable cap codes = those declared by a missing-data rule. No gates seeded.
  const resolvableCapCodes = (missingRules ?? [])
    .map((r) => r.activates_cap_code)
    .filter((c): c is string => Boolean(c))

  const readiness = evaluateReadiness({
    methodologyHash: m.methodology_hash,
    independentApprovalRecorded: m.independent_approval_recorded,
    crossFormatFixturesPass: false,
    subscores: subscores.map((s) => ({
      code: s.code,
      valueType: s.valueType,
      status: s.status,
      hasWeight: weightSet.has(s.code),
      anchorCount: s.scoringAnchors.length,
      hasApprovedManualRule: false,
      hasMissingDataRule: Boolean(s.missingEvidenceRule),
      gateCodes: s.gateCodes,
      capCodes: s.capCodes,
    })),
    weightGroups,
    resolvableGateCodes: [],
    resolvableCapCodes,
  })

  return {
    methodology: {
      version: m.version,
      name: m.name,
      status: m.status,
      description: m.description,
      methodologyHash: m.methodology_hash,
      independentApprovalRecorded: m.independent_approval_recorded,
      approvedBy: m.approved_by,
      approvedAt: m.approved_at,
      activatedAt: m.activated_at,
      retiredAt: m.retired_at,
    },
    profiles: profilesMapped,
    tracks: tracksMapped,
    criteria: criteriaMapped,
    subscores,
    weightGroups,
    readiness,
  }
}
