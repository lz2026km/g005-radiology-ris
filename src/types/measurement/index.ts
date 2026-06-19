// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 测量/标注类型定义
// Phase R11: 病灶追踪 / 3D 测量 / ROI / 标注库 / DICOM SR TID 1500/1501
// 15 升级点:病灶追踪 / 3D / ROI / Livewire / RegionGrow / 库 / TID 1500 / TID 1501 / De-ID / AI 桥接
// ============================================================

// ---------- 1. 病灶追踪 (Lesion Tracking) ----------
/** 病灶追踪 ID(同一病灶跨 study 同一 ID) */
export type LesionTrackingId = string;

/** 病灶分类 */
export type LesionCategory =
  | 'target'        // 靶病灶 (RECIST target)
  | 'non-target'    // 非靶病灶
  | 'new'           // 新发病灶
  | 'resolved';     // 已消退

/** 解剖位置编码 (RID/RadLex 兼容字符串) */
export interface LesionLocation {
  /** 解剖区域(头颈/胸/腹/盆/脊柱/四肢) */
  region: string;
  /** 器官 (肺/肝/肾/淋巴...) */
  organ: string;
  /** 亚结构 (右肺上叶尖段...) */
  subStructure?: string;
  /** SNOMED CT 编码 (可选) */
  snomedCode?: string;
  /** RadLex 编码 (可选) */
  radLexCode?: string;
}

/** 单个研究中的病灶快照 */
export interface LesionSnapshot {
  studyInstanceUID: string;
  seriesInstanceUID?: string;
  sopInstanceUID?: string;
  acquisitionDate: string;
  /** 长径 mm */
  longDiameter: number;
  /** 短径 mm */
  shortDiameter?: number;
  /** 体积 mm³ (3D 分割时存在) */
  volume?: number;
  /** HU 平均值 */
  meanHU?: number;
  /** 响应评估类别 */
  response?: 'CR' | 'PR' | 'SD' | 'PD' | 'NE';
  /** 备注 */
  notes?: string;
}

/** 病灶追踪记录 (跨多次研究) */
export interface TrackedLesion {
  id: LesionTrackingId;
  patientId: string;
  label: string;             // 病灶 #1
  category: LesionCategory;
  location: LesionLocation;
  /** 历次快照(按检查日期升序) */
  snapshots: LesionSnapshot[];
  /** 基线日期 */
  baselineDate: string;
  /** 整体响应(最新一次评估) */
  overallResponse?: 'CR' | 'PR' | 'SD' | 'PD' | 'NE';
  createdAt: string;
  createdBy: string;
}

/** 病灶趋势 */
export interface LesionTrend {
  lesionId: LesionTrackingId;
  /** 长径变化百分比 (末次 vs 基线) */
  longDiameterChangePercent: number;
  /** 短径变化百分比 */
  shortDiameterChangePercent?: number;
  /** 体积变化百分比 */
  volumeChangePercent?: number;
  /** 整体响应 */
  overallResponse: 'CR' | 'PR' | 'SD' | 'PD' | 'NE';
  /** 时间点(每个快照一个) */
  timeline: Array<{
    date: string;
    longDiameter: number;
    shortDiameter?: number;
    volume?: number;
    response?: 'CR' | 'PR' | 'SD' | 'PD' | 'NE';
  }>;
}

/** 双研究对比 */
export interface LesionComparison {
  lesionId: LesionTrackingId;
  studyA: string;
  studyB: string;
  longDiameterA: number;
  longDiameterB: number;
  changePercent: number;
  changeMm: number;
  response: 'CR' | 'PR' | 'SD' | 'PD' | 'NE';
}

/** 病灶反应类别(供 UI 引用) */
export type LesionResponse = 'CR' | 'PR' | 'SD' | 'PD' | 'NE';

// ---------- 2. 3D 测量 ----------
/** 3D 坐标点(体素坐标 mm) */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/** 3D 网格面 */
export interface MeshFace {
  /** 三角形顶点索引 */
  indices: [number, number, number];
}

/** 3D 网格(用于表面/体积测量) */
export interface Mesh3D {
  vertices: Point3D[];
  faces: MeshFace[];
  /** 可选体素间距 (mm) */
  voxelSpacing?: [number, number, number];
}

/** 3D 测量结果 */
export interface ThreeDMeasurementResult {
  type: 'distance3D' | 'surfaceArea' | 'volume';
  value: number;
  unit: 'mm' | 'mm²' | 'mm³';
  /** 计算耗时 ms */
  durationMs: number;
  /** 算法版本 */
  algorithmVersion: string;
}

// ---------- 3. ROI ----------
/** ROI 类型 */
export type RoiType = 'freehand' | 'livewire' | 'regionGrow' | 'ellipse' | 'rectangle';

/** 自由手绘 ROI */
export interface FreehandRoi {
  id: string;
  type: 'freehand';
  /** 闭合多边形点(像素坐标) */
  points: Array<{ x: number; y: number }>;
  /** 像素间距 mm */
  pixelSpacing: [number, number];
  /** 统计 */
  area: number;          // mm²
  perimeter: number;     // mm
  pixelCount: number;
  meanHU: number;
  minHU: number;
  maxHU: number;
  stdHU: number;
  /** 是否闭合 */
  closed: boolean;
}

/** Livewire 智能分割 ROI */
export interface LivewireRoi {
  id: string;
  type: 'livewire';
  /** 沿梯度最小的边界 */
  boundaryPoints: Array<{ x: number; y: number }>;
  pixelSpacing: [number, number];
  area: number;
  perimeter: number;
  pixelCount: number;
  meanHU: number;
  /** 种子点 */
  seedPoint: { x: number; y: number };
  /** 边缘强度阈值 */
  gradientThreshold: number;
}

/** 区域生长 ROI */
export interface RegionGrowRoi {
  id: string;
  type: 'regionGrow';
  points: Array<{ x: number; y: number }>;
  pixelSpacing: [number, number];
  area: number;
  pixelCount: number;
  meanHU: number;
  /** 种子点 */
  seedPoint: { x: number; y: number };
  /** HU 上下阈值 */
  huRange: { min: number; max: number };
}

/** ROI 通用类型 */
export type Roi = FreehandRoi | LivewireRoi | RegionGrowRoi;

// ---------- 4. 标注库 ----------
/** 标注库模板 */
export interface AnnotationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'finding' | 'measurement' | 'roi' | 'label' | 'arrow';
  /** 标签名 */
  label: string;
  /** 默认文字 */
  defaultText: string;
  /** 默认颜色 */
  defaultColor: string;
  /** 默认形状 */
  shape?: 'arrow' | 'rectangle' | 'ellipse' | 'text' | 'freehand';
  /** 解剖位置 */
  anatomy?: string;
  /** 测量类型 */
  measurementType?: 'length' | 'angle' | 'area' | 'volume';
  /** 病灶 ID (可关联到 TrackedLesion) */
  lesionId?: LesionTrackingId;
  /** 关键词(搜索) */
  keywords: string[];
  /** 创建者 */
  createdBy: string;
  createdAt: string;
  /** 使用次数 */
  usageCount: number;
  /** 共享范围 */
  sharedScope: 'private' | 'department' | 'institution' | 'public';
}

// ---------- 5. DICOM PS3.15 De-identification ----------
/** De-ID 配置 */
export interface DeIdentifyConfig {
  /** 移除患者姓名 */
  removePatientName: boolean;
  /** 移除患者 ID (替换为哈希) */
  removePatientId: boolean;
  /** 移除患者出生日期 (保留年/月份) */
  removePatientBirthDate: 'full' | 'keepYearMonth' | 'keepYear' | 'keep';
  /** 移除检查日期 */
  removeStudyDate: 'full' | 'keepYear' | 'shift' | 'keep';
  /** 日期偏移天数(用于保留时间线) */
  dateShiftDays: number;
  /** 移除机构信息 */
  removeInstitution: boolean;
  /** 移除设备序列号 */
  removeDeviceSerial: boolean;
  /** 移除私人标签 */
  removePrivateTags: boolean;
  /** 保留的私有标签列表 */
  retainPrivateTags: string[];
  /** 默认配置 */
  preset: 'basic' | 'clean' | 'full' | 'research' | 'custom';
}

/** De-ID 结果 */
export interface DeIdentifyResult {
  /** 处理过的 tag 集合 */
  elements: Array<{
    tag: string;
    action: 'retain' | 'replace' | 'remove' | 'empty' | 'hash' | 'shift';
    originalValue?: string;
    newValue?: string;
  }>;
  /** 处理摘要 */
  summary: {
    retained: number;
    replaced: number;
    removed: number;
    emptied: number;
    hashed: number;
    shifted: number;
  };
  /** 配置指纹(用于追溯) */
  configFingerprint: string;
}

// ---------- 6. AI 桥接 ----------
/** AI 检测框 */
export interface AiBoundingBox {
  id: string;
  /** 类别 (如 'nodule', 'lesion', 'fracture') */
  category: string;
  /** 类别中文 */
  categoryZh: string;
  /** 置信度 0-1 */
  confidence: number;
  /** 边界框 (像素) */
  bbox: { x: number; y: number; width: number; height: number };
  /** 像素间距 */
  pixelSpacing: [number, number];
  /** SOP Instance UID */
  sopInstanceUID?: string;
  /** 模型版本 */
  modelVersion: string;
  /** 时间戳 */
  detectedAt: string;
}

/** AI 转换后的测量结果 */
export interface AiConvertedMeasurement {
  id: string;
  bboxId: string;
  measurementType: 'length' | 'area' | 'diameter';
  value: number;
  unit: 'mm' | 'mm²';
  /** 标签 */
  label: string;
  /** 病灶 ID (追踪) */
  lesionId?: LesionTrackingId;
  /** 置信度 */
  confidence: number;
  createdAt: string;
}
