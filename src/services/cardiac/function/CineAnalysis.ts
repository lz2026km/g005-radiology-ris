import type { CineAnalysisResult, CardiacPhase, AhaSegment } from '../../../types/imaging/postprocess'

export interface CinePhaseInput {
  phaseIndex: number
  phasePercent: number
  lvVolumeMl: number
  rvVolumeMl: number
  laVolumeMl: number
  raVolumeMl: number
  myocardialMassG: number
  segmentScores: Record<number, number>
}

export interface CineAnalysisOptions {
  heartRateBpm: number
  endDiastolicThresholdPercent: number
  endSystolicThresholdPercent: number
}

const DEFAULT_CINE_OPTIONS: CineAnalysisOptions = {
  heartRateBpm: 70,
  endDiastolicThresholdPercent: 0,
  endSystolicThresholdPercent: 35,
}

/**
 * Cardiac cine analysis service.
 *
 * Aggregates per-phase volumetric measurements (LV / RV / LA / RA), wall
 * motion scores and identifies end-diastolic / end-systolic frames. Computes
 * derived indices (EF, SV, CO) and a global wall motion score index (WMSI).
 */
export class CineAnalysis {
  private options: CineAnalysisOptions

  constructor(options: Partial<CineAnalysisOptions> = {}) {
    this.options = { ...DEFAULT_CINE_OPTIONS, ...options }
  }

  setOptions(options: Partial<CineAnalysisOptions>): void {
    this.options = { ...this.options, ...options }
  }

  analyze(studyUid: string, phases: CinePhaseInput[]): CineAnalysisResult {
    if (phases.length === 0) {
      return {
        studyUid,
        phases: [],
        edvMl: 0,
        esvMl: 0,
        strokeVolumeMl: 0,
        ejectionFractionPercent: 0,
        cardiacOutputLmin: 0,
        heartRateBpm: this.options.heartRateBpm,
        wallMotionScoreIndex: 0,
        segmentalScores: {},
      }
    }

    const edIndex = this.findEndDiastolicIndex(phases)
    const esIndex = this.findEndSystolicIndex(phases)
    const edv = phases[edIndex]?.lvVolumeMl ?? 0
    const esv = phases[esIndex]?.lvVolumeMl ?? 0
    const sv = Math.max(0, edv - esv)
    const ef = edv > 0 ? (sv / edv) * 100 : 0
    const co = (sv * this.options.heartRateBpm) / 1000

    const wmsi = computeWallMotionScoreIndex(phases[edIndex]?.segmentScores ?? {})

    const decorated: CardiacPhase[] = phases.map((p, i) => ({
      phaseIndex: i,
      phasePercent: p.phasePercent,
      isEndDiastolic: i === edIndex,
      isEndSystolic: i === esIndex,
      lvVolumeMl: round(p.lvVolumeMl, 2),
      rvVolumeMl: round(p.rvVolumeMl, 2),
      laVolumeMl: round(p.laVolumeMl, 2),
      raVolumeMl: round(p.raVolumeMl, 2),
      myocardialMassG: round(p.myocardialMassG, 1),
    }))

    return {
      studyUid,
      phases: decorated,
      edvMl: round(edv, 2),
      esvMl: round(esv, 2),
      strokeVolumeMl: round(sv, 2),
      ejectionFractionPercent: round(ef, 1),
      cardiacOutputLmin: round(co, 2),
      heartRateBpm: this.options.heartRateBpm,
      wallMotionScoreIndex: round(wmsi, 2),
      segmentalScores: phases[edIndex]?.segmentScores ?? {},
    }
  }

  findEndDiastolicIndex(phases: CinePhaseInput[]): number {
    let best = 0
    let bestVol = -Infinity
    for (let i = 0; i < phases.length; i++) {
      if (phases[i]!.phasePercent > this.options.endDiastolicThresholdPercent + 5) continue
      if (phases[i]!.lvVolumeMl > bestVol) {
        bestVol = phases[i]!.lvVolumeMl
        best = i
      }
    }
    return best
  }

  findEndSystolicIndex(phases: CinePhaseInput[]): number {
    const ed = this.findEndDiastolicIndex(phases)
    let best = ed
    let bestVol = Infinity
    for (let i = ed; i < phases.length; i++) {
      if (phases[i]!.phasePercent < this.options.endSystolicThresholdPercent - 5) continue
      if (phases[i]!.lvVolumeMl < bestVol) {
        bestVol = phases[i]!.lvVolumeMl
        best = i
      }
    }
    return best
  }

  aggregateSegmentalScores(studies: { phase: number; scores: Record<number, number> }[]): Record<AhaSegment, number> {
    const acc: Record<number, number> = {}
    const counts: Record<number, number> = {}
    for (const s of studies) {
      for (const [key, score] of Object.entries(s.scores)) {
        const k = parseInt(key)
        acc[k] = (acc[k] ?? 0) + score
        counts[k] = (counts[k] ?? 0) + 1
      }
    }
    const out: Record<AhaSegment, number> = {} as Record<AhaSegment, number>
    for (const [k, sum] of Object.entries(acc)) {
      const seg = parseInt(k) as AhaSegment
      out[seg] = round(sum / (counts[parseInt(k)] ?? 1), 2)
    }
    return out
  }
}

function computeWallMotionScoreIndex(scores: Record<number, number>): number {
  const values = Object.values(scores)
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function round(value: number, digits: number): number {
  const p = 10 ** digits
  return Math.round(value * p) / p
}