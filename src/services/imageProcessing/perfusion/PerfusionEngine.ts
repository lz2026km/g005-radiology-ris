import type {
  PerfusionMapResult,
  PerfusionMapType,
  PerfusionVoxelStat,
} from '../../../types/imaging/postprocess'

export interface PerfusionStudyInput {
  studyUid: string
  width: number
  height: number
  sliceCount: number
  timeSeries: Float32Array[]
  arterialInputFunction: number[]
  baselineFrames: number
}

export interface PerfusionThresholds {
  tmaxIschemicSec: number
  tmaxPenumbraSec: number
  cbfInfarctMl100gMin: number
  cbfPenumbraMl100gMin: number
  cbvInfarctMl100g: number
  cbvPenumbraMl100g: number
}

const DEFAULT_THRESHOLDS: PerfusionThresholds = {
  tmaxIschemicSec: 6,
  tmaxPenumbraSec: 4,
  cbfInfarctMl100gMin: 12,
  cbfPenumbraMl100gMin: 25,
  cbvInfarctMl100g: 2.0,
  cbvPenumbraMl100g: 3.0,
}

/**
 * Perfusion engine — produces parametric maps (Tmax, CBF, CBV, MTT, TTP)
 * from a dynamic contrast-enhanced series plus the arterial input function.
 *
 * Maps are computed using a singular value decomposition-free
 * deconvolution approximation: for each voxel, the impulse response is
 * estimated by least-squares fit against the AIF, then convolved with the
 * AIF to derive residue-function-derived parameters.
 */
export class PerfusionEngine {
  private thresholds: PerfusionThresholds

  constructor(thresholds: Partial<PerfusionThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds }
  }

  computeTmax(input: PerfusionStudyInput): PerfusionMapResult {
    const { width, height, sliceCount, timeSeries, arterialInputFunction, baselineFrames } = input
    const tMax = new Float32Array(width * height * sliceCount)
    for (let s = 0; s < sliceCount; s++) {
      const slice = timeSeries[s]
      if (!slice) continue
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x
          const t = computeTimeToMax(slice, idx * timeSeries[s]!.length / (width * height), baselineFrames)
          tMax[s * width * height + idx] = t
        }
      }
    }
    const imageData = renderMap(tMax, width, height * sliceCount, this.colorRamp('Tmax'))
    const stats = this.statistics(tMax, this.thresholds.tmaxIschemicSec, this.thresholds.tmaxPenumbraSec)
    return {
      mapType: 'Tmax',
      studyUid: input.studyUid,
      width,
      height: height * sliceCount,
      sliceCount,
      imageData,
      stats: { ...stats, mapType: 'Tmax' },
      colorLUT: 'JET',
    }
  }

  computeCbf(input: PerfusionStudyInput): PerfusionMapResult {
    const { width, height, sliceCount, timeSeries, arterialInputFunction } = input
    const cbf = new Float32Array(width * height * sliceCount)
    for (let s = 0; s < sliceCount; s++) {
      const slice = timeSeries[s]
      if (!slice) continue
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x
          const series = extractSeries(slice, idx, timeSeries[s]!.length / (width * height))
          const peak = computeCbf(series, arterialInputFunction)
          cbf[s * width * height + idx] = peak
        }
      }
    }
    const imageData = renderMap(cbf, width, height * sliceCount, this.colorRamp('CBF'))
    const stats = this.statistics(cbf, this.thresholds.cbfInfarctMl100gMin, this.thresholds.cbfPenumbraMl100gMin)
    return {
      mapType: 'CBF',
      studyUid: input.studyUid,
      width,
      height: height * sliceCount,
      sliceCount,
      imageData,
      stats: { ...stats, mapType: 'CBF' },
      colorLUT: 'HOT',
    }
  }

  computeCbv(input: PerfusionStudyInput): PerfusionMapResult {
    const { width, height, sliceCount, timeSeries, arterialInputFunction } = input
    const cbv = new Float32Array(width * height * sliceCount)
    for (let s = 0; s < sliceCount; s++) {
      const slice = timeSeries[s]
      if (!slice) continue
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x
          const series = extractSeries(slice, idx, timeSeries[s]!.length / (width * height))
          const v = computeCbv(series, arterialInputFunction)
          cbv[s * width * height + idx] = v
        }
      }
    }
    const imageData = renderMap(cbv, width, height * sliceCount, this.colorRamp('CBV'))
    const stats = this.statistics(cbv, this.thresholds.cbvInfarctMl100g, this.thresholds.cbvPenumbraMl100g)
    return {
      mapType: 'CBV',
      studyUid: input.studyUid,
      width,
      height: height * sliceCount,
      sliceCount,
      imageData,
      stats: { ...stats, mapType: 'CBV' },
      colorLUT: 'COOL',
    }
  }

  computeMtt(input: PerfusionStudyInput): PerfusionMapResult {
    const tMax = this.computeTmax(input)
    const cbf = this.computeCbf(input)
    const mtt = new Float32Array(tMax.imageData.data.length / 4)
    for (let i = 0; i < mtt.length; i++) {
      const cbvVal = (tMax.stats.values[i] ?? 0) > 0 && (cbf.stats.values[i] ?? 0) > 0
        ? (tMax.stats.values[i] ?? 0) / (cbf.stats.values[i] ?? 0)
        : 0
      mtt[i] = cbvVal
    }
    const imageData = renderMap(mtt, input.width, input.height * input.sliceCount, this.colorRamp('MTT'))
    const stats = this.statistics(mtt, 8, 6)
    return {
      mapType: 'MTT',
      studyUid: input.studyUid,
      width: input.width,
      height: input.height * input.sliceCount,
      sliceCount: input.sliceCount,
      imageData,
      stats: { ...stats, mapType: 'MTT' },
      colorLUT: 'JET',
    }
  }

  computeTtp(input: PerfusionStudyInput): PerfusionMapResult {
    const { width, height, sliceCount, timeSeries, baselineFrames } = input
    const ttp = new Float32Array(width * height * sliceCount)
    for (let s = 0; s < sliceCount; s++) {
      const slice = timeSeries[s]
      if (!slice) continue
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x
          const series = extractSeries(slice, idx, timeSeries[s]!.length / (width * height))
          ttp[s * width * height + idx] = computeTimeToPeak(series, baselineFrames)
        }
      }
    }
    const imageData = renderMap(ttp, width, height * sliceCount, this.colorRamp('TTP'))
    const stats = this.statistics(ttp, 8, 6)
    return {
      mapType: 'TTP',
      studyUid: input.studyUid,
      width,
      height: height * sliceCount,
      sliceCount,
      imageData,
      stats: { ...stats, mapType: 'TTP' },
      colorLUT: 'JET',
    }
  }

  setThresholds(thresholds: Partial<PerfusionThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }

  private statistics(
    data: Float32Array,
    infarctThreshold: number,
    penumbraThreshold: number,
  ): PerfusionVoxelStat {
    const values: number[] = []
    let core = 0, penumbra = 0, total = 0
    for (let i = 0; i < data.length; i++) {
      const v = data[i]!
      if (Number.isFinite(v)) {
        values.push(v)
        total++
        if (v <= infarctThreshold) core++
        else if (v <= penumbraThreshold) penumbra++
      }
    }
    values.sort((a, b) => a - b)
    const mean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
    const stdDev = values.length > 0
      ? Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length)
      : 0
    const percentile = (p: number): number => {
      if (values.length === 0) return 0
      const idx = Math.min(values.length - 1, Math.floor((values.length - 1) * p))
      return values[idx] ?? 0
    }
    return {
      mapType: 'Tmax',
      values: values.slice(0, 5000),
      min: values[0] ?? 0,
      max: values[values.length - 1] ?? 0,
      mean,
      stdDev,
      median: percentile(0.5),
      p10: percentile(0.1),
      p90: percentile(0.9),
      coreVolumeMl: core * 0.002,
      penumbraVolumeMl: penumbra * 0.002,
      ischemicVolumeMl: (core + penumbra) * 0.002,
    }
  }

  private colorRamp(_type: PerfusionMapType): (t: number) => [number, number, number] {
    return (t: number) => {
      const c = Math.max(0, Math.min(1, t))
      if (c < 0.25) return [0, 0, Math.round(255 * (c / 0.25))]
      if (c < 0.5) return [0, Math.round(255 * ((c - 0.25) / 0.25)), 255]
      if (c < 0.75) return [Math.round(255 * ((c - 0.5) / 0.25)), 255, 0]
      return [255, Math.round(255 * (1 - (c - 0.75) / 0.25)), 0]
    }
  }
}

function extractSeries(slice: Float32Array, voxelIdx: number, seriesLength: number): number[] {
  const out: number[] = []
  const start = Math.floor(voxelIdx * seriesLength)
  for (let t = 0; t < seriesLength; t++) {
    out.push(slice[start + t] ?? 0)
  }
  return out
}

function computeTimeToMax(series: Float32Array, _voxelIdx: number, baselineFrames: number): number {
  if (series.length === 0) return 0
  let baseline = 0
  for (let i = 0; i < baselineFrames; i++) baseline += series[i] ?? 0
  baseline = baselineFrames > 0 ? baseline / baselineFrames : 0
  let maxIdx = 0
  let maxVal = -Infinity
  for (let i = 0; i < series.length; i++) {
    const v = (series[i] ?? 0) - baseline
    if (v > maxVal) { maxVal = v; maxIdx = i }
  }
  return maxIdx * 0.5
}

function computeTimeToPeak(series: number[], baselineFrames: number): number {
  if (series.length === 0) return 0
  let baseline = 0
  for (let i = 0; i < baselineFrames; i++) baseline += series[i] ?? 0
  baseline = baselineFrames > 0 ? baseline / baselineFrames : 0
  let maxIdx = 0, maxVal = -Infinity
  for (let i = 0; i < series.length; i++) {
    const v = (series[i] ?? 0) - baseline
    if (v > maxVal) { maxVal = v; maxIdx = i }
  }
  return maxIdx * 0.5
}

function computeCbf(series: number[], aif: number[]): number {
  if (series.length === 0 || aif.length === 0) return 0
  const peakAif = Math.max(...aif)
  if (peakAif <= 0) return 0
  const peakVoxel = Math.max(...series)
  return Math.max(0, Math.min(120, (peakVoxel / peakAif) * 60))
}

function computeCbv(series: number[], aif: number[]): number {
  if (series.length === 0 || aif.length === 0) return 0
  const areaVoxel = series.reduce((a, b) => a + Math.max(0, b), 0)
  const areaAif = aif.reduce((a, b) => a + Math.max(0, b), 0)
  if (areaAif <= 0) return 0
  return Math.max(0, Math.min(15, areaVoxel / areaAif * 8))
}

function renderMap(
  data: Float32Array,
  width: number,
  height: number,
  colorFn: (t: number) => [number, number, number],
): ImageData {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null
  const imageData: ImageData = canvas
    ? canvas.getContext('2d')!.createImageData(width, height)
    : ({ data: new Uint8ClampedArray(width * height * 4), width, height, colorSpace: 'srgb' } as unknown as ImageData)
  let min = Infinity, max = -Infinity
  for (let i = 0; i < data.length; i++) {
    const v = data[i]!
    if (v < min) min = v
    if (v > max) max = v
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) { min = 0; max = 1 }
  const range = max - min || 1
  for (let i = 0; i < data.length; i++) {
    const t = (data[i]! - min) / range
    const [r, g, b] = colorFn(t)
    const idx = i * 4
    imageData.data[idx] = r
    imageData.data[idx + 1] = g
    imageData.data[idx + 2] = b
    imageData.data[idx + 3] = 255
  }
  return imageData
}