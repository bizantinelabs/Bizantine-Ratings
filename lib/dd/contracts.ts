import { z } from 'zod'

export const DD_RUN_STATUSES = [
  'queued',
  'running',
  'needs_review',
  'completed',
  'failed',
  'canceled',
] as const

export const DD_STAGES = [
  'scope_validation',
  'evidence_collection',
  'evidence_normalization',
  'mechanism_activation',
  'subscore_calculation',
  'gate_evaluation',
  'cap_evaluation',
  'report_generation',
  'final_validation',
] as const

export const ValidationIssueSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  path: z.string().optional(),
  severity: z.enum(['error', 'warning']),
})

export const EvidenceItemSchema = z.object({
  fact_key: z.string().min(1),
  category: z.string().min(1),
  source: z.string().min(1),
  source_type: z.string().min(1),
  value: z.unknown(),
  confidence: z.number().min(0).max(100),
})

export const SubscoreResultSchema = z.object({
  track: z.string().min(1),
  criterion_code: z.string().min(1),
  criterion_label: z.string().min(1),
  weight: z.number().min(0).max(1),
  auto_score: z.number().min(0).max(100),
  evidence_refs: z.array(z.string()).default([]),
})

export const FindingSchema = z.object({
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  title: z.string().min(1),
  detail: z.string().optional(),
  track: z.string().optional(),
})

export const GateOrCapSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  status: z.enum(['passed', 'triggered', 'not_applicable']),
  detail: z.string().optional(),
})

export const RatingCalculationSchema = z.object({
  public_score: z.number().min(0).max(100),
  band: z.string().min(1),
  track_scores: z.record(z.string(), z.number().min(0).max(100)),
  evidence_coverage: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  gates: z.array(GateOrCapSchema),
  caps: z.array(GateOrCapSchema),
  result_hash: z.string().min(8),
})

export const DDRunResultSchema = z.object({
  run_id: z.string().uuid(),
  methodology_version: z.string().min(1),
  methodology_hash: z.string().min(8),
  engine_version: z.string().min(1),
  git_commit_sha: z.string().nullable().optional(),
  active_mechanisms: z.array(z.string()),
  missing_facts: z.array(z.string()),
  evidence_items: z.array(EvidenceItemSchema),
  subscore_results: z.array(SubscoreResultSchema),
  findings: z.array(FindingSchema),
  rating_calculation: RatingCalculationSchema,
  validation: z.object({
    errors: z.array(ValidationIssueSchema),
    warnings: z.array(ValidationIssueSchema),
  }),
  report: z.string(),
})

export const StartDDRunSchema = z.object({
  assessmentId: z.string().min(1),
  ratedObjectId: z.string().min(1),
  objectClass: z.string().min(1),
  instrumentProfile: z.string().min(1),
  chains: z.array(z.string().min(1)).min(1),
  contractAddresses: z.array(z.string()).default([]),
  targetDeploymentSize: z.number().nonnegative(),
  methodologyVersion: z.string().min(1),
  dataCutoff: z.string().datetime(),
  adapters: z.array(z.string()).min(1),
  uploadedDocuments: z.array(z.string()).default([]),
  analystNotes: z.string().max(5000).default(''),
})

export const EngineAcceptedResponseSchema = z.object({
  run_id: z.string().uuid(),
  status: z.enum(['queued', 'running', 'accepted']).optional(),
})

export type DDRunStatus = (typeof DD_RUN_STATUSES)[number]
export type DDStage = (typeof DD_STAGES)[number]
export type StartDDRunInput = z.infer<typeof StartDDRunSchema>
export type DDRunResult = z.infer<typeof DDRunResultSchema>
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>
