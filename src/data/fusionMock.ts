// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 多模态融合 Mock 数据
// 病历: 肺/乳腺/脑/前列腺, 含 SUV、病理WSI、注意力等
// ============================================================

import type {
  RegistrationStudy,
  RegistrationQuality,
  SuvConfig,
  SuvColorMap,
  DeformableField,
  LandmarkPair,
  MultimodalResult,
  PathologyRadiologyResult,
  RegistrationHistoryEntry,
  AttentionMap,
} from '../types/fusion'

/** SUV 颜色表 (内置) */
export const SUV_COLOR_MAPS: Record<string, SuvColorMap> = {
  hot: {
    type: 'hot',
    stops: [
      { t: 0.0, rgb: [0, 0, 0] },
      { t: 0.33, rgb: [128, 0, 0] },
      { t: 0.66, rgb: [255, 128, 0] },
      { t: 1.0, rgb: [255, 255, 255] },
    ],
  },
  jet: {
    type: 'jet',
    stops: [
      { t: 0.0, rgb: [0, 0, 127] },
      { t: 0.25, rgb: [0, 255, 255] },
      { t: 0.5, rgb: [0, 255, 0] },
      { t: 0.75, rgb: [255, 255, 0] },
      { t: 1.0, rgb: [127, 0, 0] },
    ],
  },
  rainbow: {
    type: 'rainbow',
    stops: [
      { t: 0.0, rgb: [148, 0, 211] },
      { t: 0.2, rgb: [75, 0, 130] },
      { t: 0.4, rgb: [0, 0, 255] },
      { t: 0.6, rgb: [0, 255, 0] },
      { t: 0.8, rgb: [255, 255, 0] },
      { t: 1.0, rgb: [255, 0, 0] },
    ],
  },
  grayscale: {
    type: 'grayscale',
    stops: [
      { t: 0.0, rgb: [0, 0, 0] },
      { t: 1.0, rgb: [255, 255, 255] },
    ],
  },
  viridis: {
    type: 'viridis',
    stops: [
      { t: 0.0, rgb: [68, 1, 84] },
      { t: 0.25, rgb: [59, 82, 139] },
      { t: 0.5, rgb: [33, 145, 140] },
      { t: 0.75, rgb: [94, 201, 98] },
      { t: 1.0, rgb: [253, 231, 37] },
    ],
  },
  plasma: {
    type: 'plasma',
    stops: [
      { t: 0.0, rgb: [13, 8, 135] },
      { t: 0.25, rgb: [126, 3, 168] },
      { t: 0.5, rgb: [203, 70, 121] },
      { t: 0.75, rgb: [248, 149, 64] },
      { t: 1.0, rgb: [240, 249, 33] },
    ],
  },
}

/** 默认 SUV 配置 */
export const DEFAULT_SUV_CONFIG: SuvConfig = {
  threshold: 2.5,
  maxSuv: 15,
  opacity: 0.6,
  colorMap: 'hot',
  thresholdEnabled: true,
  overlayOnCt: true,
}

/** Mock 病历 - 1:肺癌 PET/CT */
export const MOCK_STUDY_PETCT_LUNG: RegistrationStudy = {
  studyId: 'STU-PETCT-001',
  modality: 'PET/CT',
  bodyPart: '胸部',
  imageIds: Array.from({ length: 120 }, (_, i) => `petct-lung-${i + 1}`),
  center: { x: 0, y: 0, z: 0 },
  lesions: [
    {
      id: 'lesion-rul',
      mask: Array.from({ length: 256 }, (_, i) => i > 80 && i < 110),
    },
  ],
  landmarks: [
    { id: 'lm-1', label: '气管分叉', fixed: { x: 0, y: 5, z: 0 }, moving: { x: 0.2, y: 5.1, z: 0.1 } },
    { id: 'lm-2', label: '主动脉弓', fixed: { x: -10, y: 10, z: 0 }, moving: { x: -10.3, y: 10.2, z: 0.1 } },
    { id: 'lm-3', label: '右主支气管', fixed: { x: 5, y: 8, z: 2 }, moving: { x: 5.1, y: 8.2, z: 2.1 } },
  ],
}

/** Mock 病历 - 2:脑 MR 多序列 */
export const MOCK_STUDY_MR_BRAIN: RegistrationStudy = {
  studyId: 'STU-MR-BRAIN-001',
  modality: 'MR',
  bodyPart: '头颅',
  imageIds: Array.from({ length: 60 }, (_, i) => `mr-brain-t1-${i + 1}`),
  center: { x: 0, y: 0, z: 0 },
  landmarks: [
    { id: 'lm-1', label: '前联合', fixed: { x: 0, y: 0, z: 0 }, moving: { x: 0.1, y: -0.1, z: 0.2 } },
    { id: 'lm-2', label: '后联合', fixed: { x: 0, y: 25, z: 0 }, moving: { x: 0.2, y: 25.2, z: 0.1 } },
  ],
}

/** Mock 病历 - 3:前列腺 MR-TRUS 配准 */
export const MOCK_STUDY_MR_PROSTATE: RegistrationStudy = {
  studyId: 'STU-MR-PROSTATE-001',
  modality: 'MR',
  bodyPart: '盆腔',
  imageIds: Array.from({ length: 40 }, (_, i) => `mr-prostate-${i + 1}`),
  center: { x: 0, y: 0, z: 0 },
  lesions: [
    { id: 'lesion-l', mask: Array.from({ length: 128 }, (_, i) => i > 40 && i < 55) },
  ],
}

/** Mock 病历 - 4:乳腺 MR+US */
export const MOCK_STUDY_BREAST_MRUS: RegistrationStudy = {
  studyId: 'STU-BREAST-MRUS-001',
  modality: 'MR/US',
  bodyPart: '胸部',
  imageIds: Array.from({ length: 80 }, (_, i) => `mr-breast-${i + 1}`),
  center: { x: 0, y: 0, z: 0 },
}

/** Mock 配准质量 - 优秀 */
export const MOCK_QUALITY_EXCELLENT: RegistrationQuality = {
  tre: 0.8,
  dice: 0.94,
  jacobianMin: 0.6,
  jacobianNegativePct: 0.1,
  ncc: 0.96,
  grade: 'excellent',
}

/** Mock 配准质量 - 良好 */
export const MOCK_QUALITY_GOOD: RegistrationQuality = {
  tre: 1.6,
  dice: 0.86,
  jacobianMin: 0.4,
  jacobianNegativePct: 0.8,
  ncc: 0.88,
  grade: 'good',
}

/** Mock 配准质量 - 不合格 */
export const MOCK_QUALITY_POOR: RegistrationQuality = {
  tre: 5.2,
  dice: 0.52,
  jacobianMin: -0.3,
  jacobianNegativePct: 6.4,
  ncc: 0.61,
  grade: 'poor',
}

/** Mock 形变场 (4x4x4 控制点) */
export function createMockDeformableField(): DeformableField {
  const rows = 4
  const cols = 4
  const slices = 4
  const displacements: number[][][][] = []
  for (let s = 0; s < slices; s++) {
    const slice: number[][][] = []
    for (let r = 0; r < rows; r++) {
      const row: number[][] = []
      for (let c = 0; c < cols; c++) {
        const dx = Math.sin((c + s) * 0.6) * 1.5
        const dy = Math.cos((r + s) * 0.5) * 1.2
        const dz = Math.sin((r + c) * 0.3) * 0.8
        row.push([dx, dy, dz])
      }
      slice.push(row)
    }
    displacements.push(slice)
  }
  return {
    gridSize: { rows, cols, slices },
    spacing: 8,
    displacements,
  }
}

/** Mock 标注点对 */
export const MOCK_LANDMARKS_PETCT: LandmarkPair[] = [
  { id: 'lm-1', label: '气管分叉', fixed: { x: 0, y: 5, z: 0 }, moving: { x: 0.1, y: 4.9, z: 0.1 } },
  { id: 'lm-2', label: '主动脉弓', fixed: { x: -10, y: 10, z: 0 }, moving: { x: -10.2, y: 10.1, z: 0.0 } },
  { id: 'lm-3', label: '右主支气管', fixed: { x: 5, y: 8, z: 2 }, moving: { x: 5.1, y: 8.2, z: 2.1 } },
  { id: 'lm-4', label: '左主支气管', fixed: { x: -5, y: 8, z: 2 }, moving: { x: -5.0, y: 7.9, z: 2.0 } },
  { id: 'lm-5', label: '心尖', fixed: { x: 0, y: -15, z: -5 }, moving: { x: 0.2, y: -15.1, z: -5.0 } },
  { id: 'lm-6', label: '左锁骨上', fixed: { x: -20, y: 30, z: 5 }, moving: { x: -20.0, y: 30.0, z: 5.1 } },
]

/** Mock 多模态 AI 结果 - 肺结节 */
export const MOCK_MULTIMODAL_LUNG: MultimodalResult = {
  id: 'mm-001',
  text: '右肺上叶可见一大小约 18×16mm 结节影,边界欠清,呈分叶状,边缘可见毛刺征,内部密度不均匀,增强扫描呈中度不均匀强化(SUVmax=6.8)。考虑周围型肺癌可能性大,建议穿刺活检明确诊断。',
  attention: createMockAttentionMap(256, 256, 0.65, 0.55, 0.92),
  inferenceTimeMs: 1230,
  confidence: 0.87,
  findings: [
    { text: '右肺上叶结节', score: 0.92, bbox: { x: 165, y: 140, w: 32, h: 28 } },
    { text: '分叶状边缘', score: 0.81, bbox: { x: 165, y: 140, w: 32, h: 28 } },
    { text: '毛刺征', score: 0.74, bbox: { x: 175, y: 145, w: 12, h: 10 } },
  ],
  tokens: { input: 256, output: 84 },
}

/** Mock 多模态 AI 结果 - 乳腺 */
export const MOCK_MULTIMODAL_BREAST: MultimodalResult = {
  id: 'mm-002',
  text: '左乳外上象限可见一不规则肿块影,大小约 22×18mm,边缘呈毛刺状,内部信号不均匀,T1WI 呈低信号,T2WI 呈稍高信号,DWI 弥散受限(ADC≈0.85×10⁻³mm²/s),动态增强呈"快进快出"强化模式(BI-RADS 5 类)。考虑乳腺癌可能性大。',
  attention: createMockAttentionMap(256, 256, 0.42, 0.48, 0.88),
  inferenceTimeMs: 980,
  confidence: 0.91,
  findings: [
    { text: '左乳肿块', score: 0.94, bbox: { x: 105, y: 120, w: 38, h: 32 } },
    { text: 'BI-RADS 5', score: 0.88, bbox: { x: 105, y: 120, w: 38, h: 32 } },
  ],
  tokens: { input: 198, output: 102 },
}

/** 创建 mock 注意力图 */
export function createMockAttentionMap(
  width: number,
  height: number,
  cx: number,
  cy: number,
  maxScore: number,
): AttentionMap {
  const weights = new Float32Array(width * height)
  let bestX = 0
  let bestY = 0
  let bestScore = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx * width) / 30
      const dy = (y - cy * height) / 30
      const score = maxScore * Math.exp(-(dx * dx + dy * dy))
      weights[y * width + x] = score
      if (score > bestScore) {
        bestScore = score
        bestX = x
        bestY = y
      }
    }
  }
  return {
    imageId: 'mock',
    width,
    height,
    weights,
    hotspots: [
      { x: bestX, y: bestY, score: bestScore },
      { x: bestX + 8, y: bestY + 5, score: bestScore * 0.7 },
      { x: bestX - 6, y: bestY - 3, score: bestScore * 0.5 },
    ],
  }
}

/** Mock 病理-影像配准结果 */
export const MOCK_PATH_RAD_RESULT: PathologyRadiologyResult = {
  wsiId: 'WSI-001',
  radiologyId: 'STU-MR-PROSTATE-001',
  matrix: [
    [1.002, 0.003, 0, 5.2],
    [0.001, 1.001, 0, -3.8],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ],
  tre: 1.2,
  dice: 0.82,
  confidence: 0.84,
  roi: { x: 1200, y: 1800, w: 800, h: 600 },
}

/** Mock 历史配准记录 */
export const MOCK_REGISTRATION_HISTORY: RegistrationHistoryEntry[] = [
  { id: 'rh-001', studyId: 'STU-PETCT-001', type: 'rigid', tre: 1.8, dice: 0.88, timestamp: Date.now() - 86400000, duration: 2400, operator: '张明远' },
  { id: 'rh-002', studyId: 'STU-MR-BRAIN-001', type: 'affine', tre: 1.2, dice: 0.92, timestamp: Date.now() - 3600000, duration: 3200, operator: '李慧敏' },
  { id: 'rh-003', studyId: 'STU-MR-PROSTATE-001', type: 'deformable', tre: 0.8, dice: 0.94, timestamp: Date.now() - 7200000, duration: 8500, operator: '王建华' },
  { id: 'rh-004', studyId: 'STU-PETCT-001', type: 'deformable', tre: 1.0, dice: 0.91, timestamp: Date.now() - 600000, duration: 9200, operator: '赵雪琴' },
  { id: 'rh-005', studyId: 'STU-BREAST-MRUS-001', type: 'rigid', tre: 2.4, dice: 0.79, timestamp: Date.now() - 300000, duration: 1800, operator: '吴芳' },
]

/** Mock 患者列表 (用于融合选择) */
export const MOCK_FUSION_PATIENTS = [
  { id: 'P001', name: '张志刚', age: 62, gender: '男', studies: ['STU-PETCT-001'] },
  { id: 'P002', name: '李秀英', age: 55, gender: '女', studies: ['STU-MR-BRAIN-001'] },
  { id: 'P003', name: '王建国', age: 58, gender: '男', studies: ['STU-MR-PROSTATE-001'] },
  { id: 'P004', name: '赵晓敏', age: 45, gender: '女', studies: ['STU-BREAST-MRUS-001'] },
  { id: 'P005', name: '周玉芬', age: 52, gender: '女', studies: ['STU-PETCT-001', 'STU-MR-BRAIN-001'] },
]
