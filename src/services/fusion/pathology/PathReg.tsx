// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 病理-影像配准 (WSI <-> CT/MR)
// 提供 Mock 实现, 解决大体切片 WSI 与术前影像的对位
// ============================================================

import React from 'react'
import type { PathologyRadiologyInput, PathologyRadiologyResult, Point3D } from '../../../types/fusion'
import { solveRigid, rigidToMatrix, rigidResidual } from '../registration/RigidTransform'
import { diceCoefficient } from '../metrics/DiceCoefficient'

/** 计算 WSI 缩放比例 -> 物理尺寸 */
export function wsiScaleToMm(wsiWidth: number, wsiHeight: number, physicalSizeMm: number): number {
  return physicalSizeMm / Math.max(wsiWidth, wsiHeight)
}

/** 病理标注 -> 影像坐标投影 */
export function projectPathPoint(
  wsiPoint: { x: number; y: number },
  scale: number,
  matrix: number[][],
): Point3D {
  // 矩阵 4x4, 取前两行平移/缩放并加 z=0
  return {
    x: matrix[0]![0]! * wsiPoint.x * scale + matrix[0]![1]! * wsiPoint.y * scale + matrix[0]![3]!,
    y: matrix[1]![0]! * wsiPoint.x * scale + matrix[1]![1]! * wsiPoint.y * scale + matrix[1]![3]!,
    z: matrix[2]![3]!,
  }
}

/** 影像标注 -> WSI 像素坐标 */
export function inverseProjectPathPoint(
  radPoint: Point3D,
  scale: number,
  matrix: number[][],
): { x: number; y: number } {
  // 求 2x2 仿射的逆 (简化为 4x4 矩阵前三列前三行)
  const a = matrix[0]![0]! * scale
  const b = matrix[0]![1]! * scale
  const c = matrix[1]![0]! * scale
  const d = matrix[1]![1]! * scale
  const tx = matrix[0]![3]!
  const ty = matrix[1]![3]!
  const det = a * d - b * c
  if (Math.abs(det) < 1e-9) return { x: 0, y: 0 }
  const invDet = 1 / det
  const dx = radPoint.x - tx
  const dy = radPoint.y - ty
  return {
    x: (d * dx - b * dy) * invDet,
    y: (-c * dx + a * dy) * invDet,
  }
}

/** 构造病理-影像配准结果 (mock) */
export async function runPathologyRadiologyRegistration(
  input: PathologyRadiologyInput,
): Promise<PathologyRadiologyResult> {
  await new Promise((r) => setTimeout(r, 500 + Math.floor(Math.random() * 400)))
  let matrix: number[][]
  let tre = 0
  if (input.initialLandmarks && input.initialLandmarks.length >= 3) {
    const src = input.initialLandmarks.map((l) => l.moving)
    const dst = input.initialLandmarks.map((l) => l.fixed)
    const params = solveRigid(src, dst)
    matrix = rigidToMatrix(params)
    tre = rigidResidual(params, src, dst)
  } else {
    // 无标注: 模拟一个轻微错位的矩阵
    const r = Math.random() * 0.1 - 0.05
    const tx = (Math.random() - 0.5) * 8
    const ty = (Math.random() - 0.5) * 8
    matrix = [
      [Math.cos(r), -Math.sin(r), 0, tx],
      [Math.sin(r), Math.cos(r), 0, ty],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]
    tre = 1.0 + Math.random() * 1.5
  }
  // mock Dice (基于置信度)
  const confidence = Math.max(0.6, 1 - tre / 4)
  const dice = 0.7 + confidence * 0.2
  // ROI 框
  const wsiW = input.wsi.width
  const wsiH = input.wsi.height
  const cx = wsiW / 2
  const cy = wsiH / 2
  const w = wsiW * 0.35
  const h = wsiH * 0.25
  return {
    wsiId: input.wsi.id,
    radiologyId: input.radiology.studyId,
    matrix,
    tre: Number(tre.toFixed(2)),
    dice: Number(dice.toFixed(3)),
    confidence: Number(confidence.toFixed(2)),
    roi: { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w: Math.round(w), h: Math.round(h) },
  }
}

/** 在 React 中直接使用 (UI helper) */
export const PathologyRadiologyEngine = {
  register: runPathologyRadiologyRegistration,
  project: projectPathPoint,
  inverse: inverseProjectPathPoint,
  wsiScaleToMm,
  dice: diceCoefficient,
}

/** 默认占位 React 组件 (用于路由此处导出 JSX) */
export const PathReg: React.FC<{ input?: PathologyRadiologyInput; onResult?: (r: PathologyRadiologyResult) => void }> = () => {
  return React.createElement('div', { 'data-testid': 'path-reg-stub' }, 'PathReg engine (服务层)')
}

export default PathReg
