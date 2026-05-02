// @ts-nocheck
// G005 放射RIS系统 - 国家数据上报页面 v1.0.0
// 功能：CT/MRI/X线检查统计数据上报、辐射剂量数据上报、报告质量数据上报
import { useState, useEffect } from 'react'
import {
  // 统计图表相关图标
  BarChart3, PieChart as PieChartIcon, Activity, TrendingUp, TrendingDown,
  // 上报相关图标
  Upload, Download, FileText, CheckCircle, AlertTriangle, Clock, ShieldCheck,
  // 设备相关图标
  Monitor, Scan, Radio, Image,
  // 通用图标
  Calendar, Search, Filter, RefreshCw, ChevronRight, Plus, Edit3, Eye,
  Settings, MoreVertical, X, Check, ArrowRight, Circle, FileSpreadsheet,
  Building2, Database, Network, Server, Globe, AlertCircle
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
  Pie
} from 'recharts'

// ============ 样式常量 ============
const COLORS = {
  primary: '#1e40af',      // 深蓝主色
  secondary: '#0891b2',    // 青色辅色
  success: '#16a34a',       // 成功绿
  warning: '#d97706',      // 警告橙
  danger: '#dc2626',        // 危险红
  bgGray: '#e8e8e8',        // 浅灰背景
  cardWhite: '#ffffff',     // 白色卡片
  textDark: '#1f2937',      // 深色文字
  textMuted: '#6b7280',     // 灰色文字
  border: '#d1d5db',        // 边框色
  ct: '#3b82f6',           // CT颜色
  mri: '#8b5cf6',          // MRI颜色
  dr: '#10b981',           // DR颜色
  mg: '#f59e0b',           // MG颜色
 dsa: '#ef4444',           // DSA颜色
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
    backgroundColor: COLORS.primary,
    color: 'white',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
  // 统计卡片容器
  statsContainer: {
    display: 'flex',
    gap: '16px',
    padding: '20px 24px',
    flexWrap: 'wrap' as const,
  },
  statCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: '8px',
    padding: '16px 20px',
    minWidth: '180px',
    flex: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
  },
  statLabel: {
    fontSize: '12px',
    color: COLORS.textMuted,
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: COLORS.primary,
  },
  statChange: {
    fontSize: '11px',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  // 主内容区
  mainContent: {
    display: 'flex',
    gap: '16px',
    padding: '0 24px 20px',
    height: 'calc(100vh - 280px)',
    minHeight: '500px',
  },
  // 左侧面板
  leftPanel: {
    width: '280px',
    backgroundColor: COLORS.cardWhite,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  // 中间面板
  middlePanel: {
    flex: 1,
    backgroundColor: COLORS.cardWhite,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  // 右侧面板
  rightPanel: {
    width: '340px',
    backgroundColor: COLORS.cardWhite,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  // 底部面板
  bottomPanel: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: '8px',
    margin: '0 24px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  // Tab 标签
  tabContainer: {
    display: 'flex',
    gap: '4px',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    flexWrap: 'wrap' as const,
  },
  tab: {
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    border: 'none',
    backgroundColor: 'transparent',
    color: COLORS.textMuted,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    color: 'white',
  },
  // 列表项
  listItem: {
    padding: '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  listItemActive: {
    backgroundColor: '#eff6ff',
    borderLeft: `3px solid ${COLORS.primary}`,
  },
  // 表格样式
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left' as const,
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: 600,
    color: COLORS.textDark,
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #e5e7eb',
  },
  // 按钮样式
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    border: 'none',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    color: 'white',
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
    color: 'white',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.primary}`,
    color: COLORS.primary,
  },
  buttonDanger: {
    backgroundColor: COLORS.danger,
    color: 'white',
  },
  // 状态标签
  statusTag: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  // 输入框
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  // 模态框
  modal: {
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
  modalContent: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 600,
    fontSize: '16px',
  },
  modalBody: {
    padding: '20px',
  },
  modalFooter: {
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  // 表单项
  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 500,
    fontSize: '13px',
    color: COLORS.textDark,
  },
  // 小标签
  badge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  // 分页
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  // 空状态
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center' as const,
    color: COLORS.textMuted,
  },
  // 搜索框
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    margin: '12px',
  },
  // 面板头部
  panelHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  panelBody: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '8px',
  },
  // 图表容器
  chartContainer: {
    padding: '16px',
    height: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    margin: '12px',
  },
  // 进度条
  progressBar: {
    height: '8px',
    backgroundColor: '#e5e8eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
}

// ============ 类型定义 ============
interface ExamStatistics {
  id: string
  modality: 'CT' | 'MRI' | 'DR' | 'MG' | 'DSA'
  examType: string
  examCount: number
  positiveCount: number
  positiveRate: number
  avgReportTime: number
  qualifiedRate: number
}

interface DoseReport {
  id: string
  reportMonth: string
  modality: string
  totalExams: number
  totalDLP: number
  avgDLP: number
  totalCTDI: number
  avgCTDI: number
  alertCount: number
  highDoseCount: number
  status: '待上报' | '已上报' | '已确认' | '已驳回'
  submitTime?: string
  confirmTime?: string
  confirmOrg?: string
}

interface QualityReport {
  id: string
  reportMonth: string
  totalReports: number
  qualifiedReports: number
  excellentReports: number
  qualifiedRate: number
  excellentRate: number
  avgScore: number
  commonIssues: string[]
  improvementMeasures: string[]
  status: '待审核' | '已通过' | '已驳回'
}

interface ReportLog {
  id: string
  reportType: 'exam' | 'dose' | 'quality'
  reportMonth: string
  submitTime: string
  status: string
  operator: string
  note?: string
}

// ============ 模拟数据 ============
const modalityColors: Record<string, string> = {
  'CT': COLORS.ct,
  'MRI': COLORS.mri,
  'DR': COLORS.dr,
  'MG': COLORS.mg,
  'DSA': COLORS.dsa,
}

const examStatisticsData: ExamStatistics[] = [
  { id: 'EX001', modality: 'CT', examType: '头颅CT平扫', examCount: 1256, positiveCount: 312, positiveRate: 24.8, avgReportTime: 25, qualifiedRate: 96.5 },
  { id: 'EX002', modality: 'CT', examType: '胸部CT平扫', examCount: 1089, positiveCount: 287, positiveRate: 26.4, avgReportTime: 22, qualifiedRate: 97.2 },
  { id: 'EX003', modality: 'CT', examType: '腹部CT平扫', examCount: 876, positiveCount: 198, positiveRate: 22.6, avgReportTime: 28, qualifiedRate: 95.8 },
  { id: 'EX004', modality: 'CT', examType: '冠脉CTA', examCount: 456, positiveCount: 189, positiveRate: 41.4, avgReportTime: 35, qualifiedRate: 94.3 },
  { id: 'EX005', modality: 'MRI', examType: '头颅MRI平扫', examCount: 678, positiveCount: 156, positiveRate: 23.0, avgReportTime: 30, qualifiedRate: 98.1 },
  { id: 'EX006', modality: 'MRI', examType: '膝关节MRI', examCount: 534, positiveCount: 289, positiveRate: 54.1, avgReportTime: 25, qualifiedRate: 97.5 },
  { id: 'EX007', modality: 'DR', examType: '胸部正侧位', examCount: 2156, positiveCount: 432, positiveRate: 20.0, avgReportTime: 15, qualifiedRate: 98.9 },
  { id: 'EX008', modality: 'DR', examType: '腹部平片', examCount: 876, positiveCount: 98, positiveRate: 11.2, avgReportTime: 12, qualifiedRate: 99.2 },
  { id: 'EX009', modality: 'MG', examType: '乳腺钼靶', examCount: 324, positiveCount: 45, positiveRate: 13.9, avgReportTime: 20, qualifiedRate: 96.8 },
  { id: 'EX010', modality: 'DSA', examType: '冠脉造影', examCount: 156, positiveCount: 89, positiveRate: 57.1, avgReportTime: 45, qualifiedRate: 93.5 },
]

const doseReportData: DoseReport[] = [
  { id: 'DR001', reportMonth: '2026-04', modality: 'CT', totalExams: 3677, totalDLP: 2856400, avgDLP: 777, totalCTDI: 85600, avgCTDI: 23.3, alertCount: 28, highDoseCount: 156, status: '已确认', submitTime: '2026-05-05 10:30', confirmTime: '2026-05-06 09:15', confirmOrg: '国家辐射防护中心' },
  { id: 'DR002', reportMonth: '2026-04', modality: 'DR', totalExams: 3032, totalDLP: 0, avgDLP: 0, totalCTDI: 4548, avgCTDI: 1.5, alertCount: 5, highDoseCount: 12, status: '已确认', submitTime: '2026-05-05 10:35', confirmTime: '2026-05-06 09:20', confirmOrg: '国家辐射防护中心' },
  { id: 'DR003', reportMonth: '2026-04', modality: 'DSA', totalExams: 156, totalDLP: 0, avgDLP: 0, totalCTDI: 15600, avgCTDI: 100, alertCount: 18, highDoseCount: 45, status: '已确认', submitTime: '2026-05-05 10:40', confirmTime: '2026-05-06 09:25', confirmOrg: '国家辐射防护中心' },
  { id: 'DR004', reportMonth: '2026-04', modality: 'MG', totalExams: 324, totalDLP: 0, avgDLP: 0, totalCTDI: 648, avgCTDI: 2.0, alertCount: 0, highDoseCount: 0, status: '已确认', submitTime: '2026-05-05 10:42', confirmTime: '2026-05-06 09:28', confirmOrg: '国家辐射防护中心' },
  { id: 'DR005', reportMonth: '2026-05', modality: 'CT', totalExams: 1256, totalDLP: 980500, avgDLP: 781, totalCTDI: 29400, avgCTDI: 23.4, alertCount: 12, highDoseCount: 56, status: '已上报', submitTime: '2026-06-05 10:30' },
  { id: 'DR006', reportMonth: '2026-05', modality: 'DR', totalExams: 1089, totalDLP: 0, avgDLP: 0, totalCTDI: 1633, avgCTDI: 1.5, alertCount: 2, highDoseCount: 5, status: '待上报' },
  { id: 'DR007', reportMonth: '2026-05', modality: 'MRI', totalExams: 1212, totalDLP: 0, avgDLP: 0, totalCTDI: 0, avgCTDI: 0, alertCount: 0, highDoseCount: 0, status: '待上报' },
]

const qualityReportData: QualityReport[] = [
  { id: 'QR001', reportMonth: '2026-04', totalReports: 7033, qualifiedReports: 6856, excellentReports: 2156, qualifiedRate: 97.5, excellentRate: 30.7, avgScore: 87.3, commonIssues: ['描述不准确', '测量数据缺失', '结论不明确'], improvementMeasures: ['加强培训', '完善模板', '增加复核环节'], status: '已通过' },
  { id: 'QR002', reportMonth: '2026-05', totalReports: 3457, qualifiedReports: 3356, excellentReports: 1025, qualifiedRate: 97.1, excellentRate: 29.7, avgScore: 86.8, commonIssues: ['图像质量描述不足', '病史采集不全'], improvementMeasures: ['优化检查流程', '加强病史采集培训'], status: '待审核' },
]

const reportLogData: ReportLog[] = [
  { id: 'LOG001', reportType: 'dose', reportMonth: '2026-04', submitTime: '2026-05-05 10:30', status: '已确认', operator: '李建国', note: '国家辐射防护中心确认通过' },
  { id: 'LOG002', reportType: 'exam', reportMonth: '2026-04', submitTime: '2026-05-05 11:00', status: '已确认', operator: '李建国', note: '上报成功' },
  { id: 'LOG003', reportType: 'quality', reportMonth: '2026-04', submitTime: '2026-05-05 11:30', status: '已确认', operator: '王晓燕', note: '质量数据上报成功' },
  { id: 'LOG004', reportType: 'dose', reportMonth: '2026-05', submitTime: '2026-06-05 10:30', status: '已上报', operator: '李建国' },
  { id: 'LOG005', reportType: 'exam', reportMonth: '2026-05', submitTime: '2026-06-05 11:00', status: '已上报', operator: '李建国' },
]

// 月度趋势数据
const monthlyTrendData = [
  { month: '2025-12', CT: 3200, MRI: 1100, DR: 2800, MG: 280, DSA: 120 },
  { month: '2026-01', CT: 3350, MRI: 1150, DR: 2950, MG: 295, DSA: 135 },
  { month: '2026-02', CT: 3100, MRI: 1080, DR: 2750, MG: 265, DSA: 125 },
  { month: '2026-03', CT: 3450, MRI: 1200, DR: 3050, MG: 310, DSA: 145 },
  { month: '2026-04', CT: 3677, MRI: 1212, DR: 3032, MG: 324, DSA: 156 },
  { month: '2026-05', CT: 1256, MRI: 580, DR: 1089, MG: 156, DSA: 68 },
]

// 设备分布数据
const deviceDistribution = [
  { name: 'CT', value: 35, color: COLORS.ct },
  { name: 'MRI', value: 15, color: COLORS.mri },
  { name: 'DR', value: 38, color: COLORS.dr },
  { name: 'MG', value: 7, color: COLORS.mg },
  { name: 'DSA', value: 5, color: COLORS.dsa },
]

// ============ 工具函数 ============
const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    '待上报': { bg: '#fef3c7', color: '#d97706', label: '待上报' },
    '已上报': { bg: '#dbeafe', color: '#2563eb', label: '已上报' },
    '已确认': { bg: '#d1fae5', color: '#16a34a', label: '已确认' },
    '已驳回': { bg: '#fee2e2', color: '#dc2626', label: '已驳回' },
    '待审核': { bg: '#fef3c7', color: '#d97706', label: '待审核' },
    '已通过': { bg: '#d1fae5', color: '#16a34a', label: '已通过' },
  }
  const style = statusMap[status] || { bg: '#f3f4f6', color: '#6b7280', label: status }
  return (
    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, backgroundColor: style.bg, color: style.color }}>
      {style.label}
    </span>
  )
}

const getModalityBadge = (modality: string) => {
  const color = modalityColors[modality] || COLORS.primary
  return (
    <span style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: `${color}15`, color: color }}>
      {modality}
    </span>
  )
}

// ============ 导出函数 ============
const exportToCSV = (data: any[], filename: string, headers: string[]) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

// ============ 主组件 ============
export default function NationalReportPage() {
  const [activeTab, setActiveTab] = useState<'exam' | 'dose' | 'quality' | 'log'>('exam')
  const [selectedMonth, setSelectedMonth] = useState('2026-05')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitType, setSubmitType] = useState<'exam' | 'dose' | 'quality'>('exam')

  // 统计数据
  const totalExams = examStatisticsData.reduce((sum, item) => sum + item.examCount, 0)
  const totalPositive = examStatisticsData.reduce((sum, item) => sum + item.positiveCount, 0)
  const avgQualifiedRate = examStatisticsData.reduce((sum, item) => sum + item.qualifiedRate, 0) / examStatisticsData.length
  const pendingReports = doseReportData.filter(d => d.status === '待上报').length

  // 筛选数据
  const filteredExamData = examStatisticsData.filter(item =>
    item.examType.includes(searchKeyword) || item.modality.includes(searchKeyword)
  )

  const filteredDoseData = doseReportData.filter(item =>
    item.reportMonth === selectedMonth || searchKeyword === ''
  )

  const handleSubmitReport = () => {
    setShowSubmitModal(false)
    alert(`${submitType === 'exam' ? '检查统计' : submitType === 'dose' ? '辐射剂量' : '报告质量'}数据已提交上报`)
  }

  const handleExport = (type: 'exam' | 'dose' | 'quality') => {
    if (type === 'exam') {
      exportToCSV(examStatisticsData, 'exam_statistics.csv', ['ID', '设备类型', '检查项目', '检查数量', '阳性数', '阳性率', '平均报告时间', '合格率'])
    } else if (type === 'dose') {
      exportToCSV(doseReportData, 'dose_report.csv', ['ID', '上报月份', '设备类型', '总检查数', '总DLP', '平均DLP', '总CTDI', '平均CTDI', '预警次数', '高剂量人数', '状态'])
    } else {
      exportToCSV(qualityReportData, 'quality_report.csv', ['ID', '上报月份', '总报告数', '合格数', '优秀数', '合格率', '优秀率', '平均分', '常见问题', '改进措施', '状态'])
    }
  }

  return (
    <div style={styles.pageContainer}>
      {/* 顶部标题栏 */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            <Database size={24} />
            <span>国家数据上报</span>
          </div>
          <div style={styles.headerSubtitle}>CT/MRI/X线检查统计数据上报 · 辐射剂量数据上报 · 报告质量数据上报</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ ...styles.button, ...styles.buttonOutline }} onClick={() => handleExport(activeTab as any)}>
            <Download size={16} />
            导出报表
          </button>
          <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={() => { setSubmitType(activeTab as any); setShowSubmitModal(true); }}>
            <Upload size={16} />
            上报数据
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>
            <BarChart3 size={14} />
            本期检查总数
          </div>
          <div style={styles.statValue}>{totalExams.toLocaleString()}</div>
          <div style={{ ...styles.statChange, color: COLORS.success }}>
            <TrendingUp size={12} />
            <span>较上月 +12.5%</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>
            <Activity size={14} />
            阳性检出总数
          </div>
          <div style={{ ...styles.statValue, color: COLORS.warning }}>{totalPositive.toLocaleString()}</div>
          <div style={{ ...styles.statChange, color: COLORS.textMuted }}>
            <span>阳性率 {((totalPositive / totalExams) * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>
            <ShieldCheck size={14} />
            平均合格率
          </div>
          <div style={{ ...styles.statValue, color: COLORS.success }}>{avgQualifiedRate.toFixed(1)}%</div>
          <div style={{ ...styles.statChange, color: COLORS.success }}>
            <CheckCircle size={12} />
            <span>达到标准</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>
            <AlertTriangle size={14} />
            待上报报表
          </div>
          <div style={{ ...styles.statValue, color: pendingReports > 0 ? COLORS.warning : COLORS.success }}>{pendingReports}</div>
          <div style={{ ...styles.statChange, color: COLORS.textMuted }}>
            <span>需及时上报</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>
            <Calendar size={14} />
            上报周期
          </div>
          <div style={styles.statValue}>{selectedMonth}</div>
          <div style={{ ...styles.statChange, color: COLORS.textMuted }}>
            <span>月度上报</span>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={styles.mainContent}>
        {/* 左侧面板 */}
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>
            <span>上报类型</span>
            <Filter size={14} />
          </div>
          <div style={styles.panelBody}>
            {[
              { key: 'exam', label: '检查统计数据', icon: Scan, count: examStatisticsData.length },
              { key: 'dose', label: '辐射剂量数据', icon: Radio, count: doseReportData.length },
              { key: 'quality', label: '报告质量数据', icon: ShieldCheck, count: qualityReportData.length },
              { key: 'log', label: '上报记录', icon: Clock, count: reportLogData.length },
            ].map(item => (
              <div
                key={item.key}
                style={{
                  ...styles.listItem,
                  ...(activeTab === item.key ? styles.listItemActive : {}),
                }}
                onClick={() => setActiveTab(item.key as any)}
              >
                <item.icon size={18} color={activeTab === item.key ? COLORS.primary : COLORS.textMuted} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted }}>共 {item.count} 条</div>
                </div>
                {activeTab === item.key && <ChevronRight size={16} color={COLORS.primary} />}
              </div>
            ))}
          </div>

          {/* 月度趋势图 */}
          <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: COLORS.textDark }}>检查量趋势</div>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="CT" stroke={COLORS.ct} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="MRI" stroke={COLORS.mri} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="DR" stroke={COLORS.dr} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 中间面板 */}
        <div style={styles.middlePanel}>
          <div style={styles.tabContainer}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 'auto' }}>
              <span style={{ fontWeight: 600 }}>{activeTab === 'exam' ? '检查统计报表' : activeTab === 'dose' ? '辐射剂量报表' : activeTab === 'quality' ? '报告质量报表' : '上报记录'}</span>
            </div>
            <div style={styles.searchBox}>
              <Search size={14} color={COLORS.textMuted} />
              <input
                type="text"
                placeholder="搜索..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ ...styles.input, border: 'none', background: 'transparent', width: '120px', padding: '4px' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
            {/* 检查统计表格 */}
            {activeTab === 'exam' && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>设备类型</th>
                    <th style={styles.th}>检查项目</th>
                    <th style={styles.th}>检查数量</th>
                    <th style={styles.th}>阳性数</th>
                    <th style={styles.th}>阳性率</th>
                    <th style={styles.th}>平均报告时间</th>
                    <th style={styles.th}>合格率</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExamData.map(item => (
                    <tr key={item.id}>
                      <td style={styles.td}>{getModalityBadge(item.modality)}</td>
                      <td style={styles.td}>{item.examType}</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{item.examCount.toLocaleString()}</td>
                      <td style={{ ...styles.td, color: COLORS.warning }}>{item.positiveCount}</td>
                      <td style={styles.td}>{item.positiveRate}%</td>
                      <td style={styles.td}>{item.avgReportTime}分钟</td>
                      <td style={{ ...styles.td, color: item.qualifiedRate >= 95 ? COLORS.success : COLORS.warning }}>{item.qualifiedRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 辐射剂量表格 */}
            {activeTab === 'dose' && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>上报月份</th>
                    <th style={styles.th}>设备类型</th>
                    <th style={styles.th}>检查总数</th>
                    <th style={styles.th}>总DLP(mGy·cm)</th>
                    <th style={styles.th}>平均DLP</th>
                    <th style={styles.th}>平均CTDIvol</th>
                    <th style={styles.th}>预警次数</th>
                    <th style={styles.th}>高剂量人数</th>
                    <th style={styles.th}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoseData.map(item => (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.reportMonth}</td>
                      <td style={styles.td}>{getModalityBadge(item.modality)}</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{item.totalExams.toLocaleString()}</td>
                      <td style={styles.td}>{item.totalDLP > 0 ? item.totalDLP.toLocaleString() : '-'}</td>
                      <td style={styles.td}>{item.avgDLP > 0 ? item.avgDLP : '-'}</td>
                      <td style={styles.td}>{item.avgCTDI > 0 ? item.avgCTDI : '-'}</td>
                      <td style={{ ...styles.td, color: item.alertCount > 0 ? COLORS.warning : COLORS.success }}>{item.alertCount}</td>
                      <td style={styles.td}>{item.highDoseCount}</td>
                      <td style={styles.td}>{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 报告质量表格 */}
            {activeTab === 'quality' && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>上报月份</th>
                    <th style={styles.th}>总报告数</th>
                    <th style={styles.th}>合格数</th>
                    <th style={styles.th}>优秀数</th>
                    <th style={styles.th}>合格率</th>
                    <th style={styles.th}>优秀率</th>
                    <th style={styles.th}>平均分</th>
                    <th style={styles.th}>常见问题</th>
                    <th style={styles.th}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {qualityReportData.map(item => (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.reportMonth}</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{item.totalReports.toLocaleString()}</td>
                      <td style={styles.td}>{item.qualifiedReports}</td>
                      <td style={styles.td}>{item.excellentReports}</td>
                      <td style={{ ...styles.td, color: item.qualifiedRate >= 95 ? COLORS.success : COLORS.warning }}>{item.qualifiedRate}%</td>
                      <td style={styles.td}>{item.excellentRate}%</td>
                      <td style={styles.td}>{item.avgScore}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {item.commonIssues.slice(0, 2).map((issue, idx) => (
                            <span key={idx} style={{ padding: '2px 6px', background: '#fef3c7', color: '#d97706', borderRadius: '4px', fontSize: '10px' }}>{issue}</span>
                          ))}
                        </div>
                      </td>
                      <td style={styles.td}>{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 上报记录 */}
            {activeTab === 'log' && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>上报类型</th>
                    <th style={styles.th}>上报月份</th>
                    <th style={styles.th}>上报时间</th>
                    <th style={styles.th}>操作人</th>
                    <th style={styles.th}>状态</th>
                    <th style={styles.th}>备注</th>
                  </tr>
                </thead>
                <tbody>
                  {reportLogData.map(item => (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        <span style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: item.reportType === 'dose' ? '#fef3c7' : item.reportType === 'exam' ? '#dbeafe' : '#d1fae5', color: item.reportType === 'dose' ? '#d97706' : item.reportType === 'exam' ? '#2563eb' : '#16a34a' }}>
                          {item.reportType === 'dose' ? '辐射剂量' : item.reportType === 'exam' ? '检查统计' : '报告质量'}
                        </span>
                      </td>
                      <td style={styles.td}>{item.reportMonth}</td>
                      <td style={styles.td}>{item.submitTime}</td>
                      <td style={styles.td}>{item.operator}</td>
                      <td style={styles.td}>{getStatusBadge(item.status)}</td>
                      <td style={styles.td}>{item.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 分页 */}
          <div style={styles.pagination}>
            <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
              共 {activeTab === 'exam' ? filteredExamData.length : activeTab === 'dose' ? filteredDoseData.length : activeTab === 'quality' ? qualityReportData.length : reportLogData.length} 条记录
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ ...styles.button, padding: '6px 12px', fontSize: '12px' }}>上一页</button>
              <button style={{ ...styles.button, padding: '6px 12px', fontSize: '12px' }}>下一页</button>
            </div>
          </div>
        </div>

        {/* 右侧面板 */}
        <div style={styles.rightPanel}>
          {/* 设备分布 */}
          <div style={styles.panelHeader}>
            <span>设备类型分布</span>
            <PieChartIcon size={14} />
          </div>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={deviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 12px 12px' }}>
            {deviceDistribution.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
                <span style={{ fontSize: '11px' }}>{item.name} {item.value}%</span>
              </div>
            ))}
          </div>

          {/* 上报进度 */}
          <div style={{ ...styles.panelHeader, borderTop: '1px solid #e5e7eb' }}>
            <span>本期上报进度</span>
            <Globe size={14} />
          </div>
          <div style={{ padding: '12px' }}>
            {[
              { label: '检查统计数据', progress: 80, color: COLORS.ct },
              { label: '辐射剂量数据', progress: 65, color: COLORS.mri },
              { label: '报告质量数据', progress: 50, color: COLORS.dr },
            ].map((item, idx) => (
              <div key={idx} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: item.color }}>{item.progress}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${item.progress}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* 最新上报动态 */}
          <div style={{ ...styles.panelHeader, borderTop: '1px solid #e5e7eb' }}>
            <span>最新上报动态</span>
            <Activity size={14} />
          </div>
          <div style={{ ...styles.panelBody, padding: '12px' }}>
            {reportLogData.slice(0, 3).map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '10px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={14} color={COLORS.primary} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{item.reportType === 'dose' ? '辐射剂量' : item.reportType === 'exam' ? '检查统计' : '报告质量'}数据已{item.status}</div>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted }}>{item.submitTime}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 快捷操作 */}
          <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>快捷操作</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button style={{ ...styles.button, ...styles.buttonOutline, justifyContent: 'center' }} onClick={() => handleExport('exam')}>
                <Download size={14} />
                导出检查统计
              </button>
              <button style={{ ...styles.button, ...styles.buttonOutline, justifyContent: 'center' }} onClick={() => handleExport('dose')}>
                <Download size={14} />
                导出剂量数据
              </button>
              <button style={{ ...styles.button, ...styles.buttonOutline, justifyContent: 'center' }} onClick={() => handleExport('quality')}>
                <Download size={14} />
                导出质量报告
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 底部统计图 */}
      <div style={styles.bottomPanel}>
        <div style={styles.panelHeader}>
          <span>年度各设备检查量对比</span>
          <BarChart3 size={14} />
        </div>
        <div style={{ padding: '16px' }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="CT" fill={COLORS.ct} radius={[4, 4, 0, 0]} />
              <Bar dataKey="MRI" fill={COLORS.mri} radius={[4, 4, 0, 0]} />
              <Bar dataKey="DR" fill={COLORS.dr} radius={[4, 4, 0, 0]} />
              <Bar dataKey="MG" fill={COLORS.mg} radius={[4, 4, 0, 0]} />
              <Bar dataKey="DSA" fill={COLORS.dsa} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 上报确认弹窗 */}
      {showSubmitModal && (
        <div style={styles.modal} onClick={() => setShowSubmitModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span>确认上报数据</span>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowSubmitModal(false)} />
            </div>
            <div style={styles.modalBody}>
              <div style={{ marginBottom: '16px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>上报类型：</strong>
                  {submitType === 'exam' ? '检查统计数据' : submitType === 'dose' ? '辐射剂量数据' : '报告质量数据'}
                </div>
                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>上报周期：</strong>{selectedMonth}
                </div>
                <div style={{ fontSize: '13px' }}>
                  <strong>上报内容：</strong>
                  {submitType === 'exam' ? `${examStatisticsData.length} 条检查统计数据` :
                   submitType === 'dose' ? `${doseReportData.filter(d => d.reportMonth === selectedMonth).length} 条辐射剂量数据` :
                   `${qualityReportData.length} 条报告质量数据`}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                确认后将数据上报至国家卫生健康委员会数据平台，请确保数据准确无误。
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.button, background: '#f3f4f6', color: COLORS.textDark }} onClick={() => setShowSubmitModal(false)}>
                取消
              </button>
              <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={handleSubmitReport}>
                <Check size={14} />
                确认上报
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
