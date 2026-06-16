export type CoronarySegment = 'LM' | 'LAD-p' | 'LAD-m' | 'LAD-d' | 'LCX-p' | 'LCX-m' | 'LCX-d' | 'RCA-p' | 'RCA-m' | 'RCA-d' | 'Ramus' | 'D1' | 'D2' | 'OM1' | 'OM2' | 'PDA' | 'PLB' | 'RI' | 'LAD-Diag' | 'LCX-OM'

export type StenosisGrade = 'none' | 'mild' | 'moderate' | 'severe' | 'occluded'

export type PlaqueType = 'calcified' | 'non-calcified' | 'mixed' | 'low-attenuation'

export type CadRadsCategory = 0 | 1 | 2 | 3 | '4A' | '4B' | 5 | 'N'

export type CoronaryDominance = 'right' | 'left' | 'co-dominant'

export interface CoronaryLesion {
  segment: CoronarySegment
  stenosisGrade: StenosisGrade
  stenosisPercent: number
  plaqueType: PlaqueType
  plaqueVolumeMm3: number
  lengthMm: number
  minimalLumenDiameterMm: number
  referenceDiameterMm: number
  remodelingIndex: number
  ffrCtValue?: number
  napkinRingSign?: boolean
  spottyCalcium?: boolean
}

export interface CalciumScoreResult {
  totalAgatstonScore: number
  volumeScore: number
  massScore: number
  percentileAgeSex: number
  riskCategory: 'none' | 'minimal' | 'mild' | 'moderate' | 'severe'
  perVessel: Record<CoronarySegment, number>
}

export interface StentAssessment {
  segment: CoronarySegment
  patent: boolean
  inStentRestenosis: boolean
  restenosisPercent?: number
  fracture: boolean
  malapposition: boolean
  neointimalHyperplasia?: boolean
  periStentContrastStaining?: boolean
}

export interface BypassGraftAssessment {
  graftId: string
  type: 'LIMA' | 'RIMA' | 'SVG' | 'RA' | 'GEA'
  targetVessel: CoronarySegment
  patent: boolean
  stenosisGrade?: StenosisGrade
  stenosisLocation?: 'proximal-anastomosis' | 'body' | 'distal-anastomosis'
  stringSign?: boolean
}

export interface FfrCtResult {
  computed: boolean
  value: number
  distalValue: number
  pullbackCurve?: { distanceMm: number; value: number }[]
  significantDropSegment?: CoronarySegment
}

export interface CoronaryCtaAnalysis {
  studyInstanceUid: string
  patientId: string
  performedDate: string
  contrastVolumeMl: number
  heartRateBpm: number
  imageQuality: 'excellent' | 'good' | 'adequate' | 'poor' | 'non-diagnostic'
  motionScore: number
  noiseSd: number
  snr: number
  cnr: number
  radiationDoseMgy: number
  dlpMgyCm: number
  coronaryDominance: CoronaryDominance
  segmentsVisualized: CoronarySegment[]
  lesions: CoronaryLesion[]
  calciumScore: CalciumScoreResult
  cadRads: CadRadsCategory
  highRiskPlaqueFeatures: boolean
  ffrCt: FfrCtResult
  stents: StentAssessment[]
  bypassGrafts: BypassGraftAssessment[]
  myocardialBridging: { segment: CoronarySegment; depthMm: number; lengthMm: number }[]
  pericoronaryFatAttenuation: { segment: CoronarySegment; hu: number }[]
  leftMainFindings: string
  ladFindings: string
  lcxFindings: string
  rcaFindings: string
  impression: string
  recommendations: string[]
}

export function analyzeCoronaryCta(params: {
  studyUid: string
  patientId: string
  performedDate: string
}): CoronaryCtaAnalysis {
  return {
    studyInstanceUid: params.studyUid,
    patientId: params.patientId,
    performedDate: params.performedDate,
    contrastVolumeMl: 0,
    heartRateBpm: 0,
    imageQuality: 'good',
    motionScore: 0,
    noiseSd: 0,
    snr: 0,
    cnr: 0,
    radiationDoseMgy: 0,
    dlpMgyCm: 0,
    coronaryDominance: 'right',
    segmentsVisualized: [],
    lesions: [],
    calciumScore: {
      totalAgatstonScore: 0,
      volumeScore: 0,
      massScore: 0,
      percentileAgeSex: 0,
      riskCategory: 'none',
      perVessel: {} as Record<CoronarySegment, number>,
    },
    cadRads: 0,
    highRiskPlaqueFeatures: false,
    ffrCt: { computed: false, value: 0, distalValue: 0 },
    stents: [],
    bypassGrafts: [],
    myocardialBridging: [],
    pericoronaryFatAttenuation: [],
    leftMainFindings: '',
    ladFindings: '',
    lcxFindings: '',
    rcaFindings: '',
    impression: '',
    recommendations: [],
  }
}

export function gradeStenosis(percentStenosis: number): StenosisGrade {
  if (percentStenosis <= 0) return 'none'
  if (percentStenosis < 25) return 'mild'
  if (percentStenosis < 50) return 'mild'
  if (percentStenosis < 70) return 'moderate'
  if (percentStenosis < 100) return 'severe'
  return 'occluded'
}

export function computeCadRads(lesions: CoronaryLesion[], calciumScore: number): CadRadsCategory {
  if (calciumScore === 0 && lesions.length === 0) return 0
  if (calciumScore > 0 && calciumScore <= 100 && lesions.every(l => l.stenosisGrade === 'mild')) return 1
  if (lesions.some(l => l.stenosisGrade === 'moderate')) return 3
  if (lesions.some(l => l.stenosisGrade === 'severe')) return '4A'
  if (lesions.filter(l => l.stenosisGrade === 'severe').length >= 2) return '4B'
  return 2
}
