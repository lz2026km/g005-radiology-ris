// ============================================================
// G005 放射科RIS系统 - 操作痕迹日志页面 v3.0.0
// HIPAA合规审计追踪，完整操作行为记录
// ============================================================
import { useState, useMemo, useCallback } from 'react'
import {
  Search, Filter, X, Calendar, Clock, User, Monitor,
  FileText, Edit3, CheckCircle, LogIn, LogOut, Download,
  Settings, ChevronDown, ChevronUp, Eye, RefreshCw,
  BarChart3, PieChart as PieChartIcon, Activity,
  ArrowUpDown, Check, AlertCircle, History, List,
  GitCompare, MonitorSmartphone, Globe, Server,
  TrendingUp, TrendingDown, Loader2, FileSpreadsheet,
  CheckSquare, Printer, Upload, Wrench, Zap, Timer,
  Flame, Users, ChevronRight, Shield, FileCheck,
  AlertTriangle, Ban, EyeOff, Key
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  LineChart, Line, Area, AreaChart
} from 'recharts'
import { initialUsers } from '../data/initialData'

// ============================================================
// 常量定义
// ============================================================
const PRIMARY = '#1e40af'
const PRIMARY_LIGHT = '#2c5282'
const ACCENT = '#3182ce'
const SUCCESS = '#059669'
const WARNING = '#d97706'
const DANGER = '#dc2626'
const PURPLE = '#7c3aed'
const GRAY = '#64748b'
const BG = '#f8fafc'
const WHITE = '#ffffff'

// 操作类型扩展
const ACTION_TYPES = ['全部', '修改报告', '审核通过', '审核驳回', '登录', '登出', '导出数据', '修改设置', '批量审核', '打印报告', '数据导入', '系统维护']
const MODULES = ['全部', '报告管理', '检查管理', '患者管理', '设备管理', '系统设置', '统计报表', '预约管理']
const PAGE_SIZES = [10, 20, 50, 100]
const LOG_SOURCES = ['全部', 'Web端', '移动端', 'API接口', '系统自动']
const QUICK_TIME_FILTERS = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '自定义', value: 'custom' },
]

const ACTION_COLORS: Record<string, string> = {
  '修改报告': '#3b82f6',
  '审核通过': '#059669',
  '审核驳回': '#dc2626',
  '登录': '#8b5cf6',
  '登出': '#6b7280',
  '导出数据': '#f59e0b',
  '修改设置': '#14b8a6',
  '批量审核': '#ec4899',
  '打印报告': '#06b6d4',
  '数据导入': '#84cc16',
  '系统维护': '#f97316',
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  '修改报告': <Edit3 size={14} />,
  '审核通过': <CheckCircle size={14} />,
  '审核驳回': <AlertCircle size={14} />,
  '登录': <LogIn size={14} />,
  '登出': <LogOut size={14} />,
  '导出数据': <Download size={14} />,
  '修改设置': <Settings size={14} />,
  '批量审核': <CheckSquare size={14} />,
  '打印报告': <Printer size={14} />,
  '数据导入': <Upload size={14} />,
  '系统维护': <Wrench size={14} />,
}

const SOURCE_COLORS: Record<string, string> = {
  'Web端': '#3b82f6',
  '移动端': '#10b981',
  'API接口': '#8b5cf6',
  '系统自动': '#f59e0b',
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  'Web端': <MonitorSmartphone size={12} />,
  '移动端': <Monitor size={12} />,
  'API接口': <Server size={12} />,
  '系统自动': <Zap size={12} />,
}

// HIPAA操作类型分类
const HIPAA_ACTION_CATEGORIES = {
  view: ['查看报告', '查看影像', '查看患者信息'],
  modify: ['修改报告', '修改患者信息'],
  print: ['打印报告', '打印胶片'],
  export: ['导出数据', '批量导出'],
  delete: ['删除报告', '删除影像'],
}

const HIPAA_ACTION_TYPES = ['全部', ...Object.values(HIPAA_ACTION_CATEGORIES).flat()]

// ============================================================
// 类型定义
// ============================================================
type ViewTab = 'logs' | 'duration' | 'heatmap' | 'hipaa'
type QuickTimeValue = 'today' | 'week' | 'month' | 'custom' | ''

type ComplianceLevel = 'compliant' | 'warning' | 'critical'

interface ComplianceAlert {
  type: 'non_work_hours' | 'cross_department' | 'batch_export' | 'high_frequency'
  level: ComplianceLevel
  message: string
}

interface OperationLog {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  targetId: string
  targetDesc: string
  beforeData?: string
  afterData?: string
  timestamp: string
  ipAddress: string
  device: string
  source: string
  duration?: number
  // HIPAA新增字段
  patientId?: string
  reportId?: string
  department?: string
  complianceLevel?: ComplianceLevel
  complianceAlerts?: ComplianceAlert[]
}

interface LogDetailModalProps {
  log: OperationLog | null
  onClose: () => void
}

interface TodayTrendCardProps {
  todayCount: number
  yesterdayCount: number
  todayTrend: number[]
  peakHour: string
  topUser: string
}

interface HipaaStats {
  todayTotal: number
  abnormalCount: number
  mostActiveUser: string
  highestRiskOperation: string
}

// ============================================================
// 辅助函数
// ============================================================
function formatDateTime(dt: string): string {
  if (!dt) return '-'
  const d = new Date(dt)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function formatDate(dt: string): string {
  if (!dt) return '-'
  return dt.slice(0, 10)
}

function formatTime(dt: string): string {
  if (!dt) return '-'
  const d = new Date(dt)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function getRelativeTime(dt: string): string {
  const now = new Date('2026-05-01T18:00:00')
  const d = new Date(dt)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

// HIPAA合规检查函数
function checkCompliance(log: OperationLog, allLogs: OperationLog[]): { level: ComplianceLevel; alerts: ComplianceAlert[] } {
  const alerts: ComplianceAlert[] = []
  const hour = new Date(log.timestamp).getHours()
  
  // 非工作时间访问 (22:00-06:00)
  if (hour >= 22 || hour < 6) {
    alerts.push({
      type: 'non_work_hours',
      level: 'critical',
      message: '非工作时间访问 (22:00-06:00)'
    })
  }
  
  // 跨科室访问 - 模拟：放射科医生访问内科患者
  if (log.department === '内科' && log.userName.includes('放射')) {
    alerts.push({
      type: 'cross_department',
      level: 'critical',
      message: '跨科室访问'
    })
  }
  
  // 批量导出
  if (log.action === '批量导出' || log.action === '导出数据') {
    const exportCount = allLogs.filter(l => 
      (l.action === '批量导出' || l.action === '导出数据') && 
      l.userName === log.userName &&
      l.timestamp.slice(0, 10) === log.timestamp.slice(0, 10)
    ).length
    if (exportCount > 3) {
      alerts.push({
        type: 'batch_export',
        level: 'warning',
        message: `当日第${exportCount}次导出操作`
      })
    }
  }
  
  // 同一患者高频访问
  if (log.patientId) {
    const patientAccessCount = allLogs.filter(l => 
      l.patientId === log.patientId && 
      l.userName === log.userName &&
      new Date(l.timestamp).getTime() > new Date(log.timestamp).getTime() - 3600000 // 1小时内
    ).length
    if (patientAccessCount > 5) {
      alerts.push({
        type: 'high_frequency',
        level: 'warning',
        message: `1小时内访问该患者${patientAccessCount}次`
      })
    }
  }
  
  // 确定合规等级
  let level: ComplianceLevel = 'compliant'
  if (alerts.some(a => a.level === 'critical')) {
    level = 'critical'
  } else if (alerts.some(a => a.level === 'warning')) {
    level = 'warning'
  }
  
  return { level, alerts }
}

// ============================================================
// 生成模拟操作日志数据（1060条 + 50条HIPAA日志）
// ============================================================
function generateMockOperationLogs(): OperationLog[] {
  const users = initialUsers.filter(u => u.role === 'radiologist' || u.role === 'technologist' || u.role === 'admin')
  const actions = ['修改报告', '审核通过', '审核驳回', '登录', '登出', '导出数据', '修改设置', '批量审核', '打印报告', '数据导入', '系统维护']
  const modules = ['报告管理', '检查管理', '患者管理', '设备管理', '系统设置', '统计报表', '预约管理']
  const devices = ['Chrome/120.0', 'Firefox/119.0', 'Edge/120.0', 'Safari/17.0', 'Chrome Mobile/120.0']
  const ips = ['192.168.1.100', '192.168.1.101', '192.168.1.102', '10.0.0.50', '172.16.0.25', '127.0.0.1']
  const sources = ['Web端', '移动端', 'API接口', '系统自动']

  const reportIds = Array.from({ length: 50 }, (_, i) => `RAD-RPT${String(i + 1).padStart(3, '0')}`)
  const patientNames = ['张志刚', '李秀英', '王建国', '赵晓敏', '周玉芬', '孙伟', '吴婷', '郑丽', '钱伟明', '陈丽华']
  const patientIds = ['P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007', 'P008', 'P009', 'P010']
  const departments = ['放射科', '内科', '外科', '骨科', '神经科']
  const examItems = ['头颅CT平扫', '胸部CT平扫', '腹部CT平扫+增强', '头颅MR平扫', '腰椎MR平扫', '胸部DR正侧位', '冠脉CTA', '乳腺钼靶']

  const logs: OperationLog[] = []
  const baseTime = new Date('2026-05-01T08:00:00')

  for (let i = 0; i < 1060; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const action = actions[Math.floor(Math.random() * actions.length)]
    const module = action === '登录' || action === '登出' || action === '系统维护' ? '系统设置' : modules[Math.floor(Math.random() * modules.length)]
    const hoursOffset = Math.floor(i / 3) + Math.random() * 0.5
    const timestamp = new Date(baseTime.getTime() + hoursOffset * 3600000).toISOString()

    let targetDesc = ''
    let targetId = ''
    let beforeData = ''
    let afterData = ''
    let duration = Math.floor(Math.random() * 300) + 1
    const patientId = patientIds[Math.floor(Math.random() * patientIds.length)]
    const department = departments[Math.floor(Math.random() * departments.length)]

    if (action === '修改报告') {
      targetId = reportIds[Math.floor(Math.random() * reportIds.length)]
      const patientName = patientNames[Math.floor(Math.random() * patientNames.length)]
      const examItem = examItems[Math.floor(Math.random() * examItems.length)]
      targetDesc = `${patientName}的${examItem}报告`
      beforeData = `印象：左肺下叶见约1.2cm结节影，边缘毛糙。建议定期随访。\n诊断意见：左肺下叶结节，LU-RADS 3类。`
      afterData = `印象：左肺下叶见约1.3cm结节影，边缘毛糙伴少许索条影。较前片略增大。\n诊断意见：左肺下叶结节，LU-RADS 4A类，建议进一步检查。`
      duration = Math.floor(Math.random() * 600) + 30
    } else if (action === '审核通过') {
      targetId = reportIds[Math.floor(Math.random() * reportIds.length)]
      const patientName = patientNames[Math.floor(Math.random() * patientNames.length)]
      const examItem = examItems[Math.floor(Math.random() * examItems.length)]
      targetDesc = `${patientName}的${examItem}报告`
      duration = Math.floor(Math.random() * 120) + 5
    } else if (action === '审核驳回') {
      targetId = reportIds[Math.floor(Math.random() * reportIds.length)]
      const patientName = patientNames[Math.floor(Math.random() * patientNames.length)]
      const examItem = examItems[Math.floor(Math.random() * examItems.length)]
      targetDesc = `${patientName}的${examItem}报告`
      beforeData = `报告描述不完整，请补充诊断依据。`
      duration = Math.floor(Math.random() * 60) + 10
    } else if (action === '登录') {
      targetDesc = `${user.name}登录系统`
      targetId = user.id
      duration = Math.floor(Math.random() * 10) + 1
    } else if (action === '登出') {
      targetDesc = `${user.name}退出系统`
      targetId = user.id
      duration = Math.floor(Math.random() * 5) + 1
    } else if (action === '导出数据') {
      targetId = `EXPORT-${String(i).padStart(5, '0')}`
      targetDesc = `导出报告统计数据（2026年4月）`
      beforeData = `导出范围：2026-04-01 至 2026-04-30\n导出内容：CT/MR/DR全部报告`
      afterData = `导出文件：report_stats_2026_04.xlsx\n导出记录数：2456条`
      duration = Math.floor(Math.random() * 120) + 60
    } else if (action === '修改设置') {
      targetId = `SETTINGS-${String(i % 5 + 1).padStart(2, '0')}`
      const settingNames = ['危急值通知规则', '报告审核流程', '预约超时设置', '系统参数配置', '用户权限设置']
      targetDesc = settingNames[i % 5]
      beforeData = `危急值提醒时间间隔：5分钟\n短信通知：开启\n邮件通知：开启`
      afterData = `危急值提醒时间间隔：3分钟\n短信通知：开启\n邮件通知：关闭`
      duration = Math.floor(Math.random() * 180) + 20
    } else if (action === '批量审核') {
      targetId = `BATCH-${String(i).padStart(5, '0')}`
      const count = Math.floor(Math.random() * 20) + 5
      targetDesc = `批量审核${count}份报告`
      duration = Math.floor(Math.random() * 300) + count * 10
    } else if (action === '打印报告') {
      targetId = reportIds[Math.floor(Math.random() * reportIds.length)]
      const patientName = patientNames[Math.floor(Math.random() * patientNames.length)]
      const examItem = examItems[Math.floor(Math.random() * examItems.length)]
      targetDesc = `打印${patientName}的${examItem}报告`
      duration = Math.floor(Math.random() * 30) + 5
    } else if (action === '数据导入') {
      targetId = `IMPORT-${String(i).padStart(5, '0')}`
      targetDesc = `导入患者检查数据`
      beforeData = `导入文件：patient_data_2026_04.csv\n预计导入记录数：500条`
      afterData = `成功导入：498条\n失败：2条\n耗时：45秒`
      duration = Math.floor(Math.random() * 600) + 30
    } else if (action === '系统维护') {
      targetId = `MAINT-${String(i % 8 + 1).padStart(2, '0')}`
      const maintNames = ['数据库备份', '缓存清理', '日志归档', '索引重建', '系统健康检查', '安全扫描', '性能优化', '服务重启']
      targetDesc = maintNames[i % 8]
      duration = Math.floor(Math.random() * 3600) + 60
    }

    logs.push({
      id: `LOG${String(i + 1).padStart(6, '0')}`,
      userId: user.id,
      userName: user.name,
      action,
      module,
      targetId,
      targetDesc,
      beforeData,
      afterData,
      timestamp,
      ipAddress: ips[Math.floor(Math.random() * ips.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      duration,
      patientId,
      department,
    })
  }

  // 生成50条HIPAA专用日志
  const hipaaLogs: OperationLog[] = []
  const hipaaActions = [
    { action: '查看报告', category: 'view' },
    { action: '查看影像', category: 'view' },
    { action: '查看患者信息', category: 'view' },
    { action: '修改报告', category: 'modify' },
    { action: '修改患者信息', category: 'modify' },
    { action: '打印报告', category: 'print' },
    { action: '打印胶片', category: 'print' },
    { action: '导出数据', category: 'export' },
    { action: '批量导出', category: 'export' },
    { action: '删除报告', category: 'delete' },
    { action: '删除影像', category: 'delete' },
  ]
  
  const hipaaUsers = [
    { name: '李明辉', department: '放射科' },
    { name: '王晓燕', department: '放射科' },
    { name: '张志强', department: '内科' },
    { name: '赵雅琪', department: '放射科' },
    { name: '周伟民', department: '外科' },
  ]

  for (let i = 0; i < 50; i++) {
    const user = hipaaUsers[Math.floor(Math.random() * hipaaUsers.length)]
    const actionInfo = hipaaActions[Math.floor(Math.random() * hipaaActions.length)]
    const patientName = patientNames[Math.floor(Math.random() * patientNames.length)]
    const patientId = patientIds[Math.floor(Math.random() * patientIds.length)]
    const reportId = reportIds[Math.floor(Math.random() * reportIds.length)]
    
    // 随机时间分布：部分在非工作时间
    let hoursOffset = Math.random()
    let timestamp: Date
    if (i % 8 === 0) {
      // 8分之一概率非工作时间
      timestamp = new Date(baseTime.getTime() + (Math.floor(i / 8) * 3600000) + (22 + Math.random() * 4) * 3600000)
    } else if (i % 10 === 0) {
      // 10分之一概率凌晨
      timestamp = new Date(baseTime.getTime() + (Math.floor(i / 10) * 3600000) + Math.random() * 3 * 3600000)
    } else {
      timestamp = new Date(baseTime.getTime() + (Math.floor(i / 2) + Math.random() * 0.5) * 3600000)
    }

    let targetDesc = ''
    let targetId = ''
    
    if (actionInfo.action.includes('报告')) {
      targetId = reportId
      targetDesc = `${patientName}的${examItems[Math.floor(Math.random() * examItems.length)]}报告`
    } else if (actionInfo.action.includes('影像')) {
      targetId = `IMG-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`
      targetDesc = `${patientName}的影像检查`
    } else if (actionInfo.action.includes('患者')) {
      targetId = patientId
      targetDesc = `${patientName}的患者信息`
    }

    const log: OperationLog = {
      id: `HIPAALOG${String(i + 1).padStart(4, '0')}`,
      userId: `USR${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`,
      userName: user.name,
      action: actionInfo.action,
      module: '报告管理',
      targetId,
      targetDesc,
      timestamp: timestamp.toISOString(),
      ipAddress: ips[Math.floor(Math.random() * ips.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      source: 'Web端',
      patientId,
      department: user.department,
    }

    // 检查合规性
    const compliance = checkCompliance(log, [...logs, ...hipaaLogs])
    log.complianceLevel = compliance.level
    log.complianceAlerts = compliance.alerts

    hipaaLogs.push(log)
  }

  return [...logs, ...hipaaLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// ============================================================
// 日志详情弹窗组件
// ============================================================
function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  if (!log) return null

  const renderDiff = () => {
    if (!log.beforeData && !log.afterData) {
      return <div style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>无数据对比</div>
    }

    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 8, fontSize: 13 }}>数据对比：</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ background: '#fef2f2', padding: '8px 12px', fontWeight: 600, fontSize: 12, color: DANGER, borderBottom: '1px solid #fecaca' }}>
              修改前
            </div>
            <pre style={{ margin: 0, padding: 12, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#fef2f2', color: '#991b1b', lineHeight: 1.6 }}>
              {log.beforeData || '(空)'}
            </pre>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ background: '#ecfdf5', padding: '8px 12px', fontWeight: 600, fontSize: 12, color: SUCCESS, borderBottom: '1px solid #a7f3d0' }}>
              修改后
            </div>
            <pre style={{ margin: 0, padding: 12, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#ecfdf5', color: '#065f46', lineHeight: 1.6 }}>
              {log.afterData || '(空)'}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: WHITE, borderRadius: 12, width: '90%', maxWidth: 800,
        maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div style={{
          background: PRIMARY, padding: '16px 20px', borderRadius: '12px 12px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={20} color={WHITE} />
            <span style={{ color: WHITE, fontSize: 16, fontWeight: 600 }}>操作日志详情</span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6,
            padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}>
            <X size={18} color={WHITE} />
          </button>
        </div>

        {/* 内容 */}
        <div style={{ padding: 20 }}>
          {/* 操作基本信息 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>日志ID</div>
              <div style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>{log.id}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>操作时间</div>
              <div style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>{formatDateTime(log.timestamp)}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>操作类型</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  background: `${ACTION_COLORS[log.action] || ACCENT}20`,
                  color: ACTION_COLORS[log.action] || ACCENT,
                  padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                }}>
                  {log.action}
                </span>
              </div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>操作用户</div>
              <div style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>{log.userName}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>用户ID</div>
              <div style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>{log.userId}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>操作模块</div>
              <div style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>{log.module}</div>
            </div>
          </div>

          {/* 目标信息 */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 10, fontSize: 13 }}>操作目标</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div>
                <div style={{ color: GRAY, fontSize: 11, marginBottom: 2 }}>目标ID</div>
                <div style={{ color: PRIMARY, fontSize: 13 }}>{log.targetId}</div>
              </div>
              <div>
                <div style={{ color: GRAY, fontSize: 11, marginBottom: 2 }}>目标描述</div>
                <div style={{ color: PRIMARY, fontSize: 13 }}>{log.targetDesc}</div>
              </div>
            </div>
            {log.patientId && (
              <div style={{ marginTop: 8 }}>
                <div style={{ color: GRAY, fontSize: 11, marginBottom: 2 }}>患者ID</div>
                <div style={{ color: PRIMARY, fontSize: 13 }}>{log.patientId}</div>
              </div>
            )}
          </div>

          {/* 环境信息 */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 10, fontSize: 13 }}>环境信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={14} color={GRAY} />
                <div>
                  <div style={{ color: GRAY, fontSize: 11 }}>IP地址</div>
                  <div style={{ color: PRIMARY, fontSize: 13 }}>{log.ipAddress}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MonitorSmartphone size={14} color={GRAY} />
                <div>
                  <div style={{ color: GRAY, fontSize: 11 }}>设备</div>
                  <div style={{ color: PRIMARY, fontSize: 13 }}>{log.device}</div>
                </div>
              </div>
            </div>
          </div>

          {/* HIPAA合规信息 */}
          {log.complianceLevel && (
            <div style={{ 
              background: log.complianceLevel === 'critical' ? '#fef2f2' : log.complianceLevel === 'warning' ? '#fffbeb' : '#ecfdf5',
              padding: 16, borderRadius: 8, 
              border: `1px solid ${log.complianceLevel === 'critical' ? '#fecaca' : log.complianceLevel === 'warning' ? '#fde68a' : '#a7f3d0'}`,
              marginBottom: 16 
            }}>
              <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={16} />
                HIPAA合规状态
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: log.complianceLevel === 'critical' ? `${DANGER}20` : log.complianceLevel === 'warning' ? `${WARNING}20` : `${SUCCESS}20`,
                  color: log.complianceLevel === 'critical' ? DANGER : log.complianceLevel === 'warning' ? WARNING : SUCCESS,
                }}>
                  {log.complianceLevel === 'critical' ? '违规' : log.complianceLevel === 'warning' ? '警告' : '合规'}
                </span>
              </div>
              {log.complianceAlerts && log.complianceAlerts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {log.complianceAlerts.map((alert, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', alignItems: 'center', gap: 8,
                      color: alert.level === 'critical' ? DANGER : WARNING,
                      fontSize: 12
                    }}>
                      {alert.level === 'critical' ? <AlertTriangle size={14} /> : <AlertCircle size={14} />}
                      {alert.message}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: SUCCESS, fontSize: 12 }}>✓ 无违规行为</div>
              )}
            </div>
          )}

          {/* 数据对比 */}
          {renderDiff()}
        </div>

        {/* 底部 */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '8px 20px', borderRadius: 6, border: '1px solid #e2e8f0',
            background: WHITE, color: GRAY, fontSize: 13, cursor: 'pointer',
          }}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 今日操作趋势统计卡片
// ============================================================
function TodayTrendCard({ todayCount, yesterdayCount, todayTrend, peakHour, topUser }: TodayTrendCardProps) {
  const trendPercent = yesterdayCount > 0 ? ((todayCount - yesterdayCount) / yesterdayCount * 100).toFixed(1) : '0'
  const isPositive = todayCount >= yesterdayCount

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {/* 今日总数 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: `${ACCENT}20`, padding: 8, borderRadius: 8 }}>
              <Activity size={18} color={ACCENT} />
            </div>
            <span style={{ fontSize: 12, color: GRAY }}>今日操作</span>
          </div>
          <span style={{
            fontSize: 10, padding: '2px 6px', borderRadius: 4,
            background: isPositive ? `${SUCCESS}20` : `${DANGER}20`,
            color: isPositive ? SUCCESS : DANGER,
          }}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          </span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: PRIMARY }}>{todayCount}</div>
        <div style={{ fontSize: 11, color: GRAY, marginTop: 4 }}>
          昨日 {yesterdayCount}，{isPositive ? '↑' : '↓'}{Math.abs(parseFloat(trendPercent))}%
        </div>
      </div>

      {/* 趋势图 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 8, fontSize: 13 }}>24小时趋势</div>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={todayTrend.map((v, i) => ({ hour: `${String(i).padStart(2, '0')}:00`, value: v }))}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={3} />
            <YAxis hide />
            <Tooltip
              formatter={(value: number) => [`${value}次`, '操作次数']}
              contentStyle={{ borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11 }}
            />
            <Area type="monotone" dataKey="value" stroke={ACCENT} fill="url(#colorValue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 峰值时段 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: `${WARNING}20`, padding: 8, borderRadius: 8 }}>
            <Flame size={18} color={WARNING} />
          </div>
          <span style={{ fontSize: 12, color: GRAY }}>高峰时段</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: PRIMARY }}>{peakHour}</div>
        <div style={{ fontSize: 11, color: GRAY, marginTop: 4 }}>
          <Users size={10} style={{ verticalAlign: 'middle' }} /> 最活跃用户: {topUser}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// HIPAA统计卡片
// ============================================================
function HipaaStatsCards({ stats }: { stats: HipaaStats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
      {/* 今日操作总数 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: `${PRIMARY}20`, padding: 8, borderRadius: 8 }}>
            <Activity size={18} color={PRIMARY} />
          </div>
          <span style={{ fontSize: 12, color: GRAY }}>今日操作总数</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: PRIMARY }}>{stats.todayTotal}</div>
      </div>

      {/* 异常操作数 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: `1px solid ${stats.abnormalCount > 0 ? DANGER : '#e2e8f0'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: `${DANGER}20`, padding: 8, borderRadius: 8 }}>
            <AlertTriangle size={18} color={DANGER} />
          </div>
          <span style={{ fontSize: 12, color: GRAY }}>异常操作数</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: stats.abnormalCount > 0 ? DANGER : SUCCESS }}>{stats.abnormalCount}</div>
      </div>

      {/* 最活跃用户 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: `${SUCCESS}20`, padding: 8, borderRadius: 8 }}>
            <User size={18} color={SUCCESS} />
          </div>
          <span style={{ fontSize: 12, color: GRAY }}>最活跃用户</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY }}>{stats.mostActiveUser}</div>
      </div>

      {/* 最高风险操作 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: `${WARNING}20`, padding: 8, borderRadius: 8 }}>
            <Shield size={18} color={WARNING} />
          </div>
          <span style={{ fontSize: 12, color: GRAY }}>最高风险操作</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: WARNING }}>{stats.highestRiskOperation}</div>
      </div>
    </div>
  )
}

// ============================================================
// HIPAA合规日志表格
// ============================================================
function HipaaLogTable({ logs, onViewDetail }: { logs: OperationLog[], onViewDetail: (log: OperationLog) => void }) {
  const getComplianceBadge = (log: OperationLog) => {
    if (log.complianceLevel === 'critical') {
      return (
        <span style={{
          background: `${DANGER}20`,
          color: DANGER,
          padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <AlertTriangle size={12} /> 违规
        </span>
      )
    }
    if (log.complianceLevel === 'warning') {
      return (
        <span style={{
          background: `${WARNING}20`,
          color: WARNING,
          padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <AlertCircle size={12} /> 警告
        </span>
      )
    }
    return (
      <span style={{
        background: `${SUCCESS}20`,
        color: SUCCESS,
        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <CheckCircle size={12} /> 合规
      </span>
    )
  }

  return (
    <div style={{ background: WHITE, borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* 表格头部 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '140px 80px 100px 120px 100px 1fr 100px',
        padding: '12px 16px',
        background: PRIMARY,
        fontSize: 12, fontWeight: 600, color: WHITE,
      }}>
        <div>时间</div>
        <div>操作用户</div>
        <div>操作类型</div>
        <div>对象</div>
        <div>IP地址</div>
        <div>操作详情</div>
        <div>是否合规</div>
      </div>

      {/* 表格内容 */}
      {logs.map((log, index) => (
        <div
          key={log.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 80px 100px 120px 100px 1fr 100px',
            padding: '12px 16px',
            borderBottom: '1px solid #f1f5f9',
            fontSize: 12,
            alignItems: 'center',
            background: index % 2 === 0 ? WHITE : '#fafbfc',
            borderLeft: log.complianceLevel === 'critical' ? `3px solid ${DANGER}` :
                       log.complianceLevel === 'warning' ? `3px solid ${WARNING}` : '3px solid transparent',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? WHITE : '#fafbfc'}
        >
          <div style={{ color: PRIMARY, fontWeight: 500 }}>
            <div>{formatDate(log.timestamp)}</div>
            <div style={{ color: GRAY, fontSize: 11 }}>{formatTime(log.timestamp)}</div>
          </div>
          <div>
            <div style={{ color: PRIMARY, fontWeight: 500 }}>{log.userName}</div>
            {log.department && (
              <div style={{ fontSize: 10, color: GRAY }}>{log.department}</div>
            )}
          </div>
          <div>
            <span style={{
              background: `${ACTION_COLORS[log.action] || ACCENT}20`,
              color: ACTION_COLORS[log.action] || ACCENT,
              padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              {ACTION_ICONS[log.action]}
              {log.action}
            </span>
          </div>
          <div style={{ color: '#475569' }}>
            {log.patientId && <div style={{ fontSize: 11 }}>患者: {log.patientId}</div>}
            {log.reportId && <div style={{ fontSize: 11 }}>报告: {log.reportId}</div>}
            {!log.patientId && !log.reportId && (
              <div style={{ fontSize: 11, color: GRAY }}>{log.targetId}</div>
            )}
          </div>
          <div style={{ color: GRAY }}>{log.ipAddress}</div>
          <div style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.targetDesc}>
            {log.targetDesc}
          </div>
          <div>
            {getComplianceBadge(log)}
            {log.complianceAlerts && log.complianceAlerts.length > 0 && (
              <button
                onClick={() => onViewDetail(log)}
                style={{
                  marginTop: 4,
                  padding: '2px 6px', borderRadius: 4, border: '1px solid #e2e8f0',
                  background: WHITE, color: ACCENT, fontSize: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 2,
                }}
              >
                <Eye size={10} /> 详情
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// HIPAA合规告警统计
// ============================================================
function HipaaAlertSummary({ logs }: { logs: OperationLog[] }) {
  const alertStats = useMemo(() => {
    const stats = {
      nonWorkHours: 0,
      crossDepartment: 0,
      batchExport: 0,
      highFrequency: 0,
    }
    logs.forEach(log => {
      if (log.complianceAlerts) {
        log.complianceAlerts.forEach(alert => {
          if (alert.type === 'non_work_hours') stats.nonWorkHours++
          if (alert.type === 'cross_department') stats.crossDepartment++
          if (alert.type === 'batch_export') stats.batchExport++
          if (alert.type === 'high_frequency') stats.highFrequency++
        })
      }
    })
    return stats
  }, [logs])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
      {/* 非工作时间访问 */}
      <div style={{ 
        background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #fecaca',
        borderLeft: `4px solid ${DANGER}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: `${DANGER}20`, padding: 8, borderRadius: 8 }}>
            <Clock size={18} color={DANGER} />
          </div>
          <span style={{ fontSize: 12, color: GRAY }}>非工作时间访问</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: DANGER }}>{alertStats.nonWorkHours}</div>
        <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>22:00 - 06:00</div>
      </div>

      {/* 跨科室访问 */}
      <div style={{ 
        background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #fecaca',
        borderLeft: `4px solid ${DANGER}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: `${DANGER}20`, padding: 8, borderRadius: 8 }}>
            <Users size={18} color={DANGER} />
          </div>
          <span style={{ fontSize: 12, color: GRAY }}>跨科室访问</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: DANGER }}>{alertStats.crossDepartment}</div>
        <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>权限范围外访问</div>
      </div>

      {/* 批量导出 */}
      <div style={{ 
        background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #fde68a',
        borderLeft: `4px solid ${WARNING}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: `${WARNING}20`, padding: 8, borderRadius: 8 }}>
            <Download size={18} color={WARNING} />
          </div>
          <span style={{ fontSize: 12, color: GRAY }}>批量导出</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: WARNING }}>{alertStats.batchExport}</div>
        <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>超出正常频率</div>
      </div>

      {/* 高频访问 */}
      <div style={{ 
        background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #fde68a',
        borderLeft: `4px solid ${WARNING}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ background: `${WARNING}20`, padding: 8, borderRadius: 8 }}>
            <Activity size={18} color={WARNING} />
          </div>
          <span style={{ fontSize: 12, color: GRAY }}>高频访问</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: WARNING }}>{alertStats.highFrequency}</div>
        <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>同一患者多次访问</div>
      </div>
    </div>
  )
}

// ============================================================
// HIPAA日志导出面板
// ============================================================
function HipaaExportPanel({ 
  hipaaLogs, 
  onExportCSV, 
  onExportPDF, 
  onGenerateReport,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  actionFilter, setActionFilter,
  userFilter, setUserFilter,
  allUserNames,
}: {
  hipaaLogs: OperationLog[]
  onExportCSV: () => void
  onExportPDF: () => void
  onGenerateReport: () => void
  dateFrom: string
  setDateFrom: (v: string) => void
  dateTo: string
  setDateTo: (v: string) => void
  actionFilter: string
  setActionFilter: (v: string) => void
  userFilter: string
  setUserFilter: (v: string) => void
  allUserNames: string[]
}) {
  const inputStyle = {
    padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: WHITE, color: PRIMARY, fontSize: 12, outline: 'none' as const,
  }

  const selectStyle = {
    padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: WHITE, color: PRIMARY, fontSize: 12, cursor: 'pointer' as const, outline: 'none' as const,
  }

  return (
    <div style={{
      background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0',
      marginBottom: 16, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap'
    }}>
      {/* 标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
        <FileCheck size={18} color={PRIMARY} />
        <span style={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>日志导出与报告</span>
      </div>

      {/* 日期范围 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>日期范围:</span>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          style={inputStyle}
        />
        <span style={{ color: GRAY }}>-</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* 操作类型过滤 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>操作类型:</span>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          style={selectStyle}
        >
          {HIPAA_ACTION_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* 用户过滤 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>用户:</span>
        <select
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          style={selectStyle}
        >
          {allUserNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* 导出按钮 */}
      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
        <button
          onClick={onExportCSV}
          style={{
            padding: '6px 14px', borderRadius: 6, border: `1px solid ${SUCCESS}`,
            background: `${SUCCESS}10`, color: SUCCESS,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <FileSpreadsheet size={14} />
          导出CSV
        </button>
        <button
          onClick={onExportPDF}
          style={{
            padding: '6px 14px', borderRadius: 6, border: `1px solid ${DANGER}`,
            background: `${DANGER}10`, color: DANGER,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <FileText size={14} />
          导出PDF
        </button>
        <button
          onClick={onGenerateReport}
          style={{
            padding: '6px 14px', borderRadius: 6, border: `1px solid ${PRIMARY}`,
            background: `${PRIMARY}10`, color: PRIMARY,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Shield size={14} />
          生成合规报告
        </button>
      </div>
    </div>
  )
}

// ============================================================
// 耗时分析视图组件
// ============================================================
function DurationAnalysisView({ logs }: { logs: OperationLog[] }) {
  // 按操作类型统计平均耗时
  const durationByAction = useMemo(() => {
    const stats: Record<string, { total: number; count: number; durations: number[] }> = {}
    logs.forEach(log => {
      if (log.duration !== undefined) {
        if (!stats[log.action]) {
          stats[log.action] = { total: 0, count: 0, durations: [] }
        }
        stats[log.action].total += log.duration
        stats[log.action].count++
        stats[log.action].durations.push(log.duration)
      }
    })
    return Object.entries(stats)
      .map(([action, data]) => ({
        action,
        avgDuration: Math.round(data.total / data.count),
        maxDuration: Math.max(...data.durations),
        minDuration: Math.min(...data.durations),
        count: data.count,
        color: ACTION_COLORS[action] || ACCENT,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
  }, [logs])

  // 耗时分布
  const durationDistribution = useMemo(() => {
    const ranges = [
      { label: '<1分钟', min: 0, max: 60, color: '#10b981' },
      { label: '1-5分钟', min: 60, max: 300, color: '#3b82f6' },
      { label: '5-15分钟', min: 300, max: 900, color: '#f59e0b' },
      { label: '15-60分钟', min: 900, max: 3600, color: '#ef4444' },
      { label: '>1小时', min: 3600, max: Infinity, color: '#7c3aed' },
    ]
    return ranges.map(range => {
      const count = logs.filter(l => l.duration !== undefined && l.duration >= range.min && l.duration < range.max).length
      const percent = logs.length > 0 ? (count / logs.length * 100).toFixed(1) : '0'
      return { ...range, count, percent }
    })
  }, [logs])

  // 耗时趋势（按小时）
  const durationTrend = useMemo(() => {
    const hourly: Record<number, { total: number; count: number }> = {}
    logs.forEach(log => {
      if (log.duration !== undefined) {
        const hour = new Date(log.timestamp).getHours()
        if (!hourly[hour]) hourly[hour] = { total: 0, count: 0 }
        hourly[hour].total += log.duration
        hourly[hour].count++
      }
    })
    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      avgDuration: hourly[hour] ? Math.round(hourly[hour].total / hourly[hour].count) : 0,
    }))
  }, [logs])

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
    return `${Math.floor(seconds / 3600)}时${Math.floor((seconds % 3600) / 60)}分`
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* 耗时排名 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Timer size={16} />
          操作类型耗时排名
        </div>
        <div style={{ maxHeight: 300, overflow: 'auto' }}>
          {durationByAction.map((item, index) => (
            <div key={item.action} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: index < durationByAction.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', background: `${item.color}20`,
                color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: PRIMARY, fontWeight: 500 }}>{item.action}</div>
                <div style={{ fontSize: 11, color: GRAY }}>共 {item.count} 次操作</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>{formatDuration(item.avgDuration)}</div>
                <div style={{ fontSize: 10, color: GRAY }}>平均耗时</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 耗时分布饼图 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <PieChartIcon size={16} />
          耗时分布
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={durationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="label"
                >
                  {durationDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value}次 (${durationDistribution.find(d => d.label === name)?.percent}%)`, name]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            {durationDistribution.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
                <span style={{ fontSize: 11, color: GRAY, flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY }}>{item.count}次</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 耗时趋势图 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={16} />
          24小时平均耗时趋势
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={durationTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 60)}分`} />
            <Tooltip
              formatter={(value: number) => [formatDuration(value), '平均耗时']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
            />
            <Line type="monotone" dataKey="avgDuration" stroke={PRIMARY} strokeWidth={2} dot={{ fill: PRIMARY, r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============================================================
// 用户活跃时段热力图组件
// ============================================================
function UserActivityHeatmap({ logs }: { logs: OperationLog[] }) {
  const heatmapData = useMemo(() => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const data: { day: string; hour: number; value: number }[] = []
    days.forEach((day, dayIndex) => {
      for (let hour = 0; hour < 24; hour++) {
        // 模拟工作日高峰
        let value = Math.floor(Math.random() * 20)
        if (hour >= 8 && hour <= 17 && dayIndex < 5) {
          value = Math.floor(Math.random() * 40) + 20
        } else if (hour >= 9 && hour <= 11 && dayIndex < 5) {
          value = Math.floor(Math.random() * 50) + 40
        }
        data.push({ day, hour, value })
      }
    })
    return data
  }, [])

  const getHeatColor = (value: number) => {
    if (value < 10) return '#f0f9ff'
    if (value < 20) return '#bae6fd'
    if (value < 30) return '#38bdf8'
    if (value < 40) return '#0ea5e9'
    if (value < 50) return '#0284c7'
    return '#0369a1'
  }

  return (
    <div>
      <div style={{ overflow: 'auto' }}>
        <div style={{ display: 'flex', marginLeft: 50, marginBottom: 4 }}>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} style={{ width: 20, fontSize: 9, color: GRAY, textAlign: 'center' }}>
              {i % 4 === 0 ? `${i}` : ''}
            </div>
          ))}
        </div>
        {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, dayIndex) => (
          <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <div style={{ width: 45, fontSize: 10, color: GRAY }}>{day}</div>
            <div style={{ display: 'flex', gap: 1 }}>
              {heatmapData.filter(d => d.day === day).map((item) => (
                <div
                  key={item.hour}
                  style={{
                    width: 18,
                    height: 14,
                    background: getHeatColor(item.value),
                    borderRadius: 2,
                  }}
                  title={`${day} ${item.hour}:00 - ${item.value}次操作`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: GRAY }}>低</span>
        {[5, 15, 25, 35, 45, 55].map((val) => (
          <div key={val} style={{ width: 14, height: 14, background: getHeatColor(val), borderRadius: 2 }} />
        ))}
        <span style={{ fontSize: 10, color: GRAY }}>高</span>
      </div>
    </div>
  )
}

// ============================================================
// 统计图表组件
// ============================================================
function StatisticsCharts({ logs }: { logs: OperationLog[] }) {
  // 操作类型分布
  const actionStats = useMemo(() => {
    const counts: Record<string, number> = {}
    logs.forEach(log => {
      counts[log.action] = (counts[log.action] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: ACTION_COLORS[name] || ACCENT,
    }))
  }, [logs])

  // 用户操作量统计
  const userStats = useMemo(() => {
    const counts: Record<string, number> = {}
    logs.forEach(log => {
      counts[log.userName] = (counts[log.userName] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [logs])

  // 操作时段分布（小时）
  const hourStats = useMemo(() => {
    const counts: number[] = new Array(24).fill(0)
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours()
      counts[hour]++
    })
    return counts.map((value, hour) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      value,
    }))
  }, [logs])

  // 操作高峰时段热力图数据
  const heatmapData = useMemo(() => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const data: { day: string; hour: number; value: number }[] = []
    days.forEach((day, dayIndex) => {
      for (let hour = 0; hour < 24; hour++) {
        // 模拟工作日高峰
        let value = Math.floor(Math.random() * 20)
        if (hour >= 8 && hour <= 17 && dayIndex < 5) {
          value = Math.floor(Math.random() * 40) + 20
        } else if (hour >= 9 && hour <= 11 && dayIndex < 5) {
          value = Math.floor(Math.random() * 50) + 40
        }
        data.push({ day, hour, value })
      }
    })
    return data
  }, [])

  const getHeatColor = (value: number) => {
    if (value < 10) return '#f0f9ff'
    if (value < 20) return '#bae6fd'
    if (value < 30) return '#38bdf8'
    if (value < 40) return '#0ea5e9'
    if (value < 50) return '#0284c7'
    return '#0369a1'
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* 操作类型饼图 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <PieChartIcon size={16} />
          操作类型分布
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={actionStats}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
            >
              {actionStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value}次`, '操作次数']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 用户操作量柱状图 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart3 size={16} />
          用户操作量 TOP10
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={userStats} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
            <Tooltip
              formatter={(value: number) => [`${value}次`, '操作次数']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Bar dataKey="value" fill={ACCENT} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 操作时段柱状图 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={16} />
          24小时操作趋势
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={hourStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => [`${value}次`, '操作次数']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Bar dataKey="value" fill={PRIMARY_LIGHT} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 操作高峰时段热力图 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={16} />
          操作高峰时段热力图
        </div>
        <div style={{ overflow: 'auto' }}>
          <div style={{ display: 'flex', marginLeft: 50, marginBottom: 4 }}>
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} style={{ width: 20, fontSize: 9, color: GRAY, textAlign: 'center' }}>
                {i % 4 === 0 ? `${i}` : ''}
              </div>
            ))}
          </div>
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, dayIndex) => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <div style={{ width: 45, fontSize: 10, color: GRAY }}>{day}</div>
              <div style={{ display: 'flex', gap: 1 }}>
                {heatmapData.filter(d => d.day === day).map((item) => (
                  <div
                    key={item.hour}
                    style={{
                      width: 18,
                      height: 14,
                      background: getHeatColor(item.value),
                      borderRadius: 2,
                    }}
                    title={`${day} ${item.hour}:00 - ${item.value}次操作`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: GRAY }}>低</span>
          {[5, 15, 25, 35, 45, 55].map((val) => (
            <div key={val} style={{ width: 14, height: 14, background: getHeatColor(val), borderRadius: 2 }} />
          ))}
          <span style={{ fontSize: 10, color: GRAY }}>高</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 时间线视图组件
// ============================================================
function TimelineView({ logs, onViewDetail }: { logs: OperationLog[], onViewDetail: (log: OperationLog) => void }) {
  // 按日期分组
  const groupedLogs = useMemo(() => {
    const groups: Record<string, OperationLog[]> = {}
    logs.forEach(log => {
      const date = formatDate(log.timestamp)
      if (!groups[date]) groups[date] = []
      groups[date].push(log)
    })
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
  }, [logs])

  return (
    <div style={{ position: 'relative' }}>
      {/* 时间线 */}
      {groupedLogs.map(([date, dayLogs], groupIndex) => (
        <div key={date} style={{ marginBottom: 24 }}>
          {/* 日期标签 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, marginLeft: 40 }}>
            <div style={{
              background: PRIMARY, color: WHITE, padding: '4px 12px', borderRadius: 20,
              fontSize: 12, fontWeight: 600, boxShadow: '0 2px 6px rgba(30,58,95,0.3)',
            }}>
              {date}
            </div>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0', marginLeft: 12 }} />
          </div>

          {/* 日期内的日志 */}
          <div style={{ marginLeft: 40 }}>
            {dayLogs.map((log, index) => {
              const isLast = index === dayLogs.length - 1
              return (
                <div key={log.id} style={{ display: 'flex', position: 'relative', paddingBottom: isLast ? 0 : 16 }}>
                  {/* 时间线竖线 */}
                  <div style={{
                    position: 'absolute', left: -32, top: 8,
                    width: 12, height: 12, borderRadius: '50%',
                    background: ACTION_COLORS[log.action] || ACCENT,
                    border: '2px solid #e2e8f0', boxShadow: '0 0 0 3px #e2e8f0',
                    zIndex: 1,
                  }} />
                  {!isLast && (
                    <div style={{
                      position: 'absolute', left: -27, top: 20,
                      width: 2, height: 'calc(100% - 12px)',
                      background: '#e2e8f0',
                    }} />
                  )}

                  {/* 日志卡片 */}
                  <div style={{
                    flex: 1, background: WHITE, border: '1px solid #e2e8f0',
                    borderRadius: 10, padding: 14, marginLeft: 16,
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      e.currentTarget.style.borderColor = ACCENT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }}
                    onClick={() => onViewDetail(log)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          background: `${ACTION_COLORS[log.action] || ACCENT}20`,
                          color: ACTION_COLORS[log.action] || ACCENT,
                          padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {ACTION_ICONS[log.action]}
                          {log.action}
                        </span>
                        <span style={{ fontSize: 12, color: GRAY }}>{log.module}</span>
                      </div>
                      <span style={{ fontSize: 11, color: GRAY }}>{formatTime(log.timestamp)}</span>
                    </div>

                    <div style={{ fontSize: 13, color: PRIMARY, marginBottom: 6 }}>
                      {log.targetDesc}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 11, color: GRAY, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={11} />
                          {log.userName}
                        </span>
                        <span style={{ fontSize: 11, color: GRAY, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Monitor size={11} />
                          {log.ipAddress}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: ACCENT, display: 'flex', alignItems: 'center', gap: 2 }}>
                        查看详情 <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// 主页面组件
// ============================================================
export default function OperationLogPage() {
  const allLogs = useMemo(() => generateMockOperationLogs(), [])

  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table')
  const [viewTab, setViewTab] = useState<ViewTab>('logs')
  const [searchText, setSearchText] = useState('')
  const [actionFilter, setActionFilter] = useState('全部')
  const [moduleFilter, setModuleFilter] = useState('全部')
  const [userFilter, setUserFilter] = useState('全部')
  const [sourceFilter, setSourceFilter] = useState('全部')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [quickTimeFilter, setQuickTimeFilter] = useState<QuickTimeValue>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null)
  const [showStats, setShowStats] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // HIPAA专用筛选
  const [hipaaDateFrom, setHipaaDateFrom] = useState('')
  const [hipaaDateTo, setHipaaDateTo] = useState('')
  const [hipaaActionFilter, setHipaaActionFilter] = useState('全部')
  const [hipaaUserFilter, setHipaaUserFilter] = useState('全部')
  const [hipaaCurrentPage, setHipaaCurrentPage] = useState(1)
  const [hipaaPageSize, setHipaaPageSize] = useState(20)

  // 筛选后的日志
  const filteredLogs = useMemo(() => {
    const now = new Date('2026-05-01T18:00:00')
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10)
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)

    return allLogs.filter(log => {
      if (searchText) {
        const search = searchText.toLowerCase()
        if (
          !log.userName.toLowerCase().includes(search) &&
          !log.targetDesc.toLowerCase().includes(search) &&
          !log.targetId.toLowerCase().includes(search) &&
          !log.id.toLowerCase().includes(search)
        ) {
          return false
        }
      }
      if (actionFilter !== '全部' && log.action !== actionFilter) return false
      if (moduleFilter !== '全部' && log.module !== moduleFilter) return false
      if (userFilter !== '全部' && log.userName !== userFilter) return false
      if (sourceFilter !== '全部' && log.source !== sourceFilter) return false
      if (dateFrom) {
        const fromDate = dateFrom === 'today' ? todayStart : dateFrom === 'week' ? weekStart : dateFrom === 'month' ? monthStart : dateFrom
        if (log.timestamp < fromDate) return false
      }
      if (dateTo && log.timestamp > dateTo + 'T23:59:59') return false

      // 快捷时间筛选
      if (quickTimeFilter === 'today') {
        if (log.timestamp.slice(0, 10) !== todayStart) return false
      } else if (quickTimeFilter === 'week') {
        if (log.timestamp < weekStart) return false
      } else if (quickTimeFilter === 'month') {
        if (log.timestamp < monthStart) return false
      }
      return true
    })
  }, [allLogs, searchText, actionFilter, moduleFilter, userFilter, sourceFilter, dateFrom, dateTo, quickTimeFilter])

  // HIPAA筛选后的日志
  const hipaaFilteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      // 只显示HIPAA相关操作
      if (!HIPAA_ACTION_TYPES.includes(log.action) && log.action !== '全部') {
        if (!Object.values(HIPAA_ACTION_CATEGORIES).flat().includes(log.action)) {
          // 允许显示所有有合规信息的日志
          if (!log.complianceLevel) return false
        }
      }
      if (hipaaActionFilter !== '全部' && log.action !== hipaaActionFilter) return false
      if (hipaaUserFilter !== '全部' && log.userName !== hipaaUserFilter) return false
      if (hipaaDateFrom && log.timestamp < hipaaDateFrom) return false
      if (hipaaDateTo && log.timestamp > hipaaDateTo + 'T23:59:59') return false
      return true
    })
  }, [allLogs, hipaaActionFilter, hipaaUserFilter, hipaaDateFrom, hipaaDateTo])

  // HIPAA统计数据
  const hipaaStats = useMemo((): HipaaStats => {
    const today = '2026-05-01'
    const todayLogs = allLogs.filter(l => l.timestamp.slice(0, 10) === today)
    const abnormalLogs = todayLogs.filter(l => l.complianceLevel === 'critical' || l.complianceLevel === 'warning')

    // 最活跃用户
    const userCounts: Record<string, number> = {}
    todayLogs.forEach(log => {
      userCounts[log.userName] = (userCounts[log.userName] || 0) + 1
    })
    const mostActiveUser = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

    // 最高风险操作
    const actionRisk: Record<string, number> = {}
    todayLogs.forEach(log => {
      if (log.complianceLevel === 'critical') {
        actionRisk[log.action] = (actionRisk[log.action] || 0) + 3
      } else if (log.complianceLevel === 'warning') {
        actionRisk[log.action] = (actionRisk[log.action] || 0) + 1
      }
    })
    const highestRiskOperation = Object.entries(actionRisk).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

    return {
      todayTotal: todayLogs.length,
      abnormalCount: abnormalLogs.length,
      mostActiveUser,
      highestRiskOperation,
    }
  }, [allLogs])

  // 今日趋势数据
  const todayTrendData = useMemo(() => {
    const today = '2026-05-01'
    const todayLogs = filteredLogs.filter(l => l.timestamp.slice(0, 10) === today)
    const yesterdayLogs = filteredLogs.filter(l => l.timestamp.slice(0, 10) === '2026-04-30')

    // 24小时趋势
    const hourlyCounts = new Array(24).fill(0)
    todayLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours()
      hourlyCounts[hour]++
    })

    // 峰值时段
    const peakHourIndex = hourlyCounts.indexOf(Math.max(...hourlyCounts))
    const peakHour = `${String(peakHourIndex).padStart(2, '0')}:00`

    // 最活跃用户
    const userCounts: Record<string, number> = {}
    todayLogs.forEach(log => {
      userCounts[log.userName] = (userCounts[log.userName] || 0) + 1
    })
    const topUser = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

    return {
      todayCount: todayLogs.length,
      yesterdayCount: yesterdayLogs.length,
      todayTrend: hourlyCounts,
      peakHour,
      topUser,
    }
  }, [filteredLogs])

  // 分页
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  // HIPAA分页
  const hipaaPaginatedLogs = useMemo(() => {
    const start = (hipaaCurrentPage - 1) * hipaaPageSize
    return hipaaFilteredLogs.slice(start, start + hipaaPageSize)
  }, [hipaaFilteredLogs, hipaaCurrentPage, hipaaPageSize])

  const totalPages = Math.ceil(filteredLogs.length / pageSize)
  const hipaaTotalPages = Math.ceil(hipaaFilteredLogs.length / hipaaPageSize)

  // 重置页码
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1)
  }, [])

  // 获取所有用户名
  const allUserNames = useMemo(() => {
    const names = new Set(allLogs.map(l => l.userName))
    return ['全部', ...Array.from(names)]
  }, [allLogs])

  // 导出CSV
  const handleExportCSV = useCallback(() => {
    setIsExporting(true)
    setTimeout(() => {
      const headers = ['日志ID', '时间', '用户', '用户ID', '操作类型', '模块', '目标ID', '目标描述', 'IP地址', '设备', '来源', '耗时(秒)']
      const rows = filteredLogs.map(log => [
        log.id,
        formatDateTime(log.timestamp),
        log.userName,
        log.userId,
        log.action,
        log.module,
        log.targetId,
        log.targetDesc,
        log.ipAddress,
        log.device,
        log.source,
        log.duration || 0,
      ])
      const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `操作日志_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
      setIsExporting(false)
    }, 1500)
  }, [filteredLogs])

  // HIPAA导出CSV
  const handleHipaaExportCSV = useCallback(() => {
    setIsExporting(true)
    setTimeout(() => {
      const headers = ['日志ID', '时间', '用户', '科室', '操作类型', '患者ID', '报告ID', 'IP地址', '操作详情', '合规状态', '告警信息']
      const rows = hipaaFilteredLogs.map(log => [
        log.id,
        formatDateTime(log.timestamp),
        log.userName,
        log.department || '-',
        log.action,
        log.patientId || '-',
        log.reportId || log.targetId,
        log.ipAddress,
        log.targetDesc,
        log.complianceLevel === 'critical' ? '违规' : log.complianceLevel === 'warning' ? '警告' : '合规',
        log.complianceAlerts?.map(a => a.message).join('; ') || '-',
      ])
      const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `HIPAA审计日志_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
      setIsExporting(false)
    }, 1500)
  }, [hipaaFilteredLogs])

  // HIPAA导出PDF (模拟)
  const handleHipaaExportPDF = useCallback(() => {
    setIsExporting(true)
    setTimeout(() => {
      alert('PDF导出功能已触发（模拟）- 实际环境需要集成PDF库如jspdf')
      setIsExporting(false)
    }, 1000)
  }, [])

  // 生成合规报告 (模拟)
  const handleGenerateReport = useCallback(() => {
    setIsExporting(true)
    setTimeout(() => {
      alert('合规报告生成已触发（模拟）- 实际环境需要集成报表生成功能')
      setIsExporting(false)
    }, 1500)
  }, [])

  // 快捷时间筛选处理
  const handleQuickTimeFilter = useCallback((value: QuickTimeValue) => {
    setQuickTimeFilter(value)
    const now = new Date('2026-05-01T18:00:00')
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10)
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)

    if (value === 'today') {
      setDateFrom(todayStart)
      setDateTo('')
    } else if (value === 'week') {
      setDateFrom(weekStart)
      setDateTo('')
    } else if (value === 'month') {
      setDateFrom(monthStart)
      setDateTo('')
    } else {
      setDateFrom('')
      setDateTo('')
    }
    setCurrentPage(1)
  }, [])

  // 筛选器样式
  const filterBtnStyle = (active: boolean) => ({
    padding: '5px 12px', borderRadius: 6, border: `1px solid ${active ? ACCENT : '#e2e8f0'}`,
    background: active ? `${ACCENT}15` : WHITE, color: active ? ACCENT : GRAY,
    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
  })

  const inputStyle = {
    padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: WHITE, color: PRIMARY, fontSize: 12, outline: 'none' as const, width: '100%' as const,
  }

  const selectStyle = {
    padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: WHITE, color: PRIMARY, fontSize: 12, cursor: 'pointer' as const, outline: 'none' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      {/* 顶部导航 */}
      <div style={{
        background: WHITE, borderBottom: '1px solid #e2e8f0', padding: '14px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <History size={24} color={PRIMARY} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: PRIMARY }}>操作痕迹日志</div>
            <div style={{ fontSize: 11, color: GRAY }}>Operation Logs - 共 {filteredLogs.length} 条记录</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            style={{
              padding: '6px 14px', borderRadius: 6, border: `1px solid ${isExporting ? '#cbd5e1' : SUCCESS}`,
              background: isExporting ? '#f1f5f9' : `${SUCCESS}10`, color: isExporting ? '#94a3b8' : SUCCESS,
              fontSize: 12, fontWeight: 600, cursor: isExporting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            {isExporting ? '导出中...' : '导出CSV'}
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            style={{
              ...filterBtnStyle(showStats),
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <BarChart3 size={14} />
            {showStats ? '隐藏' : '显示'}统计
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              ...filterBtnStyle(viewMode === 'table'),
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <List size={14} />
            列表视图
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            style={{
              ...filterBtnStyle(viewMode === 'timeline'),
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Clock size={14} />
            时间线视图
          </button>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* 今日趋势卡片 */}
        {showStats && (
          <div style={{ marginBottom: 16 }}>
            <TodayTrendCard {...todayTrendData} />
          </div>
        )}

        {/* 快捷时间筛选 + Tab切换 */}
        <div style={{
          background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0',
          marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            {/* 快捷时间筛选 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: GRAY, marginRight: 4 }}>快捷筛选:</span>
              {QUICK_TIME_FILTERS.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => handleQuickTimeFilter(filter.value as QuickTimeValue)}
                  style={{
                    padding: '4px 10px', borderRadius: 6,
                    border: `1px solid ${quickTimeFilter === filter.value ? ACCENT : '#e2e8f0'}`,
                    background: quickTimeFilter === filter.value ? `${ACCENT}15` : WHITE,
                    color: quickTimeFilter === filter.value ? ACCENT : GRAY,
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Tab切换 */}
            {showStats && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setViewTab('logs')}
                  style={{
                    padding: '5px 12px', borderRadius: 6, border: 'none',
                    background: viewTab === 'logs' ? PRIMARY : 'transparent',
                    color: viewTab === 'logs' ? WHITE : GRAY,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  日志统计
                </button>
                <button
                  onClick={() => setViewTab('duration')}
                  style={{
                    padding: '5px 12px', borderRadius: 6, border: 'none',
                    background: viewTab === 'duration' ? PRIMARY : 'transparent',
                    color: viewTab === 'duration' ? WHITE : GRAY,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  耗时分析
                </button>
                <button
                  onClick={() => setViewTab('heatmap')}
                  style={{
                    padding: '5px 12px', borderRadius: 6, border: 'none',
                    background: viewTab === 'heatmap' ? PRIMARY : 'transparent',
                    color: viewTab === 'heatmap' ? WHITE : GRAY,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  热力图
                </button>
                <button
                  onClick={() => setViewTab('hipaa')}
                  style={{
                    padding: '5px 12px', borderRadius: 6, border: 'none',
                    background: viewTab === 'hipaa' ? PRIMARY : 'transparent',
                    color: viewTab === 'hipaa' ? WHITE : GRAY,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Shield size={14} />
                  HIPAA安全审计
                </button>
              </div>
            )}
          </div>

          {/* 搜索框 */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{
              flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', background: '#fafbfc',
            }}>
              <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <input
                value={searchText}
                onChange={e => { setSearchText(e.target.value); handleFilterChange() }}
                placeholder="搜索用户 / 目标 / 日志ID..."
                style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%', background: 'transparent' }}
              />
              {searchText && (
                <button onClick={() => setSearchText('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <X size={14} color={GRAY} />
                </button>
              )}
            </div>
          </div>

          {/* 筛选器 */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* 操作类型 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>操作类型:</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {ACTION_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => { setActionFilter(type); handleFilterChange() }}
                    style={filterBtnStyle(actionFilter === type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 来源 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>来源:</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {LOG_SOURCES.map(source => (
                  <button
                    key={source}
                    onClick={() => { setSourceFilter(source); handleFilterChange() }}
                    style={filterBtnStyle(sourceFilter === source)}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>

            {/* 模块 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>模块:</span>
              <select
                value={moduleFilter}
                onChange={e => { setModuleFilter(e.target.value); handleFilterChange() }}
                style={selectStyle}
              >
                {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* 用户 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>用户:</span>
              <select
                value={userFilter}
                onChange={e => { setUserFilter(e.target.value); handleFilterChange() }}
                style={selectStyle}
              >
                {allUserNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>

            {/* 日期范围 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>日期:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setQuickTimeFilter(''); handleFilterChange() }}
                style={inputStyle}
              />
              <span style={{ color: GRAY }}>-</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); handleFilterChange() }}
                style={inputStyle}
              />
            </div>

            {/* 重置 */}
            <button
              onClick={() => {
                setSearchText('')
                setActionFilter('全部')
                setModuleFilter('全部')
                setUserFilter('全部')
                setSourceFilter('全部')
                setDateFrom('')
                setDateTo('')
                setQuickTimeFilter('')
                setCurrentPage(1)
              }}
              style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                background: WHITE, color: GRAY, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <RefreshCw size={12} />
              重置筛选
            </button>
          </div>
        </div>

        {/* 统计图表 */}
        {showStats && (
          <div style={{ marginBottom: 16 }}>
            {viewTab === 'logs' && <StatisticsCharts logs={filteredLogs} />}
            {viewTab === 'duration' && <DurationAnalysisView logs={filteredLogs} />}
            {viewTab === 'heatmap' && (
              <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={16} />
                  用户活跃时段热力图
                </div>
                <UserActivityHeatmap logs={filteredLogs} />
              </div>
            )}
            {viewTab === 'hipaa' && (
              <>
                {/* HIPAA统计卡片 */}
                <HipaaStatsCards stats={hipaaStats} />
                
                {/* HIPAA合规告警统计 */}
                <HipaaAlertSummary logs={allLogs} />
                
                {/* HIPAA日志导出面板 */}
                <HipaaExportPanel
                  hipaaLogs={hipaaFilteredLogs}
                  onExportCSV={handleHipaaExportCSV}
                  onExportPDF={handleHipaaExportPDF}
                  onGenerateReport={handleGenerateReport}
                  dateFrom={hipaaDateFrom}
                  setDateFrom={setHipaaDateFrom}
                  dateTo={hipaaDateTo}
                  setDateTo={setHipaaDateTo}
                  actionFilter={hipaaActionFilter}
                  setActionFilter={setHipaaActionFilter}
                  userFilter={hipaaUserFilter}
                  setUserFilter={setHipaaUserFilter}
                  allUserNames={allUserNames}
                />
                
                {/* HIPAA日志表格 */}
                <HipaaLogTable logs={hipaaPaginatedLogs} onViewDetail={setSelectedLog} />
                
                {/* 分页 */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', background: WHITE, borderTop: '1px solid #e2e8f0',
                  marginTop: -1,
                }}>
                  <div style={{ fontSize: 12, color: GRAY }}>
                    显示 {((hipaaCurrentPage - 1) * hipaaPageSize) + 1} - {Math.min(hipaaCurrentPage * hipaaPageSize, hipaaFilteredLogs.length)} 条，共 {hipaaFilteredLogs.length} 条
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: GRAY }}>每页</span>
                      <select
                        value={hipaaPageSize}
                        onChange={e => { setHipaaPageSize(Number(e.target.value)); setHipaaCurrentPage(1) }}
                        style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 12 }}
                      >
                        {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span style={{ fontSize: 12, color: GRAY }}>条</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => setHipaaCurrentPage(p => Math.max(1, p - 1))}
                        disabled={hipaaCurrentPage === 1}
                        style={{
                          padding: '4px 10px', borderRadius: 4, border: '1px solid #e2e8f0',
                          background: WHITE, color: hipaaCurrentPage === 1 ? '#cbd5e1' : PRIMARY,
                          fontSize: 12, cursor: hipaaCurrentPage === 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setHipaaCurrentPage(p => Math.min(hipaaTotalPages, p + 1))}
                        disabled={hipaaCurrentPage === hipaaTotalPages}
                        style={{
                          padding: '4px 10px', borderRadius: 4, border: '1px solid #e2e8f0',
                          background: WHITE, color: hipaaCurrentPage === hipaaTotalPages ? '#cbd5e1' : PRIMARY,
                          fontSize: 12, cursor: hipaaCurrentPage === hipaaTotalPages ? 'not-allowed' : 'pointer',
                        }}
                      >
                        下一页
                      </button>
                    </div>
                    <span style={{ fontSize: 12, color: GRAY }}>
                      第 {hipaaCurrentPage} / {hipaaTotalPages} 页
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 日志列表/时间线 */}
        {viewTab !== 'hipaa' && (
          <div style={{
            background: WHITE, borderRadius: 10, border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            {viewMode === 'table' ? (
              <>
                {/* 表格头部 */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '160px 80px 90px 90px 100px 1fr 90px 100px',
                  padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                  fontSize: 12, fontWeight: 600, color: GRAY,
                }}>
                  <div>时间</div>
                  <div>用户</div>
                  <div>操作类型</div>
                  <div>模块</div>
                  <div>来源</div>
                  <div>操作详情</div>
                  <div>IP地址</div>
                  <div style={{ textAlign: 'center' }}>操作</div>
                </div>

                {/* 表格内容 */}
                {paginatedLogs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      display: 'grid', gridTemplateColumns: '160px 80px 90px 90px 100px 1fr 90px 100px',
                      padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
                      fontSize: 12, alignItems: 'center',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ color: PRIMARY, fontWeight: 500 }}>
                      <div>{formatDate(log.timestamp)}</div>
                      <div style={{ color: GRAY, fontSize: 11 }}>{formatTime(log.timestamp)}</div>
                    </div>
                    <div style={{ color: PRIMARY }}>{log.userName}</div>
                    <div>
                      <span style={{
                        background: `${ACTION_COLORS[log.action] || ACCENT}20`,
                        color: ACTION_COLORS[log.action] || ACCENT,
                        padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                      }}>
                        {ACTION_ICONS[log.action]}
                        {log.action}
                      </span>
                    </div>
                    <div style={{ color: GRAY, fontSize: 11 }}>{log.module}</div>
                    <div>
                      <span style={{
                        background: `${SOURCE_COLORS[log.source] || GRAY}15`,
                        color: SOURCE_COLORS[log.source] || GRAY,
                        padding: '2px 6px', borderRadius: 4, fontSize: 10,
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                      }}>
                        {SOURCE_ICONS[log.source]}
                        {log.source}
                      </span>
                    </div>
                    <div style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.targetDesc}>
                      {log.targetDesc}
                    </div>
                    <div style={{ color: GRAY }}>{log.ipAddress}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        style={{
                          padding: '4px 8px', borderRadius: 4, border: '1px solid #e2e8f0',
                          background: WHITE, color: ACCENT, fontSize: 11, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <Eye size={12} />
                        详情
                      </button>
                    </div>
                  </div>
                ))}

                {/* 分页 */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', borderTop: '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: 12, color: GRAY }}>
                    显示 {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredLogs.length)} 条，共 {filteredLogs.length} 条
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: GRAY }}>每页</span>
                      <select
                        value={pageSize}
                        onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                        style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 12 }}
                      >
                        {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span style={{ fontSize: 12, color: GRAY }}>条</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: '4px 10px', borderRadius: 4, border: '1px solid #e2e8f0',
                          background: WHITE, color: currentPage === 1 ? '#cbd5e1' : PRIMARY,
                          fontSize: 12, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '4px 10px', borderRadius: 4, border: '1px solid #e2e8f0',
                          background: WHITE, color: currentPage === totalPages ? '#cbd5e1' : PRIMARY,
                          fontSize: 12, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        }}
                      >
                        下一页
                      </button>
                    </div>
                    <span style={{ fontSize: 12, color: GRAY }}>
                      第 {currentPage} / {totalPages} 页
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* 时间线视图 */
              <div style={{ padding: 20 }}>
                <TimelineView logs={paginatedLogs} onViewDetail={setSelectedLog} />
                
                {/* 分页 */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderTop: '1px solid #e2e8f0', marginTop: 16,
                }}>
                  <div style={{ fontSize: 12, color: GRAY }}>
                    显示 {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredLogs.length)} 条，共 {filteredLogs.length} 条
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '4px 10px', borderRadius: 4, border: '1px solid #e2e8f0',
                        background: WHITE, color: currentPage === 1 ? '#cbd5e1' : PRIMARY,
                        fontSize: 12, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '4px 10px', borderRadius: 4, border: '1px solid #e2e8f0',
                        background: WHITE, color: currentPage === totalPages ? '#cbd5e1' : PRIMARY,
                        fontSize: 12, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      }}
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 日志详情弹窗 */}
      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  )
}
