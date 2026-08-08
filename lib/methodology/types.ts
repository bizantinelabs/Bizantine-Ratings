// Methodology governance types for the BL-APB methodology suite.
// NOTE: TypeScript here performs STRUCTURAL validation of methodology config
// only. It never computes ratings — all scoring stays in the Python engine.

export const METHODOLOGY_STATUSES = [
  'draft',
  'implementation_ready',
  'pilot',
  'active',
  'retired',
] as const
export type MethodologyStatus = (typeof METHODOLOGY_STATUSES)[number]

export const SUBSCORE_STATUSES = ['draft', 'pilot', 'active', 'retired'] as const
export type SubscoreStatus = (typeof SUBSCORE_STATUSES)[number]

export const SUBSCORE_VALUE_TYPES = [
  'boolean',
  'ordinal',
  'continuous',
  'categorical',
  'formula',
  'manual',
] as const
export type SubscoreValueType = (typeof SUBSCORE_VALUE_TYPES)[number]

export const EVIDENCE_STATES = ['known', 'unknown', 'inactive'] as const
export type EvidenceState = (typeof EVIDENCE_STATES)[number]

// Five distinct internal tiers. Tier 4 (Restricted) and Tier 5 (Not Approved)
// are intentionally NOT merged.
export const INTERNAL_TIERS = [
  'tier_1_prime',
  'tier_2_approved',
  'tier_3_approved_constraints',
  'tier_4_restricted',
  'tier_5_not_approved',
] as const
export type InternalTier = (typeof INTERNAL_TIERS)[number]

export const TIER_LABELS: Record<InternalTier, string> = {
  tier_1_prime: 'Tier 1 — Prime',
  tier_2_approved: 'Tier 2 — Approved',
  tier_3_approved_constraints: 'Tier 3 — Approved with Constraints',
  tier_4_restricted: 'Tier 4 — Restricted',
  tier_5_not_approved: 'Tier 5 — Not Approved',
}

export const TIER_DESCRIPTIONS: Record<InternalTier, string> = {
  tier_1_prime: 'Highest confidence; approved for the evaluated action.',
  tier_2_approved: 'Approved for the evaluated action.',
  tier_3_approved_constraints: 'Approved subject to explicit constraints.',
  tier_4_restricted:
    'May be retained for restricted, speculative, monitoring-only, non-allocation, or tightly bounded use, subject to methodology and governance decision.',
  tier_5_not_approved: 'Not approved for the evaluated action.',
}

// A machine-readable rule expression. Leaf compares a fact; groups combine.
export type RuleLeaf = {
  fact: string
  operator:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'greater_than_or_equal'
    | 'less_than'
    | 'less_than_or_equal'
    | 'in'
    | 'not_in'
  value: unknown
}
export type RuleGroup = { all: RuleDefinition[] } | { any: RuleDefinition[] }
export type RuleAlways = { always: boolean }
export type RuleApplies = { applies_when: RuleDefinition | RuleAlways }
export type RuleDefinition = RuleLeaf | RuleGroup | RuleAlways | RuleApplies

export type ScoringAnchor = {
  anchorId: string
  subscoreCode: string
  label: string
  description: string | null
  score: number
  condition: RuleDefinition
  requiredEvidence?: string[]
  minimumConfidence?: number | null
  precedence: number
}

export type MissingEvidenceRule = {
  reducesCoverage: boolean
  reducesConfidence: boolean
  activatesCapCode: string | null
  excludedFromAggregation: boolean
  rule: Record<string, unknown>
}

export type ConfidenceRule = Record<string, unknown>

export type AtomicSubscoreDefinition = {
  code: string
  methodologyVersion: string
  trackCode: string
  criterionCode: string
  mechanismCode: string
  title: string
  description: string | null
  valueType: SubscoreValueType
  minimumScore: number
  maximumScore: number
  weight: number
  applicabilityRule: RuleDefinition | null
  scoringAnchors: ScoringAnchor[]
  missingEvidenceRule: MissingEvidenceRule | null
  confidenceRule: ConfidenceRule | null
  requiredFactKeys: string[]
  optionalFactKeys: string[]
  gateCodes: string[]
  capCodes: string[]
  effectiveFrom: string
  effectiveTo?: string | null
  status: SubscoreStatus
}

export type Methodology = {
  version: string
  name: string
  status: MethodologyStatus
  description: string | null
  methodologyHash: string | null
  independentApprovalRecorded: boolean
  approvedBy: string | null
  approvedAt: string | null
  activatedAt: string | null
  retiredAt: string | null
}
