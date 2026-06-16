// 6.6 Post-Op Follow-up (20 pts)
export type SurgeryType = 'breast-conserving' | 'mastectomy' | 'sentinel-node-biopsy' | 'axillary-dissection' | 'reconstruction'
export type FollowUpModality = 'mammography' | 'ultrasound' | 'mri' | 'clinical-exam' | 'tomosynthesis'
export type PostOpStatus = 'routine' | 'suspicious' | 'recurrence' | 'complication' | 'ncd'
export type ComplicationType = 'seroma' | 'hematoma' | 'infection' | 'fat-necrosis' | 'lymphedema' | 'reconstructive-failure'

export interface PostOpRecord {
  id: string
  patientId: string
  patientName: string
  surgeryType: SurgeryType
  surgeryDate: string
  laterality: 'L' | 'R' | 'B'
  surgeon: string
  hospital: string
  tumorSizeMm: number
  lymphNodesRemoved: number
  lymphNodesPositive: number
  marginsCleared: boolean
  reconstructionType: string
  implantType: string
  complications: ComplicationType[]
}

export interface FollowUpVisit {
  id: string
  patientId: string
  patientName: string
  postOpId: string
  visitNumber: number
  monthsPostOp: number
  modality: FollowUpModality
  date: string
  findings: string
  status: PostOpStatus
  biRadsCategory: string
  recommendation: string
  assessedBy: string
  nextVisitMonths: number
}

export interface FollowUpTimeline {
  postOp: PostOpRecord
  visits: FollowUpVisit[]
  totalVisits: number
  longestFollowUpMonths: number
  isRecurrenceDetected: boolean
  recurrenceDate?: string
}

export function createPostOpRecord(patientId: string, surgeryType: SurgeryType, surgeryDate: string): PostOpRecord {
  return {
    id: `POSTOP-${Date.now()}`,
    patientId,
    patientName: '',
    surgeryType,
    surgeryDate,
    laterality: 'L',
    surgeon: '',
    hospital: '',
    tumorSizeMm: 0,
    lymphNodesRemoved: 0,
    lymphNodesPositive: 0,
    marginsCleared: true,
    reconstructionType: '',
    implantType: '',
    complications: [],
  }
}

export function scheduleFollowUpVisit(postOp: PostOpRecord, visitNumber: number, monthsPostOp: number): FollowUpVisit {
  const date = new Date(postOp.surgeryDate)
  date.setMonth(date.getMonth() + monthsPostOp)
  const modality: FollowUpModality = monthsPostOp <= 12 ? 'mammography' : monthsPostOp <= 36 ? 'ultrasound' : 'mri'

  return {
    id: `FU-${Date.now()}-${visitNumber}`,
    patientId: postOp.patientId,
    patientName: postOp.patientName,
    postOpId: postOp.id,
    visitNumber,
    monthsPostOp,
    modality,
    date: date.toISOString().slice(0, 10),
    findings: '',
    status: 'routine',
    biRadsCategory: 'BI-RADS 1',
    recommendation: 'Continue routine follow-up',
    assessedBy: '',
    nextVisitMonths: 6,
  }
}

export function getRecommendedSchedule(monthsPostOp: number): { interval: number; modality: FollowUpModality } {
  if (monthsPostOp <= 12) return { interval: 6, modality: 'mammography' }
  if (monthsPostOp <= 36) return { interval: 12, modality: 'mammography' }
  if (monthsPostOp <= 60) return { interval: 12, modality: 'ultrasound' }
  return { interval: 24, modality: 'mri' }
}

export function assessPostOpVisit(visit: FollowUpVisit, priorFindings: string[]): PostOpStatus {
  if (visit.biRadsCategory.includes('5') || visit.biRadsCategory.includes('6')) return 'recurrence'
  if (visit.biRadsCategory.includes('4')) return 'suspicious'
  const complications = ['seroma', 'hematoma', 'infection'].some(c => visit.findings.toLowerCase().includes(c))
  if (complications) return 'complication'
  return 'routine'
}

export function buildFollowUpTimeline(postOp: PostOpRecord, visits: FollowUpVisit[]): FollowUpTimeline {
  const sorted = [...visits].sort((a, b) => a.monthsPostOp - b.monthsPostOp)
  const recurrence = sorted.find(v => v.status === 'recurrence')
  return {
    postOp,
    visits: sorted,
    totalVisits: sorted.length,
    longestFollowUpMonths: sorted.length > 0 ? sorted[sorted.length - 1].monthsPostOp : 0,
    isRecurrenceDetected: !!recurrence,
    recurrenceDate: recurrence?.date,
  }
}

export function calculateSurvivalMetrics(timelines: FollowUpTimeline[]): { recurrenceRate: number; medianFupMonths: number; fiveYearSurvival: number } {
  const total = timelines.length
  if (total === 0) return { recurrenceRate: 0, medianFupMonths: 0, fiveYearSurvival: 0 }
  const recurrences = timelines.filter(t => t.isRecurrenceDetected).length
  const fupMonths = timelines.map(t => t.longestFollowUpMonths).sort((a, b) => a - b)
  const median = fupMonths.length > 0 ? fupMonths[Math.floor(fupMonths.length / 2)] : 0
  const fiveYear = timelines.filter(t => t.longestFollowUpMonths >= 60 && !t.isRecurrenceDetected).length
  return {
    recurrenceRate: Math.round((recurrences / total) * 100),
    medianFupMonths: median,
    fiveYearSurvival: total > 0 ? Math.round((fiveYear / total) * 100) : 0,
  }
}
