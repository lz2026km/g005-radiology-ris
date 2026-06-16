import { api } from '../api/client'
import type { ApiResponse } from '../api/types'

export type EventSeverity = 'near-miss' | 'minor' | 'moderate' | 'severe' | 'catastrophic'
export type EventStatus = 'reported' | 'investigating' | 'resolved' | 'closed'
export type EventCategory =
  | 'medication-error' | 'patient-identification' | 'contrast-reaction'
  | 'radiation-overdose' | 'fall' | 'specimen-error' | 'communication-failure'
  | 'equipment-malfunction' | 'information-loss' | 'other'

export interface AdverseEvent {
  id: string
  eventType: EventCategory
  severity: EventSeverity
  status: EventStatus
  description: string
  patientId?: string
  patientName?: string
  reportedBy: string
  reportedAt: string
  location: string
  contributingFactors: string[]
  actionsTaken: string[]
  rootCauseIds: string[]
  resolvedAt?: string
  resolvedBy?: string
  closedAt?: string
  closedBy?: string
}

export interface AdverseEventTrend {
  period: string
  total: number
  bySeverity: Record<EventSeverity, number>
  byCategory: Record<EventCategory, number>
}

export async function reportAdverseEvent(event: Omit<AdverseEvent, 'id' | 'reportedAt' | 'status'>): Promise<AdverseEvent> {
  const res = await api.post<AdverseEvent>('/safety/adverse-events', {
    ...event,
    reportedAt: new Date().toISOString(),
    status: 'reported',
  })
  return res.data
}

export async function getAdverseEvents(filters?: {
  status?: EventStatus
  severity?: EventSeverity
  category?: EventCategory
}): Promise<AdverseEvent[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.severity) params.set('severity', filters.severity)
  if (filters?.category) params.set('eventType', filters.category)
  const qs = params.toString()
  const res = await api.get<AdverseEvent[]>(`/safety/adverse-events${qs ? '?' + qs : ''}`)
  return res.data
}

export async function getAdverseEventTrend(): Promise<AdverseEventTrend[]> {
  return [
    { period: '2025-01', total: 5, bySeverity: { 'near-miss': 2, minor: 2, moderate: 1, severe: 0, catastrophic: 0 }, byCategory: { 'medication-error': 0, 'patient-identification': 2, 'contrast-reaction': 1, 'radiation-overdose': 0, fall: 1, 'specimen-error': 0, 'communication-failure': 1, 'equipment-malfunction': 0, 'information-loss': 0, other: 0 } },
    { period: '2025-02', total: 3, bySeverity: { 'near-miss': 1, minor: 1, moderate: 1, severe: 0, catastrophic: 0 }, byCategory: { 'medication-error': 0, 'patient-identification': 0, 'contrast-reaction': 1, 'radiation-overdose': 0, fall: 0, 'specimen-error': 1, 'communication-failure': 0, 'equipment-malfunction': 1, 'information-loss': 0, other: 0 } },
    { period: '2025-03', total: 7, bySeverity: { 'near-miss': 3, minor: 2, moderate: 1, severe: 1, catastrophic: 0 }, byCategory: { 'medication-error': 1, 'patient-identification': 1, 'contrast-reaction': 2, 'radiation-overdose': 1, fall: 0, 'specimen-error': 0, 'communication-failure': 1, 'equipment-malfunction': 1, 'information-loss': 0, other: 0 } },
    { period: '2025-04', total: 4, bySeverity: { 'near-miss': 2, minor: 1, moderate: 0, severe: 1, catastrophic: 0 }, byCategory: { 'medication-error': 0, 'patient-identification': 1, 'contrast-reaction': 0, 'radiation-overdose': 0, fall: 1, 'specimen-error': 0, 'communication-failure': 1, 'equipment-malfunction': 1, 'information-loss': 0, other: 0 } },
    { period: '2025-05', total: 6, bySeverity: { 'near-miss': 2, minor: 3, moderate: 0, severe: 1, catastrophic: 0 }, byCategory: { 'medication-error': 0, 'patient-identification': 2, 'contrast-reaction': 1, 'radiation-overdose': 1, fall: 0, 'specimen-error': 0, 'communication-failure': 0, 'equipment-malfunction': 1, 'information-loss': 1, other: 0 } },
  ]
}

export async function resolveAdverseEvent(id: string, resolvedBy: string, actionsTaken: string[]): Promise<AdverseEvent | undefined> {
  const res = await api.put<AdverseEvent>(`/safety/adverse-events/${id}`, {
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    resolvedBy,
    actionsTaken,
  })
  return res.data ?? undefined
}

export function classifyEventSeverity(description: string, factors: string[]): EventSeverity {
  const combined = `${description} ${factors.join(' ')}`.toLowerCase()
  if (combined.includes('死亡') || combined.includes('permanent')) return 'catastrophic'
  if (combined.includes('overdose') || combined.includes('住院') || combined.includes('手术')) return 'severe'
  if (combined.includes('moderate') || combined.includes('反应') || combined.includes('injury')) return 'moderate'
  if (combined.includes('minor') || combined.includes('near')) return 'minor'
  return 'near-miss'
}

export async function linkRootCause(eventId: string, rootCauseId: string): Promise<AdverseEvent | undefined> {
  const evt = await api.get<AdverseEvent>(`/safety/adverse-events/${eventId}`)
  if (!evt.data) return undefined
  const ids = [...new Set([...evt.data.rootCauseIds, rootCauseId])]
  const res = await api.put<AdverseEvent>(`/safety/adverse-events/${eventId}`, { rootCauseIds: ids })
  return res.data ?? undefined
}
