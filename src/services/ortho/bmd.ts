// Module 7.6: BMD & Osteoporosis Analysis (20 points)
// DXA scoring, FRAX integration, vertebral fracture assessment

export type BmdSite = 'lumbar-spine' | 'femoral-neck' | 'total-hip' | 'forearm'

export type OsteoporosisCategory = 'normal' | 'osteopenia' | 'osteoporosis' | 'severe-osteoporosis'

export interface DxaMeasurement {
  site: BmdSite
  bmdGcm2: number
  tScore: number
  zScore: number
  peakReference: string
  ageMatchedReference: string
  valid: boolean
}

export interface DxaResult {
  measurements: DxaMeasurement[]
  lowestTSite: BmdSite
  lowestTScore: number
  category: OsteoporosisCategory
  fractureRisk: 'low' | 'moderate' | 'high'
}

export interface FraxInput {
  age: number
  sex: 'male' | 'female'
  weightKg: number
  heightCm: number
  priorFracture: boolean
  parentHipFracture: boolean
  smoking: boolean
  glucocorticoids: boolean
  rheumatoidArthritis: boolean
  secondaryOsteoporosis: boolean
  alcohol3PlusUnits: boolean
  femoralNeckBMD?: number
}

export interface FraxResult {
  majorOsteoporoticPercent: number
  hipFracturePercent: number
  aboveTreatmentThreshold: boolean
}

export interface VertebralFractureAssessmentResult {
  level: string
  genantGrade: 0 | 1 | 2 | 3
  heightLossPercent: number
  wedge: boolean
  biconcave: boolean
  crush: boolean
}

export interface BmdAnalysisReport {
  dxa: DxaResult
  frax?: FraxResult
  vertebralFractures: VertebralFractureAssessmentResult[]
  recommendation: string
}

export function interpretDxa(bmdGcm2: number, site: BmdSite, age: number, sex: 'male' | 'female'): DxaMeasurement {
  // Simplified reference: T-score ~ (BMD - youngRef) / SD
  const refs: Record<BmdSite, { youngRef: number; sdYoung: number }> = {
    'lumbar-spine': { youngRef: 1.09, sdYoung: 0.11 },
    'femoral-neck': { youngRef: 0.85, sdYoung: 0.12 },
    'total-hip': { youngRef: 0.95, sdYoung: 0.13 },
    'forearm': { youngRef: 0.71, sdYoung: 0.10 },
  }
  const ref = refs[site]
  const tScore = (bmdGcm2 - ref.youngRef) / ref.sdYoung
  const ageRef = ref.youngRef - (age - 30) * 0.002
  const zScore = (bmdGcm2 - ageRef) / ref.sdYoung
  return { site, bmdGcm2, tScore: Math.round(tScore * 100) / 100, zScore: Math.round(zScore * 100) / 100, peakReference: ref.youngRef.toFixed(2), ageMatchedReference: ageRef.toFixed(2), valid: tScore > -6 && tScore < 6 }
}

export function classifyOsteoporosis(measurements: DxaMeasurement[]): DxaResult {
  const lowest = measurements.reduce((min, m) => m.tScore < min.tScore ? m : min, measurements[0])
  let category: OsteoporosisCategory = 'normal'
  if (lowest.tScore <= -2.5) category = 'osteoporosis'
  else if (lowest.tScore <= -1) category = 'osteopenia'
  let fractureRisk: 'low' | 'moderate' | 'high' = 'low'
  if (category === 'osteoporosis') fractureRisk = 'high'
  else if (category === 'osteopenia') fractureRisk = 'moderate'
  return { measurements, lowestTSite: lowest.site, lowestTScore: lowest.tScore, category, fractureRisk }
}

export function calculateFrax(input: FraxInput): FraxResult {
  // Simplified FRAX estimation
  let majorRisk = 1.0
  if (input.age > 65) majorRisk += 3.0
  if (input.sex === 'female') majorRisk += 1.5
  if (input.priorFracture) majorRisk += 4.0
  if (input.parentHipFracture) majorRisk += 2.0
  if (input.smoking) majorRisk += 1.5
  if (input.glucocorticoids) majorRisk += 3.0
  if (input.rheumatoidArthritis) majorRisk += 2.0
  if (input.alcohol3PlusUnits) majorRisk += 1.5
  if (input.femoralNeckBMD && input.femoralNeckBMD < 0.6) majorRisk += 3.0

  const hipRisk = majorRisk * 0.3
  return {
    majorOsteoporoticPercent: Math.round(majorRisk * 10) / 10,
    hipFracturePercent: Math.round(hipRisk * 10) / 10,
    aboveTreatmentThreshold: majorRisk >= 20,
  }
}

export function assessVertebralFracture(level: string, heightLossPercent: number): VertebralFractureAssessmentResult {
  const genant: 0 | 1 | 2 | 3 = heightLossPercent < 20 ? 0 : heightLossPercent < 25 ? 1 : heightLossPercent < 40 ? 2 : 3
  return { level, genantGrade: genant, heightLossPercent, wedge: heightLossPercent > 0, biconcave: false, crush: genant === 3 }
}

export function generateBmdReport(dxa: DxaResult, frax?: FraxResult, vfs?: VertebralFractureAssessmentResult[]): BmdAnalysisReport {
  const rec = dxa.category === 'osteoporosis' ? 'Initiate pharmacotherapy (bisphosphonate / denosumab / teriparatide)' : dxa.category === 'osteopenia' ? 'Calcium + Vitamin D supplementation, weight-bearing exercise' : 'Maintain current bone health regimen'
  return { dxa, frax, vertebralFractures: vfs || [], recommendation: rec }
}
