/**
 * G005 Radiology RIS - Shared Chart Color Palette
 * Aligned with design-system.css tokens
 */
export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#d97706',
  purple: '#7c3aed',
  cyan: '#0891b2',
  amber: '#ca8a04',
  pink: '#db2777',
  deepBlue: '#1e3a5f',
  gray: '#94a3b8',
  grayDark: '#475569',
} as const

export const CHART_PALETTE = [
  '#1e3a5f',
  '#3b82f6',
  '#16a34a',
  '#dc2626',
  '#ca8a04',
  '#7c3aed',
  '#0891b2',
  '#db2777',
] as const

export type ChartColorKey = keyof typeof CHART_COLORS
