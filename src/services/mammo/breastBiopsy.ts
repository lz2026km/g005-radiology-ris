// 6.5 Breast Biopsy & Pathology (20 pts)
export type BiopsyModality = 'stereotactic' | 'ultrasound-guided' | 'mri-guided' | 'palpation-guided'
export type BiopsyTechnique = 'core-needle' | 'vacuum-assisted' | 'fine-needle-aspiration' | 'excisional' | 'incisional'
export type BiopsyNeedleGauge = 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 18 | 20 | 22
export type SpecimenType = 'core' | 'vaccum' | 'fna' | 'excision'
export type MarkerClipType = 'titanium' | 'stainless-steel' | 'hydrogel' | 'bioabsorbable' | 'none'
export type BiopsyStatus = 'scheduled' | 'in-progress' | 'completed' | 'aborted' | 'specimen-adequate' | 'specimen-inadequate'
export type PathologicalDiagnosis = 'benign' | 'atypical' | 'insitu' | 'invasive' | 'high-risk' | 'insufficient'
export type HistologicalType =
  | 'invasive-ductal' | 'invasive-lobular' | 'ductal-insitu' | 'lobular-insitu'
  | 'papillary' | 'mucinous' | 'tubular' | 'medullary' | 'metaplastic'
  | 'fibroadenoma' | 'phyllodes' | 'radial-scar' | 'sclerosing-adenosis'
  | 'fat-necrosis' | 'inflammation' | 'benign-breast-tissue'

export interface BiopsyProcedure {
  id: string
  examId: string
  patientId: string
  patientName: string
  lesionId: string
  modality: BiopsyModality
  technique: BiopsyTechnique
  needleGauge: BiopsyNeedleGauge
  numCores: number
  markerClipType: MarkerClipType
  status: BiopsyStatus
  specimenRadiograph: boolean
  complications: string
  operatorId: string
  operatorName: string
  performedAt: string
}

export interface PathologyResult {
  id: string
  biopsyId: string
  specimenType: SpecimenType
  histologicalType: HistologicalType
  diagnosis: PathologicalDiagnosis
  grade: 'low' | 'intermediate' | 'high' | 'not-applicable'
  erStatus: 'positive' | 'negative' | 'equivocal' | 'not-tested'
  prStatus: 'positive' | 'negative' | 'equivocal' | 'not-tested'
  her2Status: 'positive' | 'negative' | 'equivocal' | 'not-tested'
  ki67Percent: number
  molecularSubtype: 'luminal-a' | 'luminal-b' | 'her2-enriched' | 'basal-like' | 'not-classified'
  marginStatus: 'negative' | 'positive' | 'close' | 'not-assessed'
  tumorSizeMm: number
  lymphNodeInvolvement: number
  pathologistId: string
  pathologistName: string
  reportDate: string
  notes: string
}

export interface BiopsyReport {
  procedure: BiopsyProcedure
  pathology: PathologyResult
  recommendation: string
  followUpInterval: string
}

export function createBiopsyProcedure(patientId: string, lesionId: string, modality: BiopsyModality): BiopsyProcedure {
  return {
    id: `BX-${Date.now()}`,
    examId: '',
    patientId,
    patientName: '',
    lesionId,
    modality,
    technique: 'core-needle',
    needleGauge: 14,
    numCores: 4,
    markerClipType: 'titanium',
    status: 'scheduled',
    specimenRadiograph: true,
    complications: '',
    operatorId: '',
    operatorName: '',
    performedAt: '',
  }
}

export function determineMolecularSubtype(
  erStatus: PathologyResult['erStatus'],
  prStatus: PathologyResult['prStatus'],
  her2Status: PathologyResult['her2Status'],
  ki67Percent: number,
): PathologyResult['molecularSubtype'] {
  if (erStatus === 'positive' && her2Status === 'negative' && ki67Percent < 20) return 'luminal-a'
  if (erStatus === 'positive' && her2Status === 'negative' && ki67Percent >= 20) return 'luminal-b'
  if (erStatus === 'positive' && her2Status === 'positive') return 'luminal-b'
  if (erStatus === 'negative' && prStatus === 'negative' && her2Status === 'positive') return 'her2-enriched'
  if (erStatus === 'negative' && prStatus === 'negative' && her2Status === 'negative') return 'basal-like'
  return 'not-classified'
}

export function calculateNottinghamGrade(tubuleScore: number, nuclearScore: number, mitoticScore: number): { total: number; grade: PathologyResult['grade'] } {
  const total = tubuleScore + nuclearScore + mitoticScore
  let grade: PathologyResult['grade'] = 'low'
  if (total >= 8) grade = 'high'
  else if (total >= 6) grade = 'intermediate'
  else if (total <= 5) grade = 'low'
  return { total, grade }
}

export function assessMarginStatus(marginDistanceMm: number): PathologyResult['marginStatus'] {
  if (marginDistanceMm < 0) return 'positive'
  if (marginDistanceMm < 1) return 'close'
  if (marginDistanceMm >= 1) return 'negative'
  return 'not-assessed'
}

export function generateBiopsyReport(procedure: BiopsyProcedure, pathology: PathologyResult): BiopsyReport {
  const isMalignant = pathology.diagnosis === 'invasive' || pathology.diagnosis === 'insitu'
  return {
    procedure,
    pathology,
    recommendation: isMalignant ? 'Surgical oncology consultation recommended' : 'Routine follow-up per guidelines',
    followUpInterval: isMalignant ? '3 months' : '12 months',
  }
}
