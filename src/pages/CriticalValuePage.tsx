// @ts-nocheck
// G005 放射RIS系统 - 危急值全生命周期管理 v2.0.0
// 借鉴岱嘉医学+东软双闭环设计，完整模拟危急值管理流程
import { useState, useEffect, useRef } from 'react'
import {
  ShieldAlert, AlertTriangle, Phone, Clock, CheckCircle, Bell, Search, X,
  ChevronRight, FileText, User, Calendar, Activity, Zap, Settings, BarChart3,
  TrendingUp, PieChart as PieChartIcon, CheckSquare, Square, Upload, Download,
  Send, Eye, Edit3, Plus, Filter, RefreshCw, PhoneCall, MessageSquare,
  XCircle, CheckCheck, ArrowRight, Circle, ClipboardList, Image as ImageIcon,
  Stethoscope, Building2, Timer, TrendingDown, AlertCircle, PhoneIncoming,
  PhoneOutgoing, ArrowUp, AlertOctagon, Users, Workflow, Target
} from 'lucide-react'
import { initialCriticalValues, initialUsers, initialRadiologyExams } from '../data/initialData'

// ============ 类型定义 ============
interface CriticalValue {
  id: string
  reportId: string
  examId: string
  patientId: string
  patientName: string
  gender: string
  age: number
  patientType: string
  phone?: string
  contactPerson?: string
  modality: string
  examItemName: string
  bodyPart?: string
  criticalFinding: string
  findingDetails: string
  severity: '危急' | '高危' | '紧急'
  resultValue?: string
  resultUnit?: string
  normalRange?: string
  criticalRange?: string
  exceedRatio?: string
  reportedBy: string
  reportedByName: string
  reportedTime: string
  receivingDoctorId?: string
  receivingDoctorName?: string
  receivingTime?: string
  receivingDepartment?: string
  notificationMethod?: string
  acknowledged?: boolean
  acknowledgedBy?: string
  acknowledgedTime?: string
  status: '待处理' | '处理中' | '已处理' | '超时'
  processingDoctor?: string
  processingDoctorName?: string
  processingTime?: string
  processingDepartment?: string
  processingMeasure?: string
  processingResult?: string
  processingDuration?: string
  followUpNotes?: string
  examDoctor?: string
  examDoctorName?: string
  examTime?: string
  deviceName?: string
  accessionNumber?: string
  timeline: TimelineEvent[]
  documents?: DocumentItem[]
}

interface TimelineEvent {
  time: string
  event: string
  user: string
  detail?: string
}

interface DocumentItem {
  id: string
  name: string
  type: string
  uploadTime: string
  url?: string
}

interface CriticalValueRule {
  id: string
  modality: string
  examItem: string
  resultName: string
  normalMin: string
  normalMax: string
  criticalMin: string
  criticalMax: string
  unit: string
  notifyTimeout: number
  notifyMethods: string[]
  enabled: boolean
}

interface ChartData {
  label: string
  value: number
  color: string
}

// 闭环状态节点
interface ClosedLoopStage {
  key: '发出' | '确认' | '处理' | '完成'
  label: string
  time?: string
  user?: string
  done: boolean
  active: boolean
}

// 回访记录
interface FollowUpRecord {
  id: string
  time: string
  type: '电话回访' | '短信确认' | '现场走访' | '系统通知'
  result: '已回复' | '无响应' | '转接成功' | '需再次回访'
  operator: string
  content: string
}

// 升级规则
interface EscalationRule {
  id: string
  level: number
  triggerCondition: string
  escalateTo: string
  escalateMethod: string[]
  timeoutMinutes: number
  enabled: boolean
}

// 漏报统计数据
interface MissedReportStats {
  totalExams: number
  missedCount: number
  missedRate: string
  topMissedReasons: { reason: string; count: number }[]
}

// ============ 常量 ============
const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; icon: any }> = {
  '待处理': { bg: '#fee2e2', color: '#dc2626', label: '待处理', icon: Bell },
  '处理中': { bg: '#fef3c7', color: '#d97706', label: '处理中', icon: Clock },
  '已处理': { bg: '#d1fae5', color: '#059669', label: '已处理', icon: CheckCircle },
  '超时': { bg: '#fecaca', color: '#991b1b', label: '超时', icon: AlertTriangle },
}

const SEVERITY_CONFIG: Record<string, { bg: string; color: string; borderColor: string }> = {
  '危急': { bg: '#fef2f2', color: '#dc2626', borderColor: '#dc2626' },
  '高危': { bg: '#fffbeb', color: '#d97706', borderColor: '#d97706' },
  '紧急': { bg: '#eff6ff', color: '#2563eb', borderColor: '#2563eb' },
}

const MODALITY_LIST = ['全部', 'CT', 'MR', 'DR', 'DSA']
const STATUS_LIST = ['全部', '待处理', '处理中', '已处理', '超时']
const SEVERITY_LIST = ['全部', '危急', '高危', '紧急']
const TIME_RANGE_LIST = ['全部', '30分钟内', '1小时内', '2小时内', '超时']

// ============ 模拟数据扩展 ============
const generateMockCriticalValues = (): CriticalValue[] => {
  const baseData = initialCriticalValues.map((cv, idx) => {
    const exam = initialRadiologyExams.find(e => e.id === cv.examId)
    const patient = { gender: '男', age: 45 + idx * 5, patientType: '住院', phone: '138****1234', contactPerson: '家属电话' }
    const reportDoctor = initialUsers.find(u => u.id === cv.reportedBy)
    const receivingDoctor = cv.receivingDoctorId ? initialUsers.find(u => u.id === cv.receivingDoctorId) : null

    const baseTime = new Date('2026-05-01 10:00')
    baseTime.setMinutes(baseTime.getMinutes() - idx * 35)

    const timeline: TimelineEvent[] = [
      { time: exam?.createdTime || '2026-05-01 08:30', event: '检查完成', user: exam?.technologistName || '刘建国', detail: '影像采集完成' },
      { time: cv.reportedTime, event: '发现危急值', user: cv.reportedByName, detail: cv.findingDetails.substring(0, 30) + '...' },
      { time: String(baseTime.getHours()).padStart(2, '0') + ':' + String(baseTime.getMinutes() + 2).padStart(2, '0'), event: '系统预警', user: '系统', detail: '自动触发危急值预警流程' },
      { time: cv.receivingTime || '', event: '通知临床', user: cv.receivingDoctorName || '待通知', detail: '已通过' + (cv.notificationMethod || '系统通知') + '方式通知' },
      { time: cv.acknowledgedTime || '', event: '临床接收', user: cv.acknowledgedBy || '待确认', detail: '临床已收到危急值通报' },
      { time: cv.processingTime || '', event: '处理完成', user: cv.processingDoctorName || '', detail: cv.processingResult || '处置措施已记录' },
    ].filter(t => t.time)

    const documents: DocumentItem[] = idx === 0 ? [
      { id: 'DOC001', name: 'CT检查报告单.pdf', type: 'application/pdf', uploadTime: '2026-05-01 12:35' },
      { id: 'DOC002', name: 'CT影像截图.png', type: 'image/png', uploadTime: '2026-05-01 12:36' },
    ] : []

    return {
      ...cv,
      gender: patient.gender,
      age: patient.age,
      patientType: patient.patientType,
      phone: patient.phone,
      contactPerson: patient.contactPerson,
      examDoctor: exam?.technologistId,
      examDoctorName: exam?.technologistName,
      examTime: exam?.examTime,
      deviceName: exam?.deviceName,
      accessionNumber: exam?.accessionNumber,
      notificationMethod: cv.notificationMethod || '系统通知',
      receivingDepartment: cv.receivingDoctorId ? '心内科' : '神经内科',
      timeline,
      documents,
      resultValue: idx === 0 ? '85%' : idx === 1 ? '3.5×2.8cm' : idx === 2 ? '2.1×1.8cm' : '3.5cm',
      resultUnit: idx === 0 ? '狭窄率' : 'cm',
      normalRange: idx === 0 ? '<50%' : '无',
      criticalRange: idx === 0 ? '>70%' : '有占位即危急',
      exceedRatio: idx === 0 ? '超标121%' : '发现即超标',
      processingDoctor: cv.receivingDoctorId,
      processingDoctorName: cv.receivingDoctorName,
      processingTime: cv.receivingTime,
      processingDepartment: cv.receivingDoctorId ? '心内科' : '神经内科',
      processingMeasure: idx === 0 ? '建议急诊CAG+PCI' : idx === 1 ? '急诊开颅血肿清除术' : '进一步检查明确诊断',
      processingResult: idx === 0 ? '已转心内科进一步治疗' : idx === 1 ? '手术顺利完成' : '密切随访中',
      processingDuration: idx === 0 ? '35分钟' : idx === 1 ? '2小时' : '24小时',
      acknowledgedBy: idx < 2 ? '李明辉' : idx === 2 ? '王秀峰' : '刘芳',
      acknowledgedTime: cv.receivingTime,
    } as CriticalValue
  })

  // 添加更多模拟数据
  const extraData: Partial<CriticalValue>[] = [
    {
      id: 'CV005', reportId: 'RAD-RPT008', examId: 'RAD-EX005', patientId: 'RAD-P005',
      patientName: '周玉芬', modality: 'CT', examItemName: '腹部CT平扫+增强',
      criticalFinding: 'true', findingDetails: '肝右叶见约6.5×5.8cm低密度影，边界不清，增强扫描呈不均匀强化。门静脉右支受累。腹腔淋巴结肿大。考虑原发性肝癌。',
      severity: '危急', reportedBy: 'R002', reportedByName: '王秀峰', reportedTime: '2026-05-01 15:20',
      receivingDoctorId: 'R001', receivingDoctorName: '李明辉', receivingTime: '2026-05-01 15:25',
      status: '处理中', resultValue: '6.5×5.8cm', resultUnit: 'cm', normalRange: '无占位',
      criticalRange: '有占位即危急', exceedRatio: '发现即超标',
    },
    {
      id: 'CV006', reportId: 'RAD-RPT009', examId: 'RAD-EX006', patientId: 'RAD-P006',
      patientName: '孙伟', modality: 'MR', examItemName: '腰椎MR平扫',
      criticalFinding: 'true', findingDetails: 'L4-5、L5-S1椎间盘突出，相应水平硬膜囊受压。L3椎体压缩性骨折，椎体变扁约1/3。',
      severity: '高危', reportedBy: 'R004', reportedByName: '刘芳', reportedTime: '2026-05-01 16:30',
      status: '待处理', resultValue: '压缩约1/3', resultUnit: '', normalRange: '无骨折',
      criticalRange: '压缩>1/3即危急', exceedRatio: '临界超标',
    },
    {
      id: 'CV007', reportId: 'RAD-RPT010', examId: 'RAD-EX007', patientId: 'RAD-P007',
      patientName: '吴婷', modality: 'DSA', examItemName: '冠脉造影',
      criticalFinding: 'true', findingDetails: '左主干开口狭窄约90%，前降支全程弥漫性狭窄，最重约95%，回旋支中段狭窄约80%，右冠近段完全闭塞。',
      severity: '危急', reportedBy: 'R001', reportedByName: '李明辉', reportedTime: '2026-04-30 14:00',
      receivingDoctorId: 'R002', receivingDoctorName: '王秀峰', receivingTime: '2026-04-30 14:10',
      status: '已处理', resultValue: '狭窄90-95%', resultUnit: '', normalRange: '<50%',
      criticalRange: '>70%', exceedRatio: '超标86%',
      processingTime: '2026-04-30 16:00', processingDoctorName: '王秀峰', processingDepartment: '心内科',
      processingMeasure: '急诊CAG+PCI治疗', processingResult: '支架植入成功，血流恢复',
      processingDuration: '2小时',
    },
    {
      id: 'CV008', reportId: 'RAD-RPT011', examId: 'RAD-EX003', patientId: 'RAD-P003',
      patientName: '王建国', modality: 'DR', examItemName: '胸部DR正侧位',
      criticalFinding: 'true', findingDetails: '右侧气胸，右肺压缩约40%，右肺门区见约2.5cm团块影。',
      severity: '危急', reportedBy: 'R003', reportedByName: '张海涛', reportedTime: '2026-04-29 09:00',
      receivingDoctorId: 'R001', receivingDoctorName: '李明辉', receivingTime: '2026-04-29 09:15',
      status: '超时', resultValue: '压缩40%', resultUnit: '%', normalRange: '无气胸',
      criticalRange: '压缩>30%', exceedRatio: '超标33%',
      processingTime: '2026-04-29 11:00', processingDoctorName: '李明辉', processingDepartment: '急诊科',
      processingMeasure: '急诊胸腔闭式引流', processingResult: '引流成功，肺复张良好',
      processingDuration: '2小时45分钟',
    },
  ]

  const extraCVs = extraData.map(data => {
    const exam = initialRadiologyExams.find(e => e.id === data.examId)
    const baseTime = new Date(data.reportedTime || '2026-05-01 10:00')

    const timeline: TimelineEvent[] = [
      { time: exam?.createdTime || data.reportedTime || '', event: '检查完成', user: exam?.technologistName || '刘建国', detail: '影像采集完成' },
      { time: data.reportedTime || '', event: '发现危急值', user: data.reportedByName || '', detail: (data.findingDetails || '').substring(0, 30) + '...' },
      { time: data.receivingTime || '', event: '通知临床', user: data.receivingDoctorName || '待通知', detail: '已通知临床科室' },
      { time: data.processingTime || '', event: '处理完成', user: data.processingDoctorName || '', detail: data.processingResult || '' },
    ].filter(t => t.time)

    const documents: DocumentItem[] = data.id === 'CV005' ? [
      { id: 'DOC003', name: '腹部CT增强报告.pdf', type: 'application/pdf', uploadTime: '2026-05-01 15:25' },
    ] : []

    return {
      ...data,
      gender: '男',
      age: 50,
      patientType: '住院',
      phone: '138****5678',
      contactPerson: '家属电话',
      examDoctorName: exam?.technologistName,
      examTime: exam?.examTime,
      deviceName: exam?.deviceName,
      accessionNumber: exam?.accessionNumber,
      notificationMethod: '系统通知',
      receivingDepartment: '肿瘤科',
      timeline,
      documents,
      acknowledged: data.status !== '待处理' && data.status !== '超时',
      acknowledgedBy: data.receivingDoctorName,
      acknowledgedTime: data.receivingTime,
    } as CriticalValue
  })

  return [...baseData, ...extraCVs]
}

const MOCK_CRITICAL_VALUES = generateMockCriticalValues()

// ============ 模拟回访记录数据 ============
const MOCK_FOLLOWUP_RECORDS: FollowUpRecord[] = [
  { id: 'FU001', time: '2026-05-01 16:30', type: '电话回访', result: '已回复', operator: '李明辉', content: '患者已接收通知，临床已安排急诊CAG检查。' },
  { id: 'FU002', time: '2026-05-01 15:45', type: '短信确认', result: '已回复', operator: '王秀峰', content: '患者家属已收到短信提醒，确认前往医院途中。' },
  { id: 'FU003', time: '2026-05-01 14:20', type: '电话回访', result: '无响应', operator: '刘芳', content: '首次电话无人接听，已发送短信通知，准备二次回访。' },
  { id: 'FU004', time: '2026-05-01 11:00', type: '系统通知', result: '已回复', operator: '系统', content: '临床医生已通过系统确认接收危急值通报。' },
  { id: 'FU005', time: '2026-04-30 17:30', type: '现场走访', result: '转接成功', operator: '张海涛', content: '急诊科医生接收患者，现场交接完成。' },
]

// ============ 模拟升级规则数据 ============
const MOCK_ESCALATION_RULES: EscalationRule[] = [
  { id: 'ES001', level: 1, triggerCondition: '30分钟内未确认', escalateTo: '科室主任', escalateMethod: ['电话通知', '短信通知'], timeoutMinutes: 30, enabled: true },
  { id: 'ES002', level: 2, triggerCondition: '1小时内未处理', escalateTo: '医务科', escalateMethod: ['电话通知', '系统通知'], timeoutMinutes: 60, enabled: true },
  { id: 'ES003', level: 3, triggerCondition: '2小时内未完成', escalateTo: '分管院长', escalateMethod: ['电话通知', '短信通知', '邮件通知'], timeoutMinutes: 120, enabled: true },
  { id: 'ES004', level: 4, triggerCondition: '24小时内未闭环', escalateTo: '院长', escalateMethod: ['电话通知', '短信通知', '邮件通知', '现场走访'], timeoutMinutes: 1440, enabled: false },
]

// ============ 模拟漏报统计数据 ============
const MOCK_MISSED_STATS: MissedReportStats = {
  totalExams: 1247,
  missedCount: 12,
  missedRate: '0.96%',
  topMissedReasons: [
    { reason: '医生未及时查阅报告', count: 5 },
    { reason: '系统通知发送失败', count: 3 },
    { reason: '患者联系方式缺失', count: 2 },
    { reason: '其他', count: 2 },
  ],
}

// ============ 子组件：统计卡片 ============
const StatCard = ({ label, value, icon: Icon, color, bgColor, trend }: {
  label: string
  value: number
  icon: any
  color: string
  bgColor: string
  trend?: string
}) => (
  <div style={{
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    transition: 'box-shadow 0.2s',
    cursor: 'pointer',
  }}
  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)')}
  >
    <div style={{
      width: 48,
      height: 48,
      borderRadius: 12,
      background: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Icon size={24} style={{ color }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
        {label}
      </div>
    </div>
    {trend && (
      <div style={{
        fontSize: 11,
        color: trend.startsWith('+') ? '#059669' : '#dc2626',
        background: trend.startsWith('+') ? '#d1fae5' : '#fee2e2',
        padding: '2px 8px',
        borderRadius: 10,
        fontWeight: 600,
      }}>
        {trend}
      </div>
    )}
  </div>
)

// ============ 子组件：筛选栏 ============
const FilterBar = ({
  search, setSearch,
  statusFilter, setStatusFilter,
  modalityFilter, setModalityFilter,
  severityFilter, setSeverityFilter,
  timeRangeFilter, setTimeRangeFilter,
  dateRange, setDateRange,
  onBatchNotify, onBatchProcess, selectedCount,
  onOpenSettings,
}: {
  search: string
  setSearch: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  modalityFilter: string
  setModalityFilter: (v: string) => void
  severityFilter: string
  setSeverityFilter: (v: string) => void
  timeRangeFilter: string
  setTimeRangeFilter: (v: string) => void
  dateRange: string
  setDateRange: (v: string) => void
  onBatchNotify: () => void
  onBatchProcess: () => void
  selectedCount: number
  onOpenSettings: () => void
}) => {
  const filterBtnStyle = (isActive: boolean) => ({
    padding: '6px 14px',
    borderRadius: 8,
    border: `1px solid ${isActive ? '#1e3a5f' : '#e2e8f0'}`,
    background: isActive ? '#1e3a5f' : '#fff',
    color: isActive ? '#fff' : '#64748b',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  })

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '14px 20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: 16,
    }}>
      {/* 第一行：搜索 + 批量操作 */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        {/* 搜索框 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: 1,
          background: '#f8fafc',
          borderRadius: 8,
          padding: '8px 14px',
          border: '1px solid #e2e8f0',
        }}>
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索患者姓名/检查号/危急值ID..."
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 13,
              width: '100%',
              background: 'transparent',
            }}
          />
          {search && (
            <X size={14} style={{ color: '#94a3b8', cursor: 'pointer' }} onClick={() => setSearch('')} />
          )}
        </div>

        {/* 日期范围 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={14} style={{ color: '#64748b' }} />
          <input
            type="date"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 12,
              color: '#334155',
              outline: 'none',
            }}
          />
        </div>

        {/* 规则设置 */}
        <button
          onClick={onOpenSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#64748b',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Settings size={14} />
          规则设置
        </button>
      </div>

      {/* 第二行：状态筛选 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
          <Filter size={14} style={{ color: '#64748b' }} />
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>状态:</span>
        </div>
        {STATUS_LIST.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={filterBtnStyle(statusFilter === s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 第三行：设备类型 + 紧急程度 + 时间范围 */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* 设备类型 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>设备:</span>
          {MODALITY_LIST.map(m => (
            <button
              key={m}
              onClick={() => setModalityFilter(m)}
              style={filterBtnStyle(modalityFilter === m)}
            >
              {m}
            </button>
          ))}
        </div>

        {/* 紧急程度 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>紧急:</span>
          {SEVERITY_LIST.map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              style={filterBtnStyle(severityFilter === s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* 时间范围 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>时限:</span>
          {TIME_RANGE_LIST.map(t => (
            <button
              key={t}
              onClick={() => setTimeRangeFilter(t)}
              style={filterBtnStyle(timeRangeFilter === t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 第四行：批量操作 */}
      {selectedCount > 0 && (
        <div style={{
          display: 'flex',
          gap: 10,
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #f1f5f9',
        }}>
          <span style={{ fontSize: 12, color: '#1e3a5f', fontWeight: 700 }}>
            已选中 {selectedCount} 项
          </span>
          <button
            onClick={onBatchNotify}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #d97706',
              background: '#fffbeb',
              color: '#d97706',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Send size={13} />
            批量发送通知
          </button>
          <button
            onClick={onBatchProcess}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #059669',
              background: '#d1fae5',
              color: '#059669',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <CheckCircle size={13} />
            批量标记处理
          </button>
        </div>
      )}
    </div>
  )
}

// ============ 子组件：危急值表格行 ============
const CriticalValueRow = ({
  cv,
  isSelected,
  onSelect,
  onProcess,
  onViewDetail,
  onContactClinical,
}: {
  cv: CriticalValue
  isSelected: boolean
  onSelect: () => void
  onProcess: () => void
  onViewDetail: () => void
  onContactClinical: () => void
}) => {
  const statusCfg = STATUS_CONFIG[cv.status] || STATUS_CONFIG['待处理']
  const severityCfg = SEVERITY_CONFIG[cv.severity] || SEVERITY_CONFIG['高危']
  const StatusIcon = statusCfg.icon

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '40px 100px 90px 130px 60px 140px 100px 90px 120px 80px 90px 120px',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid #f1f5f9',
      background: isSelected ? '#eff6ff' : '#fff',
      borderLeft: `4px solid ${severityCfg.borderColor}`,
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc' }}
    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff' }}
    >
      {/* 选择框 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          onClick={onSelect}
          style={{
            cursor: 'pointer',
            color: isSelected ? '#1e3a5f' : '#cbd5e1',
          }}
        >
          {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
        </div>
      </div>

      {/* ID */}
      <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
        {cv.id}
      </div>

      {/* 患者姓名 */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>
          {cv.patientName}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          {cv.gender}·{cv.age}岁
        </div>
      </div>

      {/* 检查项目 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
          {cv.examItemName}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          {cv.modality}
        </div>
      </div>

      {/* 设备 */}
      <div style={{ fontSize: 11, color: '#64748b' }}>
        {cv.deviceName?.split('（')[0] || cv.modality}
      </div>

      {/* 检查结果 */}
      <div>
        <div style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#dc2626',
        }}>
          {cv.resultValue} {cv.resultUnit}
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>
         危急: {cv.criticalRange}
        </div>
      </div>

      {/* 上报医生 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
          {cv.reportedByName}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          {cv.reportedTime.split(' ')[1] || cv.reportedTime}
        </div>
      </div>

      {/* 状态 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <StatusIcon size={14} style={{ color: statusCfg.color }} />
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: statusCfg.color,
          background: statusCfg.bg,
          padding: '2px 10px',
          borderRadius: 10,
        }}>
          {statusCfg.label}
        </span>
      </div>

      {/* 处理时间 */}
      <div style={{ fontSize: 11, color: '#64748b' }}>
        {cv.processingTime ? cv.processingTime.split(' ')[1] || cv.processingTime : '-'}
      </div>

      {/* 处理耗时 */}
      <div style={{ fontSize: 11, color: '#64748b' }}>
        {cv.processingDuration || '-'}
      </div>

      {/* 操作 */}
      <div style={{ display: 'flex', gap: 6 }}>
        {cv.status === '待处理' && (
          <button
            onClick={onProcess}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #059669',
              background: '#d1fae5',
              color: '#059669',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Edit3 size={11} />
            处理
          </button>
        )}
        <button
          onClick={onViewDetail}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #1e3a5f',
            background: '#fff',
            color: '#1e3a5f',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Eye size={11} />
          详情
        </button>
        <button
          onClick={onContactClinical}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #d97706',
            background: '#fff',
            color: '#d97706',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Phone size={11} />
          联系
        </button>
      </div>
    </div>
  )
}

// ============ 子组件：详情面板 ============
const DetailPanel = ({
  cv,
  onClose,
  activeTab,
  setActiveTab,
}: {
  cv: CriticalValue
  onClose: () => void
  activeTab: number
  setActiveTab: (v: number) => void
}) => {
  const tabs = [
    { label: '基本信息', icon: User },
    { label: '危急值详情', icon: AlertTriangle },
    { label: '上报记录', icon: Bell },
    { label: '处理记录', icon: ClipboardList },
    { label: '回访记录', icon: PhoneOutgoing },
    { label: '时间轴', icon: Clock },
    { label: '相关文档', icon: FileText },
  ]

  const labelStyle = {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  }

  const valueStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: '#1e3a5f',
  }

  return (
    <div style={{
      width: 480,
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      position: 'sticky',
      top: 24,
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fef2f2',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldAlert size={20} style={{ color: '#dc2626' }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#dc2626' }}>
              危急值详情
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {cv.id} · {cv.patientName}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
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
          <X size={16} style={{ color: '#64748b' }} />
        </button>
      </div>

      {/* 标签页 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc',
      }}>
        {tabs.map((tab, idx) => {
          const Icon = tab.icon
          return (
            <div
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              style={{
                flex: 1,
                padding: '10px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                borderBottom: activeTab === idx ? '2px solid #1e3a5f' : '2px solid transparent',
                background: activeTab === idx ? '#fff' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={14} style={{ color: activeTab === idx ? '#1e3a5f' : '#94a3b8', marginBottom: 2 }} />
              <div style={{ fontSize: 10, fontWeight: activeTab === idx ? 700 : 500, color: activeTab === idx ? '#1e3a5f' : '#94a3b8' }}>
                {tab.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {/* Tab 0: 基本信息 */}
        {activeTab === 0 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...labelStyle, marginBottom: 6 }}>患者信息</div>
              <div style={{
                background: '#f8fafc',
                borderRadius: 8,
                padding: 12,
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: '姓名', value: cv.patientName },
                    { label: '性别', value: cv.gender },
                    { label: '年龄', value: cv.age + '岁' },
                    { label: '患者类型', value: cv.patientType },
                    { label: '住院号', value: cv.patientId },
                    { label: '联系电话', value: cv.phone },
                    { label: '联系人', value: cv.contactPerson },
                    { label: '门诊号', value: cv.accessionNumber },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={labelStyle}>{item.label}</div>
                      <div style={valueStyle}>{item.value || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ ...labelStyle, marginBottom: 6 }}>检查信息</div>
              <div style={{
                background: '#f8fafc',
                borderRadius: 8,
                padding: 12,
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: '检查项目', value: cv.examItemName },
                    { label: '设备', value: cv.deviceName },
                    { label: '检查时间', value: cv.examTime },
                    { label: '检查医生', value: cv.examDoctorName },
                    { label: '检查部位', value: cv.bodyPart },
                    { label: '检查号', value: cv.accessionNumber },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={labelStyle}>{item.label}</div>
                      <div style={valueStyle}>{item.value || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div style={{ ...labelStyle, marginBottom: 6 }}>危急值摘要</div>
              <div style={{
                background: '#fef2f2',
                borderRadius: 8,
                padding: 12,
                border: '1px solid #fecaca',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>
                  {cv.severity} · {cv.modality}
                </div>
                <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6 }}>
                  {cv.findingDetails}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: 危急值详情 */}
        {activeTab === 1 && (
          <div>
            <div style={{
              background: '#fef2f2',
              borderRadius: 10,
              padding: 16,
              border: '2px solid #dc2626',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={18} style={{ color: '#dc2626' }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: '#dc2626' }}>异常检查结果</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={labelStyle}>检查结果</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626' }}>
                    {cv.resultValue}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>单位</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>
                    {cv.resultUnit}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>正常范围</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                    {cv.normalRange}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>危急范围</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#dc2626' }}>
                    {cv.criticalRange}
                  </div>
                </div>
              </div>
              {cv.exceedRatio && (
                <div style={{
                  marginTop: 12,
                  padding: '8px 12px',
                  background: '#fee2e2',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <TrendingUp size={14} style={{ color: '#dc2626' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
                    超标程度：{cv.exceedRatio}
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ ...labelStyle, marginBottom: 6 }}>详细描述</div>
              <div style={{
                background: '#f8fafc',
                borderRadius: 8,
                padding: 14,
                border: '1px solid #e2e8f0',
                fontSize: 13,
                color: '#334155',
                lineHeight: 1.7,
              }}>
                {cv.findingDetails}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}>
              {[
                { label: '检查项目', value: cv.examItemName },
                { label: '设备类型', value: cv.modality },
                { label: '紧急程度', value: cv.severity },
                { label: '上报医生', value: cv.reportedByName },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#f8fafc',
                  borderRadius: 8,
                  padding: 10,
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={labelStyle}>{item.label}</div>
                  <div style={valueStyle}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: 上报记录 */}
        {activeTab === 2 && (
          <div>
            <div style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: 16,
              border: '1px solid #e2e8f0',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Bell size={16} style={{ color: '#d97706' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>上报信息</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: '上报时间', value: cv.reportedTime },
                  { label: '上报医生', value: cv.reportedByName },
                  { label: '通知方式', value: cv.notificationMethod },
                  { label: '接收科室', value: cv.receivingDepartment },
                ].map(item => (
                  <div key={item.label}>
                    <div style={labelStyle}>{item.label}</div>
                    <div style={valueStyle}>{item.value || '-'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: 16,
              border: '1px solid #e2e8f0',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Stethoscope size={16} style={{ color: '#1e3a5f' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>接收临床</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: '接收医生', value: cv.receivingDoctorName || '待指定' },
                  { label: '接收时间', value: cv.receivingTime || '-' },
                  { label: '临床回复', value: cv.acknowledgedBy || '待回复' },
                  { label: '回复时间', value: cv.acknowledgedTime || '-' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={labelStyle}>{item.label}</div>
                    <div style={{
                      ...valueStyle,
                      color: item.value === '待指定' || item.value === '待回复' || item.value === '-' ? '#94a3b8' : '#1e3a5f',
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {cv.followUpNotes && (
              <div style={{
                background: '#eff6ff',
                borderRadius: 8,
                padding: 12,
                border: '1px solid #bfdbfe',
              }}>
                <div style={{ ...labelStyle, marginBottom: 4 }}>跟进备注</div>
                <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6 }}>
                  {cv.followUpNotes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: 处理记录 */}
        {activeTab === 3 && (
          <div>
            <div style={{
              background: cv.status === '已处理' ? '#d1fae5' : '#fef3c7',
              borderRadius: 10,
              padding: 16,
              border: `1px solid ${cv.status === '已处理' ? '#a7f3d0' : '#fde68a'}`,
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {cv.status === '已处理' ? (
                  <CheckCircle size={18} style={{ color: '#059669' }} />
                ) : (
                  <Clock size={18} style={{ color: '#d97706' }} />
                )}
                <span style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: cv.status === '已处理' ? '#059669' : '#d97706',
                }}>
                  {cv.status === '已处理' ? '处理完成' : '处理中'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: '处理时间', value: cv.processingTime || '-' },
                  { label: '处理医生', value: cv.processingDoctorName || '-' },
                  { label: '处理科室', value: cv.processingDepartment || '-' },
                  { label: '处理耗时', value: cv.processingDuration || '-' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={labelStyle}>{item.label}</div>
                    <div style={valueStyle}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {cv.processingMeasure && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ ...labelStyle, marginBottom: 6 }}>处理措施</div>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 8,
                  padding: 14,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  color: '#334155',
                  lineHeight: 1.6,
                }}>
                  {cv.processingMeasure}
                </div>
              </div>
            )}

            {cv.processingResult && (
              <div>
                <div style={{ ...labelStyle, marginBottom: 6 }}>处理结果</div>
                <div style={{
                  background: '#f0fdf4',
                  borderRadius: 8,
                  padding: 14,
                  border: '1px solid #bbf7d0',
                  fontSize: 13,
                  color: '#166534',
                  lineHeight: 1.6,
                  fontWeight: 600,
                }}>
                  {cv.processingResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: 回访记录 */}
        {activeTab === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #1e3a5f',
                background: '#1e3a5f',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                <Plus size={13} />
                添加回访
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_FOLLOWUP_RECORDS.slice(0, 3).map(record => (
                <div key={record.id} style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  padding: 14,
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: record.type === '电话回访' ? '#fee2e2' : record.type === '短信确认' ? '#eff6ff' : record.type === '现场走访' ? '#fef3c7' : '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {record.type === '电话回访' ? (
                        <PhoneOutgoing size={18} style={{ color: '#dc2626' }} />
                      ) : record.type === '短信确认' ? (
                        <MessageSquare size={18} style={{ color: '#2563eb' }} />
                      ) : record.type === '现场走访' ? (
                        <Users size={18} style={{ color: '#d97706' }} />
                      ) : (
                        <Bell size={18} style={{ color: '#059669' }} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>{record.type}</span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontSize: 10,
                          fontWeight: 600,
                          background: record.result === '已回复' ? '#d1fae5' : record.result === '无响应' ? '#fee2e2' : record.result === '转接成功' ? '#eff6ff' : '#fef3c7',
                          color: record.result === '已回复' ? '#059669' : record.result === '无响应' ? '#dc2626' : record.result === '转接成功' ? '#2563eb' : '#d97706',
                        }}>
                          {record.result}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6, marginBottom: 6 }}>
                        {record.content}
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{record.time}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{record.operator}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {MOCK_FOLLOWUP_RECORDS.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '32px 16px',
                background: '#f8fafc',
                borderRadius: 10,
                border: '1px dashed #e2e8f0',
              }}>
                <PhoneOutgoing size={32} style={{ color: '#cbd5e1', marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: '#94a3b8' }}>暂无回访记录</div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: 时间轴 */}
        {activeTab === 5 && (
          <div>
            <div style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: 16,
              border: '1px solid #e2e8f0',
            }}>
              {cv.timeline.map((event, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: idx < cv.timeline.length - 1 ? 16 : 0 }}>
                  {/* 时间线 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: idx === cv.timeline.length - 1 ? '#1e3a5f' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {idx === cv.timeline.length - 1 ? (
                        <CheckCircle size={16} style={{ color: '#fff' }} />
                      ) : (
                        <Circle size={12} style={{ color: '#94a3b8' }} />
                      )}
                    </div>
                    {idx < cv.timeline.length - 1 && (
                      <div style={{
                        width: 2,
                        flex: 1,
                        background: '#e2e8f0',
                        marginTop: 4,
                        minHeight: 20,
                      }} />
                    )}
                  </div>

                  {/* 内容 */}
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>
                      {event.event}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {event.time}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {event.user}
                    </div>
                    {event.detail && (
                      <div style={{
                        fontSize: 11,
                        color: '#64748b',
                        marginTop: 4,
                        background: '#fff',
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: '1px solid #f1f5f9',
                      }}>
                        {event.detail}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: 相关文档 */}
        {activeTab === 6 && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>
                相关文档 ({cv.documents?.length || 0})
              </div>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#64748b',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                <Upload size={12} />
                上传
              </button>
            </div>

            {cv.documents && cv.documents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cv.documents.map(doc => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: doc.type.includes('pdf') ? '#fee2e2' : '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {doc.type.includes('pdf') ? (
                        <FileText size={18} style={{ color: '#dc2626' }} />
                      ) : (
                        <ImageIcon size={18} style={{ color: '#2563eb' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {doc.type} · {doc.uploadTime}
                      </div>
                    </div>
                    <Download size={16} style={{ color: '#64748b' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '32px 16px',
                background: '#f8fafc',
                borderRadius: 10,
                border: '1px dashed #e2e8f0',
              }}>
                <FileText size={32} style={{ color: '#cbd5e1', marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  暂无相关文档
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
                  可上传检查报告、影像截图等
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ 子组件：闭环状态追踪 ============
const ClosedLoopTracker = ({ cv }: { cv: CriticalValue }) => {
  // 构建闭环阶段：发出→确认→处理→完成
  const stages: ClosedLoopStage[] = [
    {
      key: '发出',
      label: '危急值发出',
      time: cv.reportedTime,
      user: cv.reportedByName,
      done: !!cv.reportedTime,
      active: true,
    },
    {
      key: '确认',
      label: '临床确认',
      time: cv.acknowledgedTime,
      user: cv.acknowledgedBy,
      done: !!cv.acknowledgedTime,
      active: !!cv.reportedTime && !cv.acknowledgedTime,
    },
    {
      key: '处理',
      label: '处理中',
      time: cv.processingTime,
      user: cv.processingDoctorName,
      done: cv.status === '已处理',
      active: !!cv.acknowledgedTime && cv.status === '处理中',
    },
    {
      key: '完成',
      label: '闭环完成',
      time: cv.status === '已处理' ? cv.processingTime : undefined,
      user: cv.processingDoctorName,
      done: cv.status === '已处理',
      active: cv.status === '已处理',
    },
  ]

  const stageConfig: Record<string, { bg: string; color: string; borderColor: string; icon: any }> = {
    '发出': { bg: '#fef2f2', color: '#dc2626', borderColor: '#dc2626', icon: AlertOctagon },
    '确认': { bg: '#eff6ff', color: '#2563eb', borderColor: '#2563eb', icon: PhoneIncoming },
    '处理': { bg: '#fffbeb', color: '#d97706', borderColor: '#d97706', icon: Activity },
    '完成': { bg: '#d1fae5', color: '#059669', borderColor: '#059669', icon: CheckCircle },
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: 16,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>
        闭环状态追踪
      </div>

      {/* 阶段流程 */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 16 }}>
        {stages.map((stage, idx) => {
          const cfg = stageConfig[stage.key]
          const StageIcon = cfg.icon
          const isLast = idx === stages.length - 1

          return (
            <div key={stage.key} style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
              {/* 节点 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: stage.done ? cfg.bg : '#f8fafc',
                  border: `3px solid ${stage.done ? cfg.borderColor : '#e2e8f0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  <StageIcon size={20} style={{ color: stage.done ? cfg.color : '#94a3b8' }} />
                  {stage.active && (
                    <div style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: '#d97706',
                      border: '2px solid #fff',
                      animation: 'pulse 1.5s infinite',
                    }} />
                  )}
                </div>
                <div style={{
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: stage.done ? cfg.color : '#94a3b8',
                }}>
                  {stage.label}
                </div>
                {stage.time && (
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                    {stage.time.split(' ')[1] || stage.time}
                  </div>
                )}
                {stage.user && (
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
                    {stage.user}
                  </div>
                )}
              </div>

              {/* 连接线 */}
              {!isLast && (
                <div style={{
                  flex: '0 0 32px',
                  height: 3,
                  background: stages[idx + 1].done ? cfg.borderColor : '#e2e8f0',
                  marginTop: -20,
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* 闭环时效统计 */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 8,
        padding: 12,
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: '总耗时', value: cv.processingDuration || '进行中', color: '#1e3a5f' },
            { label: '确认耗时', value: cv.acknowledgedTime && cv.reportedTime
              ? (() => {
                  const t1 = new Date(cv.reportedTime).getTime()
                  const t2 = new Date(cv.acknowledgedTime).getTime()
                  const mins = Math.round((t2 - t1) / 60000)
                  return mins < 60 ? `${mins}分钟` : `${Math.floor(mins / 60)}小时${mins % 60}分钟`
                })()
              : '待确认', color: '#2563eb' },
            { label: '处理耗时', value: cv.processingTime && cv.acknowledgedTime
              ? (() => {
                  const t1 = new Date(cv.acknowledgedTime).getTime()
                  const t2 = new Date(cv.processingTime).getTime()
                  const mins = Math.round((t2 - t1) / 60000)
                  return mins < 60 ? `${mins}分钟` : `${Math.floor(mins / 60)}小时${mins % 60}分钟`
                })()
              : '进行中', color: '#d97706' },
          ].map(item => (
            <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ 子组件：统计图表区 ============
const StatisticsCharts = ({ data }: { data: CriticalValue[] }) => {
  const [activeChart, setActiveChart] = useState<'trend' | 'modality' | 'time' | 'missed'>('trend')

  // 计算统计数据
  const pendingCount = data.filter(c => c.status === '待处理').length
  const processingCount = data.filter(c => c.status === '处理中').length
  const resolvedCount = data.filter(c => c.status === '已处理').length
  const overdueCount = data.filter(c => c.status === '超时').length

  // 模拟7天趋势数据
  const trendData = [
    { day: '04-25', count: 18 },
    { day: '04-26', count: 17 },
    { day: '04-27', count: 15 },
    { day: '04-28', count: 16 },
    { day: '04-29', count: 14 },
    { day: '04-30', count: 12 },
    { day: '05-01', count: data.length },
  ]
  const maxTrend = Math.max(...trendData.map(d => d.count))

  // 设备分布
  const modalityData: ChartData[] = [
    { label: 'CT', value: data.filter(d => d.modality === 'CT').length, color: '#1e3a5f' },
    { label: 'MR', value: data.filter(d => d.modality === 'MR').length, color: '#2563eb' },
    { label: 'DR', value: data.filter(d => d.modality === 'DR').length, color: '#059669' },
    { label: 'DSA', value: data.filter(d => d.modality === 'DSA').length, color: '#d97706' },
  ]
  const totalModality = modalityData.reduce((sum, d) => sum + d.value, 0)

  // 处理时效分布
  const timeData: ChartData[] = [
    { label: '30分钟内', value: 3, color: '#059669' },
    { label: '1小时内', value: 4, color: '#2563eb' },
    { label: '2小时内', value: 2, color: '#d97706' },
    { label: '超时', value: overdueCount || 1, color: '#dc2626' },
  ]
  const maxTime = Math.max(...timeData.map(d => d.value))

  const chartTabs = [
    { key: 'trend', label: '趋势', icon: TrendingUp },
    { key: 'modality', label: '设备分布', icon: PieChartIcon },
    { key: 'time', label: '处理时效', icon: BarChart3 },
    { key: 'missed', label: '漏报率', icon: AlertOctagon },
  ]

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: 16,
    }}>
      {/* 图表切换 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {chartTabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                border: `1px solid ${activeChart === tab.key ? '#1e3a5f' : '#e2e8f0'}`,
                background: activeChart === tab.key ? '#1e3a5f' : '#fff',
                color: activeChart === tab.key ? '#fff' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 趋势图 */}
      {activeChart === 'trend' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>
            本月危急值数量趋势（近7天）
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
            {trendData.map((d, idx) => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%',
                  height: `${(d.count / maxTrend) * 80}px`,
                  background: idx === trendData.length - 1 ? '#dc2626' : '#1e3a5f',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s',
                  minHeight: 4,
                }} />
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{d.day}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1e3a5f' }}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 设备分布饼图 */}
      {activeChart === 'modality' && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {/* 简化的环形图 */}
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              {modalityData.reduce((acc, d, idx) => {
                const pct = d.value / totalModality
                const dashArray = pct * 377 // 2 * PI * 60
                const dashOffset = acc.offset
                acc.elements.push(
                  <circle
                    key={d.label}
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={d.color}
                    strokeWidth="20"
                    strokeDasharray={`${dashArray} ${377 - dashArray}`}
                    strokeDashoffset={-dashOffset}
                  />
                )
                acc.offset += dashArray
                return acc
              }, { elements: [] as any[], offset: 0 }).elements}
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>{totalModality}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>总计</div>
            </div>
          </div>

          {/* 图例 */}
          <div style={{ flex: 1 }}>
            {modalityData.map(d => (
              <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color }} />
                <div style={{ flex: 1, fontSize: 12, color: '#334155' }}>{d.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>{d.value}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', width: 40, textAlign: 'right' }}>
                  {Math.round((d.value / totalModality) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 处理时效柱状图 */}
      {activeChart === 'time' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>
            处理时效分布
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100 }}>
            {timeData.map(d => (
              <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%',
                  maxWidth: 48,
                  height: `${(d.value / maxTime) * 80}px`,
                  background: d.color,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s',
                  minHeight: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{d.value}</span>
                </div>
                <span style={{ fontSize: 10, color: '#64748b', textAlign: 'center' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 漏报率统计 */}
      {activeChart === 'missed' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>
            漏报率统计
          </div>

          {/* 概览卡片 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{
              flex: 1,
              background: '#f8fafc',
              borderRadius: 10,
              padding: 14,
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>本月检查总数</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1e3a5f' }}>{MOCK_MISSED_STATS.totalExams}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>人次</div>
            </div>
            <div style={{
              flex: 1,
              background: '#fef2f2',
              borderRadius: 10,
              padding: 14,
              border: '1px solid #fecaca',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>漏报次数</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626' }}>{MOCK_MISSED_STATS.missedCount}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>次</div>
            </div>
            <div style={{
              flex: 1,
              background: '#d1fae5',
              borderRadius: 10,
              padding: 14,
              border: '1px solid #a7f3d0',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>漏报率</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>{MOCK_MISSED_STATS.missedRate}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>低于目标1%</div>
            </div>
          </div>

          {/* 漏报原因分析 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 10 }}>
            漏报原因分析
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_MISSED_STATS.topMissedReasons.map((item, idx) => {
              const pct = Math.round((item.count / MOCK_MISSED_STATS.missedCount) * 100)
              return (
                <div key={item.reason} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: idx === 0 ? '#dc2626' : idx === 1 ? '#d97706' : idx === 2 ? '#2563eb' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#fff',
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: '#334155' }}>{item.reason}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>{item.count}次</span>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: idx === 0 ? '#dc2626' : idx === 1 ? '#d97706' : idx === 2 ? '#2563eb' : '#64748b',
                        borderRadius: 3,
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============ 子组件：规则设置弹窗 ============
const RulesSettingsModal = ({ onClose }: { onClose: () => void }) => {
  const [activeSection, setActiveSection] = useState<'range' | 'timeout' | 'notify'>('range')
  const [rules, setRules] = useState<CriticalValueRule[]>([
    {
      id: 'R001',
      modality: 'CT',
      examItem: '冠脉CTA',
      resultName: '冠脉狭窄率',
      normalMin: '0',
      normalMax: '50',
      criticalMin: '70',
      criticalMax: '100',
      unit: '%',
      notifyTimeout: 30,
      notifyMethods: ['系统通知', '短信通知'],
      enabled: true,
    },
    {
      id: 'R002',
      modality: 'CT',
      examItem: '头颅CT平扫',
      resultName: '中线偏移',
      normalMin: '0',
      normalMax: '5',
      criticalMin: '5',
      criticalMax: '20',
      unit: 'mm',
      notifyTimeout: 15,
      notifyMethods: ['系统通知', '电话通知'],
      enabled: true,
    },
    {
      id: 'R003',
      modality: 'MR',
      examItem: '头颅MR平扫',
      resultName: '占位大小',
      normalMin: '0',
      normalMax: '0',
      criticalMin: '1',
      criticalMax: '200',
      unit: 'cm',
      notifyTimeout: 30,
      notifyMethods: ['系统通知'],
      enabled: true,
    },
  ])

  const sections = [
    { key: 'range', label: '危急值范围', icon: AlertTriangle },
    { key: 'timeout', label: '超时提醒', icon: Timer },
    { key: 'notify', label: '通知方式', icon: Bell },
    { key: 'escalation', label: '升级规则', icon: ArrowUp },
  ]

  return (
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
        width: 800,
        maxHeight: '80vh',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 头部 */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#1e3a5f',
          borderRadius: '16px 16px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Settings size={20} style={{ color: '#fff' }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>危急值规则设置</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                配置各类检查结果的危急值范围及通知规则
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} style={{ color: '#fff' }} />
          </button>
        </div>

        {/* 标签页 */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}>
          {sections.map(sec => {
            const Icon = sec.icon
            return (
              <div
                key={sec.key}
                onClick={() => setActiveSection(sec.key as any)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderBottom: activeSection === sec.key ? '2px solid #1e3a5f' : '2px solid transparent',
                  background: activeSection === sec.key ? '#fff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Icon size={16} style={{ color: activeSection === sec.key ? '#1e3a5f' : '#94a3b8' }} />
                <span style={{ fontSize: 13, fontWeight: activeSection === sec.key ? 700 : 500, color: activeSection === sec.key ? '#1e3a5f' : '#94a3b8' }}>
                  {sec.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* 内容 */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {activeSection === 'range' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #1e3a5f',
                  background: '#1e3a5f',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  <Plus size={14} />
                  添加规则
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['设备', '检查项目', '指标名称', '正常范围', '危急范围', '单位', '状态', '操作'].map(h => (
                      <th key={h} style={{
                        padding: '10px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#64748b',
                        textAlign: 'left',
                        borderBottom: '1px solid #e2e8f0',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rules.map(rule => (
                    <tr key={rule.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155' }}>{rule.modality}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155' }}>{rule.examItem}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155' }}>{rule.resultName}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#059669' }}>
                        {rule.normalMin}~{rule.normalMax}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                        {rule.criticalMin}~{rule.criticalMax}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b' }}>{rule.unit}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 600,
                          background: rule.enabled ? '#d1fae5' : '#fee2e2',
                          color: rule.enabled ? '#059669' : '#dc2626',
                        }}>
                          {rule.enabled ? '已启用' : '已禁用'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          color: '#64748b',
                          fontSize: 11,
                          cursor: 'pointer',
                        }}>
                          编辑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'timeout' && (
            <div>
              <div style={{
                background: '#eff6ff',
                borderRadius: 10,
                padding: 16,
                border: '1px solid #bfdbfe',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>
                  超时提醒时间设置
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { label: '紧急提醒', minutes: 15, color: '#dc2626' },
                    { label: '危急提醒', minutes: 30, color: '#d97706' },
                    { label: '超时提醒', minutes: 60, color: '#2563eb' },
                  ].map(item => (
                    <div key={item.label} style={{
                      flex: 1,
                      padding: 14,
                      background: '#fff',
                      borderRadius: 8,
                      border: `1px solid ${item.color}`,
                    }}>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{item.label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="number"
                          defaultValue={item.minutes}
                          style={{
                            width: 60,
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: '1px solid #e2e8f0',
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#1e3a5f',
                            textAlign: 'center',
                          }}
                        />
                        <span style={{ fontSize: 12, color: '#64748b' }}>分钟</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notify' && (
            <div>
              <div style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: 16,
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>
                  通知方式配置
                </div>
                {[
                  { name: '系统通知', desc: 'RIS系统内即时消息推送', icon: Bell, color: '#1e3a5f' },
                  { name: '短信通知', desc: '发送到临床医生手机号码', icon: MessageSquare, color: '#2563eb' },
                  { name: '电话通知', desc: '自动拨打电话确认接收', icon: PhoneCall, color: '#d97706' },
                ].map(method => (
                  <div key={method.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 14,
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    marginBottom: 10,
                  }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: method.color + '15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <method.icon size={20} style={{ color: method.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>{method.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{method.desc}</div>
                    </div>
                    <div style={{
                      width: 48,
                      height: 24,
                      borderRadius: 12,
                      background: '#1e3a5f',
                      position: 'relative',
                      cursor: 'pointer',
                    }}>
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: 2,
                        right: 2,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'escalation' && (
            <div>
              <div style={{
                background: '#fffbeb',
                borderRadius: 10,
                padding: 16,
                border: '1px solid #fde68a',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <ArrowUp size={16} style={{ color: '#d97706' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>升级规则说明</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
                  当危急值在规定时间内未得到确认或处理时，系统将自动按照以下规则逐级升级通知，
                  确保危急值得到及时响应。升级规则按照紧急程度分为4个层级。
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #d97706',
                  background: '#fffbeb',
                  color: '#d97706',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  <Plus size={14} />
                  添加规则
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {MOCK_ESCALATION_RULES.map(rule => (
                  <div key={rule.id} style={{
                    background: '#f8fafc',
                    borderRadius: 10,
                    padding: 16,
                    border: `1px solid ${rule.enabled ? '#a7f3d0' : '#e2e8f0'}`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* 层级标识 */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 4,
                      height: '100%',
                      background: rule.level === 1 ? '#dc2626' : rule.level === 2 ? '#d97706' : rule.level === 3 ? '#2563eb' : '#64748b',
                    }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {/* 层级 */}
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: rule.level === 1 ? '#dc2626' : rule.level === 2 ? '#d97706' : rule.level === 3 ? '#2563eb' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{rule.level}</span>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>升级至：{rule.escalateTo}</span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: 10,
                            fontWeight: 600,
                            background: rule.enabled ? '#d1fae5' : '#f1f5f9',
                            color: rule.enabled ? '#059669' : '#94a3b8',
                          }}>
                            {rule.enabled ? '已启用' : '已禁用'}
                          </span>
                        </div>

                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                          触发条件：<span style={{ color: '#334155', fontWeight: 600 }}>{rule.triggerCondition}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {rule.escalateMethod.map(m => (
                              <span key={m} style={{
                                padding: '2px 8px',
                                background: '#e2e8f0',
                                borderRadius: 4,
                                fontSize: 11,
                                color: '#64748b',
                              }}>
                                {m}
                              </span>
                            ))}
                          </div>
                          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>
                            超时 <span style={{ fontWeight: 700, color: '#1e3a5f' }}>{rule.timeoutMinutes}</span> 分钟触发
                          </div>
                        </div>
                      </div>

                      <button style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        color: '#64748b',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}>
                        编辑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
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
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: '1px solid #1e3a5f',
              background: '#1e3a5f',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ 主组件 ============
export default function CriticalValuePage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [modalityFilter, setModalityFilter] = useState<string>('全部')
  const [severityFilter, setSeverityFilter] = useState<string>('全部')
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>('全部')
  const [dateRange, setDateRange] = useState('2026-05-01')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedCV, setSelectedCV] = useState<CriticalValue | null>(null)
  const [detailTab, setDetailTab] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [processCV, setProcessCV] = useState<CriticalValue | null>(null)

  const criticalValues = MOCK_CRITICAL_VALUES

  // 统计数据
  const stats = {
    pending: criticalValues.filter(c => c.status === '待处理').length,
    processing: criticalValues.filter(c => c.status === '处理中').length,
    resolved: criticalValues.filter(c => c.status === '已处理').length,
    overdue: criticalValues.filter(c => c.status === '超时').length,
  }

  // 筛选逻辑
  const filtered = criticalValues.filter(cv => {
    if (search) {
      const s = search.toLowerCase()
      if (!cv.patientName.toLowerCase().includes(s) &&
          !cv.id.toLowerCase().includes(s) &&
          !cv.accessionNumber?.toLowerCase().includes(s)) {
        return false
      }
    }
    if (statusFilter !== '全部' && cv.status !== statusFilter) return false
    if (modalityFilter !== '全部' && cv.modality !== modalityFilter) return false
    if (severityFilter !== '全部' && cv.severity !== severityFilter) return false
    return true
  })

  // 选中切换
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  // 全选切换
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)))
    }
  }

  // 处理危急值
  const handleProcess = (cv: CriticalValue) => {
    setProcessCV(cv)
    setShowProcessModal(true)
  }

  // 查看详情
  const handleViewDetail = (cv: CriticalValue) => {
    setSelectedCV(cv)
    setDetailTab(0)
  }

  // 联系临床
  const handleContactClinical = (cv: CriticalValue) => {
    alert(`正在联系 ${cv.receivingDoctorName || '临床科室'}...\n通知方式: ${cv.notificationMethod}`)
  }

  // 批量发送通知
  const handleBatchNotify = () => {
    alert(`正在批量发送通知给 ${selectedIds.size} 个危急值...\n${Array.from(selectedIds).join(', ')}`)
    setSelectedIds(new Set())
  }

  // 批量标记处理
  const handleBatchProcess = () => {
    alert(`正在批量标记处理 ${selectedIds.size} 个危急值...\n${Array.from(selectedIds).join(', ')}`)
    setSelectedIds(new Set())
  }

  const headerStyle = {
    padding: '10px 16px',
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
  }

  return (
    <div style={{ padding: 24, background: '#f1f5f9', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <ShieldAlert size={22} style={{ color: '#dc2626' }} />
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f', margin: 0 }}>
            危急值管理
          </h1>
        </div>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0, paddingLeft: 32 }}>
          危急值发现 · 即时预警 · 双环闭环 · 全生命周期管理
        </p>
      </div>

      {/* 顶部统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <StatCard
          label="待处理危急值"
          value={stats.pending}
          icon={Bell}
          color="#dc2626"
          bgColor="#fee2e2"
          trend={stats.pending > 0 ? '+' + stats.pending : undefined}
        />
        <StatCard
          label="处理中"
          value={stats.processing}
          icon={Clock}
          color="#d97706"
          bgColor="#fef3c7"
        />
        <StatCard
          label="已处理"
          value={stats.resolved}
          icon={CheckCircle}
          color="#059669"
          bgColor="#d1fae5"
          trend="+3"
        />
        <StatCard
          label="超时未处理"
          value={stats.overdue}
          icon={AlertTriangle}
          color="#991b1b"
          bgColor="#fecaca"
          trend={stats.overdue > 0 ? '+' + stats.overdue : undefined}
        />
      </div>

      {/* 统计图表 */}
      <StatisticsCharts data={criticalValues} />

      {/* 筛选操作栏 */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        modalityFilter={modalityFilter}
        setModalityFilter={setModalityFilter}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        timeRangeFilter={timeRangeFilter}
        setTimeRangeFilter={setTimeRangeFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onBatchNotify={handleBatchNotify}
        onBatchProcess={handleBatchProcess}
        selectedCount={selectedIds.size}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* 主体内容区 */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* 左侧列表 */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* 表头 */}
          <div style={headerStyle}>
            <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div onClick={toggleSelectAll} style={{ cursor: 'pointer', color: selectedIds.size === filtered.length && filtered.length > 0 ? '#1e3a5f' : '#cbd5e1' }}>
                {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
              </div>
            </div>
            <div style={{ width: 100 }}>危急值ID</div>
            <div style={{ width: 90 }}>患者姓名</div>
            <div style={{ width: 130 }}>检查项目</div>
            <div style={{ width: 60 }}>设备</div>
            <div style={{ width: 140 }}>检查结果</div>
            <div style={{ width: 90 }}>上报医生</div>
            <div style={{ width: 80 }}>状态</div>
            <div style={{ width: 90 }}>处理时间</div>
            <div style={{ width: 90 }}>处理耗时</div>
            <div style={{ flex: 1 }}>操作</div>
          </div>

          {/* 数据行 */}
          {filtered.length > 0 ? (
            filtered.map(cv => (
              <CriticalValueRow
                key={cv.id}
                cv={cv}
                isSelected={selectedIds.has(cv.id)}
                onSelect={() => toggleSelect(cv.id)}
                onProcess={() => handleProcess(cv)}
                onViewDetail={() => handleViewDetail(cv)}
                onContactClinical={() => handleContactClinical(cv)}
              />
            ))
          ) : (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
            }}>
              <AlertCircle size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>暂无危急值记录</div>
              <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>根据筛选条件未找到匹配的危急值</div>
            </div>
          )}

          {/* 底部统计 */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              共 <span style={{ fontWeight: 700, color: '#1e3a5f' }}>{filtered.length}</span> 条记录，
              已选中 <span style={{ fontWeight: 700, color: '#1e3a5f' }}>{selectedIds.size}</span> 项
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{key}: {criticalValues.filter(c => c.status === key).length}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧详情面板 */}
        {selectedCV && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ClosedLoopTracker cv={selectedCV} />
            <DetailPanel
              cv={selectedCV}
              onClose={() => setSelectedCV(null)}
              activeTab={detailTab}
              setActiveTab={setDetailTab}
            />
          </div>
        )}
      </div>

      {/* 规则设置弹窗 */}
      {showSettings && <RulesSettingsModal onClose={() => setShowSettings(false)} />}

      {/* 处理弹窗 */}
      {showProcessModal && processCV && (
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
            width: 500,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={20} style={{ color: '#059669' }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>处理危急值</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{processCV.id} · {processCV.patientName}</div>
                </div>
              </div>
              <button
                onClick={() => { setShowProcessModal(false); setProcessCV(null) }}
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
                <X size={16} style={{ color: '#64748b' }} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>危急值摘要</div>
                <div style={{
                  background: '#fef2f2',
                  borderRadius: 8,
                  padding: 12,
                  border: '1px solid #fecaca',
                  fontSize: 13,
                  color: '#334155',
                }}>
                  {processCV.findingDetails.substring(0, 100)}...
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>处理科室</div>
                <input
                  type="text"
                  defaultValue={processCV.receivingDepartment}
                  placeholder="请输入处理科室"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>处理措施</div>
                <textarea
                  placeholder="请输入处理措施..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>处理结果</div>
                <textarea
                  placeholder="请输入处理结果..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { setShowProcessModal(false); setProcessCV(null) }}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
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
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 8,
                    border: '1px solid #059669',
                    background: '#059669',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  确认处理完成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
