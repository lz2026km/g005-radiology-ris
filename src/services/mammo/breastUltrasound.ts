// 6.2 Breast Ultrasound (25 pts)
export type BUSView = 'radial' | 'anti-radial' | 'transverse' | 'longitudinal' | 'sagittal'
export type BUSLesionShape = 'oval' | 'round' | 'irregular'
export type BUSLesionOrientation = 'parallel' | 'not-parallel'
export type BUSLesionMargin = 'circumscribed' | 'indistinct' | 'angular' | 'microlobulated' | 'spiculated'
export type BUSLesionEchoPattern = 'anechoic' | 'hyperechoic' | 'hypoechoic' | 'isoechoic' | 'complex'
export type BUSPosteriorFeatures = 'none' | 'enhancement' | 'shadowing' | 'combined'
export type BUSCalcification = 'none' | 'microcalcifications' | 'macrocalcifications' | 'intraductal'
export type BUSBiRadsCategory = 'BI-RADS 1' | 'BI-RADS 2' | 'BI-RADS 3' | 'BI-RADS 4A' | 'BI-RADS 4B' | 'BI-RADS 4C' | 'BI-RADS 5' | 'BI-RADS 6'
export type BUSAxillaStatus = 'normal' | 'abnormal' | 'not-assessed'

export interface BUSLesion {
  id: string
  number: number
  location: string
  quadrant: string
  clockFace: string
  distanceFromNippleCm: number
  depthCm: number
  sizeMm: { length: number; width: number; height: number }
  shape: BUSLesionShape
  orientation: BUSLesionOrientation
  margin: BUSLesionMargin
  echoPattern: BUSLesionEchoPattern
  posteriorFeatures: BUSPosteriorFeatures
  calcifications: BUSCalcification
  vascularity: 'absent' | 'internal' | 'peripheral' | 'increased'
  elasticityScore?: number
  isTarget: boolean
  notes: string
}

export interface BUSExam {
  id: string
  patientId: string
  patientName: string
  accessionNumber: string
  laterality: 'L' | 'R' | 'B'
  views: BUSView[]
  lesions: BUSLesion[]
  biRadsCategory: BUSBiRadsCategory
  breastComposition: 'homogeneous' | 'heterogeneous' | 'not-assessed'
  axillaLeft: BUSAxillaStatus
  axillaRight: BUSAxillaStatus
  recommendation: string
  radiologistId: string
  examinedAt: string
  notes: string
}

export interface BUSFindingSummary {
  totalLesions: number
  targetLesions: number
  largestLesionSize: number
  mostSuspiciousBiRads: BUSBiRadsCategory
  axillaAbnormal: boolean
}

export function createBUSLesion(number: number, location: string): BUSLesion {
  return {
    id: `BUS-L-${Date.now()}-${number}`,
    number,
    location,
    quadrant: 'UOQ',
    clockFace: '12:00',
    distanceFromNippleCm: 3,
    depthCm: 1.5,
    sizeMm: { length: 15, width: 10, height: 8 },
    shape: 'oval',
    orientation: 'parallel',
    margin: 'circumscribed',
    echoPattern: 'hypoechoic',
    posteriorFeatures: 'none',
    calcifications: 'none',
    vascularity: 'absent',
    isTarget: false,
    notes: '',
  }
}

export function calculateBiRadsFromLesions(lesions: BUSLesion[]): BUSBiRadsCategory {
  if (lesions.length === 0) return 'BI-RADS 1'
  const worstMargin = lesions.reduce<BUSLesionMargin>((worst, l) => {
    const severity: BUSLesionMargin[] = ['circumscribed', 'indistinct', 'angular', 'microlobulated', 'spiculated']
    return severity.indexOf(l.margin) > severity.indexOf(worst) ? l.margin : worst
  }, 'circumscribed')
  const hasCalcifications = lesions.some(l => l.calcifications !== 'none')
  const anyIrregular = lesions.some(l => l.shape === 'irregular')
  const anySpiculated = lesions.some(l => l.margin === 'spiculated')

  if (anySpiculated) return 'BI-RADS 5'
  if (anyIrregular && worstMargin !== 'circumscribed') return 'BI-RADS 4C'
  if (anyIrregular || worstMargin === 'microlobulated') return 'BI-RADS 4B'
  if (worstMargin !== 'circumscribed' || hasCalcifications) return 'BI-RADS 4A'
  if (lesions.length > 0) return 'BI-RADS 3'
  return 'BI-RADS 1'
}

export function summarizeBUSFindings(exam: BUSExam): BUSFindingSummary {
  const lesions = exam.lesions
  return {
    totalLesions: lesions.length,
    targetLesions: lesions.filter(l => l.isTarget).length,
    largestLesionSize: Math.max(...lesions.map(l => l.sizeMm.length), 0),
    mostSuspiciousBiRads: calculateBiRadsFromLesions(lesions),
    axillaAbnormal: exam.axillaLeft === 'abnormal' || exam.axillaRight === 'abnormal',
  }
}

export function calculateElasticityScore(strainRatio: number): number {
  if (strainRatio <= 0) return 0
  if (strainRatio < 2) return 1
  if (strainRatio < 4) return 2
  if (strainRatio < 6) return 3
  return 5
}
