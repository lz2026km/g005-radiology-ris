// Module 7.3: Joint Imaging Analysis (25 points)
// Hip, knee, shoulder, ankle, wrist joint evaluation

export type JointType = 'hip' | 'knee' | 'shoulder' | 'ankle' | 'wrist' | 'elbow'

export type OsteoarthritisGrade = 0 | 1 | 2 | 3 | 4

export interface KellgrenLawrenceGrade {
  grade: OsteoarthritisGrade
  osteophytes: boolean
  jointSpaceNarrowing: boolean
  sclerosis: boolean
  deformity: boolean
}

export interface JointEffusion {
  present: boolean
  volumeMl: number
  loculated: boolean
}

export interface LabrumAssessment {
  tear: boolean
  tearLocation: 'anterior' | 'posterior' | 'superior' | 'inferior' | null
  paralabralCyst: boolean
  chondrolabralJunction: 'normal' | 'frayed' | 'detached'
}

export interface MeniscusAssessment {
  medial: 'normal' | 'grade1' | 'grade2' | 'grade3' | 'maceration'
  lateral: 'normal' | 'grade1' | 'grade2' | 'grade3' | 'maceration'
  extrusionMm: number
  flipped: boolean
  cyst: boolean
}

export interface LigamentAssessment {
  name: string
  intact: boolean
  tearType: 'complete' | 'partial' | 'avulsion' | null
  signal: 'normal' | 'increased' | 'disrupted'
}

export interface CartilageAssessment {
  region: string
  icrsGrade: 0 | 1 | 2 | 3 | 4
  thicknessMm: number
  defectAreaMm2: number
  location: string
}

export interface JointAssessment {
  jointType: JointType
  side: 'left' | 'right'
  klGrade: KellgrenLawrenceGrade
  effusion: JointEffusion
  cartilage: CartilageAssessment[]
  ligaments: LigamentAssessment[]
  // Joint-specific
  labrum?: LabrumAssessment
  meniscus?: MeniscusAssessment
  alphaAngleDeg?: number
  lateralCenterEdgeDeg?: number
  version?: 'anteversion' | 'retroversion' | 'normal'
}

export interface JointAnalysisReport {
  joints: JointAssessment[]
  comparison: string
}

export function gradeOsteoarthritis(jointSpaceMm: number, osteophytes: boolean, sclerosis: boolean, deformity: boolean): KellgrenLawrenceGrade {
  let grade: OsteoarthritisGrade = 0
  if (osteophytes && jointSpaceMm > 3) grade = 1
  else if (osteophytes && jointSpaceMm <= 3) grade = 2
  else if (osteophytes && jointSpaceMm <= 2) grade = 3
  else if (deformity) grade = 4
  return { grade, osteophytes, jointSpaceNarrowing: jointSpaceMm < 3, sclerosis, deformity }
}

export function assessCartilageRegion(region: string, thicknessMm: number): CartilageAssessment {
  const icrs: 0 | 1 | 2 | 3 | 4 = thicknessMm >= 2 ? 0 : thicknessMm >= 1.5 ? 1 : thicknessMm >= 1 ? 2 : thicknessMm >= 0.5 ? 3 : 4
  return { region, icrsGrade: icrs, thicknessMm, defectAreaMm2: icrs >= 2 ? 50 : 0, location: region }
}

export function assessMeniscus(medial: MeniscusAssessment['medial'], lateral: MeniscusAssessment['lateral'], extrusionMm: number): MeniscusAssessment {
  return { medial, lateral, extrusionMm, flipped: false, cyst: false }
}

export function assessLigament(name: string, intact: boolean, tearType: LigamentAssessment['tearType'], signal: LigamentAssessment['signal']): LigamentAssessment {
  return { name, intact, tearType, signal }
}

export function analyzeJoint(jointType: JointType, side: 'left' | 'right', kl: KellgrenLawrenceGrade, effusion: JointEffusion, cartilages: CartilageAssessment[], ligaments: LigamentAssessment[]): JointAssessment {
  return { jointType, side, klGrade: kl, effusion, cartilage: cartilages, ligaments }
}

export function generateJointReport(joints: JointAssessment[]): JointAnalysisReport {
  const comparison = joints.length === 2 ? `Bilateral comparison: KL grade ${joints[0].klGrade.grade} vs ${joints[1].klGrade.grade}` : 'Single joint assessment'
  return { joints, comparison }
}
