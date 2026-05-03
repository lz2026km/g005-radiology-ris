// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 报告列表 v1.0.0（扩展版）
// 管理所有放射科报告：筛选、列表/看板切换、详情、审核
// ============================================================
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, FileText, Clock, CheckCircle, AlertTriangle, Filter, X, Printer,
  Eye, Edit3, CheckCircle2, RotateCcw, Download, Upload, ChevronDown,
  ChevronRight, Calendar, User, Activity, Stethoscope, ClipboardList,
  ShieldCheck, History, SplitSquareHorizontal, List, LayoutGrid,
  XCircle, ArrowRight, RefreshCw, BarChart3, Plus, Bell, Zap,
  EyeOff, CheckSquare, Square, ArrowLeftRight, FileSearch, MessageSquare,
  Mic, Sparkles, AlertOctagon
} from 'lucide-react'
import { initialRadiologyReports, initialRadiologyExams, initialUsers } from '../data/initialData'
import type { RadiologyReport } from '../types'

// ============================================================
// 常量定义
// ============================================================
const PRIMARY = '#1e3a5f'
const PRIMARY_LIGHT = '#2c5282'
const ACCENT = '#3182ce'
const SUCCESS = '#059669'
const WARNING = '#d97706'
const DANGER = '#dc2626'
const PURPLE = '#7c3aed'
const GRAY = '#64748b'
const BG = '#f8fafc'
const WHITE = '#ffffff'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  '待审核':   { label: '待审核', bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' },
  '已审核':   { label: '已审核', bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' },
  '已发布':   { label: '已发布', bg: '#d1fae5', color: '#047857', border: '#6ee7b7' },
  '已修改':   { label: '已修改', bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  '已退回':   { label: '已退回', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
}

const MODALITIES = ['全部', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶']
const STATUSES    = ['全部', '待审核', '已审核', '已发布', '已修改']
const PRIORITIES  = ['全部', '紧急', '危重', '普通']

const DOCTORS = initialUsers.filter(u => u.role === 'radiologist')

// ============================================================
// 全局辅助函数
// ============================================================
function formatDate(dt: string) {
  if (!dt) return '-'
  return dt.length >= 16 ? dt.slice(0, 16) : dt
}

function formatDateFull(dt: string) {
  if (!dt) return ''
  const d = new Date(dt)
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function isToday(dt: string) {
  if (!dt) return false
  return dt.startsWith('2026-05-01') // 演示数据日期
}

// AI异常高亮关键词（模拟AI自动检测异常词汇）
const ANOMALY_KEYWORDS = ['结节', '血肿', '占位', '狭窄', '肿块', '转移', '骨折', '渗出', '积水', '压迫', '突出', '钙化', '增粗', '模糊', '不张', '增厚']

// 高亮异常文字（返回ReactNode数组）
function highlightAnomalies(text: string | undefined): React.ReactNode {
  if (!text) return text
  const parts: React.ReactNode[] = []
  let lastIdx = 0
  const regex = new RegExp(`(${ANOMALY_KEYWORDS.join('|')})`, 'g')
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index))
    }
    parts.push(
      <span key={match.index} style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 700, borderRadius: 2, padding: '0 2px' }}>
        {match[0]}
      </span>
    )
    lastIdx = regex.lastIndex
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx))
  return parts.length > 0 ? parts : text
}

function genMockReports(): RadiologyReport[] {
  // 基于 initialRadiologyExams 生成完整报告数据
  const statuses: Array<RadiologyReport['status']> = ['待审核', '已审核', '已发布', '已修改', '已退回']
  const findings = [
    '右肺中叶见约1.2cm结节影，边缘毛糙。',
    '左侧额颞顶部硬膜下血肿，厚约8mm，中线右偏约5mm。',
    '肝右叶见约3.5cm低密度影，边界欠清，增强扫描呈不均匀强化。',
    'L4/5椎间盘向左后突出，神经根受压。',
    '冠脉左主干开口狭窄约85%，前降支近段狭窄约90%。',
    '左侧乳腺外上象限见约2.1cm肿块影，边缘毛刺状。',
    '颅内未见明显异常密度影，脑室系统正常，中线结构居中。',
    '双肺纹理增粗，右肺下叶见斑片状密度增高影。',
  ]
  const impressions = [
    '右肺中叶结节，建议随访。',
    '左侧额颞顶部硬膜下血肿。',
    '肝右叶占位，建议进一步检查。',
    'L4/5椎间盘突出。',
    '冠脉多支病变，狭窄严重。',
    '左侧乳腺肿块，BI-RADS 4C类。',
    '颅内CT平扫未见明显异常。',
    '右肺下叶炎症。',
  ]
  return initialRadiologyExams.map((exam, i) => ({
    id: `RAD-RPT${String(i+1).padStart(3,'0')}`,
    reportId: `RAD-RPT${String(i+1).padStart(3,'0')}`,
    examId: exam.id,
    accessionNumber: exam.accessionNumber,
    patientId: exam.patientId,
    patientName: exam.patientName,
    gender: exam.gender,
    age: exam.age,
    patientType: exam.patientType,
    examItemName: exam.examItemName,
    modality: exam.modality,
    bodyPart: exam.bodyPart,
    examDate: exam.examDate,
    deviceName: exam.deviceName,
    clinicalHistory: exam.clinicalHistory,
    examFindings: findings[i % findings.length],
    diagnosis: impressions[i % impressions.length],
    impression: impressions[i % impressions.length],
    recommendations: i % 2 === 0 ? '建议3个月后复查' : undefined,
    criticalFinding: [true, false, false, true, false, true, false, false][i % 8],
    criticalFindingDetails: [true, false, false, true, false, true, false, false][i % 8]
      ? findings[i % findings.length] : undefined,
    qualityScore: 78 + (i * 3) % 23,
    templateId: undefined,
    templateName: undefined,
    reportDoctorId: DOCTORS[i % DOCTORS.length].id,
    reportDoctorName: DOCTORS[i % DOCTORS.length].name,
    signedTime: '2026-05-01 10:00',
    reportVerificationCode: '123456',
    auditorId: i % 2 === 0 ? DOCTORS[(i+1) % DOCTORS.length].id : undefined,
    auditorName: i % 2 === 0 ? DOCTORS[(i+1) % DOCTORS.length].name : undefined,
    approvedTime: i % 2 === 0 ? '2026-05-01 11:30' : undefined,
    auditVerificationCode: i % 2 === 0 ? '654321' : undefined,
    auditSuggestion: i % 2 === 0 ? '报告书写规范，同意发布。' : undefined,
    status: statuses[i % statuses.length],
    isPreliminary: false,
    isAddendum: false,
    addendumReportId: undefined,
    publishedTime: i % 3 === 0 ? '2026-05-01 14:00' : undefined,
    publishedBy: i % 3 === 0 ? DOCTORS[(i+2) % DOCTORS.length].name : undefined,
    createdTime: exam.createdTime,
    updatedTime: exam.updatedTime,
  }))
}

// ============================================================
// 子组件：顶部筛选栏
// ============================================================
interface FilterBarProps {
  search: string
  setSearch: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  modalityFilter: string
  setModalityFilter: (v: string) => void
  reportDoctorFilter: string
  setReportDoctorFilter: (v: string) => void
  auditorFilter: string
  setAuditorFilter: (v: string) => void
  dateFrom: string
  setDateFrom: (v: string) => void
  dateTo: string
  setDateTo: (v: string) => void
  criticalOnly: boolean
  setCriticalOnly: (v: boolean) => void
  positiveOnly: boolean
  setPositiveOnly: (v: boolean) => void
  onReset: () => void
  onExport: () => void
  onPrint: () => void
}

function FilterBar({
  search, setSearch, statusFilter, setStatusFilter,
  modalityFilter, setModalityFilter,
  reportDoctorFilter, setReportDoctorFilter,
  auditorFilter, setAuditorFilter,
  dateFrom, setDateFrom, dateTo, setDateTo,
  criticalOnly, setCriticalOnly, positiveOnly, setPositiveOnly,
  onReset, onExport, onPrint
}: FilterBarProps) {
  const btnStyle = (active: boolean, color: string) => ({
    padding: '5px 12px', borderRadius: 6, border: `1px solid ${active ? color : '#e2e8f0'}`,
    background: active ? `${color}18` : WHITE, color: active ? color : GRAY,
    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  })

  const dropStyle = {
    padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: WHITE, color: '#334155', fontSize: 12, cursor: 'pointer', outline: 'none',
  }

  return (
    <div style={{
      background: WHITE, borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 14,
    }}>
      {/* 第一行：搜索 + 快捷筛选 */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        {/* 搜索框 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220,
          border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', background: '#fafbfc',
        }}>
          <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索患者姓名 / 检查号 / 报告ID / Accession号..."
            style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%', background: 'transparent' }}
          />
          {search && (
            <X size={13} style={{ color: '#94a3b8', cursor: 'pointer', flexShrink: 0 }}
              onClick={() => setSearch('')} />
          )}
        </div>

        {/* 设备类型 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: GRAY, fontWeight: 600, marginRight: 2 }}>设备:</span>
          {MODALITIES.map(m => (
            <button key={m} onClick={() => setModalityFilter(m)}
              style={btnStyle(modalityFilter === m, ACCENT)}>{m}</button>
          ))}
        </div>
      </div>

      {/* 第二行：状态 + 报告医生 + 审核医生 */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        {/* 报告状态 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: GRAY, fontWeight: 600, marginRight: 2 }}>状态:</span>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={btnStyle(statusFilter === s, PURPLE)}>{s}</button>
          ))}
        </div>

        {/* 分隔线 */}
        <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

        {/* 报告医生 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: GRAY, fontWeight: 600 }}>报告:</span>
          <select value={reportDoctorFilter} onChange={e => setReportDoctorFilter(e.target.value)}
            style={dropStyle}>
            <option value="">全部医生</option>
            {DOCTORS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        {/* 审核医生 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: GRAY, fontWeight: 600 }}>审核:</span>
          <select value={auditorFilter} onChange={e => setAuditorFilter(e.target.value)}
            style={dropStyle}>
            <option value="">全部审核</option>
            {DOCTORS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* 第三行：日期范围 + 特殊筛选 + 操作按钮 */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* 日期范围 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={13} style={{ color: GRAY }} />
          <span style={{ fontSize: 11, color: GRAY, fontWeight: 600 }}>日期:</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ ...dropStyle, width: 130 }} />
          <span style={{ color: GRAY, fontSize: 12 }}>至</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ ...dropStyle, width: 130 }} />
        </div>

        {/* 分隔线 */}
        <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

        {/* 危急值筛选 */}
        <button
          onClick={() => setCriticalOnly(!criticalOnly)}
          style={{
            ...btnStyle(criticalOnly, DANGER),
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px',
          }}>
          <Zap size={12} />
          危急值报告 {criticalOnly && <CheckCircle size={11} />}
        </button>

        {/* 阳性结果筛选 */}
        <button
          onClick={() => setPositiveOnly(!positiveOnly)}
          style={{
            ...btnStyle(positiveOnly, WARNING),
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px',
          }}>
          <AlertTriangle size={12} />
          阳性结果 {positiveOnly && <CheckCircle size={11} />}
        </button>

        {/* 右侧操作按钮 */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button onClick={onReset} style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
            background: WHITE, color: GRAY, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <RefreshCw size={12} /> 重置
          </button>
          <button onClick={onExport} style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
            background: WHITE, color: PRIMARY_LIGHT, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <Download size={12} /> 导出
          </button>
          <button onClick={onPrint} style={{
            padding: '6px 14px', borderRadius: 6, border: 'none',
            background: PRIMARY, color: WHITE, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <Printer size={12} /> 打印
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 子组件：统计卡片
// ============================================================
interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  sub?: string
  onClick?: () => void
}

function StatCard({ label, value, icon, color, sub, onClick }: StatCardProps) {
  return (
    <div onClick={onClick} style={{
      background: WHITE, borderRadius: 10, padding: '14px 18px',
      border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex', alignItems: 'center', gap: 14, cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s', flex: 1, minWidth: 160,
    }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(30,58,95,0.12)' }}
      onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: PRIMARY, lineHeight: 1, marginBottom: 3 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: GRAY, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ============================================================
// 子组件：列表视图
// ============================================================
interface ListViewProps {
  reports: RadiologyReport[]
  expandedId: string | null
  onToggleExpand: (id: string) => void
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onView: (r: RadiologyReport) => void
  onReview: (r: RadiologyReport) => void
  onPrint: (r: RadiologyReport) => void
  onReject: (r: RadiologyReport) => void
  onExportPDF: (r: RadiologyReport) => void
}

function ListView({
  reports, expandedId, onToggleExpand,
  selectedIds, onToggleSelect, onSelectAll, onDeselectAll,
  onView, onReview, onPrint, onReject, onExportPDF
}: ListViewProps) {
  const [sortField, setSortField] = useState<string>('createdTime')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = useMemo(() => {
    return [...reports].sort((a, b) => {
      let av: any = (a as any)[sortField]
      let bv: any = (b as any)[sortField]
      if (!av) return 1
      if (!bv) return -1
      if (sortDir === 'asc') return av > bv ? 1 : -1
      return av < bv ? 1 : -1
    })
  }, [reports, sortField, sortDir])

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: string }) => (
    sortField === field
      ? <span style={{ marginLeft: 3, color: PRIMARY }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
      : <span style={{ marginLeft: 3, color: '#cbd5e1' }}>↕</span>
  )

  const TH = ({ field, label }: { field: string; label: string }) => (
    <th
      onClick={() => handleSort(field)}
      style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569',
        fontSize: 11, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      {label}<SortIcon field={field} />
    </th>
  )

  const colStyle = { padding: '9px 12px', fontSize: 12, color: '#334155', verticalAlign: 'middle' as const }
  const monoStyle = { ...colStyle, fontFamily: 'monospace', color: GRAY }

  const actionBtn = (label: string, color: string, bg: string, onClick: () => void) => (
    <button onClick={onClick} style={{
      padding: '3px 8px', borderRadius: 4, border: 'none',
      background: bg, color, fontSize: 11, fontWeight: 600, cursor: 'pointer',
      whiteSpace: 'nowrap',
    }}>{label}</button>
  )

  return (
    <div style={{ background: WHITE, borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* 表头工具栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        borderBottom: '1px solid #f1f5f9', background: '#fafbfc',
      }}>
        <span style={{ fontSize: 12, color: GRAY, fontWeight: 600 }}>
          共 <span style={{ color: PRIMARY, fontWeight: 700 }}>{reports.length}</span> 条报告
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={onSelectAll} style={{
            padding: '4px 10px', borderRadius: 5, border: '1px solid #e2e8f0',
            background: WHITE, color: GRAY, fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>
            全选
          </button>
          <button onClick={onDeselectAll} style={{
            padding: '4px 10px', borderRadius: 5, border: '1px solid #e2e8f0',
            background: WHITE, color: GRAY, fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>
            取消
          </button>
          {selectedIds.size > 0 && (
            <span style={{
              padding: '4px 10px', borderRadius: 5, background: PRIMARY, color: WHITE,
              fontSize: 11, fontWeight: 700,
            }}>
              已选 {selectedIds.size} 项
            </span>
          )}
        </div>
      </div>

      {/* 表格 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1100 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ width: 40, padding: '10px 8px', ...colStyle }}>
                <input type="checkbox" checked={selectedIds.size === reports.length && reports.length > 0}
                  onChange={e => e.target.checked ? onSelectAll() : onDeselectAll()}
                  style={{ cursor: 'pointer', width: 14, height: 14 }} />
              </th>
              <TH field="reportId" label="报告ID" />
              <TH field="accessionNumber" label="Accession号" />
              <TH field="patientName" label="患者姓名" />
              <TH field="examItemName" label="检查项目" />
              <th style={{ ...colStyle, fontWeight: 600, color: '#475569', fontSize: 11 }}>设备</th>
              <TH field="reportDoctorName" label="报告医生" />
              <TH field="auditorName" label="审核医生" />
              <TH field="createdTime" label="书写时间" />
              <TH field="approvedTime" label="审核时间" />
              <th style={{ ...colStyle, fontWeight: 600, color: '#475569', fontSize: 11 }}>状态</th>
              <th style={{ ...colStyle, fontWeight: 600, color: '#475569', fontSize: 11 }}>质量</th>
              <th style={{ ...colStyle, fontWeight: 600, color: '#475569', fontSize: 11 }}>危急值</th>
              <th style={{ ...colStyle, fontWeight: 600, color: '#475569', fontSize: 11 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, idx) => {
              const cfg = STATUS_CONFIG[r.status] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' }
              const isExpanded = expandedId === r.id
              const isSelected = selectedIds.has(r.id)
              const hasCritical = r.criticalFinding
              const hasPositive = r.diagnosis && r.diagnosis !== '结论：未见明显异常。'
              return (
                <>
                  <tr key={r.id}
                    style={{
                      borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9',
                      background: isSelected ? '#eff6ff' : idx % 2 === 0 ? WHITE : '#fafbfc',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff' }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? WHITE : '#fafbfc' }}
                  >
                    <td style={{ ...colStyle, textAlign: 'center' }}>
                      <input type="checkbox" checked={isSelected}
                        onChange={() => onToggleSelect(r.id)}
                        style={{ cursor: 'pointer', width: 14, height: 14 }} />
                    </td>
                    {/* 报告ID */}
                    <td style={monoStyle}>{r.reportId}</td>
                    {/* Accession */}
                    <td style={{ ...monoStyle, fontSize: 11 }}>{r.accessionNumber}</td>
                    {/* 患者 */}
                    <td style={{ ...colStyle, minWidth: 120 }}>
                      <div style={{ fontWeight: 600, color: PRIMARY }}>{r.patientName}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                        {r.gender}/{r.age}岁/{r.patientType}
                      </div>
                    </td>
                    {/* 检查项目 */}
                    <td style={{ ...colStyle, minWidth: 140 }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{r.examItemName}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{r.modality} · {r.bodyPart}</div>
                    </td>
                    {/* 设备 */}
                    <td style={{ ...colStyle, fontSize: 11, color: GRAY }}>
                      {r.deviceName?.split('（')[0] || '-'}
                    </td>
                    {/* 报告医生 */}
                    <td style={colStyle}>
                      <div style={{ fontSize: 12, color: '#334155', fontWeight: 500 }}>{r.reportDoctorName || '-'}</div>
                      {r.signedTime && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>签: {formatDate(r.signedTime)}</div>}
                    </td>
                    {/* 审核医生 */}
                    <td style={colStyle}>
                      <div style={{ fontSize: 12, color: '#334155' }}>{r.auditorName || '-'}</div>
                      {r.approvedTime && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>审: {formatDate(r.approvedTime)}</div>}
                    </td>
                    {/* 书写时间 */}
                    <td style={{ ...colStyle, fontSize: 11, color: GRAY }}>{formatDate(r.createdTime)}</td>
                    {/* 审核时间 */}
                    <td style={{ ...colStyle, fontSize: 11, color: GRAY }}>{r.approvedTime ? formatDate(r.approvedTime) : '-'}</td>
                    {/* 状态 */}
                    <td style={colStyle}>
                      <span style={{
                        padding: '3px 9px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                        display: 'inline-block',
                      }}>{cfg.label}</span>
                    </td>
                    {/* 质量 */}
                    <td style={colStyle}>
                      {r.qualityScore ? (
                        <span style={{
                          padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                          background: r.qualityScore >= 90 ? '#d1fae5' : r.qualityScore >= 80 ? '#fef3c7' : '#fee2e2',
                          color: r.qualityScore >= 90 ? SUCCESS : r.qualityScore >= 80 ? WARNING : DANGER,
                        }}>{r.qualityScore}</span>
                      ) : <span style={{ color: '#cbd5e1', fontSize: 11 }}>-</span>}
                    </td>
                    {/* 危急值 */}
                    <td style={colStyle}>
                      {hasCritical ? (
                        <span style={{
                          padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                          background: '#fee2e2', color: DANGER, display: 'inline-flex', alignItems: 'center', gap: 3,
                        }}>
                          <Zap size={10} /> 危急
                        </span>
                      ) : hasPositive ? (
                        <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                          background: '#fef3c7', color: WARNING }}>阳性</span>
                      ) : <span style={{ color: '#cbd5e1', fontSize: 11 }}>-</span>}
                    </td>
                    {/* 操作 */}
                    <td style={{ ...colStyle, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button onClick={() => onView(r)} style={{
                          padding: '3px 7px', borderRadius: 4, border: 'none',
                          background: '#eff6ff', color: ACCENT, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 3,
                        }}><Eye size={11} />查看</button>
                        {r.status === '待审核' && (
                          <button onClick={() => onReview(r)} style={{
                            padding: '3px 7px', borderRadius: 4, border: 'none',
                            background: '#f5f3ff', color: PURPLE, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 3,
                          }}><CheckCircle2 size={11} />审核</button>
                        )}
                        {r.status === '已退回' && (
                          <button onClick={() => onView(r)} style={{
                            padding: '3px 7px', borderRadius: 4, border: 'none',
                            background: '#fef3c7', color: WARNING, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 3,
                          }}><Edit3 size={11} />修改</button>
                        )}
                        <button onClick={() => onPrint(r)} style={{
                          padding: '3px 7px', borderRadius: 4, border: 'none',
                          background: '#f0fdf4', color: SUCCESS, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 3,
                        }}><Printer size={11} /></button>
                        <button onClick={() => onExportPDF(r)} style={{
                          padding: '3px 7px', borderRadius: 4, border: 'none',
                          background: '#f9fafb', color: GRAY, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 3,
                        }}><Download size={11} /></button>
                      </div>
                    </td>
                  </tr>
                  {/* 展开行：报告摘要 */}
                  {isExpanded && (
                    <tr key={`${r.id}-expand`} style={{ background: '#f8faff', borderBottom: '1px solid #e2e8f0' }}>
                      <td colSpan={14} style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 280 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                              检查所见
                            </div>
                            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                              {highlightAnomalies(r.examFindings) || '(未填写)'}
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 280 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                              诊断意见
                            </div>
                            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontWeight: 600 }}>
                              {highlightAnomalies(r.diagnosis) || '(未填写)'}
                            </div>
                          </div>
                          {r.clinicalHistory && (
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                                临床病史
                              </div>
                              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{r.clinicalHistory}</div>
                            </div>
                          )}
                        </div>
                        {hasCritical && r.criticalFindingDetails && (
                          <div style={{
                            marginTop: 10, padding: '8px 12px', borderRadius: 6,
                            background: '#fff5f5', border: '1px solid #fed7d7',
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                          }}>
                            <Zap size={14} style={{ color: DANGER, flexShrink: 0, marginTop: 1 }} />
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: DANGER, marginBottom: 2 }}>危急值详情</div>
                              <div style={{ fontSize: 12, color: '#7f1d1d' }}>{r.criticalFindingDetails}</div>
                            </div>
                          </div>
                        )}
                        {r.auditSuggestion && (
                          <div style={{
                            marginTop: 8, padding: '7px 12px', borderRadius: 6,
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                          }}>
                            <MessageSquare size={13} style={{ color: SUCCESS, flexShrink: 0, marginTop: 1 }} />
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: SUCCESS, marginBottom: 2 }}>审核意见</div>
                              <div style={{ fontSize: 12, color: '#14532d' }}>{r.auditSuggestion}</div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {reports.length === 0 && (
              <tr>
                <td colSpan={14} style={{ textAlign: 'center', padding: '48px 0', color: GRAY }}>
                  <FileSearch size={40} style={{ margin: '0 auto 12px', color: '#cbd5e1', display: 'block' }} />
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>暂无报告</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>请调整筛选条件后重试</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// 子组件：看板视图
// ============================================================
interface KanbanViewProps {
  reports: RadiologyReport[]
  onView: (r: RadiologyReport) => void
  onReview: (r: RadiologyReport) => void
}

const KANBAN_COLUMNS = [
  { key: '待审核', label: '待审核', color: PURPLE, bg: '#f5f3ff', border: '#ddd6fe' },
  { key: '已审核', label: '已审核', color: ACCENT, bg: '#eff6ff', border: '#bfdbfe' },
  { key: '已发布', label: '已发布', color: SUCCESS, bg: '#f0fdf4', border: '#bbf7d0' },
]

function KanbanView({ reports, onView, onReview }: KanbanViewProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  const columns = useMemo(() => {
    return KANBAN_COLUMNS.map(col => ({
      ...col,
      items: reports.filter(r => r.status === col.key),
    }))
  }, [reports])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault()
    setDragOverCol(colKey)
  }
  const handleDragLeave = () => setDragOverCol(null)
  const handleDrop = (e: React.DragEvent, colKey: string) => {
    e.preventDefault()
    setDragOverCol(null)
    setDraggedId(null)
    // 模拟拖拽：实际应调用 onDragEnd(id, colKey)
  }
  const handleDragEnd = () => { setDraggedId(null); setDragOverCol(null) }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, minHeight: 400 }}>
      {columns.map(col => (
        <div key={col.key} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* 列头 */}
          <div style={{
            padding: '10px 14px', borderRadius: '10px 10px 0 0',
            background: col.bg, border: `1px solid ${col.border}`, borderBottom: 'none',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: col.color }}>{col.label}</span>
            <span style={{
              marginLeft: 'auto', padding: '1px 8px', borderRadius: 10,
              background: col.color, color: WHITE, fontSize: 11, fontWeight: 700,
            }}>{col.items.length}</span>
          </div>

          {/* 列体 */}
          <div
            onDragOver={e => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.key)}
            style={{
              flex: 1, minHeight: 300,
              padding: 10, borderRadius: '0 0 10px 10px',
              background: dragOverCol === col.key ? `${col.color}08` : '#fafbfc',
              border: `1px solid ${dragOverCol === col.key ? col.color : col.border}`,
              borderTop: 'none', transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            {col.items.map(r => (
              <div key={r.id}
                draggable
                onDragStart={e => handleDragStart(e, r.id)}
                onDragEnd={handleDragEnd}
                onClick={() => onView(r)}
                style={{
                  background: WHITE, borderRadius: 8,
                  border: draggedId === r.id ? `2px solid ${col.color}` : '1px solid #e2e8f0',
                  padding: '11px 13px', cursor: 'grab', transition: 'all 0.15s',
                  boxShadow: draggedId === r.id ? `0 4px 12px ${col.color}30` : '0 1px 3px rgba(0,0,0,0.06)',
                  opacity: draggedId === r.id && draggedId !== r.id ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (draggedId !== r.id) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { if (draggedId !== r.id) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                {/* 患者信息 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{r.patientName}</span>
                  {r.criticalFinding && (
                    <span style={{ padding: '1px 6px', borderRadius: 4, background: '#fee2e2', color: DANGER, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Zap size={9} />危急
                    </span>
                  )}
                </div>
                {/* 检查项目 */}
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 4, fontWeight: 500 }}>{r.examItemName}</div>
                {/* 设备类型 */}
                <div style={{ fontSize: 11, color: GRAY, marginBottom: 6 }}>{r.modality} · {r.bodyPart}</div>
                {/* 医生信息 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>报告: <span style={{ color: '#334155', fontWeight: 500 }}>{r.reportDoctorName || '-'}</span></div>
                    {r.auditorName && <div style={{ fontSize: 11, color: '#64748b' }}>审核: <span style={{ color: '#334155', fontWeight: 500 }}>{r.auditorName}</span></div>}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'right' }}>{formatDate(r.createdTime)}</div>
                </div>
                {/* 诊断摘要 */}
                <div style={{
                  marginTop: 7, padding: '5px 8px', borderRadius: 4,
                  background: '#f8fafc', fontSize: 11, color: '#475569',
                  whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: 48, overflow: 'hidden',
                }}>
                  {(r.diagnosis ? highlightAnomalies(r.diagnosis.slice(0, 50)) : '(无诊断)')}{r.diagnosis && r.diagnosis.length > 50 ? '…' : ''}
                </div>
                {/* 操作按钮 */}
                {r.status === '待审核' && (
                  <button onClick={e => { e.stopPropagation(); onReview(r) }} style={{
                    marginTop: 8, width: '100%', padding: '5px 0', borderRadius: 5, border: 'none',
                    background: col.color, color: WHITE, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    <CheckCircle2 size={11} /> 审核
                  </button>
                )}
              </div>
            ))}
            {col.items.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#cbd5e1', fontSize: 12 }}>
                <div style={{ marginBottom: 4 }}>暂无报告</div>
                <div style={{ fontSize: 11 }}>拖拽卡片至此处</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// 子组件：报告详情弹窗
// ============================================================
interface DetailModalProps {
  report: RadiologyReport | null
  onClose: () => void
  onReview: (r: RadiologyReport) => void
  onPrint: (r: RadiologyReport) => void
  onExportPDF: (r: RadiologyReport) => void
}

function DetailModal({ report, onClose, onReview, onPrint, onExportPDF }: DetailModalProps) {
  const [tab, setTab] = useState<'content' | 'history' | 'print'>('content')
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (report) {
      setTab('content')
      setShowHistory(false)
    }
  }, [report?.id])

  if (!report) return null

  const cfg = STATUS_CONFIG[report.status] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' }

  // 模拟历史版本
  const historyVersions = [
    { version: 'V2.1', time: '2026-05-01 14:30', doctor: '张海涛', changes: '修改诊断意见，补充建议。', content: '右肺中叶见约1.5cm结节影，边缘毛糙。' },
    { version: 'V2.0', time: '2026-05-01 11:30', doctor: '王秀峰', changes: '审核通过，稍作文字修改。', content: '右肺中叶见约1.2cm结节影，边缘毛糙。' },
    { version: 'V1.0', time: '2026-05-01 10:00', doctor: '张海涛', changes: '初稿书写。', content: '' },
  ]

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15,23,42,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: WHITE, borderRadius: 12, width: '100%', maxWidth: 880,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* 顶部标题栏 */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <FileText size={18} style={{ color: PRIMARY }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: PRIMARY }}>报告详情</div>
            <div style={{ fontSize: 11, color: GRAY, marginTop: 1 }}>
              {report.reportId} · {report.accessionNumber}
            </div>
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
          }}>{cfg.label}</span>
          <button onClick={onClose} style={{
            padding: 6, borderRadius: 6, border: '1px solid #e2e8f0',
            background: WHITE, cursor: 'pointer', color: GRAY,
            display: 'flex', alignItems: 'center',
          }}><X size={16} /></button>
        </div>

        {/* 患者/检查信息头部 */}
        <div style={{
          padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flexShrink: 0,
        }}>
          {[
            { icon: <User size={13} />, label: '患者', value: `${report.patientName} (${report.gender}/${report.age}岁/${report.patientType})` },
            { icon: <Stethoscope size={13} />, label: '检查', value: `${report.examItemName} (${report.modality})` },
            { icon: <Calendar size={13} />, label: '检查日期', value: report.examDate },
            { icon: <Activity size={13} />, label: '设备', value: report.deviceName?.split('（')[0] || '-' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
              <div style={{ color: GRAY, marginTop: 1 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 10, color: GRAY, fontWeight: 600, marginBottom: 1 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: PRIMARY, fontWeight: 600, lineHeight: 1.4 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 标签页切换 */}
        <div style={{
          display: 'flex', gap: 0, borderBottom: '1px solid #e2e8f0', padding: '0 20px', flexShrink: 0,
        }}>
          {[
            { key: 'content', label: '报告内容', icon: <FileText size={13} /> },
            { key: 'history', label: '历史版本', icon: <History size={13} /> },
            { key: 'print', label: '打印预览', icon: <Printer size={13} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{
              padding: '10px 16px', border: 'none', background: 'transparent',
              color: tab === t.key ? PRIMARY : GRAY, fontWeight: tab === t.key ? 700 : 500,
              fontSize: 13, cursor: 'pointer', borderBottom: `2px solid ${tab === t.key ? PRIMARY : 'transparent'}`,
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: -1,
            }}>{t.icon}{t.label}</button>
          ))}
        </div>

        {/* 标签页内容 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {tab === 'content' && (
            <div>
              {/* 危急值提示 */}
              {report.criticalFinding && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, background: '#fff5f5', border: '1px solid #fed7d7',
                  marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <Zap size={16} style={{ color: DANGER, flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: DANGER, marginBottom: 3 }}>⚠ 危急值报告</div>
                    <div style={{ fontSize: 12, color: '#7f1d1d' }}>{report.criticalFindingDetails || report.diagnosis}</div>
                  </div>
                </div>
              )}

              {/* 报告内容 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* 检查所见 */}
                <div style={{
                  background: '#fafbfc', borderRadius: 8, padding: '14px 16px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    检查所见
                  </div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {highlightAnomalies(report.examFindings) || '(未填写)'}
                  </div>
                </div>
                {/* 诊断意见 */}
                <div style={{
                  background: '#fafbfc', borderRadius: 8, padding: '14px 16px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    诊断意见
                  </div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontWeight: 600 }}>
                    {highlightAnomalies(report.diagnosis) || '(未填写)'}
                  </div>
                  {report.impression && report.impression !== report.diagnosis && (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, marginTop: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                        印象
                      </div>
                      <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                        {highlightAnomalies(report.impression)}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 补充信息 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: '临床病史', value: report.clinicalHistory },
                  { label: '比较参考', value: report.comparisonWithPrior },
                  { label: '建议', value: report.recommendations },
                ].filter(s => s.value).map(s => (
                  <div key={s.label} style={{
                    background: '#fafbfc', borderRadius: 8, padding: '10px 14px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: GRAY, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* 报告签名信息 */}
              <div style={{
                background: '#f0fdf4', borderRadius: 8, padding: '12px 16px',
                border: '1px solid #bbf7d0', marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: SUCCESS, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ShieldCheck size={13} /> 报告签名信息
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: GRAY, marginBottom: 2 }}>报告医生</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{report.reportDoctorName || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: GRAY, marginBottom: 2 }}>签名时间</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>{report.signedTime ? formatDateFull(report.signedTime) : '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: GRAY, marginBottom: 2 }}>审核医生</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{report.auditorName || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: GRAY, marginBottom: 2 }}>审核时间</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>{report.approvedTime ? formatDateFull(report.approvedTime) : '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: GRAY, marginBottom: 2 }}>质量评分</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>{report.qualityScore ? `${report.qualityScore}分` : '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: GRAY, marginBottom: 2 }}>发布人</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>{report.publishedBy || '-'}</div>
                  </div>
                </div>
                {report.auditSuggestion && (
                  <div style={{ marginTop: 8, padding: '7px 10px', background: WHITE, borderRadius: 5, border: '1px solid #d1fae5' }}>
                    <div style={{ fontSize: 10, color: GRAY, marginBottom: 2 }}>审核意见</div>
                    <div style={{ fontSize: 12, color: '#14532d' }}>{report.auditSuggestion}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <History size={15} style={{ color: PRIMARY }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>报告历史版本</span>
                <span style={{ fontSize: 11, color: GRAY }}>共 {historyVersions.length} 个版本</span>
              </div>
              <div style={{ position: 'relative' }}>
                {/* 时间线 */}
                <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: '#e2e8f0' }} />
                {historyVersions.map((v, i) => (
                  <div key={v.version} style={{ display: 'flex', gap: 16, marginBottom: 24, position: 'relative' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: i === 0 ? PRIMARY : '#e2e8f0',
                      border: `2px solid ${i === 0 ? PRIMARY : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: WHITE, fontSize: 11, fontWeight: 700, flexShrink: 0, zIndex: 1,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, background: '#fafbfc', borderRadius: 8, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{v.version}</span>
                        <span style={{ fontSize: 11, color: GRAY, marginLeft: 'auto' }}>{v.time}</span>
                        <span style={{ fontSize: 11, color: GRAY }}>by {v.doctor}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: v.content ? 6 : 0 }}>
                        <span style={{ fontWeight: 600, color: '#475569' }}>变更内容:</span> {v.changes}
                      </div>
                      {v.content && (
                        <div style={{ padding: '6px 10px', background: WHITE, borderRadius: 5, fontSize: 12, color: '#475569', border: '1px solid #f1f5f9' }}>
                          {v.content}
                        </div>
                      )}
                      {i === 1 && showHistory && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <SplitSquareHorizontal size={12} style={{ color: ACCENT }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>V2.1 vs V2.0 差异对比</span>
                          </div>
                          <div style={{ padding: '8px 12px', background: '#fffbeb', borderRadius: 6, border: '1px solid #fde68a', fontSize: 12, color: '#78350f', lineHeight: 1.7 }}>
                            <div><span style={{ fontWeight: 700, textDecoration: 'line-through', color: '#dc2626' }}>- 右肺中叶见约1.2cm结节影，边缘毛糙。</span></div>
                            <div><span style={{ fontWeight: 700, color: SUCCESS }}>+ 右肺中叶见约1.5cm结节影，边缘毛糙。</span></div>
                            <div style={{ marginTop: 4 }}>+ 建议3个月后复查胸部CT。</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {historyVersions.length > 1 && (
                <button onClick={() => setShowHistory(!showHistory)} style={{
                  marginLeft: 48, padding: '6px 14px', borderRadius: 6, border: `1px solid ${ACCENT}`,
                  background: showHistory ? '#eff6ff' : WHITE, color: ACCENT, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <ArrowLeftRight size={12} />
                  {showHistory ? '隐藏版本对比' : '对比两个版本'}
                </button>
              )}
            </div>
          )}

          {tab === 'print' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Printer size={15} style={{ color: PRIMARY }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>打印预览</span>
                <button onClick={() => window.print()} style={{
                  marginLeft: 'auto', padding: '6px 14px', borderRadius: 6, border: 'none',
                  background: PRIMARY, color: WHITE, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}><Printer size={12} /> 立即打印</button>
              </div>
              {/* 打印预览纸张 */}
              <div style={{
                background: WHITE, border: '1px solid #d1d5db',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)', borderRadius: 4,
                padding: '40px 48px', maxWidth: 680, margin: '0 auto',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}>
                {/* 打印头部 */}
                <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: '2px solid #1e3a5f', paddingBottom: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY, letterSpacing: 2, marginBottom: 4 }}>
                    汉东省人民医院
                  </div>
                  <div style={{ fontSize: 13, color: GRAY, marginBottom: 2 }}>放射科医学影像诊断报告</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>REPORT NO: {report.reportId}</div>
                </div>
                {/* 患者信息 */}
                <div style={{ marginBottom: 16 }}>
                  <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                    <tbody>
                      {[
                        ['姓名', report.patientName], ['性别/年龄', `${report.gender} / ${report.age}岁`],
                        ['检查类型', `${report.patientType}患者`], ['检查日期', report.examDate],
                        ['检查项目', report.examItemName], ['设备', report.deviceName?.split('（')[0] || '-'],
                        ['检查号', report.accessionNumber],
                      ].map(([label, value], i) => (
                        <tr key={label} style={{ background: i % 2 === 0 ? '#f9fafb' : WHITE }}>
                          <td style={{ padding: '5px 8px', fontWeight: 600, color: PRIMARY, width: '22%', border: '1px solid #e5e7eb' }}>{label}</td>
                          <td style={{ padding: '5px 8px', color: '#374151', border: '1px solid #e5e7eb' }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* 临床病史 */}
                {report.clinicalHistory && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 4, borderLeft: '3px solid #1e3a5f', paddingLeft: 8 }}>临床病史</div>
                    <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}>{report.clinicalHistory}</div>
                  </div>
                )}
                {/* 检查所见 */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 4, borderLeft: '3px solid #1e3a5f', paddingLeft: 8 }}>检查所见</div>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap', padding: '8px 12px', background: '#f9fafb', borderRadius: 4, border: '1px solid #e5e7eb' }}>
                    {report.examFindings || '(未填写)'}
                  </div>
                </div>
                {/* 诊断意见 */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 4, borderLeft: '3px solid #1e3a5f', paddingLeft: 8 }}>诊断意见</div>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.8, fontWeight: 700, padding: '8px 12px', background: report.criticalFinding ? '#fff5f5' : '#f0fdf4', borderRadius: 4, border: `1px solid ${report.criticalFinding ? '#fca5a5' : '#bbf7d0'}` }}>
                    {report.diagnosis || '(未填写)'}
                  </div>
                </div>
                {report.recommendations && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 4, borderLeft: '3px solid #1e3a5f', paddingLeft: 8 }}>建议</div>
                    <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}>{report.recommendations}</div>
                  </div>
                )}
                {/* 签名 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 24, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: GRAY, marginBottom: 4 }}>报告医师</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: PRIMARY, padding: '4px 0', borderBottom: '1px solid #1e3a5f' }}>{report.reportDoctorName || ''}</div>
                    <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>{report.signedTime ? formatDateFull(report.signedTime) : ''}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: GRAY, marginBottom: 4 }}>审核医师</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: PRIMARY, padding: '4px 0', borderBottom: '1px solid #1e3a5f' }}>{report.auditorName || ''}</div>
                    <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>{report.approvedTime ? formatDateFull(report.approvedTime) : ''}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: GRAY, marginBottom: 4 }}>报告日期</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: PRIMARY, padding: '4px 0', borderBottom: '1px solid #1e3a5f' }}>{report.examDate}</div>
                    <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>{report.modality} · {report.bodyPart}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #e2e8f0',
          display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0, background: '#fafbfc',
        }}>
          <button onClick={() => onExportPDF(report)} style={{
            padding: '7px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
            background: WHITE, color: GRAY, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}><Download size={13} /> 导出PDF</button>
          <button onClick={() => onPrint(report)} style={{
            padding: '7px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
            background: WHITE, color: ACCENT, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}><Printer size={13} /> 打印</button>
          {report.status === '待审核' && (
            <button onClick={() => { onClose(); onReview(report) }} style={{
              padding: '7px 16px', borderRadius: 6, border: 'none',
              background: PURPLE, color: WHITE, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}><CheckCircle2 size={13} /> 立即审核</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 子组件：审核弹窗
// ============================================================
interface ReviewModalProps {
  report: RadiologyReport | null
  onClose: () => void
  onSubmit: (reportId: string, result: 'approved' | 'rejected', suggestion: string, password: string) => void
}

function ReviewModal({ report, onClose, onSubmit }: ReviewModalProps) {
  const [result, setResult] = useState<'approved' | 'rejected'>('approved')
  const [suggestion, setSuggestion] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (report) {
      setResult('approved')
      setSuggestion('')
      setPassword('')
      setError('')
      setSubmitting(false)
    }
  }, [report?.id])

  if (!report) return null

  const handleSubmit = async () => {
    if (!password || password.length < 4) {
      setError('请输入正确的电子签名密码（至少4位）')
      return
    }
    setError('')
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    onSubmit(report.id, result, suggestion, password)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15,23,42,0.5)', zIndex: 1100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: WHITE, borderRadius: 12, width: '100%', maxWidth: 520,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        {/* 顶部 */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: '#f5f3ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={20} style={{ color: PURPLE }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: PRIMARY }}>报告审核</div>
            <div style={{ fontSize: 11, color: GRAY, marginTop: 1 }}>{report.reportId} · {report.patientName}</div>
          </div>
          <button onClick={onClose} style={{
            marginLeft: 'auto', padding: 6, borderRadius: 6, border: '1px solid #e2e8f0',
            background: WHITE, cursor: 'pointer', color: GRAY, display: 'flex',
          }}><X size={15} /></button>
        </div>

        {/* 内容 */}
        <div style={{ padding: 20 }}>
          {/* 报告摘要 */}
          <div style={{
            background: '#fafbfc', borderRadius: 8, padding: '12px 14px',
            border: '1px solid #e2e8f0', marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, marginBottom: 6 }}>报告摘要</div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600 }}>{report.examItemName}</span> ({report.modality} · {report.bodyPart})
              <span style={{ color: GRAY, marginLeft: 8 }}>by {report.reportDoctorName}</span>
            </div>
            <div style={{ fontSize: 12, color: '#374151', marginTop: 5, lineHeight: 1.6 }}>
              {report.diagnosis || report.examFindings?.slice(0, 100) || '(无内容)'}
            </div>
            {report.criticalFinding && (
              <div style={{ marginTop: 8, padding: '5px 10px', background: '#fff5f5', borderRadius: 4, border: '1px solid #fed7d7', fontSize: 11, color: DANGER, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={11} /> 含危急值: {report.criticalFindingDetails?.slice(0, 60) || report.diagnosis}
              </div>
            )}
          </div>

          {/* 审核结论 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 8 }}>审核结论 <span style={{ color: DANGER }}>*</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'approved', label: '✓ 通过发布', color: SUCCESS, bg: '#d1fae5', border: '#6ee7b7', icon: <CheckCircle2 size={15} /> },
                { key: 'rejected', label: '✗ 退回修改', color: DANGER, bg: '#fee2e2', border: '#fca5a5', icon: <RotateCcw size={15} /> },
              ].map(opt => (
                <button key={opt.key} onClick={() => setResult(opt.key as any)} style={{
                  padding: '12px 16px', borderRadius: 8,
                  border: `2px solid ${result === opt.key ? opt.color : '#e2e8f0'}`,
                  background: result === opt.key ? opt.bg : WHITE,
                  color: result === opt.key ? opt.color : GRAY,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'all 0.15s',
                }}>
                  {opt.icon}{opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 审核意见 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 8 }}>
              审核意见 {result === 'approved' && <span style={{ color: '#94a3b8', fontWeight: 400 }}>（可选）</span>}
              {result === 'rejected' && <span style={{ color: DANGER }}>*</span>}
            </div>
            <textarea
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
              placeholder={result === 'approved'
                ? '可填写审核建议或修改备注（选填）'
                : '请详细说明退回原因，以便报告医生修改...'}
              rows={3}
              style={{
                width: '100%', border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '10px 12px', fontSize: 13, color: '#334155', resize: 'vertical',
                outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.border = `1px solid ${ACCENT}`}
              onBlur={e => e.target.style.border = '1px solid #e2e8f0'}
            />
          </div>

          {/* 电子签名 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 8 }}>
              电子签名验证 <span style={{ color: DANGER }}>*</span>
            </div>
            <div style={{
              padding: '14px 16px', background: '#f8fafc', borderRadius: 8,
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={13} style={{ color: SUCCESS }} />
                审核医师: <span style={{ fontWeight: 700, color: PRIMARY }}>{report.auditorName || '王秀峰'}</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="请输入您的电子签名密码确认审核..."
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 6,
                  border: error ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                  fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  background: WHITE, color: '#1e3a5f',
                }}
                onFocus={e => { if (!error) e.target.style.border = `1px solid ${ACCENT}` }}
                onBlur={e => { if (!error) e.target.style.border = '1px solid #e2e8f0' }}
              />
              {error && (
                <div style={{ fontSize: 11, color: DANGER, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <XCircle size={11} /> {error}
                </div>
              )}
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                审核时间将自动记录: <span style={{ color: PRIMARY, fontWeight: 600 }}>{new Date().toLocaleString('zh-CN')}</span>
              </div>
            </div>
          </div>

          {/* 提示 */}
          <div style={{
            padding: '8px 12px', background: '#eff6ff', borderRadius: 6,
            border: '1px solid #bfdbfe', fontSize: 11, color: ACCENT,
            marginBottom: 16, lineHeight: 1.6,
          }}>
            💡 审核提交后，报告状态将更新为「{result === 'approved' ? '已审核' : '已退回'}」，审核记录将被永久保存。
          </div>
        </div>

        {/* 底部 */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #e2e8f0',
          display: 'flex', gap: 8, justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0',
            background: WHITE, color: GRAY, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>取消</button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '8px 20px', borderRadius: 6, border: 'none',
              background: result === 'approved' ? SUCCESS : DANGER, color: WHITE,
              fontSize: 13, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: submitting ? 0.7 : 1,
            }}>
            {submitting ? (
              <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> 提交中...</>
            ) : (
              <>{result === 'approved' ? <CheckCircle2 size={13} /> : <RotateCcw size={13} />} 确认{result === 'approved' ? '通过' : '退回'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 主组件
// ============================================================
export default function ReportPage() {
  const allReports = useMemo(() => genMockReports(), [])

  // 筛选状态
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [modalityFilter, setModalityFilter] = useState('全部')
  const [reportDoctorFilter, setReportDoctorFilter] = useState('')
  const [auditorFilter, setAuditorFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [positiveOnly, setPositiveOnly] = useState(false)

  // 视图状态
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // 工具栏状态
  const [voiceRecording, setVoiceRecording] = useState(false)
  const [aiFilling, setAiFilling] = useState(false)
  const [aiagreement, setAiagreement] = useState(0)

  // 实时计算报告质量均分
  const avgQuality = useMemo(() => {
    if (filteredReports.length === 0) return 0
    const total = filteredReports.reduce((sum, r) => sum + (r.qualityScore || 0), 0)
    return Math.round(total / filteredReports.length)
  }, [filteredReports, aiagreement])

  // 实时计算危急值数量
  const criticalCount = filteredReports.filter(r => r.criticalFinding).length

  // 键盘快捷键 F2=语音录入 F5=AI填充
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        const isRecording = (window as any).__voiceRecording
        if (isRecording) {
          ;(window as any).__voiceRecording = false
          setVoiceRecording(false)
        } else {
          ;(window as any).__voiceRecording = true
          setVoiceRecording(true)
          setTimeout(() => {
            ;(window as any).__voiceRecording = false
            setVoiceRecording(false)
          }, 3000)
        }
      }
      if (e.key === 'F5') {
        e.preventDefault()
        if (!aiFilling) {
          setAiFilling(true)
          setTimeout(() => {
            setAiFilling(false)
            setAiagreement(prev => prev + 1)
          }, 2000)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [aiFilling])

  // 弹窗状态
  const [detailReport, setDetailReport] = useState<RadiologyReport | null>(null)
  const [reviewReport, setReviewReport] = useState<RadiologyReport | null>(null)

  // 统计数据（基于全部报告）
  const stats = useMemo(() => {
    const todayReports = allReports.filter(r => isToday(r.createdTime))
    return {
      todayTotal: todayReports.length,
      pendingReview: allReports.filter(r => r.status === '待审核').length,
      criticalCount: allReports.filter(r => r.criticalFinding).length,
      positiveCount: allReports.filter(r => r.diagnosis && r.diagnosis !== '结论：未见明显异常。').length,
    }
  }, [allReports])

  // 筛选后的报告
  const filteredReports = useMemo(() => {
    return allReports.filter(r => {
      // 搜索
      if (search) {
        const q = search.toLowerCase()
        const match = r.patientName.toLowerCase().includes(q)
          || r.reportId.toLowerCase().includes(q)
          || r.examItemName.toLowerCase().includes(q)
          || r.accessionNumber.toLowerCase().includes(q)
        if (!match) return false
      }
      // 状态
      if (statusFilter !== '全部' && r.status !== statusFilter) return false
      // 设备
      if (modalityFilter !== '全部' && r.modality !== modalityFilter) return false
      // 报告医生
      if (reportDoctorFilter && r.reportDoctorName !== reportDoctorFilter) return false
      // 审核医生
      if (auditorFilter && r.auditorName !== auditorFilter) return false
      // 日期范围
      if (dateFrom && r.createdTime < dateFrom) return false
      if (dateTo && r.createdTime > dateTo + ' 23:59') return false
      // 危急值
      if (criticalOnly && !r.criticalFinding) return false
      // 阳性
      if (positiveOnly && (!r.diagnosis || r.diagnosis === '结论：未见明显异常。')) return false
      return true
    })
  }, [allReports, search, statusFilter, modalityFilter, reportDoctorFilter, auditorFilter, dateFrom, dateTo, criticalOnly, positiveOnly])

  // 统计当前筛选结果的子统计
  const filteredStats = useMemo(() => ({
    critical: filteredReports.filter(r => r.criticalFinding).length,
    pending: filteredReports.filter(r => r.status === '待审核').length,
    published: filteredReports.filter(r => r.status === '已发布').length,
  }), [filteredReports])

  const handleReset = () => {
    setSearch('')
    setStatusFilter('全部')
    setModalityFilter('全部')
    setReportDoctorFilter('')
    setAuditorFilter('')
    setDateFrom('')
    setDateTo('')
    setCriticalOnly(false)
    setPositiveOnly(false)
  }

  const handleExport = () => {
    alert(`正在导出 ${filteredReports.length} 份报告...（模拟）`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredReports.map(r => r.id)))
  }, [filteredReports])

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleReviewSubmit = (reportId: string, result: 'approved' | 'rejected', suggestion: string, password: string) => {
    // 实际项目中这里应该调用API
    setReviewReport(null)
    alert(`审核完成: ${reportId} → ${result === 'approved' ? '已审核' : '已退回'}\n意见: ${suggestion || '(无)'}`)
  }

  return (
    <div style={{ padding: '0 0 40px', minHeight: '100vh', background: BG }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }
        @keyframes criticalPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); } 50% { box-shadow: 0 0 0 6px rgba(220,38,38,0); } }
        @media print { body * { visibility: hidden; } }
      `}</style>

      {/* 顶部标题区 */}
      <div style={{
        background: PRIMARY, padding: '20px 28px', marginBottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: WHITE, margin: '0 0 3px' }}>
            📋 放射报告管理
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            报告书写 · 审核发布 · 危急值通知 · 历史追溯
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              if (selectedIds.size > 0) {
                const sel = allReports.find(r => selectedIds.has(r.id) && r.status === '待审核')
                if (sel) setReviewReport(sel)
                else alert('请先选择待审核状态的报告')
              } else {
                alert('请先在列表中选择报告')
              }
            }}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)', color: WHITE, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
            <CheckCircle2 size={14} /> 批量审核
          </button>
          <button style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: 'rgba(255,255,255,0.15)', color: WHITE, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }} onClick={() => alert('新建报告功能开发中')}>
            <Plus size={14} /> 新建报告
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 24px' }}>
        {/* 统计卡片行 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
          <StatCard
            label="今日报告总数"
            value={stats.todayTotal}
            icon={<FileText size={20} />}
            color={ACCENT}
            sub={`筛选结果: ${filteredReports.length} 份`}
          />
          <StatCard
            label="待审核报告"
            value={stats.pendingReview}
            icon={<Clock size={20} />}
            color={PURPLE}
            sub={`占总数 ${stats.pendingReview > 0 ? Math.round(stats.pendingReview / allReports.length * 100) : 0}%`}
          />
          <StatCard
            label="危急值报告"
            value={stats.criticalCount}
            icon={<Zap size={20} />}
            color={DANGER}
            sub={`含阳性 ${filteredStats.critical} 例`}
          />
          <StatCard
            label="阳性结果"
            value={stats.positiveCount}
            icon={<AlertTriangle size={20} />}
            color={WARNING}
            sub={`阳性率 ${Math.round(stats.positiveCount / allReports.length * 100)}%`}
          />
        </div>

        {/* 筛选栏 */}
        <FilterBar
          search={search} setSearch={setSearch}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          modalityFilter={modalityFilter} setModalityFilter={setModalityFilter}
          reportDoctorFilter={reportDoctorFilter} setReportDoctorFilter={setReportDoctorFilter}
          auditorFilter={auditorFilter} setAuditorFilter={setAuditorFilter}
          dateFrom={dateFrom} setDateFrom={setDateFrom}
          dateTo={dateTo} setDateTo={setDateTo}
          criticalOnly={criticalOnly} setCriticalOnly={setCriticalOnly}
          positiveOnly={positiveOnly} setPositiveOnly={setPositiveOnly}
          onReset={handleReset} onExport={handleExport} onPrint={handlePrint}
        />

        {/* 视图切换 + 批量操作 */}
        <div style={{
          background: WHITE, borderRadius: 10, padding: '10px 14px',
          border: '1px solid #e2e8f0', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          {/* 视图切换 */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 7, padding: 3 }}>
            {[
              { key: 'list', label: '列表视图', icon: <List size={14} /> },
              { key: 'kanban', label: '看板视图', icon: <LayoutGrid size={14} /> },
            ].map(v => (
              <button key={v.key} onClick={() => setViewMode(v.key as any)} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: viewMode === v.key ? WHITE : 'transparent',
                color: viewMode === v.key ? PRIMARY : GRAY,
                fontSize: 12, fontWeight: viewMode === v.key ? 700 : 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                boxShadow: viewMode === v.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>{v.icon}{v.label}</button>
            ))}
          </div>

          {/* 工具栏：语音录入 F2 | AI填充 F5 | 质量评分徽章 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8, paddingLeft: 12, borderLeft: '1px solid #e2e8f0' }}>
            {/* 语音录入 F2 */}
            <button
              onClick={() => {
                const isRecording = (window as any).__voiceRecording
                if (isRecording) {
                  ;(window as any).__voiceRecording = false
                  setVoiceRecording(false)
                } else {
                  ;(window as any).__voiceRecording = true
                  setVoiceRecording(true)
                  setTimeout(() => {
                    ;(window as any).__voiceRecording = false
                    setVoiceRecording(false)
                  }, 3000)
                }
              }}
              style={{
                padding: '5px 10px', borderRadius: 6, border: `1px solid ${voiceRecording ? '#dc2626' : '#e2e8f0'}`,
                background: voiceRecording ? '#fee2e2' : WHITE, color: voiceRecording ? '#dc2626' : '#64748b',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.15s', position: 'relative',
              }}>
              <Mic size={13} style={{ color: voiceRecording ? '#dc2626' : '#64748b' }} />
              <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '1px 4px', borderRadius: 3, fontSize: 10, color: '#94a3b8' }}>F2</span>
              <span>语音录入</span>
              {voiceRecording && (
                <span style={{ position: 'absolute', top: -6, right: -6, width: 10, height: 10, borderRadius: '50%', background: '#dc2626', animation: 'pulse 1s infinite' }} />
              )}
            </button>

            {/* AI填充 F5 */}
            <button
              onClick={() => {
                setAiFilling(true)
                setTimeout(() => {
                  setAiFilling(false)
                  setAiagreement(prev => prev + 1)
                }, 2000)
              }}
              style={{
                padding: '5px 10px', borderRadius: 6, border: `1px solid ${aiFilling ? '#7c3aed' : '#e2e8f0'}`,
                background: aiFilling ? '#f5f3ff' : WHITE, color: aiFilling ? '#7c3aed' : '#64748b',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.15s',
              }}>
              <Sparkles size={13} style={{ color: aiFilling ? '#7c3aed' : '#64748b' }} />
              <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '1px 4px', borderRadius: 3, fontSize: 10, color: '#94a3b8' }}>F5</span>
              <span>{aiFilling ? 'AI填充中...' : 'AI填充'}</span>
            </button>

            {/* 报告质量评分徽章 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 6,
              background: '#f8fafc', border: '1px solid #e2e8f0',
            }}>
              <BarChart3 size={13} style={{ color: '#64748b' }} />
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>质量</span>
              <span style={{
                padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 800,
                background: avgQuality >= 90 ? '#d1fae5' : avgQuality >= 80 ? '#fef3c7' : '#fee2e2',
                color: avgQuality >= 90 ? '#047857' : avgQuality >= 80 ? '#b45309' : '#dc2626',
              }}>
                {avgQuality}
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>/100</span>
            </div>

            {/* 危急值红色警告徽章 */}
            {criticalCount > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 6,
                background: '#fff5f5', border: '1px solid #fed7d7',
                animation: 'criticalPulse 2s infinite',
              }}>
                <AlertOctagon size={13} style={{ color: '#dc2626' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>
                  ⚠ 危急值 {criticalCount} 例
                </span>
              </div>
            )}
          </div>

          {/* 快速状态统计 */}
          <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
            {[
              { label: '全部', count: filteredReports.length, color: GRAY },
              { label: '待审核', count: filteredStats.pending, color: PURPLE },
              { label: '已审核', count: filteredReports.filter(r => r.status === '已审核').length, color: ACCENT },
              { label: '已发布', count: filteredStats.published, color: SUCCESS },
            ].map(s => (
              <div key={s.label} style={{
                padding: '3px 10px', borderRadius: 6, background: `${s.color}12`,
                border: `1px solid ${s.color}30`,
              }}>
                <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}: </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {selectedIds.size > 0 && (
              <>
                <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>
                  已选 {selectedIds.size} 份报告
                </span>
                <button
                  onClick={() => {
                    const toPrint = allReports.filter(r => selectedIds.has(r.id))
                    toPrint.forEach(r => { setDetailReport(r); setTimeout(() => window.print(), 100) })
                  }}
                  style={{
                    padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                    background: WHITE, color: GRAY, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                  <Printer size={12} /> 批量打印
                </button>
                <button
                  onClick={() => {
                    alert(`正在导出 ${selectedIds.size} 份报告 PDF...`)
                  }}
                  style={{
                    padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                    background: WHITE, color: GRAY, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                  <Download size={12} /> 批量导出
                </button>
              </>
            )}
          </div>
        </div>

        {/* 主体：列表视图 或 看板视图 */}
        {viewMode === 'list' ? (
          <ListView
            reports={filteredReports}
            expandedId={expandedId}
            onToggleExpand={id => setExpandedId(prev => prev === id ? null : id)}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onView={r => setDetailReport(r)}
            onReview={r => setReviewReport(r)}
            onPrint={r => { setDetailReport(r); setTimeout(() => {}, 100) }}
            onReject={r => { setDetailReport(r) }}
            onExportPDF={r => { alert(`导出PDF: ${r.reportId}`) }}
          />
        ) : (
          <KanbanView
            reports={filteredReports}
            onView={r => setDetailReport(r)}
            onReview={r => setReviewReport(r)}
          />
        )}
      </div>

      {/* 报告详情弹窗 */}
      {detailReport && (
        <DetailModal
          report={detailReport}
          onClose={() => setDetailReport(null)}
          onReview={r => { setDetailReport(null); setReviewReport(r) }}
          onPrint={r => {
            setDetailReport(null)
            setTimeout(() => window.print(), 100)
          }}
          onExportPDF={r => alert(`导出PDF: ${r.reportId}`)}
        />
      )}

      {/* 审核弹窗 */}
      {reviewReport && (
        <ReviewModal
          report={reviewReport}
          onClose={() => setReviewReport(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}
