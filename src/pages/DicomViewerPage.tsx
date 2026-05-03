// @ts-nocheck
// ============================================================
// G005 放射科RIS - DICOM影像浏览器 v0.5.0
// 专业DICOM Viewer，模拟GE Centricity/联影DICOM Viewer功能
// 布局：左侧工具栏(60px) + 中间影像区 + 右侧信息面板(280px)
// 扩充功能：交互式测量、标注工具、伪彩显示、图像对比增强
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  // 工具图标
  ZoomIn, ZoomOut, Move, Sun, Contrast, RotateCw, RotateCcw,
  FlipHorizontal, FlipVertical, RefreshCw, Ruler, Calendar,
  MessageSquare, Play, Pause, Printer, Grid3x3, Maximize2,
  Minimize2, Download, Layers, Film, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, SplitSquareHorizontal, Square,
  Eye, MousePointer, Circle, PenTool, Minus, Plus,
  AlertCircle, CheckCircle, Clock, FileText, Activity,
  X, Info, Triangle, Maximize, Camera, Layers3, Crosshair,
  // 标签页图标
  User, Image as ImageIcon, Ruler as RulerIcon, FileSearch, History, GitCompare, ArrowLeftRight,
  CheckSquare, Square as SquareIcon, AlertTriangle, Diff, ScrollText,
  // 窗值预设相关
  EyeOff, Focus,
  // 扩增标注工具图标
  Type, ArrowUpRight, Square as RectIcon, Circle as CircleIcon,
  Palette, Trash2, Edit3, Lock, Unlock, Eye as EyeIcon, Volume2,
  // 伪彩相关
  Flame, Droplets, Wind, Thermometer,
} from 'lucide-react'
import { initialRadiologyExams } from '../data/initialData'

// ============================================================
// 类型定义
// ============================================================
type WindowPreset = { name: string; ww: number; wl: number; icon?: string }
type MeasureType = 'length' | 'angle' | 'area' | 'ct'
type LayoutMode = '1x1' | '2x2' | '1x2' | '2x1'
type Tool = 'zoom' | 'pan' | 'wl' | 'rotate' | 'flipH' | 'flipV' | 'measure' | 'annotate' | 'play' | 'print'
type MeasureSubMenu = 'length' | 'angle' | 'area' | 'ct' | null
type RightTab = 'patient' | 'image' | 'measure' | 'report' | 'history'
type AnnotationType = 'text' | 'arrow' | 'rect' | 'ellipse'
type PseudoColorMode = 'none' | 'hotIron' | 'coolBlue' | 'grayscale' | 'pet' | 'softTissue'
type CompareLayout = 'leftRight' | 'topBottom'

// 标注数据类型
type Annotation = {
  id: string
  type: AnnotationType
  x: number
  y: number
  x2?: number // for arrow, rect, ellipse end point
  y2?: number
  text?: string
  color: string
  fontSize: number
  visible: boolean
  locked: boolean
}

// 测量点数据
type MeasurePoint = {
  id: string
  x: number
  y: number
}

// 交互式测量结果
type InteractiveMeasure = {
  id: string
  type: 'length' | 'angle' | 'area' | 'ct'
  points: MeasurePoint[]
  value: number
  unit: string
  color: string
  visible: boolean
}

// 伪彩预设
type PseudoColorPreset = {
  name: string
  mode: PseudoColorMode
  icon: React.ReactNode
  description: string
}
type Series = {
  id: string
  seriesNumber: number
  seriesDescription: string
  modality: string
  imageCount: number
  thumbnail: string // 模拟颜色
}

type DicomImage = {
  id: string
  seriesId: string
  imageNumber: number
  sliceLocation: number
  windowWidth: number
  windowCenter: number
  pixelSpacing: number
  sliceThickness: number
  tr?: number
  te?: number
  matrix: string
  fov: number
}

// 历史检查记录类型
type HistoryExam = {
  id: string
  examId: string
  examDate: string
  examTime: string
  examItemName: string
  modality: string
  bodyPart: string
  deviceName: string
  status: string
  reportDate?: string
  reportDoctor?: string
  finding?: string
  conclusion?: string
}

// 检查项目类型
type ExamItem = {
  id: string
  examId: string
  accessionNumber: string
  patientId: string
  patientName: string
  gender: string
  age: number
  patientType: string
  examItemName: string
  examDate: string
  examTime: string
  modality: string
  bodyPart: string
  deviceName: string
  roomName: string
  status: string
  priority: string
  clinicalDiagnosis: string
  clinicalHistory: string
  examIndications: string
  reportDate?: string
  reportDoctor?: string
  finding?: string
  conclusion?: string
}

// ============================================================
// 常量定义
// ============================================================
const PRIMARY = '#1e3a5f'
const PRIMARY_LIGHT = '#2d4a6f'
const CARD_BG = '#ffffff'
const PANEL_BG = '#f0f4f8'

const WINDOW_PRESETS: WindowPreset[] = [
  { name: '骨窗', ww: 2000, wl: 400 },
  { name: '肺窗', ww: 1500, wl: -600 },
  { name: '脑窗', ww: 80, wl: 40 },
  { name: '腹部窗', ww: 400, wl: 50 },
  { name: '软组织', ww: 400, wl: 40 },
  { name: '纵隔窗', ww: 350, wl: 50 },
]

const SERIES_COLORS = ['#4a90d9', '#50b784', '#e5a832', '#d94a4a', '#9b59b6', '#1abc9c']

// 伪彩显示预设
const PSEUDO_COLOR_PRESETS: PseudoColorPreset[] = [
  { name: '无', mode: 'none', icon: <EyeOff size={14} />, description: '原始灰度' },
  { name: '热铁', mode: 'hotIron', icon: <Flame size={14} />, description: 'Hot Iron - 红色到白色' },
  { name: '冷蓝', mode: 'coolBlue', icon: <Droplets size={14} />, description: 'Cool Blue - 蓝色调' },
  { name: 'PET', mode: 'pet', icon: <Activity size={14} />, description: 'PET伪彩 - 彩虹色' },
  { name: '软组织', mode: 'softTissue', icon: <Wind size={14} />, description: '软组织窗' },
]

// 标注颜色选项
const ANNOTATION_COLORS = [
  '#ff0000', '#00ff00', '#ffff00', '#00ffff',
  '#ff00ff', '#ff8800', '#88ff00', '#0088ff',
  '#ffffff', '#ffcc00',
]

// 标注颜色名称映射
const ANNOTATION_COLOR_NAMES: Record<string, string> = {
  '#ff0000': '红',
  '#00ff00': '绿',
  '#ffff00': '黄',
  '#00ffff': '青',
  '#ff00ff': '品红',
  '#ff8800': '橙',
  '#88ff00': '黄绿',
  '#0088ff': '蓝',
  '#ffffff': '白',
  '#ffcc00': '金黄',
}

// 模拟序列数据
const generateSeries = (modality: string): Series[] => {
  if (modality === 'CT') {
    return [
      { id: 's1', seriesNumber: 1, seriesDescription: '横断面-肺窗', modality: 'CT', imageCount: 120, thumbnail: '#4a90d9' },
      { id: 's2', seriesNumber: 2, seriesDescription: '横断面-纵隔窗', modality: 'CT', imageCount: 120, thumbnail: '#50b784' },
      { id: 's3', seriesNumber: 3, seriesDescription: '冠状面', modality: 'CT', imageCount: 80, thumbnail: '#e5a832' },
      { id: 's4', seriesNumber: 4, seriesDescription: '矢状面', modality: 'CT', imageCount: 80, thumbnail: '#d94a4a' },
    ]
  }
  if (modality === 'MR') {
    return [
      { id: 's1', seriesNumber: 1, seriesDescription: 'T1WI横断', modality: 'MR', imageCount: 200, thumbnail: '#4a90d9' },
      { id: 's2', seriesNumber: 2, seriesDescription: 'T2WI横断', modality: 'MR', imageCount: 200, thumbnail: '#50b784' },
      { id: 's3', seriesNumber: 3, seriesDescription: 'FLAIR', modality: 'MR', imageCount: 200, thumbnail: '#e5a832' },
      { id: 's4', seriesNumber: 4, seriesDescription: 'DWI', modality: 'MR', imageCount: 50, thumbnail: '#d94a4a' },
    ]
  }
  if (modality === 'DR') {
    return [
      { id: 's1', seriesNumber: 1, seriesDescription: '后前位', modality: 'DR', imageCount: 1, thumbnail: '#4a90d9' },
      { id: 's2', seriesNumber: 2, seriesDescription: '侧位', modality: 'DR', imageCount: 1, thumbnail: '#50b784' },
    ]
  }
  return [{ id: 's1', seriesNumber: 1, seriesDescription: '序列1', modality: modality, imageCount: 1, thumbnail: '#4a90d9' }]
}

const generateImages = (series: Series): DicomImage[] => {
  const images: DicomImage[] = []
  for (let i = 1; i <= series.imageCount; i++) {
    images.push({
      id: `${series.id}-i${i}`,
      seriesId: series.id,
      imageNumber: i,
      sliceLocation: (i - series.imageCount / 2) * 2.5,
      windowWidth: 400,
      windowCenter: 40,
      pixelSpacing: 0.68,
      sliceThickness: 2.5,
      tr: series.modality === 'MR' ? 2500 : undefined,
      te: series.modality === 'MR' ? 30 : undefined,
      matrix: '512×512',
      fov: 35,
    })
  }
  return images
}

// 模拟测量数据
const mockMeasurements = {
  length: [
    { id: 'm1', type: 'length', value: 12.5, unit: 'mm', location: '病灶最大径' },
    { id: 'm2', type: 'length', value: 8.3, unit: 'mm', location: '另一病灶' },
  ],
  angle: [
    { id: 'a1', type: 'angle', value: 45.2, unit: '°', location: '脊柱侧弯角' },
  ],
  ct: [
    { id: 'ct1', type: 'ct', value: 45, unit: 'HU', location: '病灶中心' },
    { id: 'ct2', type: 'ct', value: 20, unit: 'HU', location: '病灶边缘' },
  ],
  area: [
    { id: 'ar1', type: 'area', value: 98.5, unit: 'mm²', location: '横断面面积' },
  ],
}

// 模拟历史检查数据
const mockHistoryExams: HistoryExam[] = [
  {
    id: 'h1',
    examId: 'EX20260415001',
    examDate: '2026-04-15',
    examTime: '09:30',
    examItemName: '胸部CT平扫',
    modality: 'CT',
    bodyPart: 'CHEST',
    deviceName: 'GE Revolution Apex（CT-01）',
    status: '已完成',
    reportDate: '2026-04-15 11:45',
    reportDoctor: '张伟明',
    finding: '左肺上叶见一枚直径约8mm磨玻璃结节，较2026-03-01片未见明显变化。余肺野清晰。',
    conclusion: '左肺上叶磨玻璃结节，较前相仿，建议6个月复查。',
  },
  {
    id: 'h2',
    examId: 'EX20260301001',
    examDate: '2026-03-01',
    examTime: '14:20',
    examItemName: '胸部CT平扫',
    modality: 'CT',
    bodyPart: 'CHEST',
    deviceName: 'GE Revolution Apex（CT-01）',
    status: '已完成',
    reportDate: '2026-03-01 16:30',
    reportDoctor: '李明辉',
    finding: '左肺上叶见一枚直径约8mm磨玻璃结节。余肺野清晰。',
    conclusion: '左肺上叶磨玻璃结节，建议定期复查。',
  },
  {
    id: 'h3',
    examId: 'EX20260110001',
    examDate: '2026-01-10',
    examTime: '10:15',
    examItemName: '胸部DR正侧位',
    modality: 'DR',
    bodyPart: 'CHEST',
    deviceName: '飞利浦DigitalDiagnost（DR-02）',
    status: '已完成',
    reportDate: '2026-01-10 11:00',
    reportDoctor: '王芳',
    finding: '心影增大，双肺纹理增多，余未见明显异常。',
    conclusion: '心影增大，建议进一步CT检查。',
  },
  {
    id: 'h4',
    examId: 'EX20251120001',
    examDate: '2025-11-20',
    examTime: '08:45',
    examItemName: '胸部CT平扫',
    modality: 'CT',
    bodyPart: 'CHEST',
    deviceName: 'GE Revolution Apex（CT-01）',
    status: '已完成',
    reportDate: '2025-11-20 10:30',
    reportDoctor: '张伟明',
    finding: '左肺上叶见一枚直径约6mm磨玻璃结节。右肺中叶见索条影。余肺野清晰。',
    conclusion: '左肺磨玻璃结节6mm，建议3个月复查。',
  },
  {
    id: 'h5',
    examId: 'EX20250905001',
    examDate: '2025-09-05',
    examTime: '15:30',
    examItemName: '腹部CT平扫',
    modality: 'CT',
    bodyPart: 'ABDOMEN',
    deviceName: '西门子SOMATOM Force（CT-02）',
    status: '已完成',
    reportDate: '2025-09-05 17:00',
    reportDoctor: '赵红',
    finding: '肝实质内未见明显异常密度影。胆囊未见结石。胰腺、脾脏、双肾未见异常。',
    conclusion: '腹部CT平扫未见明显异常。',
  },
]

// ============================================================
// 样式对象
// ============================================================
const s = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: 'calc(100vh - 52px)',
    background: PANEL_BG,
    fontFamily: '"PingFang SC", "Microsoft YaHei", -apple-system, sans-serif',
    overflow: 'hidden',
  },
  // ---- 主体三栏布局 ----
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  // ---- 左侧工具栏 ----
  leftToolbar: {
    width: 60,
    background: `linear-gradient(180deg, ${PRIMARY} 0%, ${PRIMARY_LIGHT} 100%)`,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    gap: 4,
    borderRight: `1px solid ${PRIMARY}`,
    flexShrink: 0,
    boxShadow: '2px 0 8px rgba(30,58,95,0.3)',
  },
  toolBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    position: 'relative' as const,
    flexShrink: 0,
  },
  toolBtnActive: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  toolDivider: {
    width: 32,
    height: 1,
    background: 'rgba(255,255,255,0.2)',
    margin: '4px 0',
  },
  // ---- 中间影像区 ----
  centerArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#111',
    overflow: 'hidden',
    minWidth: 0,
  },
  // 顶部工具条
  topToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: CARD_BG,
    borderBottom: `1px solid #e2e8f0`,
    flexShrink: 0,
    flexWrap: 'wrap' as const,
  },
  topToolbarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 10px',
    borderRight: '1px solid #e2e8f0',
  },
  topToolbarSectionLast: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 10px',
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
  },
  select: {
    padding: '4px 8px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    background: '#fff',
    fontSize: 12,
    color: PRIMARY,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    minWidth: 180,
  },
  slider: {
    width: 120,
    accentColor: PRIMARY,
    cursor: 'pointer',
  },
  sliderVal: {
    fontSize: 11,
    color: PRIMARY,
    fontWeight: 600,
    minWidth: 36,
    textAlign: 'right' as const,
  },
  imgCounter: {
    fontSize: 13,
    color: '#1e3a5f',
    fontWeight: 700,
    background: '#f0f4f8',
    padding: '4px 12px',
    borderRadius: 20,
    border: `1px solid #cbd5e1`,
  },
  layoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    transition: 'all 0.15s',
  },
  layoutBtnActive: {
    background: PRIMARY,
    borderColor: PRIMARY,
  },
  presetBtn: {
    padding: '4px 10px',
    borderRadius: 20,
    border: `1px solid #cbd5e1`,
    background: '#fff',
    color: '#475569',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  },
  presetBtnActive: {
    background: PRIMARY,
    color: '#fff',
    borderColor: PRIMARY,
  },
  fullscreenBtn: {
    marginLeft: 'auto',
    padding: '4px 8px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
  },
  // 影像主显示区
  imageMain: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'crosshair',
  },
  imageWrapper: {
    position: 'relative' as const,
    border: `2px solid #334155`,
    background: '#000',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 影像叠加信息
  overlayTL: {
    position: 'absolute' as const,
    top: 8,
    left: 8,
    background: 'rgba(0,0,0,0.75)',
    borderRadius: 6,
    padding: '6px 10px',
    color: '#fff',
    fontSize: 11,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 3,
    zIndex: 10,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  overlayTR: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    background: 'rgba(0,0,0,0.75)',
    borderRadius: 6,
    padding: '6px 10px',
    color: '#fff',
    fontSize: 11,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 3,
    zIndex: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'right' as const,
  },
  overlayBL: {
    position: 'absolute' as const,
    bottom: 8,
    left: 8,
    background: 'rgba(0,0,0,0.75)',
    borderRadius: 6,
    padding: '6px 10px',
    color: '#fff',
    fontSize: 11,
    zIndex: 10,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  overlayBR: {
    position: 'absolute' as const,
    bottom: 8,
    right: 8,
    background: 'rgba(0,0,0,0.75)',
    borderRadius: 6,
    padding: '6px 10px',
    color: '#fff',
    fontSize: 11,
    zIndex: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'right' as const,
  },
  // 底部序列缩略图
  seriesStrip: {
    height: 100,
    background: '#0d1117',
    borderTop: `1px solid #1e2533`,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 16px',
    overflowX: 'auto',
    flexShrink: 0,
  },
  seriesThumb: {
    width: 72,
    height: 72,
    borderRadius: 6,
    border: '2px solid #333',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flexShrink: 0,
    transition: 'all 0.2s',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  seriesThumbActive: {
    border: `2px solid ${PRIMARY}`,
    boxShadow: `0 0 12px ${PRIMARY}`,
  },
  seriesThumbInner: {
    width: 48,
    height: 48,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    color: '#fff',
    fontWeight: 700,
  },
  // 窗宽窗位弹出
  wlPopup: {
    position: 'absolute' as const,
    left: 60,
    top: 60,
    width: 240,
    background: CARD_BG,
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    border: `1px solid #e2e8f0`,
    zIndex: 100,
    padding: 12,
  },
  wlPopupTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: PRIMARY,
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  wlSliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  wlLabel: {
    fontSize: 11,
    color: '#64748b',
    width: 36,
    flexShrink: 0,
  },
  wlSlider: {
    flex: 1,
    accentColor: PRIMARY,
  },
  wlVal: {
    fontSize: 11,
    color: PRIMARY,
    fontWeight: 700,
    width: 40,
    textAlign: 'right' as const,
  },
  // 测量子菜单
  measureMenu: {
    position: 'absolute' as const,
    left: 60,
    top: 280,
    background: CARD_BG,
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    border: `1px solid #e2e8f0`,
    zIndex: 100,
    padding: 6,
    minWidth: 140,
  },
  measureMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    color: '#475569',
    transition: 'all 0.15s',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left' as const,
  },
  // ---- 右侧面板 ----
  rightPanel: {
    width: 280,
    background: CARD_BG,
    borderLeft: `1px solid #e2e8f0`,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '-2px 0 8px rgba(0,0,0,0.05)',
  },
  rightTabs: {
    display: 'flex',
    borderBottom: `2px solid #e2e8f0`,
    background: '#f8fafc',
    flexShrink: 0,
  },
  rightTab: {
    flex: 1,
    padding: '10px 4px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 3,
    transition: 'all 0.15s',
    borderBottom: `2px solid transparent`,
    marginBottom: -2,
  },
  rightTabActive: {
    color: PRIMARY,
    borderBottom: `2px solid ${PRIMARY}`,
    background: '#fff',
  },
  rightPanelContent: {
    flex: 1,
    overflowY: 'auto',
    padding: 12,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoSectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: PRIMARY,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 6,
    borderBottom: `1px solid #e2e8f0`,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  infoLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  infoValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: 600,
  },
  infoValueFull: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  // 报告状态
  reportStatusCard: {
    background: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    border: `1px solid #e2e8f0`,
  },
  reportStatusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
  },
  reportBtn: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    transition: 'all 0.15s',
  },
  // 测量列表
  measureListItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    background: '#f8fafc',
    borderRadius: 6,
    marginBottom: 4,
    border: `1px solid #e2e8f0`,
  },
  measureListItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  measureListItemDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  // MPR标签
  mprTabs: {
    display: 'flex',
    gap: 4,
    marginTop: 12,
  },
  mprTab: {
    flex: 1,
    padding: '6px 8px',
    borderRadius: 8,
    border: `1px solid #e2e8f0`,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    color: '#64748b',
    textAlign: 'center' as const,
    transition: 'all 0.15s',
  },
  mprTabActive: {
    background: PRIMARY,
    color: '#fff',
    borderColor: PRIMARY,
  },
  // 底部状态栏
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '5px 16px',
    background: '#0d1117',
    borderTop: `1px solid #1e2533`,
    fontSize: 11,
    color: '#6b7280',
    flexShrink: 0,
  },
  // 序列滑块区域
  seriesNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 8px',
  },
  // ---- 历史对比面板样式 ----
  historyPanel: {
    padding: 0,
  },
  historySearchRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 10,
  },
  historySearchInput: {
    flex: 1,
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    fontSize: 11,
    outline: 'none',
    fontFamily: 'inherit',
  },
  historySearchBtn: {
    padding: '6px 10px',
    borderRadius: 6,
    border: 'none',
    background: PRIMARY,
    color: '#fff',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  historyListItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    marginBottom: 6,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  historyListItemSelected: {
    border: '2px solid #3b82f6',
    background: '#eff6ff',
  },
  historyListItemChecked: {
    border: '2px solid #22c55e',
    background: '#f0fdf4',
  },
  historyCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    border: '2px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
    cursor: 'pointer',
  },
  historyCheckboxChecked: {
    background: '#22c55e',
    borderColor: '#22c55e',
  },
  historyListItemContent: {
    flex: 1,
    minWidth: 0,
  },
  historyListItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyListItemTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  historyListItemDate: {
    fontSize: 10,
    color: '#94a3b8',
  },
  historyListItemMeta: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 1.4,
  },
  historyListItemStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    padding: '2px 6px',
    borderRadius: 10,
    fontSize: 9,
    fontWeight: 700,
    marginTop: 4,
  },
  historyListEmpty: {
    textAlign: 'center' as const,
    padding: '24px 12px',
    color: '#94a3b8',
    fontSize: 11,
  },
  historyListEmptyIcon: {
    marginBottom: 8,
    opacity: 0.5,
  },
  // ---- 对比模式样式 ----
  compareToolbarBtn: {
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#475569',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    transition: 'all 0.15s',
  },
  compareToolbarBtnActive: {
    background: '#3b82f6',
    borderColor: '#3b82f6',
    color: '#fff',
  },
  compareSplitContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  compareSplitPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  compareDivider: {
    width: 4,
    background: PRIMARY,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareDividerHandle: {
    width: 12,
    height: 40,
    background: PRIMARY,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'col-resize',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
  },
  compareLabel: {
    position: 'absolute' as const,
    top: 8,
    left: 8,
    background: 'rgba(30,58,95,0.9)',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    zIndex: 10,
  },
  compareLabelRight: {
    left: 'auto',
    right: 8,
  },
  // ---- 差异高亮样式 ----
  diffHighlightOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as const,
    zIndex: 5,
  },
  diffRegion: {
    position: 'absolute' as const,
    border: '2px dashed #ef4444',
    background: 'rgba(239,68,68,0.15)',
    borderRadius: 4,
  },
  diffRegionNew: {
    border: '2px dashed #22c55e',
    background: 'rgba(34,197,94,0.15)',
  },
  diffRegionImproved: {
    border: '2px dashed #3b82f6',
    background: 'rgba(59,130,246,0.15)',
  },
  // ---- 对比信息卡片 ----
  compareInfoCard: {
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    padding: 10,
    marginBottom: 8,
  },
  compareInfoCardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: PRIMARY,
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  compareInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '3px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  compareInfoRowLast: {
    borderBottom: 'none',
  },
  compareInfoLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  compareInfoValue: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1e293b',
  },
  compareInfoValueIncrease: {
    color: '#22c55e',
  },
  compareInfoValueDecrease: {
    color: '#ef4444',
  },
  compareInfoNoChange: {
    color: '#94a3b8',
  },
  // ---- 同步滚动控制 ----
  syncScrollBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    padding: '3px 8px',
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 700,
  },
  syncScrollBadgeOn: {
    background: '#dcfce7',
    color: '#16a34a',
  },
  syncScrollBadgeOff: {
    background: '#f1f5f9',
    color: '#64748b',
  },
  // ---- 差异摘要 ----
  diffSummaryCard: {
    background: '#fefce8',
    border: '1px solid #fef08a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  diffSummaryTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#a16207',
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  diffSummaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 0',
    fontSize: 10,
    color: '#713f12',
  },
  diffSummaryDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
  },
  // ---- 历史列表操作栏 ----
  historyActionBar: {
    display: 'flex',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap' as const,
  },
  historyActionBtn: {
    flex: 1,
    minWidth: 60,
    padding: '6px 8px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: '#fff',
    fontSize: 10,
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    transition: 'all 0.15s',
  },
  historyActionBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // ---- 对比工具栏 ----
  compareToolbarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 10px',
    borderRight: '1px solid #e2e8f0',
  },
  compareToolbarDivider: {
    width: 1,
    height: 20,
    background: '#e2e8f0',
  },
  // ---- 标注工具面板样式 ----
  annotationPanel: {
    position: 'absolute' as const,
    left: 60,
    top: 200,
    width: 200,
    background: CARD_BG,
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    border: `1px solid #e2e8f0`,
    zIndex: 100,
    padding: 10,
  },
  annotationPanelTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: PRIMARY,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  annotationTypeRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 4,
    marginBottom: 8,
  },
  annotationTypeBtn: {
    width: '100%',
    height: 36,
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    transition: 'all 0.15s',
    padding: 4,
  },
  annotationTypeBtnActive: {
    background: PRIMARY,
    borderColor: PRIMARY,
    color: '#fff',
  },
  annotationTypeBtnLabel: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center' as const,
  },
  annotationColorPicker: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 4,
    marginBottom: 8,
  },
  annotationColorBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  annotationColorBtnActive: {
    border: '2px solid #1e3a5f',
    transform: 'scale(1.1)',
  },
  annotationFontSizeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  annotationFontSizeLabel: {
    fontSize: 10,
    color: '#64748b',
    flexShrink: 0,
  },
  annotationFontSizeInput: {
    flex: 1,
    padding: '4px 6px',
    borderRadius: 4,
    border: '1px solid #cbd5e1',
    fontSize: 11,
    outline: 'none',
    width: 50,
  },
  annotationListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 8px',
    background: '#f8fafc',
    borderRadius: 6,
    marginBottom: 4,
    border: `1px solid #e2e8f0`,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  annotationListItemSelected: {
    border: '2px solid #3b82f6',
    background: '#eff6ff',
  },
  annotationListItemLocked: {
    opacity: 0.7,
  },
  annotationListItemActions: {
    display: 'flex',
    gap: 4,
    marginLeft: 'auto',
  },
  annotationActionBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    transition: 'all 0.15s',
  },
  // ---- 伪彩面板样式 ----
  pseudoColorPanel: {
    position: 'absolute' as const,
    left: 60,
    top: 320,
    width: 180,
    background: CARD_BG,
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    border: `1px solid #e2e8f0`,
    zIndex: 100,
    padding: 10,
  },
  pseudoColorPanelTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: PRIMARY,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  pseudoColorBtn: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: '#475569',
    transition: 'all 0.15s',
    marginBottom: 4,
  },
  pseudoColorBtnActive: {
    background: PRIMARY,
    borderColor: PRIMARY,
    color: '#fff',
  },
  pseudoColorPreview: {
    width: 24,
    height: 24,
    borderRadius: 4,
    border: '1px solid rgba(0,0,0,0.1)',
    flexShrink: 0,
  },
  // ---- 交互式测量绘制样式 ----
  measureOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as const,
    zIndex: 8,
  },
  measurePoint: {
    position: 'absolute' as const,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#fff',
    border: '2px solid #22c55e',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none' as const,
  },
  measureLine: {
    position: 'absolute' as const,
    background: '#22c55e',
    height: 2,
    transformOrigin: '0 50%',
    pointerEvents: 'none' as const,
  },
  measureLabel: {
    position: 'absolute' as const,
    background: 'rgba(0,0,0,0.8)',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 11,
    fontFamily: 'monospace',
    pointerEvents: 'none' as const,
    whiteSpace: 'nowrap' as const,
  },
  // ---- 标注叠加层样式 ----
  annotationOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as const,
    zIndex: 9,
  },
  annotationSvg: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none' as const,
  },
  // ---- 测量列表增强样式 ----
  measureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    background: '#f8fafc',
    borderRadius: 8,
    marginBottom: 6,
    border: `1px solid #e2e8f0`,
  },
  measureItemColor: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  measureItemInfo: {
    flex: 1,
    minWidth: 0,
  },
  measureItemValue: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1e293b',
  },
  measureItemType: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'capitalize' as const,
  },
  measureItemActions: {
    display: 'flex',
    gap: 4,
  },
  // ---- 对比模式增强样式 ----
  compareToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: '#f8fafc',
    borderBottom: `1px solid #e2e8f0`,
    flexShrink: 0,
  },
  compareLayoutBtn: {
    padding: '4px 8px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#475569',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    transition: 'all 0.15s',
  },
  compareLayoutBtnActive: {
    background: PRIMARY,
    borderColor: PRIMARY,
    color: '#fff',
  },
  compareSeriesSelect: {
    padding: '4px 8px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    background: '#fff',
    fontSize: 11,
    color: PRIMARY,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    minWidth: 140,
  },
  compareControlBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: 'none',
  },
  compareControlBadgeOn: {
    background: PRIMARY,
    color: '#fff',
  },
  compareControlBadgeOff: {
    background: '#e2e8f0',
    color: '#64748b',
  },
}

// ============================================================
// 工具提示组件
// ============================================================
function Tooltip({ children, title }: { children: React.ReactNode; title: string }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: 8,
          background: 'rgba(0,0,0,0.85)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 11,
          whiteSpace: 'nowrap',
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          {title}
        </div>
      )}
    </div>
  )
}

// ============================================================
// DICOM模拟画布组件
// ============================================================
function DicomCanvas({
  zoom, rotation, flipH, flipV, ww, wl, brightness, contrast,
  activeTool, panX, panY, windowPreset, measureType, activeSeries,
  imageIndex, images, pseudoColorMode
}: {
  zoom: number; rotation: number; flipH: boolean; flipV: boolean;
  ww: number; wl: number; brightness: number; contrast: number;
  activeTool: Tool; panX: number; panY: number;
  windowPreset: string; measureType: MeasureSubMenu;
  activeSeries: Series; imageIndex: number; images: DicomImage[];
  pseudoColorMode?: PseudoColorMode;
}) {
  const img = images[imageIndex] || images[0]
  const w = 512
  const h = 512

  // 根据窗宽窗位计算颜色（支持伪彩）
  const getPixelColor = (base: number, windowCenter: number, windowWidth: number) => {
    const min = windowCenter - windowWidth / 2
    const max = windowCenter + windowWidth / 2
    const normalized = (base - min) / (max - min)
    const clamped = Math.max(0, Math.min(1, normalized))
    const grayValue = Math.round(clamped * 255)

    // 应用伪彩滤镜
    if (pseudoColorMode && pseudoColorMode !== 'none') {
      const pseudo = applyPseudoColor(grayValue, pseudoColorMode)
      return { r: pseudo.r, g: pseudo.g, b: pseudo.b, gray: grayValue }
    }

    return { r: grayValue, g: grayValue, b: grayValue, gray: grayValue }
  }

  // 生成横断面CT图像
  const renderCTAxial = () => {
    const cells: React.ReactNode[] = []
    const step = 4
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const dx = x - w / 2
        const dy = y - h / 2
        const dist = Math.sqrt(dx * dx + dy * dy)
        let v = 20
        // 身体轮廓
        if (dist < 200) {
          const nx = dx / 200
          const ny = dy / 200
          // 肺野
          const lungL = Math.sqrt((dx + 80) ** 2 + (dy + 20) ** 2)
          const lungR = Math.sqrt((dx - 80) ** 2 + (dy + 20) ** 2)
          if (lungL < 55 || lungR < 55) {
            v = 15
          } else {
            // 软组织
            v = 45 + Math.sin(nx * 3 + ny * 2) * 8 + Math.random() * 5
            // 心脏
            const heart = Math.sqrt((dx - 10) ** 2 + (dy + 30) ** 2)
            if (heart < 60) {
              v = 55 + Math.sin(nx * 5 + ny * 4) * 6
            }
            // 肝脏/腹部
            if (dy > 60 && dy < 140) {
              v = 50 + Math.sin(ny * 0.1) * 5
            }
            // 脊椎
            if (Math.abs(dx) < 20 && dy > 80 && dy < 110) {
              v = 70
            }
            // 肋骨
            const ribDist = Math.abs(Math.sqrt(dy ** 2 + ((dx % 40) - 20) ** 2) - 120)
            if (ribDist < 8 && dy < 60) {
              v = 85
            }
          }
        }
        const c = getPixelColor(v, wl, ww)
        cells.push(
          <rect key={`${x}-${y}`} x={x} y={y} width={step} height={step}
            fill={`rgb(${c},${c},${c})`} />
        )
      }
    }
    return cells
  }

  // 生成MR图像（T2加权模拟）
  const renderMR = () => {
    const cells: React.ReactNode[] = []
    const step = 4
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const dx = x - w / 2
        const dy = y - h / 2
        const dist = Math.sqrt(dx * dx + dy * dy)
        let v = 30
        if (dist < 200) {
          const brain = Math.sqrt((dx - 5) ** 2 + (dy - 10) ** 2)
          if (brain < 120) {
            v = 60 + Math.sin(dx * 0.08) * 15 + Math.cos(dy * 0.1) * 15
            // 脑室
            if (Math.abs(dx - 5) < 15 && dy < -20 && dy > -60) v = 20
          }
        }
        const r = getPixelColor(v + 10, wl, ww)
        const g = getPixelColor(v, wl, ww)
        const b = getPixelColor(v - 5, wl, ww)
        cells.push(
          <rect key={`${x}-${y}`} x={x} y={y} width={step} height={step}
            fill={`rgb(${r},${g},${b})`} />
        )
      }
    }
    return cells
  }

  // 生成DR图像
  const renderDR = () => {
    const cells: React.ReactNode[] = []
    const step = 4
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const dx = x - w / 2
        const dy = y - h / 2
        let v = 80 + Math.random() * 10
        // 肺部
        if (dy < 50 && Math.abs(dx) > 40) {
          v = 20 + Math.random() * 15
        }
        // 心脏
        if (dx > -60 && dx < 20 && dy > -80 && dy < -20) {
          v = 100 + Math.random() * 20
        }
        // 肋骨
        const dist = Math.sqrt(dx * dx + dy * dy)
        const ribAngle = Math.atan2(dy, dx)
        if (dist < 180 && Math.abs(Math.sin(ribAngle * 6)) < 0.15 && dy < 0) {
          v = 160 + Math.random() * 20
        }
        const c = getPixelColor(v, wl, ww)
        cells.push(
          <rect key={`${x}-${y}`} x={x} y={y} width={step} height={step}
            fill={`rgb(${c},${c},${c})`} />
        )
      }
    }
    return cells
  }

  let shapes: React.ReactNode = null
  if (activeSeries.modality === 'CT') {
    shapes = renderCTAxial()
  } else if (activeSeries.modality === 'MR') {
    shapes = renderMR()
  } else {
    shapes = renderDR()
  }

  const transform = `
    translate(${panX}px, ${panY}px)
    scale(${zoom / 100})
    rotate(${rotation}deg)
    scaleX(${flipH ? -1 : 1})
    scaleY(${flipV ? -1 : 1})
  `

  // 鼠标样式
  const cursorStyle = (() => {
    switch (activeTool) {
      case 'zoom': return 'zoom-in'
      case 'pan': return 'grab'
      case 'wl': return 'crosshair'
      case 'measure': return 'crosshair'
      case 'annotate': return 'crosshair'
      default: return 'default'
    }
  })()

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        transform,
        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
        transition: 'transform 0.2s, filter 0.2s',
        transformOrigin: 'center center',
        cursor: cursorStyle,
      }}
    >
      {shapes}
      {/* 十字准星（标注模式） */}
      {activeTool === 'annotate' && (
        <>
          <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="rgba(255,0,0,0.5)" strokeWidth={1} strokeDasharray="4" />
          <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="rgba(255,0,0,0.5)" strokeWidth={1} strokeDasharray="4" />
        </>
      )}
      {/* 网格（网格工具） */}
      {[1, 2, 3].map(p => (
        <g key={p}>
          <line x1={(w / 4) * p} y1={0} x2={(w / 4) * p} y2={h} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          <line x1={0} y1={(h / 4) * p} x2={w} y2={(h / 4) * p} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        </g>
      ))}
      {/* 测量标记示例 */}
      {(measureType === 'length' || measureType === 'angle') && (
        <>
          <line x1={150} y1={200} x2={300} y2={250} stroke="#00ff00" strokeWidth={2} />
          <circle cx={150} cy={200} r={3} fill="#00ff00" />
          <circle cx={300} cy={250} r={3} fill="#00ff00" />
          {measureType === 'length' && (
            <text x={220} y={220} fill="#00ff00" fontSize={12} fontFamily="monospace">12.5mm</text>
          )}
        </>
      )}
    </svg>
  )
}

// ============================================================
// 主组件
// ============================================================
export default function DicomViewerPage() {
  // ---- 数据状态 ----
  const [selectedExamIdx, setSelectedExamIdx] = useState(0)
  const exam = initialRadiologyExams[selectedExamIdx]

  const [seriesList] = useState<Series[]>(() => generateSeries(exam.modality))
  const [activeSeriesIdx, setActiveSeriesIdx] = useState(0)
  const activeSeries = seriesList[activeSeriesIdx]

  const [images] = useState<DicomImage[]>(() => generateImages(activeSeries))
  const [imageIndex, setImageIndex] = useState(Math.floor(images.length / 2))

  // ---- 工具状态 ----
  const [activeTool, setActiveTool] = useState<Tool>('zoom')
  const [measureSubMenu, setMeasureSubMenu] = useState<MeasureSubMenu>(null)
  const [showWlPopup, setShowWlPopup] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const playRef = useRef<NodeJS.Timeout | null>(null)

  // ---- 影像调整 ----
  const [zoom, setZoom] = useState(100)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [ww, setWw] = useState(400)
  const [wl, setWl] = useState(40)
  const [activePresetIdx, setActivePresetIdx] = useState<number | null>(null)
  const [activeMprIdx, setActiveMprIdx] = useState(0)

  // ---- 布局 ----
  const [layout, setLayout] = useState<LayoutMode>('1x1')

  // ---- 右侧面板 ----
  const [rightTab, setRightTab] = useState<RightTab>('patient')

  // ---- 测量 ----
  const [measurements] = useState(mockMeasurements)

  // ---- 报告 ----
  const reportStatus = exam.status === '已完成' ? '已报告' :
    exam.status === '待报告' ? '待书写' :
      exam.status === '检查中' ? '检查中' : '未检查'

  // ---- 历史对比 ----
  const [historyExams] = useState<HistoryExam[]>(mockHistoryExams)
  const [selectedHistoryExams, setSelectedHistoryExams] = useState<string[]>([])
  const [historySearchText, setHistorySearchText] = useState('')
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [compareExam, setCompareExam] = useState<HistoryExam | null>(null)
  const [syncScroll, setSyncScroll] = useState(true)
  const [showDiffHighlight, setShowDiffHighlight] = useState(true)
  const [compareImageIndex, setCompareImageIndex] = useState(Math.floor(images.length / 2))
  const [compareLayout, setCompareLayout] = useState<CompareLayout>('leftRight')

  // ============================================================
  // 扩充功能状态 - 标注工具
  // ============================================================
  const [annotations, setAnnotations] = useState<Annotation[]>([
    // 初始示例标注
    { id: 'a1', type: 'text', x: 100, y: 100, text: '病灶区域', color: '#ff0000', fontSize: 14, visible: true, locked: false },
    { id: 'a2', type: 'arrow', x: 150, y: 150, x2: 250, y2: 200, color: '#00ff00', fontSize: 12, visible: true, locked: false },
    { id: 'a3', type: 'rect', x: 200, y: 200, x2: 300, y2: 280, color: '#ffff00', fontSize: 12, visible: true, locked: true },
  ])
  const [activeAnnotationType, setActiveAnnotationType] = useState<AnnotationType>('text')
  const [activeAnnotationColor, setActiveAnnotationColor] = useState('#ff0000')
  const [activeAnnotationFontSize, setActiveAnnotationFontSize] = useState(14)
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null)
  const [annotationInputText, setAnnotationInputText] = useState('')
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false)
  const [showAnnotationColorPicker, setShowAnnotationColorPicker] = useState(false)

  // ============================================================
  // 扩充功能状态 - 交互式测量
  // ============================================================
  const [interactiveMeasures, setInteractiveMeasures] = useState<InteractiveMeasure[]>([])
  const [isDrawingMeasure, setIsDrawingMeasure] = useState(false)
  const [drawingPoints, setDrawingPoints] = useState<MeasurePoint[]>([])
  const [tempMeasureValue, setTempMeasureValue] = useState<{ value: number; unit: string } | null>(null)

  // ============================================================
  // 扩充功能状态 - 伪彩显示
  // ============================================================
  const [pseudoColorMode, setPseudoColorMode] = useState<PseudoColorMode>('none')
  const [showPseudoColorPanel, setShowPseudoColorPanel] = useState(false)

  // ============================================================
  // 扩充功能状态 - 增强对比
  // ============================================================
  const [compareSeriesList, setCompareSeriesList] = useState<Series[]>([])
  const [compareActiveSeriesIdx, setCompareActiveSeriesIdx] = useState(0)
  const [compareImages, setCompareImages] = useState<DicomImage[]>([])
  const [showMeasurementsOverlay, setShowMeasurementsOverlay] = useState(true)
  const [showAnnotationsOverlay, setShowAnnotationsOverlay] = useState(true)

  // 同步滚动处理
  useEffect(() => {
    if (syncScroll && isCompareMode) {
      setCompareImageIndex(imageIndex)
    }
  }, [imageIndex, syncScroll, isCompareMode])

  // 历史检查选择/取消
  const toggleHistoryExam = (examId: string) => {
    setSelectedHistoryExams(prev => {
      if (prev.includes(examId)) {
        return prev.filter(id => id !== examId)
      }
      if (prev.length >= 2) {
        return [prev[1], examId]
      }
      return [...prev, examId]
    })
  }

  // 进入对比模式
  const enterCompareMode = () => {
    if (selectedHistoryExams.length === 1) {
      const exam = historyExams.find(h => h.id === selectedHistoryExams[0])
      if (exam) {
        setCompareExam(exam)
        setIsCompareMode(true)
      }
    } else if (selectedHistoryExams.length === 2) {
      const exam = historyExams.find(h => h.id === selectedHistoryExams[1])
      if (exam) {
        setCompareExam(exam)
        setIsCompareMode(true)
      }
    }
  }

  // 退出对比模式
  const exitCompareMode = () => {
    setIsCompareMode(false)
    setCompareExam(null)
    setCompareImageIndex(Math.floor(images.length / 2))
  }

  // 获取过滤后的历史检查
  const filteredHistoryExams = historyExams.filter(exam =>
    exam.examItemName.toLowerCase().includes(historySearchText.toLowerCase()) ||
    exam.examDate.includes(historySearchText) ||
    exam.modality.toLowerCase().includes(historySearchText.toLowerCase())
  )

  // 计算对比差异信息
  const getCompareDiffInfo = () => {
    if (!compareExam) return null
    const diffInfo: { label: string; oldVal: string; newVal: string; type: 'increase' | 'decrease' | 'new' | 'same' }[] = []
    // 模拟差异数据
    if (compareExam.examItemName.includes('CT')) {
      diffInfo.push({ label: '病灶大小', oldVal: '6mm', newVal: '8mm', type: 'increase' })
      diffInfo.push({ label: '病灶数量', oldVal: '1枚', newVal: '1枚', type: 'same' })
      diffInfo.push({ label: '性质描述', oldVal: '磨玻璃结节', newVal: '磨玻璃结节', type: 'same' })
    }
    return diffInfo
  }

  // ============================================================
  // 标注工具相关函数
  // ============================================================

  // 添加新标注
  const addAnnotation = (annotation: Omit<Annotation, 'id'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    setAnnotations(prev => [...prev, newAnnotation])
    return newAnnotation.id
  }

  // 更新标注
  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => prev.map(ann => ann.id === id ? { ...ann, ...updates } : ann))
  }

  // 删除标注
  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id))
    if (selectedAnnotationId === id) setSelectedAnnotationId(null)
  }

  // 清除所有标注
  const clearAllAnnotations = () => {
    setAnnotations([])
    setSelectedAnnotationId(null)
  }

  // 锁定/解锁标注
  const toggleAnnotationLock = (id: string) => {
    setAnnotations(prev => prev.map(ann => ann.id === id ? { ...ann, locked: !ann.locked } : ann))
  }

  // 切换标注可见性
  const toggleAnnotationVisibility = (id: string) => {
    setAnnotations(prev => prev.map(ann => ann.id === id ? { ...ann, visible: !ann.visible } : ann))
  }

  // ============================================================
  // 交互式测量相关函数
  // ============================================================

  // 计算两点间距离（像素）
  const calculateDistance = (p1: MeasurePoint, p2: MeasurePoint): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  // 计算角度（三点）
  const calculateAngle = (p1: MeasurePoint, vertex: MeasurePoint, p2: MeasurePoint): number => {
    const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y }
    const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y }
    const dot = v1.x * v2.x + v1.y * v2.y
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
    const cosAngle = dot / (mag1 * mag2)
    return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI)
  }

  // 计算多边形面积（使用鞋带公式）
  const calculateArea = (points: MeasurePoint[]): number => {
    if (points.length < 3) return 0
    let area = 0
    const n = points.length
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    return Math.abs(area) / 2
  }

  // 根据测量类型完成测量
  const finalizeMeasure = useCallback(() => {
    if (drawingPoints.length === 0) return

    const measureType = measureSubMenu
    if (!measureType) return

    let value = 0
    let unit = ''
    let color = '#22c55e'

    if (measureType === 'length' && drawingPoints.length >= 2) {
      const pixelDist = calculateDistance(drawingPoints[0], drawingPoints[1])
      const img = images[imageIndex] || images[0]
      const mmDist = pixelDist * (img?.pixelSpacing || 0.68)
      value = parseFloat(mmDist.toFixed(2))
      unit = 'mm'
      color = '#22c55e'
    } else if (measureType === 'angle' && drawingPoints.length >= 3) {
      value = parseFloat(calculateAngle(drawingPoints[0], drawingPoints[1], drawingPoints[2]).toFixed(1))
      unit = '°'
      color = '#f59e0b'
    } else if (measureType === 'area' && drawingPoints.length >= 3) {
      const pixelArea = calculateArea(drawingPoints)
      const img = images[imageIndex] || images[0]
      const mm2Area = pixelArea * Math.pow(img?.pixelSpacing || 0.68, 2)
      value = parseFloat(mm2Area.toFixed(2))
      unit = 'mm²'
      color = '#8b5cf6'
    } else if (measureType === 'ct' && drawingPoints.length >= 1) {
      // 模拟CT值：基于像素位置生成随机HU值
      value = Math.round(20 + Math.random() * 60)
      unit = 'HU'
      color = '#3b82f6'
    }

    const newMeasure: InteractiveMeasure = {
      id: `measure_${Date.now()}`,
      type: measureType,
      points: [...drawingPoints],
      value,
      unit,
      color,
      visible: true,
    }

    setInteractiveMeasures(prev => [...prev, newMeasure])
    setDrawingPoints([])
    setIsDrawingMeasure(false)
    setTempMeasureValue(null)
  }, [drawingPoints, measureSubMenu, imageIndex, images])

  // 删除测量
  const deleteMeasure = (id: string) => {
    setInteractiveMeasures(prev => prev.filter(m => m.id !== id))
  }

  // 清除所有测量
  const clearAllMeasures = () => {
    setInteractiveMeasures([])
    setDrawingPoints([])
    setIsDrawingMeasure(false)
  }

  // ============================================================
  // 伪彩滤镜计算函数
  // ============================================================
  const applyPseudoColor = (grayValue: number, mode: PseudoColorMode): { r: number; g: number; b: number } => {
    const v = grayValue / 255

    switch (mode) {
      case 'hotIron':
        // 热铁伪彩：黑->蓝->红->黄->白
        if (v < 0.25) {
          return { r: 0, g: 0, b: Math.round(v * 4 * 255) }
        } else if (v < 0.5) {
          return { r: 0, g: Math.round((v - 0.25) * 4 * 255), b: 255 }
        } else if (v < 0.75) {
          return { r: Math.round((v - 0.5) * 4 * 255), g: 255, b: Math.round(255 - (v - 0.5) * 4 * 255) }
        } else {
          return { r: 255, g: 255, b: Math.round((v - 0.75) * 4 * 255) }
        }

      case 'coolBlue':
        // 冷蓝伪彩：黑->青->蓝->白
        if (v < 0.33) {
          return { r: 0, g: Math.round(v * 3 * 255), b: Math.round(v * 3 * 255) }
        } else if (v < 0.66) {
          return { r: 0, g: 255, b: Math.round((v - 0.33) * 3 * 255) }
        } else {
          return { r: Math.round((v - 0.66) * 3 * 255), g: 255, b: 255 }
        }

      case 'pet':
        // PET伪彩：彩虹色
        const colors = [
          { r: 0, g: 0, b: 255 },
          { r: 0, g: 255, b: 255 },
          { r: 0, g: 255, b: 0 },
          { r: 255, g: 255, b: 0 },
          { r: 255, g: 0, b: 0 },
          { r: 255, g: 0, b: 255 },
        ]
        const idx = v * (colors.length - 1)
        const i = Math.floor(idx)
        const t = idx - i
        const c1 = colors[Math.min(i, colors.length - 1)]
        const c2 = colors[Math.min(i + 1, colors.length - 1)]
        return {
          r: Math.round(c1.r + (c2.r - c1.r) * t),
          g: Math.round(c1.g + (c2.g - c1.g) * t),
          b: Math.round(c1.b + (c2.b - c1.b) * t),
        }

      case 'softTissue':
        // 软组织伪彩：青绿调
        return {
          r: Math.round(v * 200),
          g: Math.round(v * 220),
          b: Math.round(v * 200 + 55),
        }

      case 'grayscale':
      default:
        return { r: grayValue, g: grayValue, b: grayValue }
    }
  }

  // 差异高亮区域（模拟）
  const diffRegions = showDiffHighlight && isCompareMode ? [
    { id: 'd1', x: 180, y: 200, w: 60, h: 60, type: 'increase' as const },
    { id: 'd2', x: 280, y: 150, w: 40, h: 40, type: 'new' as const },
  ] : []

  // ---- 序列图像同步 ----
  useEffect(() => {
    setImageIndex(Math.floor(images.length / 2))
  }, [activeSeriesIdx])

  // ---- 滚轮切换图像 ----
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        setImageIndex(i => Math.min(i + 1, images.length - 1))
      } else {
        setImageIndex(i => Math.max(i - 1, 0))
      }
    }
    const el = document.getElementById('image-main-area')
    if (el) el.addEventListener('wheel', handleWheel)
    return () => { if (el) el.removeEventListener('wheel', handleWheel) }
  }, [images.length])

  // ---- 播放动画 ----
  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        setImageIndex(i => {
          if (i >= images.length - 1) {
            setIsPlaying(false)
            return 0
          }
          return i + 1
        })
      }, 150)
    } else {
      if (playRef.current) clearInterval(playRef.current)
    }
    return () => { if (playRef.current) clearInterval(playRef.current) }
  }, [isPlaying, images.length])

  // ---- 工具点击处理 ----
  const handleToolClick = (tool: Tool) => {
    if (tool === 'measure') {
      setActiveTool('measure')
      setMeasureSubMenu(measureSubMenu === null ? 'length' : null)
      setShowWlPopup(false)
    } else if (tool === 'wl') {
      setActiveTool('wl')
      setShowWlPopup(!showWlPopup)
      setMeasureSubMenu(null)
    } else if (tool === 'zoom') {
      setActiveTool('zoom')
      setShowWlPopup(false)
      setMeasureSubMenu(null)
    } else if (tool === 'pan') {
      setActiveTool('pan')
      setShowWlPopup(false)
      setMeasureSubMenu(null)
    } else if (tool === 'rotate') {
      setRotation(r => (r + 90) % 360)
    } else if (tool === 'flipH') {
      setFlipH(f => !f)
    } else if (tool === 'flipV') {
      setFlipV(f => !f)
    } else if (tool === 'reset') {
      setZoom(100); setPanX(0); setPanY(0); setRotation(0)
      setFlipH(false); setFlipV(false); setBrightness(100); setContrast(100)
      setWw(400); setWl(40)
    } else if (tool === 'play') {
      setIsPlaying(p => !p)
    } else if (tool === 'print') {
      alert('胶片打印功能（模拟）')
    } else {
      setActiveTool(tool)
      setShowWlPopup(false)
      setMeasureSubMenu(null)
    }
  }

  const handlePresetClick = (preset: WindowPreset, idx: number) => {
    setWw(preset.ww)
    setWl(preset.wl)
    setActivePresetIdx(activePresetIdx === idx ? null : idx)
  }

  const handleLayoutChange = (newLayout: LayoutMode) => {
    setLayout(newLayout)
  }

  const handleSeriesSelect = (idx: number) => {
    setActiveSeriesIdx(idx)
    setImageIndex(Math.floor(generateImages(seriesList[idx]).length / 2))
  }

  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value)
    setSelectedExamIdx(idx)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // ---- 布局网格配置 ----
  const gridConfig = {
    '1x1': { cols: 1, rows: 1 },
    '2x2': { cols: 2, rows: 2 },
    '1x2': { cols: 1, rows: 2 },
    '2x1': { cols: 2, rows: 1 },
  }[layout]

  const currentImage = images[imageIndex] || images[0]

  // ---- 工具按钮列表 ----
  const tools: { tool: Tool; icon: React.ReactNode; label: string; divider?: boolean }[] = [
    { tool: 'zoom', icon: <ZoomIn size={20} />, label: '缩放' },
    { tool: 'pan', icon: <Move size={20} />, label: '平移' },
    { tool: 'wl', icon: <Sun size={20} />, label: '窗口/级别' },
    { tool: 'rotate', icon: <RotateCw size={20} />, label: '旋转90°' },
    { tool: 'flipH', icon: <FlipHorizontal size={20} />, label: '水平翻转', divider: true },
    { tool: 'flipV', icon: <FlipVertical size={20} />, label: '垂直翻转' },
    { tool: 'reset', icon: <RefreshCw size={20} />, label: '重置', divider: true },
    { tool: 'measure', icon: <Ruler size={20} />, label: '测量' },
    { tool: 'annotate', icon: <PenTool size={20} />, label: '标注' },
    { tool: 'play', icon: isPlaying ? <Pause size={20} /> : <Play size={20} />, label: isPlaying ? '暂停' : '播放', divider: true },
    { tool: 'print', icon: <Printer size={20} />, label: '胶片打印' },
  ]

  // ============================================================
  // 伪彩工具按钮（独立于主工具栏）
  // ============================================================
  const pseudoColorTools: { mode: PseudoColorMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'none', icon: <EyeOff size={16} />, label: '原始' },
    { mode: 'hotIron', icon: <Flame size={16} />, label: '热铁' },
    { mode: 'coolBlue', icon: <Droplets size={16} />, label: '冷蓝' },
    { mode: 'pet', icon: <Activity size={16} />, label: 'PET' },
    { mode: 'softTissue', icon: <Wind size={16} />, label: '软组织' },
  ]

  // ============================================================
  // 标注工具按钮类型
  // ============================================================
  const annotationTypes: { type: AnnotationType; icon: React.ReactNode; label: string }[] = [
    { type: 'text', icon: <Type size={16} />, label: '文字' },
    { type: 'arrow', icon: <ArrowUpRight size={16} />, label: '箭头' },
    { type: 'rect', icon: <RectIcon size={16} />, label: '矩形' },
    { type: 'ellipse', icon: <CircleIcon size={16} />, label: '椭圆' },
  ]

  return (
    <div style={s.root}>
      {/* =============================================== */}
      {/* 主体三栏布局 */}
      {/* =============================================== */}
      <div style={s.body}>

        {/* =============================================== */}
        {/* 左侧工具栏 */}
        {/* =============================================== */}
        <div style={s.leftToolbar}>
          {tools.map(({ tool, icon, label, divider }) => (
            <div key={tool}>
              {divider && <div style={s.toolDivider} />}
              <Tooltip title={label}>
                <button
                  style={{
                    ...s.toolBtn,
                    ...(activeTool === tool ? s.toolBtnActive : {}),
                  }}
                  onClick={() => handleToolClick(tool)}
                >
                  {icon}
                </button>
              </Tooltip>
            </div>
          ))}

          {/* 缩放滑块（当工具为zoom时显示） */}
          {activeTool === 'zoom' && (
            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <button
                style={{ ...s.toolBtn, width: 36, height: 28, padding: 0 }}
                onClick={() => setZoom(z => Math.min(500, z + 20))}
              >
                <Plus size={14} color="#fff" />
              </button>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>{zoom}%</span>
              <button
                style={{ ...s.toolBtn, width: 36, height: 28, padding: 0 }}
                onClick={() => setZoom(z => Math.max(10, z - 20))}
              >
                <Minus size={14} color="#fff" />
              </button>
            </div>
          )}

          {/* 旋转按钮 */}
          {activeTool === 'rotate' && (
            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <button
                style={{ ...s.toolBtn, width: 36, height: 28, padding: 0 }}
                onClick={() => setRotation(r => (r + 90) % 360)}
              >
                <RotateCw size={14} color="#fff" />
              </button>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>{rotation}°</span>
              <button
                style={{ ...s.toolBtn, width: 36, height: 28, padding: 0 }}
                onClick={() => setRotation(r => (r - 90 + 360) % 360)}
              >
                <RotateCcw size={14} color="#fff" />
              </button>
            </div>
          )}

          {/* 伪彩快捷按钮 - 始终显示 */}
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Tooltip title="伪彩显示">
              <button
                style={{
                  ...s.toolBtn,
                  width: 36,
                  height: 28,
                  padding: 0,
                  ...(pseudoColorMode !== 'none' ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : {}),
                }}
                onClick={() => setShowPseudoColorPanel(!showPseudoColorPanel)}
              >
                {pseudoColorMode === 'none' ? <EyeOff size={14} /> :
                  pseudoColorMode === 'hotIron' ? <Flame size={14} /> :
                    pseudoColorMode === 'coolBlue' ? <Droplets size={14} /> :
                      pseudoColorMode === 'pet' ? <Activity size={14} /> :
                        <Wind size={14} />}
              </button>
            </Tooltip>
            {pseudoColorMode !== 'none' && (
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: pseudoColorMode === 'hotIron' ? '#ff4400' :
                  pseudoColorMode === 'coolBlue' ? '#0088ff' :
                    pseudoColorMode === 'pet' ? '#ff00ff' : '#00cc88',
              }} />
            )}
          </div>

          {/* 标注工具快捷按钮 */}
          <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Tooltip title="标注工具">
              <button
                style={{
                  ...s.toolBtn,
                  width: 36,
                  height: 28,
                  padding: 0,
                  ...(activeTool === 'annotate' ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : {}),
                }}
                onClick={() => {
                  setActiveTool('annotate')
                  setShowAnnotationPanel(!showAnnotationPanel)
                  setMeasureSubMenu(null)
                  setShowWlPopup(false)
                }}
              >
                <PenTool size={14} />
              </button>
            </Tooltip>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>标注</span>
          </div>
        </div>

        {/* =============================================== */}
        {/* 中间影像区 */}
        {/* =============================================== */}
        <div style={s.centerArea}>

          {/* ---- 顶部工具条 ---- */}
          <div style={s.topToolbar}>
            {/* 检查选择 */}
            <div style={s.topToolbarSection}>
              <span style={s.label}>检查:</span>
              <select
                style={s.select}
                value={selectedExamIdx}
                onChange={handleExamChange}
              >
                {initialRadiologyExams.map((e, i) => (
                  <option key={e.id} value={i}>
                    {e.patientName} - {e.examItemName} ({e.modality})
                  </option>
                ))}
              </select>
            </div>

            {/* 序列滑块 */}
            <div style={s.topToolbarSection}>
              <span style={s.label}>序列:</span>
              <span style={{ ...s.sliderVal, minWidth: 24 }}>
                {activeSeriesIdx + 1}/{seriesList.length}
              </span>
              <input
                type="range"
                min={0}
                max={seriesList.length - 1}
                value={activeSeriesIdx}
                onChange={e => handleSeriesSelect(parseInt(e.target.value))}
                style={s.slider}
              />
            </div>

            {/* 图像计数 */}
            <div style={s.topToolbarSection}>
              <span style={s.label}>图像:</span>
              <span style={s.imgCounter}>
                {imageIndex + 1} / {images.length}
              </span>
              <button
                style={{ ...s.toolBtn, color: PRIMARY, padding: '4px 6px', border: `1px solid #cbd5e1`, borderRadius: 6 }}
                onClick={() => setImageIndex(i => Math.max(0, i - 1))}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                style={{ ...s.toolBtn, color: PRIMARY, padding: '4px 6px', border: `1px solid #cbd5e1`, borderRadius: 6 }}
                onClick={() => setImageIndex(i => Math.min(images.length - 1, i + 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* 布局切换 */}
            <div style={s.topToolbarSection}>
              <span style={s.label}>布局:</span>
              {(['1x1', '2x2', '1x2', '2x1'] as LayoutMode[]).map(l => (
                <button
                  key={l}
                  style={{
                    ...s.layoutBtn,
                    ...(layout === l ? s.layoutBtnActive : {}),
                  }}
                  onClick={() => handleLayoutChange(l)}
                  title={l}
                >
                  <Grid3x3 size={14} color={layout === l ? '#fff' : '#64748b'} />
                </button>
              ))}
            </div>

            {/* 窗值预设 */}
            <div style={s.topToolbarSectionLast}>
              <span style={s.label}>窗值:</span>
              {WINDOW_PRESETS.map((p, i) => (
                <button
                  key={p.name}
                  style={{
                    ...s.presetBtn,
                    ...(activePresetIdx === i ? s.presetBtnActive : {}),
                  }}
                  onClick={() => handlePresetClick(p, i)}
                  title={`WW:${p.ww} WL:${p.wl}`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* 历史对比按钮 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
              <button
                style={{
                  ...s.compareToolbarBtn,
                  ...(rightTab === 'history' ? s.compareToolbarBtnActive : {}),
                }}
                onClick={() => setRightTab('history')}
                title="历史对比"
              >
                <History size={14} />
                历史
              </button>
              {selectedHistoryExams.length > 0 && (
                <button
                  style={{
                    ...s.compareToolbarBtn,
                    ...(isCompareMode ? s.compareToolbarBtnActive : {}),
                  }}
                  onClick={isCompareMode ? exitCompareMode : enterCompareMode}
                  title={isCompareMode ? '退出对比' : '进入对比模式'}
                >
                  <GitCompare size={14} />
                  {isCompareMode ? '退出对比' : `对比(${selectedHistoryExams.length})`}
                </button>
              )}
            </div>

            {/* 网格+全屏 */}
            <button
              style={{
                ...s.layoutBtn,
                ...(showGrid ? s.layoutBtnActive : {}),
                marginLeft: 8,
              }}
              onClick={() => setShowGrid(g => !g)}
              title="网格"
            >
              <Grid3x3 size={14} color={showGrid ? '#fff' : '#64748b'} />
            </button>
            <button
              style={s.fullscreenBtn}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {isFullscreen ? '退出全屏' : '全屏'}
            </button>
          </div>

          {/* ---- 主影像显示区 ---- */}
          <div
            id="image-main-area"
            style={isCompareMode ? { ...s.imageMain, display: 'flex' } : s.imageMain}
            onClick={() => {
              if (activeTool === 'wl') setShowWlPopup(false)
              if (activeTool === 'measure') setMeasureSubMenu(null)
            }}
          >
            {isCompareMode ? (
              /* ===== 对比模式左右分屏 ===== */
              <div style={s.compareSplitContainer}>
                {/* 左侧：当前检查 */}
                <div style={s.compareSplitPane}>
                  <span style={s.compareLabel}>当前: {exam.examDate}</span>
                  <div style={{
                    ...s.imageWrapper,
                    width: '100%',
                    height: '100%',
                  }}>
                    <DicomCanvas
                      zoom={zoom}
                      rotation={rotation}
                      flipH={flipH}
                      flipV={flipV}
                      ww={ww}
                      wl={wl}
                      brightness={brightness}
                      contrast={contrast}
                      activeTool={activeTool}
                      panX={panX}
                      panY={panY}
                      windowPreset={WINDOW_PRESETS[activePresetIdx || 0]?.name || ''}
                      measureType={measureSubMenu}
                      activeSeries={activeSeries}
                      imageIndex={imageIndex}
                      images={images}
                      pseudoColorMode={pseudoColorMode}
                    />
                    {/* 差异高亮叠加层 */}
                    {showDiffHighlight && diffRegions.map(region => (
                      <div
                        key={region.id}
                        style={{
                          ...s.diffRegion,
                          ...(region.type === 'increase' ? {} :
                              region.type === 'new' ? s.diffRegionNew :
                                s.diffRegionImproved),
                          left: region.x,
                          top: region.y,
                          width: region.w,
                          height: region.h,
                        }}
                      />
                    ))}
                  </div>
                  {/* 左下叠加信息 */}
                  <div style={s.overlayBL}>
                    <span style={{ color: '#60a5fa' }}>WW:{ww} WL:{wl}</span>
                    <span style={{ color: '#86efac' }}>Img:{imageIndex + 1}/{images.length}</span>
                  </div>
                  <div style={s.overlayBR}>
                    <span style={{ color: '#f87171' }}>Zoom:{zoom}% Rot:{rotation}°</span>
                  </div>
                </div>

                {/* 分屏分割线 */}
                <div style={s.compareDivider}>
                  <div style={s.compareDividerHandle}>
                    <ArrowLeftRight size={8} />
                  </div>
                </div>

                {/* 右侧：历史检查 */}
                <div style={s.compareSplitPane}>
                  <span style={{ ...s.compareLabel, ...s.compareLabelRight }}>
                    历史: {compareExam?.examDate}
                  </span>
                  <div style={{
                    ...s.imageWrapper,
                    width: '100%',
                    height: '100%',
                  }}>
                    <DicomCanvas
                      zoom={zoom}
                      rotation={rotation}
                      flipH={flipH}
                      flipV={flipV}
                      ww={ww}
                      wl={wl}
                      brightness={brightness}
                      contrast={contrast}
                      activeTool={activeTool}
                      panX={panX}
                      panY={panY}
                      windowPreset={WINDOW_PRESETS[activePresetIdx || 0]?.name || ''}
                      measureType={measureSubMenu}
                      activeSeries={activeSeries}
                      imageIndex={syncScroll ? imageIndex : compareImageIndex}
                      images={images}
                      pseudoColorMode={pseudoColorMode}
                    />
                    {/* 差异高亮叠加层 */}
                    {showDiffHighlight && diffRegions.map(region => (
                      <div
                        key={`r-${region.id}`}
                        style={{
                          ...s.diffRegion,
                          ...(region.type === 'increase' ? {} :
                              region.type === 'new' ? s.diffRegionNew :
                                s.diffRegionImproved),
                          left: region.x,
                          top: region.y,
                          width: region.w,
                          height: region.h,
                        }}
                      />
                    ))}
                  </div>
                  {/* 右下叠加信息 */}
                  <div style={s.overlayBL}>
                    <span style={{ color: '#60a5fa' }}>WW:{ww} WL:{wl}</span>
                    <span style={{ color: '#86efac' }}>
                      Img:{syncScroll ? imageIndex + 1 : compareImageIndex + 1}/{images.length}
                    </span>
                  </div>
                  <div style={s.overlayBR}>
                    <span style={{ color: '#f87171' }}>Zoom:{zoom}% Rot:{rotation}°</span>
                    {!syncScroll && (
                      <span style={{ color: '#fbbf24' }}>独立滚动</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ===== 正常单图模式 ===== */
              <div style={{
                ...s.imageWrapper,
                width: gridConfig.cols === 2 ? 'calc(50% - 4px)' : '100%',
                height: gridConfig.rows === 2 ? 'calc(50% - 4px)' : '100%',
              }}>
                <DicomCanvas
                  zoom={zoom}
                  rotation={rotation}
                  flipH={flipH}
                  flipV={flipV}
                  ww={ww}
                  wl={wl}
                  brightness={brightness}
                  contrast={contrast}
                  activeTool={activeTool}
                  panX={panX}
                  panY={panY}
                  windowPreset={WINDOW_PRESETS[activePresetIdx || 0]?.name || ''}
                  measureType={measureSubMenu}
                  activeSeries={activeSeries}
                  imageIndex={imageIndex}
                  images={images}
                  pseudoColorMode={pseudoColorMode}
                />

                {/* 左上叠加信息 */}
                <div style={s.overlayTL}>
                  <span style={{ color: '#60a5fa', fontWeight: 700 }}>
                    {exam.patientName}
                  </span>
                  <span style={{ color: '#94a3b8' }}>
                    #{exam.accessionNumber}
                  </span>
                  <span style={{ color: '#86efac' }}>
                    {exam.examItemName}
                  </span>
                </div>

                {/* 右上叠加信息 */}
                <div style={s.overlayTR}>
                  <span style={{ color: '#fbbf24' }}>
                    {exam.deviceName.split('（')[0]}
                  </span>
                  <span style={{ color: '#f87171' }}>
                    Ser:{activeSeries.seriesNumber} Img:{currentImage?.imageNumber || 1}
                  </span>
                  <span style={{ color: '#a5f3fc' }}>
                    {activeSeries.seriesDescription}
                  </span>
                </div>

                {/* 左下叠加信息 */}
                <div style={s.overlayBL}>
                  <span style={{ color: '#60a5fa' }}>
                    WW:{ww} WL:{wl}
                  </span>
                  <span style={{ color: '#86efac' }}>
                    W:{currentImage?.windowWidth || ww} C:{currentImage?.windowCenter || wl}
                  </span>
                </div>

                {/* 右下叠加信息 */}
                <div style={s.overlayBR}>
                  <span style={{ color: '#f87171' }}>
                    Zoom:{zoom}% Rot:{rotation}°
                  </span>
                  <span style={{ color: '#a5f3fc' }}>
                    {flipH ? 'FH ' : ''}{flipV ? 'FV ' : ''}Bright:{brightness}% Contrast:{contrast}%
                  </span>
                  {measureSubMenu && (
                    <span style={{ color: '#fbbf24' }}>
                      测量模式:{measureSubMenu === 'length' ? '长度' : measureSubMenu === 'angle' ? '角度' : measureSubMenu === 'area' ? '面积' : 'CT值'}
                    </span>
                  )}
                  {pseudoColorMode !== 'none' && (
                    <span style={{ color: '#f97316' }}>
                      伪彩:{pseudoColorMode === 'hotIron' ? '热铁' : pseudoColorMode === 'coolBlue' ? '冷蓝' : pseudoColorMode === 'pet' ? 'PET' : '软组织'}
                    </span>
                  )}
                </div>

                {/* ---- 交互式测量叠加层 ---- */}
                {showMeasurementsOverlay && (measureSubMenu || isDrawingMeasure || interactiveMeasures.length > 0) && (
                  <svg style={s.annotationSvg}>
                    {/* 已完成的测量 */}
                    {interactiveMeasures.map(measure => {
                      if (measure.points.length < 1) return null
                      const points = measure.points

                      if (measure.type === 'length' && points.length >= 2) {
                        const [p1, p2] = points
                        const midX = (p1.x + p2.x) / 2
                        const midY = (p1.y + p2.y) / 2
                        return (
                          <g key={measure.id}>
                            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                              stroke={measure.color} strokeWidth={2} />
                            <circle cx={p1.x} cy={p1.y} r={4} fill={measure.color} />
                            <circle cx={p2.x} cy={p2.y} r={4} fill={measure.color} />
                            <text x={midX} y={midY - 8} fill={measure.color} fontSize={12}
                              fontFamily="monospace" textAnchor="middle">
                              {measure.value}{measure.unit}
                            </text>
                          </g>
                        )
                      }

                      if (measure.type === 'angle' && points.length >= 3) {
                        const [p1, vertex, p2] = points
                        return (
                          <g key={measure.id}>
                            <line x1={vertex.x} y1={vertex.y} x2={p1.x} y2={p1.y}
                              stroke={measure.color} strokeWidth={2} />
                            <line x1={vertex.x} y1={vertex.y} x2={p2.x} y2={p2.y}
                              stroke={measure.color} strokeWidth={2} />
                            <circle cx={p1.x} cy={p1.y} r={4} fill={measure.color} />
                            <circle cx={vertex.x} cy={vertex.y} r={4} fill={measure.color} />
                            <circle cx={p2.x} cy={p2.y} r={4} fill={measure.color} />
                            <text x={vertex.x + 20} y={vertex.y - 10} fill={measure.color} fontSize={12}
                              fontFamily="monospace">
                              {measure.value}{measure.unit}
                            </text>
                          </g>
                        )
                      }

                      if (measure.type === 'area' && points.length >= 3) {
                        const pathData = points.map((p, i) =>
                          `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`
                        ).join(' ') + ' Z'
                        return (
                          <g key={measure.id}>
                            <path d={pathData} fill={measure.color} fillOpacity={0.2}
                              stroke={measure.color} strokeWidth={2} />
                            {points.map((p, i) => (
                              <circle key={i} cx={p.x} cy={p.y} r={4} fill={measure.color} />
                            ))}
                            <text x={points[0].x} y={points[0].y - 10} fill={measure.color} fontSize={12}
                              fontFamily="monospace">
                              {measure.value}{measure.unit}
                            </text>
                          </g>
                        )
                      }

                      if (measure.type === 'ct' && points.length >= 1) {
                        const p = points[0]
                        return (
                          <g key={measure.id}>
                            <circle cx={p.x} cy={p.y} r={8} fill={measure.color} fillOpacity={0.3}
                              stroke={measure.color} strokeWidth={2} />
                            <text x={p.x + 12} y={p.y + 4} fill={measure.color} fontSize={12}
                              fontFamily="monospace">
                              {measure.value}{measure.unit}
                            </text>
                          </g>
                        )
                      }

                      return null
                    })}

                    {/* 正在绘制的测量 */}
                    {isDrawingMeasure && drawingPoints.map((point, idx) => (
                      <circle key={`draw-${idx}`} cx={point.x} cy={point.y} r={5}
                        fill="#22c55e" stroke="#fff" strokeWidth={2} />
                    ))}

                    {/* 正在绘制的线 */}
                    {isDrawingMeasure && drawingPoints.length >= 1 && measureSubMenu === 'length' && (
                      <line
                        x1={drawingPoints[drawingPoints.length - 1].x}
                        y1={drawingPoints[drawingPoints.length - 1].y}
                        x2={drawingPoints[drawingPoints.length - 1].x + 50}
                        y2={drawingPoints[drawingPoints.length - 1].y}
                        stroke="#22c55e"
                        strokeWidth={2}
                        strokeDasharray="4"
                      />
                    )}
                  </svg>
                )}

                {/* ---- 标注叠加层 ---- */}
                {showAnnotationsOverlay && annotations.length > 0 && (
                  <svg style={s.annotationSvg}>
                    {annotations.filter(a => a.visible).map(ann => {
                      if (ann.type === 'text') {
                        return (
                          <g key={ann.id}>
                            <text
                              x={ann.x}
                              y={ann.y}
                              fill={ann.color}
                              fontSize={ann.fontSize}
                              fontFamily="PingFang SC, Microsoft YaHei, sans-serif"
                              fontWeight="bold"
                            >
                              {ann.text}
                            </text>
                          </g>
                        )
                      }

                      if (ann.type === 'arrow' && ann.x2 !== undefined && ann.y2 !== undefined) {
                        const dx = ann.x2 - ann.x
                        const dy = ann.y2 - ann.y
                        const angle = Math.atan2(dy, dx)
                        const headLen = 15
                        const headAngle = Math.PI / 6

                        return (
                          <g key={ann.id}>
                            <line
                              x1={ann.x} y1={ann.y}
                              x2={ann.x2 - headLen * Math.cos(angle - headAngle)}
                              y2={ann.y2 - headLen * Math.sin(angle - headAngle)}
                              stroke={ann.color} strokeWidth={2}
                            />
                            <line
                              x1={ann.x2} y1={ann.y2}
                              x2={ann.x2 - headLen * Math.cos(angle + headAngle)}
                              y2={ann.y2 - headLen * Math.sin(angle + headAngle)}
                              stroke={ann.color} strokeWidth={2}
                            />
                            <line x1={ann.x} y1={ann.y} x2={ann.x2} y2={ann.y2}
                              stroke={ann.color} strokeWidth={2} />
                          </g>
                        )
                      }

                      if (ann.type === 'rect' && ann.x2 !== undefined && ann.y2 !== undefined) {
                        return (
                          <g key={ann.id}>
                            <rect
                              x={Math.min(ann.x, ann.x2)}
                              y={Math.min(ann.y, ann.y2)}
                              width={Math.abs(ann.x2 - ann.x)}
                              height={Math.abs(ann.y2 - ann.y)}
                              fill="transparent"
                              stroke={ann.color}
                              strokeWidth={2}
                              strokeDasharray="5,3"
                            />
                          </g>
                        )
                      }

                      if (ann.type === 'ellipse' && ann.x2 !== undefined && ann.y2 !== undefined) {
                        const cx = (ann.x + ann.x2) / 2
                        const cy = (ann.y + ann.y2) / 2
                        const rx = Math.abs(ann.x2 - ann.x) / 2
                        const ry = Math.abs(ann.y2 - ann.y) / 2
                        return (
                          <g key={ann.id}>
                            <ellipse
                              cx={cx} cy={cy}
                              rx={rx} ry={ry}
                              fill="transparent"
                              stroke={ann.color}
                              strokeWidth={2}
                              strokeDasharray="5,3"
                            />
                          </g>
                        )
                      }

                      return null
                    })}
                  </svg>
                )}
              </div>
            )}

            {/* ---- 窗宽窗位弹出 ---- */}
            {showWlPopup && (
              <div style={s.wlPopup} onClick={e => e.stopPropagation()}>
                <div style={s.wlPopupTitle}>
                  <Sun size={14} color={PRIMARY} />
                  窗口/级别设置
                </div>
                <div style={s.wlSliderRow}>
                  <span style={s.wlLabel}>窗宽WW</span>
                  <input
                    type="range"
                    min={50}
                    max={4000}
                    value={ww}
                    onChange={e => { setWw(+e.target.value); setActivePresetIdx(null) }}
                    style={s.wlSlider}
                  />
                  <span style={s.wlVal}>{ww}</span>
                </div>
                <div style={s.wlSliderRow}>
                  <span style={s.wlLabel}>窗位WL</span>
                  <input
                    type="range"
                    min={-1000}
                    max={1000}
                    value={wl}
                    onChange={e => { setWl(+e.target.value); setActivePresetIdx(null) }}
                    style={s.wlSlider}
                  />
                  <span style={s.wlVal}>{wl}</span>
                </div>
                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {WINDOW_PRESETS.map((p, i) => (
                    <button
                      key={p.name}
                      style={{
                        ...s.presetBtn,
                        fontSize: 10,
                        padding: '3px 6px',
                        ...(activePresetIdx === i ? s.presetBtnActive : {}),
                      }}
                      onClick={() => handlePresetClick(p, i)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  <button
                    style={{ ...s.reportBtn, background: PRIMARY, color: '#fff', flex: 1 }}
                    onClick={() => { setWw(400); setWl(40); setActivePresetIdx(null) }}
                  >
                    重置
                  </button>
                  <button
                    style={{ ...s.reportBtn, background: '#e2e8f0', color: '#475569', flex: 1 }}
                    onClick={() => setShowWlPopup(false)}
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}

            {/* ---- 测量子菜单 ---- */}
            {activeTool === 'measure' && measureSubMenu !== null && (
              <div style={s.measureMenu} onClick={e => e.stopPropagation()}>
                {(['length', 'angle', 'area', 'ct'] as MeasureSubMenu[]).map(type => (
                  <button
                    key={type}
                    style={{
                      ...s.measureMenuItem,
                      ...(measureSubMenu === type ? { background: `${PRIMARY}15`, color: PRIMARY } : {}),
                    }}
                    onClick={() => setMeasureSubMenu(type)}
                  >
                    {type === 'length' && <Ruler size={14} />}
                    {type === 'angle' && <Triangle size={14} />}
                    {type === 'area' && <SquareIcon size={14} />}
                    {type === 'ct' && <Activity size={14} />}
                    {type === 'length' ? '长度测量' :
                      type === 'angle' ? '角度测量' :
                        type === 'area' ? '面积测量' : 'CT值(HU)'}
                  </button>
                ))}
                {/* 清除测量按钮 */}
                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 4, paddingTop: 4 }}>
                  <button
                    style={{ ...s.measureMenuItem, color: '#ef4444' }}
                    onClick={clearAllMeasures}
                  >
                    <Trash2 size={14} />
                    清除所有测量
                  </button>
                </div>
              </div>
            )}

            {/* ---- 伪彩面板 ---- */}
            {showPseudoColorPanel && (
              <div style={s.pseudoColorPanel} onClick={e => e.stopPropagation()}>
                <div style={s.pseudoColorPanelTitle}>
                  <Palette size={14} color={PRIMARY} />
                  伪彩显示
                </div>
                {pseudoColorTools.map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    style={{
                      ...s.pseudoColorBtn,
                      ...(pseudoColorMode === mode ? s.pseudoColorBtnActive : {}),
                    }}
                    onClick={() => {
                      setPseudoColorMode(mode)
                      if (mode !== 'none') {
                        setActiveTool('wl') // 自动切换到窗口工具以显示伪彩
                      }
                    }}
                  >
                    <div style={{
                      ...s.pseudoColorPreview,
                      background: mode === 'none' ? '#888' :
                        mode === 'hotIron' ? 'linear-gradient(135deg, #000 0%, #00f 25%, #0f0 50%, #ff0 75%, #fff 100%)' :
                          mode === 'coolBlue' ? 'linear-gradient(135deg, #000 0%, #0ff 50%, #fff 100%)' :
                            mode === 'pet' ? 'linear-gradient(135deg, #00f 0%, #0ff 20%, #0f0 40%, #ff0 60%, #f00 80%, #f0f 100%)' :
                              'linear-gradient(135deg, #000 0%, #88cc88 100%)',
                    }} />
                    {icon}
                    <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                    {pseudoColorMode === mode && <CheckCircle size={12} />}
                  </button>
                ))}
                <button
                  style={{ ...s.reportBtn, background: '#f0f4f8', color: '#64748b', marginTop: 4 }}
                  onClick={() => setShowPseudoColorPanel(false)}
                >
                  关闭
                </button>
              </div>
            )}

            {/* ---- 标注工具面板 ---- */}
            {showAnnotationPanel && (
              <div style={s.annotationPanel} onClick={e => e.stopPropagation()}>
                <div style={s.annotationPanelTitle}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <PenTool size={14} color={PRIMARY} />
                    标注工具
                  </span>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                    onClick={() => setShowAnnotationPanel(false)}
                  >
                    <X size={14} color="#64748b" />
                  </button>
                </div>

                {/* 标注类型选择 */}
                <div style={s.annotationTypeRow}>
                  {annotationTypes.map(({ type, icon, label }) => (
                    <button
                      key={type}
                      style={{
                        ...s.annotationTypeBtn,
                        ...(activeAnnotationType === type ? s.annotationTypeBtnActive : {}),
                      }}
                      onClick={() => setActiveAnnotationType(type)}
                      title={label}
                    >
                      <div style={{ color: activeAnnotationType === type ? '#fff' : '#64748b' }}>
                        {icon}
                      </div>
                      <span style={{
                        ...s.annotationTypeBtnLabel,
                        color: activeAnnotationType === type ? 'rgba(255,255,255,0.8)' : '#64748b',
                      }}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* 颜色选择 */}
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>颜色</div>
                <div style={s.annotationColorPicker}>
                  {ANNOTATION_COLORS.map(color => (
                    <button
                      key={color}
                      style={{
                        ...s.annotationColorBtn,
                        background: color,
                        ...(activeAnnotationColor === color ? s.annotationColorBtnActive : {}),
                      }}
                      onClick={() => setActiveAnnotationColor(color)}
                      title={ANNOTATION_COLOR_NAMES[color] || color}
                    />
                  ))}
                </div>

                {/* 字体大小 */}
                <div style={s.annotationFontSizeRow}>
                  <span style={s.annotationFontSizeLabel}>字号</span>
                  <input
                    type="number"
                    min={8}
                    max={48}
                    value={activeAnnotationFontSize}
                    onChange={e => setActiveAnnotationFontSize(Number(e.target.value))}
                    style={s.annotationFontSizeInput}
                  />
                </div>

                {/* 标注列表 */}
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4, marginTop: 8 }}>
                  已添加标注 ({annotations.length})
                </div>
                <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                  {annotations.length === 0 ? (
                    <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', padding: 8 }}>
                      点击图像添加标注
                    </div>
                  ) : (
                    annotations.map(ann => (
                      <div
                        key={ann.id}
                        style={{
                          ...s.annotationListItem,
                          ...(selectedAnnotationId === ann.id ? s.annotationListItemSelected : {}),
                          ...(ann.locked ? s.annotationListItemLocked : {}),
                        }}
                        onClick={() => setSelectedAnnotationId(ann.id)}
                      >
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: ann.color,
                          flexShrink: 0,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ann.type === 'text' ? ann.text :
                              ann.type === 'arrow' ? '箭头标注' :
                                ann.type === 'rect' ? '矩形标注' : '椭圆标注'}
                          </div>
                          <div style={{ fontSize: 9, color: '#94a3b8' }}>
                            {ann.type} | {ann.visible ? '可见' : '隐藏'}
                          </div>
                        </div>
                        <div style={s.annotationListItemActions}>
                          <button
                            style={s.annotationActionBtn}
                            onClick={e => { e.stopPropagation(); toggleAnnotationVisibility(ann.id) }}
                            title={ann.visible ? '隐藏' : '显示'}
                          >
                            {ann.visible ? <EyeIcon size={12} color="#64748b" /> : <EyeOff size={12} color="#94a3b8" />}
                          </button>
                          <button
                            style={s.annotationActionBtn}
                            onClick={e => { e.stopPropagation(); toggleAnnotationLock(ann.id) }}
                            title={ann.locked ? '解锁' : '锁定'}
                          >
                            {ann.locked ? <Lock size={12} color="#f59e0b" /> : <Unlock size={12} color="#64748b" />}
                          </button>
                          <button
                            style={{ ...s.annotationActionBtn }}
                            onClick={e => { e.stopPropagation(); deleteAnnotation(ann.id) }}
                            title="删除"
                          >
                            <Trash2 size={12} color="#ef4444" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 清除所有标注 */}
                {annotations.length > 0 && (
                  <button
                    style={{ ...s.reportBtn, background: '#fef2f2', color: '#ef4444', marginTop: 8 }}
                    onClick={clearAllAnnotations}
                  >
                    <Trash2 size={12} />清除所有标注
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ---- 底部序列缩略图条 ---- */}
          <div style={s.seriesStrip}>
            {seriesList.map((sItem, idx) => (
              <div
                key={sItem.id}
                style={{
                  ...s.seriesThumb,
                  ...(activeSeriesIdx === idx ? s.seriesThumbActive : {}),
                }}
                onClick={() => handleSeriesSelect(idx)}
                title={`${sItem.seriesDescription} (${sItem.imageCount}幅)`}
              >
                <div style={{
                  ...s.seriesThumbInner,
                  background: sItem.thumbnail,
                  opacity: activeSeriesIdx === idx ? 1 : 0.7,
                }}>
                  <Layers size={16} />
                </div>
                <span style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>
                  {sItem.seriesNumber}
                </span>
                <span style={{ fontSize: 8, color: '#6b7280' }}>
                  {sItem.imageCount}幅
                </span>
              </div>
            ))}

            {/* 额外布局空间 */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#6b7280' }}>
                {exam.modality} · {exam.bodyPart}
              </span>
              <button
                style={{
                  ...s.layoutBtn,
                  background: PRIMARY,
                  borderColor: PRIMARY,
                }}
                onClick={() => setImageIndex(i => Math.max(0, i - 1))}
                title="上一幅"
              >
                <ChevronLeft size={14} color="#fff" />
              </button>
              <button
                style={{
                  ...s.layoutBtn,
                  background: PRIMARY,
                  borderColor: PRIMARY,
                }}
                onClick={() => setImageIndex(i => Math.min(images.length - 1, i + 1))}
                title="下一幅"
              >
                <ChevronRight size={14} color="#fff" />
              </button>
            </div>
          </div>
        </div>

        {/* =============================================== */}
        {/* 右侧信息面板 */}
        {/* =============================================== */}
        <div style={s.rightPanel}>
          {/* ---- 标签页切换 ---- */}
          <div style={s.rightTabs}>
            <button
              style={{ ...s.rightTab, ...(rightTab === 'patient' ? s.rightTabActive : {}) }}
              onClick={() => setRightTab('patient')}
            >
              <User size={14} />
              患者
            </button>
            <button
              style={{ ...s.rightTab, ...(rightTab === 'image' ? s.rightTabActive : {}) }}
              onClick={() => setRightTab('image')}
            >
              <ImageIcon size={14} />
              影像
            </button>
            <button
              style={{ ...s.rightTab, ...(rightTab === 'measure' ? s.rightTabActive : {}) }}
              onClick={() => setRightTab('measure')}
            >
              <Ruler size={14} />
              测量
            </button>
            <button
              style={{ ...s.rightTab, ...(rightTab === 'report' ? s.rightTabActive : {}) }}
              onClick={() => setRightTab('report')}
            >
              <FileSearch size={14} />
              报告
            </button>
            <button
              style={{ ...s.rightTab, ...(rightTab === 'history' ? s.rightTabActive : {}) }}
              onClick={() => setRightTab('history')}
            >
              <History size={14} />
              历史
            </button>
          </div>

          {/* ---- 面板内容 ---- */}
          <div style={s.rightPanelContent}>

            {/* ===== 标签页1：患者信息 ===== */}
            {rightTab === 'patient' && (
              <>
                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <User size={12} />基本信息
                  </div>
                  <div style={s.infoGrid}>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>姓名</span>
                      <span style={s.infoValue}>{exam.patientName}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>性别/年龄</span>
                      <span style={s.infoValue}>{exam.gender} / {exam.age}岁</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>患者类型</span>
                      <span style={s.infoValue}>{exam.patientType}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>检查号</span>
                      <span style={s.infoValue}>{exam.accessionNumber}</span>
                    </div>
                  </div>
                </div>

                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <FileText size={12} />检查信息
                  </div>
                  <div style={s.infoGrid}>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>检查项目</span>
                      <span style={s.infoValue}>{exam.examItemName}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>检查日期</span>
                      <span style={s.infoValue}>{exam.examDate}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>检查时间</span>
                      <span style={s.infoValue}>{exam.examTime}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>检查设备</span>
                      <span style={s.infoValue}>{exam.deviceName.split('（')[0]}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>检查室</span>
                      <span style={s.infoValue}>{exam.roomName}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>检查状态</span>
                      <span style={{
                        ...s.infoValue,
                        color: exam.status === '已完成' ? '#22c55e' :
                          exam.status === '检查中' ? '#f59e0b' : '#64748b',
                      }}>
                        {exam.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <AlertCircle size={12} />临床信息
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={s.infoLabel}>临床诊断</span>
                    <div style={{ ...s.infoValueFull, color: '#dc2626' }}>
                      {exam.clinicalDiagnosis}
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={s.infoLabel}>病史</span>
                    <div style={s.infoValueFull}>{exam.clinicalHistory}</div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={s.infoLabel}>检查指征</span>
                    <div style={s.infoValueFull}>{exam.examIndications}</div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={s.infoLabel}>申请科室</span>
                    <div style={s.infoValue}>放射科</div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={s.infoLabel}>申请医生</span>
                    <div style={s.infoValue}>待定</div>
                  </div>
                </div>

                {/* MPR多平面重建标签 */}
                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <Layers3 size={12} />多平面重建(MPR)
                  </div>
                  <div style={s.mprTabs}>
                    {['横断面', '冠状面', '矢状面'].map((tab, i) => (
                      <button
                        key={tab}
                        style={{
                          ...s.mprTab,
                          ...(i === 0 ? s.mprTabActive : {}),
                        }}
                        onClick={() => setActiveMprIdx(i)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 其他操作按钮 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  <button
                    style={{ ...s.reportBtn, background: PRIMARY, color: '#fff' }}
                    onClick={() => { alert('正在导出PNG图片...'); setTimeout(() => alert('PNG已导出（模拟）'), 500) }}
                  >
                    <Camera size={14} />导出PNG
                  </button>
                  <button
                    style={{ ...s.reportBtn, background: '#f0f4f8', color: PRIMARY }}
                    onClick={() => { alert('正在导出DICOM文件...'); setTimeout(() => alert('DICOM已导出（模拟）'), 500) }}
                  >
                    <Download size={14} />导出DICOM
                  </button>
                </div>
              </>
            )}

            {/* ===== 标签页2：影像信息 ===== */}
            {rightTab === 'image' && (
              <>
                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <ImageIcon size={12} />序列信息
                  </div>
                  <div style={s.infoGrid}>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>序列号</span>
                      <span style={s.infoValue}>{activeSeries.seriesNumber}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>图像号</span>
                      <span style={s.infoValue}>{currentImage?.imageNumber || 1}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>序列描述</span>
                      <span style={{ ...s.infoValue, gridColumn: '1 / -1' }}>
                        {activeSeries.seriesDescription}
                      </span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>图像数量</span>
                      <span style={s.infoValue}>{activeSeries.imageCount}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}> modality</span>
                      <span style={s.infoValue}>{activeSeries.modality}</span>
                    </div>
                  </div>
                </div>

                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <Info size={12} />图像参数
                  </div>
                  <div style={s.infoGrid}>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>层厚</span>
                      <span style={s.infoValue}>{currentImage?.sliceThickness || 2.5}mm</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>层间距</span>
                      <span style={s.infoValue}>2.5mm</span>
                    </div>
                    {currentImage?.tr && (
                      <div style={s.infoItem}>
                        <span style={s.infoLabel}>TR</span>
                        <span style={s.infoValue}>{currentImage.tr}ms</span>
                      </div>
                    )}
                    {currentImage?.te && (
                      <div style={s.infoItem}>
                        <span style={s.infoLabel}>TE</span>
                        <span style={s.infoValue}>{currentImage.te}ms</span>
                      </div>
                    )}
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>矩阵</span>
                      <span style={s.infoValue}>{currentImage?.matrix || '512×512'}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>FOV</span>
                      <span style={s.infoValue}>{currentImage?.fov || 35}cm</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>像素间距</span>
                      <span style={s.infoValue}>{currentImage?.pixelSpacing || 0.68}mm</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>采集像素</span>
                      <span style={s.infoValue}>512×512</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>显示像素</span>
                      <span style={s.infoValue}>512×512</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>窗宽</span>
                      <span style={s.infoValue}>{ww}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>窗位</span>
                      <span style={s.infoValue}>{wl}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>层位</span>
                      <span style={s.infoValue}>
                        {currentImage?.sliceLocation?.toFixed(1) || '0.0'}mm
                      </span>
                    </div>
                  </div>
                </div>

                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <Activity size={12} />设备信息
                  </div>
                  <div style={s.infoGrid}>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>设备型号</span>
                      <span style={s.infoValue}>{exam.deviceName.split('（')[1]?.replace('）', '') || 'N/A'}</span>
                    </div>
                    <div style={s.infoItem}>
                      <span style={s.infoLabel}>制造商</span>
                      <span style={s.infoValue}>
                        {exam.deviceName.includes('GE') ? 'GE' :
                          exam.deviceName.includes('Siemens') ? 'Siemens' :
                            exam.deviceName.includes('Philips') ? 'Philips' : 'N/A'}
                      </span>
                    </div>
                    <div style={{ ...s.infoItem, gridColumn: '1 / -1' }}>
                      <span style={s.infoLabel}>图像获取站</span>
                      <span style={s.infoValue}>CT-Acq-01</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ===== 标签页3：测量工具（增强版） ===== */}
            {rightTab === 'measure' && (
              <>
                {/* 测量控制 */}
                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <RulerIcon size={12} />测量工具
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    {(['length', 'angle', 'area', 'ct'] as MeasureSubMenu[]).map(type => (
                      <button
                        key={type}
                        style={{
                          flex: 1,
                          padding: '6px 4px',
                          borderRadius: 6,
                          border: `1px solid ${measureSubMenu === type ? PRIMARY : '#e2e8f0'}`,
                          background: measureSubMenu === type ? PRIMARY : '#fff',
                          color: measureSubMenu === type ? '#fff' : '#475569',
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column' as const,
                          alignItems: 'center',
                          gap: 2,
                        }}
                        onClick={() => {
                          setMeasureSubMenu(type)
                          setActiveTool('measure')
                        }}
                      >
                        {type === 'length' && <Ruler size={14} />}
                        {type === 'angle' && <Triangle size={14} />}
                        {type === 'area' && <SquareIcon size={14} />}
                        {type === 'ct' && <Activity size={14} />}
                        {type === 'length' ? '长度' : type === 'angle' ? '角度' : type === 'area' ? '面积' : 'CT值'}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>
                    {measureSubMenu === 'length' && '点击图像两点测量长度（mm）'}
                    {measureSubMenu === 'angle' && '点击图像三点测量角度（°）'}
                    {measureSubMenu === 'area' && '点击图像多个点测量面积（mm²）'}
                    {measureSubMenu === 'ct' && '点击图像单点测量CT值（HU）'}
                  </div>
                </div>

                {/* 交互式测量结果列表 */}
                <div style={s.infoSection}>
                  <div style={{ ...s.infoSectionTitle, justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Activity size={12} />测量结果 ({interactiveMeasures.length})
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        style={{
                          ...s.compareControlBadge,
                          padding: '2px 8px',
                          ...(showMeasurementsOverlay ? s.compareControlBadgeOn : s.compareControlBadgeOff),
                        }}
                        onClick={() => setShowMeasurementsOverlay(!showMeasurementsOverlay)}
                      >
                        {showMeasurementsOverlay ? <EyeIcon size={10} /> : <EyeOff size={10} />}
                        {showMeasurementsOverlay ? '显示' : '隐藏'}
                      </button>
                    </div>
                  </div>

                  {interactiveMeasures.length === 0 ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', padding: '12px 0', textAlign: 'center' }}>
                      <Ruler size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                      <div>暂无测量数据</div>
                      <div style={{ fontSize: 10, marginTop: 4 }}>选择测量工具后点击图像开始测量</div>
                    </div>
                  ) : (
                    interactiveMeasures.map(measure => (
                      <div key={measure.id} style={s.measureItem}>
                        <div style={{
                          ...s.measureItemColor,
                          background: measure.color,
                        }} />
                        <div style={s.measureItemInfo}>
                          <div style={s.measureItemValue}>
                            {measure.value} {measure.unit}
                          </div>
                          <div style={s.measureItemType}>
                            {measure.type === 'length' ? '长度测量' :
                              measure.type === 'angle' ? '角度测量' :
                                measure.type === 'area' ? '面积测量' : 'CT值测量'}
                          </div>
                        </div>
                        <div style={s.measureItemActions}>
                          <button
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 4,
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onClick={() => deleteMeasure(measure.id)}
                            title="删除"
                          >
                            <Trash2 size={12} color="#ef4444" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 预设测量数据 */}
                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <FileText size={12} />历史测量数据
                  </div>
                  <div style={s.infoSection}>
                    <div style={s.infoSectionTitle}>
                      <RulerIcon size={12} />长度测量
                    </div>
                    {measurements.length.length === 0 ? (
                      <div style={{ fontSize: 11, color: '#94a3b8', padding: '8px 0', textAlign: 'center' }}>
                        暂无长度测量数据
                      </div>
                    ) : (
                      measurements.length.map((m, i) => (
                        <div key={m.id} style={s.measureListItem}>
                          <div style={s.measureListItemLeft}>
                            <div style={{ ...s.measureListItemDot, background: '#22c55e' }} />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                                {m.value} {m.unit}
                              </div>
                              <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.location}</div>
                            </div>
                          </div>
                          <button style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: 2,
                          }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={s.infoSection}>
                    <div style={s.infoSectionTitle}>
                      <Activity size={12} />CT值(HU)
                    </div>
                    {measurements.ct.length === 0 ? (
                      <div style={{ fontSize: 11, color: '#94a3b8', padding: '8px 0', textAlign: 'center' }}>
                        暂无CT值测量数据
                      </div>
                    ) : (
                      measurements.ct.map(m => (
                        <div key={m.id} style={s.measureListItem}>
                          <div style={s.measureListItemLeft}>
                            <div style={{ ...s.measureListItemDot, background: '#3b82f6' }} />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                                {m.value} {m.unit}
                              </div>
                              <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.location}</div>
                            </div>
                          </div>
                          <button style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: 2,
                          }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button
                    style={{ ...s.reportBtn, background: '#f0f4f8', color: '#475569', flex: 1 }}
                    onClick={clearAllMeasures}
                  >
                    <Trash2 size={14} />清除全部
                  </button>
                </div>
              </>
            )}

            {/* ===== 标签页4：报告关联 ===== */}
            {rightTab === 'report' && (
              <>
                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <FileSearch size={12} />报告状态
                  </div>
                  <div style={s.reportStatusCard}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                        {exam.examItemName}
                      </span>
                      <span style={{
                        ...s.reportStatusBadge,
                        background: reportStatus === '已报告' ? '#dcfce7' :
                          reportStatus === '待书写' ? '#fef3c7' : '#f1f5f9',
                        color: reportStatus === '已报告' ? '#16a34a' :
                          reportStatus === '待书写' ? '#d97706' : '#64748b',
                      }}>
                        {reportStatus === '已报告' && <CheckCircle size={10} />}
                        {reportStatus === '待书写' && <Clock size={10} />}
                        {reportStatus === '检查中' && <Activity size={10} />}
                        {reportStatus}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                      患者: {exam.patientName} | {exam.age}岁{exam.gender}<br />
                      检查日期: {exam.examDate} {exam.examTime}
                    </div>
                  </div>

                  {reportStatus === '已报告' ? (
                    <>
                      <div style={{ marginBottom: 8, padding: '8px 10px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>报告医师</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>李明辉</div>
                      </div>
                      <div style={{ marginBottom: 8, padding: '8px 10px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>报告时间</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>2026-05-01 14:30</div>
                      </div>
                    </>
                  ) : null}
                </div>

                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <FileText size={12} />报告操作
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {reportStatus === '已报告' ? (
                      <>
                        <button
                          style={{ ...s.reportBtn, background: PRIMARY, color: '#fff' }}
                          onClick={() => alert('查看报告（模拟）')}
                        >
                          <Eye size={14} />查看报告
                        </button>
                        <button
                          style={{ ...s.reportBtn, background: '#f0f4f8', color: PRIMARY }}
                          onClick={() => alert('修改报告（模拟）')}
                        >
                          <PenTool size={14} />修改报告
                        </button>
                      </>
                    ) : reportStatus === '待书写' ? (
                      <>
                        <button
                          style={{ ...s.reportBtn, background: PRIMARY, color: '#fff' }}
                          onClick={() => alert('书写报告（模拟）')}
                        >
                          <PenTool size={14} />书写报告
                        </button>
                        <button
                          style={{ ...s.reportBtn, background: '#f0f4f8', color: '#475569' }}
                          onClick={() => alert('引用模板（模拟）')}
                        >
                          <FileText size={14} />引用模板
                        </button>
                        <button
                          style={{ ...s.reportBtn, background: '#fef3c7', color: '#d97706' }}
                          onClick={() => alert('紧急通知（模拟）')}
                        >
                          <AlertCircle size={14} />发送危急值
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          style={{ ...s.reportBtn, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }}
                          disabled
                        >
                          <Clock size={14} />等待检查完成
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <Calendar size={12} />报告时效
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>检查完成时间</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>2026-05-01 10:00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>已等待</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#d97706' }}>4小时30分</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>平均报告时间</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>28分钟</span>
                    </div>
                  </div>
                </div>

                {/* 危急值提示 */}
                {exam.priority === '紧急' || exam.priority === '危重' ? (
                  <div style={{
                    padding: 10,
                    background: '#fef2f2',
                    borderRadius: 8,
                    border: '1px solid #fecaca',
                    marginTop: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <AlertCircle size={14} color="#dc2626" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>
                        {exam.priority === '危重' ? '危重' : '紧急'}检查
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#7f1d1d', lineHeight: 1.5 }}>
                      {exam.clinicalDiagnosis}
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {/* ===== 标签页5：历史对比 ===== */}
            {rightTab === 'history' && (
              <>
                <div style={s.infoSection}>
                  <div style={s.infoSectionTitle}>
                    <History size={12} />历史检查列表
                  </div>
                  {/* 搜索框 */}
                  <div style={s.historySearchRow}>
                    <input
                      type="text"
                      placeholder="搜索检查项目/日期/模态..."
                      style={s.historySearchInput}
                      value={historySearchText}
                      onChange={e => setHistorySearchText(e.target.value)}
                    />
                  </div>
                  {/* 操作按钮 */}
                  <div style={s.historyActionBar}>
                    <button
                      style={{
                        ...s.historyActionBtn,
                        ...(selectedHistoryExams.length === 0 ? s.historyActionBtnDisabled : {}),
                      }}
                      disabled={selectedHistoryExams.length === 0}
                      onClick={enterCompareMode}
                    >
                      <GitCompare size={12} />
                      对比
                    </button>
                    <button
                      style={{
                        ...s.historyActionBtn,
                        ...(selectedHistoryExams.length === 0 ? s.historyActionBtnDisabled : {}),
                      }}
                      disabled={selectedHistoryExams.length === 0}
                      onClick={() => setSelectedHistoryExams([])}
                    >
                      <X size={12} />
                      清除
                    </button>
                  </div>
                  {/* 已选检查提示 */}
                  {selectedHistoryExams.length > 0 && (
                    <div style={{ fontSize: 10, color: '#3b82f6', marginBottom: 8, fontWeight: 600 }}>
                      已选择 {selectedHistoryExams.length} 项检查（选择2项进行左右对比）
                    </div>
                  )}
                  {/* 检查列表 */}
                  {filteredHistoryExams.length === 0 ? (
                    <div style={s.historyListEmpty}>
                      <div style={s.historyListEmptyIcon}>
                        <ScrollText size={32} />
                      </div>
                      <div>暂无历史检查记录</div>
                    </div>
                  ) : (
                    filteredHistoryExams.map(historyExam => {
                      const isSelected = selectedHistoryExams.includes(historyExam.id)
                      return (
                        <div
                          key={historyExam.id}
                          style={{
                            ...s.historyListItem,
                            ...(isSelected ? s.historyListItemChecked : {}),
                          }}
                          onClick={() => toggleHistoryExam(historyExam.id)}
                        >
                          <div
                            style={{
                              ...s.historyCheckbox,
                              ...(isSelected ? s.historyCheckboxChecked : {}),
                            }}
                          >
                            {isSelected && (
                              <CheckCircle size={12} color="#fff" />
                            )}
                          </div>
                          <div style={s.historyListItemContent}>
                            <div style={s.historyListItemHeader}>
                              <span style={s.historyListItemTitle}>{historyExam.examItemName}</span>
                              <span style={s.historyListItemDate}>{historyExam.examDate}</span>
                            </div>
                            <div style={s.historyListItemMeta}>
                              {historyExam.modality} | {historyExam.deviceName.split('（')[0]}
                            </div>
                            <div style={{
                              ...s.historyListItemStatus,
                              background: historyExam.status === '已完成' ? '#dcfce7' : '#fef3c7',
                              color: historyExam.status === '已完成' ? '#16a34a' : '#d97706',
                            }}>
                              {historyExam.status === '已完成' && <CheckCircle size={9} />}
                              {historyExam.status}
                            </div>
                            {historyExam.conclusion && (
                              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>
                                {historyExam.conclusion.length > 60
                                  ? historyExam.conclusion.substring(0, 60) + '...'
                                  : historyExam.conclusion}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* 对比模式控制 */}
                {isCompareMode && compareExam && (
                  <>
                    <div style={s.infoSection}>
                      <div style={s.infoSectionTitle}>
                        <GitCompare size={12} />对比模式
                      </div>
                      {/* 同步滚动控制 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>同步滚动</span>
                        <button
                          style={{
                            ...s.syncScrollBadge,
                            ...(syncScroll ? s.syncScrollBadgeOn : s.syncScrollBadgeOff),
                          }}
                          onClick={() => setSyncScroll(s => !s)}
                        >
                          {syncScroll ? <CheckCircle size={10} /> : <X size={10} />}
                          {syncScroll ? '开' : '关'}
                        </button>
                      </div>
                      {/* 差异高亮控制 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>差异高亮</span>
                        <button
                          style={{
                            ...s.syncScrollBadge,
                            ...(showDiffHighlight ? s.syncScrollBadgeOn : s.syncScrollBadgeOff),
                          }}
                          onClick={() => setShowDiffHighlight(s => !s)}
                        >
                          {showDiffHighlight ? <CheckCircle size={10} /> : <X size={10} />}
                          {showDiffHighlight ? '开' : '关'}
                        </button>
                      </div>
                      <button
                        style={{ ...s.reportBtn, background: '#ef4444', color: '#fff' }}
                        onClick={exitCompareMode}
                      >
                        <X size={14} />退出对比模式
                      </button>
                    </div>

                    {/* 对比信息卡片 */}
                    <div style={s.compareInfoCard}>
                      <div style={s.compareInfoCardTitle}>
                        <ArrowLeftRight size={12} />对比信息
                      </div>
                      <div style={s.compareInfoRow}>
                        <span style={s.compareInfoLabel}>当前检查</span>
                        <span style={s.compareInfoValue}>{exam.examDate}</span>
                      </div>
                      <div style={s.compareInfoRow}>
                        <span style={s.compareInfoLabel}>历史检查</span>
                        <span style={s.compareInfoValue}>{compareExam.examDate}</span>
                      </div>
                      <div style={s.compareInfoRow}>
                        <span style={s.compareInfoLabel}>时间间隔</span>
                        <span style={s.compareInfoValue}>约45天</span>
                      </div>
                    </div>

                    {/* 差异摘要 */}
                    {getCompareDiffInfo() && (
                      <div style={s.diffSummaryCard}>
                        <div style={s.diffSummaryTitle}>
                          <AlertTriangle size={12} />差异摘要
                        </div>
                        {getCompareDiffInfo()?.map((diff, idx) => (
                          <div key={idx} style={s.diffSummaryItem}>
                            <div
                              style={{
                                ...s.diffSummaryDot,
                                background: diff.type === 'increase' ? '#ef4444' :
                                  diff.type === 'decrease' ? '#3b82f6' :
                                    diff.type === 'new' ? '#22c55e' : '#94a3b8',
                              }}
                            />
                            <span style={{ flex: 1 }}>{diff.label}:</span>
                            <span style={{
                              color: diff.type === 'increase' ? '#ef4444' :
                                diff.type === 'decrease' ? '#3b82f6' :
                                  diff.type === 'new' ? '#22c55e' : '#94a3b8',
                              fontWeight: 600,
                            }}>
                              {diff.oldVal} → {diff.newVal}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 历史报告摘要 */}
                    <div style={s.compareInfoCard}>
                      <div style={s.compareInfoCardTitle}>
                        <ScrollText size={12} />历史报告
                      </div>
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>报告医师</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>
                          {compareExam.reportDoctor || '未报告'}
                        </div>
                      </div>
                      {compareExam.finding && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>影像表现</div>
                          <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
                            {compareExam.finding}
                          </div>
                        </div>
                      )}
                      {compareExam.conclusion && (
                        <div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>诊断意见</div>
                          <div style={{ fontSize: 10, color: '#1e293b', fontWeight: 600, lineHeight: 1.5 }}>
                            {compareExam.conclusion}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* =============================================== */}
      {/* 底部状态栏 */}
      {/* =============================================== */}
      <div style={s.statusBar}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <FileImage size={12} />
          {exam.patientName} · {exam.examItemName}
        </span>
        <span>Accession: {exam.accessionNumber}</span>
        <span>设备: {exam.deviceName.split('（')[0]}</span>
        <span style={{ color: '#3b82f6' }}>窗口: {ww}/{wl}</span>
        <span style={{ color: '#22c55e' }}>缩放: {zoom}%</span>
        <span style={{ color: '#f59e0b' }}>旋转: {rotation}°</span>
        <span style={{ color: '#a855f7' }}>
          {activeSeries.seriesDescription}
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Activity size={12} />
          DICOM Viewer v0.4.0 | {exam.modality}-{exam.bodyPart}
        </span>
      </div>
    </div>
  )
}

// 辅助图标组件（确保所有图标都被引用）
function FileImage(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 16, ...rest } = props
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}
