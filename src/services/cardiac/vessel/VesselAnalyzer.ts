import type {
  CprCenterline,
  CprPoint3D,
  VesselAnalysisResult,
  VesselStenosis,
  VesselStentPlan,
} from '../../../types/imaging/postprocess'

export interface VesselAnalysisInput {
  studyUid: string
  vesselName: string
  vesselId: string
  centerline: CprCenterline
  diametersMm: number[]
  wallThicknessSamplesMm: number[]
  contrastAttenuation: number[]
}

export interface VesselAnalysisOptions {
  referenceDiameterStrategy: 'median' | 'proximal-distal'
  severeThresholdPercent: number
  moderateThresholdPercent: number
  mildThresholdPercentPercent: number
}

const DEFAULT_VESSEL_OPTIONS: VesselAnalysisOptions = {
  referenceDiameterStrategy: 'median',
  severeThresholdPercent: 70,
  moderateThresholdPercent: 50,
  mildThresholdPercentPercent: 25,
}

/**
 * Vessel analysis service.
 *
 * Given a centerline plus per-sample diameter / wall thickness samples
 * (typically produced by a CPR-based automated segmentation), this engine
 * computes:
 *  - reference and minimal lumen diameter
 *  - stenosis % and grade
 *  - mean / minimum lumen cross-sectional area (assuming circular lumen)
 *  - plaque burden
 *  - recommended stent sizing
 */
export class VesselAnalyzer {
  private options: VesselAnalysisOptions

  constructor(options: Partial<VesselAnalysisOptions> = {}) {
    this.options = { ...DEFAULT_VESSEL_OPTIONS, ...options }
  }

  analyze(input: VesselAnalysisInput): VesselAnalysisResult {
    const reference = this.computeReferenceDiameter(input.diametersMm)
    const min = Math.min(...input.diametersMm, 0)
    const stenoses = this.computeStenoses(input.centerline, input.diametersMm, reference)
    const meanWallThickness = average(input.wallThicknessSamplesMm)
    const lengthMm = input.centerline.totalLengthMm
    const plaqueBurden = computePlaqueBurden(input.wallThicknessSamplesMm, reference)
    const stentPlan = this.planStent(reference, min, lengthMm)

    const averageArea = Math.PI * Math.pow(reference / 2, 2)
    const minArea = Math.PI * Math.pow(min / 2, 2)

    return {
      vesselId: input.vesselId,
      vesselName: input.vesselName,
      centerline: input.centerline,
      averageLumenAreaMm2: round(averageArea, 2),
      minimumLumenAreaMm2: round(minArea, 2),
      meanWallThicknessMm: round(meanWallThickness, 2),
      lengthMm: round(lengthMm, 2),
      stenoses,
      stentPlan,
      plaqueBurdenPercent: round(plaqueBurden, 1),
    }
  }

  /**
   * Grade a single stenosis by computing the % narrowing vs. a local reference.
   */
  gradeStenosis(minDiameterMm: number, referenceDiameterMm: number): VesselStenosis {
    const stenosisPercent = referenceDiameterMm > 0
      ? Math.max(0, Math.min(100, (1 - minDiameterMm / referenceDiameterMm) * 100))
      : 0
    return {
      segmentName: 'L',
      positionMm: 0,
      referenceDiameterMm: round(referenceDiameterMm, 2),
      minimalDiameterMm: round(minDiameterMm, 2),
      stenosisPercent: round(stenosisPercent, 1),
      grade: this.classifyStenosis(stenosisPercent),
    }
  }

  /**
   * Plan stent diameter / length based on vessel reference and lesion length.
   */
  planStent(referenceDiameterMm: number, minimalDiameterMm: number, lesionLengthMm: number): VesselStentPlan {
    const recommendedDiameterMm = round(referenceDiameterMm * 1.1, 2)
    const overlapMarginMm = 4
    const recommendedLengthMm = round(Math.max(8, lesionLengthMm + overlapMarginMm), 1)
    const postDeploymentDiameterGainMm = round(Math.max(0, recommendedDiameterMm - minimalDiameterMm), 2)
    return {
      recommendedDiameterMm,
      recommendedLengthMm,
      overlapMarginMm,
      postDeploymentDiameterGainMm,
    }
  }

  classifyStenosis(percent: number): VesselStenosis['grade'] {
    if (percent <= 0) return 'none'
    if (percent < this.options.mildThresholdPercentPercent) return 'mild'
    if (percent < this.options.moderateThresholdPercent) return 'moderate'
    if (percent < this.options.severeThresholdPercent) return 'severe'
    return 'occluded'
  }

  private computeReferenceDiameter(diameters: number[]): number {
    if (diameters.length === 0) return 0
    if (this.options.referenceDiameterStrategy === 'proximal-distal') {
      const k = Math.max(1, Math.floor(diameters.length * 0.1))
      const head = average(diameters.slice(0, k))
      const tail = average(diameters.slice(-k))
      return (head + tail) / 2
    }
    return median(diameters)
  }

  private computeStenoses(
    centerline: CprCenterline,
    diameters: number[],
    reference: number,
  ): VesselStenosis[] {
    const stenoses: VesselStenosis[] = []
    for (let i = 0; i < diameters.length; i++) {
      const d = diameters[i]!
      const pct = reference > 0 ? (1 - d / reference) * 100 : 0
      if (pct < this.options.mildThresholdPercentPercent) continue
      const pos = positionMmAtIndex(centerline.points, i, diameters.length)
      stenoses.push({
        segmentName: `Segment-${i + 1}`,
        positionMm: round(pos, 2),
        referenceDiameterMm: round(reference, 2),
        minimalDiameterMm: round(d, 2),
        stenosisPercent: round(Math.max(0, pct), 1),
        grade: this.classifyStenosis(pct),
      })
    }
    return stenoses
  }
}

function positionMmAtIndex(points: CprPoint3D[], index: number, total: number): number {
  if (points.length < 2 || total <= 1) return 0
  const segLen = points.length - 1
  const ratio = index / Math.max(1, total - 1)
  const target = ratio * segLen
  let traveled = 0
  for (let i = 1; i < points.length; i++) {
    const seg = distance(points[i - 1]!, points[i]!)
    if (traveled + seg >= target) return (traveled + (target - traveled)) * 0.5
    traveled += seg
  }
  return traveled
}

function computePlaqueBurden(wallSamples: number[], referenceDiameterMm: number): number {
  if (wallSamples.length === 0 || referenceDiameterMm <= 0) return 0
  const meanWall = average(wallSamples)
  return Math.min(100, Math.max(0, (meanWall / referenceDiameterMm) * 100 * 2))
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!
}

function distance(a: CprPoint3D, b: CprPoint3D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

function round(value: number, digits: number): number {
  const p = 10 ** digits
  return Math.round(value * p) / p
}