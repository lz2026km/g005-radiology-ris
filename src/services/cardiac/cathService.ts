export type TimiFlowGrade = 0 | 1 | 2 | 3

export type LesionLocationSegment = 'LM' | 'LAD-os' | 'LAD-p' | 'LAD-m' | 'LAD-d' | 'LCX-os' | 'LCX-p' | 'LCX-m' | 'LCX-d' | 'RCA-os' | 'RCA-p' | 'RCA-m' | 'RCA-d' | 'Ramus' | 'D1' | 'D2' | 'OM1' | 'OM2' | 'PDA' | 'PLB' | 'SVG' | 'LIMA' | 'RIMA'

export type AhaLesionClass = 'A' | 'B1' | 'B2' | 'C'

export type StentType = 'DES' | 'BMS' | 'BVS' | 'covered-stent'

export interface CoronaryLesionCath {
  id: string
  segment: LesionLocationSegment
  stenosisPercent: number
  lesionLengthMm: number
  referenceDiameterMm: number
  minimalLumenDiameterMm: number
  timiPre: TimiFlowGrade
  timiPost: TimiFlowGrade
  ahaClass: AhaLesionClass
  eccentric: boolean
  calcification: 'none' | 'mild' | 'moderate' | 'severe'
  thrombus: boolean
  bifurcation: boolean
  bifurcationType?: '1-1-1' | '1-1-0' | '1-0-0' | '0-1-0'
  sideBranchStenosis?: number
  pciPerformed: boolean
}

export interface PciDetails {
  lesionId: string
  stentDeployed: boolean
  stents: { type: StentType; diameterMm: number; lengthMm: number; inflationPressureAtm: number; balloonDiameterMm?: number; balloonLengthMm?: number; postDilatation: boolean }[]
  preBalloon: { diameterMm: number; lengthMm: number; inflationPressureAtm: number } | null
  postBalloon: { diameterMm: number; lengthMm: number; inflationPressureAtm: number } | null
  ivusUsed: boolean
  octUsed: boolean
  rotablation: boolean
  cuttingBalloon: boolean
  complications: string[]
  residualStenosis: number
  stentExpansionPercent: number
  dissectionGrade: 'none' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  noReflow: boolean
}

export interface HemodynamicsLeft {
  lvedpMmHg: number
  aortiSystolicMmHg: number
  aorticDiastolicMmHg: number
  aorticMeanMmHg: number
  leftVentricleSystolicMmHg: number
  aorticPeakGradientMmHg: number
  aorticMeanGradientMmHg: number
  computedAorticValveAreaCm2: number
  cardiacOutputLmin: number
  cardiacIndexLminM2: number
}

export interface HemodynamicsRight {
  raMeanMmHg: number
  raWaveMmHg: number
  paSystolicMmHg: number
  paDiastolicMmHg: number
  paMeanMmHg: number
  pcwpMeanMmHg: number
  pcwpWaveMmHg: number
  pvrWoodsUnits: number
  svrWoodsUnits: number
  cvpMmHg: number
  mixedVenousO2SatPercent: number
}

export interface FfrMeasurement {
  artery: LesionLocationSegment
  basalValue: number
  hyperemicValue: number
  significant: boolean
  pullbackTrajectory: { distanceMm: number; ffr: number }[]
}

export interface IvusMeasurement {
  lesionId: string
  externalElasticMembraneMm2: number
  lumenAreaMm2: number
  plaqueAreaMm2: number
  plaqueBurdenPercent: number
  minimalLumenAreaMm2: number
  remodelingIndex: number
  lipidRichPlaque: boolean
  thinCapFibroatheroma: boolean
  calcifiedNodule: boolean
}

export interface OctMeasurement {
  lesionId: string
  minimalLumenAreaMm2: number
  fibrousCapThicknessUm: number
  macrophageInfiltration: boolean
  microvessels: boolean
  cholesterolCrystal: boolean
  stentApposition: 'good' | 'incomplete' | 'malapposed'
  stentStrutCoveragePercent: number
  neointimalHyperplasia: 'none' | 'mild' | 'moderate' | 'severe'
  intraluminalThrombus: boolean
}

export interface ShuntData {
  qpQsRatio: number
  shuntDirection: 'left-to-right' | 'right-to-left' | 'bidirectional' | 'none'
  shuntLevel: 'atrial' | 'ventricular' | 'great-artery' | 'coronary'
  oximetryRun: { chamber: string; satPercent: number }[]
  stepUpDetected: boolean
}

export interface CathAnalysis {
  studyInstanceUid: string
  patientId: string
  performedDate: string
  indication: string
  accessSite: 'femoral' | 'radial' | 'brachial'
  accessSuccess: boolean
  contrastVolumeMl: number
  fluoroscopyTimeMin: number
  radiationDoseMgy: number
  lesions: CoronaryLesionCath[]
  pciDetails: PciDetails[]
  hemodynamicsLeft: HemodynamicsLeft | null
  hemodynamicsRight: HemodynamicsRight | null
  ffrMeasurements: FfrMeasurement[]
  ivus: IvusMeasurement[]
  oct: OctMeasurement[]
  shunt: ShuntData | null
  ventriculography: { lvefPercent: number; wallMotionAbnormal: boolean; abnormalSegments: string[] } | null
  complications: string[]
  findings: string
  conclusion: string
  recommendations: string[]
}

export function analyzeCath(params: {
  studyUid: string
  patientId: string
  performedDate: string
}): CathAnalysis {
  return {
    studyInstanceUid: params.studyUid,
    patientId: params.patientId,
    performedDate: params.performedDate,
    indication: '',
    accessSite: 'femoral',
    accessSuccess: true,
    contrastVolumeMl: 0,
    fluoroscopyTimeMin: 0,
    radiationDoseMgy: 0,
    lesions: [],
    pciDetails: [],
    hemodynamicsLeft: null,
    hemodynamicsRight: null,
    ffrMeasurements: [],
    ivus: [],
    oct: [],
    shunt: null,
    ventriculography: null,
    complications: [],
    findings: '',
    conclusion: '',
    recommendations: [],
  }
}

export function computePvr(papMean: number, pcwp: number, cardiacOutput: number): number {
  return cardiacOutput > 0 ? (papMean - pcwp) / cardiacOutput * 80 : 0
}

export function computeQpQs(svo2: number, puvo2: number): number {
  return (puvo2 - svo2) / (1 - puvo2)
}
