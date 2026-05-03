// @ts-nocheck
// G005 放射科RIS系统 - 影像科室管理页面 v2.0.0
// 功能：人员角色权限管理、绩效统计、考勤管理、科室配置
import { useState } from 'react'
import {
  Users, Shield, BarChart3, Calendar, Settings, Crown, UserCog,
  Stethoscope, Activity, Clock, CheckCircle, AlertTriangle, X,
  Plus, Search, Filter, ChevronRight, ChevronDown, Download,
  PieChart, TrendingUp, Award, Target, AlertCircle, Bell,
  Edit3, Save, XCircle, Check, Printer, FileText, Monitor,
  Timer, CalendarCheck, CalendarX, Briefcase, UserPlus, RefreshCw,
  DollarSign, Percent, Star, Medal, Zap, TrendingDown, Eye
} from 'lucide-react'
import {
  BarChart as DeptBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend,
  AreaChart, Area, DonutChart
} from 'recharts'

// ============================================================
// 样式常量（WIN10风格）
// ============================================================
const C = {
  primary: '#1e40af',       // 深蓝主色
  primaryLight: '#3b82f6',   // 浅蓝
  primaryLighter: '#dbeafe', // 最浅蓝
  accent: '#0891b2',         // 青色辅色
  accentLight: '#06b6d4',    // 浅青
  white: '#ffffff',          // 白色卡片
  bg: '#e8e8e8',             // 浅灰背景
  border: '#d1d5db',         // 边框灰
  borderLight: '#e5e7eb',    // 浅边框
  textDark: '#1f2937',       // 深色文字
  textMid: '#4b5563',        // 中色文字
  textLight: '#9ca3af',      // 浅色文字
  success: '#059669',        // 成功绿
  successBg: '#d1fae5',      // 成功背景
  warning: '#d97706',        // 警告橙
  warningBg: '#fef3c7',      // 警告背景
  danger: '#dc2626',         // 危险红
  dangerBg: '#fee2e2',        // 危险背景
  info: '#2563eb',           // 信息蓝
  infoBg: '#dbeafe',         // 信息背景
  purple: '#7c3aed',         // 紫色
  purpleBg: '#ede9fe',       // 紫色背景
}

// 角色配置
const ROLES = {
  director: { label: '主任', color: '#dc2626', icon: Crown, permission: ['report_write', 'report_review', 'report_print', 'device_operate', 'data_export', 'system_config', 'user_manage'] },
  vice_director: { label: '副主任', color: '#d97706', icon: Shield, permission: ['report_write', 'report_review', 'report_print', 'device_operate', 'data_export', 'system_config'] },
  physician: { label: '医师', color: '#059669', icon: Stethoscope, permission: ['report_write', 'report_review', 'report_print'] },
  technician: { label: '技师', color: '#3b82f6', icon: Monitor, permission: ['device_operate', 'report_print'] },
  nurse: { label: '护士', color: '#7c3aed', icon: Activity, permission: ['report_print'] },
  intern: { label: '实习生', color: '#6b7280', icon: UserPlus, permission: [] },
}

// 权限列表
const PERMISSIONS = [
  { key: 'report_write', label: '报告书写', icon: FileText },
  { key: 'report_review', label: '报告审核', icon: CheckCircle },
  { key: 'report_print', label: '报告打印', icon: Printer },
  { key: 'device_operate', label: '设备操作', icon: Monitor },
  { key: 'data_export', label: '数据导出', icon: Download },
  { key: 'system_config', label: '系统配置', icon: Settings },
  { key: 'user_manage', label: '用户管理', icon: UserCog },
]

// 班次配置
const SHIFTS = [
  { id: 'morning', name: '早班', time: '08:00-12:00', color: '#3b82f6' },
  { id: 'afternoon', name: '午班', time: '12:00-18:00', color: '#f59e0b' },
  { id: 'night', name: '夜班', time: '18:00-08:00', color: '#7c3aed' },
  { id: 'day', name: '常日班', time: '08:00-18:00', color: '#059669' },
]

// ============================================================
// 模拟数据 - 科室人员（约15名）
// ============================================================
const DEPT_STAFF = [
  { id: 'S001', name: '张伟明', role: 'director', title: '主任医师', dept: '放射科', phone: '138****1001', email: 'zhangwm@hospital.com', status: 'online', joinDate: '2015-08-01' },
  { id: 'S002', name: '李秀英', role: 'vice_director', title: '副主任医师', dept: '放射科', phone: '138****1002', email: 'lixy@hospital.com', status: 'online', joinDate: '2016-03-15' },
  { id: 'S003', name: '王建国', role: 'physician', title: '主治医师', dept: 'CT组', phone: '138****1003', email: 'wangjg@hospital.com', status: 'online', joinDate: '2018-07-01' },
  { id: 'S004', name: '刘芳', role: 'physician', title: '副主任医师', dept: 'MR组', phone: '138****1004', email: 'liuf@hospital.com', status: 'busy', joinDate: '2017-05-20' },
  { id: 'S005', name: '陈海涛', role: 'physician', title: '主治医师', dept: 'DR组', phone: '138****1005', email: 'chenht@hospital.com', status: 'online', joinDate: '2019-09-01' },
  { id: 'S006', name: '赵志刚', role: 'technician', title: '主管技师', dept: 'CT组', phone: '138****1006', email: 'zhaozg@hospital.com', status: 'online', joinDate: '2016-11-01' },
  { id: 'S007', name: '孙伟', role: 'technician', title: '技师', dept: 'MR组', phone: '138****1007', email: 'sunw@hospital.com', status: 'offline', joinDate: '2020-01-15' },
  { id: 'S008', name: '周婷', role: 'technician', title: '技师', dept: 'DR组', phone: '138****1008', email: 'zhout@hospital.com', status: 'online', joinDate: '2021-03-01' },
  { id: 'S009', name: '吴敏', role: 'nurse', title: '主管护师', dept: '放射科', phone: '138****1009', email: 'wumin@hospital.com', status: 'online', joinDate: '2017-08-01' },
  { id: 'S010', name: '郑晓丽', role: 'nurse', title: '护师', dept: '放射科', phone: '138****1010', email: 'zhengxl@hospital.com', status: 'busy', joinDate: '2019-06-01' },
  { id: 'S011', name: '黄志强', role: 'physician', title: '住院医师', dept: 'DSA组', phone: '138****1011', email: 'huangzq@hospital.com', status: 'online', joinDate: '2022-07-01' },
  { id: 'S012', name: '林建军', role: 'technician', title: '技师', dept: 'DSA组', phone: '138****1012', email: 'linjj@hospital.com', status: 'online', joinDate: '2020-09-01' },
  { id: 'S013', name: '马云飞', role: 'intern', title: '实习医生', dept: 'CT组', phone: '138****1013', email: 'mayf@hospital.com', status: 'online', joinDate: '2024-06-01' },
  { id: 'S014', name: '李雪', role: 'intern', title: '实习技师', dept: 'MR组', phone: '138****1014', email: 'lixue@hospital.com', status: 'offline', joinDate: '2024-06-01' },
  { id: 'S015', name: '高峰', role: 'physician', title: '主治医师', dept: '放射科', phone: '138****1015', email: 'gaof@hospital.com', status: 'online', joinDate: '2018-02-01' },
]

// 绩效数据
const PERFORMANCE_DATA = [
  { staffId: 'S003', name: '王建国', written: 145, reviewed: 98, positive: 42, quality: 96.5, overtime: 3 },
  { staffId: 'S004', name: '刘芳', written: 132, reviewed: 85, positive: 38, quality: 97.2, overtime: 5 },
  { staffId: 'S005', name: '陈海涛', written: 128, reviewed: 76, positive: 35, quality: 95.8, overtime: 2 },
  { staffId: 'S011', name: '黄志强', written: 115, reviewed: 92, positive: 30, quality: 94.5, overtime: 4 },
  { staffId: 'S015', name: '高峰', written: 108, reviewed: 68, positive: 28, quality: 96.1, overtime: 1 },
]

// 考勤数据
const ATTENDANCE_DATA = [
  { staffId: 'S001', name: '张伟明', date: '2026-04-28', shift: 'day', checkIn: '07:55', checkOut: '18:02', status: 'normal', late: 0, early: 0 },
  { staffId: 'S002', name: '李秀英', date: '2026-04-28', shift: 'day', checkIn: '08:01', checkOut: '18:05', status: 'normal', late: 1, early: 0 },
  { staffId: 'S003', name: '王建国', date: '2026-04-28', shift: 'day', checkIn: '07:58', checkOut: '19:30', status: 'normal', late: 0, early: 0 },
  { staffId: 'S004', name: '刘芳', date: '2026-04-28', shift: 'morning', checkIn: '07:52', checkOut: '12:15', status: 'normal', late: 0, early: 1 },
  { staffId: 'S006', name: '赵志刚', date: '2026-04-28', shift: 'morning', checkIn: '08:00', checkOut: '12:00', status: 'normal', late: 0, early: 0 },
  { staffId: 'S007', name: '孙伟', date: '2026-04-28', shift: 'afternoon', checkIn: '12:05', checkOut: '18:30', status: 'late', late: 1, early: 0 },
  { staffId: 'S009', name: '吴敏', date: '2026-04-28', shift: 'day', checkIn: '07:56', checkOut: '18:00', status: 'normal', late: 0, early: 0 },
  { staffId: 'S013', name: '马云飞', date: '2026-04-28', shift: 'day', checkIn: '08:10', checkOut: '17:45', status: 'late', late: 1, early: 1 },
]

// 请假申请
const LEAVE_REQUESTS = [
  { id: 'L001', staffId: 'S004', name: '刘芳', type: '年假', startDate: '2026-05-06', endDate: '2026-05-08', days: 3, reason: '家庭旅行', status: 'pending', applyDate: '2026-04-25' },
  { id: 'L002', staffId: 'S007', name: '孙伟', type: '病假', startDate: '2026-04-29', endDate: '2026-04-29', days: 1, reason: '感冒发热', status: 'pending', applyDate: '2026-04-28' },
  { id: 'L003', staffId: 'S010', name: '郑晓丽', type: '事假', startDate: '2026-05-10', endDate: '2026-05-12', days: 3, reason: '处理私事', status: 'approved', applyDate: '2026-04-20' },
  { id: 'L004', staffId: 'S014', name: '李雪', type: '病假', startDate: '2026-04-30', endDate: '2026-04-30', days: 1, reason: '身体不适', status: 'rejected', applyDate: '2026-04-27' },
]

// 考勤月统计
const ATTENDANCE_MONTHLY = [
  { month: '2026-01', present: 98.5, late: 1.2, absent: 0.3, leave: 2.5 },
  { month: '2026-02', present: 97.8, late: 1.5, absent: 0.5, leave: 3.2 },
  { month: '2026-03', present: 98.2, late: 1.0, absent: 0.2, leave: 2.8 },
  { month: '2026-04', present: 98.6, late: 0.8, absent: 0.1, leave: 2.2 },
]

// 工作量排名
const WORKLOAD_RANKING = [
  { rank: 1, name: '王建国', role: '医师', written: 145, reviewed: 98, score: 98.5 },
  { rank: 2, name: '刘芳', role: '医师', written: 132, reviewed: 85, score: 97.2 },
  { rank: 3, name: '陈海涛', role: '医师', written: 128, reviewed: 76, score: 96.8 },
  { rank: 4, name: '黄志强', role: '医师', written: 115, reviewed: 92, score: 95.5 },
  { rank: 5, name: '高峰', role: '医师', written: 108, reviewed: 68, score: 95.1 },
]

// 阳性率统计
const POSITIVE_RATE_DATA = [
  { name: '王建国', rate: 42, total: 145 },
  { name: '刘芳', rate: 38, total: 132 },
  { name: '陈海涛', rate: 35, total: 128 },
  { name: '黄志强', rate: 30, total: 115 },
  { name: '高峰', rate: 28, total: 108 },
]

// 质控评分
const QUALITY_SCORE_DATA = [
  { name: '王建国', score: 96.5 },
  { name: '刘芳', score: 97.2 },
  { name: '陈海涛', score: 95.8 },
  { name: '黄志强', score: 94.5 },
  { name: '高峰', score: 96.1 },
]

// 危急值阈值配置
const CRITICAL_VALUES = [
  { id: 'CV001', type: '气胸', modality: 'DR', threshold: '>20%', alertLevel: 'urgent', description: '气胸肺组织压缩超过20%' },
  { id: 'CV002', type: '脑出血', modality: 'CT', threshold: 'any', alertLevel: 'critical', description: '任何程度的脑出血' },
  { id: 'CV003', type: '主动脉夹层', modality: 'CT', threshold: 'any', alertLevel: 'critical', description: '主动脉CTA发现夹层' },
  { id: 'CV004', type: '肺栓塞', modality: 'CT', threshold: 'any', alertLevel: 'critical', description: 'CT肺动脉造影发现栓子' },
  { id: 'CV005', type: '骨折（开放性）', modality: 'DR', threshold: 'any', alertLevel: 'urgent', description: '开放性骨折' },
]

// 质控标准
const QC_STANDARDS = [
  { id: 'QC001', item: '报告书写完整率', target: '≥98%', current: '98.5%', status: 'pass' },
  { id: 'QC002', item: '报告及时率', target: '≥95%', current: '96.2%', status: 'pass' },
  { id: 'QC003', item: '危急值报告率', target: '100%', current: '100%', status: 'pass' },
  { id: 'QC004', item: '阳性率符合率', target: '≥85%', current: '88.3%', status: 'pass' },
  { id: 'QC005', item: '报告修改率', target: '≤5%', current: '3.2%', status: 'pass' },
  { id: 'QC006', item: '患者满意度', target: '≥90%', current: '92.5%', status: 'pass' },
]

// 考勤统计饼图
const ATTENDANCE_STATS = [
  { name: '正常出勤', value: 85, color: '#059669' },
  { name: '迟到', value: 8, color: '#d97706' },
  { name: '早退', value: 4, color: '#f59e0b' },
  { name: '请假', value: 3, color: '#3b82f6' },
]

// 角色分布饼图
const ROLE_DISTRIBUTION = [
  { name: '医师', value: 5, color: '#059669' },
  { name: '技师', value: 4, color: '#3b82f6' },
  { name: '护士', value: 2, color: '#7c3aed' },
  { name: '实习生', value: 2, color: '#6b7280' },
  { name: '主任/副主任', value: 2, color: '#dc2626' },
]

// 统计卡片数据
const STAT_CARDS = [
  { label: '科室总人数', value: '15', subLabel: '在线 12 人', icon: Users, color: '#1e40af', bg: '#dbeafe' },
  { label: '本月报告数', value: '4,286', subLabel: '较上月 +12.5%', icon: FileText, color: '#059669', bg: '#d1fae5' },
  { label: '平均阳性率', value: '32.5%', subLabel: '较上月 +2.1%', icon: AlertCircle, color: '#d97706', bg: '#fef3c7' },
  { label: '质控评分', value: '96.8', subLabel: '优秀', icon: Award, color: '#7c3aed', bg: '#ede9fe' },
]

// ============================================================
// 科室配置数据
// ============================================================
const DEPT_CONFIG = {
  name: '放射科',
  code: 'RAD',
  director: '张伟明',
  phone: '0571-8888****',
  location: '门诊楼2楼',
  established: '2015年',
  bedCount: 0,
  annualReports: 52000,
}

// ============================================================
// 组件：统计卡片
// ============================================================
const StatCard = ({ label, value, subLabel, icon: Icon, color, bg }: any) => {
  const cardStyle: React.CSSProperties = {
    background: C.white,
    borderRadius: 8,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: `1px solid ${C.borderLight}`,
    minWidth: 200,
  }
  const iconWrapStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: 8,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  const iconStyle = { width: 24, height: 24, color }
  const labelStyle = { fontSize: 13, color: C.textMid, marginBottom: 2 }
  const valueStyle = { fontSize: 24, fontWeight: 700, color: C.textDark }
  const subStyle = { fontSize: 12, color: C.textLight }

  return (
    <div style={cardStyle}>
      <div style={iconWrapStyle}>
        <Icon style={iconStyle} />
      </div>
      <div>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>{value}</div>
        <div style={subStyle}>{subLabel}</div>
      </div>
    </div>
  )
}

// ============================================================
// 组件：权限标签
// ============================================================
const PermissionTag = ({ permission }: { permission: string }) => {
  const p = PERMISSIONS.find(x => x.key === permission)
  if (!p) return null
  const tagStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    background: C.primaryLighter,
    color: C.primary,
    borderRadius: 4,
    fontSize: 12,
    margin: '2px',
  }
  return (
    <span style={tagStyle}>
      <p.icon style={{ width: 12, height: 12 }} />
      {p.label}
    </span>
  )
}

// ============================================================
// 组件：人员卡片
// ============================================================
const StaffCard = ({ staff, isSelected, onClick }: { staff: any; isSelected: boolean; onClick: () => void }) => {
  const role = ROLES[staff.role as keyof typeof ROLES]
  const statusColors: Record<string, string> = { online: C.success, busy: C.warning, offline: C.textLight }
  const cardStyle: React.CSSProperties = {
    background: isSelected ? C.primaryLighter : C.white,
    borderRadius: 8,
    padding: '12px 16px',
    cursor: 'pointer',
    border: `1px solid ${isSelected ? C.primary : C.borderLight}`,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }
  const avatarStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: role?.color || C.textLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: C.white,
    fontSize: 16,
    fontWeight: 600,
    position: 'relative',
  }
  const statusDotStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: statusColors[staff.status] || C.textLight,
    border: '2px solid white',
  }
  const nameStyle: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: C.textDark }
  const roleStyle: React.CSSProperties = { fontSize: 12, color: role?.color || C.textMid }

  return (
    <div style={cardStyle} onClick={onClick}>
      <div style={avatarStyle}>
        {staff.name.charAt(0)}
        <div style={statusDotStyle} />
      </div>
      <div>
        <div style={nameStyle}>{staff.name}</div>
        <div style={roleStyle}>{role?.label} · {staff.title}</div>
      </div>
    </div>
  )
}

// ============================================================
// 组件：请假申请行
// ============================================================
const LeaveRow = ({ leave, onApprove, onReject }: { leave: any; onApprove: () => void; onReject: () => void }) => {
  const statusStyles: Record<string, { bg: string; color: string }> = {
    pending: { bg: C.warningBg, color: C.warning },
    approved: { bg: C.successBg, color: C.success },
    rejected: { bg: C.dangerBg, color: C.danger },
  }
  const s = statusStyles[leave.status] || statusStyles.pending
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: `1px solid ${C.borderLight}`,
    gap: 16,
    fontSize: 13,
  }
  const cellStyle: React.CSSProperties = { flex: 1, color: C.textDark }
  const badgeStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: 4,
    background: s.bg,
    color: s.color,
    fontSize: 12,
  }

  return (
    <div style={rowStyle}>
      <div style={{ ...cellStyle, fontWeight: 500 }}>{leave.name}</div>
      <div style={{ ...cellStyle, color: C.primary }}>{leave.type}</div>
      <div style={{ ...cellStyle }}>{leave.startDate} ~ {leave.endDate}</div>
      <div style={{ ...cellStyle, color: C.textMid }}>{leave.days}天</div>
      <div style={{ ...cellStyle }}><span style={badgeStyle}>{leave.status === 'pending' ? '待审批' : leave.status === 'approved' ? '已批准' : '已驳回'}</span></div>
      {leave.status === 'pending' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onApprove} style={{ padding: '4px 12px', background: C.success, color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>批准</button>
          <button onClick={onReject} style={{ padding: '4px 12px', background: C.danger, color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>驳回</button>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 主组件
// ============================================================
export default function DepartmentPage() {
  // 状态
  const [activeTab, setActiveTab] = useState<'staff' | 'performance' | 'attendance' | 'config'>('staff')
  const [selectedStaff, setSelectedStaff] = useState(DEPT_STAFF[0])
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [leaveList, setLeaveList] = useState(LEAVE_REQUESTS)
  const [editingConfig, setEditingConfig] = useState(false)
  const [deptConfig, setDeptConfig] = useState(DEPT_CONFIG)
  const [shiftConfig, setShiftConfig] = useState(SHIFTS)
  const [criticalValues, setCriticalValues] = useState(CRITICAL_VALUES)
  const [qcStandards, setQcStandards] = useState(QC_STANDARDS)
  const [editingShift, setEditingShift] = useState<string | null>(null)
  const [editingCriticalValue, setEditingCriticalValue] = useState<string | null>(null)

  // 导出报表处理
  const handleExportReport = () => {
    alert('正在导出报表，请稍候...')
  }

  // 编辑人员处理
  const handleEditStaff = () => {
    alert(`正在编辑人员: ${selectedStaff?.name}`)
  }

  // 查询考勤处理
  const handleQueryAttendance = () => {
    alert('正在查询考勤记录...')
  }

  // 编辑班次处理
  const handleEditShift = (shiftId: string) => {
    setEditingShift(editingShift === shiftId ? null : shiftId)
  }

  // 添加危急值处理
  const handleAddCriticalValue = () => {
    alert('正在添加危急值配置...')
  }

  // 编辑危急值处理
  const handleEditCriticalValue = (cvId: string) => {
    setEditingCriticalValue(editingCriticalValue === cvId ? null : cvId)
  }

  // 筛选后的人员列表
  const filteredStaff = DEPT_STAFF.filter(s => {
    const matchRole = roleFilter === 'all' || s.role === roleFilter
    const matchSearch = !searchKeyword || s.name.includes(searchKeyword) || s.title.includes(searchKeyword)
    return matchRole && matchSearch
  })

  // 当前选中人的绩效
  const currentPerformance = PERFORMANCE_DATA.find(p => p.staffId === selectedStaff?.id) || PERFORMANCE_DATA[0]

  // 角色筛选按钮
  const roleFilters = [
    { key: 'all', label: '全部' },
    { key: 'director', label: '主任' },
    { key: 'vice_director', label: '副主任' },
    { key: 'physician', label: '医师' },
    { key: 'technician', label: '技师' },
    { key: 'nurse', label: '护士' },
    { key: 'intern', label: '实习生' },
  ]

  // 样式
  const pageStyle: React.CSSProperties = {
    background: C.bg,
    minHeight: '100vh',
    padding: 16,
  }
  const headerStyle: React.CSSProperties = {
    background: C.white,
    borderRadius: 8,
    padding: '16px 24px',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: `1px solid ${C.borderLight}`,
  }
  const titleStyle: React.CSSProperties = { fontSize: 20, fontWeight: 700, color: C.textDark, display: 'flex', alignItems: 'center', gap: 8 }
  const statsRowStyle: React.CSSProperties = { display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }

  // 主面板布局
  const mainPanelStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '280px 1fr 320px',
    gap: 16,
    marginBottom: 16,
  }
  const panelStyle: React.CSSProperties = {
    background: C.white,
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: `1px solid ${C.borderLight}`,
    overflow: 'hidden',
  }
  const panelHeaderStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: `1px solid ${C.borderLight}`,
    fontSize: 14,
    fontWeight: 600,
    color: C.textDark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#f9fafb',
  }
  const panelBodyStyle: React.CSSProperties = { padding: 16 }

  // 标签页样式
  const tabStyle: React.CSSProperties = {
    display: 'flex',
    gap: 4,
    padding: '0 16px',
    borderBottom: `1px solid ${C.borderLight}`,
    background: '#f9fafb',
  }
  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    color: active ? C.primary : C.textMid,
    borderBottom: active ? `2px solid ${C.primary}` : '2px solid transparent',
    marginBottom: -1,
  })

  // 底部请假列表
  const bottomPanelStyle: React.CSSProperties = {
    ...panelStyle,
    maxHeight: 300,
    overflow: 'auto',
  }

  // 处理请假审批
  const handleApprove = (id: string) => {
    setLeaveList(list => list.map(l => l.id === id ? { ...l, status: 'approved' } : l))
  }
  const handleReject = (id: string) => {
    setLeaveList(list => list.map(l => l.id === id ? { ...l, status: 'rejected' } : l))
  }

  return (
    <div style={pageStyle}>
      {/* 顶部标题栏 */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <Briefcase style={{ width: 24, height: 24, color: C.primary }} />
          影像科室管理
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleExportReport} style={{ padding: '8px 16px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download style={{ width: 14, height: 14 }} /> 导出报表
          </button>
          <button onClick={() => setShowAddModal(true)} style={{ padding: '8px 16px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus style={{ width: 14, height: 14 }} /> 添加人员
          </button>
        </div>
      </div>

      {/* 统计卡片行 */}
      <div style={statsRowStyle}>
        {STAT_CARDS.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* 标签页切换 */}
      <div style={tabStyle}>
        <button style={tabBtnStyle(activeTab === 'staff')} onClick={() => setActiveTab('staff')}>
          <Users style={{ width: 14, height: 14, marginRight: 4 }} />
          人员管理
        </button>
        <button style={tabBtnStyle(activeTab === 'performance')} onClick={() => setActiveTab('performance')}>
          <BarChart3 style={{ width: 14, height: 14, marginRight: 4 }} />
          绩效统计
        </button>
        <button style={tabBtnStyle(activeTab === 'attendance')} onClick={() => setActiveTab('attendance')}>
          <Calendar style={{ width: 14, height: 14, marginRight: 4 }} />
          考勤管理
        </button>
        <button style={tabBtnStyle(activeTab === 'config')} onClick={() => setActiveTab('config')}>
          <Settings style={{ width: 14, height: 14, marginRight: 4 }} />
          科室配置
        </button>
      </div>

      {/* 主内容区 */}
      {activeTab === 'staff' && (
        <div style={mainPanelStyle}>
          {/* 左侧：人员列表 */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <span>科室人员</span>
              <span style={{ fontSize: 12, color: C.textLight }}>{filteredStaff.length}人</span>
            </div>
            <div style={{ padding: 12 }}>
              {/* 搜索框 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="搜索姓名/职称..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}
                />
              </div>
              {/* 角色筛选 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                {roleFilters.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setRoleFilter(f.key)}
                    style={{
                      padding: '3px 10px',
                      border: `1px solid ${roleFilter === f.key ? C.primary : C.border}`,
                      background: roleFilter === f.key ? C.primaryLighter : C.white,
                      color: roleFilter === f.key ? C.primary : C.textMid,
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {/* 人员列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflow: 'auto' }}>
                {filteredStaff.map(staff => (
                  <StaffCard
                    key={staff.id}
                    staff={staff}
                    isSelected={selectedStaff?.id === staff.id}
                    onClick={() => setSelectedStaff(staff)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 中间：人员详情 */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <span>人员详情</span>
              <button onClick={handleEditStaff} style={{ padding: '4px 12px', background: C.primary, color: C.white, border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Edit3 style={{ width: 12, height: 12 }} /> 编辑
              </button>
            </div>
            <div style={panelBodyStyle}>
              {selectedStaff && (
                <div>
                  {/* 人员基本信息 */}
                  <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: ROLES[selectedStaff.role as keyof typeof ROLES]?.color || C.textLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 32, fontWeight: 600 }}>
                      {selectedStaff.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.textDark, marginBottom: 4 }}>{selectedStaff.name}</div>
                      <div style={{ fontSize: 14, color: ROLES[selectedStaff.role as keyof typeof ROLES]?.color, marginBottom: 8 }}>
                        {ROLES[selectedStaff.role as keyof typeof ROLES]?.label} · {selectedStaff.title}
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: C.textMid }}>
                        <span>工号：{selectedStaff.id}</span>
                        <span>科室：{selectedStaff.dept}</span>
                      </div>
                    </div>
                  </div>

                  {/* 联系信息 */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 12, borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 8 }}>联系信息</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ fontSize: 13 }}><span style={{ color: C.textMid }}>电话：</span>{selectedStaff.phone}</div>
                      <div style={{ fontSize: 13 }}><span style={{ color: C.textMid }}>邮箱：</span>{selectedStaff.email}</div>
                      <div style={{ fontSize: 13 }}><span style={{ color: C.textMid }}>入职日期：</span>{selectedStaff.joinDate}</div>
                      <div style={{ fontSize: 13 }}><span style={{ color: C.textMid }}>状态：</span>
                        <span style={{ color: selectedStaff.status === 'online' ? C.success : selectedStaff.status === 'busy' ? C.warning : C.textLight }}>
                          {selectedStaff.status === 'online' ? '在线' : selectedStaff.status === 'busy' ? '工作中' : '离线'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 权限列表 */}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 12, borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 8 }}>权限配置</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(ROLES[selectedStaff.role as keyof typeof ROLES]?.permission || []).map(p => (
                        <PermissionTag key={p} permission={p} />
                      ))}
                      {(!ROLES[selectedStaff.role as keyof typeof ROLES]?.permission || []).length === 0 && (
                        <span style={{ fontSize: 13, color: C.textLight, fontStyle: 'italic' }}>暂无权限</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：考勤概览 */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <span>今日考勤</span>
              <span style={{ fontSize: 12, color: C.textMid }}>2026-04-28</span>
            </div>
            <div style={panelBodyStyle}>
              {/* 考勤饼图 */}
              <div style={{ height: 160, marginBottom: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={ATTENDANCE_STATS} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                      {ATTENDANCE_STATS.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                {ATTENDANCE_STATS.map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                    <span style={{ color: C.textMid }}>{s.name}</span>
                    <span style={{ fontWeight: 600, color: C.textDark }}>{s.value}%</span>
                  </div>
                ))}
              </div>

              {/* 今日出勤记录 */}
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, marginBottom: 8 }}>今日出勤记录</div>
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                {ATTENDANCE_DATA.slice(0, 6).map(a => (
                  <div key={a.staffId} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.borderLight}`, gap: 8, fontSize: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: C.textDark }}>{a.name}</div>
                      <div style={{ color: C.textLight }}>{a.shift === 'morning' ? '早班' : a.shift === 'afternoon' ? '午班' : a.shift === 'night' ? '夜班' : '常日班'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: C.textMid }}>{a.checkIn} - {a.checkOut}</div>
                      <div style={{ color: a.late > 0 ? C.danger : a.early > 0 ? C.warning : C.success }}>
                        {a.late > 0 ? `迟到${a.late}次` : a.early > 0 ? `早退${a.early}次` : '正常'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 绩效统计标签页 */}
      {activeTab === 'performance' && (
        <div style={{ ...mainPanelStyle, gridTemplateColumns: '1fr 1fr' }}>
          {/* 左侧：绩效图表 */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <span>工作量统计</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <select style={{ padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12 }}>
                  <option>本周</option>
                  <option>本月</option>
                  <option>本季度</option>
                </select>
              </div>
            </div>
            <div style={panelBodyStyle}>
              {/* 报告数量柱状图 */}
              <div style={{ height: 200, marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, marginBottom: 12 }}>个人报告数量</div>
                <ResponsiveContainer width="100%" height="85%">
                  <DeptBarChart data={PERFORMANCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="written" name="书写" fill={C.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="reviewed" name="审核" fill={C.accent} radius={[4, 4, 0, 0]} />
                  </DeptBarChart>
                </ResponsiveContainer>
              </div>
              {/* 阳性率折线图 */}
              <div style={{ height: 180 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, marginBottom: 12 }}>阳性率趋势</div>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={POSITIVE_RATE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 60]} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Line type="monotone" dataKey="rate" stroke={C.warning} strokeWidth={2} dot={{ fill: C.warning, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 右侧：排名和质控 */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <span>工作量排名 & 质控</span>
            </div>
            <div style={panelBodyStyle}>
              {/* 工作量排名 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, marginBottom: 12 }}>工作量 TOP 5</div>
                {WORKLOAD_RANKING.map((r, i) => (
                  <div key={r.rank} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.borderLight}`, gap: 12 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c32' : C.borderLight,
                      color: i < 3 ? C.white : C.textMid, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600,
                    }}>
                      {r.rank}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.textDark }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: C.textLight }}>{r.role}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>{r.written + r.reviewed}份</div>
                      <div style={{ fontSize: 11, color: C.success }}>评分 {r.score}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 质控评分 */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, marginBottom: 12 }}>质控评分</div>
                <div style={{ height: 150 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <DeptBarChart data={QUALITY_SCORE_DATA} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                      <XAxis type="number" domain={[90, 100]} tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
                      <Tooltip formatter={(v: number) => `${v}分`} />
                      <Bar dataKey="score" fill={C.success} radius={[0, 4, 4, 0]} />
                    </DeptBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 考勤管理标签页 */}
      {activeTab === 'attendance' && (
        <div style={{ ...mainPanelStyle, gridTemplateColumns: '1fr 320px' }}>
          {/* 左侧：考勤记录 */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <span>考勤记录</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="date" defaultValue="2026-04-28" style={{ padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12 }} />
                <span style={{ fontSize: 12, color: C.textMid }}>至</span>
                <input type="date" defaultValue="2026-04-28" style={{ padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12 }} />
                <button onClick={handleQueryAttendance} style={{ padding: '4px 12px', background: C.primary, color: C.white, border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>查询</button>
              </div>
            </div>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: `1px solid ${C.border}`, color: C.textMid, fontWeight: 500 }}>姓名</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: `1px solid ${C.border}`, color: C.textMid, fontWeight: 500 }}>班次</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: `1px solid ${C.border}`, color: C.textMid, fontWeight: 500 }}>签到</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: `1px solid ${C.border}`, color: C.textMid, fontWeight: 500 }}>签退</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: `1px solid ${C.border}`, color: C.textMid, fontWeight: 500 }}>状态</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: `1px solid ${C.border}`, color: C.textMid, fontWeight: 500 }}>异常</th>
                  </tr>
                </thead>
                <tbody>
                  {ATTENDANCE_DATA.map(a => (
                    <tr key={a.staffId} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500, color: C.textDark }}>{a.name}</td>
                      <td style={{ padding: '10px 12px', color: C.textMid }}>
                        {a.shift === 'morning' ? '早班' : a.shift === 'afternoon' ? '午班' : a.shift === 'night' ? '夜班' : '常日班'}
                      </td>
                      <td style={{ padding: '10px 12px', color: C.textMid }}>{a.checkIn}</td>
                      <td style={{ padding: '10px 12px', color: C.textMid }}>{a.checkOut}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 12,
                          background: a.status === 'normal' ? C.successBg : C.warningBg,
                          color: a.status === 'normal' ? C.success : C.warning,
                        }}>
                          {a.status === 'normal' ? '正常' : '异常'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: a.late > 0 ? C.danger : a.early > 0 ? C.warning : C.success }}>
                        {a.late > 0 ? `迟到${a.late}次` : a.early > 0 ? `早退${a.early}次` : '无'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 月度考勤趋势 */}
            <div style={{ padding: 16, borderTop: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, marginBottom: 12 }}>月度考勤趋势</div>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ATTENDANCE_MONTHLY}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[90, 105]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="present" stackId="1" stroke={C.success} fill={C.successBg} name="出勤率%" />
                    <Area type="monotone" dataKey="late" stackId="2" stroke={C.warning} fill={C.warningBg} name="迟到%" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 右侧：请假申请 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <span>请假申请</span>
                <button onClick={() => setShowAddModal(true)} style={{ padding: '4px 10px', background: C.primary, color: C.white, border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Plus style={{ width: 12, height: 12 }} /> 新申请
                </button>
              </div>
              <div style={{ overflow: 'auto' }}>
                {leaveList.map(leave => (
                  <LeaveRow key={leave.id} leave={leave} onApprove={() => handleApprove(leave.id)} onReject={() => handleReject(leave.id)} />
                ))}
              </div>
            </div>

            {/* 迟到早退统计 */}
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <span>迟到/早退统计</span>
                <span style={{ fontSize: 12, color: C.textMid }}>本月</span>
              </div>
              <div style={panelBodyStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ textAlign: 'center', padding: 16, background: C.warningBg, borderRadius: 8 }}>
                    <AlertTriangle style={{ width: 24, height: 24, color: C.warning, margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 24, fontWeight: 700, color: C.warning }}>8</div>
                    <div style={{ fontSize: 12, color: C.textMid }}>迟到次数</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 16, background: C.infoBg, borderRadius: 8 }}>
                    <Clock style={{ width: 24, height: 24, color: C.info, margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 24, fontWeight: 700, color: C.info }}>4</div>
                    <div style={{ fontSize: 12, color: C.textMid }}>早退次数</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 科室配置标签页 */}
      {activeTab === 'config' && (
        <div style={{ ...mainPanelStyle, gridTemplateColumns: '1fr 1fr' }}>
          {/* 左侧：科室信息和班次 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 科室信息 */}
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <span>科室信息</span>
                <button
                  onClick={() => setEditingConfig(!editingConfig)}
                  style={{ padding: '4px 12px', background: editingConfig ? C.success : C.primary, color: C.white, border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  {editingConfig ? <><Save style={{ width: 12, height: 12 }} /> 保存</> : <><Edit3 style={{ width: 12, height: 12 }} /> 编辑</>}
                </button>
              </div>
              <div style={panelBodyStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>科室名称</div>
                    {editingConfig ? (
                      <input defaultValue={deptConfig.name} style={{ width: '100%', padding: '6px 10px', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 13 }} />
                    ) : (
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.textDark }}>{deptConfig.name}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>科室代码</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.textDark }}>{deptConfig.code}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>科室主任</div>
                    <div style={{ fontSize: 14, color: C.textDark }}>{deptConfig.director}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>联系电话</div>
                    <div style={{ fontSize: 14, color: C.textDark }}>{deptConfig.phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>位置</div>
                    <div style={{ fontSize: 14, color: C.textDark }}>{deptConfig.location}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>成立时间</div>
                    <div style={{ fontSize: 14, color: C.textDark }}>{deptConfig.established}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 班次配置 */}
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <span>班次时间配置</span>
              </div>
              <div style={panelBodyStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {shiftConfig.map(shift => (
                    <div key={shift.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f9fafb', borderRadius: 6 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: shift.color }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: C.textDark }}>{shift.name}</div>
                        <div style={{ fontSize: 12, color: C.textMid }}>{shift.time}</div>
                      </div>
                      <button onClick={() => handleEditShift(shift.id)} style={{ padding: '4px 8px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>编辑</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：质控标准和危急值 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 质控标准 */}
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <span>质控标准配置</span>
                <span style={{ fontSize: 12, color: C.success }}>全部达标</span>
              </div>
              <div style={panelBodyStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: `1px solid ${C.border}`, color: C.textMid, fontWeight: 500 }}>指标</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', borderBottom: `1px solid ${C.border}`, color: C.textMid, fontWeight: 500 }}>目标</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', borderBottom: `1px solid ${C.border}`, color: C.textMid, fontWeight: 500 }}>当前</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', borderBottom: `1px solid ${C.border}`, color: C.textMid, fontWeight: 500 }}>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qcStandards.map(qc => (
                      <tr key={qc.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                        <td style={{ padding: '8px 10px', color: C.textDark }}>{qc.item}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: C.textMid }}>{qc.target}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: C.textDark, fontWeight: 500 }}>{qc.current}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: qc.status === 'pass' ? C.successBg : C.dangerBg, color: qc.status === 'pass' ? C.success : C.danger }}>
                            {qc.status === 'pass' ? '达标' : '未达标'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 危急值阈值 */}
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <span>危急值阈值配置</span>
                <button onClick={handleAddCriticalValue} style={{ padding: '4px 10px', background: C.primary, color: C.white, border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Plus style={{ width: 12, height: 12 }} /> 添加
                </button>
              </div>
              <div style={panelBodyStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {criticalValues.map(cv => (
                    <div key={cv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f9fafb', borderRadius: 6, borderLeft: `3px solid ${cv.alertLevel === 'critical' ? C.danger : C.warning}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.textDark }}>{cv.type}</div>
                        <div style={{ fontSize: 11, color: C.textMid }}>{cv.modality} · 阈值: {cv.threshold} · {cv.description}</div>
                      </div>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: cv.alertLevel === 'critical' ? C.dangerBg : C.warningBg, color: cv.alertLevel === 'critical' ? C.danger : C.warning }}>
                        {cv.alertLevel === 'critical' ? '危' : '急'}
                      </span>
                      <button onClick={() => handleEditCriticalValue(cv.id)} style={{ padding: '4px 8px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>编辑</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部请假申请列表（所有标签页可见） */}
      {activeTab !== 'attendance' && (
        <div style={bottomPanelStyle}>
          <div style={panelHeaderStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarCheck style={{ width: 14, height: 14 }} /> 请假申请列表
            </span>
            <span style={{ fontSize: 12, color: C.textMid }}>
              待审批：{leaveList.filter(l => l.status === 'pending').length} | 已批准：{leaveList.filter(l => l.status === 'approved').length} | 已驳回：{leaveList.filter(l => l.status === 'rejected').length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {leaveList.map(leave => (
              <LeaveRow key={leave.id} leave={leave} onApprove={() => handleApprove(leave.id)} onReject={() => handleReject(leave.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
