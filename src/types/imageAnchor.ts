// ============================================================
// G005 放射RIS系统 v2.1.0 - ImageAnchor 影像锚定
// Phase R10 W3: 报告 ↔ 影像双向链接
// ============================================================

// 影像参考点（像素坐标）
export interface ImagePoint {
  x: number;          // 像素 x (0-width)
  y: number;          // 像素 y (0-height)
}

// 影像帧参考 (DICOM 多帧/MPR 平面)
export interface ImageFrameRef {
  seriesInstanceUID: string;     // 系列 UID
  sopInstanceUID?: string;       // 实例 UID (单帧定位)
  frameNumber?: number;          // 多帧索引 (1-based)
  plane?: 'axial' | 'coronal' | 'sagittal' | 'oblique';  // 平面类型
  sliceIndex?: number;           // 切片索引
}

// 测量值（与 DICOM-SR TID 1500 对应）
export interface ImageMeasurement {
  type: 'length' | 'angle' | 'cobb' | 'area' | 'volume' | 'ellipse' | 'hu' | 'circular' | 'bidirectional';
  value: number;                 // 主值
  unit: 'mm' | 'mm2' | 'mm3' | 'deg' | 'HU' | 'px';
  secondaryValue?: number;       // 双径 (e.g., 长径×短径)
  secondaryUnit?: string;
  // 几何点
  points: ImagePoint[];
  // 椭圆 ROI: 长短轴 + 旋转角
  ellipse?: { majorAxis: number; minorAxis: number; rotationDeg: number };
  // Cobb 角专用
  cobb?: { upperLine: [ImagePoint, ImagePoint]; lowerLine: [ImagePoint, ImagePoint] };
}

// 单个影像锚定（报告条目 ↔ 影像证据）
export interface ImageAnchor {
  id: string;                    // uuid
  // 报告侧
  reportId: string;              // 报告 ID
  sectionId?: string;            // 报告小节 (findings/conclusion...)
  textRange?: { start: number; end: number };  // 文本偏移 (字符位置)
  // 影像侧
  frame: ImageFrameRef;          // 影像参考
  // 可选几何
  measurement?: ImageMeasurement;
  // 标注引用 (AnnotationLayer)
  annotationId?: string;
  // 元数据
  label?: string;                // 短标签 e.g. "病灶 #1"
  category: 'finding' | 'lesion' | 'organ' | 'measurement' | 'critical' | 'reference' | 'comparison';
  createdAt: string;             // ISO
  createdBy: string;             // userId
  // 视觉
  color?: string;
  // AI/危急标记
  isAIDetected?: boolean;
  isCritical?: boolean;
}

// 报告的锚定集合
export interface ReportAnchors {
  reportId: string;
  anchors: ImageAnchor[];
  // 关键帧缩略图（首帧 + 关键帧）
  keyframes: Array<{
    frame: ImageFrameRef;
    thumbnail?: string;          // dataURL
    label: string;
  }>;
}

// 文本插入点（报告文本框内点击插入锚定）
export interface TextAnchorInsertion {
  charOffset: number;
  anchorId: string;
  display: 'inline' | 'footnote' | 'popover';   // 渲染方式
  chipText: string;              // 短文字
}

// 从 URL 解析影像参考（DICOMweb 风格）
export function parseDicomWebRef(url: string): ImageFrameRef | null {
  // wadouri:https://server/studies/X/series/Y/instances/Z
  // dicom://InstanceUID or dicom://SeriesUID/InstanceUID
  try {
    if (url.startsWith('wadouri:') || url.startsWith('dicomweb:')) {
      const stripped = url.replace(/^wado(r?i):\/\//, '').replace(/^dicomweb:\/\//, '');
      const m = stripped.match(/studies\/([^/]+)(?:\/series\/([^/]+))?(?:\/instances\/([^/]+))?/);
      if (!m) return null;
      return {
        seriesInstanceUID: m[2] || 'unknown',
        sopInstanceUID: m[3],
        plane: 'axial',
      };
    }
    if (url.startsWith('dicom:')) {
      const parts = url.replace('dicom://', '').split('/');
      return {
        seriesInstanceUID: parts[0],
        sopInstanceUID: parts[1],
        plane: 'axial',
      };
    }
    return null;
  } catch {
    return null;
  }
}

// 序列化为 DICOM-SR 友好的引用
export function toDicomSrRef(frame: ImageFrameRef): string {
  return frame.sopInstanceUID
    ? `${frame.seriesInstanceUID}/${frame.sopInstanceUID}`
    : frame.seriesInstanceUID;
}
