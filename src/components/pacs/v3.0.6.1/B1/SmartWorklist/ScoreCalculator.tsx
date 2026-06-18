/**
 * G005 放射RIS系统 v3.0.6.1 - AI 评分计算器
 * 综合:优先级 + 等待时间 + 危急值 + AI 标记 + 病种复杂度
 */
import type { SmartWorklistItem } from './Worklist'

export interface ScoreBreakdown {
  priority: number
  waitTime: number
  critical: number
  ai: number
  complexity: number
  total: number
  reasons: string[]
}

export class ScoreCalculator {
  static compute(item: SmartWorklistItem): ScoreBreakdown {
    const priority = item.priority === 'STAT' ? 0.4 : item.priority === 'URGENT' ? 0.25 : 0.1
    const waitNorm = Math.min(item.waitMin / 120, 1)
    const waitTime = waitNorm * 0.25
    const critical = item.isCritical ? 0.2 : 0
    const ai = item.hasAi ? 0.05 : 0
    const complexity = item.modality === 'MR' || item.modality === 'CT' ? 0.1 : 0.05
    const total = Math.min(priority + waitTime + critical + ai + complexity, 1.0)
    const reasons: string[] = []
    if (item.priority === 'STAT') reasons.push('STAT 急诊')
    if (item.isCritical) reasons.push('危急值')
    if (item.waitMin > 60) reasons.push(`等待 ${item.waitMin} 分钟`)
    if (item.hasAi) reasons.push('AI 已标记')
    return { priority, waitTime, critical, ai, complexity, total, reasons }
  }
}

export const computeScore = ScoreCalculator.compute