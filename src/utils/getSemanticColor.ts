/**
 * G005 Radiology RIS - Semantic color mapping utility (v3.0.6.8-23c)
 * Maps a numeric value to success/warning/danger color tokens based on
 * configurable thresholds.
 *
 * Usage:
 *   const color = getSemanticColor(95, 'score', { warn: 80, danger: 60 })
 *   // -> '#22c55e' (success)
 *
 * Higher-is-better (default): higher value = success
 *   score, completionRate, utilization, accuracy, etc.
 *
 * Lower-is-better: lower value = success (e.g. errorRate, responseTime)
 *   pass `direction: 'lower-is-better'`
 */

import { CHART_SEMANTIC } from './chartColors'

export type SemanticType =
  | 'score'
  | 'percent'
  | 'utilization'
  | 'count'
  | 'duration'
  | 'errorRate'
  | 'custom'

export interface SemanticThreshold {
  warn: number
  danger: number
}

export interface SemanticOptions {
  warn?: number
  danger?: number
  direction?: 'higher-is-better' | 'lower-is-better'
  customThresholds?: SemanticThreshold
}

const DEFAULT_THRESHOLDS: Record<SemanticType, SemanticThreshold> = {
  score: { warn: 80, danger: 60 },
  percent: { warn: 80, danger: 60 },
  utilization: { warn: 60, danger: 40 },
  count: { warn: 0, danger: 0 },
  duration: { warn: 60, danger: 120 },
  errorRate: { warn: 5, danger: 10 },
  custom: { warn: 0, danger: 0 },
}

export type SemanticTone = 'success' | 'warning' | 'danger' | 'neutral'

export function getSemanticTone(
  value: number,
  type: SemanticType = 'percent',
  options: SemanticOptions = {},
): SemanticTone {
  const t = options.customThresholds ?? {
    warn: options.warn ?? DEFAULT_THRESHOLDS[type].warn,
    danger: options.danger ?? DEFAULT_THRESHOLDS[type].danger,
  }
  const direction = options.direction ?? 'higher-is-better'

  if (direction === 'higher-is-better') {
    if (value >= t.warn) return 'success'
    if (value >= t.danger) return 'warning'
    return 'danger'
  }
  if (value <= t.warn) return 'success'
  if (value <= t.danger) return 'warning'
  return 'danger'
}

export function getSemanticColor(
  value: number,
  type: SemanticType = 'percent',
  options: SemanticOptions = {},
): string {
  const tone = getSemanticTone(value, type, options)
  switch (tone) {
    case 'success':
      return CHART_SEMANTIC.success
    case 'warning':
      return CHART_SEMANTIC.warning
    case 'danger':
      return CHART_SEMANTIC.danger
    default:
      return CHART_SEMANTIC.neutral
  }
}

export function getSemanticBg(
  value: number,
  type: SemanticType = 'percent',
  options: SemanticOptions = {},
): string {
  const tone = getSemanticTone(value, type, options)
  switch (tone) {
    case 'success':
      return CHART_SEMANTIC.successBg
    case 'warning':
      return CHART_SEMANTIC.warningBg
    case 'danger':
      return CHART_SEMANTIC.dangerBg
    default:
      return CHART_SEMANTIC.neutralBg
  }
}

export function getSemanticLabel(tone: SemanticTone): string {
  switch (tone) {
    case 'success':
      return '正常'
    case 'warning':
      return '警告'
    case 'danger':
      return '异常'
    default:
      return '未知'
  }
}
