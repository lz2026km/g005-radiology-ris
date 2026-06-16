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

const MOCK_EVENTS: AdverseEvent[] = [
  {
    id: 'AE-2025-001',
    eventType: 'contrast-reaction',
    severity: 'moderate',
    status: 'resolved',
    description: '患者CT增强扫描后出现荨麻疹及轻度呼吸困难',
    patientId: 'P2025001',
    patientName: '李明',
    reportedBy: '张护士',
    reportedAt: '2025-06-01 09:30',
    location: 'CT-2室',
    contributingFactors: ['患者过敏史未详细询问', '对比剂预热时间不足'],
    actionsTaken: ['立即停止注射', '给予抗组胺药物', '吸氧观察'],
    rootCauseIds: ['RCA-2025-001'],
    resolvedAt: '2025-06-01 11:00',
    resolvedBy: '王医师',
    closedAt: '2025-06-02 09:00',
    closedBy: '李主任',
  },
  {
    id: 'AE-2025-002',
    eventType: 'patient-identification',
    severity: 'minor',
    status: 'closed',
    description: '两名同名患者检查项目调换，已及时发现纠正',
    patientId: 'P2025002',
    patientName: '王芳',
    reportedBy: '刘技师',
    reportedAt: '2025-06-03 14:20',
    location: 'MR-1室',
    contributingFactors: ['患者姓名相同', '未核对病历号', '工作高峰期'],
    actionsTaken: ['立即更正检查项目', '重新核对患者信息', '双人确认流程'],
    rootCauseIds: ['RCA-2025-002'],
    resolvedAt: '2025-06-03 14:45',
    resolvedBy: '刘技师',
    closedAt: '2025-06-04 10:00',
    closedBy: '赵主任',
  },
  {
    id: 'AE-2025-003',
    eventType: 'radiation-overdose',
    severity: 'severe',
    status: 'investigating',
    description: 'CT腹部扫描剂量参数设置错误，DLP超出正常值3倍',
    patientId: 'P2025003',
    patientName: '张强',
    reportedBy: '陈技师',
    reportedAt: '2025-06-05 11:10',
    location: 'CT-1室',
    contributingFactors: ['设备参数模板加载错误', '技师未逐项确认扫描参数', '设备剂量报警未触发'],
    actionsTaken: ['停止后续扫描', '记录实际剂量', '上报设备科检查设备'],
    rootCauseIds: [],
  },
]

export function reportAdverseEvent(event: Omit<AdverseEvent, 'id' | 'reportedAt' | 'status'>): AdverseEvent {
  const newEvent: AdverseEvent = {
    ...event,
    id: `AE-2025-${String(MOCK_EVENTS.length + 1).padStart(3, '0')}`,
    status: 'reported',
    reportedAt: new Date().toISOString(),
  }
  MOCK_EVENTS.unshift(newEvent)
  return newEvent
}

export function getAdverseEvents(filters?: {
  status?: EventStatus
  severity?: EventSeverity
  category?: EventCategory
}): AdverseEvent[] {
  let result = [...MOCK_EVENTS]
  if (filters?.status) result = result.filter(e => e.status === filters.status)
  if (filters?.severity) result = result.filter(e => e.severity === filters.severity)
  if (filters?.category) result = result.filter(e => e.eventType === filters.category)
  return result.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
}

export function getAdverseEventTrend(): AdverseEventTrend[] {
  return [
    { period: '2025-01', total: 5, bySeverity: { 'near-miss': 2, minor: 2, moderate: 1, severe: 0, catastrophic: 0 }, byCategory: { 'medication-error': 0, 'patient-identification': 2, 'contrast-reaction': 1, 'radiation-overdose': 0, fall: 1, 'specimen-error': 0, 'communication-failure': 1, 'equipment-malfunction': 0, 'information-loss': 0, other: 0 } },
    { period: '2025-02', total: 3, bySeverity: { 'near-miss': 1, minor: 1, moderate: 1, severe: 0, catastrophic: 0 }, byCategory: { 'medication-error': 0, 'patient-identification': 0, 'contrast-reaction': 1, 'radiation-overdose': 0, fall: 0, 'specimen-error': 1, 'communication-failure': 0, 'equipment-malfunction': 1, 'information-loss': 0, other: 0 } },
    { period: '2025-03', total: 7, bySeverity: { 'near-miss': 3, minor: 2, moderate: 1, severe: 1, catastrophic: 0 }, byCategory: { 'medication-error': 1, 'patient-identification': 1, 'contrast-reaction': 2, 'radiation-overdose': 1, fall: 0, 'specimen-error': 0, 'communication-failure': 1, 'equipment-malfunction': 1, 'information-loss': 0, other: 0 } },
    { period: '2025-04', total: 4, bySeverity: { 'near-miss': 2, minor: 1, moderate: 0, severe: 1, catastrophic: 0 }, byCategory: { 'medication-error': 0, 'patient-identification': 1, 'contrast-reaction': 0, 'radiation-overdose': 0, fall: 1, 'specimen-error': 0, 'communication-failure': 1, 'equipment-malfunction': 1, 'information-loss': 0, other: 0 } },
    { period: '2025-05', total: 6, bySeverity: { 'near-miss': 2, minor: 3, moderate: 0, severe: 1, catastrophic: 0 }, byCategory: { 'medication-error': 0, 'patient-identification': 2, 'contrast-reaction': 1, 'radiation-overdose': 1, fall: 0, 'specimen-error': 0, 'communication-failure': 0, 'equipment-malfunction': 1, 'information-loss': 1, other: 0 } },
  ]
}

export function resolveAdverseEvent(id: string, resolvedBy: string, actionsTaken: string[]): AdverseEvent | undefined {
  const event = MOCK_EVENTS.find(e => e.id === id)
  if (!event) return undefined
  event.status = 'resolved'
  event.resolvedAt = new Date().toISOString()
  event.resolvedBy = resolvedBy
  event.actionsTaken = [...event.actionsTaken, ...actionsTaken]
  return event
}

export function classifyEventSeverity(description: string, factors: string[]): EventSeverity {
  const combined = `${description} ${factors.join(' ')}`.toLowerCase()
  if (combined.includes('死亡') || combined.includes('permanent')) return 'catastrophic'
  if (combined.includes('overdose') || combined.includes('住院') || combined.includes('手术')) return 'severe'
  if (combined.includes('moderate') || combined.includes('反应') || combined.includes('injury')) return 'moderate'
  if (combined.includes('minor') || combined.includes('near')) return 'minor'
  return 'near-miss'
}

export function linkRootCause(eventId: string, rootCauseId: string): AdverseEvent | undefined {
  const event = MOCK_EVENTS.find(e => e.id === eventId)
  if (!event || event.rootCauseIds.includes(rootCauseId)) return undefined
  event.rootCauseIds.push(rootCauseId)
  return event
}
