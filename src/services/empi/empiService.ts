export type IdentityDomain = 'mrn' | 'nid' | 'passport' | 'insurance' | 'drivers_license' | 'empi'

export interface PatientIdentity {
  id: string
  patientId: string
  domain: IdentityDomain
  identifier: string
  assigningAuthority: string
  institutionId: string
  institutionName: string
  status: 'active' | 'inactive' | 'merged'
  verifiedAt?: string
}

export interface EmpiPatient {
  empiId: string
  identities: PatientIdentity[]
  name: string
  givenName?: string
  familyName?: string
  dateOfBirth?: string
  gender?: 'M' | 'F' | 'O'
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface EmpiMatchResult {
  primaryPatient: EmpiPatient
  candidates: Array<{ patient: EmpiPatient; score: number; matchedFields: string[] }>
  confidence: 'high' | 'medium' | 'low'
}

export interface EmpiMergeRequest {
  id: string
  targetEmpiId: string
  sourceEmpiId: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  requestedBy: string
  requestedAt: string
  resolvedBy?: string
  resolvedAt?: string
}

const empiStore: Map<string, EmpiPatient> = new Map()
const mergeRequests: EmpiMergeRequest[] = []

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function generateEmpiId(): string {
  return `EMPI-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export function registerPatientIdentity(patientId: string, domain: IdentityDomain, identifier: string, assigningAuthority: string, institutionId: string, institutionName: string): PatientIdentity {
  const identity: PatientIdentity = {
    id: generateId(), patientId, domain, identifier,
    assigningAuthority, institutionId, institutionName,
    status: 'active', verifiedAt: new Date().toISOString(),
  }
  let patient = Array.from(empiStore.values()).find(p => p.identities.some(i => i.patientId === patientId))
  if (!patient) {
    patient = {
      empiId: generateEmpiId(), identities: [identity],
      name: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    empiStore.set(patient.empiId, patient)
  } else {
    patient.identities.push(identity)
    patient.updatedAt = new Date().toISOString()
  }
  return identity
}

export function queryByEmpiId(empiId: string): EmpiPatient | undefined {
  return empiStore.get(empiId)
}

export function queryByDomain(domain: IdentityDomain, identifier: string): EmpiPatient | undefined {
  return Array.from(empiStore.values()).find(p => p.identities.some(i => i.domain === domain && i.identifier === identifier))
}

export function queryByDemographics(name: string, dateOfBirth?: string): EmpiPatient[] {
  return Array.from(empiStore.values()).filter(p => {
    const nameMatch = p.name.toLowerCase().includes(name.toLowerCase())
    const dobMatch = !dateOfBirth || p.dateOfBirth === dateOfBirth
    return nameMatch && dobMatch
  })
}

export function crossReferencePatient(patientId: string): EmpiMatchResult | undefined {
  const patient = Array.from(empiStore.values()).find(p => p.identities.some(i => i.patientId === patientId))
  if (!patient) return undefined
  const candidates = Array.from(empiStore.values())
    .filter(p => p.empiId !== patient.empiId)
    .map(p => ({
      patient: p,
      score: Math.round(Math.random() * 40 + 60),
      matchedFields: ['name'],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
  const confidence: EmpiMatchResult['confidence'] = candidates.length > 0 && candidates[0].score >= 90 ? 'high' : candidates.length > 0 && candidates[0].score >= 75 ? 'medium' : 'low'
  return { primaryPatient: patient, candidates, confidence }
}

export function createMergeRequest(targetEmpiId: string, sourceEmpiId: string, reason: string, requestedBy: string): EmpiMergeRequest {
  const req: EmpiMergeRequest = {
    id: generateId(), targetEmpiId, sourceEmpiId, reason,
    status: 'pending', requestedBy, requestedAt: new Date().toISOString(),
  }
  mergeRequests.push(req)
  return req
}

export function resolveMergeRequest(requestId: string, approved: boolean, resolvedBy: string): boolean {
  const req = mergeRequests.find(r => r.id === requestId)
  if (!req || req.status !== 'pending') return false
  req.status = approved ? 'approved' : 'rejected'
  req.resolvedBy = resolvedBy
  req.resolvedAt = new Date().toISOString()
  if (approved) {
    const target = empiStore.get(req.targetEmpiId)
    const source = empiStore.get(req.sourceEmpiId)
    if (target && source) {
      target.identities.push(...source.identities.map(i => ({ ...i, status: 'merged' as const })))
      target.updatedAt = new Date().toISOString()
      empiStore.delete(req.sourceEmpiId)
    }
  }
  return true
}

export function listMergeRequests(status?: EmpiMergeRequest['status']): EmpiMergeRequest[] {
  return status ? mergeRequests.filter(r => r.status === status) : [...mergeRequests]
}

export function getAllPatients(): EmpiPatient[] {
  return Array.from(empiStore.values())
}

export function getEmpiAuditLog() {
  return mergeRequests.map(r => ({
    id: r.id,
    action: `merge_${r.status}` as const,
    empiId: r.targetEmpiId,
    timestamp: r.resolvedAt || r.requestedAt,
    detail: `${r.reason} (${r.status})`,
  }))
}
