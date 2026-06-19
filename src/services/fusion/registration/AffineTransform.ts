// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 12-DOF 仿射变换
// 线性 3x3 (9 DOF) + 平移 (3 DOF), 含缩放/剪切/旋转
// ============================================================

import type { Point3D } from '../../../types/fusion'

/** 12-DOF 仿射参数 (3x3 矩阵行优先) */
export interface AffineParams {
  m00: number
  m01: number
  m02: number
  m10: number
  m11: number
  m12: number
  m20: number
  m21: number
  m22: number
  tx: number
  ty: number
  tz: number
}

export const IDENTITY_AFFINE: AffineParams = {
  m00: 1,
  m01: 0,
  m02: 0,
  m10: 0,
  m11: 1,
  m12: 0,
  m20: 0,
  m21: 0,
  m22: 1,
  tx: 0,
  ty: 0,
  tz: 0,
}

/** 仿射参数 -> 4x4 矩阵 */
export function affineToMatrix(p: AffineParams): number[][] {
  return [
    [p.m00, p.m01, p.m02, p.tx],
    [p.m10, p.m11, p.m12, p.ty],
    [p.m20, p.m21, p.m22, p.tz],
    [0, 0, 0, 1],
  ]
}

/** 应用仿射变换到点 */
export function applyAffine(p: AffineParams, point: Point3D): Point3D {
  return {
    x: p.m00 * point.x + p.m01 * point.y + p.m02 * point.z + p.tx,
    y: p.m10 * point.x + p.m11 * point.y + p.m12 * point.z + p.ty,
    z: p.m20 * point.x + p.m21 * point.y + p.m22 * point.z + p.tz,
  }
}

/** 行列式 (3x3 缩放体积比) */
export function affineDeterminant(p: AffineParams): number {
  return (
    p.m00 * (p.m11 * p.m22 - p.m12 * p.m21) -
    p.m01 * (p.m10 * p.m22 - p.m12 * p.m20) +
    p.m02 * (p.m10 * p.m21 - p.m11 * p.m20)
  )
}

/** 平均残差 (Euclidean) */
export function affineResidual(p: AffineParams, src: Point3D[], dst: Point3D[]): number {
  if (src.length === 0 || src.length !== dst.length) return 0
  let sum = 0
  for (let i = 0; i < src.length; i++) {
    const q = applyAffine(p, src[i]!)
    const r = dst[i]!
    sum += Math.hypot(q.x - r.x, q.y - r.y, q.z - r.z)
  }
  return sum / src.length
}

/** 构造各向同性缩放仿射 */
export function makeScale(sx: number, sy: number, sz: number): AffineParams {
  return { ...IDENTITY_AFFINE, m00: sx, m11: sy, m22: sz }
}

/** 构造剪切仿射 */
export function makeShear(shxy: number, shxz: number, shyx: number, shyz: number, shzx: number, shzy: number): AffineParams {
  return {
    ...IDENTITY_AFFINE,
    m01: shxy,
    m02: shxz,
    m10: shyx,
    m12: shyz,
    m20: shzx,
    m21: shzy,
  }
}

/** 最小二乘解 (12 方程, 直接 normal equations) */
export function solveAffine(src: Point3D[], dst: Point3D[]): AffineParams {
  if (src.length < 4 || src.length !== dst.length) return IDENTITY_AFFINE
  // 构造 12x12 法方程 (X^T X) p = X^T y
  // X 行 = [x,y,z,0,0,0,0,0,0,1,0,0] (m00..tz 对应 x)
  const A: number[][] = Array.from({ length: 12 }, () => new Array(12).fill(0))
  const b: number[][] = Array.from({ length: 12 }, () => new Array(3).fill(0))
  for (let i = 0; i < src.length; i++) {
    const x = src[i]!.x
    const y = src[i]!.y
    const z = src[i]!.z
    const r: number[] = [x, y, z, 0, 0, 0, 0, 0, 0, 1, 0, 0]
    const s: number[] = [0, 0, 0, x, y, z, 0, 0, 0, 0, 1, 0]
    const t: number[] = [0, 0, 0, 0, 0, 0, x, y, z, 0, 0, 1]
    for (let j = 0; j < 12; j++) {
      for (let k = 0; k < 12; k++) {
        A[j]![k]! += r[j]! * r[k]! + s[j]! * s[k]! + t[j]! * t[k]!
      }
      b[j]![0]! += r[j]! * dst[i]!.x + s[j]! * dst[i]!.y + t[j]! * dst[i]!.z
      b[j]![1]! += s[j]! * dst[i]!.x + s[j]! * dst[i]!.y + t[j]! * dst[i]!.z
      b[j]![2]! += t[j]! * dst[i]!.x + s[j]! * dst[i]!.y + t[j]! * dst[i]!.z
    }
  }
  // 简化:Gauss 消元 12x12 (使用简化的 LU)
  const p = gaussSolve(A, b)
  if (!p) return IDENTITY_AFFINE
  return {
    m00: p[0]!,
    m01: p[1]!,
    m02: p[2]!,
    m10: p[3]!,
    m11: p[4]!,
    m12: p[5]!,
    m20: p[6]!,
    m21: p[7]!,
    m22: p[8]!,
    tx: p[9]!,
    ty: p[10]!,
    tz: p[11]!,
  }
}

/** 简化 Gauss 消元 (用于 mock) */
function gaussSolve(A: number[][], b: number[][]): number[] | null {
  const n = 12
  // 复制并增广
  const M: number[][] = []
  for (let i = 0; i < n; i++) {
    const row: number[] = [...A[i]!, b[i]![0]!, b[i]![1]!, b[i]![2]!]
    M.push(row)
  }
  for (let i = 0; i < n; i++) {
    let pivot = i
    let maxAbs = Math.abs(M[i]![i]!)
    for (let k = i + 1; k < n; k++) {
      const v = Math.abs(M[k]![i]!)
      if (v > maxAbs) {
        maxAbs = v
        pivot = k
      }
    }
    if (maxAbs < 1e-9) return null
    if (pivot !== i) {
      const tmp = M[i]!
      M[i] = M[pivot]!
      M[pivot] = tmp
    }
    for (let k = i + 1; k < n; k++) {
      const factor = M[k]![i]! / M[i]![i]!
      for (let j = i; j < n + 3; j++) {
        M[k]![j]! -= factor * M[i]![j]!
      }
    }
  }
  const out: number[] = new Array(n).fill(0)
  // Back-sub 平均 x 列
  for (let col = 0; col < 3; col++) {
    for (let i = n - 1; i >= 0; i--) {
      let sum = M[i]![n + col]!
      for (let j = i + 1; j < n; j++) {
        sum -= M[i]![j]! * out[j]!
      }
      out[i] = sum / M[i]![i]!
    }
  }
  return out
}

export const AffineTransform = {
  identity: IDENTITY_AFFINE,
  toMatrix: affineToMatrix,
  apply: applyAffine,
  determinant: affineDeterminant,
  residual: affineResidual,
  solve: solveAffine,
  makeScale,
  makeShear,
}

export default AffineTransform
