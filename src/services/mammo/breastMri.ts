// 6.3 Breast MRI (25 pts)
export type MRISequenceType = 'T1' | 'T2' | 'DWI' | 'DCE' | 'STIR' | '3D-T1-GRE'
export type MRIContrastEnhancement = 'none' | 'mild' | 'moderate' | 'marked'
export type MRIKineticCurve = 'type1' | 'type2' | 'type3'
export type MRILesionType = 'mass' | 'non-mass-enhancement' | 'focus'
export type MRIMassShape = 'round' | 'oval' | 'irregular'
export type MRIMassMargin = 'smooth' | 'irregular' | 'spiculated'
export type MRIInternalEnhancement = 'homogeneous' | 'heterogeneous' | 'rim' | 'septations'
export type MRINonMassDistribution = 'focal' | 'linear' | 'segmental' | 'regional' | 'multiple-regional' | 'diffuse'
export type MRINonMassInternalPattern = 'homogeneous' | 'heterogeneous' | 'clumped' | 'clustered-ring'
export type MRIBiRadsCategory = 'BI-RADS 1' | 'BI-RADS 2' | 'BI-RADS 3' | 'BI-RADS 4A' | 'BI-RADS 4B' | 'BI-RADS 4C' | 'BI-RADS 5' | 'BI-RADS 6'
export type MRIBackgroundParenchymal = 'almost-fatty' | 'scattered' | 'heterogeneous' | 'marked'

export interface MRILesion {
  id: string
  number: number
  type: MRILesionType
  location: string
  quadrant: string
  depth: string
  sizeMm: { longestDiameter: number; shortAxis?: number }
  massShape?: MRIMassShape
  massMargin?: MRIMassMargin
  internalEnhancement?: MRIInternalEnhancement
  nonMassDistribution?: MRINonMassDistribution
  nonMassInternalPattern?: MRINonMassInternalPattern
  contrastEnhancement: MRIContrastEnhancement
  kineticCurve: MRIKineticCurve
  adcValue?: number
  t2Signal: 'low' | 'intermediate' | 'high'
  isTarget: boolean
  notes: string
}

export interface BreastMRIExam {
  id: string
  patientId: string
  patientName: string
  accessionNumber: string
  laterality: 'L' | 'R' | 'B'
  sequences: MRISequenceType[]
  backgroundParenchymalEnhancement: MRIBackgroundParenchymal
  lesions: MRILesion[]
  biRadsCategory: MRIBiRadsCategory
  contrastUsed: string
  contrastVolumeMl: number
  findings: string
  impression: string
  recommendation: string
  radiologistId: string
  examinedAt: string
}

export interface MRIPerfusionMetrics {
  peakEnhancement: number
  timeToPeak: number
  washoutRate: number
  areaUnderCurve: number
}

export function createBreastMRIExam(patientId: string): BreastMRIExam {
  return {
    id: `MRI-B-${Date.now()}`,
    patientId,
    patientName: '',
    accessionNumber: `MRI-ACC-${Date.now()}`,
    laterality: 'B',
    sequences: ['T1', 'T2', 'DWI', 'DCE', 'STIR'],
    backgroundParenchymalEnhancement: 'scattered',
    lesions: [],
    biRadsCategory: 'BI-RADS 1',
    contrastUsed: 'Gadobutrol',
    contrastVolumeMl: 10,
    findings: '',
    impression: '',
    recommendation: '',
    radiologistId: '',
    examinedAt: new Date().toISOString(),
  }
}

export function classifyKineticCurve(enhancementPattern: number[]): MRIKineticCurve {
  if (enhancementPattern.length < 3) return 'type1'
  const peak = Math.max(...enhancementPattern)
  const end = enhancementPattern[enhancementPattern.length - 1]
  const washoutRatio = (peak - end) / peak
  if (washoutRatio > 0.1) return 'type3'
  if (washoutRatio > -0.1) return 'type2'
  return 'type1'
}

export function calculateAdcValue(signalIntensities: number[], bValues: number[]): number {
  if (signalIntensities.length < 2 || bValues.length < 2) return 0
  const s0 = signalIntensities[0]
  const s1 = signalIntensities[signalIntensities.length - 1]
  const bDiff = bValues[bValues.length - 1] - bValues[0]
  if (s0 <= 0 || bDiff <= 0) return 0
  return -Math.log(s1 / s0) / bDiff * 1000
}

export function assessBackgroundParenchymalEnhancement(enhancementRatio: number): MRIBackgroundParenchymal {
  if (enhancementRatio < 0.1) return 'almost-fatty'
  if (enhancementRatio < 0.25) return 'scattered'
  if (enhancementRatio < 0.5) return 'heterogeneous'
  return 'marked'
}

export function calculatePerfusionMetrics(timeSeries: number[], timePoints: number[]): MRIPerfusionMetrics {
  const baseline = timeSeries.slice(0, 3).reduce((a, b) => a + b, 0) / 3
  const maxVal = Math.max(...timeSeries)
  const maxIdx = timeSeries.indexOf(maxVal)
  const peakEnhancement = baseline > 0 ? ((maxVal - baseline) / baseline) * 100 : 0
  const timeToPeak = timePoints[maxIdx] ?? 0
  const endVal = timeSeries[timeSeries.length - 1]
  const washoutRate = maxVal > 0 ? ((maxVal - endVal) / maxVal) * 100 : 0
  let areaUnderCurve = 0
  for (let i = 1; i < timeSeries.length; i++) {
    areaUnderCurve += ((timeSeries[i] - baseline) + (timeSeries[i - 1] - baseline)) / 2 * (timePoints[i] - timePoints[i - 1])
  }
  return { peakEnhancement, timeToPeak, washoutRate, areaUnderCurve }
}
