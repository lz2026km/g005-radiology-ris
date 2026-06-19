import type { AhaSegment, AhaSegmentDef, PolarMapResult } from '../../../types/imaging/postprocess'

export const AHA_17_SEGMENTS: AhaSegmentDef[] = [
  { number: 1,  name: 'Basal Anterior',         territory: 'LAD', wallRegion: 'basal',  angleDeg: -60 },
  { number: 2,  name: 'Basal Anteroseptal',     territory: 'LAD', wallRegion: 'basal',  angleDeg: -30 },
  { number: 3,  name: 'Basal Inferoseptal',     territory: 'RCA', wallRegion: 'basal',  angleDeg: 0 },
  { number: 4,  name: 'Basal Inferior',         territory: 'RCA', wallRegion: 'basal',  angleDeg: 30 },
  { number: 5,  name: 'Basal Inferolateral',    territory: 'LCX', wallRegion: 'basal',  angleDeg: 60 },
  { number: 6,  name: 'Basal Anterolateral',    territory: 'LCX', wallRegion: 'basal',  angleDeg: 90 },
  { number: 7,  name: 'Mid Anterior',           territory: 'LAD', wallRegion: 'mid',    angleDeg: -120 },
  { number: 8,  name: 'Mid Anteroseptal',       territory: 'LAD', wallRegion: 'mid',    angleDeg: -90 },
  { number: 9,  name: 'Mid Inferoseptal',       territory: 'RCA', wallRegion: 'mid',    angleDeg: -60 },
  { number: 10, name: 'Mid Inferior',           territory: 'RCA', wallRegion: 'mid',    angleDeg: -30 },
  { number: 11, name: 'Mid Inferolateral',      territory: 'LCX', wallRegion: 'mid',    angleDeg: 0 },
  { number: 12, name: 'Mid Anterolateral',      territory: 'LCX', wallRegion: 'mid',    angleDeg: 30 },
  { number: 13, name: 'Apical Anterior',        territory: 'LAD', wallRegion: 'apical', angleDeg: 60 },
  { number: 14, name: 'Apical Septal',          territory: 'LAD', wallRegion: 'apical', angleDeg: 90 },
  { number: 15, name: 'Apical Inferior',        territory: 'RCA', wallRegion: 'apical', angleDeg: 120 },
  { number: 16, name: 'Apical Lateral',         territory: 'LCX', wallRegion: 'apical', angleDeg: -120 },
  { number: 17, name: 'Apex',                   territory: 'LAD', wallRegion: 'apex',   angleDeg: 180 },
]

export interface PolarMapInput {
  perfusion: Record<AhaSegment, number>
  strain: Record<AhaSegment, number>
  wallMotionScore: Record<AhaSegment, number>
}

/**
 * 17-segment AHA polar map (bull's-eye plot) generator.
 *
 * Aggregates per-segment perfusion / strain / wall-motion data into a
 * normalized global score (0-100) and per-coronary-territory score.
 */
export class PolarMap {
  compute(input: PolarMapInput): PolarMapResult {
    const segments = AHA_17_SEGMENTS.map(def => {
      const perf = clamp(input.perfusion[def.number] ?? 70, 0, 100)
      const strain = clamp(input.strain[def.number] ?? -18, -30, 0)
      const score = clamp(input.wallMotionScore[def.number] ?? 1, 1, 5)
      return {
        segment: def.number,
        score,
        perfusionPercent: round(perf, 1),
        strainPercent: round(strain, 1),
      }
    })

    const globalScore = round(
      segments.reduce((a, s) => a + s.score, 0) / segments.length,
      2,
    )
    const territoryScore = computeTerritoryScore(segments)

    return { segments, globalScore, coronaryTerritoryScore: territoryScore }
  }

  /**
   * Compute the centroid of a segment on the polar plot canvas.
   * Polar plot radius is divided into 3 concentric rings (basal / mid / apical)
   * plus the apex at the center.
   */
  segmentCentroid(segment: AhaSegment, plotRadius: number): { x: number; y: number; radius: number } {
    const def = AHA_17_SEGMENTS.find(s => s.number === segment)
    if (!def) return { x: 0, y: 0, radius: 0 }
    const ringRadius = def.wallRegion === 'basal' ? plotRadius * 0.9
      : def.wallRegion === 'mid' ? plotRadius * 0.6
      : def.wallRegion === 'apical' ? plotRadius * 0.3
      : plotRadius * 0.05
    const angleRad = (def.angleDeg * Math.PI) / 180
    return {
      x: Math.cos(angleRad) * ringRadius,
      y: Math.sin(angleRad) * ringRadius,
      radius: def.wallRegion === 'apex' ? plotRadius * 0.15 : plotRadius * 0.18,
    }
  }

  /**
   * Color mapping for the bull's-eye plot. Returns a CSS color string for the
   * given composite score.
   */
  colorFor(score: number): string {
    if (score <= 1.0) return '#22c55e'
    if (score <= 1.5) return '#84cc16'
    if (score <= 2.0) return '#eab308'
    if (score <= 2.5) return '#f97316'
    if (score <= 3.5) return '#ef4444'
    return '#7f1d1d'
  }
}

function computeTerritoryScore(
  segments: PolarMapResult['segments'],
): PolarMapResult['coronaryTerritoryScore'] {
  const grouped: Record<'LAD' | 'LCX' | 'RCA', number[]> = { LAD: [], LCX: [], RCA: [] }
  for (const s of segments) {
    const def = AHA_17_SEGMENTS.find(d => d.number === s.segment)
    if (!def) continue
    grouped[def.territory].push(s.score)
  }
  return {
    LAD: round(average(grouped.LAD), 2),
    LCX: round(average(grouped.LCX), 2),
    RCA: round(average(grouped.RCA), 2),
  }
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function round(value: number, digits: number): number {
  const p = 10 ** digits
  return Math.round(value * p) / p
}