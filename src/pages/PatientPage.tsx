// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 患者管理 v1.0.0
// 完整患者信息管理：列表/详情/新建编辑/数据分析
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, User, Phone, AlertCircle, Calendar, Plus, X, ChevronLeft, ChevronRight,
  Eye, Edit2, FileText, BarChart2, Download, RefreshCw, Filter, ChevronDown, ChevronUp,
  Users, UserCheck, Clock, Activity, Heart, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, PieChart, FilterX, Save, ArrowLeft, Stethoscope, Shield, MapPin,
  Contact, CreditCard, History, Image, PlusCircle, Trash2, UserPlus
} from 'lucide-react'
import { initialPatients, initialRadiologyExams } from '../data/initialData'
import type { Patient } from '../types'

// ==================== 类型定义 ====================
type TabKey = 'list' | 'detail' | 'form' | 'analytics'
type GenderFilter = '全部' | '男' | '女'
type PatientTypeFilter = '全部' | '门诊' | '住院' | '体检' | '急诊'

interface AdvancedFilters {
  gender: GenderFilter
  ageMin: string
  ageMax: string
  patientType: PatientTypeFilter
  dateFrom: string
  dateTo: string
  modality: string
}

interface PatientFormData {
  name: string
  gender: GenderFilter
  age: string
  idCard: string
  phone: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  patientType: PatientTypeFilter
  insuranceType: string
  allergyHistory: string
  medicalHistory: string
  bedNumber: string
  attendingDoctor: string
}

// ==================== 工具函数 ====================
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr
}

const getAgeFromIdCard = (idCard: string): number => {
  if (!idCard || idCard.length < 6) return 0
  const birthYear = parseInt(idCard.substring(0, 4))
  const currentYear = new Date().getFullYear()
  return currentYear - birthYear
}

const getBirthDateFromIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 14) return '-'
  return `${idCard.substring(0, 4)}-${idCard.substring(4, 6)}-${idCard.substring(6, 8)}`
}

const getPatientExams = (patientId: string, exams: typeof initialRadiologyExams) => {
  return exams.filter(e => e.patientId === patientId)
}

const getPatientStats = (patientId: string, exams: typeof initialRadiologyExams) => {
  const patientExams = getPatientExams(patientId, exams)
  const completedExams = patientExams.filter(e => e.status === '已完成' || e.status === '待报告' || e.status === '检查中')
  const positiveCount = completedExams.filter(e => e.criticalFinding === true || e.priority === '紧急' || e.priority === '危重').length
  const negativeCount = completedExams.length - positiveCount
  const firstExam = patientExams.length > 0 ? patientExams[patientExams.length - 1] : null
  return {
    totalExams: patientExams.length,
    completedExams: completedExams.length,
    positiveCount,
    negativeCount,
    firstExamDate: firstExam ? firstExam.examDate : '-'
  }
}

// ==================== 子组件：统计卡片 ====================
interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  bgColor: string
}

function StatCard({ label, value, icon, color, bgColor }: StatCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '16px 20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

// ==================== 子组件：标签页按钮 ====================
interface TabButtonProps {
  tabKey: TabKey
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
  badge?: number | string
}

function TabButton({ label, icon, isActive, onClick, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        border: 'none',
        borderBottom: isActive ? '3px solid #1e3a5f' : '3px solid transparent',
        background: 'none',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? '#1e3a5f' : '#64748b',
        transition: 'all 0.2s',
      }}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span style={{
          background: isActive ? '#1e3a5f' : '#e2e8f0',
          color: isActive ? '#fff' : '#64748b',
          borderRadius: 10,
          padding: '1px 6px',
          fontSize: 11,
          fontWeight: 700,
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}

// ==================== 子组件：分页控件 ====================
interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: '1px solid #e2e8f0',
      background: '#f8fafc',
    }}>
      <div style={{ fontSize: 12, color: '#64748b' }}>
        显示 {startItem}-{endItem} 条，共 {totalItems} 条记录
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={16} color="#64748b" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum = i + 1
          if (totalPages > 5) {
            if (currentPage > 3) {
              pageNum = currentPage - 2 + i
            }
            if (currentPage > totalPages - 2) {
              pageNum = totalPages - 4 + i
            }
          }
          if (pageNum < 1 || pageNum > totalPages) return null
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: 32,
                height: 32,
                borderRadius: 6,
                border: '1px solid',
                borderColor: currentPage === pageNum ? '#1e3a5f' : '#e2e8f0',
                background: currentPage === pageNum ? '#1e3a5f' : '#fff',
                color: currentPage === pageNum ? '#fff' : '#64748b',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                padding: '0 8px',
              }}
            >
              {pageNum}
            </button>
          )
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={16} color="#64748b" />
        </button>
      </div>
    </div>
  )
}

// ==================== 子组件：高级筛选面板 ====================
interface AdvancedFilterPanelProps {
  filters: AdvancedFilters
  onChange: (filters: AdvancedFilters) => void
  onReset: () => void
}

function AdvancedFilterPanel({ filters, onChange, onReset }: AdvancedFilterPanelProps) {
  const modalities = ['全部', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶', '胃肠造影']

  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      padding: 16,
      marginBottom: 16,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {/* 性别筛选 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>性别</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['全部', '男', '女'] as GenderFilter[]).map(g => (
              <button
                key={g}
                onClick={() => onChange({ ...filters, gender: g })}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: filters.gender === g ? '#1e3a5f' : '#e2e8f0',
                  background: filters.gender === g ? '#1e3a5f' : '#fff',
                  color: filters.gender === g ? '#fff' : '#64748b',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 年龄范围 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>年龄范围</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="number"
              value={filters.ageMin}
              onChange={e => onChange({ ...filters, ageMin: e.target.value })}
              placeholder="最小"
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                outline: 'none',
                width: '100%',
              }}
            />
            <span style={{ color: '#64748b', fontSize: 12 }}>-</span>
            <input
              type="number"
              value={filters.ageMax}
              onChange={e => onChange({ ...filters, ageMax: e.target.value })}
              placeholder="最大"
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* 患者类型 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>患者类型</label>
          <select
            value={filters.patientType}
            onChange={e => onChange({ ...filters, patientType: e.target.value as PatientTypeFilter })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              outline: 'none',
              background: '#fff',
            }}
          >
            {(['全部', '门诊', '住院', '体检', '急诊'] as PatientTypeFilter[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* 检查设备 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>检查设备</label>
          <select
            value={filters.modality}
            onChange={e => onChange({ ...filters, modality: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              outline: 'none',
              background: '#fff',
            }}
          >
            {modalities.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* 建档日期从 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>建档日期从</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => onChange({ ...filters, dateFrom: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>

        {/* 建档日期至 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>建档日期至</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => onChange({ ...filters, dateTo: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button
            onClick={onReset}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#64748b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <RefreshCw size={12} />
            重置
          </button>
          <button
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: '#1e3a5f',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Search size={12} />
            筛选
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== 子组件：饼图（ASCII简化版） ====================
interface PieChartSimpleProps {
  data: { label: string; value: number; color: string }[]
  title: string
}

function PieChartSimple({ data, title }: PieChartSimpleProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* 简化饼图 */}
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            {data.reduce((acc, d, i) => {
              const percent = total > 0 ? (d.value / total) * 100 : 0
              const prevPercent = acc.reduce((s, item) => s + (total > 0 ? item.percent : 0), 0)
              const dashArray = `${percent} ${100 - percent}`
              acc.push({ ...d, percent, prevPercent, dashArray })
              return acc
            }, [] as { label: string; value: number; color: string; percent: number; prevPercent: number; dashArray: string }[]).map((item, i) => {
              const dashOffset = 100 - item.prevPercent
              return (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeDasharray={item.dashArray}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'all 0.3s' }}
                />
              )
            })}
            <circle cx="50" cy="50" r="25" fill="#fff" />
          </svg>
        </div>
        {/* 图例 */}
        <div style={{ flex: 1 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color }} />
              <div style={{ flex: 1, fontSize: 12, color: '#334155' }}>{d.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>{d.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', width: 40, textAlign: 'right' }}>
                {total > 0 ? `${((d.value / total) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== 子组件：柱状图（ASCII简化版） ====================
interface BarChartSimpleProps {
  data: { label: string; value: number; color: string }[]
  title: string
  xLabel?: string
  yLabel?: string
}

function BarChartSimple({ data, title, xLabel, yLabel }: BarChartSimpleProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1e3a5f' }}>{d.value}</div>
            <div style={{
              width: '100%',
              height: `${(d.value / maxValue) * 100}px`,
              background: d.color,
              borderRadius: '4px 4px 0 0',
              minHeight: 4,
              transition: 'all 0.3s',
            }} />
            <div style={{ fontSize: 10, color: '#64748b', textAlign: 'center' }}>{d.label}</div>
          </div>
        ))}
      </div>
      {xLabel && <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 8 }}>{xLabel}</div>}
    </div>
  )
}

// ==================== 主组件 ====================
export default function PatientPage() {
  // 状态
  const [activeTab, setActiveTab] = useState<TabKey>('list')
  const [search, setSearch] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    gender: '全部',
    ageMin: '',
    ageMax: '',
    patientType: '全部',
    dateFrom: '',
    dateTo: '',
    modality: '全部',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState<Patient | null>(null)
  const [pageSize] = useState(20)

  // 表单状态
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    gender: '男',
    age: '',
    idCard: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    patientType: '门诊',
    insuranceType: '',
    allergyHistory: '',
    medicalHistory: '',
    bedNumber: '',
    attendingDoctor: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({})

  const patients = initialPatients
  const exams = initialRadiologyExams

  // 高级筛选重置
  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      gender: '全部',
      ageMin: '',
      ageMax: '',
      patientType: '全部',
      dateFrom: '',
      dateTo: '',
      modality: '全部',
    })
  }

  // 筛选逻辑
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // 关键词搜索
      if (search) {
        const s = search.toLowerCase()
        const matchSearch =
          p.name.toLowerCase().includes(s) ||
          p.id.toLowerCase().includes(s) ||
          p.idCard.includes(search) ||
          p.phone.includes(search) ||
          p.phone.includes(search)
        if (!matchSearch) return false
      }

      // 性别筛选
      if (advancedFilters.gender !== '全部' && p.gender !== advancedFilters.gender) return false

      // 年龄筛选
      if (advancedFilters.ageMin && p.age < parseInt(advancedFilters.ageMin)) return false
      if (advancedFilters.ageMax && p.age > parseInt(advancedFilters.ageMax)) return false

      // 患者类型筛选
      if (advancedFilters.patientType !== '全部' && p.patientType !== advancedFilters.patientType) return false

      // 建档日期筛选
      if (advancedFilters.dateFrom && p.registrationDate < advancedFilters.dateFrom) return false
      if (advancedFilters.dateTo && p.registrationDate > advancedFilters.dateTo) return false

      // 设备筛选（根据患者的检查历史）
      if (advancedFilters.modality !== '全部') {
        const patientExams = getPatientExams(p.id, exams)
        const hasModality = patientExams.some(e => e.modality === advancedFilters.modality)
        if (!hasModality) return false
      }

      return true
    })
  }, [search, advancedFilters, patients, exams])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize))
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPatients.slice(start, start + pageSize)
  }, [filteredPatients, currentPage, pageSize])

  // 统计
  const statistics = useMemo(() => {
    const totalPatients = patients.length
    const inpatients = patients.filter(p => p.patientType === '住院').length
    const outpatients = patients.filter(p => p.patientType === '门诊').length
    const healthCheck = patients.filter(p => p.patientType === '体检').length
    const emergency = patients.filter(p => p.patientType === '急诊').length
    const males = patients.filter(p => p.gender === '男').length
    const females = patients.filter(p => p.gender === '女').length
    const withAllergy = patients.filter(p => p.allergyHistory && p.allergyHistory !== '无').length
    const todayNew = 3 // 模拟今日新增

    // 年龄段分布
    const ageGroups = [
      { label: '0-18', value: 0, color: '#3b82f6' },
      { label: '19-35', value: 0, color: '#8b5cf6' },
      { label: '36-50', value: 0, color: '#06b6d4' },
      { label: '51-65', value: 0, color: '#f59e0b' },
      { label: '65+', value: 0, color: '#ef4444' },
    ]
    patients.forEach(p => {
      if (p.age <= 18) ageGroups[0].value++
      else if (p.age <= 35) ageGroups[1].value++
      else if (p.age <= 50) ageGroups[2].value++
      else if (p.age <= 65) ageGroups[3].value++
      else ageGroups[4].value++
    })

    // 患者类型分布
    const typeDistribution = [
      { label: '门诊', value: outpatients, color: '#3b82f6' },
      { label: '住院', value: inpatients, color: '#8b5cf6' },
      { label: '体检', value: healthCheck, color: '#06b6d4' },
      { label: '急诊', value: emergency, color: '#f59e0b' },
    ]

    // 性别分布
    const genderDistribution = [
      { label: '男', value: males, color: '#3b82f6' },
      { label: '女', value: females, color: '#ec4899' },
    ]

    // 复诊率（模拟）
    const returnRate = ((patients.filter(p => p.totalExamCount > 1).length / totalPatients) * 100).toFixed(1)

    // 检查频次分布
    const examFrequency: { label: string; value: number; color: string }[] = []
    const freqMap: Record<number, number> = {}
    patients.forEach(p => {
      const count = p.totalExamCount || 1
      freqMap[count] = (freqMap[count] || 0) + 1
    })
    Object.keys(freqMap).sort((a, b) => parseInt(a) - parseInt(b)).forEach((key, i) => {
      const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
      examFrequency.push({
        label: `${key}次`,
        value: freqMap[parseInt(key)],
        color: colors[i % colors.length],
      })
    })

    return {
      totalPatients,
      inpatients,
      outpatients,
      healthCheck,
      emergency,
      males,
      females,
      withAllergy,
      todayNew,
      ageGroups,
      typeDistribution,
      genderDistribution,
      returnRate,
      examFrequency,
    }
  }, [patients])

  // 表单验证
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PatientFormData, string>> = {}
    if (!formData.name.trim()) errors.name = '请输入患者姓名'
    if (!formData.idCard.trim()) errors.idCard = '请输入身份证号'
    else if (formData.idCard.length !== 18) errors.idCard = '身份证号格式不正确'
    if (!formData.phone.trim()) errors.phone = '请输入联系电话'
    else if (!/^1[3-9]\d{9}$/.test(formData.phone)) errors.phone = '手机号格式不正确'
    if (!formData.emergencyContact.trim()) errors.emergencyContact = '请输入联系人姓名'
    if (!formData.emergencyPhone.trim()) errors.emergencyPhone = '请输入联系人电话'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 保存患者
  const handleSavePatient = () => {
    if (!validateForm()) return
    // 实际场景会调用API保存
    alert('患者信息保存成功！')
    setActiveTab('list')
    setSelectedPatientForEdit(null)
  }

  // 新建患者
  const handleNewPatient = () => {
    setSelectedPatientForEdit(null)
    setFormData({
      name: '',
      gender: '男',
      age: '',
      idCard: '',
      phone: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      patientType: '门诊',
      insuranceType: '',
      allergyHistory: '',
      medicalHistory: '',
      bedNumber: '',
      attendingDoctor: '',
    })
    setFormErrors({})
    setActiveTab('form')
  }

  // 编辑患者
  const handleEditPatient = (patient: Patient) => {
    setSelectedPatientForEdit(patient)
    setFormData({
      name: patient.name,
      gender: patient.gender as GenderFilter,
      age: String(patient.age),
      idCard: patient.idCard,
      phone: patient.phone,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      patientType: patient.patientType as PatientTypeFilter,
      insuranceType: patient.insuranceType || '',
      allergyHistory: patient.allergyHistory,
      medicalHistory: patient.medicalHistory,
      bedNumber: patient.bedNumber || '',
      attendingDoctor: patient.attendingDoctor || '',
    })
    setFormErrors({})
    setActiveTab('form')
  }

  // 查看患者详情
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setActiveTab('detail')
  }

  // 导出数据（模拟）
  const handleExport = () => {
    const csvContent = [
      ['患者ID', '姓名', '性别', '年龄', '身份证', '电话', '患者类型', '过敏史', '建档日期', '累计检查'].join(','),
      ...filteredPatients.map(p => [
        p.id, p.name, p.gender, p.age, p.idCard, p.phone, p.patientType, p.allergyHistory, p.registrationDate, p.totalExamCount
      ].join(','))
    ].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `患者列表_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // ==================== 渲染：标签页1 - 患者列表 ====================
  const renderPatientList = () => (
    <>
      {/* 高级筛选 */}
      {showAdvanced && (
        <AdvancedFilterPanel
          filters={advancedFilters}
          onChange={setAdvancedFilters}
          onReset={resetAdvancedFilters}
        />
      )}

      {/* 患者列表表格 */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1100 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['患者ID', '姓名', '性别', '年龄', '身份证', '联系电话', '就诊卡号', '患者类型', '建档日期', '检查次数', '最近检查', '操作'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.map((p, idx) => {
                const pExams = getPatientExams(p.id, exams)
                const hasAllergy = p.allergyHistory && p.allergyHistory !== '无'
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                    }}
                    onClick={() => setSelectedPatient(p)}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'}
                  >
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{p.id}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: p.gender === '男' ? '#dbeafe' : '#fce7f3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          color: p.gender === '男' ? '#1e3a5f' : '#be185d',
                        }}>
                          {p.name.slice(0, 1)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        background: p.gender === '男' ? '#dbeafe' : '#fce7f3',
                        color: p.gender === '男' ? '#1e40af' : '#be185d',
                      }}>
                        {p.gender}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#334155', fontWeight: 500 }}>{p.age}岁</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{p.idCard}</td>
                    <td style={{ padding: '10px 14px', color: '#334155' }}>{p.phone}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{p.id}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#475569',
                      }}>
                        {p.patientType}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 11 }}>{p.registrationDate}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#1e3a5f' }}>
                      {p.totalExamCount || 0}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 11 }}>{p.lastExamDate || '-'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewPatient(p); }}
                          title="查看详情"
                          style={{
                            padding: '4px 8px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Eye size={12} />
                          查看
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditPatient(p); }}
                          title="编辑"
                          style={{
                            padding: '4px 8px',
                            background: '#f0fdf4',
                            color: '#16a34a',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Edit2 size={12} />
                          编辑
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          title="新建检查"
                          style={{
                            padding: '4px 8px',
                            background: '#fef3c7',
                            color: '#d97706',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <PlusCircle size={12} />
                          检查
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          title="历史报告"
                          style={{
                            padding: '4px 8px',
                            background: '#f5f3ff',
                            color: '#7c3aed',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <FileText size={12} />
                          报告
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paginatedPatients.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ padding: '40px 14px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Search size={32} color="#cbd5e1" />
                      <div style={{ fontSize: 13 }}>未找到匹配的患者记录</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPatients.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 选中患者详情卡片 */}
      {selectedPatient && (
        <div style={{
          marginTop: 16,
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{selectedPatient.name.slice(0, 1)}</span>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>{selectedPatient.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {selectedPatient.gender} · {selectedPatient.age}岁 · {selectedPatient.patientType}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color="#64748b" />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: '患者ID', value: selectedPatient.id, icon: <User size={14} /> },
              { label: '联系电话', value: selectedPatient.phone, icon: <Phone size={14} /> },
              { label: '身份证号', value: selectedPatient.idCard, icon: <CreditCard size={14} /> },
              { label: '建档日期', value: selectedPatient.registrationDate, icon: <Calendar size={14} /> },
              { label: '家庭住址', value: selectedPatient.address, icon: <MapPin size={14} /> },
              { label: '联系人', value: `${selectedPatient.emergencyContact} (${selectedPatient.emergencyPhone})`, icon: <Contact size={14} /> },
              { label: '医保类型', value: selectedPatient.insuranceType || '-', icon: <Shield size={14} /> },
              { label: '累计检查', value: `${selectedPatient.totalExamCount || 0} 次`, icon: <Activity size={14} /> },
            ].map(item => (
              <div key={item.label} style={{
                padding: 12,
                background: '#f8fafc',
                borderRadius: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: '#94a3b8' }}>{item.icon}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.label}</span>
                </div>
                <div style={{ fontSize: 12, color: '#334155', fontWeight: 500 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* 过敏史提示 */}
          {selectedPatient.allergyHistory && selectedPatient.allergyHistory !== '无' && (
            <div style={{
              marginTop: 16,
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <AlertTriangle size={16} color="#dc2626" />
              <span style={{ fontSize: 12, color: '#991b1b', fontWeight: 600 }}>过敏史：</span>
              <span style={{ fontSize: 12, color: '#991b1b' }}>{selectedPatient.allergyHistory}</span>
            </div>
          )}

          {/* 既往史 */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>既往史</div>
            <div style={{ fontSize: 12, color: '#334155', padding: 12, background: '#f8fafc', borderRadius: 8 }}>
              {selectedPatient.medicalHistory || '无'}
            </div>
          </div>
        </div>
      )}
    </>
  )

  // ==================== 渲染：标签页2 - 患者详情 ====================
  const renderPatientDetail = () => {
    if (!selectedPatient) {
      return (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: 60,
          textAlign: 'center',
        }}>
          <User size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 14, color: '#64748b' }}>请从患者列表选择一个患者查看详情</div>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              marginTop: 16,
              padding: '8px 20px',
              background: '#1e3a5f',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            返回患者列表
          </button>
        </div>
      )
    }

    const patientExams = getPatientExams(selectedPatient.id, exams)
    const stats = getPatientStats(selectedPatient.id, exams)

    return (
      <>
        {/* 返回按钮 */}
        <button
          onClick={() => { setActiveTab('list'); setSelectedPatient(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            color: '#64748b',
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={14} />
          返回列表
        </button>

        {/* 患者基本信息卡片 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: 24,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{selectedPatient.name.slice(0, 1)}</span>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f' }}>{selectedPatient.name}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                {selectedPatient.gender} · {selectedPatient.age}岁 · {selectedPatient.patientType}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>ID: {selectedPatient.id}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleEditPatient(selectedPatient)}
                style={{
                  padding: '8px 16px',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Edit2 size={14} />
                编辑
              </button>
            </div>
          </div>

          {/* 基本信息网格 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: '出生日期', value: getBirthDateFromIdCard(selectedPatient.idCard), icon: <Calendar size={14} /> },
              { label: '身份证号', value: selectedPatient.idCard, icon: <CreditCard size={14} /> },
              { label: '联系电话', value: selectedPatient.phone, icon: <Phone size={14} /> },
              { label: '家庭住址', value: selectedPatient.address, icon: <MapPin size={14} /> },
              { label: '联系人', value: selectedPatient.emergencyContact, icon: <Contact size={14} /> },
              { label: '联系人电话', value: selectedPatient.emergencyPhone, icon: <Phone size={14} /> },
              { label: '就诊卡号', value: selectedPatient.id, icon: <CreditCard size={14} /> },
              { label: '患者类型', value: selectedPatient.patientType, icon: <User size={14} /> },
              { label: '医保类型', value: selectedPatient.insuranceType || '-', icon: <Shield size={14} /> },
              { label: '床位号', value: selectedPatient.bedNumber || '-', icon: <User size={14} /> },
              { label: '主治医师', value: selectedPatient.attendingDoctor || '-', icon: <Stethoscope size={14} /> },
              { label: '建档日期', value: selectedPatient.registrationDate, icon: <Calendar size={14} /> },
            ].map(item => (
              <div key={item.label} style={{
                padding: 12,
                background: '#f8fafc',
                borderRadius: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: '#94a3b8' }}>{item.icon}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.label}</span>
                </div>
                <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* 过敏史和既往史 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div style={{
              padding: 16,
              background: selectedPatient.allergyHistory && selectedPatient.allergyHistory !== '无' ? '#fef2f2' : '#f8fafc',
              border: `1px solid ${selectedPatient.allergyHistory && selectedPatient.allergyHistory !== '无' ? '#fecaca' : '#e2e8f0'}`,
              borderRadius: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <AlertTriangle size={14} color={selectedPatient.allergyHistory && selectedPatient.allergyHistory !== '无' ? '#dc2626' : '#94a3b8'} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>过敏史</span>
              </div>
              <div style={{ fontSize: 13, color: '#334155' }}>
                {selectedPatient.allergyHistory || '无'}
              </div>
            </div>
            <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <History size={14} color="#94a3b8" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>既往史</span>
              </div>
              <div style={{ fontSize: 13, color: '#334155' }}>
                {selectedPatient.medicalHistory || '无'}
              </div>
            </div>
          </div>
        </div>

        {/* 检查统计 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: 20,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>检查统计</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: 16, background: '#eff6ff', borderRadius: 8 }}>
              <Activity size={24} color="#3b82f6" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f' }}>{stats.totalExams}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>总检查次数</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: '#fef2f2', borderRadius: 8 }}>
              <AlertTriangle size={24} color="#dc2626" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626' }}>{stats.positiveCount}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>阳性/危急</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
              <CheckCircle size={24} color="#16a34a" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>{stats.negativeCount}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>阴性/正常</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
              <Clock size={24} color="#64748b" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{stats.firstExamDate}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>首次检查日期</div>
            </div>
          </div>
        </div>

        {/* 检查历史列表 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: 20,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>检查历史</div>
            <span style={{ fontSize: 12, color: '#64748b' }}>共 {patientExams.length} 条记录</span>
          </div>
          {patientExams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              暂无检查记录
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {['检查日期', '检查项目', '设备', '检查类型', '优先级', '状态', '报告结果', '报告医生'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patientExams.map((ex, idx) => (
                    <tr
                      key={ex.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                      }}
                    >
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{ex.examDate}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{ex.examItemName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{ex.modality} · {ex.bodyPart}</div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 11 }}>{ex.deviceName}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          background: '#f1f5f9',
                          color: '#475569',
                        }}>
                          {ex.patientType}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: ex.priority === '危重' || ex.priority === '紧急' ? '#fef2f2' : '#f0fdf4',
                          color: ex.priority === '危重' || ex.priority === '紧急' ? '#dc2626' : '#16a34a',
                        }}>
                          {ex.priority}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          background: ex.status === '已完成' ? '#dbeafe' : '#fef3c7',
                          color: ex.status === '已完成' ? '#1e40af' : '#d97706',
                        }}>
                          {ex.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {ex.criticalFinding ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#dc2626', fontWeight: 600 }}>
                            <AlertCircle size={12} />
                            阳性
                          </span>
                        ) : (
                          <span style={{ color: '#16a34a' }}>正常</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{ex.technologistName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 影像历史 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Image size={16} color="#1e3a5f" />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>影像历史</div>
            </div>
            <span style={{ fontSize: 12, color: '#64748b' }}>共 {patientExams.length} 组影像</span>
          </div>
          {patientExams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              暂无影像记录
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {patientExams.map(ex => (
                <div
                  key={ex.id}
                  style={{
                    padding: 12,
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#1e3a5f'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'}
                >
                  <div style={{
                    width: '100%',
                    height: 80,
                    background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}>
                    <Image size={24} color="rgba(255,255,255,0.6)" />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f', marginBottom: 2 }}>{ex.examItemName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{ex.examDate}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {ex.imagesAcquired > 0 ? `${ex.imagesAcquired} 帧` : '待采集'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )
  }

  // ==================== 渲染：标签页3 - 新建/编辑患者 ====================
  const renderPatientForm = () => (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('list')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={16} color="#64748b" />
        </button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>
            {selectedPatientForEdit ? '编辑患者信息' : '新建患者档案'}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            {selectedPatientForEdit ? `患者ID: ${selectedPatientForEdit.id}` : '请填写以下信息'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* 姓名 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            患者姓名 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入患者姓名"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${formErrors.name ? '#dc2626' : '#e2e8f0'}`,
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {formErrors.name && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{formErrors.name}</div>}
        </div>

        {/* 性别 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            性别 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['男', '女'] as GenderFilter[]).map(g => (
              <button
                key={g}
                onClick={() => setFormData({ ...formData, gender: g })}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  border: `1px solid ${formData.gender === g ? '#1e3a5f' : '#e2e8f0'}`,
                  background: formData.gender === g ? '#1e3a5f' : '#fff',
                  color: formData.gender === g ? '#fff' : '#64748b',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 年龄 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            年龄
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            placeholder="请输入年龄"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 身份证 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            身份证号 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.idCard}
            onChange={e => setFormData({ ...formData, idCard: e.target.value })}
            placeholder="请输入18位身份证号"
            maxLength={18}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${formErrors.idCard ? '#dc2626' : '#e2e8f0'}`,
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {formErrors.idCard && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{formErrors.idCard}</div>}
        </div>

        {/* 联系电话 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            联系电话 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="请输入手机号"
            maxLength={11}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${formErrors.phone ? '#dc2626' : '#e2e8f0'}`,
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {formErrors.phone && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{formErrors.phone}</div>}
        </div>

        {/* 患者类型 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            患者类型
          </label>
          <select
            value={formData.patientType}
            onChange={e => setFormData({ ...formData, patientType: e.target.value as PatientTypeFilter })}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box',
            }}
          >
            {(['门诊', '住院', '体检', '急诊'] as PatientTypeFilter[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* 家庭住址 */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            家庭住址
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            placeholder="请输入详细地址"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 联系人 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            联系人姓名 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.emergencyContact}
            onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
            placeholder="请输入联系人姓名"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${formErrors.emergencyContact ? '#dc2626' : '#e2e8f0'}`,
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {formErrors.emergencyContact && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{formErrors.emergencyContact}</div>}
        </div>

        {/* 联系人电话 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            联系人电话 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="tel"
            value={formData.emergencyPhone}
            onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
            placeholder="请输入联系人电话"
            maxLength={11}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${formErrors.emergencyPhone ? '#dc2626' : '#e2e8f0'}`,
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {formErrors.emergencyPhone && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{formErrors.emergencyPhone}</div>}
        </div>

        {/* 医保类型 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            医保类型
          </label>
          <select
            value={formData.insuranceType}
            onChange={e => setFormData({ ...formData, insuranceType: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box',
            }}
          >
            <option value="">请选择</option>
            <option value="城镇职工基本医疗保险">城镇职工基本医疗保险</option>
            <option value="城乡居民基本医疗保险">城乡居民基本医疗保险</option>
            <option value="商业医疗保险">商业医疗保险</option>
            <option value="自费">自费</option>
          </select>
        </div>

        {/* 床位号 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            床位号
          </label>
          <input
            type="text"
            value={formData.bedNumber}
            onChange={e => setFormData({ ...formData, bedNumber: e.target.value })}
            placeholder="如：3床"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 主治医师 */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            主治医师
          </label>
          <input
            type="text"
            value={formData.attendingDoctor}
            onChange={e => setFormData({ ...formData, attendingDoctor: e.target.value })}
            placeholder="请输入主治医师姓名"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 过敏史 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            过敏史
          </label>
          <input
            type="text"
            value={formData.allergyHistory}
            onChange={e => setFormData({ ...formData, allergyHistory: e.target.value })}
            placeholder="请输入过敏史（无则填'无'）"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 既往史 */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>
            既往史
          </label>
          <input
            type="text"
            value={formData.medicalHistory}
            onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })}
            placeholder="请输入既往病史"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('list')}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#64748b',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          取消
        </button>
        <button
          onClick={handleSavePatient}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            background: '#1e3a5f',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Save size={16} />
          保存患者信息
        </button>
      </div>
    </div>
  )

  // ==================== 渲染：标签页4 - 患者分析 ====================
  const renderPatientAnalytics = () => (
    <>
      {/* 顶部统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <StatCard
          label="总患者数"
          value={statistics.totalPatients}
          icon={<Users size={24} />}
          color="#1e3a5f"
          bgColor="#eff6ff"
        />
        <StatCard
          label="门诊患者"
          value={statistics.outpatients}
          icon={<UserCheck size={24} />}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          label="住院患者"
          value={statistics.inpatients}
          icon={<Activity size={24} />}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
        <StatCard
          label="今日新增"
          value={statistics.todayNew}
          icon={<PlusCircle size={24} />}
          color="#16a34a"
          bgColor="#f0fdf4"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <StatCard
          label="体检患者"
          value={statistics.healthCheck}
          icon={<Heart size={24} />}
          color="#06b6d4"
          bgColor="#ecfeff"
        />
        <StatCard
          label="急诊患者"
          value={statistics.emergency}
          icon={<AlertCircle size={24} />}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatCard
          label="有过敏史"
          value={statistics.withAllergy}
          icon={<AlertTriangle size={24} />}
          color="#dc2626"
          bgColor="#fef2f2"
        />
        <StatCard
          label="复诊率"
          value={`${statistics.returnRate}%`}
          icon={<TrendingUp size={24} />}
          color="#0ea5e9"
          bgColor="#f0f9ff"
        />
      </div>

      {/* 图表区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 患者类型分布饼图 */}
        <PieChartSimple
          data={statistics.typeDistribution}
          title="患者类型分布"
        />

        {/* 男女比例饼图 */}
        <PieChartSimple
          data={statistics.genderDistribution}
          title="男女比例"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 年龄段分布柱状图 */}
        <BarChartSimple
          data={statistics.ageGroups}
          title="年龄段分布"
          xLabel="年龄段"
        />

        {/* 检查频次分布 */}
        <BarChartSimple
          data={statistics.examFrequency}
          title="检查频次分布"
          xLabel="检查次数"
        />
      </div>

      {/* 患者详情列表 */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>
          患者明细 (<span style={{ fontWeight: 400, color: '#64748b' }}>点击查看详情</span>)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['患者ID', '姓名', '性别', '年龄', '类型', '过敏史', '累计检查', '最近检查', '操作'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((p, idx) => {
                const pExams = getPatientExams(p.id, exams)
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                    }}
                    onClick={() => { setSelectedPatient(p); setActiveTab('detail'); }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'}
                  >
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{p.id}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: p.gender === '男' ? '#dbeafe' : '#fce7f3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          color: p.gender === '男' ? '#1e40af' : '#be185d',
                        }}>
                          {p.name.slice(0, 1)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        background: p.gender === '男' ? '#dbeafe' : '#fce7f3',
                        color: p.gender === '男' ? '#1e40af' : '#be185d',
                      }}>
                        {p.gender}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#334155' }}>{p.age}岁</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>
                        {p.patientType}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {p.allergyHistory && p.allergyHistory !== '无' ? (
                        <span style={{ color: '#dc2626', fontWeight: 600, fontSize: 11 }}>{p.allergyHistory}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 11 }}>无</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#1e3a5f' }}>{p.totalExamCount || 0}</td>
                    <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11 }}>{p.lastExamDate || '-'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewPatient(p); }}
                          style={{
                            padding: '3px 8px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          详情
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditPatient(p); }}
                          style={{
                            padding: '3px 8px',
                            background: '#f0fdf4',
                            color: '#16a34a',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          编辑
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )

  // ==================== 主渲染 ====================
  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* 页面标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stethoscope size={22} color="#1e3a5f" />
            患者管理
          </h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>患者档案 · 就诊记录 · 过敏史管理 · 数据分析</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px',
              background: '#fff',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Download size={14} />
            导出
          </button>
          <button
            onClick={handleNewPatient}
            style={{
              padding: '8px 16px',
              background: '#1e3a5f',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(30,58,95,0.3)',
            }}
          >
            <UserPlus size={14} />
            新建患者
          </button>
        </div>
      </div>

      {/* 顶部统计卡片 */}
      {activeTab === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          <StatCard
            label="总患者数"
            value={statistics.totalPatients}
            icon={<Users size={22} />}
            color="#1e3a5f"
            bgColor="#eff6ff"
          />
          <StatCard
            label="住院患者"
            value={statistics.inpatients}
            icon={<Activity size={22} />}
            color="#8b5cf6"
            bgColor="#f5f3ff"
          />
          <StatCard
            label="今日新增"
            value={statistics.todayNew}
            icon={<PlusCircle size={22} />}
            color="#16a34a"
            bgColor="#f0fdf4"
          />
          <StatCard
            label="有过敏史"
            value={statistics.withAllergy}
            icon={<AlertTriangle size={22} />}
            color="#dc2626"
            bgColor="#fef2f2"
          />
        </div>
      )}

      {/* 标签页导航 */}
      <div style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid #e2e8f0',
        marginBottom: 16,
        background: '#fff',
        borderRadius: '12px 12px 0 0',
        padding: '0 8px',
      }}>
        <TabButton
          tabKey="list"
          label="患者列表"
          icon={<Users size={16} />}
          isActive={activeTab === 'list'}
          onClick={() => setActiveTab('list')}
          badge={filteredPatients.length}
        />
        <TabButton
          tabKey="detail"
          label="患者详情"
          icon={<Eye size={16} />}
          isActive={activeTab === 'detail'}
          onClick={() => setActiveTab('detail')}
          badge={selectedPatient ? 1 : undefined}
        />
        <TabButton
          tabKey="form"
          label="新建/编辑"
          icon={<UserPlus size={16} />}
          isActive={activeTab === 'form'}
          onClick={() => { handleNewPatient(); }}
        />
        <TabButton
          tabKey="analytics"
          label="患者分析"
          icon={<PieChart size={16} />}
          isActive={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
        />
      </div>

      {/* 搜索栏（仅列表页） */}
      {activeTab === 'list' && (
        <div style={{
          background: '#fff',
          borderRadius: 10,
          padding: '12px 16px',
          border: '1px solid #e2e8f0',
          marginBottom: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="综合搜索：姓名 / 身份证 / 就诊卡号 / 电话 / Accession号..."
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 13,
              width: 400,
              background: 'transparent',
            }}
          />
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid',
              borderColor: showAdvanced ? '#1e3a5f' : '#e2e8f0',
              background: showAdvanced ? '#eff6ff' : '#fff',
              color: showAdvanced ? '#1e3a5f' : '#64748b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            <Filter size={14} />
            高级筛选
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      )}

      {/* 标签页内容 */}
      <div>
        {activeTab === 'list' && renderPatientList()}
        {activeTab === 'detail' && renderPatientDetail()}
        {activeTab === 'form' && renderPatientForm()}
        {activeTab === 'analytics' && renderPatientAnalytics()}
      </div>
    </div>
  )
}
