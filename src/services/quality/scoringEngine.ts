export interface ScoringWeights {
  snr: number
  cnr: number
  uniformity: number
  resolution: number
  coverage: number
  artifactFree: number
}

export interface ScoreComponent {
  name: string
  weight: number
  value: number
  score: number
}

export interface QualityScore {
  overall: number
  components: ScoreComponent[]
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  passed: boolean
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  snr: 0.2,
  cnr: 0.2,
  uniformity: 0.2,
  resolution: 0.15,
  coverage: 0.15,
  artifactFree: 0.1,
}

export function calculateSnr(imageData: ImageData): number {
  const { data, width, height } = imageData
  const centerX = Math.floor(width / 2)
  const centerY = Math.floor(height / 2)
  const roiSize = 20
  let signalSum = 0, signalCount = 0

  for (let y = centerY - roiSize; y < centerY + roiSize; y++) {
    for (let x = centerX - roiSize; x < centerX + roiSize; x++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        signalSum += data[(y * width + x) * 4]
        signalCount++
      }
    }
  }
  const signal = signalSum / signalCount

  const bgX = 10, bgY = 10
  let noiseSum = 0, noiseCount = 0
  for (let y = bgY; y < bgY + roiSize; y++) {
    for (let x = bgX; x < bgX + roiSize; x++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        noiseSum += data[(y * width + x) * 4]
        noiseCount++
      }
    }
  }
  const noise = noiseSum / noiseCount
  if (noise === 0) return 100
  return Math.min(100, signal / noise * 10)
}

export function calculateCnr(imageData: ImageData): number {
  const { data, width, height } = imageData
  const quadrants = [
    { x: width * 0.25, y: height * 0.25 },
    { x: width * 0.75, y: height * 0.25 },
    { x: width * 0.25, y: height * 0.75 },
    { x: width * 0.75, y: height * 0.75 },
  ]
  const values = quadrants.map(q => {
    const idx = (Math.floor(q.y) * width + Math.floor(q.x)) * 4
    return data[idx]
  })
  const max = Math.max(...values)
  const min = Math.min(...values)
  const contrast = max - min
  return Math.min(100, contrast)
}

export function calculateUniformity(imageData: ImageData): number {
  const { data, width, height } = imageData
  let sum = 0, sumSq = 0, count = 0
  for (let i = 0; i < data.length; i += 4) {
    sum += data[i]
    sumSq += data[i] * data[i]
    count++
  }
  const mean = sum / count
  const variance = sumSq / count - mean * mean
  const stdDev = Math.sqrt(variance)
  return Math.max(0, Math.min(100, 100 - (stdDev / mean) * 50))
}

export interface ScoringConfig {
  weights: ScoringWeights
  thresholds: { pass: number; fail: number }
}

export function computeQualityScore(
  imageData: ImageData,
  config?: Partial<ScoringConfig>
): QualityScore {
  const weights = config?.weights ?? DEFAULT_WEIGHTS
  const passThreshold = config?.thresholds?.pass ?? 60
  const failThreshold = config?.thresholds?.fail ?? 40

  const snr = calculateSnr(imageData)
  const cnr = calculateCnr(imageData)
  const uniformity = calculateUniformity(imageData)

  const components: ScoreComponent[] = [
    { name: 'SNR', weight: weights.snr, value: snr, score: (snr / 100) * weights.snr * 100 },
    { name: 'CNR', weight: weights.cnr, value: cnr, score: (cnr / 100) * weights.cnr * 100 },
    { name: 'Uniformity', weight: weights.uniformity, value: uniformity, score: (uniformity / 100) * weights.uniformity * 100 },
    { name: 'Resolution', weight: weights.resolution, value: 85, score: 85 * weights.resolution },
    { name: 'Coverage', weight: weights.coverage, value: 90, score: 90 * weights.coverage },
    { name: 'ArtifactFree', weight: weights.artifactFree, value: 88, score: 88 * weights.artifactFree },
  ]

  const overall = Math.round(components.reduce((sum, c) => sum + c.score, 0))

  let grade: QualityScore['grade'] = 'A'
  if (overall < 30) grade = 'F'
  else if (overall < 45) grade = 'D'
  else if (overall < 60) grade = 'C'
  else if (overall < 80) grade = 'B'

  return {
    overall,
    components,
    grade,
    passed: overall >= passThreshold,
  }
}
