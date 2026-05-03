// G005 放射科RIS系统 - 报告词库页面 v1.1.0
// 放射科专用术语词库，支持快速录入、分类管理、快捷复制、批量导入
// 支持 WS/T 500-2016 国家标准对照
import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, Search, Plus, Edit2, Trash2, X, Copy, Upload,
  Download, Filter, ChevronRight, ChevronDown, BarChart2,
  Tag, FolderOpen, Clock, TrendingUp, CheckCircle2, AlertCircle,
  FileSpreadsheet, RefreshCw, Eye, EyeOff, Trash, Check,
  List, LayoutGrid, Star, Zap, Settings, FileCheck, DownloadCloud
} from 'lucide-react'
import { initialTermLibrary } from '../data/initialData'

// ============ 类型定义 ============
interface TermEntry {
  id: string
  category: string
  term: string
  count: number
  standardReport: string
  lastUsed?: string
  isActive?: boolean
  modality?: string[]
  termType?: '描述短语' | '诊断结论' | '测量值' | '参考范围'
  usageNotes?: string
  synonyms?: string[]
  wsStandardCode?: string   // 对照的WS标准码
}

interface TermCategory {
  id: string
  name: string
  modality: string
  count: number
  color: string
}

interface QuickTerm {
  id: string
  term: string
  modality: string
  count: number
  category: string
}

// WS/T 500-2016 标准条目
interface WsStandardEntry {
  code: string           // WS标准码 如 WS-CT-001
  standardName: string   // 标准检查名称
  aliases: string[]       // 常用别名
  department: string      // 科室分类：CT/MR/DXR/超声/乳腺/放射
  subClass: string       // 检查子类
  reportTemplate: string // 报告模板
}

// ============ 常量 ============
const MODALITY_LIST = ['CT', 'MR', 'DR', 'DSA', '乳腺钼靶', '胃肠造影']
const TERM_TYPES: Array<'描述短语' | '诊断结论' | '测量值' | '参考范围'> = [
  '描述短语', '诊断结论', '测量值', '参考范围'
]
const MODALITY_COLORS: Record<string, string> = {
  'CT': '#3b82f6',
  'MR': '#8b5cf6',
  'DR': '#10b981',
  'DSA': '#f59e0b',
  '乳腺钼靶': '#ec4899',
  '胃肠造影': '#06b6d4',
}
const MODALITY_BG: Record<string, string> = {
  'CT': '#eff6ff',
  'MR': '#f5f3ff',
  'DR': '#ecfdf5',
  'DSA': '#fffbeb',
  '乳腺钼靶': '#fdf2f8',
  '胃肠造影': '#ecfeff',
}

// WS/T 500-2016 标准数据（虚构）
const WS_STANDARDS: WsStandardEntry[] = [
  { code: 'WS-CT-001', standardName: 'CT头部平扫', aliases: ['头颅CT', '脑部CT', '头部CT'], department: 'CT', subClass: '头部', reportTemplate: '颅内未见异常密度影，脑室、脑池、脑沟形态正常，中线结构居中。' },
  { code: 'WS-CT-002', standardName: 'CT胸部平扫', aliases: ['肺部CT', '胸片CT', '胸部CT'], department: 'CT', subClass: '胸部', reportTemplate: '双肺纹理清晰，未见实变及肿块影。纵隔无偏移，心影形态正常。' },
  { code: 'WS-CT-003', standardName: 'CT腹部平扫', aliases: ['腹部CT', '盆腔CT', '腹腔CT'], department: 'CT', subClass: '腹部', reportTemplate: '肝脾形态、大小正常，未见异常密度影。腹膜后未见肿大淋巴结。' },
  { code: 'WS-CT-004', standardName: 'CT冠脉动脉成像', aliases: ['冠脉CTA', '心脏CTA', '冠状动脉CTA'], department: 'CT', subClass: '心脏大血管', reportTemplate: '冠状动脉各支未见明显狭窄或钙化斑块。主动脉根部形态正常。' },
  { code: 'WS-CT-005', standardName: 'CT肺部高分辨', aliases: ['HRCT肺', '肺部HRCT'], department: 'CT', subClass: '胸部', reportTemplate: '双肺野透亮度正常，肺纹理清晰，肺小叶间隔未见增厚。' },
  { code: 'WS-CT-006', standardName: 'CT骨盆平扫', aliases: ['骨盆CT'], department: 'CT', subClass: '骨盆', reportTemplate: '骨盆骨质结构完整，未见骨折及破坏性病变。关节间隙正常。' },
  { code: 'WS-CT-007', standardName: 'CT四肢平扫', aliases: ['四肢CT', '肢体CT'], department: 'CT', subClass: '四肢', reportTemplate: '四肢骨骨质完整，未见骨折及骨破坏。软组织未见异常。' },
  { code: 'WS-CT-008', standardName: 'CT颈部平扫', aliases: ['颈部CT', '甲状腺CT'], department: 'CT', subClass: '颈部', reportTemplate: '颈部淋巴结未见肿大。甲状腺形态正常，未见占位性病变。' },
  { code: 'WS-MR-001', standardName: 'MR头颅平扫', aliases: ['脑MRI', '脑部磁共振', '头颅MRI'], department: 'MR', subClass: '头部', reportTemplate: '脑实质内未见异常信号灶，脑室、脑池、脑沟形态正常，中线结构居中。' },
  { code: 'WS-MR-002', standardName: 'MR腰椎平扫', aliases: ['腰骶MRI', '腰椎磁共振', '腰部MRI'], department: 'MR', subClass: '脊柱', reportTemplate: '腰椎序列正常，L4/5、L5/S1椎间盘轻度突出，硬膜囊轻度受压。' },
  { code: 'WS-MR-003', standardName: 'MR腹部平扫', aliases: ['腹部MRI', '肝胆MRI', '上腹MRI'], department: 'MR', subClass: '腹部', reportTemplate: '肝脏形态、大小正常，肝实质未见异常信号。脾脏不大。胆囊形态正常。' },
  { code: 'WS-MR-004', standardName: 'MR前列腺平扫', aliases: ['前列腺MRI'], department: 'MR', subClass: '盆腔', reportTemplate: '前列腺形态规整，体积约XXml，信号均匀，未见明确肿块影。' },
  { code: 'WS-MR-005', standardName: 'MR颈椎平扫', aliases: ['颈MRI', '颈椎磁共振'], department: 'MR', subClass: '脊柱', reportTemplate: '颈椎序列正常，C4/5、C5/6椎间盘向后突出，硬膜囊轻度受压。' },
  { code: 'WS-MR-006', standardName: 'MR肩关节平扫', aliases: ['肩关节MRI'], department: 'MR', subClass: '关节', reportTemplate: '肩袖形态、信号正常，肩锁关节未见脱位，肱骨头形态正常。' },
  { code: 'WS-MR-007', standardName: 'MR膝关节平扫', aliases: ['膝关节MRI', '膝盖MRI'], department: 'MR', subClass: '关节', reportTemplate: '前交叉韧带形态、信号正常，内侧半月板后角轻度退变。' },
  { code: 'WS-MR-008', standardName: 'MR盆腔平扫', aliases: ['盆腔MRI', '子宫附件MRI'], department: 'MR', subClass: '盆腔', reportTemplate: '盆腔内脏器形态、信号正常，未见异常占位性病变。' },
  { code: 'WS-DXR-001', standardName: '数字化X线胸片', aliases: ['DR胸片', '胸部正侧位', '胸片DR'], department: 'DXR', subClass: '胸部', reportTemplate: '胸廓对称，双肺纹理清晰，双肺野透亮度正常。心脏大小、形态正常。' },
  { code: 'WS-DXR-002', standardName: '数字化X线腹部立卧位', aliases: ['腹部平片', 'KUB'], department: 'DXR', subClass: '腹部', reportTemplate: '腹部肠管充气良好，未见液平及游离气体。双肾区未见阳性结石影。' },
  { code: 'WS-DXR-003', standardName: '数字化X线四肢关节', aliases: ['四肢X线', '关节片'], department: 'DXR', subClass: '四肢', reportTemplate: '诸骨骨质完整，关节面光滑，关节间隙正常，软组织未见异常。' },
  { code: 'WS-DXR-004', standardName: '数字化X线脊柱全长', aliases: ['脊柱全长片', 'EOS'], department: 'DXR', subClass: '脊柱', reportTemplate: '脊柱序列正常，生理曲度存在。椎体形态、密度正常。' },
  { code: 'WS-DXR-005', standardName: '数字化X线乳腺摄影', aliases: ['乳腺钼靶', 'MG', '乳腺X线'], department: '乳腺', subClass: '乳腺', reportTemplate: '双侧乳腺腺体呈混合型，乳腺纹理结构清晰，未见肿块及异常钙化。' },
  { code: 'WS-DXR-006', standardName: '数字化X线口腔全景', aliases: ['口腔全景片', 'OPG'], department: 'DXR', subClass: '口腔', reportTemplate: '全口牙列完整，牙槽骨未见明显吸收，颞下颌关节形态正常。' },
  { code: 'WS-US-001', standardName: '超声腹部常规', aliases: ['腹部B超', '肝胆脾胰B超'], department: '超声', subClass: '腹部', reportTemplate: '肝脏大小形态正常，肝实质回声均匀，肝内管道走形正常。' },
  { code: 'WS-US-002', standardName: '超声甲状腺', aliases: ['甲状腺B超', '甲状腺彩超'], department: '超声', subClass: '浅表器官', reportTemplate: '甲状腺左右叶大小正常，实质回声均匀，未见结节及肿块。' },
  { code: 'WS-US-003', standardName: '超声泌尿系统', aliases: ['肾脏B超', '泌尿系B超'], department: '超声', subClass: '泌尿', reportTemplate: '双肾大小形态正常，皮质回声均匀，集合系统未见分离。' },
  { code: 'WS-US-004', standardName: '超声心脏', aliases: ['心脏彩超', 'UCG', '超声心动图'], department: '超声', subClass: '心脏', reportTemplate: '心脏各房室大小正常，瓣膜形态启闭良好，心功能正常。' },
  { code: 'WS-US-005', standardName: '超声颈部血管', aliases: ['颈动脉B超', '颈部血管彩超'], department: '超声', subClass: '血管', reportTemplate: '双侧颈动脉内-中膜不厚，管腔未见狭窄及扩张，血流速度正常。' },
  { code: 'WS-DSA-001', standardName: 'DSA脑血管造影', aliases: ['脑DSA', '脑血管DSA'], department: 'DSA', subClass: '神经系统', reportTemplate: '脑血管各分支形态、走形正常，未见动脉瘤、畸形或狭窄。' },
  { code: 'WS-DSA-002', standardName: 'DSA冠状动脉造影', aliases: ['冠脉DSA', '心脏导管'], department: 'DSA', subClass: '心血管', reportTemplate: '冠状动脉左主干、前降支、回旋支、右冠状动脉未见明显狭窄。' },
]

// 科室选项
const DEPT_LIST = ['CT', 'MR', 'DXR', '超声', '乳腺', 'DSA', '放射']

// 初始分类数据
const INIT_CATEGORIES: TermCategory[] = [
  { id: 'CAT-CT-HEAD', name: 'CT-头部', modality: 'CT', count: 0, color: '#3b82f6' },
  { id: 'CAT-CT-CHEST', name: 'CT-胸部', modality: 'CT', count: 0, color: '#60a5fa' },
  { id: 'CAT-CT-ABD', name: 'CT-腹部', modality: 'CT', count: 0, color: '#93c5fd' },
  { id: 'CAT-MR-HEAD', name: 'MR-头部', modality: 'MR', count: 0, color: '#8b5cf6' },
  { id: 'CAT-MR-SPINE', name: 'MR-脊柱', modality: 'MR', count: 0, color: '#a78bfa' },
  { id: 'CAT-DR-CHEST', name: 'DR-胸部', modality: 'DR', count: 0, color: '#10b981' },
  { id: 'CAT-DR-EXT', name: 'DR-四肢', modality: 'DR', count: 0, color: '#34d399' },
  { id: 'CAT-DSA', name: 'DSA', modality: 'DSA', count: 0, color: '#f59e0b' },
  { id: 'CAT-MG', name: '乳腺钼靶', modality: '乳腺钼靶', count: 0, color: '#ec4899' },
]

// ============ 主组件 ============
export default function TermLibraryPage() {
  // ---------- 状态 ----------
  const [terms, setTerms] = useState<TermEntry[]>(() =>
    initialTermLibrary.map((t, i) => {
      // 随机给部分词条关联WS标准码
      const wsCodes = WS_STANDARDS.map(ws => ws.code)
      const mapped = i % 3 === 0 ? wsCodes[i % wsCodes.length] : undefined
      return {
        ...t,
        lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        isActive: true,
        modality: MODALITY_LIST.slice(0, Math.floor(Math.random() * 3) + 1),
        termType: TERM_TYPES[Math.floor(Math.random() * 2)] as TermEntry['termType'],
        wsStandardCode: mapped,
      }
    })
  )
  const [categories, setCategories] = useState<TermCategory[]>(INIT_CATEGORIES)
  const [leftSearch, setLeftSearch] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all')
  const [rightSearch, setRightSearch] = useState('')
  const [modalityFilter, setModalityFilter] = useState<string>('全部')
  const [categoryFilter, setCategoryFilter] = useState<string>('全部')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingTerm, setEditingTerm] = useState<TermEntry | null>(null)
  const [showQuickPanel, setShowQuickPanel] = useState(true)
  const [showStats, setShowStats] = useState(false)
  const [activeQuickModality, setActiveQuickModality] = useState<string>('CT')
  const [importLoading, setImportLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 主Tab：词库字典 / 国家标准
  const [mainTab, setMainTab] = useState<'dict' | 'standard'>('dict')

  // 国家标准Tab状态
  const [wsSearch, setWsSearch] = useState('')
  const [wsDeptFilter, setWsDeptFilter] = useState<string>('全部')
  const [importAllLoading, setImportAllLoading] = useState(false)
  const [importedCount, setImportedCount] = useState<number | null>(null)

  // 新建/编辑表单状态
  const [formData, setFormData] = useState({
    term: '',
    category: 'CT描述',
    modality: ['CT'] as string[],
    termType: '描述短语' as TermEntry['termType'],
    standardReport: '',
    usageNotes: '',
    wsStandardCode: '',
  })

  // ---------- 统计数据 ----------
  const stats = {
    totalTerms: terms.length,
    totalCategories: categories.length,
    thisMonthUsage: terms.reduce((sum, t) => sum + t.count, 0),
    activeTerms: terms.filter(t => t.isActive !== false).length,
    mappedCount: terms.filter(t => t.wsStandardCode).length,
  }

  // ---------- 计算过滤后的分类计数 ----------
  const getCategoryCount = (catId: string) => {
    if (catId === 'ALL') return terms.length
    const cat = categories.find(c => c.id === catId)
    if (!cat) return 0
    return terms.filter(t => t.modality?.includes(cat.modality)).length
  }

  // ---------- 过滤词条 ----------
  const filteredTerms = terms.filter(t => {
    // 左侧分类过滤
    if (activeCategoryId !== 'ALL') {
      const cat = categories.find(c => c.id === activeCategoryId)
      if (cat && !t.modality?.includes(cat.modality)) return false
    }
    // 标签页过滤
    if (activeTab === 'active' && t.isActive === false) return false
    if (activeTab === 'inactive' && t.isActive !== false) return false
    // 右侧搜索过滤
    if (rightSearch && !t.term.toLowerCase().includes(rightSearch.toLowerCase()) &&
        !t.standardReport.toLowerCase().includes(rightSearch.toLowerCase())) return false
    // 设备类型过滤
    if (modalityFilter !== '全部' && !t.modality?.includes(modalityFilter)) return false
    // 分类过滤
    if (categoryFilter !== '全部' && t.category !== categoryFilter) return false
    return true
  })

  // ---------- WS标准过滤 ----------
  const filteredWsStandards = WS_STANDARDS.filter(ws => {
    if (wsSearch) {
      const s = wsSearch.toLowerCase()
      if (!ws.standardName.toLowerCase().includes(s) &&
          !ws.code.toLowerCase().includes(s) &&
          !ws.aliases.some(a => a.toLowerCase().includes(s))) return false
    }
    if (wsDeptFilter !== '全部' && ws.department !== wsDeptFilter) return false
    return true
  })

  // ---------- 快捷词库 ----------
  const quickTerms: QuickTerm[] = terms
    .filter(t => t.modality?.includes(activeQuickModality) && t.isActive !== false)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
    .map(t => ({ id: t.id, term: t.term, modality: activeQuickModality, count: t.count, category: t.category }))

  // ---------- TOP20 ----------
  const top20Terms = [...terms].sort((a, b) => b.count - a.count).slice(0, 20)

  // ---------- 所有分类列表 ----------
  const allCategoryNames = Array.from(new Set(terms.map(t => t.category)))

  // ---------- 已对照标准码集合 ----------
  const mappedWsCodes = new Set(terms.filter(t => t.wsStandardCode).map(t => t.wsStandardCode))

  // ============ 操作函数 ============
  const handleCopyTerm = async (term: string) => {
    try {
      await navigator.clipboard.writeText(term)
      setCopySuccess(term)
      setTimeout(() => setCopySuccess(null), 1500)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = term
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopySuccess(term)
      setTimeout(() => setCopySuccess(null), 1500)
    }
  }

  const openAddModal = () => {
    setModalMode('add')
    setFormData({
      term: '',
      category: 'CT描述',
      modality: ['CT'],
      termType: '描述短语',
      standardReport: '',
      usageNotes: '',
      wsStandardCode: '',
    })
    setEditingTerm(null)
    setShowModal(true)
  }

  const openEditModal = (term: TermEntry) => {
    setModalMode('edit')
    setEditingTerm(term)
    setFormData({
      term: term.term,
      category: term.category,
      modality: term.modality || ['CT'],
      termType: term.termType || '描述短语',
      standardReport: term.standardReport,
      usageNotes: term.usageNotes || '',
      wsStandardCode: term.wsStandardCode || '',
    })
    setShowModal(true)
  }

  const handleSaveTerm = () => {
    if (!formData.term.trim()) return
    if (modalMode === 'add') {
      const newTerm: TermEntry = {
        id: `TERM${String(terms.length + 1).padStart(3, '0')}`,
        ...formData,
        count: 0,
        lastUsed: new Date().toISOString().slice(0, 10),
        isActive: true,
      }
      setTerms([...terms, newTerm])
    } else if (editingTerm) {
      setTerms(terms.map(t =>
        t.id === editingTerm.id
          ? { ...t, ...formData, lastUsed: new Date().toISOString().slice(0, 10) }
          : t
      ))
    }
    setShowModal(false)
  }

  const handleDeleteTerm = (id: string) => {
    if (!confirm('确认删除该词条？')) return
    setTerms(terms.filter(t => t.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setTerms(terms.map(t =>
      t.id === id ? { ...t, isActive: t.isActive === false ? true : false } : t
    ))
  }

  const handleModalityToggle = (mod: string) => {
    setFormData(prev => ({
      ...prev,
      modality: prev.modality.includes(mod)
        ? prev.modality.filter(m => m !== mod)
        : [...prev.modality, mod],
    }))
  }

  const handleImportFile = async () => {
    if (!importFile) return
    setImportLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    const newTerms: TermEntry[] = [
      { id: `TERM${String(terms.length + 1).padStart(3, '0')}`, term: '导入词条示例1', category: 'CT描述', modality: ['CT'], count: 0, standardReport: '批量导入的词条内容', isActive: true, termType: '描述短语', lastUsed: new Date().toISOString().slice(0, 10) },
      { id: `TERM${String(terms.length + 2).padStart(3, '0')}`, term: '导入词条示例2', category: 'MR描述', modality: ['MR'], count: 0, standardReport: '批量导入的词条内容', isActive: true, termType: '描述短语', lastUsed: new Date().toISOString().slice(0, 10) },
    ]
    setTerms([...terms, ...newTerms])
    setImportLoading(false)
    setImportFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    alert('批量导入成功！')
  }

  const handleDownloadTemplate = () => {
    const headers = ['词条内容', '所属分类', '适用设备类型', '词条类型', '标准报告模板', '使用说明', 'WS标准码']
    const sampleRows = [
      ['未见异常密度影', 'CT描述', 'CT', '描述短语', '脑实质密度均匀，未见异常密度影。', '常规CT头部报告使用', 'WS-CT-001'],
      ['建议定期随访', '结论术语', 'CT,MR', '诊断结论', '建议定期随访复查。', '用于需要随访的患者', ''],
    ]
    const csv = [headers, ...sampleRows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '词库导入模板.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportAllStandards = async () => {
    setImportAllLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    // 模拟：将WS标准码写入前N个词条
    const updated = terms.map((t, i) => {
      if (i < WS_STANDARDS.length) {
        return { ...t, wsStandardCode: WS_STANDARDS[i % WS_STANDARDS.length].code }
      }
      return t
    })
    setTerms(updated)
    setImportAllLoading(false)
    setImportedCount(WS_STANDARDS.length)
    setTimeout(() => setImportedCount(null), 3000)
  }

  const useCount = (id: string) => {
    setTerms(terms.map(t =>
      t.id === id
        ? { ...t, count: t.count + 1, lastUsed: new Date().toISOString().slice(0, 10) }
        : t
    ))
  }

  // ============ 渲染 ============
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif' }}>
      {/* ========== 左侧分类导航 ========== */}
      <div style={{
        width: 260,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* 顶部标题 */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid #e2e8f0',
          background: '#1e40af',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BookOpen size={18} style={{ color: '#93c5fd' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>报告词库</span>
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: 0 }}>标准化术语 · WS/T 500-2016</p>
        </div>

        {/* 全局搜索 */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 8, padding: '7px 10px',
          }}>
            <Search size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              value={leftSearch}
              onChange={e => setLeftSearch(e.target.value)}
              placeholder="搜索词条..."
              style={{
                border: 'none', outline: 'none', fontSize: 12,
                background: 'transparent', width: '100%', color: '#1e40af',
              }}
            />
            {leftSearch && (
              <button onClick={() => setLeftSearch('')} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
              }}>
                <X size={12} style={{ color: '#94a3b8' }} />
              </button>
            )}
          </div>
        </div>

        {/* 统计卡片 */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: '#eff6ff', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e40af' }}>{stats.totalTerms}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>词条总数</div>
            </div>
            <div style={{ background: '#f5f3ff', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e40af' }}>{stats.mappedCount}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>已对照</div>
            </div>
          </div>
        </div>

        {/* 分类列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {/* 全部词库 */}
          <button
            onClick={() => { setActiveCategoryId('ALL'); setMainTab('dict') }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', border: 'none', cursor: 'pointer',
              background: activeCategoryId === 'ALL' && mainTab === 'dict' ? '#eff6ff' : 'transparent',
              borderLeft: activeCategoryId === 'ALL' && mainTab === 'dict' ? '3px solid #1e40af' : '3px solid transparent',
              textAlign: 'left',
            }}
          >
            <FolderOpen size={13} style={{ color: activeCategoryId === 'ALL' && mainTab === 'dict' ? '#1e40af' : '#94a3b8' }} />
            <span style={{ fontSize: 12, fontWeight: activeCategoryId === 'ALL' && mainTab === 'dict' ? 700 : 400, color: activeCategoryId === 'ALL' && mainTab === 'dict' ? '#1e40af' : '#475569' }}>全部词库</span>
            <span style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 700,
              background: activeCategoryId === 'ALL' && mainTab === 'dict' ? '#1e40af' : '#e2e8f0',
              color: activeCategoryId === 'ALL' && mainTab === 'dict' ? '#fff' : '#64748b',
              borderRadius: 10, padding: '1px 6px',
            }}>{getCategoryCount('ALL')}</span>
          </button>

          {/* 国家标准 */}
          <button
            onClick={() => { setMainTab('standard'); setActiveCategoryId('ALL') }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', border: 'none', cursor: 'pointer',
              background: mainTab === 'standard' ? '#eff6ff' : 'transparent',
              borderLeft: mainTab === 'standard' ? '3px solid #1e40af' : '3px solid transparent',
              textAlign: 'left',
            }}
          >
            <FileCheck size={13} style={{ color: mainTab === 'standard' ? '#1e40af' : '#94a3b8' }} />
            <span style={{ fontSize: 12, fontWeight: mainTab === 'standard' ? 700 : 400, color: mainTab === 'standard' ? '#1e40af' : '#475569' }}>国家标准</span>
            <span style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 700,
              background: mainTab === 'standard' ? '#1e40af' : '#e2e8f0',
              color: mainTab === 'standard' ? '#fff' : '#64748b',
              borderRadius: 10, padding: '1px 6px',
            }}>{WS_STANDARDS.length}</span>
          </button>

          <div style={{ padding: '6px 16px 4px', fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>
            按检查类型
          </div>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategoryId(cat.id); setMainTab('dict') }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 16px', border: 'none', cursor: 'pointer',
                background: activeCategoryId === cat.id && mainTab === 'dict' ? '#eff6ff' : 'transparent',
                borderLeft: activeCategoryId === cat.id && mainTab === 'dict' ? `3px solid ${cat.color}` : '3px solid transparent',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: cat.color, opacity: activeCategoryId === cat.id ? 1 : 0.5,
              }} />
              <span style={{
                fontSize: 12, fontWeight: activeCategoryId === cat.id ? 600 : 400,
                color: activeCategoryId === cat.id ? '#1e40af' : '#475569',
              }}>{cat.name}</span>
              <span style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 600,
                background: activeCategoryId === cat.id ? cat.color : '#f1f5f9',
                color: activeCategoryId === cat.id ? '#fff' : '#94a3b8',
                borderRadius: 10, padding: '1px 6px',
              }}>{getCategoryCount(cat.id)}</span>
            </button>
          ))}
        </div>

        {/* 新建分类按钮 */}
        <div style={{ padding: 12, borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={openAddModal}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 16px', background: '#1e40af', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(30,64,175,0.3)',
            }}
          >
            <Plus size={13} />
            新建词条
          </button>
        </div>
      </div>

      {/* ========== 右侧主内容区 ========== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 顶部导航栏 */}
        <div style={{
          background: '#fff', padding: '14px 20px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LayoutGrid size={16} style={{ color: '#1e40af' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>
              {mainTab === 'dict' ? '词库管理' : '国家标准 WS/T 500-2016'}
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>
              ({mainTab === 'dict' ? filteredTerms.length : filteredWsStandards.length} 条)
            </span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {mainTab === 'dict' && (
              <>
                <button
                  onClick={() => setShowQuickPanel(!showQuickPanel)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                    background: showQuickPanel ? '#eff6ff' : '#fff',
                    border: `1px solid ${showQuickPanel ? '#1e40af' : '#e2e8f0'}`,
                    borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    color: showQuickPanel ? '#1e40af' : '#64748b',
                  }}
                >
                  <Zap size={12} />
                  快捷词库
                </button>
                <button
                  onClick={() => setShowStats(!showStats)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                    background: showStats ? '#f5f3ff' : '#fff',
                    border: `1px solid ${showStats ? '#7c3aed' : '#e2e8f0'}`,
                    borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    color: showStats ? '#7c3aed' : '#64748b',
                  }}
                >
                  <BarChart2 size={12} />
                  统计
                </button>
              </>
            )}
            {mainTab === 'standard' && (
              <button
                onClick={handleImportAllStandards}
                disabled={importAllLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px',
                  background: importAllLoading ? '#94a3b8' : '#1e40af',
                  border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  color: '#fff', cursor: importAllLoading ? 'wait' : 'pointer',
                  boxShadow: importAllLoading ? 'none' : '0 2px 6px rgba(30,64,175,0.3)',
                }}
              >
                {importAllLoading
                  ? <><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> 导入中...</>
                  : <><DownloadCloud size={12} /> 一键导入全部标准</>
                }
              </button>
            )}
          </div>
        </div>

        {/* 主内容 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

          {/* ========== 国家标准Tab ========== */}
          {mainTab === 'standard' && (
            <div>
              {/* 导入成功提示 */}
              {importedCount !== null && (
                <div style={{
                  background: '#dcfce7', border: '1px solid #16a34a', borderRadius: 8,
                  padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
                    已成功导入 {importedCount} 条标准对照关系！
                  </span>
                </div>
              )}

              {/* WS标准统计 */}
              <div style={{
                background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <FileCheck size={15} style={{ color: '#1e40af' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>WS/T 500-2016 标准对照表</span>
                  <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>卫生行业标准 · 放射学检查项目分类与编码</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 12 }}>
                  {[
                    { label: '标准总数', value: WS_STANDARDS.length, color: '#1e40af', bg: '#eff6ff' },
                    { label: 'CT类', value: WS_STANDARDS.filter(w => w.department === 'CT').length, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'MR类', value: WS_STANDARDS.filter(w => w.department === 'MR').length, color: '#8b5cf6', bg: '#f5f3ff' },
                    { label: 'DR/X线类', value: WS_STANDARDS.filter(w => w.department === 'DXR' || w.department === '乳腺').length, color: '#10b981', bg: '#ecfdf5' },
                    { label: '超声/DSA', value: WS_STANDARDS.filter(w => w.department === '超声' || w.department === 'DSA').length, color: '#f59e0b', bg: '#fffbeb' },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: item.bg, borderRadius: 8, padding: '10px 12px',
                      border: `1px solid ${item.color}20`,
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* 筛选栏 */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 6, padding: '6px 10px', flex: 1, minWidth: 200,
                  }}>
                    <Search size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <input
                      value={wsSearch}
                      onChange={e => setWsSearch(e.target.value)}
                      placeholder="搜索标准名称、代码或别名..."
                      style={{
                        border: 'none', outline: 'none', fontSize: 12,
                        background: 'transparent', width: '100%', color: '#1e40af',
                      }}
                    />
                    {wsSearch && (
                      <button onClick={() => setWsSearch('')} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
                      }}>
                        <X size={12} style={{ color: '#94a3b8' }} />
                      </button>
                    )}
                  </div>
                  <select
                    value={wsDeptFilter}
                    onChange={e => setWsDeptFilter(e.target.value)}
                    style={{
                      padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
                      fontSize: 11, color: '#334155', background: '#f8fafc', cursor: 'pointer',
                    }}
                  >
                    <option value="全部">全部科室</option>
                    {DEPT_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* WS标准表格 */}
              <div style={{
                background: '#fff', borderRadius: 12,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
                overflow: 'hidden',
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1000 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {['代码', '标准检查名称', '常用别名', '科室', '检查子类', '报告模板', '状态'].map((h, i) => (
                          <th key={h} style={{
                            padding: '10px 12px', textAlign: 'left', fontWeight: 700,
                            color: '#475569', fontSize: 11, whiteSpace: 'nowrap',
                            borderRight: i < 6 ? '1px solid #f1f5f9' : 'none',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWsStandards.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '40px 0', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: 13 }}>
                              <Search size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                              <div>无匹配的标准条目</div>
                            </div>
                          </td>
                        </tr>
                      ) : filteredWsStandards.map((ws, idx) => {
                        const isMapped = mappedWsCodes.has(ws.code)
                        return (
                          <tr
                            key={ws.code}
                            style={{
                              borderBottom: '1px solid #f8fafc',
                              background: '#fff',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafbff'}
                            onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fff'}
                          >
                            <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9' }}>
                              <span style={{
                                fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                                color: '#1e40af', background: '#eff6ff',
                                padding: '2px 8px', borderRadius: 4,
                              }}>
                                {ws.code}
                              </span>
                            </td>
                            <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9', maxWidth: 180 }}>
                              <span style={{ fontWeight: 600, color: '#1e40af' }}>{ws.standardName}</span>
                            </td>
                            <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9' }}>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {ws.aliases.map(a => (
                                  <span key={a} style={{
                                    padding: '1px 6px', borderRadius: 4, fontSize: 10,
                                    background: '#f1f5f9', color: '#64748b',
                                  }}>{a}</span>
                                ))}
                              </div>
                            </td>
                            <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9' }}>
                              <span style={{
                                padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                                background: MODALITY_BG[ws.department] || '#f1f5f9',
                                color: MODALITY_COLORS[ws.department] || '#64748b',
                              }}>{ws.department}</span>
                            </td>
                            <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9' }}>
                              <span style={{ fontSize: 11, color: '#64748b' }}>{ws.subClass}</span>
                            </td>
                            <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9', maxWidth: 250 }}>
                              <div style={{
                                fontSize: 10, color: '#94a3b8', overflow: 'hidden',
                                textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240,
                              }}>
                                {ws.reportTemplate}
                              </div>
                            </td>
                            <td style={{ padding: '9px 12px' }}>
                              {isMapped ? (
                                <span style={{
                                  display: 'flex', alignItems: 'center', gap: 4,
                                  padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                                  background: '#dcfce7', color: '#16a34a',
                                }}>
                                  <CheckCircle2 size={10} />
                                  已对照
                                </span>
                              ) : (
                                <span style={{
                                  padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                                  background: '#fef3c7', color: '#d97706',
                                }}>
                                  未对照
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 底部 */}
                <div style={{
                  padding: '10px 16px', borderTop: '1px solid #f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#fafcff',
                }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    共 <strong style={{ color: '#1e40af' }}>{filteredWsStandards.length}</strong> 条标准，
                    已对照 <strong style={{ color: '#16a34a' }}>{WS_STANDARDS.filter(w => mappedWsCodes.has(w.code)).length}</strong> 条
                  </span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>
                    数据来源：WS/T 500-2016 卫生行业标准（虚构数据，仅供演示）
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========== 词库字典Tab ========== */}
          {mainTab === 'dict' && (
            <>
              {/* ========== 统计面板 ========== */}
              {showStats && (
                <div style={{
                  background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <BarChart2 size={15} style={{ color: '#7c3aed' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>词库统计</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: '词条总数', value: stats.totalTerms, sub: '条', color: '#1e40af', bg: '#eff6ff' },
                      { label: '本月使用', value: stats.thisMonthUsage, sub: '次', color: '#7c3aed', bg: '#f5f3ff' },
                      { label: '已对照标准', value: stats.mappedCount, sub: '条', color: '#059669', bg: '#ecfdf5' },
                      { label: '活跃词条', value: stats.activeTerms, sub: '条', color: '#d97706', bg: '#fffbeb' },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: item.bg, borderRadius: 10, padding: '12px 14px',
                        border: `1px solid ${item.color}20`,
                      }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: item.color }}>
                          {item.value}<span style={{ fontSize: 12, marginLeft: 2 }}>{item.sub}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* TOP20 */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <TrendingUp size={13} style={{ color: '#f59e0b' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af' }}>使用排行榜 TOP20</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {top20Terms.map((t, i) => (
                        <div key={t.id} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: i < 3 ? (
                            i === 0 ? '#fffbeb' : i === 1 ? '#f8fafc' : '#fef3c7'
                          ) : '#fafafa',
                          borderRadius: 8, padding: '7px 10px',
                          border: `1px solid ${i < 3 ? '#f59e0b30' : '#f1f5f9'}`,
                        }}>
                          <span style={{
                            fontSize: 11, fontWeight: 800, color: i < 3 ? '#d97706' : '#94a3b8',
                            minWidth: 16,
                          }}>#{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 11, fontWeight: 600, color: '#1e40af',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{t.term}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>{t.count}次</div>
                          </div>
                          <button
                            onClick={() => handleCopyTerm(t.term)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                              display: 'flex', color: '#94a3b8',
                            }}
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========== 快捷词库面板 ========== */}
              {showQuickPanel && (
                <div style={{
                  background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Zap size={15} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>快捷词库</span>
                    <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>点击词条自动复制</span>
                  </div>

                  {/* 设备切换 */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                    {MODALITY_LIST.map(m => (
                      <button
                        key={m}
                        onClick={() => setActiveQuickModality(m)}
                        style={{
                          padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', border: `1px solid ${activeQuickModality === m ? MODALITY_COLORS[m] : '#e2e8f0'}`,
                          background: activeQuickModality === m ? MODALITY_BG[m] : '#fff',
                          color: activeQuickModality === m ? MODALITY_COLORS[m] : '#64748b',
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* 词条网格 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {quickTerms.length === 0 ? (
                      <div style={{ width: '100%', textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 12 }}>
                        暂无数据
                      </div>
                    ) : quickTerms.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          handleCopyTerm(t.term)
                          useCount(t.id)
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 8, border: '1px solid',
                          cursor: 'pointer', fontSize: 11, fontWeight: 500,
                          background: copySuccess === t.term ? '#dcfce7' : '#f8fafc',
                          borderColor: copySuccess === t.term ? '#16a34a' : '#e2e8f0',
                          color: copySuccess === t.term ? '#16a34a' : '#334155',
                          transition: 'all 0.15s',
                        }}
                      >
                        {copySuccess === t.term ? <Check size={11} /> : <Copy size={11} />}
                        <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.term}
                        </span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, color: '#94a3b8',
                          background: '#f1f5f9', borderRadius: 8, padding: '1px 5px',
                        }}>
                          {t.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ========== 词库内容区 ========== */}
              <div style={{
                background: '#fff', borderRadius: 12,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
                overflow: 'hidden',
              }}>
                {/* 标签页 + 筛选 */}
                <div style={{
                  padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                }}>
                  {/* 标签页 */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {([
                      { key: 'all', label: '全部', count: terms.length },
                      { key: 'active', label: '已启用', count: terms.filter(t => t.isActive !== false).length },
                      { key: 'inactive', label: '已禁用', count: terms.filter(t => t.isActive === false).length },
                    ] as const).map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                          padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', border: 'none',
                          background: activeTab === tab.key ? '#1e40af' : '#f1f5f9',
                          color: activeTab === tab.key ? '#fff' : '#64748b',
                        }}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>

                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* 搜索 */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: 6, padding: '5px 10px',
                    }}>
                      <Search size={12} style={{ color: '#94a3b8' }} />
                      <input
                        value={rightSearch}
                        onChange={e => setRightSearch(e.target.value)}
                        placeholder="搜索词条内容..."
                        style={{
                          border: 'none', outline: 'none', fontSize: 12,
                          background: 'transparent', width: 150, color: '#1e40af',
                        }}
                      />
                    </div>

                    {/* 设备筛选 */}
                    <select
                      value={modalityFilter}
                      onChange={e => setModalityFilter(e.target.value)}
                      style={{
                        padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0',
                        fontSize: 11, color: '#334155', background: '#f8fafc', cursor: 'pointer',
                      }}
                    >
                      <option value="全部">全部设备</option>
                      {MODALITY_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    {/* 分类筛选 */}
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      style={{
                        padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0',
                        fontSize: 11, color: '#334155', background: '#f8fafc', cursor: 'pointer',
                      }}
                    >
                      <option value="全部">全部分类</option>
                      {allCategoryNames.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {/* 批量导入 */}
                    <button
                      onClick={handleDownloadTemplate}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6,
                        fontSize: 11, fontWeight: 600, color: '#059669', cursor: 'pointer',
                      }}
                    >
                      <Download size={11} />
                      导入模板
                    </button>

                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                      background: importLoading ? '#f5f5f5' : '#fff',
                      border: '1px solid #e2e8f0', borderRadius: 6,
                      fontSize: 11, fontWeight: 600, color: '#7c3aed', cursor: importLoading ? 'wait' : 'pointer',
                    }}>
                      <Upload size={11} />
                      {importLoading ? '导入中...' : '批量导入'}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={e => setImportFile(e.target.files?.[0] || null)}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {importFile && (
                      <button
                        onClick={handleImportFile}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                          background: '#7c3aed', border: 'none', borderRadius: 6,
                          fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer',
                        }}
                      >
                        <FileSpreadsheet size={11} />
                        确认导入
                      </button>
                    )}
                  </div>
                </div>

                {/* 表格 */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1000 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {['词条ID', '词条内容', '类别', '设备类型', '使用次数', '最近使用', '标准对照', '操作'].map((h, i) => (
                          <th key={h} style={{
                            padding: '10px 12px', textAlign: 'left', fontWeight: 700,
                            color: '#475569', fontSize: 11, whiteSpace: 'nowrap',
                            borderRight: i < 7 ? '1px solid #f1f5f9' : 'none',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTerms.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '40px 0', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: 13 }}>
                              <Search size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                              <div>暂无匹配的词条</div>
                            </div>
                          </td>
                        </tr>
                      ) : filteredTerms.map((term, idx) => (
                        <tr
                          key={term.id}
                          style={{
                            borderBottom: '1px solid #f8fafc',
                            background: term.isActive === false ? '#fef9f9' : '#fff',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => {
                            if (term.isActive !== false) (e.currentTarget as HTMLTableRowElement).style.background = '#fafbff'
                          }}
                          onMouseLeave={e => {
                            if (term.isActive !== false) (e.currentTarget as HTMLTableRowElement).style.background = '#fff'
                            else (e.currentTarget as HTMLTableRowElement).style.background = '#fef9f9'
                          }}
                        >
                          <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9' }}>
                            <span style={{
                              fontFamily: 'monospace', fontSize: 11, fontWeight: 600,
                              color: '#94a3b8', background: '#f8fafc',
                              padding: '2px 6px', borderRadius: 4,
                            }}>
                              {term.id}
                            </span>
                          </td>
                          <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9', maxWidth: 220 }}>
                            <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 2 }}>
                              {term.term}
                            </div>
                            <div style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 210 }}>
                              {term.standardReport}
                            </div>
                          </td>
                          <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                              background: '#f5f3ff', color: '#6d28d9',
                            }}>
                              {term.category}
                            </span>
                          </td>
                          <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                              {term.modality?.map(m => (
                                <span key={m} style={{
                                  padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                                  background: MODALITY_BG[m] || '#f1f5f9',
                                  color: MODALITY_COLORS[m] || '#64748b',
                                }}>
                                  {m}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <TrendingUp size={11} style={{ color: '#10b981' }} />
                              <span style={{ fontWeight: 700, color: '#059669', fontSize: 12 }}>{term.count}</span>
                            </div>
                          </td>
                          <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: 11, color: '#64748b' }}>{term.lastUsed || '-'}</span>
                          </td>
                          {/* 标准对照列 */}
                          <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9' }}>
                            {term.wsStandardCode ? (
                              <span style={{
                                fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                                padding: '2px 6px', borderRadius: 4,
                                background: '#dcfce7', color: '#16a34a',
                              }}>
                                {term.wsStandardCode}
                              </span>
                            ) : (
                              <span style={{
                                fontSize: 10, color: '#d97706', fontWeight: 600,
                              }}>
                                —
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '9px 12px' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                onClick={() => openEditModal(term)}
                                title="编辑"
                                style={{
                                  padding: '4px 8px', background: '#eff6ff', color: '#2563eb',
                                  border: 'none', borderRadius: 5, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center',
                                }}
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                onClick={() => handleToggleActive(term.id)}
                                title={term.isActive === false ? '启用' : '禁用'}
                                style={{
                                  padding: '4px 8px', background: term.isActive === false ? '#ecfdf5' : '#fef3c7',
                                  color: term.isActive === false ? '#16a34a' : '#d97706',
                                  border: 'none', borderRadius: 5, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center',
                                }}
                              >
                                {term.isActive === false ? <CheckCircle2 size={11} /> : <EyeOff size={11} />}
                              </button>
                              <button
                                onClick={() => handleDeleteTerm(term.id)}
                                title="删除"
                                style={{
                                  padding: '4px 8px', background: '#fef2f2', color: '#dc2626',
                                  border: 'none', borderRadius: 5, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center',
                                }}
                              >
                                <Trash2 size={11} />
                              </button>
                              <button
                                onClick={() => {
                                  handleCopyTerm(term.term)
                                  useCount(term.id)
                                }}
                                title="复制并使用"
                                style={{
                                  padding: '4px 8px', background: copySuccess === term.term ? '#dcfce7' : '#f0fdf4',
                                  color: copySuccess === term.term ? '#16a34a' : '#059669',
                                  border: 'none', borderRadius: 5, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center',
                                }}
                              >
                                {copySuccess === term.term ? <Check size={11} /> : <Copy size={11} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 底部 */}
                <div style={{
                  padding: '10px 16px', borderTop: '1px solid #f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#fafcff',
                }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    共 <strong style={{ color: '#1e40af' }}>{filteredTerms.length}</strong> 条词条，
                    已对照标准 <strong style={{ color: '#16a34a' }}>{stats.mappedCount}</strong> 条
                  </span>
                  <button
                    onClick={openAddModal}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px',
                      background: '#1e40af', color: '#fff', border: 'none',
                      borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <Plus size={12} />
                    新建词条
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========== 新建/编辑弹窗 ========== */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16,
              width: 580, maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
          >
            {/* 弹窗头部 */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#1e40af', borderRadius: '16px 16px 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={15} style={{ color: '#93c5fd' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  {modalMode === 'add' ? '新建词条' : '编辑词条'}
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6,
                  padding: 5, cursor: 'pointer', display: 'flex',
                }}
              >
                <X size={16} style={{ color: '#fff' }} />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div style={{ padding: 20 }}>
              {/* 词条内容 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
                  词条内容 <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  value={formData.term}
                  onChange={e => setFormData(prev => ({ ...prev, term: e.target.value }))}
                  rows={3}
                  placeholder="请输入词条内容，如：未见异常密度影"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: 12, color: '#1e40af',
                    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1e40af'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* 所属分类 + 词条类型 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
                    所属分类
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      border: '1px solid #e2e8f0', fontSize: 12, color: '#1e40af',
                      background: '#fff', cursor: 'pointer', boxSizing: 'border-box',
                    }}
                  >
                    {allCategoryNames.length > 0
                      ? allCategoryNames.map(c => <option key={c} value={c}>{c}</option>)
                      : ['CT描述', 'MR描述', '结论术语', '急诊模板', '肿瘤评估'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))
                    }
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
                    词条类型
                  </label>
                  <select
                    value={formData.termType}
                    onChange={e => setFormData(prev => ({ ...prev, termType: e.target.value as TermEntry['termType'] }))}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      border: '1px solid #e2e8f0', fontSize: 12, color: '#1e40af',
                      background: '#fff', cursor: 'pointer', boxSizing: 'border-box',
                    }}
                  >
                    {TERM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* 适用检查类型 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 8 }}>
                  适用检查类型 <span style={{ color: '#94a3b8', fontWeight: 400 }}>（可多选）</span>
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {MODALITY_LIST.map(m => (
                    <label
                      key={m}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                        borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                        border: `1px solid ${formData.modality.includes(m) ? MODALITY_COLORS[m] : '#e2e8f0'}`,
                        background: formData.modality.includes(m) ? MODALITY_BG[m] : '#fff',
                        color: formData.modality.includes(m) ? MODALITY_COLORS[m] : '#94a3b8',
                        userSelect: 'none',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.modality.includes(m)}
                        onChange={() => handleModalityToggle(m)}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        width: 12, height: 12, borderRadius: 3, border: '2px solid',
                        borderColor: formData.modality.includes(m) ? MODALITY_COLORS[m] : '#cbd5e1',
                        background: formData.modality.includes(m) ? MODALITY_COLORS[m] : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {formData.modality.includes(m) && (
                          <Check size={8} style={{ color: '#fff' }} />
                        )}
                      </div>
                      {m}
                    </label>
                  ))}
                </div>
              </div>

              {/* WS标准对照 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
                  WS/T 500-2016 标准对照
                </label>
                <select
                  value={formData.wsStandardCode}
                  onChange={e => setFormData(prev => ({ ...prev, wsStandardCode: e.target.value }))}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: 12, color: '#1e40af',
                    background: '#fff', cursor: 'pointer', boxSizing: 'border-box',
                  }}
                >
                  <option value="">不关联标准</option>
                  {WS_STANDARDS.map(ws => (
                    <option key={ws.code} value={ws.code}>
                      {ws.code} - {ws.standardName}
                    </option>
                  ))}
                </select>
              </div>

              {/* 标准报告模板 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
                  标准报告模板
                </label>
                <textarea
                  value={formData.standardReport}
                  onChange={e => setFormData(prev => ({ ...prev, standardReport: e.target.value }))}
                  rows={4}
                  placeholder="请输入标准报告模板内容"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: 12, color: '#1e40af',
                    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1e40af'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* 使用说明 */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
                  使用说明 / 备注
                </label>
                <textarea
                  value={formData.usageNotes}
                  onChange={e => setFormData(prev => ({ ...prev, usageNotes: e.target.value }))}
                  rows={2}
                  placeholder="选填，如：适用于CT头部平扫报告"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: 12, color: '#1e40af',
                    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1e40af'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* 弹窗底部 */}
            <div style={{
              padding: '14px 20px', borderTop: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              background: '#fafcff', borderRadius: '0 0 16px 16px',
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 20px', background: '#fff', color: '#64748b',
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveTerm}
                disabled={!formData.term.trim()}
                style={{
                  padding: '8px 20px', background: formData.term.trim() ? '#1e40af' : '#94a3b8',
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: formData.term.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: formData.term.trim() ? '0 2px 8px rgba(30,64,175,0.3)' : 'none',
                }}
              >
                {modalMode === 'add' ? '保存词条' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
