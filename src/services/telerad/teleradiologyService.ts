export interface TeleradProvider {
  id: string
  name: string
  title: string
  institution: string
  specialties: string[]
  status: 'online' | 'offline' | 'busy'
  maxConcurrent: number
  currentLoad: number
  rating: number
  slaHours: number
}

export interface TeleradAssignment {
  id: string
  studyInstanceUid: string
  patientId: string
  patientName: string
  modality: string
  studyDate: string
  institutionId: string
  institutionName: string
  providerId: string
  providerName: string
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  assignedAt: string
  acceptedAt?: string
  completedAt?: string
  priority: 'routine' | 'urgent' | 'stat'
  reportId?: string
}

export interface TeleradReport {
  id: string
  assignmentId: string
  findings: string
  impression: string
  recommendation?: string
  createdBy: string
  createdAt: string
  signedBy?: string
  signedAt?: string
  status: 'draft' | 'signed' | 'amended'
}

export interface TeleradSlaMetric {
  providerId: string
  providerName: string
  totalAssignments: number
  avgResponseTimeHours: number
  avgReportTimeHours: number
  slaComplianceRate: number
  period: string
}

const MOCK_PROVIDERS: TeleradProvider[] = [
  { id: 'TP001', name: '张明远', title: '主任医师', institution: '第三方影像中心', specialties: ['神经影像', '胸部影像'], status: 'online', maxConcurrent: 5, currentLoad: 2, rating: 4.8, slaHours: 2 },
  { id: 'TP002', name: '李华', title: '副主任医师', institution: '第三方影像中心', specialties: ['腹部影像', '肌骨影像'], status: 'online', maxConcurrent: 4, currentLoad: 3, rating: 4.6, slaHours: 4 },
  { id: 'TP003', name: '王芳', title: '主治医师', institution: '合作医院放射科', specialties: ['胸部影像', '乳腺影像'], status: 'busy', maxConcurrent: 3, currentLoad: 3, rating: 4.5, slaHours: 6 },
  { id: 'TP004', name: '陈建国', title: '主任医师', institution: '区域影像诊断中心', specialties: ['心血管影像', '介入影像'], status: 'offline', maxConcurrent: 6, currentLoad: 0, rating: 4.9, slaHours: 2 },
]

const assignments: TeleradAssignment[] = []

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getTeleradProviders(): TeleradProvider[] {
  return MOCK_PROVIDERS
}

export function getAvailableProviders(): TeleradProvider[] {
  return MOCK_PROVIDERS.filter(p => p.status === 'online' && p.currentLoad < p.maxConcurrent)
}

export function assignTeleradStudy(studyInstanceUid: string, patientId: string, patientName: string, modality: string, studyDate: string, institutionId: string, institutionName: string, providerId: string, priority: TeleradAssignment['priority']): TeleradAssignment {
  const provider = MOCK_PROVIDERS.find(p => p.id === providerId)
  const assignment: TeleradAssignment = {
    id: generateId(), studyInstanceUid, patientId, patientName, modality,
    studyDate, institutionId, institutionName, providerId,
    providerName: provider?.name || 'Unknown',
    status: 'assigned', assignedAt: new Date().toISOString(), priority,
  }
  assignments.push(assignment)
  if (provider) provider.currentLoad++
  return assignment
}

export function acceptAssignment(assignmentId: string): boolean {
  const a = assignments.find(x => x.id === assignmentId)
  if (!a || a.status !== 'assigned') return false
  a.status = 'accepted'
  a.acceptedAt = new Date().toISOString()
  return true
}

export function completeAssignment(assignmentId: string): TeleradReport {
  const a = assignments.find(x => x.id === assignmentId)
  const report: TeleradReport = {
    id: generateId(), assignmentId,
    findings: '待补充影像所见...',
    impression: '待补充诊断意见...',
    createdBy: a?.providerName || 'system',
    createdAt: new Date().toISOString(),
    status: 'draft',
  }
  if (a) {
    a.status = 'completed'
    a.completedAt = new Date().toISOString()
    a.reportId = report.id
    const provider = MOCK_PROVIDERS.find(p => p.id === a.providerId)
    if (provider) provider.currentLoad = Math.max(0, provider.currentLoad - 1)
  }
  return report
}

export function signTeleradReport(reportId: string, signedBy: string): boolean {
  const a = assignments.find(x => x.reportId === reportId)
  if (!a) return false
  a.status = 'completed'
  return true
}

export function listAssignments(status?: TeleradAssignment['status']): TeleradAssignment[] {
  return status ? assignments.filter(a => a.status === status) : [...assignments]
}

export function getProviderAssignments(providerId: string): TeleradAssignment[] {
  return assignments.filter(a => a.providerId === providerId)
}

export function getTeleradSlaMetrics(): TeleradSlaMetric[] {
  return MOCK_PROVIDERS.map(p => ({
    providerId: p.id, providerName: p.name,
    totalAssignments: assignments.filter(a => a.providerId === p.id).length,
    avgResponseTimeHours: Math.round(Math.random() * 3 + 0.5),
    avgReportTimeHours: Math.round(Math.random() * 4 + 1),
    slaComplianceRate: Math.round(Math.random() * 20 + 80),
    period: '2026-05',
  }))
}

export function getTeleradStats() {
  return {
    totalAssignments: assignments.length,
    pendingAssignments: assignments.filter(a => a.status === 'assigned').length,
    inProgress: assignments.filter(a => a.status === 'accepted' || a.status === 'in_progress').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    avgReportTime: '2.5h',
    slaRate: '94.2%',
  }
}
