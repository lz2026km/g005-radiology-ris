export type ComplianceStandard = 'acr' | 'lung-rads' | 'recist' | 'bi-rads' | 'pi-rads'

export interface QaCheckResult {
  passed: boolean
  standard: ComplianceStandard
  checkName: string
  score: number
  details: string
  severity: 'critical' | 'warning' | 'info'
}

export interface QaReport {
  examId: string
  modality: string
  overallScore: number
  checks: QaCheckResult[]
  timestamp: string
  recommendedAction?: string
}

export function checkAcrCompliance(imageData: ImageData): QaCheckResult[] {
  const { data, width, height } = imageData
  const results: QaCheckResult[] = []
  let lowContrastCount = 0
  let uniformRegionCount = 0

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i]
    if (gray < 30) lowContrastCount++
  }

  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const idx = (y * width + x) * 4
      const neighbors = [-1, 0, 1].flatMap(dy => [-1, 0, 1].map(dx => {
        const py = Math.min(height - 1, Math.max(0, y + dy))
        const px = Math.min(width - 1, Math.max(0, x + dx))
        return data[(py * width + px) * 4]
      }))
      const mean = neighbors.reduce((a, b) => a + b, 0) / neighbors.length
      const variance = neighbors.reduce((sum, v) => sum + (v - mean) ** 2, 0) / neighbors.length
      if (variance < 50) uniformRegionCount++
    }
  }

  const uniformityScore = Math.min(100, Math.round((uniformRegionCount / ((width / 10) * (height / 10))) * 100))
  results.push({
    passed: uniformityScore > 60,
    standard: 'acr',
    checkName: 'uniformity',
    score: uniformityScore,
    details: `Uniform regions: ${uniformityScore}%`,
    severity: uniformityScore > 60 ? 'info' : 'warning',
  })

  const contrastScore = Math.min(100, Math.round((1 - lowContrastCount / (width * height)) * 100))
  results.push({
    passed: contrastScore > 50,
    standard: 'acr',
    checkName: 'low-contrast-detectability',
    score: contrastScore,
    details: `Low contrast pixels: ${lowContrastCount} of ${width * height}`,
    severity: contrastScore > 50 ? 'info' : 'warning',
  })

  return results
}

export function checkMotionBlur(imageData: ImageData): QaCheckResult {
  const { data, width, height } = imageData
  let edgeStrengthSum = 0
  let count = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      const gray = data[idx]
      const dx = Math.abs(data[idx + 4] - data[idx - 4])
      const dy = Math.abs(data[idx + width * 4] - data[idx - width * 4])
      edgeStrengthSum += Math.sqrt(dx * dx + dy * dy)
      count++
    }
  }

  const avgEdge = edgeStrengthSum / count
  const blurScore = Math.min(100, Math.round((avgEdge / 255) * 100))

  return {
    passed: blurScore > 30,
    standard: 'acr',
    checkName: 'motion-blur',
    score: blurScore,
    details: `Edge strength: ${blurScore}%`,
    severity: blurScore > 30 ? 'info' : 'critical',
  }
}

export function checkCoverage(
  seriesCount: number,
  requiredSeries: string[]
): QaCheckResult {
  const covered = requiredSeries.length > 0 ? (seriesCount / requiredSeries.length) * 100 : 100
  return {
    passed: covered >= 80,
    standard: 'acr',
    checkName: 'coverage',
    score: Math.round(covered),
    details: `Series acquired: ${seriesCount}, Required: ${requiredSeries.length}`,
    severity: covered >= 80 ? 'info' : 'warning',
  }
}

export function runFullQa(
  examId: string,
  modality: string,
  imageData: ImageData,
  seriesCount: number,
  requiredSeries: string[]
): QaReport {
  const checks: QaCheckResult[] = [
    ...checkAcrCompliance(imageData),
    checkMotionBlur(imageData),
    checkCoverage(seriesCount, requiredSeries),
  ]
  const overallScore = Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length)
  const criticalChecks = checks.filter(c => c.severity === 'critical' && !c.passed)

  return {
    examId,
    modality,
    overallScore,
    checks,
    timestamp: new Date().toISOString(),
    recommendedAction: criticalChecks.length > 0
      ? `Immediate re-acquisition recommended: ${criticalChecks.map(c => c.checkName).join(', ')}`
      : overallScore < 60 ? 'Consider re-acquisition' : undefined,
  }
}
