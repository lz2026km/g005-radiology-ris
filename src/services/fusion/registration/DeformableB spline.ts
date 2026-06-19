// ============================================================
// G005 放射RIS系统 v3.0.6.5 - B-spline 自由形变 (FFD)
// 三次 B 样条控制点网格, 形变场 φ(x) = x + Σᵢ pᵢ Bᵢ(x)
// ============================================================

import type { Point3D, DeformableField } from '../../../types/fusion'

/** B-spline 形变场配置 */
export interface BSplineConfig {
  /** 控制点网格行列层数 */
  gridSize: { rows: number; cols: number; slices: number }
  /** 控制点间距 (mm) */
  spacing: number
  /** 平滑正则化权重 */
  lambda: number
}

/** 默认配置: 5x5x5 控制点, 8mm 间距 */
export const DEFAULT_BSPLINE_CONFIG: BSplineConfig = {
  gridSize: { rows: 5, cols: 5, slices: 5 },
  spacing: 8,
  lambda: 0.001,
}

/** 三次 B 样条 基函数 (cubic) */
export function cubicBSpline(t: number): number {
  const at = Math.abs(t)
  if (at <= 1) {
    return (4 - 6 * at * at + 3 * at * at * at) / 6
  }
  if (at <= 2) {
    return (2 - at) * (2 - at) * (2 - at) / 6
  }
  return 0
}

/** 构造空形变场 */
export function emptyField(cfg: BSplineConfig = DEFAULT_BSPLINE_CONFIG): DeformableField {
  const { rows, cols, slices } = cfg.gridSize
  const disp: number[][][][] = []
  for (let s = 0; s < slices; s++) {
    const slice: number[][][] = []
    for (let r = 0; r < rows; r++) {
      const row: number[][] = []
      for (let c = 0; c < cols; c++) {
        row.push([0, 0, 0])
      }
      slice.push(row)
    }
    disp.push(slice)
  }
  return {
    gridSize: cfg.gridSize,
    spacing: cfg.spacing,
    displacements: disp,
  }
}

/** 应用形变到点 (三次 B 样条插值) */
export function warpPoint(field: DeformableField, point: Point3D): Point3D {
  const { rows, cols, slices } = field.gridSize
  const { spacing } = field
  // 控制点中心 (假设控制点中心在原点)
  const halfRows = (rows - 1) / 2
  const halfCols = (cols - 1) / 2
  const halfSlices = (slices - 1) / 2
  // 归一化坐标
  const u = point.x / spacing + halfCols
  const v = point.y / spacing + halfRows
  const w = point.z / spacing + halfSlices
  let dx = 0
  let dy = 0
  let dz = 0
  let wTotal = 0
  const i0 = Math.max(0, Math.floor(u) - 1)
  const i1 = Math.min(cols - 1, Math.floor(u) + 2)
  const j0 = Math.max(0, Math.floor(v) - 1)
  const j1 = Math.min(rows - 1, Math.floor(v) + 2)
  const k0 = Math.max(0, Math.floor(w) - 1)
  const k1 = Math.min(slices - 1, Math.floor(w) + 2)
  for (let k = k0; k <= k1; k++) {
    const wz = cubicBSpline(w - k)
    for (let j = j0; j <= j1; j++) {
      const wy = cubicBSpline(v - j)
      for (let i = i0; i <= i1; i++) {
        const wx = cubicBSpline(u - i)
        const wxyz = wx * wy * wz
        const d = field.displacements[k]?.[j]?.[i]
        if (d) {
          dx += d[0]! * wxyz
          dy += d[1]! * wxyz
          dz += d[2]! * wxyz
          wTotal += wxyz
        }
      }
    }
  }
  if (wTotal < 1e-9) {
    return { x: point.x, y: point.y, z: point.z }
  }
  return {
    x: point.x + dx,
    y: point.y + dy,
    z: point.z + dz,
  }
}

/** 形变场弯曲能 (正则化项) - 平方差和 */
export function fieldBendingEnergy(field: DeformableField): number {
  const { rows, cols, slices } = field.gridSize
  let energy = 0
  for (let s = 1; s < slices - 1; s++) {
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        const c0 = field.displacements[s]?.[r]?.[c]
        if (!c0) continue
        const cx1 = field.displacements[s]?.[r]?.[c + 1]
        const cx0 = field.displacements[s]?.[r]?.[c - 1]
        const cy1 = field.displacements[s]?.[r + 1]?.[c]
        const cy0 = field.displacements[s]?.[r - 1]?.[c]
        const cz1 = field.displacements[s + 1]?.[r]?.[c]
        const cz0 = field.displacements[s - 1]?.[r]?.[c]
        if (cx1 && cx0 && cy1 && cy0 && cz1 && cz0) {
          for (let d = 0; d < 3; d++) {
            const dxx = cx1[d]! - 2 * c0[d]! + cx0[d]!
            const dyy = cy1[d]! - 2 * c0[d]! + cy0[d]!
            const dzz = cz1[d]! - 2 * c0[d]! + cz0[d]!
            energy += dxx * dxx + dyy * dyy + dzz * dzz
          }
        }
      }
    }
  }
  return energy
}

/** 形变场最大位移 (mm) */
export function fieldMaxDisplacement(field: DeformableField): number {
  const { rows, cols, slices } = field.gridSize
  let max = 0
  for (let s = 0; s < slices; s++) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const d = field.displacements[s]?.[r]?.[c]
        if (!d) continue
        const n = Math.hypot(d[0]!, d[1]!, d[2]!)
        if (n > max) max = n
      }
    }
  }
  return max
}

/** 构造示例形变场 (呼吸运动模型 - 模拟胸腹部形变) */
export function respiratoryField(cfg: BSplineConfig = DEFAULT_BSPLINE_CONFIG, amplitude = 4): DeformableField {
  const f = emptyField(cfg)
  const { rows, cols, slices } = f.gridSize
  for (let s = 0; s < slices; s++) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const phase = (s / slices) * Math.PI
        f.displacements[s]![r]![c] = [
          amplitude * Math.sin(phase + c * 0.3) * 0.3,
          amplitude * Math.sin(phase + r * 0.4) * 0.5,
          amplitude * Math.cos(phase) * 0.4,
        ]
      }
    }
  }
  return f
}

export const DeformableBSpline = {
  config: DEFAULT_BSPLINE_CONFIG,
  basis: cubicBSpline,
  empty: emptyField,
  warp: warpPoint,
  energy: fieldBendingEnergy,
  maxDisplacement: fieldMaxDisplacement,
  respiratory: respiratoryField,
}

export default DeformableBSpline
