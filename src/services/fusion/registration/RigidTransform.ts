// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 6-DOF 刚体变换
// 平移(3) + 旋转(3) 欧拉角 (ZYX 内旋)
// 矩阵形式 4x4 列主序,作用于齐次坐标
// ============================================================

import type { Point3D } from '../../../types/fusion'

/** 6-DOF 刚体参数 (旋转用弧度) */
export interface RigidParams {
  tx: number
  ty: number
  tz: number
  /** 绕 X 轴旋转 (弧度,roll) */
  rx: number
  /** 绕 Y 轴旋转 (弧度,pitch) */
  ry: number
  /** 绕 Z 轴旋转 (弧度,yaw) */
  rz: number
}

export const IDENTITY_RIGID: RigidParams = {
  tx: 0,
  ty: 0,
  tz: 0,
  rx: 0,
  ry: 0,
  rz: 0,
}

/** 4x4 单位矩阵 */
export function identity4(): number[][] {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]
}

/** 欧拉角 ZYX -> 旋转矩阵 (返回 3x3) */
export function eulerToMatrix(rx: number, ry: number, rz: number): number[][] {
  const cx = Math.cos(rx)
  const sx = Math.sin(rx)
  const cy = Math.cos(ry)
  const sy = Math.sin(ry)
  const cz = Math.cos(rz)
  const sz = Math.sin(rz)
  // Rz * Ry * Rx
  return [
    [cy * cz, sx * sy * cz - cx * sz, cx * sy * cz + sx * sz],
    [cy * sz, sx * sy * sz + cx * cz, cx * sy * sz - sx * cz],
    [-sy, sx * cy, cx * cy],
  ]
}

/** 旋转矩阵 -> 欧拉角 (ZYX) */
export function matrixToEuler(m: number[][]): { rx: number; ry: number; rz: number } {
  const sy = -(m[2]?.[0] ?? 0)
  const cy = Math.sqrt(Math.max(0, 1 - sy * sy))
  let rx = 0
  let ry = 0
  let rz = 0
  if (cy > 1e-6) {
    rx = Math.atan2(m[2]?.[1] ?? 0, m[2]?.[2] ?? 0)
    ry = Math.atan2(sy, cy)
    rz = Math.atan2(m[1]?.[0] ?? 0, m[0]?.[0] ?? 0)
  } else {
    rx = 0
    ry = sy > 0 ? Math.PI / 2 : -Math.PI / 2
    rz = Math.atan2(-(m[0]?.[1] ?? 0), m[1]?.[1] ?? 0)
  }
  return { rx, ry, rz }
}

/** 构造 4x4 齐次刚体矩阵 */
export function rigidToMatrix(p: RigidParams): number[][] {
  const r = eulerToMatrix(p.rx, p.ry, p.rz)
  const m00 = r[0]?.[0] ?? 1
  const m01 = r[0]?.[1] ?? 0
  const m02 = r[0]?.[2] ?? 0
  const m10 = r[1]?.[0] ?? 0
  const m11 = r[1]?.[1] ?? 1
  const m12 = r[1]?.[2] ?? 0
  const m20 = r[2]?.[0] ?? 0
  const m21 = r[2]?.[1] ?? 0
  const m22 = r[2]?.[2] ?? 1
  return [
    [m00, m01, m02, p.tx],
    [m10, m11, m12, p.ty],
    [m20, m21, m22, p.tz],
    [0, 0, 0, 1],
  ]
}

/** 应用刚体变换到点 (前置) */
export function applyRigid(p: RigidParams, point: Point3D): Point3D {
  const r = eulerToMatrix(p.rx, p.ry, p.rz)
  return {
    x: (r[0]?.[0] ?? 1) * point.x + (r[0]?.[1] ?? 0) * point.y + (r[0]?.[2] ?? 0) * point.z + p.tx,
    y: (r[1]?.[0] ?? 0) * point.x + (r[1]?.[1] ?? 1) * point.y + (r[1]?.[2] ?? 0) * point.z + p.ty,
    z: (r[2]?.[0] ?? 0) * point.x + (r[2]?.[1] ?? 0) * point.y + (r[2]?.[2] ?? 1) * point.z + p.tz,
  }
}

/** 矩阵求逆 (4x4 仿射可逆) */
export function invertMatrix(m: number[][]): number[][] {
  const m00 = m[0]?.[0] ?? 1
  const m01 = m[0]?.[1] ?? 0
  const m02 = m[0]?.[2] ?? 0
  const m03 = m[0]?.[3] ?? 0
  const m10 = m[1]?.[0] ?? 0
  const m11 = m[1]?.[1] ?? 1
  const m12 = m[1]?.[2] ?? 0
  const m13 = m[1]?.[3] ?? 0
  const m20 = m[2]?.[0] ?? 0
  const m21 = m[2]?.[1] ?? 0
  const m22 = m[2]?.[2] ?? 1
  const m23 = m[2]?.[3] ?? 0
  return [
    [m00, m10, m20, -(m00 * m03 + m10 * m13 + m20 * m23)],
    [m01, m11, m21, -(m01 * m03 + m11 * m13 + m21 * m23)],
    [m02, m12, m22, -(m02 * m03 + m12 * m13 + m22 * m23)],
    [0, 0, 0, 1],
  ]
}

/** 计算刚体参数对应变换后点集与目标点集的平均距离 (用于评估) */
export function rigidResidual(params: RigidParams, src: Point3D[], dst: Point3D[]): number {
  if (src.length === 0) return 0
  let sum = 0
  for (let i = 0; i < src.length; i++) {
    const p = applyRigid(params, src[i]!)
    const q = dst[i]!
    sum += Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z)
  }
  return sum / src.length
}

/** 求刚体变换最小二乘解 (Kabsch/Procrustes 简化版, 含平移) */
export function solveRigid(src: Point3D[], dst: Point3D[]): RigidParams {
  if (src.length === 0 || src.length !== dst.length) return IDENTITY_RIGID
  const n = src.length
  // centroids
  let csx = 0
  let csy = 0
  let csz = 0
  let cdx = 0
  let cdy = 0
  let cdz = 0
  for (let i = 0; i < n; i++) {
    const s = src[i]
    const d = dst[i]
    if (!s || !d) continue
    csx += s.x
    csy += s.y
    csz += s.z
    cdx += d.x
    cdy += d.y
    cdz += d.z
  }
  csx /= n
  csy /= n
  csz /= n
  cdx /= n
  cdy /= n
  cdz /= n
  // cross-covariance H = sum (src - cs) (dst - cd)^T
  let h00 = 0
  let h01 = 0
  let h02 = 0
  let h10 = 0
  let h11 = 0
  let h12 = 0
  let h20 = 0
  let h21 = 0
  let h22 = 0
  for (let i = 0; i < n; i++) {
    const s = src[i]
    const d = dst[i]
    if (!s || !d) continue
    const sx = s.x - csx
    const sy = s.y - csy
    const sz = s.z - csz
    const dx = d.x - cdx
    const dy = d.y - cdy
    const dz = d.z - cdz
    h00 += sx * dx
    h01 += sx * dy
    h02 += sx * dz
    h10 += sy * dx
    h11 += sy * dy
    h12 += sy * dz
    h20 += sz * dx
    h21 += sz * dy
    h22 += sz * dz
  }
  const H: number[][] = [
    [h00, h01, h02],
    [h10, h11, h12],
    [h20, h21, h22],
  ]
  // SVD of H (simplified: use symmetric 3x3 Jacobi approximation -> use SVD via t(H)*H)
  // For mock: use a direct orthonormalization via Gram-Schmidt
  const R = orthonormalize3(H)
  const r00 = R[0]?.[0] ?? 1
  const r01 = R[0]?.[1] ?? 0
  const r02 = R[0]?.[2] ?? 0
  const r10 = R[1]?.[0] ?? 0
  const r11 = R[1]?.[1] ?? 1
  const r12 = R[1]?.[2] ?? 0
  const r20 = R[2]?.[0] ?? 0
  const r21 = R[2]?.[1] ?? 0
  const r22 = R[2]?.[2] ?? 1
  const { rx, ry, rz } = matrixToEuler(R)
  return {
    tx: cdx - (r00 * csx + r01 * csy + r02 * csz),
    ty: cdy - (r10 * csx + r11 * csy + r12 * csz),
    tz: cdz - (r20 * csx + r21 * csy + r22 * csz),
    rx,
    ry,
    rz,
  }
}

/** Gram-Schmidt 正交化 (无反射修正, 仅供 mock 配准) */
function orthonormalize3(M: number[][]): number[][] {
  const m00 = M[0]?.[0] ?? 0
  const m01 = M[0]?.[1] ?? 0
  const m10 = M[1]?.[0] ?? 0
  const m11 = M[1]?.[1] ?? 0
  const m12 = M[1]?.[2] ?? 0
  const m20 = M[2]?.[0] ?? 0
  // 列向量
  let c0x = m00
  let c0y = m10
  let c0z = m20
  let c1x = m01
  let c1y = m11
  let c1z = m12
  // normalize col 0
  let n0 = Math.hypot(c0x, c0y, c0z)
  if (n0 < 1e-9) n0 = 1
  c0x /= n0
  c0y /= n0
  c0z /= n0
  // col1 -= (col1.col0) col0
  const d10 = c1x * c0x + c1y * c0y + c1z * c0z
  c1x -= d10 * c0x
  c1y -= d10 * c0y
  c1z -= d10 * c0z
  let n1 = Math.hypot(c1x, c1y, c1z)
  if (n1 < 1e-9) n1 = 1
  c1x /= n1
  c1y /= n1
  c1z /= n1
  // col2 = col0 x col1
  const cx = c0y * c1z - c0z * c1y
  const cy = c0z * c1x - c0x * c1z
  const cz = c0x * c1y - c0y * c1x
  // ensure right-handed
  const det = cx * cx + cy * cy + cz * cz
  const c2x = det < 0 ? -cx : cx
  const c2y = det < 0 ? -cy : cy
  const c2z = det < 0 ? -cz : cz
  return [
    [c0x, c1x, c2x],
    [c0y, c1y, c2y],
    [c0z, c1z, c2z],
  ]
}

export const RigidTransform = {
  identity: IDENTITY_RIGID,
  toMatrix: rigidToMatrix,
  apply: applyRigid,
  invert: invertMatrix,
  solve: solveRigid,
  residual: rigidResidual,
  eulerToMatrix,
  matrixToEuler,
}

export default RigidTransform
