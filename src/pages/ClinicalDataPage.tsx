// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 临床数据中心/中台 v1.0.0
// 功能：患者360视图 + 跨系统数据同步 + 数据质量监控
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import {
  Search, User, Phone, AlertCircle, Calendar, Plus, X, ChevronLeft, ChevronRight,
  Eye, Edit2, FileText, BarChart2, Download, RefreshCw, Filter, ChevronDown, ChevronUp,
  Users, UserCheck, Clock, Activity, Heart, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, FilterX, Save, ArrowLeft, Stethoscope, Shield, MapPin,
  Contact, CreditCard, History, Image, PlusCircle, Trash2, UserPlus, Database,
  Server, Network, RefreshCw as SyncIcon, Check, AlertOctagon, ShieldCheck, 
  Clock as ClockIcon, ArrowRight, ArrowDown, Droplet, Wifi, WifiOff, 
  Activity as ActivityIcon, PieChart as PieChartIcon,
  TrendingDown, Pause, Play, Settings, MoreVertical, Bell, BellOff, EyeOff
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { initialPatients, initialRadiologyExams } from '../data/initialData'
import type { Patient } from '../types'

// ==================== 类型定义 ====================
type TabKey = 'patient360' | 'sync' | 'quality'
type SyncStatus = '同步中' | '已同步' | '失败' | '待同步'
type QualityLevel = '优' | '良' | '中' | '差'

interface SyncRecord {
  id: string
  systemName: string
  systemType: 'HIS' | 'PACS' | 'EMR' | 'LIS' | 'RIS'
  recordType: string
  patientId: string
  patientName: string
  syncTime: string
  status: SyncStatus
  errorMsg?: string
  retryCount: number
}

interface QualityMetric {
  category: string
  metric: string
  score: number
  level: QualityLevel
  issueCount: number
  trend: 'up' | 'down' | 'stable'
  description: string
}

interface Patient360Data {
  patientId: string
  name: string
  gender: string
  age: number
  phone: string
  idCard: string
  patientType: string
  lastVisit: string
  totalVisits: number
  allergyHistory: string[]
  diagnoses: { date: string; diagnosis: string; doctor: string }[]
  exams: { id: string; examType: string; date: string; result: string; modality: string }[]
  medications: { name: string; dosage: string; frequency: string; startDate: string }[]
  vitals: { date: string; bp: string; hr: number; temp: number }[]
  labResults: { date: string; item: string; value: string; ref: string }[]
}

// ==================== 样式常量 ====================
const COLORS = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  secondary: '#0891b2',
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  bgGray: '#f1f5f9',
  cardWhite: '#ffffff',
  textDark: '#1f2937',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  purple: '#8b5cf6',
  purpleLight: '#ede9fe',
  orange: '#f97316',
  orangeLight: '#ffedd5',
  cyan: '#06b6d4',
  cyanLight: '#cffafe',
  pink: '#ec4899',
  pinkLight: '#fce7f3',
  his: '#3b82f6',
  pacs: '#8b5cf6',
  emr: '#10b981',
  lis: '#f59e0b',
  ris: '#06b6d4'
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: COLORS.bgGray,
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '14px',
    color: COLORS.textDark,
  },
  header: {
    background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
    color: 'white',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: 600,
  },
  headerSubtitle: {
    fontSize: '12px',
    opacity: 0.85,
    marginTop: '2px',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  headerBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    transition: 'all 0.2s',
  },
  content: {
    padding: '20px 24px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  tabContainer: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#fff',
    padding: '6px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  tab: (active: boolean) => ({
    flex: 1,
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    backgroundColor: active ? COLORS.primary : 'transparent',
    color: active ? '#fff' : COLORS.textMuted,
  }),
  card: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: COLORS.textDark,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  statCard: (color: string, bgColor: string) => ({
    backgroundColor: bgColor,
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }),
  statIcon: (color: string) => ({
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color,
    color: '#fff',
  }),
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: COLORS.textDark,
  },
  statLabel: {
    fontSize: '12px',
    color: COLORS.textMuted,
    marginTop: '2px',
  },
  statChange: (positive: boolean) => ({
    fontSize: '11px',
    color: positive ? COLORS.success : COLORS.danger,
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    marginTop: '4px',
  }),
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    backgroundColor: COLORS.bgGray,
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: 600,
    fontSize: '13px',
    color: COLORS.textMuted,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  td: {
    padding: '12px 16px',
    borderBottom: `1px solid ${COLORS.border}`,
    fontSize: '13px',
  },
  badge: (color: string, bgColor: string) => ({
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color,
    backgroundColor: bgColor,
  }),
  searchBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '10px 16px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  select: {
    padding: '10px 16px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#fff',
    minWidth: '120px',
  },
  btn: (color: string) => ({
    backgroundColor: color,
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  }),
  btnOutline: (color: string) => ({
    backgroundColor: '#fff',
    color,
    border: `1px solid ${color}`,
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  }),
  input: {
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  avatar: (color: string) => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: color,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '14px',
  }),
  progress: (percent: number, color: string) => ({
    width: '100%',
    height: '8px',
    backgroundColor: COLORS.bgGray,
    borderRadius: '4px',
    overflow: 'hidden',
    position: 'relative',
  }),
  progressBar: (percent: number, color: string) => ({
    height: '100%',
    width: `${percent}%`,
    backgroundColor: color,
    borderRadius: '4px',
    transition: 'width 0.3s',
  }),
  qualityBar: (level: QualityLevel) => {
    const colors: Record<QualityLevel, string> = {
      '优': COLORS.success,
      '良': COLORS.primaryLight,
      '中': COLORS.warning,
      '差': COLORS.danger,
    }
    return {
      width: '60px',
      height: '6px',
      backgroundColor: COLORS.bgGray,
      borderRadius: '3px',
      overflow: 'hidden',
    }
  },
}

// ==================== 模拟数据 ====================
const generateSyncRecords = (): SyncRecord[] => {
  const systems = [
    { name: '医院信息系统', type: 'HIS' as const },
    { name: '影像归档系统', type: 'PACS' as const },
    { name: '电子病历系统', type: 'EMR' as const },
    { name: '检验信息系统', type: 'LIS' as const },
    { name: '放射信息系统', type: 'RIS' as const },
  ]
  const recordTypes = ['患者信息', '检查申请', '报告结果', '医嘱信息', '诊断信息']
  const statuses: SyncStatus[] = ['同步中', '已同步', '失败', '待同步']
  const patients = initialPatients.slice(0, 15)
  
  return systems.flatMap((sys, sysIdx) =>
    Array.from({ length: 8 }, (_, i) => {
      const patient = patients[(sysIdx * 3 + i) % patients.length]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      return {
        id: `sync-${sysIdx}-${i}`,
        systemName: sys.name,
        systemType: sys.type,
        recordType: recordTypes[Math.floor(Math.random() * recordTypes.length)],
        patientId: patient.id,
        patientName: patient.name,
        syncTime: new Date(Date.now() - Math.random() * 86400000 * 3).toLocaleString('zh-CN'),
        status,
        errorMsg: status === '失败' ? '连接超时，数据未返回' : undefined,
        retryCount: status === '失败' ? Math.floor(Math.random() * 3) + 1 : 0,
      }
    })
  )
}

const generateQualityMetrics = (): QualityMetric[] => [
  { category: '数据完整性', metric: '患者信息完整率', score: 96.5, level: '优', issueCount: 12, trend: 'up', description: '基本信息、联系方式、医保信息等完整度' },
  { category: '数据完整性', metric: '检查报告完整率', score: 94.2, level: '优', issueCount: 8, trend: 'stable', description: '报告内容、签名、审核状态完整度' },
  { category: '数据完整性', metric: '诊断信息完整率', score: 88.7, level: '良', issueCount: 23, trend: 'up', description: '初诊、复诊诊断编码及描述完整度' },
  { category: '数据准确性', metric: '身份信息准确率', score: 99.8, level: '优', issueCount: 2, trend: 'stable', description: '身份证、姓名、性别等身份核验准确度' },
  { category: '数据准确性', metric: '检查数据准确率', score: 97.3, level: '优', issueCount: 5, trend: 'up', description: '检查号、设备参数、检查部位准确度' },
  { category: '数据准确性', metric: '报告数据准确率', score: 95.1, level: '优', issueCount: 7, trend: 'down', description: '报告内容、诊断结论、医学术语准确度' },
  { category: '数据时效性', metric: '实时同步及时率', score: 92.4, level: '良', issueCount: 18, trend: 'up', description: '数据从源系统到中台的同步时效' },
  { category: '数据时效性', metric: '报告出具及时率', score: 87.6, level: '良', issueCount: 31, trend: 'stable', description: '从检查完成到报告出具的时效' },
  { category: '数据时效性', metric: '危急值通知及时率', score: 98.9, level: '优', issueCount: 1, trend: 'stable', description: '危急值发现到临床通知的时效' },
  { category: '数据一致性', metric: '跨系统数据一致率', score: 85.3, level: '中', issueCount: 42, trend: 'down', description: 'HIS/PACS/EMR/RIS多系统数据一致性' },
  { category: '数据一致性', metric: '历史数据一致率', score: 91.2, level: '良', issueCount: 19, trend: 'stable', description: '同一患者多次就诊数据的一致性' },
  { category: '数据标准化', metric: '诊断编码标准化率', score: 93.8, level: '优', issueCount: 11, trend: 'up', description: 'ICD-10编码使用规范程度' },
  { category: '数据标准化', metric: '检查项目标准化率', score: 89.5, level: '良', issueCount: 16, trend: 'up', description: '检查项目名称与编码对应规范度' },
]

const generatePatient360 = (patientId: string): Patient360Data => {
  const patient = initialPatients.find(p => p.id === patientId) || initialPatients[0]
  const exams = initialRadiologyExams.filter(e => e.patientId === patientId).slice(0, 5)
  
  return {
    patientId: patient.id,
    name: patient.name,
    gender: patient.gender,
    age: patient.age || 45,
    phone: patient.phone || '138-xxxx-xxxx',
    idCard: patient.idCard || '1101011990xxxxxx',
    patientType: patient.patientType || '门诊',
    lastVisit: exams[0]?.examDate || '2026-04-15',
    totalVisits: exams.length + Math.floor(Math.random() * 10),
    allergyHistory: ['青霉素', '花粉'],
    diagnoses: [
      { date: '2026-04-10', diagnosis: '左肺上叶结节', doctor: '张主任' },
      { date: '2026-03-15', diagnosis: '颈椎退行性病变', doctor: '李医生' },
      { date: '2026-01-20', diagnosis: '腰椎间盘突出', doctor: '王医生' },
    ],
    exams: exams.map(e => ({
      id: e.id,
      examType: e.examType,
      date: e.examDate,
      result: e.findings || '未见明显异常',
      modality: e.modality,
    })),
    medications: [
      { name: '氨氯地平', dosage: '5mg', frequency: '每日一次', startDate: '2026-03-01' },
      { name: '阿司匹林', dosage: '100mg', frequency: '每日一次', startDate: '2026-01-15' },
    ],
    vitals: [
      { date: '2026-04-28', bp: '128/82', hr: 76, temp: 36.5 },
      { date: '2026-04-20', bp: '132/85', hr: 80, temp: 36.8 },
      { date: '2026-04-10', bp: '125/80', hr: 72, temp: 36.4 },
    ],
    labResults: [
      { date: '2026-04-20', item: '血红蛋白', value: '142 g/L', ref: '120-160 g/L' },
      { date: '2026-04-20', item: '白细胞计数', value: '6.8×10⁹/L', ref: '4-10×10⁹/L' },
      { date: '2026-04-20', item: '血小板计数', value: '215×10⁹/L', ref: '100-300×10⁹/L' },
    ],
  }
}

// ==================== 辅助组件 ====================
const StatusBadge = ({ status }: { status: SyncStatus }) => {
  const config: Record<SyncStatus, { color: string; bg: string; icon: React.ReactNode }> = {
    '同步中': { color: COLORS.primary, bg: '#eff6ff', icon: <SyncIcon size={12} /> },
    '已同步': { color: COLORS.success, bg: COLORS.successLight, icon: <Check size={12} /> },
    '失败': { color: COLORS.danger, bg: COLORS.dangerLight, icon: <AlertOctagon size={12} /> },
    '待同步': { color: COLORS.warning, bg: COLORS.warningLight, icon: <ClockIcon size={12} /> },
  }
  const c = config[status]
  return (
    <span style={styles.badge(c.color, c.bg)}>
      {c.icon}
      {status}
    </span>
  )
}

const QualityBadge = ({ level }: { level: QualityLevel }) => {
  const config: Record<QualityLevel, { color: string; bg: string }> = {
    '优': { color: COLORS.success, bg: COLORS.successLight },
    '良': { color: COLORS.primaryLight, bg: '#eff6ff' },
    '中': { color: COLORS.warning, bg: COLORS.warningLight },
    '差': { color: COLORS.danger, bg: COLORS.dangerLight },
  }
  const c = config[level]
  return <span style={styles.badge(c.color, c.bg)}>{level}</span>
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp size={14} color={COLORS.success} />
  if (trend === 'down') return <TrendingDown size={14} color={COLORS.danger} />
  return <Activity size={14} color={COLORS.textMuted} />
}

const SyncStatusIcon = ({ status }: { status: SyncStatus }) => {
  if (status === '已同步') return <Wifi size={16} color={COLORS.success} />
  if (status === '同步中') return <SyncIcon size={16} color={COLORS.primary} className="animate-spin" />
  if (status === '失败') return <WifiOff size={16} color={COLORS.danger} />
  return <ClockIcon size={16} color={COLORS.warning} />
}

const SystemTypeBadge = ({ type }: { type: SyncRecord['systemType'] }) => {
  const config: Record<string, { color: string; bg: string }> = {
    'HIS': { color: COLORS.his, bg: '#eff6ff' },
    'PACS': { color: COLORS.pacs, bg: COLORS.purpleLight },
    'EMR': { color: COLORS.emr, bg: COLORS.successLight },
    'LIS': { color: COLORS.lis, bg: COLORS.orangeLight },
    'RIS': { color: COLORS.ris, bg: COLORS.cyanLight },
  }
  const c = config[type] || { color: COLORS.textMuted, bg: COLORS.bgGray }
  return <span style={styles.badge(c.color, c.bg)}>{type}</span>
}

// ==================== 患者360视图组件 ====================
const Patient360View = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient360Data | null>(null)
  const [patientTypeFilter, setPatientTypeFilter] = useState('全部')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [activePatientTab, setActivePatientTab] = useState('overview')
  
  const filteredPatients = useMemo(() => {
    return initialPatients.filter(p => {
      const matchSearch = !searchTerm || 
        p.name.includes(searchTerm) || 
        p.id.includes(searchTerm) ||
        p.phone?.includes(searchTerm)
      const matchType = patientTypeFilter === '全部' || p.patientType === patientTypeFilter
      return matchSearch && matchType
    })
  }, [searchTerm, patientTypeFilter])
  
  const patientStats = useMemo(() => ({
    totalPatients: initialPatients.length,
    activePatients: initialPatients.filter(p => {
      const lastExam = initialRadiologyExams.find(e => e.patientId === p.id)
      return lastExam && (Date.now() - new Date(lastExam.examDate).getTime()) < 30 * 86400000
    }).length,
    newThisMonth: initialPatients.filter(p => {
      const lastExam = initialRadiologyExams.find(e => e.patientId === p.id)
      return lastExam && (Date.now() - new Date(lastExam.examDate).getTime()) < 30 * 86400000
    }).length,
    criticalCases: initialRadiologyExams.filter(e => e.criticalFinding).length,
  }), [])
  
  const patientData = selectedPatient ? generatePatient360(selectedPatient.patientId) : null
  
  return (
    <div>
      {/* 统计卡片 */}
      <div style={styles.statGrid}>
        <div style={styles.statCard(COLORS.primary, '#eff6ff')}>
          <div style={styles.statIcon(COLORS.primary)}>
            <Users size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{patientStats.totalPatients}</div>
            <div style={styles.statLabel}>患者总数</div>
          </div>
        </div>
        <div style={styles.statCard(COLORS.success, COLORS.successLight)}>
          <div style={styles.statIcon(COLORS.success)}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{patientStats.activePatients}</div>
            <div style={styles.statLabel}>活跃患者(30天内)</div>
          </div>
        </div>
        <div style={styles.statCard(COLORS.secondary, COLORS.cyanLight)}>
          <div style={styles.statIcon(COLORS.secondary)}>
            <PlusCircle size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{patientStats.newThisMonth}</div>
            <div style={styles.statLabel}>本月新增</div>
          </div>
        </div>
        <div style={styles.statCard(COLORS.danger, COLORS.dangerLight)}>
          <div style={styles.statIcon(COLORS.danger)}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{patientStats.criticalCases}</div>
            <div style={styles.statLabel}>危急病例</div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '1fr 1.2fr' : '1fr', gap: '16px' }}>
        {/* 左侧患者列表 */}
        <div style={styles.card}>
          <div style={{ ...styles.cardTitle, marginBottom: '12px' }}>
            <User size={18} color={COLORS.primary} />
            患者列表
          </div>
          
          {/* 搜索过滤 */}
          <div style={styles.searchBar}>
            <input
              style={styles.searchInput}
              placeholder="搜索患者姓名/ID/电话..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select 
              style={styles.select}
              value={patientTypeFilter}
              onChange={e => setPatientTypeFilter(e.target.value)}
            >
              <option value="全部">全部类型</option>
              <option value="门诊">门诊</option>
              <option value="住院">住院</option>
              <option value="体检">体检</option>
              <option value="急诊">急诊</option>
            </select>
          </div>
          
          {/* 患者列表 */}
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filteredPatients.slice(0, 20).map(patient => {
              const pData = generatePatient360(patient.id)
              const isSelected = selectedPatient?.patientId === patient.id
              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                    border: `1px solid ${isSelected ? COLORS.primary : 'transparent'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.avatar(COLORS.primary)}>
                      {patient.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{patient.name}</div>
                      <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                        ID: {patient.id} | {patient.patientType} | {pData.totalVisits}次就诊
                      </div>
                    </div>
                    <ChevronRight size={16} color={COLORS.textMuted} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* 右侧患者详情 */}
        {patientData && (
          <div style={styles.card}>
            <div style={{ ...styles.cardTitle, marginBottom: '16px' }}>
              <Eye size={18} color={COLORS.primary} />
              患者360视图
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: COLORS.textMuted }}>
                {patientData.name} - {patientData.patientId}
              </span>
            </div>
            
            {/* 患者概览 */}
            <div style={{ ...styles.grid2, marginBottom: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: COLORS.bgGray, borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>姓名</div>
                <div style={{ fontWeight: 600 }}>{patientData.name}</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: COLORS.bgGray, borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>性别/年龄</div>
                <div style={{ fontWeight: 600 }}>{patientData.gender} / {patientData.age}岁</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: COLORS.bgGray, borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>联系电话</div>
                <div style={{ fontWeight: 600 }}>{patientData.phone}</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: COLORS.bgGray, borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>患者类型</div>
                <div style={{ fontWeight: 600 }}>{patientData.patientType}</div>
              </div>
            </div>
            
            {/* 标签页 */}
            <div style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: COLORS.bgGray,
              padding: '4px',
              borderRadius: '8px',
              marginBottom: '16px',
            }}>
              {[
                { key: 'overview', label: '总览' },
                { key: 'exams', label: '检查' },
                { key: 'diagnoses', label: '诊断' },
                { key: 'vitals', label: '生命体征' },
                { key: 'medications', label: '用药' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActivePatientTab(tab.key)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    backgroundColor: activePatientTab === tab.key ? COLORS.primary : 'transparent',
                    color: activePatientTab === tab.key ? '#fff' : COLORS.textMuted,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* 内容区 */}
            {activePatientTab === 'overview' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} color={COLORS.warning} />
                    过敏史
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {patientData.allergyHistory.map(a => (
                      <span key={a} style={styles.badge(COLORS.warning, COLORS.warningLight)}>{a}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>最近诊断</div>
                  {patientData.diagnoses.slice(0, 2).map((d, i) => (
                    <div key={i} style={{
                      padding: '10px',
                      backgroundColor: COLORS.bgGray,
                      borderRadius: '6px',
                      marginBottom: '8px',
                      fontSize: '13px',
                    }}>
                      <div style={{ fontWeight: 500 }}>{d.diagnosis}</div>
                      <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '4px' }}>
                        {d.date} | {d.doctor}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activePatientTab === 'exams' && (
              <div>
                {patientData.exams.map(exam => (
                  <div key={exam.id} style={{
                    padding: '12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{exam.examType}</span>
                      <span style={styles.badge(COLORS.secondary, COLORS.cyanLight)}>{exam.modality}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>检查日期: {exam.date}</div>
                    <div style={{ fontSize: '13px', marginTop: '6px' }}>{exam.result}</div>
                  </div>
                ))}
              </div>
            )}
            
            {activePatientTab === 'diagnoses' && (
              <div>
                {patientData.diagnoses.map((d, i) => (
                  <div key={i} style={{
                    padding: '12px',
                    backgroundColor: COLORS.bgGray,
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{d.diagnosis}</div>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                      {d.date} | {d.doctor}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activePatientTab === 'vitals' && (
              <div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>日期</th>
                      <th style={styles.th}>血压</th>
                      <th style={styles.th}>心率</th>
                      <th style={styles.th}>体温</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientData.vitals.map((v, i) => (
                      <tr key={i}>
                        <td style={styles.td}>{v.date}</td>
                        <td style={styles.td}>{v.bp}</td>
                        <td style={styles.td}>{v.hr} bpm</td>
                        <td style={styles.td}>{v.temp}°C</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activePatientTab === 'medications' && (
              <div>
                {patientData.medications.map((m, i) => (
                  <div key={i} style={{
                    padding: '12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{m.name}</div>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                      {m.dosage} | {m.frequency} | 开始: {m.startDate}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== 跨系统数据同步组件 ====================
const CrossSystemSync = () => {
  const [syncRecords, setSyncRecords] = useState<SyncRecord[]>([])
  const [systemFilter, setSystemFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [searchTerm, setSearchTerm] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString('zh-CN'))
  
  useEffect(() => {
    setSyncRecords(generateSyncRecords())
  }, [])
  
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      setSyncRecords(prev => prev.map(r => {
        if (r.status === '同步中') {
          const newStatus = Math.random() > 0.3 ? '已同步' : '失败'
          return { ...r, status: newStatus, errorMsg: newStatus === '失败' ? '连接超时' : undefined }
        }
        return r
      }))
      setLastSyncTime(new Date().toLocaleTimeString('zh-CN'))
    }, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh])
  
  const syncStats = useMemo(() => {
    const total = syncRecords.length
    const synced = syncRecords.filter(r => r.status === '已同步').length
    const failed = syncRecords.filter(r => r.status === '失败').length
    const syncing = syncRecords.filter(r => r.status === '同步中').length
    const pending = syncRecords.filter(r => r.status === '待同步').length
    return { total, synced, failed, syncing, pending, rate: total ? Math.round(synced / total * 100) : 0 }
  }, [syncRecords])
  
  const filteredRecords = useMemo(() => {
    return syncRecords.filter(r => {
      const matchSystem = systemFilter === '全部' || r.systemType === systemFilter
      const matchStatus = statusFilter === '全部' || r.status === statusFilter
      const matchSearch = !searchTerm || r.patientName.includes(searchTerm) || r.patientId.includes(searchTerm)
      return matchSystem && matchStatus && matchSearch
    })
  }, [syncRecords, systemFilter, statusFilter, searchTerm])
  
  const systemStatus = useMemo(() => [
    { type: 'HIS', name: '医院信息系统', status: '已连接' as const, records: syncRecords.filter(r => r.systemType === 'HIS').length, synced: syncRecords.filter(r => r.systemType === 'HIS' && r.status === '已同步').length },
    { type: 'PACS', name: '影像归档系统', status: '已连接' as const, records: syncRecords.filter(r => r.systemType === 'PACS').length, synced: syncRecords.filter(r => r.systemType === 'PACS' && r.status === '已同步').length },
    { type: 'EMR', name: '电子病历系统', status: '已连接' as const, records: syncRecords.filter(r => r.systemType === 'EMR').length, synced: syncRecords.filter(r => r.systemType === 'EMR' && r.status === '已同步').length },
    { type: 'LIS', name: '检验信息系统', status: '部分异常' as const, records: syncRecords.filter(r => r.systemType === 'LIS').length, synced: syncRecords.filter(r => r.systemType === 'LIS' && r.status === '已同步').length },
    { type: 'RIS', name: '放射信息系统', status: '已连接' as const, records: syncRecords.filter(r => r.systemType === 'RIS').length, synced: syncRecords.filter(r => r.systemType === 'RIS' && r.status === '已同步').length },
  ], [syncRecords])
  
  return (
    <div>
      {/* 统计卡片 */}
      <div style={styles.statGrid}>
        <div style={styles.statCard(COLORS.primary, '#eff6ff')}>
          <div style={styles.statIcon(COLORS.primary)}>
            <Database size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{syncStats.total}</div>
            <div style={styles.statLabel}>同步记录总数</div>
          </div>
        </div>
        <div style={styles.statCard(COLORS.success, COLORS.successLight)}>
          <div style={styles.statIcon(COLORS.success)}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{syncStats.synced}</div>
            <div style={styles.statLabel}>已同步</div>
          </div>
        </div>
        <div style={styles.statCard(COLORS.danger, COLORS.dangerLight)}>
          <div style={styles.statIcon(COLORS.danger)}>
            <AlertOctagon size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{syncStats.failed}</div>
            <div style={styles.statLabel}>同步失败</div>
          </div>
        </div>
        <div style={styles.statCard(COLORS.secondary, COLORS.cyanLight)}>
          <div style={styles.statIcon(COLORS.secondary)}>
            <SyncIcon size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{syncStats.rate}%</div>
            <div style={styles.statLabel}>同步成功率</div>
          </div>
        </div>
      </div>
      
      {/* 系统连接状态 */}
      <div style={styles.card}>
        <div style={{ ...styles.cardTitle, marginBottom: '16px' }}>
          <Server size={18} color={COLORS.primary} />
          系统连接状态
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: COLORS.textMuted }}>
            最后刷新: {lastSyncTime}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                marginLeft: '12px',
                padding: '4px 8px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                backgroundColor: autoRefresh ? COLORS.successLight : COLORS.bgGray,
                color: autoRefresh ? COLORS.success : COLORS.textMuted,
              }}
            >
              {autoRefresh ? '自动刷新中' : '已暂停'}
            </button>
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {systemStatus.map(sys => (
            <div key={sys.type} style={{
              padding: '16px',
              backgroundColor: sys.status === '已连接' ? COLORS.successLight : sys.status === '部分异常' ? COLORS.warningLight : COLORS.dangerLight,
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: sys.status === '已连接' ? COLORS.success : sys.status === '部分异常' ? COLORS.warning : COLORS.danger,
                margin: '0 auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Server size={16} color="#fff" />
              </div>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{sys.type}</div>
              <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '8px' }}>{sys.name}</div>
              <div style={{ fontSize: '12px', color: sys.status === '已连接' ? COLORS.success : sys.status === '部分异常' ? COLORS.warning : COLORS.danger }}>
                {sys.status}
              </div>
              <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '4px' }}>
                {sys.synced}/{sys.records} 条
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 同步记录 */}
      <div style={styles.card}>
        <div style={{ ...styles.cardTitle, marginBottom: '12px' }}>
          <Network size={18} color={COLORS.primary} />
          同步记录
        </div>
        
        <div style={styles.searchBar}>
          <input
            style={styles.searchInput}
            placeholder="搜索患者姓名/ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select style={styles.select} value={systemFilter} onChange={e => setSystemFilter(e.target.value)}>
            <option value="全部">全部系统</option>
            <option value="HIS">HIS</option>
            <option value="PACS">PACS</option>
            <option value="EMR">EMR</option>
            <option value="LIS">LIS</option>
            <option value="RIS">RIS</option>
          </select>
          <select style={styles.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="全部">全部状态</option>
            <option value="已同步">已同步</option>
            <option value="同步中">同步中</option>
            <option value="失败">失败</option>
            <option value="待同步">待同步</option>
          </select>
          <button style={styles.btnOutline(COLORS.primary)} onClick={() => setSyncRecords(generateSyncRecords())}>
            <RefreshCw size={14} />
            刷新
          </button>
        </div>
        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>系统</th>
              <th style={styles.th}>数据类型</th>
              <th style={styles.th}>患者</th>
              <th style={styles.th}>同步时间</th>
              <th style={styles.th}>状态</th>
              <th style={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.slice(0, 15).map(record => (
              <tr key={record.id}>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SyncStatusIcon status={record.status} />
                    <SystemTypeBadge type={record.systemType} />
                  </div>
                </td>
                <td style={styles.td}>{record.recordType}</td>
                <td style={styles.td}>
                  <div style={{ fontWeight: 500 }}>{record.patientName}</div>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted }}>{record.patientId}</div>
                </td>
                <td style={styles.td}>{record.syncTime}</td>
                <td style={styles.td}>
                  <StatusBadge status={record.status} />
                  {record.errorMsg && (
                    <div style={{ fontSize: '11px', color: COLORS.danger, marginTop: '4px' }}>
                      {record.errorMsg}
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  {record.status === '失败' && (
                    <button style={styles.btn(COLORS.primary)}>
                      <RefreshCw size={12} />
                      重试
                    </button>
                  )}
                  {record.status === '同步中' && (
                    <button style={styles.btnOutline(COLORS.warning)}>
                      <Pause size={12} />
                      暂停
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== 数据质量监控组件 ====================
const DataQualityMonitor = () => {
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([])
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [levelFilter, setLevelFilter] = useState('全部')
  
  useEffect(() => {
    setQualityMetrics(generateQualityMetrics())
  }, [])
  
  const categoryStats = useMemo(() => {
    const categories = [...new Set(qualityMetrics.map(m => m.category))]
    return categories.map(cat => {
      const catMetrics = qualityMetrics.filter(m => m.category === cat)
      const avgScore = catMetrics.reduce((sum, m) => sum + m.score, 0) / catMetrics.length
      const issueCount = catMetrics.reduce((sum, m) => sum + m.issueCount, 0)
      return { category: cat, avgScore: Math.round(avgScore * 10) / 10, issueCount, metricCount: catMetrics.length }
    })
  }, [qualityMetrics])
  
  const overallScore = useMemo(() => {
    if (!qualityMetrics.length) return 0
    return Math.round(qualityMetrics.reduce((sum, m) => sum + m.score, 0) / qualityMetrics.length * 10) / 10
  }, [qualityMetrics])
  
  const levelCounts = useMemo(() => ({
    excellent: qualityMetrics.filter(m => m.level === '优').length,
    good: qualityMetrics.filter(m => m.level === '良').length,
    medium: qualityMetrics.filter(m => m.level === '中').length,
    poor: qualityMetrics.filter(m => m.level === '差').length,
  }), [qualityMetrics])
  
  const filteredMetrics = useMemo(() => {
    return qualityMetrics.filter(m => {
      const matchCat = categoryFilter === '全部' || m.category === categoryFilter
      const matchLevel = levelFilter === '全部' || m.level === levelFilter
      return matchCat && matchLevel
    })
  }, [qualityMetrics, categoryFilter, levelFilter])
  
  const pieData = [
    { name: '优', value: levelCounts.excellent, color: COLORS.success },
    { name: '良', value: levelCounts.good, color: COLORS.primaryLight },
    { name: '中', value: levelCounts.medium, color: COLORS.warning },
    { name: '差', value: levelCounts.poor, color: COLORS.danger },
  ]
  
  const radarData = categoryStats.map(c => ({
    category: c.category,
    score: c.avgScore,
    fullMark: 100,
  }))
  
  return (
    <div>
      {/* 统计概览 */}
      <div style={styles.statGrid}>
        <div style={styles.statCard(COLORS.primary, '#eff6ff')}>
          <div style={styles.statIcon(COLORS.primary)}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{overallScore}</div>
            <div style={styles.statLabel}>综合质量评分</div>
          </div>
        </div>
        <div style={styles.statCard(COLORS.success, COLORS.successLight)}>
          <div style={styles.statIcon(COLORS.success)}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{levelCounts.excellent}</div>
            <div style={styles.statLabel}>优秀指标</div>
          </div>
        </div>
        <div style={styles.statCard(COLORS.warning, COLORS.warningLight)}>
          <div style={styles.statIcon(COLORS.warning)}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{qualityMetrics.reduce((sum, m) => sum + m.issueCount, 0)}</div>
            <div style={styles.statLabel}>待处理问题</div>
          </div>
        </div>
        <div style={styles.statCard(COLORS.danger, COLORS.dangerLight)}>
          <div style={styles.statIcon(COLORS.danger)}>
            <AlertOctagon size={20} />
          </div>
          <div>
            <div style={styles.statValue}>{levelCounts.poor}</div>
            <div style={styles.statLabel}>需改进指标</div>
          </div>
        </div>
      </div>
      
      {/* 图表区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* 质量分布饼图 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <PieChartIcon size={18} color={COLORS.primary} />
            质量等级分布
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {pieData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: item.color }} />
                  <span style={{ fontSize: '13px', width: '30px' }}>{item.name}</span>
                  <span style={{ fontSize: '13px', color: COLORS.textMuted }}>{item.value}项</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 雷达图 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <BarChart2 size={18} color={COLORS.primary} />
            类别质量对比
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="质量评分" dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 类别统计 */}
      <div style={styles.card}>
        <div style={{ ...styles.cardTitle, marginBottom: '16px' }}>
          <ActivityIcon size={18} color={COLORS.primary} />
          各类别质量概况
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {categoryStats.map(cat => (
            <div key={cat.category} style={{
              padding: '16px',
              backgroundColor: COLORS.bgGray,
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px' }}>{cat.category}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: cat.avgScore >= 95 ? COLORS.success : cat.avgScore >= 90 ? COLORS.primaryLight : cat.avgScore >= 85 ? COLORS.warning : COLORS.danger }}>
                {cat.avgScore}
              </div>
              <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '4px' }}>
                {cat.issueCount} 个问题
              </div>
              <div style={{ marginTop: '8px' }}>
                <div style={{ ...styles.progress(100, ''), height: '4px' }}>
                  <div style={{ ...styles.progressBar(cat.avgScore, cat.avgScore >= 95 ? COLORS.success : cat.avgScore >= 90 ? COLORS.primaryLight : cat.avgScore >= 85 ? COLORS.warning : COLORS.danger), width: `${cat.avgScore}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 质量指标明细 */}
      <div style={styles.card}>
        <div style={{ ...styles.cardTitle, marginBottom: '12px' }}>
          <LineChart size={18} color={COLORS.primary} />
          质量指标明细
        </div>
        
        <div style={styles.searchBar}>
          <select style={styles.select} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="全部">全部类别</option>
            <option value="数据完整性">数据完整性</option>
            <option value="数据准确性">数据准确性</option>
            <option value="数据时效性">数据时效性</option>
            <option value="数据一致性">数据一致性</option>
            <option value="数据标准化">数据标准化</option>
          </select>
          <select style={styles.select} value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
            <option value="全部">全部等级</option>
            <option value="优">优</option>
            <option value="良">良</option>
            <option value="中">中</option>
            <option value="差">差</option>
          </select>
          <button style={styles.btnOutline(COLORS.primary)} onClick={() => setQualityMetrics(generateQualityMetrics())}>
            <RefreshCw size={14} />
            刷新
          </button>
        </div>
        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>类别</th>
              <th style={styles.th}>指标名称</th>
              <th style={styles.th}>评分</th>
              <th style={styles.th}>等级</th>
              <th style={styles.th}>趋势</th>
              <th style={styles.th}>问题数</th>
              <th style={styles.th}>质量趋势</th>
            </tr>
          </thead>
          <tbody>
            {filteredMetrics.map((metric, i) => (
              <tr key={i}>
                <td style={styles.td}>
                  <span style={styles.badge(COLORS.primary, '#eff6ff')}>{metric.category}</span>
                </td>
                <td style={styles.td}>
                  <div style={{ fontWeight: 500 }}>{metric.metric}</div>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '2px' }}>{metric.description}</div>
                </td>
                <td style={styles.td}>
                  <span style={{ fontWeight: 700, fontSize: '16px', color: metric.score >= 95 ? COLORS.success : metric.score >= 90 ? COLORS.primaryLight : metric.score >= 85 ? COLORS.warning : COLORS.danger }}>
                    {metric.score}
                  </span>
                  <span style={{ fontSize: '11px', color: COLORS.textMuted }}>%</span>
                </td>
                <td style={styles.td}><QualityBadge level={metric.level} /></td>
                <td style={styles.td}><TrendIcon trend={metric.trend} /></td>
                <td style={styles.td}>
                  <span style={{ color: metric.issueCount > 20 ? COLORS.danger : metric.issueCount > 10 ? COLORS.warning : COLORS.success }}>
                    {metric.issueCount}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{ width: '100px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ ...styles.progress(100, ''), flex: 1 }}>
                      <div style={{ ...styles.progressBar(metric.score, metric.score >= 95 ? COLORS.success : metric.score >= 90 ? COLORS.primaryLight : metric.score >= 85 ? COLORS.warning : COLORS.danger), width: `${metric.score}%` }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== 主组件 ====================
export default function ClinicalDataPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('patient360')
  
  return (
    <div style={styles.pageContainer}>
      {/* 顶部标题栏 */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            <Database size={24} />
            临床数据中心
          </div>
          <div style={styles.headerSubtitle}>
            患者360视图 · 跨系统数据同步 · 数据质量监控
          </div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.headerBtn}>
            <Bell size={16} />
            提醒
          </button>
          <button style={styles.headerBtn}>
            <Settings size={16} />
            设置
          </button>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div style={styles.content}>
        {/* 标签页切换 */}
        <div style={styles.tabContainer}>
          <button
            style={styles.tab(activeTab === 'patient360')}
            onClick={() => setActiveTab('patient360')}
          >
            <User size={16} />
            患者360视图
          </button>
          <button
            style={styles.tab(activeTab === 'sync')}
            onClick={() => setActiveTab('sync')}
          >
            <SyncIcon size={16} />
            跨系统同步
          </button>
          <button
            style={styles.tab(activeTab === 'quality')}
            onClick={() => setActiveTab('quality')}
          >
            <ShieldCheck size={16} />
            数据质量
          </button>
        </div>
        
        {/* 内容 */}
        {activeTab === 'patient360' && <Patient360View />}
        {activeTab === 'sync' && <CrossSystemSync />}
        {activeTab === 'quality' && <DataQualityMonitor />}
      </div>
    </div>
  )
}
