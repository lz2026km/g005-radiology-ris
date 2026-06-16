export type CardiacChamber = 'LV' | 'RV' | 'LA' | 'RA'

export type WallSegment = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16

export type WallMotionScore = 1 | 2 | 3 | 4 | 5

export type MrSequence = 'SSFP' | 'T1-mapping' | 'T2-mapping' | 'T2*-mapping' | 'LGE' | 'perfusion' | '4D-flow' | 'phase-contrast' | 'strain'

export interface VentricularVolumes {
  chamber: CardiacChamber
  edvMl: number
  edvIndexedMlM2: number
  esvMl: number
  esvIndexedMlM2: number
  svMl: number
  svIndexedMlM2: number
  efPercent: number
  cardiacOutputLmin: number
  cardiacIndexLminM2: number
  myocardialMassG: number
  massIndexedGM2: number
}

export interface WallMotionAnalysis {
  segment: WallSegment
  score: WallMotionScore
  thicknessMm: number
  thickeningPercent: number
  systolicThickeningMm: number
}

export interface T1MappingResult {
  nativeT1Ms: number
  postContrastT1Ms: number
  ecvPercent: number
  hematocrit: number
  segmentalValues: Record<WallSegment, { nativeT1: number; ecv: number }>
}

export interface T2MappingResult {
  globalT2Ms: number
  segmentalValues: Record<WallSegment, number>
}

export interface T2StarMappingResult {
  globalT2StarMs: number
  segmentalValues: Record<WallSegment, number>
}

export interface LgeQuantification {
  present: boolean
  pattern: 'subendocardial' | 'transmural' | 'mid-wall' | 'subepicardial' | 'patchy' | 'diffuse' | 'insertion-point'
  totalScarMassG: number
  totalScarPercentLV: number
  grayZoneMassG: number
  coreScarMassG: number
  transmuralitySegments: Record<WallSegment, { present: boolean; transmuralityPercent: number }>
}

export interface PerfusionAnalysis {
  stressMpiDefect: boolean
  restMpiDefect: boolean
  reversibleDefect: boolean
  fixedDefect: boolean
  perfusionDefectSegments: WallSegment[]
  myocardialPerfusionReserveIndex: number
  stressSignalUpslope: Record<WallSegment, number>
}

export interface StrainAnalysis {
  glsPercent: number
  gcsPercent: number
  grsPercent: number
  segmentalGls: Record<WallSegment, number>
  segmentalGcs: Record<WallSegment, number>
}

export interface FlowQuantification {
  valve: 'mitral' | 'aortic' | 'tricuspid' | 'pulmonic'
  forwardVolumeMl: number
  backwardVolumeMl: number
  regurgitantFractionPercent: number
  peakVelocityMsec: number
  meanGradientMmHg: number
  qpQs?: number
}

export interface CardiacMrAnalysis {
  studyInstanceUid: string
  patientId: string
  performedDate: string
  sequencesAcquired: MrSequence[]
  heartRateAvg: number
  imageQuality: 'excellent' | 'good' | 'adequate' | 'poor'
  ventricularVolumes: VentricularVolumes[]
  wallMotion: WallMotionAnalysis[]
  wallMotionScoreIndex: number
  t1Mapping: T1MappingResult | null
  t2Mapping: T2MappingResult | null
  t2StarMapping: T2StarMappingResult | null
  lge: LgeQuantification | null
  perfusion: PerfusionAnalysis | null
  strain: StrainAnalysis | null
  flowQuantification: FlowQuantification[]
  findings: string
  impression: string
}

export function analyzeCardiacMr(params: {
  studyUid: string
  patientId: string
  performedDate: string
}): CardiacMrAnalysis {
  return {
    studyInstanceUid: params.studyUid,
    patientId: params.patientId,
    performedDate: params.performedDate,
    sequencesAcquired: [],
    heartRateAvg: 0,
    imageQuality: 'good',
    ventricularVolumes: [],
    wallMotion: [],
    wallMotionScoreIndex: 0,
    t1Mapping: null,
    t2Mapping: null,
    t2StarMapping: null,
    lge: null,
    perfusion: null,
    strain: null,
    flowQuantification: [],
    findings: '',
    impression: '',
  }
}

export function computeWallMotionScoreIndex(motions: WallMotionAnalysis[]): number {
  if (motions.length === 0) return 0
  const sum = motions.reduce((a, m) => a + m.score, 0)
  return sum / motions.length
}

export function computeEcv(nativeT1: number, postT1: number, hematocrit: number): number {
  const deltaRelaxivityR1 = (1 / postT1 - 1 / nativeT1) * 1000
  const bloodRelaxivity = 1 / nativeT1
  return (deltaRelaxivityR1 / bloodRelaxivity) * (1 - hematocrit)
}
