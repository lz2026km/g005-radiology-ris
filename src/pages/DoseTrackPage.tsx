// @ts-nocheck
// G005 放射科RIS系统 - 剂量追踪 v0.2.0
// G005-001 渐进式修改规范：模块化组件、数据接口规范、样式一致性
import { useState, useCallback } from 'react'
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Monitor,
  Download,
  Search,
  Filter,
  ShieldAlert,
  Info,
  FileText,
  Clock,
  User,
  Target,
  BarChart3,
  TrendingDown,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Award,
  Zap,
  RefreshCw,
  ChevronRight,
  FileSpreadsheet
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
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from 'recharts'

// ============ 常量定义 ============
// 法规阈值配置（依据《医疗照射放射防护标准》GBZ 130-2020）
const REGULATORY_THRESHOLDS = {
  CT: {
   头颅平扫: { DLP: 800, CTDIvol: 60, alertThreshold: 0.8 },
    胸部平扫: { DLP: 600, CTDIvol: 35, alertThreshold: 0.8 },
    腹部平扫: { DLP: 800, CTDIvol: 50, alertThreshold: 0.8 },
    冠脉CTA: { DLP: 1000, CTDIvol: 80, alertThreshold: 1.0 },
    胸部增强: { DLP: 1000, CTDIvol: 60, alertThreshold: 0.8 },
    腹部增强: { DLP: 1200, CTDIvol: 70, alertThreshold: 0.8 },
  },
  DR: {
    胸部正侧位: { DAP: 0.3, alertThreshold: 1.0 },
    腹部平片: { DAP: 1.0, alertThreshold: 1.0 },
    骨盆: { DAP: 0.5, alertThreshold: 1.0 },
  },
  DSA: {
    冠脉造影: { DAP: 3000, alertThreshold: 1.0 },
    脑血管造影: { DAP: 2500, alertThreshold: 1.0 },
    外周血管: { DAP: 2000, alertThreshold: 1.0 },
  },
  MG: {
    乳腺钼靶: { AGD: 6, alertThreshold: 1.0 },
  },
}

// ============ 类型定义 ============
interface PatientDoseRecord {
  id: string
  patientId: string
  patientName: string
  gender: string
  age: number
  modality: string
  examItem: string
  examDate: string
  doseType: string
  doseValue: number
  doseUnit: string
  alertLevel: 'normal' | 'warning' | 'critical'
  threshold: number
  device: string
  examCount: number
  cumulativeDLP: number
}

interface DeviceDoseData {
  device: string
  todayDLP: number
  todayCTDI: number
  todayDAP: number
  alertCount: number
  status: 'normal' | 'warning' | 'critical'
  examCount: number
  utilizationRate: number
  avgCTDI: number
  maxCTDI: number
}

interface DoseAlert {
  id: string
  patientName: string
  modality: string
  examItem: string
  doseValue: number
  threshold: number
  alertLevel: 'critical' | 'warning'
  device: string
  time: string
  status: 'pending' | 'acknowledged'
  notes?: string
}

interface DeviceHistoryPoint {
  date: string
  DLP: number
  CTDIvol: number
  DAP: number
  examCount: number
}

interface CumulativeStats {
  totalPatientsToday: number
  highDosePatients: number
  totalDLPToday: number
  doseAlertsToday: number
  averageDLP: { CT: number; DR: number; DSA: number; MG: number }
  totalExamCount: number
  criticalAlerts: number
  warningAlerts: number
  deviceOnlineCount: number
  averageCTDIvol: number
  doseReductionRate: number
}

// ============ 模拟数据 ============
const doseHistoryData = [
  { date: '04-25', CT: 1250, MR: 0, DR: 180, DSA: 420, MG: 8 },
  { date: '04-26', CT: 1180, MR: 0, DR: 195, DSA: 380, MG: 6 },
  { date: '04-27', CT: 1320, MR: 0, DR: 210, DSA: 450, MG: 10 },
  { date: '04-28', CT: 1190, MR: 0, DR: 175, DSA: 0, MG: 4 },
  { date: '04-29', CT: 980, MR: 0, DR: 120, DSA: 400, MG: 8 },
  { date: '04-30', CT: 1100, MR: 0, DR: 160, DSA: 390, MG: 12 },
  { date: '05-01', CT: 850, MR: 0, DR: 95, DSA: 200, MG: 4 },
]

// CTDIvol趋势数据
const ctdivolTrendData = [
  { date: '04-25', CT1: 22.5, CT2: 18.2, threshold: 50 },
  { date: '04-26', CT1: 21.8, CT2: 17.5, threshold: 50 },
  { date: '04-27', CT1: 24.2, CT2: 19.8, threshold: 50 },
  { date: '04-28', CT1: 20.5, CT2: 16.8, threshold: 50 },
  { date: '04-29', CT1: 18.9, CT2: 15.2, threshold: 50 },
  { date: '04-30', CT1: 23.1, CT2: 18.9, threshold: 50 },
  { date: '05-01', CT1: 19.5, CT2: 14.8, threshold: 50 },
]

// 设备DAP对比数据
const deviceDAPComparison = [
  { device: 'CT-1', DAP: 850, threshold: 1000, avgDAP: 720 },
  { device: 'CT-2', DAP: 620, threshold: 1000, avgDAP: 680 },
  { device: 'DR-1', DAP: 95, threshold: 300, avgDAP: 85 },
  { device: 'DR-2', DAP: 78, threshold: 300, avgDAP: 72 },
  { device: 'DSA-1', DAP: 4200, threshold: 3000, avgDAP: 3500 },
  { device: 'MG-1', DAP: 8, threshold: 10, avgDAP: 7.2 },
]

const deviceDoseData: DeviceDoseData[] = [
  { device: 'CT-1', todayDLP: 850, todayCTDI: 22.5, todayDAP: 850, alertCount: 2, status: 'normal', examCount: 28, utilizationRate: 85, avgCTDI: 21.2, maxCTDI: 28.5 },
  { device: 'CT-2', todayDLP: 620, todayCTDI: 18.2, todayDAP: 620, alertCount: 0, status: 'normal', examCount: 22, utilizationRate: 72, avgCTDI: 17.5, maxCTDI: 22.3 },
  { device: 'DR-1', todayDLP: 95, todayCTDI: 0.8, todayDAP: 95, alertCount: 0, status: 'normal', examCount: 45, utilizationRate: 90, avgCTDI: 0.75, maxCTDI: 1.2 },
  { device: 'DR-2', todayDLP: 78, todayCTDI: 0.6, todayDAP: 78, alertCount: 0, status: 'normal', examCount: 38, utilizationRate: 78, avgCTDI: 0.62, maxCTDI: 0.95 },
  { device: 'DSA-1', todayDLP: 4200, todayCTDI: 35.8, todayDAP: 4200, alertCount: 3, status: 'warning', examCount: 8, utilizationRate: 45, avgCTDI: 32.5, maxCTDI: 48.2 },
  { device: 'MG-1', todayDLP: 8, todayCTDI: 0.4, todayDAP: 8, alertCount: 0, status: 'normal', examCount: 18, utilizationRate: 65, avgCTDI: 0.38, maxCTDI: 0.52 },
]

const patientDoseRecords: PatientDoseRecord[] = [
  { id: 'DDR001', patientId: 'RAD-P001', patientName: '张志刚', gender: '男', age: 62, modality: 'CT', examItem: '冠脉CTA', examDate: '2026-05-01', doseType: 'DLP', doseValue: 856, doseUnit: 'mGy·cm', alertLevel: 'warning', threshold: 800, device: 'CT-1', examCount: 5, cumulativeDLP: 4200 },
  { id: 'DDR002', patientId: 'RAD-P004', patientName: '赵晓敏', gender: '女', age: 45, modality: 'CT', examItem: '头颅CT平扫', examDate: '2026-05-01', doseType: 'DLP', doseValue: 680, doseUnit: 'mGy·cm', alertLevel: 'normal', threshold: 800, device: 'CT-2', examCount: 2, cumulativeDLP: 1250 },
  { id: 'DDR003', patientId: 'RAD-P005', patientName: '周玉芬', gender: '女', age: 52, modality: 'CT', examItem: '腹部CT增强', examDate: '2026-05-01', doseType: 'DLP', doseValue: 1250, doseUnit: 'mGy·cm', alertLevel: 'critical', threshold: 1000, device: 'CT-2', examCount: 3, cumulativeDLP: 2800 },
  { id: 'DDR004', patientId: 'RAD-P001', patientName: '张志刚', gender: '男', age: 62, modality: 'DSA', examItem: '冠脉造影', examDate: '2026-04-28', doseType: 'DAP', doseValue: 3850, doseUnit: 'mGy·m²', alertLevel: 'critical', threshold: 3000, device: 'DSA-1', examCount: 12, cumulativeDLP: 15000 },
  { id: 'DDR005', patientId: 'RAD-P007', patientName: '吴婷', gender: '女', age: 42, modality: '乳腺钼靶', examItem: '乳腺钼靶', examDate: '2026-05-01', doseType: 'AGD', doseValue: 4.2, doseUnit: 'mGy', alertLevel: 'normal', threshold: 6, device: 'MG-1', examCount: 1, cumulativeDLP: 4.2 },
  { id: 'DDR006', patientId: 'RAD-P003', patientName: '王建国', gender: '男', age: 58, modality: 'DR', examItem: '胸部DR正侧位', examDate: '2026-05-01', doseType: 'DAP', doseValue: 0.15, doseUnit: 'mGy·m²', alertLevel: 'normal', threshold: 1, device: 'DR-1', examCount: 8, cumulativeDLP: 1.2 },
  { id: 'DDR007', patientId: 'RAD-P008', patientName: '李秀英', gender: '女', age: 68, modality: 'CT', examItem: '胸部CT平扫', examDate: '2026-05-01', doseType: 'DLP', doseValue: 580, doseUnit: 'mGy·cm', alertLevel: 'normal', threshold: 600, device: 'CT-1', examCount: 4, cumulativeDLP: 2100 },
  { id: 'DDR008', patientId: 'RAD-P009', patientName: '陈伟民', gender: '男', age: 55, modality: 'DSA', examItem: '脑血管造影', examDate: '2026-04-30', doseType: 'DAP', doseValue: 2650, doseUnit: 'mGy·m²', alertLevel: 'warning', threshold: 2500, device: 'DSA-1', examCount: 6, cumulativeDLP: 8500 },
]

const doseAlerts: DoseAlert[] = [
  { id: 'ALERT001', patientName: '周玉芬', modality: 'CT', examItem: '腹部CT增强', doseValue: 1250, threshold: 1000, alertLevel: 'critical', device: 'CT-2', time: '2026-05-01 14:30', status: 'pending' },
  { id: 'ALERT002', patientName: '张志刚', modality: 'DSA', examItem: '冠脉造影', doseValue: 3850, threshold: 3000, alertLevel: 'critical', device: 'DSA-1', time: '2026-04-28 11:20', status: 'acknowledged', notes: '已进行剂量优化讨论' },
  { id: 'ALERT003', patientName: '张志刚', modality: 'CT', examItem: '冠脉CTA', doseValue: 856, threshold: 800, alertLevel: 'warning', device: 'CT-1', time: '2026-05-01 09:45', status: 'pending' },
  { id: 'ALERT004', patientName: '陈伟民', modality: 'DSA', examItem: '脑血管造影', doseValue: 2650, threshold: 2500, alertLevel: 'warning', device: 'DSA-1', time: '2026-04-30 16:20', status: 'pending' },
]

const cumulativeStats: CumulativeStats = {
  totalPatientsToday: 247,
  highDosePatients: 8,
  totalDLPToday: 2865,
  doseAlertsToday: 5,
  averageDLP: { CT: 720, DR: 0.12, DSA: 2800, MG: 3.8 },
  totalExamCount: 312,
  criticalAlerts: 2,
  warningAlerts: 3,
  deviceOnlineCount: 6,
  averageCTDIvol: 18.5,
  doseReductionRate: 5.2,
}

// ============ 工具函数 ============
const getAlertBadge = (level: string) => {
  if (level === 'critical') return { bg: '#fef2f2', color: '#dc2626', label: '危', border: '#fecaca' }
  if (level === 'warning') return { bg: '#fffbeb', color: '#d97706', label: '警', border: '#fde68a' }
  return { bg: '#f0fdf4', color: '#16a34a', label: '正', border: '#bbf7d0' }
}

const getStatusBadge = (status: string) => {
  if (status === 'critical') return { bg: '#fef2f2', color: '#dc2626', label: '超标' }
  if (status === 'warning') return { bg: '#fffbeb', color: '#d97706', label: '预警' }
  return { bg: '#f0fdf4', color: '#16a34a', label: '正常' }
}

// ============ CSV导出函数 ============
const exportDoseDataToCSV = (data: PatientDoseRecord[], filename: string = 'dose_records.csv') => {
  const headers = [
    '记录ID',
    '患者ID',
    '患者姓名',
    '性别',
    '年龄',
    '设备类型',
    '检查项目',
    '检查日期',
    '剂量类型',
    '剂量值',
    '单位',
    '阈值',
    '预警级别',
    '使用设备',
    '累计检查次数',
    '累计DLP'
  ]

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.id,
      row.patientId,
      row.patientName,
      row.gender,
      row.age,
      row.modality,
      row.examItem,
      row.examDate,
      row.doseType,
      row.doseValue,
      row.doseUnit,
      row.threshold,
      row.alertLevel,
      row.device,
      row.examCount,
      row.cumulativeDLP
    ].join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

const exportDeviceDoseToCSV = (data: DeviceDoseData[], filename: string = 'device_dose.csv') => {
  const headers = [
    '设备名称',
    '今日DLP',
    '今日CTDIvol',
    '今日DAP',
    '预警次数',
    '状态',
    '检查人数',
    '利用率(%)',
    '平均CTDI',
    '最大CTDI'
  ]

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.device,
      row.todayDLP,
      row.todayCTDI,
      row.todayDAP,
      row.alertCount,
      row.status,
      row.examCount,
      row.utilizationRate,
      row.avgCTDI,
      row.maxCTDI
    ].join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

// ============ 子组件 ============

// 患者剂量档案卡组件
const PatientDoseProfileCard = ({ patient }: { patient: PatientDoseRecord }) => {
  const badge = getAlertBadge(patient.alertLevel)
  const doseRatio = patient.doseValue / patient.threshold
  const modalityThresholds = REGULATORY_THRESHOLDS[patient.modality as keyof typeof REGULATORY_THRESHOLDS]
  const examThreshold = modalityThresholds?.[patient.examItem as keyof typeof modalityThresholds]

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: `1px solid ${badge.border}`,
      overflow: 'hidden'
    }}>
      {/* 头部 */}
      <div style={{
        padding: '14px 16px',
        background: badge.bg,
        borderBottom: `1px solid ${badge.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={18} color={badge.color} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{patient.patientName}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {patient.gender} · {patient.age}岁 · ID: {patient.patientId}
            </div>
          </div>
        </div>
        <span style={{
          padding: '4px 10px',
          background: badge.bg,
          color: badge.color,
          border: `1px solid ${badge.border}`,
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700
        }}>
          {badge.label}级预警
        </span>
      </div>

      {/* 内容 */}
      <div style={{ padding: 16 }}>
        {/* 检查信息 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Monitor size={14} color="#64748b" />
            <span style={{ fontSize: 12, color: '#64748b' }}>设备:</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{patient.device}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={14} color="#64748b" />
            <span style={{ fontSize: 12, color: '#64748b' }}>日期:</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{patient.examDate}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <span style={{
            padding: '3px 10px',
            background: '#eff6ff',
            color: '#2563eb',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600
          }}>
            {patient.modality}
          </span>
          <span style={{
            padding: '3px 10px',
            background: '#f5f3ff',
            color: '#7c3aed',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600
          }}>
            {patient.examItem}
          </span>
        </div>

        {/* 剂量信息 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>本次剂量</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: badge.color }}>
              {patient.doseValue}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>{patient.doseUnit}</div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>法规阈值</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>
              {patient.threshold}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>{patient.doseUnit}</div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>占比</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: doseRatio > 1 ? '#dc2626' : '#16a34a' }}>
              {Math.round(doseRatio * 100)}%
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>阈值比</div>
          </div>
        </div>

        {/* 剂量进度条 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>剂量安全指标</span>
            <span style={{ fontSize: 11, color: doseRatio > 1 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
              {doseRatio > 1 ? '超出' : '在控'}{Math.round((doseRatio - 1) * 100)}%
            </span>
          </div>
          <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(doseRatio * 100, 100)}%`,
              background: doseRatio > 1 ? '#dc2626' : doseRatio > 0.8 ? '#d97706' : '#16a34a',
              borderRadius: 4,
              transition: 'width 0.3s'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>0%</span>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>80%</span>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>100%</span>
          </div>
        </div>

        {/* 统计信息 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          padding: 12,
          background: '#f8fafc',
          borderRadius: 8
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e3a5f' }}>{patient.examCount}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>累计检查</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e3a5f' }}>{patient.cumulativeDLP}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>累计DLP</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e3a5f' }}>
              {examThreshold ? examThreshold.DLP || examThreshold.DAP || examThreshold.AGD : '-'}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>参考值</div>
          </div>
        </div>
      </div>

      {/* 底部操作 */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        gap: 8
      }}>
        <button style={{
          flex: 1,
          padding: '8px 12px',
          background: '#eff6ff',
          color: '#2563eb',
          border: 'none',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}>
          <Eye size={13} /> 查看详情
        </button>
        <button style={{
          flex: 1,
          padding: '8px 12px',
          background: '#f8fafc',
          color: '#334155',
          border: 'none',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}>
          <FileText size={13} /> 历史记录
        </button>
      </div>
    </div>
  )
}

// 设备DAP对比柱状图组件
const DeviceDAPComparisonChart = () => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{
          background: '#fff',
          padding: 12,
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>{data.device}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            <div>今日DAP: <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{data.DAP}</span></div>
            <div>平均DAP: <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{data.avgDAP}</span></div>
            <div>法规阈值: <span style={{ fontWeight: 600, color: '#d97706' }}>{data.threshold}</span></div>
            <div>占比: <span style={{ fontWeight: 600, color: data.DAP > data.threshold ? '#dc2626' : '#16a34a' }}>
              {Math.round(data.DAP / data.threshold * 100)}%
            </span></div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>设备DAP对比分析</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>今日DAP vs 法规阈值 vs 设备平均值</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#3b82f6' }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>今日DAP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#94a3b8' }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>平均DAP</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={deviceDAPComparison} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="device" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={3000} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'DSA阈值', position: 'right', fontSize: 10, fill: '#dc2626' }} />
          <ReferenceLine y={1000} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'CT阈值', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
          <Bar dataKey="DAP" fill="#3b82f6" radius={[4, 4, 0, 0]} name="今日DAP">
            {deviceDAPComparison.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.DAP > entry.threshold ? '#dc2626' : '#3b82f6'} />
            ))}
          </Bar>
          <Bar dataKey="avgDAP" fill="#94a3b8" radius={[4, 4, 0, 0]} name="平均DAP" />
        </BarChart>
      </ResponsiveContainer>
      {/* 法规阈值说明 */}
      <div style={{
        marginTop: 12,
        padding: '10px 12px',
        background: '#f8fafc',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <ShieldAlert size={14} color="#d97706" />
        <span style={{ fontSize: 11, color: '#64748b' }}>
          法规阈值: CT DLP {'<'} 1000mGy·cm | DR DAP {'<'} 300mGy·m² | DSA DAP {'<'} 3000mGy·m² | MG AGD {'<'} 6mGy
        </span>
      </div>
    </div>
  )
}

// CTDIvol趋势折线图组件
const CTDIvolTrendChart = () => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#fff',
          padding: 12,
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            <div>CT-1: <span style={{ fontWeight: 600, color: '#3b82f6' }}>{payload[0]?.value} mGy</span></div>
            <div>CT-2: <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{payload[1]?.value} mGy</span></div>
            <div>法规阈值: <span style={{ fontWeight: 600, color: '#dc2626' }}>{payload[2]?.value} mGy</span></div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>CTDIvol 趋势监控</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>CT设备7日CTDIvol趋势及法规阈值</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 3, background: '#3b82f6', borderRadius: 2 }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>CT-1</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 3, background: '#8b5cf6', borderRadius: 2 }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>CT-2</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 3, background: '#dc2626', borderRadius: 2 }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>阈值</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={ctdivolTrendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 60]} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="CT1" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }} name="CT-1" />
          <Line type="monotone" dataKey="CT2" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }} name="CT-2" />
          <Line type="monotone" dataKey="threshold" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" dot={false} name="法规阈值" />
        </LineChart>
      </ResponsiveContainer>
      {/* 统计摘要 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        marginTop: 16,
        padding: 12,
        background: '#f8fafc',
        borderRadius: 8
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#3b82f6' }}>21.5</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>CT-1均值</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#8b5cf6' }}>17.2</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>CT-2均值</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>-12%</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>较上周</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#dc2626' }}>0</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>超阈值天数</div>
        </div>
      </div>
    </div>
  )
}

// 法规阈值标注组件
const RegulatoryThresholdBadge = ({ modality, examItem }: { modality: string; examItem: string }) => {
  const thresholds = REGULATORY_THRESHOLDS[modality as keyof typeof REGULATORY_THRESHOLDS]
  const examThreshold = thresholds?.[examItem as keyof typeof thresholds]

  if (!examThreshold) return null

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      background: '#fffbeb',
      border: '1px solid #fde68a',
      borderRadius: 4,
      fontSize: 10
    }}>
      <ShieldAlert size={10} color="#d97706" />
      <span style={{ color: '#d97706' }}>
        阈值: DLP {examThreshold.DLP || examThreshold.DAP || examThreshold.AGD || '-'}
      </span>
    </div>
  )
}

// 设备历史趋势弹窗组件
const DeviceHistoryModal = ({ device, onClose }: { device: string; onClose: () => void }) => {
  const mockHistoryData = [
    { date: '04-25', DLP: 820, CTDI: 22.5, examCount: 25 },
    { date: '04-26', DLP: 780, CTDI: 21.2, examCount: 23 },
    { date: '04-27', DLP: 950, CTDI: 25.8, examCount: 28 },
    { date: '04-28', DLP: 690, CTDI: 18.5, examCount: 20 },
    { date: '04-29', DLP: 850, CTDI: 23.2, examCount: 26 },
    { date: '04-30', DLP: 920, CTDI: 24.5, examCount: 27 },
    { date: '05-01', DLP: 850, CTDI: 22.5, examCount: 28 },
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
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        width: 600,
        maxHeight: '80vh',
        overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>{device} 历史趋势</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>近7日剂量趋势分析</div>
          </div>
          <button onClick={onClose} style={{
            padding: 8,
            background: '#f8fafc',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}>
            <XCircle size={18} color="#64748b" />
          </button>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockHistoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="DLP" stroke="#3b82f6" strokeWidth={2} name="DLP" />
            <Line type="monotone" dataKey="CTDI" stroke="#8b5cf6" strokeWidth={2} name="CTDIvol" />
          </LineChart>
        </ResponsiveContainer>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>7日平均DLP</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>840</div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>7日平均CTDI</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>22.6</div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>总检查量</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>177</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ 主组件 ============
export default function DoseTrackPage() {
  const [view, setView] = useState<'overview' | 'patient' | 'device' | 'alert'>('overview')
  const [modalityFilter, setModalityFilter] = useState<string>('全部')
  const [alertFilter, setAlertFilter] = useState<string>('全部')
  const [searchText, setSearchText] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientDoseRecord | null>(null)
  const [deviceHistoryDevice, setDeviceHistoryDevice] = useState<string | null>(null)

  const modalities = ['全部', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶', '胃肠造影']

  // 过滤数据
  const filteredPatientRecords = patientDoseRecords.filter(record => {
    const matchesModality = modalityFilter === '全部' || record.modality === modalityFilter
    const matchesSearch = !searchText ||
      record.patientName.includes(searchText) ||
      record.patientId.includes(searchText) ||
      record.examItem.includes(searchText)
    return matchesModality && matchesSearch
  })

  const filteredAlerts = doseAlerts.filter(alert => {
    if (alertFilter === '全部') return true
    return alert.status === alertFilter
  })

  // 处理导出
  const handleExportPatientCSV = useCallback(() => {
    exportDoseDataToCSV(filteredPatientRecords, `patient_dose_${new Date().toISOString().split('T')[0]}.csv`)
  }, [filteredPatientRecords])

  const handleExportDeviceCSV = useCallback(() => {
    exportDeviceDoseToCSV(deviceDoseData, `device_dose_${new Date().toISOString().split('T')[0]}.csv`)
  }, [])

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* 页面标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>剂量追踪</h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>患者辐射剂量监测 · 设备剂量统计 · 超剂量预警</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleExportPatientCSV}
            style={{
              padding: '6px 14px',
              background: '#fff',
              color: '#334155',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <FileSpreadsheet size={13} /> 导出患者数据
          </button>
          <button
            onClick={handleExportDeviceCSV}
            style={{
              padding: '6px 14px',
              background: '#fff',
              color: '#334155',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <BarChart3 size={13} /> 导出设备数据
          </button>
        </div>
      </div>

      {/* 核心统计卡片 - 增强版 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {/* 今日检查人数 */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b' }}>今日检查人数</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.2, marginTop: 4 }}>
              {cumulativeStats.totalPatientsToday}
            </div>
            <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp size={11} /> +5.2%
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <Activity size={18} />
          </div>
        </div>

        {/* 高剂量患者 */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b' }}>高剂量患者</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626', lineHeight: 1.2, marginTop: 4 }}>
              {cumulativeStats.highDosePatients}
            </div>
            <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <AlertTriangle size={11} /> +2人
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* 今日总DLP */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b' }}>今日总DLP</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.2, marginTop: 4 }}>
              {cumulativeStats.totalDLPToday}
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}> mGy·cm</span>
            </div>
            <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingDown size={11} /> -3.1%
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <TrendingUp size={18} />
          </div>
        </div>

        {/* 剂量预警 */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b' }}>剂量预警</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706', lineHeight: 1.2, marginTop: 4 }}>
              {cumulativeStats.doseAlertsToday}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              <span style={{ color: '#dc2626' }}>{cumulativeStats.criticalAlerts}危</span> / <span style={{ color: '#d97706' }}>{cumulativeStats.warningAlerts}警</span>
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <ShieldAlert size={18} />
          </div>
        </div>

        {/* 监控设备数 */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b' }}>在线设备</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.2, marginTop: 4 }}>
              {cumulativeStats.deviceOnlineCount}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              平均CTDI: {cumulativeStats.averageCTDIvol} mGy
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <Monitor size={18} />
          </div>
        </div>
      </div>

      {/* 次级统计卡片 - 剂量优化趋势 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <Award size={16} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#64748b' }}>剂量降低率</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>{cumulativeStats.doseReductionRate}%</div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <Zap size={16} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#64748b' }}>今日检查量</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#3b82f6' }}>{cumulativeStats.totalExamCount}</div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Clock size={16} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#64748b' }}>平均CTDIvol</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#8b5cf6' }}>{cumulativeStats.averageCTDIvol} mGy</div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <CheckCircle size={16} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#64748b' }}>待处理预警</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626' }}>{doseAlerts.filter(a => a.status === 'pending').length}</div>
          </div>
        </div>
      </div>

      {/* 视图切换 + 筛选器 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
          {(['overview', 'patient', 'device', 'alert'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: view === v ? '#fff' : 'transparent',
                color: view === v ? '#1e3a5f' : '#64748b',
                boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {v === 'overview' && <BarChart3 size={14} />}
              {v === 'patient' && <User size={14} />}
              {v === 'device' && <Monitor size={14} />}
              {v === 'alert' && <ShieldAlert size={14} />}
              {v === 'overview' ? '总览' : v === 'patient' ? '患者剂量' : v === 'device' ? '设备剂量' : '剂量预警'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="搜索患者/检查..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                padding: '6px 10px 6px 30px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                width: 180,
                outline: 'none'
              }}
            />
          </div>
          {view !== 'alert' && (
            <select
              value={modalityFilter}
              onChange={e => setModalityFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                color: '#334155',
                outline: 'none'
              }}
            >
              {modalities.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
          {view === 'alert' && (
            <select
              value={alertFilter}
              onChange={e => setAlertFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                color: '#334155',
                outline: 'none'
              }}
            >
              <option value="全部">全部状态</option>
              <option value="pending">待处理</option>
              <option value="acknowledged">已确认</option>
            </select>
          )}
        </div>
      </div>

      {/* 总览视图 */}
      {view === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 剂量趋势图 + CTDIvol趋势 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* 剂量趋势图 */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>各类设备剂量趋势（本周DLP合计）</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={doseHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}`} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v} mGy·cm`, 'DLP']} />
                  <Legend iconSize={10} />
                  <Bar dataKey="CT" fill="#3b82f6" name="CT" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="DR" fill="#22c55e" name="DR" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="DSA" fill="#f59e0b" name="DSA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CTDIvol趋势 */}
            <CTDIvolTrendChart />
          </div>

          {/* 设备DAP对比 */}
          <DeviceDAPComparisonChart />

          {/* 设备状态列表 */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>设备今日剂量状态</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {deviceDoseData.map(d => {
                const badge = d.status === 'warning' ? { bg: '#fffbeb', color: '#d97706' } : { bg: '#f0fdf4', color: '#16a34a' }
                return (
                  <div
                    key={d.device}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      borderRadius: 8
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Monitor size={14} color="#64748b" />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{d.device}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>
                          DLP: {d.todayDLP} mGy·cm · CTDI: {d.todayCTDI} mGy
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {d.alertCount > 0 && (
                        <span style={{
                          padding: '2px 6px',
                          background: '#fef2f2',
                          color: '#dc2626',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600
                        }}>
                          {d.alertCount}起
                        </span>
                      )}
                      <span style={{
                        padding: '2px 8px',
                        background: badge.bg,
                        color: badge.color,
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600
                      }}>
                        {d.status === 'warning' ? '预警' : '正常'}
                      </span>
                      <button
                        onClick={() => setDeviceHistoryDevice(d.device)}
                        style={{
                          padding: '4px 8px',
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 10,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}
                      >
                        <Clock size={10} /> 历史
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 患者剂量视图 */}
      {view === 'patient' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* 患者剂量记录列表 */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>患者剂量记录</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                <Info size={12} />
                <span>显示近30天内接受辐射检查的患者剂量记录</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: 500, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>
                  <tr>
                    {['患者姓名', '性别', '年龄', '设备', '检查项目', '检查日期', '剂量值', '预警级别', '操作'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPatientRecords.map((r, i) => {
                    const badge = getAlertBadge(r.alertLevel)
                    return (
                      <tr
                        key={r.id}
                        style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? '#fff' : '#fafbfc', cursor: 'pointer' }}
                        onClick={() => setSelectedPatient(r)}
                      >
                        <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{r.patientName}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155' }}>{r.gender}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155' }}>{r.age}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155' }}>
                          <span style={{ padding: '2px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{r.modality}</span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155' }}>{r.examItem}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b' }}>{r.examDate}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: r.alertLevel === 'critical' ? '#dc2626' : r.alertLevel === 'warning' ? '#d97706' : '#1e3a5f' }}>
                          {r.doseValue} <span style={{ fontSize: 10, fontWeight: 400 }}>{r.doseUnit}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '2px 8px', background: badge.bg, color: badge.color, borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                            {badge.label}级
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedPatient(r) }}
                            style={{ padding: '4px 10px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
                          >
                            详情
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 患者剂量档案卡 */}
          <div>
            {selectedPatient ? (
              <PatientDoseProfileCard patient={selectedPatient} />
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 40,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12
              }}>
                <User size={48} color="#e2e8f0" />
                <div style={{ fontSize: 14, color: '#94a3b8' }}>点击左侧患者记录查看剂量档案</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 设备剂量视图 */}
      {view === 'device' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {deviceDoseData.map(d => (
            <div key={d.device} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Monitor size={18} color="#3b82f6" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{d.device}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: d.status === 'warning' ? '#d97706' : '#16a34a'
                        }} />
                        {d.status === 'warning' ? '预警运行' : '正常运行'}
                      </span>
                    </div>
                  </div>
                </div>
                {d.alertCount > 0 && (
                  <span style={{
                    padding: '4px 10px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <AlertTriangle size={12} /> {d.alertCount}起预警
                  </span>
                )}
              </div>

              {/* 剂量指标 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>今日DLP</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f' }}>{d.todayDLP}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>mGy·cm</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>CTDIvol</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f' }}>{d.todayCTDI}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>mGy</div>
                </div>
              </div>

              {/* 详细统计 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                <div style={{ textAlign: 'center', padding: 8, background: '#f8fafc', borderRadius: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{d.examCount}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>检查人数</div>
                </div>
                <div style={{ textAlign: 'center', padding: 8, background: '#f8fafc', borderRadius: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{d.utilizationRate}%</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>利用率</div>
                </div>
                <div style={{ textAlign: 'center', padding: 8, background: '#f8fafc', borderRadius: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{d.avgCTDI}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>平均CTDI</div>
                </div>
              </div>

              {/* CTDI范围 */}
              <div style={{ marginBottom: 12, padding: 10, background: '#f8fafc', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>CTDIvol范围</span>
                  <span style={{ fontSize: 11, color: '#1e3a5f', fontWeight: 600 }}>{d.avgCTDI} - {d.maxCTDI} mGy</span>
                </div>
                <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(d.maxCTDI / 60) * 100}%`,
                    background: d.maxCTDI > 50 ? '#dc2626' : '#3b82f6',
                    borderRadius: 2
                  }} />
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setDeviceHistoryDevice(d.device)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <Clock size={13} /> 历史趋势
                </button>
                <button style={{
                  flex: 1,
                  padding: '8px',
                  background: '#f8fafc',
                  color: '#334155',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}>
                  <FileText size={13} /> 质控报告
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 剂量预警视图 */}
      {view === 'alert' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="#dc2626" />
              待处理预警
              <span style={{
                padding: '2px 8px',
                background: '#fef2f2',
                color: '#dc2626',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700
              }}>
                {doseAlerts.filter(a => a.status === 'pending').length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredAlerts.filter(a => a.status === 'pending').map(alert => {
                const badge = alert.alertLevel === 'critical'
                  ? { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' }
                  : { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }
                const exceedPercent = Math.round((alert.doseValue / alert.threshold - 1) * 100)
                return (
                  <div
                    key={alert.id}
                    style={{
                      padding: 14,
                      border: `1px solid ${badge.border}`,
                      borderRadius: 10,
                      background: badge.bg
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>{alert.patientName}</span>
                        <span style={{
                          padding: '2px 6px',
                          background: '#eff6ff',
                          color: '#2563eb',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600
                        }}>
                          {alert.modality}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          background: badge.bg,
                          color: badge.color,
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700
                        }}>
                          {alert.alertLevel === 'critical' ? '危' : '警'}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>{alert.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                      {alert.examItem} · 设备：{alert.device}
                    </div>
                    <div style={{ fontSize: 12, color: badge.color, fontWeight: 600, marginBottom: 4 }}>
                      实测剂量：{alert.doseValue} mGy·cm（阈值：{alert.threshold}）
                      <span style={{ marginLeft: 8 }}>超出 {exceedPercent}%</span>
                    </div>
                    {/* 剂量超出进度条 */}
                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min((alert.doseValue / alert.threshold) * 100, 100)}%`,
                        background: alert.alertLevel === 'critical' ? '#dc2626' : '#d97706',
                        borderRadius: 3
                      }} />
                    </div>
                    {/* 法规阈值标注 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginBottom: 10,
                      padding: '6px 10px',
                      background: '#fff',
                      borderRadius: 4,
                      fontSize: 11
                    }}>
                      <ShieldAlert size={12} color="#d97706" />
                      <span style={{ color: '#64748b' }}>
                        依据GBZ 130-2020《医疗照射放射防护标准》，
                        {alert.modality === 'CT' ? 'CT头颅平扫DLP参考值800mGy·cm' :
                         alert.modality === 'DSA' ? 'DSA冠脉造影DAP参考值3000mGy·m²' : '该检查类型参考值'}，
                        当前剂量超出指导水平
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{
                        flex: 1,
                        padding: '6px 12px',
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}>
                        <CheckCircle size={12} /> 确认处理
                      </button>
                      <button style={{
                        flex: 1,
                        padding: '6px 12px',
                        background: '#fff',
                        color: '#334155',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}>
                        <Eye size={12} /> 查看详情
                      </button>
                    </div>
                  </div>
                )
              })}
              {filteredAlerts.filter(a => a.status === 'pending').length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  <CheckCircle size={48} color="#e2e8f0" style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 14 }}>暂无待处理预警</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={16} color="#16a34a" />
              已处理记录
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {doseAlerts.filter(a => a.status === 'acknowledged').map(alert => (
                <div
                  key={alert.id}
                  style={{
                    padding: 12,
                    background: '#f8fafc',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{alert.patientName}</span>
                      <span style={{
                        padding: '2px 6px',
                        background: '#f0fdf4',
                        color: '#16a34a',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600
                      }}>
                        已确认
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {alert.examItem} · {alert.time}
                    </div>
                    {alert.notes && (
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        备注: {alert.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', textAlign: 'right' }}>
                    <div>超出 {Math.round((alert.doseValue / alert.threshold - 1) * 100)}%</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{alert.doseValue}/{alert.threshold}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 预警统计摘要 */}
            <div style={{
              marginTop: 20,
              padding: 16,
              background: '#f8fafc',
              borderRadius: 8
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>本月预警统计</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626' }}>{cumulativeStats.criticalAlerts}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>危级预警</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#d97706' }}>{cumulativeStats.warningAlerts}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>警告级</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>0</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>超时未处理</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 设备历史趋势弹窗 */}
      {deviceHistoryDevice && (
        <DeviceHistoryModal
          device={deviceHistoryDevice}
          onClose={() => setDeviceHistoryDevice(null)}
        />
      )}

      {/* 底部说明 */}
      <div style={{
        marginTop: 20,
        padding: '12px 16px',
        background: '#f8fafc',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10
      }}>
        <Info size={14} style={{ color: '#64748b', marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
          <strong style={{ color: '#334155' }}>剂量参考：</strong>
          CT头颅平扫 DLP参考值约700-800 mGy·cm；胸部CT平扫约400-600 mGy·cm；冠脉CTA约800-1200 mGy·cm；
          DSA冠脉造影约2000-4000 mGy·m²；乳腺钼靶约3-6 mGy。
          根据《医疗照射放射防护标准》GBZ 130-2020要求，对超出指导水平的检查应进行患者剂量优化分析。
          法规阈值标注依据国家标准制定，超出阈值时系统自动触发预警机制。
        </div>
      </div>

      {/* 版本信息 */}
      <div style={{
        marginTop: 12,
        textAlign: 'center',
        fontSize: 10,
        color: '#94a3b8'
      }}>
        DoseTrackPage v0.2.0 · G005-001渐进式修改规范 · 最后更新: 2026-05-02
      </div>
    </div>
  )
}
