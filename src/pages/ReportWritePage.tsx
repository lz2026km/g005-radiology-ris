// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 报告书写页面 v1.0.0
// 完全重写版：1000+行，完整模拟放射科诊断报告书写流程
// 参照GE Centricity/东软RIS/联影系统界面设计
// ============================================================
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, FileText, Save, Send, AlertTriangle, CheckCircle, BookOpen,
  ShieldAlert, Printer, Clock, X, Plus, Minus, ChevronDown, ChevronUp,
  Eye, Download, Upload, RefreshCw, Edit2, Trash2, Copy, Clipboard,
  Image, LayoutGrid, List, Filter, SortAsc, SortDesc, Check, AlertCircle,
  Info, Maximize2, ZoomIn, ZoomOut, RotateCcw, Settings, Bell, User,
  Calendar, Timer, Stethoscope, Activity, Heart, Brain, Bone as BoneIcon,
  ChevronRight, ChevronLeft, FolderOpen, FileCheck, ClipboardList,
  Target, Crosshair, Wifi, WifiOff, Clock3, Edit3, SaveAndPrint,
  Mic, MicOff, Sparkles, Wand2, GitCompare, History, Star, StarOff,
  ThumbsUp, ThumbsDown, MessageSquare, AlertOctagon, Recycle, EyeOff,
  CheckSquare, Square, ClockCounterClockwise, Diff, FileSearch, Volume2,
  VolumeX, Settings2, Loader2, ChevronRightCircle, PlusCircle, MinusCircle,
  ArrowRight, Undo2, Redo2, MousePointerClick, Zap, Lightbulb, Award,
  ShieldCheck, ShieldX, UserCheck, UserX, CallBell
} from 'lucide-react'

// ============================================================
// AI报告辅助 - 模拟数据
// ============================================================
interface AISuggestion {
  id: string
  type: 'finding' | 'conclusion' | 'recommendation'
  content: string
  confidence: number
  source?: string
}

interface ReviewAction {
  id: string
  action: 'submit' | 'approve' | 'reject' | 'sign' | 'recall'
  actor: string
  actorTitle: string
  timestamp: string
  comment?: string
}

interface HistoryReport {
  id: string
  examDate: string
  examType: string
  modality: string
  bodyPart: string
  findings: string
  impression: string
  reportDoctor: string
  signedTime: string
}

interface OperationLog {
  id: string
  timestamp: string
  action: string
  details: string
  beforeValue?: string
  afterValue?: string
}

interface TypicalFinding {
  id: string
  name: string
  category: string
  modality: string
  bodyPart: string
  description: string
  typicalFor: string[]
}

interface TemplateCategory {
  id: string
  label: string
  modality: string
  bodyPart: string
  color: string
  icon: string
  templates: { id: string; name: string; content: string; isFavorite?: boolean; lastUsed?: string }[]
}
import {
  initialRadiologyExams,
  initialRadiologyReports,
  initialReportTemplates,
  initialTermLibrary,
  initialUsers,
  initialPatients,
} from '../data/initialData'
import type { RadiologyExam, ReportTemplate, TermLibrary, RadiologyReport } from '../types'

// ============================================================
// 样式常量 - CSS变量统一管理
// ============================================================
const s = {
  // 主色调
  primary: '#1e3a5f',
  primaryLight: '#2d5a8a',
  primaryDark: '#152a45',
  primaryBg: '#eff6ff',
  primaryBorder: '#bfdbfe',

  // 辅助色
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',

  // 语义色
  success: '#059669',
  successBg: '#ecfdf5',
  successBorder: '#a7f3d0',
  warning: '#d97706',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  info: '#2563eb',
  infoBg: '#eff6ff',
  infoBorder: '#bfdbfe',

  // 状态色
  statusPending: '#f59e0b',
  statusInProgress: '#3b82f6',
  statusCompleted: '#10b981',
  statusCancelled: '#6b7280',

  // 模态/设备色
  ctColor: '#3b82f6',
  mrColor: '#8b5cf6',
  drColor: '#10b981',
  dsaColor: '#f97316',
  mgColor: '#ec4899',

  // 阴影
  shadowSm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  shadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
  shadowMd: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  shadowLg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  shadowCard: '0 2px 8px rgba(30,58,95,0.08)',
  shadowCardHover: '0 4px 16px rgba(30,58,95,0.15)',

  // 圆角
  radiusSm: '4px',
  radius: '8px',
  radiusMd: '10px',
  radiusLg: '12px',
  radiusXl: '16px',

  // 字体
  fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
}

// ============================================================
// 模板分类配置
// ============================================================
const TEMPLATE_CATEGORIES = [
  { label: 'CT头部', modality: 'CT', bodyPart: '头颅', color: s.ctColor, icon: Brain },
  { label: 'CT胸部', modality: 'CT', bodyPart: '胸部', color: s.ctColor, icon: Activity },
  { label: 'CT腹部', modality: 'CT', bodyPart: '腹部', color: s.ctColor, icon: Activity },
  { label: 'CT盆腔', modality: 'CT', bodyPart: '盆腔', color: s.ctColor, icon: Activity },
  { label: 'CT脊柱', modality: 'CT', bodyPart: '脊柱', color: s.ctColor, icon: Bone },
  { label: '冠脉CTA', modality: 'CT', bodyPart: '心脏', color: '#dc2626', icon: Heart },
  { label: 'MR头部', modality: 'MR', bodyPart: '头颅', color: s.mrColor, icon: Brain },
  { label: 'MR腹部', modality: 'MR', bodyPart: '腹部', color: s.mrColor, icon: Activity },
  { label: 'MR脊柱', modality: 'MR', bodyPart: '脊柱', color: s.mrColor, icon: Bone },
  { label: 'DR胸部', modality: 'DR', bodyPart: '胸部', color: s.drColor, icon: LungsIcon },
  { label: 'DR四肢', modality: 'DR', bodyPart: '四肢', color: s.drColor, icon: Bone },
  { label: 'DR腹部', modality: 'DR', bodyPart: '腹部', color: s.drColor, icon: Activity },
  { label: '乳腺钼靶', modality: '乳腺钼靶', bodyPart: '胸部', color: s.mgColor, icon: Activity },
  { label: 'DSA冠脉', modality: 'DSA', bodyPart: '心脏', color: s.dsaColor, icon: Heart },
]

// ============================================================
// 危急值词库
// ============================================================
const CRITICAL_TERMS = [
  '大量气胸（肺组织压缩>50%）',
  '大量胸腔积液',
  '急性心肌梗死改变',
  '大面积脑梗死（超过一个脑叶）',
  '颅内出血（外伤性/自发性）',
  '主动脉夹层',
  '肺栓塞',
  '消化道穿孔',
  '肠系膜血栓',
  '急性胰腺炎坏死',
  '脾破裂',
  '肝破裂',
  '心包填塞',
  '张力性气胸',
]

// ============================================================
// 常用描述短语 - 按检查类型分类
// ============================================================
const COMMON_PHRASES: Record<string, { label: string; phrase: string }[]> = {
  CT: [
    { label: '脑实质密度均匀', phrase: '脑实质密度均匀，未见异常密度影。' },
    { label: '脑室系统正常', phrase: '脑室系统形态正常，无扩张或受压改变。' },
    { label: '中线居中', phrase: '中线结构居中，无偏移。' },
    { label: '未见骨折', phrase: '颅骨骨质完整，无骨折征象。' },
    { label: '肺纹理增粗', phrase: '双肺纹理增粗，排列紊乱。' },
    { label: '占位性病变', phrase: '可见团块状异常密度影，边界不清，周围组织受压推移。' },
    { label: '未见异常', phrase: '扫描范围内未见明显异常。' },
    { label: '胸腔积液', phrase: '双侧胸腔可见弧形水样密度影。' },
    { label: '肝囊肿', phrase: '肝内可见圆形水样低密度影，边界清晰。' },
    { label: '肾结石', phrase: '右/左侧肾盂内可见高密度影。' },
  ],
  MR: [
    { label: '未见异常信号', phrase: '脑实质内未见异常信号影。' },
    { label: 'DWI受限', phrase: 'DWI序列呈高信号，相应ADC值降低。' },
    { label: 'T1低T2高', phrase: '病灶呈长T1长T2信号。' },
    { label: '强化明显', phrase: '增强扫描病灶明显均匀/不均匀强化。' },
    { label: '脑膜强化', phrase: '脑膜可见线样强化。' },
    { label: '椎间盘突出', phrase: '相应椎间盘向后方突出，压迫硬膜囊。' },
    { label: '未见骨折', phrase: '所见椎体形态及信号未见异常。' },
  ],
  DR: [
    { label: '双肺清晰', phrase: '双肺野透亮度正常，肺纹理清晰。' },
    { label: '心影正常', phrase: '心影形态大小正常。' },
    { label: '肋膈角锐', phrase: '双侧肋膈角锐利。' },
    { label: '未见骨折', phrase: '所见肋骨骨质完整，无骨折征象。' },
    { label: '肺野异常', phrase: '右/左肺野可见片状密度增高影。' },
    { label: '胸腔积液', phrase: '右/左侧肋膈角变钝，可见弧形液平面。' },
  ],
}

// ============================================================
// 常用诊断短语
// ============================================================
const DIAGNOSIS_PHRASES = [
  { label: '未见明显异常', phrase: '未见明显异常。' },
  { label: '建议随访', phrase: '建议定期随访复查。' },
  { label: '建议增强', phrase: '建议进一步行增强扫描。' },
  { label: '建议CT', phrase: '建议行CT检查进一步评估。' },
  { label: '疑似良性', phrase: '考虑良性病变可能性大。' },
  { label: '疑似恶性', phrase: '不除外恶性可能，建议进一步检查。' },
  { label: '先天性变异', phrase: '考虑先天性发育变异。' },
  { label: '治疗后改变', phrase: '符合治疗后改变。' },
  { label: '退行性改变', phrase: '符合退行性改变。' },
  { label: '炎症可能', phrase: '考虑炎性病变可能。' },
]

// ============================================================
// 诊断结果选项
// ============================================================
const DIAGNOSIS_RESULT_OPTIONS = [
  { value: 'normal', label: '正常', color: s.success },
  { value: 'abnormal', label: '异常', color: s.warning },
  { value: 'suspicious_malignant', label: '疑似恶性', color: s.danger },
  { value: 'suspicious_benign', label: '疑似良性', color: s.info },
  { value: 'non_specific', label: '非特异性改变', color: s.gray500 },
]

// ============================================================
// AI推荐数据库 - 按检查类型和部位
// ============================================================
const AI_RECOMMENDATIONS: Record<string, {
  findings: { content: string; confidence: number; source: string }[]
  conclusions: { content: string; confidence: number; typicalFor: string[] }[]
  completeness: string[]
}> = {
  'CT-头颅': {
    findings: [
      { content: '脑实质密度均匀，未见异常密度影，脑室系统形态正常，中线结构居中。', confidence: 95, source: '正常颅脑模板' },
      { content: '左侧大脑中动脉M1段管腔狭窄约50%，局部管壁可见钙化斑块。', confidence: 88, source: '脑血管病变库' },
      { content: '右侧额叶可见一类圆形低密度影，边界模糊，大小约2.5×3.0cm，CT值约25HU。', confidence: 85, source: '颅内占位库' },
      { content: '双侧脑室对称性扩大，脑回脑沟增宽加深，幕上脑室周围白质密度减低。', confidence: 82, source: '脑萎缩模板' },
    ],
    conclusions: [
      { content: '颅内未见明显异常。', confidence: 92, typicalFor: ['外伤筛查', '头痛查因'] },
      { content: '左侧大脑中动脉狭窄，建议CTA进一步检查。', confidence: 85, typicalFor: ['脑血管评估'] },
      { content: '右侧额叶占位性病变，建议增强扫描。', confidence: 80, typicalFor: ['颅内肿瘤筛查'] },
    ],
    completeness: ['描述脑室系统', '描述中线结构', '描述脑实质密度', '描述脑沟脑回', '建议定期复查'],
  },
  'CT-胸部': {
    findings: [
      { content: '双肺野透亮度正常，肺纹理清晰，走行自然，双肺门结构正常。', confidence: 95, source: '正常胸部模板' },
      { content: '右肺上叶尖段可见一实性结节，大小约1.2×1.0cm，边界清楚，可见分叶征。', confidence: 88, source: '肺结节库' },
      { content: '双侧胸腔可见弧形水样密度影，右侧重，右侧肋膈角变钝。', confidence: 90, source: '胸腔积液模板' },
      { content: '左肺下叶可见斑片状高密度影，边界模糊，密度不均，可见充气支气管征。', confidence: 85, source: '肺炎模板' },
    ],
    conclusions: [
      { content: '胸部CT平扫未见明显异常。', confidence: 95, typicalFor: ['健康体检', '术前检查'] },
      { content: '右肺上叶肺结节，建议定期随访复查。', confidence: 88, typicalFor: ['肺结节随访'] },
      { content: '双侧胸腔积液，建议查找原因。', confidence: 85, typicalFor: ['胸腔积液查因'] },
    ],
    completeness: ['描述肺野', '描述肺纹理', '描述肺门', '描述纵隔', '描述胸膜', '描述心脏'],
  },
  'CT-腹部': {
    findings: [
      { content: '肝脏形态大小正常，实质密度均匀，未见异常密度影，肝内血管走行正常。', confidence: 95, source: '正常腹部模板' },
      { content: '肝右叶可见一类圆形低密度影，边界清晰，大小约3.5×4.0cm，CT值约15HU。', confidence: 88, source: '肝脏占位库' },
      { content: '胆囊形态正常，壁不厚，腔内未见结石影，肝内外胆管无扩张。', confidence: 92, source: '胆囊模板' },
      { content: '双肾形态正常，右肾盂内可见点状高密度影，大小约0.5cm。', confidence: 90, source: '泌尿系模板' },
    ],
    conclusions: [
      { content: '腹部CT平扫未见明显异常。', confidence: 95, typicalFor: ['健康体检'] },
      { content: '肝右叶囊肿，建议定期复查。', confidence: 88, typicalFor: ['肝脏占位随访'] },
      { content: '右肾结石，建议泌尿外科随诊。', confidence: 90, typicalFor: ['泌尿系结石'] },
    ],
    completeness: ['描述肝脏', '描述胆囊', '描述胰腺', '描述脾脏', '描述肾脏', '描述肠道'],
  },
  'MR-头颅': {
    findings: [
      { content: '脑实质内未见异常信号影，脑室系统形态正常，中线结构居中。', confidence: 95, source: '正常颅脑MR模板' },
      { content: '右侧半卵圆中心可见斑片状长T1长T2信号，DWI呈高信号，ADC值减低。', confidence: 88, source: '脑梗死模板' },
      { content: '桥脑可见一类圆形长T1长T2信号，边缘清楚，大小约1.5×1.5cm。', confidence: 82, source: '颅内占位库' },
      { content: '双侧脑室旁白质可见散在点状长T2信号，边缘清楚，无占位效应。', confidence: 85, source: '脑白质病变库' },
    ],
    conclusions: [
      { content: '颅脑MRI平扫未见明显异常。', confidence: 95, typicalFor: ['健康体检', '头痛查因'] },
      { content: '右侧半卵圆中心急性期脑梗死。', confidence: 90, typicalFor: ['急性脑血管事件'] },
      { content: '桥脑占位性病变，建议增强扫描。', confidence: 80, typicalFor: ['颅内肿瘤筛查'] },
    ],
    completeness: ['描述T1信号', '描述T2信号', '描述DWI信号', '描述强化方式', '描述中线结构'],
  },
  'DR-胸部': {
    findings: [
      { content: '双肺野透亮度正常，肺纹理清晰，双肺门结构正常。', confidence: 95, source: '正常胸片模板' },
      { content: '心影形态大小正常，双侧肋膈角锐利。', confidence: 92, source: '正常心胸模板' },
      { content: '右肺野可见片状密度增高影，边界模糊，余肺野清晰。', confidence: 88, source: '肺炎模板' },
      { content: '左侧肋骨骨质结构完整，未见明确骨折征象。', confidence: 90, source: '外伤模板' },
    ],
    conclusions: [
      { content: '胸部X线片未见明显异常。', confidence: 95, typicalFor: ['健康体检', '术前检查'] },
      { content: '右下肺炎症，建议抗炎治疗后复查。', confidence: 88, typicalFor: ['肺炎随访'] },
      { content: '心影增大，建议进一步检查。', confidence: 80, typicalFor: ['心脏评估'] },
    ],
    completeness: ['描述肺野', '描述肺纹理', '描述心影', '描述肋膈角', '描述骨骼'],
  },
}

// ============================================================
// 典型征象库
// ============================================================
const TYPICAL_FINDINGS: TypicalFinding[] = [
  // CT头部
  { id: 'tf001', name: '脑出血（急性）', category: '出血性病变', modality: 'CT', bodyPart: '头颅', description: '脑实质内可见团块状高密度影，CT值约60-80HU，边界清楚，周围可见水肿带。', typicalFor: ['外伤性颅内出血', '高血压性脑出血', '动脉瘤破裂'] },
  { id: 'tf002', name: '脑梗死（急性期）', category: '缺血性病变', modality: 'CT', bodyPart: '头颅', description: '梗死区脑组织密度减低，呈楔形或片状，边界模糊，灰白质分界不清。', typicalFor: ['大面积脑梗死', '腔隙性脑梗死'] },
  { id: 'tf003', name: '脑肿瘤', category: '占位性病变', modality: 'CT', bodyPart: '头颅', description: '可见团块状异常密度影，边界不清，周围水肿，增强扫描可见不均匀强化。', typicalFor: ['胶质瘤', '脑膜瘤', '转移瘤'] },
  { id: 'tf004', name: '硬膜下血肿', category: '出血性病变', modality: 'CT', bodyPart: '头颅', description: '颅骨内板下可见新月形高密度影，范围广泛，可跨越颅缝。', typicalFor: ['外伤性硬膜下血肿', '慢性硬膜下血肿'] },
  { id: 'tf005', name: '蛛网膜下腔出血', category: '出血性病变', modality: 'CT', bodyPart: '头颅', description: '脑池、脑沟内可见高密度影，以侧裂池、外侧裂池为著。', typicalFor: ['动脉瘤破裂', '外伤性SAH'] },
  // CT胸部
  { id: 'tf006', name: '大叶性肺炎', category: '感染性病变', modality: 'CT', bodyPart: '胸部', description: '肺叶或肺段可见大片实变影，密度均匀，可见支气管充气征。', typicalFor: ['细菌性肺炎'] },
  { id: 'tf007', name: '肺结核', category: '感染性病变', modality: 'CT', bodyPart: '胸部', description: '上肺可见斑片状、结节状影，可见空洞形成，周围可见卫星灶。', typicalFor: ['继发性肺结核', '空洞型肺结核'] },
  { id: 'tf008', name: '肺肿瘤', category: '肿瘤性病变', modality: 'CT', bodyPart: '胸部', description: '肺门或肺野可见团块影，边界不清，可见分叶、毛刺征，可有胸膜牵拉。', typicalFor: ['中央型肺癌', '周围型肺癌'] },
  { id: 'tf009', name: '气胸', category: '胸膜病变', modality: 'CT', bodyPart: '胸部', description: '胸腔内可见无肺纹理区域，肺组织被压缩，可见压缩边缘。', typicalFor: ['自发性气胸', '外伤性气胸'] },
  { id: 'tf010', name: '胸腔积液', category: '胸膜病变', modality: 'CT', bodyPart: '胸部', description: '胸腔内可见弧形水样密度影，根据密度可判断性质（漏出液/渗出液/血性）。', typicalFor: ['感染性胸腔积液', '恶性胸腔积液', '心衰导致的胸腔积液'] },
  // CT腹部
  { id: 'tf011', name: '肝血管瘤', category: '良性肿瘤', modality: 'CT', bodyPart: '腹部', description: '肝内可见类圆形低密度影，边界清楚，增强扫描边缘结节样强化，逐渐向内填充。', typicalFor: ['肝血管瘤'] },
  { id: 'tf012', name: '肝细胞癌', category: '恶性肿瘤', modality: 'CT', bodyPart: '腹部', description: '肝内可见肿块影，边界不清，增强扫描动脉期明显强化，静脉期及延迟期快速退出。', typicalFor: ['原发性肝癌', '转移性肝癌'] },
  { id: 'tf013', name: '急性胰腺炎', category: '炎症性病变', modality: 'CT', bodyPart: '腹部', description: '胰腺形态肿胀，密度减低，周围脂肪间隙模糊，可见条索状渗出。', typicalFor: ['急性水肿型胰腺炎', '急性坏死型胰腺炎'] },
  { id: 'tf014', name: '肾囊肿', category: '良性病变', modality: 'CT', bodyPart: '腹部', description: '肾内可见圆形水样低密度影，边界清晰，壁薄而光滑，增强扫描无强化。', typicalFor: ['单纯性肾囊肿', '多囊肾'] },
  { id: 'tf015', name: '泌尿系结石', category: '结石性病变', modality: 'CT', bodyPart: '腹部', description: '泌尿系走行区可见高密度影，CT值约200-400HU，边缘锐利。', typicalFor: ['肾结石', '输尿管结石', '膀胱结石'] },
  // MR头部
  { id: 'tf016', name: '急性脑梗死（DWI）', category: '缺血性病变', modality: 'MR', bodyPart: '头颅', description: 'DWI序列呈高信号，相应ADC值降低，提示水分子扩散受限。', typicalFor: ['急性腔隙性脑梗死', '急性大面积脑梗死'] },
  { id: 'tf017', name: '脑膜瘤', category: '肿瘤性病变', modality: 'MR', bodyPart: '头颅', description: '颅内可见类圆形占位，T1呈等或低信号，T2呈高信号，增强扫描明显均匀强化，可见脑膜尾征。', typicalFor: ['典型脑膜瘤'] },
  { id: 'tf018', name: '垂体瘤', category: '肿瘤性病变', modality: 'MR', bodyPart: '头颅', description: '垂体可见增大，可见局限性突出，T1、T2呈等信号，增强扫描明显强化。', typicalFor: ['垂体微腺瘤', '垂体大腺瘤'] },
  // DR胸部
  { id: 'tf019', name: '社区获得性肺炎', category: '感染性病变', modality: 'DR', bodyPart: '胸部', description: '肺野可见斑片状、片状密度增高影，边界模糊，以右下肺多见。', typicalFor: ['细菌性肺炎', '病毒性肺炎'] },
  { id: 'tf020', name: '肋骨骨折', category: '外伤性病变', modality: 'DR', bodyPart: '胸部', description: '肋骨骨质连续性中断，可见透亮线影，断端可无明显移位。', typicalFor: ['外伤性肋骨骨折'] },
]

// ============================================================
// 报告质量评估标准
// ============================================================
const REPORT_QUALITY_CHECKPOINTS = [
  { key: 'has_findings', label: '已填写检查所见', required: true },
  { key: 'has_diagnosis', label: '已填写诊断意见', required: true },
  { key: 'has_impression', label: '已填写印象/结论', required: true },
  { key: 'has_recommendation', label: '已填写建议', required: false },
  { key: 'has_critical_if_present', label: '发现危急值时已标注', required: false },
  { key: 'findings_length', label: '所见描述≥50字符', required: true },
  { key: 'diagnosis_length', label: '诊断意见≥20字符', required: true },
  { key: 'no_typing_errors', label: '无明显录入错误', required: false },
  { key: 'complete_body_part', label: '检查部位描述完整', required: true },
]

// ============================================================
// 语音命令配置
// ============================================================
const VOICE_COMMANDS: Record<string, { action: string; description: string }> = {
  '完成报告': { action: 'complete_report', description: '保存并提交报告' },
  '提交报告': { action: 'submit_report', description: '提交报告审核' },
  '保存草稿': { action: 'save_draft', description: '保存报告草稿' },
  '下一个': { action: 'next_exam', description: '跳转到下一个检查' },
  '上一个': { action: 'prev_exam', description: '返回上一个检查' },
  '清空': { action: 'clear_content', description: '清空当前输入' },
  '复制': { action: 'copy_content', description: '复制报告内容' },
  '打印': { action: 'print_report', description: '打印报告' },
  '新增印象': { action: 'add_impression', description: '添加新的印象行' },
  '结束录音': { action: 'stop_recording', description: '停止语音录入' },
}

// ============================================================
// 多级审核流程配置
// ============================================================
const REVIEW_WORKFLOW_STEPS = [
  { id: 'draft', label: '草稿', icon: Edit3, color: s.gray500, description: '报告医生书写中' },
  { id: 'pending_review', label: '待一审', icon: UserCheck, color: s.warning, description: '等待主治医师审核' },
  { id: 'first_approved', label: '一审通过', icon: ShieldCheck, color: s.info, description: '等待副主任医师二审' },
  { id: 'pending_final', label: '待签发', icon: ShieldAlert, color: s.primary, description: '等待主任医师签发' },
  { id: 'signed', label: '已签发', icon: Award, color: s.success, description: '报告已完成' },
]

const REJECT_REASONS = [
  '报告描述不完整，请补充...',
  '诊断意见不明确，请明确...',
  '所见描述与图像不符，请核实...',
  '缺少必要的鉴别诊断...',
  '建议不合理，请修改...',
  '格式不规范，请按模板要求填写...',
  '其他原因：请在下方详细说明...',
]

// ============================================================
// 模拟用户数据（用于审核流）
// ============================================================
const MOCK_REVIEW_USERS = [
  { id: 'dr001', name: '张明华', title: '主任医师', role: 'chief', department: '放射科' },
  { id: 'dr002', name: '李文静', title: '副主任医师', role: 'associate_chief', department: '放射科' },
  { id: 'dr003', name: '王建国', title: '主治医师', role: 'attending', department: '放射科' },
  { id: 'dr004', name: '赵晓燕', title: '住院医师', role: 'resident', department: '放射科' },
]

// ============================================================
// 窗宽窗位预设
// ============================================================
const WWWL_PRESETS = [
  { label: '骨窗', ww: 2000, wl: 500, color: '#f59e0b' },
  { label: '肺窗', ww: 1200, wl: -600, color: '#10b981' },
  { label: '软组织', ww: 400, wl: 40, color: '#8b5cf6' },
  { label: '纵隔', ww: 350, wl: 50, color: '#ec4899' },
  { label: '脑组织', ww: 80, wl: 40, color: '#3b82f6' },
  { label: '肝脏', ww: 150, wl: 30, color: '#f97316' },
  { label: '血管', ww: 300, wl: 100, color: '#dc2626' },
]

// ============================================================
// 工具函数
// ============================================================
const formatDateTime = (date: Date = new Date()) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getModalityColor = (modality: string) => {
  const colors: Record<string, string> = {
    CT: s.ctColor,
    MR: s.mrColor,
    DR: s.drColor,
    DSA: s.dsaColor,
    '乳腺钼靶': s.mgColor,
    胃肠造影: '#f59e0b',
  }
  return colors[modality] || s.gray500
}

const getModalityBg = (modality: string) => {
  const colors: Record<string, string> = {
    CT: '#eff6ff',
    MR: '#f5f3ff',
    DR: '#ecfdf5',
    DSA: '#fff7ed',
    '乳腺钼靶': '#fdf2f8',
    胃肠造影: '#fef3c7',
  }
  return colors[modality] || s.gray100
}

// ============================================================
// 子组件：卡片容器
// ============================================================
interface CardProps {
  title?: string
  icon?: React.ReactNode
  extra?: React.ReactNode
  children: React.ReactNode
  style?: React.CSSProperties
  headerStyle?: React.CSSProperties
  bodyStyle?: React.CSSProperties
  noPadding?: boolean
}

function Card({ title, icon, extra, children, style, headerStyle, bodyStyle, noPadding }: CardProps) {
  return (
    <div style={{
      background: s.white,
      borderRadius: s.radiusLg,
      border: `1px solid ${s.gray200}`,
      boxShadow: s.shadowCard,
      overflow: 'hidden',
      ...style,
    }}>
      {title && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: `1px solid ${s.gray200}`,
          background: s.gray50,
          ...headerStyle,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon && <span style={{ color: s.primary }}>{icon}</span>}
            <span style={{ fontSize: 13, fontWeight: 700, color: s.primary }}>{title}</span>
          </div>
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div style={{ padding: noPadding ? 0 : 16, ...bodyStyle }}>
        {children}
      </div>
    </div>
  )
}

// ============================================================
// 子组件：按钮
// ============================================================
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  disabled?: boolean
  fullWidth?: boolean
  style?: React.CSSProperties
}

function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  fullWidth,
  style,
}: ButtonProps) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: 'none',
    borderRadius: s.radius,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...style,
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '4px 10px', fontSize: 11 },
    md: { padding: '8px 14px', fontSize: 13 },
    lg: { padding: '10px 18px', fontSize: 14 },
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: hover && !disabled ? (active ? s.primaryDark : s.primaryLight) : s.primary,
      color: s.white,
    },
    secondary: {
      background: hover && !disabled ? s.gray200 : s.gray100,
      color: s.gray700,
    },
    success: {
      background: hover && !disabled ? '#047857' : s.success,
      color: s.white,
    },
    danger: {
      background: hover && !disabled ? '#b91c1c' : s.danger,
      color: s.white,
    },
    ghost: {
      background: hover && !disabled ? s.gray100 : 'transparent',
      color: s.gray600,
    },
    outline: {
      background: hover && !disabled ? s.gray50 : s.white,
      color: s.gray700,
      border: `1px solid ${s.gray300}`,
    },
  }

  return (
    <button
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant] }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false) }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  )
}

// ============================================================
// 子组件：输入框
// ============================================================
interface InputProps {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: 'text' | 'number' | 'date' | 'time' | 'datetime-local'
  style?: React.CSSProperties
  disabled?: boolean
  icon?: React.ReactNode
  suffix?: React.ReactNode
}

function Input({ value, onChange, placeholder, type = 'text', style, disabled, icon, suffix }: InputProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: s.gray50,
      border: `1px solid ${s.gray200}`,
      borderRadius: s.radius,
      padding: '6px 12px',
      ...style,
    }}>
      {icon && <span style={{ color: s.gray400, display: 'flex' }}>{icon}</span>}
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          border: 'none',
          outline: 'none',
          fontSize: 13,
          background: 'transparent',
          width: '100%',
          color: s.gray700,
          fontFamily: 'inherit',
        }}
      />
      {suffix && <span>{suffix}</span>}
    </div>
  )
}

// ============================================================
// 子组件：标签徽章
// ============================================================
interface BadgeProps {
  children: React.ReactNode
  color?: string
  bg?: string
  size?: 'sm' | 'md'
}

function Badge({ children, color = s.white, bg = s.primary, size = 'sm' }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: size === 'sm' ? '2px 6px' : '3px 8px',
      borderRadius: s.radiusSm,
      fontSize: size === 'sm' ? 10 : 11,
      fontWeight: 700,
      color,
      background: bg,
    }}>
      {children}
    </span>
  )
}

// ============================================================
// 子组件：模态弹窗
// ============================================================
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: number
  footer?: React.ReactNode
}

function Modal({ open, onClose, title, children, width = 600, footer }: ModalProps) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: s.white,
          borderRadius: s.radiusLg,
          boxShadow: s.shadowLg,
          width: Math.min(width, window.innerWidth - 40),
          maxHeight: window.innerHeight - 80,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          borderBottom: `1px solid ${s.gray200}`,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: s.primary }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: s.gray400,
              display: 'flex',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
        {footer && (
          <div style={{
            padding: '12px 18px',
            borderTop: `1px solid ${s.gray200}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// 子组件：患者信息头部
// ============================================================
interface PatientHeaderProps {
  exam: RadiologyExam
  onClose?: () => void
}

function PatientHeader({ exam, onClose }: PatientHeaderProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${s.primary} 0%, ${s.primaryLight} 100%)`,
      borderRadius: s.radiusLg,
      padding: '16px 20px',
      color: s.white,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 装饰性背景 */}
      <div style={{
        position: 'absolute',
        right: -20,
        top: -20,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <div style={{
        position: 'absolute',
        right: 30,
        bottom: -30,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>{exam.patientName}</span>
            <Badge bg="rgba(255,255,255,0.2)" color={s.white}>{exam.gender} / {exam.age}岁</Badge>
            <Badge bg={exam.patientType === '急诊' ? s.danger : exam.patientType === '住院' ? s.warning : s.info} color={s.white}>{exam.patientType}</Badge>
            {exam.priority !== '普通' && (
              <Badge bg={exam.priority === '危重' ? s.danger : s.warning} color={s.white}>
                <AlertTriangle size={10} style={{ marginRight: 3 }} />
                {exam.priority}
              </Badge>
            )}
          </div>
          <div style={{ fontSize: 11, fontFamily: s.fontMono, opacity: 0.8, marginBottom: 4 }}>
            Accession: {exam.accessionNumber}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            {exam.clinicalDiagnosis || exam.clinicalHistory || '无临床诊断'}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              cursor: 'pointer',
              color: s.white,
              borderRadius: s.radius,
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
            }}
          >
            <X size={14} /> 关闭
          </button>
        )}
      </div>

      {/* 信息网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
        marginTop: 14,
        position: 'relative',
        zIndex: 1,
      }}>
        {[
          { label: '检查项目', value: exam.examItemName, icon: Stethoscope },
          { label: '检查设备', value: exam.deviceName?.split('（')[0] || '-', icon: Settings },
          { label: '检查日期', value: exam.examDate + (exam.examTime ? ' ' + exam.examTime : ''), icon: Calendar },
          { label: '影像数量', value: `${exam.imagesAcquired} 幅`, icon: Image },
          { label: '临床病史', value: (exam.clinicalHistory || '-').slice(0, 20), icon: ClipboardList },
          { label: '检查部位', value: exam.bodyPart, icon: Target },
          { label: '申请医生', value: '-', icon: User },
          { label: '登记时间', value: exam.createdTime, icon: Clock3 },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: s.radius,
              padding: '8px 10px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
              <Icon size={10} style={{ opacity: 0.7 }} />
              <span style={{ fontSize: 10, opacity: 0.7 }}>{label}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// 子组件：历史报告卡片
// ============================================================
interface HistoryReportProps {
  report: RadiologyReport
  onClick?: () => void
}

function HistoryReportCard({ report, onClick }: HistoryReportProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        border: `1px solid ${s.gray200}`,
        borderRadius: s.radius,
        padding: 10,
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'all 0.15s',
        background: s.white,
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = s.primaryBorder
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = s.shadowCard
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = s.gray200
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.primary }}>{report.examItemName}</div>
          <div style={{ fontSize: 10, color: s.gray500, marginTop: 2 }}>
            {report.examDate} · {report.modality} · {report.deviceName?.split('（')[0]}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Badge
            bg={report.criticalFinding ? s.dangerBg : s.successBg}
            color={report.criticalFinding ? s.danger : s.success}
          >
            {report.criticalFinding ? '危急值' : '正常'}
          </Badge>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${s.gray200}` }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: s.gray500 }}>检查所见：</span>
            <p style={{ fontSize: 11, color: s.gray700, margin: '4px 0 0', lineHeight: 1.6 }}>
              {report.examFindings?.slice(0, 100)}...
            </p>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: s.gray500 }}>诊断意见：</span>
            <p style={{ fontSize: 11, color: s.gray700, margin: '4px 0 0', lineHeight: 1.6 }}>
              {report.diagnosis?.slice(0, 80)}...
            </p>
          </div>
          <div style={{ fontSize: 10, color: s.gray400 }}>
            报告医生：{report.reportDoctorName} · {report.signedTime}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 主组件：报告书写页面
// ============================================================
export default function ReportWritePage() {
  // ----------------------------------------
  // 状态定义
  // ----------------------------------------
  const [leftPanelWidth] = useState('58%')
  const [rightPanelWidth] = useState('42%')

  // 搜索和筛选
  const [examSearch, setExamSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [modalityFilter, setModalityFilter] = useState<string>('all')

  // 选中的检查
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [showExamList, setShowExamList] = useState(true)

  // 报告内容状态
  const [findings, setFindings] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [impressions, setImpressions] = useState<string[]>([''])
  const [recommendations, setRecommendations] = useState('')
  const [reportNotes, setReportNotes] = useState('')

  // 危急值状态
  const [criticalFinding, setCriticalFinding] = useState(false)
  const [criticalDetails, setCriticalDetails] = useState('')

  // 报告信息状态
  const [reportDoctorId, setReportDoctorId] = useState('')
  const [auditorId, setAuditorId] = useState('')
  const [reportDateTime, setReportDateTime] = useState(formatDateTime())

  // 诊断结果选项
  const [diagnosisResult, setDiagnosisResult] = useState('normal')

  // 模板状态
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)

  // 词库状态
  const [showTermLib, setShowTermLib] = useState(false)
  const [termSearch, setTermSearch] = useState('')
  const [termCategory, setTermCategory] = useState('all')

  // 图像预览状态
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [currentWwlPreset, setCurrentWwlPreset] = useState(WWWL_PRESETS[0])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [windowWidth, setWindowWidth] = useState(2000)
  const [windowLevel, setWindowLevel] = useState(500)

  // 参考图像标签页
  const [refTab, setRefTab] = useState<'typical' | 'history'>('typical')

  // 活跃标签页
  const [activeTab, setActiveTab] = useState<'findings' | 'diagnosis' | 'impression' | 'info'>('findings')

  // 保存状态
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  // ----------------------------------------
  // [NEW] AI辅助状态
  // ----------------------------------------
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [aiSuggestions, setAiSuggestions] = useState<{
    findings: { content: string; confidence: number; source: string }[]
    conclusions: { content: string; confidence: number; typicalFor: string[] }[]
    completeness: string[]
  }>({ findings: [], conclusions: [], completeness: [] })
  const [reportQuality, setReportQuality] = useState<{
    score: number
    passed: string[]
    failed: { label: string; required: boolean }[]
  }>({ score: 0, passed: [], failed: [] })
  const [aiLoading, setAiLoading] = useState(false)
  const [aiFindingSearch, setAiFindingSearch] = useState('')

  // ----------------------------------------
  // [NEW] 语音录入状态
  // ----------------------------------------
  const [isRecording, setIsRecording] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const [voiceActiveField, setVoiceActiveField] = useState<'findings' | 'diagnosis' | 'impression' | 'recommendations'>('findings')
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    confidence: 0.5,
    continuous: true,
  })
  const [voiceSupported, setVoiceSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  // ----------------------------------------
  // [NEW] 多级审核流状态
  // ----------------------------------------
  const [reportStatus, setReportStatus] = useState<'draft' | 'pending_review' | 'first_approved' | 'pending_final' | 'signed'>('draft')
  const [reviewHistory, setReviewHistory] = useState<ReviewAction[]>([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showRecallModal, setShowRecallModal] = useState(false)
  const [reviewComment, setReviewComment] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [recallReason, setRecallReason] = useState('')
  const [selectedRejectReason, setSelectedRejectReason] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'sign' | 'recall'>('approve')

  // ----------------------------------------
  // [NEW] 历史对比状态
  // ----------------------------------------
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [historyReports, setHistoryReports] = useState<HistoryReport[]>([])
  const [selectedHistoryReport, setSelectedHistoryReport] = useState<HistoryReport | null>(null)
  const [showCompareView, setShowCompareView] = useState(false)
  const [historySearch, setHistorySearch] = useState('')

  // ----------------------------------------
  // [NEW] 典型征象库状态
  // ----------------------------------------
  const [showFindingLibrary, setShowFindingLibrary] = useState(false)
  const [findingLibrarySearch, setFindingLibrarySearch] = useState('')
  const [findingLibraryModality, setFindingLibraryModality] = useState<string>('all')
  const [filteredFindings, setFilteredFindings] = useState<TypicalFinding[]>(TYPICAL_FINDINGS)

  // ----------------------------------------
  // [NEW] 模板增强状态
  // ----------------------------------------
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [templateSearch, setTemplateSearch] = useState('')
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([])
  const [recentTemplates, setRecentTemplates] = useState<string[]>([])
  const [templatePreview, setTemplatePreview] = useState<{ id: string; name: string; content: string } | null>(null)

  // ----------------------------------------
  // [NEW] 操作痕迹状态
  // ----------------------------------------
  const [showOperationLog, setShowOperationLog] = useState(false)
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([])
  const [showDiffView, setShowDiffView] = useState(false)
  const [diffData, setDiffData] = useState<{ before: string; after: string; field: string } | null>(null)

  // ----------------------------------------
  // [NEW] 工具栏折叠状态
  // ----------------------------------------
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false)

  // ----------------------------------------
  // 数据引用
  // ----------------------------------------
  const exams = initialRadiologyExams
  const reports = initialRadiologyReports
  const templates = initialReportTemplates
  const termLib = initialTermLibrary
  const patients = initialPatients
  const users = initialUsers

  // 医生列表
  const doctors = users.filter(u => u.role === 'radiologist')

  // ----------------------------------------
  // 计算属性
  // ----------------------------------------
  // 待报告的检查（检查已完成但尚未提交报告的）
  const pendingExams = useMemo(() => {
    return exams.filter(e => {
      // 状态为待报告或检查中（有图像）
      const statusMatch = ['待报告', '检查中'].includes(e.status)
      // 尚未提交报告
      const noReport = !reports.some(r => r.examId === e.id && r.status !== '已驳回')
      // 图像已采集
      const hasImages = e.imagesAcquired > 0
      return statusMatch && noReport && hasImages
    })
  }, [exams, reports])

  // 选中的检查
  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId)
  }, [exams, selectedExamId])

  // 筛选后的待报告列表
  const filteredPendingExams = useMemo(() => {
    return pendingExams.filter(e => {
      // 搜索过滤
      const searchMatch = !examSearch ||
        e.patientName.includes(examSearch) ||
        e.accessionNumber.includes(examSearch) ||
        e.examItemName.includes(examSearch)
      // 模态过滤
      const modalityMatch = modalityFilter === 'all' || e.modality === modalityFilter
      return searchMatch && modalityMatch
    })
  }, [pendingExams, examSearch, modalityFilter])

  // 患者历史报告
  const patientHistoryReports = useMemo(() => {
    if (!selectedExam) return []
    const patientId = selectedExam.patientId
    return reports
      .filter(r =>
        r.patientId === patientId &&
        r.examId !== selectedExamId &&
        r.modality === selectedExam.modality &&
        r.status === '已发布'
      )
      .sort((a, b) => (b.signedTime || '').localeCompare(a.signedTime || ''))
      .slice(0, 3)
  }, [selectedExam, selectedExamId, reports])

  // 筛选后的词库
  const filteredTerms = useMemo(() => {
    return termLib.filter(t => {
      const searchMatch = !termSearch ||
        t.keyword.includes(termSearch) ||
        t.fullTerm.includes(termSearch) ||
        t.category.includes(termSearch)
      return searchMatch
    }).slice(0, 30)
  }, [termSearch, termCategory])

  // 当前检查类型的模板
  const relevantTemplates = useMemo(() => {
    if (!selectedExam) return []
    return templates.filter(t =>
      t.modality === selectedExam.modality &&
      (t.bodyPart === selectedExam.bodyPart || !t.bodyPart)
    )
  }, [selectedExam, templates])

  // 当前检查类型的常用短语
  const relevantPhrases = useMemo(() => {
    if (!selectedExam) return []
    const modality = selectedExam.modality
    if (modality === 'CT' || modality === 'MR' || modality === 'DR') {
      return COMMON_PHRASES[modality] || []
    }
    return COMMON_PHRASES['CT'] || []
  }, [selectedExam])

  // 当前设备类型的模拟图像数量
  const imageCount = selectedExam?.imagesAcquired || 0

  // ----------------------------------------
  // [NEW] AI推荐计算
  // ----------------------------------------
  useEffect(() => {
    if (!selectedExam) {
      setAiSuggestions({ findings: [], conclusions: [], completeness: [] })
      return
    }

    const key = `${selectedExam.modality}-${selectedExam.bodyPart}`
    const recommendations = AI_RECOMMENDATIONS[key] || AI_RECOMMENDATIONS[`${selectedExam.modality}-${selectedExam.modality === 'CT' ? '头颅' : selectedExam.modality === 'MR' ? '头颅' : selectedExam.modality === 'DR' ? '胸部' : '胸部'}`] || {
      findings: AI_RECOMMENDATIONS['CT-头颅'].findings.slice(0, 2),
      conclusions: AI_RECOMMENDATIONS['CT-头颅'].conclusions.slice(0, 2),
      completeness: ['描述病变部位', '描述病变大小', '描述病变形态', '描述病变边界', '描述周围组织'],
    }

    setAiSuggestions(recommendations)
  }, [selectedExam])

  // ----------------------------------------
  // [NEW] 报告质量评估计算
  // ----------------------------------------
  useEffect(() => {
    const passed: string[] = []
    const failed: { label: string; required: boolean }[] = []

    REPORT_QUALITY_CHECKPOINTS.forEach((checkpoint) => {
      let isPassed = false
      switch (checkpoint.key) {
        case 'has_findings':
          isPassed = findings.trim().length > 0
          break
        case 'has_diagnosis':
          isPassed = diagnosis.trim().length > 0
          break
        case 'has_impression':
          isPassed = impressions.some(i => i.trim().length > 0)
          break
        case 'has_recommendation':
          isPassed = recommendations.trim().length > 0
          break
        case 'has_critical_if_present':
          isPassed = !criticalFinding || criticalDetails.trim().length > 0
          break
        case 'findings_length':
          isPassed = findings.trim().length >= 50
          break
        case 'diagnosis_length':
          isPassed = diagnosis.trim().length >= 20
          break
        case 'no_typing_errors':
          isPassed = true // 简化处理
          break
        case 'complete_body_part':
          isPassed = selectedExam ? findings.includes(selectedExam.bodyPart) || findings.length > 20 : true
          break
      }

      if (isPassed) {
        passed.push(checkpoint.label)
      } else {
        failed.push({ label: checkpoint.label, required: checkpoint.required })
      }
    })

    const score = Math.round((passed.length / REPORT_QUALITY_CHECKPOINTS.length) * 100)
    setReportQuality({ score, passed, failed })
  }, [findings, diagnosis, impressions, recommendations, criticalFinding, criticalDetails, selectedExam])

  // ----------------------------------------
  // [NEW] 语音识别初始化
  // ----------------------------------------
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      setVoiceSupported(true)
    }
  }, [])

  // ----------------------------------------
  // [NEW] 历史报告加载
  // ----------------------------------------
  useEffect(() => {
    if (!selectedExam) {
      setHistoryReports([])
      return
    }

    // 模拟加载该患者的历史报告
    const mockHistory: HistoryReport[] = [
      {
        id: 'hist001',
        examDate: '2025-11-15',
        examType: '颅脑CT平扫',
        modality: 'CT',
        bodyPart: '头颅',
        findings: '脑实质密度均匀，未见异常密度影，脑室系统形态正常，中线结构居中。',
        impression: '颅脑CT平扫未见明显异常。',
        reportDoctor: '赵明',
        signedTime: '2025-11-15 14:30',
      },
      {
        id: 'hist002',
        examDate: '2025-08-20',
        examType: '颅脑CT平扫',
        modality: 'CT',
        bodyPart: '头颅',
        findings: '左侧额叶可见一类圆形低密度影，大小约1.5×2.0cm，边界清楚。',
        impression: '左侧额叶低密度影，建议进一步检查。',
        reportDoctor: '赵明',
        signedTime: '2025-08-20 16:45',
      },
    ].filter(r => r.modality === selectedExam.modality)

    setHistoryReports(mockHistory)
  }, [selectedExam])

  // ----------------------------------------
  // [NEW] 典型征象库筛选
  // ----------------------------------------
  useEffect(() => {
    let filtered = TYPICAL_FINDINGS

    if (selectedExam) {
      filtered = filtered.filter(f =>
        f.modality === selectedExam.modality ||
        (selectedExam.modality === 'CT' && f.modality === 'CT') ||
        (selectedExam.modality === 'MR' && f.modality === 'MR') ||
        (selectedExam.modality === 'DR' && f.modality === 'DR')
      )
    }

    if (findingLibraryModality !== 'all') {
      filtered = filtered.filter(f => f.modality === findingLibraryModality)
    }

    if (findingLibrarySearch) {
      const search = findingLibrarySearch.toLowerCase()
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(search) ||
        f.category.toLowerCase().includes(search) ||
        f.description.toLowerCase().includes(search)
      )
    }

    setFilteredFindings(filtered)
  }, [findingLibrarySearch, findingLibraryModality, selectedExam])

  // ----------------------------------------
  // [NEW] 操作日志记录
  // ----------------------------------------
  const addOperationLog = useCallback((action: string, details: string, beforeValue?: string, afterValue?: string) => {
    const newLog: OperationLog = {
      id: `log_${Date.now()}`,
      timestamp: formatDateTime(),
      action,
      details,
      beforeValue,
      afterValue,
    }
    setOperationLogs(prev => [newLog, ...prev])
  }, [])

  // ----------------------------------------
  // [NEW] 语音识别函数
  // ----------------------------------------
  const startVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('当前浏览器不支持语音识别功能')
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = voiceSettings.continuous
    recognition.interimResults = true
    recognition.lang = 'zh-CN'
    recognition.rate = voiceSettings.rate

    recognition.onstart = () => {
      setIsRecording(true)
      setVoiceText('')
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const text = finalTranscript || interimTranscript
      setVoiceText(text)

      // 检查语音命令
      Object.entries(VOICE_COMMANDS).forEach(([command, config]) => {
        if (text.includes(command)) {
          handleVoiceCommand(config.action)
        }
      })
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
      if (event.error !== 'no-speech') {
        alert(`语音识别错误: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
      // 将识别结果填入当前字段
      if (voiceText) {
        handleVoiceTextInsert(voiceText)
      }
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
  }, [voiceSettings, voiceActiveField, voiceText])

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
    if (voiceText) {
      handleVoiceTextInsert(voiceText)
    }
  }, [voiceText])

  const handleVoiceTextInsert = useCallback((text: string) => {
    const processedText = text.replace(/[。，、！？]/g, '').trim()
    switch (voiceActiveField) {
      case 'findings':
        setFindings(prev => prev + (prev ? ' ' : '') + processedText)
        addOperationLog('语音录入', `向检查所见添加语音内容: ${processedText.slice(0, 20)}...`)
        break
      case 'diagnosis':
        setDiagnosis(prev => prev + (prev ? ' ' : '') + processedText)
        addOperationLog('语音录入', `向诊断意见添加语音内容: ${processedText.slice(0, 20)}...`)
        break
      case 'impression':
        const lastIdx = impressions.length - 1
        setImpressions(prev => {
          const updated = [...prev]
          updated[lastIdx] = (updated[lastIdx] || '') + (updated[lastIdx] ? ' ' : '') + processedText
          return updated
        })
        addOperationLog('语音录入', `向印象添加语音内容: ${processedText.slice(0, 20)}...`)
        break
      case 'recommendations':
        setRecommendations(prev => prev + (prev ? ' ' : '') + processedText)
        addOperationLog('语音录入', `向建议添加语音内容: ${processedText.slice(0, 20)}...`)
        break
    }
    setVoiceText('')
  }, [voiceActiveField, impressions, addOperationLog])

  const handleVoiceCommand = useCallback((action: string) => {
    switch (action) {
      case 'complete_report':
        handleSaveDraft()
        handleSubmitReport()
        break
      case 'submit_report':
        handleSubmitReport()
        break
      case 'save_draft':
        handleSaveDraft()
        break
      case 'next_exam':
        // 跳转下一个检查
        break
      case 'prev_exam':
        // 返回上一个检查
        break
      case 'clear_content':
        if (voiceActiveField === 'findings') setFindings('')
        else if (voiceActiveField === 'diagnosis') setDiagnosis('')
        else if (voiceActiveField === 'impression') setImpressions([''])
        else if (voiceActiveField === 'recommendations') setRecommendations('')
        break
      case 'copy_content':
        handleCopyReport()
        break
      case 'print_report':
        handlePrintPreview()
        break
      case 'add_impression':
        handleAddImpression()
        break
      case 'stop_recording':
        stopVoiceInput()
        break
    }
  }, [voiceActiveField, handleSaveDraft, handleSubmitReport, handleCopyReport, handlePrintPreview, handleAddImpression, stopVoiceInput])

  // ----------------------------------------
  // [NEW] AI推荐采纳
  // ----------------------------------------
  const handleAcceptAISuggestion = useCallback((type: 'finding' | 'conclusion', content: string) => {
    if (type === 'finding') {
      setFindings(prev => prev + (prev ? '\n\n' : '') + content)
      addOperationLog('AI采纳', `采纳AI推荐所见: ${content.slice(0, 30)}...`)
    } else {
      const lastIdx = impressions.length - 1
      setImpressions(prev => {
        const updated = [...prev]
        updated[lastIdx] = (updated[lastIdx] || '') + (updated[lastIdx] ? '\n' : '') + content
        return updated
      })
      addOperationLog('AI采纳', `采纳AI推荐结论: ${content.slice(0, 30)}...`)
    }
  }, [impressions, addOperationLog])

  // ----------------------------------------
  // [NEW] 典型征象插入
  // ----------------------------------------
  const handleInsertTypicalFinding = useCallback((finding: TypicalFinding) => {
    setFindings(prev => prev + (prev ? '\n\n' : '') + finding.description)
    addOperationLog('征象插入', `插入典型征象: ${finding.name}`)
    setShowFindingLibrary(false)
  }, [addOperationLog])

  // ----------------------------------------
  // [NEW] 审核流程处理
  // ----------------------------------------
  const handleReviewAction = useCallback((action: 'approve' | 'reject' | 'sign' | 'recall') => {
    const currentUser = MOCK_REVIEW_USERS[0] // 模拟当前用户
    const actionRecord: ReviewAction = {
      id: `review_${Date.now()}`,
      action,
      actor: currentUser.name,
      actorTitle: currentUser.title,
      timestamp: formatDateTime(),
      comment: action === 'reject' ? rejectReason : reviewComment,
    }

    setReviewHistory(prev => [...prev, actionRecord])

    switch (action) {
      case 'approve':
        if (reportStatus === 'draft') {
          setReportStatus('pending_review')
        } else if (reportStatus === 'pending_review') {
          setReportStatus('first_approved')
        } else if (reportStatus === 'first_approved') {
          setReportStatus('pending_final')
        }
        addOperationLog('审核通过', `审核通过，等待下一级审核`)
        break
      case 'reject':
        setReportStatus('draft')
        addOperationLog('审核驳回', `驳回原因: ${rejectReason}`)
        setRejectReason('')
        setSelectedRejectReason('')
        break
      case 'sign':
        setReportStatus('signed')
        addOperationLog('报告签发', `报告已最终签发`)
        break
      case 'recall':
        setReportStatus('draft')
        addOperationLog('报告召回', `召回原因: ${recallReason}`)
        setRecallReason('')
        break
    }

    setShowReviewModal(false)
    setShowRejectModal(false)
    setShowRecallModal(false)
    setReviewComment('')
  }, [reportStatus, rejectReason, recallReason, reviewComment, addOperationLog])

  const handleSubmitForReview = useCallback(() => {
    if (!findings.trim()) {
      alert('请填写检查所见后再提交')
      return
    }
    if (!diagnosis.trim()) {
      alert('请填写诊断意见后再提交')
      return
    }

    const currentUser = MOCK_REVIEW_USERS[2] // 主治医师
    const actionRecord: ReviewAction = {
      id: `review_${Date.now()}`,
      action: 'submit',
      actor: currentUser.name,
      actorTitle: currentUser.title,
      timestamp: formatDateTime(),
    }

    setReviewHistory([actionRecord])
    setReportStatus('pending_review')
    addOperationLog('提交审核', `报告已提交，等待一审`)
    alert('报告已提交，待审核')
  }, [findings, diagnosis, addOperationLog])

  // ----------------------------------------
  // [NEW] 历史对比
  // ----------------------------------------
  const handleSelectHistoryReport = useCallback((report: HistoryReport) => {
    setSelectedHistoryReport(report)
  }, [])

  const handleStartCompare = useCallback(() => {
    if (selectedHistoryReport) {
      setShowCompareView(true)
      addOperationLog('历史对比', `开始与历史报告对比: ${selectedHistoryReport.examDate}`)
    }
  }, [selectedHistoryReport, addOperationLog])

  // ----------------------------------------
  // [NEW] 模板增强
  // ----------------------------------------
  const handleToggleFavorite = useCallback((templateId: string) => {
    setFavoriteTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }, [])

  const handleSelectTemplate = useCallback((template: ReportTemplate) => {
    // 记录最近使用
    setRecentTemplates(prev => {
      const filtered = prev.filter(id => id !== template.id)
      return [template.id, ...filtered].slice(0, 5)
    })

    // 预览模板
    setTemplatePreview({
      id: template.id,
      name: template.name,
      content: template.content || '',
    })
  }, [])

  const handleApplyTemplateWithLog = useCallback((template: ReportTemplate) => {
    handleApplyTemplate(template)
    addOperationLog('模板应用', `应用模板: ${template.name}`)
    setShowTemplateLibrary(false)
    setTemplatePreview(null)
  }, [handleApplyTemplate, addOperationLog])

  // ----------------------------------------
  // [NEW] Diff对比
  // ----------------------------------------
  const handleShowDiff = useCallback((field: string, before: string, after: string) => {
    setDiffData({ field, before, after })
    setShowDiffView(true)
  }, [])

  // ----------------------------------------
  // 处理函数
  // ----------------------------------------

  // 选择检查
  const handleSelectExam = useCallback((examId: string) => {
    setSelectedExamId(examId)
    setShowExamList(false)
    // 重置报告内容
    setFindings('')
    setDiagnosis('')
    setImpressions([''])
    setRecommendations('')
    setReportNotes('')
    setCriticalFinding(false)
    setCriticalDetails('')
    setSelectedTemplateId('')
    setDiagnosisResult('normal')
    setReportDoctorId(doctors[0]?.id || '')
    setSaveSuccess(false)
    setLastSaved(null)
  }, [doctors])

  // 插入短语到当前激活的文本框
  const handleInsertPhrase = useCallback((phrase: string) => {
    if (activeTab === 'findings') {
      setFindings(prev => prev + phrase)
    } else if (activeTab === 'diagnosis') {
      setDiagnosis(prev => prev + phrase)
    } else if (activeTab === 'impression') {
      const lastIdx = impressions.length - 1
      setImpressions(prev => {
        const updated = [...prev]
        updated[lastIdx] = (updated[lastIdx] || '') + phrase
        return updated
      })
    }
  }, [activeTab, impressions])

  // 添加印象行
  const handleAddImpression = useCallback(() => {
    setImpressions(prev => [...prev, ''])
  }, [])

  // 删除印象行
  const handleRemoveImpression = useCallback((index: number) => {
    setImpressions(prev => prev.filter((_, i) => i !== index))
  }, [])

  // 更新印象行
  const handleUpdateImpression = useCallback((index: number, value: string) => {
    setImpressions(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }, [])

  // 应用模板
  const handleApplyTemplate = useCallback((template: ReportTemplate) => {
    // 解析模板内容 - 提取各部分
    const content = template.content || ''
    const sections = content.split('\n\n')

    // 简单处理：假设第一部分是检查所见，最后是结论
    let findingsContent = ''
    let diagnosisContent = ''
    let impressionContent = ''

    sections.forEach(section => {
      if (section.includes('结论')) {
        impressionContent = section.replace(/结论[：:]\s*/g, '')
      } else if (section.length > 20) {
        findingsContent += section + '\n\n'
      } else {
        diagnosisContent += section + '\n'
      }
    })

    if (!impressionContent && content.includes('结论')) {
      const conclusionMatch = content.match(/结论[：:]\s*([\s\S]*?)$/)
      if (conclusionMatch) {
        impressionContent = conclusionMatch[1]
      }
    }

    setFindings(findingsContent.trim())
    setDiagnosis(diagnosisContent.trim())
    setImpressions(impressionContent ? [impressionContent.trim()] : [''])
    setSelectedTemplateId(template.id)
    setShowTemplateModal(false)
  }, [])

  // 保存报告（草稿）
  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSaving(false)
    setSaveSuccess(true)
    setLastSaved(formatDateTime())
  }, [findings, diagnosis, impressions, recommendations, criticalFinding, criticalDetails])

  // 提交报告
  const handleSubmitReport = useCallback(async () => {
    if (!findings.trim()) {
      alert('请填写检查所见')
      return
    }
    if (!diagnosis.trim()) {
      alert('请填写诊断意见')
      return
    }

    setIsSubmitting(true)
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    alert('报告已提交，待审核')
    // 可以在这里重置状态或跳转
  }, [findings, diagnosis, impressions])

  // 打印预览
  const handlePrintPreview = useCallback(() => {
    setShowPrintPreview(true)
  }, [])

  // 导出PDF（模拟）
  const handleExportPdf = useCallback(() => {
    alert('PDF导出功能（模拟）')
  }, [])

  // 复制报告
  const handleCopyReport = useCallback(() => {
    const text = `
检查所见：
${findings}

诊断意见：
${diagnosis}

印象：
${impressions.filter(i => i.trim()).join('\n')}

建议：
${recommendations}
    `.trim()
    navigator.clipboard.writeText(text)
    alert('报告已复制到剪贴板')
  }, [findings, diagnosis, impressions, recommendations])

  // 切换窗宽窗位
  const handleWwlChange = useCallback((preset: typeof WWW_L_PRESETS[0]) => {
    setCurrentWwlPreset(preset)
    setWindowWidth(preset.ww)
    setWindowLevel(preset.wl)
  }, [])

  // ----------------------------------------
  // 渲染：检查列表项
  // ----------------------------------------
  const renderExamItem = (exam: RadiologyExam) => {
    const modalityColor = getModalityColor(exam.modality)
    const modalityBg = getModalityBg(exam.modality)

    return (
      <div
        key={exam.id}
        onClick={() => handleSelectExam(exam.id)}
        style={{
          padding: '12px 14px',
          borderRadius: s.radius,
          marginBottom: 8,
          cursor: 'pointer',
          border: `1px solid ${s.gray200}`,
          background: s.white,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = s.primaryBorder
          ;(e.currentTarget as HTMLDivElement).style.background = s.primaryBg
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = s.shadowCard
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = s.gray200
          ;(e.currentTarget as HTMLDivElement).style.background = s.white
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        {/* 头部：患者名 + 模态 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: s.primary }}>{exam.patientName}</span>
            <span style={{ fontSize: 11, color: s.gray500 }}>{exam.gender}/{exam.age}岁</span>
          </div>
          <Badge bg={modalityBg} color={modalityColor}>{exam.modality}</Badge>
        </div>

        {/* 信息行 */}
        <div style={{ fontSize: 12, color: s.gray600, marginBottom: 4 }}>
          {exam.examItemName} · {exam.deviceName?.split('（')[0]}
        </div>

        {/* 底部信息 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: s.gray400 }}>
            <span style={{ fontFamily: s.fontMono }}>{exam.accessionNumber}</span>
            <span style={{ marginLeft: 8 }}>{exam.examDate}</span>
          </div>
          <Badge
            bg={exam.priority === '危重' ? s.dangerBg : exam.priority === '紧急' ? s.warningBg : s.gray100}
            color={exam.priority === '危重' ? s.danger : exam.priority === '紧急' ? s.warning : s.gray500}
            size="sm"
          >
            {exam.priority}
          </Badge>
        </div>

        {/* 临床信息 */}
        {(exam.clinicalDiagnosis || exam.clinicalHistory) && (
          <div style={{
            marginTop: 6,
            paddingTop: 6,
            borderTop: `1px dashed ${s.gray200}`,
            fontSize: 10,
            color: s.gray500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {exam.clinicalDiagnosis || exam.clinicalHistory}
          </div>
        )}
      </div>
    )
  }

  // ----------------------------------------
  // 渲染：报告书写表单
  // ----------------------------------------
  const renderReportForm = () => {
    if (!selectedExam) return null

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 患者信息头部 */}
        <PatientHeader exam={selectedExam} onClose={() => {
          setSelectedExamId('')
          setShowExamList(true)
        }} />

        {/* [NEW] 多级审核状态栏 */}
        {reportStatus !== 'draft' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            background: reportStatus === 'signed' ? s.successBg : reportStatus === 'rejected' ? s.dangerBg : s.infoBg,
            borderRadius: s.radius,
            border: `1px solid ${reportStatus === 'signed' ? s.successBorder : reportStatus === 'rejected' ? s.dangerBorder : s.infoBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {reportStatus === 'signed' ? (
                <Award size={16} style={{ color: s.success }} />
              ) : reportStatus === 'rejected' ? (
                <ThumbsDown size={16} style={{ color: s.danger }} />
              ) : (
                <Clock size={16} style={{ color: s.info }} />
              )}
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: reportStatus === 'signed' ? s.success : reportStatus === 'rejected' ? s.danger : s.info,
              }}>
                {REVIEW_WORKFLOW_STEPS.find(s => s.id === reportStatus)?.label}
              </span>
            </div>

            {/* 审核进度指示 */}
            <div style={{ display: 'flex', gap: 4, flex: 1 }}>
              {REVIEW_WORKFLOW_STEPS.slice(0, -1).map((step, idx) => {
                const isPast = REVIEW_WORKFLOW_STEPS.findIndex(s => s.id === reportStatus) > idx
                return (
                  <div
                    key={step.id}
                    style={{
                      height: 4,
                      flex: 1,
                      borderRadius: 2,
                      background: isPast ? s.success : s.gray200,
                    }}
                  />
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {reportStatus === 'signed' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Recycle size={12} />}
                  onClick={() => setShowRecallModal(true)}
                  style={{ borderColor: s.warning, color: s.warning }}
                >
                  召回
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon={<History size={12} />}
                onClick={() => setShowReviewModal(true)}
              >
                详情
              </Button>
            </div>
          </div>
        )}

        {/* [NEW] AI辅助面板开关 */}
        {selectedExam && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}>
            <Button
              variant={showAIPanel ? 'primary' : 'outline'}
              size="sm"
              icon={<Sparkles size={12} />}
              onClick={() => setShowAIPanel(!showAIPanel)}
            >
              AI辅助
            </Button>
          </div>
        )}

        {/* 历史报告参考 */}
        {patientHistoryReports.length > 0 && (
          <Card
            title="历史报告参考"
            icon={<Clock size={14} />}
            extra={
              <span style={{ fontSize: 10, color: s.gray400 }}>
                同部位检查 {patientHistoryReports.length} 条
              </span>
            }
          >
            <div style={{ maxHeight: 160, overflowY: 'auto' }}>
              {patientHistoryReports.map(report => (
                <HistoryReportCard key={report.id} report={report} />
              ))}
            </div>
          </Card>
        )}

        {/* 模板选择区 */}
        <Card
          title="报告模板"
          icon={<FileCheck size={14} />}
          extra={
            <Button
              variant="ghost"
              size="sm"
              icon={<LayoutGrid size={12} />}
              onClick={() => setShowTemplateModal(true)}
            >
              全部模板
            </Button>
          }
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {relevantTemplates.slice(0, 6).map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleApplyTemplate(tpl)}
                style={{
                  padding: '6px 12px',
                  borderRadius: s.radius,
                  border: `1px solid ${selectedTemplateId === tpl.id ? s.primaryBorder : s.gray200}`,
                  background: selectedTemplateId === tpl.id ? s.primaryBg : s.white,
                  color: selectedTemplateId === tpl.id ? s.primary : s.gray600,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s',
                }}
              >
                {selectedTemplateId === tpl.id && <Check size={12} />}
                {tpl.name}
              </button>
            ))}
            {relevantTemplates.length === 0 && (
              <div style={{ fontSize: 12, color: s.gray400, padding: 8 }}>
                暂无适用模板
              </div>
            )}
          </div>
        </Card>

        {/* 报告编辑器 */}
        <Card title="报告内容" icon={<Edit3 size={14} />}>
          {/* 标签切换 */}
          <div style={{
            display: 'flex',
            gap: 0,
            marginBottom: 14,
            borderBottom: `2px solid ${s.gray200}`,
          }}>
            {[
              { key: 'findings', label: '检查所见', count: findings.length },
              { key: 'diagnosis', label: '诊断意见', count: diagnosis.length },
              { key: 'impression', label: '印象/结论', count: impressions.join('').length },
              { key: 'info', label: '报告信息', count: 0 },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === key ? s.primary : 'transparent'}`,
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: activeTab === key ? s.primary : s.gray500,
                  marginBottom: -2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {label}
                {count > 0 && (
                  <span style={{
                    fontSize: 10,
                    background: activeTab === key ? s.primaryBg : s.gray100,
                    color: activeTab === key ? s.primary : s.gray400,
                    padding: '1px 5px',
                    borderRadius: 10,
                  }}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 检查所见 */}
          {activeTab === 'findings' && (
            <div>
              {/* 常用短语工具栏 */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 6 }}>
                  常用描述短语
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {relevantPhrases.map(({ label, phrase }) => (
                    <button
                      key={label}
                      onClick={() => handleInsertPhrase(phrase)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: s.radiusSm,
                        border: `1px solid ${s.gray200}`,
                        background: s.gray50,
                        color: s.gray600,
                        fontSize: 11,
                        cursor: 'pointer',
                        transition: 'all 0.1s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = s.primaryBorder
                        ;(e.currentTarget as HTMLButtonElement).style.background = s.primaryBg
                        ;(e.currentTarget as HTMLButtonElement).style.color = s.primary
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = s.gray200
                        ;(e.currentTarget as HTMLButtonElement).style.background = s.gray50
                        ;(e.currentTarget as HTMLButtonElement).style.color = s.gray600
                      }}
                    >
                      + {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 文本框 */}
              <textarea
                value={findings}
                onChange={e => setFindings(e.target.value)}
                placeholder="【检查所见】&#10;&#10;请在此处详细描述影像所见，包括：&#10;• 扫描范围及技术参数&#10;• 各脏器/组织密度/信号描述&#10;• 发现病变的部位、大小、形态、边界、密度/信号特征&#10;• 与周围组织的关系&#10;• ..."

                style={{
                  width: '100%',
                  minHeight: 200,
                  border: `1px solid ${s.gray200}`,
                  borderRadius: s.radius,
                  padding: '12px 14px',
                  fontSize: 13,
                  lineHeight: 1.8,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  color: s.gray700,
                }}
                onFocus={e => {
                  e.target.style.borderColor = s.primaryBorder
                  e.target.style.boxShadow = `0 0 0 3px ${s.primaryBg}`
                }}
                onBlur={e => {
                  e.target.style.borderColor = s.gray200
                  e.target.style.boxShadow = 'none'
                }}
              />

              {/* 底部工具栏 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Copy size={12} />}
                    onClick={() => {
                      navigator.clipboard.writeText(findings)
                    }}
                  >
                    复制
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={12} />}
                    onClick={() => setFindings('')}
                  >
                    清空
                  </Button>
                </div>
                <div style={{ fontSize: 11, color: s.gray400 }}>
                  {findings.length} 字符
                </div>
              </div>
            </div>
          )}

          {/* 诊断意见 */}
          {activeTab === 'diagnosis' && (
            <div>
              {/* 诊断结果选择 */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 8 }}>
                  诊断结果
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {DIAGNOSIS_RESULT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDiagnosisResult(opt.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: s.radius,
                        border: `1px solid ${diagnosisResult === opt.value ? opt.color : s.gray200}`,
                        background: diagnosisResult === opt.value ? `${opt.color}15` : s.white,
                        color: diagnosisResult === opt.value ? opt.color : s.gray500,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.15s',
                      }}
                    >
                      {diagnosisResult === opt.value && (
                        <Check size={12} style={{ color: opt.color }} />
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 常用诊断短语 */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 6 }}>
                  常用诊断短语
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DIAGNOSIS_PHRASES.map(({ label, phrase }) => (
                    <button
                      key={label}
                      onClick={() => handleInsertPhrase(phrase)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: s.radiusSm,
                        border: `1px solid ${s.gray200}`,
                        background: s.gray50,
                        color: s.gray600,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      + {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 文本框 */}
              <textarea
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="【诊断意见】&#10;&#10;请在此处填写诊断结论：&#10;• 明确诊断&#10;• 疑似诊断（请注明不能明确的原因）&#10;• 鉴别诊断（必要时）"

                style={{
                  width: '100%',
                  minHeight: 160,
                  border: `1px solid ${s.gray200}`,
                  borderRadius: s.radius,
                  padding: '12px 14px',
                  fontSize: 13,
                  lineHeight: 1.8,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  color: s.gray700,
                }}
                onFocus={e => {
                  e.target.style.borderColor = s.primaryBorder
                  e.target.style.boxShadow = `0 0 0 3px ${s.primaryBg}`
                }}
                onBlur={e => {
                  e.target.style.borderColor = s.gray200
                  e.target.style.boxShadow = 'none'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={12} />}
                    onClick={() => setDiagnosis('')}
                  >
                    清空
                  </Button>
                </div>
                <div style={{ fontSize: 11, color: s.gray400 }}>
                  {diagnosis.length} 字符
                </div>
              </div>
            </div>
          )}

          {/* 印象/结论 */}
          {activeTab === 'impression' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 8 }}>
                检查印象/结论（可添加多条，按优先级排序）
              </div>

              {/* 印象列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {impressions.map((imp, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: s.primary,
                      color: s.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: 6,
                    }}>
                      {idx + 1}
                    </div>
                    <textarea
                      value={imp}
                      onChange={e => handleUpdateImpression(idx, e.target.value)}
                      placeholder={`印象 ${idx + 1}...`}
                      style={{
                        flex: 1,
                        minHeight: 60,
                        border: `1px solid ${s.gray200}`,
                        borderRadius: s.radius,
                        padding: '8px 12px',
                        fontSize: 13,
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'inherit',
                        color: s.gray700,
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = s.primaryBorder
                        e.target.style.boxShadow = `0 0 0 3px ${s.primaryBg}`
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = s.gray200
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                    {impressions.length > 1 && (
                      <button
                        onClick={() => handleRemoveImpression(idx)}
                        style={{
                          border: 'none',
                          background: s.dangerBg,
                          color: s.danger,
                          borderRadius: s.radius,
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          marginTop: 6,
                        }}
                      >
                        <Minus size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 添加按钮 */}
              <button
                onClick={handleAddImpression}
                style={{
                  marginTop: 10,
                  padding: '8px 14px',
                  borderRadius: s.radius,
                  border: `1px dashed ${s.gray300}`,
                  background: s.gray50,
                  color: s.gray500,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Plus size={14} /> 添加印象
              </button>

              {/* 建议 */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 8 }}>
                  建议
                </div>
                <textarea
                  value={recommendations}
                  onChange={e => setRecommendations(e.target.value)}
                  placeholder="填写检查建议，如：&#10;• 建议定期随访复查&#10;• 建议进一步行增强扫描&#10;• 建议专科就诊"

                  style={{
                    width: '100%',
                    minHeight: 80,
                    border: `1px solid ${s.gray200}`,
                    borderRadius: s.radius,
                    padding: '10px 12px',
                    fontSize: 13,
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: s.gray700,
                  }}
                />
              </div>
            </div>
          )}

          {/* 报告信息 */}
          {activeTab === 'info' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* 报告医生 */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                    报告医生
                  </label>
                  <select
                    value={reportDoctorId}
                    onChange={e => setReportDoctorId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radius,
                      fontSize: 13,
                      background: s.white,
                      color: s.gray700,
                      cursor: 'pointer',
                    }}
                  >
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}（{doc.title}）
                      </option>
                    ))}
                  </select>
                </div>

                {/* 审核医生 */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                    审核医生
                  </label>
                  <select
                    value={auditorId}
                    onChange={e => setAuditorId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radius,
                      fontSize: 13,
                      background: s.white,
                      color: s.gray700,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">待审核</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}（{doc.title}）
                      </option>
                    ))}
                  </select>
                </div>

                {/* 报告日期时间 */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                    报告日期时间
                  </label>
                  <input
                    type="datetime-local"
                    value={reportDateTime.replace(/\//g, '-')}
                    onChange={e => setReportDateTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radius,
                      fontSize: 13,
                      color: s.gray700,
                    }}
                  />
                </div>

                {/* 报告备注 */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                    报告备注
                  </label>
                  <textarea
                    value={reportNotes}
                    onChange={e => setReportNotes(e.target.value)}
                    placeholder="填写补充说明，如：检查局限性、患者配合情况等..."

                    style={{
                      width: '100%',
                      minHeight: 60,
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radius,
                      padding: '8px 12px',
                      fontSize: 13,
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit',
                      color: s.gray700,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* 危急值标注 */}
        <Card
          title="危急值标注"
          icon={<ShieldAlert size={14} />}
          style={{
            border: criticalFinding ? `1px solid ${s.dangerBorder}` : undefined,
            background: criticalFinding ? s.dangerBg : undefined,
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: criticalFinding ? 12 : 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} style={{ color: s.danger }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: s.danger }}>
                发现危急值
              </span>
            </div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: 12, color: s.gray500 }}>
                {criticalFinding ? '已启用' : '未启用'}
              </span>
              <div
                onClick={() => setCriticalFinding(!criticalFinding)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: criticalFinding ? s.danger : s.gray300,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: s.white,
                  position: 'absolute',
                  top: 2,
                  left: criticalFinding ? 22 : 2,
                  transition: 'all 0.2s',
                  boxShadow: s.shadow,
                }} />
              </div>
            </label>
          </div>

          {criticalFinding && (
            <div>
              {/* 危急值详情 */}
              <textarea
                value={criticalDetails}
                onChange={e => setCriticalDetails(e.target.value)}
                placeholder="请详细描述危急值情况，包括：&#10;• 病变描述&#10;• 严重程度&#10;• 建议处理措施..."

                style={{
                  width: '100%',
                  minHeight: 80,
                  border: `1px solid ${s.dangerBorder}`,
                  borderRadius: s.radius,
                  padding: '10px 12px',
                  fontSize: 13,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  color: s.gray700,
                  background: s.white,
                }}
              />

              {/* 常用危急值词条 */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.danger, marginBottom: 6 }}>
                  常用危急值描述
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CRITICAL_TERMS.map(term => (
                    <button
                      key={term}
                      onClick={() => setCriticalDetails(prev => prev + (prev ? '\n' : '') + term)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: s.radiusSm,
                        border: `1px solid ${s.dangerBorder}`,
                        background: '#fee2e2',
                        color: s.danger,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      + {term.slice(0, 10)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 提示 */}
              <div style={{
                marginTop: 12,
                padding: '8px 12px',
                background: '#fef2f2',
                borderRadius: s.radius,
                fontSize: 11,
                color: s.danger,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <Info size={12} />
                勾选危急值后，系统将自动通知临床医生和相关部门
              </div>
            </div>
          )}
        </Card>

        {/* 操作按钮区 */}
        <div style={{
          background: s.white,
          borderRadius: s.radiusLg,
          border: `1px solid ${s.gray200}`,
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: s.shadowCard,
        }}>
          {/* 左侧状态 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {saveSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: s.success,
                fontSize: 12,
              }}>
                <CheckCircle size={14} />
                <span>已保存 {lastSaved}</span>
              </div>
            )}
          </div>

          {/* 右侧按钮 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="outline"
              size="md"
              icon={<Printer size={14} />}
              onClick={handlePrintPreview}
            >
              打印预览
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<Download size={14} />}
              onClick={handleExportPdf}
            >
              导出PDF
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              保存草稿
            </Button>
            <Button
              variant="success"
              size="md"
              icon={isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              onClick={handleSubmitReport}
              disabled={isSubmitting}
            >
              提交审核
            </Button>
            {/* [NEW] 一键启用AI辅助 */}
            {!showAIPanel && (
              <Button
                variant="outline"
                size="md"
                icon={<Sparkles size={14} />}
                onClick={() => setShowAIPanel(true)}
              >
                AI辅助
              </Button>
            )}
          </div>

          {/* [NEW] 快捷操作工具栏 */}
          <div style={{
            display: 'flex',
            gap: 6,
            paddingTop: 10,
            borderTop: `1px solid ${s.gray200}`,
            marginTop: 10,
            flexWrap: 'wrap',
          }}>
            <Button
              variant="ghost"
              size="sm"
              icon={<GitCompare size={12} />}
              onClick={() => setShowHistoryPanel(true)}
              disabled={historyReports.length === 0}
            >
              历史对比
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Target size={12} />}
              onClick={() => setShowFindingLibrary(true)}
            >
              典型征象
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<History size={12} />}
              onClick={() => setShowOperationLog(true)}
              disabled={operationLogs.length === 0}
            >
              操作记录
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Mic size={12} />}
              onClick={startVoiceInput}
              disabled={!voiceSupported || isRecording}
            >
              语音录入
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------
  // 渲染：右侧面板 - 图像预览 + AI辅助
  // ----------------------------------------
  const renderRightPanel = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* [NEW] AI辅助面板 - 可折叠 */}
        {showAIPanel && selectedExam && (
          <Card
            title="AI报告辅助"
            icon={<Sparkles size={14} />}
            extra={
              <div style={{ display: 'flex', gap: 4 }}>
                <Badge
                  bg={reportQuality.score >= 80 ? s.successBg : reportQuality.score >= 60 ? s.warningBg : s.dangerBg}
                  color={reportQuality.score >= 80 ? s.success : reportQuality.score >= 60 ? s.warning : s.danger}
                >
                  质量 {reportQuality.score}%
                </Badge>
                <button
                  onClick={() => setShowAIPanel(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: s.gray400,
                    display: 'flex',
                    padding: 2,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            }
          >
            {/* 报告质量评分 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.gray600 }}>报告完整度</span>
                <span style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: reportQuality.score >= 80 ? s.success : reportQuality.score >= 60 ? s.warning : s.danger
                }}>
                  {reportQuality.score}%
                </span>
              </div>
              {/* 质量进度条 */}
              <div style={{
                height: 6,
                background: s.gray200,
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${reportQuality.score}%`,
                  background: reportQuality.score >= 80 ? s.success : reportQuality.score >= 60 ? s.warning : s.danger,
                  transition: 'all 0.3s',
                }} />
              </div>
              {/* 缺失项提醒 */}
              {reportQuality.failed.filter(f => f.required).length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: s.danger, fontWeight: 600, marginBottom: 4 }}>
                    <AlertCircle size={10} style={{ marginRight: 4 }} />
                    缺失项（必填）
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {reportQuality.failed.filter(f => f.required).map((item, idx) => (
                      <span key={idx} style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        background: s.dangerBg,
                        color: s.danger,
                        borderRadius: s.radiusSm,
                      }}>
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI推荐所见 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.gray600 }}>推荐所见</span>
                <span style={{ fontSize: 10, color: s.gray400 }}>
                  {aiSuggestions.findings.length} 条
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {aiSuggestions.findings.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 10px',
                      background: s.gray50,
                      borderRadius: s.radius,
                      border: `1px solid ${s.gray200}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = s.primaryBorder
                      ;(e.currentTarget as HTMLDivElement).style.background = s.primaryBg
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = s.gray200
                      ;(e.currentTarget as HTMLDivElement).style.background = s.gray50
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: s.primary, fontWeight: 600, flex: 1 }}>
                        {item.content.slice(0, 50)}...
                      </span>
                      <button
                        onClick={() => handleAcceptAISuggestion('finding', item.content)}
                        style={{
                          border: 'none',
                          background: s.primary,
                          color: s.white,
                          borderRadius: s.radiusSm,
                          padding: '2px 8px',
                          fontSize: 10,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                      >
                        <Plus size={10} /> 采纳
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 10, color: s.gray400 }}>
                      <span>置信度: {item.confidence}%</span>
                      <span>来源: {item.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI推荐结论 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.gray600 }}>推荐结论</span>
                <span style={{ fontSize: 10, color: s.gray400 }}>
                  {aiSuggestions.conclusions.length} 条
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {aiSuggestions.conclusions.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 10px',
                      background: s.successBg,
                      borderRadius: s.radius,
                      border: `1px solid ${s.successBorder}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = s.success
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = s.successBorder
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: s.success, fontWeight: 600, flex: 1 }}>
                        {item.content.slice(0, 40)}...
                      </span>
                      <button
                        onClick={() => handleAcceptAISuggestion('conclusion', item.content)}
                        style={{
                          border: 'none',
                          background: s.success,
                          color: s.white,
                          borderRadius: s.radiusSm,
                          padding: '2px 8px',
                          fontSize: 10,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                      >
                        <Plus size={10} /> 采纳
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 10, color: s.gray500 }}>
                      <span>置信度: {item.confidence}%</span>
                      <span>适用: {item.typicalFor.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 完整性检查 */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.gray600 }}>完整性检查</span>
                <span style={{ fontSize: 10, color: s.gray400 }}>
                  {reportQuality.passed.length}/{REPORT_QUALITY_CHECKPOINTS.length} 通过
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {REPORT_QUALITY_CHECKPOINTS.slice(0, 6).map((checkpoint, idx) => {
                  const isPassed = reportQuality.passed.includes(checkpoint.label)
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isPassed ? (
                        <CheckCircle size={12} style={{ color: s.success }} />
                      ) : (
                        <AlertCircle size={12} style={{ color: checkpoint.required ? s.danger : s.gray400 }} />
                      )}
                      <span style={{
                        fontSize: 11,
                        color: isPassed ? s.gray600 : (checkpoint.required ? s.danger : s.gray400),
                      }}>
                        {checkpoint.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        )}

        {/* [NEW] 语音录入悬浮工具栏 */}
        {selectedExam && (
          <Card noPadding style={{ overflow: 'visible' }}>
            <div style={{
              padding: '10px 14px',
              background: isRecording ? s.dangerBg : s.gray50,
              borderRadius: s.radiusLg,
              border: isRecording ? `2px solid ${s.danger}` : `1px solid ${s.gray200}`,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isRecording ? 8 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* 录音状态指示 */}
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: isRecording ? s.danger : s.gray300,
                    animation: isRecording ? 'pulse 1s infinite' : 'none',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: isRecording ? s.danger : s.gray600 }}>
                    {isRecording ? '正在录音...' : '语音录入'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {voiceSupported ? (
                    isRecording ? (
                      <button
                        onClick={stopVoiceInput}
                        style={{
                          border: 'none',
                          background: s.danger,
                          color: s.white,
                          borderRadius: s.radius,
                          padding: '4px 12px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <MicOff size={12} /> 停止
                      </button>
                    ) : (
                      <button
                        onClick={startVoiceInput}
                        style={{
                          border: 'none',
                          background: s.primary,
                          color: s.white,
                          borderRadius: s.radius,
                          padding: '4px 12px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Mic size={12} /> 开始
                      </button>
                    )
                  ) : (
                    <span style={{ fontSize: 10, color: s.gray400 }}>浏览器不支持</span>
                  )}
                  <button
                    onClick={() => setVoiceSettings(prev => ({ ...prev, continuous: !prev.continuous }))}
                    style={{
                      border: 'none',
                      background: voiceSettings.continuous ? s.primaryBg : 'transparent',
                      color: voiceSettings.continuous ? s.primary : s.gray400,
                      borderRadius: s.radiusSm,
                      padding: '4px 8px',
                      fontSize: 10,
                      cursor: 'pointer',
                    }}
                    title="连续识别"
                  >
                    <RefreshCw size={10} />
                  </button>
                </div>
              </div>

              {/* 录音中的实时转写 */}
              {isRecording && voiceText && (
                <div style={{
                  padding: '8px 10px',
                  background: s.white,
                  borderRadius: s.radius,
                  fontSize: 11,
                  color: s.gray700,
                  marginBottom: 8,
                  maxHeight: 60,
                  overflow: 'auto',
                }}>
                  {voiceText}
                </div>
              )}

              {/* 语音录入目标字段 */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  { key: 'findings', label: '所见' },
                  { key: 'diagnosis', label: '诊断' },
                  { key: 'impression', label: '印象' },
                  { key: 'recommendations', label: '建议' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setVoiceActiveField(key as typeof voiceActiveField)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: s.radiusSm,
                      border: `1px solid ${voiceActiveField === key ? s.primary : s.gray200}`,
                      background: voiceActiveField === key ? s.primaryBg : s.white,
                      color: voiceActiveField === key ? s.primary : s.gray500,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 语音命令提示 */}
              {isRecording && (
                <div style={{ marginTop: 8, fontSize: 10, color: s.gray400 }}>
                  <span>语音命令：</span>
                  {Object.keys(VOICE_COMMANDS).slice(0, 4).map(cmd => (
                    <span key={cmd} style={{ marginLeft: 8 }}>"{cmd}"</span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* [NEW] 历史对比入口 */}
        {selectedExam && historyReports.length > 0 && (
          <Card
            title="历史对比"
            icon={<GitCompare size={14} />}
            extra={
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight size={12} />}
                onClick={() => setShowHistoryPanel(true)}
              >
                查看全部
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {historyReports.slice(0, 2).map(report => (
                <div
                  key={report.id}
                  style={{
                    padding: '10px 12px',
                    background: s.gray50,
                    borderRadius: s.radius,
                    border: `1px solid ${s.gray200}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSelectedHistoryReport(report)
                    setShowCompareView(true)
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = s.primaryBorder
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = s.gray200
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: s.primary }}>{report.examDate}</span>
                    <span style={{ fontSize: 10, color: s.gray400 }}>{report.modality}</span>
                  </div>
                  <div style={{ fontSize: 11, color: s.gray600 }}>{report.findings.slice(0, 60)}...</div>
                  <div style={{ fontSize: 10, color: s.gray400, marginTop: 4 }}>
                    vs 当前报告 · 点击对比
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* [NEW] 典型征象库入口 */}
        {selectedExam && (
          <Card
            title="典型征象"
            icon={<Target size={14} />}
            extra={
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight size={12} />}
                onClick={() => setShowFindingLibrary(true)}
              >
                打开
              </Button>
            }
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TYPICAL_FINDINGS
                .filter(f => f.modality === selectedExam.modality)
                .slice(0, 6)
                .map(finding => (
                  <button
                    key={finding.id}
                    onClick={() => handleInsertTypicalFinding(finding)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: s.radiusSm,
                      border: `1px solid ${s.gray200}`,
                      background: s.gray50,
                      color: s.gray600,
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = s.primaryBorder
                      ;(e.currentTarget as HTMLButtonElement).style.background = s.primaryBg
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = s.gray200
                      ;(e.currentTarget as HTMLButtonElement).style.background = s.gray50
                    }}
                  >
                    <Plus size={10} />
                    {finding.name.slice(0, 8)}
                  </button>
                ))}
            </div>
          </Card>
        )}

        {/* [NEW] 操作日志入口 */}
        {selectedExam && operationLogs.length > 0 && (
          <Card
            title="操作记录"
            icon={<History size={14} />}
            extra={
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight size={12} />}
                onClick={() => setShowOperationLog(true)}
              >
                {operationLogs.length} 条
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {operationLogs.slice(0, 3).map(log => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={10} style={{ color: s.gray400 }} />
                  <span style={{ fontSize: 10, color: s.gray500 }}>{log.timestamp}</span>
                  <span style={{ fontSize: 11, color: s.gray600 }}>{log.action}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 图像预览区 */}
        <Card
          title="图像预览"
          icon={<Image size={14} />}
          extra={
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                style={{
                  border: 'none',
                  background: s.gray100,
                  borderRadius: s.radiusSm,
                  padding: '3px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ZoomOut size={12} />
              </button>
              <span style={{ fontSize: 11, padding: '3px 6px', color: s.gray500 }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                style={{
                  border: 'none',
                  background: s.gray100,
                  borderRadius: s.radiusSm,
                  padding: '3px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ZoomIn size={12} />
              </button>
              <button
                onClick={() => setShowImageViewer(true)}
                style={{
                  border: 'none',
                  background: s.primaryBg,
                  borderRadius: s.radiusSm,
                  padding: '3px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: s.primary,
                }}
              >
                <Maximize2 size={12} />
              </button>
            </div>
          }
        >
          {/* 窗宽窗位预设 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 6 }}>
              窗宽/窗位
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {WWWL_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleWwlChange(preset)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: s.radiusSm,
                    border: `1px solid ${currentWwlPreset.label === preset.label ? preset.color : s.gray200}`,
                    background: currentWwlPreset.label === preset.label ? `${preset.color}15` : s.white,
                    color: currentWwlPreset.label === preset.label ? preset.color : s.gray600,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: s.gray400, marginTop: 4 }}>
              WW: {windowWidth} / WL: {windowLevel}
            </div>
          </div>

          {/* 主图像区 */}
          <div
            style={{
              width: '100%',
              aspectRatio: '4/3',
              background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
              borderRadius: s.radius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => setShowImageViewer(true)}
          >
            {/* DICOM模拟图像 */}
            <div style={{
              width: '80%',
              height: '80%',
              background: `repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.03) 0px,
                rgba(255,255,255,0.03) 1px,
                transparent 1px,
                transparent ${20 * zoomLevel}px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(255,255,255,0.03) 0px,
                rgba(255,255,255,0.03) 1px,
                transparent 1px,
                transparent ${20 * zoomLevel}px
              )`,
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: s.radiusSm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {/* 模拟CT切片图像 */}
              <svg width="100%" height="100%" viewBox="0 0 200 150" style={{ opacity: 0.7 }}>
                <ellipse cx="100" cy="75" rx="70" ry="60" fill="#4a4a6a" />
                <ellipse cx="100" cy="75" rx="50" ry="45" fill="#3a3a5a" />
                <ellipse cx="85" cy="65" rx="8" ry="10" fill="#2a2a4a" />
                <ellipse cx="115" cy="65" rx="8" ry="10" fill="#2a2a4a" />
                <ellipse cx="100" cy="85" rx="15" ry="10" fill="#5a5a7a" />
              </svg>

              {/* 角标 */}
              <div style={{
                position: 'absolute',
                top: 8,
                left: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                CT: {selectedExam?.modality || 'CT'}
              </div>
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                W: {windowWidth} L: {windowLevel}
              </div>
              <div style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                {selectedExam?.accessionNumber || 'N/A'}
              </div>
              <div style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                {selectedImageIndex + 1}/{imageCount}
              </div>
            </div>
          </div>

          {/* 缩略图列表 */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.gray500, marginBottom: 6 }}>
              序列缩略图 ({imageCount > 0 ? imageCount : '无'} 幅)
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {imageCount > 0 ? (
                Array.from({ length: Math.min(imageCount, 8) }).map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: 56,
                      height: 44,
                      flexShrink: 0,
                      background: `linear-gradient(135deg, #2a2a4a, #3a3a6a)`,
                      borderRadius: s.radiusSm,
                      border: `2px solid ${selectedImageIndex === idx ? s.primary : 'transparent'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: s.fontMono,
                    }}
                  >
                    {idx + 1}
                  </div>
                ))
              ) : (
                <div style={{
                  width: '100%',
                  padding: 20,
                  textAlign: 'center',
                  color: s.gray400,
                  fontSize: 12,
                  background: s.gray50,
                  borderRadius: s.radius,
                }}>
                  暂无图像
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 参考图像区 */}
        <Card
          title="参考图像"
          icon={<FolderOpen size={14} />}
        >
          {/* 标签切换 */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 12,
            borderBottom: `1px solid ${s.gray200}`,
          }}>
            <button
              onClick={() => setRefTab('typical')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderBottom: `2px solid ${refTab === 'typical' ? s.primary : 'transparent'}`,
                background: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: refTab === 'typical' ? s.primary : s.gray500,
              }}
            >
              典型病例
            </button>
            <button
              onClick={() => setRefTab('history')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderBottom: `2px solid ${refTab === 'history' ? s.primary : 'transparent'}`,
                background: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: refTab === 'history' ? s.primary : s.gray500,
              }}
            >
              历史图像
            </button>
          </div>

          {refTab === 'typical' && (
            <div style={{
              height: 140,
              background: s.gray50,
              borderRadius: s.radius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 8,
            }}>
              <Activity size={24} style={{ color: s.gray300 }} />
              <span style={{ fontSize: 11, color: s.gray400 }}>
                同部位典型病例参考图
              </span>
              <span style={{ fontSize: 10, color: s.gray300 }}>
                接入影像云后可查看
              </span>
            </div>
          )}

          {refTab === 'history' && (
            <div style={{
              height: 140,
              background: s.gray50,
              borderRadius: s.radius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 8,
            }}>
              <Clock size={24} style={{ color: s.gray300 }} />
              <span style={{ fontSize: 11, color: s.gray400 }}>
                该患者历史检查图像
              </span>
              <span style={{ fontSize: 10, color: s.gray300 }}>
                {patientHistoryReports.length > 0 ? `${patientHistoryReports.length} 条历史记录` : '暂无历史图像'}
              </span>
            </div>
          )}
        </Card>

        {/* 模板选择区 */}
        <Card
          title="快速模板"
          icon={<FileText size={14} />}
          extra={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplateModal(true)}
            >
              全部
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TEMPLATE_CATEGORIES.filter(t => !selectedExam || t.modality === selectedExam.modality).slice(0, 8).map(tpl => {
              const Icon = tpl.icon
              return (
                <button
                  key={tpl.label}
                  onClick={() => {
                    const found = templates.find(t =>
                      t.modality === tpl.modality &&
                      (t.bodyPart === tpl.bodyPart || !t.bodyPart)
                    )
                    if (found) handleApplyTemplate(found)
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: s.radius,
                    border: `1px solid ${s.gray200}`,
                    background: s.white,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = tpl.color
                    ;(e.currentTarget as HTMLButtonElement).style.background = `${tpl.color}08`
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = s.gray200
                    ;(e.currentTarget as HTMLButtonElement).style.background = s.white
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: s.radiusSm,
                    background: `${tpl.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={14} style={{ color: tpl.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.gray700 }}>{tpl.label}</div>
                    <div style={{ fontSize: 10, color: s.gray400 }}>{tpl.modality} · {tpl.bodyPart}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* 词库快捷 */}
        {showTermLib && (
          <Card
            title="报告词库"
            icon={<BookOpen size={14} />}
            extra={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTermLib(false)}
              >
                <X size={12} />
              </Button>
            }
          >
            <Input
              value={termSearch}
              onChange={setTermSearch}
              placeholder="搜索词条..."
              icon={<Search size={12} />}
              style={{ marginBottom: 10 }}
            />
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {filteredTerms.map(term => (
                <div
                  key={term.id}
                  onClick={() => handleInsertPhrase(term.typicalFindings || term.fullTerm)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: s.radius,
                    marginBottom: 4,
                    cursor: 'pointer',
                    border: `1px solid ${s.gray200}`,
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = s.primaryBorder
                    ;(e.currentTarget as HTMLDivElement).style.background = s.primaryBg
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = s.gray200
                    ;(e.currentTarget as HTMLDivElement).style.background = s.white
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: s.primary }}>{term.fullTerm}</div>
                  <div style={{ fontSize: 10, color: s.gray400, marginTop: 2 }}>{term.typicalDiagnosis || term.category}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    )
  }

  // ----------------------------------------
  // 渲染：模板选择模态框
  // ----------------------------------------
  const renderTemplateModal = () => {
    return (
      <Modal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="选择报告模板"
        width={700}
      >
        {/* 分类筛选 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶'].map(mod => (
              <button
                key={mod}
                onClick={() => setModalityFilter(mod === 'all' ? 'all' : mod)}
                style={{
                  padding: '6px 14px',
                  borderRadius: s.radius,
                  border: `1px solid ${modalityFilter === mod ? s.primaryBorder : s.gray200}`,
                  background: modalityFilter === mod ? s.primaryBg : s.white,
                  color: modalityFilter === mod ? s.primary : s.gray600,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {mod === 'all' ? '全部' : mod}
              </button>
            ))}
          </div>
        </div>

        {/* 模板列表 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          maxHeight: 400,
          overflowY: 'auto',
        }}>
          {templates
            .filter(t => modalityFilter === 'all' || t.modality === modalityFilter)
            .map(tpl => {
              const tplCategory = TEMPLATE_CATEGORIES.find(
                tc => tc.modality === tpl.modality && tc.bodyPart === tpl.bodyPart
              )
              const color = tplCategory?.color || s.gray500

              return (
                <div
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: s.radius,
                    border: `1px solid ${selectedTemplateId === tpl.id ? color : s.gray200}`,
                    background: selectedTemplateId === tpl.id ? `${color}08` : s.white,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (selectedTemplateId !== tpl.id) {
                      (e.currentTarget as HTMLDivElement).style.borderColor = s.primaryBorder
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedTemplateId !== tpl.id) {
                      (e.currentTarget as HTMLDivElement).style.borderColor = s.gray200
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.primary }}>{tpl.name}</span>
                    <Badge bg={getModalityBg(tpl.modality)} color={getModalityColor(tpl.modality)}>
                      {tpl.modality}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 11, color: s.gray500 }}>
                    {tpl.bodyPart} · {tpl.category}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: s.gray400,
                    marginTop: 6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {tpl.content?.slice(0, 60)}...
                  </div>
                </div>
              )
            })}
        </div>
      </Modal>
    )
  }

  // ----------------------------------------
  // 渲染：打印预览模态框
  // ----------------------------------------
  const renderPrintPreview = () => {
    if (!selectedExam) return null

    const currentDoctor = doctors.find(d => d.id === reportDoctorId)

    return (
      <Modal
        open={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title="打印预览"
        width={700}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPrintPreview(false)}>
              关闭
            </Button>
            <Button variant="primary" icon={<Printer size={14} />} onClick={() => window.print()}>
              打印
            </Button>
          </>
        }
      >
        {/* 打印内容 */}
        <div style={{
          background: s.white,
          padding: 32,
          fontFamily: 'SimSun, "宋体", serif',
          fontSize: 14,
          lineHeight: 1.8,
          color: '#000',
        }}>
          {/* 报告标题 */}
          <div style={{
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
            color: s.primary,
          }}>
            放射科检查报告
          </div>

          {/* 患者信息 */}
          <div style={{
            border: '1px solid #000',
            padding: 12,
            marginBottom: 16,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>姓名：</span>
                {selectedExam.patientName}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>性别：</span>
                {selectedExam.gender}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>年龄：</span>
                {selectedExam.age}岁
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>类型：</span>
                {selectedExam.patientType}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 8 }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>检查项目：</span>
                {selectedExam.examItemName}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>检查日期：</span>
                {selectedExam.examDate}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontWeight: 'bold' }}>临床诊断：</span>
              {selectedExam.clinicalDiagnosis || '-'}
            </div>
          </div>

          {/* 检查所见 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 15,
              marginBottom: 8,
              borderBottom: '1px solid #000',
              paddingBottom: 4,
            }}>
              检查所见：
            </div>
            <div style={{ whiteSpace: 'pre-wrap', textIndent: '2em' }}>
              {findings || '（未填写）'}
            </div>
          </div>

          {/* 诊断意见 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 15,
              marginBottom: 8,
              borderBottom: '1px solid #000',
              paddingBottom: 4,
            }}>
              诊断意见：
            </div>
            <div style={{ whiteSpace: 'pre-wrap', textIndent: '2em' }}>
              {diagnosis || '（未填写）'}
            </div>
          </div>

          {/* 印象 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 15,
              marginBottom: 8,
              borderBottom: '1px solid #000',
              paddingBottom: 4,
            }}>
              印象：
            </div>
            <div style={{ whiteSpace: 'pre-wrap', textIndent: '2em' }}>
              {impressions.filter(i => i.trim()).join('\n') || '（未填写）'}
            </div>
          </div>

          {/* 建议 */}
          {recommendations && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontWeight: 'bold',
                fontSize: 15,
                marginBottom: 8,
                borderBottom: '1px solid #000',
                paddingBottom: 4,
              }}>
                建议：
              </div>
              <div style={{ whiteSpace: 'pre-wrap', textIndent: '2em' }}>
                {recommendations}
              </div>
            </div>
          )}

          {/* 签名区 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 32,
            paddingTop: 16,
            borderTop: '1px solid #ccc',
          }}>
            <div>
              <div>报告医生：{currentDoctor?.name || '-'}</div>
              <div style={{ marginTop: 8 }}>报告日期：{reportDateTime}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>审核医生：{auditorId ? doctors.find(d => d.id === auditorId)?.name : '-'}</div>
              <div style={{ marginTop: 8 }}>打印时间：{formatDateTime()}</div>
            </div>
          </div>

          {/* 危急值提示 */}
          {criticalFinding && (
            <div style={{
              marginTop: 20,
              padding: 12,
              background: '#fff0f0',
              border: '2px solid #dc2626',
              borderRadius: 4,
            }}>
              <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: 4 }}>
                ⚠️ 危急值通知
              </div>
              <div>{criticalDetails}</div>
            </div>
          )}
        </div>
      </Modal>
    )
  }

  // ----------------------------------------
  // 渲染：图像查看器模态框
  // ----------------------------------------
  const renderImageViewer = () => {
    if (!showImageViewer || !selectedExam) return null

    return (
      <Modal
        open={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        title={`图像查看 - ${selectedExam.examItemName}`}
        width={900}
      >
        <div>
          {/* 工具栏 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            padding: '8px 12px',
            background: s.gray50,
            borderRadius: s.radius,
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {WWWL_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleWwlChange(preset)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: s.radiusSm,
                    border: `1px solid ${currentWwlPreset.label === preset.label ? preset.color : s.gray200}`,
                    background: currentWwlPreset.label === preset.label ? `${preset.color}15` : s.white,
                    color: currentWwlPreset.label === preset.label ? preset.color : s.gray600,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: s.gray500 }}>
                WW: {windowWidth} | WL: {windowLevel}
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw size={12} />}
                onClick={() => setZoomLevel(1)}
              >
                重置
              </Button>
            </div>
          </div>

          {/* 主图像 */}
          <div
            style={{
              width: '100%',
              aspectRatio: '4/3',
              background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
              borderRadius: s.radius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              width: '90%',
              height: '90%',
              background: `repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.03) 0px,
                rgba(255,255,255,0.03) 1px,
                transparent 1px,
                transparent ${20 * zoomLevel}px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(255,255,255,0.03) 0px,
                rgba(255,255,255,0.03) 1px,
                transparent 1px,
                transparent ${20 * zoomLevel}px
              )`,
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: s.radiusSm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="100%" height="100%" viewBox="0 0 200 150" style={{ opacity: 0.7 }}>
                <ellipse cx="100" cy="75" rx="70" ry="60" fill="#4a4a6a" />
                <ellipse cx="100" cy="75" rx="50" ry="45" fill="#3a3a5a" />
                <ellipse cx="85" cy="65" rx="8" ry="10" fill="#2a2a4a" />
                <ellipse cx="115" cy="65" rx="8" ry="10" fill="#2a2a4a" />
                <ellipse cx="100" cy="85" rx="15" ry="10" fill="#5a5a7a" />
              </svg>

              <div style={{
                position: 'absolute',
                top: 8,
                left: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                {selectedExam.modality}
              </div>
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontSize: 9,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: s.fontMono,
              }}>
                {selectedImageIndex + 1}/{imageCount}
              </div>
            </div>
          </div>

          {/* 序列选择 */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 12,
            overflowX: 'auto',
            paddingBottom: 8,
          }}>
            {imageCount > 0 ? (
              Array.from({ length: Math.min(imageCount, 16) }).map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    width: 64,
                    height: 48,
                    flexShrink: 0,
                    background: `linear-gradient(135deg, #2a2a4a, #3a3a6a)`,
                    borderRadius: s.radiusSm,
                    border: `2px solid ${selectedImageIndex === idx ? s.primary : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: s.fontMono,
                  }}
                >
                  {idx + 1}
                </div>
              ))
            ) : (
              <div style={{ color: s.gray400, fontSize: 12 }}>无图像数据</div>
            )}
          </div>
        </div>
      </Modal>
    )
  }

  // ----------------------------------------
  // [NEW] 渲染：历史对比模态框
  // ----------------------------------------
  const renderHistoryPanel = () => {
    if (!showHistoryPanel) return null

    return (
      <Modal
        open={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        title="历史报告对比"
        width={900}
      >
        <div>
          {/* 搜索框 */}
          <div style={{ marginBottom: 16 }}>
            <Input
              value={historySearch}
              onChange={setHistorySearch}
              placeholder="搜索历史报告..."
              icon={<Search size={14} />}
            />
          </div>

          {/* 历史报告列表 */}
          <div style={{ display: 'flex', gap: 16 }}>
            {/* 左侧：历史报告列表 */}
            <div style={{ width: '40%', borderRight: `1px solid ${s.gray200}`, paddingRight: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.gray600, marginBottom: 8 }}>
                历史报告 ({historyReports.length})
              </div>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {historyReports
                  .filter(r => !historySearch || r.examDate.includes(historySearch) || r.findings.includes(historySearch))
                  .map(report => (
                    <div
                      key={report.id}
                      onClick={() => handleSelectHistoryReport(report)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: s.radius,
                        border: `1px solid ${selectedHistoryReport?.id === report.id ? s.primary : s.gray200}`,
                        background: selectedHistoryReport?.id === report.id ? s.primaryBg : s.white,
                        cursor: 'pointer',
                        marginBottom: 8,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: s.primary }}>{report.examDate}</span>
                        <Badge bg={s.gray100} color={s.gray500} size="sm">{report.modality}</Badge>
                      </div>
                      <div style={{ fontSize: 11, color: s.gray500 }}>{report.examType}</div>
                      <div style={{ fontSize: 10, color: s.gray400, marginTop: 4 }}>
                        报告医生: {report.reportDoctor}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 右侧：对比视图 */}
            <div style={{ width: '60%' }}>
              {selectedHistoryReport ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: s.gray600 }}>
                      对比视图 - {selectedHistoryReport.examDate}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<GitCompare size={12} />}
                      onClick={handleStartCompare}
                    >
                      开始对比
                    </Button>
                  </div>

                  {/* 左右分屏对比 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* 当前报告 */}
                    <div style={{
                      border: `1px solid ${s.primaryBorder}`,
                      borderRadius: s.radius,
                      padding: 12,
                      background: s.primaryBg,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: s.primary, marginBottom: 8 }}>
                        当前报告
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: s.gray500, marginBottom: 2 }}>检查所见</div>
                        <div style={{ fontSize: 11, color: s.gray700, whiteSpace: 'pre-wrap', maxHeight: 150, overflow: 'auto' }}>
                          {findings || '（空）'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: s.gray500, marginBottom: 2 }}>印象/结论</div>
                        <div style={{ fontSize: 11, color: s.gray700, whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'auto' }}>
                          {impressions.filter(i => i.trim()).join('\n') || '（空）'}
                        </div>
                      </div>
                    </div>

                    {/* 历史报告 */}
                    <div style={{
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radius,
                      padding: 12,
                      background: s.gray50,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: s.gray600, marginBottom: 8 }}>
                        历史报告 ({selectedHistoryReport.examDate})
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: s.gray500, marginBottom: 2 }}>检查所见</div>
                        <div style={{ fontSize: 11, color: s.gray700, whiteSpace: 'pre-wrap', maxHeight: 150, overflow: 'auto' }}>
                          {selectedHistoryReport.findings || '（空）'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: s.gray500, marginBottom: 2 }}>印象/结论</div>
                        <div style={{ fontSize: 11, color: s.gray700, whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'auto' }}>
                          {selectedHistoryReport.impression || '（空）'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 差异提示 */}
                  <div style={{
                    marginTop: 12,
                    padding: '8px 12px',
                    background: s.infoBg,
                    borderRadius: s.radius,
                    fontSize: 11,
                    color: s.info,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <Info size={12} />
                    系统将自动高亮显示当前报告与历史报告的差异部分
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: 40,
                  textAlign: 'center',
                  color: s.gray400,
                }}>
                  <FileSearch size={32} style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 12 }}>请从左侧选择一份历史报告</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  // ----------------------------------------
  // [NEW] 渲染：典型征象库模态框
  // ----------------------------------------
  const renderFindingLibrary = () => {
    if (!showFindingLibrary) return null

    return (
      <Modal
        open={showFindingLibrary}
        onClose={() => setShowFindingLibrary(false)}
        title="典型征象库"
        width={800}
      >
        <div>
          {/* 筛选工具栏 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <Input
                value={findingLibrarySearch}
                onChange={setFindingLibrarySearch}
                placeholder="搜索征象名称、类别..."
                icon={<Search size={14} />}
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'CT', 'MR', 'DR'].map(mod => (
                <button
                  key={mod}
                  onClick={() => setFindingLibraryModality(mod)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: s.radius,
                    border: `1px solid ${findingLibraryModality === mod ? s.primaryBorder : s.gray200}`,
                    background: findingLibraryModality === mod ? s.primaryBg : s.white,
                    color: findingLibraryModality === mod ? s.primary : s.gray600,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {mod === 'all' ? '全部' : mod}
                </button>
              ))}
            </div>
          </div>

          {/* 征象列表 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            maxHeight: 450,
            overflowY: 'auto',
          }}>
            {filteredFindings.map(finding => (
              <div
                key={finding.id}
                onClick={() => handleInsertTypicalFinding(finding)}
                style={{
                  padding: '12px 14px',
                  borderRadius: s.radius,
                  border: `1px solid ${s.gray200}`,
                  background: s.white,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = s.primaryBorder
                  ;(e.currentTarget as HTMLDivElement).style.background = s.primaryBg
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = s.gray200
                  ;(e.currentTarget as HTMLDivElement).style.background = s.white
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.primary }}>{finding.name}</span>
                  <Badge bg={s.gray100} color={s.gray500} size="sm">{finding.modality}</Badge>
                </div>
                <div style={{ fontSize: 10, color: s.gray400, marginBottom: 4 }}>
                  类别: {finding.category} | 部位: {finding.bodyPart}
                </div>
                <div style={{ fontSize: 11, color: s.gray600, lineHeight: 1.5 }}>
                  {finding.description.slice(0, 80)}...
                </div>
                <div style={{ marginTop: 6, fontSize: 10, color: s.gray400 }}>
                  典型于: {finding.typicalFor.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    )
  }

  // ----------------------------------------
  // [NEW] 渲染：多级审核流程模态框
  // ----------------------------------------
  const renderReviewWorkflow = () => {
    if (!showReviewModal) return null

    return (
      <Modal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="审核报告"
        width={600}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>
              取消
            </Button>
            {reportStatus === 'draft' ? (
              <Button variant="success" icon={<Send size={14} />} onClick={() => handleReviewAction('approve')}>
                提交审核
              </Button>
            ) : reportStatus === 'pending_review' || reportStatus === 'first_approved' ? (
              <>
                <Button variant="danger" icon={<ThumbsDown size={14} />} onClick={() => setShowRejectModal(true)}>
                  驳回
                </Button>
                <Button variant="success" icon={<ThumbsUp size={14} />} onClick={() => handleReviewAction('approve')}>
                  通过
                </Button>
              </>
            ) : reportStatus === 'pending_final' ? (
              <Button variant="primary" icon={<Award size={14} />} onClick={() => handleReviewAction('sign')}>
                签发报告
              </Button>
            ) : null}
          </div>
        }
      >
        <div>
          {/* 审核状态流程图 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              {REVIEW_WORKFLOW_STEPS.map((step, idx) => {
                const isActive = reportStatus === step.id
                const isPast = REVIEW_WORKFLOW_STEPS.findIndex(s => s.id === reportStatus) > idx
                return (
                  <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isPast ? s.success : isActive ? step.color : s.gray200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: s.white,
                    }}>
                      {isPast ? <Check size={14} /> : <step.icon size={14} />}
                    </div>
                    {idx < REVIEW_WORKFLOW_STEPS.length - 1 && (
                      <div style={{
                        width: 40,
                        height: 2,
                        background: isPast ? s.success : s.gray200,
                        margin: '0 4px',
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: s.gray500 }}>
              {REVIEW_WORKFLOW_STEPS.map(step => (
                <span key={step.id} style={{ color: reportStatus === step.id ? s.primary : s.gray400 }}>
                  {step.label}
                </span>
              ))}
            </div>
          </div>

          {/* 当前状态说明 */}
          <div style={{
            padding: '12px 14px',
            background: s.infoBg,
            borderRadius: s.radius,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: s.primary, marginBottom: 4 }}>
              当前状态: {REVIEW_WORKFLOW_STEPS.find(s => s.id === reportStatus)?.label}
            </div>
            <div style={{ fontSize: 11, color: s.gray600 }}>
              {REVIEW_WORKFLOW_STEPS.find(s => s.id === reportStatus)?.description}
            </div>
          </div>

          {/* 审核历史 */}
          {reviewHistory.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.gray600, marginBottom: 8 }}>
                审核历史
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reviewHistory.map(action => (
                  <div key={action.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    background: s.gray50,
                    borderRadius: s.radius,
                  }}>
                    <Badge
                      bg={action.action === 'submit' ? s.infoBg : action.action === 'approve' ? s.successBg : s.dangerBg}
                      color={action.action === 'submit' ? s.info : action.action === 'approve' ? s.success : s.danger}
                      size="sm"
                    >
                      {action.action === 'submit' ? '提交' : action.action === 'approve' ? '通过' : action.action === 'reject' ? '驳回' : action.action === 'sign' ? '签发' : '召回'}
                    </Badge>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: s.gray700 }}>
                        {action.actor}（{action.actorTitle}）
                      </div>
                      {action.comment && (
                        <div style={{ fontSize: 10, color: s.gray500, marginTop: 2 }}>
                          意见: {action.comment}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: s.gray400 }}>{action.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 审核意见 */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
              审核意见（可选）
            </label>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="填写审核意见..."
              style={{
                width: '100%',
                minHeight: 80,
                border: `1px solid ${s.gray200}`,
                borderRadius: s.radius,
                padding: '10px 12px',
                fontSize: 13,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
      </Modal>
    )
  }

  // ----------------------------------------
  // [NEW] 渲染：驳回模态框
  // ----------------------------------------
  const renderRejectModal = () => {
    if (!showRejectModal) return null

    return (
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="驳回报告"
        width={500}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              取消
            </Button>
            <Button
              variant="danger"
              icon={<ThumbsDown size={14} />}
              onClick={() => handleReviewAction('reject')}
              disabled={!rejectReason && !selectedRejectReason}
            >
              确认驳回
            </Button>
          </div>
        }
      >
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
              驳回原因（选择或填写）
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {REJECT_REASONS.slice(0, -1).map((reason, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedRejectReason(reason)
                    setRejectReason(reason)
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: s.radius,
                    border: `1px solid ${selectedRejectReason === reason ? s.danger : s.gray200}`,
                    background: selectedRejectReason === reason ? s.dangerBg : s.white,
                    color: selectedRejectReason === reason ? s.danger : s.gray600,
                    fontSize: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
              自定义驳回原因
            </label>
            <textarea
              value={rejectReason}
              onChange={e => {
                setRejectReason(e.target.value)
                setSelectedRejectReason('')
              }}
              placeholder="请详细说明驳回原因，以便报告医生修改..."
              style={{
                width: '100%',
                minHeight: 100,
                border: `1px solid ${s.gray200}`,
                borderRadius: s.radius,
                padding: '10px 12px',
                fontSize: 13,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
      </Modal>
    )
  }

  // ----------------------------------------
  // [NEW] 渲染：报告召回模态框
  // ----------------------------------------
  const renderRecallModal = () => {
    if (!showRecallModal) return null

    return (
      <Modal
        open={showRecallModal}
        onClose={() => setShowRecallModal(false)}
        title="召回报告"
        width={500}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowRecallModal(false)}>
              取消
            </Button>
            <Button
              variant="danger"
              icon={<Recycle size={14} />}
              onClick={() => handleReviewAction('recall')}
              disabled={!recallReason.trim()}
            >
              确认召回
            </Button>
          </div>
        }
      >
        <div>
          <div style={{
            padding: '12px 14px',
            background: s.warningBg,
            borderRadius: s.radius,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertTriangle size={16} style={{ color: s.warning }} />
            <div style={{ fontSize: 11, color: s.warning }}>
              召回报告后，报告将返回草稿状态，需要重新提交审核。已签发的报告被召回后将通知相关人员。
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
              召回原因
            </label>
            <textarea
              value={recallReason}
              onChange={e => setRecallReason(e.target.value)}
              placeholder="请说明召回报告的原因..."
              style={{
                width: '100%',
                minHeight: 100,
                border: `1px solid ${s.gray200}`,
                borderRadius: s.radius,
                padding: '10px 12px',
                fontSize: 13,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
      </Modal>
    )
  }

  // ----------------------------------------
  // [NEW] 渲染：操作日志模态框
  // ----------------------------------------
  const renderOperationLogModal = () => {
    if (!showOperationLog) return null

    return (
      <Modal
        open={showOperationLog}
        onClose={() => setShowOperationLog(false)}
        title="操作日志"
        width={700}
      >
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: s.gray500 }}>
              共 {operationLogs.length} 条操作记录
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={<Download size={12} />}
              onClick={() => {
                const content = operationLogs.map(log =>
                  `${log.timestamp} | ${log.action} | ${log.details}`
                ).join('\n')
                navigator.clipboard.writeText(content)
                alert('日志已复制到剪贴板')
              }}
            >
              导出日志
            </Button>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {operationLogs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: s.gray400 }}>
                <History size={32} style={{ margin: '0 auto 12px' }} />
                <p>暂无操作记录</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {operationLogs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      padding: '10px 14px',
                      background: s.gray50,
                      borderRadius: s.radius,
                      borderLeft: `3px solid ${s.primary}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: s.primary }}>{log.action}</span>
                      <span style={{ fontSize: 10, color: s.gray400 }}>{log.timestamp}</span>
                    </div>
                    <div style={{ fontSize: 11, color: s.gray600, marginBottom: 4 }}>{log.details}</div>
                    {log.beforeValue && log.afterValue && (
                      <div style={{
                        marginTop: 6,
                        padding: '6px 10px',
                        background: s.white,
                        borderRadius: s.radiusSm,
                        fontSize: 10,
                        fontFamily: s.fontMono,
                      }}>
                        <div style={{ color: s.danger }}>- {log.beforeValue}</div>
                        <div style={{ color: s.success }}>+ {log.afterValue}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    )
  }

  // ----------------------------------------
  // [NEW] 渲染：Diff对比视图
  // ----------------------------------------
  const renderDiffView = () => {
    if (!showDiffView || !diffData) return null

    // 简单的行对比
    const beforeLines = diffData.before.split('\n')
    const afterLines = diffData.after.split('\n')

    return (
      <Modal
        open={showDiffView}
        onClose={() => setShowDiffView(false)}
        title={`差异对比 - ${diffData.field}`}
        width={800}
      >
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 16,
          }}>
            <div style={{
              padding: '8px 12px',
              background: s.dangerBg,
              borderRadius: s.radius,
              fontSize: 11,
              color: s.danger,
              textAlign: 'center',
            }}>
              修改前
            </div>
            <div style={{
              padding: '8px 12px',
              background: s.successBg,
              borderRadius: s.radius,
              fontSize: 11,
              color: s.success,
              textAlign: 'center',
            }}>
              修改后
            </div>
          </div>
          <div style={{
            maxHeight: 400,
            overflowY: 'auto',
            fontFamily: s.fontMono,
            fontSize: 11,
            lineHeight: 1.8,
          }}>
            {beforeLines.map((line, idx) => {
              const afterLine = afterLines[idx]
              const isDifferent = line !== afterLine
              return (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    padding: '2px 0',
                    background: isDifferent ? 'rgba(220, 38, 38, 0.05)' : 'transparent',
                  }}
                >
                  <div style={{ color: isDifferent ? s.danger : s.gray600, whiteSpace: 'pre-wrap' }}>
                    {isDifferent && <span style={{ marginRight: 8 }}>-</span>}
                    {line || ' '}
                  </div>
                  <div style={{ color: isDifferent ? s.success : s.gray600, whiteSpace: 'pre-wrap' }}>
                    {isDifferent && <span style={{ marginRight: 8 }}>+</span>}
                    {afterLine || ' '}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    )
  }

  // ========================================
  // 主渲染
  // ========================================
  return (
    <div style={{
      minHeight: '100vh',
      background: s.gray50,
      padding: 20,
    }}>
      {/* 页面头部 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        maxWidth: 1600,
        margin: '0 auto 20px',
      }}>
        <div>
          <h1 style={{
            fontSize: 20,
            fontWeight: 800,
            color: s.primary,
            margin: '0 0 4px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Stethoscope size={22} />
            报告书写
          </h1>
          <p style={{ fontSize: 12, color: s.gray500, margin: 0 }}>
            模板填充 · 词库辅助输入 · 危急值标注 · 电子签名
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="outline"
            size="md"
            icon={<Bell size={14} />}
          >
            待处理: {pendingExams.length}
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{
        display: 'flex',
        gap: 16,
        maxWidth: 1600,
        margin: '0 auto',
      }}>
        {/* 左侧面板 */}
        <div style={{
          width: leftPanelWidth,
          flexShrink: 0,
        }}>
          {/* 待报告检查列表 */}
          {(!selectedExamId || showExamList) && (
            <Card
              title={`待书写报告（${filteredPendingExams.length}）`}
              icon={<ClipboardList size={14} />}
              extra={
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* 模态筛选 */}
                  <select
                    value={modalityFilter}
                    onChange={e => setModalityFilter(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radiusSm,
                      fontSize: 11,
                      background: s.white,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="all">全部模态</option>
                    <option value="CT">CT</option>
                    <option value="MR">MR</option>
                    <option value="DR">DR</option>
                    <option value="DSA">DSA</option>
                  </select>
                </div>
              }
            >
              {/* 搜索框 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: s.gray50,
                borderRadius: s.radius,
                padding: '8px 12px',
                marginBottom: 14,
                border: `1px solid ${s.gray200}`,
              }}>
                <Search size={14} style={{ color: s.gray400 }} />
                <input
                  value={examSearch}
                  onChange={e => setExamSearch(e.target.value)}
                  placeholder="搜索患者姓名 / Accession / 检查项目..."
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: 13,
                    background: 'transparent',
                    width: '100%',
                    color: s.gray700,
                  }}
                />
                {examSearch && (
                  <button
                    onClick={() => setExamSearch('')}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: s.gray400,
                      display: 'flex',
                      padding: 2,
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* 统计信息 */}
              <div style={{
                display: 'flex',
                gap: 8,
                marginBottom: 14,
              }}>
                <div style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: s.infoBg,
                  borderRadius: s.radius,
                  fontSize: 11,
                  color: s.info,
                }}>
                  <span style={{ fontWeight: 700 }}>{pendingExams.length}</span> 待报告
                </div>
                <div style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: s.dangerBg,
                  borderRadius: s.radius,
                  fontSize: 11,
                  color: s.danger,
                }}>
                  <span style={{ fontWeight: 700 }}>0</span> 危急值
                </div>
              </div>

              {/* 检查列表 */}
              <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                {filteredPendingExams.length > 0 ? (
                  filteredPendingExams.map(exam => renderExamItem(exam))
                ) : (
                  <div style={{
                    padding: 40,
                    textAlign: 'center',
                    color: s.gray400,
                  }}>
                    <CheckCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p style={{ fontSize: 13 }}>暂无待报告的检查</p>
                    <p style={{ fontSize: 11, marginTop: 4 }}>所有报告已处理完毕</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 报告表单 */}
          {selectedExamId && (
            <>
              {renderReportForm()}
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronLeft size={12} />}
                onClick={() => {
                  setSelectedExamId('')
                  setShowExamList(true)
                }}
                style={{ marginTop: 12 }}
              >
                返回检查列表
              </Button>
            </>
          )}
        </div>

        {/* 右侧面板 */}
        <div style={{
          width: rightPanelWidth,
          flexShrink: 0,
        }}>
          {selectedExamId ? (
            renderRightPanel()
          ) : (
            <div style={{
              background: s.white,
              borderRadius: s.radiusLg,
              border: `1px solid ${s.gray200}`,
              padding: 40,
              textAlign: 'center',
            }}>
              <FileText size={48} style={{ color: s.gray200, margin: '0 auto 16px' }} />
              <p style={{ fontSize: 14, color: s.gray500, margin: 0 }}>
                选择左侧检查开始书写报告
              </p>
              <p style={{ fontSize: 12, color: s.gray300, marginTop: 8 }}>
                或从模板库选择已有模板
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 模态框 */}
      {renderTemplateModal()}
      {renderPrintPreview()}
      {renderImageViewer()}
      {renderHistoryPanel()}
      {renderFindingLibrary()}
      {renderReviewWorkflow()}
      {renderRejectModal()}
      {renderRecallModal()}
      {renderOperationLogModal()}
      {renderDiffView()}
    </div>
  )
}
