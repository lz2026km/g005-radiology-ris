/**
 * G005 Imaging Post-Processing — Shared Type Definitions
 *
 * Centralized interfaces for advanced visualization engines:
 * CPR, vessel analysis, cardiac function, perfusion, segmentation,
 * colon fly-through, temporal subtraction and PET SUV overlay.
 */

export type CprProjectionMode = 'straightened' | 'stretched' | 'cross-section'

export interface CprPoint3D {
  x: number
  y: number
  z: number
}

export interface CprCenterline {
  id: string
  vesselName?: string
  points: CprPoint3D[]
  totalLengthMm: number
  averageRadiusMm: number
  confidence: number
  sourceSeriesUid?: string
}

export interface CprPath {
  centerlineId: string
  samplingStepMm: number
  samples: { position: CprPoint3D; tangent: CprPoint3D; up: CprPoint3D; right: CprPoint3D }[]
  projectionMode: CprProjectionMode
  imageData?: ImageData
}

export interface VesselStenosis {
  segmentName: string
  positionMm: number
  referenceDiameterMm: number
  minimalDiameterMm: number
  stenosisPercent: number
  grade: 'none' | 'mild' | 'moderate' | 'severe' | 'occluded'
}

export interface VesselStentPlan {
  recommendedDiameterMm: number
  recommendedLengthMm: number
  overlapMarginMm: number
  postDeploymentDiameterGainMm: number
}

export interface VesselAnalysisResult {
  vesselId: string
  vesselName: string
  centerline: CprCenterline
  averageLumenAreaMm2: number
  minimumLumenAreaMm2: number
  meanWallThicknessMm: number
  lengthMm: number
  stenoses: VesselStenosis[]
  stentPlan?: VesselStentPlan
  plaqueBurdenPercent: number
  imageData?: ImageData
}

export interface CardiacPhase {
  phaseIndex: number
  phasePercent: number
  isEndDiastolic: boolean
  isEndSystolic: boolean
  lvVolumeMl: number
  rvVolumeMl: number
  laVolumeMl: number
  raVolumeMl: number
  myocardialMassG: number
}

export interface CineAnalysisResult {
  studyUid: string
  phases: CardiacPhase[]
  edvMl: number
  esvMl: number
  strokeVolumeMl: number
  ejectionFractionPercent: number
  cardiacOutputLmin: number
  heartRateBpm: number
  wallMotionScoreIndex: number
  segmentalScores: Record<number, number>
}

export type AhaSegment =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17

export interface AhaSegmentDef {
  number: AhaSegment
  name: string
  territory: 'LAD' | 'LCX' | 'RCA'
  wallRegion: 'basal' | 'mid' | 'apical' | 'apex'
  angleDeg: number
}

export interface PolarMapResult {
  segments: { segment: AhaSegment; score: number; perfusionPercent: number; strainPercent: number }[]
  globalScore: number
  coronaryTerritoryScore: { LAD: number; LCX: number; RCA: number }
}

export type PerfusionMapType = 'CBF' | 'CBV' | 'Tmax' | 'MTT' | 'TTP'

export interface PerfusionVoxelStat {
  mapType: PerfusionMapType
  values: number[]
  min: number
  max: number
  mean: number
  stdDev: number
  median: number
  p10: number
  p90: number
  ischemicVolumeMl: number
  penumbraVolumeMl: number
  coreVolumeMl: number
}

export interface PerfusionMapResult {
  mapType: PerfusionMapType
  studyUid: string
  width: number
  height: number
  sliceCount: number
  imageData: ImageData
  stats: PerfusionVoxelStat
  colorLUT: 'JET' | 'HOT' | 'COOL' | 'BWR'
}

export type SegmentationAlgorithm = 'grow-cut' | 'region-growing' | 'watershed' | 'threshold' | 'random-walker'

export interface SegmentationSeed {
  id: string
  voxel: { x: number; y: number; z: number }
  label: 'foreground' | 'background'
  strength: number
}

export interface SegmentationMask {
  id: string
  studyUid: string
  algorithm: SegmentationAlgorithm
  voxelCount: number
  volumeMl: number
  boundingBox: { min: CprPoint3D; max: CprPoint3D }
  meanIntensityHU: number
  stdIntensityHU: number
  seeds: SegmentationSeed[]
  processingTimeMs: number
  binaryMask?: Uint8Array
}

export interface CadFinding {
  id: string
  type: 'mass' | 'calcification' | 'asymmetry' | 'architectural-distortion'
  location: { view: 'CC' | 'MLO'; side: 'L' | 'R'; quadrant: string }
  boundingBox: { x: number; y: number; width: number; height: number }
  confidence: number
  biRadsSuggestion: 'BI-RADS 1' | 'BI-RADS 2' | 'BI-RADS 3' | 'BI-RADS 4A' | 'BI-RADS 4B' | 'BI-RADS 4C' | 'BI-RADS 5'
}

export interface CadResult {
  studyUid: string
  view: 'CC' | 'MLO'
  findings: CadFinding[]
  breastDensity: 'A' | 'B' | 'C' | 'D'
  overallScore: number
  processedAt: string
}

export interface ColonFlyKeyFrame {
  positionMm: number
  yawDeg: number
  pitchDeg: number
  rollDeg: number
  fovDeg: number
  annotation?: string
}

export interface ColonFlyPath {
  id: string
  totalLengthMm: number
  durationSec: number
  keyFrames: ColonFlyKeyFrame[]
  polypCandidates: { positionMm: number; sizeMm: number; confidence: number }[]
}

export interface TemporalSubtractionResult {
  baselineImageId: string
  followUpImageId: string
  width: number
  height: number
  subtractionImage: ImageData
  differenceStats: { min: number; max: number; mean: number; stdDev: number; nonZeroRatio: number }
  changedRegions: { x: number; y: number; width: number; height: number; deltaIntensity: number }[]
  alignmentError: number
  processingTimeMs: number
}

export type PetColormap = 'rainbow' | 'hot-iron' | 'cool' | 'gray'

export interface SuvOverlayConfig {
  colormap: PetColormap
  minSuv: number
  maxSuv: number
  opacity: number
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay'
  thresholdSuv: number
  showScale: boolean
}

export interface SuvStatistics {
  lesionId: string
  volumeMl: number
  meanSuv: number
  maxSuv: number
  peakSuv: number
  suvPeakPercent: number
  totalLesionGlycolysis: number
}

export interface SuvOverlayResult {
  studyUid: string
  overlayImageData: ImageData
  statistics: SuvStatistics[]
  legend: { stops: { value: number; color: string }[] }
}