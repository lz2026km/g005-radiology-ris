// Module 7.2: Spine Imaging Analysis (25 points)
// Disc assessment, stenosis grading, spinal alignment, fracture classification

export type DiscLevel = 'C1-2' | 'C2-3' | 'C3-4' | 'C4-5' | 'C5-6' | 'C6-7' | 'C7-T1' | 'T1-2' | 'T2-3' | 'T3-4' | 'T4-5' | 'T5-6' | 'T6-7' | 'T7-8' | 'T8-9' | 'T9-10' | 'T10-11' | 'T11-12' | 'T12-L1' | 'L1-2' | 'L2-3' | 'L3-4' | 'L4-5' | 'L5-S1'

export type DiscDegenerationGrade = 1 | 2 | 3 | 4 | 5

export type SpinalCanalGrade = 'normal' | 'mild' | 'moderate' | 'severe'

export type VertebraLevel = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'T8' | 'T9' | 'T10' | 'T11' | 'T12' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'S1'

export type SpineFractureType = 'compression' | 'burst' | 'chance' | 'dissociation' | 'fracture-dislocation'

export type AOSpineFractureSubtype = 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'B1' | 'B2' | 'B3' | 'C'

export interface DiscAssessment {
  level: DiscLevel
  pfirrmannGrade: DiscDegenerationGrade
  herniationType: 'none' | 'bulging' | 'protrusion' | 'extrusion' | 'sequestration'
  herniationDirection: 'central' | 'paracentral' | 'foraminal' | 'extraforaminal' | null
  annularFissure: boolean
  modicChanges: 0 | 1 | 2 | 3
  spinalCanalDiameterMm: number
  spinalCanalGrade: SpinalCanalGrade
  neuralForamenNarrowing: 'none' | 'mild' | 'moderate' | 'severe'
}

export interface SpinalAlignmentResult {
  cervicalLordosisDeg: number
  lumbarLordosisDeg: number
  thoracicKyphosisDeg: number
  sagittalVerticalAxisMm: number
  pelvicIncidenceDeg: number
  pelvicTiltDeg: number
  sacralSlopeDeg: number
  isSagittalImbalance: boolean
}

export interface VertebraAssessment {
  level: VertebraLevel
  heightLossPercent: number
  fractureType?: SpineFractureType
  aoSubtype?: AOSpineFractureSubtype
  retropulsion: boolean
  canalCompromisePercent: number
  listhesisMm: number
  listhesisDirection: 'anterolisthesis' | 'retrolisthesis' | null
  screwLoosening: boolean
}

export interface SpineAnalysisReport {
  discs: DiscAssessment[]
  alignment: SpinalAlignmentResult
  vertebrae: VertebraAssessment[]
  summary: string
}

export function assessDisc(level: DiscLevel, canalDiameterMm: number, pfirrmann: DiscDegenerationGrade): DiscAssessment {
  const grade: SpinalCanalGrade = canalDiameterMm >= 12 ? 'normal' : canalDiameterMm >= 10 ? 'mild' : canalDiameterMm >= 8 ? 'moderate' : 'severe'
  return {
    level, pfirrmannGrade: pfirrmann, herniationType: 'none', herniationDirection: null,
    annularFissure: false, modicChanges: 0, spinalCanalDiameterMm: canalDiameterMm,
    spinalCanalGrade: grade, neuralForamenNarrowing: 'none',
  }
}

export function computeSpinalAlignment(
  cervicalLordosisDeg: number, lumbarLordosisDeg: number, thoracicKyphosisDeg: number,
  sagittalVerticalAxisMm: number, pelvicIncidenceDeg: number, pelvicTiltDeg: number, sacralSlopeDeg: number,
): SpinalAlignmentResult {
  return {
    cervicalLordosisDeg, lumbarLordosisDeg, thoracicKyphosisDeg, sagittalVerticalAxisMm,
    pelvicIncidenceDeg, pelvicTiltDeg, sacralSlopeDeg,
    isSagittalImbalance: sagittalVerticalAxisMm > 50,
  }
}

export function classifyVertebraFracture(level: VertebraLevel, heightLossPercent: number, retropulsion: boolean, aoSubtype?: AOSpineFractureSubtype): VertebraAssessment {
  const ft: SpineFractureType | undefined = heightLossPercent > 0 ? (retropulsion ? 'burst' : 'compression') : undefined
  return { level, heightLossPercent, fractureType: ft, aoSubtype, retropulsion, canalCompromisePercent: retropulsion ? 25 : 0, listhesisMm: 0, listhesisDirection: null, screwLoosening: false }
}

export function generateSpineReport(discs: DiscAssessment[], alignment: SpinalAlignmentResult, vertebrae: VertebraAssessment[]): SpineAnalysisReport {
  const summary = `Discs assessed: ${discs.length}, alignment SVA: ${alignment.sagittalVerticalAxisMm}mm, vertebrae with fracture: ${vertebrae.filter(v => v.heightLossPercent > 0).length}`
  return { discs, alignment, vertebrae, summary }
}
