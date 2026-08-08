// Core domain types for Bizantine Ratings.
// Structured to be compatible with a future REST/Supabase API layer.

export type ObjectClass =
  | 'Asset'
  | 'Protocol'
  | 'Pool/Vault/Market'
  | 'Chain'
  | 'Organization'
  | 'Opportunity'

export type MonitoringStatus = 'Stable' | 'Under Review' | 'Critical'

export type Decision =
  | 'Approved'
  | 'Approved with Constraints'
  | 'Not Approved'

export type Outlook = 'Positive' | 'Stable' | 'Negative' | 'Under Review'

export type RatingBand = 'A' | 'B' | 'C' | 'D' | 'Not Approved'

export interface RiskObject {
  id: string
  objectId: string
  canonicalName: string
  objectClass: ObjectClass
  publicCategory: string
  chains: string[]
  contractAddress?: string
  monitoringStatus: MonitoringStatus
}

export interface TrackScores {
  general: number
  asset: number
  protocolOpportunity: number
  blockchain: number
}

export interface RatingResult {
  id: string
  ratingId: string
  objectId: string
  methodologyVersion: string
  publicScore: number
  publicRating: string
  ratingBand: RatingBand
  decision: Decision
  confidence: number
  evidenceCoverage: number
  outlook: Outlook
  trackScores: TrackScores
  activeGates: string[]
  activeCaps: string[]
  publishedAt: string
  dataCutoffAt: string
}

export interface RatingHistoryPoint {
  date: string
  score: number
  rating: string
  event?: string
}

export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational'
export type FindingStatus = 'Open' | 'Mitigated' | 'Resolved' | 'Accepted'

export interface Finding {
  id: string
  objectId: string
  severity: FindingSeverity
  title: string
  status: FindingStatus
  detectedAt: string
  updatedAt: string
}

export type EvidenceCategory =
  | 'Onchain'
  | 'Documentation'
  | 'Audit'
  | 'Monitoring'
  | 'Legal / organizational'

export interface EvidenceSummary {
  category: EvidenceCategory
  count: number
  licensed?: boolean
}

export type MonitoringEventType =
  | 'Contract upgrade'
  | 'Admin-role change'
  | 'Oracle configuration change'
  | 'Liquidity decline'
  | 'Exploit or incident'
  | 'Withdrawal disruption'
  | 'Rating under review'
  | 'Rating superseded'

export type EventSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'

export interface MonitoringEvent {
  id: string
  objectId: string
  objectName: string
  type: MonitoringEventType
  severity: EventSeverity
  chain: string
  description: string
  detectedAt: string
}

export type AssessmentStatus =
  | 'Draft'
  | 'In Review'
  | 'Returned'
  | 'Approved'
  | 'Published'
  | 'Rejected'

export interface Assessment {
  id: string
  assessmentId: string
  objectId: string
  objectName: string
  objectClass: ObjectClass
  methodologyVersion: string
  status: AssessmentStatus
  leadAnalyst: string
  completion: number
  evidenceCoverage: number
  confidence: number
  deadline?: string
  lastModified: string
}

export type CriterionTrack =
  | 'General'
  | 'Asset'
  | 'Protocol'
  | 'Blockchain'

export interface ScoringCriterion {
  id: string
  track: CriterionTrack
  title: string
  mechanism: string
  weight: number
  applicable: boolean
  normalizedScore: number
  blApbScore: number
  confidence: number
  linkedEvidence: number
  rationale: string
  manualOverride: boolean
  overrideJustification?: string
  qualityFlags: string[]
  guidance: string
  methodologyExcerpt: string
}

// Commercial API domain
export type APIPlan = 'Public' | 'Developer' | 'Professional' | 'Enterprise'
export type ClientStatus = 'Active' | 'Trialing' | 'Past Due' | 'Suspended'

export interface APIClient {
  id: string
  organization: string
  plan: APIPlan
  status: ClientStatus
  scopes: string[]
  monthlyUsage: number
  rateLimit: string
  redistributionRights: boolean
  renewalDate: string
}
