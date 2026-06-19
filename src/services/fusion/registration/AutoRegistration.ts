// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 自动图像配准引擎
// rigid (6DOF) / affine (12DOF) / deformable (B-spline)
// 提供确定性 mock 配准 (基于 study id hash, 每次结果一致)
// ============================================================

import type {
  RegistrationStudy,
  RegistrationResult,
  RegistrationQuality,
  AutoRegistrationConfig,
  DeformableField,
} from '../../../types/fusion'
import { RigidTransform, type RigidParams, solveRigid, rigidToMatrix } from './RigidTransform'
import { AffineTransform, type AffineParams, solveAffine, affineToMatrix } from './AffineTransform'
import { DeformableBSpline, respiratoryField, type BSplineConfig } from './DeformableB spline'

export const DEFAULT_AUTO_CONFIG: AutoRegistrationConfig = {
  type: 'rigid',
  multiResolution: true,
  optimizer: 'lbfgs',
  maxIterations: 100,
  convergenceThreshold: 1e-4,
  useLandmarkInit: true,
  bSplineSpacing: 8,
}

/** 简易字符串 hash (djb2) -> 32bit */
function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0
  }
  return h >>> 0
}

/** 伪随机 (seed -> [0,1)) */
function seededRand(seed: number): () => number {
  let s = seed || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

/** 模拟迭代收敛曲线 (返回 MSE 残差) */
function simulateCostCurve(iterations: number, seed: number): number[] {
  const rand = seededRand(seed)
  const curve: number[] = []
  let mse = 100 + rand() * 200
  for (let i = 0; i < iterations; i++) {
    const decay = 0.92 + rand() * 0.05
    mse = mse * decay + rand() * 0.5
    if (mse < 0.3) mse = 0.3 + rand() * 0.1
    curve.push(Number(mse.toFixed(4)))
  }
  return curve
}

/** 计算配准质量 (基于 TRE/Dice/jacobian 模拟) */
function computeQuality(seed: number, type: 'rigid' | 'affine' | 'deformable'): RegistrationQuality {
  const rand = seededRand(seed)
  let tre: number
  let dice: number
  let jacobianMin: number
  let jacobianNeg: number
  let ncc: number
  switch (type) {
    case 'rigid':
      tre = 1.0 + rand() * 2.0
      dice = 0.78 + rand() * 0.12
      jacobianMin = 0.95
      jacobianNeg = 0
      ncc = 0.82 + rand() * 0.10
      break
    case 'affine':
      tre = 0.6 + rand() * 1.4
      dice = 0.84 + rand() * 0.10
      jacobianMin = 0.7 + rand() * 0.25
      jacobianNeg = rand() * 0.5
      ncc = 0.88 + rand() * 0.08
      break
    case 'deformable':
      tre = 0.3 + rand() * 0.8
      dice = 0.90 + rand() * 0.07
      jacobianMin = 0.4 + rand() * 0.4
      jacobianNeg = rand() * 2.0
      ncc = 0.92 + rand() * 0.06
      break
  }
  let grade: RegistrationQuality['grade']
  if (tre < 1.0 && dice > 0.90) grade = 'excellent'
  else if (tre < 2.0 && dice > 0.82) grade = 'good'
  else if (tre < 4.0 && dice > 0.65) grade = 'acceptable'
  else grade = 'poor'
  return {
    tre: Number(tre.toFixed(2)),
    dice: Number(dice.toFixed(3)),
    jacobianMin: Number(jacobianMin.toFixed(3)),
    jacobianNegativePct: Number(jacobianNeg.toFixed(2)),
    ncc: Number(ncc.toFixed(3)),
    grade,
  }
}

/** 构造 mock 形变场 */
function makeMockField(studyId: string, amplitude: number): DeformableField {
  const cfg: BSplineConfig = {
    gridSize: { rows: 5, cols: 5, slices: 5 },
    spacing: 8,
    lambda: 0.001,
  }
  const field = respiratoryField(cfg, amplitude)
  // 注入 study id 决定的伪随机扰动
  const seed = hashStr(studyId)
  const rand = seededRand(seed)
  for (let s = 0; s < field.gridSize.slices; s++) {
    for (let r = 0; r < field.gridSize.rows; r++) {
      for (let c = 0; c < field.gridSize.cols; c++) {
        const d = field.displacements[s]?.[r]?.[c]
        if (d) {
          d[0]! += (rand() - 0.5) * 0.5
          d[1]! += (rand() - 0.5) * 0.5
          d[2]! += (rand() - 0.5) * 0.3
        }
      }
    }
  }
  return field
}

/** 等待 ms */
function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * 自动配准引擎
 * 提供 rigid/affine/deformable 三种配准方法的 deterministic mock 实现
 */
export class AutoRegistration {
  private config: AutoRegistrationConfig
  /** 配准耗时模拟曲线缓存 (按 studyId) */
  private costCache = new Map<string, number[]>()

  constructor(config: Partial<AutoRegistrationConfig> = {}) {
    this.config = { ...DEFAULT_AUTO_CONFIG, ...config }
  }

  setConfig(cfg: Partial<AutoRegistrationConfig>): void {
    this.config = { ...this.config, ...cfg }
  }

  getConfig(): AutoRegistrationConfig {
    return { ...this.config }
  }

  /** 6-DOF 刚体配准 */
  async rigid(study: RegistrationStudy): Promise<RegistrationResult> {
    const start = performance.now()
    const seed = hashStr(`rigid:${study.studyId}`)
    const rand = seededRand(seed)
    // 模拟优化耗时
    await wait(300 + Math.floor(rand() * 400))
    // 模拟平移/旋转
    const params: RigidParams = {
      tx: (rand() - 0.5) * 6,
      ty: (rand() - 0.5) * 6,
      tz: (rand() - 0.5) * 4,
      rx: (rand() - 0.5) * 0.1,
      ry: (rand() - 0.5) * 0.1,
      rz: (rand() - 0.5) * 0.15,
    }
    // 如果有标注点,使用 Kabsch 求解
    if (study.landmarks && study.landmarks.length >= 3) {
      const src = study.landmarks.map((l) => l.moving)
      const dst = study.landmarks.map((l) => l.fixed)
      const solved = solveRigid(src, dst)
      params.tx = solved.tx
      params.ty = solved.ty
      params.tz = solved.tz
      params.rx = solved.rx
      params.ry = solved.ry
      params.rz = solved.rz
    }
    const matrix = rigidToMatrix(params)
    const error = 1.0 + rand() * 1.5
    const quality = computeQuality(seed, 'rigid')
    this.costCache.set(`rigid:${study.studyId}`, simulateCostCurve(this.config.maxIterations, seed))
    return {
      type: 'rigid',
      matrix,
      error: Number(error.toFixed(2)),
      processingTimeMs: Math.round(performance.now() - start),
      metrics: quality,
    }
  }

  /** 12-DOF 仿射配准 */
  async affine(study: RegistrationStudy): Promise<RegistrationResult> {
    const start = performance.now()
    const seed = hashStr(`affine:${study.studyId}`)
    const rand = seededRand(seed)
    await wait(450 + Math.floor(rand() * 500))
    let params: AffineParams
    if (study.landmarks && study.landmarks.length >= 4) {
      const src = study.landmarks.map((l) => l.moving)
      const dst = study.landmarks.map((l) => l.fixed)
      params = solveAffine(src, dst)
    } else {
      params = {
        m00: 1 + (rand() - 0.5) * 0.04,
        m01: (rand() - 0.5) * 0.02,
        m02: (rand() - 0.5) * 0.02,
        m10: (rand() - 0.5) * 0.02,
        m11: 1 + (rand() - 0.5) * 0.04,
        m12: (rand() - 0.5) * 0.02,
        m20: 0,
        m21: 0,
        m22: 1 + (rand() - 0.5) * 0.02,
        tx: (rand() - 0.5) * 4,
        ty: (rand() - 0.5) * 4,
        tz: (rand() - 0.5) * 3,
      }
    }
    const matrix = affineToMatrix(params)
    const error = 0.6 + rand() * 1.2
    const quality = computeQuality(seed, 'affine')
    this.costCache.set(`affine:${study.studyId}`, simulateCostCurve(this.config.maxIterations, seed))
    return {
      type: 'affine',
      matrix,
      error: Number(error.toFixed(2)),
      processingTimeMs: Math.round(performance.now() - start),
      metrics: quality,
    }
  }

  /** B-spline 自由形变配准 */
  async deformable(study: RegistrationStudy): Promise<RegistrationResult> {
    const start = performance.now()
    const seed = hashStr(`deformable:${study.studyId}`)
    const rand = seededRand(seed)
    await wait(700 + Math.floor(rand() * 800))
    // 先仿射,再加形变
    const aff = await this.affine(study)
    const field = makeMockField(study.studyId, 2 + Math.floor(rand() * 3))
    const quality = computeQuality(seed, 'deformable')
    this.costCache.set(`deformable:${study.studyId}`, simulateCostCurve(this.config.maxIterations, seed))
    return {
      type: 'deformable',
      matrix: aff.matrix,
      error: 0.4 + rand() * 0.6,
      processingTimeMs: Math.round(performance.now() - start),
      metrics: quality,
      deformableField: field,
    }
  }

  /** 通用入口,根据配置类型执行 */
  async run(study: RegistrationStudy): Promise<RegistrationResult> {
    switch (this.config.type) {
      case 'rigid':
        return this.rigid(study)
      case 'affine':
        return this.affine(study)
      case 'deformable':
        return this.deformable(study)
    }
  }

  /** 获取最近一次配准的代价曲线 (用于 UI 可视化) */
  getCostCurve(studyId: string, type: 'rigid' | 'affine' | 'deformable' = this.config.type): number[] {
    return this.costCache.get(`${type}:${studyId}`) ?? []
  }
}

export const autoRegistration = new AutoRegistration()

export default AutoRegistration

// 显式 re-export 子模块, 便于 AutoRegistrationPanel 直接使用
export { RigidTransform, AffineTransform, DeformableBSpline }
