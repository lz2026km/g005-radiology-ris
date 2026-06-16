// Module 7.7: Sports Medicine (20 points)
// ACL/meniscus/rotator cuff grading, cartilage mapping, return-to-play

export type TearPattern = 'partial' | 'complete' | 'interstitial' | 'buckle' | 'longitudinal' | 'horizontal' | 'radial' | 'complex' | 'bucket-handle' | 'parrot-beak' | 'flap'

export type TearChronicity = 'acute' | 'subacute' | 'chronic'

export interface AclAssessment {
  intact: boolean
  tearPattern: TearPattern | null
  chronicity: TearChronicity | null
  femoralFootprint: 'normal' | 'partial' | 'absent'
  tibialFootprint: 'normal' | 'partial' | 'absent'
  mucoidDegeneration: boolean
  graftIfPresent: 'native' | 'hamstring' | 'patellar' | 'allograft' | null
  graftIntegration: 'good' | 'partial' | 'poor' | null
  lachmanEquivalent: 'negative' | '1+' | '2+' | '3+' | null
}

export interface RotatorCuffAssessment {
  tendon: 'supraspinatus' | 'infraspinatus' | 'subscapularis' | 'teres-minor'
  intact: boolean
  tearPattern: TearPattern | null
  tearSizeMm: number
  retractionMm: number
  fattyInfiltration: 0 | 1 | 2 | 3 | 4
  muscleAtrophy: 'none' | 'mild' | 'moderate' | 'severe'
  tendinosis: boolean
}

export interface CartilageMappingResult {
  compartment: string
  icrsGrade: 0 | 1 | 2 | 3 | 4
  defectAreaMm2: number
  t2MappingMs: number[]
  t1RhoMs: number[]
  collagenIntegrity: 'normal' | 'degraded'
}

export interface ReturnToPlayAssessment {
  sport: string
  phase: 'pre-op' | 'post-op-0-3m' | 'post-op-3-6m' | 'post-op-6-9m' | 'post-op-9-12m' | 'cleared'
  strengthDeficitPercent: number
  rangeOfMotionDeficitDeg: number
  timeSinceInjuryWeeks: number
  readyForSport: boolean
}

export interface SportsInjuryAssessment {
  acl?: AclAssessment
  rotatorCuff: RotatorCuffAssessment[]
  cartilageMap: CartilageMappingResult[]
  returnToPlay: ReturnToPlayAssessment
  summary: string
}

export function assessAcl(
  intact: boolean, tearPattern: TearPattern | null,
  chronicity: TearChronicity | null,
  graftType: AclAssessment['graftIfPresent'] = null,
): AclAssessment {
  return {
    intact, tearPattern, chronicity,
    femoralFootprint: intact ? 'normal' : 'absent',
    tibialFootprint: intact ? 'normal' : 'absent',
    mucoidDegeneration: false,
    graftIfPresent: graftType,
    graftIntegration: graftType ? 'good' : null,
    lachmanEquivalent: intact ? 'negative' : '2+',
  }
}

export function assessRotatorCuff(tendon: RotatorCuffAssessment['tendon'], intact: boolean, tearSizeMm: number, retractionMm: number, fattyInfiltration: 0 | 1 | 2 | 3 | 4): RotatorCuffAssessment {
  return {
    tendon, intact, tearPattern: intact ? null : 'partial', tearSizeMm, retractionMm,
    fattyInfiltration, muscleAtrophy: 'none', tendinosis: !intact,
  }
}

export function mapCartilage(compartment: string, icrsGrade: 0 | 1 | 2 | 3 | 4, defectAreaMm2: number): CartilageMappingResult {
  return { compartment, icrsGrade, defectAreaMm2, t2MappingMs: [35, 40, 42], t1RhoMs: [40, 45, 48], collagenIntegrity: icrsGrade <= 1 ? 'normal' : 'degraded' }
}

export function assessReturnToPlay(sport: string, timeSinceInjuryWeeks: number, strengthDeficitPercent: number, rangeOfMotionDeficitDeg: number): ReturnToPlayAssessment {
  const phase: ReturnToPlayAssessment['phase'] = timeSinceInjuryWeeks < 12 ? 'post-op-0-3m' : timeSinceInjuryWeeks < 24 ? 'post-op-3-6m' : timeSinceInjuryWeeks < 36 ? 'post-op-6-9m' : timeSinceInjuryWeeks < 52 ? 'post-op-9-12m' : 'cleared'
  const ready = phase === 'cleared' && strengthDeficitPercent < 10 && rangeOfMotionDeficitDeg < 5
  return { sport, phase, strengthDeficitPercent, rangeOfMotionDeficitDeg, timeSinceInjuryWeeks, readyForSport: ready }
}

export function generateSportsInjuryAssessment(acl: AclAssessment | undefined, rotatorCuff: RotatorCuffAssessment[], cartilageMap: CartilageMappingResult[], returnToPlay: ReturnToPlayAssessment): SportsInjuryAssessment {
  return { acl, rotatorCuff, cartilageMap, returnToPlay, summary: `RTP: ${returnToPlay.readyForSport ? 'Cleared' : returnToPlay.phase}, tendons assessed: ${rotatorCuff.length}` }
}
