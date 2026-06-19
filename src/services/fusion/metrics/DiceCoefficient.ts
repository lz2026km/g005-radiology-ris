// ============================================================
// G005 放射RIS系统 v3.0.6.5 - Dice 相似系数
// Dice = 2 |A ∩ B| / (|A| + |B|)
// ============================================================

import type { DiceResult, Point3D } from '../../../types/fusion'

export type { DiceResult }

/** 布尔 mask 的 Dice (一维数组) */
export function diceCoefficient(maskA: Uint8Array | boolean[], maskB: Uint8Array | boolean[]): DiceResult {
  const n = Math.min(maskA.length, maskB.length)
  if (n === 0) {
    return { dice: 0, intersection: 0, union: 0, volA: 0, volB: 0 }
  }
  let a = 0
  let b = 0
  let inter = 0
  for (let i = 0; i < n; i++) {
    const va = maskA[i] ? 1 : 0
    const vb = maskB[i] ? 1 : 0
    if (va) a++
    if (vb) b++
    if (va && vb) inter++
  }
  const dice = a + b === 0 ? 1 : (2 * inter) / (a + b)
  return {
    dice: Number(dice.toFixed(4)),
    intersection: inter,
    union: a + b - inter,
    volA: a,
    volB: b,
  }
}

/** 从 3D 点云 + 容差构造 mask 再求 Dice */
export function diceFromPoints(ptsA: Point3D[], ptsB: Point3D[], tolerance = 2.5): DiceResult {
  const a = new Uint8Array(Math.max(64, ptsA.length * 2))
  const b = new Uint8Array(Math.max(64, ptsB.length * 2))
  ptsA.forEach((_p, i) => {
    a[i] = 1
  })
  ptsB.forEach((_p, i) => {
    b[i] = 1
  })
  // 容差命中: A[i] 与任一 B 点距离 < tolerance
  for (let i = 0; i < ptsA.length; i++) {
    const pa = ptsA[i]
    if (!pa) continue
    let hit = false
    for (let j = 0; j < ptsB.length; j++) {
      const pb = ptsB[j]
      if (!pb) continue
      if (Math.hypot(pa.x - pb.x, pa.y - pb.y, pa.z - pb.z) < tolerance) {
        hit = true
        break
      }
    }
    a[i] = hit ? 1 : 0
  }
  return diceCoefficient(a, b)
}

export const DiceCoefficient = {
  compute: diceCoefficient,
  fromPoints: diceFromPoints,
}

export default DiceCoefficient
