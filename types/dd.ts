import type { DDRunResult, DDRunStatus } from '@/lib/dd/contracts'

export interface DDRun {
  id: string
  assessment_id: string
  rated_object_id: string
  methodology_version: string
  methodology_hash: string | null
  status: DDRunStatus
  requested_by: string
  started_at: string | null
  completed_at: string | null
  progress_percent: number
  current_stage: string | null
  input_payload: Record<string, unknown>
  output_payload: Partial<DDRunResult> | null
  validation_errors: Array<Record<string, unknown>>
  validation_warnings: Array<Record<string, unknown>>
  error_message: string | null
  engine_version: string
  git_commit_sha: string | null
  execution_mode: 'simulator' | 'external'
  created_at: string
}

export interface DDRunEvent {
  id: number
  dd_run_id: string
  stage: string
  level: 'info' | 'warning' | 'error'
  message: string
  payload: Record<string, unknown> | null
  occurred_at: string
}

export interface AssessmentCalculation {
  id: string
  dd_run_id: string
  assessment_id: string
  auto_public_score: number
  auto_band: string
  final_public_score: number | null
  final_band: string | null
  gates: Array<Record<string, unknown>>
  caps: Array<Record<string, unknown>>
  track_scores: Record<string, number>
  evidence_coverage: number
  confidence: number
  result_hash: string
  is_draft: boolean
  created_at: string
}

export interface RatedObjectRecord {
  id: string
  name: string
  object_class: string
  instrument_profile: string | null
  issuer: string | null
  chains: string[]
}

export interface AssessmentRecord {
  id: string
  rated_object_id: string
  methodology_version: string
  status: string
  analyst: string | null
  completion: number
  published_score: number | null
  published_band: string | null
  rated_objects?: RatedObjectRecord
}
