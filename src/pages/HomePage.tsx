// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 首页 v1.0.0
// 放射科信息管理系统 - 上海市第一人民医院
// ============================================================
import { useState } from 'react'
import {
  Activity, FileText, ShieldCheck, AlertTriangle,
  TrendingUp, Users, Clock, CheckCircle, BarChart3,
  Scan, Radio, Monitor, Bell, Plus, CalendarClock,
  ShieldAlert, AlertCircle, TestTube, Printer, ListChecks,
  ChevronRight, Wifi, Heart, Cpu, BellRing,
  LayoutDashboard, Stethoscope, ImageIcon, Settings,
  Calendar, DollarSign, PieChart as PieChartIcon,
  TrendingDown, Thermometer, Zap, RefreshCw,
  ArrowUpRight, ArrowDownRight, UserCheck, ClipboardList,
  Image, BookOpen, Database, Eye, Timer,
  CheckSquare, XCircle, Clock3, ActivitySquare
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import {
  initialStatisticsData,
  initialRadiologyExams,
  initialModalityDevices,
  initialCriticalValues,
  initialDoctorSchedules,
  initialUsers
} from '../data/initialData'

// ============================================================
// 样式常量
// ============================================================
const COLORS = {
  primary: '#1e3a5f',
  primaryLight: '#2d4a6f',
  primaryDark: '#152a45',
  white: '#ffffff',
  background: '#f1f5f9',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  success: '#059669',
  successBg: '#ecfdf5',
  warning: '#d97706',
  warningBg: '#fffbeb',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  info: '#2563eb',
  infoBg: '#eff6ff',
  purple: '#7c3aed',
  purpleBg: '#f5f3ff',
}

const MODALITY_COLORS: Record<string, string> = {
  CT: '#3b82f6',
  MR: '#8b5cf6',
  DR: '#22c55e',
  DSA: '#f59e0b',
  '乳腺钼靶': '#ec4899',
  '胃肠造影': '#14b8a6',
  PET: '#f97316'
}

// 通用卡片样式
const cardStyle: React.CSSProperties = {
  background: COLORS.white,
  borderRadius: 12,
  padding: 20,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  border: `1px solid ${COLORS.border}`,
}

// 卡片标题头样式
const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: `1px solid ${COLORS.border}`,
}

// 卡片标题样式
const cardTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: COLORS.primary,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

// 徽章样式
const badgeStyle: React.CSSProperties = {
  padding: '2px 10px',
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}

// 悬浮效果辅助函数
const getHoverStyle = (): React.CSSProperties => ({
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  transform: 'translateY(-3px)',
})

const getDefaultStyle = (): React.CSSProperties => ({
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  transform: 'translateY(0)',
})

// ============================================================
// 类型定义
// ============================================================
interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color: string
  bg: string
  trend?: number
}

interface QuickActionProps {
  icon: React.ReactNode
  label: string
  color: string
  bg: string
  badge?: string
  badgeColor?: string
  onClick?: () => void
}

// ============================================================
// 子组件：统计卡片
// ============================================================
const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, color, bg, trend }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        ...cardStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        ...(hovered ? getHoverStyle() : getDefaultStyle()),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4, fontWeight: 500 }}>
          {label}
        </div>
        <div style={{
          fontSize: 30,
          fontWeight: 800,
          color: COLORS.primary,
          lineHeight: 1.2,
          letterSpacing: '-0.5px',
        }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>
            {sub}
          </div>
        )}
        {trend !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            marginTop: 4,
            fontSize: 11,
            fontWeight: 600,
            color: trend >= 0 ? COLORS.success : COLORS.danger,
          }}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  )
}

// ============================================================
// 子组件：快捷入口按钮
// ============================================================
const QuickActionButton: React.FC<QuickActionProps> = ({
  icon, label, color, bg, badge, badgeColor
}) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 12,
        padding: '16px 12px',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        border: `1px solid ${hovered ? color : COLORS.border}`,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {badge && (
        <div style={{
          position: 'absolute',
          top: 6,
          right: 6,
          background: badgeColor || COLORS.danger,
          color: COLORS.white,
          borderRadius: 8,
          padding: '1px 5px',
          fontSize: 9,
          fontWeight: 700,
        }}>
          {badge}
        </div>
      )}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        transition: 'all 0.25s ease',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
      }}>
        {icon}
      </div>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: 1.3,
      }}>
        {label}
      </span>
    </div>
  )
}

// ============================================================
// 子组件：设备状态指示灯
// ============================================================
const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case '使用中':
        return { color: '#3b82f6', bg: '#dbeafe', label: '使用中' }
      case '空闲':
        return { color: '#22c55e', bg: '#dcfce7', label: '空闲' }
      case '维护中':
      case '维修中':
        return { color: '#f59e0b', bg: '#fef3c7', label: '维护中' }
      case '故障':
        return { color: '#ef4444', bg: '#fee2e2', label: '故障' }
      default:
        return { color: '#94a3b8', bg: '#f1f5f9', label: '未知' }
    }
  }

  const config = getStatusConfig()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: config.color,
        boxShadow: `0 0 6px ${config.color}80`,
        animation: status === '使用中' ? 'pulse 2s infinite' : undefined,
      }} />
      <span style={{
        ...badgeStyle,
        background: config.bg,
        color: config.color,
      }}>
        {config.label}
      </span>
    </div>
  )
}

// ============================================================
// 子组件：优先级标签
// ============================================================
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const getConfig = () => {
    switch (priority) {
      case '危重':
      case '紧急':
        return { color: COLORS.danger, bg: COLORS.dangerBg }
      case '急迫':
        return { color: COLORS.warning, bg: COLORS.warningBg }
      default:
        return { color: COLORS.textMuted, bg: COLORS.background }
    }
  }

  const config = getConfig()

  return (
    <span style={{
      ...badgeStyle,
      background: config.bg,
      color: config.color,
      fontWeight: 700,
    }}>
      {priority}
    </span>
  )
}

// ============================================================
// 主组件
// ============================================================
export default function HomePage() {
  // 数据初始化
  const [user] = useState(initialUsers[0])
  const stats = initialStatisticsData
  const exams = initialRadiologyExams
  const devices = initialModalityDevices
  const criticalValues = initialCriticalValues
  const schedules = initialDoctorSchedules

  // 计算统计数据
  const pendingExams = exams.filter(e =>
    ['已登记', '待检查', '检查中'].includes(e.status)
  ).sort((a, b) => {
    const priorityOrder = { '危重': 0, '紧急': 1, '急迫': 2, '普通': 3 }
    return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
  })

  const todayReports = exams.filter(e =>
    ['待报告', '已报告', '已完成'].includes(e.status)
  )

  const criticalPending = criticalValues.filter(c =>
    c.status !== '已处理' && c.status !== '已通知'
  )

  const criticalNotified = criticalValues.filter(c =>
    c.status === '已通知' || (c.status !== '已处理' && c.status !== '已接收')
  )

  // 设备状态统计
  const deviceInUse = devices.filter(d => d.status === '使用中').length
  const deviceIdle = devices.filter(d => d.status === '空闲').length
  const deviceMaintenance = devices.filter(d =>
    ['维护中', '维修中', '故障'].includes(d.status)
  ).length

  // 图表数据
  const hourlyData = [
    { hour: '08:00', today: 12, yesterday: 10 },
    { hour: '09:00', today: 28, yesterday: 25 },
    { hour: '10:00', today: 45, yesterday: 42 },
    { hour: '11:00', today: 52, yesterday: 48 },
    { hour: '12:00', today: 38, yesterday: 35 },
    { hour: '13:00', today: 42, yesterday: 40 },
    { hour: '14:00', today: 58, yesterday: 55 },
    { hour: '15:00', today: 65, yesterday: 60 },
    { hour: '16:00', today: 48, yesterday: 45 },
    { hour: '17:00', today: 35, yesterday: 32 },
  ]

  const weeklyBarData = [
    { day: '周一', CT: 98, MR: 45, DR: 85, DSA: 8, 乳腺: 5 },
    { day: '周二', CT: 105, MR: 52, DR: 90, DSA: 10, 乳腺: 6 },
    { day: '周三', CT: 112, MR: 48, DR: 78, DSA: 12, 乳腺: 8 },
    { day: '周四', CT: 95, MR: 55, DR: 82, DSA: 9, 乳腺: 5 },
    { day: '周五', CT: 108, MR: 50, DR: 88, DSA: 11, 乳腺: 7 },
    { day: '周六', CT: 60, MR: 25, DR: 40, DSA: 3, 乳腺: 3 },
    { day: '周日', CT: 30, MR: 10, DR: 20, DSA: 1, 乳腺: 1 },
  ]

  const modalityDistData = [
    { name: 'CT', value: stats.byModality['CT'], color: MODALITY_COLORS['CT'] },
    { name: 'MR', value: stats.byModality['MR'], color: MODALITY_COLORS['MR'] },
    { name: 'DR', value: stats.byModality['DR'], color: MODALITY_COLORS['DR'] },
    { name: 'DSA', value: stats.byModality['DSA'], color: MODALITY_COLORS['DSA'] },
    { name: '乳腺', value: stats.byModality['乳腺钼靶'], color: MODALITY_COLORS['乳腺钼靶'] },
  ]

  const qualityData = [
    { name: '优秀', value: 85, color: '#22c55e' },
    { name: '良好', value: 12, color: '#3b82f6' },
    { name: '合格', value: 3, color: '#f59e0b' },
  ]

  const revenueData = [
    { period: '今日', value: 285000, target: 300000 },
    { period: '本周', value: 1680000, target: 1800000 },
    { period: '本月', value: 8960000, target: 9500000 },
  ]

  const revenueTrendData = [
    { day: '周一', revenue: 125000, exams: 142 },
    { day: '周二', revenue: 138000, exams: 155 },
    { day: '周三', revenue: 142000, exams: 160 },
    { day: '周四', revenue: 128000, exams: 145 },
    { day: '周五', revenue: 145000, exams: 165 },
    { day: '周六', revenue: 82000, exams: 90 },
    { day: '周日', revenue: 45000, exams: 52 },
  ]

  // 今日日期格式化
  const today = new Date()
  const dateString = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  // 当前时间
  const currentTime = today.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // ============================================================
  // 区块1：顶部问候区
  // ============================================================
  const renderGreetingSection = () => (
    <div style={{
      ...cardStyle,
      marginBottom: 24,
      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
      border: 'none',
      padding: 0,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -30,
        right: 100,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
      }} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 28,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* 左侧：logo和标题 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* 放射科Logo */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.2)',
          }}>
            <Radio size={32} color="#ffffff" />
          </div>

          <div>
            <div style={{
              fontSize: 24,
              fontWeight: 800,
              color: COLORS.white,
              marginBottom: 4,
              letterSpacing: '0.5px',
            }}>
              放射科信息管理系统
            </div>
            <div style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>上海市第一人民医院</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
              <span> radiological department </span>
            </div>
          </div>
        </div>

        {/* 中间：用户信息 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 32,
            fontWeight: 800,
            color: COLORS.white,
            marginBottom: 4,
          }}>
            您好，张建华主任
          </div>
          <div style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <Calendar size={14} />
              {dateString}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <Clock size={14} />
              {currentTime}
            </span>
          </div>
        </div>

        {/* 右侧：快捷统计 */}
        <div style={{
          display: 'flex',
          gap: 16,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '12px 20px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: COLORS.white,
            }}>
              {criticalPending.length}
            </div>
            <div style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 2,
            }}>
              危急值待处理
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '12px 20px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: COLORS.white,
            }}>
              {pendingExams.length}
            </div>
            <div style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 2,
            }}>
              待处理检查
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '12px 20px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: COLORS.white,
            }}>
              {deviceInUse}/{devices.length}
            </div>
            <div style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 2,
            }}>
              设备使用中
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ============================================================
  // 区块2：快捷入口
  // ============================================================
  const renderQuickActions = () => (
    <div style={{
      ...cardStyle,
      marginBottom: 24,
      padding: 20,
    }}>
      <div style={headerStyle}>
        <span style={cardTitleStyle}>
          <LayoutDashboard size={18} color={COLORS.primary} />
          快捷入口
        </span>
        <span style={{
          fontSize: 12,
          color: COLORS.textMuted,
        }}>
          常用功能一触即达
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: 12,
      }}>
        <QuickActionButton
          icon={<ListChecks size={24} />}
          label="检查工作列表"
          color={MODALITY_COLORS['CT']}
          bg="#eff6ff"
          badge="12"
          badgeColor={COLORS.info}
        />
        <QuickActionButton
          icon={<FileText size={24} />}
          label="书写报告"
          color={MODALITY_COLORS['MR']}
          bg="#f5f3ff"
          badge="8"
          badgeColor={COLORS.purple}
        />
        <QuickActionButton
          icon={<ShieldAlert size={24} />}
          label="危急值管理"
          color={COLORS.danger}
          bg={COLORS.dangerBg}
          badge={String(criticalPending.length)}
          badgeColor={COLORS.danger}
        />
        <QuickActionButton
          icon={<BarChart3 size={24} />}
          label="统计分析"
          color={COLORS.success}
          bg={COLORS.successBg}
        />
        <QuickActionButton
          icon={<Monitor size={24} />}
          label="设备状态"
          color={MODALITY_COLORS['DR']}
          bg={COLORS.warningBg}
        />
        <QuickActionButton
          icon={<CalendarClock size={24} />}
          label="预约管理"
          color={MODALITY_COLORS['DSA']}
          bg="#fff7ed"
        />
        <QuickActionButton
          icon={<BookOpen size={24} />}
          label="报告管理"
          color={MODALITY_COLORS['乳腺钼靶']}
          bg="#fdf2f8"
        />
        <QuickActionButton
          icon={<Image size={24} />}
          label="影像查看"
          color={COLORS.info}
          bg={COLORS.infoBg}
        />
      </div>
    </div>
  )

  // ============================================================
  // 区块3：今日概况统计卡片
  // ============================================================
  const renderTodayStats = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: 16,
      marginBottom: 24,
    }}>
      <StatCard
        label="今晨检查"
        value={stats.today.exams}
        sub={`较昨日 +${Math.round(stats.today.exams * 0.08)}`}
        icon={<Scan size={24} />}
        color={MODALITY_COLORS['CT']}
        bg="#eff6ff"
        trend={8}
      />
      <StatCard
        label="待报告"
        value={stats.today.pending}
        sub={`占今日 ${Math.round(stats.today.pending / stats.today.exams * 100)}%`}
        icon={<Clock3 size={24} />}
        color={MODALITY_COLORS['MR']}
        bg="#f5f3ff"
        trend={-3}
      />
      <StatCard
        label="已报告"
        value={stats.today.reports}
        sub={`完成率 ${Math.round(stats.today.reports / stats.today.exams * 100)}%`}
        icon={<CheckCircle size={24} />}
        color={COLORS.success}
        bg={COLORS.successBg}
        trend={12}
      />
      <StatCard
        label="危急值"
        value={stats.today.critical}
        sub={`待处理 ${criticalPending.length} 例`}
        icon={<AlertTriangle size={24} />}
        color={COLORS.danger}
        bg={COLORS.dangerBg}
      />
      <StatCard
        label="设备使用率"
        value={`${Math.round(deviceInUse / devices.length * 100)}%`}
        sub={`使用中 ${deviceInUse} 台 / 共 ${devices.length} 台`}
        icon={<Activity size={24} />}
        color={MODALITY_COLORS['DR']}
        bg={COLORS.warningBg}
        trend={5}
      />
      <StatCard
        label="今日收入"
        value={`¥${(285000 / 10000).toFixed(1)}万`}
        sub={`目标 ¥30万`}
        icon={<TrendingUp size={24} />}
        color={COLORS.success}
        bg={COLORS.successBg}
        trend={-5}
      />
    </div>
  )

  // ============================================================
  // 区块4：检查量趋势图
  // ============================================================
  const renderExamTrendCharts = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20,
      marginBottom: 24,
    }}>
      {/* 4a: 今日每小时趋势双折线图 */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={cardTitleStyle}>
            <TrendingUp size={16} color={COLORS.primary} />
            今日检查量实时趋势
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: COLORS.textMuted,
            }}>
              <div style={{
                width: 10,
                height: 3,
                borderRadius: 2,
                background: COLORS.info,
              }} />
              今日
            </span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: COLORS.textMuted,
            }}>
              <div style={{
                width: 10,
                height: 3,
                borderRadius: 2,
                background: COLORS.textLight,
              }} />
              昨日
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: COLORS.textMuted }}
              axisLine={{ stroke: COLORS.border }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: COLORS.textMuted }}
              axisLine={{ stroke: COLORS.border }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value} 例`, '']}
            />
            <Line
              type="monotone"
              dataKey="today"
              stroke={COLORS.info}
              strokeWidth={2.5}
              dot={{ fill: COLORS.info, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: COLORS.info }}
              name="今日"
            />
            <Line
              type="monotone"
              dataKey="yesterday"
              stroke={COLORS.textLight}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="昨日"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 4b: 7天柱状图（按设备类型） */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={cardTitleStyle}>
            <BarChart3 size={16} color={COLORS.primary} />
            本周检查量统计（按设备类型）
          </span>
          <span style={{
            ...badgeStyle,
            background: COLORS.infoBg,
            color: COLORS.info,
          }}>
            本周 {stats.week.exams} 例
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: COLORS.textMuted }}
              axisLine={{ stroke: COLORS.border }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: COLORS.textMuted }}
              axisLine={{ stroke: COLORS.border }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                fontSize: 12,
              }}
            />
            <Legend
              iconSize={10}
              iconType="circle"
              wrapperStyle={{ fontSize: 11 }}
            />
            <Bar dataKey="CT" name="CT" fill={MODALITY_COLORS['CT']} radius={[4, 4, 0, 0]} />
            <Bar dataKey="MR" name="MR" fill={MODALITY_COLORS['MR']} radius={[4, 4, 0, 0]} />
            <Bar dataKey="DR" name="DR" fill={MODALITY_COLORS['DR']} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // ============================================================
  // 区块5：设备状态监控
  // ============================================================
  const renderDeviceStatus = () => (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span style={cardTitleStyle}>
          <Monitor size={16} color={COLORS.primary} />
          设备状态监控
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{
            ...badgeStyle,
            background: '#dbeafe',
            color: '#2563eb',
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#3b82f6',
            }} />
            使用中 {deviceInUse}
          </span>
          <span style={{
            ...badgeStyle,
            background: '#dcfce7',
            color: '#16a34a',
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#22c55e',
            }} />
            空闲 {deviceIdle}
          </span>
          <span style={{
            ...badgeStyle,
            background: '#fef3c7',
            color: '#d97706',
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#f59e0b',
            }} />
            维护 {deviceMaintenance}
          </span>
        </div>
      </div>

      {/* 设备状态总览 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 16,
      }}>
        <div style={{
          background: '#f8fafc',
          borderRadius: 10,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Activity size={22} color="#3b82f6" />
          </div>
          <div>
            <div style={{
              fontSize: 24,
              fontWeight: 800,
              color: COLORS.primary,
            }}>
              {deviceInUse}
            </div>
            <div style={{
              fontSize: 11,
              color: COLORS.textMuted,
            }}>
              使用中
            </div>
          </div>
        </div>

        <div style={{
          background: '#f8fafc',
          borderRadius: 10,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircle size={22} color="#22c55e" />
          </div>
          <div>
            <div style={{
              fontSize: 24,
              fontWeight: 800,
              color: COLORS.primary,
            }}>
              {deviceIdle}
            </div>
            <div style={{
              fontSize: 11,
              color: COLORS.textMuted,
            }}>
              空闲
            </div>
          </div>
        </div>

        <div style={{
          background: '#f8fafc',
          borderRadius: 10,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Settings size={22} color="#d97706" />
          </div>
          <div>
            <div style={{
              fontSize: 24,
              fontWeight: 800,
              color: COLORS.primary,
            }}>
              {deviceMaintenance}
            </div>
            <div style={{
              fontSize: 11,
              color: COLORS.textMuted,
            }}>
              维护中
            </div>
          </div>
        </div>
      </div>

      {/* 设备列表（可滚动） */}
      <div style={{
        maxHeight: 280,
        overflowY: 'auto',
      }}>
        {devices.map((device) => (
          <div
            key={device.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.text,
                }}>
                  {device.name.split('（')[0]}
                </span>
                <span style={{
                  ...badgeStyle,
                  background: `${MODALITY_COLORS[device.modality] || '#94a3b8'}15`,
                  color: MODALITY_COLORS[device.modality] || COLORS.textMuted,
                  fontWeight: 600,
                }}>
                  {device.modality}
                </span>
              </div>
              <div style={{
                fontSize: 11,
                color: COLORS.textMuted,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span>{device.manufacturer}</span>
                <span>|</span>
                <span>{device.location}</span>
                {device.status === '使用中' && (
                  <>
                    <span>|</span>
                    <span style={{ color: COLORS.info }}>
                      当前: {initialExamRooms.find(r => r.deviceId === device.id)?.currentPatient || '-'}
                    </span>
                  </>
                )}
              </div>
            </div>
            <StatusIndicator status={device.status} />
          </div>
        ))}
      </div>
    </div>
  )

  // ============================================================
  // 区块6：今日待处理检查列表
  // ============================================================
  const renderPendingExams = () => (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span style={cardTitleStyle}>
          <ClipboardList size={16} color={COLORS.primary} />
          今日待处理检查
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{
            ...badgeStyle,
            background: COLORS.dangerBg,
            color: COLORS.danger,
          }}>
            紧急 {pendingExams.filter(e => e.priority === '紧急' || e.priority === '危重').length}
          </span>
          <span style={{
            ...badgeStyle,
            background: COLORS.infoBg,
            color: COLORS.info,
          }}>
            共 {pendingExams.length} 项
          </span>
        </div>
      </div>

      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {pendingExams.map((exam, index) => (
          <div
            key={exam.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: index < pendingExams.length - 1 ? `1px solid ${COLORS.border}` : 'none',
              background: exam.priority === '危重' || exam.priority === '紧急'
                ? `${COLORS.dangerBg}50`
                : 'transparent',
              margin: exam.priority === '危重' || exam.priority === '紧急'
                ? '0 -8px'
                : '0',
              paddingLeft: exam.priority === '危重' || exam.priority === '紧急' ? 8 : 0,
              paddingRight: exam.priority === '危重' || exam.priority === '紧急' ? 8 : 0,
              borderRadius: exam.priority === '危重' || exam.priority === '紧急' ? 6 : 0,
            }}
          >
            {/* 左侧：患者信息 */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 6,
              }}>
                {exam.priority === '危重' && (
                  <AlertCircle size={14} color={COLORS.danger} />
                )}
                {exam.priority === '紧急' && (
                  <AlertTriangle size={14} color="#f59e0b" />
                )}
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: COLORS.text,
                }}>
                  {exam.patientName}
                </span>
                <span style={{
                  ...badgeStyle,
                  background: `${MODALITY_COLORS[exam.modality] || '#94a3b8'}15`,
                  color: MODALITY_COLORS[exam.modality] || COLORS.textMuted,
                  fontWeight: 600,
                  fontSize: 10,
                }}>
                  {exam.modality}
                </span>
                <PriorityBadge priority={exam.priority} />
              </div>
              <div style={{
                fontSize: 12,
                color: COLORS.textMuted,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span>{exam.examItemName}</span>
                <span>|</span>
                <span>{exam.patientType}</span>
                <span>|</span>
                <span style={{ color: exam.priority === '危重' || exam.priority === '紧急'
                  ? COLORS.danger
                  : COLORS.textMuted
                }}>
                  {exam.clinicalDiagnosis || '待定'}
                </span>
              </div>
            </div>

            {/* 中间：设备信息 */}
            <div style={{
              textAlign: 'center',
              padding: '0 20px',
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.text,
                marginBottom: 2,
              }}>
                {exam.roomName}
              </div>
              <div style={{
                fontSize: 11,
                color: COLORS.textMuted,
              }}>
                {exam.deviceName?.split('（')[0]}
              </div>
            </div>

            {/* 右侧：时间和状态 */}
            <div style={{
              textAlign: 'right',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.primary,
                }}>
                  {exam.examTime}
                </div>
                <div style={{
                  fontSize: 11,
                  color: COLORS.textMuted,
                }}>
                  {exam.examDate}
                </div>
              </div>
              <span style={{
                ...badgeStyle,
                background: exam.status === '检查中'
                  ? COLORS.infoBg
                  : exam.status === '待检查'
                  ? COLORS.warningBg
                  : COLORS.background,
                color: exam.status === '检查中'
                  ? COLORS.info
                  : exam.status === '待检查'
                  ? COLORS.warning
                  : COLORS.textMuted,
                fontWeight: 600,
                minWidth: 60,
                justifyContent: 'center',
              }}>
                {exam.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // ============================================================
  // 区块7：危急值预警面板
  // ============================================================
  const renderCriticalValuePanel = () => (
    <div style={{
      ...cardStyle,
      border: `2px solid ${COLORS.danger}`,
      background: COLORS.white,
    }}>
      <div style={{
        ...headerStyle,
        borderBottom: `2px solid ${COLORS.danger}20`,
        marginBottom: 16,
        paddingBottom: 12,
      }}>
        <span style={{
          ...cardTitleStyle,
          color: COLORS.danger,
        }}>
          <ShieldAlert size={18} color={COLORS.danger} />
          危急值预警
          <span style={{
            ...badgeStyle,
            background: COLORS.danger,
            color: COLORS.white,
            marginLeft: 4,
            fontSize: 12,
            padding: '2px 8px',
          }}>
            {criticalPending.length} 待处理
          </span>
        </span>
        <span style={{
          fontSize: 11,
          color: COLORS.textMuted,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <Timer size={12} />
          请及时处理
        </span>
      </div>

      {criticalPending.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 0',
          color: COLORS.success,
        }}>
          <CheckCircle size={48} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>暂无待处理危急值</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
            所有危急值已处理完毕
          </div>
        </div>
      ) : (
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {criticalPending.map((cv, index) => (
            <div
              key={cv.id}
              style={{
                padding: '16px',
                marginBottom: index < criticalPending.length - 1 ? 12 : 0,
                background: `${COLORS.danger}05`,
                borderRadius: 10,
                border: `1px solid ${COLORS.danger}15`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 左侧紧急色条 */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                background: cv.severity === '危急' ? COLORS.danger : COLORS.warning,
              }} />

              {/* 头部：患者信息和危急级别 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 10,
                paddingLeft: 8,
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}>
                    <span style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: COLORS.text,
                    }}>
                      {cv.patientName}
                    </span>
                    <span style={{
                      ...badgeStyle,
                      background: `${MODALITY_COLORS[cv.modality] || '#94a3b8'}15`,
                      color: MODALITY_COLORS[cv.modality] || COLORS.textMuted,
                    }}>
                      {cv.modality}
                    </span>
                    <span style={{
                      ...badgeStyle,
                      background: cv.severity === '危急' ? COLORS.dangerBg : COLORS.warningBg,
                      color: cv.severity === '危急' ? COLORS.danger : COLORS.warning,
                      fontWeight: 700,
                    }}>
                      {cv.severity}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: COLORS.textMuted,
                  }}>
                    {cv.examItemName}
                  </div>
                </div>
                <span style={{
                  ...badgeStyle,
                  background: cv.status === '已接收' ? COLORS.successBg : COLORS.warningBg,
                  color: cv.status === '已接收' ? COLORS.success : COLORS.warning,
                  fontWeight: 600,
                }}>
                  {cv.status}
                </span>
              </div>

              {/* 危急描述 */}
              <div style={{
                fontSize: 12,
                color: COLORS.text,
                lineHeight: 1.6,
                padding: '10px 12px',
                background: COLORS.white,
                borderRadius: 6,
                marginBottom: 10,
                border: `1px solid ${COLORS.border}`,
                paddingLeft: 8,
              }}>
                {cv.findingDetails}
              </div>

              {/* 底部：报告医生和时间 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 11,
                color: COLORS.textMuted,
                paddingLeft: 8,
              }}>
                <span>
                  报告医生: {cv.reportedByName} · {cv.reportedTime}
                </span>
                <span style={{ color: COLORS.danger }}>
                  接收: {cv.receivingDoctorName} · {cv.receivingTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 底部操作按钮 */}
      <div style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: `1px solid ${COLORS.border}`,
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
      }}>
        <button
          style={{
            padding: '8px 24px',
            borderRadius: 8,
            border: `1px solid ${COLORS.danger}`,
            background: COLORS.white,
            color: COLORS.danger,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Eye size={14} />
          查看全部危急值
        </button>
        <button
          style={{
            padding: '8px 24px',
            borderRadius: 8,
            border: 'none',
            background: COLORS.danger,
            color: COLORS.white,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CheckSquare size={14} />
          处理危急值
        </button>
      </div>
    </div>
  )

  // ============================================================
  // 区块8：医生排班表
  // ============================================================
  const renderDoctorSchedule = () => {
    // 筛选今日排班
    const todaySchedule = initialDoctorSchedules.filter(
      s => s.date === '2026-05-01'
    )

    // 医生映射
    const doctorMap: Record<string, typeof initialUsers[0]> = {}
    initialUsers.forEach(u => { doctorMap[u.id] = u })

    // 上午班
    const morningShift = todaySchedule.filter(s =>
      s.timeSlot === '上午' || s.timeSlot === '全天'
    )
    // 下午班
    const afternoonShift = todaySchedule.filter(s =>
      s.timeSlot === '下午' || s.timeSlot === '全天'
    )

    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={cardTitleStyle}>
            <UserCheck size={16} color={COLORS.primary} />
            今日医生排班
          </span>
          <span style={{
            fontSize: 12,
            color: COLORS.textMuted,
          }}>
            2026年5月1日
          </span>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {/* 上午班 */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 12,
              padding: '8px 12px',
              background: '#fef3c7',
              borderRadius: 8,
            }}>
              <Clock size={14} color="#d97706" />
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#92400e',
              }}>
                上午班 (08:00-12:00)
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {morningShift.map((schedule) => (
                <div
                  key={schedule.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: COLORS.background,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: COLORS.text,
                      marginBottom: 2,
                    }}>
                      {schedule.doctorName}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: COLORS.textMuted,
                    }}>
                      {doctorMap[schedule.doctorId]?.title || '医生'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 11,
                      color: COLORS.text,
                      fontWeight: 600,
                    }}>
                      {schedule.modality}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: COLORS.textMuted,
                    }}>
                      {schedule.room}
                    </div>
                  </div>
                  <span style={{
                    ...badgeStyle,
                    background: COLORS.successBg,
                    color: COLORS.success,
                  }}>
                    上班
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 下午班 */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 12,
              padding: '8px 12px',
              background: '#dbeafe',
              borderRadius: 8,
            }}>
              <Clock size={14} color="#2563eb" />
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#1e40af',
              }}>
                下午班 (14:00-18:00)
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {afternoonShift.map((schedule) => (
                <div
                  key={schedule.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: COLORS.background,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: COLORS.text,
                      marginBottom: 2,
                    }}>
                      {schedule.doctorName}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: COLORS.textMuted,
                    }}>
                      {doctorMap[schedule.doctorId]?.title || '医生'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 11,
                      color: COLORS.text,
                      fontWeight: 600,
                    }}>
                      {schedule.modality}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: COLORS.textMuted,
                    }}>
                      {schedule.room}
                    </div>
                  </div>
                  <span style={{
                    ...badgeStyle,
                    background: COLORS.successBg,
                    color: COLORS.success,
                  }}>
                    上班
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // 区块9：影像质量统计
  // ============================================================
  const renderImageQuality = () => {
    const totalQuality = qualityData.reduce((sum, item) => sum + item.value, 0)

    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={cardTitleStyle}>
            <ImageIcon size={16} color={COLORS.primary} />
            影像质量统计
          </span>
          <span style={{
            ...badgeStyle,
            background: COLORS.successBg,
            color: COLORS.success,
          }}>
            优良率 {((qualityData[0].value + qualityData[1].value) / totalQuality * 100).toFixed(1)}%
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}>
          {/* 饼图 */}
          <div style={{ position: 'relative' }}>
            <PieChart width={160} height={160}>
              <Pie
                data={qualityData}
                cx={75}
                cy={75}
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {qualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, '']}
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${COLORS.border}`,
                  fontSize: 12,
                }}
              />
            </PieChart>
            {/* 中心文字 */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 20,
                fontWeight: 800,
                color: COLORS.primary,
              }}>
                {totalQuality}%
              </div>
              <div style={{
                fontSize: 10,
                color: COLORS.textMuted,
              }}>
                优良率
              </div>
            </div>
          </div>

          {/* 图例和数据 */}
          <div style={{ flex: 1 }}>
            {qualityData.map((item, index) => (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: index < qualityData.length - 1
                    ? `1px solid ${COLORS.border}`
                    : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: item.color,
                  }} />
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.text,
                  }}>
                    {item.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 100,
                    height: 6,
                    background: COLORS.background,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${item.value}%`,
                      height: '100%',
                      background: item.color,
                      borderRadius: 3,
                    }} />
                  </div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.primary,
                    minWidth: 36,
                    textAlign: 'right',
                  }}>
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // 区块10：收入统计
  // ============================================================
  const renderRevenueStats = () => (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span style={cardTitleStyle}>
          <DollarSign size={16} color={COLORS.primary} />
          收入统计
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {revenueData.map((item) => (
            <span
              key={item.period}
              style={{
                ...badgeStyle,
                background: item.value >= item.target
                  ? COLORS.successBg
                  : COLORS.warningBg,
                color: item.value >= item.target
                  ? COLORS.success
                  : COLORS.warning,
              }}
            >
              {item.period}
              {item.value >= item.target ? ' ✓' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* 收入概览卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 20,
      }}>
        {revenueData.map((item, index) => (
          <div
            key={item.period}
            style={{
              padding: '16px',
              background: COLORS.background,
              borderRadius: 10,
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: 11,
              color: COLORS.textMuted,
              marginBottom: 6,
            }}>
              {item.period}
            </div>
            <div style={{
              fontSize: 22,
              fontWeight: 800,
              color: COLORS.primary,
              marginBottom: 4,
            }}>
              ¥{(item.value / 10000).toFixed(1)}万
            </div>
            <div style={{
              fontSize: 10,
              color: COLORS.textLight,
            }}>
              目标 ¥{(item.target / 10000).toFixed(0)}万
            </div>
            <div style={{
              marginTop: 8,
              height: 4,
              background: COLORS.border,
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min(100, (item.value / item.target) * 100)}%`,
                height: '100%',
                background: item.value >= item.target
                  ? COLORS.success
                  : COLORS.warning,
                borderRadius: 2,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* 收入趋势图 */}
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: COLORS.textMuted,
        marginBottom: 12,
      }}>
        本周收入趋势
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={revenueTrendData}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2} />
              <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: COLORS.textMuted }}
            axisLine={{ stroke: COLORS.border }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: COLORS.textMuted }}
            axisLine={{ stroke: COLORS.border }}
            tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number) => [`¥${value.toLocaleString()}`, '收入']}
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.success}
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            name="收入"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )

  // ============================================================
  // 渲染主页面
  // ============================================================
  return (
    <div style={{
      padding: 24,
      maxWidth: 1400,
      margin: '0 auto',
      background: COLORS.background,
      minHeight: '100vh',
    }}>
      {/* CSS动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* 区块1：顶部问候区 */}
      {renderGreetingSection()}

      {/* 区块2：快捷入口 */}
      {renderQuickActions()}

      {/* 区块3：今日概况 */}
      {renderTodayStats()}

      {/* 区块4：检查量趋势图 */}
      {renderExamTrendCharts()}

      {/* 区块5：设备状态监控 & 区块6：待处理检查 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
        marginBottom: 24,
      }}>
        {renderDeviceStatus()}
        {renderPendingExams()}
      </div>

      {/* 区块7：危急值预警面板 */}
      {renderCriticalValuePanel()}

      {/* 区块8：医生排班表 & 区块9：影像质量统计 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
        marginBottom: 24,
      }}>
        {renderDoctorSchedule()}
        {renderImageQuality()}
      </div>

      {/* 区块10：收入统计 */}
      {renderRevenueStats()}

      {/* 页脚 */}
      <div style={{
        textAlign: 'center',
        padding: '24px 0 8px',
        fontSize: 11,
        color: COLORS.textLight,
      }}>
        上海市第一人民医院 · 放射科信息管理系统 v1.0.0 ·技术支持：信息中心
      </div>
    </div>
  )
}
