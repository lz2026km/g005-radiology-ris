// 6.4 Breast Cancer Screening (30 pts)
import type { MammoAcquisitionType } from './mammoWorkflow'
import type { BUSBiRadsCategory } from './breastUltrasound'
import type { MRIBiRadsCategory } from './breastMri'

export type ScreeningModality = 'mammography' | 'ultrasound' | 'mri' | 'tomosynthesis'
export type ScreeningInterval = 'annual' | 'biennial' | 'symptom-driven' | 'surveillance'
export type RiskLevel = 'average' | 'intermediate' | 'high' | 'very-high'
export type ScreeningOutcome = 'negative' | 'benign' | 'probably-benign' | 'suspicious' | 'highly-suspicious' | 'known-malignancy'
export type BRCAStatus = 'unknown' | 'negative' | 'brca1' | 'brca2' | 'other-pathogenic'
export type MenstrualStatus = 'premenopausal' | 'perimenopausal' | 'postmenopausal'
export type HormoneReceptor = 'er+' | 'er-' | 'pr+' | 'pr-' | 'her2+' | 'her2-' | 'triple-negative'

export interface ScreeningPatient {
  id: string
  name: string
  age: number
  riskLevel: RiskLevel
  brcaStatus: BRCAStatus
  menstrualStatus: MenstrualStatus
  familyHistory: string[]
  personalHistory: string[]
  priorBiopsies: string[]
  hrtUse: boolean
  ageAtMenarche: number
  ageAtFirstBirth: number
  parity: number
  breastDensity: string
  gailModelRisk?: number
  tyrerCuzickRisk?: number
}

export interface ScreeningSchedule {
  patientId: string
  modality: ScreeningModality
  interval: ScreeningInterval
  startAge: number
  endAge: number
  nextScreeningDate: string
  adherenceReminderDays: number
}

export interface ScreeningSession {
  id: string
  patientId: string
  patientName: string
  modality: ScreeningModality
  acquisitionType: MammoAcquisitionType
  date: string
  outcome: ScreeningOutcome
  biRadsCategory: BUSBiRadsCategory | MRIBiRadsCategory | string
  findings: string
  recommendation: string
  assessedBy: string
  assessedAt: string
}

export interface ScreeningDashboard {
  totalScreened: number
  recallRate: number
  cancerDetectionRate: number
  ppv1: number
  ppv2: number
  ppv3: number
  nodeNegativeRate: number
  intervalCancerRate: number
  averageDoseMgy: number
}

export function assessRiskLevel(
  age: number, brcaStatus: BRCAStatus, familyHistory: string[], breastDensity: string,
): RiskLevel {
  if (brcaStatus === 'brca1' || brcaStatus === 'brca2') return 'very-high'
  if (familyHistory.some(f => f.toLowerCase().includes('first-degree'))) return 'high'
  if (breastDensity === 'c' || breastDensity === 'd') return 'intermediate'
  if (age >= 40) return 'average'
  return 'average'
}

export function generateScreeningSchedule(patient: ScreeningPatient, preferredModality?: ScreeningModality): ScreeningSchedule {
  const isHigh = patient.riskLevel === 'high' || patient.riskLevel === 'very-high'
  const modality = isHigh
    ? (preferredModality ?? 'mri')
    : patient.breastDensity === 'c' || patient.breastDensity === 'd'
      ? 'tomosynthesis'
      : 'mammography'
  return {
    patientId: patient.id,
    modality,
    interval: isHigh ? 'annual' : 'biennial',
    startAge: isHigh ? 25 : 40,
    endAge: patient.riskLevel === 'very-high' ? 75 : 70,
    nextScreeningDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    adherenceReminderDays: 30,
  }
}

export function calculateScreeningMetrics(sessions: ScreeningSession[]): ScreeningDashboard {
  const total = sessions.length
  const recalled = sessions.filter(s => {
    const cat = String(s.biRadsCategory)
    return cat.includes('4') || cat.includes('5') || cat.includes('0')
  }).length
  const cancers = sessions.filter(s => String(s.biRadsCategory).includes('5') || String(s.biRadsCategory) === 'BI-RADS 6').length

  return {
    totalScreened: total,
    recallRate: total > 0 ? Math.round((recalled / total) * 100) : 0,
    cancerDetectionRate: total > 0 ? Math.round((cancers / total) * 1000) / 10 : 0,
    ppv1: recalled > 0 ? Math.round((cancers / recalled) * 100) : 0,
    ppv2: 0,
    ppv3: 0,
    nodeNegativeRate: 0,
    intervalCancerRate: 0,
    averageDoseMgy: 2.5,
  }
}

export function comparePriorScreens(current: ScreeningSession, prior: ScreeningSession): string[] {
  const changes: string[] = []
  if (current.biRadsCategory !== prior.biRadsCategory) {
    changes.push(`BI-RADS changed from ${prior.biRadsCategory} to ${current.biRadsCategory}`)
  }
  if (current.outcome !== prior.outcome) {
    changes.push(`Outcome changed from ${prior.outcome} to ${current.outcome}`)
  }
  return changes
}

export function estimateGailRisk(age: number, ageAtMenarche: number, ageAtFirstBirth: number, parity: number, biopsies: number, firstDegreeRelativeCount: number): number {
  const baseRisk = 0.1
  const ageFactor = Math.max(1, (age - 35) / 10) * 1.2
  const menarcheFactor = ageAtMenarche < 12 ? 1.5 : 1
  const parityFactor = parity === 0 ? 1.3 : ageAtFirstBirth > 30 ? 1.2 : 1
  const biopsyFactor = biopsies > 0 ? 1.5 : 1
  const familyFactor = firstDegreeRelativeCount > 0 ? 1 + firstDegreeRelativeCount * 0.8 : 1
  return Math.min(50, Math.round(baseRisk * ageFactor * menarcheFactor * parityFactor * biopsyFactor * familyFactor * 100) / 100)
}
