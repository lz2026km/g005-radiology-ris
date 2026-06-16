export interface CrossOrgShareRequest {
  id: string
  patientId: string
  patientName: string
  sourceInstitutionId: string
  targetInstitutionId: string
  studyInstanceUid: string
  seriesInstanceUid: string
  sopInstanceUids: string[]
  modality: string
  studyDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  completedAt?: string
}

export interface CrossOrgAccessLog {
  id: string
  requestId: string
  institutionId: string
  userId: string
  accessedAt: string
  action: 'view' | 'download' | 'query'
  resourceType: 'study' | 'series' | 'instance'
  resourceUid: string
}

const requests: CrossOrgShareRequest[] = []
const accessLogs: CrossOrgAccessLog[] = []

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createCrossOrgShareRequest(patientId: string, patientName: string, sourceInstId: string, targetInstId: string, studyUid: string, modality: string, studyDate: string, reason: string, requestedBy: string): CrossOrgShareRequest {
  const req: CrossOrgShareRequest = {
    id: generateId(), patientId, patientName, sourceInstitutionId: sourceInstId,
    targetInstitutionId: targetInstId, studyInstanceUid: studyUid,
    seriesInstanceUid: '', sopInstanceUids: [], modality, studyDate,
    reason, status: 'pending', requestedBy, requestedAt: new Date().toISOString(),
  }
  requests.push(req)
  return req
}

export function approveShareRequest(requestId: string, approvedBy: string): boolean {
  const req = requests.find(r => r.id === requestId)
  if (!req || req.status !== 'pending') return false
  req.status = 'approved'
  req.approvedBy = approvedBy
  req.approvedAt = new Date().toISOString()
  return true
}

export function rejectShareRequest(requestId: string, approvedBy: string): boolean {
  const req = requests.find(r => r.id === requestId)
  if (!req) return false
  req.status = 'rejected'
  req.approvedBy = approvedBy
  return true
}

export function completeShareRequest(requestId: string): boolean {
  const req = requests.find(r => r.id === requestId)
  if (!req) return false
  req.status = 'completed'
  req.completedAt = new Date().toISOString()
  return true
}

export function listShareRequests(status?: CrossOrgShareRequest['status']): CrossOrgShareRequest[] {
  return status ? requests.filter(r => r.status === status) : [...requests]
}

export function logCrossOrgAccess(requestId: string, institutionId: string, userId: string, action: CrossOrgAccessLog['action'], resourceType: CrossOrgAccessLog['resourceType'], resourceUid: string): CrossOrgAccessLog {
  const log: CrossOrgAccessLog = {
    id: generateId(), requestId, institutionId, userId,
    accessedAt: new Date().toISOString(), action, resourceType, resourceUid,
  }
  accessLogs.push(log)
  return log
}

export function getCrossOrgAccessLogs(requestId?: string): CrossOrgAccessLog[] {
  return requestId ? accessLogs.filter(l => l.requestId === requestId) : [...accessLogs]
}
