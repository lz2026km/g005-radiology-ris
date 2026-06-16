export interface SharingInstitution {
  id: string
  name: string
  code: string
  region: string
  level: '三甲' | '三乙' | '二甲' | '二乙' | '一级' | '社区'
  type: '综合' | '专科' | '中医' | '妇幼'
  contactPerson: string
  contactPhone: string
  apiEndpoint: string
  enabled: boolean
  joinedAt: string
  capabilities: string[]
}

export interface SharingRecord {
  id: string
  patientId: string
  patientName: string
  sourceInstitutionId: string
  targetInstitutionId: string
  studyInstanceUid: string
  modality: string
  studyDate: string
  sharedAt: string
  expiresAt: string
  status: 'active' | 'expired' | 'revoked'
  accessedCount: number
}

export interface SharingAuditEntry {
  id: string
  action: 'share' | 'access' | 'revoke' | 'query'
  institutionId: string
  userId: string
  patientId: string
  timestamp: string
  details: string
}

const MOCK_INSTITUTIONS: SharingInstitution[] = [
  { id: 'I001', name: '中山大学附属第一医院', code: 'ZS001', region: '广州市越秀区', level: '三甲', type: '综合', contactPerson: '张主任', contactPhone: '020-87755777', apiEndpoint: 'https://hie.zs-hospital.com/api', enabled: true, joinedAt: '2025-01-15', capabilities: ['CT', 'MR', 'X光', '超声'] },
  { id: 'I002', name: '广东省人民医院', code: 'GD002', region: '广州市越秀区', level: '三甲', type: '综合', contactPerson: '李科长', contactPhone: '020-83827812', apiEndpoint: 'https://hie.gd-hospital.com/api', enabled: true, joinedAt: '2025-02-01', capabilities: ['CT', 'MR', 'PET-CT'] },
  { id: 'I003', name: '广州市第一人民医院', code: 'GZ003', region: '广州市越秀区', level: '三甲', type: '综合', contactPerson: '王主任', contactPhone: '020-81048888', apiEndpoint: 'https://hie.gz-hospital.com/api', enabled: false, joinedAt: '2025-03-01', capabilities: ['CT', 'MR', 'X光'] },
]

const sharingRecords: SharingRecord[] = []
const auditLog: SharingAuditEntry[] = []

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getSharingInstitutions(): SharingInstitution[] {
  return MOCK_INSTITUTIONS
}

export function getEnabledInstitutions(): SharingInstitution[] {
  return MOCK_INSTITUTIONS.filter(i => i.enabled)
}

export function getInstitutionById(id: string): SharingInstitution | undefined {
  return MOCK_INSTITUTIONS.find(i => i.id === id)
}

export function toggleInstitution(id: string): boolean {
  const inst = MOCK_INSTITUTIONS.find(i => i.id === id)
  if (!inst) return false
  inst.enabled = !inst.enabled
  return true
}

export function createSharingRecord(patientId: string, patientName: string, sourceInstId: string, targetInstId: string, studyInstanceUid: string, modality: string, studyDate: string): SharingRecord {
  const record: SharingRecord = {
    id: generateId(), patientId, patientName, sourceInstitutionId: sourceInstId,
    targetInstitutionId: targetInstId, studyInstanceUid, modality, studyDate,
    sharedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: 'active', accessedCount: 0,
  }
  sharingRecords.push(record)
  auditLog.push({ id: generateId(), action: 'share', institutionId: sourceInstId, userId: 'system', patientId, timestamp: new Date().toISOString(), details: `Shared ${modality} study ${studyInstanceUid} with ${targetInstId}` })
  return record
}

export function revokeSharingRecord(recordId: string): boolean {
  const record = sharingRecords.find(r => r.id === recordId)
  if (!record) return false
  record.status = 'revoked'
  auditLog.push({ id: generateId(), action: 'revoke', institutionId: record.sourceInstitutionId, userId: 'system', patientId: record.patientId, timestamp: new Date().toISOString(), details: `Revoked sharing of ${record.studyInstanceUid}` })
  return true
}

export function listSharingRecords(patientId?: string): SharingRecord[] {
  return patientId ? sharingRecords.filter(r => r.patientId === patientId) : [...sharingRecords]
}

export function getSharingStats() {
  const active = sharingRecords.filter(r => r.status === 'active')
  return {
    totalShares: sharingRecords.length,
    activeShares: active.length,
    totalAccesses: sharingRecords.reduce((s, r) => s + r.accessedCount, 0),
  }
}

export function getSharingAuditLog(): SharingAuditEntry[] {
  return [...auditLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function registerInstitution(data: Omit<SharingInstitution, 'id' | 'joinedAt'>): SharingInstitution {
  const inst: SharingInstitution = { ...data, id: generateId(), joinedAt: new Date().toISOString() }
  MOCK_INSTITUTIONS.push(inst)
  return inst
}
