// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 多模态融合类型定义
// 新增:多模态配准 / PET SUV / 病理-影像 / 多模态AI 接口
// ============================================================

/** 三维空间坐标 (单位:mm) */
export interface Point3D {
  x: number
  y: number
  z: number
}

/** 二维标注点 (像素坐标) */
export interface Point2D {
  x: number
  y: number
}

/** 配准类型 (与现有 RegistrationPanel 对齐) */
export type RegistrationType = 'rigid' | 'affine' | 'deformable'

/** 配准结果 (与现有 RegistrationResult 对齐) */
export interface RegistrationResult {
  type: RegistrationType
  matrix: number[][]
  error: number
  processingTimeMs: number
  /** 配准质量指标 (自动配准填充) */
  metrics?: RegistrationQuality
  /** 形变场 (仅 deformable) */
  deformableField?: DeformableField
  /** 配准后图像id (可选) */
  registeredImageIds?: string[]
}

/** 配准质量指标 */
export interface RegistrationQuality {
  /** 目标配准误差 TRE (mm) */
  tre: number
  /** 感兴趣区 Dice 系数 (0-1) */
  dice: number
  /** 雅可比行列式最小值 (形变场平滑性) */
  jacobianMin: number
  /** 雅可比行列式负值占比 (%) */
  jacobianNegativePct: number
  /** 平均灰度互相关 (NCC) */
  ncc: number
  /** 配准质量评级:优秀/良好/合格/不合格 */
  grade: 'excellent' | 'good' | 'acceptable' | 'poor'
}

/** 形变场 (B-spline 控制点网格) */
export interface DeformableField {
  /** 控制点网格尺寸 */
  gridSize: { rows: number; cols: number; slices: number }
  /** 控制点间距 (mm) */
  spacing: number
  /** 三维位移矢量 displacements[slice][row][col] = [dx, dy, dz] */
  displacements: number[][][][]
  /** 雅可比行列式 (用于质量评估) */
  jacobians?: number[][][]
}

/** 形变 warp 后图像 */
export interface WarpedImage {
  imageId: string
  width: number
  height: number
  /** warp 后像素数据 */
  pixels: Float32Array
  /** 使用的形变场 */
  field: DeformableField
}

/** 配准度量指标 (TRE 配对点) */
export interface LandmarkPair {
  id: string
  label: string
  fixed: Point3D
  moving: Point3D
  /** 配准后误差 (mm) */
  residualMm?: number
}

/** 模态组合 */
export type ModalityPair =
  | 'CT-MR'
  | 'CT-PET'
  | 'MR-PET'
  | 'CT-MR-PET'
  | 'MR-US'
  | 'CT-US'
  | 'MR-MR'
  | 'CT-CT'
  | 'MR-Pathology'
  | 'CT-Pathology'

/** PET SUV 颜色映射类型 */
export type SuvColorMapType = 'hot' | 'jet' | 'rainbow' | 'grayscale' | 'viridis' | 'plasma'

/** PET SUV 颜色表 */
export interface SuvColorMap {
  type: SuvColorMapType
  /** 颜色梯度停靠点 (归一化 0-1 -> [r,g,b]) */
  stops: Array<{ t: number; rgb: [number, number, number] }>
}

/** SUV 配置 */
export interface SuvConfig {
  /** SUV 阈值下限 (低于此值不显示) */
  threshold: number
  /** SUV 阈值上限 (饱和值) */
  maxSuv: number
  /** 不透明度 (0-1) */
  opacity: number
  /** 颜色映射 */
  colorMap: SuvColorMapType
  /** 是否仅显示阈值以上区域 */
  thresholdEnabled: boolean
  /** 是否叠加到 CT 灰阶 */
  overlayOnCt: boolean
}

/** SUV 叠加结果 */
export interface SuvOverlay {
  imageId: string
  width: number
  height: number
  /** 每像素 SUV 值 */
  suvMap: Float32Array
  /** 配置快照 */
  config: SuvConfig
  /** 体积统计 */
  stats: SuvStats
}

/** SUV 体积统计 */
export interface SuvStats {
  /** 最大 SUV */
  suvMax: number
  /** 平均 SUV */
  suvMean: number
  /** SUV >= threshold 体积 (mL) */
  metabolicVolume: number
  /** SUV 体积乘积 (mL × g/mL, 简化 TLG) */
  totalLesionGlycolysis: number
  /** 直方图:0..maxSuv 区间 64 bin */
  histogram: number[]
}

/** Dice 系数输入/输出 */
export interface DiceResult {
  dice: number
  intersection: number
  union: number
  volA: number
  volB: number
}

/** 配准输入研究 (mock 描述) */
export interface RegistrationStudy {
  studyId: string
  modality: string
  bodyPart: string
  imageIds: string[]
  /** 可选中心点 */
  center?: Point3D
  /** 可选病灶标记点 (用于 Dice) */
  lesions?: Array<{ id: string; mask: boolean[] }>
  /** 可选标注点对 (用于 TRE) */
  landmarks?: LandmarkPair[]
}

/** 自动配准配置 */
export interface AutoRegistrationConfig {
  type: RegistrationType
  /** 多分辨率层级 */
  multiResolution: boolean
  /** 优化器 */
  optimizer: 'gradient-descent' | 'lbfgs' | 'evolutionary'
  /** 最大迭代 */
  maxIterations: number
  /** 收敛阈值 */
  convergenceThreshold: number
  /** 是否使用 landmark 初始化 */
  useLandmarkInit: boolean
  /** B-spline 网格间距 (仅 deformable) */
  bSplineSpacing?: number
}

/** 注意力图 (多模态 AI) */
export interface AttentionMap {
  imageId: string
  width: number
  height: number
  /** 0-1 注意力权重 */
  weights: Float32Array
  /** 显著区中心列表 */
  hotspots: Array<{ x: number; y: number; score: number }>
}

/** 多模态 AI 推理输入 */
export interface MultimodalInput {
  study: RegistrationStudy
  text: string
  /** 历史上下文 (可选) */
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

/** 多模态 AI 推理结果 */
export interface MultimodalResult {
  id: string
  text: string
  attention: AttentionMap
  /** 推理用时 (ms) */
  inferenceTimeMs: number
  /** 置信度 0-1 */
  confidence: number
  /** 关键发现 */
  findings: Array<{ text: string; score: number; bbox?: { x: number; y: number; w: number; h: number } }>
  /** token 统计 */
  tokens: { input: number; output: number }
}

/** 病理-影像配准输入 */
export interface PathologyRadiologyInput {
  wsi: {
    id: string
    /** Whole Slide Image 总尺寸 (像素) */
    width: number
    height: number
    /** 缩略图 URL (可选) */
    thumbnailUrl?: string
    /** 缩放级别 */
    level: number
  }
  radiology: RegistrationStudy
  /** 初始对准标记 */
  initialLandmarks?: LandmarkPair[]
}

/** 病理-影像配准结果 */
export interface PathologyRadiologyResult {
  wsiId: string
  radiologyId: string
  matrix: number[][]
  tre: number
  dice: number
  confidence: number
  /** 配准后 ROI 框 (WSI 上) */
  roi: { x: number; y: number; w: number; h: number }
}

/** 历史配准记录 */
export interface RegistrationHistoryEntry {
  id: string
  studyId: string
  type: RegistrationType
  tre: number
  dice: number
  timestamp: number
  duration: number
  operator: string
}
