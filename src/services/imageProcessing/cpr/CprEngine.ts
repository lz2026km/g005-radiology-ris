import type {
  CprCenterline,
  CprPath,
  CprPoint3D,
  CprProjectionMode,
} from '../../../types/imaging/postprocess'

export interface CprEngineOptions {
  samplingStepMm: number
  slabThicknessMm: number
  projectionMode: CprProjectionMode
  outputWidth: number
  outputHeight: number
}

export interface CprStudyInput {
  studyUid: string
  volume: Float32Array[]
  width: number
  height: number
  depth: number
  spacing: { x: number; y: number; z: number }
}

const DEFAULT_CPR_OPTIONS: CprEngineOptions = {
  samplingStepMm: 0.5,
  slabThicknessMm: 4,
  projectionMode: 'straightened',
  outputWidth: 1024,
  outputHeight: 96,
}

export class CprEngine {
  private options: CprEngineOptions

  constructor(options: Partial<CprEngineOptions> = {}) {
    this.options = { ...DEFAULT_CPR_OPTIONS, ...options }
  }

  setOptions(options: Partial<CprEngineOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * Extract a vessel centerline from a 3D volume starting at the user-provided seed.
   *
   * Combines a greedy sphere-fitting propagation with a moving-average smoother.
   * Returns a `CprCenterline` describing the path in voxel coordinates.
   */
  extractCenterline(study: CprStudyInput, seedPoint: CprPoint3D): CprCenterline {
    const points: CprPoint3D[] = [{ ...seedPoint }]
    let prevTangent: CprPoint3D = { x: 0, y: 0, z: 1 }
    let prevRadius = this.options.slabThicknessMm / 2

    for (let step = 0; step < 600; step++) {
      const sample = sampleNeighborhood(study, points[points.length - 1]!, prevTangent, this.options.slabThicknessMm)
      if (sample.intensity < 0.35) break
      const tangent = normalize(addScaled(prevTangent, sample.tangent, 0.25))
      const next = addScaled(points[points.length - 1]!, tangent, this.options.samplingStepMm)
      if (!inBounds(next, study)) break
      points.push(next)
      prevTangent = tangent
      prevRadius = sample.radius
      if (points.length > 8 && distance(points[points.length - 1]!, points[0]!) < this.options.samplingStepMm * 1.5) break
    }

    const smoothed = movingAverage(points, 6)
    return {
      id: `cpr-cl-${Date.now().toString(36)}`,
      points: smoothed,
      totalLengthMm: pathLength(smoothed, study.spacing),
      averageRadiusMm: prevRadius,
      confidence: Math.min(1, smoothed.length / 200),
      sourceSeriesUid: study.studyUid,
    }
  }

  /**
   * Generate a CPR path / image from a previously extracted centerline.
   *
   * For each sample along the centerline, we compute a Frenet frame (tangent /
   * up / right) and resample the surrounding slab thickness into a row of the
   * output ImageData. The result is suitable for direct rendering on a canvas.
   */
  generateCprPath(study: CprStudyInput, centerline: CprCenterline): CprPath {
    const { outputWidth, outputHeight, samplingStepMm, projectionMode } = this.options
    const samples = resampleCenterline(centerline, samplingStepMm, study.spacing)
    const halfH = Math.floor(outputHeight / 2)
    const canvas = document.createElement('canvas')
    canvas.width = outputWidth
    canvas.height = outputHeight
    const ctx = canvas.getContext('2d')
    const imageData = ctx ? ctx.createImageData(outputWidth, outputHeight) : null

    const out: CprPath['samples'] = []

    for (let i = 0; i < samples.length && i < outputWidth; i++) {
      const frame = samples[i]!
      out.push(frame)
      if (!imageData) continue
      for (let row = 0; row < outputHeight; row++) {
        const offset = (row - halfH) / halfH
        const probe = addScaled(
          addScaled(frame.position, scale(frame.right, offset * this.options.slabThicknessMm), 1),
          frame.up,
          0,
        )
        const intensity = readVoxel(study, probe)
        const pixel = mapIntensityForMode(intensity, projectionMode)
        const idx = (row * outputWidth + i) * 4
        imageData.data[idx] = pixel
        imageData.data[idx + 1] = pixel
        imageData.data[idx + 2] = pixel
        imageData.data[idx + 3] = 255
      }
    }

    return {
      centerlineId: centerline.id,
      samplingStepMm,
      samples: out,
      projectionMode,
      imageData: imageData ?? undefined,
    }
  }

  getOptions(): CprEngineOptions {
    return { ...this.options }
  }
}

function resampleCenterline(
  centerline: CprCenterline,
  stepMm: number,
  spacing: CprEngineOptions extends never ? never : { x: number; y: number; z: number },
): CprPath['samples'] {
  const out: CprPath['samples'] = []
  if (centerline.points.length < 2) return out
  let traveled = 0
  for (let i = 0; i < centerline.points.length - 1; i++) {
    const a = centerline.points[i]!
    const b = centerline.points[i + 1]!
    const segLen = distance(a, b) * spacing.x
    let dir: CprPoint3D = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
    const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z) || 1
    dir = { x: dir.x / len, y: dir.y / len, z: dir.z / len }
    const tangent = { x: dir.x * spacing.x, y: dir.y * spacing.y, z: dir.z * spacing.z }
    const up = normalize({
      x: -tangent.y,
      y: tangent.x + 0.0001,
      z: tangent.z,
    })
    const right = normalize(cross(tangent, up))
    for (let s = 0; s < segLen; s += stepMm) {
      const t = s / segLen
      const position = {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
      }
      out.push({ position, tangent, up, right })
      traveled += stepMm
      if (traveled >= stepMm * 2048) return out
    }
  }
  return out
}

function sampleNeighborhood(
  study: CprStudyInput,
  point: CprPoint3D,
  prevTangent: CprPoint3D,
  slabMm: number,
): { intensity: number; radius: number; tangent: CprPoint3D } {
  const radius = Math.max(1, Math.min(8, slabMm / 2))
  let count = 0
  let total = 0
  let bestTangent = prevTangent
  let bestIntensity = 0
  for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / 8) {
    for (let r = 0; r < radius; r += 0.5) {
      const probe = {
        x: point.x + r * Math.cos(theta),
        y: point.y + r * Math.sin(theta),
        z: point.z,
      }
      const v = readVoxel(study, probe)
      if (v > 0.55) {
        count++
        total += v
      }
      if (v > bestIntensity) {
        bestIntensity = v
        bestTangent = normalize({
          x: Math.cos(theta) * 0.5,
          y: Math.sin(theta) * 0.5,
          z: 1,
        })
      }
    }
  }
  const intensity = count > 0 ? total / count : 0
  return { intensity, radius, tangent: bestTangent }
}

function readVoxel(study: CprStudyInput, p: CprPoint3D): number {
  const ix = Math.round(p.x), iy = Math.round(p.y), iz = Math.round(p.z)
  if (!inBounds({ x: ix, y: iy, z: iz }, study)) return 0
  const v = study.volume[iz]?.[iy * study.width + ix] ?? 0
  return Math.min(1, Math.max(0, v / 1024))
}

function mapIntensityForMode(value: number, mode: CprProjectionMode): number {
  switch (mode) {
    case 'straightened':
      return Math.round(value * 255)
    case 'stretched': {
      const v = (value - 0.5) * 2
      return Math.round(127.5 + Math.max(-1, Math.min(1, v)) * 127.5)
    }
    case 'cross-section':
      return Math.round(255 * Math.pow(value, 0.7))
  }
}

function cross(a: CprPoint3D, b: CprPoint3D): CprPoint3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
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

function distance(a: CprPoint3D, b: CprPoint3D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

function addScaled(p: CprPoint3D, v: CprPoint3D, s: number): CprPoint3D {
  return { x: p.x + v.x * s, y: p.y + v.y * s, z: p.z + v.z * s }
}

function scale(v: CprPoint3D, s: number): CprPoint3D {
  return { x: v.x * s, y: v.y * s, z: v.z * s }
}

function normalize(v: CprPoint3D): CprPoint3D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

function pathLength(points: CprPoint3D[], spacing: { x: number; y: number; z: number }): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const dx = (points[i]!.x - points[i - 1]!.x) * spacing.x
    const dy = (points[i]!.y - points[i - 1]!.y) * spacing.y
    const dz = (points[i]!.z - points[i - 1]!.z) * spacing.z
    total += Math.sqrt(dx * dx + dy * dy + dz * dz)
  }
  return total
}

function inBounds(p: CprPoint3D, study: CprStudyInput): boolean {
  return p.x >= 0 && p.y >= 0 && p.z >= 0 && p.x < study.width && p.y < study.height && p.z < study.depth
}