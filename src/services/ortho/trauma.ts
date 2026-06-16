// Module 7.4: Trauma Imaging Analysis (25 points)
// Fracture detection, classification, displacement measurement

export type BoneSegment = 'proximal' | 'midshaft' | 'distal' | 'metaphysis' | 'epiphysis' | 'articular'

export type FracturePattern = 'transverse' | 'oblique' | 'spiral' | 'comminuted' | 'segmental' | 'butterfly' | 'greenstick' | 'buckle' | 'hairline'

export type FractureDisplacement = 'none' | 'minimal' | 'moderate' | 'significant'

export type AOClassificationCode = string

export interface FractureAssessment {
  bone: string
  segment: BoneSegment
  pattern: FracturePattern
  displacedMm: number
  displacement: FractureDisplacement
  angulationDeg: number
  angulationDirection: 'varus' | 'valgus' | 'anterior' | 'posterior' | null
  shorteningMm: number
  rotationalDeformityDeg: number
  intraArticular: boolean
  articularStepMm: number
  openFracture: boolean
  comminutionPieces: number
  aoCode?: AOClassificationCode
}

export interface DislocationAssessment {
  joint: string
  direction: string
  complete: boolean
  associatedFracture: boolean
  neurovascularCompromise: boolean
}

export interface SoftTissueInjury {
  type: 'muscle-contusion' | 'muscle-tear' | 'tendon-rupture' | 'ligament-tear' | 'hematoma' | 'laceration'
  location: string
  severity: 'mild' | 'moderate' | 'severe'
  sizeCm3: number
}

export interface TraumaAssessmentResult {
  fractures: FractureAssessment[]
  dislocations: DislocationAssessment[]
  softTissue: SoftTissueInjury[]
  traumaScore: number
  summary: string
}

export function assessFracture(
  bone: string, segment: BoneSegment, pattern: FracturePattern,
  displacedMm: number, angulationDeg: number, intraArticular: boolean,
): FractureAssessment {
  const disp: FractureDisplacement = displacedMm === 0 ? 'none' : displacedMm < 2 ? 'minimal' : displacedMm < 5 ? 'moderate' : 'significant'
  return {
    bone, segment, pattern, displacedMm, displacement: disp,
    angulationDeg, angulationDirection: null, shorteningMm: 0, rotationalDeformityDeg: 0,
    intraArticular, articularStepMm: intraArticular ? displacedMm : 0,
    openFracture: false, comminutionPieces: 1,
  }
}

export function assessDislocation(joint: string, direction: string, complete: boolean, associatedFracture: boolean): DislocationAssessment {
  return { joint, direction, complete, associatedFracture, neurovascularCompromise: false }
}

export function assessSoftTissueInjury(type: SoftTissueInjury['type'], location: string, severity: SoftTissueInjury['severity'], sizeCm3: number): SoftTissueInjury {
  return { type, location, severity, sizeCm3 }
}

export function computeTraumaScore(fractures: FractureAssessment[], dislocations: DislocationAssessment[], softTissues: SoftTissueInjury[]): number {
  let score = 0
  for (const f of fractures) { score += f.comminutionPieces > 1 ? 3 : 2; if (f.intraArticular) score += 2 }
  for (const d of dislocations) { score += d.complete ? 5 : 3 }
  for (const s of softTissues) { score += s.severity === 'severe' ? 3 : s.severity === 'moderate' ? 2 : 1 }
  return score
}

export function generateTraumaAssessment(fractures: FractureAssessment[], dislocations: DislocationAssessment[], softTissue: SoftTissueInjury[]): TraumaAssessmentResult {
  const traumaScore = computeTraumaScore(fractures, dislocations, softTissue)
  return { fractures, dislocations, softTissue, traumaScore, summary: `Trauma score: ${traumaScore}, Fractures: ${fractures.length}, Dislocations: ${dislocations.length}` }
}
