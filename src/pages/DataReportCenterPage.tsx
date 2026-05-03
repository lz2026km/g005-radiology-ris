// @ts-nocheck
// G005 放射RIS系统 - 数据上报中心页面 v1.0.0
// 功能：检查量统计/设备使用率/报告质量评分/辐射剂量统计/会诊统计
import { useState, useEffect } from 'react'
import {
  // 统计图表相关图标
  BarChart3, PieChart as PieChartIcon, Activity, TrendingUp, TrendingDown,
  // 上报相关图标
  Upload, Download, FileText, CheckCircle, AlertTriangle, Clock, ShieldCheck,
  // 设备相关图标
  Monitor, Scan, Radio, Image, Gauge, Percent,
  // 会诊统计图标
  Video, MessageSquare, Users,
  // 通用图标
  Calendar, Search, Filter, RefreshCw, ChevronRight, Plus, Edit3, Eye,
  Settings, MoreVertical, X, Check, ArrowRight, Circle, FileSpreadsheet,
  Building2, Database, Network, Server, Globe, AlertCircle, CheckSquare,
  Wrench, Award, Target, Timer, Zap
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
  Area
} from 'recharts'

// ============ 样式常量 ============
const COLORS = {
  primary: '#1e40af',      // 深蓝主色
  primaryLight: '#3b82f6', // 浅蓝
  secondary: '#0891b2',    // 青色辅色
  success: '#16a34a',     // 成功绿
  successLight: '#dcfce7',
  warning: '#d97706',     // 警告橙
  warningLight: '#fef3c7',
  danger: '#dc2626',      // 危险红
  dangerLight: '#fee2e2',
  bgGray: '#f1f5f9',       // 浅灰背景
  cardWhite: '#ffffff',   // 白色卡片
  textDark: '#1f2937',    // 深色文字
  textMuted: '#6b7280',   // 灰色文字
  border: '#e5e7eb',      // 边框色
  ct: '#3b82f6',          // CT颜色
  mri: '#8b5cf6',         // MRI颜色
  dr: '#10b981',          // DR颜色
  mg: '#f59e0b',          // MG颜色
  dsa: '#ef4444',         // DSA颜色
  cr: '#6366f1',          // CR颜色
}

const styles = {
  // 页面容器
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: COLORS.bgGray,
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '14px',
    color: COLORS.textDark,
  },
  // 顶部标题栏
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
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  // 统计卡片容器
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
    padding: '20px 24px',
  },
  statCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: '10px',
    padding: '18px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  statCardAccent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
  },
  statLabel: {
    fontSize: '12px',
    color: COLORS.textMuted,
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: COLORS.primary,
  },
  statUnit: {
    fontSize: '14px',
    fontWeight: 400,
    color: COLORS.textMuted,
    marginLeft: '4px',
  },
  statChange: {
    fontSize: '11px',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  // 主内容区
  mainContent: {
    padding: '0 24px 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  // 标签页导航
  tabsContainer: {
    display: 'flex',
    gap: '4px',
    backgroundColor: COLORS.cardWhite,
    padding: '6px',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
  },
  tab: {
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    border: 'none',
    backgroundColor: 'transparent',
    color: COLORS.textMuted,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    color: 'white',
    boxShadow: '0 2px 4px rgba(30,64,175,0.3)',
  },
  // 卡片面板
  card: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '14px 18px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: COLORS.textDark,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardBody: {
    padding: '18px',
  },
  // 筛选栏
  filterBar: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    padding: '14px 18px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '13px',
    color: COLORS.textMuted,
  },
  select: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  input: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    outline: 'none',
  },
  // 按钮样式
  btn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    color: 'white',
  },
  btnOutline: {
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    color: COLORS.textDark,
  },
  btnSuccess: {
    backgroundColor: COLORS.success,
    color: 'white',
  },
  btnWarning: {
    backgroundColor: COLORS.warning,
    color: 'white',
  },
  // 表格样式
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    backgroundColor: '#f8fafc',
    padding: '12px 14px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: COLORS.textDark,
    borderBottom: '2px solid #e5e7eb',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #e5e7eb',
    color: COLORS.textDark,
  },
  // 状态标签
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  // 图表容器
  chartContainer: {
    height: '320px',
    width: '100%',
  },
  chartSmall: {
    height: '240px',
    width: '100%',
  },
  // 网格布局
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
  // 列表项
  listItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  // 进度条
  progressBar: {
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  // 模态框
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  modalBody: {
    padding: '20px',
  },
  // 分页
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#fafafa',
  },
  // 空状态
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: COLORS.textMuted,
  },
}

// ============ 模拟数据 ============
const REPORT_STATUS_COLORS = {
  '已上报': COLORS.success,
  '待上报': COLORS.warning,
  '上报中': COLORS.primaryLight,
  '上报失败': COLORS.danger,
  '已确认': COLORS.success,
  '待确认': COLORS.warning,
}

// 检查量统计数据
const examVolumeData = [
  { month: '1月', CT: 2450, MR: 1580, DR: 4200, MG: 380, DSA: 120 },
  { month: '2月', CT: 2280, MR: 1420, DR: 3850, MG: 350, DSA: 105 },
  { month: '3月', CT: 2650, MR: 1680, DR: 4450, MG: 420, DSA: 135 },
  { month: '4月', CT: 2520, MR: 1720, DR: 4380, MG: 400, DSA: 128 },
  { month: '5月', CT: 2780, MR: 1850, DR: 4620, MG: 440, DSA: 142 },
  { month: '6月', CT: 2890, MR: 1920, DR: 4800, MG: 460, DSA: 155 },
]

// 设备使用率数据
const deviceUsageData = [
  { name: 'CT-1', usage: 92, avgReport: 45, status: '正常运行' },
  { name: 'CT-2', usage: 78, avgReport: 52, status: '正常运行' },
  { name: 'MR-1', usage: 88, avgReport: 38, status: '正常运行' },
  { name: 'MR-2', usage: 65, avgReport: 42, status: '维护中' },
  { name: 'DR-1', usage: 85, avgReport: 28, status: '正常运行' },
  { name: 'DR-2', usage: 72, avgReport: 25, status: '正常运行' },
  { name: 'DSA', usage: 58, avgReport: 68, status: '正常运行' },
  { name: 'MG', usage: 82, avgReport: 22, status: '正常运行' },
]

// 报告质量评分数据
const qualityScoreData = [
  { name: 'CT', score: 96.5, excellent: 89, good: 8, pass: 3, fail: 0 },
  { name: 'MR', score: 94.8, excellent: 85, good: 10, pass: 4, fail: 1 },
  { name: 'DR', score: 98.2, excellent: 92, good: 6, pass: 2, fail: 0 },
  { name: 'MG', score: 93.6, excellent: 82, good: 12, pass: 5, fail: 1 },
  { name: 'DSA', score: 97.1, excellent: 91, good: 7, pass: 2, fail: 0 },
]

// 辐射剂量统计数据
const doseData = [
  { month: '1月', CT_DLP: 42500, CT_Dose: 1250, DR_Dose: 85, MG_Dose: 12 },
  { month: '2月', CT_DLP: 41200, CT_Dose: 1180, DR_Dose: 82, MG_Dose: 11 },
  { month: '3月', CT_DLP: 43800, CT_Dose: 1320, DR_Dose: 88, MG_Dose: 13 },
  { month: '4月', CT_DLP: 42100, CT_Dose: 1280, DR_Dose: 86, MG_Dose: 12 },
  { month: '5月', CT_DLP: 45200, CT_Dose: 1380, DR_Dose: 90, MG_Dose: 14 },
  { month: '6月', CT_DLP: 46800, CT_Dose: 1420, DR_Dose: 92, MG_Dose: 14 },
]

// 会诊统计数据
const consultationData = [
  { type: '疑难病例会诊', total: 156, completed: 142, pending: 12, avgTime: '2.5h' },
  { type: '远程影像会诊', total: 89, completed: 85, pending: 4, avgTime: '1.8h' },
  { type: '术中快速冰冻', total: 45, completed: 45, pending: 0, avgTime: '0.5h' },
  { type: '临床科室会诊', total: 234, completed: 220, pending: 14, avgTime: '3.2h' },
]

// 待上报记录
const pendingReports = [
  { id: 'RPT20260501001', patient: '张伟', modality: 'CT', examType: '胸部增强', doctor: '李明', reportTime: '2026-05-02 09:30', status: '待上报' },
  { id: 'RPT20260501002', patient: '王芳', modality: 'MR', examType: '颅脑平扫', doctor: '赵强', reportTime: '2026-05-02 10:15', status: '待上报' },
  { id: 'RPT20260501003', patient: '李娜', modality: 'DR', examType: '胸部正侧位', doctor: '孙磊', reportTime: '2026-05-02 11:00', status: '上报中' },
  { id: 'RPT20260501004', patient: '刘洋', modality: 'CT', examType: '腹部增强', doctor: '李明', reportTime: '2026-05-02 14:20', status: '待上报' },
  { id: 'RPT20260501005', patient: '陈静', modality: 'MG', examType: '乳腺钼靶', doctor: '周琳', reportTime: '2026-05-02 15:45', status: '上报失败' },
]

// ============ 组件 ============

// 统计卡片组件
const StatCard = ({ icon: Icon, label, value, unit, change, changeType, color }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statCardAccent, backgroundColor: color || COLORS.primary }} />
    <div style={styles.statLabel}>
      <Icon size={16} />
      {label}
    </div>
    <div style={styles.statValue}>
      {value}
      <span style={styles.statUnit}>{unit}</span>
    </div>
    {change && (
      <div style={{ ...styles.statChange, color: changeType === 'up' ? COLORS.success : COLORS.danger }}>
        {changeType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change}
      </div>
    )}
  </div>
)

// 设备使用率环形图
const DeviceUsageChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.usage, 0)
  const avgUsage = Math.round(total / data.length)
  
  return (
    <div style={styles.chartSmall}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value) => [`${value}%`, '使用率']}
            contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="usage" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.usage >= 80 ? COLORS.success : entry.usage >= 60 ? COLORS.warning : COLORS.danger} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// 质量评分柱状图
const QualityScoreChart = ({ data }) => (
  <div style={styles.chartSmall}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis domain={[85, 100]} tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value) => [`${value}%`, '评分']}
          contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }}
        />
        <Bar dataKey="score" fill={COLORS.primary} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.score >= 95 ? COLORS.success : entry.score >= 90 ? COLORS.primaryLight : COLORS.warning} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
)

// 剂量趋势图
const DoseTrendChart = ({ data }) => (
  <div style={styles.chartContainer}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }} />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="CT_DLP" name="CT-DLP (mGy·cm)" stroke={COLORS.ct} strokeWidth={2} dot={{ r: 4 }} />
        <Line yAxisId="right" type="monotone" dataKey="CT_Dose" name="CT有效剂量 (mSv)" stroke={COLORS.mri} strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

// 会诊统计饼图
const ConsultationPieChart = ({ data }) => {
  const chartData = data.map(d => ({ name: d.type, value: d.total }))
  return (
    <div style={styles.chartSmall}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={[COLORS.ct, COLORS.mri, COLORS.dr, COLORS.mg][index % 4]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// 检查量堆叠柱状图
const ExamVolumeChart = ({ data }) => (
  <div style={styles.chartContainer}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }} />
        <Legend />
        <Bar dataKey="CT" stackId="a" fill={COLORS.ct} radius={[0, 0, 0, 0]} />
        <Bar dataKey="MR" stackId="a" fill={COLORS.mri} />
        <Bar dataKey="DR" stackId="a" fill={COLORS.dr} />
        <Bar dataKey="MG" stackId="a" fill={COLORS.mg} />
        <Bar dataKey="DSA" stackId="a" fill={COLORS.dsa} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

// ============ 主组件 ============
export default function DataReportCenterPage() {
  const [activeTab, setActiveTab] = useState('examVolume')
  const [dateRange, setDateRange] = useState('2026-05')
  const [modality, setModality] = useState('全部')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportType, setExportType] = useState('')
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [selectedExportFormat, setSelectedExportFormat] = useState('excel')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadDataType, setUploadDataType] = useState('')
  const [showNewConsultationModal, setShowNewConsultationModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)

  const tabs = [
    { id: 'examVolume', label: '检查量统计', icon: BarChart3 },
    { id: 'deviceUsage', label: '设备使用率', icon: Gauge },
    { id: 'qualityScore', label: '报告质量评分', icon: Award },
    { id: 'doseStats', label: '辐射剂量统计', icon: Zap },
    { id: 'consultation', label: '会诊统计', icon: Video },
  ]

  // 计算统计数据
  const totalExams = examVolumeData.reduce((sum, d) => sum + d.CT + d.MR + d.DR + d.MG + d.DSA, 0)
  const avgDeviceUsage = Math.round(deviceUsageData.reduce((sum, d) => sum + d.usage, 0) / deviceUsageData.length)
  const avgQualityScore = (qualityScoreData.reduce((sum, d) => sum + d.score, 0) / qualityScoreData.length).toFixed(1)
  const totalDose = doseData.reduce((sum, d) => sum + d.CT_DLP, 0)
  const totalConsultations = consultationData.reduce((sum, d) => sum + d.total, 0)

  const handleExport = (type) => {
    setExportType(type)
    setShowExportModal(true)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'examVolume':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <BarChart3 size={18} />
                  月度检查量趋势
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => handleExport('examVolume')}>
                    <Download size={14} /> 导出Excel
                  </button>
                  <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { setUploadDataType('examVolume'); setShowUploadModal(true); }}>
                    <Upload size={14} /> 上报数据
                  </button>
                </div>
              </div>
              <div style={{ padding: '18px' }}>
                <ExamVolumeChart data={examVolumeData} />
              </div>
            </div>
            <div style={styles.grid2}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <PieChartIcon size={18} />
                    设备类型分布
                  </div>
                </div>
                <div style={{ padding: '18px', height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'CT', value: examVolumeData.reduce((s, d) => s + d.CT, 0) },
                          { name: 'MR', value: examVolumeData.reduce((s, d) => s + d.MR, 0) },
                          { name: 'DR', value: examVolumeData.reduce((s, d) => s + d.DR, 0) },
                          { name: 'MG', value: examVolumeData.reduce((s, d) => s + d.MG, 0) },
                          { name: 'DSA', value: examVolumeData.reduce((s, d) => s + d.DSA, 0) },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      >
                        {[COLORS.ct, COLORS.mri, COLORS.dr, COLORS.mg, COLORS.dsa].map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <Activity size={18} />
                    待上报检查列表
                  </div>
                  <span style={{ ...styles.statusBadge, backgroundColor: COLORS.warningLight, color: COLORS.warning }}>
                    {pendingReports.length} 条待处理
                  </span>
                </div>
                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {pendingReports.slice(0, 5).map((item, idx) => (
                    <div key={idx} style={{ ...styles.listItem, borderLeft: `3px solid ${REPORT_STATUS_COLORS[item.status] || COLORS.border}` }}>
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: '2px' }}>{item.patient}</div>
                        <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                          {item.modality} | {item.examType} | {item.doctor}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ ...styles.statusBadge, backgroundColor: `${REPORT_STATUS_COLORS[item.status]}20`, color: REPORT_STATUS_COLORS[item.status] }}>
                          {item.status}
                        </span>
                        <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '4px' }}>{item.reportTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'deviceUsage':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <Gauge size={18} />
                  各设备使用率
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => handleExport('deviceUsage')}>
                    <Download size={14} /> 导出报表
                  </button>
                  <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { setUploadDataType('deviceUsage'); setShowUploadModal(true); }}>
                    <Upload size={14} /> 上报数据
                  </button>
                </div>
              </div>
              <div style={{ padding: '18px' }}>
                <DeviceUsageChart data={deviceUsageData} />
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <Monitor size={18} />
                  设备详细列表
                </div>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>设备名称</th>
                    <th style={styles.th}>使用率</th>
                    <th style={styles.th}>平均报告时间</th>
                    <th style={styles.th}>状态</th>
                    <th style={styles.th}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {deviceUsageData.map((device, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{device.name}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ ...styles.progressBar, width: '100px' }}>
                            <div style={{ ...styles.progressFill, width: `${device.usage}%`, backgroundColor: device.usage >= 80 ? COLORS.success : device.usage >= 60 ? COLORS.warning : COLORS.danger }} />
                          </div>
                          <span style={{ fontWeight: 500 }}>{device.usage}%</span>
                        </div>
                      </td>
                      <td style={styles.td}>{device.avgReport} min</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, backgroundColor: device.status === '正常运行' ? COLORS.successLight : COLORS.warningLight, color: device.status === '正常运行' ? COLORS.success : COLORS.warning }}>
                          <Circle size={6} fill="currentColor" />
                          {device.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button style={{ ...styles.btn, ...styles.btnOutline, padding: '4px 10px' }} onClick={() => setSelectedDevice(device)}>
                          <Eye size={12} /> 查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'qualityScore':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <Award size={18} />
                  报告质量评分
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => handleExport('qualityScore')}>
                    <Download size={14} /> 导出报表
                  </button>
                  <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { setUploadDataType('qualityScore'); setShowUploadModal(true); }}>
                    <Upload size={14} /> 上报数据
                  </button>
                </div>
              </div>
              <div style={{ padding: '18px' }}>
                <QualityScoreChart data={qualityScoreData} />
              </div>
            </div>
            <div style={styles.grid2}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <Target size={18} />
                    评分等级分布
                  </div>
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>设备类型</th>
                      <th style={styles.th}>优秀率</th>
                      <th style={styles.th}>良好率</th>
                      <th style={styles.th}>合格率</th>
                      <th style={styles.th}>不合格</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualityScoreData.map((item, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{item.name}</td>
                        <td style={styles.td}>
                          <span style={{ color: COLORS.success, fontWeight: 500 }}>{item.excellent}%</span>
                        </td>
                        <td style={styles.td}>{item.good}%</td>
                        <td style={styles.td}>{item.pass}%</td>
                        <td style={styles.td}>
                          <span style={{ color: item.fail > 0 ? COLORS.danger : COLORS.textMuted }}>{item.fail}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <CheckCircle size={18} />
                    质量控制要点
                  </div>
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: COLORS.textMuted }}>报告完整率</span>
                      <span style={{ fontWeight: 600 }}>98.5%</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: '98.5%', backgroundColor: COLORS.success }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: COLORS.textMuted }}>诊断符合率</span>
                      <span style={{ fontWeight: 600 }}>96.2%</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: '96.2%', backgroundColor: COLORS.primaryLight }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: COLORS.textMuted }}>时效达标率</span>
                      <span style={{ fontWeight: 600 }}>94.8%</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: '94.8%', backgroundColor: COLORS.mri }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: COLORS.textMuted }}>危急值通报率</span>
                      <span style={{ fontWeight: 600 }}>100%</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: '100%', backgroundColor: COLORS.success }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'doseStats':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <Zap size={18} />
                  辐射剂量趋势
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => handleExport('doseStats')}>
                    <Download size={14} /> 导出报表
                  </button>
                  <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { setUploadDataType('doseStats'); setShowUploadModal(true); }}>
                    <Upload size={14} /> 上报数据
                  </button>
                </div>
              </div>
              <div style={{ padding: '18px' }}>
                <DoseTrendChart data={doseData} />
              </div>
            </div>
            <div style={styles.grid3}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <Scan size={18} />
                    CT剂量统计
                  </div>
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: COLORS.ct }}>46,800</div>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>本月CT-DLP (mGy·cm)</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ backgroundColor: '#f0f9ff', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.ct }}>1,420</div>
                      <div style={{ fontSize: '11px', color: COLORS.textMuted }}>有效剂量(mSv)</div>
                    </div>
                    <div style={{ backgroundColor: '#f0f9ff', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.ct }}>2,890</div>
                      <div style={{ fontSize: '11px', color: COLORS.textMuted }}>检查例数</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <Image size={18} />
                    DR剂量统计
                  </div>
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: COLORS.dr }}>92</div>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>本月DR总剂量 (μSv)</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.dr }}>4,800</div>
                      <div style={{ fontSize: '11px', color: COLORS.textMuted }}>检查例数</div>
                    </div>
                    <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.dr }}>0.019</div>
                      <div style={{ fontSize: '11px', color: COLORS.textMuted }}>平均剂量(μSv)</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <Radio size={18} />
                    乳腺MG剂量统计
                  </div>
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: COLORS.mg }}>14</div>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted }}>本月MG总剂量 (mGy)</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ backgroundColor: '#fffbeb', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.mg }}>460</div>
                      <div style={{ fontSize: '11px', color: COLORS.textMuted }}>检查例数</div>
                    </div>
                    <div style={{ backgroundColor: '#fffbeb', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.mg }}>0.03</div>
                      <div style={{ fontSize: '11px', color: COLORS.textMuted }}>平均剂量(mGy)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <ShieldCheck size={18} />
                  剂量合规检查
                </div>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>检查类型</th>
                    <th style={styles.th}>检查例数</th>
                    <th style={styles.th}>平均DLP</th>
                    <th style={styles.th}>参考水平</th>
                    <th style={styles.th}>超标例数</th>
                    <th style={styles.th}>合规率</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={styles.td}>成人胸部CT</td>
                    <td style={styles.td}>1,250</td>
                    <td style={styles.td}>520 mGy·cm</td>
                    <td style={styles.td}>800 mGy·cm</td>
                    <td style={styles.td}><span style={{ color: COLORS.success }}>0</span></td>
                    <td style={styles.td}><span style={{ color: COLORS.success, fontWeight: 600 }}>100%</span></td>
                  </tr>
                  <tr>
                    <td style={styles.td}>成人腹部CT</td>
                    <td style={styles.td}>890</td>
                    <td style={styles.td}>780 mGy·cm</td>
                    <td style={styles.td}>1000 mGy·cm</td>
                    <td style={styles.td}><span style={{ color: COLORS.success }}>0</span></td>
                    <td style={styles.td}><span style={{ color: COLORS.success, fontWeight: 600 }}>100%</span></td>
                  </tr>
                  <tr>
                    <td style={styles.td}>儿童头部CT</td>
                    <td style={styles.td}>320</td>
                    <td style={styles.td}>680 mGy·cm</td>
                    <td style={styles.td}>900 mGy·cm</td>
                    <td style={styles.td}><span style={{ color: COLORS.success }}>0</span></td>
                    <td style={styles.td}><span style={{ color: COLORS.success, fontWeight: 600 }}>100%</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'consultation':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.grid2}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <Video size={18} />
                    会诊类型分布
                  </div>
                  <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => handleExport('consultation')}>
                    <Download size={14} /> 导出报表
                  </button>
                </div>
                <div style={{ padding: '18px' }}>
                  <ConsultationPieChart data={consultationData} />
                </div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <Users size={18} />
                    会诊完成情况
                  </div>
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>会诊类型</th>
                      <th style={styles.th}>总数</th>
                      <th style={styles.th}>已完成</th>
                      <th style={styles.th}>进行中</th>
                      <th style={styles.th}>平均耗时</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultationData.map((item, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{item.type}</td>
                        <td style={styles.td}>{item.total}</td>
                        <td style={styles.td}>
                          <span style={{ color: COLORS.success }}>{item.completed}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: item.pending > 0 ? COLORS.warning : COLORS.textMuted }}>{item.pending}</span>
                        </td>
                        <td style={styles.td}>{item.avgTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <MessageSquare size={18} />
                  会诊记录列表
                </div>
                <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => setShowNewConsultationModal(true)}>
                  <Plus size={14} /> 新建会诊
                </button>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>会诊编号</th>
                    <th style={styles.th}>患者姓名</th>
                    <th style={styles.th}>会诊类型</th>
                    <th style={styles.th}>申请医生</th>
                    <th style={styles.th}>会诊医生</th>
                    <th style={styles.th}>申请时间</th>
                    <th style={styles.th}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={styles.td}>CON20260501001</td>
                    <td style={styles.td}>王建国</td>
                    <td style={styles.td}>疑难病例会诊</td>
                    <td style={styles.td}>李明</td>
                    <td style={styles.td}>张华</td>
                    <td style={styles.td}>2026-05-01 09:30</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, backgroundColor: COLORS.successLight, color: COLORS.success }}>
                        <CheckCircle size={10} /> 已完成
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.td}>CON20260501002</td>
                    <td style={styles.td}>赵小红</td>
                    <td style={styles.td}>远程影像会诊</td>
                    <td style={styles.td}>孙磊</td>
                    <td style={styles.td}>周琳</td>
                    <td style={styles.td}>2026-05-01 14:20</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, backgroundColor: COLORS.successLight, color: COLORS.success }}>
                        <CheckCircle size={10} /> 已完成
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.td}>CON20260501003</td>
                    <td style={styles.td}>刘伟</td>
                    <td style={styles.td}>临床科室会诊</td>
                    <td style={styles.td}>王强</td>
                    <td style={styles.td}>陈明</td>
                    <td style={styles.td}>2026-05-02 10:00</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, backgroundColor: COLORS.primaryLight + '30', color: COLORS.primaryLight }}>
                        <Clock size={10} /> 进行中
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={styles.pageContainer}>
      {/* 顶部标题栏 */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            <Database size={24} />
            数据上报中心
          </div>
          <div style={styles.headerSubtitle}>数据导出上报 / 检查量统计 / 设备使用率 / 报告质量 / 辐射剂量 / 会诊统计</div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.headerBtn} onClick={() => setDateRange(dateRange)}>
            <Calendar size={14} />
            {dateRange}
          </button>
          <button style={styles.headerBtn} onClick={() => { setDateRange(''); setTimeout(() => setDateRange('2026-05'), 0); }}>
            <RefreshCw size={14} />
            刷新数据
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={styles.statsContainer}>
        <StatCard
          icon={BarChart3}
          label="总检查量"
          value="17,816"
          unit="例"
          change="↑ 12.5% 较上月"
          changeType="up"
          color={COLORS.primary}
        />
        <StatCard
          icon={Gauge}
          label="设备使用率"
          value={avgDeviceUsage}
          unit="%"
          change="↑ 3.2% 较上月"
          changeType="up"
          color={COLORS.secondary}
        />
        <StatCard
          icon={Award}
          label="平均质量评分"
          value={avgQualityScore}
          unit="分"
          change="↑ 0.8 较上月"
          changeType="up"
          color={COLORS.success}
        />
        <StatCard
          icon={Zap}
          label="本月总剂量"
          value="46,800"
          unit="mGy·cm"
          change="↓ 2.1% 较上月"
          changeType="down"
          color={COLORS.warning}
        />
        <StatCard
          icon={Video}
          label="会诊总数"
          value={totalConsultations}
          unit="例"
          change="↑ 8.3% 较上月"
          changeType="up"
          color={COLORS.mri}
        />
      </div>

      {/* 标签页 */}
      <div style={{ padding: '0 24px' }}>
        <div style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 主内容 */}
      <div style={styles.mainContent}>
        {/* 筛选栏 */}
        <div style={styles.card}>
          <div style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>日期:</span>
              <select style={styles.select} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="2026-05">2026年5月</option>
                <option value="2026-04">2026年4月</option>
                <option value="2026-03">2026年3月</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>设备类型:</span>
              <select style={styles.select} value={modality} onChange={(e) => setModality(e.target.value)}>
                <option value="全部">全部</option>
                <option value="CT">CT</option>
                <option value="MR">MR</option>
                <option value="DR">DR</option>
                <option value="MG">MG</option>
                <option value="DSA">DSA</option>
              </select>
            </div>
            <div style={{ flex: 1 }} />
            <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}>
              <Filter size={14} />
              高级筛选
            </button>
          </div>

          {/* 标签页内容 */}
          {renderTabContent()}
        </div>
      </div>

      {/* 导出确认模态框 */}
      {showExportModal && (
        <div style={styles.modalOverlay} onClick={() => setShowExportModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>确认导出</div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                onClick={() => setShowExportModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ marginBottom: '16px' }}>
                确定要导出 <strong>{exportType === 'examVolume' ? '检查量统计' : exportType === 'deviceUsage' ? '设备使用率' : exportType === 'qualityScore' ? '报告质量评分' : exportType === 'doseStats' ? '辐射剂量统计' : '会诊统计'}</strong> 数据吗？
              </p>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: COLORS.textMuted, marginBottom: '8px' }}>导出格式</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ ...styles.btn, ...(selectedExportFormat === 'excel' ? styles.btnPrimary : styles.btnOutline) }} onClick={() => setSelectedExportFormat('excel')}>Excel (.xlsx)</button>
                  <button style={{ ...styles.btn, ...(selectedExportFormat === 'csv' ? styles.btnPrimary : styles.btnOutline) }} onClick={() => setSelectedExportFormat('csv')}>CSV (.csv)</button>
                  <button style={{ ...styles.btn, ...(selectedExportFormat === 'pdf' ? styles.btnPrimary : styles.btnOutline) }} onClick={() => setSelectedExportFormat('pdf')}>PDF (.pdf)</button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => setShowExportModal(false)}>
                  取消
                </button>
                <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { console.log(`导出 ${exportType} 数据，格式: ${selectedExportFormat}`); setShowExportModal(false); }}>
                  <Download size={14} /> 确认导出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 上报确认模态框 */}
      {showUploadModal && (
        <div style={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>确认上报</div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                onClick={() => setShowUploadModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ marginBottom: '16px' }}>
                确定要上报 <strong>{uploadDataType === 'examVolume' ? '检查量统计' : uploadDataType === 'deviceUsage' ? '设备使用率' : uploadDataType === 'qualityScore' ? '报告质量评分' : uploadDataType === 'doseStats' ? '辐射剂量统计' : '会诊统计'}</strong> 数据吗？
              </p>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: COLORS.textMuted, marginBottom: '8px' }}>上报说明</div>
                <div style={{ fontSize: '13px' }}>
                  上报数据将加密传输至卫生健康委员会数据平台，请确认数据准确性。
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => setShowUploadModal(false)}>
                  取消
                </button>
                <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { console.log(`上报 ${uploadDataType} 数据`); setShowUploadModal(false); }}>
                  <Upload size={14} /> 确认上报
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 设备详情模态框 */}
      {selectedDevice && (
        <div style={styles.modalOverlay} onClick={() => setSelectedDevice(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>设备详情 - {selectedDevice.name}</div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                onClick={() => setSelectedDevice(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>设备名称</div>
                  <div style={{ fontWeight: 500 }}>{selectedDevice.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>使用率</div>
                  <div style={{ fontWeight: 500, color: selectedDevice.usage >= 80 ? COLORS.success : selectedDevice.usage >= 60 ? COLORS.warning : COLORS.danger }}>{selectedDevice.usage}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>平均报告时间</div>
                  <div style={{ fontWeight: 500 }}>{selectedDevice.avgReport} min</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>状态</div>
                  <div style={{ fontWeight: 500, color: selectedDevice.status === '正常运行' ? COLORS.success : COLORS.warning }}>{selectedDevice.status}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => setSelectedDevice(null)}>
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新建会诊模态框 */}
      {showNewConsultationModal && (
        <div style={styles.modalOverlay} onClick={() => setShowNewConsultationModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>新建会诊</div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                onClick={() => setShowNewConsultationModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ marginBottom: '16px' }}>
                会诊功能正在开发中，敬请期待。
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => setShowNewConsultationModal(false)}>
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 高级筛选展开区域 */}
      {showAdvancedFilter && (
        <div style={{ ...styles.card, marginTop: '-8px' }}>
          <div style={{ padding: '16px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>报告医生:</span>
              <input style={styles.input} placeholder="请输入医生姓名" />
            </div>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>患者姓名:</span>
              <input style={styles.input} placeholder="请输入患者姓名" />
            </div>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>检查类型:</span>
              <select style={styles.select}>
                <option value="">全部</option>
                <option value="CT">CT</option>
                <option value="MR">MR</option>
                <option value="DR">DR</option>
                <option value="MG">MG</option>
                <option value="DSA">DSA</option>
              </select>
            </div>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => setShowAdvancedFilter(false)}>
              应用筛选
            </button>
            <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => setShowAdvancedFilter(false)}>
              重置
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
