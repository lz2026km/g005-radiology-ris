import type { CadResult, CadFinding } from '../../../types/imaging/postprocess'

export interface MammoCadInput {
  studyUid: string
  view: 'CC' | 'MLO'
  width: number
  height: number
  pixels: Uint8ClampedArray
  breastDensity: 'A' | 'B' | 'C' | 'D'
  laterality: 'L' | 'R'
}

export interface MammoCadOptions {
  massThreshold: number
  calcificationThreshold: number
  asymmetryThreshold: number
  distortionThreshold: number
}

const DEFAULT_CAD_OPTIONS: MammoCadOptions = {
  massThreshold: 0.45,
  calcificationThreshold: 0.55,
  asymmetryThreshold: 0.65,
  distortionThreshold: 0.55,
}

/**
 * Mammography CAD (Computer-Aided Detection) service.
 *
 * Identifies potential masses, calcifications, asymmetries and architectural
 * distortions by combining local intensity statistics with morphology-based
 * feature scoring. The output mimics the structure of commercial CAD packages
 * (Hologic / iCAD / Volpara).
 */
export class MammoCadEngine {
  private options: MammoCadOptions

  constructor(options: Partial<MammoCadOptions> = {}) {
    this.options = { ...DEFAULT_CAD_OPTIONS, ...options }
  }

  detect(input: MammoCadInput): CadResult {
    const findings: CadFinding[] = []
    findings.push(...this.detectMasses(input))
    findings.push(...this.detectCalcifications(input))
    findings.push(...this.detectAsymmetry(input))
    findings.push(...this.detectDistortion(input))

    return {
      studyUid: input.studyUid,
      view: input.view,
      findings,
      breastDensity: input.breastDensity,
      overallScore: round(this.aggregateScore(findings), 3),
      processedAt: new Date().toISOString(),
    }
  }

  setOptions(options: Partial<MammoCadOptions>): void {
    this.options = { ...this.options, ...options }
  }

  private detectMasses(input: MammoCadInput): CadFinding[] {
    const out: CadFinding[] = []
    const window = 24
    for (let y = window; y < input.height - window; y += window / 2) {
      for (let x = window; x < input.width - window; x += window / 2) {
        const stats = this.localStats(input, x, y, window)
        if (stats.mean < 100) continue
        const contrast = (stats.mean - 100) / 100
        if (contrast < this.options.massThreshold) continue
        out.push({
          id: `m-${out.length + 1}`,
          type: 'mass',
          location: { view: input.view, side: input.laterality, quadrant: quadrantFor(x, y, input.view) },
          boundingBox: { x: x - window, y: y - window, width: window * 2, height: window * 2 },
          confidence: round(Math.min(1, contrast), 3),
          biRadsSuggestion: this.biRadsFor(contrast, 'mass'),
        })
      }
    }
    return out
  }

  private detectCalcifications(input: MammoCadInput): CadFinding[] {
    const out: CadFinding[] = []
    for (let y = 4; y < input.height - 4; y += 2) {
      for (let x = 4; x < input.width - 4; x += 2) {
        const stats = this.localStats(input, x, y, 6)
        if (stats.max < 220) continue
        const ratio = (stats.max - stats.mean) / Math.max(1, stats.mean)
        if (ratio < this.options.calcificationThreshold) continue
        out.push({
          id: `c-${out.length + 1}`,
          type: 'calcification',
          location: { view: input.view, side: input.laterality, quadrant: quadrantFor(x, y, input.view) },
          boundingBox: { x: x - 4, y: y - 4, width: 8, height: 8 },
          confidence: round(Math.min(1, ratio / 2), 3),
          biRadsSuggestion: this.biRadsFor(ratio / 2, 'calcification'),
        })
      }
    }
    return out
  }

  private detectAsymmetry(input: MammoCadInput): CadFinding[] {
    const out: CadFinding[] = []
    const leftMean = this.halfMean(input, 0)
    const rightMean = this.halfMean(input, 1)
    const asymmetry = Math.abs(leftMean - rightMean) / Math.max(1, leftMean + rightMean)
    if (asymmetry < this.options.asymmetryThreshold) return out
    out.push({
      id: 'a-1',
      type: 'asymmetry',
      location: { view: input.view, side: input.laterality, quadrant: 'global' },
      boundingBox: { x: 0, y: 0, width: input.width, height: input.height },
      confidence: round(Math.min(1, asymmetry), 3),
      biRadsSuggestion: this.biRadsFor(asymmetry, 'asymmetry'),
    })
    return out
  }

  private detectDistortion(input: MammoCadInput): CadFinding[] {
    const out: CadFinding[] = []
    const window = 16
    for (let y = window; y < input.height - window; y += window) {
      for (let x = window; x < input.width - window; x += window) {
        const stats = this.localStats(input, x, y, window)
        const radial = this.radialGradient(input, x, y, window)
        const score = radial / Math.max(1, stats.stdDev)
        if (score < this.options.distortionThreshold) continue
        out.push({
          id: `d-${out.length + 1}`,
          type: 'architectural-distortion',
          location: { view: input.view, side: input.laterality, quadrant: quadrantFor(x, y, input.view) },
          boundingBox: { x: x - window, y: y - window, width: window * 2, height: window * 2 },
          confidence: round(Math.min(1, score), 3),
          biRadsSuggestion: this.biRadsFor(score, 'architectural-distortion'),
        })
      }
    }
    return out
  }

  private localStats(input: MammoCadInput, cx: number, cy: number, w: number): { mean: number; max: number; stdDev: number } {
    let sum = 0, sumSq = 0, max = 0, count = 0
    for (let dy = -w; dy <= w; dy += 2) {
      for (let dx = -w; dx <= w; dx += 2) {
        const x = cx + dx, y = cy + dy
        if (x < 0 || y < 0 || x >= input.width || y >= input.height) continue
        const v = input.pixels[(y * input.width + x) * 4] ?? 0
        sum += v
        sumSq += v * v
        if (v > max) max = v
        count++
      }
    }
    const mean = count > 0 ? sum / count : 0
    const stdDev = count > 0 ? Math.sqrt(Math.max(0, sumSq / count - mean * mean)) : 0
    return { mean, max, stdDev }
  }

  private halfMean(input: MammoCadInput, half: 0 | 1): number {
    const startX = half === 0 ? 0 : Math.floor(input.width / 2)
    const endX = half === 0 ? Math.floor(input.width / 2) : input.width
    let sum = 0, count = 0
    for (let y = 0; y < input.height; y += 4) {
      for (let x = startX; x < endX; x += 4) {
        sum += input.pixels[(y * input.width + x) * 4] ?? 0
        count++
      }
    }
    return count > 0 ? sum / count : 0
  }

  private radialGradient(input: MammoCadInput, cx: number, cy: number, w: number): number {
    let energy = 0
    for (let r = 1; r < w; r += 2) {
      for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / 6) {
        const x = cx + Math.cos(theta) * r
        const y = cy + Math.sin(theta) * r
        if (x < 0 || y < 0 || x >= input.width || y >= input.height) continue
        energy += input.pixels[(y * input.width + x) * 4] ?? 0
      }
    }
    return energy
  }

  private aggregateScore(findings: CadFinding[]): number {
    if (findings.length === 0) return 0
    return findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length
  }

  private biRadsFor(confidence: number, _type: CadFinding['type']): CadFinding['biRadsSuggestion'] {
    if (confidence < 0.2) return 'BI-RADS 1'
    if (confidence < 0.4) return 'BI-RADS 2'
    if (confidence < 0.55) return 'BI-RADS 3'
    if (confidence < 0.7) return 'BI-RADS 4A'
    if (confidence < 0.8) return 'BI-RADS 4B'
    if (confidence < 0.9) return 'BI-RADS 4C'
    return 'BI-RADS 5'
  }
}

function quadrantFor(x: number, y: number, view: 'CC' | 'MLO'): string {
  if (view === 'CC') {
    if (y < 0.33) return x < 0.5 ? 'UOQ' : 'UIQ'
    if (y < 0.66) return x < 0.5 ? 'Central' : 'Central'
    return x < 0.5 ? 'LOQ' : 'LIQ'
  }
  return x < 0.5 ? 'Upper' : 'Lower'
}

function round(value: number, digits: number): number {
  const p = 10 ** digits
  return Math.round(value * p) / p
}

export const CadViewer = MammoCadEngine
export default MammoCadEngine