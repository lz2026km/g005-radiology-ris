// @ts-nocheck
// G005 放射科RIS系统 - 检查预约管理 v2.0.0
// 完整模拟放射科检查预约流程：日历/列表视图 + 新建预约表单 + 规则设置
import { useState, useMemo } from 'react'
import {
  CalendarClock, ChevronLeft, ChevronRight, CalendarDays, List,
  Filter, Plus, Search, X, CheckCircle, Clock, AlertCircle, XCircle,
  User, Phone, CreditCard, Stethoscope, Scan, MapPin, Bell,
  Trash2, Edit2, Eye, Upload, Download, Settings, Save, RefreshCw,
  Monitor, Cpu, Wifi, WifiOff, Check, AlertTriangle, ArrowRightLeft
} from 'lucide-react'
import {
  initialRadiologyExams,
  initialModalityDevices,
  initialExamItems,
  initialPatients,
  initialUsers
} from '../data/initialData'

// ==================== 类型定义 ====================
interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientInitials: string
  gender: string
  age: number
  idCard: string
  phone: string
  examItemId: string
  examItemName: string
  modality: string
  bodyPart: string
  examDate: string
  examTime: string
  deviceId: string
  deviceName: string
  roomId: string
  roomName: string
  referringDoctorId: string
  referringDoctorName: string
  clinicalDiagnosis: string
  notes: string
  status: 'pending' | 'confirmed' | 'checked-in' | 'cancelled' | 'no-show'
  priority: 'normal' | 'urgent' | 'critical'
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

interface AppointmentRules {
  deviceId: string
  deviceName: string
  maxDailyAppointments: number
  maxPerTimeSlot: number
  minAdvanceDays: number
  maxAdvanceDays: number
  noShowPenalty: number // 违约扣款
  enabled: boolean
}

interface TimeSlot {
  time: string
  available: boolean
  booked: number
  max: number
}

// ==================== 工具函数 ====================
const getWeekDates = (baseDate: Date): Date[] => {
  const day = baseDate.getDay()
  const monday = new Date(baseDate)
  monday.setDate(baseDate.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const formatDate = (d: Date): string => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatDateCht = (d: Date): string => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日${weekdays[d.getDay()]}`
}

const getNameInitials = (name: string): string => {
  if (!name) return ''
  const parts = name.split(/[\s·]/)
  if (parts.length >= 2) return parts[0][0] + parts[1][0]
  return name.slice(0, 2)
}

const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending: { label: '待确认', bg: '#fef9c3', color: '#ca8a04', border: '#fef08a' },
  confirmed: { label: '已确认', bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
  'checked-in': { label: '已到检', bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' },
  cancelled: { label: '已取消', bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
  'no-show': { label: '违约', bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
}

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  critical: { label: '危重', bg: '#fee2e2', color: '#dc2626' },
  urgent: { label: '紧急', bg: '#fef3c7', color: '#d97706' },
  normal: { label: '普通', bg: '#f1f5f9', color: '#64748b' },
}

const CANCEL_REASONS = [
  { value: 'patient', label: '患者主动取消' },
  { value: 'device', label: '设备故障' },
  { value: 'doctor', label: '医生取消' },
  { value: 'reschedule', label: '改期' },
  { value: 'other', label: '其他' },
]

// ==================== 模拟预约数据 ====================
const generateMockAppointments = (): Appointment[] => {
  const today = new Date()
  const base = formatDate(today)
  return [
    { id: 'APT-001', patientId: 'RAD-P001', patientName: '张志刚', patientInitials: '张志', gender: '男', age: 62, idCard: '3101011964021XXXXX', phone: '13800138001', examItemId: 'EI-CT-006', examItemName: '冠脉CTA', modality: 'CT', bodyPart: '心脏', examDate: base, examTime: '09:00', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）', roomId: 'ROOM-CT1', roomName: 'CT室1', referringDoctorId: 'R001', referringDoctorName: '李明辉', clinicalDiagnosis: '冠心病待查', notes: '需控制心率', status: 'confirmed', priority: 'urgent', createdAt: '2026-04-28 10:00', updatedAt: '2026-04-28 10:00' },
    { id: 'APT-002', patientId: 'RAD-P002', patientName: '李秀英', patientInitials: '李秀', gender: '女', age: 55, idCard: '3101021970021XXXXX', phone: '13800138002', examItemId: 'EI-MR-001', examItemName: '头颅MR平扫', modality: 'MR', bodyPart: '头颅', examDate: base, examTime: '10:00', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）', roomId: 'ROOM-MR1', roomName: 'MR室1', referringDoctorId: 'R002', referringDoctorName: '王秀峰', clinicalDiagnosis: '头痛待查', notes: '', status: 'pending', priority: 'normal', createdAt: '2026-04-29 08:00', updatedAt: '2026-04-29 08:00' },
    { id: 'APT-003', patientId: 'RAD-P003', patientName: '王建国', patientInitials: '王建', gender: '男', age: 58, idCard: '3101031968011XXXXX', phone: '13800138003', examItemId: 'EI-DR-001', examItemName: '胸部DR正侧位', modality: 'DR', bodyPart: '胸部', examDate: base, examTime: '09:30', deviceId: 'DEV-DR-01', deviceName: 'DR-1（飞利浦DigitalDiagnost）', roomId: 'ROOM-DR1', roomName: 'DR室1', referringDoctorId: 'R003', referringDoctorName: '张海涛', clinicalDiagnosis: '健康体检', notes: '', status: 'checked-in', priority: 'normal', createdAt: '2026-04-27 14:00', updatedAt: '2026-04-30 07:30' },
    { id: 'APT-004', patientId: 'RAD-P004', patientName: '赵晓敏', patientInitials: '赵晓', gender: '女', age: 45, idCard: '3101041978011XXXXX', phone: '13800138004', examItemId: 'EI-CT-001', examItemName: '头颅CT平扫', modality: 'CT', bodyPart: '头颅', examDate: base, examTime: '11:00', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）', roomId: 'ROOM-CT1', roomName: 'CT室1', referringDoctorId: 'R004', referringDoctorName: '刘芳', clinicalDiagnosis: '外伤后头晕', notes: '急诊绿色通道', status: 'confirmed', priority: 'critical', createdAt: '2026-05-01 06:00', updatedAt: '2026-05-01 06:00' },
    { id: 'APT-005', patientId: 'RAD-P005', patientName: '周玉芬', patientInitials: '周玉', gender: '女', age: 52, idCard: '3101051973021XXXXX', phone: '13800138005', examItemId: 'EI-CT-003', examItemName: '腹部CT平扫+增强', modality: 'CT', bodyPart: '腹部', examDate: base, examTime: '14:00', deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）', roomId: 'ROOM-CT2', roomName: 'CT室2', referringDoctorId: 'R001', referringDoctorName: '李明辉', clinicalDiagnosis: '肝占位待查', notes: '空腹4h，增强需留置针', status: 'pending', priority: 'urgent', createdAt: '2026-04-30 09:00', updatedAt: '2026-04-30 09:00' },
    { id: 'APT-006', patientId: 'RAD-P006', patientName: '孙伟', patientInitials: '孙伟', gender: '男', age: 35, idCard: '3101061990011XXXXX', phone: '13800138006', examItemId: 'EI-MR-003', examItemName: '腰椎MR平扫', modality: 'MR', bodyPart: '脊柱', examDate: base, examTime: '15:00', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）', roomId: 'ROOM-MR1', roomName: 'MR室1', referringDoctorId: 'R003', referringDoctorName: '张海涛', clinicalDiagnosis: '腰痛待查', notes: '', status: 'confirmed', priority: 'normal', createdAt: '2026-04-30 11:00', updatedAt: '2026-04-30 11:00' },
    { id: 'APT-007', patientId: 'RAD-P007', patientName: '吴婷', patientInitials: '吴婷', gender: '女', age: 42, idCard: '3101071978021XXXXX', phone: '13800138007', examItemId: 'EI-MG-001', examItemName: '乳腺钼靶', modality: '乳腺钼靶', bodyPart: '胸部', examDate: base, examTime: '10:00', deviceId: 'DEV-MG-01', deviceName: '乳腺钼靶（GE Senographe）', roomId: 'ROOM-MG1', roomName: '钼靶室1', referringDoctorId: 'R004', referringDoctorName: '刘芳', clinicalDiagnosis: '乳腺结节随访', notes: '月经结束后7-10天最佳', status: 'confirmed', priority: 'normal', createdAt: '2026-04-29 15:00', updatedAt: '2026-04-29 15:00' },
    { id: 'APT-008', patientId: 'RAD-P008', patientName: '郑丽', patientInitials: '郑丽', gender: '女', age: 38, idCard: '3101081982021XXXXX', phone: '13800138008', examItemId: 'EI-DR-002', examItemName: '腹部立卧位平片', modality: 'DR', bodyPart: '腹部', examDate: base, examTime: '08:00', deviceId: 'DEV-DR-02', deviceName: 'DR-2（GE Optima）', roomId: 'ROOM-DR2', roomName: 'DR室2', referringDoctorId: 'R002', referringDoctorName: '王秀峰', clinicalDiagnosis: '肠梗阻待查', notes: '急查', status: 'no-show', priority: 'urgent', createdAt: '2026-05-01 07:00', updatedAt: '2026-05-01 08:30' },
    // 明天
    { id: 'APT-009', patientId: 'RAD-P001', patientName: '张志刚', patientInitials: '张志', gender: '男', age: 62, idCard: '3101011964021XXXXX', phone: '13800138001', examItemId: 'EI-DSA-001', examItemName: '冠脉造影', modality: 'DSA', bodyPart: '心脏', examDate: formatDate(new Date(today.getTime() + 86400000)), examTime: '08:30', deviceId: 'DEV-DSA-01', deviceName: 'DSA-1（飞利浦Azurion 7）', roomId: 'ROOM-DSA1', roomName: 'DSA室1', referringDoctorId: 'R001', referringDoctorName: '李明辉', clinicalDiagnosis: '冠心病三支病变', notes: '支架治疗前评估', status: 'confirmed', priority: 'urgent', createdAt: '2026-04-28 10:00', updatedAt: '2026-04-28 10:00' },
    { id: 'APT-010', patientId: 'RAD-P002', patientName: '李秀英', patientInitials: '李秀', gender: '女', age: 55, idCard: '3101021970021XXXXX', phone: '13800138002', examItemId: 'EI-CT-002', examItemName: '胸部CT平扫', modality: 'CT', bodyPart: '胸部', examDate: formatDate(new Date(today.getTime() + 86400000)), examTime: '09:30', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）', roomId: 'ROOM-CT1', roomName: 'CT室1', referringDoctorId: 'R002', referringDoctorName: '王秀峰', clinicalDiagnosis: '肺炎复查', notes: '', status: 'pending', priority: 'normal', createdAt: '2026-04-30 16:00', updatedAt: '2026-04-30 16:00' },
    { id: 'APT-011', patientId: 'RAD-P003', patientName: '王建国', patientInitials: '王建', gender: '男', age: 58, idCard: '3101031968011XXXXX', phone: '13800138003', examItemId: 'EI-CT-005', examItemName: '脊柱CT', modality: 'CT', bodyPart: '脊柱', examDate: formatDate(new Date(today.getTime() + 86400000)), examTime: '14:00', deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）', roomId: 'ROOM-CT2', roomName: 'CT室2', referringDoctorId: 'R003', referringDoctorName: '张海涛', clinicalDiagnosis: '腰椎间盘突出', notes: '', status: 'confirmed', priority: 'normal', createdAt: '2026-04-30 14:00', updatedAt: '2026-04-30 14:00' },
    { id: 'APT-012', patientId: 'RAD-P004', patientName: '赵晓敏', patientInitials: '赵晓', gender: '女', age: 45, idCard: '3101041978011XXXXX', phone: '13800138004', examItemId: 'EI-MR-002', examItemName: '腹部MR平扫+增强', modality: 'MR', bodyPart: '腹部', examDate: formatDate(new Date(today.getTime() + 86400000 * 2)), examTime: '10:00', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）', roomId: 'ROOM-MR1', roomName: 'MR室1', referringDoctorId: 'R004', referringDoctorName: '刘芳', clinicalDiagnosis: '肝占位增强', notes: '空腹6h', status: 'pending', priority: 'urgent', createdAt: '2026-05-01 08:00', updatedAt: '2026-05-01 08:00' },
    { id: 'APT-013', patientId: 'RAD-P005', patientName: '周玉芬', patientInitials: '周玉', gender: '女', age: 52, idCard: '3101051973021XXXXX', phone: '13800138005', examItemId: 'EI-RF-001', examItemName: '上消化道造影', modality: '胃肠造影', bodyPart: '腹部', examDate: formatDate(new Date(today.getTime() + 86400000)), examTime: '15:00', deviceId: 'DEV-RF-01', deviceName: '胃肠造影（岛津Flexavision）', roomId: 'ROOM-RF1', roomName: '造影室1', referringDoctorId: 'R001', referringDoctorName: '李明辉', clinicalDiagnosis: '消化不良待查', notes: '', status: 'cancelled', priority: 'normal', cancelReason: 'reschedule', createdAt: '2026-04-29 10:00', updatedAt: '2026-05-01 09:00' },
  ]
}

// ==================== 模拟设备规则 ====================
const generateDefaultRules = (): AppointmentRules[] => {
  return [
    { deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）', maxDailyAppointments: 60, maxPerTimeSlot: 4, minAdvanceDays: 0, maxAdvanceDays: 30, noShowPenalty: 50, enabled: true },
    { deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）', maxDailyAppointments: 50, maxPerTimeSlot: 4, minAdvanceDays: 0, maxAdvanceDays: 30, noShowPenalty: 50, enabled: true },
    { deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）', maxDailyAppointments: 35, maxPerTimeSlot: 2, minAdvanceDays: 0, maxAdvanceDays: 30, noShowPenalty: 80, enabled: true },
    { deviceId: 'DEV-MR-02', deviceName: 'MR-2（飞利浦Ingenia）', maxDailyAppointments: 35, maxPerTimeSlot: 2, minAdvanceDays: 0, maxAdvanceDays: 30, noShowPenalty: 80, enabled: false },
    { deviceId: 'DEV-DR-01', deviceName: 'DR-1（飞利浦DigitalDiagnost）', maxDailyAppointments: 120, maxPerTimeSlot: 8, minAdvanceDays: 0, maxAdvanceDays: 30, noShowPenalty: 20, enabled: true },
    { deviceId: 'DEV-DR-02', deviceName: 'DR-2（GE Optima）', maxDailyAppointments: 100, maxPerTimeSlot: 8, minAdvanceDays: 0, maxAdvanceDays: 30, noShowPenalty: 20, enabled: true },
    { deviceId: 'DEV-DSA-01', deviceName: 'DSA-1（飞利浦Azurion 7）', maxDailyAppointments: 10, maxPerTimeSlot: 1, minAdvanceDays: 1, maxAdvanceDays: 14, noShowPenalty: 200, enabled: true },
    { deviceId: 'DEV-MG-01', deviceName: '乳腺钼靶（GE Senographe）', maxDailyAppointments: 25, maxPerTimeSlot: 2, minAdvanceDays: 0, maxAdvanceDays: 30, noShowPenalty: 30, enabled: true },
    { deviceId: 'DEV-RF-01', deviceName: '胃肠造影（岛津Flexavision）', maxDailyAppointments: 20, maxPerTimeSlot: 2, minAdvanceDays: 0, maxAdvanceDays: 14, noShowPenalty: 30, enabled: true },
  ]
}

// ==================== 主组件 ====================
export default function AppointmentPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
    return monday
  })
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedDevice, setSelectedDevice] = useState<string>('all')
  const [listFilterDate, setListFilterDate] = useState<string>('')
  const [listFilterStatus, setListFilterStatus] = useState<string>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>(generateMockAppointments())
  const [rules, setRules] = useState<AppointmentRules[]>(generateDefaultRules())

  // 右侧面板
  const [showForm, setShowForm] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showBatchImport, setShowBatchImport] = useState(false)

  // 预约详情/修改
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // 新建预约表单状态
  const [formData, setFormData] = useState({
    patientName: '', gender: '男', age: '', idCard: '', phone: '',
    examType: 'CT', examItemId: '', examItemName: '', bodyPart: '',
    examDate: formatDate(new Date()), examTime: '08:00',
    deviceId: '', deviceName: '', roomId: '', roomName: '',
    referringDoctorId: '', referringDoctorName: '',
    clinicalDiagnosis: '', notes: '', priority: 'normal'
  })

  const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart])

  // 过滤后的设备
  const filteredDevices = useMemo(() => {
    if (selectedDevice === 'all') return initialModalityDevices.filter(d => d.status !== '维护中')
    return initialModalityDevices.filter(d => d.id === selectedDevice && d.status !== '维护中')
  }, [selectedDevice])

  // 按日期和设备分组的预约
  const appointmentsByDateDevice = useMemo(() => {
    const map: Record<string, Appointment[]> = {}
    appointments.forEach(apt => {
      const key = `${apt.examDate}::${apt.deviceId}`
      if (!map[key]) map[key] = []
      map[key].push(apt)
    })
    return map
  }, [appointments])

  // 今日统计
  const todayStats = useMemo(() => {
    const today = formatDate(new Date())
    const todayApts = appointments.filter(a => a.examDate === today)
    return {
      total: todayApts.length,
      pending: todayApts.filter(a => a.status === 'pending').length,
      confirmed: todayApts.filter(a => a.status === 'confirmed').length,
      checkedIn: todayApts.filter(a => a.status === 'checked-in').length,
      noShow: todayApts.filter(a => a.status === 'no-show').length,
      cancelled: todayApts.filter(a => a.status === 'cancelled').length,
    }
  }, [appointments])

  // 列表视图过滤
  const filteredListAppointments = useMemo(() => {
    let list = [...appointments]
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase()
      list = list.filter(a =>
        a.patientName.toLowerCase().includes(kw) ||
        a.id.includes(kw) ||
        a.phone.includes(kw) ||
        a.examItemName.includes(kw)
      )
    }
    if (listFilterDate) {
      list = list.filter(a => a.examDate === listFilterDate)
    }
    if (listFilterStatus !== 'all') {
      list = list.filter(a => a.status === listFilterStatus)
    }
    if (selectedDevice !== 'all') {
      list = list.filter(a => a.deviceId === selectedDevice)
    }
    return list.sort((a, b) => {
      const dateCmp = a.examDate.localeCompare(b.examDate)
      if (dateCmp !== 0) return dateCmp
      return a.examTime.localeCompare(b.examTime)
    })
  }, [appointments, searchKeyword, listFilterDate, listFilterStatus, selectedDevice])

  // 导航函数
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
    const today = new Date()
    const day = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
    setCurrentWeekStart(monday)
  }

  // 统计某日某设备的预约数
  const getDeviceDayStats = (date: Date, deviceId: string) => {
    const dateStr = formatDate(date)
    const key = `${dateStr}::${deviceId}`
    const dayApts = appointmentsByDateDevice[key] || []
    const total = dayApts.length
    const rule = rules.find(r => r.deviceId === deviceId)
    const capacity = rule?.maxDailyAppointments || 60
    const occupancy = capacity > 0 ? Math.round((total / capacity) * 100) : 0
    return { total, occupancy }
  }

  // 新建预约提交
  const handleCreateAppointment = () => {
    if (!formData.patientName || !formData.examItemName || !formData.deviceId) {
      alert('请填写必填字段：患者姓名、检查项目、设备')
      return
    }
    const device = initialModalityDevices.find(d => d.id === formData.deviceId)
    const newApt: Appointment = {
      id: `APT-${String(appointments.length + 1).padStart(3, '0')}`,
      patientId: `RAD-P${String(appointments.length + 1).padStart(3, '0')}`,
      patientName: formData.patientName,
      patientInitials: getNameInitials(formData.patientName),
      gender: formData.gender,
      age: parseInt(formData.age) || 0,
      idCard: formData.idCard,
      phone: formData.phone,
      examItemId: formData.examItemId,
      examItemName: formData.examItemName,
      modality: formData.examType,
      bodyPart: formData.bodyPart,
      examDate: formData.examDate,
      examTime: formData.examTime,
      deviceId: formData.deviceId,
      deviceName: formData.deviceName || device?.name || '',
      roomId: device?.id.replace('DEV', 'ROOM').replace('-01', '-01') || '',
      roomName: device?.location || '',
      referringDoctorId: formData.referringDoctorId,
      referringDoctorName: formData.referringDoctorName,
      clinicalDiagnosis: formData.clinicalDiagnosis,
      notes: formData.notes,
      status: 'pending',
      priority: formData.priority as 'normal' | 'urgent' | 'critical',
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
    }
    setAppointments(prev => [...prev, newApt])
    setShowForm(false)
    setFormData({
      patientName: '', gender: '男', age: '', idCard: '', phone: '',
      examType: 'CT', examItemId: '', examItemName: '', bodyPart: '',
      examDate: formatDate(new Date()), examTime: '08:00',
      deviceId: '', deviceName: '', roomId: '', roomName: '',
      referringDoctorId: '', referringDoctorName: '',
      clinicalDiagnosis: '', notes: '', priority: 'normal'
    })
  }

  // 取消预约
  const handleCancelAppointment = () => {
    if (!selectedAppointment || !cancelReason) {
      alert('请选择取消原因')
      return
    }
    setAppointments(prev =>
      prev.map(a => a.id === selectedAppointment.id
        ? { ...a, status: 'cancelled', cancelReason, updatedAt: new Date().toLocaleString('zh-CN') }
        : a
      )
    )
    setShowCancelModal(false)
    setCancelReason('')
    setSelectedAppointment(null)
  }

  // 修改预约
  const handleModifyAppointment = (apt: Appointment, newDate: string, newTime: string, newDeviceId: string) => {
    const device = initialModalityDevices.find(d => d.id === newDeviceId)
    setAppointments(prev =>
      prev.map(a => a.id === apt.id
        ? {
          ...a,
          examDate: newDate,
          examTime: newTime,
          deviceId: newDeviceId,
          deviceName: device?.name || a.deviceName,
          roomId: device?.id.replace('DEV', 'ROOM') || a.roomId,
          roomName: device?.location || a.roomName,
          updatedAt: new Date().toLocaleString('zh-CN')
        }
        : a
      )
    )
    setShowDetailModal(false)
    setSelectedAppointment(null)
  }

  // 打开详情
  const openDetail = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setShowDetailModal(true)
  }

  // 设备切换时更新设备名
  const handleDeviceChange = (deviceId: string) => {
    const device = initialModalityDevices.find(d => d.id === deviceId)
    setFormData(prev => ({
      ...prev,
      deviceId,
      deviceName: device?.name || '',
      roomId: device?.id.replace('DEV', 'ROOM') || '',
      roomName: device?.location || ''
    }))
  }

  // 设备ID → 模拟时段占用
  const getSlotStatus = (deviceId: string, date: string, time: string): { available: boolean; booked: number; max: number } => {
    const rule = rules.find(r => r.deviceId === deviceId)
    const max = rule?.maxPerTimeSlot || 4
    const key = `${date}::${deviceId}`
    const dayApts = appointmentsByDateDevice[key] || []
    const booked = dayApts.filter(a => a.examTime === time && a.status !== 'cancelled').length
    return { available: booked < max, booked, max }
  }

  // 颜色定义
  const primaryBlue = '#1e3a5f'
  const lightBlue = '#e8f0f8'
  const borderGray = '#e2e8f0'
  const textGray = '#64748b'
  const whiteBg = '#ffffff'

  // ====== 渲染 ======
  return (
    <div style={{ padding: 0, minHeight: '100vh', background: '#f0f4f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* ====== 顶部标题栏 ====== */}
      <div style={{ background: whiteBg, borderBottom: `1px solid ${borderGray}`, padding: '16px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: 1600, margin: '0 auto' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: primaryBlue, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarClock size={22} style={{ color: '#d97706' }} />
              检查预约管理
            </h1>
            <p style={{ fontSize: 12, color: textGray, margin: 0 }}>
              预约排程 · 设备分配 · 时间段管理 · 冲突检测
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => { setShowBatchImport(true) }}
              style={{ padding: '7px 14px', background: whiteBg, color: primaryBlue, border: `1px solid ${borderGray}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Upload size={13} /> 批量导入
            </button>
            <button
              onClick={() => { setShowRules(!showRules); setShowForm(false) }}
              style={{ padding: '7px 14px', background: showRules ? primaryBlue : whiteBg, color: showRules ? '#fff' : primaryBlue, border: `1px solid ${primaryBlue}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Settings size={13} /> 预约规则
            </button>
            <button
              onClick={() => { setShowForm(!showForm); setShowRules(false) }}
              style={{ padding: '7px 16px', background: showForm ? '#d97706' : '#d97706', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 4px rgba(217,119,6,0.3)' }}>
              <Plus size={14} /> {showForm ? '取消新建' : '新建预约'}
            </button>
          </div>
        </div>
      </div>

      {/* ====== 主体内容 ====== */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 24px' }}>

        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: '今日预约', value: todayStats.total, icon: CalendarClock, color: '#1e3a5f', bg: '#e8f0f8' },
            { label: '待确认', value: todayStats.pending, icon: Clock, color: '#ca8a04', bg: '#fef9c3' },
            { label: '已确认', value: todayStats.confirmed, icon: CheckCircle, color: '#059669', bg: '#d1fae5' },
            { label: '违约', value: todayStats.noShow, icon: XCircle, color: '#dc2626', bg: '#fee2e2' },
          ].map((stat, i) => (
            <div key={i} style={{ background: whiteBg, borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${borderGray}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: textGray, marginTop: 3 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* ====== 左侧面板 (60%) ====== */}
          <div style={{ flex: '0 0 60%' }}>

            {/* 顶部操作栏 */}
            <div style={{ background: whiteBg, borderRadius: 10, padding: '12px 16px', marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${borderGray}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* 日期导航 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={goToPrevWeek} style={{ padding: '5px 8px', background: lightBlue, border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={16} style={{ color: primaryBlue }} />
                  </button>
                  <span style={{ fontSize: 14, fontWeight: 700, color: primaryBlue, minWidth: 120, textAlign: 'center' }}>
                    {currentWeekStart.getMonth() + 1}月{currentWeekStart.getDate()}日 — {new Date(currentWeekStart.getTime() + 6 * 86400000).getMonth() + 1}月{new Date(currentWeekStart.getTime() + 6 * 86400000).getDate()}日
                  </span>
                  <button onClick={goToNextWeek} style={{ padding: '5px 8px', background: lightBlue, border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ChevronRight size={16} style={{ color: primaryBlue }} />
                  </button>
                  <button onClick={goToToday} style={{ padding: '5px 10px', background: primaryBlue, color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    今天
                  </button>
                </div>

                {/* 视图切换 */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 2 }}>
                  <button
                    onClick={() => setViewMode('calendar')}
                    style={{ padding: '4px 12px', background: viewMode === 'calendar' ? whiteBg : 'transparent', color: viewMode === 'calendar' ? primaryBlue : textGray, border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, boxShadow: viewMode === 'calendar' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
                    <CalendarDays size={13} /> 日历
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{ padding: '4px 12px', background: viewMode === 'list' ? whiteBg : 'transparent', color: viewMode === 'list' ? primaryBlue : textGray, border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
                    <List size={13} /> 列表
                  </button>
                </div>

                {/* 设备筛选 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Filter size={14} style={{ color: textGray }} />
                  <select
                    value={selectedDevice}
                    onChange={e => setSelectedDevice(e.target.value)}
                    style={{ padding: '5px 10px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 12, color: primaryBlue, background: whiteBg, cursor: 'pointer', outline: 'none' }}>
                    <option value="all">全部设备</option>
                    {initialModalityDevices.filter(d => d.status !== '维护中').map(d => (
                      <option key={d.id} value={d.id}>{d.name.split('（')[0]} · {d.modality}</option>
                    ))}
                  </select>
                </div>

                {/* 搜索 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: `1px solid ${borderGray}`, borderRadius: 6, padding: '4px 10px' }}>
                  <Search size={13} style={{ color: textGray }} />
                  <input
                    type="text"
                    placeholder="搜索患者/电话/项目…"
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none', color: primaryBlue, width: 140 }}
                  />
                </div>
              </div>
            </div>

            {/* ====== 日历视图 ====== */}
            {viewMode === 'calendar' && (
              <div style={{ background: whiteBg, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${borderGray}`, overflow: 'hidden' }}>
                {/* 7天表头 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: lightBlue, borderBottom: `1px solid ${borderGray}` }}>
                  {weekDates.map((d, i) => {
                    const isToday = formatDate(d) === formatDate(new Date())
                    return (
                      <div key={i} style={{
                        padding: '8px 4px', textAlign: 'center',
                        borderRight: i < 6 ? `1px solid ${borderGray}` : 'none',
                        background: isToday ? '#dbeafe' : 'transparent'
                      }}>
                        <div style={{ fontSize: 10, color: textGray, fontWeight: 600 }}>{formatDateCht(d)}</div>
                        {isToday && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', margin: '2px auto 0' }} />}
                      </div>
                    )
                  })}
                </div>

                {/* 设备行 */}
                {filteredDevices.map((device, di) => (
                  <div key={device.id} style={{ borderBottom: di < filteredDevices.length - 1 ? `1px solid ${borderGray}` : 'none' }}>
                    {/* 设备标题 */}
                    <div style={{ padding: '6px 10px', background: '#f8fafc', borderBottom: `1px solid ${borderGray}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Monitor size={13} style={{ color: primaryBlue }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: primaryBlue }}>{device.name.split('（')[0]}</span>
                        <span style={{ fontSize: 10, color: textGray }}>{device.modality}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10, color: textGray }}>
                          {getDeviceDayStats(new Date(), device.id).total} / {rules.find(r => r.deviceId === device.id)?.maxDailyAppointments || 60}
                        </span>
                        <div style={{ width: 50, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${getDeviceDayStats(new Date(), device.id).occupancy}%`, background: '#3b82f6', borderRadius: 2 }} />
                        </div>
                      </div>
                    </div>
                    {/* 7天格子 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                      {weekDates.map((d, di) => {
                        const dateStr = formatDate(d)
                        const key = `${dateStr}::${device.id}`
                        const dayApts = appointmentsByDateDevice[key] || []
                        const isToday = dateStr === formatDate(new Date())
                        return (
                          <div key={di} style={{
                            minHeight: 90, padding: 4,
                            borderRight: di < 6 ? `1px solid ${borderGray}` : 'none',
                            background: isToday ? '#f8f9ff' : 'transparent',
                          }}>
                            {dayApts.filter(a => a.status !== 'cancelled').map(apt => {
                              const sc = STATUS_CONFIG[apt.status]
                              const pc = PRIORITY_CONFIG[apt.priority]
                              return (
                                <div
                                  key={apt.id}
                                  onClick={() => openDetail(apt)}
                                  style={{
                                    marginBottom: 3, padding: '3px 5px', borderRadius: 4, fontSize: 10,
                                    background: sc.bg, borderLeft: `3px solid ${sc.color}`,
                                    cursor: 'pointer', overflow: 'hidden',
                                    transition: 'box-shadow 0.15s',
                                  }}
                                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.15)'}
                                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
                                >
                                  <div style={{ fontWeight: 700, color: primaryBlue, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {apt.patientInitials || apt.patientName.slice(0, 2)}
                                  </div>
                                  <div style={{ color: '#475569', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {apt.examItemName.split('平扫')[0].split('MR')[0].split('CT')[0].split('DR')[0]}
                                  </div>
                                  <div style={{ color: textGray, fontSize: 9 }}>{apt.examTime}</div>
                                </div>
                              )
                            })}
                            {dayApts.filter(a => a.status !== 'cancelled').length === 0 && (
                              <div style={{ color: '#cbd5e1', fontSize: 10, textAlign: 'center', paddingTop: 20 }}>—</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* 日历底部说明 */}
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderTop: `1px solid ${borderGray}`, display: 'flex', gap: 16, alignItems: 'center' }}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: v.bg, border: `1px solid ${v.color}` }} />
                      <span style={{ fontSize: 10, color: textGray }}>{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ====== 列表视图 ====== */}
            {viewMode === 'list' && (
              <div style={{ background: whiteBg, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${borderGray}`, overflow: 'hidden' }}>
                {/* 列表筛选栏 */}
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: `1px solid ${borderGray}`, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: textGray }}>日期:</span>
                    <input
                      type="date"
                      value={listFilterDate}
                      onChange={e => setListFilterDate(e.target.value)}
                      style={{ padding: '4px 8px', border: `1px solid ${borderGray}`, borderRadius: 5, fontSize: 11, outline: 'none', color: primaryBlue }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: textGray }}>状态:</span>
                    <select
                      value={listFilterStatus}
                      onChange={e => setListFilterStatus(e.target.value)}
                      style={{ padding: '4px 8px', border: `1px solid ${borderGray}`, borderRadius: 5, fontSize: 11, outline: 'none', color: primaryBlue, background: whiteBg }}>
                      <option value="all">全部</option>
                      <option value="pending">待确认</option>
                      <option value="confirmed">已确认</option>
                      <option value="checked-in">已到检</option>
                      <option value="cancelled">已取消</option>
                      <option value="no-show">违约</option>
                    </select>
                  </div>
                  {listFilterDate || listFilterStatus !== 'all' ? (
                    <button
                      onClick={() => { setListFilterDate(''); setListFilterStatus('all') }}
                      style={{ padding: '3px 8px', background: 'transparent', color: textGray, border: 'none', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <X size={11} /> 清除筛选
                    </button>
                  ) : null}
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: textGray }}>
                    共 {filteredListAppointments.length} 条记录
                  </span>
                </div>

                {/* 表格 */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 900 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${borderGray}` }}>
                        {['预约ID', '患者姓名', '联系方式', '检查项目', '设备', '预约日期', '时段', '申请医生', '状态', '操作'].map(h => (
                          <th key={h} style={{ padding: '9px 10px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: textGray, fontSize: 12 }}>
                            <CalendarClock size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                            暂无预约记录
                          </td>
                        </tr>
                      ) : filteredListAppointments.map(apt => {
                        const sc = STATUS_CONFIG[apt.status]
                        return (
                          <tr key={apt.id}
                            style={{ borderBottom: `1px solid ${borderGray}` }}
                            onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff'}
                            onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fff'}
                          >
                            <td style={{ padding: '8px 10px', fontWeight: 600, color: primaryBlue, fontSize: 11 }}>{apt.id}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <div style={{ fontWeight: 600, color: primaryBlue, fontSize: 12 }}>{apt.patientName}</div>
                              <div style={{ fontSize: 10, color: textGray }}>{apt.gender} / {apt.age}岁</div>
                            </td>
                            <td style={{ padding: '8px 10px', fontSize: 11, color: '#475569' }}>{apt.phone}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <div style={{ fontSize: 11, color: '#334155' }}>{apt.examItemName}</div>
                              <div style={{ fontSize: 10, color: textGray }}>{apt.modality} · {apt.bodyPart}</div>
                            </td>
                            <td style={{ padding: '8px 10px', fontSize: 11, color: '#475569' }}>{apt.deviceName?.split('（')[0] || '-'}</td>
                            <td style={{ padding: '8px 10px', fontSize: 11, color: '#475569' }}>{apt.examDate}</td>
                            <td style={{ padding: '8px 10px', fontSize: 11, color: '#475569' }}>{apt.examTime}</td>
                            <td style={{ padding: '8px 10px', fontSize: 11, color: '#475569' }}>{apt.referringDoctorName || '-'}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.color }}>
                                {sc.label}
                              </span>
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                  onClick={() => openDetail(apt)}
                                  style={{ padding: '3px 8px', background: lightBlue, color: primaryBlue, border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <Eye size={10} /> 详情
                                </button>
                                {apt.status !== 'cancelled' && apt.status !== 'no-show' && (
                                  <button
                                    onClick={() => { setSelectedAppointment(apt); setShowCancelModal(true) }}
                                    style={{ padding: '3px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <XCircle size={10} /> 取消
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
              </div>
            )}
          </div>

          {/* ====== 右侧面板 (40%) ====== */}
          <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* ====== 新建预约表单 ====== */}
            {showForm && (
              <div style={{ background: whiteBg, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: `1px solid ${borderGray}`, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#1e3a5f', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}>
                    <Plus size={15} /> 新建预约
                  </div>
                  <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

                  {/* 患者信息 */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: primaryBlue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={12} /> 患者信息
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input
                        placeholder="姓名 *"
                        value={formData.patientName}
                        onChange={e => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                        style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, width: '100%', boxSizing: 'border-box' }}
                      />
                      <select
                        value={formData.gender}
                        onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                        style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, background: whiteBg }}>
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                      <input
                        placeholder="年龄"
                        type="number"
                        value={formData.age}
                        onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                        style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, width: '100%', boxSizing: 'border-box' }}
                      />
                      <input
                        placeholder="联系电话"
                        value={formData.phone}
                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                    <input
                      placeholder="身份证号"
                      value={formData.idCard}
                      onChange={e => setFormData(prev => ({ ...prev, idCard: e.target.value }))}
                      style={{ marginTop: 6, padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* 检查信息 */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: primaryBlue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Scan size={12} /> 检查信息
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <select
                        value={formData.examType}
                        onChange={e => {
                          const t = e.target.value
                          setFormData(prev => ({ ...prev, examType: t, examItemId: '', examItemName: '', bodyPart: '', deviceId: '', deviceName: '' }))
                        }}
                        style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, background: whiteBg, width: '100%' }}>
                        <option value="CT">CT</option>
                        <option value="MR">MR</option>
                        <option value="DR">DR</option>
                        <option value="DSA">DSA</option>
                        <option value="乳腺钼靶">乳腺钼靶</option>
                        <option value="胃肠造影">胃肠造影</option>
                      </select>
                      <select
                        value={formData.examItemId}
                        onChange={e => {
                          const item = initialExamItems.find(i => i.id === e.target.value)
                          setFormData(prev => ({ ...prev, examItemId: e.target.value, examItemName: item?.name || '', bodyPart: item?.bodyPart || '' }))
                        }}
                        style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, background: whiteBg, width: '100%' }}>
                        <option value="">选择检查项目 *</option>
                        {initialExamItems.filter(i => i.modality === formData.examType).map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                      <input
                        placeholder="检查部位"
                        value={formData.bodyPart}
                        onChange={e => setFormData(prev => ({ ...prev, bodyPart: e.target.value }))}
                        style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, width: '100%', boxSizing: 'border-box' }}
                      />
                      <select
                        value={formData.priority}
                        onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, background: whiteBg, width: '100%' }}>
                        <option value="normal">普通</option>
                        <option value="urgent">紧急</option>
                        <option value="critical">危重</option>
                      </select>
                    </div>
                  </div>

                  {/* 日期/设备/时段 */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: primaryBlue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarDays size={12} /> 预约时间
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input
                        type="date"
                        value={formData.examDate}
                        onChange={e => setFormData(prev => ({ ...prev, examDate: e.target.value }))}
                        style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, width: '100%', boxSizing: 'border-box' }}
                      />
                      <select
                        value={formData.deviceId}
                        onChange={e => handleDeviceChange(e.target.value)}
                        style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, background: whiteBg, width: '100%' }}>
                        <option value="">选择设备 *</option>
                        {initialModalityDevices.filter(d => d.modality === formData.examType && d.status !== '维护中').map(d => (
                          <option key={d.id} value={d.id}>{d.name.split('（')[0]}</option>
                        ))}
                      </select>
                    </div>
                    {/* 时段选择 */}
                    {formData.deviceId && formData.examDate && (
                      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                        {timeSlots.map(slot => {
                          const slotStatus = getSlotStatus(formData.deviceId, formData.examDate, slot)
                          const isSelected = formData.examTime === slot
                          return (
                            <button
                              key={slot}
                              onClick={() => {
                                if (slotStatus.available || isSelected) {
                                  setFormData(prev => ({ ...prev, examTime: slot }))
                                }
                              }}
                              disabled={!slotStatus.available && !isSelected}
                              style={{
                                padding: '4px 2px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                                border: `1px solid ${isSelected ? primaryBlue : slotStatus.available ? borderGray : '#f1f5f9'}`,
                                background: isSelected ? primaryBlue : slotStatus.available ? whiteBg : '#f8fafc',
                                color: isSelected ? '#fff' : slotStatus.available ? primaryBlue : '#cbd5e1',
                                cursor: slotStatus.available || isSelected ? 'pointer' : 'not-allowed',
                                textAlign: 'center',
                              }}>
                              {slot}
                              {!slotStatus.available && !isSelected && <div style={{ fontSize: 8, color: '#94a3b8' }}>已满</div>}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {/* 时段占用提示 */}
                    {formData.deviceId && formData.examDate && (
                      <div style={{ marginTop: 6, fontSize: 10, color: textGray }}>
                        已选时段: <span style={{ fontWeight: 700, color: primaryBlue }}>{formData.examTime}</span>
                        {formData.deviceId && (() => {
                          const rule = rules.find(r => r.deviceId === formData.deviceId)
                          return rule ? ` | ${rule.deviceName.split('（')[0]} 每天最大${rule.maxDailyAppointments}人次，每时段最大${rule.maxPerTimeSlot}人次` : ''
                        })()}
                      </div>
                    )}
                  </div>

                  {/* 申请医生 */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: primaryBlue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Stethoscope size={12} /> 申请医生
                    </div>
                    <select
                      value={formData.referringDoctorId}
                      onChange={e => {
                        const doc = initialUsers.find(u => u.id === e.target.value)
                        setFormData(prev => ({ ...prev, referringDoctorId: e.target.value, referringDoctorName: doc?.name || '' }))
                      }}
                      style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, background: whiteBg, width: '100%', boxSizing: 'border-box' }}>
                      <option value="">选择申请医生</option>
                      {initialUsers.filter(u => ['radiologist', 'technologist'].includes(u.role)).map(u => (
                        <option key={u.id} value={u.id}>{u.name} - {u.title} ({u.department})</option>
                      ))}
                    </select>
                  </div>

                  {/* 临床诊断 */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: primaryBlue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertCircle size={12} /> 临床诊断
                    </div>
                    <textarea
                      placeholder="请输入临床诊断信息"
                      value={formData.clinicalDiagnosis}
                      onChange={e => setFormData(prev => ({ ...prev, clinicalDiagnosis: e.target.value }))}
                      rows={2}
                      style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, width: '100%', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>

                  {/* 备注 */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: primaryBlue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Bell size={12} /> 预约备注
                    </div>
                    <input
                      placeholder="备注信息（如：空腹、需留置针等）"
                      value={formData.notes}
                      onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      style={{ padding: '6px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue, width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* 提交 */}
                  <button
                    onClick={handleCreateAppointment}
                    style={{ padding: '9px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 4px rgba(217,119,6,0.3)' }}>
                    <CheckCircle size={14} /> 确认预约
                  </button>
                </div>
              </div>
            )}

            {/* ====== 预约规则设置 ====== */}
            {showRules && (
              <div style={{ background: whiteBg, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: `1px solid ${borderGray}`, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: primaryBlue, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}>
                    <Settings size={15} /> 预约规则设置
                  </div>
                  <button onClick={() => setShowRules(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 600, overflowY: 'auto' }}>
                  {/* 全局说明 */}
                  <div style={{ background: '#fef9c3', borderRadius: 6, padding: '8px 10px', fontSize: 11, color: '#92400e', border: '1px solid #fde68a' }}>
                    <AlertTriangle size={12} style={{ display: 'inline', marginRight: 4 }} />
                    预约规则针对每台设备独立设置。修改后即时生效。
                  </div>
                  {/* 搜索 */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      placeholder="搜索设备…"
                      onChange={e => {
                        // 简单实现，实际可用state过滤
                      }}
                      style={{ flex: 1, padding: '5px 8px', border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, outline: 'none', color: primaryBlue }}
                    />
                  </div>
                  {rules.map(rule => {
                    const device = initialModalityDevices.find(d => d.id === rule.deviceId)
                    return (
                      <div key={rule.deviceId} style={{ background: '#f8fafc', borderRadius: 8, padding: 10, border: `1px solid ${borderGray}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Monitor size={12} style={{ color: primaryBlue }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: primaryBlue }}>{rule.deviceName.split('（')[0]}</span>
                            <span style={{ fontSize: 10, color: textGray }}>{device?.modality || ''}</span>
                          </div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={e => {
                                setRules(prev => prev.map(r => r.deviceId === rule.deviceId ? { ...r, enabled: e.target.checked } : r))
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: 10, color: rule.enabled ? '#059669' : '#94a3b8' }}>{rule.enabled ? '启用' : '停用'}</span>
                          </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <div>
                            <label style={{ fontSize: 10, color: textGray, display: 'block', marginBottom: 2 }}>每天最大预约量</label>
                            <input
                              type="number"
                              value={rule.maxDailyAppointments}
                              disabled={!rule.enabled}
                              onChange={e => setRules(prev => prev.map(r => r.deviceId === rule.deviceId ? { ...r, maxDailyAppointments: parseInt(e.target.value) || 0 } : r))}
                              style={{ width: '100%', padding: '4px 6px', border: `1px solid ${borderGray}`, borderRadius: 4, fontSize: 11, outline: 'none', color: primaryBlue, background: rule.enabled ? whiteBg : '#f1f5f9', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: textGray, display: 'block', marginBottom: 2 }}>每时段最大检查数</label>
                            <input
                              type="number"
                              value={rule.maxPerTimeSlot}
                              disabled={!rule.enabled}
                              onChange={e => setRules(prev => prev.map(r => r.deviceId === rule.deviceId ? { ...r, maxPerTimeSlot: parseInt(e.target.value) || 0 } : r))}
                              style={{ width: '100%', padding: '4px 6px', border: `1px solid ${borderGray}`, borderRadius: 4, fontSize: 11, outline: 'none', color: primaryBlue, background: rule.enabled ? whiteBg : '#f1f5f9', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: textGray, display: 'block', marginBottom: 2 }}>最早提前天数</label>
                            <input
                              type="number"
                              value={rule.minAdvanceDays}
                              disabled={!rule.enabled}
                              onChange={e => setRules(prev => prev.map(r => r.deviceId === rule.deviceId ? { ...r, minAdvanceDays: parseInt(e.target.value) || 0 } : r))}
                              style={{ width: '100%', padding: '4px 6px', border: `1px solid ${borderGray}`, borderRadius: 4, fontSize: 11, outline: 'none', color: primaryBlue, background: rule.enabled ? whiteBg : '#f1f5f9', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: textGray, display: 'block', marginBottom: 2 }}>最晚提前天数</label>
                            <input
                              type="number"
                              value={rule.maxAdvanceDays}
                              disabled={!rule.enabled}
                              onChange={e => setRules(prev => prev.map(r => r.deviceId === rule.deviceId ? { ...r, maxAdvanceDays: parseInt(e.target.value) || 0 } : r))}
                              style={{ width: '100%', padding: '4px 6px', border: `1px solid ${borderGray}`, borderRadius: 4, fontSize: 11, outline: 'none', color: primaryBlue, background: rule.enabled ? whiteBg : '#f1f5f9', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: 10, color: textGray, display: 'block', marginBottom: 2 }}>违约扣款 (元/次)</label>
                            <input
                              type="number"
                              value={rule.noShowPenalty}
                              disabled={!rule.enabled}
                              onChange={e => setRules(prev => prev.map(r => r.deviceId === rule.deviceId ? { ...r, noShowPenalty: parseInt(e.target.value) || 0 } : r))}
                              style={{ width: '100%', padding: '4px 6px', border: `1px solid ${borderGray}`, borderRadius: 4, fontSize: 11, outline: 'none', color: primaryBlue, background: rule.enabled ? whiteBg : '#f1f5f9', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <button
                    onClick={() => setShowRules(false)}
                    style={{ padding: '8px', background: primaryBlue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Save size={13} /> 保存规则
                  </button>
                </div>
              </div>
            )}

            {/* ====== 批量导入 ====== */}
            {showBatchImport && (
              <div style={{ background: whiteBg, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: `1px solid ${borderGray}`, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: primaryBlue, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}>
                    <Upload size={15} /> 批量导入预约
                  </div>
                  <button onClick={() => setShowBatchImport(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: 20, textAlign: 'center' }}>
                  <div style={{ border: `2px dashed ${borderGray}`, borderRadius: 10, padding: '30px 20px', marginBottom: 16, cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#3b82f6'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = borderGray}
                  >
                    <Upload size={32} style={{ color: textGray, margin: '0 auto 10px', display: 'block' }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: primaryBlue, marginBottom: 4 }}>点击上传Excel文件</div>
                    <div style={{ fontSize: 11, color: textGray }}>支持 .xlsx, .xls 格式，每行包含：姓名/性别/年龄/检查项目/设备/日期/时段/电话</div>
                    <button style={{ marginTop: 12, padding: '6px 16px', background: lightBlue, color: primaryBlue, border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }} onClick={() => alert('选择文件功能开发中，请使用文件上传组件')}>
                      选择文件
                    </button>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: 6, padding: '10px 12px', textAlign: 'left', border: `1px solid ${borderGray}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: primaryBlue, marginBottom: 6 }}>导入说明</div>
                    <div style={{ fontSize: 10, color: textGray, lineHeight: 1.8 }}>
                      1. 请先下载模板文件，按格式填写预约信息<br />
                      2. 姓名、设备、日期、时段为必填项<br />
                      3. 检查项目需与系统现有项目匹配<br />
                      4. 导入前请确保设备在该时段有可用名额<br />
                      5. 重复预约将自动跳过并记录在错误日志中
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button style={{ padding: '6px 14px', background: whiteBg, color: primaryBlue, border: `1px solid ${borderGray}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => alert('下载模板功能开发中')}>
                      <Download size={12} /> 下载模板
                    </button>
                    <button
                      onClick={() => setShowBatchImport(false)}
                      style={{ padding: '6px 14px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={12} /> 开始导入
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ====== 今日概览卡片（非表单/规则时显示） ====== */}
            {!showForm && !showRules && !showBatchImport && (
              <div style={{ background: whiteBg, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: `1px solid ${borderGray}`, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: primaryBlue, color: '#fff' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarClock size={15} /> 今日概览
                  </div>
                </div>
                <div style={{ padding: 12 }}>
                  {/* 设备占用 */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: primaryBlue, marginBottom: 8 }}>各设备今日预约</div>
                  {filteredDevices.map(device => {
                    const stats = getDeviceDayStats(new Date(), device.id)
                    const rule = rules.find(r => r.deviceId === device.id)
                    return (
                      <div key={device.id} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>{device.name.split('（')[0]}</span>
                          <span style={{ fontSize: 10, color: textGray }}>{stats.total} / {rule?.maxDailyAppointments || 60} 人次</span>
                        </div>
                        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${stats.occupancy}%`,
                            background: stats.occupancy > 85 ? '#dc2626' : stats.occupancy > 60 ? '#d97706' : '#3b82f6',
                            borderRadius: 3,
                            transition: 'width 0.3s'
                          }} />
                        </div>
                      </div>
                    )
                  })}
                  {/* 快捷操作 */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: primaryBlue, marginBottom: 8 }}>快捷操作</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {[
                        { label: '新建预约', icon: Plus, action: () => setShowForm(true), color: '#d97706', bg: '#fef3c7' },
                        { label: '批量导入', icon: Upload, action: () => setShowBatchImport(true), color: '#2563eb', bg: '#dbeafe' },
                        { label: '预约规则', icon: Settings, action: () => { setShowRules(true); setShowForm(false) }, color: '#1e3a5f', bg: '#e8f0f8' },
                        { label: '导出数据', icon: Download, action: () => alert('导出功能开发中'), color: '#059669', bg: '#d1fae5' },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={item.action}
                          style={{
                            padding: '8px 6px', background: item.bg, color: item.color,
                            border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                          }}>
                          <item.icon size={15} />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== 预约详情弹窗 ====== */}
      {showDetailModal && selectedAppointment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}
          onClick={() => setShowDetailModal(false)}
        >
          <div style={{ background: whiteBg, borderRadius: 12, width: 520, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: `1px solid ${borderGray}` }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '14px 18px', background: primaryBlue, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px 12px 0 0' }}>
              <div style={{ fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={15} /> 预约详情
              </div>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: 18 }}>
              {/* 基本信息 */}
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 14, border: `1px solid ${borderGray}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: primaryBlue }}>{selectedAppointment.patientName}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: STATUS_CONFIG[selectedAppointment.status].bg, color: STATUS_CONFIG[selectedAppointment.status].color }}>
                      {STATUS_CONFIG[selectedAppointment.status].label}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: PRIORITY_CONFIG[selectedAppointment.priority].bg, color: PRIORITY_CONFIG[selectedAppointment.priority].color }}>
                      {PRIORITY_CONFIG[selectedAppointment.priority].label}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: textGray, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                  <span>{selectedAppointment.gender} / {selectedAppointment.age}岁</span>
                  <span>ID: {selectedAppointment.patientId}</span>
                  <span>预约号: {selectedAppointment.id}</span>
                </div>
              </div>

              {/* 检查信息 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: primaryBlue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Scan size={13} /> 检查信息
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
                  {[
                    ['检查项目', selectedAppointment.examItemName],
                    ['设备类型', selectedAppointment.modality],
                    ['检查部位', selectedAppointment.bodyPart],
                    ['设备', selectedAppointment.deviceName?.split('（')[0]],
                    ['预约日期', selectedAppointment.examDate],
                    ['预约时间', selectedAppointment.examTime],
                    ['检查室', selectedAppointment.roomName],
                    ['申请医生', selectedAppointment.referringDoctorName || '-'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: '#f8fafc', borderRadius: 6, padding: '5px 8px', border: `1px solid ${borderGray}` }}>
                      <div style={{ fontSize: 10, color: textGray }}>{label}</div>
                      <div style={{ fontWeight: 700, color: primaryBlue, marginTop: 1 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 临床诊断 */}
              {selectedAppointment.clinicalDiagnosis && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: primaryBlue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={13} /> 临床诊断
                  </div>
                  <div style={{ background: '#fef9c3', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#92400e', border: '1px solid #fde68a' }}>
                    {selectedAppointment.clinicalDiagnosis}
                  </div>
                </div>
              )}

              {/* 备注 */}
              {selectedAppointment.notes && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: primaryBlue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Bell size={13} /> 备注
                  </div>
                  <div style={{ background: '#f0f7ff', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: primaryBlue, border: '1px solid #bfdbfe' }}>
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}

              {/* 取消原因 */}
              {selectedAppointment.status === 'cancelled' && selectedAppointment.cancelReason && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <XCircle size={13} /> 取消原因
                  </div>
                  <div style={{ background: '#fee2e2', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#991b1b', border: '1px solid #fca5a5' }}>
                    {CANCEL_REASONS.find(r => r.value === selectedAppointment.cancelReason)?.label || selectedAppointment.cancelReason}
                  </div>
                </div>
              )}

              {/* 时间线 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: primaryBlue, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> 记录时间
                </div>
                <div style={{ fontSize: 10, color: textGray }}>
                  <div>创建: {selectedAppointment.createdAt}</div>
                  <div>更新: {selectedAppointment.updatedAt}</div>
                </div>
              </div>

              {/* 操作 */}
              {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'no-show' && (
                <div style={{ display: 'flex', gap: 8, borderTop: `1px solid ${borderGray}`, paddingTop: 14 }}>
                  <button
                    onClick={() => { setShowDetailModal(false); setShowCancelModal(true) }}
                    style={{ flex: 1, padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <XCircle size={13} /> 取消预约
                  </button>
                  <button
                    onClick={() => {
                      // 修改功能：将日期/时间/设备表单值同步到选中预约
                      setFormData(prev => ({
                        ...prev,
                        patientName: selectedAppointment.patientName,
                        gender: selectedAppointment.gender,
                        age: String(selectedAppointment.age),
                        phone: selectedAppointment.phone,
                        idCard: selectedAppointment.idCard,
                        examType: selectedAppointment.modality,
                        examItemName: selectedAppointment.examItemName,
                        bodyPart: selectedAppointment.bodyPart,
                        examDate: selectedAppointment.examDate,
                        examTime: selectedAppointment.examTime,
                        deviceId: selectedAppointment.deviceId,
                        deviceName: selectedAppointment.deviceName,
                        clinicalDiagnosis: selectedAppointment.clinicalDiagnosis,
                        notes: selectedAppointment.notes,
                        priority: selectedAppointment.priority,
                      }))
                      setShowDetailModal(false)
                      setShowForm(true)
                    }}
                    style={{ flex: 1, padding: '8px', background: lightBlue, color: primaryBlue, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Edit2 size={13} /> 修改预约
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== 取消预约弹窗 ====== */}
      {showCancelModal && selectedAppointment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001,
        }}
          onClick={() => { setShowCancelModal(false); setCancelReason('') }}
        >
          <div style={{ background: whiteBg, borderRadius: 12, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: `1px solid ${borderGray}` }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '14px 18px', background: '#dc2626', color: '#fff', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 800 }}>
              <XCircle size={16} /> 取消预约
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: textGray, marginBottom: 4 }}>预约信息</div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: '8px 10px', border: `1px solid ${borderGray}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: primaryBlue }}>{selectedAppointment.patientName}</div>
                  <div style={{ fontSize: 11, color: textGray, marginTop: 2 }}>
                    {selectedAppointment.examItemName} · {selectedAppointment.examDate} {selectedAppointment.examTime}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: primaryBlue, marginBottom: 8 }}>取消原因 *</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {CANCEL_REASONS.map(reason => (
                    <label key={reason.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: cancelReason === reason.value ? '#fef9c3' : '#f8fafc', borderRadius: 6, border: `1px solid ${cancelReason === reason.value ? '#fde68a' : borderGray}`, cursor: 'pointer', fontSize: 12, color: primaryBlue }}>
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason.value}
                        checked={cancelReason === reason.value}
                        onChange={e => setCancelReason(e.target.value)}
                        style={{ cursor: 'pointer' }}
                      />
                      {reason.label}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setShowCancelModal(false); setCancelReason('') }}
                  style={{ flex: 1, padding: '8px', background: whiteBg, color: primaryBlue, border: `1px solid ${borderGray}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  返回
                </button>
                <button
                  onClick={handleCancelAppointment}
                  disabled={!cancelReason}
                  style={{ flex: 1, padding: '8px', background: cancelReason ? '#dc2626' : '#f1f5f9', color: cancelReason ? '#fff' : '#94a3b8', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: cancelReason ? 'pointer' : 'not-allowed' }}>
                  确认取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
