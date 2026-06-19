import type { ColonFlyPath, ColonFlyKeyFrame } from '../../../types/imaging/postprocess'

export interface ColonFlyInput {
  id: string
  centerlinePoints: { x: number; y: number; z: number; curvature: number }[]
  polypCandidates: { positionMm: number; sizeMm: number; confidence: number }[]
  defaultFovDeg: number
  fps: number
}

export interface ColonFlyOptions {
  smoothingWindow: number
  automaticSpeed: boolean
  holdAtPolyps: boolean
  showAnnotations: boolean
}

const DEFAULT_COLON_OPTIONS: ColonFlyOptions = {
  smoothingWindow: 5,
  automaticSpeed: true,
  holdAtPolyps: true,
  showAnnotations: true,
}

/**
 * Virtual colonoscopy fly-through service.
 *
 * Generates a deterministic key-framed path along a colon centerline with
 * camera yaw / pitch / roll derived from the local tangent direction.
 * Supports both manual navigation (set `automaticSpeed: false`) and an
 * auto-pilot mode that decelerates near suspected polyps.
 */
export class ColonFlyThrough {
  private options: ColonFlyOptions

  constructor(options: Partial<ColonFlyOptions> = {}) {
    this.options = { ...DEFAULT_COLON_OPTIONS, ...options }
  }

  build(input: ColonFlyInput): ColonFlyPath {
    const smoothed = movingAverage(input.centerlinePoints, this.options.smoothingWindow)
    const keyFrames: ColonFlyKeyFrame[] = []
    let traveled = 0
    for (let i = 0; i < smoothed.length; i++) {
      const cur = smoothed[i]!
      const nxt = smoothed[Math.min(smoothed.length - 1, i + 1)]!
      const segLen = distance(cur, nxt)
      const tangent = normalize({ x: nxt.x - cur.x, y: nxt.y - cur.y, z: nxt.z - cur.z })
      const yawDeg = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI)
      const pitchDeg = Math.asin(tangent.z) * (180 / Math.PI)
      const rollDeg = cur.curvature * 30
      keyFrames.push({
        positionMm: round(traveled, 2),
        yawDeg,
        pitchDeg,
        rollDeg,
        fovDeg: input.defaultFovDeg,
      })
      traveled += segLen
    }

    const totalLengthMm = traveled
    const durationSec = (keyFrames.length / input.fps) * (this.options.automaticSpeed ? 1 : 2)
    return {
      id: input.id,
      totalLengthMm: round(totalLengthMm, 2),
      durationSec: round(durationSec, 2),
      keyFrames,
      polypCandidates: this.options.holdAtPolyps
        ? input.polypCandidates
        : input.polypCandidates.map(p => ({ ...p })),
    }
  }

  speedMultiplierAt(positionMm: number, path: ColonFlyPath): number {
    const polyp = path.polypCandidates.find(p => Math.abs(p.positionMm - positionMm) < 20)
    if (!polyp) return 1
    return Math.max(0.2, 1 - polyp.confidence * 0.6)
  }

  setOptions(options: Partial<ColonFlyOptions>): void {
    this.options = { ...this.options, ...options }
  }

  annotateKeyFrames(path: ColonFlyPath): ColonFlyKeyFrame[] {
    return path.keyFrames.map((kf, i) => {
      const polyp = path.polypCandidates.find(p => Math.abs(p.positionMm - kf.positionMm) < 12)
      if (!polyp) return kf
      return {
        ...kf,
        annotation: this.options.showAnnotations ? `可疑息肉 ${polyp.sizeMm.toFixed(1)}mm (conf ${(polyp.confidence * 100).toFixed(0)}%)` : undefined,
      }
    }).concat([{ positionMm: -1, yawDeg: 0, pitchDeg: 0, rollDeg: 0, fovDeg: 90, annotation: `key frames: ${path.keyFrames.length}` } as ColonFlyKeyFrame]).slice(0, path.keyFrames.length)
  }
}

function distance(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

function normalize(v: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

function movingAverage<T extends { x: number; y: number; z: number }>(points: T[], window: number): T[] {
  if (points.length <= 2 || window <= 1) return points
  const out: T[] = []
  const half = Math.floor(window / 2)
  for (let i = 0; i < points.length; i++) {
    let sx = 0, sy = 0, sz = 0, count = 0
    for (let k = -half; k <= half; k++) {
      const idx = Math.max(0, Math.min(points.length - 1, i + k))
      const p = points[idx]!
      sx += p.x; sy += p.y; sz += p.z; count++
    }
    out.push({ ...points[i]!, x: sx / count, y: sy / count, z: sz / count })
  }
  return out
}

function round(value: number, digits: number): number {
  const p = 10 ** digits
  return Math.round(value * p) / p
}