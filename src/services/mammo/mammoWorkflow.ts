// 6.1 Mammography Workflow (35 pts)
import type { ExamStatus, ModalityType, Priority } from '../../types'

export type MammoViewPosition = 'CC' | 'MLO' | 'ML' | 'LM' | 'XCCL' | 'AT' | 'BT'
export type MammoLaterality = 'L' | 'R' | 'B'
export type MammoAcquisitionType = 'screening' | 'diagnostic' | 'tomosynthesis' | 'contrast-enhanced'
export type BreastDensity = 'a' | 'b' | 'c' | 'd'
export type MammoWorkflowStep =
  | 'registration' | 'positioning' | 'acquisition' | 'processing'
  | 'review' | 'ai-assessment' | 'reporting' | 'completed'

export interface MammoAcquisition {
  id: string
  examId: string
  laterality: MammoLaterality
  viewPosition: MammoViewPosition
  acquisitionType: MammoAcquisitionType
  imageCount: number
  doseMgy: number
  compressionThicknessMm: number
  compressionForceN: number
  tdsExposureIndex: number
  qualityScore: number
  technologistId: string
  acquiredAt: string
}

export interface MammogramExam {
  id: string
  patientId: string
  patientName: string
  accessionNumber: string
  laterality: MammoLaterality
  acquisitionType: MammoAcquisitionType
  views: MammoViewPosition[]
  breastDensity: BreastDensity
  indications: string[]
  menopausalStatus: 'pre' | 'peri' | 'post' | 'unknown'
  hrtUse: boolean
  implants: boolean
  priorStudies: string[]
  status: ExamStatus
  priority: Priority
  technologistId?: string
  radiologistId?: string
  scheduledAt: string
  acquiredAt?: string
  reportedAt?: string
  workflowStep: MammoWorkflowStep
  createdAt: string
  updatedAt: string
}

export interface MammoWorkflowConfig {
  defaultViews: MammoViewPosition[]
  tomoEnabled: boolean
  autoExposureControl: boolean
  compressionLimitN: number
  targetDoseMgy: number
  qualityThreshold: number
  aiAssistEnabled: boolean
}

export const DEFAULT_MAMMO_WORKFLOW_CONFIG: MammoWorkflowConfig = {
  defaultViews: ['CC', 'MLO'],
  tomoEnabled: true,
  autoExposureControl: true,
  compressionLimitN: 200,
  targetDoseMgy: 3.0,
  qualityThreshold: 75,
  aiAssistEnabled: true,
}

export function createMammogramExam(patientId: string, acquisitionType: MammoAcquisitionType, laterality: MammoLaterality): MammogramExam {
  return {
    id: `MG-${Date.now()}`,
    patientId,
    patientName: '',
    accessionNumber: `ACC-${Date.now()}`,
    laterality,
    acquisitionType,
    views: acquisitionType === 'screening' ? ['CC', 'MLO'] : ['CC', 'MLO', 'ML', 'LM'],
    breastDensity: 'b',
    indications: [],
    menopausalStatus: 'unknown',
    hrtUse: false,
    implants: false,
    priorStudies: [],
    status: '待登记',
    priority: '普通',
    workflowStep: 'registration',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function recordMammoAcquisition(acquisition: Omit<MammoAcquisition, 'id'>): MammoAcquisition {
  return { ...acquisition, id: `ACQ-${Date.now()}` }
}

export function calculateAcquisitionQuality(acquisition: MammoAcquisition): number {
  const { compressionThicknessMm, compressionForceN, tdsExposureIndex, doseMgy } = acquisition
  const thicknessScore = compressionThicknessMm > 0 && compressionThicknessMm < 80 ? 25 : 15
  const forceScore = compressionForceN > 50 && compressionForceN < 180 ? 25 : 15
  const exposureScore = tdsExposureIndex > 200 && tdsExposureIndex < 800 ? 25 : 15
  const doseScore = doseMgy > 0.5 && doseMgy < 6.0 ? 25 : 15
  return Math.round((thicknessScore + forceScore + exposureScore + doseScore) / 100 * 100)
}

export function advanceMammoWorkflow(exam: MammogramExam, nextStep: MammoWorkflowStep): MammogramExam {
  return { ...exam, workflowStep: nextStep, updatedAt: new Date().toISOString() }
}

export function classifyBreastDensity(description: string): BreastDensity {
  const map: Record<string, BreastDensity> = {
    'entirely fatty': 'a',
    'scattered fibroglandular': 'b',
    'heterogeneous dense': 'c',
    'extremely dense': 'd',
  }
  return map[description.toLowerCase()] ?? 'b'
}
