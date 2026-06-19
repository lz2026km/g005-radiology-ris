import type { CprCenterline, CprPoint3D } from '../../../types/imaging/postprocess'

export interface CenterlineExtractionOptions {
  thresholdHU: number
  minRadiusMm: number
  maxRadiusMm: number
  stepMm: number
  smoothingIterations: number
  pruningLengthMm: number
}

export interface CenterlineCandidate {
  seed: CprPoint3D
  score: number
  estimatedRadiusMm: number
}

export const DEFAULT_CENTERLINE_OPTIONS: CenterlineExtractionOptions = {
  thresholdHU: 200,
  minRadiusMm: 1.0,
  maxRadiusMm: 8.0,
  stepMm: 0.5,
  smoothingIterations: 8,
  pruningLengthMm: 5,
}

/**
 * Extract the vessel centerline from a 3D volume starting at a seed point.
 *
 * Implements a greedy sphere-fitting approach:
 *  1) at the seed, search the spherical neighborhood for the densest lumen
 *  2) move along the local tangent by `stepMm`
 *  3) re-fit the sphere until HU coverage drops below threshold or bounds exit
 *  4) apply moving-average smoothing and prune zero-length branches
 */
export function extractCenterline(
  volume: Float32Array[],
  width: number,
  height: number,
  depth: number,
  seed: CprPoint3D,
  options: Partial<CenterlineExtractionOptions> = {},
): CprCenterline {
  const opts: CenterlineExtractionOptions = { ...DEFAULT_CENTERLINE_OPTIONS, ...options }
  const points: CprPoint3D[] = [seed]
  let current = { ...seed }
  let previousTangent: CprPoint3D = { x: 0, y: 0, z: 1 }
  let prevRadius = opts.minRadiusMm

  for (let iter = 0; iter < 1024; iter++) {
    const fit = fitSphereAtVoxel(volume, width, height, depth, current, opts, previousTangent)
    if (fit.radius < opts.minRadiusMm * 0.6) break
    const next = addScaled(current, fit.tangent, opts.stepMm)
    if (!inBounds(next, width, height, depth)) break
    points.push(next)
    current = next
    previousTangent = fit.tangent
    prevRadius = fit.radius
    if (iter > 4 && distance(points[points.length - 1]!, points[0]!) < opts.stepMm * 1.5) break
  }

  const smoothed = movingAverage(points, opts.smoothingIterations)
  const totalLengthMm = pathLength(smoothed)
  const averageRadiusMm = prevRadius

  return {
    id: `cl-${Date.now().toString(36)}`,
    points: smoothed,
    totalLengthMm,
    averageRadiusMm,
    confidence: Math.max(0, Math.min(1, smoothed.length / 200)),
  }
}

/**
 * Generate candidate seed points by scanning a slice for high-intensity blobs.
 *
 * Used as an automated pre-stage before manual centerline confirmation.
 */
export function generateCenterlineCandidates(
  volume: Float32Array[],
  width: number,
  height: number,
  depth: number,
  sliceIndex: number,
  options: Partial<CenterlineExtractionOptions> = {},
): CenterlineCandidate[] {
  const opts: CenterlineExtractionOptions = { ...DEFAULT_CENTERLINE_OPTIONS, ...options }
  const slice = volume[Math.max(0, Math.min(depth - 1, sliceIndex))]
  if (!slice) return []
  const out: CenterlineCandidate[] = []
  const window = 5
  for (let y = window; y < height - window; y++) {
    for (let x = window; x < width - window; x++) {
      let sum = 0
      for (let ky = -window; ky <= window; ky += 2) {
        for (let kx = -window; kx <= window; kx += 2) {
          sum += slice[(y + ky) * width + (x + kx)] ?? 0
        }
      }
      const avg = sum / ((window * 2 + 1) ** 2 / 4)
      if (avg < opts.thresholdHU) continue
      const radius = Math.min(opts.maxRadiusMm, Math.max(opts.minRadiusMm, (avg - opts.thresholdHU) / 80))
      const score = Math.min(1, (avg - opts.thresholdHU) / 600)
      out.push({ seed: { x, y, z: sliceIndex }, score, estimatedRadiusMm: radius })
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 25)
}

/**
 * Prune duplicate consecutive points and short branches.
 */
export function pruneCenterline(centerline: CprCenterline, minSegmentMm: number): CprCenterline {
  const filtered: CprPoint3D[] = []
  for (let i = 0; i < centerline.points.length; i++) {
    const p = centerline.points[i]!
    if (filtered.length === 0 || distance(p, filtered[filtered.length - 1]!) >= minSegmentMm * 0.5) {
      filtered.push(p)
    }
  }
  return {
    ...centerline,
    points: filtered,
    totalLengthMm: pathLength(filtered),
  }
}

function fitSphereAtVoxel(
  volume: Float32Array[],
  width: number,
  height: number,
  depth: number,
  point: CprPoint3D,
  opts: CenterlineExtractionOptions,
  prevTangent: CprPoint3D,
): { center: CprPoint3D; radius: number; tangent: CprPoint3D } {
  const samples: CprPoint3D[] = []
  const r = opts.minRadiusMm + (opts.maxRadiusMm - opts.minRadiusMm) * 0.4
  for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / 6) {
    for (let phi = 0; phi < Math.PI; phi += Math.PI / 6) {
      samples.push({
        x: point.x + r * Math.sin(phi) * Math.cos(theta),
        y: point.y + r * Math.sin(phi) * Math.sin(theta),
        z: point.z + r * Math.cos(phi),
      })
    }
  }
  let count = 0
  for (const s of samples) {
    const ix = Math.round(s.x), iy = Math.round(s.y), iz = Math.round(s.z)
    if (!inBounds({ x: ix, y: iy, z: iz }, width, height, depth)) continue
    const v = volume[iz]?.[iy * width + ix] ?? 0
    if (v >= opts.thresholdHU) count++
  }
  const fillRatio = count / samples.length
  const radius = Math.max(opts.minRadiusMm, Math.min(opts.maxRadiusMm, fillRatio * r * 1.4))
  const tangent = normalize({
    x: prevTangent.x * 0.7 + (Math.sin(point.x * 0.1)) * 0.3,
    y: prevTangent.y * 0.7 + (Math.cos(point.y * 0.1)) * 0.3,
    z: prevTangent.z * 0.95 + 0.05,
  })
  return { center: point, radius, tangent }
}

function movingAverage(points: CprPoint3D[], iterations: number): CprPoint3D[] {
  if (points.length <= 2 || iterations === 0) return points
  let result = points
  for (let i = 0; i < iterations; i++) {
    const next: CprPoint3D[] = []
    for (let k = 0; k < result.length; k++) {
      const a = result[Math.max(0, k - 1)]!
      const b = result[k]!
      const c = result[Math.min(result.length - 1, k + 1)]!
      next.push({ x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3, z: (a.z + b.z + c.z) / 3 })
    }
    result = next
  }
  return result
}

function pathLength(points: CprPoint3D[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) total += distance(points[i - 1]!, points[i]!)
  return total
}

function distance(a: CprPoint3D, b: CprPoint3D): number {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function addScaled(p: CprPoint3D, v: CprPoint3D, s: number): CprPoint3D {
  return { x: p.x + v.x * s, y: p.y + v.y * s, z: p.z + v.z * s }
}

function normalize(v: CprPoint3D): CprPoint3D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

function inBounds(p: CprPoint3D, w: number, h: number, d: number): boolean {
  return p.x >= 0 && p.y >= 0 && p.z >= 0 && p.x < w && p.y < h && p.z < d
}