// @ts-nocheck
// G005 放射科RIS系统 - 检查模板管理页面 v1.0.0
// 功能：CT/MRI/X线报告模板维护，含搜索、新增/编辑/删除、预览功能
import { useState, useMemo } from 'react'
import {
  ClipboardList, ListOrdered, FileEdit, Tag, Plus, X, Search, Eye,
  Edit2, Trash2, Save, ChevronDown, Check, Copy, FileText,
  Activity, Scan, Image as ImageIcon, Stethoscope, Filter
} from 'lucide-react'

// ============================================================
// 样式常量
// ============================================================
const C = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  primaryLighter: '#dbeafe',
  accent: '#0891b2',
  accentLight: '#06b6d4',
  white: '#ffffff',
  bg: '#e8e8e8',
  bgLight: '#f5f5f5',
  border: '#d4d4d4',
  borderLight: '#e5e5e5',
  textDark: '#1f2937',
  textMid: '#4b5563',
  textLight: '#9ca3af',
  success: '#059669',
  successLight: '#d1fae5',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  info: '#2563eb',
  infoLight: '#dbeafe',
}

// ============================================================
// 类型定义
// ============================================================
interface TemplateRecord {
  id: string
  code: string
  name: string
  modality: 'CT' | 'MRI' | 'X线'
  category: string
  subCategory: string
  content: string
  tags: string[]
  author: string
  createTime: string
  updateTime: string
  usageCount: number
  status: 'active' | 'inactive'
  version: string
}

// ============================================================
// 初始模板数据
// ============================================================
const initialTemplates: TemplateRecord[] = [
  {
    id: 'tpl-001',
    code: 'CT-BRAIN-001',
    name: '颅脑CT平扫模板',
    modality: 'CT',
    category: '颅脑',
    subCategory: '平扫',
    content: `【检查技术】
扫描参数：层厚5mm，层间距5mm，FOV 25cm
扫描范围：颅顶至颅底

【影像表现】
1. 脑实质密度：未见异常密度影
2. 脑室系统：形态、大小正常
3. 中线结构：居中
4. 脑沟脑裂：未见增宽
5. 颅骨：骨质结构完整，未见骨折

【诊断意见】
颅脑CT平扫未见明显异常`,
    tags: ['颅脑', '平扫', '常规'],
    author: '张明',
    createTime: '2024-01-15 10:30',
    updateTime: '2024-03-20 14:22',
    usageCount: 1256,
    status: 'active',
    version: 'v2.1'
  },
  {
    id: 'tpl-002',
    code: 'CT-CHEST-001',
    name: '胸部CT平扫模板',
    modality: 'CT',
    category: '胸部',
    subCategory: '平扫',
    content: `【检查技术】
扫描参数：层厚5mm，层间距5mm，FOV 38cm
扫描范围：肺尖至肺底

【影像表现】
1. 肺野：双肺纹理清晰，未见实变影
2. 胸膜：胸膜无增厚，胸腔无积液
3. 纵隔：纵隔结构清晰，无肿大淋巴结
4. 心影：形态、大小正常
5. 胸廓：骨质结构完整

【诊断意见】
胸部CT平扫未见明显异常`,
    tags: ['胸部', '平扫', '常规'],
    author: '李华',
    createTime: '2024-01-18 09:15',
    updateTime: '2024-04-10 11:30',
    usageCount: 982,
    status: 'active',
    version: 'v2.0'
  },
  {
    id: 'tpl-003',
    code: 'CT-ABD-001',
    name: '腹部CT平扫模板',
    modality: 'CT',
    category: '腹部',
    subCategory: '平扫',
    content: `【检查技术】
扫描参数：层厚5mm，层间距5mm，FOV 35cm
扫描范围：膈顶至髂嵴

【影像表现】
1. 肝脏：形态、大小正常，密度均匀
2. 胆囊：壁不厚，腔内未见结石
3. 脾脏：大小、形态正常
4. 胰腺：轮廓清晰，未见异常
5. 肾脏：双肾形态正常，未见结石
6. 腹膜后：未见肿大淋巴结

【诊断意见】
腹部CT平扫未见明显异常`,
    tags: ['腹部', '平扫', '常规'],
    author: '王芳',
    createTime: '2024-02-01 14:00',
    updateTime: '2024-04-15 16:45',
    usageCount: 845,
    status: 'active',
    version: 'v1.8'
  },
  {
    id: 'tpl-004',
    code: 'CT-Spine-001',
    name: '颈椎CT平扫模板',
    modality: 'CT',
    category: '脊柱',
    subCategory: '颈椎',
    content: `【检查技术】
扫描参数：层厚2mm，层间距2mm，FOV 20cm
扫描范围：C1-C7

【影像表现】
1. 椎体：各椎体形态正常，骨质结构完整
2. 椎间盘：未见突出或膨出
3. 椎管：形态、宽度正常
4. 韧带：未见钙化或肥厚
5. 软组织：未见异常密度影

【诊断意见】
颈椎CT平扫未见明显异常`,
    tags: ['脊柱', '颈椎', '平扫'],
    author: '刘强',
    createTime: '2024-02-10 11:20',
    updateTime: '2024-03-25 09:30',
    usageCount: 567,
    status: 'active',
    version: 'v1.5'
  },
  {
    id: 'tpl-005',
    code: 'MRI-BRAIN-001',
    name: '颅脑MRI平扫模板',
    modality: 'MRI',
    category: '颅脑',
    subCategory: '平扫',
    content: `【检查技术】
扫描序列：T1WI、T2WI、FLAIR、DWI
层厚：5mm，层间距：1mm

【影像表现】
1. 脑实质：未见异常信号灶
2. 脑室系统：形态、大小正常
3. 中线结构：居中
4. 脑沟脑裂：未见增宽或变窄
5. 颅骨：未见异常信号

【诊断意见】
颅脑MRI平扫未见明显异常`,
    tags: ['颅脑', '平扫', 'MRI', '常规'],
    author: '张明',
    createTime: '2024-02-15 08:45',
    updateTime: '2024-04-18 10:15',
    usageCount: 723,
    status: 'active',
    version: 'v2.2'
  },
  {
    id: 'tpl-006',
    code: 'MRI-KNEE-001',
    name: '膝关节MRI模板',
    modality: 'MRI',
    category: '关节',
    subCategory: '膝关节',
    content: `【检查技术】
扫描序列：T1WI、T2WI、PDWI、脂肪抑制
层厚：3mm

【影像表现】
1. 半月板：形态完整，未见撕裂信号
2. 交叉韧带：前/后交叉韧带连续性完好
3. 侧副韧带：内/外侧副韧带信号正常
4. 关节软骨：厚度均匀，信号未见异常
5. 关节腔：未见积液
6. 周围软组织：未见肿块

【诊断意见】
膝关节MRI未见明显异常`,
    tags: ['关节', '膝关节', 'MRI'],
    author: '陈静',
    createTime: '2024-02-20 15:30',
    updateTime: '2024-04-20 14:00',
    usageCount: 456,
    status: 'active',
    version: 'v1.3'
  },
  {
    id: 'tpl-007',
    code: 'X-CHEST-001',
    name: '胸部X线正侧位模板',
    modality: 'X线',
    category: '胸部',
    subCategory: '正侧位',
    content: `【检查技术】
投照体位：胸部正位、侧位
曝光参数：120kV，200mA

【影像表现】
1. 肺野：双肺纹理清晰，肺野透亮度正常
2. 肺门：结构清晰，无增大
3. 纵隔：纵隔居中，无增宽
4. 心影：形态、大小正常
5. 胸廓：双侧对称，肋骨骨质完整
6. 膈肌：双侧膈面光滑，肋膈角锐利

【诊断意见】
胸部X线片未见明显异常`,
    tags: ['胸部', 'X线', '正侧位'],
    author: '李华',
    createTime: '2024-02-25 10:00',
    updateTime: '2024-04-22 11:20',
    usageCount: 1580,
    status: 'active',
    version: 'v3.0'
  },
  {
    id: 'tpl-008',
    code: 'X-SPINE-001',
    name: '腰椎X线正侧位模板',
    modality: 'X线',
    category: '脊柱',
    subCategory: '腰椎',
    content: `【检查技术】
投照体位：腰椎正位、侧位、双斜位
曝光参数：75kV，400mA

【影像表现】
1. 椎体：L1-L5椎体形态正常，骨质结构完整
2. 椎间隙：椎间隙宽度正常
3. 椎弓根：双侧对称，未见骨折
4. 棘突：棘突连线居中
5. 软组织：椎旁软组织层次清晰

【诊断意见】
腰椎X线片未见明显异常`,
    tags: ['脊柱', '腰椎', 'X线'],
    author: '王芳',
    createTime: '2024-03-01 09:30',
    updateTime: '2024-04-25 15:40',
    usageCount: 892,
    status: 'active',
    version: 'v2.1'
  },
  {
    id: 'tpl-009',
    code: 'CT-HEADCTA-001',
    name: '头颅CTA模板',
    modality: 'CT',
    category: '颅脑',
    subCategory: 'CTA',
    content: `【检查技术】
扫描参数：层厚0.625mm，FOV 20cm
对比剂：碘普罗胺350mgI/ml，80ml
注射速率：5ml/s

【影像表现】
1. 脑动脉：各分支走行自然，管腔未见狭窄或扩张
2. Willis环：环完整性好
3. 动脉瘤：未检出
4. 血管畸形：未见
5. 脑实质：未见出血或梗死

【诊断意见】
头颅CTA未见明显异常`,
    tags: ['颅脑', 'CTA', '血管'],
    author: '张明',
    createTime: '2024-03-05 14:20',
    updateTime: '2024-04-28 09:15',
    usageCount: 345,
    status: 'active',
    version: 'v1.6'
  },
  {
    id: 'tpl-010',
    code: 'CT-ABDCE-001',
    name: '腹部增强CT模板',
    modality: 'CT',
    category: '腹部',
    subCategory: '增强',
    content: `【检查技术】
扫描参数：层厚5mm，动脉期/静脉期/延迟期
对比剂：碘普罗胺350mgI/ml，100ml

【影像表现】
1. 动脉期：肝脏、脾脏动脉期强化均匀
2. 静脉期：门静脉、肝静脉显示清晰
3. 延迟期：胆囊、胆管未见异常
4. 肝脏：未见异常强化灶
5. 胰腺：强化均匀，胰管无扩张
6. 肾脏：皮质期、髓质期、分泌期正常

【诊断意见】
腹部增强CT未见明显异常`,
    tags: ['腹部', '增强', 'CT'],
    author: '刘强',
    createTime: '2024-03-10 11:45',
    updateTime: '2024-05-01 16:30',
    usageCount: 412,
    status: 'active',
    version: 'v1.4'
  },
  {
    id: 'tpl-011',
    code: 'MRI-SPINE-001',
    name: '腰椎MRI模板',
    modality: 'MRI',
    category: '脊柱',
    subCategory: '腰椎',
    content: `【检查技术】
扫描序列：T1WI、T2WI、脂肪抑制
层厚：4mm

【影像表现】
1. 椎体：L1-S1椎体形态正常，信号均匀
2. 椎间盘：T2WI信号正常，未见突出
3. 硬膜囊：形态正常，未受压
4. 神经根：未见水肿或受压
5. 椎管：未见狭窄
6. 周围软组织：未见异常

【诊断意见】
腰椎MRI平扫未见明显异常`,
    tags: ['脊柱', '腰椎', 'MRI'],
    author: '陈静',
    createTime: '2024-03-15 08:00',
    updateTime: '2024-05-05 10:20',
    usageCount: 634,
    status: 'active',
    version: 'v2.0'
  },
  {
    id: 'tpl-012',
    code: 'X-PELVIS-001',
    name: '骨盆X线模板',
    modality: 'X线',
    category: '骨盆',
    subCategory: '正位',
    content: `【检查技术】
投照体位：骨盆正位
曝光参数：80kV，300mA

【影像表现】
1. 髂骨：双侧形态对称，骨质结构完整
2. 耻骨联合：间隙正常
3. 髋臼：双侧形态对称，未见骨折
4. 股骨头：双侧形态规则，骨质完整
5. 关节间隙：双侧等宽，间隙正常
6. 软组织：未见异常钙化

【诊断意见】
骨盆X线片未见明显异常`,
    tags: ['骨盆', 'X线', '常规'],
    author: '李华',
    createTime: '2024-03-20 13:15',
    updateTime: '2024-05-08 14:45',
    usageCount: 523,
    status: 'active',
    version: 'v1.7'
  },
  {
    id: 'tpl-013',
    code: 'CT-PELVIS-001',
    name: '盆腔CT平扫模板',
    modality: 'CT',
    category: '盆腔',
    subCategory: '平扫',
    content: `【检查技术】
扫描参数：层厚5mm，层间距5mm
扫描范围：髂嵴至耻骨联合

【影像表现】
1. 膀胱：充盈良好，壁不厚
2. 前列腺/子宫：形态、大小正常
3. 直肠：肠壁无增厚
4. 盆腔淋巴结：未见肿大
5. 盆腔积液：未见
6. 骨骼：骨质结构完整

【诊断意见】
盆腔CT平扫未见明显异常`,
    tags: ['盆腔', '平扫', 'CT'],
    author: '王芳',
    createTime: '2024-03-25 10:30',
    updateTime: '2024-05-10 09:00',
    usageCount: 398,
    status: 'active',
    version: 'v1.3'
  },
  {
    id: 'tpl-014',
    code: 'MRI-LIVER-001',
    name: '肝脏MRI平扫模板',
    modality: 'MRI',
    category: '腹部',
    subCategory: '肝脏',
    content: `【检查技术】
扫描序列：T1WI、T2WI、DWI、脂肪抑制
层厚：5mm

【影像表现】
1. 肝脏：形态、大小正常，信号均匀
2. 肝内管道：走行自然，无扩张
3. 肝脏病变：未见异常信号灶
4. 胆道：肝内外胆管无扩张
5. 胆囊：壁不厚，腔内未见结石
6. 脾脏：大小、信号正常

【诊断意见】
肝脏MRI平扫未见明显异常`,
    tags: ['腹部', '肝脏', 'MRI'],
    author: '刘强',
    createTime: '2024-04-01 15:45',
    updateTime: '2024-05-12 11:30',
    usageCount: 287,
    status: 'active',
    version: 'v1.2'
  },
  {
    id: 'tpl-015',
    code: 'X-SHOULDER-001',
    name: '肩关节X线模板',
    modality: 'X线',
    category: '关节',
    subCategory: '肩关节',
    content: `【检查技术】
投照体位：肩关节正位、穿胸位
曝光参数：65kV，200mA

【影像表现】
1. 肱骨头：形态规则，骨质完整
2. 关节盂：未见骨质破坏
3. 肩峰：骨质结构完整
4. 软组织：未见异常钙化
5. 关节间隙：正常

【诊断意见】
肩关节X线片未见明显异常`,
    tags: ['关节', '肩关节', 'X线'],
    author: '陈静',
    createTime: '2024-04-05 09:00',
    updateTime: '2024-05-15 10:00',
    usageCount: 345,
    status: 'active',
    version: 'v1.1'
  },
  {
    id: 'tpl-016',
    code: 'CT-SINUS-001',
    name: '副鼻窦CT模板',
    modality: 'CT',
    category: '头颈',
    subCategory: '副鼻窦',
    content: `【检查技术】
扫描参数：层厚2mm，层间距2mm
扫描范围：额窦至上颌窦

【影像表现】
1. 上颌窦：黏膜无增厚，窦腔清晰
2. 筛窦：气化良好，未见密度增高
3. 额窦：窦腔清晰，骨质完整
4. 蝶窦：窦腔清晰，无占位
5. 鼻中隔：居中，无弯曲
6. 周围骨质：未见骨质破坏

【诊断意见】
副鼻窦CT平扫未见明显异常`,
    tags: ['头颈', '副鼻窦', 'CT'],
    author: '张明',
    createTime: '2024-04-10 14:30',
    updateTime: '2024-05-18 15:20',
    usageCount: 432,
    status: 'active',
    version: 'v1.4'
  },
  {
    id: 'tpl-017',
    code: 'MRI-PROSTATE-001',
    name: '前列腺MRI模板',
    modality: 'MRI',
    category: '盆腔',
    subCategory: '前列腺',
    content: `【检查技术】
扫描序列：T1WI、T2WI、DWI、脂肪抑制
层厚：3mm

【影像表现】
1. 前列腺：体积约30ml，信号均匀
2. 移行带：信号未见异常
3. 外周带：T2WI高信号，未见结节
4. 精囊腺：双侧对称，信号正常
5. 周围脂肪：清晰
6. 淋巴结：未见肿大

【诊断意见】
前列腺MRI平扫未见明显异常`,
    tags: ['盆腔', '前列腺', 'MRI'],
    author: '刘强',
    createTime: '2024-04-15 11:00',
    updateTime: '2024-05-20 09:45',
    usageCount: 234,
    status: 'active',
    version: 'v1.0'
  },
  {
    id: 'tpl-018',
    code: 'X-ABDOMEN-001',
    name: '腹部X线立位片模板',
    modality: 'X线',
    category: '腹部',
    subCategory: '立位片',
    content: `【检查技术】
投照体位：腹部立位
曝光参数：75kV，300mA

【影像表现】
1. 膈肌：双侧膈面光滑，肋膈角锐利
2. 肝脏：肝影正常
3. 脾脏：脾影正常
4. 肠管：未见气液平面
5. 腹腔：未见游离气体
6. 骨骼：腰椎、骨盆骨质完整

【诊断意见】
腹部X线立位片未见明显异常`,
    tags: ['腹部', 'X线', '立位'],
    author: '李华',
    createTime: '2024-04-20 10:15',
    updateTime: '2024-05-22 14:30',
    usageCount: 678,
    status: 'active',
    version: 'v2.0'
  },
  {
    id: 'tpl-019',
    code: 'CT-ANGIO-001',
    name: '肺动脉CTA模板',
    modality: 'CT',
    category: '胸部',
    subCategory: 'CTA',
    content: `【检查技术】
扫描参数：层厚1mm，FOV 35cm
对比剂：碘普罗胺350mgI/ml，80ml
注射速率：4ml/s

【影像表现】
1. 肺动脉主干：未见栓塞
2. 左肺动脉：管腔通畅
3. 右肺动脉：管腔通畅
4. 叶段肺动脉：未见充盈缺损
5. 肺实质：未见梗死灶
6. 纵隔：未见肿大淋巴结

【诊断意见】
肺动脉CTA未见明显异常`,
    tags: ['胸部', 'CTA', '血管', '肺动脉'],
    author: '王芳',
    createTime: '2024-04-25 08:30',
    updateTime: '2024-05-25 11:15',
    usageCount: 189,
    status: 'active',
    version: 'v1.1'
  },
  {
    id: 'tpl-020',
    code: 'MRI-BREAST-001',
    name: '乳腺MRI平扫模板',
    modality: 'MRI',
    category: '乳腺',
    subCategory: '平扫',
    content: `【检查技术】
扫描序列：T1WI、T2WI、脂肪抑制、DWI
层厚：3mm

【影像表现】
1. 双侧乳腺：腺体分布对称
2. 信号：T1WI呈中等信号，T2WI呈高信号
3. 肿块：未见异常强化肿块
4. 乳头：双侧对称，无内陷
5. 皮肤：未见增厚
6. 腋窝：淋巴结未见肿大

【诊断意见】
乳腺MRI平扫未见明显异常`,
    tags: ['乳腺', 'MRI', '平扫'],
    author: '陈静',
    createTime: '2024-04-30 13:00',
    updateTime: '2024-05-28 10:00',
    usageCount: 156,
    status: 'active',
    version: 'v1.0'
  }
]

// ============================================================
// 工具函数
// ============================================================
const generateId = () => `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const formatDate = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ============================================================
// 主组件
// ============================================================
export default function TemplateManagementPage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>(initialTemplates)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterModality, setFilterModality] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRecord | null>(null)
  const [formData, setFormData] = useState<Partial<TemplateRecord>>({
    code: '',
    name: '',
    modality: 'CT',
    category: '',
    subCategory: '',
    content: '',
    tags: [],
    status: 'active',
    version: 'v1.0'
  })
  const [tagInput, setTagInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // 过滤后的数据
  const filteredTemplates = useMemo(() => {
    return templates.filter(tpl => {
      const matchKeyword = searchKeyword === '' || 
        tpl.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        tpl.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        tpl.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        tpl.content.toLowerCase().includes(searchKeyword.toLowerCase())
      
      const matchModality = filterModality === 'all' || tpl.modality === filterModality
      const matchStatus = filterStatus === 'all' || tpl.status === filterStatus
      
      return matchKeyword && matchModality && matchStatus
    })
  }, [templates, searchKeyword, filterModality, filterStatus])

  // 分页数据
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTemplates.slice(start, start + pageSize)
  }, [filteredTemplates, currentPage])

  const totalPages = Math.ceil(filteredTemplates.length / pageSize)

  // 重置页码
  const handleSearch = () => {
    setCurrentPage(1)
  }

  // 打开新增弹窗
  const handleAdd = () => {
    setModalMode('add')
    setFormData({
      code: '',
      name: '',
      modality: 'CT',
      category: '',
      subCategory: '',
      content: '',
      tags: [],
      status: 'active',
      version: 'v1.0'
    })
    setTagInput('')
    setShowModal(true)
  }

  // 打开编辑弹窗
  const handleEdit = (template: TemplateRecord) => {
    setModalMode('edit')
    setFormData({ ...template })
    setTagInput('')
    setShowModal(true)
  }

  // 预览模板
  const handlePreview = (template: TemplateRecord) => {
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  // 保存模板
  const handleSave = () => {
    if (!formData.code || !formData.name || !formData.content) {
      alert('请填写必填项')
      return
    }

    if (modalMode === 'add') {
      const newTemplate: TemplateRecord = {
        ...formData as TemplateRecord,
        id: generateId(),
        author: '当前用户',
        createTime: formatDate(new Date()),
        updateTime: formatDate(new Date()),
        usageCount: 0
      }
      setTemplates([newTemplate, ...templates])
    } else {
      setTemplates(templates.map(tpl => 
        tpl.id === formData.id 
          ? { ...tpl, ...formData, updateTime: formatDate(new Date()) } as TemplateRecord
          : tpl
      ))
    }
    setShowModal(false)
  }

  // 删除模板
  const handleDelete = (id: string) => {
    if (confirm('确定要删除该模板吗？')) {
      setTemplates(templates.filter(tpl => tpl.id !== id))
    }
  }

  // 复制模板内容
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    alert('已复制到剪贴板')
  }

  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    })
  }

  // 获取检查类型图标
  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'CT': return <Scan size={16} style={{ color: C.primary }} />
      case 'MRI': return <Activity size={16} style={{ color: C.accent }} />
      case 'X线': return <ImageIcon size={16} style={{ color: C.success }} />
      default: return <FileText size={16} />
    }
  }

  // ============================================================
  // 渲染
  // ============================================================
  return (
    <div style={styles.container}>
      {/* 头部 */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <ClipboardList size={28} style={{ color: C.primary }} />
          <h1 style={styles.title}>检查模板管理</h1>
        </div>
        <button style={styles.addBtn} onClick={handleAdd}>
          <Plus size={18} />
          <span>新增模板</span>
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} style={{ color: C.textLight }} />
          <input
            type="text"
            placeholder="搜索模板名称、编码、内容..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <Filter size={16} style={{ color: C.textMid }} />
            <select
              value={filterModality}
              onChange={(e) => { setFilterModality(e.target.value); setCurrentPage(1); }}
              style={styles.select}
            >
              <option value="all">全部设备</option>
              <option value="CT">CT</option>
              <option value="MRI">MRI</option>
              <option value="X线">X线</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              style={styles.select}
            >
              <option value="all">全部状态</option>
              <option value="active">启用</option>
              <option value="inactive">停用</option>
            </select>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <ListOrdered size={16} style={{ color: C.primary }} />
          <span style={styles.statLabel}>模板总数</span>
          <span style={styles.statValue}>{templates.length}</span>
        </div>
        <div style={styles.statItem}>
          <Scan size={16} style={{ color: C.accent }} />
          <span style={styles.statLabel}>CT模板</span>
          <span style={styles.statValue}>{templates.filter(t => t.modality === 'CT').length}</span>
        </div>
        <div style={styles.statItem}>
          <Activity size={16} style={{ color: C.success }} />
          <span style={styles.statLabel}>MRI模板</span>
          <span style={styles.statValue}>{templates.filter(t => t.modality === 'MRI').length}</span>
        </div>
        <div style={styles.statItem}>
          <ImageIcon size={16} style={{ color: C.warning }} />
          <span style={styles.statLabel}>X线模板</span>
          <span style={styles.statValue}>{templates.filter(t => t.modality === 'X线').length}</span>
        </div>
      </div>

      {/* 表格 */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadTr}>
              <th style={{ ...styles.th, ...styles.thCode }}>模板编码</th>
              <th style={{ ...styles.th, ...styles.thName }}>模板名称</th>
              <th style={{ ...styles.th, ...styles.thModality }}>检查类型</th>
              <th style={{ ...styles.th, ...styles.thCategory }}>分类</th>
              <th style={{ ...styles.th, ...styles.thTags }}>标签</th>
              <th style={{ ...styles.th, ...styles.thUsage }}>使用次数</th>
              <th style={{ ...styles.th, ...styles.thStatus }}>状态</th>
              <th style={{ ...styles.th, ...styles.thActions }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTemplates.map((tpl, idx) => (
              <tr 
                key={tpl.id} 
                style={{ 
                  ...styles.tr, 
                  backgroundColor: idx % 2 === 0 ? C.white : C.bgLight 
                }}
              >
                <td style={styles.td}>
                  <code style={styles.code}>{tpl.code}</code>
                </td>
                <td style={styles.td}>
                  <div style={styles.nameCell}>
                    <span style={styles.name}>{tpl.name}</span>
                    <span style={styles.version}>{tpl.version}</span>
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.modalityCell}>
                    {getModalityIcon(tpl.modality)}
                    <span style={styles.modalityText}>{tpl.modality}</span>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.categoryText}>{tpl.category}</span>
                  <span style={styles.subCategoryText}> / {tpl.subCategory}</span>
                </td>
                <td style={styles.td}>
                  <div style={styles.tagsCell}>
                    {tpl.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={styles.tag}>{tag}</span>
                    ))}
                    {tpl.tags.length > 3 && (
                      <span style={styles.tagMore}>+{tpl.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.usageCount}>{tpl.usageCount}</span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: tpl.status === 'active' ? C.successLight : C.bgLight,
                    color: tpl.status === 'active' ? C.success : C.textLight
                  }}>
                    {tpl.status === 'active' ? '启用' : '停用'}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionsCell}>
                    <button 
                      style={styles.actionBtn} 
                      onClick={() => handlePreview(tpl)}
                      title="预览"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      style={styles.actionBtn} 
                      onClick={() => handleEdit(tpl)}
                      title="编辑"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}
                      onClick={() => handleDelete(tpl.id)}
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedTemplates.length === 0 && (
              <tr>
                <td colSpan={8} style={styles.emptyCell}>
                  <ClipboardList size={48} style={{ color: C.textLight }} />
                  <p style={styles.emptyText}>未找到匹配的模板</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={{ ...styles.pageBtn, ...(currentPage === 1 ? styles.pageBtnDisabled : {}) }}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            上一页
          </button>
          <div style={styles.pageInfo}>
            第 <span style={styles.pageCurrent}>{currentPage}</span> / {totalPages} 页
            <span style={styles.pageDivider}>|</span>
            共 {filteredTemplates.length} 条
          </div>
          <button
            style={{ ...styles.pageBtn, ...(currentPage === totalPages ? styles.pageBtnDisabled : {}) }}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            下一页
          </button>
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                <FileEdit size={22} style={{ color: C.primary }} />
                <h2>{modalMode === 'add' ? '新增模板' : '编辑模板'}</h2>
              </div>
              <button style={styles.modalClose} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Tag size={14} /> 模板编码 <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    style={styles.input}
                    placeholder="如：CT-BRAIN-001"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FileText size={14} /> 模板名称 <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={styles.input}
                    placeholder="如：颅脑CT平扫模板"
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Scan size={14} /> 检查类型
                  </label>
                  <select
                    value={formData.modality}
                    onChange={e => setFormData({ ...formData, modality: e.target.value as any })}
                    style={styles.select}
                  >
                    <option value="CT">CT</option>
                    <option value="MRI">MRI</option>
                    <option value="X线">X线</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <ListOrdered size={14} /> 版本号
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={e => setFormData({ ...formData, version: e.target.value })}
                    style={styles.input}
                    placeholder="如：v1.0"
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>一级分类</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={styles.input}
                    placeholder="如：颅脑、胸部、腹部"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>二级分类</label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                    style={styles.input}
                    placeholder="如：平扫、增强、CTA"
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Stethoscope size={14} /> 模板内容 <span style={styles.required}>*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  style={styles.textarea}
                  placeholder="输入报告模板内容..."
                  rows={10}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Tag size={14} /> 标签
                </label>
                <div style={styles.tagInput}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    style={styles.tagInputField}
                    placeholder="输入标签后按回车添加"
                  />
                  <button style={styles.tagAddBtn} onClick={handleAddTag}>添加</button>
                </div>
                <div style={styles.tagsList}>
                  {formData.tags?.map(tag => (
                    <span key={tag} style={styles.tagItem}>
                      {tag}
                      <button style={styles.tagRemove} onClick={() => handleRemoveTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>状态</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                    />
                    <span style={styles.radioText}>启用</span>
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData({ ...formData, status: 'inactive' })}
                    />
                    <span style={styles.radioText}>停用</span>
                  </label>
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                取消
              </button>
              <button style={styles.saveBtn} onClick={handleSave}>
                <Save size={16} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 预览弹窗 */}
      {showPreview && previewTemplate && (
        <div style={styles.modalOverlay} onClick={() => setShowPreview(false)}>
          <div style={styles.previewModal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                <Eye size={22} style={{ color: C.primary }} />
                <h2>模板预览</h2>
              </div>
              <button style={styles.modalClose} onClick={() => setShowPreview(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.previewMeta}>
              <div style={styles.previewMetaItem}>
                <span style={styles.previewMetaLabel}>编码：</span>
                <code style={styles.code}>{previewTemplate.code}</code>
              </div>
              <div style={styles.previewMetaItem}>
                <span style={styles.previewMetaLabel}>名称：</span>
                <span>{previewTemplate.name}</span>
              </div>
              <div style={styles.previewMetaItem}>
                <span style={styles.previewMetaLabel}>类型：</span>
                <span>{previewTemplate.modality}</span>
              </div>
              <div style={styles.previewMetaItem}>
                <span style={styles.previewMetaLabel}>版本：</span>
                <span>{previewTemplate.version}</span>
              </div>
              <div style={styles.previewMetaItem}>
                <span style={styles.previewMetaLabel}>分类：</span>
                <span>{previewTemplate.category} / {previewTemplate.subCategory}</span>
              </div>
              <div style={styles.previewMetaItem}>
                <span style={styles.previewMetaLabel}>作者：</span>
                <span>{previewTemplate.author}</span>
              </div>
              <div style={styles.previewMetaItem}>
                <span style={styles.previewMetaLabel}>使用次数：</span>
                <span>{previewTemplate.usageCount}</span>
              </div>
            </div>
            <div style={styles.previewContent}>
              <pre style={styles.previewText}>{previewTemplate.content}</pre>
            </div>
            <div style={styles.previewTags}>
              {previewTemplate.tags.map(tag => (
                <span key={tag} style={styles.tag}>{tag}</span>
              ))}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.copyBtn} onClick={() => handleCopy(previewTemplate.content)}>
                <Copy size={16} />
                复制内容
              </button>
              <button style={styles.cancelBtn} onClick={() => setShowPreview(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 样式定义
// ============================================================
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    backgroundColor: C.bg,
    minHeight: '100vh',
    fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    backgroundColor: C.white,
    padding: '16px 24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 600,
    color: C.textDark,
    margin: 0,
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    backgroundColor: C.primary,
    color: C.white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '16px',
    backgroundColor: C.white,
    padding: '16px 20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    maxWidth: '400px',
    padding: '8px 14px',
    backgroundColor: C.bgLight,
    borderRadius: '6px',
    border: `1px solid ${C.borderLight}`,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: C.textDark,
  },
  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  select: {
    padding: '8px 12px',
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    color: C.textDark,
    backgroundColor: C.white,
    cursor: 'pointer',
    outline: 'none',
  },
  statsBar: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
    backgroundColor: C.white,
    padding: '14px 24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: C.textMid,
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: C.textDark,
  },
  tableWrapper: {
    backgroundColor: C.white,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  theadTr: {
    backgroundColor: C.primaryLighter,
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 600,
    color: C.primary,
    borderBottom: `2px solid ${C.primaryLight}`,
  },
  thCode: { width: '130px' },
  thName: { width: '180px' },
  thModality: { width: '90px' },
  thCategory: { width: '120px' },
  thTags: { width: '150px' },
  thUsage: { width: '80px' },
  thStatus: { width: '70px' },
  thActions: { width: '120px' },
  tr: {
    transition: 'background-color 0.15s',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: C.textDark,
    borderBottom: `1px solid ${C.borderLight}`,
  },
  code: {
    fontFamily: '"Consolas", "Monaco", monospace',
    fontSize: '12px',
    backgroundColor: C.bgLight,
    padding: '2px 6px',
    borderRadius: '4px',
    color: C.primary,
  },
  nameCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  name: {
    fontWeight: 500,
  },
  version: {
    fontSize: '11px',
    color: C.textLight,
  },
  modalityCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  modalityText: {
    fontWeight: 500,
  },
  categoryText: {
    fontWeight: 500,
  },
  subCategoryText: {
    color: C.textLight,
    fontSize: '12px',
  },
  tagsCell: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    backgroundColor: C.primaryLighter,
    color: C.primary,
    borderRadius: '10px',
    fontSize: '11px',
  },
  tagMore: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: C.bgLight,
    color: C.textLight,
    borderRadius: '10px',
    fontSize: '11px',
  },
  usageCount: {
    fontWeight: 500,
    color: C.accent,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
  },
  actionsCell: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    backgroundColor: C.bgLight,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: C.textMid,
    transition: 'all 0.2s',
  },
  actionBtnDanger: {
    color: C.danger,
  },
  emptyCell: {
    textAlign: 'center',
    padding: '60px 20px',
    color: C.textLight,
  },
  emptyText: {
    marginTop: '12px',
    fontSize: '14px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
    padding: '14px',
    backgroundColor: C.white,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  pageBtn: {
    padding: '8px 16px',
    backgroundColor: C.primary,
    color: C.white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  pageBtnDisabled: {
    backgroundColor: C.borderLight,
    color: C.textLight,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '13px',
    color: C.textMid,
  },
  pageCurrent: {
    fontWeight: 600,
    color: C.primary,
  },
  pageDivider: {
    margin: '0 8px',
    color: C.border,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '700px',
    maxHeight: '90vh',
    backgroundColor: C.white,
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  previewModal: {
    width: '650px',
    maxHeight: '90vh',
    backgroundColor: C.white,
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: `1px solid ${C.borderLight}`,
    backgroundColor: C.bgLight,
  },
  modalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  modalTitleH2: {
    fontSize: '18px',
    fontWeight: 600,
    color: C.textDark,
    margin: 0,
  },
  modalClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: C.textMid,
  },
  modalBody: {
    padding: '20px 24px',
    overflowY: 'auto',
    flex: 1,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: C.textDark,
    marginBottom: '6px',
  },
  required: {
    color: C.danger,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    color: C.textDark,
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    color: C.textDark,
    outline: 'none',
    fontFamily: '"Consolas", "Monaco", monospace',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  tagInput: {
    display: 'flex',
    gap: '8px',
  },
  tagInputField: {
    flex: 1,
    padding: '8px 12px',
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  tagAddBtn: {
    padding: '8px 16px',
    backgroundColor: C.primaryLighter,
    color: C.primary,
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  tagsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '10px',
  },
  tagItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    backgroundColor: C.primaryLighter,
    color: C.primary,
    borderRadius: '14px',
    fontSize: '13px',
  },
  tagRemove: {
    backgroundColor: 'transparent',
    border: 'none',
    color: C.primary,
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    padding: 0,
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: C.textDark,
    cursor: 'pointer',
  },
  radioText: {
    fontSize: '14px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${C.borderLight}`,
    backgroundColor: C.bgLight,
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: C.white,
    color: C.textMid,
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    backgroundColor: C.primary,
    color: C.white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    backgroundColor: C.accent,
    color: C.white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  previewMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    padding: '16px 24px',
    backgroundColor: C.bgLight,
    borderBottom: `1px solid ${C.borderLight}`,
  },
  previewMetaItem: {
    fontSize: '13px',
    color: C.textMid,
  },
  previewMetaLabel: {
    fontWeight: 500,
    color: C.textDark,
  },
  previewContent: {
    padding: '20px 24px',
    flex: 1,
    overflowY: 'auto',
  },
  previewText: {
    fontFamily: '"Consolas", "Monaco", monospace',
    fontSize: '13px',
    lineHeight: 1.8,
    color: C.textDark,
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  previewTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '12px 24px',
    borderTop: `1px solid ${C.borderLight}`,
  },
}
