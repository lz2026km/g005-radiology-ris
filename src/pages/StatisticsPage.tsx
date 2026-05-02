// @ts-nocheck
// G005 放射科RIS系统 - 统计分析页面 v2.0.0
// 完整重写：6大标签页，800+行，inline样式，recharts图表
import { useState } from 'react'
import {
  BarChart3, TrendingUp, TrendingDown, Calendar, Download, Activity,
  PieChart as PieChartIcon, DollarSign, Users, Clock, CheckCircle,
  AlertTriangle, ShieldCheck, Scan, Monitor, Wrench, Thermometer,
  Zap, Award, Target, Radio, Image as ImageIcon, UserCheck,
  Filter, RefreshCw, ChevronRight, Star, AlertCircle, Edit3,
  Timer, Percent, LineChart as LineChartIcon
} from 'lucide-react'
import {
  LineChart, Line, BarChart as StatBarChart, Bar, PieChart as StatPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts'
import {
  initialStatisticsData, initialWorkloadStats, initialRadiologyExams,
  initialModalityDevices, initialUsers, initialDailyStats
} from '../data/initialData'

// ============================================================
// 样式常量
// ============================================================
const C = {
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
}

const RAD_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#f97316', '#06b6d4']

// ============================================================
// 模拟统计数据（扩展数据）
// ============================================================
const sevenDayData = [
  { day: '周一', exams: 312, reports: 298, critical: 8, revenue: 124800 },
  { day: '周二', exams: 328, reports: 315, critical: 6, revenue: 131200 },
  { day: '周三', exams: 345, reports: 330, critical: 10, revenue: 138000 },
  { day: '周四', exams: 298, reports: 285, critical: 5, revenue: 119200 },
  { day: '周五', exams: 356, reports: 340, critical: 9, revenue: 142400 },
  { day: '周六', exams: 185, reports: 178, critical: 2, revenue: 74000 },
  { day: '周日', exams: 92, reports: 88, critical: 1, revenue: 36800 },
]

const timeSlotData = [
  { slot: '0-6时', exams: 12 },
  { slot: '6-9时', exams: 145 },
  { slot: '9-12时', exams: 286 },
  { slot: '12-15时', exams: 198 },
  { slot: '15-18时', exams: 245 },
  { slot: '18-21时', exams: 156 },
  { slot: '21-24时', exams: 38 },
]

const patientTypeData = [
  { name: '门诊', value: 42, color: '#3b82f6' },
  { name: '住院', value: 35, color: '#8b5cf6' },
  { name: '急诊', value: 15, color: '#f59e0b' },
  { name: '体检', value: 8, color: '#22c55e' },
]

const bodyPartData = [
  { part: '胸部', count: 428 },
  { part: '腹部', count: 312 },
  { part: '头颅', count: 285 },
  { part: '脊柱', count: 198 },
  { part: '四肢', count: 156 },
  { part: '骨盆', count: 98 },
  { part: '心脏', count: 87 },
  { part: '颈部', count: 76 },
  { part: '乳腺', count: 65 },
  { part: '其他', count: 95 },
]

const doctorWorkloadData = [
  { name: '李明辉', written: 145, reviewed: 98, avgTime: 25, overtime: 3, critical: 12 },
  { name: '王秀峰', written: 132, reviewed: 85, avgTime: 28, overtime: 5, critical: 9 },
  { name: '张海涛', written: 128, reviewed: 76, avgTime: 22, overtime: 2, critical: 15 },
  { name: '刘芳', written: 115, reviewed: 92, avgTime: 30, overtime: 4, critical: 7 },
  { name: '赵志刚', written: 108, reviewed: 68, avgTime: 26, overtime: 1, critical: 5 },
  { name: '孙伟', written: 95, reviewed: 55, avgTime: 32, overtime: 6, critical: 3 },
  { name: '周婷', written: 88, reviewed: 48, avgTime: 29, overtime: 2, critical: 4 },
]

const doctorTrendData = [
  { day: '周一', '李明辉': 22, '王秀峰': 20, '张海涛': 18, '刘芳': 17 },
  { day: '周二', '李明辉': 25, '王秀峰': 22, '张海涛': 20, '刘芳': 19 },
  { day: '周三', '李明辉': 23, '王秀峰': 21, '张海涛': 19, '刘芳': 18 },
  { day: '周四', '李明辉': 20, '王秀峰': 18, '张海涛': 17, '刘芳': 16 },
  { day: '周五', '李明辉': 26, '王秀峰': 24, '张海涛': 22, '刘芳': 20 },
  { day: '周六', '李明辉': 15, '王秀峰': 13, '张海涛': 14, '刘芳': 12 },
  { day: '周日', '李明辉': 14, '王秀峰': 14, '张海涛': 18, '刘芳': 13 },
]

const qualityScoreData = [
  { day: '周一', score: 96.5 },
  { day: '周二', score: 97.2 },
  { day: '周三', score: 95.8 },
  { day: '周四', score: 97.8 },
  { day: '周五', score: 96.3 },
  { day: '周六', score: 98.1 },
  { day: '周日', score: 97.5 },
]

const qualityDistribution = [
  { name: '优秀', value: 58, color: '#059669' },
  { name: '良好', value: 32, color: '#3b82f6' },
  { name: '合格', value: 8, color: '#f59e0b' },
  { name: '不合格', value: 2, color: '#dc2626' },
]

const overtimeData = {
  total: 186,
  rate: 3.2,
  avgHours: 4.5,
  critical: 12,
  timelyRate: 96.8,
}

const modificationData = [
  { times: '0次', count: 420 },
  { times: '1次', count: 85 },
  { times: '2次', count: 32 },
  { times: '3次及以上', count: 13 },
]

const deviceEfficiencyData = [
  { name: 'CT-1', exams: 142, avgTime: 18, utilization: 92, faults: 1, status: '正常' },
  { name: 'CT-2', exams: 118, avgTime: 22, utilization: 78, faults: 0, status: '正常' },
  { name: 'MR-1', exams: 68, avgTime: 38, utilization: 85, faults: 0, status: '正常' },
  { name: 'MR-2', exams: 52, avgTime: 42, utilization: 65, faults: 2, status: '维护中' },
  { name: 'DR-1', exams: 195, avgTime: 8, utilization: 95, faults: 0, status: '正常' },
  { name: 'DR-2', exams: 168, avgTime: 9, utilization: 82, faults: 1, status: '正常' },
  { name: 'DSA-1', exams: 12, avgTime: 65, utilization: 45, faults: 0, status: '正常' },
  { name: '乳腺钼靶', exams: 22, avgTime: 15, utilization: 35, faults: 0, status: '正常' },
  { name: '胃肠造影', exams: 15, avgTime: 40, utilization: 28, faults: 0, status: '正常' },
]

const heatmapData = [
  { hour: '00', Mon: 2, Tue: 1, Wed: 3, Thu: 2, Fri: 1, Sat: 0, Sun: 0 },
  { hour: '03', Mon: 1, Tue: 2, Wed: 1, Thu: 1, Fri: 2, Sat: 0, Sun: 0 },
  { hour: '06', Mon: 8, Tue: 6, Wed: 9, Thu: 7, Fri: 8, Sat: 3, Sun: 2 },
  { hour: '09', Mon: 42, Tue: 45, Wed: 48, Thu: 40, Fri: 44, Sat: 18, Sun: 8 },
  { hour: '12', Mon: 28, Tue: 32, Wed: 30, Thu: 26, Fri: 29, Sat: 12, Sun: 6 },
  { hour: '15', Mon: 38, Tue: 42, Wed: 40, Thu: 36, Fri: 41, Sat: 15, Sun: 7 },
  { hour: '18', Mon: 32, Tue: 35, Wed: 33, Thu: 30, Fri: 34, Sat: 14, Sun: 6 },
  { hour: '21', Mon: 18, Tue: 20, Wed: 19, Thu: 17, Fri: 21, Sat: 8, Sun: 4 },
]

const maintenanceData = [
  { device: 'MR-2（飞利浦Ingenia）', nextDate: '2026-05-15', daysLeft: 14, type: '定期保养' },
  { device: 'CT-2（西门子SOMATOM Force）', nextDate: '2026-05-20', daysLeft: 19, type: '性能检测' },
  { device: 'DR-2（GE Optima）', nextDate: '2026-05-28', daysLeft: 27, type: '定期保养' },
  { device: 'DSA-1（飞利浦Azurion 7）', nextDate: '2026-06-05', daysLeft: 35, type: '软件升级' },
]

const patientSourceData = [
  { source: '本市', count: 68, color: '#3b82f6' },
  { source: '外省', count: 25, color: '#8b5cf6' },
  { source: '境外', count: 7, color: '#22c55e' },
]

const ageDistributionData = [
  { range: '0-18', male: 12, female: 10 },
  { range: '19-35', male: 28, female: 32 },
  { range: '36-50', male: 45, female: 52 },
  { range: '51-65', male: 68, female: 58 },
  { range: '66-80', male: 55, female: 48 },
  { range: '>80', male: 22, female: 25 },
]

const genderDistribution = [
  { name: '男性', value: 55, color: '#3b82f6' },
  { name: '女性', value: 45, color: '#ec4899' },
]

const positiveRateData = [
  { modality: 'CT', rate: 42.5 },
  { modality: 'MR', rate: 38.2 },
  { modality: 'DR', rate: 15.8 },
  { modality: 'DSA', rate: 68.5 },
  { modality: '乳腺钼靶', rate: 52.3 },
  { modality: '胃肠造影', rate: 35.6 },
]

const positiveTrendData = [
  { day: '周一', rate: 38.5 },
  { day: '周二', rate: 42.1 },
  { day: '周三', rate: 39.8 },
  { day: '周四', rate: 41.5 },
  { day: '周五', rate: 40.2 },
  { day: '周六', rate: 37.8 },
  { day: '周日', rate: 36.5 },
]

// ============================================================
// 阳性率统计扩展数据（复查率、排名等）
// ============================================================
const reexaminationData = [
  { type: 'CT增强', reexamRate: 8.5, avgDays: 3.2, reason: '图像不清晰' },
  { type: 'MR平扫', reexamRate: 6.2, avgDays: 4.5, reason: '层面选择不当' },
  { type: '冠脉CTA', reexamRate: 12.8, avgDays: 2.1, reason: '心率波动' },
  { type: '腹部CT', reexamRate: 5.5, avgDays: 5.0, reason: '空腹准备不足' },
  { type: '头颅MR', reexamRate: 3.8, avgDays: 6.0, reason: '运动伪影' },
  { type: '胸部DR', reexamRate: 4.2, avgDays: 1.5, reason: '曝光参数不当' },
]

const positiveRateRanking = [
  { rank: 1, type: 'DSA介入手术', rate: 68.5, count: 86, trend: '↑2.1%' },
  { rank: 2, type: '乳腺钼靶', rate: 52.3, count: 128, trend: '↓1.5%' },
  { rank: 3, type: '冠脉CTA', rate: 48.6, count: 156, trend: '↑3.2%' },
  { rank: 4, type: '胸部CT平扫', rate: 42.5, count: 286, trend: '↑0.8%' },
  { rank: 5, type: '腹部MR增强', rate: 38.2, count: 98, trend: '↓0.5%' },
  { rank: 6, type: '头颅MR平扫', rate: 35.6, count: 168, trend: '持平' },
  { rank: 7, type: '脊柱CT', rate: 28.4, count: 145, trend: '↑1.2%' },
  { rank: 8, type: '四肢DR', rate: 15.8, count: 320, trend: '↓0.3%' },
]

const positiveRateTrend30Days = Array.from({ length: 30 }, (_, i) => ({
  day: `Day${i + 1}`,
  rate: 36 + Math.random() * 8,
  critical: Math.round(Math.random() * 5),
}))

// ============================================================
// 经营分析数据（收入、成本、效益、人均产出）
// ============================================================
const businessStats = {
  totalRevenue: 2680000,
  totalCost: 1420000,
  netProfit: 1260000,
  profitRate: 47.0,
  perCapitaRevenue: 186000,
  perCapitaProfit: 87500,
  costRate: 53.0,
  yoyRevenue: '+15.6%',
  yoyProfit: '+18.2%',
}

const costBreakdown = [
  { name: '设备折旧', value: 420000, color: '#3b82f6', percent: 29.6 },
  { name: '人员成本', value: 380000, color: '#8b5cf6', percent: 26.8 },
  { name: '耗材支出', value: 280000, color: '#22c55e', percent: 19.7 },
  { name: '维保费用', value: 180000, color: '#f59e0b', percent: 12.7 },
  { name: '水电能耗', value: 120000, color: '#ec4899', percent: 8.5 },
  { name: '其他支出', value: 40000, color: '#14b8a6', percent: 2.8 },
]

const monthlyProfitData = [
  { month: '1月', revenue: 238, cost: 128, profit: 110 },
  { month: '2月', revenue: 215, cost: 125, profit: 90 },
  { month: '3月', revenue: 256, cost: 135, profit: 121 },
  { month: '4月', revenue: 268, cost: 140, profit: 128 },
  { month: '5月', revenue: 282, cost: 145, profit: 137 },
  { month: '6月', revenue: 298, cost: 152, profit: 146 },
]

const perCapitaTrend = [
  { month: '1月', revenue: 165000, profit: 76000 },
  { month: '2月', revenue: 152000, profit: 65000 },
  { month: '3月', revenue: 178000, profit: 84000 },
  { month: '4月', revenue: 186000, profit: 89000 },
  { month: '5月', revenue: 192000, profit: 92000 },
  { month: '6月', revenue: 198000, profit: 95000 },
]

const efficiencyMetrics = [
  { dept: 'CT室', revenue: 428000, cost: 218000, profit: 210000, staff: 6, perCapita: 71000 },
  { dept: 'MR室', revenue: 296000, cost: 165000, profit: 131000, staff: 5, perCapita: 59200 },
  { dept: 'DR室', revenue: 98000, cost: 48000, profit: 50000, staff: 4, perCapita: 24500 },
  { dept: 'DSA室', revenue: 156000, cost: 92000, profit: 64000, staff: 3, perCapita: 52000 },
  { dept: '钼靶室', revenue: 28000, cost: 15000, profit: 13000, staff: 2, perCapita: 14000 },
  { dept: '造影室', revenue: 42000, cost: 22000, profit: 20000, staff: 2, perCapita: 20000 },
]

// ============================================================
// 设备效率扩展数据（开机率、检查完成时间、预约等待时间）
// ============================================================
const deviceStartupData = [
  { name: 'CT-1', startupRate: 98.5, avgStartupTime: 12, faults: 1, status: '正常' },
  { name: 'CT-2', startupRate: 95.2, avgStartupTime: 18, faults: 0, status: '正常' },
  { name: 'MR-1', startupRate: 96.8, avgStartupTime: 25, faults: 0, status: '正常' },
  { name: 'MR-2', startupRate: 88.5, avgStartupTime: 30, faults: 2, status: '维护中' },
  { name: 'DR-1', startupRate: 99.1, avgStartupTime: 5, faults: 0, status: '正常' },
  { name: 'DR-2', startupRate: 97.5, avgStartupTime: 6, faults: 1, status: '正常' },
  { name: 'DSA-1', startupRate: 92.0, avgStartupTime: 20, faults: 0, status: '正常' },
  { name: '乳腺钼靶', startupRate: 94.5, avgStartupTime: 8, faults: 0, status: '正常' },
  { name: '胃肠造影', startupRate: 90.0, avgStartupTime: 15, faults: 0, status: '正常' },
]

const examCompletionTimeData = [
  { name: 'CT-1', completedToday: 142, avgTime: 18, minTime: 12, maxTime: 35, overtimeCount: 3 },
  { name: 'CT-2', completedToday: 118, avgTime: 22, minTime: 15, maxTime: 42, overtimeCount: 5 },
  { name: 'MR-1', completedToday: 68, avgTime: 38, minTime: 28, maxTime: 65, overtimeCount: 2 },
  { name: 'MR-2', completedToday: 52, avgTime: 42, minTime: 30, maxTime: 72, overtimeCount: 4 },
  { name: 'DR-1', completedToday: 195, avgTime: 8, minTime: 5, maxTime: 18, overtimeCount: 1 },
  { name: 'DR-2', completedToday: 168, avgTime: 9, minTime: 6, maxTime: 20, overtimeCount: 2 },
  { name: 'DSA-1', completedToday: 12, avgTime: 65, minTime: 45, maxTime: 120, overtimeCount: 1 },
  { name: '乳腺钼靶', completedToday: 22, avgTime: 15, minTime: 10, maxTime: 28, overtimeCount: 0 },
  { name: '胃肠造影', completedToday: 15, avgTime: 40, minTime: 30, maxTime: 75, overtimeCount: 1 },
]

const appointmentWaitData = [
  { modality: 'CT', avgWait: 2.5, maxWait: 5, todayAppointments: 168, completed: 142, pending: 26 },
  { modality: 'MR', avgWait: 4.2, maxWait: 8, todayAppointments: 85, completed: 68, pending: 17 },
  { modality: 'DR', avgWait: 0.8, maxWait: 2, todayAppointments: 285, completed: 195, pending: 90 },
  { modality: 'DSA', avgWait: 6.5, maxWait: 12, todayAppointments: 15, completed: 12, pending: 3 },
  { modality: '乳腺钼靶', avgWait: 1.5, maxWait: 3, todayAppointments: 28, completed: 22, pending: 6 },
  { modality: '胃肠造影', avgWait: 3.8, maxWait: 7, todayAppointments: 18, completed: 15, pending: 3 },
]

const waitTimeTrendData = [
  { slot: '08:00-10:00', CT: 1.2, MR: 2.5, DR: 0.5 },
  { slot: '10:00-12:00', CT: 3.2, MR: 5.1, DR: 1.0 },
  { slot: '12:00-14:00', CT: 2.8, MR: 4.5, DR: 0.8 },
  { slot: '14:00-16:00', CT: 2.0, MR: 3.8, DR: 0.6 },
  { slot: '16:00-18:00', CT: 1.5, MR: 2.8, DR: 0.4 },
]

const revenueByModality = [
  { name: 'CT', value: 428000, color: '#3b82f6' },
  { name: 'MR', value: 296000, color: '#8b5cf6' },
  { name: 'DR', value: 98000, color: '#22c55e' },
  { name: 'DSA', value: 156000, color: '#f59e0b' },
  { name: '乳腺钼靶', value: 28000, color: '#ec4899' },
  { name: '胃肠造影', value: 42000, color: '#14b8a6' },
]

const examTypeRevenue = [
  { type: '冠脉CTA', revenue: 128000, exams: 86 },
  { type: '腹部CT平扫+增强', revenue: 96000, exams: 128 },
  { type: '头颅MR平扫', revenue: 88000, exams: 110 },
  { type: '胸部DR正侧位', revenue: 52000, exams: 520 },
  { type: '冠脉造影', revenue: 78000, exams: 26 },
  { type: '腰椎MR平扫', revenue: 64000, exams: 80 },
  { type: '乳腺钼靶', revenue: 28000, exams: 56 },
  { type: '其他', revenue: 98000, exams: 312 },
]

const deptRevenueTarget = [
  { dept: 'CT室', target: 500000, actual: 428000, rate: 85.6 },
  { dept: 'MR室', target: 350000, actual: 296000, rate: 84.6 },
  { dept: 'DR室', target: 120000, actual: 98000, rate: 81.7 },
  { dept: 'DSA室', target: 180000, actual: 156000, rate: 86.7 },
  { dept: '钼靶室', target: 35000, actual: 28000, rate: 80.0 },
  { dept: '造影室', target: 50000, actual: 42000, rate: 84.0 },
]

// ============================================================
// 通用卡片组件
// ============================================================
function StatCard({ label, value, subValue, icon, color, bg, trend }: {
  label: string; value: string | number; subValue?: string; icon: React.ReactNode;
  color: string; bg: string; trend?: { value: string; up: boolean };
}) {
  return (
    <div style={{
      background: C.white, borderRadius: 12, padding: '16px 18px',
      border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.primary, lineHeight: 1.2 }}>{value}</div>
        {subValue && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{subValue}</div>}
        {trend && (
          <div style={{ fontSize: 11, color: trend.up ? C.success : C.danger, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </div>
        )}
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color
      }}>
        {icon}
      </div>
    </div>
  )
}

// ============================================================
// 通用图表卡片包装
// ============================================================
function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{
      background: C.white, borderRadius: 12, padding: 20,
      border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

// ============================================================
// 通用选择按钮组
// ============================================================
function TabButton({ tabs, active, onChange }: {
  tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 4, background: C.background, borderRadius: 8, padding: 4 }}>
      {tabs.map(tab => (
        <button key={tab.key} onClick={() => onChange(tab.key)} style={{
          padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
          background: active === tab.key ? C.white : 'transparent',
          color: active === tab.key ? C.primary : C.textMuted,
          boxShadow: active === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
        }}>{tab.label}</button>
      ))}
    </div>
  )
}

// ============================================================
// 标签页1：检查量统计
// ============================================================
function ExamVolumeTab() {
  const [timeRange, setTimeRange] = useState('week')
  const [modalityFilter, setModalityFilter] = useState('全部')

  const timeRanges = [
    { key: 'today', label: '今日' },
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
    { key: 'quarter', label: '本季度' },
    { key: 'year', label: '本年' },
  ]

  const modalities = ['全部', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶', '胃肠造影']

  const stats = {
    total: timeRange === 'today' ? 247 : timeRange === 'week' ? 1916 : timeRange === 'month' ? 5680 : timeRange === 'quarter' ? 17040 : 68160,
    yoy: '+12.3%',
    mom: '+5.8%',
    todayEstimate: 285,
  }

  const mergedData = sevenDayData.map(d => ({
    ...d,
    CT: Math.round(d.exams * 0.42),
    MR: Math.round(d.exams * 0.22),
    DR: Math.round(d.exams * 0.28),
    DSA: Math.round(d.exams * 0.08),
  }))

  return (
    <div>
      {/* 筛选栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Calendar size={14} color={C.textMuted} />
          <div style={{ display: 'flex', gap: 4, background: C.background, borderRadius: 8, padding: 4 }}>
            {timeRanges.map(r => (
              <button key={r.key} onClick={() => setTimeRange(r.key)} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', background: timeRange === r.key ? C.white : 'transparent',
                color: timeRange === r.key ? C.primary : C.textMuted,
                boxShadow: timeRange === r.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}>{r.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={14} color={C.textMuted} />
          <select value={modalityFilter} onChange={e => setModalityFilter(e.target.value)} style={{
            padding: '6px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12,
            color: C.text, outline: 'none', background: C.white, cursor: 'pointer'
          }}>
            {modalities.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <StatCard label="总检查量" value={stats.total.toLocaleString()} subValue={timeRange === 'today' ? '今日累计' : timeRange === 'week' ? '本周累计' : timeRange}
          icon={<Activity size={20} />} color={C.info} bg={C.infoBg} trend={{ value: stats.yoy, up: true }} />
        <StatCard label="同比增长率" value={stats.yoy} subValue="较去年同期"
          icon={<TrendingUp size={20} />} color={C.success} bg={C.successBg} trend={{ value: '+2.1%', up: true }} />
        <StatCard label="环比增长率" value={stats.mom} subValue="较上周期"
          icon={<TrendingDown size={20} />} color={C.warning} bg={C.warningBg} trend={{ value: '-0.5%', up: false }} />
        <StatCard label="今日预计完成" value={stats.todayEstimate} subValue="预计下班前"
          icon={<Target size={20} />} color={C.purple} bg={C.purpleBg} trend={{ value: '+15', up: true }} />
      </div>

      {/* 主图：双Y轴折线图 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', marginBottom: 16 }}>
        <ChartCard title="检查量与增长率趋势（7天）">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={sevenDayData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.textMuted }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: C.textMuted }} label={{ value: '检查量', angle: -90, position: 'insideLeft', fontSize: 11, fill: C.textMuted }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: C.textMuted }} domain={[30, 50]} label={{ value: '增长率%', angle: 90, position: 'insideRight', fontSize: 11, fill: C.textMuted }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: `1px solid ${C.border}` }} />
              <Legend iconSize={10} />
              <Bar yAxisId="left" dataKey="exams" fill="#3b82f6" name="检查量" radius={[4, 4, 0, 0]} opacity={0.7} />
              <Line yAxisId="right" type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} name="危急值数" />
              <Line yAxisId="right" type="monotone" dataKey="reports" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="报告数" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 副图区 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 按设备类型分组柱状图 */}
        <ChartCard title="各设备检查量分布（7天趋势）">
          <ResponsiveContainer width="100%" height={220}>
            <StatBarChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="CT" stackId="a" fill="#3b82f6" name="CT" radius={[0, 0, 0, 0]} />
              <Bar dataKey="MR" stackId="a" fill="#8b5cf6" name="MR" radius={[0, 0, 0, 0]} />
              <Bar dataKey="DR" stackId="a" fill="#22c55e" name="DR" radius={[0, 0, 0, 0]} />
              <Bar dataKey="DSA" stackId="a" fill="#f59e0b" name="DSA" radius={[4, 4, 0, 0]} />
            </StatBarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 按患者类型饼图 */}
        <ChartCard title="患者类型占比分布">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <StatPieChart width={160} height={160}>
              <Pie data={patientTypeData} cx={70} cy={70} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {patientTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            </StatPieChart>
            <div style={{ flex: 1 }}>
              {patientTypeData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 12, color: C.text }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>{item.value}%</span>
                    <div style={{ width: 60, height: 6, background: C.background, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* 副图2区 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 检查部位分布 */}
        <ChartCard title="检查部位分布（Top10）">
          <ResponsiveContainer width="100%" height={220}>
            <StatBarChart data={bodyPartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis dataKey="part" type="category" tick={{ fontSize: 11, fill: C.textMuted }} width={60} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Bar dataKey="count" fill="#3b82f6" name="检查量" radius={[0, 4, 4, 0]}>
                {bodyPartData.map((_, i) => <Cell key={i} fill={MODALITY_COLORS[['CT', 'MR', 'DR', 'DSA', '乳腺钼靶', '胃肠造影'][i % 6]]} />)}
              </Bar>
            </StatBarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 时段分布 */}
        <ChartCard title="检查时段分布">
          <ResponsiveContainer width="100%" height={220}>
            <StatBarChart data={timeSlotData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="slot" tick={{ fontSize: 9, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Bar dataKey="exams" name="检查量" radius={[4, 4, 0, 0]}>
                {timeSlotData.map((_, i) => <Cell key={i} fill={RAD_COLORS[i % RAD_COLORS.length]} />)}
              </Bar>
            </StatBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ============================================================
// 标签页2：工作量统计
// ============================================================
function WorkloadTab() {
  const [doctorFilter, setDoctorFilter] = useState('全部')
  const [dimension, setDimension] = useState('doctor')
  const [viewMode, setViewMode] = useState('table')

  const doctors = ['全部', '李明辉', '王秀峰', '张海涛', '刘芳']
  const dimensions = [
    { key: 'doctor', label: '按医生' },
    { key: 'device', label: '按设备' },
    { key: 'room', label: '按检查室' },
    { key: 'type', label: '按检查类型' },
  ]

  const topDoctors = [...doctorWorkloadData].sort((a, b) => b.written - a.written).slice(0, 5)

  const tableHeaders = ['医生姓名', '书写报告数', '审核报告数', '平均书写时长', '超时报告数', '危急值报告数']

  return (
    <div>
      {/* 筛选栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <UserCheck size={14} color={C.textMuted} />
          <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)} style={{
            padding: '6px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12,
            color: C.text, outline: 'none', background: C.white, cursor: 'pointer'
          }}>
            {doctors.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <BarChart3 size={14} color={C.textMuted} />
          <TabButton tabs={dimensions} active={dimension} onChange={setDimension} />
        </div>
      </div>

      {/* 医生工作量表格 */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>工作量统计报表</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setViewMode('table')} style={{
              padding: '4px 10px', borderRadius: 4, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: viewMode === 'table' ? C.infoBg : 'transparent', color: viewMode === 'table' ? C.info : C.textMuted
            }}>表格</button>
            <button onClick={() => setViewMode('chart')} style={{
              padding: '4px 10px', borderRadius: 4, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: viewMode === 'chart' ? C.infoBg : 'transparent', color: viewMode === 'chart' ? C.info : C.textMuted
            }}>图表</button>
          </div>
        </div>
        {viewMode === 'table' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.background }}>
                {tableHeaders.map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: C.textMuted, textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doctorWorkloadData.filter(d => doctorFilter === '全部' || d.name === doctorFilter).map((d, i) => (
                <tr key={d.name} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: C.primary, textAlign: 'center' }}>{d.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center' }}>{d.written}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center' }}>{d.reviewed}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center' }}>{d.avgTime}min</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: d.overtime > 3 ? C.danger : C.text }}>{d.overtime}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: d.critical > 10 ? C.warning : C.success }}>{d.critical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 20 }}>
            <ResponsiveContainer width="100%" height={280}>
              <StatBarChart data={doctorWorkloadData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textMuted }} />
                <YAxis tick={{ fontSize: 11, fill: C.textMuted }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
                <Legend iconSize={10} />
                <Bar dataKey="written" fill="#3b82f6" name="书写报告数" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reviewed" fill="#8b5cf6" name="审核报告数" radius={[4, 4, 0, 0]} />
              </StatBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 7天趋势图 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', marginBottom: 20 }}>
        <ChartCard title="各医生7天报告量趋势">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={doctorTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Legend iconSize={10} />
              <Line type="monotone" dataKey="李明辉" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="王秀峰" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="张海涛" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="刘芳" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* TOP10排行榜 */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>工作量TOP10医生排行榜</div>
          <Award size={16} color={C.warning} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {topDoctors.map((d, idx) => (
            <div key={d.name} style={{
              background: idx === 0 ? '#fffbeb' : idx === 1 ? '#f8fafc' : '#fafafa',
              borderRadius: 10, padding: 14, textAlign: 'center', border: `1px solid ${C.border}`
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: idx === 0 ? '#fef3c7' : idx === 1 ? '#e2e8f0' : C.background,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px', fontSize: 14, fontWeight: 800,
                color: idx === 0 ? C.warning : C.textMuted
              }}>
                {idx + 1}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{d.name}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.info, marginTop: 6 }}>{d.written}</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>份报告</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>均分{d.avgTime}min</div>
              {idx === 0 && <div style={{ fontSize: 10, color: C.warning, marginTop: 2 }}>★ 本月之星</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 标签页3：收入统计
// ============================================================
function RevenueTab() {
  const [timeRange, setTimeRange] = useState('week')
  const [chartView, setChartView] = useState('7days')

  const timeRanges = [
    { key: '7days', label: '近7天' },
    { key: '30days', label: '近30天' },
  ]

  const revenueStats = {
    today: 89600,
    week: 628000,
    month: 2680000,
    quarter: 8040000,
    yoy: '+15.6%',
  }

  const revenueTrend7 = sevenDayData.map(d => ({ day: d.day, revenue: d.revenue }))
  const revenueTrend30 = Array.from({ length: 30 }, (_, i) => ({
    day: `Day${i + 1}`,
    revenue: 85000 + Math.round(Math.random() * 30000)
  }))

  const maxRevenue = Math.max(...(chartView === '7days' ? revenueTrend7 : revenueTrend30).map(d => d.revenue))

  return (
    <div>
      {/* 时间筛选 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Calendar size={14} color={C.textMuted} />
          <TabButton tabs={timeRanges} active={chartView} onChange={setChartView} />
        </div>
        <button style={{
          padding: '6px 14px', background: C.white, color: C.textMuted,
          border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Download size={13} /> 导出报表
        </button>
      </div>

      {/* 收入统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="今日收入" value={`¥${(revenueStats.today / 10000).toFixed(1)}万`}
          icon={<DollarSign size={20} />} color={C.success} bg={C.successBg}
          trend={{ value: '+8.2%', up: true }} />
        <StatCard label="本周收入" value={`¥${(revenueStats.week / 10000).toFixed(0)}万`}
          icon={<TrendingUp size={20} />} color={C.info} bg={C.infoBg}
          trend={{ value: '+12.5%', up: true }} />
        <StatCard label="本月收入" value={`¥${(revenueStats.month / 10000).toFixed(0)}万`}
          icon={<BarChart3 size={20} />} color={C.warning} bg={C.warningBg}
          trend={{ value: '+15.6%', up: true }} />
        <StatCard label="本季度收入" value={`¥${(revenueStats.quarter / 10000).toFixed(0)}万`}
          icon={<Activity size={20} />} color={C.purple} bg={C.purpleBg}
          trend={{ value: '+18.3%', up: true }} />
        <StatCard label="同比增长率" value={revenueStats.yoy}
          icon={<Target size={20} />} color={C.danger} bg={C.dangerBg}
          trend={{ value: '+3.2%', up: true }} />
      </div>

      {/* 收入趋势面积图 */}
      <div style={{ marginBottom: 16 }}>
        <ChartCard title="收入趋势（万元）">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartView === '7days' ? revenueTrend7 : revenueTrend30}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} domain={[0, maxRevenue * 1.2]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }}
                formatter={(value: number) => [`¥${(value / 10000).toFixed(1)}万`, '收入']} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGradient)" name="收入" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 下半区 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 按设备类型收入分布 */}
        <ChartCard title="按设备类型收入分布">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <StatPieChart width={150} height={150}>
              <Pie data={revenueByModality} cx={65} cy={65} innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                {revenueByModality.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} formatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`} />
            </StatPieChart>
            <div style={{ flex: 1 }}>
              {revenueByModality.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 11, color: C.text }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>¥{(item.value / 10000).toFixed(0)}万</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* 检查类型收入排名 */}
        <ChartCard title="检查类型收入排名">
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {examTypeRevenue.map((item, i) => (
              <div key={item.type} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, background: i < 3 ? RAD_COLORS[i] : C.background, color: i < 3 ? C.white : C.textMuted, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{item.type}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{item.exams}例检查</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>¥{(item.revenue / 10000).toFixed(0)}万</div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* 科室收入目标进度 */}
      <ChartCard title="各科室收入目标达成进度">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {deptRevenueTarget.map(dept => (
            <div key={dept.dept} style={{ padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{dept.dept}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: dept.rate >= 80 ? C.success : C.warning }}>
                  {dept.rate.toFixed(1)}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 8, background: C.background, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${dept.rate}%`, height: '100%', background: dept.rate >= 80 ? C.success : C.warning, borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: C.textMuted }}>实际: ¥{(dept.actual / 10000).toFixed(0)}万</span>
                <span style={{ fontSize: 10, color: C.textMuted }}>目标: ¥{(dept.target / 10000).toFixed(0)}万</span>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}

// ============================================================
// 标签页4：质量控制
// ============================================================
function QualityControlTab() {
  const [trendRange, setTrendRange] = useState('7days')

  const qualityStats = {
    avgScore: 96.8,
    overtimeCount: overtimeData.total,
    overtimeRate: overtimeData.rate,
    avgOvertime: overtimeData.avgHours,
    criticalCount: 45,
    timelyRate: overtimeData.timelyRate,
    criticalTimelyRate: 97.8,
    criticalOvertime: 3,
  }

  const trendData = trendRange === '7days' ? qualityScoreData : Array.from({ length: 30 }, (_, i) => ({
    day: `Day${i + 1}`,
    score: 95 + Math.random() * 3
  }))

  return (
    <div>
      {/* 质控概览卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="平均质控评分" value={`${qualityStats.avgScore}分`}
          subValue="满分100分" icon={<Award size={20} />} color={C.success} bg={C.successBg}
          trend={{ value: '+1.2分', up: true }} />
        <StatCard label="超时报告数" value={qualityStats.overtimeCount}
          subValue={`超时率 ${qualityStats.overtimeRate}%`} icon={<Clock size={20} />} color={C.warning} bg={C.warningBg}
          trend={{ value: '-8%', up: true }} />
        <StatCard label="危急值上报数" value={qualityStats.criticalCount}
          subValue="处理及时率 97.8%" icon={<AlertTriangle size={20} />} color={C.danger} bg={C.dangerBg}
          trend={{ value: '+5例', up: false }} />
        <StatCard label="报告修改率" value="12.3%"
          subValue="较上月下降 2.1%" icon={<Edit3 size={20} />} color={C.purple} bg={C.purpleBg}
          trend={{ value: '-2.1%', up: true }} />
      </div>

      {/* 质量评分分布 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <ChartCard title="报告质量评分分布">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <StatPieChart width={150} height={150}>
              <Pie data={qualityDistribution} cx={65} cy={65} innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                {qualityDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            </StatPieChart>
            <div style={{ flex: 1 }}>
              {qualityDistribution.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 12, color: C.text }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>评分分布进度</div>
            {qualityDistribution.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 50, fontSize: 10, color: C.textMuted }}>{item.name}</div>
                <div style={{ flex: 1, height: 6, background: C.background, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: 3 }} />
                </div>
                <div style={{ width: 30, fontSize: 10, color: C.text, textAlign: 'right' }}>{item.value}%</div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* 超时与危急值统计 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: C.white, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Clock size={16} color={C.warning} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>超时统计</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.warning }}>{overtimeData.total}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>超时报告总数</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>超时率</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.warning }}>{overtimeData.rate}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>平均超时</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{overtimeData.avgHours}h</span>
            </div>
          </div>
          <div style={{ background: C.white, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <AlertTriangle size={16} color={C.danger} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>危急值统计</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.danger }}>{qualityStats.criticalCount}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>本月上报表数</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>处理及时率</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.success }}>{qualityStats.criticalTimelyRate}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>超时处理</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.danger }}>{qualityStats.criticalOvertime}例</span>
            </div>
          </div>
        </div>
      </div>

      {/* 报告修改次数分布 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <ChartCard title="报告修改次数分布">
          <ResponsiveContainer width="100%" height={200}>
            <StatBarChart data={modificationData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="times" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Bar dataKey="count" name="报告数" radius={[4, 4, 0, 0]}>
                {modificationData.map((_, i) => <Cell key={i} fill={RAD_COLORS[i]} />)}
              </Bar>
            </StatBarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="超时率与及时率趋势">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sevenDayData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} domain={[0, 10]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Legend iconSize={10} />
              <Line type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} name="危急值数" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 质控评分趋势 */}
      <ChartCard
        title="质控评分趋势"
        action={
          <div style={{ display: 'flex', gap: 4 }}>
            {['7days', '30days'].map(r => (
              <button key={r} onClick={() => setTrendRange(r)} style={{
                padding: '4px 10px', borderRadius: 4, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: trendRange === r ? C.infoBg : 'transparent', color: trendRange === r ? C.info : C.textMuted
              }}>{r === '7days' ? '7天' : '30天'}</button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textMuted }} />
            <YAxis tick={{ fontSize: 10, fill: C.textMuted }} domain={[93, 100]} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
            <Line type="monotone" dataKey="score" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} name="质控评分" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ============================================================
// 标签页5：设备效能（扩充版）
// ============================================================
function DeviceEfficiencyTab() {
  const [deviceFilter, setDeviceFilter] = useState('全部')
  const [deviceView, setDeviceView] = useState('utilization')

  const tableHeaders = ['设备名称', '类型', '检查量', '平均时长', '设备利用率', '故障次数', '维保状态']
  const extendedHeaders = ['设备名称', '今日完成', '平均时间', '最短', '最长', '超时数', '状态']

  const utilizationAvg = Math.round(deviceEfficiencyData.reduce((sum, d) => sum + d.utilization, 0) / deviceEfficiencyData.length)
  const startupAvg = Math.round(deviceStartupData.reduce((sum, d) => sum + d.startupRate, 0) / deviceStartupData.length)
  const waitAvg = (appointmentWaitData.reduce((sum, d) => sum + d.avgWait, 0) / appointmentWaitData.length).toFixed(1)

  return (
    <div>
      {/* 设备效能概览 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="设备总数" value={deviceEfficiencyData.length}
          subValue="运行中 8 台" icon={<Monitor size={20} />} color={C.info} bg={C.infoBg} />
        <StatCard label="平均利用率" value={`${utilizationAvg}%`}
          subValue="目标 > 80%" icon={<Percent size={20} />} color={C.success} bg={C.successBg}
          trend={{ value: '+3.2%', up: true }} />
        <StatCard label="平均开机率" value={`${startupAvg}%`}
          subValue="目标 > 95%" icon={<Zap size={20} />} color={C.purple} bg={C.purpleBg}
          trend={{ value: '+1.5%', up: true }} />
        <StatCard label="平均预约等待" value={`${waitAvg}天`}
          subValue="CT/MR较繁忙" icon={<Clock size={20} />} color={C.warning} bg={C.warningBg}
          trend={{ value: '+0.3天', up: false }} />
        <StatCard label="故障总次数" value={deviceEfficiencyData.reduce((s, d) => s + d.faults, 0)}
          subValue="维保中 1 台" icon={<Wrench size={20} />} color={C.danger} bg={C.dangerBg}
          trend={{ value: '-2次', up: true }} />
      </div>

      {/* 设备视图切换 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: C.background, borderRadius: 8, padding: 4 }}>
          {[{ key: 'utilization', label: '利用率' }, { key: 'startup', label: '开机率' }, { key: 'completion', label: '完成时间' }, { key: 'wait', label: '等待时间' }].map(v => (
            <button key={v.key} onClick={() => setDeviceView(v.key)} style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', background: deviceView === v.key ? C.white : 'transparent',
              color: deviceView === v.key ? C.primary : C.textMuted,
              boxShadow: deviceView === v.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}>{v.label}</button>
          ))}
        </div>
        <select value={deviceFilter} onChange={e => setDeviceFilter(e.target.value)} style={{
          padding: '6px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12,
          color: C.text, outline: 'none', background: C.white, cursor: 'pointer'
        }}>
          {['全部', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶', '胃肠造影'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* 设备利用率视图 */}
      {deviceView === 'utilization' && (
        <>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>设备列表</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.background }}>
                  {tableHeaders.map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: C.textMuted, textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deviceEfficiencyData.filter(d => deviceFilter === '全部' || d.name.includes(deviceFilter)).map(d => (
                  <tr key={d.name} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: C.primary, textAlign: 'center' }}>{d.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 11, textAlign: 'center' }}>{d.name.split('-')[0]}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', fontWeight: 700, color: C.info }}>{d.exams}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center' }}>{d.avgTime}min</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <div style={{ width: 60, height: 6, background: C.background, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${d.utilization}%`, height: '100%', background: d.utilization >= 80 ? C.success : d.utilization >= 60 ? C.warning : C.danger, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontWeight: 700, color: d.utilization >= 80 ? C.success : d.utilization >= 60 ? C.warning : C.danger }}>{d.utilization}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: d.faults > 0 ? C.danger : C.success }}>{d.faults}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: d.status === '正常' ? C.successBg : C.warningBg,
                        color: d.status === '正常' ? C.success : C.warning
                      }}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <ChartCard title="各设备利用率对比">
              <ResponsiveContainer width="100%" height={240}>
                <StatBarChart data={deviceEfficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textMuted }} />
                  <YAxis tick={{ fontSize: 10, fill: C.textMuted }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
                  <Bar dataKey="utilization" name="利用率%" radius={[4, 4, 0, 0]}>
                    {deviceEfficiencyData.map((entry, i) => (
                      <Cell key={i} fill={entry.utilization >= 80 ? C.success : entry.utilization >= 60 ? C.warning : C.danger} />
                    ))}
                  </Bar>
                </StatBarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="维保计划列表">
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                {maintenanceData.map(m => (
                  <div key={m.device} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{m.device}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: m.daysLeft <= 14 ? C.dangerBg : m.daysLeft <= 30 ? C.warningBg : C.infoBg,
                        color: m.daysLeft <= 14 ? C.danger : m.daysLeft <= 30 ? C.warning : C.info
                      }}>
                        {m.daysLeft <= 14 ? '紧急' : m.daysLeft <= 30 ? '即将到期' : '正常'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: C.textMuted }}>{m.type}</span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>剩余 <strong style={{ color: m.daysLeft <= 14 ? C.danger : C.text }}>{m.daysLeft}</strong> 天</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>计划日期: {m.nextDate}</div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </>
      )}

      {/* 开机率视图 */}
      {deviceView === 'startup' && (
        <>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>设备开机率详情</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.background }}>
                  {['设备名称', '开机率', '平均启动时间', '故障次数', '状态'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: C.textMuted, textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deviceStartupData.filter(d => deviceFilter === '全部' || d.name.includes(deviceFilter)).map(d => (
                  <tr key={d.name} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: C.primary, textAlign: 'center' }}>{d.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <div style={{ width: 60, height: 6, background: C.background, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${d.startupRate}%`, height: '100%', background: d.startupRate >= 95 ? C.success : d.startupRate >= 90 ? C.warning : C.danger, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontWeight: 700, color: d.startupRate >= 95 ? C.success : d.startupRate >= 90 ? C.warning : C.danger }}>{d.startupRate}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center' }}>{d.avgStartupTime}min</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: d.faults > 0 ? C.danger : C.success }}>{d.faults}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: d.status === '正常' ? C.successBg : C.warningBg,
                        color: d.status === '正常' ? C.success : C.warning
                      }}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ChartCard title="各设备开机率对比">
            <ResponsiveContainer width="100%" height={280}>
              <StatBarChart data={deviceStartupData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textMuted }} />
                <YAxis tick={{ fontSize: 10, fill: C.textMuted }} domain={[80, 100]} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
                <Bar dataKey="startupRate" name="开机率%" radius={[4, 4, 0, 0]}>
                  {deviceStartupData.map((entry, i) => (
                    <Cell key={i} fill={entry.startupRate >= 95 ? C.success : entry.startupRate >= 90 ? C.warning : C.danger} />
                  ))}
                </Bar>
              </StatBarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}

      {/* 检查完成时间视图 */}
      {deviceView === 'completion' && (
        <>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>检查完成时间统计</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.background }}>
                  {extendedHeaders.map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: C.textMuted, textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {examCompletionTimeData.filter(d => deviceFilter === '全部' || d.name.includes(deviceFilter)).map(d => (
                  <tr key={d.name} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: C.primary, textAlign: 'center' }}>{d.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', fontWeight: 700, color: C.info }}>{d.completedToday}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: d.avgTime > 40 ? C.warning : C.text }}>{d.avgTime}min</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: C.success }}>{d.minTime}min</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: C.danger }}>{d.maxTime}min</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: d.overtimeCount > 3 ? C.danger : C.text }}>{d.overtimeCount}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: d.overtimeCount === 0 ? C.successBg : d.overtimeCount <= 2 ? C.warningBg : C.dangerBg,
                        color: d.overtimeCount === 0 ? C.success : d.overtimeCount <= 2 ? C.warning : C.danger
                      }}>
                        {d.overtimeCount === 0 ? '正常' : d.overtimeCount <= 2 ? '轻微' : '超时'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ChartCard title="各设备平均检查时间对比">
              <ResponsiveContainer width="100%" height={240}>
                <StatBarChart data={examCompletionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textMuted }} />
                  <YAxis tick={{ fontSize: 10, fill: C.textMuted }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
                  <Bar dataKey="avgTime" name="平均时间(min)" radius={[4, 4, 0, 0]}>
                    {examCompletionTimeData.map((entry, i) => (
                      <Cell key={i} fill={entry.avgTime <= 15 ? C.success : entry.avgTime <= 30 ? C.warning : C.danger} />
                    ))}
                  </Bar>
                </StatBarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="完成时间分布">
              <ResponsiveContainer width="100%" height={240}>
                <StatBarChart data={examCompletionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textMuted }} />
                  <YAxis tick={{ fontSize: 10, fill: C.textMuted }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
                  <Legend iconSize={10} />
                  <Bar dataKey="minTime" name="最短时间" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maxTime" name="最长时间" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </StatBarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* 预约等待时间视图 */}
      {deviceView === 'wait' && (
        <>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>预约等待时间统计</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.background }}>
                  {['设备类型', '平均等待', '最长等待', '今日预约', '已完成', '待检查', '完成率'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: C.textMuted, textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointmentWaitData.map(d => {
                  const completionRate = ((d.completed / d.todayAppointments) * 100).toFixed(1)
                  return (
                    <tr key={d.modality} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: C.primary, textAlign: 'center' }}>{d.modality}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: d.avgWait > 3 ? C.warning : C.success }}>{d.avgWait}天</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: d.maxWait > 7 ? C.danger : C.text }}>{d.maxWait}天</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', fontWeight: 700, color: C.info }}>{d.todayAppointments}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: C.success }}>{d.completed}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center', color: d.pending > 10 ? C.warning : C.text }}>{d.pending}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                          background: parseFloat(completionRate) >= 85 ? C.successBg : parseFloat(completionRate) >= 70 ? C.warningBg : C.dangerBg,
                          color: parseFloat(completionRate) >= 85 ? C.success : parseFloat(completionRate) >= 70 ? C.warning : C.danger
                        }}>{completionRate}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ChartCard title="各设备预约等待时间">
              <ResponsiveContainer width="100%" height={240}>
                <StatBarChart data={appointmentWaitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="modality" tick={{ fontSize: 10, fill: C.textMuted }} />
                  <YAxis tick={{ fontSize: 10, fill: C.textMuted }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
                  <Bar dataKey="avgWait" name="平均等待(天)" radius={[4, 4, 0, 0]}>
                    {appointmentWaitData.map((entry, i) => (
                      <Cell key={i} fill={entry.avgWait <= 2 ? C.success : entry.avgWait <= 4 ? C.warning : C.danger} />
                    ))}
                  </Bar>
                </StatBarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="时段等待时间趋势">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={waitTimeTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="slot" tick={{ fontSize: 9, fill: C.textMuted }} />
                  <YAxis tick={{ fontSize: 10, fill: C.textMuted }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
                  <Legend iconSize={10} />
                  <Line type="monotone" dataKey="CT" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="CT" />
                  <Line type="monotone" dataKey="MR" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="MR" />
                  <Line type="monotone" dataKey="DR" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="DR" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* 设备使用时段热力图 - 显示在利用率视图底部 */}
      {deviceView === 'utilization' && (
        <ChartCard title="设备使用时段热力图（模拟24小时 × 7天）">
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 2, minWidth: 500 }}>
              <div style={{ fontSize: 10, color: C.textMuted, textAlign: 'center', padding: 4 }}></div>
              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(d => (
                <div key={d} style={{ fontSize: 10, color: C.textMuted, textAlign: 'center', padding: 4, fontWeight: 600 }}>{d}</div>
              ))}
              {heatmapData.map(row => (
                <>
                  <div key={`label-${row.hour}`} style={{ fontSize: 9, color: C.textMuted, textAlign: 'center', padding: 4 }}>{row.hour}</div>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
                    const val = row[d as keyof typeof row] as number
                    const intensity = Math.min(val / 50, 1)
                    return (
                      <div key={`${row.hour}-${d}`} style={{
                        background: `rgba(59, 130, 246, ${intensity})`,
                        borderRadius: 3, padding: '4px 2px', textAlign: 'center', minHeight: 24
                      }}>
                        <span style={{ fontSize: 9, color: intensity > 0.5 ? C.white : C.textMuted, fontWeight: val > 30 ? 700 : 400 }}>{val}</span>
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10, color: C.textMuted }}>使用强度:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 10, background: 'rgba(59,130,246,0.1)', borderRadius: 2 }} />
              <span style={{ fontSize: 9, color: C.textMuted }}>低</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 10, background: 'rgba(59,130,246,0.4)', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 10, background: 'rgba(59,130,246,0.7)', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 10, background: 'rgba(59,130,246,1)', borderRadius: 2 }} />
              <span style={{ fontSize: 9, color: C.textMuted }}>高</span>
            </div>
          </div>
        </ChartCard>
      )}
    </div>
  )
}

// ============================================================
// 标签页6：患者分析
// ============================================================
function PatientAnalysisTab() {
  const [timeRange, setTimeRange] = useState('week')

  const patientStats = {
    total: 568,
    avgAge: 48.5,
    positiveRate: 38.2,
    criticalCount: 45,
  }

  return (
    <div>
      {/* 患者分析概览 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="本月患者数" value={patientStats.total}
          subValue="门诊/住院/体检" icon={<Users size={20} />} color={C.info} bg={C.infoBg}
          trend={{ value: '+6.8%', up: true }} />
        <StatCard label="平均年龄" value={`${patientStats.avgAge}岁`}
          subValue="男女比例 55:45" icon={<UserCheck size={20} />} color={C.purple} bg={C.purpleBg} />
        <StatCard label="总体阳性率" value={`${patientStats.positiveRate}%`}
          subValue="高于全国平均水平" icon={<ShieldCheck size={20} />} color={C.success} bg={C.successBg}
          trend={{ value: '+2.1%', up: false }} />
        <StatCard label="危急患者数" value={patientStats.criticalCount}
          subValue="及时处理率 97.8%" icon={<AlertTriangle size={20} />} color={C.danger} bg={C.dangerBg}
          trend={{ value: '+5例', up: false }} />
      </div>

      {/* 患者来源与年龄分布 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 患者来源分布 */}
        <ChartCard title="患者来源分布">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <StatPieChart width={160} height={160}>
              <Pie data={patientSourceData} cx={70} cy={70} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {patientSourceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            </StatPieChart>
            <div style={{ flex: 1 }}>
              {patientSourceData.map(item => (
                <div key={item.source} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 12, color: C.text }}>{item.source}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>{item.count}%</span>
                    <div style={{ width: 60, height: 6, background: C.background, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${item.count}%`, height: '100%', background: item.color, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* 性别分布 */}
        <ChartCard title="患者性别分布">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <StatPieChart width={160} height={160}>
              <Pie data={genderDistribution} cx={70} cy={70} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {genderDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            </StatPieChart>
            <div style={{ flex: 1 }}>
              {genderDistribution.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{item.value}%</span>
                </div>
              ))}
              <div style={{ marginTop: 12, padding: 8, background: C.background, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.textMuted }}>男女比例</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.primary }}>55 : 45</div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* 年龄分布柱状图 */}
      <div style={{ marginBottom: 16 }}>
        <ChartCard title="患者年龄分布">
          <ResponsiveContainer width="100%" height={240}>
            <StatBarChart data={ageDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Legend iconSize={10} />
              <Bar dataKey="male" name="男性" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="female" name="女性" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </StatBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 阳性率对比与趋势 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 各设备阳性率 */}
        <ChartCard title="各设备阳性率对比">
          <ResponsiveContainer width="100%" height={220}>
            <StatBarChart data={positiveRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="modality" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Bar dataKey="rate" name="阳性率%" radius={[4, 4, 0, 0]}>
                {positiveRateData.map((entry, i) => (
                  <Cell key={i} fill={entry.rate >= 50 ? C.danger : entry.rate >= 30 ? C.warning : C.success} />
                ))}
              </Bar>
            </StatBarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 阳性率趋势 */}
        <ChartCard title="检查阳性率7天趋势">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={positiveTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} domain={[30, 50]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} name="阳性率%" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ============================================================
// 标签页：阳性率统计（扩充版）
// ============================================================
function PositiveRateTab() {
  const [timeRange, setTimeRange] = useState('week')
  const [positiveType, setPositiveType] = useState('all')

  const timeRanges = [
    { key: 'today', label: '今日' },
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
  ]

  const positiveStats = {
    overallRate: 38.5,
    yoyChange: '+2.3%',
    momChange: '-1.2%',
    totalExams: 1916,
    positiveCount: 738,
    reexamRate: 5.8,
  }

  return (
    <div>
      {/* 筛选栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Calendar size={14} color={C.textMuted} />
          <div style={{ display: 'flex', gap: 4, background: C.background, borderRadius: 8, padding: 4 }}>
            {timeRanges.map(r => (
              <button key={r.key} onClick={() => setTimeRange(r.key)} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', background: timeRange === r.key ? C.white : 'transparent',
                color: timeRange === r.key ? C.primary : C.textMuted,
                boxShadow: timeRange === r.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}>{r.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={14} color={C.textMuted} />
          <select value={positiveType} onChange={e => setPositiveType(e.target.value)} style={{
            padding: '6px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12,
            color: C.text, outline: 'none', background: C.white, cursor: 'pointer'
          }}>
            <option value="all">全部类型</option>
            <option value="CT">CT</option>
            <option value="MR">MR</option>
            <option value="DR">DR</option>
            <option value="DSA">DSA</option>
          </select>
        </div>
      </div>

      {/* 阳性率概览卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="总体阳性率" value={`${positiveStats.overallRate}%`}
          subValue="本月统计" icon={<ShieldCheck size={20} />} color={C.success} bg={C.successBg}
          trend={{ value: positiveStats.momChange, up: false }} />
        <StatCard label="阳性病例数" value={positiveStats.positiveCount}
          subValue={`共 ${positiveStats.totalExams} 例检查`} icon={<AlertTriangle size={20} />} color={C.danger} bg={C.dangerBg}
          trend={{ value: '+32例', up: false }} />
        <StatCard label="复查率" value={`${positiveStats.reexamRate}%`}
          subValue="因图像质量问题" icon={<RefreshCw size={20} />} color={C.warning} bg={C.warningBg}
          trend={{ value: '-0.5%', up: true }} />
        <StatCard label="同比变化" value={positiveStats.yoyChange}
          subValue="较去年同期" icon={<TrendingUp size={20} />} color={C.info} bg={C.infoBg}
          trend={{ value: '+0.8%', up: true }} />
      </div>

      {/* 阳性率趋势图（30天） */}
      <div style={{ marginBottom: 16 }}>
        <ChartCard title="阳性率30天趋势">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={positiveRateTrend30Days}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} domain={[30, 50]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Legend iconSize={10} />
              <Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2} dot={{ r: 2 }} name="阳性率%" />
              <Line type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={1.5} dot={{ r: 2 }} name="危急值数" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 阳性率排名与复查率 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 阳性率排名 */}
        <ChartCard title="阳性率排名（Top8）">
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {positiveRateRanking.map(item => (
              <div key={item.rank} style={{
                display: 'flex', alignItems: 'center', padding: '8px 0',
                borderBottom: `1px solid ${C.border}`
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: item.rank <= 3 ? RAD_COLORS[item.rank - 1] : C.background,
                  color: item.rank <= 3 ? C.white : C.textMuted,
                  fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 10
                }}>
                  {item.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{item.type}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{item.count} 例检查</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: item.rate >= 50 ? C.danger : item.rate >= 30 ? C.warning : C.success }}>
                    {item.rate}%
                  </div>
                  <div style={{ fontSize: 10, color: item.trend.startsWith('↑') ? C.danger : item.trend.startsWith('↓') ? C.success : C.textMuted }}>
                    {item.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* 复查率统计 */}
        <ChartCard title="复查率统计（按检查类型）">
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {reexaminationData.map((item, i) => (
              <div key={item.type} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{item.type}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: item.reexamRate >= 10 ? C.dangerBg : item.reexamRate >= 5 ? C.warningBg : C.successBg,
                    color: item.reexamRate >= 10 ? C.danger : item.reexamRate >= 5 ? C.warning : C.success
                  }}>
                    复查率 {item.reexamRate}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ flex: 1, height: 6, background: C.background, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${item.reexamRate * 5}%`,
                      height: '100%',
                      background: item.reexamRate >= 10 ? C.danger : item.reexamRate >= 5 ? C.warning : C.success,
                      borderRadius: 3
                    }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: C.textMuted }}>平均间隔 {item.avgDays} 天</span>
                  <span style={{ fontSize: 10, color: C.textMuted }}>原因: {item.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* 各设备阳性率与复查率对比 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard title="各设备阳性率分布">
          <ResponsiveContainer width="100%" height={240}>
            <StatBarChart data={positiveRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="modality" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Bar dataKey="rate" name="阳性率%" radius={[4, 4, 0, 0]}>
                {positiveRateData.map((entry, i) => (
                  <Cell key={i} fill={entry.rate >= 50 ? C.danger : entry.rate >= 30 ? C.warning : C.success} />
                ))}
              </Bar>
            </StatBarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="阳性率7天趋势">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={positiveTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} domain={[30, 50]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} name="阳性率%" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ============================================================
// 标签页：经营分析（收入、成本、效益、人均产出）
// ============================================================
function BusinessAnalysisTab() {
  const [timeRange, setTimeRange] = useState('month')

  const timeRanges = [
    { key: 'month', label: '本月' },
    { key: 'quarter', label: '本季度' },
    { key: 'year', label: '本年' },
  ]

  const profitMargin = ((businessStats.netProfit / businessStats.totalRevenue) * 100).toFixed(1)

  return (
    <div>
      {/* 筛选栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Calendar size={14} color={C.textMuted} />
          <div style={{ display: 'flex', gap: 4, background: C.background, borderRadius: 8, padding: 4 }}>
            {timeRanges.map(r => (
              <button key={r.key} onClick={() => setTimeRange(r.key)} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', background: timeRange === r.key ? C.white : 'transparent',
                color: timeRange === r.key ? C.primary : C.textMuted,
                boxShadow: timeRange === r.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}>{r.label}</button>
            ))}
          </div>
        </div>
        <button style={{
          padding: '6px 14px', background: C.white, color: C.textMuted,
          border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Download size={13} /> 导出经营报表
        </button>
      </div>

      {/* 经营概览卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="总收入" value={`¥${(businessStats.totalRevenue / 10000).toFixed(0)}万`}
          subValue="本月累计" icon={<DollarSign size={20} />} color={C.success} bg={C.successBg}
          trend={{ value: businessStats.yoyRevenue, up: true }} />
        <StatCard label="总成本" value={`¥${(businessStats.totalCost / 10000).toFixed(0)}万`}
          subValue="成本率 53%" icon={<BarChart3 size={20} />} color={C.warning} bg={C.warningBg}
          trend={{ value: '+8.2%', up: false }} />
        <StatCard label="净利润" value={`¥${(businessStats.netProfit / 10000).toFixed(0)}万`}
          subValue={`利润率 ${profitMargin}%`} icon={<TrendingUp size={20} />} color={C.info} bg={C.infoBg}
          trend={{ value: businessStats.yoyProfit, up: true }} />
        <StatCard label="人均产出" value={`¥${(businessStats.perCapitaRevenue / 10000).toFixed(1)}万`}
          subValue="人均利润 ¥8.75万" icon={<Award size={20} />} color={C.purple} bg={C.purpleBg}
          trend={{ value: '+12.3%', up: true }} />
      </div>

      {/* 月度利润趋势（面积图） */}
      <div style={{ marginBottom: 16 }}>
        <ChartCard title="月度收入、成本、利润趋势（万元）">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyProfitData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }} />
              <Legend iconSize={10} />
              <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#revenueGrad)" name="收入" />
              <Area type="monotone" dataKey="cost" stroke="#dc2626" strokeWidth={2} fill="url(#costGrad)" name="成本" />
              <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="利润" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 成本结构与人均产出 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 成本结构饼图 */}
        <ChartCard title="成本结构分析">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <StatPieChart width={150} height={150}>
              <Pie data={costBreakdown} cx={65} cy={65} innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                {costBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} formatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`} />
            </StatPieChart>
            <div style={{ flex: 1 }}>
              {costBreakdown.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 11, color: C.text }}>{item.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>¥{(item.value / 10000).toFixed(0)}万</span>
                    <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 4 }}>({item.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* 人均产出趋势 */}
        <ChartCard title="人均产出趋势（万元）">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={perCapitaTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: `1px solid ${C.border}` }}
                formatter={(value: number) => `¥${(value / 10000).toFixed(1)}万`} />
              <Legend iconSize={10} />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="人均收入" />
              <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} name="人均利润" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 科室效益排名表 */}
      <ChartCard title="各科室效益分析">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.background }}>
              {['科室', '收入(万)', '成本(万)', '利润(万)', '人数', '人均利润(万)', '利润率'].map(h => (
                <th key={h} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: C.textMuted, textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {efficiencyMetrics.map(dept => {
              const rate = ((dept.profit / dept.revenue) * 100).toFixed(1)
              return (
                <tr key={dept.dept} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 12px', fontSize: 12, fontWeight: 600, color: C.primary, textAlign: 'center' }}>{dept.dept}</td>
                  <td style={{ padding: '12px 12px', fontSize: 12, textAlign: 'center', color: C.success }}>{(dept.revenue / 10000).toFixed(0)}</td>
                  <td style={{ padding: '12px 12px', fontSize: 12, textAlign: 'center', color: C.danger }}>{(dept.cost / 10000).toFixed(0)}</td>
                  <td style={{ padding: '12px 12px', fontSize: 12, textAlign: 'center', fontWeight: 700, color: C.info }}>{(dept.profit / 10000).toFixed(0)}</td>
                  <td style={{ padding: '12px 12px', fontSize: 12, textAlign: 'center' }}>{dept.staff}</td>
                  <td style={{ padding: '12px 12px', fontSize: 12, textAlign: 'center', fontWeight: 700, color: C.primary }}>{(dept.perCapita / 10000).toFixed(1)}</td>
                  <td style={{ padding: '12px 12px', fontSize: 12, textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: parseFloat(rate) >= 45 ? C.successBg : parseFloat(rate) >= 35 ? C.warningBg : C.dangerBg,
                      color: parseFloat(rate) >= 45 ? C.success : parseFloat(rate) >= 35 ? C.warning : C.danger
                    }}>{rate}%</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ChartCard>
    </div>
  )
}

// ============================================================
// 主组件
// ============================================================
export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState('examVolume')

  const tabs = [
    { key: 'examVolume', label: '检查量统计', icon: <BarChart3 size={14} /> },
    { key: 'positiveRate', label: '阳性率统计', icon: <ShieldCheck size={14} /> },
    { key: 'workload', label: '工作量统计', icon: <Users size={14} /> },
    { key: 'business', label: '经营分析', icon: <DollarSign size={14} /> },
    { key: 'revenue', label: '收入统计', icon: <TrendingUp size={14} /> },
    { key: 'quality', label: '质量控制', icon: <Award size={14} /> },
    { key: 'device', label: '设备效能', icon: <Monitor size={14} /> },
    { key: 'patient', label: '患者分析', icon: <UserCheck size={14} /> },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', background: C.background, minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.primary, margin: '0 0 6px' }}>统计分析</h1>
          <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>放射科全维度数据洞察 · 检查量趋势 · 阳性率分析 · 收入统计 · 经营分析 · 医师工作量 · 设备产能 · 患者画像</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            padding: '7px 14px', background: C.white, color: C.textMuted,
            border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <RefreshCw size={13} /> 刷新数据
          </button>
          <button style={{
            padding: '7px 14px', background: C.primary, color: C.white,
            border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Download size={13} /> 导出报表
          </button>
        </div>
      </div>

      {/* 标签切换 */}
      <div style={{ background: C.white, borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              background: activeTab === tab.key ? C.infoBg : 'transparent',
              color: activeTab === tab.key ? C.info : C.textMuted
            }}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 标签内容 */}
      <div>
        {activeTab === 'examVolume' && <ExamVolumeTab />}
        {activeTab === 'positiveRate' && <PositiveRateTab />}
        {activeTab === 'workload' && <WorkloadTab />}
        {activeTab === 'business' && <BusinessAnalysisTab />}
        {activeTab === 'revenue' && <RevenueTab />}
        {activeTab === 'quality' && <QualityControlTab />}
        {activeTab === 'device' && <DeviceEfficiencyTab />}
        {activeTab === 'patient' && <PatientAnalysisTab />}
      </div>
    </div>
  )
}
