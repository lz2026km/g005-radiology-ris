export type ConsentStatus = 'granted' | 'denied' | 'withdrawn' | 'expired'
export type DataSubjectRightType = 'access' | 'rectify' | 'delete' | 'port' | 'restrict' | 'object'

export interface PIPLConsent {
  id: string
  subjectId: string
  subjectName: string
  purpose: string
  scope: string[]
  status: ConsentStatus
  grantedAt: string
  expiresAt: string
  withdrawnAt?: string
  consentMethod: 'electronic' | 'written' | 'oral'
  version: string
}

export interface DataSubjectRequest {
  id: string
  subjectId: string
  subjectName: string
  rightType: DataSubjectRightType
  details: string
  status: 'pending' | 'processing' | 'fulfilled' | 'rejected'
  submittedAt: string
  fulfilledAt?: string
  responseNotes?: string
}

export interface PIIField {
  tableName: string
  columnName: string
  dataType: string
  sensitivity: 'high' | 'medium' | 'low'
  category: 'identity' | 'contact' | 'medical' | 'financial' | 'biometric'
  encrypted: boolean
  masked: boolean
  retentionDays: number
}

const consents: PIPLConsent[] = []
const requests: DataSubjectRequest[] = []

export function recordConsent(consent: Omit<PIPLConsent, 'id'>): PIPLConsent {
  const record: PIPLConsent = { id: crypto.randomUUID(), ...consent }
  consents.push(record)
  return record
}

export function getConsents(subjectId?: string): PIPLConsent[] {
  return subjectId ? consents.filter(c => c.subjectId === subjectId) : [...consents]
}

export function withdrawConsent(id: string): boolean {
  const consent = consents.find(c => c.id === id)
  if (!consent) return false
  consent.status = 'withdrawn'
  consent.withdrawnAt = new Date().toISOString()
  return true
}

export function submitDataSubjectRequest(req: Omit<DataSubjectRequest, 'id' | 'status' | 'submittedAt'>): DataSubjectRequest {
  const record: DataSubjectRequest = { id: crypto.randomUUID(), status: 'pending', submittedAt: new Date().toISOString(), ...req }
  requests.push(record)
  return record
}

export function getDataSubjectRequests(subjectId?: string): DataSubjectRequest[] {
  return subjectId ? requests.filter(r => r.subjectId === subjectId) : [...requests]
}

export function fulfillRequest(id: string, notes?: string): boolean {
  const req = requests.find(r => r.id === id)
  if (!req) return false
  req.status = 'fulfilled'
  req.fulfilledAt = new Date().toISOString()
  req.responseNotes = notes
  return true
}

export const PII_INVENTORY: PIIField[] = [
  { tableName: 'patients', columnName: 'id_card', dataType: 'TEXT', sensitivity: 'high', category: 'identity', encrypted: false, masked: false, retentionDays: 7300 },
  { tableName: 'patients', columnName: 'phone', dataType: 'TEXT', sensitivity: 'high', category: 'contact', encrypted: false, masked: true, retentionDays: 7300 },
  { tableName: 'patients', columnName: 'address', dataType: 'TEXT', sensitivity: 'medium', category: 'contact', encrypted: false, masked: true, retentionDays: 7300 },
  { tableName: 'patients', columnName: 'name', dataType: 'TEXT', sensitivity: 'high', category: 'identity', encrypted: false, masked: false, retentionDays: 7300 },
  { tableName: 'reports', columnName: 'findings', dataType: 'TEXT', sensitivity: 'medium', category: 'medical', encrypted: false, masked: false, retentionDays: 7300 },
]

export function getPiiInventory(): PIIField[] {
  return [...PII_INVENTORY]
}

export function assessPia(): { riskLevel: 'low' | 'medium' | 'high'; recommendations: string[] } {
  return {
    riskLevel: 'medium',
    recommendations: [
      'Encrypt ID card numbers at rest',
      'Implement phone number masking in UI',
      'Add retention enforcement for patient data',
    ],
  }
}

export function getPIPLComplianceStatus(): { consentRate: number; openRequests: number; piiFields: number } {
  return {
    consentRate: consents.length > 0 ? Math.round((consents.filter(c => c.status === 'granted').length / consents.length) * 100) : 0,
    openRequests: requests.filter(r => r.status === 'pending' || r.status === 'processing').length,
    piiFields: PII_INVENTORY.length,
  }
}
