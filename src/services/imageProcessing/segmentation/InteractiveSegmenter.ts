import type {
  SegmentationAlgorithm,
  SegmentationMask,
  SegmentationSeed,
} from '../../../types/imaging/postprocess'

export interface InteractiveSegmentationInput {
  studyUid: string
  width: number
  height: number
  depth: number
  voxelVolume: Float32Array
  seeds: SegmentationSeed[]
  algorithm: SegmentationAlgorithm
}

export interface SegmentationOptions {
  intensityMin: number
  intensityMax: number
  growthThreshold: number
  maxIterations: number
  smoothingKernel: number
}

const DEFAULT_SEGMENTATION_OPTIONS: SegmentationOptions = {
  intensityMin: -200,
  intensityMax: 400,
  growthThreshold: 0.35,
  maxIterations: 80,
  smoothingKernel: 3,
}

/**
 * Interactive segmentation engine.
 *
 * Supports multiple semi-automatic algorithms driven by user-placed seeds:
 *  - `region-growing`   :classic intensity range propagation
 *  - `watershed`        :gradient magnitude + immersion simulation
 *  - `threshold`        :global HU threshold (with optional seeds)
 *  - `random-walker`    :Laplacian-based probability (simplified)
 *  - `grow-cut`         :cellular-automaton label propagation
 */
export class InteractiveSegmenter {
  private options: SegmentationOptions

  constructor(options: Partial<SegmentationOptions> = {}) {
    this.options = { ...DEFAULT_SEGMENTATION_OPTIONS, ...options }
  }

  segment(input: InteractiveSegmentationInput): SegmentationMask {
    const start = performance.now()
    const mask = this.run(input)
    const volume = this.computeVolumeMl(mask, input)
    const bbox = this.computeBoundingBox(mask, input)
    const intensityStats = this.intensityStats(input, mask)
    const processingTimeMs = Math.round(performance.now() - start)
    return {
      id: `seg-${Date.now().toString(36)}`,
      studyUid: input.studyUid,
      algorithm: input.algorithm,
      voxelCount: this.countTrue(mask),
      volumeMl: volume,
      boundingBox: bbox,
      meanIntensityHU: intensityStats.mean,
      stdIntensityHU: intensityStats.std,
      seeds: input.seeds,
      processingTimeMs,
      binaryMask: mask,
    }
  }

  setOptions(options: Partial<SegmentationOptions>): void {
    this.options = { ...this.options, ...options }
  }

  getOptions(): SegmentationOptions {
    return { ...this.options }
  }

  private run(input: InteractiveSegmentationInput): Uint8Array {
    const size = input.width * input.height * input.depth
    switch (input.algorithm) {
      case 'region-growing':
        return this.regionGrowing(input, new Uint8Array(size))
      case 'watershed':
        return this.watershed(input, new Uint8Array(size))
      case 'threshold':
        return this.threshold(input, new Uint8Array(size))
      case 'random-walker':
        return this.randomWalker(input, new Uint8Array(size))
      case 'grow-cut':
        return this.growCut(input, new Uint8Array(size))
    }
  }

  private regionGrowing(input: InteractiveSegmentationInput, mask: Uint8Array): Uint8Array {
    const fg = input.seeds.filter(s => s.label === 'foreground')
    if (fg.length === 0) return this.threshold(input, mask)
    const queue: number[] = []
    const visited = new Uint8Array(mask.length)
    const idx = (s: SegmentationSeed) =>
      s.voxel.z * input.width * input.height + s.voxel.y * input.width + s.voxel.x
    const fgIdx = fg.map(s => idx(s))
    for (const i of fgIdx) {
      mask[i] = 1
      queue.push(i)
      visited[i] = 1
    }
    const meanIntensity = fg.reduce((sum, s) => sum + this.readIntensity(input, s.voxel), 0) / fg.length
    const tolerance = this.options.growthThreshold * 800
    while (queue.length > 0) {
      const head = queue.shift()!
      const x = head % input.width
      const y = Math.floor(head / input.width) % input.height
      const z = Math.floor(head / (input.width * input.height))
      for (const [dx, dy, dz] of NEIGHBORS_6) {
        const nx = x + dx, ny = y + dy, nz = z + dz
        if (nx < 0 || ny < 0 || nz < 0 || nx >= input.width || ny >= input.height || nz >= input.depth) continue
        const nIdx = nz * input.width * input.height + ny * input.width + nx
        if (visited[nIdx]) continue
        const intensity = this.readIntensityInt(input, nx, ny, nz)
        if (Math.abs(intensity - meanIntensity) <= tolerance) {
          mask[nIdx] = 1
          queue.push(nIdx)
        }
        visited[nIdx] = 1
      }
    }
    return mask
  }

  private watershed(input: InteractiveSegmentationInput, mask: Uint8Array): Uint8Array {
    const grad = this.gradientMagnitude(input)
    const queue: number[] = []
    const labels = new Int16Array(mask.length)
    const fgSeeds = input.seeds.filter(s => s.label === 'foreground')
    if (fgSeeds.length === 0) return this.threshold(input, mask)
    for (const s of fgSeeds) {
      const i = s.voxel.z * input.width * input.height + s.voxel.y * input.width + s.voxel.x
      labels[i] = 1
      queue.push(i)
    }
    while (queue.length > 0) {
      queue.sort((a, b) => grad[a]! - grad[b]!)
      const head = queue.shift()!
      const x = head % input.width
      const y = Math.floor(head / input.width) % input.height
      const z = Math.floor(head / (input.width * input.height))
      for (const [dx, dy, dz] of NEIGHBORS_6) {
        const nx = x + dx, ny = y + dy, nz = z + dz
        if (nx < 0 || ny < 0 || nz < 0 || nx >= input.width || ny >= input.height || nz >= input.depth) continue
        const nIdx = nz * input.width * input.height + ny * input.width + nx
        if (labels[nIdx] !== 0) continue
        labels[nIdx] = labels[head]!
        queue.push(nIdx)
      }
    }
    for (let i = 0; i < labels.length; i++) mask[i] = labels[i] === 1 ? 1 : 0
    return mask
  }

  private threshold(input: InteractiveSegmentationInput, mask: Uint8Array): Uint8Array {
    const min = this.options.intensityMin
    const max = this.options.intensityMax
    for (let i = 0; i < input.voxelVolume.length; i++) {
      const v = input.voxelVolume[i]!
      mask[i] = v >= min && v <= max ? 1 : 0
    }
    return mask
  }

  private randomWalker(input: InteractiveSegmentationInput, mask: Uint8Array): Uint8Array {
    const fg = input.seeds.filter(s => s.label === 'foreground')
    const bg = input.seeds.filter(s => s.label === 'background')
    if (fg.length === 0 && bg.length === 0) return this.threshold(input, mask)
    const target = fg.length > 0 ? fg : bg
    const seeds = target.map(s => ({
      voxel: s.voxel,
      strength: s.label === 'foreground' ? 1 : 0,
    }))
    const queue: number[] = []
    const prob = new Float32Array(mask.length)
    for (const s of seeds) {
      const i = s.voxel.z * input.width * input.height + s.voxel.y * input.width + s.voxel.x
      prob[i] = s.strength
      queue.push(i)
    }
    let iterations = 0
    while (queue.length > 0 && iterations < this.options.maxIterations) {
      const head = queue.shift()!
      const x = head % input.width
      const y = Math.floor(head / input.width) % input.height
      const z = Math.floor(head / (input.width * input.height))
      const sum = this.laplacianSum(input, x, y, z)
      const targetProb = (prob[head]! + sum * 0.1) / 1.6
      for (const [dx, dy, dz] of NEIGHBORS_6) {
        const nx = x + dx, ny = y + dy, nz = z + dz
        if (nx < 0 || ny < 0 || nz < 0 || nx >= input.width || ny >= input.height || nz >= input.depth) continue
        const nIdx = nz * input.width * input.height + ny * input.width + nx
        if (Math.abs(prob[nIdx]! - targetProb) > 0.01) {
          prob[nIdx] = (prob[nIdx]! + targetProb) / 2
          queue.push(nIdx)
        }
      }
      iterations++
    }
    for (let i = 0; i < prob.length; i++) mask[i] = prob[i]! >= 0.5 ? 1 : 0
    return mask
  }

  private growCut(input: InteractiveSegmentationInput, mask: Uint8Array): Uint8Array {
    const labels = new Int8Array(mask.length)
    for (const s of input.seeds) {
      const i = s.voxel.z * input.width * input.height + s.voxel.y * input.width + s.voxel.x
      labels[i] = s.label === 'foreground' ? 1 : -1
    }
    const strengths = new Float32Array(mask.length)
    for (let i = 0; i < strengths.length; i++) strengths[i] = input.seeds.some(s => {
      const i2 = s.voxel.z * input.width * input.height + s.voxel.y * input.width + s.voxel.x
      return i === i2
    }) ? 1 : 0
    let changed = true
    let iter = 0
    while (changed && iter < this.options.maxIterations) {
      changed = false
      iter++
      for (let z = 0; z < input.depth; z++) {
        for (let y = 0; y < input.height; y++) {
          for (let x = 0; x < input.width; x++) {
            const i = z * input.width * input.height + y * input.width + x
            const intensity = this.readIntensityInt(input, x, y, z)
            const neighbors: { idx: number; label: number; intensity: number }[] = []
            for (const [dx, dy, dz] of NEIGHBORS_6) {
              const nx = x + dx, ny = y + dy, nz = z + dz
              if (nx < 0 || ny < 0 || nz < 0 || nx >= input.width || ny >= input.height || nz >= input.depth) continue
              const nIdx = nz * input.width * input.height + ny * input.width + nx
              if (labels[nIdx] !== 0) {
                neighbors.push({ idx: nIdx, label: labels[nIdx]!, intensity: this.readIntensityInt(input, nx, ny, nz) })
              }
            }
            if (neighbors.length === 0) continue
            const fg = neighbors.filter(n => n.label === 1).reduce((s, n) => s + (1 - Math.abs(n.intensity - intensity) / 1024), 0)
            const bg = neighbors.filter(n => n.label === -1).reduce((s, n) => s + (1 - Math.abs(n.intensity - intensity) / 1024), 0)
            if (fg > bg && fg > strengths[i]!) {
              labels[i] = 1
              strengths[i] = fg
              changed = true
            } else if (bg > fg && bg > strengths[i]!) {
              labels[i] = -1
              strengths[i] = bg
              changed = true
            }
          }
        }
      }
    }
    for (let i = 0; i < labels.length; i++) mask[i] = labels[i] === 1 ? 1 : 0
    return mask
  }

  private gradientMagnitude(input: InteractiveSegmentationInput): Float32Array {
    const out = new Float32Array(input.voxelVolume.length)
    for (let z = 0; z < input.depth; z++) {
      for (let y = 1; y < input.height - 1; y++) {
        for (let x = 1; x < input.width - 1; x++) {
          const i = z * input.width * input.height + y * input.width + x
          const gx = this.readIntensityInt(input, x + 1, y, z) - this.readIntensityInt(input, x - 1, y, z)
          const gy = this.readIntensityInt(input, x, y + 1, z) - this.readIntensityInt(input, x, y - 1, z)
          const gz = z + 1 < input.depth && z - 1 >= 0
            ? this.readIntensityInt(input, x, y, z + 1) - this.readIntensityInt(input, x, y, z - 1)
            : 0
          out[i] = Math.sqrt(gx * gx + gy * gy + gz * gz)
        }
      }
    }
    return out
  }

  private laplacianSum(input: InteractiveSegmentationInput, x: number, y: number, z: number): number {
    const center = this.readIntensityInt(input, x, y, z)
    let sum = -6 * center
    for (const [dx, dy, dz] of NEIGHBORS_6) {
      const nx = x + dx, ny = y + dy, nz = z + dz
      if (nx < 0 || ny < 0 || nz < 0 || nx >= input.width || ny >= input.height || nz >= input.depth) continue
      sum += this.readIntensityInt(input, nx, ny, nz)
    }
    return sum
  }

  private readIntensity(input: InteractiveSegmentationInput, v: { x: number; y: number; z: number }): number {
    if (v.x < 0 || v.y < 0 || v.z < 0 || v.x >= input.width || v.y >= input.height || v.z >= input.depth) return 0
    return input.voxelVolume[v.z * input.width * input.height + v.y * input.width + v.x] ?? 0
  }

  private readIntensityInt(input: InteractiveSegmentationInput, x: number, y: number, z: number): number {
    if (x < 0 || y < 0 || z < 0 || x >= input.width || y >= input.height || z >= input.depth) return 0
    return input.voxelVolume[z * input.width * input.height + y * input.width + x] ?? 0
  }

  private countTrue(mask: Uint8Array): number {
    let c = 0
    for (let i = 0; i < mask.length; i++) if (mask[i]) c++
    return c
  }

  private computeVolumeMl(mask: Uint8Array, input: InteractiveSegmentationInput): number {
    return this.countTrue(mask) * 0.001
  }

  private computeBoundingBox(mask: Uint8Array, input: InteractiveSegmentationInput) {
    let minX = Infinity, minY = Infinity, minZ = Infinity
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
    for (let z = 0; z < input.depth; z++) {
      for (let y = 0; y < input.height; y++) {
        for (let x = 0; x < input.width; x++) {
          const i = z * input.width * input.height + y * input.width + x
          if (mask[i]) {
            if (x < minX) minX = x; if (y < minY) minY = y; if (z < minZ) minZ = z
            if (x > maxX) maxX = x; if (y > maxY) maxY = y; if (z > maxZ) maxZ = z
          }
        }
      }
    }
    if (!Number.isFinite(minX)) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } }
    }
    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
    }
  }

  private intensityStats(input: InteractiveSegmentationInput, mask: Uint8Array): { mean: number; std: number } {
    let sum = 0, sumSq = 0, count = 0
    for (let i = 0; i < mask.length; i++) {
      if (mask[i]) {
        const v = input.voxelVolume[i] ?? 0
        sum += v
        sumSq += v * v
        count++
      }
    }
    if (count === 0) return { mean: 0, std: 0 }
    const mean = sum / count
    const std = Math.sqrt(Math.max(0, sumSq / count - mean * mean))
    return { mean: round(mean, 2), std: round(std, 2) }
  }
}

const NEIGHBORS_6: [number, number, number][] = [
  [-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1],
]

function round(value: number, digits: number): number {
  const p = 10 ** digits
  return Math.round(value * p) / p
}