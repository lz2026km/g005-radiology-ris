// @ts-nocheck
// G005 放射科RIS系统 - 报告词库页面 v1.0.0
// 放射科专用术语词库，支持快速录入、分类管理、快捷复制、批量导入
import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, Search, Plus, Edit2, Trash2, X, Copy, Upload,
  Download, Filter, ChevronRight, ChevronDown, BarChart2,
  Tag, FolderOpen, Clock, TrendingUp, CheckCircle2, AlertCircle,
  FileSpreadsheet, RefreshCw, Eye, EyeOff, Trash, Check,
  List, LayoutGrid, Star, Zap, Settings
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
    initialTermLibrary.map(t => ({
      ...t,
      lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      isActive: true,
      modality: MODALITY_LIST.slice(0, Math.floor(Math.random() * 3) + 1),
      termType: TERM_TYPES[Math.floor(Math.random() * 2)] as TermEntry['termType'],
    }))
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

  // 新建/编辑表单状态
  const [formData, setFormData] = useState({
    term: '',
    category: 'CT描述',
    modality: ['CT'] as string[],
    termType: '描述短语' as TermEntry['termType'],
    standardReport: '',
    usageNotes: '',
  })

  // ---------- 统计数据 ----------
  const stats = {
    totalTerms: terms.length,
    totalCategories: categories.length,
    thisMonthUsage: terms.reduce((sum, t) => sum + t.count, 0),
    activeTerms: terms.filter(t => t.isActive !== false).length,
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

  // ============ 操作函数 ============
  const handleCopyTerm = async (term: string) => {
    try {
      await navigator.clipboard.writeText(term)
      setCopySuccess(term)
      setTimeout(() => setCopySuccess(null), 1500)
    } catch {
      // fallback
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
    const headers = ['词条内容', '所属分类', '适用设备类型', '词条类型', '标准报告模板', '使用说明']
    const sampleRows = [
      ['未见异常密度影', 'CT描述', 'CT', '描述短语', '脑实质密度均匀，未见异常密度影。', '常规CT头部报告使用'],
      ['建议定期随访', '结论术语', 'CT,MR', '诊断结论', '建议定期随访复查。', '用于需要随访的患者'],
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
          background: '#1e3a5f',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BookOpen size={18} style={{ color: '#60a5fa' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>报告词库</span>
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: 0 }}>标准化术语 · 快捷辅助输入</p>
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
                background: 'transparent', width: '100%', color: '#1e3a5f',
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
            <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>{stats.totalTerms}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>词条总数</div>
            </div>
            <div style={{ background: '#f5f3ff', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>{stats.totalCategories}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>分类数</div>
            </div>
          </div>
        </div>

        {/* 分类列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {/* 全部词库 */}
          <button
            onClick={() => setActiveCategoryId('ALL')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', border: 'none', cursor: 'pointer',
              background: activeCategoryId === 'ALL' ? '#eff6ff' : 'transparent',
              borderLeft: activeCategoryId === 'ALL' ? '3px solid #1e3a5f' : '3px solid transparent',
              textAlign: 'left',
            }}
          >
            <FolderOpen size={13} style={{ color: activeCategoryId === 'ALL' ? '#1e3a5f' : '#94a3b8' }} />
            <span style={{ fontSize: 12, fontWeight: activeCategoryId === 'ALL' ? 700 : 400, color: activeCategoryId === 'ALL' ? '#1e3a5f' : '#475569' }}>全部词库</span>
            <span style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 700,
              background: activeCategoryId === 'ALL' ? '#1e3a5f' : '#e2e8f0',
              color: activeCategoryId === 'ALL' ? '#fff' : '#64748b',
              borderRadius: 10, padding: '1px 6px',
            }}>{getCategoryCount('ALL')}</span>
          </button>

          <div style={{ padding: '6px 16px 4px', fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>
            按检查类型
          </div>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 16px', border: 'none', cursor: 'pointer',
                background: activeCategoryId === cat.id ? '#eff6ff' : 'transparent',
                borderLeft: activeCategoryId === cat.id ? `3px solid ${cat.color}` : '3px solid transparent',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: cat.color, opacity: activeCategoryId === cat.id ? 1 : 0.5,
              }} />
              <span style={{
                fontSize: 12, fontWeight: activeCategoryId === cat.id ? 600 : 400,
                color: activeCategoryId === cat.id ? '#1e3a5f' : '#475569',
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
              padding: '8px 16px', background: '#1e3a5f', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(30,58,95,0.3)',
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
            <LayoutGrid size={16} style={{ color: '#1e3a5f' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>词库管理</span>
            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>
              ({filteredTerms.length} 条)
            </span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setShowQuickPanel(!showQuickPanel)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                background: showQuickPanel ? '#eff6ff' : '#fff',
                border: `1px solid ${showQuickPanel ? '#1e3a5f' : '#e2e8f0'}`,
                borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                color: showQuickPanel ? '#1e3a5f' : '#64748b',
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
          </div>
        </div>

        {/* 主内容 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {/* ========== 统计面板 ========== */}
          {showStats && (
            <div style={{
              background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <BarChart2 size={15} style={{ color: '#7c3aed' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>词库统计</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: '词条总数', value: stats.totalTerms, sub: '条', color: '#1e3a5f', bg: '#eff6ff' },
                  { label: '本月使用', value: stats.thisMonthUsage, sub: '次', color: '#7c3aed', bg: '#f5f3ff' },
                  { label: '分类数量', value: stats.totalCategories, sub: '类', color: '#059669', bg: '#ecfdf5' },
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
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>使用排行榜 TOP20</span>
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
                          fontSize: 11, fontWeight: 600, color: '#1e3a5f',
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
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>快捷词库</span>
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
                      background: activeTab === tab.key ? '#1e3a5f' : '#f1f5f9',
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
                      background: 'transparent', width: 150, color: '#1e3a5f',
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 900 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {['词条ID', '词条内容', '类别', '设备类型', '使用次数', '最近使用', '操作'].map((h, i) => (
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
                  {filteredTerms.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px 0', textAlign: 'center' }}>
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
                      <td style={{ padding: '9px 12px', borderRight: '1px solid #f1f5f9', maxWidth: 260 }}>
                        <div style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: 2 }}>
                          {term.term}
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 250 }}>
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
                共 <strong style={{ color: '#1e3a5f' }}>{filteredTerms.length}</strong> 条词条
              </span>
              <button
                onClick={openAddModal}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px',
                  background: '#1e3a5f', color: '#fff', border: 'none',
                  borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Plus size={12} />
                新建词条
              </button>
            </div>
          </div>
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
              background: '#1e3a5f', borderRadius: '16px 16px 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={15} style={{ color: '#60a5fa' }} />
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 6 }}>
                  词条内容 <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  value={formData.term}
                  onChange={e => setFormData(prev => ({ ...prev, term: e.target.value }))}
                  rows={3}
                  placeholder="请输入词条内容，如：未见异常密度影"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: 12, color: '#1e3a5f',
                    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* 所属分类 + 词条类型 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 6 }}>
                    所属分类
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      border: '1px solid #e2e8f0', fontSize: 12, color: '#1e3a5f',
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
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 6 }}>
                    词条类型
                  </label>
                  <select
                    value={formData.termType}
                    onChange={e => setFormData(prev => ({ ...prev, termType: e.target.value as TermEntry['termType'] }))}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      border: '1px solid #e2e8f0', fontSize: 12, color: '#1e3a5f',
                      background: '#fff', cursor: 'pointer', boxSizing: 'border-box',
                    }}
                  >
                    {TERM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* 适用检查类型 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>
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

              {/* 标准报告模板 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 6 }}>
                  标准报告模板
                </label>
                <textarea
                  value={formData.standardReport}
                  onChange={e => setFormData(prev => ({ ...prev, standardReport: e.target.value }))}
                  rows={4}
                  placeholder="请输入标准报告模板内容"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: 12, color: '#1e3a5f',
                    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* 使用说明 */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 6 }}>
                  使用说明 / 备注
                </label>
                <textarea
                  value={formData.usageNotes}
                  onChange={e => setFormData(prev => ({ ...prev, usageNotes: e.target.value }))}
                  rows={2}
                  placeholder="选填，如：适用于CT头部平扫报告"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: 12, color: '#1e3a5f',
                    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1e3a5f'}
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
                  padding: '8px 20px', background: formData.term.trim() ? '#1e3a5f' : '#94a3b8',
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: formData.term.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: formData.term.trim() ? '0 2px 8px rgba(30,58,95,0.3)' : 'none',
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
