export type AortaSegment = 'ascending' | 'arch' | 'descending' | 'suprarenal-abdominal' | 'infrarenal-abdominal'

export type AneurysmMorphology = 'fusiform' | 'saccular'

export type DissectionType = 'Stanford-A' | 'Stanford-B' | 'DeBakey-I' | 'DeBakey-II' | 'DeBakey-III'

export type EndoleakType = 'I' | 'II' | 'III' | 'IV' | 'V'

export interface AortaAnalysis {
  studyInstanceUid: string
  patientId: string
  performedDate: string
  maxDiameterMm: number
  maxDiameterSegment: AortaSegment
  segmentalDiameters: Record<AortaSegment, number>
  aneurysm: boolean
  aneurysmMorphology: AneurysmMorphology | null
  aneurysmLengthMm: number
  dissection: boolean
  dissectionType: DissectionType | null
  dissectionEntryTearMm: number
  dissectionMaxFlapThicknessMm: number
  trueLumenDiameterMm: number
  falseLumenDiameterMm: number
  falseLumenThrombosis: 'patent' | 'partial' | 'complete'
  penetratingAorticUlcer: boolean
  pauldepthMm: number
  intramuralHematoma: boolean
  imhThicknessMm: number
  imhSegment: AortaSegment | null
  rupture: boolean
  containedRupture: boolean
  endoleak: boolean
  endoleakType: EndoleakType | null
  evarPresent: boolean
  growthRateMmYear: number
  findings: string
  impression: string
}

export interface CarotidDopplerAssessment {
  side: 'left' | 'right'
  icaPsvCmS: number
  icaEdvCmS: number
  ccaPsvCmS: number
  icaCcaRatio: number
  plaque: boolean
  plaqueThicknessMm: number
  plaqueSurface: 'smooth' | 'irregular' | 'ulcerated'
  plaqueEchogenicity: 'homogeneous' | 'heterogeneous' | 'calcified'
  stenosisGrade: 'none' | '<50' | '50-69' | '70-99' | 'occluded'
  velocityCriteriaApplied: string
  nearOcclusion: boolean
  vertebralArteryFlow: 'antegrade' | 'retrograde' | 'absent'
}

export interface PeripheralArterialAssessment {
  side: 'left' | 'right'
  ankleBrachialIndex: number
  toeBrachialIndex: number
  segmentalPressures: { level: string; pressureMmHg: number }[]
  pulseVolumeRecordings: { level: string; waveform: 'triphasic' | 'biphasic' | 'monophasic' | 'absent' }[]
  stenosisSegments: string[]
  runOffScore: number
  criticalLimbIschemia: boolean
  woundIschemiaFootInfectionGrade: string
}

export interface VenousAssessment {
  side: 'left' | 'right'
  vein: 'femoral' | 'popliteal' | 'great-saphenous' | 'small-saphenous' | 'perforator'
  compressible: boolean
  dopplerSignal: 'spontaneous' | 'phasic' | 'augmented' | 'absent'
  refluxTimeSec: number
  refluxGrade: 'none' | 'mild' | 'moderate' | 'severe'
  dvtPresent: boolean
  dvtLevel: string
  thrombusAge: 'acute' | 'chronic' | 'acute-on-chronic'
  thrombusExtent: 'occlusive' | 'non-occlusive'
}

export interface RenalArteryDoppler {
  side: 'left' | 'right'
  peakSystolicVelocityCmS: number
  endDiastolicVelocityCmS: number
  renalAorticRatio: number
  resistiveIndex: number
  accelerationTimeMs: number
  accelerationIndex: number
  stenosisGrade: 'none' | '<60' | '>=60' | 'occluded'
  parvusTardus: boolean
  fibromuscularDysplasia: boolean
}

export interface AvFistulaMapping {
  side: 'left' | 'right'
  arteryDiameterMm: number
  veinDiameterMm: number
  veinDepthMm: number
  venousDistensibility: number
  patentVein: boolean
  centralStenosis: boolean
  recommendedFistulaType: 'radio-cephalic' | 'brachio-cephalic' | 'brachio-basilic' | 'brachial-axillary-graft'
  maturingAdequacy: boolean
}

export interface TaviAccessPlanning {
  iliofemoralCalciumScore: number
  minimalLumenDiameterMm: number
  tortuosityIndex: number
  accessVesselCalcification: 'none' | 'mild' | 'moderate' | 'severe'
  accessRouteFeasible: boolean
  recommendedAccess: 'transfemoral' | 'transapical' | 'transaortic' | 'transaxillary' | 'transcarotid'
}

export function analyzeAorta(params: {
  studyUid: string
  patientId: string
  performedDate: string
}): AortaAnalysis {
  return {
    studyInstanceUid: params.studyUid,
    patientId: params.patientId,
    performedDate: params.performedDate,
    maxDiameterMm: 0,
    maxDiameterSegment: 'ascending',
    segmentalDiameters: {} as Record<AortaSegment, number>,
    aneurysm: false,
    aneurysmMorphology: null,
    aneurysmLengthMm: 0,
    dissection: false,
    dissectionType: null,
    dissectionEntryTearMm: 0,
    dissectionMaxFlapThicknessMm: 0,
    trueLumenDiameterMm: 0,
    falseLumenDiameterMm: 0,
    falseLumenThrombosis: 'patent',
    penetratingAorticUlcer: false,
    pauldepthMm: 0,
    intramuralHematoma: false,
    imhThicknessMm: 0,
    imhSegment: null,
    rupture: false,
    containedRupture: false,
    endoleak: false,
    endoleakType: null,
    evarPresent: false,
    growthRateMmYear: 0,
    findings: '',
    impression: '',
  }
}

export function assessCarotid(params: { side: 'left' | 'right' }): CarotidDopplerAssessment {
  return {
    side: params.side,
    icaPsvCmS: 0,
    icaEdvCmS: 0,
    ccaPsvCmS: 0,
    icaCcaRatio: 0,
    plaque: false,
    plaqueThicknessMm: 0,
    plaqueSurface: 'smooth',
    plaqueEchogenicity: 'homogeneous',
    stenosisGrade: 'none',
    velocityCriteriaApplied: 'NASCET',
    nearOcclusion: false,
    vertebralArteryFlow: 'antegrade',
  }
}

export function computeIcaCcaRatio(icaPsv: number, ccaPsv: number): number {
  return ccaPsv > 0 ? icaPsv / ccaPsv : 0
}

export function gradeCarotidStenosis(icaPsv: number, icaCcaRatio: number): CarotidDopplerAssessment['stenosisGrade'] {
  if (icaPsv < 125 && icaCcaRatio < 2) return '<50'
  if (icaPsv >= 125 && icaPsv < 230 && icaCcaRatio >= 2 && icaCcaRatio < 4) return '50-69'
  if (icaPsv >= 230 && icaCcaRatio >= 4) return '70-99'
  return 'none'
}
