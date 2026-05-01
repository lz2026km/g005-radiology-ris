// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 典型病例库 v1.0.0
// 上海市第一人民医院放射科
// ============================================================
import { useState, useMemo, useCallback } from 'react'
import {
  Search, Filter, X, ChevronDown, ChevronUp,
  Eye, Heart, MessageSquare, Clock, Calendar,
  Stethoscope, FileText, Tag, Plus, Upload,
  Download, AlertTriangle, Share2, ThumbsUp,
  Image as ImageIcon, Bookmark, BookmarkCheck,
  Activity, Scan, Monitor, BookOpen, List,
  FilterX, Award, Settings, RefreshCw, Edit3
} from 'lucide-react'

// ============================================================
// 样式常量 - 蓝色主题
// ============================================================
const COLORS = {
  primary: '#1e3a5f',
  primaryLight: '#2d4a6f',
  primaryDark: '#152a45',
  white: '#ffffff',
  background: '#f1f5f9',
  backgroundLight: '#f8fafc',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  success: '#059669',
  successBg: '#ecfdf5',
  warning: '#d97706',
  warningBg: '#fffbeb',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  info: '#2563eb',
  infoBg: '#eff6ff',
  purple: '#7c3aed',
  purpleBg: '#f5f3ff',
}

const MODALITY_COLORS: Record<string, string> = {
  CT: '#3b82f6', MR: '#8b5cf6', DR: '#22c55e',
  DSA: '#f59e0b', XR: '#06b6d4', '乳腺钼靶': '#ec4899',
}

// ============================================================
// 类型定义
// ============================================================
interface TypicalCase {
  id: string
  patientName: string
  age: number
  gender: string
  examType: string
  examName: string
  bodyPart: string
  disease: string
  diagnosis: string
  findings: string
  impression: string
  findingsList: string[]
  tags: string[]
  teaching: boolean
  images: { thumbnail: string; description: string }[]
  annotations: { id: string; x: number; y: number; type: string; label: string; description: string }[]
  discussions: { id: string; user: string; avatar: string; content: string; time: string; likes: number; liked: boolean }[]
  likeCount: number
  viewCount: number
  createdAt: string
  createdBy: string
  status: '已审核' | '待审核' | '编辑中'
  verified: boolean
}

// ============================================================
// 模拟数据 - 10个典型病例
// ============================================================
const mockTypicalCases: TypicalCase[] = [
  {
    id: 'TC001', patientName: '张志刚', age: 62, gender: '男', examType: 'CT', examName: '冠脉CTA',
    bodyPart: '心脏', disease: '冠心病', diagnosis: '左主干开口狭窄约85%，前降支近段狭窄约90%',
    findings: '冠脉CTA扫描显示：左主干开口可见重度狭窄，约85%，可见混合斑块形成。前降支近段可见重度狭窄，约90%，局部管壁增厚。回旋支近段可见中度狭窄，约75%。右冠状动脉近段可见重度狭窄，约80%。左室心肌未见明显异常强化。',
    impression: '1. 左主干开口重度狭窄（约85%）\n2. 前降支近段重度狭窄（约90%）\n3. 回旋支近段中度狭窄（约75%）\n4. 右冠状动脉近段重度狭窄（约80%）\n5. 建议行CAG+PCI治疗',
    findingsList: ['左主干开口狭窄约85%', '前降支近段狭窄约90%', '回旋支近段狭窄约75%', '右冠近段狭窄约80%'],
    tags: ['冠心病', '冠脉狭窄', '教学病例', '典型征象'], teaching: true,
    images: [
      { thumbnail: 'coronary', description: '冠脉CTA VR重建' },
      { thumbnail: 'coronary', description: '冠脉CTA CPR重建' },
      { thumbnail: 'coronary', description: '冠脉CTA横断位' },
    ],
    annotations: [
      { id: 'A1', x: 35, y: 45, type: 'stenosis', label: '左主干开口狭窄', description: '狭窄约85%，混合斑块' },
      { id: 'A2', x: 55, y: 40, type: 'stenosis', label: '前降支近段狭窄', description: '狭窄约90%' },
    ],
    discussions: [
      { id: 'D1', user: '李明辉', avatar: 'LMH', content: '非常典型的左主干加三支病变病例，狭窄程度严重，教学价值很高。', time: '2026-04-28 14:30', likes: 12, liked: false },
      { id: 'D2', user: '王秀峰', avatar: 'WXF', content: '同意分析，建议优先处理左主干和前降支病变。', time: '2026-04-28 15:00', likes: 8, liked: true },
    ],
    likeCount: 45, viewCount: 1230, createdAt: '2026-04-25', createdBy: '李明辉', status: '已审核', verified: true,
  },
  {
    id: 'TC002', patientName: '李秀英', age: 55, gender: '女', examType: 'MR', examName: '头颅MR平扫',
    bodyPart: '头颅', disease: '脑转移瘤', diagnosis: '右侧额叶占位，考虑转移瘤',
    findings: '颅脑MR平扫+T1WI、T2WI、FLAIR及增强扫描：右侧额叶见约2.1×1.8cm异常信号，T1WI呈等低信号，T2WI呈高信号，周围见大片水肿信号。增强扫描病灶明显不均匀强化。左侧小脑半球见约0.8cm小结节影。',
    impression: '1. 右侧额叶占位，考虑转移瘤\n2. 左侧小脑半球小结节，考虑转移瘤\n3. 建议进一步查找原发灶',
    findingsList: ['右侧额叶约2.1×1.8cm占位', '病灶周围大片水肿', '增强扫描明显不均匀强化', '左侧小脑半球约0.8cm小结节'],
    tags: ['脑肿瘤', '转移瘤', '典型征象', 'MRI表现'], teaching: true,
    images: [
      { thumbnail: 'brain', description: 'T1WI增强扫描' },
      { thumbnail: 'brain', description: 'T2WI序列' },
      { thumbnail: 'brain', description: 'FLAIR序列' },
    ],
    annotations: [
      { id: 'A1', x: 45, y: 35, type: 'mass', label: '额叶占位', description: '2.1×1.8cm，明显强化' },
      { id: 'A2', x: 50, y: 60, type: 'edema', label: '周围水肿', description: '大片血管源性水肿' },
    ],
    discussions: [
      { id: 'D1', user: '刘芳', avatar: 'LF', content: '环形强化+大片水肿是转移瘤的典型表现，需与胶质瘤鉴别。', time: '2026-04-26 10:00', likes: 15, liked: true },
    ],
    likeCount: 38, viewCount: 980, createdAt: '2026-04-26', createdBy: '刘芳', status: '已审核', verified: true,
  },
  {
    id: 'TC003', patientName: '王建国', age: 58, gender: '男', examType: 'CT', examName: '胸部CT平扫',
    bodyPart: '胸部', disease: '肺癌', diagnosis: '右肺上叶周围型肺癌',
    findings: '胸部CT平扫显示：右肺上叶尖段见约3.5×2.8cm团块影，边缘毛刺状，可见分叶，密度不均匀，CT值约45-65Hu。纵隔淋巴结肿大，较大者约1.5cm。左侧肾上腺增粗，约1.8cm。',
    impression: '1. 右肺上叶周围型肺癌（建议穿刺活检）\n2. 纵隔淋巴结肿大\n3. 左侧肾上腺转移待排除',
    findingsList: ['右肺上叶团块影3.5×2.8cm', '边缘毛刺状', '纵隔淋巴结肿大约1.5cm', '左侧肾上腺增粗'],
    tags: ['肺癌', '周围型肺癌', '典型征象', '教学病例'], teaching: true,
    images: [
      { thumbnail: 'lung', description: '胸部CT肺窗' },
      { thumbnail: 'lung', description: '胸部CT纵隔窗' },
      { thumbnail: 'lung', description: '三维重建' },
    ],
    annotations: [
      { id: 'A1', x: 40, y: 30, type: 'mass', label: '右上叶团块', description: '3.5×2.8cm，边缘毛刺' },
    ],
    discussions: [
      { id: 'D1', user: '王秀峰', avatar: 'WXF', content: '典型周围型肺癌表现，边缘毛刺征是恶性肿瘤特征。', time: '2026-04-27 09:00', likes: 20, liked: false },
    ],
    likeCount: 52, viewCount: 1450, createdAt: '2026-04-27', createdBy: '王秀峰', status: '已审核', verified: true,
  },
  {
    id: 'TC004', patientName: '赵晓敏', age: 45, gender: '女', examType: 'CT', examName: '头颅CT平扫',
    bodyPart: '头颅', disease: '硬膜下血肿', diagnosis: '左侧额颞顶部硬膜下血肿',
    findings: '颅脑CT平扫显示：左侧额颞顶部颅骨内板下方见新月形高密度影，厚度约8mm，密度均匀，CT值约65Hu。右侧脑室轻度受压变形。中线结构右偏约5mm。',
    impression: '1. 左侧额颞顶部硬膜下血肿\n2. 右侧脑室轻度受压\n3. 中线结构右偏约5mm',
    findingsList: ['左侧额颞顶部新月形高密度影', '血肿厚度约8mm', '右侧脑室轻度受压变形', '中线结构右偏约5mm'],
    tags: ['硬膜下血肿', '外伤', '急诊', '典型征象'], teaching: false,
    images: [{ thumbnail: 'brain', description: '颅脑CT平扫' }],
    annotations: [{ id: 'A1', x: 35, y: 40, type: 'hematoma', label: '硬膜下血肿', description: '左侧额颞顶部，厚度8mm' }],
    discussions: [
      { id: 'D1', user: '张海涛', avatar: 'ZHT', content: '典型外伤后硬膜下血肿表现，中线移位明显，需密切监测。', time: '2026-04-27 14:00', likes: 10, liked: true },
    ],
    likeCount: 25, viewCount: 780, createdAt: '2026-04-27', createdBy: '张海涛', status: '已审核', verified: true,
  },
  {
    id: 'TC005', patientName: '周玉芬', age: 52, gender: '女', examType: 'CT', examName: '腹部CT平扫+增强',
    bodyPart: '腹部', disease: '肝血管瘤', diagnosis: '肝右叶血管瘤',
    findings: '上腹部CT增强扫描显示：肝右叶见约4.5×3.8cm低密度影，边界清晰，动脉期边缘结节样强化，门脉期及延迟期对比剂逐渐向内填充，呈现"快进慢出"的强化模式。',
    impression: '1. 肝右叶血管瘤\n2. 符合良性病变影像学表现',
    findingsList: ['肝右叶约4.5×3.8cm低密度影', '边界清晰', '动脉期边缘结节样强化', '"快进慢出"强化模式'],
    tags: ['肝血管瘤', '良性肿瘤', '典型征象', '鉴别诊断'], teaching: true,
    images: [
      { thumbnail: 'liver', description: '动脉期' },
      { thumbnail: 'liver', description: '门脉期' },
      { thumbnail: 'liver', description: '延迟期' },
    ],
    annotations: [{ id: 'A1', x: 50, y: 45, type: 'mass', label: '肝血管瘤', description: '4.5×3.8cm，边缘强化' }],
    discussions: [
      { id: 'D1', user: '李明辉', avatar: 'LMH', content: '"快进慢出"是肝血管瘤的典型强化模式，与肝癌的"快进快出"形成对比。', time: '2026-04-28 10:00', likes: 18, liked: false },
    ],
    likeCount: 33, viewCount: 890, createdAt: '2026-04-28', createdBy: '李明辉', status: '已审核', verified: true,
  },
  {
    id: 'TC006', patientName: '孙伟', age: 35, gender: '男', examType: 'MR', examName: '腰椎MR平扫',
    bodyPart: '脊柱', disease: '腰椎间盘突出', diagnosis: 'L4/5椎间盘向左后突出',
    findings: '腰椎MR平扫显示：L4/5椎间盘向后突出，约0.6cm，压迫硬膜囊前缘。L5/S1椎间盘信号正常，未见突出。椎管形态正常，未见狭窄。黄韧带未见增厚。',
    impression: '1. L4/5椎间盘突出（旁中型）\n2. L5/S1椎间盘未见异常',
    findingsList: ['L4/5椎间盘向后突出约0.6cm', '硬膜囊前缘受压', 'L5/S1椎间盘信号正常', '椎管形态正常'],
    tags: ['椎间盘突出', '腰椎', '退行性病变', '典型征象'], teaching: false,
    images: [
      { thumbnail: 'spine', description: 'T2WI矢状位' },
      { thumbnail: 'spine', description: 'T2WI横断位' },
    ],
    annotations: [{ id: 'A1', x: 50, y: 50, type: 'herniation', label: 'L4/5突出', description: '向后突出0.6cm' }],
    discussions: [
      { id: 'D1', user: '刘芳', avatar: 'LF', content: '典型椎间盘突出MR表现，矢状位T2WI显示椎间盘信号减低。', time: '2026-04-29 11:00', likes: 14, liked: true },
    ],
    likeCount: 28, viewCount: 650, createdAt: '2026-04-29', createdBy: '刘芳', status: '已审核', verified: true,
  },
  {
    id: 'TC007', patientName: '吴婷', age: 42, gender: '女', examType: 'DR', examName: '乳腺钼靶',
    bodyPart: '胸部', disease: '乳腺癌', diagnosis: '左侧乳腺外上象限肿块，BI-RADS 5类',
    findings: '双侧乳腺钼靶X线摄影（MLO+CC位）显示：左侧乳腺外上象限见约2.1×1.8cm肿块影，边缘毛刺状，密度不均匀增高。周围可见簇状钙化。皮肤局限性增厚。',
    impression: '1. 左侧乳腺外上象限肿块，BI-RADS 5类\n2. 建议活检明确诊断',
    findingsList: ['左乳外上象限肿块2.1×1.8cm', '边缘毛刺状', '周围簇状钙化', '皮肤局限性增厚'],
    tags: ['乳腺癌', '乳腺肿块', 'BI-RADS 5', '教学病例'], teaching: true,
    images: [
      { thumbnail: 'breast', description: 'MLO位' },
      { thumbnail: 'breast', description: 'CC位' },
    ],
    annotations: [
      { id: 'A1', x: 45, y: 40, type: 'mass', label: '乳腺肿块', description: '2.1×1.8cm，边缘毛刺' },
      { id: 'A2', x: 50, y: 50, type: 'calc', label: '簇状钙化', description: '恶性钙化特征' },
    ],
    discussions: [
      { id: 'D1', user: '王秀峰', avatar: 'WXF', content: '典型乳腺癌X线表现，毛刺征和簇状钙化都是恶性特征。', time: '2026-04-29 14:00', likes: 22, liked: false },
    ],
    likeCount: 41, viewCount: 1100, createdAt: '2026-04-29', createdBy: '王秀峰', status: '已审核', verified: true,
  },
  {
    id: 'TC008', patientName: '郑丽', age: 38, gender: '女', examType: 'CT', examName: '胸部CT平扫',
    bodyPart: '胸部', disease: '肺栓塞', diagnosis: '双侧肺动脉栓塞',
    findings: '肺动脉CTA显示：双侧肺动脉主干及分支可见多发充盈缺损，左下肺动脉主干完全阻塞。右中肺动脉分支可见偏心性充盈缺损。心脏形态正常，主肺动脉干轻度扩张。',
    impression: '1. 双侧肺动脉栓塞\n2. 左下肺动脉主干完全阻塞\n3. 危急值，已电话通知临床',
    findingsList: ['双侧肺动脉多发充盈缺损', '左下肺动脉主干完全阻塞', '右中肺动脉偏心性充盈缺损', '主肺动脉干轻度扩张'],
    tags: ['肺栓塞', '危急值', '急诊', '典型征象', '教学病例'], teaching: true,
    images: [
      { thumbnail: 'pulmo', description: '肺动脉CTA' },
      { thumbnail: 'pulmo', description: '肺动脉MIP重建' },
    ],
    annotations: [
      { id: 'A1', x: 40, y: 35, type: 'emboli', label: '左下肺动脉栓塞', description: '完全阻塞' },
      { id: 'A2', x: 60, y: 40, type: 'emboli', label: '右中肺动脉栓塞', description: '偏心性充盈缺损' },
    ],
    discussions: [
      { id: 'D1', user: '李明辉', avatar: 'LMH', content: '典型肺栓塞CT表现，充盈缺损是直接征象。', time: '2026-04-30 09:00', likes: 25, liked: true },
    ],
    likeCount: 48, viewCount: 1350, createdAt: '2026-04-30', createdBy: '李明辉', status: '已审核', verified: true,
  },
  {
    id: 'TC009', patientName: '刘建国', age: 65, gender: '男', examType: 'CT', examName: '腹部CT平扫',
    bodyPart: '腹部', disease: '急性胰腺炎', diagnosis: '急性坏死性胰腺炎',
    findings: '上腹部CT平扫显示：胰腺体积明显增大，以体尾部为著，轮廓模糊，密度不均匀减低，周围脂肪间隙模糊、密度增高，可见大量渗出延伸至肾前筋膜。胰周可见液性暗区。',
    impression: '1. 急性坏死性胰腺炎\n2. 胰周渗出伴液性暗区形成\n3. 累及肾前筋膜',
    findingsList: ['胰腺体积明显增大', '体尾部为著，轮廓模糊', '周围脂肪间隙渗出', '肾前筋膜受累'],
    tags: ['急性胰腺炎', '坏死性胰腺炎', '急诊', '典型征象'], teaching: true,
    images: [
      { thumbnail: 'pancreas', description: 'CT平扫' },
      { thumbnail: 'pancreas', description: 'CT增强' },
    ],
    annotations: [{ id: 'A1', x: 45, y: 45, type: 'inflammation', label: '胰腺坏死', description: '体积增大，密度不均' }],
    discussions: [
      { id: 'D1', user: '刘芳', avatar: 'LF', content: '急性坏死性胰腺炎的CT表现，胰腺模糊+周围渗出是典型特征。', time: '2026-05-01 10:00', likes: 16, liked: false },
    ],
    likeCount: 35, viewCount: 920, createdAt: '2026-05-01', createdBy: '刘芳', status: '待审核', verified: false,
  },
  {
    id: 'TC010', patientName: '陈小红', age: 28, gender: '女', examType: 'MR', examName: '盆腔MR平扫',
    bodyPart: '盆腔', disease: '卵巢囊肿', diagnosis: '右侧卵巢巧克力囊肿',
    findings: '盆腔MR平扫显示：右侧卵巢区见约4.2×3.5cm囊性信号，壁厚薄不均，T1WI呈高信号，T2WI呈不均匀高信号，内可见液-液平面。左侧卵巢未见明显异常。',
    impression: '1. 右侧卵巢巧克力囊肿\n2. 建议妇科随诊',
    findingsList: ['右侧卵巢约4.2×3.5cm囊性信号', '壁厚薄不均', 'T1WI高信号（出血）', 'T2WI不均匀高信号'],
    tags: ['卵巢囊肿', '巧克力囊肿', '典型征象', '妇科'], teaching: false,
    images: [
      { thumbnail: 'pelvis', description: 'T1WI' },
      { thumbnail: 'pelvis', description: 'T2WI' },
    ],
    annotations: [{ id: 'A1', x: 50, y: 45, type: 'cyst', label: '巧克力囊肿', description: '4.2×3.5cm，T1高信号' }],
    discussions: [
      { id: 'D1', user: '王秀峰', avatar: 'WXF', content: 'T1高信号是巧克力囊肿的特征，与普通囊肿鉴别点在于是否有出血成分。', time: '2026-05-01 14:00', likes: 12, liked: true },
    ],
    likeCount: 22, viewCount: 580, createdAt: '2026-05-01', createdBy: '王秀峰', status: '已审核', verified: true,
  },
  {
    id: 'TC011', patientName: '赵大力', age: 55, gender: '男', examType: 'CT', examName: '上腹部CT平扫',
    bodyPart: '腹部', disease: '原发性肝癌', diagnosis: '肝细胞癌合并门静脉癌栓',
    findings: '上腹部CT平扫+增强显示：肝右叶见约6.5×5.8cm团块影，动脉期明显不均匀强化，门脉期及延迟期快速廓清，呈现"快进快出"强化模式。门静脉右支可见充盈缺损，考虑癌栓形成。肝门部淋巴结肿大。腹水少量。',
    impression: '1. 肝右叶肝细胞癌\n2. 门静脉右支癌栓形成\n3. 肝门部淋巴结肿大\n4. 腹水',
    findingsList: ['肝右叶6.5×5.8cm团块影', '"快进快出"强化模式', '门静脉右支癌栓', '肝门部淋巴结肿大', '腹水少量'],
    tags: ['肝癌', '肝细胞癌', '门静脉癌栓', '典型征象', '教学病例'], teaching: true,
    images: [
      { thumbnail: 'liver', description: '动脉期' },
      { thumbnail: 'liver', description: '门脉期' },
      { thumbnail: 'liver', description: '延迟期' },
      { thumbnail: 'liver', description: '门静脉重建' },
    ],
    annotations: [
      { id: 'A1', x: 45, y: 40, type: 'mass', label: '肝右叶肿瘤', description: '6.5×5.8cm，"快进快出"' },
      { id: 'A2', x: 55, y: 55, type: 'thrombus', label: '门静脉癌栓', description: '右支充盈缺损' },
    ],
    discussions: [
      { id: 'D1', user: '李明辉', avatar: 'LMH', content: '"快进快出"是肝细胞癌的典型强化模式，与血管瘤的"快进慢出"鉴别。门静脉癌栓是晚期肝癌的重要标志。', time: '2026-05-02 09:00', likes: 28, liked: true },
      { id: 'D2', user: '张海涛', avatar: 'ZHT', content: '需要与肝硬化结节鉴别，后者通常动脉期强化不明显。', time: '2026-05-02 10:30', likes: 15, liked: false },
    ],
    likeCount: 56, viewCount: 1680, createdAt: '2026-05-02', createdBy: '李明辉', status: '已审核', verified: true,
  },
  {
    id: 'TC012', patientName: '王秀兰', age: 48, gender: '女', examType: 'CT', examName: '盆腔CT平扫',
    bodyPart: '盆腔', disease: '宫颈癌', diagnosis: '宫颈癌（IIA期）',
    findings: '盆腔CT平扫显示：宫颈增大，约4.2×3.5cm，密度不均匀，可见低密度坏死区。阴道壁上1/3受累，双侧宫旁组织未见明显异常。盆腔淋巴结未见肿大。膀胱及直肠壁光滑。',
    impression: '1. 宫颈癌（IIA期）\n2. 建议MRI进一步分期\n3. 建议病理活检',
    findingsList: ['宫颈增大4.2×3.5cm', '密度不均匀，低密度坏死', '阴道壁上1/3受累', '双侧宫旁组织未受累', '盆腔淋巴结未见肿大'],
    tags: ['宫颈癌', '妇科肿瘤', '典型征象', '教学病例'], teaching: true,
    images: [
      { thumbnail: 'pelvis', description: 'CT平扫横断面' },
      { thumbnail: 'pelvis', description: 'CT增强' },
      { thumbnail: 'pelvis', description: '冠状面重建' },
    ],
    annotations: [
      { id: 'A1', x: 50, y: 45, type: 'mass', label: '宫颈肿瘤', description: '4.2×3.5cm，坏死' },
    ],
    discussions: [
      { id: 'D1', user: '王秀峰', avatar: 'WXF', content: '宫颈癌的CT表现主要是宫颈增大和密度改变，但MRI对软组织分辨率更高，建议补充MRI检查进行分期。', time: '2026-05-02 14:00', likes: 18, liked: false },
    ],
    likeCount: 32, viewCount: 890, createdAt: '2026-05-02', createdBy: '王秀峰', status: '已审核', verified: true,
  },
]

// ============================================================
// 辅助函数
// ============================================================
const getBodyPartColor = (bodyPart: string) => {
  const colors: Record<string, string> = {
    '头颅': '#8b5cf6', '胸部': '#3b82f6', '腹部': '#22c55e',
    '脊柱': '#f59e0b', '心脏': '#ef4444', '盆腔': '#ec4899',
  }
  return colors[bodyPart] || '#64748b'
}

const getModalityColor = (modality: string) => {
  return MODALITY_COLORS[modality] || '#64748b'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return date
}

const formatDateFull = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

const getAnnotationColor = (type: string) => {
  const colors: Record<string, string> = {
    stenosis: COLORS.danger,
    mass: COLORS.warning,
    emboli: '#ff6b6b',
    edema: COLORS.purple,
    hematoma: COLORS.danger,
    herniation: COLORS.info,
    calc: COLORS.warning,
    cyst: COLORS.teal,
    inflammation: COLORS.warning,
    thrombus: COLORS.danger,
  }
  return colors[type] || COLORS.info
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { bg: string; color: string }> = {
    '已审核': { bg: COLORS.successBg, color: COLORS.success },
    '待审核': { bg: COLORS.warningBg, color: COLORS.warning },
    '编辑中': { bg: COLORS.infoBg, color: COLORS.info },
  }
  return configs[status] || { bg: COLORS.backgroundLight, color: COLORS.textMuted }
}

// ============================================================
// 子组件：标签胶囊
// ============================================================
interface TagBadgeProps { text: string; color: string; bg: string; size?: 'small' | 'default' }
const TagBadge: React.FC<TagBadgeProps> = ({ text, color, bg, size = 'default' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: size === 'small' ? '1px 6px' : '2px 10px',
    borderRadius: 12, fontSize: size === 'small' ? 10 : 11,
    fontWeight: 600, color, background: bg, gap: 4,
  }}>{text}</span>
)

// ============================================================
// 子组件：统计卡片
// ============================================================
interface StatCardProps { icon: React.ReactNode; label: string; value: string | number; color: string; bg: string }
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, bg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{label}</div>
    </div>
  </div>
)

// ============================================================
// 子组件：手风琴折叠面板
// ============================================================
interface AccordionProps { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; count?: number }
const Accordion: React.FC<AccordionProps> = ({ title, icon, children, defaultOpen = false, count }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', background: isOpen ? COLORS.infoBg : COLORS.white,
        cursor: 'pointer', transition: 'all 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: isOpen ? COLORS.info : COLORS.textMuted }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: isOpen ? COLORS.info : COLORS.text }}>{title}</span>
          {count !== undefined && (
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: isOpen ? COLORS.info : COLORS.textLight, color: COLORS.white }}>{count}</span>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} style={{ color: COLORS.textMuted }} /> : <ChevronDown size={16} style={{ color: COLORS.textMuted }} />}
      </div>
      {isOpen && (
        <div style={{ padding: 12, background: COLORS.white, borderTop: `1px solid ${COLORS.border}` }}>{children}</div>
      )}
    </div>
  )
}

// ============================================================
// 子组件：病例卡片
// ============================================================
interface CaseCardProps { caseData: TypicalCase; onView: (c: TypicalCase) => void; isAdmin?: boolean }
const CaseCard: React.FC<CaseCardProps> = ({ caseData, onView, isAdmin }) => {
  const [isHovered, setIsHovered] = useState(false)
  const getModalityIcon = (modality: string) => <Scan size={14} style={{ color: MODALITY_COLORS[modality] || '#64748b' }} />

  return (
    <div onClick={() => onView(caseData)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
      style={{
        background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 16,
        cursor: 'pointer', transition: 'all 0.25s ease', transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
      }}>
      {/* 顶部标签 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: `${MODALITY_COLORS[caseData.examType] || '#64748b'}18`, color: MODALITY_COLORS[caseData.examType] || '#64748b' }}>
          {getModalityIcon(caseData.examType)} {caseData.examType}
        </span>
        <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${getBodyPartColor(caseData.bodyPart)}18`, color: getBodyPartColor(caseData.bodyPart) }}>
          {caseData.bodyPart}
        </span>
        {caseData.teaching && <TagBadge text="教学病例" color={COLORS.danger} bg={COLORS.dangerBg} size="small" />}
        {caseData.status === '待审核' && <TagBadge text="待审核" color={COLORS.warning} bg={COLORS.warningBg} size="small" />}
      </div>

      {/* 缩略图 */}
      <div style={{
        width: '100%', height: 100, background: `linear-gradient(135deg, ${COLORS.primaryLight}15, ${COLORS.primary}10)`,
        borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${COLORS.border}`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <ImageIcon size={28} style={{ color: COLORS.textLight }} />
          <span style={{ fontSize: 10, color: COLORS.textMuted }}>DICOM 图像</span>
        </div>
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
          {caseData.images.slice(0, 3).map((_, idx) => (
            <div key={idx} style={{ width: 24, height: 24, borderRadius: 4, background: COLORS.primary, opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: COLORS.white }}>{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 患者信息 */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 2 }}>
          {caseData.patientName} · {caseData.gender} · {caseData.age}岁
        </div>
        <div style={{ fontSize: 12, color: COLORS.textMuted }}>{caseData.examName}</div>
      </div>

      {/* 诊断 */}
      <div style={{ padding: '8px 10px', background: COLORS.backgroundLight, borderRadius: 6, marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 2 }}>诊断：</div>
        <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 500 }}>
          {caseData.diagnosis.length > 50 ? caseData.diagnosis.substring(0, 50) + '...' : caseData.diagnosis}
        </div>
      </div>

      {/* 标签 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {caseData.tags.slice(0, 3).map((tag, idx) => (
          <span key={idx} style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 500, background: COLORS.background, color: COLORS.textMuted }}>{tag}</span>
        ))}
        {caseData.tags.length > 3 && <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 500, background: COLORS.background, color: COLORS.textMuted }}>+{caseData.tags.length - 3}</span>}
      </div>

      {/* 底部统计 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: COLORS.textMuted }}><Eye size={12} /> {caseData.viewCount}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: COLORS.textMuted }}><Heart size={12} /> {caseData.likeCount}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: COLORS.textMuted }}><MessageSquare size={12} /> {caseData.discussions.length}</span>
        </div>
        <div style={{ fontSize: 10, color: COLORS.textLight }}>{caseData.createdAt}</div>
      </div>
    </div>
  )
}

// ============================================================
// 子组件：病例详情抽屉
// ============================================================
interface CaseDetailDrawerProps { caseData: TypicalCase | null; visible: boolean; onClose: () => void; isAdmin?: boolean }
const CaseDetailDrawer: React.FC<CaseDetailDrawerProps> = ({ caseData, visible, onClose, isAdmin }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'report' | 'discussion'>('info')
  const [likedDiscussions, setLikedDiscussions] = useState<Set<string>>(new Set())
  const [newComment, setNewComment] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null)

  if (!visible || !caseData) return null

  const handleLikeDiscussion = (discId: string) => {
    setLikedDiscussions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(discId)) newSet.delete(discId)
      else newSet.add(discId)
      return newSet
    })
  }

  const tabStyle = (tab: string) => ({
    padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    borderBottom: activeTab === tab ? `2px solid ${COLORS.info}` : '2px solid transparent',
    color: activeTab === tab ? COLORS.info : COLORS.textMuted, transition: 'all 0.2s',
  })

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, width: '60vw', maxWidth: 900, height: '100vh', background: COLORS.white, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 头部 */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}`, background: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.white }}>典型病例详情</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>病例ID: {caseData.id} | {caseData.examType} {caseData.examName}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setIsFavorited(!isFavorited)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: isFavorited ? COLORS.warning : 'rgba(255,255,255,0.2)', color: COLORS.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            {isFavorited ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            {isFavorited ? '已收藏' : '收藏'}
          </button>
          <button style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.2)', color: COLORS.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Share2 size={14} />分享
          </button>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.2)', color: COLORS.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 标签页 */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}`, background: COLORS.white }}>
        <div style={tabStyle('info')} onClick={() => setActiveTab('info')}>基本信息</div>
        <div style={tabStyle('images')} onClick={() => setActiveTab('images')}>影像资料</div>
        <div style={tabStyle('report')} onClick={() => setActiveTab('report')}>报告内容</div>
        <div style={tabStyle('discussion')} onClick={() => setActiveTab('discussion')}>讨论区 ({caseData.discussions.length})</div>
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {activeTab === 'info' && (
          <div>
            <div style={{ background: COLORS.backgroundLight, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: COLORS.textMuted }}>患者基本信息</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <div><div style={{ fontSize: 11, color: COLORS.textMuted }}>姓名</div><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{caseData.patientName}</div></div>
                <div><div style={{ fontSize: 11, color: COLORS.textMuted }}>性别</div><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{caseData.gender}</div></div>
                <div><div style={{ fontSize: 11, color: COLORS.textMuted }}>年龄</div><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{caseData.age}岁</div></div>
                <div><div style={{ fontSize: 11, color: COLORS.textMuted }}>检查类型</div><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{caseData.examType}</div></div>
              </div>
            </div>

            <div style={{ background: COLORS.backgroundLight, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: COLORS.textMuted }}>检查信息</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div><div style={{ fontSize: 11, color: COLORS.textMuted }}>检查项目</div><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{caseData.examName}</div></div>
                <div><div style={{ fontSize: 11, color: COLORS.textMuted }}>检查部位</div><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{caseData.bodyPart}</div></div>
                <div><div style={{ fontSize: 11, color: COLORS.textMuted }}>疾病名称</div><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{caseData.disease}</div></div>
                <div><div style={{ fontSize: 11, color: COLORS.textMuted }}>创建日期</div><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{caseData.createdAt}</div></div>
                <div><div style={{ fontSize: 11, color: COLORS.textMuted }}>创建医生</div><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{caseData.createdBy}</div></div>
                <div><div style={{ fontSize: 11, color: COLORS.textMuted }}>审核状态</div><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{caseData.status}</div></div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLORS.textMuted }}>标签</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {caseData.tags.map((tag, idx) => (
                  <span key={idx} style={{ padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 500, background: COLORS.background, color: COLORS.text }}>
                    <Tag size={10} style={{ marginRight: 4 }} />{tag}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ padding: 12, background: COLORS.infoBg, borderRadius: 8, textAlign: 'center' }}>
                <Eye size={20} style={{ color: COLORS.info, marginBottom: 4 }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.info }}>{caseData.viewCount}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>浏览次数</div>
              </div>
              <div style={{ padding: 12, background: COLORS.dangerBg, borderRadius: 8, textAlign: 'center' }}>
                <Heart size={20} style={{ color: COLORS.danger, marginBottom: 4 }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.danger }}>{caseData.likeCount}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>收藏数</div>
              </div>
              <div style={{ padding: 12, background: COLORS.warningBg, borderRadius: 8, textAlign: 'center' }}>
                <MessageSquare size={20} style={{ color: COLORS.warning, marginBottom: 4 }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.warning }}>{caseData.discussions.length}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>讨论数</div>
              </div>
              <div style={{ padding: 12, background: COLORS.successBg, borderRadius: 8, textAlign: 'center' }}>
                <FileText size={20} style={{ color: COLORS.success, marginBottom: 4 }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.success }}>{caseData.images.length}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>图像数</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div>
            <div style={{ background: '#1a1a2e', borderRadius: 10, padding: 20, marginBottom: 16, minHeight: 400, position: 'relative' }}>
              <div style={{ width: '100%', height: 360, background: 'linear-gradient(135deg, #2d2d44, #1a1a2e)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {caseData.annotations.map((ann, idx) => (
                  <div key={ann.id} onClick={() => setSelectedAnnotation(selectedAnnotation === idx ? null : idx)} style={{
                    position: 'absolute', left: `${ann.x}%`, top: `${ann.y}%`, width: 24, height: 24, borderRadius: '50%',
                    background: ann.type === 'stenosis' ? COLORS.danger : ann.type === 'mass' ? COLORS.warning : ann.type === 'emboli' ? '#ff6b6b' : COLORS.info,
                    border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: COLORS.white, boxShadow: '0 2px 8px rgba(0,0,0,0.4)', transform: 'translate(-50%, -50%)', zIndex: 10,
                  }}>
                    {idx + 1}
                  </div>
                ))}

                {selectedAnnotation !== null && caseData.annotations[selectedAnnotation] && (
                  <div style={{
                    position: 'absolute', left: `${caseData.annotations[selectedAnnotation].x}%`, top: `${caseData.annotations[selectedAnnotation].y - 8}%`,
                    transform: 'translateX(-50%)', background: COLORS.white, borderRadius: 8, padding: '8px 12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: 20, minWidth: 160,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 2 }}>{caseData.annotations[selectedAnnotation].label}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{caseData.annotations[selectedAnnotation].description}</div>
                  </div>
                )}

                <div style={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}><Monitor size={64} /></div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>DICOM 图像预览区</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{caseData.images[0]?.description || '医学影像'}</div>

                <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 8 }}>
                  <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>W: 1500</span>
                  <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>L: -600</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {caseData.annotations.map((ann, idx) => (
                  <div key={ann.id} onClick={() => setSelectedAnnotation(idx)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: 4, cursor: 'pointer',
                  }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: ann.type === 'stenosis' ? COLORS.danger : ann.type === 'mass' ? COLORS.warning : ann.type === 'emboli' ? '#ff6b6b' : COLORS.info }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{idx + 1}. {ann.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLORS.textMuted }}>图像列表 ({caseData.images.length})</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {caseData.images.map((img, idx) => (
                  <div key={idx} style={{
                    background: COLORS.backgroundLight, borderRadius: 8, padding: 12, cursor: 'pointer',
                    border: `1px solid ${idx === 0 ? COLORS.info : COLORS.border}`, transition: 'all 0.2s',
                  }}>
                    <div style={{ width: '100%', height: 60, background: COLORS.primaryLight, borderRadius: 4, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.text, textAlign: 'center' }}>{img.description}</div>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, textAlign: 'center' }}>Series {idx + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div>
            <div style={{ background: COLORS.backgroundLight, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: COLORS.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={16} />所见 (Findings)
              </h4>
              <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.8 }}>{caseData.findings}</div>
            </div>

            <div style={{ background: COLORS.backgroundLight, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: COLORS.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                <List size={16} />所见要点
              </h4>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {caseData.findingsList.map((finding, idx) => (
                  <li key={idx} style={{ fontSize: 13, color: COLORS.text, marginBottom: 6, lineHeight: 1.6 }}>{finding}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: `${COLORS.info}10`, borderRadius: 10, padding: 16, border: `1px solid ${COLORS.info}30` }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: COLORS.info, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={16} />印象 (Impression)
              </h4>
              <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{caseData.impression}</div>
            </div>

            {caseData.annotations.length > 0 && (
              <div style={{ marginTop: 16, background: COLORS.warningBg, borderRadius: 10, padding: 16, border: `1px solid ${COLORS.warning}30` }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: COLORS.warning, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Award size={16} />典型征象标注
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {caseData.annotations.map((ann, idx) => (
                    <div key={ann.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: COLORS.white, borderRadius: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: COLORS.warning, color: COLORS.white, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{ann.label}</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{ann.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'discussion' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {caseData.discussions.map((disc) => (
                <div key={disc.id} style={{ padding: 14, background: COLORS.backgroundLight, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.primary, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                      {disc.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{disc.user}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{disc.time}</div>
                    </div>
                    <button onClick={() => handleLikeDiscussion(disc.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 4, border: 'none',
                      background: likedDiscussions.has(disc.id) ? COLORS.dangerBg : 'transparent',
                      color: likedDiscussions.has(disc.id) ? COLORS.danger : COLORS.textMuted, cursor: 'pointer', fontSize: 11,
                    }}>
                      <ThumbsUp size={12} />{disc.likes + (likedDiscussions.has(disc.id) ? 1 : 0)}
                    </button>
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6, paddingLeft: 46 }}>{disc.content}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: 14, background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>添加讨论</div>
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="请输入您的讨论内容..."
                style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 6, border: `1px solid ${COLORS.border}`, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => setNewComment('')} disabled={!newComment.trim()} style={{
                  padding: '6px 16px', borderRadius: 6, border: 'none', background: newComment.trim() ? COLORS.info : COLORS.textLight,
                  color: COLORS.white, fontSize: 12, fontWeight: 600, cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                }}>
                  发表讨论
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// 子组件：新增病例表单
// ============================================================
interface AddCaseFormProps { visible: boolean; onClose: () => void; onSubmit: (data: Partial<TypicalCase>) => void }
const AddCaseForm: React.FC<AddCaseFormProps> = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patientName: '', age: '', gender: '男', examType: 'CT', examName: '',
    bodyPart: '头颅', disease: '', diagnosis: '', findings: '', impression: '', tags: '', teaching: false,
  })

  const handleSubmit = () => {
    onSubmit({
      ...formData, age: parseInt(formData.age) || 0,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    onClose()
  }

  if (!visible) return null

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: 'none' }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 4 }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div style={{ width: '90%', maxWidth: 700, maxHeight: '90vh', background: COLORS.white, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}`, background: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.white }}>新增典型病例</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.2)', color: COLORS.white, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={labelStyle}>患者姓名 *</label><input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} style={inputStyle} placeholder="输入患者姓名" /></div>
            <div><label style={labelStyle}>年龄 *</label><input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} style={inputStyle} placeholder="输入年龄" /></div>
            <div><label style={labelStyle}>性别</label><select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} style={inputStyle}><option value="男">男</option><option value="女">女</option></select></div>
            <div><label style={labelStyle}>检查类型 *</label><select value={formData.examType} onChange={(e) => setFormData({ ...formData, examType: e.target.value })} style={inputStyle}><option value="CT">CT</option><option value="MR">MR</option><option value="DR">DR</option><option value="DSA">DSA</option></select></div>
            <div><label style={labelStyle}>检查项目 *</label><input type="text" value={formData.examName} onChange={(e) => setFormData({ ...formData, examName: e.target.value })} style={inputStyle} placeholder="如：头颅CT平扫" /></div>
            <div><label style={labelStyle}>检查部位</label><select value={formData.bodyPart} onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })} style={inputStyle}><option value="头颅">头颅</option><option value="胸部">胸部</option><option value="腹部">腹部</option><option value="脊柱">脊柱</option><option value="心脏">心脏</option><option value="盆腔">盆腔</option></select></div>
            <div><label style={labelStyle}>疾病名称 *</label><input type="text" value={formData.disease} onChange={(e) => setFormData({ ...formData, disease: e.target.value })} style={inputStyle} placeholder="输入疾病名称" /></div>
            <div><label style={labelStyle}>标签 (逗号分隔)</label><input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} style={inputStyle} placeholder="如：肺癌,典型征象,教学病例" /></div>
          </div>
          <div style={{ marginTop: 16 }}><label style={labelStyle}>诊断结果 *</label><textarea value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} style={{ ...inputStyle, minHeight: 60 }} placeholder="输入诊断结果" /></div>
          <div style={{ marginTop: 16 }}><label style={labelStyle}>所见描述 *</label><textarea value={formData.findings} onChange={(e) => setFormData({ ...formData, findings: e.target.value })} style={{ ...inputStyle, minHeight: 100 }} placeholder="输入影像所见描述" /></div>
          <div style={{ marginTop: 16 }}><label style={labelStyle}>印象 (结论) *</label><textarea value={formData.impression} onChange={(e) => setFormData({ ...formData, impression: e.target.value })} style={{ ...inputStyle, minHeight: 80 }} placeholder="输入印象/结论" /></div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="teaching" checked={formData.teaching} onChange={(e) => setFormData({ ...formData, teaching: e.target.checked })} style={{ width: 16, height: 16 }} />
            <label htmlFor="teaching" style={{ ...labelStyle, marginBottom: 0 }}>标记为教学病例</label>
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.white, color: COLORS.text, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>取消</button>
          <button onClick={handleSubmit} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: COLORS.info, color: COLORS.white, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>保存病例</button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 主组件：典型病例库页面
// ============================================================
export default function TypicalCasesPage() {
  const [cases, setCases] = useState<TypicalCase[]>(mockTypicalCases)
  const [selectedCase, setSelectedCase] = useState<TypicalCase | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [addFormVisible, setAddFormVisible] = useState(false)
  const [isAdmin, setIsAdmin] = useState(true)

  const [searchKeyword, setSearchKeyword] = useState('')
  const [examTypeFilter, setExamTypeFilter] = useState<string[]>([])
  const [bodyPartFilter, setBodyPartFilter] = useState<string[]>([])
  const [diseaseFilter, setDiseaseFilter] = useState<string[]>([])
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [teachingOnly, setTeachingOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'latest' | 'hottest' | 'mostLiked'>('latest')
  const [showFilters, setShowFilters] = useState(true)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    cases.forEach(c => c.tags.forEach(t => tags.add(t)))
    return Array.from(tags)
  }, [cases])

  const allDiseases = useMemo(() => {
    const diseases = new Set<string>()
    cases.forEach(c => diseases.add(c.disease))
    return Array.from(diseases)
  }, [cases])

  const filteredCases = useMemo(() => {
    let result = [...cases]
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase()
      result = result.filter(c => c.patientName.toLowerCase().includes(kw) || c.disease.toLowerCase().includes(kw) || c.diagnosis.toLowerCase().includes(kw) || c.examName.toLowerCase().includes(kw) || c.tags.some(t => t.toLowerCase().includes(kw)))
    }
    if (examTypeFilter.length > 0) result = result.filter(c => examTypeFilter.includes(c.examType))
    if (bodyPartFilter.length > 0) result = result.filter(c => bodyPartFilter.includes(c.bodyPart))
    if (diseaseFilter.length > 0) result = result.filter(c => diseaseFilter.includes(c.disease))
    if (tagFilter.length > 0) result = result.filter(c => c.tags.some(t => tagFilter.includes(t)))
    if (teachingOnly) result = result.filter(c => c.teaching)
    switch (sortBy) {
      case 'hottest': result.sort((a, b) => b.viewCount - a.viewCount); break
      case 'mostLiked': result.sort((a, b) => b.likeCount - a.likeCount); break
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return result
  }, [cases, searchKeyword, examTypeFilter, bodyPartFilter, diseaseFilter, tagFilter, teachingOnly, sortBy])

  const stats = useMemo(() => ({
    total: cases.length, teaching: cases.filter(c => c.teaching).length,
    pending: cases.filter(c => c.status === '待审核').length,
    views: cases.reduce((sum, c) => sum + c.viewCount, 0),
    likes: cases.reduce((sum, c) => sum + c.likeCount, 0),
  }), [cases])

  const handleViewDetail = useCallback((c: TypicalCase) => { setSelectedCase(c); setDetailVisible(true) }, [])
  const handleAddCase = useCallback((data: Partial<TypicalCase>) => {
    const newCase: TypicalCase = {
      id: `TC${String(cases.length + 1).padStart(3, '0')}`, patientName: data.patientName || '', age: data.age || 0,
      gender: data.gender || '男', examType: data.examType || 'CT', examName: data.examName || '',
      bodyPart: data.bodyPart || '头颅', disease: data.disease || '', diagnosis: data.diagnosis || '',
      findings: data.findings || '', impression: data.impression || '',
      findingsList: data.findings?.split('\n').filter(Boolean) || [], tags: data.tags || [],
      teaching: data.teaching || false, images: [{ thumbnail: 'default', description: '默认图像' }],
      annotations: [], discussions: [], likeCount: 0, viewCount: 0,
      createdAt: new Date().toISOString().split('T')[0], createdBy: '当前用户',
      status: '编辑中', verified: false,
    }
    setCases(prev => [newCase, ...prev])
  }, [cases.length])

  const toggleArrayFilter = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    if (arr.includes(val)) setArr(arr.filter(v => v !== val))
    else setArr([...arr, val])
  }

  const clearFilters = () => {
    setSearchKeyword(''); setExamTypeFilter([]); setBodyPartFilter([]); setDiseaseFilter([]); setTagFilter([]); setTeachingOnly(false)
  }

  const hasActiveFilters = searchKeyword || examTypeFilter.length > 0 || bodyPartFilter.length > 0 || diseaseFilter.length > 0 || tagFilter.length > 0 || teachingOnly

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background }}>
      {/* 顶部统计 */}
      <div style={{ background: COLORS.primary, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: COLORS.white }}>典型病例库</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>上海市第一人民医院放射科 · 教学与研究资料库</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {isAdmin && (
            <button onClick={() => setAddFormVisible(true)} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: COLORS.info, color: COLORS.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} />新增病例
            </button>
          )}
          <button style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: COLORS.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Upload size={16} />批量导入
          </button>
          <button style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: COLORS.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={16} />导出
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: '16px 24px', background: COLORS.white, borderBottom: `1px solid ${COLORS.border}` }}>
        <StatCard icon={<BookOpen size={20} />} label="病例总数" value={stats.total} color={COLORS.primary} bg={COLORS.infoBg} />
        <StatCard icon={<Award size={20} />} label="教学病例" value={stats.teaching} color={COLORS.danger} bg={COLORS.dangerBg} />
        <StatCard icon={<Clock size={20} />} label="待审核" value={stats.pending} color={COLORS.warning} bg={COLORS.warningBg} />
        <StatCard icon={<Eye size={20} />} label="总浏览" value={stats.views.toLocaleString()} color={COLORS.info} bg={COLORS.infoBg} />
        <StatCard icon={<Heart size={20} />} label="总收藏" value={stats.likes.toLocaleString()} color={COLORS.danger} bg={COLORS.dangerBg} />
      </div>

      {/* 主内容区域 */}
      <div style={{ display: 'flex', padding: '16px 24px', gap: 16 }}>
        {/* 左侧筛选栏 */}
        {showFilters && (
          <div style={{ width: 280, flexShrink: 0, background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: 16, height: 'calc(100vh - 220px)', overflow: 'auto' }}>
            {/* 搜索 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 12px', background: COLORS.backgroundLight }}>
                <Search size={16} style={{ color: COLORS.textMuted }} />
                <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="搜索病例..."
                  style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%', background: 'transparent' }} />
              </div>
            </div>

            {hasActiveFilters && (
              <div style={{ marginBottom: 16 }}>
                <button onClick={clearFilters} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.white, color: COLORS.text, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <FilterX size={14} />清除所有筛选
                </button>
              </div>
            )}

            {/* 检查类型 */}
            <Accordion title="检查类型" icon={<Scan size={14} />} count={examTypeFilter.length} defaultOpen={true}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['CT', 'MR', 'DR', 'DSA'].map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0' }}>
                    <input type="checkbox" checked={examTypeFilter.includes(type)} onChange={() => toggleArrayFilter(examTypeFilter, setExamTypeFilter, type)} style={{ width: 16, height: 16 }} />
                    <span style={{ width: 24, height: 16, borderRadius: 4, background: `${MODALITY_COLORS[type]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Scan size={14} style={{ color: MODALITY_COLORS[type] }} />
                    </span>
                    <span style={{ fontSize: 13, color: COLORS.text }}>{type}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: COLORS.textMuted, background: COLORS.background, padding: '1px 6px', borderRadius: 8 }}>
                      {cases.filter(c => c.examType === type).length}
                    </span>
                  </label>
                ))}
              </div>
            </Accordion>

            {/* 检查部位 */}
            <Accordion title="检查部位" icon={<Stethoscope size={14} />} count={bodyPartFilter.length} defaultOpen={true}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['头颅', '胸部', '腹部', '脊柱', '心脏', '盆腔'].map(part => {
                  const count = cases.filter(c => c.bodyPart === part).length
                  if (count === 0) return null
                  return (
                    <button key={part} onClick={() => toggleArrayFilter(bodyPartFilter, setBodyPartFilter, part)} style={{
                      padding: '4px 10px', borderRadius: 6, border: `1px solid ${bodyPartFilter.includes(part) ? getBodyPartColor(part) : COLORS.border}`,
                      background: bodyPartFilter.includes(part) ? `${getBodyPartColor(part)}15` : COLORS.white,
                      color: bodyPartFilter.includes(part) ? getBodyPartColor(part) : COLORS.text, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}>
                      {part} ({count})
                    </button>
                  )
                })}
              </div>
            </Accordion>

            {/* 疾病类型 */}
            <Accordion title="疾病类型" icon={<Activity size={14} />} count={diseaseFilter.length} defaultOpen={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {allDiseases.map(disease => {
                  const count = cases.filter(c => c.disease === disease).length
                  return (
                    <label key={disease} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0' }}>
                      <input type="checkbox" checked={diseaseFilter.includes(disease)} onChange={() => toggleArrayFilter(diseaseFilter, setDiseaseFilter, disease)} style={{ width: 14, height: 14 }} />
                      <span style={{ fontSize: 12, color: COLORS.text, flex: 1 }}>{disease}</span>
                      <span style={{ fontSize: 10, color: COLORS.textMuted }}>{count}</span>
                    </label>
                  )
                })}
              </div>
            </Accordion>

            {/* 标签筛选 */}
            <Accordion title="标签" icon={<Tag size={14} />} count={tagFilter.length} defaultOpen={false}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {allTags.map(tag => (
                  <button key={tag} onClick={() => toggleArrayFilter(tagFilter, setTagFilter, tag)} style={{
                    padding: '2px 8px', borderRadius: 10, border: `1px solid ${tagFilter.includes(tag) ? COLORS.info : COLORS.border}`,
                    background: tagFilter.includes(tag) ? COLORS.infoBg : COLORS.white,
                    color: tagFilter.includes(tag) ? COLORS.info : COLORS.textMuted, fontSize: 10, cursor: 'pointer',
                  }}>
                    {tag}
                  </button>
                ))}
              </div>
            </Accordion>

            {/* 教学病例 */}
            <div style={{ padding: '10px 12px', borderRadius: 8, background: COLORS.backgroundLight, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={teachingOnly} onChange={() => setTeachingOnly(!teachingOnly)} style={{ width: 16, height: 16 }} />
                <Award size={14} style={{ color: COLORS.danger }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>仅显示教学病例</span>
              </label>
            </div>
          </div>
        )}

        {/* 右侧病例列表 */}
        <div style={{ flex: 1 }}>
          {/* 工具栏 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setShowFilters(!showFilters)} style={{
                padding: '6px 12px', borderRadius: 6, border: `1px solid ${COLORS.border}`,
                background: showFilters ? COLORS.infoBg : COLORS.white,
                color: showFilters ? COLORS.info : COLORS.text, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Filter size={14} />{showFilters ? '隐藏筛选' : '显示筛选'}
              </button>
              <span style={{ fontSize: 13, color: COLORS.textMuted }}>共找到 <strong style={{ color: COLORS.text }}>{filteredCases.length}</strong> 个病例</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: COLORS.textMuted }}>排序：</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.white, fontSize: 12, color: COLORS.text, cursor: 'pointer' }}>
                <option value="latest">最新</option>
                <option value="hottest">最热</option>
                <option value="mostLiked">收藏量</option>
              </select>
            </div>
          </div>

          {/* 病例卡片网格 */}
          {filteredCases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
              <FileText size={48} style={{ color: COLORS.textLight, marginBottom: 12 }} />
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: COLORS.text }}>暂无符合条件的病例</h3>
              <p style={{ margin: 0, fontSize: 13, color: COLORS.textMuted }}>请调整筛选条件或添加新的病例</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filteredCases.map(caseItem => (
                <CaseCard key={caseItem.id} caseData={caseItem} onView={handleViewDetail} isAdmin={isAdmin} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CaseDetailDrawer caseData={selectedCase} visible={detailVisible} onClose={() => setDetailVisible(false)} isAdmin={isAdmin} />
      <AddCaseForm visible={addFormVisible} onClose={() => setAddFormVisible(false)} onSubmit={handleAddCase} />
    </div>
  )
}
