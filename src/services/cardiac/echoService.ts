export type EchoView = 'PLAX' | 'PSAX' | 'A4C' | 'A2C' | 'A3C' | 'SC' | 'IVC' | 'TG' | 'ME' | 'UE'

export type DiastolicFunctionGrade = 'normal' | 'grade-I' | 'grade-II' | 'grade-III' | 'indeterminate'

export type ValveLesionSeverity = 'none' | 'mild' | 'moderate' | 'severe'

export type ValveLesionType = 'stenosis' | 'regurgitation'

export type WallSegmentEcho = 'basal-septal' | 'basal-anterior' | 'basal-lateral' | 'basal-inferior' | 'mid-septal' | 'mid-anterior' | 'mid-lateral' | 'mid-inferior' | 'apical-septal' | 'apical-anterior' | 'apical-lateral' | 'apical-inferior' | 'apex'

export type StressProtocol = 'exercise' | 'dobutamine' | 'dipyridamole' | 'regadenoson'

export interface LvEfMeasurement {
  edvMl: number
  esvMl: number
  svMl: number
  efPercent: number
  method: 'simpson-biplane' | 'teichholz' | '3d' | 'visual-estimate'
}

export interface WallMotionScoreIndex {
  segments: Record<WallSegmentEcho, { score: 1 | 2 | 3 | 4 | 5; adequate: boolean }>
  wmsi: number
}

export interface DiastolicFunction {
  grade: DiastolicFunctionGrade
  eWaveMsec: number
  aWaveMsec: number
  eAPeakVelocity: number
  eAPeakRatio: number
  ePrimeSeptal: number
  ePrimeLateral: number
  eEPrimeRatio: number
  laVolumeIndexed: number
  trVelocityMsec: number
}

export interface ValveAssessment {
  valve: 'mitral' | 'aortic' | 'tricuspid' | 'pulmonic'
  lesionType: ValveLesionType
  severity: ValveLesionSeverity
  peakGradientMmHg: number
  meanGradientMmHg: number
  peakVelocityMsec: number
  dimensionlessIndex?: number
  pressureHalfTimeMs?: number
  proximalIsovelocitySurfaceArea?: number
  effectiveOrificeAreaCm2?: number
  regurgitantVolumeMl?: number
  regurgitantFractionPercent?: number
  venaContractaCm?: number
  morphology?: string
  prosthetic?: boolean
  prostheticType?: string
  paravalvularLeak?: boolean
}

export interface DopplerMeasurement {
  measurement: string
  value: number
  unit: string
  view: EchoView
}

export interface SpeckleTrackingResult {
  glsPercent: number
  apicalLongitudinalPercent: number
  basalLongitudinalPercent: number
  segmentalStrain: Record<WallSegmentEcho, number>
  bullseyePlot: number[][]
}

export interface StressEchoResult {
  protocol: StressProtocol
  baseline: { wmsi: number; efPercent: number }
  peakStress: { wmsi: number; efPercent: number }
  deltaWmsi: number
  ischemiaSegments: WallSegmentEcho[]
  viableSegments: WallSegmentEcho[]
  scarSegments: WallSegmentEcho[]
  conclusion: 'negative' | 'positive' | 'equivocal' | 'non-diagnostic'
}

export interface EchoAnalysis {
  studyInstanceUid: string
  patientId: string
  performedDate: string
  viewsAcquired: EchoView[]
  imageQuality: 'excellent' | 'good' | 'fair' | 'poor'
  heartRateBpm: number
  lvEf: LvEfMeasurement[]
  wmsi: WallMotionScoreIndex | null
  diastolicFunction: DiastolicFunction | null
  valves: ValveAssessment[]
  dopplerMeasurements: DopplerMeasurement[]
  speckleTracking: SpeckleTrackingResult | null
  stressEcho: StressEchoResult | null
  pericardialEffusion: { present: boolean; sizeMm: number; circumferential: boolean; tamponade: boolean }
  ivcSizeMm: number
  ivcCollapsibilityPercent: number
  raPressureMmHg: number
  paspMmHg: number
  findings: string
  conclusion: string
}

export function analyzeEcho(params: {
  studyUid: string
  patientId: string
  performedDate: string
}): EchoAnalysis {
  return {
    studyInstanceUid: params.studyUid,
    patientId: params.patientId,
    performedDate: params.performedDate,
    viewsAcquired: [],
    imageQuality: 'good',
    heartRateBpm: 0,
    lvEf: [],
    wmsi: null,
    diastolicFunction: null,
    valves: [],
    dopplerMeasurements: [],
    speckleTracking: null,
    stressEcho: null,
    pericardialEffusion: { present: false, sizeMm: 0, circumferential: false, tamponade: false },
    ivcSizeMm: 0,
    ivcCollapsibilityPercent: 0,
    raPressureMmHg: 0,
    paspMmHg: 0,
    findings: '',
    conclusion: '',
  }
}

export function computeEePrimeRatio(eWave: number, ePrime: number): number {
  return eWave / ePrime
}

export function gradeDiastolicFunction(
  eAPeakRatio: number,
  eEPrimeRatio: number,
  laVolumeIndexed: number,
  trVelocityMsec: number,
): DiastolicFunctionGrade {
  if (eAPeakRatio >= 0.8 && eAPeakRatio <= 1.5 && eEPrimeRatio <= 8 && laVolumeIndexed <= 34) return 'normal'
  if (eAPeakRatio <= 0.8 && eEPrimeRatio <= 8) return 'grade-I'
  if (eAPeakRatio >= 0.8 && eAPeakRatio <= 1.5 && eEPrimeRatio >= 9 && eEPrimeRatio <= 12 && laVolumeIndexed > 34) return 'grade-II'
  if (eAPeakRatio >= 1.5 && eEPrimeRatio >= 13 && laVolumeIndexed > 34) return 'grade-III'
  return 'indeterminate'
}
