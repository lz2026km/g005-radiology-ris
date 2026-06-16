export type MeasurementStandard = 'recist-1.1' | 'who' | 'volumetric' | 'perfusion' | 'suv'

export interface LesionTarget {
  id: string
  label: string
  location: string
  slices: LesionSlice[]
  standard: MeasurementStandard
  isTarget: boolean
  lesionNumber: number
}

export interface LesionSlice {
  instanceNumber: number
  longestDiameter: number
  perpendicularDiameter?: number
  area?: number
  volume?: number
}

export interface MeasurementResult {
  lesionId: string
  standard: MeasurementStandard
  value: number
  unit: string
  confidence: number
  timestamp: string
}

export interface TemporalComparison {
  baseline: MeasurementResult
  followUp: MeasurementResult
  changePercent: number
  assessment: 'CR' | 'PR' | 'SD' | 'PD'
}

export function measureRecist11(lesion: LesionTarget): MeasurementResult {
  const sumDiameters = lesion.slices.reduce((sum, s) => {
    if (s.longestDiameter && s.perpendicularDiameter) {
      return sum + s.longestDiameter + s.perpendicularDiameter
    }
    return sum + s.longestDiameter
  }, 0)

  return {
    lesionId: lesion.id,
    standard: 'recist-1.1',
    value: sumDiameters,
    unit: 'mm',
    confidence: 0.9,
    timestamp: new Date().toISOString(),
  }
}

export function measureWho(lesion: LesionTarget): MeasurementResult {
  const products = lesion.slices.map(s => s.longestDiameter * (s.perpendicularDiameter ?? s.longestDiameter))
  const sumProduct = products.reduce((a, b) => a + b, 0)

  return {
    lesionId: lesion.id,
    standard: 'who',
    value: sumProduct,
    unit: 'mm²',
    confidence: 0.85,
    timestamp: new Date().toISOString(),
  }
}

export function measureVolumetric(lesion: LesionTarget): MeasurementResult {
  const totalVolume = lesion.slices.reduce((sum, s) => sum + (s.volume ?? 0), 0)

  return {
    lesionId: lesion.id,
    standard: 'volumetric',
    value: totalVolume,
    unit: 'mm³',
    confidence: 0.8,
    timestamp: new Date().toISOString(),
  }
}

export function compareTemporal(
  baseline: MeasurementResult,
  followUp: MeasurementResult
): TemporalComparison {
  const changePercent = ((followUp.value - baseline.value) / baseline.value) * 100

  let assessment: TemporalComparison['assessment'] = 'SD'
  if (changePercent <= -100) assessment = 'CR'
  else if (changePercent <= -30) assessment = 'PR'
  else if (changePercent >= 20) assessment = 'PD'

  return { baseline, followUp, changePercent, assessment }
}

export function calculateSuv(
  activityConcentration: number,
  injectedDose: number,
  bodyWeight: number
): number {
  if (injectedDose <= 0 || bodyWeight <= 0) return 0
  return (activityConcentration * bodyWeight) / injectedDose * 1000
}

export function calculatePerfusion(
  signalIntensity: number[],
  timePoints: number[],
  baselineIndex: number
): { ttp: number; washIn: number; washOut: number } {
  const baseline = signalIntensity[baselineIndex] ?? 0
  const maxIdx = signalIntensity.indexOf(Math.max(...signalIntensity))
  const ttp = timePoints[maxIdx] ?? 0
  const peak = signalIntensity[maxIdx] ?? 0

  const washIn = baseline > 0 ? ((peak - baseline) / baseline) * 100 : 0
  const washOut = peak > 0 ? ((peak - (signalIntensity[signalIntensity.length - 1] ?? peak)) / peak) * 100 : 0

  return { ttp, washIn, washOut }
}
