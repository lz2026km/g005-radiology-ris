// Module 7.5: Bone Tumor Analysis (20 points)
// Tumor characterization, bone-RADS integration, size measurement

import { scoreBoneRads, type BoneRadsCategory } from '../../data/rads/boneRads'

export type TumorMatrix = 'osteolytic' | 'osteoblastic' | 'mixed' | 'ground-glass'

export type TumorMargin = 'well-defined-sclerotic' | 'well-defined-non-sclerotic' | 'ill-defined' | 'permeative' | 'geographic'

export type PeriostealReaction = 'none' | 'solid' | 'lamellated' | 'sunburst' | 'Codman-triangle'

export type TumorLocation = 'epiphysis' | 'metaphysis' | 'diaphysis' | 'intra-articular' | 'parosteal' | 'cortical' | 'medullary'

export interface BoneTumorAssessment {
  bone: string
  location: TumorLocation
  matrix: TumorMatrix
  margin: TumorMargin
  largestDimensionMm: number
  corticalDestruction: boolean
  pathologicalFracture: boolean
  periostealReaction: PeriostealReaction
  softTissueMass: boolean
  softTissueMassSizeMm?: number
  internalCalcification: boolean
  fluidFluidLevels: boolean
  bonyExpansion: boolean
  boneRadsCategory?: BoneRadsCategory
  boneRadsScore?: number
  dd: string[]
}

export interface TumorFollowUp {
  priorSizeMm: number
  currentSizeMm: number
  percentChange: number
  intervalDays: number
  growthRateMmPerDay: number
  stability: 'regressed' | 'stable' | 'progression'
}

export interface BoneTumorAnalysisResult {
  tumors: BoneTumorAssessment[]
  followUp?: TumorFollowUp
  overallBoneRads?: BoneRadsCategory
  summary: string
}

export function assessBoneTumor(
  bone: string, location: TumorLocation, matrix: TumorMatrix,
  margin: TumorMargin, largestDimensionMm: number,
  corticalDestruction: boolean, pathologicalFracture: boolean,
  periostealReaction: PeriostealReaction, softTissueMass: boolean,
): BoneTumorAssessment {
  const hasAggressiveFeatures = margin === 'permeative' || periostealReaction === 'sunburst' || periostealReaction === 'Codman-triangle' || corticalDestruction
  const isTypicalBenign = margin === 'well-defined-sclerotic' && !corticalDestruction && !softTissueMass && matrix === 'osteolytic'
  const isUncharacterized = !isTypicalBenign && !hasAggressiveFeatures

  const radsInput = { isTypicalBenign, isUncharacterized, hasAggressiveFeatures, hasOsteolysis: matrix === 'osteolytic', hasPeriostealReaction: periostealReaction !== 'none', hasSoftTissueMass: softTissueMass }
  const radsResult = scoreBoneRads(radsInput)

  const dd: string[] = []
  if (matrix === 'osteolytic' && margin === 'well-defined-sclerotic') dd.push('Non-ossifying fibroma', 'Simple bone cyst', 'Enchondroma')
  else if (matrix === 'osteoblastic') dd.push('Osteoid osteoma', 'Osteoblastoma', 'Bone island')
  else if (hasAggressiveFeatures) dd.push('Osteosarcoma', 'Ewing sarcoma', 'Metastasis', 'Chondrosarcoma')

  return {
    bone, location, matrix, margin, largestDimensionMm,
    corticalDestruction, pathologicalFracture, periostealReaction,
    softTissueMass, internalCalcification: false, fluidFluidLevels: false, bonyExpansion: false,
    boneRadsCategory: radsResult.category as BoneRadsCategory,
    boneRadsScore: radsResult.score,
    dd,
  }
}

export function assessTumorFollowUp(priorSizeMm: number, currentSizeMm: number, intervalDays: number): TumorFollowUp {
  const percentChange = ((currentSizeMm - priorSizeMm) / priorSizeMm) * 100
  const growthRateMmPerDay = (currentSizeMm - priorSizeMm) / intervalDays
  const stability: TumorFollowUp['stability'] = percentChange < -10 ? 'regressed' : percentChange > 10 ? 'progression' : 'stable'
  return { priorSizeMm, currentSizeMm, percentChange: Math.round(percentChange * 10) / 10, intervalDays, growthRateMmPerDay: Math.round(growthRateMmPerDay * 100) / 100, stability }
}

export function generateBoneTumorAnalysis(tumors: BoneTumorAssessment[], followUp?: TumorFollowUp): BoneTumorAnalysisResult {
  const cat = tumors.length > 0 ? tumors[0].boneRadsCategory : undefined
  return { tumors, followUp, overallBoneRads: cat, summary: `${tumors.length} tumor(s) assessed, Bone-RADS: ${cat || 'N/A'}` }
}
