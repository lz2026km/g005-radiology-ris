// @ts-nocheck
// G005 放射RIS系统 - 技师工作站 v1.0.0
// 放射科技师工作台 · 检查列表与执行管理
import { useState, useMemo } from 'react'
import {
  User, Clock, AlertCircle, CheckCircle, Play, Pause,
  Search, Filter, X, ChevronLeft, ChevronRight, Camera,
  Monitor, FileText, Activity, CheckCircle2, XCircle, Timer
} from 'lucide-react'
import { initialRadiologyExams } from '../data/initialData'
import type { RadiologyExam } from '../types'

// ==================== 常量配置 ====================
const PRIMARY = '#1e40af'        // 深蓝主色
const PRIMARY_LIGHT = '#3b82f6'  // 浅蓝
const PRIMARY_BG = '#eff6ff'     // 深蓝背景

// 优先级配置
const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  '普通': { color: '#64748b', bg: '#f1f5f9' },
  '紧急': { color: '#d97706', bg: '#fef3c7' },
  '危重': { color: '#dc2626', bg: '#fee2e2' },
}

// 状态配置
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  '待检查':    { color: '#2563eb', bg: '#dbeafe', label: '待检查' },
  '检查中':    { color: '#d97706', bg: '#fef3c7', label: '检查中' },
  '已完成':    { color: '#16a34a', bg: '#dcfce7', label: '已完成' },
  '已发布':    { color: '#7c3aed', bg: '#ede9fe', label: '已发布' },
  '待报告':    { color: '#0891b2', bg: '#cffafe', label: '待报告' },
  '已登记':    { color: '#64748b', bg: '#f1f5f9', label: '已登记' },
  '已预约':    { color: '#64748b', bg: '#f1f5f9', label: '已预约' },
}

// 设备类型
const MODALITY_LIST = ['全部', 'DR', 'CT', 'MR', 'DSA', '乳腺钼靶']

// 患者类型
const PATIENT_TYPE_LIST = ['全部', '门诊', '住院', '急诊', '体检']

// ==================== 类型定义 ====================
type FilterState = {
  search: string
  priority: string
  status: string
  modality: string
  patientType: string
}

type ModalState = {
  visible: boolean
  exam: RadiologyExam | null
  action: 'start' | 'complete' | 'cancel' | 'quality' | null
}

// ==================== 工具函数 ====================
const formatTime = (time: string) => time || '-'

const getPriorityStyle = (priority: string) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['普通']
  return { color: config.color, backgroundColor: config.bg }
}

const getStatusStyle = (status: string) => {
  const config = STATUS_CONFIG[status] || { color: '#64748b', bg: '#f1f5f9', label: status }
  return { color: config.color, backgroundColor: config.bg, label: config.label }
}

// ==================== 主组件 ====================
export default function ExamPage() {
  // 分页状态
  const [page, setPage] = useState(1)
  const pageSize = 10

  // 筛选状态
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: '全部',
    status: '全部',
    modality: '全部',
    patientType: '全部',
  })

  // Modal状态
  const [modal, setModal] = useState<ModalState>({
    visible: false,
    exam: null,
    action: null,
  })

  // 操作备注
  const [actionNotes, setActionNotes] = useState('')
  const [imageQuality, setImageQuality] = useState('优')

  // ==================== 数据处理 ====================
  const allExams = initialRadiologyExams

  // 筛选后的数据
  const filteredExams = useMemo(() => {
    return allExams.filter(exam => {
      // 搜索过滤（姓名/ID/检查号）
      if (filters.search) {
        const kw = filters.search.toLowerCase()
        if (!exam.patientName.toLowerCase().includes(kw) &&
            !exam.id.toLowerCase().includes(kw) &&
            !exam.accessionNumber.toLowerCase().includes(kw)) {
          return false
        }
      }
      // 优先级过滤
      if (filters.priority !== '全部' && exam.priority !== filters.priority) return false
      // 状态过滤
      if (filters.status !== '全部' && exam.status !== filters.status) return false
      // 设备类型过滤
      if (filters.modality !== '全部' && exam.modality !== filters.modality) return false
      // 患者类型过滤
      if (filters.patientType !== '全部' && exam.patientType !== filters.patientType) return false
      return true
    })
  }, [allExams, filters])

  // 分页数据
  const paginatedExams = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredExams.slice(start, start + pageSize)
  }, [filteredExams, page])

  // 总页数
  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize))

  // 底部统计
  const stats = useMemo(() => {
    return {
      total: filteredExams.length,
      pending: filteredExams.filter(e => e.status === '待检查').length,
      inProgress: filteredExams.filter(e => e.status === '检查中').length,
      completed: filteredExams.filter(e => ['已完成', '已发布'].includes(e.status)).length,
      critical: filteredExams.filter(e => e.priority === '危重').length,
    }
  }, [filteredExams])

  // ==================== 事件处理 ====================
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const openModal = (exam: RadiologyExam, action: 'start' | 'complete' | 'cancel' | 'quality') => {
    setModal({ visible: true, exam, action })
    setActionNotes('')
    setImageQuality('优')
  }

  const closeModal = () => {
    setModal({ visible: false, exam: null, action: null })
  }

  const handleExecute = () => {
    // 实际应用中这里调用API
    console.log('执行操作:', modal.action, modal.exam?.id, { notes: actionNotes, quality: imageQuality })
    closeModal()
  }

  // ==================== 渲染组件 ====================
  // 筛选栏
  const FilterBar = () => (
    <div style={{
      backgroundColor: '#fff',
      borderBottom: '1px solid #e2e8f0',
      padding: '12px 20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'center',
    }}>
      {/* 标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginRight: 8,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: PRIMARY,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Activity size={16} style={{ color: '#fff' }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: PRIMARY }}>技师工作站</div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>检查执行管理</div>
        </div>
      </div>

      {/* 分隔线 */}
      <div style={{ width: 1, height: 32, backgroundColor: '#e2e8f0' }} />

      {/* 搜索框 */}
      <div style={{ position: 'relative', flex: '0 0 200px' }}>
        <Search size={14} style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8',
        }} />
        <input
          type="text"
          placeholder="搜索患者/检查号..."
          value={filters.search}
          onChange={e => handleFilterChange('search', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px 8px 32px',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            fontSize: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = PRIMARY}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      {/* 优先级筛选 */}
      <select
        value={filters.priority}
        onChange={e => handleFilterChange('priority', e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          fontSize: 12,
          outline: 'none',
          cursor: 'pointer',
          backgroundColor: filters.priority !== '全部' ? PRIORITY_CONFIG[filters.priority]?.bg : '#fff',
        }}
      >
        {['全部', '普通', '紧急', '危重'].map(p => (
          <option key={p} value={p}>{p === '全部' ? '全部优先级' : `⚑ ${p}`}</option>
        ))}
      </select>

      {/* 状态筛选 */}
      <select
        value={filters.status}
        onChange={e => handleFilterChange('status', e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          fontSize: 12,
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {['全部', '待检查', '检查中', '已完成', '已发布', '待报告'].map(s => (
          <option key={s} value={s}>{s === '全部' ? '全部状态' : s}</option>
        ))}
      </select>

      {/* 设备类型筛选 */}
      <select
        value={filters.modality}
        onChange={e => handleFilterChange('modality', e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          fontSize: 12,
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {MODALITY_LIST.map(m => (
          <option key={m} value={m}>{m === '全部' ? '全部设备' : m}</option>
        ))}
      </select>

      {/* 患者类型筛选 */}
      <select
        value={filters.patientType}
        onChange={e => handleFilterChange('patientType', e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          fontSize: 12,
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {PATIENT_TYPE_LIST.map(t => (
          <option key={t} value={t}>{t === '全部' ? '全部患者' : t}</option>
        ))}
      </select>

      {/* 清空筛选 */}
      {(filters.search || filters.priority !== '全部' || filters.status !== '全部' || filters.modality !== '全部' || filters.patientType !== '全部') && (
        <button
          onClick={() => setFilters({ search: '', priority: '全部', status: '全部', modality: '全部', patientType: '全部' })}
          style={{
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#fff',
            color: '#64748b',
          }}
        >
          <X size={12} /> 清空
        </button>
      )}
    </div>
  )

  // 表格
  const ExamTable = () => (
    <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#fff' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 12,
      }}>
        <thead>
          <tr style={{
            backgroundColor: PRIMARY_BG,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}>
            {['检查号', '患者信息', '检查项目', '设备', '优先级', '状态', '检查时间', '操作'].map((h, i) => (
              <th key={h} style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: 600,
                color: PRIMARY,
                borderBottom: `2px solid ${PRIMARY}`,
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedExams.length === 0 ? (
            <tr>
              <td colSpan={8} style={{
                padding: '40px 12px',
                textAlign: 'center',
                color: '#94a3b8',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Search size={32} style={{ opacity: 0.5 }} />
                  <div>未找到符合条件的检查记录</div>
                </div>
              </td>
            </tr>
          ) : paginatedExams.map((exam, idx) => {
            const pStyle = getPriorityStyle(exam.priority)
            const sStyle = getStatusStyle(exam.status)
            return (
              <tr
                key={exam.id}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = PRIMARY_BG}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f8fafc'}
              >
                {/* 检查号 */}
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#64748b' }}>
                  {exam.accessionNumber}
                </td>
                {/* 患者信息 */}
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: PRIMARY_BG,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <User size={14} style={{ color: PRIMARY }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{exam.patientName}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>
                        {exam.gender} · {exam.age}岁 · {exam.patientType}
                      </div>
                    </div>
                  </div>
                </td>
                {/* 检查项目 */}
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 500, color: '#334155' }}>{exam.examItemName}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{exam.modality} · {exam.bodyPart}</div>
                </td>
                {/* 设备 */}
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Monitor size={12} style={{ color: '#94a3b8' }} />
                    <span style={{ color: '#64748b' }}>{exam.deviceName?.split('（')[0] || '-'}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{exam.roomName}</div>
                </td>
                {/* 优先级 */}
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    ...pStyle,
                  }}>
                    {exam.priority}
                  </span>
                </td>
                {/* 状态 */}
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    ...sStyle,
                  }}>
                    {sStyle.label}
                  </span>
                </td>
                {/* 检查时间 */}
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ color: '#64748b' }}>{exam.examDate}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{formatTime(exam.examTime)}</div>
                </td>
                {/* 操作 */}
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {exam.status === '待检查' && (
                      <button
                        onClick={() => openModal(exam, 'start')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 4,
                          border: 'none',
                          backgroundColor: PRIMARY,
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Play size={10} /> 开始
                      </button>
                    )}
                    {exam.status === '检查中' && (
                      <>
                        <button
                          onClick={() => openModal(exam, 'complete')}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 4,
                            border: 'none',
                            backgroundColor: '#16a34a',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <CheckCircle2 size={10} /> 完成
                        </button>
                        <button
                          onClick={() => openModal(exam, 'quality')}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#fff',
                            color: '#64748b',
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          质量
                        </button>
                      </>
                    )}
                    {(exam.status === '已完成' || exam.status === '待报告') && (
                      <button
                        onClick={() => openModal(exam, 'quality')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 4,
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#fff',
                          color: '#64748b',
                          fontSize: 11,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <FileText size={10} /> 查看
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  // 分页组件
  const Pagination = () => (
    <div style={{
      backgroundColor: '#fff',
      borderTop: '1px solid #e2e8f0',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ fontSize: 12, color: '#64748b' }}>
        共 <span style={{ fontWeight: 600, color: PRIMARY }}>{filteredExams.length}</span> 条记录，
        第 <span style={{ fontWeight: 600, color: PRIMARY }}>{page}</span> / {totalPages} 页
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
          style={{
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            color: page === 1 ? '#cbd5e1' : PRIMARY,
            fontSize: 12,
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ChevronLeft size={14} /><ChevronLeft size={14} />
        </button>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            color: page === 1 ? '#cbd5e1' : PRIMARY,
            fontSize: 12,
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ChevronLeft size={14} />
        </button>
        {/* 页码 */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p
          if (totalPages <= 5) {
            p = i + 1
          } else if (page <= 3) {
            p = i + 1
          } else if (page >= totalPages - 2) {
            p = totalPages - 4 + i
          } else {
            p = page - 2 + i
          }
          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                minWidth: 32,
                padding: '6px 8px',
                borderRadius: 4,
                border: '1px solid',
                borderColor: page === p ? PRIMARY : '#e2e8f0',
                backgroundColor: page === p ? PRIMARY : '#fff',
                color: page === p ? '#fff' : '#64748b',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: page === p ? 600 : 400,
              }}
            >
              {p}
            </button>
          )
        })}
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={{
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            color: page === totalPages ? '#cbd5e1' : PRIMARY,
            fontSize: 12,
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          style={{
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            color: page === totalPages ? '#cbd5e1' : PRIMARY,
            fontSize: 12,
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ChevronRight size={14} /><ChevronRight size={14} />
        </button>
      </div>
    </div>
  )

  // 底部统计栏
  const StatsBar = () => (
    <div style={{
      backgroundColor: PRIMARY,
      padding: '12px 20px',
      display: 'flex',
      gap: 24,
    }}>
      {[
        { label: '全部记录', value: stats.total, icon: FileText, color: '#fff' },
        { label: '待检查', value: stats.pending, icon: Clock, color: '#60a5fa' },
        { label: '检查中', value: stats.inProgress, icon: Activity, color: '#fbbf24' },
        { label: '已完成', value: stats.completed, icon: CheckCircle, color: '#4ade80' },
        { label: '危重', value: stats.critical, icon: AlertCircle, color: '#f87171' },
      ].map(item => (
        <div key={item.label} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <item.icon size={16} style={{ color: item.color, opacity: 0.9 }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{item.value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  )

  // 操作Modal
  const ActionModal = () => {
    if (!modal.visible || !modal.exam) return null

    const actionConfig = {
      start: { title: '开始检查', color: PRIMARY, confirmText: '确认开始', icon: Play },
      complete: { title: '完成检查', color: '#16a34a', confirmText: '确认完成', icon: CheckCircle2 },
      cancel: { title: '取消检查', color: '#dc2626', confirmText: '确认取消', icon: XCircle },
      quality: { title: '图像质量评定', color: '#0891b2', confirmText: '保存评定', icon: Camera },
    }[modal.action || 'start']

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          width: 480,
          maxWidth: '90vw',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: actionConfig.color,
            borderRadius: '12px 12px 0 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <actionConfig.icon size={18} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>{actionConfig.title}</span>
            </div>
            <button
              onClick={closeModal}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: 20 }}>
            {/* 患者信息 */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>患者姓名</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{modal.exam.patientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>检查项目</span>
                <span style={{ color: '#334155' }}>{modal.exam.examItemName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>检查号</span>
                <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{modal.exam.accessionNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>设备</span>
                <span style={{ color: '#334155' }}>{modal.exam.deviceName?.split('（')[0]}</span>
              </div>
            </div>

            {/* 操作特定内容 */}
            {modal.action === 'quality' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>
                  图像质量评级
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['优', '良', '差'].map(q => (
                    <button
                      key={q}
                      onClick={() => setImageQuality(q)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '2px solid',
                        borderColor: imageQuality === q ? (q === '优' ? '#16a34a' : q === '良' ? '#d97706' : '#dc2626') : '#e2e8f0',
                        backgroundColor: imageQuality === q ? (q === '优' ? '#dcfce7' : q === '良' ? '#fef3c7' : '#fee2e2') : '#fff',
                        color: imageQuality === q ? (q === '优' ? '#16a34a' : q === '良' ? '#d97706' : '#dc2626') : '#64748b',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 备注 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>
                操作备注
              </label>
              <textarea
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                placeholder="请输入操作备注（可选）..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 12,
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = actionConfig.color}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}>
            <button
              onClick={closeModal}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                backgroundColor: '#fff',
                color: '#64748b',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              onClick={handleExecute}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: actionConfig.color,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {actionConfig.confirmText}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ==================== 主渲染 ====================
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f0f4f8',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* 顶部筛选栏 */}
      <FilterBar />

      {/* 检查列表表格 */}
      <ExamTable />

      {/* 分页 */}
      <Pagination />

      {/* 底部统计栏 */}
      <StatsBar />

      {/* 操作Modal */}
      <ActionModal />
    </div>
  )
}
