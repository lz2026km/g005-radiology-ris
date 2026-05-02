// @ts-nocheck
// G005 放射科RIS系统 - 科室排班管理页面 v1.0.0
// 功能：技师/医师班次管理、节假日配置、代班换班、排班统计
import { useState, useMemo } from 'react'
import {
  Calendar, Clock, Users, Monitor, Settings, ChevronLeft, ChevronRight,
  Plus, X, Check, Search, Filter, RefreshCw, AlertCircle, CheckCircle,
  XCircle, Edit2, Trash2, ArrowRightLeft, BarChart3, PieChart as PieChartIcon,
  CalendarDays, CalendarClock, Sun, Moon, Sunset, Coffee, Home,
  TrendingUp, UserPlus, Shield, Download
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import { initialUsers, initialModalityDevices } from '../data/initialData'

// ============================================================
// 样式常量 (WIN10风格)
// ============================================================
const C = {
  primary: '#1e40af',       // 深蓝主色
  primaryLight: '#3b82f6',  // 浅蓝
  primaryLighter: '#dbeafe', // 更浅蓝
  accent: '#0891b2',        // 青色辅色
  accentLight: '#06b6d4',
  white: '#ffffff',
  bg: '#e8e8e8',            // 浅灰背景
  bgLight: '#f5f5f5',
  border: '#d4d4d4',
  borderLight: '#e5e5e5',
  textDark: '#1f2937',
  textMid: '#4b5563',
  textLight: '#9ca3af',
  success: '#059669',
  successLight: '#d1fae5',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  info: '#2563eb',
  infoLight: '#dbeafe',
}

// ============================================================
// 类型定义
// ============================================================
interface ScheduleRecord {
  id: string
  staffId: string
  staffName: string
  role: string
  department: string
  modality: string  // CT/MR/DR/DSA/钼靶
  date: string
  shift: ShiftType
  status: 'confirmed' | 'pending' | 'cancelled'
  note?: string
}

interface SwapRequest {
  id: string
  requesterId: string
  requesterName: string
  targetId: string
  targetName: string
  requesterDate: string
  targetDate: string
  requesterShift: ShiftType
  targetShift: ShiftType
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  requestDate: string
  approveDate?: string
  approverId?: string
  approverName?: string
}

interface HolidayConfig {
  date: string
  name: string
  type: 'legal' | 'adjustment' // 法定节假日/调休工作日
}

type ShiftType = 'morning' | 'afternoon' | 'night' | 'fullday' | 'off'

// ============================================================
// 常量定义
// ============================================================

// 班次类型配置
const SHIFT_CONFIG: Record<ShiftType, { label: string; color: string; bg: string; icon: React.ReactNode; time: string }> = {
  morning: { label: '上午班', color: '#f59e0b', bg: '#fef3c7', icon: <Sun size={14} />, time: '08:00-12:00' },
  afternoon: { label: '下午班', color: '#3b82f6', bg: '#dbeafe', icon: <Sunset size={14} />, time: '14:00-18:00' },
  night: { label: '夜班', color: '#6366f1', bg: '#e0e7ff', icon: <Moon size={14} />, time: '18:00-次日08:00' },
  fullday: { label: '全天班', color: '#059669', bg: '#d1fae5', icon: <Clock size={14} />, time: '08:00-18:00' },
  off: { label: '休息', color: '#6b7280', bg: '#f3f4f6', icon: <Coffee size={14} />, time: '休息' },
}

// 设备类型配置
const MODALITY_CONFIG: Record<string, { label: string; color: string }> = {
  CT: { label: 'CT', color: '#7c3aed' },
  MR: { label: 'MR', color: '#2563eb' },
  DR: { label: 'DR', color: '#059669' },
  DSA: { label: 'DSA', color: '#dc2626' },
  '乳腺钼靶': { label: '乳腺钼靶', color: '#d97706' },
  钼靶: { label: '乳腺钼靶', color: '#d97706' },
}

// 设备类型列表
const MODALITY_LIST = ['CT', 'MR', 'DR', 'DSA', '乳腺钼靶']

// ============================================================
// 工具函数
// ============================================================

// 获取当前周的周一日期
const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// 格式化日期为 YYYY-MM-DD
const formatDate = (d: Date): string => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 获取日期的中文表示
const formatDateCht = (d: Date): string => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日${weekdays[d.getDay()]}`
}

// 判断是否为周末
const isWeekend = (d: Date): boolean => {
  const day = d.getDay()
  return day === 0 || day === 6
}

// 判断是否为法定节假日
const isLegalHoliday = (dateStr: string, holidays: HolidayConfig[]): boolean => {
  return holidays.some(h => h.date === dateStr && h.type === 'legal')
}

// 判断是否为调休工作日
const isAdjustmentWorkday = (dateStr: string, holidays: HolidayConfig[]): boolean => {
  return holidays.some(h => h.date === dateStr && h.type === 'adjustment')
}

// 获取周日期范围
const getWeekDates = (startDate: Date): Date[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    return d
  })
}

// ============================================================
// 模拟数据
// ============================================================

// 节假日配置
const HOLIDAY_CONFIG: HolidayConfig[] = [
  { date: '2026-05-01', name: '劳动节', type: 'legal' },
  { date: '2026-05-02', name: '劳动节', type: 'legal' },
  { date: '2026-05-03', name: '劳动节', type: 'legal' },
  { date: '2026-05-04', name: '劳动节', type: 'legal' },
  { date: '2026-05-05', name: '劳动节', type: 'legal' },
  { date: '2026-04-26', name: '调休上班', type: 'adjustment' },
  { date: '2026-05-09', name: '调休上班', type: 'adjustment' },
]

// 技师/医师列表（从initialUsers筛选）
const STAFF_LIST = initialUsers.filter(u => u.role === 'technologist' || u.role === 'radiologist').map(u => ({
  ...u,
  initials: u.name.slice(0, 2),
  label: `${u.name}（${u.title}）`,
}))

// 生成一周的排班数据（约20条记录）
const generateWeekSchedule = (weekDates: Date[]): ScheduleRecord[] => {
  const schedules: ScheduleRecord[] = []
  const shifts: ShiftType[] = ['morning', 'afternoon', 'night', 'fullday', 'off']
  
  // 为每个员工每天分配一个班次
  weekDates.forEach((date, dayIndex) => {
    const dateStr = formatDate(date)
    const isWeekendDay = isWeekend(date)
    const isHoliday = isLegalHoliday(dateStr, HOLIDAY_CONFIG)
    const isAdjustment = isAdjustmentWorkday(dateStr, HOLIDAY_CONFIG)
    
    STAFF_LIST.forEach((staff, staffIndex) => {
      // 跳过周末或节假日的部分员工
      if (isWeekendDay && !isAdjustment && Math.random() > 0.3) {
        // 周末休息
        schedules.push({
          id: `SCH-${dateStr}-${staff.id}`,
          staffId: staff.id,
          staffName: staff.name,
          role: staff.role,
          department: staff.department,
          modality: dayIndex % 2 === 0 ? 'CT' : 'MR', // 轮换设备类型
          date: dateStr,
          shift: 'off',
          status: 'confirmed',
        })
      } else if (isHoliday && !isAdjustment) {
        // 节假日休息
        schedules.push({
          id: `SCH-${dateStr}-${staff.id}`,
          staffId: staff.id,
          staffName: staff.name,
          role: staff.role,
          department: staff.department,
          modality: 'CT',
          date: dateStr,
          shift: 'off',
          status: 'confirmed',
        })
      } else {
        // 正常工作日
        const shiftIndex = (staffIndex + dayIndex) % shifts.length
        const shift = shifts[shiftIndex]
        schedules.push({
          id: `SCH-${dateStr}-${staff.id}`,
          staffId: staff.id,
          staffName: staff.name,
          role: staff.role,
          department: staff.department,
          modality: MODALITY_LIST[staffIndex % MODALITY_LIST.length],
          date: dateStr,
          shift: shift,
          status: 'confirmed',
        })
      }
    })
  })
  
  return schedules
}

// 代班换班申请记录
const INITIAL_SWAP_REQUESTS: SwapRequest[] = [
  {
    id: 'SWAP-001',
    requesterId: 'R005',
    requesterName: '刘建国',
    targetId: 'R006',
    targetName: '陈小红',
    requesterDate: '2026-05-06',
    targetDate: '2026-05-08',
    requesterShift: 'morning',
    targetShift: 'morning',
    reason: '家中有事，需要临时调换班次',
    status: 'pending',
    requestDate: '2026-05-01',
  },
  {
    id: 'SWAP-002',
    requesterId: 'R007',
    requesterName: '张建军',
    targetId: 'R005',
    targetName: '刘建国',
    requesterDate: '2026-05-10',
    targetDate: '2026-05-12',
    requesterShift: 'afternoon',
    targetShift: 'morning',
    reason: '参加学术会议，需要换班',
    status: 'approved',
    requestDate: '2026-04-28',
    approveDate: '2026-04-29',
    approverId: 'R001',
    approverName: '李明辉',
  },
  {
    id: 'SWAP-003',
    requesterId: 'R006',
    requesterName: '陈小红',
    targetId: 'R007',
    targetName: '张建军',
    requesterDate: '2026-05-15',
    targetDate: '2026-05-16',
    requesterShift: 'night',
    targetShift: 'night',
    reason: '身体不适，需要休息',
    status: 'pending',
    requestDate: '2026-05-02',
  },
]

// 排班统计数据
const generateScheduleStats = (schedules: ScheduleRecord[]) => {
  // 个人出勤统计
  const staffStats = STAFF_LIST.map(staff => {
    const staffSchedules = schedules.filter(s => s.staffId === staff.id)
    const shiftCount: Record<ShiftType, number> = {
      morning: 0, afternoon: 0, night: 0, fullday: 0, off: 0
    }
    staffSchedules.forEach(s => {
      if (s.shift in shiftCount) shiftCount[s.shift as ShiftType]++
    })
    
    return {
      staffId: staff.id,
      staffName: staff.name,
      title: staff.title,
      totalShifts: staffSchedules.filter(s => s.shift !== 'off').length,
      ...shiftCount,
    }
  })

  // 设备利用率统计
  const modalityUtilization = MODALITY_LIST.map(mod => {
    const modSchedules = schedules.filter(s => s.modality === mod && s.shift !== 'off')
    const totalSlots = schedules.length / MODALITY_LIST.length * 7 // 粗略估算
    return {
      modality: mod,
      label: MODALITY_CONFIG[mod]?.label || mod,
      count: modSchedules.length,
      utilization: Math.round((modSchedules.length / totalSlots) * 100),
    }
  })

  // 班次分布统计
  const shiftDistribution = [
    { name: '上午班', value: schedules.filter(s => s.shift === 'morning').length, color: '#f59e0b' },
    { name: '下午班', value: schedules.filter(s => s.shift === 'afternoon').length, color: '#3b82f6' },
    { name: '夜班', value: schedules.filter(s => s.shift === 'night').length, color: '#6366f1' },
    { name: '全天班', value: schedules.filter(s => s.shift === 'fullday').length, color: '#059669' },
    { name: '休息', value: schedules.filter(s => s.shift === 'off').length, color: '#6b7280' },
  ]

  return { staffStats, modalityUtilization, shiftDistribution }
}

// ============================================================
// 子组件
// ============================================================

/** 标签页按钮 */
function TabBtn({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        border: 'none',
        borderBottom: active ? `2px solid ${C.primary}` : '2px solid transparent',
        background: active ? C.white : 'transparent',
        color: active ? C.primary : C.textMid,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        transition: 'all 0.2s',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

/** 班次标签 */
function ShiftBadge({ shift, size = 'default' }: { shift: ShiftType; size?: 'small' | 'default' }) {
  const config = SHIFT_CONFIG[shift]
  const padding = size === 'small' ? '2px 6px' : '4px 10px'
  const fontSize = size === 'small' ? 11 : 12
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding,
      background: config.bg,
      color: config.color,
      borderRadius: 4,
      fontSize,
      fontWeight: 500,
      border: `1px solid ${config.color}30`,
    }}>
      {config.icon}
      {config.label}
    </span>
  )
}

/** 状态徽章 */
function StatusBadge({ status }: { status: SwapRequest['status'] }) {
  const config = {
    pending: { label: '待审批', bg: C.warningLight, color: C.warning },
    approved: { label: '已同意', bg: C.successLight, color: C.success },
    rejected: { label: '已拒绝', bg: C.dangerLight, color: C.danger },
  }[status]
  
  return (
    <span style={{
      padding: '2px 8px',
      background: config.bg,
      color: config.color,
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 500,
    }}>
      {config.label}
    </span>
  )
}

/** 设备类型标签 */
function ModalityBadge({ modality }: { modality: string }) {
  const config = MODALITY_CONFIG[modality] || { label: modality, color: '#6b7280' }
  return (
    <span style={{
      padding: '2px 8px',
      background: config.color + '20',
      color: config.color,
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 500,
    }}>
      {config.label}
    </span>
  )
}

/** 周导航器 */
function WeekNavigator({ weekStart, onPrev, onNext, onToday }: { 
  weekStart: Date; 
  onPrev: () => void; 
  onNext: () => void; 
  onToday: () => void;
}) {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  const formatRange = () => {
    const startMonth = weekStart.getMonth() + 1
    const startDay = weekStart.getDate()
    const endMonth = weekEnd.getMonth() + 1
    const endDay = weekEnd.getDate()
    
    if (startMonth === endMonth) {
      return `${startMonth}月${startDay}日 - ${endDay}日`
    }
    return `${startMonth}月${startDay}日 - ${endMonth}月${endDay}日`
  }
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={onPrev} style={btnStyle(C.primary)}>
        <ChevronLeft size={16} />
      </button>
      <span style={{ fontSize: 15, fontWeight: 600, color: C.textDark, minWidth: 180, textAlign: 'center' }}>
        {formatRange()}
      </span>
      <button onClick={onNext} style={btnStyle(C.primary)}>
        <ChevronRight size={16} />
      </button>
      <button onClick={onToday} style={{ ...btnStyle(C.textMid), fontSize: 12 }}>
        今天
      </button>
    </div>
  )
}

// 按钮样式
const btnStyle = (bg: string) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 10px',
  background: bg,
  color: C.white,
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
  gap: 4,
})

// ============================================================
// 主组件
// ============================================================
export default function SchedulePage() {
  // 状态定义
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()))
  const [activeTab, setActiveTab] = useState<'schedule' | 'holiday' | 'swap' | 'stats'>('schedule')
  const [selectedModality, setSelectedModality] = useState<string>('all')
  const [selectedStaff, setSelectedStaff] = useState<string>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>(INITIAL_SWAP_REQUESTS)
  const [holidays, setHolidays] = useState<HolidayConfig[]>(HOLIDAY_CONFIG)
  
  // 换班弹窗状态
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapForm, setSwapForm] = useState({
    requesterId: '',
    targetId: '',
    requesterDate: '',
    targetDate: '',
    requesterShift: 'morning' as ShiftType,
    targetShift: 'morning' as ShiftType,
    reason: '',
  })
  
  // 节假日弹窗状态
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [holidayForm, setHolidayForm] = useState({
    date: '',
    name: '',
    type: 'legal' as 'legal' | 'adjustment',
  })

  // 计算当前周的日期
  const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart])
  
  // 生成排班数据
  const allSchedules = useMemo(() => generateWeekSchedule(weekDates), [weekDates])
  
  // 筛选后的排班数据
  const filteredSchedules = useMemo(() => {
    return allSchedules.filter(s => {
      if (selectedModality !== 'all' && s.modality !== selectedModality) return false
      if (selectedStaff !== 'all' && s.staffId !== selectedStaff) return false
      if (searchKeyword && !s.staffName.includes(searchKeyword)) return false
      return true
    })
  }, [allSchedules, selectedModality, selectedStaff, searchKeyword])
  
  // 统计数据
  const stats = useMemo(() => generateScheduleStats(allSchedules), [allSchedules])
  
  // 周导航函数
  const goToPrevWeek = () => {
    const prev = new Date(currentWeekStart)
    prev.setDate(prev.getDate() - 7)
    setCurrentWeekStart(prev)
  }
  
  const goToNextWeek = () => {
    const next = new Date(currentWeekStart)
    next.setDate(next.getDate() + 7)
    setCurrentWeekStart(next)
  }
  
  const goToToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()))
  }
  
  // 处理换班申请
  const handleSwapSubmit = () => {
    const requester = STAFF_LIST.find(s => s.id === swapForm.requesterId)
    const target = STAFF_LIST.find(s => s.id === swapForm.targetId)
    
    if (!requester || !target) {
      alert('请选择换班人员')
      return
    }
    
    const newRequest: SwapRequest = {
      id: `SWAP-${String(swapRequests.length + 1).padStart(3, '0')}`,
      requesterId: requester.id,
      requesterName: requester.name,
      targetId: target.id,
      targetName: target.name,
      requesterDate: swapForm.requesterDate,
      targetDate: swapForm.targetDate,
      requesterShift: swapForm.requesterShift,
      targetShift: swapForm.targetShift,
      reason: swapForm.reason,
      status: 'pending',
      requestDate: formatDate(new Date()),
    }
    
    setSwapRequests([...swapRequests, newRequest])
    setShowSwapModal(false)
    setSwapForm({
      requesterId: '',
      targetId: '',
      requesterDate: '',
      targetDate: '',
      requesterShift: 'morning',
      targetShift: 'morning',
      reason: '',
    })
  }
  
  // 处理换班审批
  const handleSwapApprove = (id: string, approved: boolean) => {
    setSwapRequests(requests => requests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: approved ? 'approved' : 'rejected',
          approveDate: formatDate(new Date()),
          approverId: 'R001',
          approverName: '李明辉',
        }
      }
      return r
    }))
  }
  
  // 添加节假日
  const handleHolidaySubmit = () => {
    if (!holidayForm.date || !holidayForm.name) {
      alert('请填写完整信息')
      return
    }
    
    const existing = holidays.findIndex(h => h.date === holidayForm.date)
    if (existing >= 0) {
      const updated = [...holidays]
      updated[existing] = holidayForm
      setHolidays(updated)
    } else {
      setHolidays([...holidays, holidayForm])
    }
    
    setShowHolidayModal(false)
    setHolidayForm({ date: '', name: '', type: 'legal' })
  }
  
  // 删除节假日
  const handleHolidayDelete = (date: string) => {
    setHolidays(holidays.filter(h => h.date !== date))
  }
  
  // 获取某天的日期类型
  const getDateType = (date: Date): { isWeekend: boolean; isHoliday: boolean; isAdjustment: boolean; holidayName?: string } => {
    const dateStr = formatDate(date)
    const isWeekendDay = isWeekend(date)
    const holiday = holidays.find(h => h.date === dateStr)
    
    return {
      isWeekend: isWeekendDay,
      isHoliday: holiday?.type === 'legal' || false,
      isAdjustment: holiday?.type === 'adjustment' || false,
      holidayName: holiday?.name,
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: 20 }}>
      {/* 顶部标题栏 */}
      <div style={{
        background: C.white,
        borderRadius: 8,
        padding: '16px 20px',
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CalendarClock size={28} style={{ color: C.primary }} />
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textDark, margin: 0 }}>
                科室排班管理
              </h1>
              <p style={{ fontSize: 13, color: C.textMid, margin: '4px 0 0 0' }}>
                技师/医师班次管理、节假日配置、代班换班
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={btnStyle(C.primary)} onClick={() => setShowSwapModal(true)}>
              <ArrowRightLeft size={16} />
              申请换班
            </button>
            <button style={btnStyle(C.accent)} onClick={() => setShowHolidayModal(true)}>
              <Calendar size={16} />
              节假日配置
            </button>
            <button style={btnStyle(C.textMid)}>
              <Download size={16} />
              导出排班
            </button>
          </div>
        </div>
      </div>
      
      {/* 标签页 */}
      <div style={{
        background: C.white,
        borderRadius: '8px 8px 0 0',
        padding: '0 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', gap: 0 }}>
          <TabBtn 
            label="排班表" 
            active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')}
            icon={<Calendar size={16} />}
          />
          <TabBtn 
            label="节假日" 
            active={activeTab === 'holiday'} 
            onClick={() => setActiveTab('holiday')}
            icon={<Settings size={16} />}
          />
          <TabBtn 
            label="换班申请" 
            active={activeTab === 'swap'} 
            onClick={() => setActiveTab('swap')}
            icon={<ArrowRightLeft size={16} />}
          />
          <TabBtn 
            label="排班统计" 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')}
            icon={<BarChart3 size={16} />}
          />
        </div>
      </div>
      
      {/* 主内容区 */}
      <div style={{
        background: C.white,
        borderRadius: '0 0 8px 8px',
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        minHeight: 600,
      }}>
        {/* ========== 排班表视图 ========== */}
        {activeTab === 'schedule' && (
          <div>
            {/* 筛选工具栏 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              gap: 16,
            }}>
              <WeekNavigator 
                weekStart={currentWeekStart} 
                onPrev={goToPrevWeek}
                onNext={goToNextWeek}
                onToday={goToToday}
              />
              
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {/* 搜索框 */}
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ 
                    position: 'absolute', 
                    left: 10, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: C.textLight,
                  }} />
                  <input
                    type="text"
                    placeholder="搜索人员姓名"
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    style={{
                      padding: '6px 12px 6px 32px',
                      border: `1px solid ${C.border}`,
                      borderRadius: 4,
                      fontSize: 13,
                      width: 160,
                      outline: 'none',
                    }}
                  />
                </div>
                
                {/* 设备类型筛选 */}
                <select
                  value={selectedModality}
                  onChange={e => setSelectedModality(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 4,
                    fontSize: 13,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">全部设备</option>
                  {MODALITY_LIST.map(m => (
                    <option key={m} value={m}>{MODALITY_CONFIG[m]?.label || m}</option>
                  ))}
                </select>
                
                {/* 人员筛选 */}
                <select
                  value={selectedStaff}
                  onChange={e => setSelectedStaff(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 4,
                    fontSize: 13,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">全部人员</option>
                  {STAFF_LIST.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* 排班表 */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: 13,
              }}>
                <thead>
                  <tr style={{ background: C.bgLight }}>
                    <th style={{ 
                      padding: '10px 12px', 
                      textAlign: 'left',
                      borderBottom: `2px solid ${C.border}`,
                      fontWeight: 600,
                      color: C.textDark,
                      width: 120,
                    }}>
                      人员
                    </th>
                    {weekDates.map((date, i) => {
                      const dateType = getDateType(date)
                      const bgColor = dateType.isHoliday ? C.dangerLight 
                        : dateType.isAdjustment ? C.successLight 
                        : dateType.isWeekend ? C.bgLight 
                        : C.white
                      
                      return (
                        <th key={i} style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          borderBottom: `2px solid ${C.border}`,
                          fontWeight: 600,
                          color: dateType.isHoliday ? C.danger : C.textDark,
                          background: bgColor,
                          minWidth: 100,
                        }}>
                          <div>{formatDateCht(date)}</div>
                          <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2 }}>
                            {dateType.isHoliday && `(${dateType.holidayName})`}
                            {dateType.isAdjustment && '(上班)'}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(selectedStaff === 'all' ? STAFF_LIST : STAFF_LIST.filter(s => s.id === selectedStaff)).map((staff, staffIdx) => (
                    <tr key={staff.id} style={{ 
                      background: staffIdx % 2 === 0 ? C.white : C.bgLight,
                    }}>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.borderLight}` }}>
                        <div style={{ fontWeight: 500, color: C.textDark }}>{staff.name}</div>
                        <div style={{ fontSize: 11, color: C.textMid }}>{staff.title}</div>
                      </td>
                      {weekDates.map((date, dayIdx) => {
                        const dateStr = formatDate(date)
                        const schedule = filteredSchedules.find(
                          s => s.staffId === staff.id && s.date === dateStr
                        )
                        const dateType = getDateType(date)
                        const bgColor = dateType.isHoliday ? C.dangerLight + '50'
                          : dateType.isAdjustment ? C.successLight + '50'
                          : dateType.isWeekend && !dateType.isAdjustment ? C.bgLight
                          : C.white
                        
                        return (
                          <td key={dayIdx} style={{
                            padding: '8px',
                            textAlign: 'center',
                            borderBottom: `1px solid ${C.borderLight}`,
                            background: bgColor,
                          }}>
                            {schedule ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <ShiftBadge shift={schedule.shift} size="small" />
                                <ModalityBadge modality={schedule.modality} />
                              </div>
                            ) : (
                              <span style={{ color: C.textLight, fontSize: 12 }}>-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 班次图例 */}
            <div style={{
              marginTop: 16,
              padding: '12px 16px',
              background: C.bgLight,
              borderRadius: 6,
              display: 'flex',
              gap: 20,
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 12, color: C.textMid, fontWeight: 500 }}>班次图例：</span>
              {Object.entries(SHIFT_CONFIG).map(([key, config]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    background: config.bg,
                    color: config.color,
                    borderRadius: 4,
                    fontSize: 12,
                  }}>
                    {config.icon}
                    {config.label}
                  </span>
                  <span style={{ fontSize: 11, color: C.textMid }}>{config.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* ========== 节假日配置视图 ========== */}
        {activeTab === 'holiday' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textDark, margin: 0 }}>
                节假日配置
              </h3>
              <button style={btnStyle(C.primary)} onClick={() => setShowHolidayModal(true)}>
                <Plus size={16} />
                添加节假日
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {/* 法定节假日 */}
              <div style={{
                padding: 16,
                background: C.bgLight,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
              }}>
                <h4 style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: C.danger, 
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: C.danger,
                  }} />
                  法定节假日
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {holidays.filter(h => h.type === 'legal').map(h => (
                    <div key={h.date} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: C.white,
                      borderRadius: 4,
                      border: `1px solid ${C.border}`,
                    }}>
                      <div>
                        <span style={{ fontWeight: 500, color: C.textDark }}>{h.name}</span>
                        <span style={{ marginLeft: 12, color: C.textMid, fontSize: 13 }}>{h.date}</span>
                      </div>
                      <button 
                        onClick={() => handleHolidayDelete(h.date)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: C.danger,
                          cursor: 'pointer',
                          padding: 4,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {holidays.filter(h => h.type === 'legal').length === 0 && (
                    <div style={{ color: C.textLight, fontSize: 13, padding: 12, textAlign: 'center' }}>
                      暂无法定节假日配置
                    </div>
                  )}
                </div>
              </div>
              
              {/* 调休工作日 */}
              <div style={{
                padding: 16,
                background: C.bgLight,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
              }}>
                <h4 style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: C.success, 
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: C.success,
                  }} />
                  调休工作日
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {holidays.filter(h => h.type === 'adjustment').map(h => (
                    <div key={h.date} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: C.white,
                      borderRadius: 4,
                      border: `1px solid ${C.border}`,
                    }}>
                      <div>
                        <span style={{ fontWeight: 500, color: C.textDark }}>{h.name}</span>
                        <span style={{ marginLeft: 12, color: C.textMid, fontSize: 13 }}>{h.date}</span>
                      </div>
                      <button 
                        onClick={() => handleHolidayDelete(h.date)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: C.danger,
                          cursor: 'pointer',
                          padding: 4,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {holidays.filter(h => h.type === 'adjustment').length === 0 && (
                    <div style={{ color: C.textLight, fontSize: 13, padding: 12, textAlign: 'center' }}>
                      暂无调休工作日配置
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 节假日说明 */}
            <div style={{
              marginTop: 20,
              padding: 16,
              background: C.infoLight,
              borderRadius: 6,
              border: `1px solid ${C.info}30`,
            }}>
              <h5 style={{ fontSize: 13, fontWeight: 600, color: C.info, margin: '0 0 8px 0' }}>
                配置说明
              </h5>
              <ul style={{ fontSize: 12, color: C.textMid, margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>法定节假日：系统自动标记为休息日，不安排常规班次</li>
                <li>调休工作日：周末但需要上班的日期，系统自动安排班次</li>
                <li>节假日配置会影响排班表的显示效果</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* ========== 换班申请视图 ========== */}
        {activeTab === 'swap' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textDark, margin: 0 }}>
                代班换班申请
              </h3>
              <button style={btnStyle(C.primary)} onClick={() => setShowSwapModal(true)}>
                <Plus size={16} />
                新申请
              </button>
            </div>
            
            {/* 换班统计卡片 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: '全部申请', value: swapRequests.length, color: C.primary },
                { label: '待审批', value: swapRequests.filter(r => r.status === 'pending').length, color: C.warning },
                { label: '已同意', value: swapRequests.filter(r => r.status === 'approved').length, color: C.success },
                { label: '已拒绝', value: swapRequests.filter(r => r.status === 'rejected').length, color: C.danger },
              ].map(stat => (
                <div key={stat.label} style={{
                  padding: 16,
                  background: C.white,
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: C.textMid, marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
            
            {/* 换班申请列表 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {swapRequests.map(request => (
                <div key={request.id} style={{
                  padding: 16,
                  background: C.white,
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  borderLeft: `4px solid ${
                    request.status === 'pending' ? C.warning 
                    : request.status === 'approved' ? C.success 
                    : C.danger
                  }`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, color: C.textDark }}>
                          {request.requesterName}
                        </span>
                        <ArrowRightLeft size={16} style={{ color: C.textMid }} />
                        <span style={{ fontWeight: 600, color: C.textDark }}>
                          {request.targetName}
                        </span>
                        <StatusBadge status={request.status} />
                      </div>
                      
                      <div style={{ fontSize: 13, color: C.textMid, display: 'flex', gap: 20 }}>
                        <span>
                          {request.requesterName}：{request.requesterDate} 
                          <ShiftBadge shift={request.requesterShift} size="small" />
                        </span>
                        <span>
                          {request.targetName}：{request.targetDate}
                          <ShiftBadge shift={request.targetShift} size="small" />
                        </span>
                      </div>
                      
                      {request.reason && (
                        <div style={{ marginTop: 8, fontSize: 12, color: C.textMid }}>
                          原因：{request.reason}
                        </div>
                      )}
                      
                      <div style={{ marginTop: 8, fontSize: 11, color: C.textLight }}>
                        申请时间：{request.requestDate}
                        {request.approveDate && ` | 审批时间：${request.approveDate}（${request.approverName}）`}
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          onClick={() => handleSwapApprove(request.id, true)}
                          style={{
                            ...btnStyle(C.success),
                            padding: '6px 12px',
                            fontSize: 12,
                          }}
                        >
                          <Check size={14} />
                          同意
                        </button>
                        <button 
                          onClick={() => handleSwapApprove(request.id, false)}
                          style={{
                            ...btnStyle(C.danger),
                            padding: '6px 12px',
                            fontSize: 12,
                          }}
                        >
                          <X size={14} />
                          拒绝
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {swapRequests.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 40, 
                  color: C.textLight,
                  fontSize: 14,
                }}>
                  暂无换班申请记录
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* ========== 排班统计视图 ========== */}
        {activeTab === 'stats' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textDark, margin: '0 0 20px 0' }}>
              排班统计
            </h3>
            
            {/* 统计卡片 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: '本周总班次', value: allSchedules.length, icon: <Calendar size={20} />, color: C.primary },
                { label: '出勤人次', value: allSchedules.filter(s => s.shift !== 'off').length, icon: <CheckCircle size={20} />, color: C.success },
                { label: '休息人次', value: allSchedules.filter(s => s.shift === 'off').length, icon: <Coffee size={20} />, color: C.warning },
                { label: '换班申请', value: swapRequests.length, icon: <ArrowRightLeft size={20} />, color: C.accent },
              ].map(stat => (
                <div key={stat.label} style={{
                  padding: 16,
                  background: C.white,
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: stat.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                  }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: C.textMid }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* 个人出勤统计 */}
              <div style={{
                padding: 16,
                background: C.bgLight,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: C.textDark, margin: '0 0 16px 0' }}>
                  个人出勤统计
                </h4>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {stats.staffStats.map((stat, idx) => (
                    <div key={stat.staffId} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: C.white,
                      borderRadius: 6,
                      marginBottom: 8,
                      gap: 12,
                    }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: C.primaryLighter,
                        color: C.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, color: C.textDark, fontSize: 13 }}>{stat.staffName}</div>
                        <div style={{ fontSize: 11, color: C.textMid }}>{stat.title}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <span style={{
                          padding: '2px 6px',
                          background: C.successLight,
                          color: C.success,
                          borderRadius: 4,
                          fontSize: 11,
                        }}>
                          出勤 {stat.totalShifts} 天
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 班次分布饼图 */}
              <div style={{
                padding: 16,
                background: C.bgLight,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: C.textDark, margin: '0 0 16px 0' }}>
                  班次分布
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <RePieChart>
                    <Pie
                      data={stats.shiftDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stats.shiftDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              
              {/* 设备利用率 */}
              <div style={{
                padding: 16,
                background: C.bgLight,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                gridColumn: 'span 2',
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: C.textDark, margin: '0 0 16px 0' }}>
                  设备排班分布
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                  {stats.modalityUtilization.map(mod => (
                    <div key={mod.modality} style={{
                      padding: 16,
                      background: C.white,
                      borderRadius: 8,
                      textAlign: 'center',
                    }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: (MODALITY_CONFIG[mod.modality]?.color || '#6b7280') + '20',
                        color: MODALITY_CONFIG[mod.modality]?.color || '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                        fontSize: 18,
                        fontWeight: 700,
                      }}>
                        {mod.label.slice(0, 2)}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.textDark }}>{mod.label}</div>
                      <div style={{ fontSize: 11, color: C.textMid, marginTop: 4 }}>
                        {mod.count} 人次
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* ========== 换班申请弹窗 ========== */}
      {showSwapModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: C.white,
            borderRadius: 12,
            padding: 24,
            width: 480,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textDark, margin: 0 }}>
                申请换班
              </h3>
              <button onClick={() => setShowSwapModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: C.textMid }} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 申请人 */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                  申请人
                </label>
                <select
                  value={swapForm.requesterId}
                  onChange={e => setSwapForm({ ...swapForm, requesterId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  <option value="">选择申请人</option>
                  {STAFF_LIST.map(s => (
                    <option key={s.id} value={s.id}>{s.name}（{s.title}）</option>
                  ))}
                </select>
              </div>
              
              {/* 申请人班次日期 */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                  申请人班次日期
                </label>
                <input
                  type="date"
                  value={swapForm.requesterDate}
                  onChange={e => setSwapForm({ ...swapForm, requesterDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
              
              {/* 申请人班次类型 */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                  申请人班次
                </label>
                <select
                  value={swapForm.requesterShift}
                  onChange={e => setSwapForm({ ...swapForm, requesterShift: e.target.value as ShiftType })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  {Object.entries(SHIFT_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}（{config.time}）</option>
                  ))}
                </select>
              </div>
              
              <div style={{ textAlign: 'center', color: C.textMid }}>
                <ArrowRightLeft size={20} />
              </div>
              
              {/* 被换班人 */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                  被换班人
                </label>
                <select
                  value={swapForm.targetId}
                  onChange={e => setSwapForm({ ...swapForm, targetId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  <option value="">选择被换班人</option>
                  {STAFF_LIST.filter(s => s.id !== swapForm.requesterId).map(s => (
                    <option key={s.id} value={s.id}>{s.name}（{s.title}）</option>
                  ))}
                </select>
              </div>
              
              {/* 被换班人班次日期 */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                  被换班人班次日期
                </label>
                <input
                  type="date"
                  value={swapForm.targetDate}
                  onChange={e => setSwapForm({ ...swapForm, targetDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
              
              {/* 被换班人班次类型 */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                  被换班人班次
                </label>
                <select
                  value={swapForm.targetShift}
                  onChange={e => setSwapForm({ ...swapForm, targetShift: e.target.value as ShiftType })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  {Object.entries(SHIFT_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}（{config.time}）</option>
                  ))}
                </select>
              </div>
              
              {/* 换班原因 */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                  换班原因
                </label>
                <textarea
                  value={swapForm.reason}
                  onChange={e => setSwapForm({ ...swapForm, reason: e.target.value })}
                  placeholder="请输入换班原因..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button 
                  onClick={() => setShowSwapModal(false)}
                  style={{
                    padding: '8px 20px',
                    background: C.bgLight,
                    color: C.textMid,
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  取消
                </button>
                <button 
                  onClick={handleSwapSubmit}
                  style={{
                    padding: '8px 20px',
                    background: C.primary,
                    color: C.white,
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  提交申请
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ========== 节假日配置弹窗 ========== */}
      {showHolidayModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: C.white,
            borderRadius: 12,
            padding: 24,
            width: 400,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textDark, margin: 0 }}>
                添加节假日
              </h3>
              <button onClick={() => setShowHolidayModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: C.textMid }} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                  日期
                </label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={e => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                  名称
                </label>
                <input
                  type="text"
                  value={holidayForm.name}
                  onChange={e => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  placeholder="如：劳动节、春节"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                  类型
                </label>
                <select
                  value={holidayForm.type}
                  onChange={e => setHolidayForm({ ...holidayForm, type: e.target.value as 'legal' | 'adjustment' })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  <option value="legal">法定节假日</option>
                  <option value="adjustment">调休工作日</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button 
                  onClick={() => setShowHolidayModal(false)}
                  style={{
                    padding: '8px 20px',
                    background: C.bgLight,
                    color: C.textMid,
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  取消
                </button>
                <button 
                  onClick={handleHolidaySubmit}
                  style={{
                    padding: '8px 20px',
                    background: C.primary,
                    color: C.white,
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
