import type { TemporalSubtractionResult } from '../../../types/imaging/postprocess'

export interface TemporalSubtractionInput {
  baselineImageId: string
  followUpImageId: string
  baseline: ImageData
  followUp: ImageData
}

export interface TemporalSubtractionOptions {
  alignmentTolerancePx: number
  changeIntensityThreshold: number
  noiseFloor: number
  morphologicalKernel: number
}

const DEFAULT_TEMPORAL_OPTIONS: TemporalSubtractionOptions = {
  alignmentTolerancePx: 1,
  changeIntensityThreshold: 25,
  noiseFloor: 8,
  morphologicalKernel: 3,
}

/**
 * Temporal subtraction service.
 *
 * Computes the per-pixel intensity difference between a baseline and follow-up
 * image (typically used for chest radiograph follow-up to highlight interval
 * change). Performs:
 *   1. Resampling / alignment (translation-only here)
 *   2. Per-pixel signed difference
 *   3. Connected-component labelling to highlight changed regions
 *   4. Aggregate difference statistics
 */
export class TemporalSubtraction {
  private options: TemporalSubtractionOptions

  constructor(options: Partial<TemporalSubtractionOptions> = {}) {
    this.options = { ...DEFAULT_TEMPORAL_OPTIONS, ...options }
  }

  subtract(input: TemporalSubtractionInput): TemporalSubtractionResult {
    const start = performance.now()
    const { baseline, followUp } = input
    if (baseline.width !== followUp.width || baseline.height !== followUp.height) {
      throw new Error('Baseline and follow-up dimensions must match')
    }
    const w = baseline.width
    const h = baseline.height
    const aligned = this.align(followUp, baseline)
    const result = this.buildSubtractionCanvas(w, h)
    const data = result.data
    let min = Infinity, max = -Infinity, sum = 0, sumSq = 0, nonZero = 0
    const len = w * h
    for (let i = 0; i < len; i++) {
      const b = baseline.data[i * 4] ?? 0
      const f = aligned.data[i * 4] ?? 0
      const delta = f - b
      if (Math.abs(delta) > this.options.noiseFloor) {
        sum += delta
        sumSq += delta * delta
        nonZero++
        if (delta < min) min = delta
        if (delta > max) max = delta
      }
      const normalized = Math.max(-1, Math.min(1, delta / 128))
      const r = normalized > 0 ? Math.round(normalized * 255) : 0
      const g = Math.round(Math.abs(normalized) * 64)
      const b2 = normalized < 0 ? Math.round(-normalized * 255) : 0
      data[i * 4] = r
      data[i * 4 + 1] = g
      data[i * 4 + 2] = b2
      data[i * 4 + 3] = 255
    }
    const mean = nonZero > 0 ? sum / nonZero : 0
    const stdDev = nonZero > 0 ? Math.sqrt(Math.max(0, sumSq / nonZero - mean * mean)) : 0
    const nonZeroRatio = nonZero / len

    const changedRegions = this.findChangedRegions(result, this.options.changeIntensityThreshold)
    const alignmentError = this.alignmentError(baseline, aligned)

    return {
      baselineImageId: input.baselineImageId,
      followUpImageId: input.followUpImageId,
      width: w,
      height: h,
      subtractionImage: result,
      differenceStats: {
        min: Number.isFinite(min) ? round(min, 2) : 0,
        max: Number.isFinite(max) ? round(max, 2) : 0,
        mean: round(mean, 2),
        stdDev: round(stdDev, 2),
        nonZeroRatio: round(nonZeroRatio, 4),
      },
      changedRegions,
      alignmentError: round(alignmentError, 2),
      processingTimeMs: Math.round(performance.now() - start),
    }
  }

  private align(followUp: ImageData, baseline: ImageData): ImageData {
    const shift = this.estimateShift(baseline, followUp)
    const canvas = this.buildSubtractionCanvas(followUp.width, followUp.height)
    const data = canvas.data
    const w = followUp.width, h = followUp.height
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const sx = Math.max(0, Math.min(w - 1, x + shift.dx))
        const sy = Math.max(0, Math.min(h - 1, y + shift.dy))
        const srcIdx = (sy * w + sx) * 4
        const dstIdx = (y * w + x) * 4
        data[dstIdx] = followUp.data[srcIdx] ?? 0
        data[dstIdx + 1] = followUp.data[srcIdx + 1] ?? 0
        data[dstIdx + 2] = followUp.data[srcIdx + 2] ?? 0
        data[dstIdx + 3] = followUp.data[srcIdx + 3] ?? 0
      }
    }
    return canvas
  }

  private estimateShift(baseline: ImageData, followUp: ImageData): { dx: number; dy: number } {
    let bestDx = 0, bestDy = 0, bestScore = -Infinity
    const range = Math.max(1, Math.floor(this.options.alignmentTolerancePx))
    const step = 2
    for (let dy = -range; dy <= range; dy += step) {
      for (let dx = -range; dx <= range; dx += step) {
        let score = 0
        const samples = 64
        for (let s = 0; s < samples; s++) {
          const x = Math.floor((s / samples) * baseline.width)
          const y = Math.floor((s / samples) * baseline.height)
          const bx = Math.max(0, Math.min(baseline.width - 1, x))
          const by = Math.max(0, Math.min(baseline.height - 1, y))
          const fx = Math.max(0, Math.min(baseline.width - 1, x + dx))
          const fy = Math.max(0, Math.min(baseline.height - 1, y + dy))
          const b = baseline.data[(by * baseline.width + bx) * 4] ?? 0
          const f = followUp.data[(fy * baseline.width + fx) * 4] ?? 0
          score -= Math.abs(b - f)
        }
        if (score > bestScore) {
          bestScore = score
          bestDx = dx
          bestDy = dy
        }
      }
    }
    return { dx: bestDx, dy: bestDy }
  }

  private alignmentError(a: ImageData, b: ImageData): number {
    let sum = 0, count = 0
    for (let i = 0; i < a.data.length; i += 16) {
      const av = a.data[i] ?? 0
      const bv = b.data[i] ?? 0
      sum += Math.abs(av - bv)
      count++
    }
    return count > 0 ? sum / count : 0
  }

  private findChangedRegions(image: ImageData, threshold: number) {
    const regions: { x: number; y: number; width: number; height: number; deltaIntensity: number }[] = []
    const visited = new Uint8Array(image.width * image.height)
    for (let y = 0; y < image.height; y += 4) {
      for (let x = 0; x < image.width; x += 4) {
        const idx = y * image.width + x
        if (visited[idx]) continue
        const intensity = Math.abs((image.data[idx * 4] ?? 0) - (image.data[idx * 4 + 2] ?? 0))
        if (intensity < threshold) { visited[idx] = 1; continue }
        let minX = x, minY = y, maxX = x, maxY = y, delta = 0, count = 0
        const queue: number[] = [idx]
        visited[idx] = 1
        while (queue.length > 0) {
          const head = queue.pop()!
          const hx = head % image.width
          const hy = Math.floor(head / image.width)
          if (hx < minX) minX = hx; if (hy < minY) minY = hy
          if (hx > maxX) maxX = hx; if (hy > maxY) maxY = hy
          delta += (image.data[head * 4] ?? 0) - (image.data[head * 4 + 2] ?? 0)
          count++
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = hx + dx, ny = hy + dy
            if (nx < 0 || ny < 0 || nx >= image.width || ny >= image.height) continue
            const nIdx = ny * image.width + nx
            if (visited[nIdx]) continue
            const ni = Math.abs((image.data[nIdx * 4] ?? 0) - (image.data[nIdx * 4 + 2] ?? 0))
            if (ni < threshold) { visited[nIdx] = 1; continue }
            visited[nIdx] = 1
            queue.push(nIdx)
          }
        }
        regions.push({ x: minX, y: minY, width: maxX - minX, height: maxY - minY, deltaIntensity: round(delta / Math.max(1, count), 2) })
      }
    }
    return regions.slice(0, 50)
  }

  private buildSubtractionCanvas(width: number, height: number): ImageData {
    if (typeof document === 'undefined') {
      return {
        width, height,
        data: new Uint8ClampedArray(width * height * 4),
        colorSpace: 'srgb',
      } as unknown as ImageData
    }
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    return ctx.createImageData(width, height)
  }
}

function round(value: number, digits: number): number {
  const p = 10 ** digits
  return Math.round(value * p) / p
}