// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 配准度量指标
// TRE (Target Registration Error) / Jacobian 行列式
// ============================================================

import type { Point3D, DeformableField, LandmarkPair } from '../../../types/fusion'
import { diceCoefficient, type DiceResult } from './DiceCoefficient'
export { fieldMaxDisplacement } from '../registration/DeformableB spline'

/** TRE = sqrt(mean(||T(fi) - mi||^2))  (mm) */
export function computeTRE(a: LandmarkPair[] | Point3D[], b?: Point3D[]): number {
  const pairs: Array<[Point3D, Point3D]> = []
  if (Array.isArray(a) && a.length > 0 && 'fixed' in (a[0] as LandmarkPair)) {
    for (const p of a as LandmarkPair[]) {
      pairs.push([p.fixed, p.moving])
    }
  } else {
    if (!b) return 0
    for (let i = 0; i < a.length; i++) {
      const p = a[i] as Point3D | undefined
      const q = b[i]
      if (p && q) pairs.push([p, q])
    }
  }
  if (pairs.length === 0) return 0
  let sum = 0
  for (const [f, m] of pairs) {
    sum += (f.x - m.x) ** 2 + (f.y - m.y) ** 2 + (f.z - m.z) ** 2
  }
  return Number(Math.sqrt(sum / pairs.length).toFixed(3))
}

/** 配对 TRE 详细 (含每点 residual) */
export function computeTREDetailed(pairs: LandmarkPair[]): { tre: number; residuals: Array<{ id: string; residual: number }> } {
  if (pairs.length === 0) return { tre: 0, residuals: [] }
  const residuals: Array<{ id: string; residual: number }> = []
  let sum = 0
  for (const p of pairs) {
    const r = Math.hypot(p.fixed.x - p.moving.x, p.fixed.y - p.moving.y, p.fixed.z - p.moving.z)
    sum += r * r
    residuals.push({ id: p.id, residual: Number(r.toFixed(2)) })
  }
  return {
    tre: Number(Math.sqrt(sum / pairs.length).toFixed(3)),
    residuals,
  }
}

/** 形变场雅可比行列式 (3x3 数值导数) */
export function jacobian(field: DeformableField): {
  values: number[][][]
  min: number
  max: number
  negativePct: number
  determinantNegatives: number
} {
  const { gridSize, displacements, spacing } = field
  const { rows, cols, slices } = gridSize
  const out: number[][][] = []
  let min = Infinity
  let max = -Infinity
  let negativeCount = 0
  let total = 0
  for (let s = 0; s < slices; s++) {
    const slice: number[][] = []
    for (let r = 0; r < rows; r++) {
      const row: number[] = []
      for (let c = 0; c < cols; c++) {
        const d = displacements[s]?.[r]?.[c]
        if (!d) {
          row.push(1)
          total++
          continue
        }
        // 数值偏导: ∂φ/∂x ≈ (d(c+1)-d(c-1)) / (2*spacing) + I
        const dx = d[0]!
        const dy = d[1]!
        const dz = d[2]!
        const dc1 = displacements[s]?.[r]?.[c + 1]?.[0] ?? dx
        const dc0 = displacements[s]?.[r]?.[c - 1]?.[0] ?? dx
        const dr1 = displacements[s]?.[r + 1]?.[c]?.[1] ?? dy
        const dr0 = displacements[s]?.[r - 1]?.[c]?.[1] ?? dy
        const ds1 = displacements[s + 1]?.[r]?.[c]?.[2] ?? dz
        const ds0 = displacements[s - 1]?.[r]?.[c]?.[2] ?? dz
        const dxx = (dc1 - dc0) / (2 * spacing) + 1
        const dyy = (dr1 - dr0) / (2 * spacing) + 1
        const dzz = (ds1 - ds0) / (2 * spacing) + 1
        // 简化: 仅用对角项作行列式下界 (mock 用, 实际应包含非对角剪切)
        const det = dxx * dyy * dzz
        row.push(det)
        if (det < min) min = det
        if (det > max) max = det
        if (det < 0) negativeCount++
        total++
      }
      slice.push(row)
    }
    out.push(slice)
  }
  return {
    values: out,
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    negativePct: total === 0 ? 0 : Number(((negativeCount / total) * 100).toFixed(2)),
    determinantNegatives: negativeCount,
  }
}

/** 形变场平滑性: 弯曲能 (弯曲能越小, 形变越平滑) */
export function fieldSmoothness(field: DeformableField): number {
  const { gridSize, displacements } = field
  const { rows, cols, slices } = gridSize
  let energy = 0
  let n = 0
  for (let s = 1; s < slices - 1; s++) {
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        const c0 = displacements[s]?.[r]?.[c]
        if (!c0) continue
        for (let d = 0; d < 3; d++) {
          const dxx = ((displacements[s]?.[r]?.[c + 1]?.[d] ?? c0[d]!) - 2 * c0[d]! + (displacements[s]?.[r]?.[c - 1]?.[d] ?? c0[d]!))
          const dyy = ((displacements[s]?.[r + 1]?.[c]?.[d] ?? c0[d]!) - 2 * c0[d]! + (displacements[s]?.[r - 1]?.[c]?.[d] ?? c0[d]!))
          const dzz = ((displacements[s + 1]?.[r]?.[c]?.[d] ?? c0[d]!) - 2 * c0[d]! + (displacements[s - 1]?.[r]?.[c]?.[d] ?? c0[d]!))
          energy += dxx * dxx + dyy * dyy + dzz * dzz
        }
        n++
      }
    }
  }
  return n === 0 ? 0 : Number((energy / n).toFixed(4))
}

/** Dice 包装 (用于配准 ROI 比较) */
export function computeDice(maskA: Uint8Array | boolean[], maskB: Uint8Array | boolean[]): DiceResult {
  return diceCoefficient(maskA, maskB)
}

/** 配准综合评分 (0-100) */
export function overallScore(tre: number, dice: number, jacobianNeg: number, ncc: number): number {
  const treS = Math.max(0, Math.min(1, 1 - tre / 5))
  const diceS = Math.max(0, Math.min(1, dice))
  const jacS = Math.max(0, Math.min(1, 1 - jacobianNeg / 5))
  const nccS = Math.max(0, Math.min(1, ncc))
  return Math.round(((treS * 0.3 + diceS * 0.4 + jacS * 0.15 + nccS * 0.15) * 100))
}

export const RegistrationMetrics = {
  tre: computeTRE,
  treDetailed: computeTREDetailed,
  jacobian,
  smoothness: fieldSmoothness,
  dice: computeDice,
  score: overallScore,
}

export default RegistrationMetrics
