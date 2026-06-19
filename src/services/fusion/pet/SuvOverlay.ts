// ============================================================
// G005 放射RIS系统 v3.0.6.5 - PET SUV 叠加
// 计算 SUV 映射, 阈值过滤, 颜色表查找, 体积统计
// ============================================================

import type { SuvConfig, SuvColorMapType, SuvColorMap, SuvOverlay, SuvStats } from '../../../types/fusion'
import { DEFAULT_SUV_CONFIG, SUV_COLOR_MAPS } from '../../../data/fusionMock'

/** RGB 颜色内插 (按归一化 t) */
export function sampleColorMap(map: SuvColorMap, t: number): [number, number, number] {
  const tc = Math.max(0, Math.min(1, t))
  const stops = map.stops
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]!
    const b = stops[i + 1]!
    if (tc >= a.t && tc <= b.t) {
      const span = b.t - a.t || 1
      const f = (tc - a.t) / span
      return [
        Math.round(a.rgb[0]! + (b.rgb[0]! - a.rgb[0]!) * f),
        Math.round(a.rgb[1]! + (b.rgb[1]! - a.rgb[1]!) * f),
        Math.round(a.rgb[2]! + (b.rgb[2]! - a.rgb[2]!) * f),
      ]
    }
  }
  const last = stops[stops.length - 1]!
  return [last.rgb[0]!, last.rgb[1]!, last.rgb[2]!]
}

/** 颜色映射名 -> 颜色表 */
export function colorMap(type: SuvColorMapType): SuvColorMap {
  return SUV_COLOR_MAPS[type] ?? SUV_COLOR_MAPS.hot!
}

/** SUV 阈值过滤 (返回布尔 mask) */
export function threshold(suvMap: Float32Array, value: number): Uint8Array {
  const mask = new Uint8Array(suvMap.length)
  for (let i = 0; i < suvMap.length; i++) {
    if (suvMap[i]! >= value) mask[i] = 1
  }
  return mask
}

/** SUV 直方图 (默认 64 bin) */
export function suvHistogram(suvMap: Float32Array, maxSuv: number, bins = 64): number[] {
  const hist = new Array<number>(bins).fill(0)
  const step = maxSuv / bins
  for (let i = 0; i < suvMap.length; i++) {
    const v = suvMap[i]!
    if (v <= 0 || v > maxSuv) continue
    const b = Math.min(bins - 1, Math.floor(v / step))
    hist[b]! += 1
  }
  return hist
}

/** 体积统计 */
export function computeStats(suvMap: Float32Array, mask: Uint8Array, config: SuvConfig, pixelVolumeMl: number): SuvStats {
  let max = 0
  let sum = 0
  let n = 0
  let lesionN = 0
  let lesionSum = 0
  for (let i = 0; i < suvMap.length; i++) {
    const v = suvMap[i]!
    if (v > 0) {
      if (v > max) max = v
      sum += v
      n++
    }
    if (mask[i]) {
      lesionN++
      lesionSum += v
    }
  }
  const mean = n === 0 ? 0 : sum / n
  const metabolicVolume = lesionN * pixelVolumeMl
  const tlg = lesionSum * pixelVolumeMl
  return {
    suvMax: Number(max.toFixed(2)),
    suvMean: Number(mean.toFixed(2)),
    metabolicVolume: Number(metabolicVolume.toFixed(2)),
    totalLesionGlycolysis: Number(tlg.toFixed(2)),
    histogram: suvHistogram(suvMap, config.maxSuv),
  }
}

/** 模拟 PET SUV 体素图 (基于 studyId hash -> 球形热点) */
function generateMockSuvMap(study: { studyId: string; imageIds?: string[]; modality?: string }, width: number, height: number): Float32Array {
  const map = new Float32Array(width * height)
  if (!study.modality || !/pet/i.test(study.modality)) {
    for (let i = 0; i < map.length; i++) {
      map[i] = 0.3 + ((i * 13) % 50) / 200
    }
    return map
  }
  const seed = study.studyId.length * 2654435761
  const cx = (width / 2) + Math.sin(seed) * 18
  const cy = (height / 2) + Math.cos(seed) * 18
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx
      const dy = y - cy
      const r2 = dx * dx + dy * dy
      const lesion = Math.exp(-r2 / 1200) * 9
      const noise = ((Math.sin(x * 0.31 + y * 0.17 + seed) + 1) / 2) * 0.4
      map[y * width + x] = lesion + 0.8 + noise
    }
  }
  return map
}

/**
 * SUV 叠加主类
 * 提供 computeMap() / threshold() / colorMap() 三个核心方法
 */
export class SuvOverlayEngine {
  private config: SuvConfig
  private currentMap: Float32Array | null = null
  private currentStats: SuvStats | null = null
  private currentWidth = 0
  private currentHeight = 0

  constructor(config: Partial<SuvConfig> = {}) {
    this.config = { ...DEFAULT_SUV_CONFIG, ...config }
  }

  setConfig(cfg: Partial<SuvConfig>): void {
    this.config = { ...this.config, ...cfg }
  }

  getConfig(): SuvConfig {
    return { ...this.config }
  }

  /** 设置阈值 */
  threshold(value: number): void {
    this.config = { ...this.config, threshold: value, thresholdEnabled: value > 0 }
  }

  /** 设置颜色表 */
  colorMap(type: SuvColorMapType): void {
    this.config = { ...this.config, colorMap: type }
  }

  /** 设置不透明度 */
  setOpacity(o: number): void {
    this.config = { ...this.config, opacity: Math.max(0, Math.min(1, o)) }
  }

  /** 计算 SUV 映射 (主入口) */
  computeMap(study: { studyId: string; imageIds?: string[]; modality?: string }, width = 256, height = 256, pixelVolumeMl = 0.5): SuvOverlay {
    this.currentWidth = width
    this.currentHeight = height
    this.currentMap = generateMockSuvMap(study, width, height)
    const mask = this.thresholdEnabled() ? threshold(this.currentMap, this.config.threshold) : new Uint8Array(width * height).fill(1)
    this.currentStats = computeStats(this.currentMap, mask, this.config, pixelVolumeMl)
    return {
      imageId: study.imageIds?.[0] ?? study.studyId,
      width,
      height,
      suvMap: this.currentMap,
      config: { ...this.config },
      stats: this.currentStats,
    }
  }

  getMap(): Float32Array | null {
    return this.currentMap
  }

  getStats(): SuvStats | null {
    return this.currentStats
  }

  getWidth(): number {
    return this.currentWidth
  }

  getHeight(): number {
    return this.currentHeight
  }

  /** 像素 -> RGBA 颜色 (含 alpha) */
  pixelToRgba(suv: number): [number, number, number, number] {
    if (this.config.thresholdEnabled && suv < this.config.threshold) {
      return [0, 0, 0, 0]
    }
    const t = Math.max(0, Math.min(1, suv / this.config.maxSuv))
    const map = colorMap(this.config.colorMap)
    const [r, g, b] = sampleColorMap(map, t)
    const alpha = Math.round(255 * this.config.opacity)
    return [r, g, b, alpha]
  }

  private thresholdEnabled(): boolean {
    return this.config.thresholdEnabled && this.config.threshold > 0
  }
}

export const suvOverlay = new SuvOverlayEngine()

export default SuvOverlayEngine
