// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 报告书写页面 v0.4.2
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
  ShieldCheck, ShieldX, UserCheck, UserX, CallBell,
  Ruler, Scale, StickyNote, Signature, FileDiff
} from 'lucide-react'

// ============================================================
// [NEW] 报告修改痕迹系统
// ============================================================
interface ReportRevision {
  id: string
  field: 'findings' | 'diagnosis' | 'impression' | 'recommendation' | 'critical'
  before: string
  after: string
  author: string
  authorTitle: string
  timestamp: string
}

// ============================================================
// [NEW] 报告版本历史
// ============================================================
interface ReportVersion {
  id: string
  versionNumber: number
  timestamp: string
  author: string
  authorTitle: string
  action: 'save' | 'submit' | 'approve' | 'reject' | 'sign'
  findings: string
  diagnosis: string
  impression: string
  recommendation: string
}

// ============================================================
// [NEW] 报告评分体系
// ============================================================
interface ReportScore {
  completeness: number      // 完整性 1-10
  standardization: number    // 规范性 1-10
  accuracy: number          // 准确性 1-10
  timeliness: number        // 及时性 1-10
}

// ============================================================
// [NEW] 结构化报告模板
// ============================================================
interface StructuredTemplateSection {
  id: string
  label: string
  placeholder: string
  type: 'text' | 'measurement' | 'select'
  options?: string[]
  required?: boolean
}

interface StructuredTemplate {
  id: string
  name: string
  modality: string
  bodyPart: string
  sections: StructuredTemplateSection[]
  conclusionTemplate: string
  recommendationTemplate: string
}

// ============================================================
// [NEW] 快捷测量记录
// ============================================================
interface MeasurementRecord {
  id: string
  type: 'ct' | 'size' | 'distance'
  value: string
  unit: string
  location: string
  timestamp: string
}

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

// ============================================================
// [NEW] ICD-10诊断代码
// ============================================================
interface ICD10Code {
  code: string
  name: string
  category: string
}

const ICD10_CODES: ICD10Code[] = [
  // 头部/神经系统
  { code: 'I63.900', name: '脑梗死', category: '神经系统' },
  { code: 'I61.900', name: '脑出血', category: '神经系统' },
  { code: 'I60.900', name: '蛛网膜下腔出血', category: '神经系统' },
  { code: 'G40.900', name: '癫痫', category: '神经系统' },
  { code: 'G35.000', name: '多发性硬化', category: '神经系统' },
  // 呼吸系统
  { code: 'J18.900', name: '肺炎', category: '呼吸系统' },
  { code: 'J44.100', name: '慢性阻塞性肺病', category: '呼吸系统' },
  { code: 'J45.900', name: '哮喘', category: '呼吸系统' },
  { code: 'C34.900', name: '肺癌', category: '呼吸系统' },
  { code: 'J90.000', name: '胸腔积液', category: '呼吸系统' },
  // 消化系统
  { code: 'K76.000', name: '肝血管瘤', category: '消化系统' },
  { code: 'C22.000', name: '原发性肝癌', category: '消化系统' },
  { code: 'K80.200', name: '胆囊结石', category: '消化系统' },
  { code: 'K85.900', name: '急性胰腺炎', category: '消化系统' },
  { code: 'N20.000', name: '肾结石', category: '泌尿系统' },
  // 心血管系统
  { code: 'I25.100', name: '冠心病', category: '心血管系统' },
  { code: 'I70.000', name: '动脉粥样硬化', category: '心血管系统' },
  { code: 'I71.000', name: '主动脉夹层', category: '心血管系统' },
  // 其他
  { code: 'D36.000', name: '良性肿瘤', category: '肿瘤' },
  { code: 'M54.500', name: '腰痛', category: '肌肉骨骼' },
]

// ============================================================
// [NEW] 扩充短语库 (20+ per body part)
// ============================================================
const PHRASE_LIBRARY: Record<string, { label: string; phrase: string; category: string }[]> = {
  '头颅': [
    { label: '脑实质密度均匀', phrase: '脑实质密度均匀，未见异常密度影。', category: '正常描述' },
    { label: '脑室系统正常', phrase: '脑室系统形态正常，无扩张或受压改变。', category: '正常描述' },
    { label: '中线居中', phrase: '中线结构居中，无偏移。', category: '正常描述' },
    { label: '未见骨折', phrase: '颅骨骨质完整，无骨折征象。', category: '正常描述' },
    { label: '脑沟脑回正常', phrase: '脑沟、脑回形态正常，脑表面脑膜无增厚。', category: '正常描述' },
    { label: '急性脑梗死', phrase: '脑实质内可见片状低密度影，边界模糊，CT值约25-35HU，DWI呈高信号。', category: '病理描述' },
    { label: '脑出血', phrase: '脑实质内可见团块状高密度影，CT值约60-80HU，周围可见水肿带。', category: '病理描述' },
    { label: '脑膜瘤', phrase: '颅内可见类圆形占位，边界清楚，增强扫描明显均匀强化，可见脑膜尾征。', category: '病理描述' },
    { label: '垂体瘤', phrase: '垂体增大，可见局限性突出，向上压迫视交叉。', category: '病理描述' },
    { label: '硬膜下血肿', phrase: '颅骨内板下可见新月形高密度影，范围广泛，可跨越颅缝。', category: '病理描述' },
    { label: '蛛网膜下腔出血', phrase: '脑池、脑沟内可见高密度影，以侧裂池、外侧裂池为著。', category: '病理描述' },
    { label: '脑萎缩', phrase: '双侧脑室对称性扩大，脑回脑沟增宽加深。', category: '病理描述' },
    { label: '脑白质病变', phrase: '双侧脑室旁白质可见散在点状长T2信号，边缘清楚，无占位效应。', category: '病理描述' },
    { label: '脑血管狭窄', phrase: '大脑中动脉M1段管腔狭窄约XX%，局部管壁可见钙化斑块。', category: '测量描述' },
    { label: '颅内占位', phrase: '可见团块状异常密度影，边界不清，周围组织受压推移，中线结构偏移。', category: '病理描述' },
    { label: '脑积水', phrase: '脑室系统显著扩大，脑沟变浅或消失。', category: '病理描述' },
    { label: '建议MRI增强', phrase: '建议进一步行MRI增强扫描以明确诊断。', category: '建议' },
    { label: '建议CTA', phrase: '建议行CTA检查评估脑血管情况。', category: '建议' },
    { label: '建议随访', phrase: '建议定期复查，密切观察病变变化。', category: '建议' },
    { label: '建议PET-CT', phrase: '建议行PET-CT检查评估全身情况。', category: '建议' },
  ],
  '胸部': [
    { label: '双肺野清晰', phrase: '双肺野透亮度正常，肺纹理清晰，走行自然。', category: '正常描述' },
    { label: '心影正常', phrase: '心影形态大小正常，各房室比例正常。', category: '正常描述' },
    { label: '肋膈角锐', phrase: '双侧肋膈角锐利，胸膜无增厚。', category: '正常描述' },
    { label: '肺门正常', phrase: '双侧肺门结构正常，无肿大淋巴结。', category: '正常描述' },
    { label: '纵隔居中', phrase: '纵隔居中，无增宽，气管居中。', category: '正常描述' },
    { label: '大叶性肺炎', phrase: '肺叶或肺段可见大片实变影，密度均匀，可见支气管充气征。', category: '病理描述' },
    { label: '肺结核', phrase: '上肺可见斑片状、结节状影，可见空洞形成，周围可见卫星灶。', category: '病理描述' },
    { label: '肺肿瘤', phrase: '肺门或肺野可见团块影，边界不清，可见分叶、毛刺征，可有胸膜牵拉。', category: '病理描述' },
    { label: '气胸', phrase: '胸腔内可见无肺纹理区域，肺组织被压缩，可见压缩边缘。', category: '病理描述' },
    { label: '胸腔积液', phrase: '胸腔内可见弧形水样密度影，根据密度可判断性质。', category: '病理描述' },
    { label: '肺结节', phrase: '肺野可见类圆形结节影，边界清楚，直径约XXmm。', category: '测量描述' },
    { label: '肺大泡', phrase: '肺野可见薄壁囊状透亮区，边界清楚。', category: '病理描述' },
    { label: '支气管扩张', phrase: '支气管壁增厚，呈柱状或囊状扩张。', category: '病理描述' },
    { label: '间质性肺炎', phrase: '双肺可见网格状、蜂窝状影，以双下肺为著。', category: '病理描述' },
    { label: '建议增强', phrase: '建议行CT增强扫描进一步评估。', category: '建议' },
    { label: '建议抗炎后复查', phrase: '建议抗感染治疗后复查。', category: '建议' },
    { label: '建议穿刺活检', phrase: '建议CT引导下穿刺活检以明确病理。', category: '建议' },
    { label: '建议肿瘤科就诊', phrase: '建议肿瘤科门诊就诊。', category: '建议' },
    { label: '建议定期随访', phrase: '建议3-6个月后复查胸部CT。', category: '建议' },
    { label: '建议呼吸科随诊', phrase: '建议呼吸内科门诊随诊。', category: '建议' },
  ],
  '腹部': [
    { label: '肝脏形态正常', phrase: '肝脏形态大小正常，实质密度均匀，未见异常密度影。', category: '正常描述' },
    { label: '胆囊形态正常', phrase: '胆囊形态正常，壁不厚，腔内未见结石影。', category: '正常描述' },
    { label: '肝内外胆管无扩张', phrase: '肝内外胆管无扩张，走行区未见结石影。', category: '正常描述' },
    { label: '胰腺形态正常', phrase: '胰腺形态正常，密度均匀，边缘清楚。', category: '正常描述' },
    { label: '脾脏形态正常', phrase: '脾脏形态、大小正常，密度均匀。', category: '正常描述' },
    { label: '双肾形态正常', phrase: '双肾形态正常，位置正常，密度均匀。', category: '正常描述' },
    { label: '肝血管瘤', phrase: '肝内可见类圆形低密度影，边界清楚，增强扫描边缘结节样强化。', category: '病理描述' },
    { label: '肝囊肿', phrase: '肝内可见圆形水样低密度影，边界清晰，壁薄而光滑。', category: '病理描述' },
    { label: '肝细胞癌', phrase: '肝内可见肿块影，边界不清，增强扫描动脉期明显强化，静脉期快速退出。', category: '病理描述' },
    { label: '肾囊肿', phrase: '肾内可见圆形水样低密度影，边界清晰，壁薄而光滑，增强扫描无强化。', category: '病理描述' },
    { label: '肾结石', phrase: '肾盂内可见高密度影，边缘锐利，CT值约200-400HU。', category: '测量描述' },
    { label: '泌尿系结石', phrase: '泌尿系走行区可见高密度影，边缘锐利。', category: '测量描述' },
    { label: '急性胰腺炎', phrase: '胰腺形态肿胀，密度减低，周围脂肪间隙模糊，可见条索状渗出。', category: '病理描述' },
    { label: '腹水', phrase: '腹腔内可见弧形水样密度影。', category: '病理描述' },
    { label: '肠梗阻', phrase: '肠管明显扩张积气积液，可见气液平面。', category: '病理描述' },
    { label: '建议增强扫描', phrase: '建议进一步行增强扫描以明确诊断。', category: '建议' },
    { label: '建议MRCP', phrase: '建议行MRCP检查评估胆胰管情况。', category: '建议' },
    { label: '建议泌尿外科就诊', phrase: '建议泌尿外科门诊就诊。', category: '建议' },
    { label: '建议肿瘤科就诊', phrase: '建议肿瘤科门诊就诊。', category: '建议' },
    { label: '建议定期复查', phrase: '建议3-6个月后复查。', category: '建议' },
  ],
  '脊柱': [
    { label: '椎体形态正常', phrase: '椎体形态及信号未见异常，骨质完整。', category: '正常描述' },
    { label: '椎间盘正常', phrase: '椎间盘信号均匀，未见突出或膨出。', category: '正常描述' },
    { label: '椎管无狭窄', phrase: '椎管形态正常，无狭窄。', category: '正常描述' },
    { label: '脊髓形态正常', phrase: '脊髓形态正常，信号均匀，无异常强化。', category: '正常描述' },
    { label: '椎间盘突出', phrase: '相应椎间盘向后方突出，压迫硬膜囊。', category: '病理描述' },
    { label: '椎管狭窄', phrase: '椎管有效矢状径减小，狭窄程度约XX%。', category: '测量描述' },
    { label: '椎体骨折', phrase: '椎体可见线样低密度影，骨皮质连续性中断。', category: '病理描述' },
    { label: '椎体转移瘤', phrase: '椎体可见多发类圆形异常信号影，增强扫描可见强化。', category: '病理描述' },
    { label: '脊髓空洞', phrase: '脊髓内可见条状长T1长T2信号影。', category: '病理描述' },
    { label: '神经鞘瘤', phrase: '椎管内可见类圆形占位，边界清楚，增强扫描明显强化。', category: '病理描述' },
    { label: '建议MRI增强', phrase: '建议行MRI增强扫描进一步评估。', category: '建议' },
    { label: '建议骨科就诊', phrase: '建议骨科门诊就诊。', category: '建议' },
    { label: '建议康复科随诊', phrase: '建议康复科门诊随诊。', category: '建议' },
    { label: '建议定期复查', phrase: '建议定期复查MRI观察病变变化。', category: '建议' },
    { label: '颈椎生理曲度变直', phrase: '颈椎生理曲度变直，序列整齐。', category: '退行性改变' },
    { label: '颈椎骨质增生', phrase: '颈椎边缘可见骨质增生，骨赘形成。', category: '退行性改变' },
    { label: '椎间盘变性', phrase: '椎间盘T2信号减低，提示脱水变性。', category: '退行性改变' },
    { label: '后纵韧带骨化', phrase: '后纵韧带可见条状骨化影，致椎管狭窄。', category: '病理描述' },
    { label: '黄韧带肥厚', phrase: '黄韧带可见肥厚，突向椎管。', category: '病理描述' },
    { label: '硬膜囊受压', phrase: '硬膜囊受压变形，蛛网膜下腔变窄。', category: '测量描述' },
    { label: '脊膜瘤', phrase: '椎管内可见类圆形占位，T1等信号，T2高信号，明显均匀强化。', category: '病理描述' },
    { label: '室管膜瘤', phrase: '脊髓内可见梭形膨胀性肿块，边界清楚，增强扫描轻度强化。', category: '病理描述' },
    { label: '血管瘤', phrase: '椎体内可见粗细不均的血管流空信号。', category: '病理描述' },
    { label: '骨髓水肿', phrase: '椎体可见斑片状长T1长T2信号，STIR呈高信号。', category: '病理描述' },
    { label: '建议外科手术', phrase: '建议脊柱外科就诊，评估手术指征。', category: '建议' },
    { label: '建议牵引治疗', phrase: '建议牵引治疗及物理康复。', category: '建议' },
    { label: '建议避免劳累', phrase: '建议避免长期低头及劳累。', category: '建议' },
  ],
  '颈部': [
    { label: '颈部淋巴结正常', phrase: '颈部未见肿大淋巴结。', category: '正常描述' },
    { label: '甲状腺形态正常', phrase: '甲状腺形态、大小正常，密度均匀。', category: '正常描述' },
    { label: '颈部血管正常', phrase: '颈部血管走行正常，管壁不厚，管腔通畅。', category: '正常描述' },
    { label: '甲状腺结节', phrase: '甲状腺内可见类圆形低密度影，边界清楚。', category: '病理描述' },
    { label: '甲状腺癌', phrase: '甲状腺增大，内可见不规则肿块，边界不清，侵犯周围组织。', category: '病理描述' },
    { label: '颈部淋巴结肿大', phrase: '颈部可见多发肿大淋巴结，部分相互融合。', category: '病理描述' },
    { label: '腮腺病变', phrase: '腮腺内可见类圆形占位，边界清楚。', category: '病理描述' },
    { label: '颈动脉斑块', phrase: '颈动脉可见粥样硬化斑块，局部管腔狭窄。', category: '测量描述' },
    { label: '颈动脉狭窄', phrase: '颈动脉管腔狭窄约XX%，可见低回声斑块。', category: '测量描述' },
    { label: '食管病变', phrase: '食管管壁增厚，可见占位性病变。', category: '病理描述' },
    { label: '喉部病变', phrase: '喉部可见结节状影，声带运动正常。', category: '病理描述' },
    { label: '颈部脓肿', phrase: '颈部可见液性暗区，边界不清，内可见分隔。', category: '病理描述' },
    { label: '先天性囊肿', phrase: '颈部可见薄壁囊性占位，边界清楚。', category: '病理描述' },
    { label: '建议内分泌科就诊', phrase: '建议内分泌科门诊随诊。', category: '建议' },
    { label: '建议头颈外科就诊', phrase: '建议头颈外科就诊评估。', category: '建议' },
    { label: '建议穿刺活检', phrase: '建议超声引导下穿刺活检明确病理。', category: '建议' },
    { label: '建议定期复查甲功', phrase: '建议定期复查甲状腺功能。', category: '建议' },
    { label: '建议CTA检查', phrase: '建议CTA检查评估颈部血管。', category: '建议' },
  ],
  '乳腺': [
    { label: '乳腺腺体正常', phrase: '乳腺腺体结构正常，未见明显异常。', category: '正常描述' },
    { label: '乳腺纤维腺瘤', phrase: '乳腺内可见类圆形结节，边界清楚，密度均匀。', category: '病理描述' },
    { label: '乳腺癌', phrase: '乳腺内可见不规则肿块，边缘呈毛刺状，可见簇状钙化。', category: '病理描述' },
    { label: '乳腺囊肿', phrase: '乳腺内可见薄壁囊性占位，边界清楚。', category: '病理描述' },
    { label: '导管扩张', phrase: '乳管可见轻度扩张，走行区未见占位。', category: '病理描述' },
    { label: '乳腺增生', phrase: '乳腺腺体增厚，密度不均，呈片状增高。', category: '病理描述' },
    { label: '乳头溢液', phrase: '乳头可见溢液，导管可见扩张。', category: '病理描述' },
    { label: '腋窝淋巴结肿大', phrase: '左侧/右侧腋窝可见肿大淋巴结，皮髓质分界不清。', category: '病理描述' },
    { label: 'BI-RADS 1类', phrase: '乳腺影像学检查未见明显异常。', category: '评估结论' },
    { label: 'BI-RADS 2类', phrase: '乳腺良性病变，建议定期复查。', category: '评估结论' },
    { label: 'BI-RADS 3类', phrase: '乳腺病变可能为良性，建议短期随访。', category: '评估结论' },
    { label: 'BI-RADS 4类', phrase: '乳腺病变可疑恶性，建议穿刺活检。', category: '评估结论' },
    { label: 'BI-RADS 5类', phrase: '乳腺病变高度提示恶性，建议尽快处理。', category: '评估结论' },
    { label: '建议乳腺外科就诊', phrase: '建议乳腺外科门诊随诊。', category: '建议' },
    { label: '建议乳管镜检查', phrase: '建议乳管镜检查进一步评估。', category: '建议' },
    { label: '建议定期筛查', phrase: '建议定期乳腺筛查。', category: '建议' },
  ],
  '心脏': [
    { label: '心脏形态正常', phrase: '心脏形态、大小正常，各房室比例正常。', category: '正常描述' },
    { label: '心功能正常', phrase: '左室射血分数正常，室壁运动协调。', category: '正常描述' },
    { label: '冠脉支架通畅', phrase: '冠脉支架位置正常，管腔通畅，无明显狭窄。', category: '正常描述' },
    { label: '冠脉搭桥通畅', phrase: '桥血管走形正常，血流信号良好。', category: '正常描述' },
    { label: '冠脉狭窄', phrase: '冠脉某支可见节段性狭窄，狭窄程度约XX%。', category: '测量描述' },
    { label: '冠脉钙化', phrase: '冠脉可见点状、线状钙化灶。', category: '病理描述' },
    { label: '心肌缺血', phrase: '左室壁可见节段性运动异常，灌注减低。', category: '病理描述' },
    { label: '心肌梗死', phrase: '左室壁可见变薄，延迟扫描可见强化，提示心肌梗死。', category: '病理描述' },
    { label: '室壁瘤', phrase: '左室壁局部变薄向外突出，呈瘤样扩张。', category: '病理描述' },
    { label: '附壁血栓', phrase: '左室壁可见结节状充盈缺损，提示附壁血栓。', category: '病理描述' },
    { label: '心包积液', phrase: '心包可见弧形液性暗区，深度约XXmm。', category: '测量描述' },
    { label: '心包增厚', phrase: '心包可见增厚，厚度约XXmm。', category: '测量描述' },
    { label: '瓣膜病变', phrase: '某瓣膜可见增厚、回声增强，开放受限/关闭不全。', category: '病理描述' },
    { label: '先心病', phrase: '房间隔/室间隔可见连续中断，提示先天性心脏病。', category: '病理描述' },
    { label: '心肌病', phrase: '心肌可见肥大/扩张，收缩功能减低。', category: '病理描述' },
    { label: '建议心内科就诊', phrase: '建议心内科门诊随诊。', category: '建议' },
    { label: '建议冠脉造影', phrase: '建议行冠脉造影进一步评估。', category: '建议' },
    { label: '建议定期心超', phrase: '建议定期复查心脏超声。', category: '建议' },
  ],
  '四肢': [
    { label: '骨皮质连续', phrase: '诸骨骨皮质连续性完整，无骨折征象。', category: '正常描述' },
    { label: '关节间隙正常', phrase: '关节间隙正常，关节面光滑。', category: '正常描述' },
    { label: '软组织肿胀', phrase: '软组织层次模糊，可见肿胀信号。', category: '病理描述' },
    { label: '软组织肿块', phrase: '软组织内可见异常信号影，边界不清。', category: '病理描述' },
    { label: '骨折', phrase: '某骨骨质连续性中断，可见透亮线影，断端无明显移位。', category: '病理描述' },
    { label: '骨挫伤', phrase: '骨髓腔内可见斑片状长T1长T2信号。', category: '病理描述' },
    { label: '骨软骨瘤', phrase: '骨表面可见带蒂骨性突起，背向关节生长。', category: '病理描述' },
    { label: '骨肉瘤', phrase: '骨干骺端可见骨质破坏及软组织肿块，可见肿瘤骨生成。', category: '病理描述' },
    { label: '骨巨细胞瘤', phrase: '骨端可见膨胀性溶骨性破坏，边界清楚，无硬化边。', category: '病理描述' },
    { label: '转移瘤', phrase: '诸骨可见多发类圆形溶骨性/成骨性破坏。', category: '病理描述' },
    { label: '骨髓炎', phrase: '骨质可见溶骨性破坏，周围可见骨膜反应及软组织肿胀。', category: '病理描述' },
    { label: '关节炎', phrase: '关节面骨质增生硬化，关节间隙变窄。', category: '病理描述' },
    { label: '肌腱损伤', phrase: '某肌腱连续性中断，局部信号增高。', category: '病理描述' },
    { label: '韧带损伤', phrase: '某韧带肿胀、信号增高，走行失常。', category: '病理描述' },
    { label: '半月板损伤', phrase: '半月板内可见线样高信号，达关节面缘。', category: '病理描述' },
    { label: '滑膜增厚', phrase: '关节滑膜增厚，增强扫描可见强化。', category: '病理描述' },
    { label: '建议骨科就诊', phrase: '建议骨科门诊随诊。', category: '建议' },
    { label: '建议关节镜检查', phrase: '建议关节镜检查进一步评估。', category: '建议' },
    { label: '建议定期复查', phrase: '建议定期复查观察病变变化。', category: '建议' },
  ],
  '骨盆': [
    { label: '骨盆骨质正常', phrase: '骨盆骨质结构完整，未见明显异常。', category: '正常描述' },
    { label: '髋关节正常', phrase: '双侧髋关节形态正常，关节面光滑，间隙正常。', category: '正常描述' },
    { label: '髋臼骨折', phrase: '髋臼可见骨折线影，骨皮质连续性中断。', category: '病理描述' },
    { label: '股骨颈骨折', phrase: '股骨颈可见骨质断裂，可见透亮线影。', category: '病理描述' },
    { label: '股骨头坏死', phrase: '股骨头可见变形，信号不均，可见囊变及硬化。', category: '病理描述' },
    { label: '髋关节退变', phrase: '髋关节间隙变窄，股骨头边缘骨质增生。', category: '退行性改变' },
    { label: '髋关节积液', phrase: '髋关节囊内可见液性信号。', category: '测量描述' },
    { label: '骨盆肿瘤', phrase: '骨盆可见溶骨性/成骨性骨质破坏，周围可见软组织肿块。', category: '病理描述' },
    { label: '骶髂关节炎', phrase: '骶髂关节面模糊，骨质增生硬化。', category: '病理描述' },
    { label: '建议骨科就诊', phrase: '建议骨科门诊随诊。', category: '建议' },
    { label: '建议定期复查', phrase: '建议定期复查观察病变变化。', category: '建议' },
  ],
  '泌尿系统': [
    { label: '双肾形态正常', phrase: '双肾形态、大小正常，位置正常，密度均匀。', category: '正常描述' },
    { label: '肾囊肿', phrase: '肾内可见圆形水样低密度影，边界清晰，壁薄光滑。', category: '病理描述' },
    { label: '多囊肾', phrase: '双肾可见多发大小不等囊性占位，肾功能受损。', category: '病理描述' },
    { label: '肾结石', phrase: '肾盂内可见高密度影，边缘锐利，CT值约200-400HU。', category: '测量描述' },
    { label: '肾积水', phrase: '肾盂扩张，肾盏可见积水，输尿管上段扩张。', category: '病理描述' },
    { label: '肾肿瘤', phrase: '肾内可见实性肿块，边界不清，增强扫描不均匀强化。', category: '病理描述' },
    { label: '肾错构瘤', phrase: '肾内可见混杂密度肿块，内见脂肪及软组织成分。', category: '病理描述' },
    { label: '输尿管结石', phrase: '输尿管某段可见高密度影，上方输尿管扩张。', category: '测量描述' },
    { label: '膀胱形态正常', phrase: '膀胱充盈良好，壁不厚，腔内未见结石或占位。', category: '正常描述' },
    { label: '膀胱结石', phrase: '膀胱内可见高密度影，边缘锐利。', category: '测量描述' },
    { label: '膀胱肿瘤', phrase: '膀胱壁可见结节状/菜花状占位，基底较宽。', category: '病理描述' },
    { label: '膀胱壁增厚', phrase: '膀胱壁可见局限性或弥漫性增厚。', category: '病理描述' },
    { label: '建议泌尿外科就诊', phrase: '建议泌尿外科门诊随诊。', category: '建议' },
    { label: '建议定期复查', phrase: '建议定期复查观察病变变化。', category: '建议' },
    { label: '建议膀胱镜检查', phrase: '建议膀胱镜检查进一步评估。', category: '建议' },
  ],
  '生殖系统': [
    { label: '前列腺形态正常', phrase: '前列腺形态、大小正常，信号均匀。', category: '正常描述' },
    { label: '前列腺增生', phrase: '前列腺增大，可见多发结节，信号不均。', category: '病理描述' },
    { label: '前列腺癌', phrase: '前列腺可见不规则肿块，信号不均，突破包膜。', category: '病理描述' },
    { label: '精囊腺正常', phrase: '双侧精囊腺形态、信号正常。', category: '正常描述' },
    { label: '子宫形态正常', phrase: '子宫形态、大小正常，子宫内膜信号均匀。', category: '正常描述' },
    { label: '子宫肌瘤', phrase: '子宫肌层可见类圆形肿块，边界清楚，T2呈低信号。', category: '病理描述' },
    { label: '子宫内膜癌', phrase: '子宫内膜增厚，可见不规则肿块，侵犯肌层。', category: '病理描述' },
    { label: '卵巢囊肿', phrase: '卵巢内可见薄壁囊性占位，边界清楚。', category: '病理描述' },
    { label: '卵巢肿瘤', phrase: '卵巢可见实性或囊实性肿块，边界不清。', category: '病理描述' },
    { label: '畸胎瘤', phrase: '卵巢内可见混杂信号肿块，内见脂肪、钙化及软组织。', category: '病理描述' },
    { label: '输卵管积液', phrase: '输卵管可见扩张，内见液性信号。', category: '病理描述' },
    { label: '建议妇科就诊', phrase: '建议妇科门诊随诊。', category: '建议' },
    { label: '建议泌尿外科就诊', phrase: '建议泌尿外科门诊随诊。', category: '建议' },
    { label: '建议定期复查', phrase: '建议定期复查观察病变变化。', category: '建议' },
  ],
  '消化系统': [
    { label: '肝脏形态正常', phrase: '肝脏形态大小正常，实质密度均匀，未见异常密度影。', category: '正常描述' },
    { label: '肝血管瘤', phrase: '肝内可见类圆形低密度影，边界清楚，增强扫描边缘结节样强化。', category: '病理描述' },
    { label: '肝囊肿', phrase: '肝内可见圆形水样低密度影，边界清晰，壁薄光滑。', category: '病理描述' },
    { label: '肝细胞癌', phrase: '肝内可见肿块影，边界不清，增强扫描动脉期明显强化，静脉期快速退出。', category: '病理描述' },
    { label: '肝转移瘤', phrase: '肝内可见多发类圆形低密度影，边界清楚，增强扫描环形强化。', category: '病理描述' },
    { label: '肝硬化', phrase: '肝脏体积缩小，肝叶比例失调，表面呈波浪状，脾大。', category: '病理描述' },
    { label: '脂肪肝', phrase: '肝脏密度减低，CT值低于脾脏，肝脏呈脂肪变。', category: '病理描述' },
    { label: '肝脓肿', phrase: '肝内可见液性暗区，边界不清，增强扫描环形强化。', category: '病理描述' },
    { label: '胆囊形态正常', phrase: '胆囊形态正常，壁不厚，腔内未见结石影。', category: '正常描述' },
    { label: '胆囊结石', phrase: '胆囊内可见高密度影，随体位移动。', category: '测量描述' },
    { label: '胆囊炎', phrase: '胆囊壁增厚、毛糙，周围可见渗出。', category: '病理描述' },
    { label: '胆管扩张', phrase: '肝内外胆管扩张，走行区未见结石影。', category: '病理描述' },
    { label: '胆管结石', phrase: '胆管走形区可见高密度影，上游胆管扩张。', category: '测量描述' },
    { label: '胰腺形态正常', phrase: '胰腺形态正常，密度均匀，边缘清楚。', category: '正常描述' },
    { label: '胰腺炎', phrase: '胰腺形态肿胀，密度不均，周围脂肪间隙模糊。', category: '病理描述' },
    { label: '胰腺癌', phrase: '胰腺可见肿块，边界不清，侵犯周围组织。', category: '病理描述' },
    { label: '脾脏形态正常', phrase: '脾脏形态、大小正常，密度均匀。', category: '正常描述' },
    { label: '脾大', phrase: '脾脏体积增大，下缘超过肝下缘。', category: '测量描述' },
    { label: '建议消化内科就诊', phrase: '建议消化内科门诊随诊。', category: '建议' },
    { label: '建议普外科就诊', phrase: '建议普外科门诊随诊。', category: '建议' },
    { label: '建议定期复查', phrase: '建议定期复查观察病变变化。', category: '建议' },
    { label: '建议肿瘤科就诊', phrase: '建议肿瘤科门诊随诊。', category: '建议' },
  ],
  '血管': [
    { label: '血管走形正常', phrase: '血管走形正常，管壁不厚，管腔通畅。', category: '正常描述' },
    { label: '动脉硬化', phrase: '血管壁可见钙化斑块，管腔粗细不均。', category: '病理描述' },
    { label: '动脉瘤', phrase: '血管局部呈瘤样扩张，壁薄光滑。', category: '病理描述' },
    { label: '主动脉夹层', phrase: '主动脉可见内膜片影及双腔改变。', category: '危急值' },
    { label: '血管狭窄', phrase: '血管管腔狭窄约XX%，可见粥样硬化斑块。', category: '测量描述' },
    { label: '血管闭塞', phrase: '血管管腔突然中断，可见残端。', category: '病理描述' },
    { label: '血管畸形', phrase: '血管走形异常，可见团状迂曲扩张血管。', category: '病理描述' },
    { label: '深静脉血栓', phrase: '深静脉内可见充盈缺损，局部管腔闭塞。', category: '病理描述' },
    { label: '肺栓塞', phrase: '肺动脉可见充盈缺损，肺梗死灶。', category: '危急值' },
    { label: '建议血管外科就诊', phrase: '建议血管外科门诊随诊。', category: '建议' },
    { label: '建议介入科就诊', phrase: '建议介入科评估介入治疗指征。', category: '建议' },
    { label: '建议抗凝治疗', phrase: '建议抗凝治疗，定期监测凝血功能。', category: '建议' },
  ],
}

// ============================================================
// [NEW] 扩充AI推荐数据库 (5+ per modality/bodyPart)
// ============================================================
const ENHANCED_AI_RECOMMENDATIONS: Record<string, {
  findings: { content: string; confidence: number; source: string }[]
  conclusions: { content: string; confidence: number; typicalFor: string[] }[]
  completeness: string[]
}> = {
  'CT-头颅': {
    findings: [
      { content: '脑实质密度均匀，未见异常密度影，脑室系统形态正常，中线结构居中，脑沟脑回清晰。', confidence: 95, source: '正常颅脑模板' },
      { content: '左侧大脑中动脉M1段管腔狭窄约50%，局部管壁可见钙化斑块，管腔粗细不均。', confidence: 88, source: '脑血管病变库' },
      { content: '右侧额叶可见一类圆形低密度影，边界模糊，大小约2.5×3.0cm，CT值约25HU，周围水肿轻度。', confidence: 85, source: '颅内占位库' },
      { content: '双侧脑室对称性扩大，脑回脑沟增宽加深，幕上脑室周围白质密度减低。', confidence: 82, source: '脑萎缩模板' },
      { content: '左侧颞叶可见团块状高密度影，边界清楚，大小约3.0×2.5cm，周围可见水肿带。', confidence: 90, source: '脑出血模板' },
      { content: '桥脑可见一类圆形长T1长T2信号，边缘清楚，大小约1.5×1.5cm，增强扫描轻度强化。', confidence: 78, source: '颅内占位库' },
    ],
    conclusions: [
      { content: '颅内未见明显异常，建议定期复查。', confidence: 92, typicalFor: ['外伤筛查', '头痛查因', '健康体检'] },
      { content: '左侧大脑中动脉狭窄，建议CTA进一步检查。', confidence: 85, typicalFor: ['脑血管评估', '卒中筛查'] },
      { content: '右侧额叶占位性病变，建议增强扫描或MRI检查。', confidence: 80, typicalFor: ['颅内肿瘤筛查'] },
      { content: '脑白质疏松，建议定期复查。', confidence: 75, typicalFor: ['退行性病变评估'] },
      { content: '老年性脑改变，脑萎缩，请结合临床。', confidence: 78, typicalFor: ['年龄相关改变'] },
    ],
    completeness: ['描述脑室系统', '描述中线结构', '描述脑实质密度', '描述脑沟脑回', '描述脑膜', '描述颅骨骨质'],
  },
  'CT-胸部': {
    findings: [
      { content: '双肺野透亮度正常，肺纹理清晰，走行自然，双肺门结构正常，纵隔居中。', confidence: 95, source: '正常胸部模板' },
      { content: '右肺上叶尖段可见一实性结节，大小约1.2×1.0cm，边界清楚，可见分叶征，毛刺征不明显。', confidence: 88, source: '肺结节库' },
      { content: '双侧胸腔可见弧形水样密度影，右侧重，右侧肋膈角变钝，积液量约XXml。', confidence: 90, source: '胸腔积液模板' },
      { content: '左肺下叶可见斑片状高密度影，边界模糊，密度不均，可见充气支气管征。', confidence: 85, source: '肺炎模板' },
      { content: '右肺中叶可见团块影，大小约4.5×3.8cm，边界不清，可见分叶及胸膜牵拉。', confidence: 87, source: '肺肿瘤库' },
      { content: '双肺可见多发小结节影，边界清楚，最大者直径约0.6cm。', confidence: 82, source: '肺转移库' },
    ],
    conclusions: [
      { content: '胸部CT平扫未见明显异常，建议定期体检。', confidence: 95, typicalFor: ['健康体检', '术前检查'] },
      { content: '右肺上叶肺结节，建议定期随访复查。', confidence: 88, typicalFor: ['肺结节随访'] },
      { content: '双侧胸腔积液，建议查找原因。', confidence: 85, typicalFor: ['胸腔积液查因'] },
      { content: '左肺下叶炎症，建议抗炎治疗后复查。', confidence: 88, typicalFor: ['肺炎随访'] },
      { content: '右肺中叶占位，建议增强CT或穿刺活检。', confidence: 80, typicalFor: ['肺肿瘤评估'] },
    ],
    completeness: ['描述肺野', '描述肺纹理', '描述肺门', '描述纵隔', '描述胸膜', '描述心脏', '描述大血管'],
  },
  'CT-腹部': {
    findings: [
      { content: '肝脏形态大小正常，实质密度均匀，未见异常密度影，肝内血管走行正常。', confidence: 95, source: '正常腹部模板' },
      { content: '肝右叶可见一类圆形低密度影，边界清晰，大小约3.5×4.0cm，CT值约15HU，增强扫描边缘强化。', confidence: 88, source: '肝脏占位库' },
      { content: '胆囊形态正常，壁不厚，腔内未见结石影，肝内外胆管无扩张。', confidence: 92, source: '胆囊模板' },
      { content: '双肾形态正常，右肾盂内可见点状高密度影，大小约0.5cm，边界锐利。', confidence: 90, source: '泌尿系模板' },
      { content: '胰腺形态正常，密度均匀，边缘清楚，胰管无扩张。', confidence: 93, source: '胰腺模板' },
      { content: '脾脏形态、大小正常，密度均匀，未见异常密度影。', confidence: 94, source: '脾脏模板' },
    ],
    conclusions: [
      { content: '腹部CT平扫未见明显异常，建议定期体检。', confidence: 95, typicalFor: ['健康体检'] },
      { content: '肝右叶囊肿，建议定期复查。', confidence: 88, typicalFor: ['肝脏占位随访'] },
      { content: '右肾结石，建议泌尿外科随诊。', confidence: 90, typicalFor: ['泌尿系结石'] },
      { content: '胆囊结石，建议普外科就诊。', confidence: 88, typicalFor: ['胆囊疾病'] },
      { content: '肝内占位性病变，建议进一步增强扫描或MRI检查。', confidence: 82, typicalFor: ['肝脏占位评估'] },
    ],
    completeness: ['描述肝脏', '描述胆囊', '描述胰腺', '描述脾脏', '描述肾脏', '描述肾上腺', '描述肠道', '描述腹膜后'],
  },
  'MR-头颅': {
    findings: [
      { content: '脑实质内未见异常信号影，脑室系统形态正常，中线结构居中。', confidence: 95, source: '正常颅脑MR模板' },
      { content: '右侧半卵圆中心可见斑片状长T1长T2信号，DWI呈高信号，ADC值减低。', confidence: 88, source: '脑梗死模板' },
      { content: '桥脑可见一类圆形长T1长T2信号，边缘清楚，大小约1.5×1.5cm。', confidence: 82, source: '颅内占位库' },
      { content: '双侧脑室旁白质可见散在点状长T2信号，边缘清楚，无占位效应。', confidence: 85, source: '脑白质病变库' },
      { content: '垂体可见局限性向上突出，鞍底凹陷，垂体柄偏移。', confidence: 80, source: '垂体病变库' },
      { content: '左侧颞叶可见团块状异常信号，T1呈等信号，T2呈高信号，增强扫描明显不均匀强化。', confidence: 85, source: '脑肿瘤库' },
    ],
    conclusions: [
      { content: '颅脑MRI平扫未见明显异常，建议定期复查。', confidence: 95, typicalFor: ['健康体检', '头痛查因'] },
      { content: '右侧半卵圆中心急性期脑梗死，建议神经内科就诊。', confidence: 90, typicalFor: ['急性脑血管事件'] },
      { content: '桥脑占位性病变，建议增强扫描。', confidence: 80, typicalFor: ['颅内肿瘤筛查'] },
      { content: '脑白质变性，建议定期复查。', confidence: 75, typicalFor: ['退行性病变评估'] },
      { content: '垂体微腺瘤可能，建议内分泌科随诊。', confidence: 78, typicalFor: ['垂体病变评估'] },
    ],
    completeness: ['描述T1信号', '描述T2信号', '描述DWI信号', '描述FLAIR信号', '描述强化方式', '描述中线结构'],
  },
  'DR-胸部': {
    findings: [
      { content: '双肺野透亮度正常，肺纹理清晰，双肺门结构正常，心影形态大小正常。', confidence: 95, source: '正常胸片模板' },
      { content: '心影形态大小正常，双侧肋膈角锐利，余肺野清晰。', confidence: 92, source: '正常心胸模板' },
      { content: '右肺野可见片状密度增高影，边界模糊，余肺野清晰。', confidence: 88, source: '肺炎模板' },
      { content: '左侧肋骨骨质结构完整，未见明确骨折征象。', confidence: 90, source: '外伤模板' },
      { content: '右下肺野可见斑片状阴影，密度不均，边缘模糊。', confidence: 86, source: '肺炎模板' },
    ],
    conclusions: [
      { content: '胸部X线片未见明显异常，建议定期体检。', confidence: 95, typicalFor: ['健康体检', '术前检查'] },
      { content: '右下肺炎症，建议抗炎治疗后复查。', confidence: 88, typicalFor: ['肺炎随访'] },
      { content: '心影增大，建议进一步检查。', confidence: 80, typicalFor: ['心脏评估'] },
      { content: '左侧肋骨骨折，请结合临床。', confidence: 85, typicalFor: ['外伤评估'] },
      { content: '两肺纹理增粗，请结合临床，建议必要时CT检查。', confidence: 75, typicalFor: ['呼吸道症状'] },
    ],
    completeness: ['描述肺野', '描述肺纹理', '描述心影', '描述肋膈角', '描述骨骼', '描述纵隔'],
  },
}

// ============================================================
// [NEW] 扩充危急值模板 (10个)
// ============================================================
const CRITICAL_VALUE_TEMPLATES = [
  { id: 'cv001', term: '大量气胸（肺组织压缩>50%）', details: '左/右侧大量气胸，左/右肺组织压缩约XX%，纵隔向对侧移位，建议立即胸腔穿刺引流。', urgency: '立即' },
  { id: 'cv002', term: '大量胸腔积液', details: '左/右侧胸腔可见大量弧形水样密度影，右/左侧肋膈角消失，建议立即穿刺引流。', urgency: '立即' },
  { id: 'cv003', term: '急性心肌梗死改变', details: '左室壁节段性运动异常，符合急性心肌梗死改变，建议立即心内科就诊。', urgency: '立即' },
  { id: 'cv004', term: '大面积脑梗死（超过一个脑叶）', details: '左/右侧大脑中动脉供血区大面积低密度影，超过一个脑叶，考虑急性大面积脑梗死，建议立即神经内科就诊。', urgency: '立即' },
  { id: 'cv005', term: '颅内出血（外伤性/自发性）', details: '颅内可见团块状高密度影，CT值约60-80HU，考虑颅内出血，建议立即神经外科就诊。', urgency: '立即' },
  { id: 'cv006', term: '主动脉夹层', details: '主动脉可见内膜片影及双腔改变，考虑主动脉夹层，建议立即血管外科就诊。', urgency: '立即' },
  { id: 'cv007', term: '肺栓塞', details: '肺动脉可见充盈缺损，考虑肺栓塞，建议立即急诊科就诊。', urgency: '立即' },
  { id: 'cv008', term: '消化道穿孔', details: '腹腔可见游离气体密度影，考虑消化道穿孔，建议立即外科就诊。', urgency: '立即' },
  { id: 'cv009', term: '肠系膜血栓', details: '肠系膜血管可见血栓形成，肠管扩张积气积液，考虑肠系膜血栓，建议立即外科就诊。', urgency: '立即' },
  { id: 'cv010', term: '急性胰腺炎坏死', details: '胰腺体积肿大，密度不均，周围渗出明显，符合急性坏死性胰腺炎，建议立即住院治疗。', urgency: '立即' },
  { id: 'cv011', term: '脾破裂', details: '脾脏形态不完整，可见弧形低密度影及腹腔积血，考虑脾破裂，建议立即外科就诊。', urgency: '立即' },
  { id: 'cv012', term: '肝破裂', details: '肝脏可见裂伤及腹腔积血，考虑肝破裂，建议立即外科就诊。', urgency: '立即' },
  { id: 'cv013', term: '心包填塞', details: '心包可见大量积液，右心室受压塌陷，考虑心包填塞，建议立即心内科就诊。', urgency: '立即' },
  { id: 'cv014', term: '张力性气胸', details: '左/右侧气胸，肺组织完全压缩，纵隔向对侧移位，考虑张力性气胸，建议立即胸腔穿刺引流。', urgency: '立即' },
  { id: 'cv015', term: '急性肺栓塞', details: '肺动脉主干可见充盈缺损，考虑急性肺栓塞，建议立即急诊科就诊。', urgency: '立即' },
  { id: 'cv016', term: '急性心肌梗死', details: '冠脉某支完全闭塞，左室壁节段性运动异常，考虑急性心肌梗死，建议立即心内科就诊。', urgency: '立即' },
  { id: 'cv017', term: '主动脉夹层', details: '主动脉可见内膜片影及真假腔形成，考虑主动脉夹层，建议立即血管外科就诊。', urgency: '立即' },
  { id: 'cv018', term: '腹部空腔脏器穿孔', details: '腹腔可见游离气体密度影，考虑消化道穿孔，建议立即外科就诊。', urgency: '立即' },
  { id: 'cv019', term: '急性坏死性胰腺炎', details: '胰腺大片坏死，周围渗出明显，符合急性坏死性胰腺炎，建议立即住院治疗。', urgency: '立即' },
  { id: 'cv020', term: '急性阑尾炎穿孔', details: '阑尾增粗肿胀，壁不连续，腹腔可见渗出，考虑阑尾穿孔，建议立即外科就诊。', urgency: '立即' },
  { id: 'cv021', term: '异位妊娠破裂', details: '附件区可见混杂回声包块，盆腹腔可见积液，考虑异位妊娠破裂，建议立即妇科就诊。', urgency: '立即' },
  { id: 'cv022', term: '卵巢囊肿蒂扭转', details: '卵巢囊肿体积显著增大，蒂部可见盘旋征，考虑囊肿蒂扭转，建议立即妇科就诊。', urgency: '立即' },
  { id: 'cv023', term: '睾丸扭转', details: '睾丸肿大，血流信号消失，考虑睾丸扭转，建议立即泌尿外科就诊。', urgency: '立即' },
  { id: 'cv024', term: '急性脑疝', details: '中线结构偏移超过5mm，脑室受压变形，考虑脑疝形成，建议立即神经外科就诊。', urgency: '立即' },
  { id: 'cv025', term: '大量腹水合并感染', details: '腹腔可见大量积液，密度增高，腹膜增厚强化，考虑腹水感染，建议立即抗感染治疗。', urgency: '立即' },
  { id: 'cv026', term: '肠系膜上动脉栓塞', details: '肠系膜上动脉可见充盈缺损，小肠肠壁增厚水肿，考虑肠系膜上动脉栓塞，建议立即血管外科就诊。', urgency: '立即' },
  { id: 'cv027', term: '门静脉血栓形成', details: '门静脉内可见充盈缺损，肠管扩张积气积液，考虑门静脉血栓形成，建议立即介入科就诊。', urgency: '立即' },
  { id: 'cv028', term: '下肢深静脉血栓脱落', details: '下肢深静脉血栓形成，游离浮动的血栓头端，建议立即抗凝治疗，警惕肺栓塞。', urgency: '立即' },
  { id: 'cv029', term: '急性梗阻性化脓性胆管炎', details: '肝内外胆管显著扩张，胆管壁增厚强化，胆囊增大张力高，考虑急性梗阻性化脓性胆管炎，建议立即普外科就诊。', urgency: '立即' },
  { id: 'cv030', term: '急性化脓性骨髓炎', details: '骨质可见溶骨性破坏，周围软组织肿胀明显，内见气体密度影，考虑急性化脓性骨髓炎，建议立即骨科就诊。', urgency: '立即' },
]
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
  { label: 'CT脊柱', modality: 'CT', bodyPart: '脊柱', color: s.ctColor, icon: BoneIcon },
  { label: '冠脉CTA', modality: 'CT', bodyPart: '心脏', color: '#dc2626', icon: Heart },
  { label: 'MR头部', modality: 'MR', bodyPart: '头颅', color: s.mrColor, icon: Brain },
  { label: 'MR腹部', modality: 'MR', bodyPart: '腹部', color: s.mrColor, icon: Activity },
  { label: 'MR脊柱', modality: 'MR', bodyPart: '脊柱', color: s.mrColor, icon: BoneIcon },
  { label: 'DR胸部', modality: 'DR', bodyPart: '胸部', color: s.drColor, icon: Activity },
  { label: 'DR四肢', modality: 'DR', bodyPart: '四肢', color: s.drColor, icon: BoneIcon },
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
// [NEW] 结构化报告模板（岱嘉模式）
// ============================================================
const STRUCTURED_TEMPLATES: StructuredTemplate[] = [
  {
    id: 'st_ct_head',
    name: 'CT头部平扫模板',
    modality: 'CT',
    bodyPart: '头颅',
    sections: [
      { id: 's1', label: '脑实质', placeholder: '描述脑实质密度、信号是否均匀...', type: 'text', required: true },
      { id: 's2', label: '脑室系统', placeholder: '描述脑室形态、大小是否正常...', type: 'text', required: true },
      { id: 's3', label: '中线结构', placeholder: '描述中线是否居中...', type: 'text', required: true },
      { id: 's4', label: '脑沟脑回', placeholder: '描述脑沟脑回形态是否正常...', type: 'text', required: false },
      { id: 's5', label: '颅骨骨质', placeholder: '描述颅骨是否完整...', type: 'text', required: false },
      { id: 's6', label: '测量数据', placeholder: '病变大小测量值（长×宽×高）...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '颅脑CT平扫未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_ct_chest',
    name: 'CT胸部平扫模板',
    modality: 'CT',
    bodyPart: '胸部',
    sections: [
      { id: 's1', label: '肺野', placeholder: '描述肺野透亮度、肺纹理...', type: 'text', required: true },
      { id: 's2', label: '肺门纵隔', placeholder: '描述肺门、纵隔淋巴结...', type: 'text', required: true },
      { id: 's3', label: '胸膜', placeholder: '描述胸膜是否增厚、有无积液...', type: 'text', required: false },
      { id: 's4', label: '心脏大血管', placeholder: '描述心脏形态、大血管...', type: 'text', required: false },
      { id: 's5', label: '胸廓骨骼', placeholder: '描述肋骨、胸椎...', type: 'text', required: false },
      { id: 's6', label: '测量数据', placeholder: '结节大小、积液量...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '胸部CT平扫未见明显异常。',
    recommendationTemplate: '建议定期体检。',
  },
  {
    id: 'st_ct_abdomen',
    name: 'CT腹部平扫模板',
    modality: 'CT',
    bodyPart: '腹部',
    sections: [
      { id: 's1', label: '肝脏', placeholder: '描述肝脏形态、大小、密度...', type: 'text', required: true },
      { id: 's2', label: '胆囊胆管', placeholder: '描述胆囊形态、胆管是否扩张...', type: 'text', required: true },
      { id: 's3', label: '胰腺', placeholder: '描述胰腺形态、密度...', type: 'text', required: false },
      { id: 's4', label: '脾脏', placeholder: '描述脾脏形态、大小...', type: 'text', required: false },
      { id: 's5', label: '肾脏', placeholder: '描述双肾形态、有无结石...', type: 'text', required: false },
      { id: 's6', label: '测量数据', placeholder: '肿块大小、囊肿大小...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '腹部CT平扫未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_mr_head',
    name: 'MR头部平扫模板',
    modality: 'MR',
    bodyPart: '头颅',
    sections: [
      { id: 's1', label: 'T1信号', placeholder: '描述T1加权信号...', type: 'text', required: true },
      { id: 's2', label: 'T2信号', placeholder: '描述T2加权信号...', type: 'text', required: true },
      { id: 's3', label: 'DWI序列', placeholder: '描述DWI是否受限...', type: 'text', required: false },
      { id: 's4', label: 'FLAIR序列', placeholder: '描述FLAIR信号...', type: 'text', required: false },
      { id: 's5', label: '强化方式', placeholder: '描述增强扫描强化特点...', type: 'text', required: false },
      { id: 's6', label: '测量数据', placeholder: '病变大小测量值...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '颅脑MRI平扫未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_dr_chest',
    name: 'DR胸部正侧位模板',
    modality: 'DR',
    bodyPart: '胸部',
    sections: [
      { id: 's1', label: '肺野', placeholder: '描述肺野是否清晰...', type: 'text', required: true },
      { id: 's2', label: '肺纹理', placeholder: '描述肺纹理是否增粗...', type: 'text', required: false },
      { id: 's3', label: '心影', placeholder: '描述心影形态大小...', type: 'text', required: true },
      { id: 's4', label: '肋膈角', placeholder: '描述肋膈角是否锐利...', type: 'text', required: false },
      { id: 's5', label: '骨骼', placeholder: '描述肋骨、胸椎是否完整...', type: 'text', required: false },
    ],
    conclusionTemplate: '胸部X线片未见明显异常。',
    recommendationTemplate: '建议定期体检。',
  },
  {
    id: 'st_ct_spine_cervical',
    name: 'CT颈椎平扫模板',
    modality: 'CT',
    bodyPart: '脊柱',
    sections: [
      { id: 's1', label: '椎体', placeholder: '描述椎体形态、骨质是否完整...', type: 'text', required: true },
      { id: 's2', label: '椎间盘', placeholder: '描述椎间盘是否突出或膨出...', type: 'text', required: true },
      { id: 's3', label: '椎管', placeholder: '描述椎管是否狭窄...', type: 'text', required: false },
      { id: 's4', label: '韧带', placeholder: '描述黄韧带、后纵韧带是否肥厚或骨化...', type: 'text', required: false },
      { id: 's5', label: '脊髓', placeholder: '描述脊髓形态、信号是否正常...', type: 'text', required: false },
      { id: 's6', label: '测量数据', placeholder: '椎管狭窄程度、突出大小...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '颈椎椎间盘突出，建议骨科随诊。',
    recommendationTemplate: '建议骨科随诊，避免长期低头。',
  },
  {
    id: 'st_ct_spine_lumbar',
    name: 'CT腰椎平扫模板',
    modality: 'CT',
    bodyPart: '脊柱',
    sections: [
      { id: 's1', label: '椎体', placeholder: '描述椎体形态、骨质是否完整...', type: 'text', required: true },
      { id: 's2', label: '椎间盘', placeholder: '描述椎间盘是否突出或膨出...', type: 'text', required: true },
      { id: 's3', label: '椎管', placeholder: '描述椎管是否狭窄...', type: 'text', required: false },
      { id: 's4', label: '小关节', placeholder: '描述小关节是否增生、肥大...', type: 'text', required: false },
      { id: 's5', label: '软组织', placeholder: '描述椎旁软组织是否肿胀...', type: 'text', required: false },
      { id: 's6', label: '测量数据', placeholder: '椎管狭窄程度、突出大小...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '腰椎椎间盘突出，建议骨科随诊。',
    recommendationTemplate: '建议骨科随诊，避免久坐劳累。',
  },
  {
    id: 'st_ct_pelvis',
    name: 'CT盆腔平扫模板',
    modality: 'CT',
    bodyPart: '盆腔',
    sections: [
      { id: 's1', label: '膀胱', placeholder: '描述膀胱充盈程度、壁是否增厚...', type: 'text', required: true },
      { id: 's2', label: '前列腺/子宫', placeholder: '描述前列腺/子宫形态、大小是否正常...', type: 'text', required: true },
      { id: 's3', label: '直肠', placeholder: '描述直肠壁是否增厚、周围脂肪间隙是否清晰...', type: 'text', required: false },
      { id: 's4', label: '淋巴结', placeholder: '描述盆腔淋巴结是否肿大...', type: 'text', required: false },
      { id: 's5', label: '骨骼', placeholder: '描述髂骨、耻骨、坐骨是否完整...', type: 'text', required: false },
      { id: 's6', label: '测量数据', placeholder: '肿块大小、淋巴结短径...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '盆腔CT平扫未见明显异常。',
    recommendationTemplate: '建议定期体检。',
  },
  {
    id: 'st_ct_urinary',
    name: 'CT泌尿系平扫模板',
    modality: 'CT',
    bodyPart: '泌尿系统',
    sections: [
      { id: 's1', label: '肾脏', placeholder: '描述双肾形态、大小、位置、密度是否正常...', type: 'text', required: true },
      { id: 's2', label: '输尿管', placeholder: '描述输尿管是否扩张、管壁是否增厚...', type: 'text', required: true },
      { id: 's3', label: '膀胱', placeholder: '描述膀胱充盈程度、壁是否增厚、腔内有无结石或占位...', type: 'text', required: true },
      { id: 's4', label: '腹膜后', placeholder: '描述腹膜后淋巴结是否肿大...', type: 'text', required: false },
      { id: 's5', label: '测量数据', placeholder: '结石大小、肾盂积水程度...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '泌尿系CT平扫未见明显异常。',
    recommendationTemplate: '建议多饮水，定期复查。',
  },
  {
    id: 'st_ct_limbs',
    name: 'CT四肢骨关节模板',
    modality: 'CT',
    bodyPart: '四肢',
    sections: [
      { id: 's1', label: '骨质', placeholder: '描述骨皮质、骨松质是否完整、有无破坏...', type: 'text', required: true },
      { id: 's2', label: '关节', placeholder: '描述关节面、关节间隙是否正常...', type: 'text', required: true },
      { id: 's3', label: '软组织', placeholder: '描述周围软组织是否肿胀、有无肿块...', type: 'text', required: false },
      { id: 's4', label: '测量数据', placeholder: '骨折线长度、骨破坏范围...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '四肢骨关节CT未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_mr_spine',
    name: 'MR脊柱平扫模板',
    modality: 'MR',
    bodyPart: '脊柱',
    sections: [
      { id: 's1', label: '椎体信号', placeholder: '描述椎体T1、T2信号是否均匀...', type: 'text', required: true },
      { id: 's2', label: '椎间盘信号', placeholder: '描述椎间盘信号是否均匀、有无突出...', type: 'text', required: true },
      { id: 's3', label: '脊髓信号', placeholder: '描述脊髓形态、信号是否正常...', type: 'text', required: false },
      { id: 's4', label: '韧带', placeholder: '描述韧带是否肥厚、信号是否增高...', type: 'text', required: false },
      { id: 's5', label: '测量数据', placeholder: '椎管狭窄程度、病变大小...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '脊柱MRI平扫未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_mr_prostate',
    name: 'MR前列腺平扫模板',
    modality: 'MR',
    bodyPart: '盆腔',
    sections: [
      { id: 's1', label: '前列腺大小', placeholder: '描述前列腺体积、形态是否正常...', type: 'text', required: true },
      { id: 's2', label: '前列腺信号', placeholder: '描述前列腺各区带信号是否均匀...', type: 'text', required: true },
      { id: 's3', label: '精囊腺', placeholder: '描述精囊腺形态、信号是否正常...', type: 'text', required: false },
      { id: 's4', label: '周围组织', placeholder: '描述直肠、膀胱、淋巴结情况...', type: 'text', required: false },
      { id: 's5', label: '测量数据', placeholder: '前列腺大小、结节大小...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '前列腺MRI平扫未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_mr_uterus',
    name: 'MR子宫平扫模板',
    modality: 'MR',
    bodyPart: '盆腔',
    sections: [
      { id: 's1', label: '子宫形态', placeholder: '描述子宫形态、大小是否正常...', type: 'text', required: true },
      { id: 's2', label: '子宫内膜', placeholder: '描述子宫内膜厚度、信号是否正常...', type: 'text', required: true },
      { id: 's3', label: '肌层', placeholder: '描述子宫肌层信号是否均匀、有无肿块...', type: 'text', required: false },
      { id: 's4', label: '附件', placeholder: '描述双侧卵巢、输卵管情况...', type: 'text', required: false },
      { id: 's5', label: '测量数据', placeholder: '子宫大小、肌瘤大小...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '子宫MRI平扫未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_mr_liver',
    name: 'MR肝脏平扫模板',
    modality: 'MR',
    bodyPart: '腹部',
    sections: [
      { id: 's1', label: '肝脏形态', placeholder: '描述肝脏形态、大小是否正常...', type: 'text', required: true },
      { id: 's2', label: '肝实质信号', placeholder: '描述肝脏T1、T2信号是否均匀...', type: 'text', required: true },
      { id: 's3', label: '肝内管道', placeholder: '描述肝内血管、胆管是否扩张...', type: 'text', required: false },
      { id: 's4', label: '胆道', placeholder: '描述胆囊形态、胆管是否扩张...', type: 'text', required: false },
      { id: 's5', label: '测量数据', placeholder: '肿块大小、囊肿大小...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '肝脏MRI平扫未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_ct_chest_contrast',
    name: 'CT胸部增强扫描模板',
    modality: 'CT',
    bodyPart: '胸部',
    sections: [
      { id: 's1', label: '肺野', placeholder: '描述肺野纹理、密度是否正常...', type: 'text', required: true },
      { id: 's2', label: '肺门纵隔强化', placeholder: '描述肺门、纵隔淋巴结强化特点...', type: 'text', required: true },
      { id: 's3', label: '胸膜', placeholder: '描述胸膜是否增厚、有无结节强化...', type: 'text', required: false },
      { id: 's4', label: '血管强化', placeholder: '描述主动脉、肺动脉强化程度...', type: 'text', required: false },
      { id: 's5', label: '测量数据', placeholder: '淋巴结短径、肿块大小...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '胸部CT增强扫描未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_ct_abdomen_contrast',
    name: 'CT腹部增强扫描模板',
    modality: 'CT',
    bodyPart: '腹部',
    sections: [
      { id: 's1', label: '肝脏强化', placeholder: '描述肝脏动脉期、静脉期、延迟期强化特点...', type: 'text', required: true },
      { id: 's2', label: '胆道强化', placeholder: '描述胆囊、胆管强化特点...', type: 'text', required: true },
      { id: 's3', label: '胰腺强化', placeholder: '描述胰腺强化程度、是否均匀...', type: 'text', required: false },
      { id: 's4', label: '脾脏强化', placeholder: '描述脾脏强化特点...', type: 'text', required: false },
      { id: 's5', label: '肾脏强化', placeholder: '描述双肾强化特点、皮髓质分界...', type: 'text', required: false },
      { id: 's6', label: '测量数据', placeholder: '肿块大小、强化程度...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '腹部CT增强扫描未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_ct_coronary',
    name: '冠状动脉CTA模板',
    modality: 'CTA',
    bodyPart: '心脏',
    sections: [
      { id: 's1', label: '左主干', placeholder: '描述左主干管壁、管腔情况...', type: 'text', required: true },
      { id: 's2', label: '前降支', placeholder: '描述前降支管壁、管腔狭窄情况...', type: 'text', required: true },
      { id: 's3', label: '回旋支', placeholder: '描述回旋支管壁、管腔狭窄情况...', type: 'text', required: true },
      { id: 's4', label: '右冠状动脉', placeholder: '描述右冠管壁、管腔狭窄情况...', type: 'text', required: true },
      { id: 's5', label: '斑块性质', placeholder: '描述斑块性质（软斑块、混合斑块、钙化斑块）...', type: 'text', required: false },
      { id: 's6', label: '测量数据', placeholder: '狭窄程度（%）、斑块长度...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '冠脉CTA未见明显异常。',
    recommendationTemplate: '建议定期复查，规律服药。',
  },
  {
    id: 'st_ct_aorta',
    name: '主动脉CTA模板',
    modality: 'CTA',
    bodyPart: '血管',
    sections: [
      { id: 's1', label: '升主动脉', placeholder: '描述升主动脉形态、管壁、管腔情况...', type: 'text', required: true },
      { id: 's2', label: '主动脉弓', placeholder: '描述主动脉弓形态、分支血管情况...', type: 'text', required: true },
      { id: 's3', label: '降主动脉', placeholder: '描述降主动脉形态、管壁情况...', type: 'text', required: true },
      { id: 's4', label: '腹主动脉', placeholder: '描述腹主动脉形态、有无扩张或夹层...', type: 'text', required: false },
      { id: 's5', label: '测量数据', placeholder: '主动脉直径、夹层长度...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '主动脉CTA未见明显异常。',
    recommendationTemplate: '建议定期复查，规律控制血压。',
  },
  {
    id: 'st_ct_pulmonary_artery',
    name: '肺动脉CTA模板',
    modality: 'CTA',
    bodyPart: '血管',
    sections: [
      { id: 's1', label: '肺动脉主干', placeholder: '描述肺动脉主干形态、有无充盈缺损...', type: 'text', required: true },
      { id: 's2', label: '左肺动脉', placeholder: '描述左肺动脉分支情况...', type: 'text', required: true },
      { id: 's3', label: '右肺动脉', placeholder: '描述右肺动脉分支情况...', type: 'text', required: true },
      { id: 's4', label: '肺梗死灶', placeholder: '描述有无肺梗死灶及部位...', type: 'text', required: false },
      { id: 's5', label: '测量数据', placeholder: '栓子大小、狭窄程度...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '肺动脉CTA未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_dr_abdomen',
    name: 'DR腹部立卧位模板',
    modality: 'DR',
    bodyPart: '腹部',
    sections: [
      { id: 's1', label: '膈下气体', placeholder: '描述膈下有无游离气体...', type: 'text', required: true },
      { id: 's2', label: '肠管气体', placeholder: '描述肠管充气情况、有无气液平面...', type: 'text', required: true },
      { id: 's3', label: '腹部钙化', placeholder: '描述有无异常钙化影...', type: 'text', required: false },
      { id: 's4', label: '腹部肿块', placeholder: '描述有无异常肿块影...', type: 'text', required: false },
      { id: 's5', label: '骨骼', placeholder: '描述腰椎、骨盆骨骼情况...', type: 'text', required: false },
    ],
    conclusionTemplate: '腹部X线片未见明显异常。',
    recommendationTemplate: '建议定期体检。',
  },
  {
    id: 'st_dr_spine',
    name: 'DR脊柱正侧位模板',
    modality: 'DR',
    bodyPart: '脊柱',
    sections: [
      { id: 's1', label: '椎体', placeholder: '描述椎体形态、排列是否正常...', type: 'text', required: true },
      { id: 's2', label: '椎间隙', placeholder: '描述椎间隙是否变窄...', type: 'text', required: false },
      { id: 's3', label: '骨质', placeholder: '描述骨质结构是否完整、有无骨质增生...', type: 'text', required: false },
      { id: 's4', label: '软组织', placeholder: '描述椎旁软组织是否正常...', type: 'text', required: false },
    ],
    conclusionTemplate: '脊柱X线片未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_dr_limbs',
    name: 'DR四肢关节模板',
    modality: 'DR',
    bodyPart: '四肢',
    sections: [
      { id: 's1', label: '骨质', placeholder: '描述骨皮质、骨松质是否完整...', type: 'text', required: true },
      { id: 's2', label: '关节', placeholder: '描述关节面、关节间隙是否正常...', type: 'text', required: true },
      { id: 's3', label: '软组织', placeholder: '描述周围软组织是否肿胀、有无钙化...', type: 'text', required: false },
      { id: 's4', label: '测量数据', placeholder: '骨折线长度、移位程度...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '四肢关节X线片未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_ct_head_contrast',
    name: 'CT头部增强扫描模板',
    modality: 'CT',
    bodyPart: '头颅',
    sections: [
      { id: 's1', label: '脑实质强化', placeholder: '描述脑实质有无异常强化灶...', type: 'text', required: true },
      { id: 's2', label: '脑膜强化', placeholder: '描述脑膜是否增厚、强化...', type: 'text', required: false },
      { id: 's3', label: '血管强化', placeholder: '描述脑血管强化程度、有无动脉瘤强化...', type: 'text', required: false },
      { id: 's4', label: '测量数据', placeholder: '强化灶大小、数量...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '颅脑CT增强扫描未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_ct_neck',
    name: 'CT颈部模板',
    modality: 'CT',
    bodyPart: '颈部',
    sections: [
      { id: 's1', label: '甲状腺', placeholder: '描述甲状腺形态、大小、密度是否正常...', type: 'text', required: true },
      { id: 's2', label: '颈部淋巴结', placeholder: '描述颈部淋巴结是否肿大...', type: 'text', required: true },
      { id: 's3', label: '颈部血管', placeholder: '描述颈总动脉、颈内动脉、颈外动脉情况...', type: 'text', required: false },
      { id: 's4', label: '咽喉', placeholder: '描述喉部、会厌、梨状窝情况...', type: 'text', required: false },
      { id: 's5', label: '测量数据', placeholder: '结节大小、淋巴结短径...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '颈部CT平扫未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_ct_mammary',
    name: 'CT乳腺模板',
    modality: 'CT',
    bodyPart: '乳腺',
    sections: [
      { id: 's1', label: '腺体', placeholder: '描述乳腺腺体密度、分布是否正常...', type: 'text', required: true },
      { id: 's2', label: '肿块', placeholder: '描述肿块位置、大小、形态、边界...', type: 'text', required: true },
      { id: 's3', label: '钙化', placeholder: '描述钙化形态、分布特点...', type: 'text', required: false },
      { id: 's4', label: '腋窝淋巴结', placeholder: '描述腋窝淋巴结是否肿大...', type: 'text', required: false },
      { id: 's5', label: '测量数据', placeholder: '肿块大小、淋巴结短径...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '乳腺CT平扫未见明显异常。',
    recommendationTemplate: '建议定期筛查。',
  },
  {
    id: 'st_mr_joint',
    name: 'MR关节模板（膝/髋/肩）',
    modality: 'MR',
    bodyPart: '四肢',
    sections: [
      { id: 's1', label: '骨骼信号', placeholder: '描述骨端、骨骺信号是否正常...', type: 'text', required: true },
      { id: 's2', label: '软骨', placeholder: '描述关节软骨厚度、完整性...', type: 'text', required: true },
      { id: 's3', label: '韧带', placeholder: '描述前后交叉韧带/肩袖/踝关节韧带情况...', type: 'text', required: false },
      { id: 's4', label: '半月板', placeholder: '描述半月板形态、信号、有无撕裂...', type: 'text', required: false },
      { id: 's5', label: '软组织', placeholder: '描述周围软组织是否肿胀、有无肿块...', type: 'text', required: false },
      { id: 's6', label: '测量数据', placeholder: '软骨厚度、韧带直径...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '关节MRI平扫未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_ct_ent',
    name: 'CT鼻窦眼眶模板',
    modality: 'CT',
    bodyPart: '五官',
    sections: [
      { id: 's1', label: '鼻窦', placeholder: '描述各组鼻窦黏膜是否增厚、有无液平...', type: 'text', required: true },
      { id: 's2', label: '鼻腔', placeholder: '描述鼻甲是否肥大、鼻中隔是否偏曲...', type: 'text', required: false },
      { id: 's3', label: '眼眶', placeholder: '描述眼眶结构、眼球位置是否正常...', type: 'text', required: false },
      { id: 's4', label: '骨质', placeholder: '描述周围骨质是否完整、有无破坏...', type: 'text', required: false },
      { id: 's5', label: '测量数据', placeholder: '黏膜厚度、肿块大小...', type: 'measurement', required: false },
    ],
    conclusionTemplate: '鼻窦眼眶CT平扫未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_ct_temporal_bone',
    name: 'CT颞骨模板',
    modality: 'CT',
    bodyPart: '颞骨',
    sections: [
      { id: 's1', label: '外耳道', placeholder: '描述外耳道是否狭窄、有无占位...', type: 'text', required: true },
      { id: 's2', label: '中耳', placeholder: '描述鼓膜、听小骨是否正常...', type: 'text', required: true },
      { id: 's3', label: '乳突', placeholder: '描述乳突气房是否清晰、有无浑浊...', type: 'text', required: false },
      { id: 's4', label: '内耳', placeholder: '描述内耳道、耳蜗、前庭、半规管情况...', type: 'text', required: false },
      { id: 's5', label: '面神经管', placeholder: '描述面神经管形态是否完整...', type: 'text', required: false },
    ],
    conclusionTemplate: '颞骨CT平扫未见明显异常。',
    recommendationTemplate: '建议定期复查。',
  },
  {
    id: 'st_ct_emergency_trauma',
    name: 'CT急诊外伤模板',
    modality: 'CT',
    bodyPart: '急诊',
    sections: [
      { id: 's1', label: '颅脑', placeholder: '描述颅骨、脑实质情况...', type: 'text', required: true },
      { id: 's2', label: '胸部', placeholder: '描述肺野、心脏、大血管情况...', type: 'text', required: true },
      { id: 's3', label: '腹部', placeholder: '描述肝脾肾等实质脏器情况...', type: 'text', required: true },
      { id: 's4', label: '盆腔', placeholder: '描述膀胱、直肠、盆腔脏器情况...', type: 'text', required: false },
      { id: 's5', label: '脊柱', placeholder: '描述脊柱序列、椎体情况...', type: 'text', required: false },
      { id: 's6', label: '骨骼', placeholder: '描述主要骨骼情况...', type: 'text', required: false },
    ],
    conclusionTemplate: '全身CT外伤扫描发现上述异常，建议相关专科就诊。',
    recommendationTemplate: '建议相关专科就诊，密切观察病情变化。',
  },
]

// ============================================================
// [NEW] 快捷测量预设模板
// ============================================================
const MEASUREMENT_PRESETS = [
  { label: 'CT值测量', type: 'ct', unit: 'HU', placeholder: '请输入CT值...' },
  { label: '结节大小', type: 'size', unit: 'mm', placeholder: '长×宽×高 或 直径' },
  { label: '病变距离', type: 'distance', unit: 'mm', placeholder: '两点间距离' },
  { label: '积液量', type: 'size', unit: 'ml', placeholder: '估计积液量' },
  { label: '肿块大小', type: 'size', unit: 'cm', placeholder: '长×宽×高' },
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
  // === 以下为扩充的AI推荐组合 ===
  'CT-脊柱': {
    findings: [
      { content: '颈椎/腰椎/胸椎序列正常，椎体形态及信号未见异常，椎间盘未见突出或膨出。', confidence: 95, source: '正常脊柱模板' },
      { content: 'L3/4、L4/5、L5/S1椎间盘向后方突出，压迫硬膜囊前缘。', confidence: 88, source: '椎间盘突出库' },
      { content: '椎管有效矢状径减小，黄韧带肥厚，椎管狭窄。', confidence: 85, source: '椎管狭窄库' },
      { content: '椎体可见线样低密度影，骨皮质连续性中断，考虑椎体骨折。', confidence: 90, source: '外伤模板' },
    ],
    conclusions: [
      { content: '颈/胸/腰椎椎间盘突出，建议骨科随诊。', confidence: 88, typicalFor: ['腰椎间盘突出', '颈椎间盘突出'] },
      { content: '椎管狭窄，建议进一步MRI检查。', confidence: 85, typicalFor: ['椎管狭窄评估'] },
      { content: '椎体骨折，建议骨科就诊。', confidence: 90, typicalFor: ['外伤评估'] },
    ],
    completeness: ['描述椎体', '描述椎间盘', '描述椎管', '描述神经根', '建议'],
  },
  'CT-盆腔': {
    findings: [
      { content: '盆腔结构清晰，膀胱充盈良好，壁不厚，前列腺/子宫/附件未见明显异常。', confidence: 95, source: '正常盆腔模板' },
      { content: '前列腺增大，密度均匀，可见多发小结节，提示前列腺增生。', confidence: 88, source: '前列腺增生库' },
      { content: '子宫肌层可见类圆形肿块，边界清楚，T2呈低信号，提示子宫肌瘤。', confidence: 85, source: '子宫肌瘤库' },
      { content: '卵巢可见薄壁囊性占位，边界清楚，提示卵巢囊肿。', confidence: 90, source: '卵巢囊肿库' },
    ],
    conclusions: [
      { content: '前列腺增生，建议泌尿外科随诊。', confidence: 88, typicalFor: ['前列腺增生'] },
      { content: '子宫肌瘤，建议妇科随诊。', confidence: 85, typicalFor: ['子宫肌瘤'] },
      { content: '卵巢囊肿，建议定期复查。', confidence: 90, typicalFor: ['卵巢囊肿'] },
    ],
    completeness: ['描述膀胱', '描述前列腺/子宫/附件', '描述直肠', '描述淋巴结'],
  },
  'MR-脊柱': {
    findings: [
      { content: '颈/胸/腰椎椎体形态及信号正常，椎间盘未见突出或膨出，脊髓形态正常。', confidence: 95, source: '正常脊柱MR模板' },
      { content: 'L4/5椎间盘向后方突出，相应水平硬膜囊受压，神经根未见明显受累。', confidence: 88, source: '椎间盘突出库' },
      { content: '胸椎椎体可见斑片状长T1长T2信号，STIR呈高信号，提示骨髓水肿。', confidence: 85, source: '骨髓水肿库' },
      { content: '颈髓内可见条状长T1长T2信号，边缘清楚，提示脊髓空洞。', confidence: 82, source: '脊髓空洞库' },
    ],
    conclusions: [
      { content: '腰椎间盘突出，建议骨科随诊。', confidence: 88, typicalFor: ['腰椎间盘突出'] },
      { content: '胸椎骨髓水肿，建议定期复查。', confidence: 85, typicalFor: ['骨髓水肿评估'] },
      { content: '脊髓空洞，建议神经外科随诊。', confidence: 82, typicalFor: ['脊髓空洞'] },
    ],
    completeness: ['描述椎体信号', '描述椎间盘', '描述脊髓', '描述神经根'],
  },
  'MR-腹部': {
    findings: [
      { content: '肝脏形态大小正常，信号均匀，未见异常信号影。', confidence: 95, source: '正常腹部MR模板' },
      { content: '肝右叶可见类圆形长T1长T2信号，边界清楚，提示肝囊肿。', confidence: 90, source: '肝囊肿库' },
      { content: '肝左叶可见肿块影，T1呈低信号，T2呈高信号，增强扫描不均匀强化。', confidence: 85, source: '肝脏肿瘤库' },
      { content: '胰腺形态正常，信号均匀，胰管无扩张，提示胰腺未见明显异常。', confidence: 92, source: '正常胰腺模板' },
    ],
    conclusions: [
      { content: '肝囊肿，建议定期复查。', confidence: 90, typicalFor: ['肝囊肿'] },
      { content: '肝内占位，建议进一步检查。', confidence: 85, typicalFor: ['肝脏占位评估'] },
      { content: '胰腺未见明显异常。', confidence: 92, typicalFor: ['健康体检'] },
    ],
    completeness: ['描述肝脏', '描述胆道', '描述胰腺', '描述脾脏', '描述肾脏'],
  },
  'MR-四肢': {
    findings: [
      { content: '诸骨信号均匀，关节软骨光滑，关节间隙正常，周围软组织未见明显异常。', confidence: 95, source: '正常关节MR模板' },
      { content: '膝关节内侧半月板后角可见线样高信号，达关节面缘，提示半月板撕裂。', confidence: 88, source: '半月板撕裂库' },
      { content: '前交叉韧带肿胀，信号增高，走行失常，提示前交叉韧带损伤。', confidence: 85, source: '韧带损伤库' },
      { content: '股骨头形态正常，信号均匀，关节软骨光滑，提示股骨头未见明显异常。', confidence: 92, source: '正常髋关节模板' },
    ],
    conclusions: [
      { content: '内侧半月板撕裂，建议关节外科随诊。', confidence: 88, typicalFor: ['半月板损伤'] },
      { content: '前交叉韧带损伤，建议关节外科随诊。', confidence: 85, typicalFor: ['韧带损伤'] },
      { content: '股骨头未见明显异常。', confidence: 92, typicalFor: ['髋关节评估'] },
    ],
    completeness: ['描述骨信号', '描述软骨', '描述韧带', '描述半月板', '描述软组织'],
  },
  'DR-腹部': {
    findings: [
      { content: '腹部立位片未见异常，肠管无扩张，腹腔无游离气体。', confidence: 95, source: '正常腹部平片模板' },
      { content: '左侧膈下可见游离气体密度影，提示消化道穿孔。', confidence: 90, source: '消化道穿孔模板' },
      { content: '肠管明显扩张积气，可见气液平面，提示肠梗阻。', confidence: 88, source: '肠梗阻模板' },
      { content: '右下腹可见阑尾区钙化影，提示阑尾结石。', confidence: 85, source: '阑尾炎模板' },
    ],
    conclusions: [
      { content: '消化道穿孔待排，建议进一步CT检查。', confidence: 90, typicalFor: ['急腹症评估'] },
      { content: '肠梗阻，建议外科随诊。', confidence: 88, typicalFor: ['肠梗阻'] },
      { content: '阑尾结石可能，建议结合临床。', confidence: 85, typicalFor: ['阑尾炎筛查'] },
    ],
    completeness: ['描述膈下', '描述肠管', '描述腹部钙化', '描述腹部肿块'],
  },
  'DR-四肢': {
    findings: [
      { content: '诸骨骨质结构完整，关节间隙正常，周围软组织未见明显异常。', confidence: 95, source: '正常四肢平片模板' },
      { content: '右侧尺骨骨质连续性中断，可见透亮线影，断端无明显移位，提示尺骨骨折。', confidence: 90, source: '骨折模板' },
      { content: '诸骨骨质密度减低，骨小梁稀疏，提示骨质疏松。', confidence: 85, source: '骨质疏松库' },
      { content: '膝关节间隙变窄，边缘骨质增生，提示退行性骨关节病。', confidence: 88, source: '退行性改变库' },
    ],
    conclusions: [
      { content: '尺骨骨折，建议骨科随诊。', confidence: 90, typicalFor: ['外伤评估'] },
      { content: '骨质疏松，建议内分泌科随诊。', confidence: 85, typicalFor: ['骨质疏松评估'] },
      { content: '退行性骨关节病，建议骨科随诊。', confidence: 88, typicalFor: ['骨关节病'] },
    ],
    completeness: ['描述骨质', '描述关节', '描述软组织', '描述钙化'],
  },
  'CTA-冠脉': {
    findings: [
      { content: '冠脉走形正常，管壁不厚，管腔通畅，未见明显狭窄或钙化。', confidence: 95, source: '正常冠脉CTA模板' },
      { content: '左冠状动脉前降支可见混合密度斑块，管腔狭窄约50-69%。', confidence: 88, source: '冠脉狭窄库' },
      { content: '右冠状动脉可见钙化斑块，管腔狭窄约70-99%。', confidence: 85, source: '冠脉狭窄库' },
      { content: '左冠状动脉主干可见软斑块，管腔狭窄约70-99%，考虑中度狭窄。', confidence: 82, source: '冠脉狭窄库' },
    ],
    conclusions: [
      { content: '冠脉轻-中度狭窄，建议心内科随诊，规律药物治疗。', confidence: 88, typicalFor: ['冠心病评估'] },
      { content: '冠脉重度狭窄，建议行冠脉造影检查，评估介入治疗指征。', confidence: 85, typicalFor: ['冠心病严重评估'] },
      { content: '冠脉未见明显异常。', confidence: 95, typicalFor: ['健康体检'] },
    ],
    completeness: ['描述左主干', '描述前降支', '描述回旋支', '描述右冠', '描述斑块性质'],
  },
  'CTA-主动脉': {
    findings: [
      { content: '主动脉走形正常，管壁不厚，管腔通畅，未见明显异常。', confidence: 95, source: '正常主动脉CTA模板' },
      { content: '主动脉弓可见内膜片影及真假腔形成，入口位于左锁骨下动脉开口以远，提示B型主动脉夹层。', confidence: 90, source: '主动脉夹层库' },
      { content: '腹主动脉局限性扩张，直径约4.5cm，壁可见钙化，提示腹主动脉瘤。', confidence: 88, source: '主动脉瘤库' },
      { content: '胸主动脉可见局限性扩张，直径约3.5cm，考虑胸主动脉瘤。', confidence: 85, source: '主动脉瘤库' },
    ],
    conclusions: [
      { content: 'B型主动脉夹层，建议血管外科随诊，规律控制血压。', confidence: 90, typicalFor: ['主动脉夹层'] },
      { content: '腹主动脉瘤，建议血管外科随诊，评估手术指征。', confidence: 88, typicalFor: ['腹主动脉瘤'] },
      { content: '胸主动脉瘤，建议定期复查，监测瘤体变化。', confidence: 85, typicalFor: ['胸主动脉瘤'] },
    ],
    completeness: ['描述升主动脉', '描述主动脉弓', '描述降主动脉', '描述腹主动脉', '描述分支血管'],
  },
  'CTA-肺动脉': {
    findings: [
      { content: '肺动脉主干及分支走形正常，管腔通畅，未见明显充盈缺损。', confidence: 95, source: '正常肺动脉CTA模板' },
      { content: '右肺下叶肺动脉分支可见充盈缺损，考虑肺栓塞。', confidence: 90, source: '肺栓塞库' },
      { content: '双肺动脉分支可见多发充盈缺损，累及双肺多叶肺动脉。', confidence: 88, source: '肺栓塞库' },
      { content: '左肺下叶肺动脉分支可见附壁充盈缺损，考虑慢性肺栓塞。', confidence: 85, source: '肺栓塞库' },
    ],
    conclusions: [
      { content: '急性肺栓塞，建议急诊科就诊，立即抗凝治疗。', confidence: 90, typicalFor: ['急性肺栓塞'] },
      { content: '双肺多发肺栓塞，病情危重，建议ICU就诊。', confidence: 88, typicalFor: ['危重肺栓塞'] },
      { content: '慢性肺栓塞，建议血管外科随诊，评估介入治疗指征。', confidence: 85, typicalFor: ['慢性肺栓塞'] },
    ],
    completeness: ['描述肺动脉主干', '描述左肺动脉', '描述右肺动脉', '描述肺动脉分支', '描述肺梗死灶'],
  },
  'CT-颈部': {
    findings: [
      { content: '颈部淋巴结未见肿大，甲状腺形态、大小正常，颈部血管走形正常。', confidence: 95, source: '正常颈部CT模板' },
      { content: '甲状腺右叶可见类圆形低密度影，边界清楚，大小约1.5×1.2cm，提示甲状腺结节。', confidence: 88, source: '甲状腺结节库' },
      { content: '颈部可见多发肿大淋巴结，最大者短径约2.0cm，提示淋巴结肿大。', confidence: 85, source: '淋巴结肿大库' },
      { content: '左侧颈动脉分叉处可见软斑块，管腔狭窄约30%。', confidence: 82, source: '颈动脉斑块库' },
    ],
    conclusions: [
      { content: '甲状腺结节，建议内分泌科随诊，定期复查。', confidence: 88, typicalFor: ['甲状腺结节'] },
      { content: '颈部淋巴结肿大，建议查找原因。', confidence: 85, typicalFor: ['淋巴结肿大查因'] },
      { content: '颈动脉斑块形成，建议控制血脂，规律服药。', confidence: 82, typicalFor: ['颈动脉斑块'] },
    ],
    completeness: ['描述甲状腺', '描述颈部淋巴结', '描述颈部血管', '描述腮腺', '描述喉部'],
  },
  'CT-四肢': {
    findings: [
      { content: '诸骨骨质结构完整，骨皮质连续，关节面光滑，软组织未见明显异常。', confidence: 95, source: '正常四肢CT模板' },
      { content: '右侧股骨下端可见溶骨性骨质破坏，边界不清，周围可见软组织肿块。', confidence: 88, source: '骨肿瘤库' },
      { content: '左侧胫骨可见线样低密度影，骨皮质连续性中断，提示胫骨骨折。', confidence: 90, source: '骨折模板' },
      { content: '右膝关节面骨质增生硬化，关节间隙变窄，提示退行性骨关节病。', confidence: 85, source: '退行性改变库' },
    ],
    conclusions: [
      { content: '股骨远端骨肿瘤可能，建议穿刺活检明确病理。', confidence: 88, typicalFor: ['骨肿瘤评估'] },
      { content: '胫骨骨折，建议骨科就诊。', confidence: 90, typicalFor: ['外伤评估'] },
      { content: '右膝关节退行性骨关节病，建议骨科随诊。', confidence: 85, typicalFor: ['骨关节病'] },
    ],
    completeness: ['描述骨质', '描述关节', '描述软组织', '描述钙化'],
  },
  'CT-骨盆': {
    findings: [
      { content: '骨盆骨质结构完整，双侧髋关节形态正常，关节面光滑，间隙正常。', confidence: 95, source: '正常骨盆CT模板' },
      { content: '右侧髋臼可见骨折线影，骨皮质连续性中断，提示髋臼骨折。', confidence: 90, source: '骨折模板' },
      { content: '双侧股骨头可见变形，密度不均，可见囊变及硬化，提示股骨头坏死。', confidence: 88, source: '股骨头坏死库' },
      { content: '左侧髂骨可见溶骨性骨质破坏，边界不清，周围可见软组织肿块。', confidence: 85, source: '骨肿瘤库' },
    ],
    conclusions: [
      { content: '右侧髋臼骨折，建议骨科就诊。', confidence: 90, typicalFor: ['外伤评估'] },
      { content: '双侧股骨头坏死，建议骨科随诊。', confidence: 88, typicalFor: ['股骨头坏死'] },
      { content: '左侧髂骨骨肿瘤可能，建议穿刺活检。', confidence: 85, typicalFor: ['骨肿瘤评估'] },
    ],
    completeness: ['描述髂骨', '描述耻骨', '描述坐骨', '描述髋关节', '描述骶髂关节'],
  },
  'CT-泌尿系统': {
    findings: [
      { content: '双肾形态、大小正常，位置正常，肾盂肾盏无扩张，膀胱充盈良好，壁不厚。', confidence: 95, source: '正常泌尿系CT模板' },
      { content: '右肾盂内可见高密度影，大小约0.8cm，边缘锐利，CT值约350HU，提示肾结石。', confidence: 90, source: '泌尿系结石库' },
      { content: '左肾下极可见类圆形水样低密度影，边界清晰，大小约2.5×2.0cm，提示肾囊肿。', confidence: 88, source: '肾囊肿库' },
      { content: '膀胱三角区可见菜花状软组织肿块，基底较宽，提示膀胱肿瘤。', confidence: 85, source: '膀胱肿瘤库' },
    ],
    conclusions: [
      { content: '右肾结石，建议泌尿外科随诊。', confidence: 90, typicalFor: ['泌尿系结石'] },
      { content: '左肾囊肿，建议定期复查。', confidence: 88, typicalFor: ['肾囊肿'] },
      { content: '膀胱肿瘤，建议泌尿外科就诊，建议膀胱镜检查。', confidence: 85, typicalFor: ['膀胱肿瘤'] },
    ],
    completeness: ['描述肾脏', '描述输尿管', '描述膀胱', '描述腹膜后淋巴结'],
  },
  'CT-消化系统': {
    findings: [
      { content: '肝脏形态大小正常，实质密度均匀，肝内血管走形正常，肝内外胆管无扩张。', confidence: 95, source: '正常肝脏CT模板' },
      { content: '肝右叶可见类圆形低密度影，边界清楚，增强扫描边缘结节样强化，提示肝血管瘤。', confidence: 90, source: '肝血管瘤库' },
      { content: '肝左叶可见肿块影，边界不清，增强扫描动脉期明显强化，静脉期快速退出，提示肝细胞癌。', confidence: 88, source: '肝癌库' },
      { content: '胰腺形态正常，密度均匀，边缘清楚，胰管无扩张，周围脂肪间隙清晰。', confidence: 92, source: '正常胰腺CT模板' },
    ],
    conclusions: [
      { content: '肝右叶血管瘤，考虑良性病变，建议定期复查。', confidence: 90, typicalFor: ['肝血管瘤'] },
      { content: '肝左叶占位性病变，肝癌可能，建议进一步检查。', confidence: 88, typicalFor: ['肝脏占位评估'] },
      { content: '胰腺未见明显异常。', confidence: 92, typicalFor: ['健康体检'] },
    ],
    completeness: ['描述肝脏', '描述胆囊', '描述胆管', '描述胰腺', '描述脾脏', '描述肠道'],
  },
  'MR-盆腔': {
    findings: [
      { content: '前列腺形态、大小正常，信号均匀，未见明显异常信号影。', confidence: 95, source: '正常前列腺MR模板' },
      { content: '前列腺外周带可见结节状长T1长T2信号，突破包膜，提示前列腺癌。', confidence: 88, source: '前列腺癌库' },
      { content: '子宫形态正常，肌层可见类圆形肿块，T2呈低信号，边界清楚，提示子宫肌瘤。', confidence: 90, source: '子宫肌瘤库' },
      { content: '双侧卵巢可见薄壁囊性占位，边界清楚，提示卵巢囊肿。', confidence: 88, source: '卵巢囊肿库' },
    ],
    conclusions: [
      { content: '前列腺癌可能，建议穿刺活检明确病理。', confidence: 88, typicalFor: ['前列腺癌筛查'] },
      { content: '子宫肌瘤，建议妇科随诊。', confidence: 90, typicalFor: ['子宫肌瘤'] },
      { content: '双侧卵巢囊肿，建议定期复查。', confidence: 88, typicalFor: ['卵巢囊肿'] },
    ],
    completeness: ['描述前列腺', '描述精囊腺', '描述子宫', '描述卵巢', '描述直肠'],
  },
  'MR-心脏': {
    findings: [
      { content: '心脏形态、大小正常，各房室比例正常，左室壁运动协调。', confidence: 95, source: '正常心脏MR模板' },
      { content: '左室壁节段性变薄，延迟扫描可见强化，提示陈旧性心肌梗死。', confidence: 88, source: '心肌梗死库' },
      { content: '左室壁局部变薄向外突出，呈瘤样扩张，提示室壁瘤形成。', confidence: 85, source: '室壁瘤库' },
      { content: '心包可见弧形液性信号，厚度约8mm，提示心包积液。', confidence: 90, source: '心包积液库' },
    ],
    conclusions: [
      { content: '陈旧性心肌梗死，建议心内科随诊。', confidence: 88, typicalFor: ['心肌梗死评估'] },
      { content: '左室室壁瘤，建议心外科随诊。', confidence: 85, typicalFor: ['室壁瘤评估'] },
      { content: '心包积液（少量），建议定期复查。', confidence: 90, typicalFor: ['心包积液'] },
    ],
    completeness: ['描述心脏形态', '描述心室壁运动', '描述心肌信号', '描述心包', '描述大血管'],
  },
  'CT-乳腺': {
    findings: [
      { content: '双侧乳腺腺体结构正常，未见明显异常密度影。', confidence: 95, source: '正常乳腺CT模板' },
      { content: '左乳外上象限可见不规则肿块，边缘呈毛刺状，可见簇状钙化。', confidence: 88, source: '乳腺癌库' },
      { content: '右乳内可见类圆形结节，边界清楚，密度均匀，提示纤维腺瘤。', confidence: 90, source: '纤维腺瘤库' },
      { content: '双侧腋窝可见肿大淋巴结，皮髓质分界不清。', confidence: 85, source: '淋巴结肿大库' },
    ],
    conclusions: [
      { content: '左乳肿块，乳腺癌待排，建议活检明确病理。', confidence: 88, typicalFor: ['乳腺癌筛查'] },
      { content: '右乳纤维腺瘤，考虑良性病变。', confidence: 90, typicalFor: ['乳腺纤维腺瘤'] },
      { content: '双侧腋窝淋巴结肿大，建议查找原因。', confidence: 85, typicalFor: ['淋巴结肿大查因'] },
    ],
    completeness: ['描述腺体', '描述肿块', '描述钙化', '描述腋窝淋巴结'],
  },
  'CT-五官': {
    findings: [
      { content: '鼻窦黏膜无增厚，鼻窦开口通畅，骨质结构完整。', confidence: 95, source: '正常鼻窦CT模板' },
      { content: '左侧上颌窦黏膜增厚，窦腔内分泌物潴留，提示鼻窦炎。', confidence: 88, source: '鼻窦炎库' },
      { content: '左侧上颌窦可见软组织肿块，骨质破坏，提示上颌窦癌。', confidence: 85, source: '上颌窦癌库' },
      { content: '右侧腮腺可见类圆形占位，边界清楚，提示腮腺肿瘤。', confidence: 82, source: '腮腺肿瘤库' },
    ],
    conclusions: [
      { content: '左侧上颌窦炎，建议耳鼻喉科随诊。', confidence: 88, typicalFor: ['鼻窦炎'] },
      { content: '左侧上颌窦占位，建议活检明确病理。', confidence: 85, typicalFor: ['上颌窦占位评估'] },
      { content: '右侧腮腺肿瘤，建议头颈外科随诊。', confidence: 82, typicalFor: ['腮腺肿瘤'] },
    ],
    completeness: ['描述上颌窦', '描述额窦', '描述蝶窦', '描述筛窦', '描述腮腺'],
  },
  'CT-颞骨': {
    findings: [
      { content: '双侧颞骨骨质结构完整，中耳及乳突气房清晰，听小骨形态正常。', confidence: 95, source: '正常颞骨CT模板' },
      { content: '右侧中耳可见软组织密度影，听小骨模糊，提示中耳炎。', confidence: 88, source: '中耳炎库' },
      { content: '左侧颞骨岩部可见骨质破坏，边缘不清，提示颞骨骨瘤或恶性肿瘤。', confidence: 85, source: '颞骨肿瘤库' },
      { content: '双侧内耳道对称，无增宽，膜迷路形态正常。', confidence: 92, source: '正常内耳模板' },
    ],
    conclusions: [
      { content: '右侧中耳炎，建议耳鼻喉科随诊。', confidence: 88, typicalFor: ['中耳炎'] },
      { content: '左侧颞骨骨质破坏，建议进一步检查。', confidence: 85, typicalFor: ['颞骨病变评估'] },
      { content: '内耳未见明显异常。', confidence: 92, typicalFor: ['内耳评估'] },
    ],
    completeness: ['描述外耳道', '描述中耳', '描述乳突', '描述内耳', '描述面神经管'],
  },
  'CT-急诊外伤': {
    findings: [
      { content: '颅内未见明显异常，颅骨骨质完整，无骨折征象。', confidence: 95, source: '正常外伤初筛模板' },
      { content: '左侧颞骨骨质连续性中断，可见骨折线影，提示颞骨骨折。', confidence: 90, source: '颅骨骨折库' },
      { content: '颅内可见多发斑片状低密度影，混杂高密度出血灶，提示脑挫裂伤。', confidence: 88, source: '脑挫裂伤库' },
      { content: '脾脏形态不完整，脾周可见弧形低密度影，提示脾破裂。', confidence: 90, source: '腹部外伤库' },
    ],
    conclusions: [
      { content: '颞骨骨折，建议神经外科随诊。', confidence: 90, typicalFor: ['头部外伤'] },
      { content: '脑挫裂伤，建议神经外科随诊，警惕迟发性出血。', confidence: 88, typicalFor: ['颅脑外伤'] },
      { content: '脾破裂待排，建议普外科就诊，警惕腹腔出血。', confidence: 90, typicalFor: ['腹部外伤'] },
    ],
    completeness: ['描述颅骨', '描述脑实质', '描述腹部脏器', '描述腹腔', '描述骨骼'],
  },
  'CT-全身筛查': {
    findings: [
      { content: '全身主要脏器未见明显异常，建议定期体检。', confidence: 95, source: '正常全身筛查模板' },
      { content: '右肺上叶可见实性结节，大小约1.0×0.8cm，边界清楚，建议定期复查。', confidence: 88, source: '肺结节库' },
      { content: '肝右叶可见类圆形低密度影，大小约1.5×1.2cm，边界清楚，提示肝囊肿。', confidence: 90, source: '肝囊肿库' },
      { content: '右肾可见点状高密度影，大小约0.4cm，边缘锐利，提示肾结石。', confidence: 85, source: '泌尿系结石库' },
    ],
    conclusions: [
      { content: '右肺上叶实性结节，建议定期复查胸部CT。', confidence: 88, typicalFor: ['肺结节随访'] },
      { content: '肝囊肿，建议定期复查。', confidence: 90, typicalFor: ['肝囊肿'] },
      { content: '右肾小结石，建议多饮水，定期复查。', confidence: 85, typicalFor: ['泌尿系结石'] },
    ],
    completeness: ['描述肺野', '描述肝脏', '描述肾脏', '描述胰腺', '描述脾脏'],
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
  { id: 'tf006', name: '脑挫裂伤', category: '外伤性病变', modality: 'CT', bodyPart: '头颅', description: '脑实质内可见多发斑片状低密度影，混杂高密度出血灶。', typicalFor: ['头部外伤', '减速性损伤'] },
  { id: 'tf007', name: '弥漫性轴索损伤', category: '外伤性病变', modality: 'CT', bodyPart: '头颅', description: '脑白质内可见多发点状高密度影，灰白质分界模糊。', typicalFor: ['高速外伤', '甩伤'] },
  { id: 'tf008', name: '颅骨骨折', category: '外伤性病变', modality: 'CT', bodyPart: '头颅', description: '颅骨骨质连续性中断，可见骨折线影，可累及额窦/蝶窦。', typicalFor: ['颅骨外伤', '颅底骨折'] },
  { id: 'tf009', name: '脑积水', category: '先天/退行性病变', modality: 'CT', bodyPart: '头颅', description: '脑室系统显著扩大，脑沟变浅或消失。', typicalFor: ['梗阻性脑积水', '交通性脑积水'] },
  { id: 'tf010', name: '脑萎缩', category: '退行性病变', modality: 'CT', bodyPart: '头颅', description: '双侧脑室对称性扩大，脑回脑沟增宽加深。', typicalFor: ['老年性脑萎缩', '阿尔茨海默病'] },
  // CT胸部
  { id: 'tf011', name: '大叶性肺炎', category: '感染性病变', modality: 'CT', bodyPart: '胸部', description: '肺叶或肺段可见大片实变影，密度均匀，可见支气管充气征。', typicalFor: ['细菌性肺炎'] },
  { id: 'tf012', name: '肺结核', category: '感染性病变', modality: 'CT', bodyPart: '胸部', description: '上肺可见斑片状、结节状影，可见空洞形成，周围可见卫星灶。', typicalFor: ['继发性肺结核', '空洞型肺结核'] },
  { id: 'tf013', name: '肺肿瘤', category: '肿瘤性病变', modality: 'CT', bodyPart: '胸部', description: '肺门或肺野可见团块影，边界不清，可见分叶、毛刺征，可有胸膜牵拉。', typicalFor: ['中央型肺癌', '周围型肺癌'] },
  { id: 'tf014', name: '气胸', category: '胸膜病变', modality: 'CT', bodyPart: '胸部', description: '胸腔内可见无肺纹理区域，肺组织被压缩，可见压缩边缘。', typicalFor: ['自发性气胸', '外伤性气胸'] },
  { id: 'tf015', name: '胸腔积液', category: '胸膜病变', modality: 'CT', bodyPart: '胸部', description: '胸腔内可见弧形水样密度影，根据密度可判断性质（漏出液/渗出液/血性）。', typicalFor: ['感染性胸腔积液', '恶性胸腔积液', '心衰导致的胸腔积液'] },
  { id: 'tf016', name: '肺栓塞', category: '血管性病变', modality: 'CT', bodyPart: '胸部', description: '肺动脉分支可见充盈缺损或截断，远端肺组织可见楔形梗死灶。', typicalFor: ['急性肺栓塞', '慢性肺栓塞'] },
  { id: 'tf017', name: '肺大泡', category: '良性病变', modality: 'CT', bodyPart: '胸部', description: '肺野可见薄壁囊状透亮区，边界清楚，周围肺组织受压。', typicalFor: ['慢阻肺', '自发性肺大泡'] },
  { id: 'tf018', name: '支气管扩张', category: '慢性病变', modality: 'CT', bodyPart: '胸部', description: '支气管壁增厚，呈柱状或囊状扩张，管腔可见气液平面。', typicalFor: ['支气管扩张症'] },
  { id: 'tf019', name: '间质性肺炎', category: '弥漫性肺病', modality: 'CT', bodyPart: '胸部', description: '双肺可见网格状、蜂窝状影，以双下肺及胸膜下为著。', typicalFor: ['特发性肺纤维化', '结缔组织病相关间质肺'] },
  { id: 'tf020', name: '尘肺', category: '职业性肺病', modality: 'CT', bodyPart: '胸部', description: '双肺可见多发小结节影，沿支气管血管束分布，上肺为主，可见大阴影。', typicalFor: ['矽肺', '煤工尘肺'] },
  { id: 'tf021', name: '纵隔淋巴结肿大', category: '淋巴结病变', modality: 'CT', bodyPart: '胸部', description: '纵隔内可见多发肿大淋巴结，短径大于10mm，增强扫描可见均匀或不均匀强化。', typicalFor: ['转移性淋巴结', '结核性淋巴结', '淋巴瘤'] },
  { id: 'tf022', name: '食管癌', category: '肿瘤性病变', modality: 'CT', bodyPart: '胸部', description: '食管壁局限性或弥漫性增厚，管腔狭窄，可见软组织肿块。', typicalFor: ['食管鳞癌', '食管腺癌'] },
  { id: 'tf023', name: '胸腺瘤', category: '肿瘤性病变', modality: 'CT', bodyPart: '胸部', description: '前纵隔可见类圆形或分叶状肿块，边界清楚，增强扫描可见强化。', typicalFor: ['良性胸腺瘤', '恶性胸腺瘤'] },
  { id: 'tf024', name: '神经鞘瘤', category: '肿瘤性病变', modality: 'CT', bodyPart: '胸部', description: '后纵隔可见类圆形肿块，边界清楚，增强扫描明显强化，可见囊变。', typicalFor: ['神经鞘瘤', '神经纤维瘤'] },
  // CT腹部
  { id: 'tf025', name: '肝血管瘤', category: '良性肿瘤', modality: 'CT', bodyPart: '腹部', description: '肝内可见类圆形低密度影，边界清楚，增强扫描边缘结节样强化，逐渐向内填充。', typicalFor: ['肝血管瘤'] },
  { id: 'tf026', name: '肝细胞癌', category: '恶性肿瘤', modality: 'CT', bodyPart: '腹部', description: '肝内可见肿块影，边界不清，增强扫描动脉期明显强化，静脉期及延迟期快速退出。', typicalFor: ['原发性肝癌', '转移性肝癌'] },
  { id: 'tf027', name: '急性胰腺炎', category: '炎症性病变', modality: 'CT', bodyPart: '腹部', description: '胰腺形态肿胀，密度减低，周围脂肪间隙模糊，可见条索状渗出。', typicalFor: ['急性水肿型胰腺炎', '急性坏死型胰腺炎'] },
  { id: 'tf028', name: '肾囊肿', category: '良性病变', modality: 'CT', bodyPart: '腹部', description: '肾内可见圆形水样低密度影，边界清晰，壁薄而光滑，增强扫描无强化。', typicalFor: ['单纯性肾囊肿', '多囊肾'] },
  { id: 'tf029', name: '泌尿系结石', category: '结石性病变', modality: 'CT', bodyPart: '腹部', description: '泌尿系走行区可见高密度影，CT值约200-400HU，边缘锐利。', typicalFor: ['肾结石', '输尿管结石', '膀胱结石'] },
  { id: 'tf030', name: '胆囊结石', category: '结石性病变', modality: 'CT', bodyPart: '腹部', description: '胆囊内可见高密度影，可随体位移动，胆囊壁可增厚。', typicalFor: ['胆囊结石'] },
  { id: 'tf031', name: '胆囊癌', category: '恶性肿瘤', modality: 'CT', bodyPart: '腹部', description: '胆囊壁局限性或弥漫性增厚，可见软组织肿块，增强扫描可见强化。', typicalFor: ['胆囊腺癌'] },
  { id: 'tf032', name: '肝硬化', category: '慢性病变', modality: 'CT', bodyPart: '腹部', description: '肝脏体积缩小，肝叶比例失调，表面呈波浪状，脾大，门脉增宽。', typicalFor: ['乙肝后肝硬化', '酒精性肝硬化'] },
  { id: 'tf033', name: '脂肪肝', category: '代谢性病变', modality: 'CT', bodyPart: '腹部', description: '肝脏密度减低，CT值低于脾脏，肝内血管呈相对高密度。', typicalFor: ['弥漫性脂肪肝', '局灶性脂肪肝'] },
  { id: 'tf034', name: '肝脓肿', category: '感染性病变', modality: 'CT', bodyPart: '腹部', description: '肝内可见液性低密度影，边界不清，增强扫描环形强化，内可见气泡。', typicalFor: ['细菌性肝脓肿', '阿米巴性肝脓肿'] },
  { id: 'tf035', name: '脾破裂', category: '外伤性病变', modality: 'CT', bodyPart: '腹部', description: '脾脏形态不完整，可见弧形低密度影及腹腔积血。', typicalFor: ['外伤性脾破裂'] },
  { id: 'tf036', name: '肾癌', category: '恶性肿瘤', modality: 'CT', bodyPart: '腹部', description: '肾脏可见类圆形肿块，边界不清，增强扫描不均匀强化。', typicalFor: ['肾细胞癌', '肾盂癌'] },
  { id: 'tf037', name: '腹膜后肿瘤', category: '肿瘤性病变', modality: 'CT', bodyPart: '腹部', description: '腹膜后可见巨大肿块，边界不清，可包裹血管生长。', typicalFor: ['脂肪肉瘤', '平滑肌肉瘤', '神经纤维瘤'] },
  { id: 'tf038', name: '阑尾炎', category: '炎症性病变', modality: 'CT', bodyPart: '腹部', description: '阑尾增粗肿胀，壁增厚，周围脂肪间隙模糊，可见渗出。', typicalFor: ['急性阑尾炎', '阑尾周围脓肿'] },
  { id: 'tf039', name: '肠梗阻', category: '梗阻性病变', modality: 'CT', bodyPart: '腹部', description: '肠管明显扩张积气积液，可见气液平面，梗阻点可见肿块或粘连。', typicalFor: ['粘连性肠梗阻', '肿瘤性肠梗阻'] },
  { id: 'tf040', name: '消化道穿孔', category: '危急病变', modality: 'CT', bodyPart: '腹部', description: '腹腔可见游离气体密度影，多位于膈下及肝周。', typicalFor: ['消化性溃疡穿孔', '外伤性肠穿孔'] },
  // MR头部
  { id: 'tf041', name: '急性脑梗死（DWI）', category: '缺血性病变', modality: 'MR', bodyPart: '头颅', description: 'DWI序列呈高信号，相应ADC值降低，提示水分子扩散受限。', typicalFor: ['急性腔隙性脑梗死', '急性大面积脑梗死'] },
  { id: 'tf042', name: '脑膜瘤', category: '肿瘤性病变', modality: 'MR', bodyPart: '头颅', description: '颅内可见类圆形占位，T1呈等或低信号，T2呈高信号，增强扫描明显均匀强化，可见脑膜尾征。', typicalFor: ['典型脑膜瘤'] },
  { id: 'tf043', name: '垂体瘤', category: '肿瘤性病变', modality: 'MR', bodyPart: '头颅', description: '垂体可见增大，可见局限性向上突出，T1、T2呈等信号，增强扫描明显强化。', typicalFor: ['垂体微腺瘤', '垂体大腺瘤'] },
  { id: 'tf044', name: '胶质瘤', category: '肿瘤性病变', modality: 'MR', bodyPart: '头颅', description: '脑实质内可见不规则肿块，T1低信号，T2高信号，增强扫描不规则环形强化。', typicalFor: ['低级别胶质瘤', '高级别胶质瘤'] },
  { id: 'tf045', name: '转移瘤', category: '肿瘤性病变', modality: 'MR', bodyPart: '头颅', description: '脑实质内可见多发类圆形占位，T1低信号，T2高信号，增强扫描明显环形强化。', typicalFor: ['肺癌脑转移', '乳腺癌脑转移'] },
  { id: 'tf046', name: '脱髓鞘病变', category: '脱髓鞘病变', modality: 'MR', bodyPart: '头颅', description: '脑白质内可见多发斑片状长T1长T2信号，边缘清楚，无占位效应。', typicalFor: ['多发性硬化', '视神经脊髓炎'] },
  { id: 'tf047', name: '动静脉畸形', category: '血管性病变', modality: 'MR', bodyPart: '头颅', description: '可见团状迂曲血管流空影，供血动脉增粗，引流静脉扩张。', typicalFor: ['脑动静脉畸形'] },
  { id: 'tf048', name: '动脉瘤', category: '血管性病变', modality: 'MR', bodyPart: '头颅', description: '脑血管可见局限性扩张，呈流空信号，增强扫描可见瘤壁强化。', typicalFor: ['囊性动脉瘤', '梭形动脉瘤'] },
  { id: 'tf049', name: '脑白质疏松', category: '退行性病变', modality: 'MR', bodyPart: '头颅', description: '双侧脑室旁白质可见散在点状长T2信号，边缘模糊。', typicalFor: ['年龄相关白质改变', '慢性缺血性改变'] },
  { id: 'tf050', name: '视神经炎', category: '炎症性病变', modality: 'MR', bodyPart: '头颅', description: '视神经增粗，T2信号增高，增强扫描可见强化。', typicalFor: ['视神经脊髓炎', '多发性硬化相关视神经炎'] },
  // DR胸部
  { id: 'tf051', name: '社区获得性肺炎', category: '感染性病变', modality: 'DR', bodyPart: '胸部', description: '肺野可见斑片状、片状密度增高影，边界模糊，以右下肺多见。', typicalFor: ['细菌性肺炎', '病毒性肺炎'] },
  { id: 'tf052', name: '肋骨骨折', category: '外伤性病变', modality: 'DR', bodyPart: '胸部', description: '肋骨骨质连续性中断，可见透亮线影，断端可无明显移位。', typicalFor: ['外伤性肋骨骨折'] },
  { id: 'tf053', name: '肺结核', category: '感染性病变', modality: 'DR', bodyPart: '胸部', description: '上肺可见斑片状、结节状影，可见空洞形成。', typicalFor: ['继发性肺结核'] },
  { id: 'tf054', name: '肺癌', category: '肿瘤性病变', modality: 'DR', bodyPart: '胸部', description: '肺野可见团块状影，边缘可呈分叶状，可见毛刺征。', typicalFor: ['中央型肺癌', '周围型肺癌'] },
  { id: 'tf055', name: '气胸', category: '胸膜病变', modality: 'DR', bodyPart: '胸部', description: '胸腔内可见无肺纹理透亮区，肺组织被压缩，可见压缩边缘。', typicalFor: ['自发性气胸'] },
  { id: 'tf056', name: '胸腔积液', category: '胸膜病变', modality: 'DR', bodyPart: '胸部', description: '胸腔可见弧形液平面，肋膈角变钝。', typicalFor: ['感染性胸腔积液', '恶性胸腔积液'] },
  { id: 'tf057', name: '肺水肿', category: '心源性病变', modality: 'DR', bodyPart: '胸部', description: '双肺可见磨玻璃样密度增高影，双肺门影增浓，可见Kerley B线。', typicalFor: ['急性左心衰', '心源性肺水肿'] },
  { id: 'tf058', name: '肺不张', category: '肺容积减少', modality: 'DR', bodyPart: '胸部', description: '肺野可见密度增高影，肺叶体积缩小，叶间裂移位。', typicalFor: ['阻塞性肺不张', '压迫性肺不张'] },
  { id: 'tf059', name: '胸椎骨折', category: '外伤性病变', modality: 'DR', bodyPart: '胸部', description: '胸椎骨质连续性中断，可见骨折线影，椎体可压缩变扁。', typicalFor: ['外伤性胸椎骨折', '骨质疏松性椎体骨折'] },
  { id: 'tf060', name: '锁骨骨折', category: '外伤性病变', modality: 'DR', bodyPart: '胸部', description: '锁骨骨质连续性中断，可见透亮线影，断端可移位。', typicalFor: ['外伤性锁骨骨折'] },
  // CT四肢/骨盆
  { id: 'tf061', name: '股骨头坏死', category: '缺血性病变', modality: 'CT', bodyPart: '四肢', description: '股骨头可见变形，密度不均，可见囊变及硬化。', typicalFor: ['非创伤性股骨头坏死', '创伤后股骨头坏死'] },
  { id: 'tf062', name: '骨软骨瘤', category: '良性骨肿瘤', modality: 'CT', bodyPart: '四肢', description: '骨表面可见带蒂骨性突起，背向关节生长，软骨帽可见钙化。', typicalFor: ['单发性骨软骨瘤', '多发性骨软骨瘤'] },
  { id: 'tf063', name: '骨肉瘤', category: '恶性骨肿瘤', modality: 'CT', bodyPart: '四肢', description: '骨干骺端可见骨质破坏及软组织肿块，可见肿瘤骨生成（云絮状、针状）。', typicalFor: ['经典型骨肉瘤', '毛细血管扩张型骨肉瘤'] },
  { id: 'tf064', name: '骨巨细胞瘤', category: '中间性骨肿瘤', modality: 'CT', bodyPart: '四肢', description: '骨端可见膨胀性溶骨性破坏，边界清楚，无硬化边，可见皂泡样分隔。', typicalFor: ['骨巨细胞瘤'] },
  { id: 'tf065', name: '骨转移瘤', category: '恶性骨肿瘤', modality: 'CT', bodyPart: '四肢', description: '诸骨可见多发类圆形溶骨性或成骨性骨质破坏，边界不清。', typicalFor: ['肺癌骨转移', '乳腺癌骨转移', '前列腺癌骨转移'] },
  { id: 'tf066', name: '骨髓炎', category: '感染性病变', modality: 'CT', bodyPart: '四肢', description: '骨质可见溶骨性破坏，周围可见骨膜反应及软组织肿胀，可有死骨形成。', typicalFor: ['急性骨髓炎', '慢性骨髓炎'] },
  { id: 'tf067', name: '骨折不愈合', category: '外伤性病变', modality: 'CT', bodyPart: '四肢', description: '骨折端可见透亮线，骨痂形成少，断端骨质硬化。', typicalFor: ['骨折延迟愈合', '骨折不愈合'] },
  { id: 'tf068', name: '关节结核', category: '感染性病变', modality: 'CT', bodyPart: '四肢', description: '关节面骨质破坏，周围可见冷脓肿形成，可见碎屑状死骨。', typicalFor: ['膝关节结核', '髋关节结核'] },
  // CT脊柱
  { id: 'tf069', name: '椎间盘突出', category: '退行性病变', modality: 'CT', bodyPart: '脊柱', description: '椎间盘向后方突出，压迫硬膜囊或神经根。', typicalFor: ['腰椎间盘突出', '颈椎间盘突出'] },
  { id: 'tf070', name: '椎管狭窄', category: '退行性病变', modality: 'CT', bodyPart: '脊柱', description: '椎管有效矢状径减小，黄韧带肥厚，后纵韧带骨化。', typicalFor: ['腰椎管狭窄', '颈椎管狭窄'] },
  { id: 'tf071', name: '脊椎滑脱', category: '退行性病变', modality: 'CT', bodyPart: '脊柱', description: '椎体向前或向后移位，相邻椎体边缘可见骨质增生。', typicalFor: ['腰椎滑脱', '峡部裂'] },
  { id: 'tf072', name: '椎体血管瘤', category: '良性肿瘤', modality: 'CT', bodyPart: '脊柱', description: '椎体内可见粗细不均的血管流空信号，呈栅栏样改变。', typicalFor: ['椎体血管瘤'] },
  { id: 'tf073', name: '椎体结核', category: '感染性病变', modality: 'CT', bodyPart: '脊柱', description: '椎体可见溶骨性破坏，椎间隙变窄，可见冷脓肿。', typicalFor: ['脊柱结核'] },
  { id: 'tf074', name: '脊柱转移瘤', category: '恶性肿瘤', modality: 'CT', bodyPart: '脊柱', description: '椎体可见多发溶骨性或成骨性破坏，椎旁可见软组织肿块。', typicalFor: ['脊柱转移瘤'] },
  // CT泌尿/生殖
  { id: 'tf075', name: '肾错构瘤', category: '良性肿瘤', modality: 'CT', bodyPart: '泌尿系统', description: '肾内可见混杂密度肿块，内见脂肪成分及软组织成分。', typicalFor: ['肾血管平滑肌脂肪瘤'] },
  { id: 'tf076', name: '肾盂积水', category: '梗阻性病变', modality: 'CT', bodyPart: '泌尿系统', description: '肾盂扩张，肾盏可见积水，输尿管上段可见扩张。', typicalFor: ['输尿管梗阻', '肾盂积水'] },
  { id: 'tf077', name: '嗜铬细胞瘤', category: '功能性肿瘤', modality: 'CT', bodyPart: '泌尿系统', description: '肾上腺区可见类圆形肿块，边界清楚，增强扫描明显强化。', typicalFor: ['肾上腺嗜铬细胞瘤'] },
  { id: 'tf078', name: '前列腺增生', category: '良性病变', modality: 'CT', bodyPart: '泌尿系统', description: '前列腺增大，密度均匀，向上压迫膀胱底部。', typicalFor: ['良性前列腺增生'] },
  { id: 'tf079', name: '前列腺癌', category: '恶性肿瘤', modality: 'CT', bodyPart: '泌尿系统', description: '前列腺可见不规则肿块，外周带为主，突破包膜侵犯精囊。', typicalFor: ['前列腺癌'] },
  { id: 'tf080', name: '子宫肌瘤', category: '良性肿瘤', modality: 'CT', bodyPart: '生殖系统', description: '子宫肌层可见类圆形肿块，边界清楚，平扫呈等密度。', typicalFor: ['子宫平滑肌瘤'] },
  { id: 'tf081', name: '子宫内膜癌', category: '恶性肿瘤', modality: 'CT', bodyPart: '生殖系统', description: '子宫内膜增厚，可见肿块影，增强扫描可见强化。', typicalFor: ['子宫内膜癌'] },
  { id: 'tf082', name: '卵巢畸胎瘤', category: '生殖细胞肿瘤', modality: 'CT', bodyPart: '生殖系统', description: '卵巢可见混杂密度肿块，内见脂肪、钙化及软组织成分。', typicalFor: ['成熟畸胎瘤', '未成熟畸胎瘤'] },
  { id: 'tf083', name: '宫颈癌', category: '恶性肿瘤', modality: 'CT', bodyPart: '生殖系统', description: '宫颈可见肿块，边界不清，可侵犯阴道及宫旁组织。', typicalFor: ['宫颈鳞癌', '宫颈腺癌'] },
  // CTA血管
  { id: 'tf084', name: '主动脉夹层', category: '危急血管病变', modality: 'CTA', bodyPart: '血管', description: '主动脉可见内膜片影及真假腔形成，入口位于升主动脉或主动脉弓。', typicalFor: ['Stanford A型夹层', 'Stanford B型夹层'] },
  { id: 'tf085', name: '主动脉瘤', category: '血管性病变', modality: 'CTA', bodyPart: '血管', description: '主动脉局限性扩张，直径大于3cm，壁可见钙化。', typicalFor: ['胸主动脉瘤', '腹主动脉瘤'] },
  { id: 'tf086', name: '肺栓塞（CTA）', category: '危急血管病变', modality: 'CTA', bodyPart: '血管', description: '肺动脉分支可见充盈缺损，管腔截断。', typicalFor: ['急性肺栓塞'] },
  { id: 'tf087', name: '下肢深静脉血栓', category: '血管性病变', modality: 'CTA', bodyPart: '血管', description: '下肢深静脉内可见充盈缺损，局部管腔闭塞。', typicalFor: ['下肢深静脉血栓形成'] },
  // 其他
  { id: 'tf088', name: '甲状腺结节', category: '良性病变', modality: 'CT', bodyPart: '颈部', description: '甲状腺内可见类圆形低密度影，边界清楚，可有钙化。', typicalFor: ['甲状腺腺瘤', '结节性甲状腺肿'] },
  { id: 'tf089', name: '甲状腺癌', category: '恶性肿瘤', modality: 'CT', bodyPart: '颈部', description: '甲状腺增大，内可见不规则肿块，边界不清，侵犯周围组织。', typicalFor: ['甲状腺乳头状癌', '甲状腺滤泡癌'] },
  { id: 'tf090', name: '腮腺肿瘤', category: '肿瘤性病变', modality: 'CT', bodyPart: '颈部', description: '腮腺内可见类圆形占位，边界清楚，可见强化。', typicalFor: ['腮腺混合瘤', '腮腺癌'] },
  { id: 'tf091', name: '颈部淋巴结转移', category: '恶性肿瘤', modality: 'CT', bodyPart: '颈部', description: '颈部可见多发肿大淋巴结，密度不均，可有坏死。', typicalFor: ['鳞癌淋巴结转移', '腺癌淋巴结转移'] },
  { id: 'tf092', name: '乳腺癌', category: '恶性肿瘤', modality: 'CT', bodyPart: '乳腺', description: '乳腺内可见不规则肿块，边缘呈毛刺状，可见簇状钙化。', typicalFor: ['浸润性导管癌', '导管内癌'] },
  { id: 'tf093', name: '乳腺纤维腺瘤', category: '良性肿瘤', modality: 'CT', bodyPart: '乳腺', description: '乳腺内可见类圆形结节，边界清楚，密度均匀。', typicalFor: ['乳腺纤维腺瘤'] },
  { id: 'tf094', name: '冠心病', category: '心血管病变', modality: 'CTA', bodyPart: '心脏', description: '冠脉可见粥样硬化斑块，某支管腔狭窄大于50%。', typicalFor: ['冠脉粥样硬化', '冠心病'] },
  { id: 'tf095', name: '心肌梗死', category: '心血管病变', modality: 'CT', bodyPart: '心脏', description: '左室壁节段性变薄，延迟扫描可见强化，提示心肌梗死。', typicalFor: ['STEMI', '非STEMI'] },
  { id: 'tf096', name: '室壁瘤', category: '心血管病变', modality: 'CT', bodyPart: '心脏', description: '左室壁局部变薄向外突出，呈瘤样扩张。', typicalFor: ['陈旧性心肌梗死并发症'] },
  { id: 'tf097', name: '心包积液', category: '心包病变', modality: 'CT', bodyPart: '心脏', description: '心包可见弧形液性暗区，深度大于10mm为大量积液。', typicalFor: ['心包积液'] },
  { id: 'tf098', name: '夹层动脉瘤', category: '危急血管病变', modality: 'CTA', bodyPart: '血管', description: '血管壁可见内膜片影分离，形成真假两腔。', typicalFor: ['主动脉夹层', '内脏动脉夹层'] },
  { id: 'tf099', name: '肠系膜血栓', category: '危急血管病变', modality: 'CTA', bodyPart: '血管', description: '肠系膜血管内可见充盈缺损，肠管扩张积液，肠壁水肿增厚。', typicalFor: ['急性肠系膜缺血'] },
  { id: 'tf100', name: '门静脉血栓', category: '血管性病变', modality: 'CTA', bodyPart: '血管', description: '门静脉内可见充盈缺损，门静脉增宽。', typicalFor: ['门静脉血栓形成', '门静脉海绵样变性'] },
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
  // [NEW] 三栏布局宽度
  const [leftSidebarWidth] = useState(280)
  const [rightPanelWidth] = useState(320)

  // [NEW] 左侧边栏折叠状态
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [leftSectionExpanded, setLeftSectionExpanded] = useState<Record<string, boolean>>({
    patient: true,
    exam: true,
    images: true,
    history: false,
    critical: true,
  })

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

  // [NEW] 右侧面板标签页
  const [rightPanelTab, setRightPanelTab] = useState<'ai' | 'template' | 'phrase' | 'completeness' | 'revision' | 'version' | 'measurement' | 'score'>('ai')

  // ----------------------------------------
  // [NEW] 报告修改痕迹状态
  // ----------------------------------------
  const [reportRevisions, setReportRevisions] = useState<ReportRevision[]>([])
  const [showRevisionPanel, setShowRevisionPanel] = useState(false)
  const [editingFieldRef, setEditingFieldRef] = useState<string | null>(null)
  const [editingFieldValue, setEditingFieldValue] = useState<string>('')
  const [editingFieldBefore, setEditingFieldBefore] = useState<string>('')

  // ----------------------------------------
  // [NEW] 报告版本历史状态
  // ----------------------------------------
  const [reportVersions, setReportVersions] = useState<ReportVersion[]>([])
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<ReportVersion | null>(null)
  const [compareVersion, setCompareVersion] = useState<ReportVersion | null>(null)
  const [showVersionCompare, setShowVersionCompare] = useState(false)

  // ----------------------------------------
  // [NEW] 报告评分状态
  // ----------------------------------------
  const [reportScore, setReportScore] = useState<ReportScore>({
    completeness: 8,
    standardization: 8,
    accuracy: 8,
    timeliness: 8,
  })
  const [showScorePanel, setShowScorePanel] = useState(false)

  // ----------------------------------------
  // [NEW] 快捷测量状态
  // ----------------------------------------
  const [measurementRecords, setMeasurementRecords] = useState<MeasurementRecord[]>([])
  const [showMeasurementPanel, setShowMeasurementPanel] = useState(false)
  const [currentMeasurementType, setCurrentMeasurementType] = useState<string>('ct')
  const [currentMeasurementValue, setCurrentMeasurementValue] = useState('')
  const [currentMeasurementLocation, setCurrentMeasurementLocation] = useState('')

  // ----------------------------------------
  // [NEW] 结构化模板状态
  // ----------------------------------------
  const [showStructuredTemplate, setShowStructuredTemplate] = useState(false)
  const [selectedStructuredTemplate, setSelectedStructuredTemplate] = useState<StructuredTemplate | null>(null)
  const [structuredSectionValues, setStructuredSectionValues] = useState<Record<string, string>>({})

  // ----------------------------------------
  // [NEW] 数字签名增强状态
  // ----------------------------------------
  const [showSignaturePanel, setShowSignaturePanel] = useState(false)
  const [signatureData, setSignatureData] = useState<{
    signed: boolean
    signedBy?: string
    signedTitle?: string
    signedTime?: string
    signatureImage?: string
  }>({ signed: false })

  // 保存状态
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  // [NEW] 自动保存状态
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [autoSaveInterval, setAutoSaveInterval] = useState(60) // 秒
  const [lastAutoSaved, setLastAutoSaved] = useState<string | null>(null)

  // [NEW] 键盘快捷键状态
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  // [NEW] 周转时间状态
  const [examCompletionTime, setExamCompletionTime] = useState<string | null>(null)
  const [turnaroundWarning, setTurnaroundWarning] = useState(false) // 是否超过阈值

  // [NEW] 危急值弹窗状态
  const [showCriticalValuePopup, setShowCriticalValuePopup] = useState(false)
  const [criticalNotifyClinician, setCriticalNotifyClinician] = useState(true)

  // [NEW] 报告状态徽章
  const [reportStatusBadge, setReportStatusBadge] = useState<'Draft' | 'Pending' | 'Approved' | 'Signed'>('Draft')

  // [NEW] 数字签名状态
  const [digitalSignature, setDigitalSignature] = useState<{
    signed: boolean
    signedBy?: string
    signedTitle?: string
    signedTime?: string
  }>({ signed: false })

  // [NEW] ICD-10搜索状态
  const [icd10Search, setIcd10Search] = useState('')
  const [filteredIcd10Codes, setFilteredIcd10Codes] = useState<ICD10Code[]>([])
  const [showIcd10Dropdown, setShowIcd10Dropdown] = useState(false)

  // [NEW] 印象拖拽状态
  const [draggedImpressionIndex, setDraggedImpressionIndex] = useState<number | null>(null)

  // [NEW] 模板库搜索和筛选
  const [templateLibrarySearch, setTemplateLibrarySearch] = useState('')
  const [templateLibraryModality, setTemplateLibraryModality] = useState<string>('all')
  const [showFavoriteTemplatesOnly, setShowFavoriteTemplatesOnly] = useState(false)

  // [NEW] 短语库搜索和筛选
  const [phraseLibrarySearch, setPhraseLibrarySearch] = useState('')
  const [phraseLibraryCategory, setPhraseLibraryCategory] = useState<string>('all')

  // [NEW] 操作日志展开状态
  const [operationLogExpanded, setOperationLogExpanded] = useState(false)

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
  // [NEW] 短语库计算
  // ----------------------------------------
  const phraseLibrary = useMemo(() => {
    const bodyPart = selectedExam?.bodyPart || '头颅'
    return PHRASE_LIBRARY[bodyPart] || PHRASE_LIBRARY['头颅'] || []
  }, [selectedExam])

  const filteredPhrases = useMemo(() => {
    return phraseLibrary.filter(p => {
      const matchesSearch = !phraseLibrarySearch ||
        p.label.includes(phraseLibrarySearch) ||
        p.phrase.includes(phraseLibrarySearch)
      const matchesCategory = phraseLibraryCategory === 'all' || p.category === phraseLibraryCategory
      return matchesSearch && matchesCategory
    })
  }, [phraseLibrary, phraseLibrarySearch, phraseLibraryCategory])

  // ----------------------------------------
  // [NEW] 模板库计算
  // ----------------------------------------
  const filteredTemplates = useMemo(() => {
    let result = initialReportTemplates

    // 按模态筛选
    if (templateLibraryModality !== 'all') {
      result = result.filter(t => {
        const cat = TEMPLATE_CATEGORIES.find(c => c.id === t.categoryId)
        return cat?.modality === templateLibraryModality
      })
    }

    // 按收藏筛选
    if (showFavoriteTemplatesOnly) {
      result = result.filter(t => t.isFavorite)
    }

    // 按搜索筛选
    if (templateLibrarySearch) {
      result = result.filter(t =>
        t.name.includes(templateLibrarySearch) ||
        t.content.includes(templateLibrarySearch)
      )
    }

    return result
  }, [templateLibraryModality, showFavoriteTemplatesOnly, templateLibrarySearch])

  // ----------------------------------------
  // [NEW] 报告完整性检查
  // ----------------------------------------
  const completenessCheck = useMemo(() => {
    const checks = [
      { key: 'has_findings', label: '已填写检查所见', required: true, passed: (findings?.length || 0) > 0 },
      { key: 'has_diagnosis', label: '已填写诊断意见', required: true, passed: (diagnosis?.length || 0) > 0 },
      { key: 'has_impression', label: '已填写印象/结论', required: true, passed: impressions.some(i => i.trim()) },
      { key: 'has_recommendation', label: '已填写建议', required: false, passed: (recommendations?.length || 0) > 0 },
      { key: 'has_critical_if_present', label: '发现危急值时已标注', required: false, passed: !criticalFinding || (criticalDetails?.length || 0) > 0 },
      { key: 'findings_length', label: '所见描述≥50字符', required: true, passed: (findings?.length || 0) >= 50 },
      { key: 'diagnosis_length', label: '诊断意见≥20字符', required: true, passed: (diagnosis?.length || 0) >= 20 },
      { key: 'complete_body_part', label: '检查部位描述完整', required: true, passed: (findings?.length || 0) >= 100 },
    ]

    const passedCount = checks.filter(c => c.passed).length
    const requiredPassedCount = checks.filter(c => c.required && c.passed).length
    const requiredCount = checks.filter(c => c.required).length
    const score = Math.round((passedCount / checks.length) * 100)

    return {
      checks,
      passedCount,
      totalCount: checks.length,
      requiredPassedCount,
      requiredCount,
      score,
      isComplete: requiredPassedCount === requiredCount,
    }
  }, [findings, diagnosis, impressions, recommendations, criticalFinding, criticalDetails])

  // ----------------------------------------
  // [NEW] AI推荐计算
  // ----------------------------------------
  const computedAiSuggestions = useMemo(() => {
    if (!selectedExam) return []

    const key = `${selectedExam.modality}-${selectedExam.bodyPart}`
    const data = ENHANCED_AI_RECOMMENDATIONS[key] || AI_RECOMMENDATIONS[key] || {
      findings: [],
      conclusions: [],
      completeness: []
    }

    const suggestions: AISuggestion[] = [
      ...(data.findings || []).slice(0, 3).map((f: { content: string; confidence: number; source: string }, idx: number) => ({
        id: `ai-finding-${idx}`,
        type: 'finding' as const,
        content: f.content,
        confidence: f.confidence,
        source: f.source,
      })),
      ...(data.conclusions || []).slice(0, 2).map((c: { content: string; confidence: number }, idx: number) => ({
        id: `ai-conclusion-${idx}`,
        type: 'conclusion' as const,
        content: c.content,
        confidence: c.confidence,
      })),
    ]

    return suggestions
  }, [selectedExam])

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
  // [NEW] 周转时间计算
  // ----------------------------------------
  useEffect(() => {
    if (!selectedExam?.examDate) {
      setExamCompletionTime(null)
      setTurnaroundWarning(false)
      return
    }

    // 模拟计算周转时间（从检查完成到现在的时长）
    const completionTime = new Date(selectedExam.examDate)
    const now = new Date()
    const diffMs = now.getTime() - completionTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    setExamCompletionTime(`${diffHours}小时${diffMinutes}分钟`)
    // 超过2小时警告
    setTurnaroundWarning(diffHours >= 2)
  }, [selectedExam])

  // ----------------------------------------
  // [NEW] 自动保存
  // ----------------------------------------
  useEffect(() => {
    if (!autoSaveEnabled || !selectedExam) return

    const interval = setInterval(() => {
      // 自动保存草稿
      setLastAutoSaved(formatDateTime())
    }, autoSaveInterval * 1000)

    return () => clearInterval(interval)
  }, [autoSaveEnabled, autoSaveInterval, selectedExam])

  // ----------------------------------------
  // [NEW] F1-F12快捷键状态
  // ----------------------------------------
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const [showShortcutHelp, setShowShortcutHelp] = useState(false)
  const [showShortcutToolbar, setShowShortcutToolbar] = useState(true)

  // 快捷键功能映射
  const handleShortcut = useCallback((key: string) => {
    setActiveShortcut(key)
    setTimeout(() => setActiveShortcut(null), 300)

    switch (key) {
      case 'F1':
        setShowShortcutHelp(true)
        break
      case 'F2':
        // 语音录入开关
        if (voiceSupported) {
          if (isRecording) {
            stopVoiceInput()
          } else {
            startVoiceInput()
          }
        }
        break
      case 'F3':
        window.location.reload()
        break
      case 'F4':
        setShowTemplateModal(true)
        break
      case 'F5':
        // AI自动填充
        if (selectedExam && findings.length === 0) {
          const key = `${selectedExam.modality}-${selectedExam.bodyPart}`
          const rec = AI_RECOMMENDATIONS[key]
          if (rec && rec.findings.length > 0) {
            setFindings(rec.findings[0].content)
          }
        }
        break
      case 'F6':
        handleSaveDraft()
        break
      case 'F7':
        handleSubmitReport()
        break
      case 'F8':
        // 时限提醒 - 聚焦到时限信息
        setRightPanelTab('tat')
        break
      case 'F9':
        // 完整度检测
        setRightPanelTab('quality')
        break
      case 'F10':
        // 历史报告
        setRightPanelTab('history')
        break
      case 'F11':
        setShowPrintPreview(true)
        break
      case 'F12':
        // 设置面板
        setShowSettingsPanel?.(true)
        break
    }
  }, [isRecording, voiceSupported, selectedExam, findings])

  // ----------------------------------------
  // [NEW] 键盘快捷键（F1-F12 + Ctrl）
  // ----------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1-F12快捷键（非输入框时触发）
      const tag = (e.target as HTMLElement)?.tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      if (!isInput && e.key.startsWith('F') && e.key.length <= 4) {
        e.preventDefault()
        handleShortcut(e.key)
        return
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
          case 'S':
            e.preventDefault()
            handleSaveDraft()
            break
          case 'Enter':
            e.preventDefault()
            handleSubmitReport()
            break
          case '1':
            e.preventDefault()
            setActiveTab('findings')
            break
          case '2':
            e.preventDefault()
            setActiveTab('diagnosis')
            break
          case '3':
            e.preventDefault()
            setActiveTab('impression')
            break
          case 'b':
          case 'B':
            e.preventDefault()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleShortcut])

  // ----------------------------------------
  // [NEW] ICD-10搜索过滤
  // ----------------------------------------
  useEffect(() => {
    if (icd10Search.length >= 1) {
      const filtered = ICD10_CODES.filter(code =>
        code.code.includes(icd10Search) ||
        code.name.includes(icd10Search) ||
        code.category.includes(icd10Search)
      ).slice(0, 10)
      setFilteredIcd10Codes(filtered)
      setShowIcd10Dropdown(filtered.length > 0)
    } else {
      setFilteredIcd10Codes([])
      setShowIcd10Dropdown(false)
    }
  }, [icd10Search])

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
  }, [voiceActiveField, stopVoiceInput])

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

  // ----------------------------------------
  // [NEW] AI模拟数据生成
  // ----------------------------------------
  const handleAISimulate = useCallback(() => {
    if (!selectedExam) {
      alert('请先选择一个检查项目')
      return
    }

    const key = `${selectedExam.modality}-${selectedExam.bodyPart}`
    const aiData = ENHANCED_AI_RECOMMENDATIONS[key]

    if (!aiData) {
      // 如果没有精确匹配，尝试模糊匹配
      const modalityKey = Object.keys(ENHANCED_AI_RECOMMENDATIONS).find(k => k.startsWith(selectedExam.modality + '-'))
      const matchedData = modalityKey ? ENHANCED_AI_RECOMMENDATIONS[modalityKey] : null

      if (!matchedData) {
        alert(`暂无 ${selectedExam.modality}-${selectedExam.bodyPart} 的AI模拟数据`)
        return
      }

      // 模糊匹配：使用该模态的通用数据
      const randomFindings = matchedData.findings[Math.floor(Math.random() * matchedData.findings.length)]
      const randomConclusion = matchedData.conclusions[Math.floor(Math.random() * matchedData.conclusions.length)]

      setFindings(randomFindings.content)
      setDiagnosis(randomConclusion.content)
      setImpressions([randomConclusion.content])
      setRecommendations(matchedData.completeness.slice(0, 3).join('；') + '。')
      return
    }

    // 精确匹配：随机选择所见和结论
    const randomFindings = aiData.findings[Math.floor(Math.random() * aiData.findings.length)]
    const randomConclusion = aiData.conclusions[Math.floor(Math.random() * aiData.conclusions.length)]

    // 生成模拟报告内容
    const simulatedFindings = `【检查所见】
${randomFindings.content}

【测量数据】
病变大小：约${(Math.random() * 3 + 1).toFixed(1)}×${(Math.random() * 3 + 1).toFixed(1)}cm
CT值：约${Math.floor(Math.random() * 40 + 20)}HU
增强扫描：${Math.random() > 0.5 ? '呈不均匀强化' : '边缘环形强化'}

【正常描述】
余${selectedExam.bodyPart}未见明显异常。`

    const simulatedDiagnosis = randomConclusion.content
    const simulatedImpression = `${randomConclusion.content}
${Math.random() > 0.7 ? '建议定期复查，3-6个月后复查' + selectedExam.modality + '。' : ''}`

    setFindings(simulatedFindings)
    setDiagnosis(simulatedDiagnosis)
    setImpressions([simulatedImpression])
    setRecommendations(aiData.completeness.slice(0, 3).join('；') + '。')
  }, [selectedExam])

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

  const handleApplyTemplateWithLog = useCallback((template: ReportTemplate) => {
    handleApplyTemplate(template)
    addOperationLog('模板应用', `应用模板: ${template.name}`)
    setShowTemplateLibrary(false)
    setTemplatePreview(null)
  }, [handleApplyTemplate, addOperationLog])

  // 保存报告（草稿）
  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSaving(false)
    setSaveSuccess(true)
    setLastSaved(formatDateTime())

    // [NEW] 保存时创建版本记录
    const currentUser = MOCK_REVIEW_USERS[2] || { name: '报告医生', title: '主治医师' }
    const newVersion: ReportVersion = {
      id: `v_${Date.now()}`,
      versionNumber: reportVersions.length + 1,
      timestamp: formatDateTime(),
      author: currentUser.name,
      authorTitle: currentUser.title,
      action: 'save',
      findings,
      diagnosis,
      impression: impressions.filter(i => i.trim()).join('\n'),
      recommendation: recommendations,
    }
    setReportVersions(prev => [...prev, newVersion])

    // [NEW] 保存时记录修改痕迹
    if (editingFieldRef && editingFieldValue !== editingFieldBefore) {
      const newRevision: ReportRevision = {
        id: `rev_${Date.now()}`,
        field: editingFieldRef as ReportRevision['field'],
        before: editingFieldBefore,
        after: editingFieldValue,
        author: currentUser.name,
        authorTitle: currentUser.title,
        timestamp: formatDateTime(),
      }
      setReportRevisions(prev => [...prev, newRevision])
      setEditingFieldRef(null)
      setEditingFieldBefore('')
      setEditingFieldValue('')
    }
  }, [findings, diagnosis, impressions, recommendations, criticalFinding, criticalDetails, reportVersions.length, editingFieldRef, editingFieldValue, editingFieldBefore])

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

    // [NEW] 提交时创建版本记录
    const currentUser = MOCK_REVIEW_USERS[2] || { name: '报告医生', title: '主治医师' }
    const newVersion: ReportVersion = {
      id: `v_${Date.now()}`,
      versionNumber: reportVersions.length + 1,
      timestamp: formatDateTime(),
      author: currentUser.name,
      authorTitle: currentUser.title,
      action: 'submit',
      findings,
      diagnosis,
      impression: impressions.filter(i => i.trim()).join('\n'),
      recommendation: recommendations,
    }
    setReportVersions(prev => [...prev, newVersion])
  }, [findings, diagnosis, impressions, recommendations, reportVersions.length])

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
  // [NEW] 修改痕迹记录
  // ----------------------------------------
  const startFieldEdit = useCallback((field: string, currentValue: string) => {
    setEditingFieldRef(field)
    setEditingFieldValue(currentValue)
    setEditingFieldBefore(currentValue)
  }, [])

  const saveFieldEdit = useCallback((field: string, newValue: string) => {
    if (editingFieldBefore && newValue !== editingFieldBefore) {
      const currentUser = MOCK_REVIEW_USERS[2] || { name: '报告医生', title: '主治医师' }
      const newRevision: ReportRevision = {
        id: `rev_${Date.now()}`,
        field: field as ReportRevision['field'],
        before: editingFieldBefore,
        after: newValue,
        author: currentUser.name,
        authorTitle: currentUser.title,
        timestamp: formatDateTime(),
      }
      setReportRevisions(prev => [...prev, newRevision])
    }
    setEditingFieldRef(null)
    setEditingFieldValue('')
    setEditingFieldBefore('')
  }, [editingFieldBefore])

  // ----------------------------------------
  // [NEW] 快捷测量工具
  // ----------------------------------------
  const handleAddMeasurement = useCallback(() => {
    if (!currentMeasurementValue.trim()) return
    const preset = MEASUREMENT_PRESETS.find(p => p.type === currentMeasurementType)
    const newRecord: MeasurementRecord = {
      id: `m_${Date.now()}`,
      type: currentMeasurementType as MeasurementRecord['type'],
      value: currentMeasurementValue,
      unit: preset?.unit || '',
      location: currentMeasurementLocation,
      timestamp: formatDateTime(),
    }
    setMeasurementRecords(prev => [...prev, newRecord])
    setCurrentMeasurementValue('')
    setCurrentMeasurementLocation('')
  }, [currentMeasurementType, currentMeasurementValue, currentMeasurementLocation])

  const handleInsertMeasurement = useCallback((record: MeasurementRecord) => {
    const text = `${record.location ? record.location + '：' : ''}${record.value}${record.unit}`
    setFindings(prev => prev + (prev ? '\n' : '') + text)
  }, [])

  // ----------------------------------------
  // [NEW] 版本历史对比
  // ----------------------------------------
  const handleSelectVersion = useCallback((version: ReportVersion) => {
    setSelectedVersion(version)
  }, [])

  const handleCompareVersions = useCallback(() => {
    if (selectedVersion && compareVersion) {
      setShowVersionCompare(true)
    }
  }, [selectedVersion, compareVersion])

  const handleViewVersion = useCallback((version: ReportVersion) => {
    setSelectedVersion(version)
  }, [])

  // ----------------------------------------
  // [NEW] 结构化模板应用
  // ----------------------------------------
  const handleApplyStructuredTemplate = useCallback((template: StructuredTemplate) => {
    setSelectedStructuredTemplate(template)
    setShowStructuredTemplate(true)
    // 初始化分区值
    const initialValues: Record<string, string> = {}
    template.sections.forEach(s => {
      initialValues[s.id] = ''
    })
    setStructuredSectionValues(initialValues)
  }, [])

  const handleConfirmStructuredTemplate = useCallback(() => {
    if (!selectedStructuredTemplate) return
    let content = ''
    selectedStructuredTemplate.sections.forEach(section => {
      const value = structuredSectionValues[section.id]
      if (value?.trim()) {
        content += `${section.label}：${value}\n`
      }
    })
    setFindings(content)
    setImpressions([selectedStructuredTemplate.conclusionTemplate])
    setRecommendations(selectedStructuredTemplate.recommendationTemplate)
    setShowStructuredTemplate(false)
    addOperationLog('结构化模板', `应用模板: ${selectedStructuredTemplate.name}`)
  }, [selectedStructuredTemplate, structuredSectionValues])

  // ----------------------------------------
  // [NEW] 报告评分
  // ----------------------------------------
  const getTotalScore = useCallback(() => {
    const { completeness, standardization, accuracy, timeliness } = reportScore
    return Math.round((completeness + standardization + accuracy + timeliness) / 4 * 10)
  }, [reportScore])

  // ----------------------------------------
  // [NEW] 数字签名
  // ----------------------------------------
  const handleSignReport = useCallback(() => {
    const currentUser = MOCK_REVIEW_USERS[0] || { name: '张明华', title: '主任医师' }
    setSignatureData({
      signed: true,
      signedBy: currentUser.name,
      signedTitle: currentUser.title,
      signedTime: formatDateTime(),
      signatureImage: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-size="14" fill="%231e3a5f" font-family="serif">${currentUser.name}</text><text x="10" y="55" font-size="10" fill="%2364748b" font-family="sans-serif">${currentUser.title}</text></svg>`,
    })
    addOperationLog('数字签名', `报告已数字签名: ${currentUser.name}`)
  }, [addOperationLog])

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

        {/* [NEW] TAT周转时间实时监控条 */}
        {(() => {
          // 计算TAT：申请时间→现在（或报告时间）
          const applyTime = selectedExam?.applyTime
            ? new Date(selectedExam.applyTime).getTime()
            : Date.now() - 30 * 60 * 1000 // 默认30分钟前
          const nowTime = Date.now()
          const diffMs = nowTime - applyTime
          const diffMins = Math.floor(diffMs / 60000)
          const diffHours = Math.floor(diffMins / 60)
          const remainingMins = diffMins % 60

          // TAT等级：<30min=green, 30-60min=yellow, >60min=red
          const tatLevel = diffMins < 30 ? 'normal' : diffMins < 60 ? 'warning' : 'urgent'
          const tatColor = tatLevel === 'normal' ? s.success : tatLevel === 'warning' ? s.warning : s.danger
          const tatBg = tatLevel === 'normal' ? s.successBg : tatLevel === 'warning' ? s.warningBg : s.dangerBg
          const tatBorder = tatLevel === 'normal' ? s.successBorder : tatLevel === 'warning' ? s.warningBorder : s.dangerBorder
          const tatLabel = diffMins < 30 ? '及时' : diffMins < 60 ? '预警' : '超时'

          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 14px',
              background: tatBg,
              borderRadius: s.radius,
              border: `1px solid ${tatBorder}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} style={{ color: tatColor }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: tatColor }}>TAT</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: tatColor, fontFamily: s.fontMono }}>
                  {diffHours > 0 ? `${diffHours}h` : ''}{remainingMins}min
                </span>
              </div>
              <div style={{ fontSize: 10, color: tatColor, opacity: 0.8 }}>
                {diffHours > 0 ? `${diffHours}小时${remainingMins}分钟` : `${remainingMins}分钟`}
              </div>
              <div style={{
                marginLeft: 'auto',
                padding: '2px 8px',
                background: tatColor,
                color: s.white,
                borderRadius: s.radiusSm,
                fontSize: 10,
                fontWeight: 700,
              }}>
                {tatLabel}
              </div>
              {/* 进度条 */}
              <div style={{
                width: 80,
                height: 4,
                background: s.gray200,
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (diffMins / 60) * 100)}%`,
                  background: tatColor,
                  transition: 'all 0.3s',
                }} />
              </div>
            </div>
          )
        })()}

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
              {/* [NEW] 专业所见分区引导 */}
              <div style={{
                display: 'flex',
                gap: 8,
                marginBottom: 10,
                padding: '8px 12px',
                background: s.gray50,
                borderRadius: s.radius,
                border: `1px solid ${s.gray200}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: s.success,
                  }} />
                  <span style={{ fontSize: 11, color: s.gray600 }}>
                    <strong style={{ color: s.success }}>正常所见</strong>：描述未见异常的区域
                  </span>
                </div>
                <div style={{ width: 1, background: s.gray200 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: s.danger,
                  }} />
                  <span style={{ fontSize: 11, color: s.gray600 }}>
                    <strong style={{ color: s.danger }}>异常所见</strong>：重点描述病变特征
                  </span>
                </div>
                {/* 书写进度 */}
                <div style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  background: findings.length > 0 ? s.successBg : s.gray100,
                  borderRadius: s.radiusSm,
                }}>
                  <span style={{
                    fontSize: 11,
                    color: findings.length > 0 ? s.success : s.gray400,
                    fontWeight: 600,
                  }}>
                    {findings.length > 0 ? '✓ 已书写' : '未开始'}
                  </span>
                </div>
              </div>

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
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = s.primaryBorder
                        ;(e.currentTarget as HTMLButtonElement).style.background = s.primaryBg
                        ;(e.currentTarget as HTMLButtonElement).style.color = s.primary
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = s.gray200
                        ;(e.currentTarget as HTMLButtonElement).style.background = s.gray50
                        ;(e.currentTarget as HTMLButtonElement).style.color = s.gray600
                      }}
                    >
                      + {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* [NEW] 专业所见编辑器 */}
              <div style={{
                border: `1px solid ${s.gray200}`,
                borderRadius: s.radius,
                overflow: 'hidden',
              }}>
                {/* 编辑器顶部工具条 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  background: s.gray50,
                  borderBottom: `1px solid ${s.gray200}`,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: s.primary }}>
                    检查所见
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    {[
                      { label: '正常', color: s.success },
                      { label: '异常', color: s.danger },
                    ].map(({ label, color }) => (
                      <button
                        key={label}
                        onClick={() => {
                          const prefix = label === '正常'
                            ? '\n【正常所见】\n'
                            : '\n【异常所见】\n'
                          setFindings(prev => prev + (prev.endsWith('\n') || prev === '' ? '' : '\n') + prefix)
                        }}
                        style={{
                          padding: '2px 8px',
                          borderRadius: s.radiusSm,
                          border: `1px solid ${color}`,
                          background: s.white,
                          color: color,
                          fontSize: 10,
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        +{label}
                      </button>
                    ))}
                    <button
                      onClick={() => setFindings('')}
                      style={{
                        padding: '2px 8px',
                        borderRadius: s.radiusSm,
                        border: `1px solid ${s.gray200}`,
                        background: s.white,
                        color: s.gray500,
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                    >
                      清空
                    </button>
                  </div>
                </div>

                {/* 文本框 */}
                <textarea
                  value={findings}
                  onChange={e => setFindings(e.target.value)}
                  placeholder={"【检查所见书写规范】\n\n1️⃣ 先描述正常所见（未见异常区域）\n2️⃣ 再描述异常所见（病变部位、形态、大小、密度/信号、边界、与周围关系）\n3️⃣ 测量数据统一记录在异常区\n4️⃣ 建议按解剖顺序描述：胸腔→肺野→肺纹理→纵隔→胸壁"}
                  style={{
                    width: '100%',
                    minHeight: 220,
                    border: 'none',
                    borderRadius: 0,
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
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'transparent'
                  }}
                />
              </div>

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
                    icon={<FileText size={12} />}
                    onClick={() => {
                      // 插入结构化模板引导
                      setFindings(prev => prev +
                        (prev ? '\n' : '') +
                        '\n【正常所见】\n双肺野纹理清晰，走行自然，未见实质性病变。\n双肺透过度正常。\n纵隔结构居中，无偏移。\n心影大小形态正常。\n肋膈角锐利。\n\n【异常所见】\n右肺中叶可见一类圆形结节灶，直径约1.2cm，边缘毛糙，密度均匀。\n余双肺野未见明显异常。')
                    }}
                  >
                    填充模板
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Sparkles size={12} />}
                    onClick={handleAISimulate}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      color: '#fff',
                    }}
                  >
                    AI模拟
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

  // [NEW] 渲染：结构化模板选择弹窗
  // ----------------------------------------
  const renderStructuredTemplateModal = () => {
    if (!showStructuredTemplate) return null

    const templates = STRUCTURED_TEMPLATES[examType] || []

    return (
      <Modal
        open={showStructuredTemplate}
        onClose={() => setShowStructuredTemplate(false)}
        title="结构化报告模板"
        width={900}
      >
        <div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.keys(STRUCTURED_TEMPLATES).map(type => (
              <button
                key={type}
                onClick={() => setSelectedStructuredType(type)}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${selectedStructuredType === type ? s.primary : s.gray200}`,
                  borderRadius: s.radius,
                  background: selectedStructuredType === type ? s.primaryBg : s.white,
                  color: selectedStructuredType === type ? s.primary : s.gray600,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {type}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => handleSelectStructuredTemplate(template)}
                style={{
                  padding: '12px 16px',
                  background: selectedStructuredTemplate?.id === template.id ? s.primaryBg : s.gray50,
                  border: `1px solid ${selectedStructuredTemplate?.id === template.id ? s.primaryBorder : s.gray200}`,
                  borderRadius: s.radius,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: s.primary, marginBottom: 4 }}>
                  {template.name}
                </div>
                <div style={{ fontSize: 11, color: s.gray500 }}>
                  {template.sections.length} 个分区 | {template.conclusionTemplate ? '含诊断' : ''} {template.recommendationTemplate ? '含建议' : ''}
                </div>
                <div style={{ fontSize: 10, color: s.gray400, marginTop: 4 }}>
                  适用：{template.modality} {template.bodyPart}
                </div>
              </div>
            ))}
          </div>
          {selectedStructuredTemplate && (
            <div style={{ marginTop: 16, padding: 12, background: s.gray50, borderRadius: s.radius }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.primary, marginBottom: 8 }}>
                模板预览 - {selectedStructuredTemplate.name}
              </div>
              <div style={{ fontSize: 11, color: s.gray600, lineHeight: 1.6 }}>
                <strong>分区：</strong>
                {selectedStructuredTemplate.sections.map(s => s.label).join(' | ')}
              </div>
              <div style={{ fontSize: 11, color: s.gray600, marginTop: 4 }}>
                <strong>诊断模板：</strong>{selectedStructuredTemplate.conclusionTemplate?.slice(0, 60)}...
              </div>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={handleConfirmStructuredTemplate}
                style={{ marginTop: 12 }}
              >
                应用此模板
              </Button>
            </div>
          )}
        </div>
      </Modal>
    )
  }

  // [NEW] 渲染：版本对比弹窗
  // ----------------------------------------
  const renderVersionCompareModal = () => {
    if (!showVersionCompare || compareVersions.length < 2) return null

    const [v1, v2] = compareVersions

    return (
      <Modal
        open={showVersionCompare}
        onClose={() => setShowVersionCompare(false)}
        title={`版本对比 v${v1.versionNumber} vs v${v2.versionNumber}`}
        width={900}
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
              background: s.infoBg,
              borderRadius: s.radius,
              fontSize: 11,
              color: s.info,
              textAlign: 'center',
            }}>
              v{v1.versionNumber} - {v1.author} ({v1.action})
            </div>
            <div style={{
              padding: '8px 12px',
              background: s.warningBg,
              borderRadius: s.radius,
              fontSize: 11,
              color: s.warning,
              textAlign: 'center',
            }}>
              v{v2.versionNumber} - {v2.author} ({v2.action})
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.gray600, marginBottom: 8 }}>检查所见对比</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              maxHeight: 200,
              overflowY: 'auto',
              fontFamily: s.fontMono,
              fontSize: 11,
              lineHeight: 1.6,
            }}>
              <div style={{ padding: 8, background: s.dangerBg, borderRadius: s.radius, whiteSpace: 'pre-wrap', color: s.danger }}>
                {v1.findings || '(空)'}
              </div>
              <div style={{ padding: 8, background: s.successBg, borderRadius: s.radius, whiteSpace: 'pre-wrap', color: s.success }}>
                {v2.findings || '(空)'}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.gray600, marginBottom: 8 }}>诊断意见对比</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              fontFamily: s.fontMono,
              fontSize: 11,
              lineHeight: 1.6,
            }}>
              <div style={{ padding: 8, background: s.dangerBg, borderRadius: s.radius, whiteSpace: 'pre-wrap', color: s.danger }}>
                {v1.diagnosis || '(空)'}
              </div>
              <div style={{ padding: 8, background: s.successBg, borderRadius: s.radius, whiteSpace: 'pre-wrap', color: s.success }}>
                {v2.diagnosis || '(空)'}
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.gray600, marginBottom: 8 }}>印象对比</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              fontFamily: s.fontMono,
              fontSize: 11,
              lineHeight: 1.6,
            }}>
              <div style={{ padding: 8, background: s.dangerBg, borderRadius: s.radius, whiteSpace: 'pre-wrap', color: s.danger }}>
                {v1.impression || '(空)'}
              </div>
              <div style={{ padding: 8, background: s.successBg, borderRadius: s.radius, whiteSpace: 'pre-wrap', color: s.success }}>
                {v2.impression || '(空)'}
              </div>
            </div>
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
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#e8e8e8', overflow: 'hidden', fontFamily: '"Microsoft YaHei UI", "Segoe UI", Arial, sans-serif',
    }}>
      {/* WIN10风格顶部标题栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: 48,
        background: '#ffffff',
        borderBottom: '1px solid #d1d1d1',
        padding: '0 16px',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        {/* 左侧：图标+标题 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 4,
            background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Stethoscope size={16} color="white" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>报告书写</span>
          {selectedExam && (
            <span style={{
              fontSize: 12, color: '#666666', marginLeft: 8,
              padding: '2px 8px', background: '#f3f3f3', borderRadius: 3,
            }}>
              {selectedExam.patientName} · {selectedExam.examItemName}
            </span>
          )}
        </div>

        {/* 右侧：状态+操作 */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* TAT时间 */}
          {selectedExam && (() => {
            const applyTime = selectedExam.applyTime ? new Date(selectedExam.applyTime).getTime() : Date.now() - 30 * 60 * 1000
            const diffMins = Math.floor((Date.now() - applyTime) / 60000)
            const diffHours = Math.floor(diffMins / 60)
            const remainingMins = diffMins % 60
            const isWarning = diffMins >= 30 && diffMins < 60
            const isUrgent = diffMins >= 60
            const bgColor = isUrgent ? '#fde7e9' : isWarning ? '#fff4ce' : '#dff6dd'
            const textColor = isUrgent ? '#c42b1c' : isWarning ? '#8a6914' : '#0e6b0e'
            return (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 3,
                background: bgColor, color: textColor, fontSize: 12,
              }}>
                <Clock size={12} />
                <span style={{ fontWeight: 600 }}>
                  {diffHours > 0 ? `${diffHours}h` : ''}{remainingMins}min
                </span>
                <span style={{ opacity: 0.8 }}>TAT</span>
              </div>
            )
          })()}
          {/* 待处理数 */}
          <div style={{
            fontSize: 12, color: '#666666', padding: '4px 10px',
            background: '#f3f3f3', borderRadius: 3,
          }}>
            待处理: <strong>{pendingExams.length}</strong>
          </div>
          {/* 自动保存提示 */}
          {lastAutoSaved && (
            <span style={{ fontSize: 11, color: '#0e6b0e' }}>
              ✓ 已保存 {lastAutoSaved}
            </span>
          )}
        </div>
      </div>

      {/* WIN10风格三栏主内容区 */}
      <div style={{
        flex: 1, display: 'flex', overflow: 'hidden', padding: 12, gap: 12,
      }}>
        {/* LEFT COLUMN: 患者与检查信息侧边栏 - WIN10风格 */}
        <div style={{
          width: 280, flexShrink: 0,
          background: '#ffffff',
          border: '1px solid #d1d1d1',
          borderRadius: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* WIN10侧边栏头部 */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid #e5e5e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>患者信息</span>
            <button
              onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#888888',
                display: 'flex',
                padding: 4,
                borderRadius: 3,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f0f0f0' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
            >
              {leftSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          {/* 侧边栏内容 */}
          {!leftSidebarCollapsed && selectedExam && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {/* 患者信息卡片 */}
              <CollapsibleSection
                title="患者信息"
                icon={<User size={12} />}
                expanded={leftSectionExpanded.patient}
                onToggle={() => setLeftSectionExpanded(prev => ({ ...prev, patient: !prev.patient }))}
              >
                <div style={{ padding: '8px 0' }}>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>姓名</span>
                    <span style={infoValueStyle}>{selectedExam.patientName}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>性别</span>
                    <span style={infoValueStyle}>{selectedExam.gender}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>年龄</span>
                    <span style={infoValueStyle}>{selectedExam.age}岁</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>PID</span>
                    <span style={infoValueStyle}>{selectedExam.patientId}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>就诊类型</span>
                    <span style={infoValueStyle}>{selectedExam.visitType}</span>
                  </div>
                </div>
              </CollapsibleSection>

              {/* 检查详情卡片 */}
              <CollapsibleSection
                title="检查详情"
                icon={<FileText size={12} />}
                expanded={leftSectionExpanded.exam}
                onToggle={() => setLeftSectionExpanded(prev => ({ ...prev, exam: !prev.exam }))}
              >
                <div style={{ padding: '8px 0' }}>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>模态</span>
                    <span style={{ ...infoValueStyle, color: getModalityColor(selectedExam.modality), fontWeight: 600 }}>
                      {selectedExam.modality}
                    </span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>部位</span>
                    <span style={infoValueStyle}>{selectedExam.bodyPart}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>检查项目</span>
                    <span style={infoValueStyle}>{selectedExam.examItemName}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>设备</span>
                    <span style={infoValueStyle}>{selectedExam.device || '-'}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>临床诊断</span>
                    <span style={infoValueStyle}>{selectedExam.clinicalDiagnosis || '-'}</span>
                  </div>
                </div>
              </CollapsibleSection>

              {/* 图像信息卡片 */}
              <CollapsibleSection
                title={`图像 (${imageCount})`}
                icon={<Image size={12} />}
                expanded={leftSectionExpanded.images}
                onToggle={() => setLeftSectionExpanded(prev => ({ ...prev, images: !prev.images }))}
              >
                <div style={{ padding: '8px 0' }}>
                  {/* 缩略图网格 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 4,
                    marginBottom: 8,
                  }}>
                    {Array.from({ length: Math.min(imageCount, 9) }).map((_, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedImageIndex(idx)
                          setShowImageViewer(true)
                        }}
                        style={{
                          aspectRatio: '1',
                          background: `linear-gradient(135deg, #2a2a4a, #3a3a6a)`,
                          borderRadius: s.radiusSm,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          color: 'rgba(255,255,255,0.5)',
                          border: `1px solid ${s.gray200}`,
                        }}
                      >
                        {idx + 1}
                      </div>
                    ))}
                    {imageCount === 0 && (
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: 20,
                        textAlign: 'center',
                        color: s.gray400,
                        fontSize: 11,
                      }}>
                        暂无图像
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Eye size={12} />}
                    onClick={() => setShowImageViewer(true)}
                    style={{ width: '100%' }}
                  >
                    查看全部图像
                  </Button>
                </div>
              </CollapsibleSection>

              {/* 历史报告时间线 */}
              <CollapsibleSection
                title="历史报告"
                icon={<History size={12} />}
                expanded={leftSectionExpanded.history}
                onToggle={() => setLeftSectionExpanded(prev => ({ ...prev, history: !prev.history }))}
              >
                <div style={{ padding: '8px 0' }}>
                  {historyReports.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {historyReports.map(report => (
                        <div
                          key={report.id}
                          onClick={() => {
                            setSelectedHistoryReport(report)
                            setShowHistoryPanel(true)
                          }}
                          style={{
                            padding: '8px 10px',
                            background: s.gray50,
                            borderRadius: s.radius,
                            cursor: 'pointer',
                            border: `1px solid ${s.gray200}`,
                          }}
                        >
                          <div style={{ fontSize: 11, fontWeight: 600, color: s.primary }}>
                            {report.examDate}
                          </div>
                          <div style={{ fontSize: 10, color: s.gray500 }}>
                            {report.examType}
                          </div>
                          <div style={{ fontSize: 9, color: s.gray400, marginTop: 2 }}>
                            {report.reportDoctor}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: s.gray400, fontSize: 11, padding: 12 }}>
                      暂无历史报告
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              {/* 危急值提示横幅 */}
              {criticalFinding && (
                <div style={{
                  marginTop: 8,
                  padding: '10px 12px',
                  background: s.dangerBg,
                  border: `1px solid ${s.dangerBorder}`,
                  borderRadius: s.radius,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <AlertOctagon size={14} style={{ color: s.danger }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.danger }}>危急值</span>
                  </div>
                  <div style={{ fontSize: 11, color: s.danger }}>
                    {criticalFinding}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 待报告检查列表（未选择检查时） */}
          {!selectedExamId && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.gray600, marginBottom: 8 }}>
                待书写报告 ({filteredPendingExams.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredPendingExams.slice(0, 10).map(exam => (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    style={{
                      padding: '10px 12px',
                      background: s.gray50,
                      borderRadius: s.radius,
                      cursor: 'pointer',
                      border: `1px solid ${s.gray200}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: s.primary }}>{exam.patientName}</span>
                      <Badge bg={getModalityBg(exam.modality)} color={getModalityColor(exam.modality)} size="sm">
                        {exam.modality}
                      </Badge>
                    </div>
                    <div style={{ fontSize: 10, color: s.gray500, marginTop: 2 }}>{exam.examItemName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CENTER COLUMN: 专业报告编辑器 - WIN10风格 */}
        <div style={{
          flex: 1,
          background: '#ffffff',
          border: '1px solid #d1d1d1',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* WIN10风格编辑器工具栏 */}
          <div style={{
            padding: '8px 14px',
            borderBottom: '1px solid #e5e5e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
            height: 44,
          }}>
            {/* 快捷工具 */}
            <div style={{ display: 'flex', gap: 4 }}>
              <Button variant="ghost" size="sm" icon={<Undo2 size={14} />} onClick={() => {}} title="撤销 (Ctrl+Z)" />
              <Button variant="ghost" size="sm" icon={<Redo2 size={14} />} onClick={() => {}} title="重做 (Ctrl+Y)" />
              <div style={{ width: 1, background: s.gray200, margin: '0 6px' }} />
              <Button variant="ghost" size="sm" icon={<Copy size={14} />} onClick={() => handleCopyReport()} title="复制报告" />
              <Button variant="ghost" size="sm" icon={<Printer size={14} />} onClick={() => setShowPrintPreview(true)} title="打印预览 (F11)" />
              <Button variant="ghost" size="sm" icon={<Diff size={14} />} onClick={() => setShowHistoryPanel(true)} title="历史对比 (F10)" />
              <div style={{ width: 1, background: s.gray200, margin: '0 6px' }} />
              {/* F1-F12快捷键按钮组 */}
              <Button
                variant={activeShortcut === 'F1' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleShortcut('F1')}
                title="F1 帮助"
                style={{ minWidth: 32, fontSize: 11, fontWeight: 700 }}
              >
                F1
              </Button>
              <Button
                variant={isRecording || activeShortcut === 'F2' ? 'danger' : 'ghost'}
                size="sm"
                onClick={() => handleShortcut('F2')}
                title="F2 语音录入"
                style={{ minWidth: 32, fontSize: 11, fontWeight: 700 }}
              >
                F2
              </Button>
              <Button
                variant={activeShortcut === 'F4' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleShortcut('F4')}
                title="F4 模板"
                style={{ minWidth: 32, fontSize: 11, fontWeight: 700 }}
              >
                F4
              </Button>
              <Button
                variant={activeShortcut === 'F5' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleShortcut('F5')}
                title="F5 AI填充"
                style={{ minWidth: 32, fontSize: 11, fontWeight: 700 }}
              >
                F5
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShortcut('F6')}
                title="F6 保存"
                style={{ minWidth: 32, fontSize: 11, fontWeight: 700 }}
              >
                F6
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShortcut('F7')}
                title="F7 提交"
                style={{ minWidth: 32, fontSize: 11, fontWeight: 700 }}
              >
                F7
              </Button>
              <Button
                variant={activeShortcut === 'F8' ? 'warning' : 'ghost'}
                size="sm"
                onClick={() => handleShortcut('F8')}
                title="F8 时限"
                style={{ minWidth: 32, fontSize: 11, fontWeight: 700 }}
              >
                F8
              </Button>
              <Button
                variant={activeShortcut === 'F9' ? 'warning' : 'ghost'}
                size="sm"
                onClick={() => handleShortcut('F9')}
                title="F9 完整度"
                style={{ minWidth: 32, fontSize: 11, fontWeight: 700 }}
              >
                F9
              </Button>
              <Button
                variant={activeShortcut === 'F10' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleShortcut('F10')}
                title="F10 历史"
                style={{ minWidth: 36, fontSize: 11, fontWeight: 700 }}
              >
                F10
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShortcut('F11')}
                title="F11 打印"
                style={{ minWidth: 36, fontSize: 11, fontWeight: 700 }}
              >
                F11
              </Button>
            </div>
            {/* 保存状态 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {saveSuccess && (
                <span style={{ fontSize: 11, color: s.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} />
                  已保存
                </span>
              )}
              {lastSaved && (
                <span style={{ fontSize: 10, color: s.gray400 }}>
                  最后保存: {lastSaved}
                </span>
              )}
            </div>
          </div>

          {/* 标签页切换 */}
          {selectedExamId && (
            <>
              <div style={{
                display: 'flex',
                borderBottom: `1px solid ${s.gray200}`,
                background: s.white,
              }}>
                {[
                  { key: 'findings', label: '检查所见', count: findings.length },
                  { key: 'diagnosis', label: '诊断意见', count: diagnosis.length },
                  { key: 'impression', label: '印象', count: impressions.filter(i => i.trim()).length },
                  { key: 'info', label: '报告信息', count: 0 },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    style={{
                      padding: '12px 20px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      color: activeTab === tab.key ? s.primary : s.gray500,
                      borderBottom: `2px solid ${activeTab === tab.key ? s.primary : 'transparent'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span style={{
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: 8,
                        background: activeTab === tab.key ? s.primaryBg : s.gray100,
                        color: activeTab === tab.key ? s.primary : s.gray500,
                      }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* 标签页内容 */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {/* 检查所见 */}
                {activeTab === 'findings' && (
                  <div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: s.primary }}>检查所见</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 10, color: s.gray400 }}>
                            {findings.length} 字符 | {Math.round(findings.length / 2)} 词
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Mic size={12} />}
                            onClick={() => {
                              setVoiceActiveField('findings')
                              startVoiceInput()
                            }}
                          />
                        </div>
                      </div>
                      <div style={{
                        position: 'relative',
                        border: `1px solid ${s.gray200}`,
                        borderRadius: s.radius,
                        overflow: 'hidden',
                      }}>
                        {/* 行号 */}
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 40,
                          background: s.gray50,
                          borderRight: `1px solid ${s.gray200}`,
                          padding: '10px 8px',
                          fontSize: 11,
                          fontFamily: s.fontMono,
                          color: s.gray400,
                          textAlign: 'right',
                          lineHeight: '1.6',
                          overflow: 'hidden',
                          userSelect: 'none',
                        }}>
                          {Array.from({ length: Math.max(1, findings.split('\n').length) }).map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>
                        <textarea
                          value={findings}
                          onChange={e => setFindings(e.target.value)}
                          placeholder="请输入检查所见描述..."
                          style={{
                            width: '100%',
                            minHeight: 250,
                            padding: '10px 12px 10px 48px',
                            border: 'none',
                            outline: 'none',
                            fontSize: 13,
                            lineHeight: '1.6',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                    </div>

                    {/* 危急值复选框 */}
                    <div style={{
                      padding: '10px 12px',
                      background: criticalFinding ? s.dangerBg : s.gray50,
                      borderRadius: s.radius,
                      marginBottom: 12,
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={criticalFinding}
                          onChange={e => {
                            setCriticalFinding(e.target.checked)
                            if (e.target.checked) {
                              setShowCriticalValuePopup(true)
                            }
                          }}
                          style={{ width: 16, height: 16 }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 600, color: criticalFinding ? s.danger : s.gray600 }}>
                          发现危急值
                        </span>
                      </label>
                      {criticalFinding && criticalDetails && (
                        <div style={{ marginTop: 6, fontSize: 11, color: s.danger }}>
                          危急值描述: {criticalDetails}
                        </div>
                      )}
                    </div>

                    {/* 常用短语快速插入 */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: s.gray600, marginBottom: 6 }}>
                        常用短语
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {phraseLibrary.slice(0, 8).map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => setFindings(prev => prev + (prev ? '\n' : '') + p.phrase)}
                            style={{
                              padding: '4px 8px',
                              border: `1px solid ${s.gray200}`,
                              borderRadius: s.radiusSm,
                              background: s.white,
                              fontSize: 10,
                              color: s.gray600,
                              cursor: 'pointer',
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 诊断意见 */}
                {activeTab === 'diagnosis' && (
                  <div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: s.primary, display: 'block', marginBottom: 6 }}>
                        诊断意见
                      </label>
                      <textarea
                        value={diagnosis}
                        onChange={e => setDiagnosis(e.target.value)}
                        placeholder="请输入诊断意见..."
                        style={{
                          width: '100%',
                          minHeight: 150,
                          padding: '10px 12px',
                          border: `1px solid ${s.gray200}`,
                          borderRadius: s.radius,
                          fontSize: 13,
                          lineHeight: '1.6',
                          resize: 'vertical',
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    {/* ICD-10代码搜索 */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                        ICD-10诊断代码
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          value={icd10Search}
                          onChange={e => setIcd10Search(e.target.value)}
                          placeholder="搜索ICD-10代码..."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: `1px solid ${s.gray200}`,
                            borderRadius: s.radius,
                            fontSize: 12,
                            outline: 'none',
                          }}
                        />
                        {showIcd10Dropdown && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: s.white,
                            border: `1px solid ${s.gray200}`,
                            borderRadius: s.radius,
                            boxShadow: s.shadowMd,
                            zIndex: 100,
                            maxHeight: 200,
                            overflowY: 'auto',
                          }}>
                            {filteredIcd10Codes.map(code => (
                              <div
                                key={code.code}
                                onClick={() => {
                                  setDiagnosis(prev => prev + (prev ? '\n' : '') + `[${code.code}] ${code.name}`)
                                  setIcd10Search('')
                                  setShowIcd10Dropdown(false)
                                }}
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  borderBottom: `1px solid ${s.gray100}`,
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = s.gray50)}
                                onMouseLeave={e => (e.currentTarget.style.background = s.white)}
                              >
                                <span style={{ fontSize: 11, fontWeight: 600, color: s.primary }}>{code.code}</span>
                                <span style={{ fontSize: 11, color: s.gray600, marginLeft: 8 }}>{code.name}</span>
                                <span style={{ fontSize: 10, color: s.gray400, marginLeft: 8 }}>{code.category}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 诊断类型选择 */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {DIAGNOSIS_RESULT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          style={{
                            padding: '6px 12px',
                            border: `1px solid ${s.gray200}`,
                            borderRadius: s.radius,
                            background: s.white,
                            fontSize: 11,
                            color: s.gray600,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 印象 */}
                {activeTab === 'impression' && (
                  <div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: s.primary, display: 'block', marginBottom: 6 }}>
                        印象/结论
                      </label>
                      {impressions.map((imp, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={() => setDraggedImpressionIndex(idx)}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => {
                            if (draggedImpressionIndex !== null && draggedImpressionIndex !== idx) {
                              const newImpressions = [...impressions]
                              const [removed] = newImpressions.splice(draggedImpressionIndex, 1)
                              newImpressions.splice(idx, 0, removed)
                              setImpressions(newImpressions)
                            }
                            setDraggedImpressionIndex(null)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <span style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: s.primary,
                            padding: '8px 0',
                            minWidth: 24,
                          }}>
                            {idx + 1}.
                          </span>
                          <textarea
                            value={imp}
                            onChange={e => {
                              const newImpressions = [...impressions]
                              newImpressions[idx] = e.target.value
                              setImpressions(newImpressions)
                            }}
                            placeholder={`印象 ${idx + 1}...`}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              border: `1px solid ${s.gray200}`,
                              borderRadius: s.radius,
                              fontSize: 13,
                              lineHeight: '1.5',
                              resize: 'vertical',
                              outline: 'none',
                              fontFamily: 'inherit',
                            }}
                          />
                          <button
                            onClick={() => setImpressions(impressions.filter((_, i) => i !== idx))}
                            style={{
                              border: 'none',
                              background: s.gray100,
                              borderRadius: s.radiusSm,
                              padding: 6,
                              cursor: 'pointer',
                              color: s.gray500,
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Plus size={12} />}
                        onClick={handleAddImpression}
                      >
                        添加印象行
                      </Button>
                    </div>

                    {/* 印象模板 */}
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: s.gray600, marginBottom: 6 }}>
                        印象模板
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {aiSuggestions.filter(s => s.type === 'conclusion').slice(0, 4).map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setImpressions(prev => [...prev, s.content])
                            }}
                            style={{
                              padding: '4px 8px',
                              border: `1px solid ${s.gray200}`,
                              borderRadius: s.radiusSm,
                              background: s.white,
                              fontSize: 10,
                              color: s.gray600,
                              cursor: 'pointer',
                            }}
                          >
                            {s.content.slice(0, 20)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 报告信息 */}
                {activeTab === 'info' && (
                  <div>
                    <div style={{ marginBottom: 16 }}>
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
                        }}
                      >
                        <option value="">选择报告医生</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.name} - {d.title}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: 16 }}>
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
                        }}
                      >
                        <option value="">选择审核医生</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.name} - {d.title}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                        报告日期时间
                      </label>
                      <input
                        type="datetime-local"
                        value={reportDateTime}
                        onChange={e => setReportDateTime(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${s.gray200}`,
                          borderRadius: s.radius,
                          fontSize: 13,
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                        报告备注
                      </label>
                      <textarea
                        value={reportNotes}
                        onChange={e => setReportNotes(e.target.value)}
                        placeholder="添加备注信息..."
                        style={{
                          width: '100%',
                          minHeight: 80,
                          padding: '8px 12px',
                          border: `1px solid ${s.gray200}`,
                          borderRadius: s.radius,
                          fontSize: 13,
                          resize: 'vertical',
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    {/* 数字签名状态 */}
                    {digitalSignature.signed && (
                      <div style={{
                        padding: '12px 16px',
                        background: s.successBg,
                        borderRadius: s.radius,
                        border: `1px solid ${s.successBorder}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <ShieldCheck size={16} style={{ color: s.success }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: s.success }}>已数字签名</span>
                        </div>
                        <div style={{ fontSize: 11, color: s.success }}>
                          签名人: {digitalSignature.signedBy} ({digitalSignature.signedTitle})
                        </div>
                        <div style={{ fontSize: 10, color: s.success }}>
                          签名时间: {digitalSignature.signedTime}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 底部操作栏 */}
              <div style={{
                padding: '12px 16px',
                borderTop: `1px solid ${s.gray200}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: s.gray50,
              }}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<History size={12} />}
                  onClick={() => setShowOperationLog(!operationLogExpanded)}
                >
                  操作日志 {operationLogs.length > 0 && `(${operationLogs.length})`}
                </Button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Save size={12} />}
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                  >
                    保存草稿
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Send size={12} />}
                    onClick={handleSubmitReport}
                    disabled={isSubmitting || !completenessCheck.isComplete}
                  >
                    提交报告
                  </Button>
                </div>
              </div>

              {/* 折叠的操作日志 */}
              {operationLogExpanded && (
                <div style={{
                  maxHeight: 150,
                  overflowY: 'auto',
                  borderTop: `1px solid ${s.gray200}`,
                  padding: 8,
                  background: s.white,
                }}>
                  {operationLogs.slice(0, 5).map(log => (
                    <div key={log.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      fontSize: 10,
                      color: s.gray500,
                      borderBottom: `1px solid ${s.gray100}`,
                    }}>
                      <span>{log.action}: {log.details}</span>
                      <span>{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 未选择检查时 */}
          {!selectedExamId && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: s.gray400,
            }}>
              <div style={{ textAlign: 'center' }}>
                <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ fontSize: 14 }}>请从左侧选择检查开始书写报告</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI与知识支持面板 - WIN10风格 */}
        <div style={{
          width: 320, flexShrink: 0,
          background: '#ffffff',
          border: '1px solid #d1d1d1',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* WIN10风格面板标签页 */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e5e5e5',
            background: '#ffffff',
            overflowX: 'auto',
          }}>
            {[
              { key: 'ai', label: 'AI助手', icon: <Sparkles size={12} /> },
              { key: 'template', label: '模板库', icon: <FileCheck size={12} /> },
              { key: 'phrase', label: '短语库', icon: <BookOpen size={12} /> },
              { key: 'completeness', label: '完整性', icon: <ClipboardList size={12} /> },
              { key: 'revision', label: '修改记录', icon: <History size={12} /> },
              { key: 'version', label: '版本历史', icon: <FileDiff size={12} /> },
              { key: 'measurement', label: '测量工具', icon: <Ruler size={12} /> },
              { key: 'score', label: '报告评分', icon: <Award size={12} /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setRightPanelTab(tab.key as any)}
                style={{
                  flex: 1,
                  minWidth: 60,
                  padding: '10px 4px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: 600,
                  color: rightPanelTab === tab.key ? s.primary : s.gray500,
                  borderBottom: `2px solid ${rightPanelTab === tab.key ? s.primary : 'transparent'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* 面板内容 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {/* AI助手面板 */}
            {rightPanelTab === 'ai' && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.primary, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={12} />
                    AI推荐
                  </div>
                  {aiLoading ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <Loader2 size={24} style={{ color: s.primary, animation: 'spin 1s linear infinite' }} />
                      <p style={{ fontSize: 11, color: s.gray500, marginTop: 8 }}>正在分析图像...</p>
                    </div>
                  ) : computedAiSuggestions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {computedAiSuggestions.map((suggestion, idx) => (
                        <div
                          key={suggestion.id}
                          style={{
                            padding: '10px 12px',
                            background: s.gray50,
                            borderRadius: s.radius,
                            border: `1px solid ${s.gray200}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 6,
                              background: suggestion.type === 'finding' ? s.infoBg : s.successBg,
                              color: suggestion.type === 'finding' ? s.info : s.success,
                            }}>
                              {suggestion.type === 'finding' ? '所见' : '结论'}
                            </span>
                            <span style={{ fontSize: 10, color: s.gray400 }}>
                              {suggestion.confidence}% 置信度
                            </span>
                          </div>
                          <p style={{ fontSize: 11, color: s.gray600, lineHeight: 1.5, marginBottom: 8 }}>
                            {suggestion.content}
                          </p>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<ThumbsUp size={10} />}
                              onClick={() => handleAcceptAISuggestion(suggestion)}
                            >
                              采纳
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<ThumbsDown size={10} />}
                            >
                              拒绝
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 20, color: s.gray400 }}>
                      <Lightbulb size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                      <p style={{ fontSize: 11 }}>选择检查后显示AI推荐</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 模板库面板 */}
            {rightPanelTab === 'template' && (
              <div>
                {/* 搜索和筛选 */}
                <div style={{ marginBottom: 12 }}>
                  <input
                    value={templateLibrarySearch}
                    onChange={e => setTemplateLibrarySearch(e.target.value)}
                    placeholder="搜索模板..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radius,
                      fontSize: 11,
                      marginBottom: 8,
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setTemplateLibraryModality('all')}
                      style={{
                        padding: '3px 8px',
                        border: `1px solid ${templateLibraryModality === 'all' ? s.primary : s.gray200}`,
                        borderRadius: s.radiusSm,
                        background: templateLibraryModality === 'all' ? s.primaryBg : s.white,
                        color: templateLibraryModality === 'all' ? s.primary : s.gray500,
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                    >
                      全部
                    </button>
                    {['CT', 'MR', 'DR'].map(mod => (
                      <button
                        key={mod}
                        onClick={() => setTemplateLibraryModality(mod)}
                        style={{
                          padding: '3px 8px',
                          border: `1px solid ${templateLibraryModality === mod ? s.primary : s.gray200}`,
                          borderRadius: s.radiusSm,
                          background: templateLibraryModality === mod ? s.primaryBg : s.white,
                          color: templateLibraryModality === mod ? s.primary : s.gray500,
                          fontSize: 10,
                          cursor: 'pointer',
                        }}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 收藏切换 */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showFavoriteTemplatesOnly}
                      onChange={e => setShowFavoriteTemplatesOnly(e.target.checked)}
                      style={{ width: 14, height: 14 }}
                    />
                    <Star size={12} style={{ color: s.warning }} />
                    <span style={{ fontSize: 11, color: s.gray600 }}>只显示收藏模板</span>
                  </label>
                </div>

                {/* 模板列表 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filteredTemplates.slice(0, 10).map(template => (
                    <div
                      key={template.id}
                      onClick={() => handleApplyTemplate(template)}
                      style={{
                        padding: '10px 12px',
                        background: s.gray50,
                        borderRadius: s.radius,
                        border: `1px solid ${s.gray200}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: s.primary }}>{template.name}</span>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            template.isFavorite = !template.isFavorite
                          }}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}
                        >
                          {template.isFavorite ? (
                            <Star size={12} style={{ color: s.warning, fill: s.warning }} />
                          ) : (
                            <StarOff size={12} style={{ color: s.gray400 }} />
                          )}
                        </button>
                      </div>
                      <p style={{ fontSize: 10, color: s.gray500, lineHeight: 1.4 }}>
                        {template.content.slice(0, 60)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 短语库面板 */}
            {rightPanelTab === 'phrase' && (
              <div>
                {/* 搜索 */}
                <div style={{ marginBottom: 12 }}>
                  <input
                    value={phraseLibrarySearch}
                    onChange={e => setPhraseLibrarySearch(e.target.value)}
                    placeholder="搜索短语..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: `1px solid ${s.gray200}`,
                      borderRadius: s.radius,
                      fontSize: 11,
                      marginBottom: 8,
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setPhraseLibraryCategory('all')}
                      style={{
                        padding: '3px 8px',
                        border: `1px solid ${phraseLibraryCategory === 'all' ? s.primary : s.gray200}`,
                        borderRadius: s.radiusSm,
                        background: phraseLibraryCategory === 'all' ? s.primaryBg : s.white,
                        color: phraseLibraryCategory === 'all' ? s.primary : s.gray500,
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                    >
                      全部
                    </button>
                    {['正常描述', '病理描述', '测量描述', '建议'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setPhraseLibraryCategory(cat)}
                        style={{
                          padding: '3px 8px',
                          border: `1px solid ${phraseLibraryCategory === cat ? s.primary : s.gray200}`,
                          borderRadius: s.radiusSm,
                          background: phraseLibraryCategory === cat ? s.primaryBg : s.white,
                          color: phraseLibraryCategory === cat ? s.primary : s.gray500,
                          fontSize: 10,
                          cursor: 'pointer',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 短语列表 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {filteredPhrases.slice(0, 15).map((phrase, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const currentText = activeTab === 'findings' ? findings : activeTab === 'diagnosis' ? diagnosis : recommendations
                        const setter = activeTab === 'findings' ? setFindings : activeTab === 'diagnosis' ? setDiagnosis : setRecommendations
                        setter(prev => prev + (prev ? '\n' : '') + phrase.phrase)
                      }}
                      style={{
                        padding: '8px 10px',
                        background: s.gray50,
                        borderRadius: s.radius,
                        border: `1px solid ${s.gray200}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: s.primary }}>{phrase.label}</span>
                        <span style={{
                          fontSize: 9,
                          padding: '1px 4px',
                          borderRadius: 4,
                          background: s.gray100,
                          color: s.gray500,
                        }}>
                          {phrase.category}
                        </span>
                      </div>
                      <p style={{ fontSize: 10, color: s.gray500 }}>
                        {phrase.phrase.slice(0, 40)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 完整性检查面板 */}
            {rightPanelTab === 'completeness' && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  {/* 分数显示 */}
                  <div style={{
                    textAlign: 'center',
                    padding: '16px 0',
                    background: completenessCheck.score >= 80 ? s.successBg : completenessCheck.score >= 60 ? s.warningBg : s.dangerBg,
                    borderRadius: s.radius,
                    marginBottom: 12,
                  }}>
                    <div style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: completenessCheck.score >= 80 ? s.success : completenessCheck.score >= 60 ? s.warning : s.danger,
                    }}>
                      {completenessCheck.score}%
                    </div>
                    <div style={{ fontSize: 11, color: s.gray600 }}>
                      {completenessCheck.passedCount}/{completenessCheck.totalCount} 项通过
                    </div>
                    {completenessCheck.isComplete ? (
                      <div style={{ fontSize: 10, color: s.success, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <CheckCircle size={10} />
                        报告已完整，可提交
                      </div>
                    ) : (
                      <div style={{ fontSize: 10, color: s.danger, marginTop: 4 }}>
                        缺少 {completenessCheck.requiredCount - completenessCheck.requiredPassedCount} 项必填内容
                      </div>
                    )}
                  </div>

                  {/* 检查项列表 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {completenessCheck.checks.map((check, idx) => (
                      <div
                        key={check.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          background: check.passed ? s.successBg : s.gray50,
                          borderRadius: s.radiusSm,
                        }}
                      >
                        {check.passed ? (
                          <CheckCircle size={12} style={{ color: s.success }} />
                        ) : (
                          <AlertCircle size={12} style={{ color: check.required ? s.danger : s.gray400 }} />
                        )}
                        <span style={{
                          flex: 1,
                          fontSize: 11,
                          color: check.passed ? s.success : check.required ? s.danger : s.gray500,
                        }}>
                          {check.label}
                        </span>
                        {check.required && !check.passed && (
                          <span style={{ fontSize: 9, color: s.danger }}>必填</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* [NEW] 修改记录面板 */}
            {rightPanelTab === 'revision' && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.primary, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <History size={12} />
                    修改记录
                    {reportRevisions.length > 0 && (
                      <Badge bg={s.primary} color={s.white} size="sm">{reportRevisions.length}</Badge>
                    )}
                  </div>
                  {reportRevisions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: s.gray400 }}>
                      <FileText size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                      <p style={{ fontSize: 11 }}>暂无修改记录</p>
                      <p style={{ fontSize: 10, marginTop: 4 }}>保存报告后将自动记录修改</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
                      {reportRevisions.slice().reverse().map(revision => (
                        <div
                          key={revision.id}
                          style={{
                            padding: '10px 12px',
                            background: s.gray50,
                            borderRadius: s.radius,
                            borderLeft: `3px solid ${s.primary}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Badge
                              bg={revision.field === 'findings' ? s.infoBg : revision.field === 'diagnosis' ? s.successBg : s.warningBg}
                              color={revision.field === 'findings' ? s.info : revision.field === 'diagnosis' ? s.success : s.warning}
                              size="sm"
                            >
                              {revision.field === 'findings' ? '检查所见' : revision.field === 'diagnosis' ? '诊断意见' : revision.field === 'impression' ? '印象' : revision.field === 'recommendation' ? '建议' : '危急值'}
                            </Badge>
                            <span style={{ fontSize: 10, color: s.gray400 }}>{revision.timestamp}</span>
                          </div>
                          <div style={{ marginBottom: 4 }}>
                            <span style={{ fontSize: 10, color: s.gray500 }}>修改人：</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: s.gray700 }}>{revision.author}</span>
                            <span style={{ fontSize: 9, color: s.gray400 }}>（{revision.authorTitle}）</span>
                          </div>
                          <div style={{ fontSize: 10, color: s.danger, marginBottom: 2 }}>
                            <span style={{ marginRight: 4 }}>- </span>
                            {revision.before?.slice(0, 50)}{revision.before?.length > 50 ? '...' : ''}
                          </div>
                          <div style={{ fontSize: 10, color: s.success }}>
                            <span style={{ marginRight: 4 }}>+ </span>
                            {revision.after?.slice(0, 50)}{revision.after?.length > 50 ? '...' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* [NEW] 版本历史面板 */}
            {rightPanelTab === 'version' && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.primary, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FileDiff size={12} />
                    版本历史
                    {reportVersions.length > 0 && (
                      <Badge bg={s.primary} color={s.white} size="sm">v{reportVersions.length}</Badge>
                    )}
                  </div>
                  {reportVersions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: s.gray400 }}>
                      <History size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                      <p style={{ fontSize: 11 }}>暂无版本记录</p>
                      <p style={{ fontSize: 10, marginTop: 4 }}>保存或提交报告时自动创建版本</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
                      {reportVersions.slice().reverse().map(version => (
                        <div
                          key={version.id}
                          onClick={() => handleViewVersion(version)}
                          style={{
                            padding: '10px 12px',
                            background: selectedVersion?.id === version.id ? s.primaryBg : s.gray50,
                            borderRadius: s.radius,
                            border: `1px solid ${selectedVersion?.id === version.id ? s.primaryBorder : s.gray200}`,
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <Badge
                              bg={version.action === 'save' ? s.infoBg : version.action === 'submit' ? s.warningBg : s.successBg}
                              color={version.action === 'save' ? s.info : version.action === 'submit' ? s.warning : s.success}
                              size="sm"
                            >
                              {version.action === 'save' ? '保存' : version.action === 'submit' ? '提交' : version.action === 'approve' ? '审核通过' : version.action === 'reject' ? '驳回' : '签发'}
                            </Badge>
                            <span style={{ fontSize: 10, color: s.gray400 }}>v{version.versionNumber}</span>
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: s.primary, marginBottom: 2 }}>
                            {version.author}
                            <span style={{ fontSize: 9, color: s.gray400, marginLeft: 4 }}>（{version.authorTitle}）</span>
                          </div>
                          <div style={{ fontSize: 10, color: s.gray500 }}>
                            {version.timestamp}
                          </div>
                        </div>
                      ))}
                      {selectedVersion && (
                        <div style={{
                          marginTop: 8,
                          padding: '10px 12px',
                          background: s.primaryBg,
                          borderRadius: s.radius,
                          border: `1px solid ${s.primaryBorder}`,
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: s.primary, marginBottom: 6 }}>
                            版本详情 - v{selectedVersion.versionNumber}
                          </div>
                          <div style={{ marginBottom: 4 }}>
                            <span style={{ fontSize: 10, color: s.gray500 }}>检查所见：</span>
                            <div style={{ fontSize: 10, color: s.gray700, marginTop: 2, maxHeight: 60, overflow: 'auto' }}>
                              {selectedVersion.findings?.slice(0, 100)}...
                            </div>
                          </div>
                          <div style={{ marginBottom: 4 }}>
                            <span style={{ fontSize: 10, color: s.gray500 }}>诊断意见：</span>
                            <div style={{ fontSize: 10, color: s.gray700, marginTop: 2 }}>
                              {selectedVersion.diagnosis?.slice(0, 50)}...
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: 10, color: s.gray500 }}>印象：</span>
                            <div style={{ fontSize: 10, color: s.gray700, marginTop: 2 }}>
                              {selectedVersion.impression?.slice(0, 50)}...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* [NEW] 快捷测量工具面板 */}
            {rightPanelTab === 'measurement' && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.primary, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Ruler size={12} />
                    快捷测量工具
                  </div>

                  {/* 测量类型选择 */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: s.gray500, marginBottom: 4 }}>测量类型</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {MEASUREMENT_PRESETS.map(preset => (
                        <button
                          key={preset.type}
                          onClick={() => setCurrentMeasurementType(preset.type)}
                          style={{
                            padding: '4px 8px',
                            border: `1px solid ${currentMeasurementType === preset.type ? s.primary : s.gray200}`,
                            borderRadius: s.radiusSm,
                            background: currentMeasurementType === preset.type ? s.primaryBg : s.white,
                            color: currentMeasurementType === preset.type ? s.primary : s.gray600,
                            fontSize: 10,
                            cursor: 'pointer',
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 测量输入 */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: s.gray500, marginBottom: 4 }}>测量值</div>
                    <input
                      value={currentMeasurementValue}
                      onChange={e => setCurrentMeasurementValue(e.target.value)}
                      placeholder={MEASUREMENT_PRESETS.find(p => p.type === currentMeasurementType)?.placeholder || '请输入测量值'}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: `1px solid ${s.gray200}`,
                        borderRadius: s.radius,
                        fontSize: 12,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* 测量位置 */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: s.gray500, marginBottom: 4 }}>位置/描述</div>
                    <input
                      value={currentMeasurementLocation}
                      onChange={e => setCurrentMeasurementLocation(e.target.value)}
                      placeholder="如：右肺上叶病灶"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: `1px solid ${s.gray200}`,
                        borderRadius: s.radius,
                        fontSize: 12,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<Plus size={12} />}
                    onClick={handleAddMeasurement}
                    disabled={!currentMeasurementValue.trim()}
                  >
                    添加测量记录
                  </Button>
                </div>

                {/* 测量记录列表 */}
                {measurementRecords.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: s.gray600, marginBottom: 6 }}>
                      测量记录 ({measurementRecords.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                      {measurementRecords.map(record => (
                        <div
                          key={record.id}
                          style={{
                            padding: '8px 10px',
                            background: s.gray50,
                            borderRadius: s.radius,
                            border: `1px solid ${s.gray200}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: s.primary }}>
                              {record.location || '未定位'}
                            </span>
                            <Badge bg={s.infoBg} color={s.info} size="sm">
                              {MEASUREMENT_PRESETS.find(p => p.type === record.type)?.label || record.type}
                            </Badge>
                          </div>
                          <div style={{ fontSize: 12, color: s.gray700, marginTop: 2 }}>
                            {record.value} <span style={{ fontSize: 10, color: s.gray500 }}>{record.unit}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInsertMeasurement(record)}
                              style={{ padding: '2px 6px', fontSize: 10 }}
                            >
                              插入报告
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* [NEW] 报告评分面板 */}
            {rightPanelTab === 'score' && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.primary, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Award size={12} />
                    报告质量评分
                  </div>

                  {/* 总分显示 */}
                  <div style={{
                    textAlign: 'center',
                    padding: '20px 0',
                    background: getTotalScore() >= 80 ? s.successBg : getTotalScore() >= 60 ? s.warningBg : s.dangerBg,
                    borderRadius: s.radius,
                    marginBottom: 16,
                  }}>
                    <div style={{
                      fontSize: 40,
                      fontWeight: 800,
                      color: getTotalScore() >= 80 ? s.success : getTotalScore() >= 60 ? s.warning : s.danger,
                    }}>
                      {getTotalScore()}
                    </div>
                    <div style={{ fontSize: 12, color: s.gray600 }}>综合评分（满分100）</div>
                  </div>

                  {/* 各维度评分 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { key: 'completeness' as const, label: '完整性', desc: '报告内容是否完整' },
                      { key: 'standardization' as const, label: '规范性', desc: '格式描述是否规范' },
                      { key: 'accuracy' as const, label: '准确性', desc: '诊断是否准确' },
                      { key: 'timeliness' as const, label: '及时性', desc: '报告完成是否及时' },
                    ].map(item => (
                      <div key={item.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: s.gray700 }}>{item.label}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: s.primary }}>
                            {reportScore[item.key]}/10
                          </span>
                        </div>
                        <div style={{
                          height: 6,
                          background: s.gray200,
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${reportScore[item.key] * 10}%`,
                            background: reportScore[item.key] >= 8 ? s.success : reportScore[item.key] >= 6 ? s.warning : s.danger,
                            borderRadius: 3,
                            transition: 'width 0.3s',
                          }} />
                        </div>
                        <div style={{ fontSize: 9, color: s.gray400, marginTop: 2 }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* 评分调整 */}
                  <div style={{ marginTop: 16, padding: '12px', background: s.gray50, borderRadius: s.radius }}>
                    <div style={{ fontSize: 10, color: s.gray500, marginBottom: 8 }}>调整评分（点击+/-调整）</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['completeness', 'standardization', 'accuracy', 'timeliness'].map(key => (
                        <div key={key} style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <button
                              onClick={() => setReportScore(prev => ({ ...prev, [key]: Math.max(1, (prev as any)[key] - 1) }))}
                              style={{
                                width: 24,
                                height: 24,
                                border: `1px solid ${s.gray200}`,
                                borderRadius: s.radiusSm,
                                background: s.white,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                        justifyContent: 'center',
                              }}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ fontSize: 11, fontWeight: 600, color: s.primary, width: 20 }}>
                              {(reportScore as any)[key]}
                            </span>
                            <button
                              onClick={() => setReportScore(prev => ({ ...prev, [key]: Math.min(10, (prev as any)[key] + 1) }))}
                              style={{
                                width: 24,
                                height: 24,
                                border: `1px solid ${s.gray200}`,
                                borderRadius: s.radiusSm,
                                background: s.white,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div style={{ fontSize: 9, color: s.gray400, marginTop: 2 }}>
                            {key === 'completeness' ? '完整性' : key === 'standardization' ? '规范性' : key === 'accuracy' ? '准确性' : '及时性'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* [NEW] 危急值弹窗 */}
      {showCriticalValuePopup && (
        <div style={{
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
        }}>
          <div style={{
            background: s.white,
            borderRadius: s.radiusLg,
            padding: 24,
            width: 500,
            maxWidth: '90%',
            border: `2px solid ${s.danger}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AlertOctagon size={24} style={{ color: s.danger }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: s.danger, margin: 0 }}>危急值标注</h3>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                选择危急值类型
              </label>
              <select
                value={criticalFinding ? CRITICAL_VALUE_TEMPLATES[0]?.term : ''}
                onChange={e => setCriticalFinding(true)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${s.gray200}`,
                  borderRadius: s.radius,
                  fontSize: 13,
                }}
              >
                <option value="">请选择...</option>
                {CRITICAL_VALUE_TEMPLATES.map(cv => (
                  <option key={cv.id} value={cv.term}>{cv.term}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: s.gray600, display: 'block', marginBottom: 6 }}>
                详细描述
              </label>
              <textarea
                value={criticalDetails}
                onChange={e => setCriticalDetails(e.target.value)}
                placeholder="请详细描述危急值情况..."
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: '8px 12px',
                  border: `1px solid ${s.gray200}`,
                  borderRadius: s.radius,
                  fontSize: 13,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={criticalNotifyClinician}
                  onChange={e => setCriticalNotifyClinician(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: s.gray600 }}>
                  通知临床医生
                </span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => {
                setShowCriticalValuePopup(false)
                setCriticalFinding(false)
              }}>
                取消
              </Button>
              <Button variant="danger" onClick={() => {
                setShowCriticalValuePopup(false)
                addOperationLog('危急值', `标注危急值: ${criticalFinding}`)
              }}>
                确认标注
              </Button>
            </div>
          </div>
        </div>
      )}

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
      {renderStructuredTemplateModal()}
      {renderVersionCompareModal()}

      {/* [NEW] F1快捷键帮助弹窗 */}
      {showShortcutHelp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{
            background: s.white, borderRadius: s.radiusLg, padding: 24,
            width: 600, maxWidth: '90%',
            border: `2px solid ${s.primary}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: s.primary, margin: 0 }}>⌨️ 快捷键帮助</h3>
              <button onClick={() => setShowShortcutHelp(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: s.gray400 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              {[
                ['F1', '帮助', '打开本帮助面板'],
                ['F2', '语音', '开启/关闭语音录入'],
                ['F3', '刷新', '刷新页面'],
                ['F4', '模板', '打开模板选择器'],
                ['F5', 'AI填充', '自动填充报告内容'],
                ['F6', '保存', '保存报告草稿'],
                ['F7', '提交', '提交报告'],
                ['F8', '时限', '显示时限提醒'],
                ['F9', '完整度', '显示完整度检测'],
                ['F10', '历史', '显示历史报告'],
                ['F11', '打印', '打印预览'],
                ['F12', '设置', '打开设置面板'],
                ['Ctrl+1', '所见', '切换到检查所见'],
                ['Ctrl+2', '诊断', '切换到诊断意见'],
                ['Ctrl+3', '印象', '切换到印象'],
                ['Ctrl+S', '保存', '保存报告'],
                ['Ctrl+Enter', '提交', '提交报告'],
              ].map(([key, name, desc]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: s.gray50, borderRadius: s.radius }}>
                  <span style={{ minWidth: 70, fontWeight: 700, color: s.primary, fontFamily: s.fontMono, fontSize: 12 }}>{key}</span>
                  <span style={{ minWidth: 50, fontWeight: 600, color: s.gray700 }}>{name}</span>
                  <span style={{ color: s.gray500, fontSize: 11 }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// [NEW] 可折叠区块组件
// ============================================================
interface CollapsibleSectionProps {
  title: string
  icon?: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSection({ title, icon, expanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          background: s.gray50,
          border: `1px solid ${s.gray200}`,
          borderRadius: s.radius,
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {icon}
          <span style={{ fontSize: 11, fontWeight: 700, color: s.primary }}>{title}</span>
        </div>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {expanded && children}
    </div>
  )
}

// ============================================================
// 辅助样式
// ============================================================
const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '4px 0',
  borderBottom: `1px solid ${s.gray100}`,
}

const infoLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: s.gray500,
}

const infoValueStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: s.gray700,
}
