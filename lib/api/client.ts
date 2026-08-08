// Typed API client interface for Bizantine Ratings.
//
// These functions currently resolve against local mock data, but the signatures
// are designed to map directly onto a future REST / Supabase-backed API. Swap the
// implementations here without touching the calling components.

import {
  apiClients,
  assessments,
  evidenceSummary,
  findings,
  monitoringEvents,
  ratingHistory,
  ratings,
  riskObjects,
  scoringCriteria,
} from '@/lib/mock-data'
import type {
  APIClient,
  Assessment,
  EvidenceSummary,
  Finding,
  MonitoringEvent,
  RatingHistoryPoint,
  RatingResult,
  RiskObject,
  ScoringCriterion,
} from '@/types'

// Simulate network latency for realistic loading states.
function resolve<T>(data: T, ms = 0): Promise<T> {
  if (ms === 0) return Promise.resolve(data)
  return new Promise((r) => setTimeout(() => r(data), ms))
}

export async function getRiskObjects(): Promise<RiskObject[]> {
  return resolve(riskObjects)
}

export async function getRiskObjectById(objectId: string): Promise<RiskObject | null> {
  return resolve(riskObjects.find((o) => o.objectId === objectId) ?? null)
}

export async function getLatestRating(objectId: string): Promise<RatingResult | null> {
  return resolve(ratings.find((r) => r.objectId === objectId) ?? null)
}

export async function getRatings(): Promise<RatingResult[]> {
  return resolve(ratings)
}

export async function getRatingHistory(objectId: string): Promise<RatingHistoryPoint[]> {
  return resolve(ratingHistory[objectId] ?? [])
}

export async function getMonitoringEvents(): Promise<MonitoringEvent[]> {
  return resolve(monitoringEvents)
}

export async function getFindings(objectId: string): Promise<Finding[]> {
  return resolve(findings.filter((f) => f.objectId === objectId))
}

export async function getEvidenceSummary(objectId: string): Promise<EvidenceSummary[]> {
  return resolve(evidenceSummary[objectId] ?? [])
}

export async function getAssessments(): Promise<Assessment[]> {
  return resolve(assessments)
}

export async function getAssessmentById(assessmentId: string): Promise<Assessment | null> {
  return resolve(assessments.find((a) => a.assessmentId === assessmentId) ?? null)
}

export async function getScoringCriteria(): Promise<ScoringCriterion[]> {
  return resolve(scoringCriteria)
}

export async function getAPIClients(): Promise<APIClient[]> {
  return resolve(apiClients)
}

// A synchronous joined view used by list/table pages that render server-side.
export function getRatingsWithObjects() {
  return ratings.map((rating) => ({
    rating,
    object: riskObjects.find((o) => o.objectId === rating.objectId)!,
  }))
}
