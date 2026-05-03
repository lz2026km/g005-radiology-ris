// @ts-nocheck
// G005 放射科RIS系统 - 设备管理页面 v2.0.0 (800+行)
import { useState } from 'react'
import {
  Monitor, Wrench, AlertCircle, CheckCircle, Clock, Search, Activity,
  Settings, TrendingUp, BarChart2, Calendar, User, Filter, ChevronUp,
  ChevronDown, RefreshCw, AlertTriangle, Zap, Timer,
  Plus, X, Check, Bell, Shield, Eye, Pause, Play, Download,
  Droplet, Heart, Cpu, Gauge, Settings2,
  QrCode, Camera, DollarSign, Power, TrendingDown,
  FileText, CreditCard, CalendarDays
} from 'lucide-react'
import {
  BarChart as ChartBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts'
import {
  initialModalityDevices, initialDeviceMaintenance, initialExamRooms,
  initialRadiologyExams, initialDailyStats
} from '../data/initialData'

// ============================================================
// 样式常量
// ============================================================
const C = {
  primary: '#1e3a5f',
  primaryLight: '#2d5a87',
  primaryLighter: '#e8f0f8',
  accent: '#3b82f6',
  white: '#ffffff',
  bg: '#f0f4f8',
  border: '#e2e8f0',
  textDark: '#1e3a5f',
  textMid: '#475569',
  textLight: '#94a3b8',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#2563eb',
}

const STATUS_COLORS: Record<string, string> = {
  '使用中': '#059669',
  '空闲': '#2563eb',
  '维护中': '#d97706',
  '维修中': '#dc2626',
  '已报废': '#94a3b8',
}

const MODALITY_LABELS: Record<string, { label: string; color: string }> = {
  'CT': { label: 'CT', color: '#7c3aed' },
  'MR': { label: 'MR', color: '#2563eb' },
  'DR': { label: 'DR', color: '#059669' },
  'DSA': { label: 'DSA', color: '#dc2626' },
  '乳腺钼靶': { label: '乳腺钼靶', color: '#d97706' },
  '胃肠造影': { label: '胃肠造影', color: '#0891b2' },
  '骨密度': { label: '骨密度', color: '#4f46e5' },
}

// 设备分类列表
export const DEVICE_CATEGORIES = ['全部', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶', '胃肠造影', '骨密度']

// 设备状态列表
export const DEVICE_STATUSES = ['全部', '空闲', '使用中', '维护中', '故障', '停用']

const PIE_COLORS = ['#3b82f6', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#ea580c', '#4f46e5']

// ============================================================
// 模拟扩展数据
// ============================================================
const generateDeviceStats = () => {
  const deviceUsageMap: Record<string, number[]> = {}
  const dates = ['04-25', '04-26', '04-27', '04-28', '04-29', '04-30', '05-01']
  const devices = initialModalityDevices

  devices.forEach(d => {
    const base = d.modality === 'CT' ? 120 : d.modality === 'MR' ? 60 : d.modality === 'DR' ? 200 : 15
    deviceUsageMap[d.id] = dates.map((_, i) => Math.max(0, base + Math.floor((Math.random() - 0.3) * 30) - i * 2))
  })
  return { dates, deviceUsageMap }
}

const deviceStatsData = generateDeviceStats()

const MAINTENANCE_RECORDS = [
  { id: 'M001', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）', date: '2026-04-15', type: '定期保养', engineer: '张工', cost: 2800, content: '更换球管滤线栅，清洁滑环，校正成像参数', result: '合格', nextDate: '2026-07-15' },
  { id: 'M002', deviceId: 'DEV-MR-02', deviceName: 'MR-2（飞利浦Ingenia）', date: '2026-04-20', type: '故障维修', engineer: '李工', cost: 15000, content: '更换梯度放大器模块，补充液氦', result: '合格', nextDate: '2026-10-20' },
  { id: 'M003', deviceId: 'DEV-DR-01', deviceName: 'DR-1（飞利浦DigitalDiagnost）', date: '2026-03-28', type: '定期保养', engineer: '王工', cost: 1500, content: '探测器校准，X线管训练', result: '合格', nextDate: '2026-06-28' },
  { id: 'M004', deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）', date: '2026-04-10', type: '定期保养', engineer: '张工', cost: 3200, content: '更换X线管，探测器校准，系统综合测试', result: '合格', nextDate: '2026-07-10' },
  { id: 'M005', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）', date: '2026-03-15', type: '定期保养', engineer: '李工', cost: 2000, content: '磁体冷头维护，梯度线圈检测', result: '合格', nextDate: '2026-06-15' },
  { id: 'M006', deviceId: 'DEV-DSA-01', deviceName: 'DSA-1（飞利浦Azurion 7）', date: '2026-04-05', type: '故障维修', engineer: '赵工', cost: 22000, content: '更换C型臂驱动马达，校正机械精度', result: '合格', nextDate: '2026-10-05' },
  { id: 'M007', deviceId: 'DEV-DR-02', deviceName: 'DR-2（GE Optima）', date: '2026-02-20', type: '定期保养', engineer: '王工', cost: 1800, content: '平板探测器检测，X线系统综合校准', result: '合格', nextDate: '2026-05-20' },
  { id: 'M008', deviceId: 'DEV-MG-01', deviceName: '乳腺钼靶（GE Senographe）', date: '2026-03-10', type: '定期保养', engineer: '陈工', cost: 1200, content: '压迫器校准，乳腺工作站图像质量检测', result: '合格', nextDate: '2026-06-10' },
]

const MAINTENANCE_PLANS = [
  { id: 'MP001', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）', planDate: '2026-07-15', type: '定期保养', content: '球管衰减检测，系统综合保养', estimatedCost: 3000, assignee: '张工' },
  { id: 'MP002', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）', planDate: '2026-06-15', type: '定期保养', content: '液氦补充，滑环清洁，梯度测试', estimatedCost: 2500, assignee: '李工' },
  { id: 'MP003', deviceId: 'DEV-DR-01', deviceName: 'DR-1（飞利浦DigitalDiagnost）', planDate: '2026-06-28', type: '定期保养', content: '探测器校准，X线管训练', estimatedCost: 1800, assignee: '王工' },
  { id: 'MP004', deviceId: 'DEV-DR-02', deviceName: 'DR-2（GE Optima）', planDate: '2026-05-20', type: '定期保养', content: '系统全面检查，易损件更换', estimatedCost: 2000, assignee: '王工' },
  { id: 'MP005', deviceId: 'DEV-MG-01', deviceName: '乳腺钼靶（GE Senographe）', planDate: '2026-06-10', type: '定期保养', content: '压迫器校准，图像质量检测', estimatedCost: 1500, assignee: '陈工' },
  { id: 'MP006', deviceId: 'DEV-RF-01', deviceName: '胃肠造影（岛津Flexavision）', planDate: '2026-05-25', type: '定期保养', content: 'X线系统校准，影像增强器维护', estimatedCost: 2200, assignee: '张工' },
  { id: 'MP007', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）', planDate: '2026-10-15', type: '年度保养', content: '全面系统检测，球管衰减评估', estimatedCost: 8000, assignee: '张工' },
  { id: 'MP008', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）', planDate: '2026-09-15', type: '半年保养', content: '磁体冷头维护，氦压机检查', estimatedCost: 4500, assignee: '李工' },
]

// ============================================================
// 维保合同管理数据
// ============================================================
const MAINTENANCE_CONTRACTS = [
  { id: 'MC001', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）', company: 'GE医疗', contractNo: 'CT-2024-001', startDate: '2024-01-01', endDate: '2027-12-31', amount: 480000, paymentStatus: '已付款', coverage: '全保', contactPerson: '刘经理', contactTel: '138-0001-8001' },
  { id: 'MC002', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）', company: '西门子医疗', contractNo: 'MR-2023-015', startDate: '2023-06-01', endDate: '2026-05-31', amount: 360000, paymentStatus: '待付款', coverage: '全保', contactPerson: '王经理', contactTel: '138-0001-8002' },
  { id: 'MC003', deviceId: 'DEV-DR-01', deviceName: 'DR-1（飞利浦DigitalDiagnost）', company: '飞利浦医疗', contractNo: 'DR-2024-008', startDate: '2024-03-01', endDate: '2027-02-28', amount: 180000, paymentStatus: '已付款', coverage: '保修', contactPerson: '陈经理', contactTel: '138-0001-8003' },
  { id: 'MC004', deviceId: 'DEV-DSA-01', deviceName: 'DSA-1（飞利浦Azurion 7）', company: '飞利浦医疗', contractNo: 'DSA-2023-022', startDate: '2023-09-01', endDate: '2026-08-31', amount: 600000, paymentStatus: '已付款', coverage: '全保', contactPerson: '赵经理', contactTel: '138-0001-8004' },
  { id: 'MC005', deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）', company: '西门子医疗', contractNo: 'CT-2025-003', startDate: '2025-01-01', endDate: '2029-12-31', amount: 960000, paymentStatus: '已付款', coverage: '全保', contactPerson: '周经理', contactTel: '138-0001-8005' },
]

// 维保费用年度统计
const MAINTENANCE_COST_DATA = [
  { month: '1月', ct: 12000, mr: 8000, dr: 4500, dsa: 22000, other: 3000, total: 49500 },
  { month: '2月', ct: 8000, mr: 15000, dr: 3000, dsa: 5000, other: 2500, total: 33500 },
  { month: '3月', ct: 15000, mr: 6000, dr: 1800, dsa: 8000, other: 4000, total: 34800 },
  { month: '4月', ct: 22000, mr: 2000, dr: 1500, dsa: 35000, other: 2800, total: 63300 },
  { month: '5月', ct: 10000, mr: 9000, dr: 2200, dsa: 6000, other: 3200, total: 30400 },
  { month: '6月', ct: 6000, mr: 7000, dr: 1800, dsa: 4000, other: 2500, total: 21300 },
]

// 效益分析模拟数据
const REVENUE_DATA = [
  { month: '1月', ct: 2800000, mr: 1800000, dr: 1200000, dsa: 3500000, mg: 450000, rf: 380000, total: 10110000 },
  { month: '2月', ct: 2400000, mr: 1600000, dr: 1100000, dsa: 3200000, mg: 420000, rf: 350000, total: 9070000 },
  { month: '3月', ct: 3000000, mr: 2000000, dr: 1300000, dsa: 3800000, mg: 480000, rf: 420000, total: 11000000 },
  { month: '4月', ct: 3200000, mr: 2200000, dr: 1400000, dsa: 4000000, mg: 500000, rf: 440000, total: 11740000 },
  { month: '5月', ct: 2900000, mr: 1900000, dr: 1250000, dsa: 3600000, mg: 460000, rf: 400000, total: 10510000 },
  { month: '6月', ct: 3100000, mr: 2100000, dr: 1350000, dsa: 3900000, mg: 490000, rf: 430000, total: 11370000 },
]

// 故障停机损失数据
const DOWNTIME_DATA = [
  { deviceName: 'CT-1', faultCount: 2, downtimeHours: 16, lossAmount: 48000, mtbf: 180, description: '球管故障' },
  { deviceName: 'MR-1', faultCount: 1, downtimeHours: 48, lossAmount: 72000, mtbf: 220, description: '梯度放大器故障' },
  { deviceName: 'DR-1', faultCount: 3, downtimeHours: 8, lossAmount: 12000, mtbf: 150, description: '平板探测器故障' },
  { deviceName: 'DSA-1', faultCount: 1, downtimeHours: 72, lossAmount: 144000, mtbf: 200, description: 'C型臂驱动故障' },
  { deviceName: 'CT-2', faultCount: 0, downtimeHours: 0, lossAmount: 0, mtbf: 280, description: '无故障' },
]

// 今日检查量排名
const TODAY_RANKING = [
  { rank: 1, deviceName: 'DR-2（GE Optima）', modality: 'DR', examCount: 186, waitingCount: 12, avgWaitTime: 8 },
  { rank: 2, deviceName: 'CT-1（GE Revolution）', modality: 'CT', examCount: 142, waitingCount: 8, avgWaitTime: 15 },
  { rank: 3, deviceName: 'DR-1（飞利浦）', modality: 'DR', examCount: 138, waitingCount: 6, avgWaitTime: 6 },
  { rank: 4, deviceName: 'MR-1（西门子）', modality: 'MR', examCount: 58, waitingCount: 5, avgWaitTime: 22 },
  { rank: 5, deviceName: 'CT-2（西门子Force）', modality: 'CT', examCount: 52, waitingCount: 3, avgWaitTime: 18 },
  { rank: 6, deviceName: '乳腺钼靶', modality: '乳腺钼靶', examCount: 28, waitingCount: 2, avgWaitTime: 10 },
  { rank: 7, deviceName: '胃肠造影', modality: '胃肠造影', examCount: 15, waitingCount: 1, avgWaitTime: 25 },
  { rank: 8, deviceName: 'DSA-1（飞利浦）', modality: 'DSA', examCount: 8, waitingCount: 0, avgWaitTime: 0 },
]

// 开机率统计数据
const UPTIME_STATS = [
  { deviceName: 'CT-1', uptimeRate: 96.5, runtimeHours: 216, downtimeHours: 8, reason: '保养' },
  { deviceName: 'MR-1', uptimeRate: 94.2, runtimeHours: 212, downtimeHours: 12, reason: '故障' },
  { deviceName: 'DR-1', uptimeRate: 98.1, runtimeHours: 220, downtimeHours: 4, reason: '保养' },
  { deviceName: 'DR-2', uptimeRate: 99.2, runtimeHours: 224, downtimeHours: 0, reason: '-' },
  { deviceName: 'CT-2', uptimeRate: 97.8, runtimeHours: 221, downtimeHours: 3, reason: '校准' },
  { deviceName: 'MR-2', uptimeRate: 95.5, runtimeHours: 216, downtimeHours: 8, reason: '保养' },
  { deviceName: 'DSA-1', uptimeRate: 92.0, runtimeHours: 208, downtimeHours: 16, reason: '故障' },
  { deviceName: '乳腺钼靶', uptimeRate: 98.8, runtimeHours: 223, downtimeHours: 1, reason: '校准' },
]

// 设备详细扩展信息（含序列号、购买日期、保修截止等）
const DEVICE_EXTENDED_INFO = initialModalityDevices.map(d => {
  const purchaseYear = d.acquisitionYear || 2020
  const warrantyYears = [3, 5, 5, 3, 3, 5, 5, 3][Math.floor(Math.random() * 8)] || 3
  const serialPrefix = { CT: 'CT', MR: 'MR', DR: 'DR', DSA: 'DS', MG: 'MG', RF: 'RF' }[d.modality] || 'DV'
  return {
    ...d,
    serialNumber: `${serialPrefix}-${purchaseYear}-${String(Math.floor(Math.random() * 9000 + 1000))}`,
    purchaseDate: `${purchaseYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    warrantyExpiry: `${purchaseYear + warrantyYears}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    purchasePrice: Math.floor(Math.random() * 8000000 + 2000000),
    installationDate: `${purchaseYear + 1}-01-15`,
    installationLocation: `${d.location || '放射科'}`,
    assetCode: `ZYCZ-${purchaseYear}-${String(Math.floor(Math.random() * 900 + 100))}`,
    contactEngineer: ['张工', '李工', '王工', '赵工', '陈工'][Math.floor(Math.random() * 5)],
    contactTel: `138-${String(Math.floor(Math.random() * 9000 + 1000)).padStart(4, '0')}-${String(Math.floor(Math.random() * 9000 + 1000)).padStart(4, '0')}`,
  }
})

// 设备照片占位符数据（模拟）
const DEVICE_PHOTOS = initialModalityDevices.map(d => ({
  deviceId: d.id,
  deviceName: d.name,
  photoUrl: null, // 占位：实际项目可替换为真实图片URL
  lastUpdated: '2026-03-15',
}))

// ============================================================
// 模拟扩展数据

const DEVICE_EFFICIENCY = initialModalityDevices.map(d => {
  const room = initialExamRooms.find(r => r.deviceId === d.id)
  const todayBookings = room?.todaysBookings || 0
  const capacity = d.modality === 'CT' ? 150 : d.modality === 'MR' ? 80 : d.modality === 'DR' ? 250 : 20
  const utilization = Math.round((todayBookings / capacity) * 100)
  const uptime = 95 + Math.floor(Math.random() * 5)
  const mtbf = 180 + Math.floor(Math.random() * 120)
  const age = 2026 - (d.acquisitionYear || 2020)
  return {
    ...d,
    todayBookings,
    capacity,
    utilization,
    uptime,
    mtbf,
    age,
    healthScore: Math.min(100, Math.max(60, 100 - age * 3 - (100 - uptime))),
    avgExamTime: d.modality === 'CT' ? 18 : d.modality === 'MR' ? 35 : d.modality === 'DR' ? 6 : 45,
    maxExamTime: d.modality === 'CT' ? 35 : d.modality === 'MR' ? 70 : d.modality === 'DR' ? 12 : 90,
    minExamTime: d.modality === 'CT' ? 8 : d.modality === 'MR' ? 15 : d.modality === 'DR' ? 3 : 20,
    totalRuntime: (age * 365 * 8).toLocaleString() + ' 小时',
    faultCount: Math.floor(Math.random() * 4),
    maintCount: Math.floor(Math.random() * 6) + 1,
  }
})

// 7天检查量趋势数据
const WEEKLY_TREND_DATA = deviceStatsData.dates.map((date, i) => {
  const entry: Record<string, string | number> = { date }
  initialModalityDevices.forEach(d => {
    entry[d.id] = deviceStatsData.deviceUsageMap[d.id][i]
  })
  return entry
})

// 使用时段热力图数据
const HEATMAP_DATA = Array.from({ length: 7 }, (_, dayIdx) => {
  const dayName = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][dayIdx]
  const entry: Record<string, string | number> = { day: dayName }
  for (let h = 8; h <= 18; h++) {
    entry[`h${h}`] = Math.floor(Math.random() * 100)
  }
  return entry
})

// ============================================================
// 子组件
// ============================================================

/** 标签页按钮 */
function TabBtn({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: active ? 700 : 500,
        background: active ? C.primary : 'transparent',
        color: active ? '#fff' : C.textMid,
        transition: 'all 0.2s',
        boxShadow: active ? '0 2px 8px rgba(30,58,95,0.3)' : 'none',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

/** 统计卡片 */
function StatCard({ label, value, icon, color, subtitle }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; subtitle?: string
}) {
  return (
    <div style={{
      background: C.white, borderRadius: 12, padding: '16px 18px', border: `1px solid ${C.border}`,
      boxShadow: '0 1px 4px rgba(30,58,95,0.06)', display: 'flex', alignItems: 'center', gap: 14
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.textDark, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11.5, color: C.textLight, marginTop: 2 }}>{label}</div>
        {subtitle && <div style={{ fontSize: 10, color: C.textLight, marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  )
}

/** 状态徽章 */
function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#94a3b8'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: `${color}18`, color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {status}
    </span>
  )
}

/** 设备类型标签 */
function ModalityBadge({ modality }: { modality: string }) {
  const cfg = MODALITY_LABELS[modality] || { label: modality, color: '#94a3b8' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      fontSize: 10.5, fontWeight: 700,
      background: `${cfg.color}15`, color: cfg.color, letterSpacing: 0.3
    }}>
      {cfg.label}
    </span>
  )
}

/** 进度条 */
function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)))
  const barColor = color || (pct > 90 ? C.danger : pct > 70 ? C.warning : C.success)
  return (
    <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${pct}%`, background: barColor,
        borderRadius: 3, transition: 'width 0.4s ease'
      }} />
    </div>
  )
}

/** 设备卡片 */
function DeviceCard({ device, onDetail, onExam, onMaintenance }: {
  device: typeof DEVICE_EFFICIENCY[0]
  onDetail: () => void; onExam: () => void; onMaintenance: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const room = initialExamRooms.find(r => r.deviceId === device.id)
  const todayExams = room?.todaysBookings || 0
  const loadPct = Math.round((todayExams / device.capacity) * 100)
  const isInUse = device.status === '使用中'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white, borderRadius: 12, border: `1px solid ${hovered ? C.accent : C.border}`,
        boxShadow: hovered ? '0 4px 16px rgba(30,58,95,0.12)' : '0 1px 4px rgba(30,58,95,0.05)',
        overflow: 'hidden', transition: 'all 0.2s', transform: hovered ? 'translateY(-2px)' : 'none'
      }}
    >
      {/* 卡片头部 */}
      <div style={{
        padding: '14px 16px', background: '#f8fafc', borderBottom: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {device.name.split('（')[0]}
            </span>
            <ModalityBadge modality={device.modality} />
          </div>
          <div style={{ fontSize: 11, color: C.textLight }}>
            {device.manufacturer} · {device.model}
          </div>
        </div>
        <StatusBadge status={device.status} />
      </div>

      {/* 卡片主体 */}
      <div style={{ padding: 14 }}>
        {/* 当前患者（使用中） */}
        {isInUse && room?.currentPatient && (
          <div style={{
            background: `${C.success}0d`, border: `1px solid ${C.success}25`,
            borderRadius: 8, padding: '8px 10px', marginBottom: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <User size={11} color={C.success} />
              <span style={{ fontSize: 10, color: C.success, fontWeight: 700 }}>当前患者</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textDark, marginBottom: 1 }}>
              {room.currentPatient}
            </div>
            <div style={{ fontSize: 10.5, color: C.textMid }}>
              {room.name} · 已检查约 {Math.floor(Math.random() * 20 + 5)} 分钟
            </div>
          </div>
        )}

        {/* 信息网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
          {[
            ['检查室', room?.name || '-'],
            ['今日检查', `${todayExams} 例`],
            ['累计检查', `${device.capacity * 30} 例/月`],
            ['购置年份', device.acquisitionYear ? `${device.acquisitionYear}年` : '-'],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#f8fafc', borderRadius: 6, padding: '5px 8px' }}>
              <div style={{ fontSize: 10, color: C.textLight }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textDark, marginTop: 1 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* 利用率进度 */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: C.textMid }}>今日工作量</span>
            <span style={{
              fontSize: 11, fontWeight: 800,
              color: loadPct > 90 ? C.danger : loadPct > 70 ? C.warning : C.success
            }}>
              {loadPct}%
            </span>
          </div>
          <ProgressBar value={todayExams} max={device.capacity} />
          <div style={{ fontSize: 10, color: C.textLight, marginTop: 2, textAlign: 'right' }}>
            {todayExams} / {device.capacity} 例
          </div>
        </div>

        {/* 利用率 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px', background: `${C.accent}0d`, borderRadius: 6, marginBottom: 10
        }}>
          <span style={{ fontSize: 11, color: C.textMid }}>设备利用率</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.accent }}>{device.utilization}%</span>
        </div>

        {/* 维保信息 */}
        <div style={{ fontSize: 10.5, color: C.textLight, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <span>最后维保：2026-04-{10 + Math.floor(Math.random() * 20)}</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: `1px solid ${C.border}`,
      }}>
        {[
          { label: '详情', icon: <Eye size={11} />, on: onDetail, color: C.accent },
          { label: isInUse ? '检查中' : '开始检查', icon: <Play size={11} />, on: onExam, color: C.success, disabled: device.status !== '空闲' && device.status !== '使用中' },
          { label: '维保', icon: <Wrench size={11} />, on: onMaintenance, color: C.warning },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.on}
            disabled={btn.disabled}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '8px 4px', border: 'none', cursor: 'pointer', fontSize: 10.5,
              background: 'transparent', color: btn.disabled ? C.textLight : btn.color,
              transition: 'background 0.15s',
              opacity: btn.disabled ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!btn.disabled) (e.target as HTMLElement).style.background = `${btn.color}0f` }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent' }}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** 设备详情弹层面板 */
function DeviceDetailPanel({ device, onClose }: { device: typeof DEVICE_EFFICIENCY[0]; onClose: () => void }) {
  const room = initialExamRooms.find(r => r.deviceId === device.id)
  const todayExams = room?.todaysBookings || 0
  const maintRecords = MAINTENANCE_RECORDS.filter(m => m.deviceId === device.id)
  // 设备扩展信息
  const extInfo = DEVICE_EXTENDED_INFO.find(e => e.id === device.id) || device

  // 模拟24小时时间轴数据
  const timelineHours = Array.from({ length: 25 }, (_, i) => {
    const busy = i >= 8 && i <= 12 || i >= 14 && i <= 17
    return { hour: i, busy: busy && Math.random() > 0.2, examCount: busy ? Math.floor(Math.random() * 4) : 0 }
  })

  // 7天数据 for line chart
  const device7d = deviceStatsData.dates.map((date, i) => ({
    date, count: deviceStatsData.deviceUsageMap[device.id][i]
  }))

  // 生成模拟二维码内容
  const qrCodeContent = `DEVICE:${device.id}|${device.name}|${device.modality}|${device.serialNumber || device.id}`

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: C.white, borderRadius: 16, width: '100%', maxWidth: 900,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(30,58,95,0.25)'
      }}>
        {/* 弹窗头部 */}
        <div style={{
          padding: '18px 24px', background: C.primary, color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderRadius: '16px 16px 0 0',
          position: 'sticky', top: 0, zIndex: 10
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} />
              {device.name}
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.8, marginTop: 2 }}>
              {device.manufacturer} · {device.model} · {device.modality}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
            padding: 8, cursor: 'pointer', color: '#fff', display: 'flex'
          }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* 基本信息卡 + 设备照片 + 二维码 */}
          <div style={{
            background: '#f8fafc', borderRadius: 12, padding: 18,
            border: `1px solid ${C.border}`, marginBottom: 20
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Settings size={13} /> 设备基本信息
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                ['设备编号', device.id],
                ['设备型号', device.model],
                ['制造厂商', device.manufacturer],
                ['设备类型', device.modality],
                ['检查室', room?.name || '-'],
                ['安装位置', extInfo.installationLocation],
                ['购置年份', device.acquisitionYear ? `${device.acquisitionYear}年` : '-'],
                ['当前状态', device.status],
                ['序列号', extInfo.serialNumber || '-'],
                ['购买日期', extInfo.purchaseDate || '-'],
                ['保修截止', extInfo.warrantyExpiry || '-'],
                ['资产编号', extInfo.assetCode || '-'],
              ].map(([label, val]) => (
                <div key={label} style={{ background: C.white, borderRadius: 8, padding: '8px 12px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.textLight }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textDark, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 设备照片占位 + 二维码区域 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 20 }}>
            {/* 设备照片占位 */}
            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: 18,
              border: `1px solid ${C.border}`
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Camera size={13} /> 设备照片
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* 照片占位框 */}
                <div style={{
                  width: 180, height: 135,
                  background: `linear-gradient(135deg, ${C.primaryLighter} 0%, ${C.border} 100%)`,
                  borderRadius: 10, border: `2px dashed ${C.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 8, flexShrink: 0
                }}>
                  <Camera size={32} style={{ color: C.textLight }} />
                  <span style={{ fontSize: 11, color: C.textLight, textAlign: 'center' }}>设备照片占位</span>
                  <span style={{ fontSize: 10, color: C.textLight }}>点击上传</span>
                </div>
                {/* 照片信息 */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.textMid, marginBottom: 6 }}>设备名称：{device.name}</div>
                  <div style={{ fontSize: 11, color: C.textMid, marginBottom: 6 }}>最后更新：{extInfo.purchaseDate}</div>
                  <div style={{ fontSize: 11, color: C.textMid, marginBottom: 8 }}>照片状态：待上传</div>
                  <button style={{
                    padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.accent}40`,
                    background: `${C.accent}10`, color: C.accent, fontSize: 11.5, fontWeight: 600, cursor: 'pointer'
                  }} onClick={() => alert('上传设备照片功能开发中')}>
                    上传照片
                  </button>
                </div>
              </div>
            </div>

            {/* 设备二维码/条码 */}
            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: 18,
              border: `1px solid ${C.border}`, minWidth: 200
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <QrCode size={13} /> 设备二维码/条码
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                {/* 二维码占位框 */}
                <div style={{
                  width: 120, height: 120,
                  background: C.white, borderRadius: 10, border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <QrCode size={48} style={{ color: C.primary }} />
                    <div style={{ fontSize: 8, color: C.textLight, marginTop: 2 }}>QR Code</div>
                  </div>
                </div>
                {/* 条码 */}
                <div style={{
                  background: C.white, borderRadius: 8, padding: '8px 12px',
                  border: `1px solid ${C.border}`, width: '100%', textAlign: 'center'
                }}>
                  <div style={{
                    fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                    color: C.textDark, letterSpacing: 2, marginBottom: 2
                  }}>
                    {device.id.replace('DEV-', '')}
                  </div>
                  <div style={{ height: 2, background: `${C.textDark}`, margin: '2px 4px', borderRadius: 1 }} />
                  <div style={{ fontSize: 9, color: C.textLight, marginTop: 2 }}>设备条码</div>
                </div>
                <div style={{ fontSize: 10, color: C.textLight, textAlign: 'center' }}>
                  扫码查看设备详情
                </div>
              </div>
            </div>
          </div>

          {/* 今日使用时间轴 */}
          <div style={{
            background: '#f8fafc', borderRadius: 12, padding: 18,
            border: `1px solid ${C.border}`, marginBottom: 20
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={13} /> 今日使用时间轴（0-24时）
            </div>
            <div style={{ display: 'flex', gap: 2, height: 60, alignItems: 'flex-end' }}>
              {timelineHours.map((t, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <div style={{
                    width: '100%', borderRadius: '2px 2px 0 0',
                    background: t.busy ? C.success : '#e2e8f0',
                    height: `${Math.max(4, t.examCount * 15)}px`,
                    transition: 'height 0.3s',
                  }} />
                  {i % 4 === 0 && (
                    <span style={{ fontSize: 8, color: C.textLight }}>{t.hour}</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: C.textMid }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: C.success }} /> 使用中
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: C.textMid }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#e2e8f0' }} /> 空闲
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* 7天检查量趋势 */}
            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: 18,
              border: `1px solid ${C.border}`
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={13} /> 7天检查量趋势
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={device7d}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11 }}
                    itemStyle={{ color: C.primary }}
                  />
                  <Area type="monotone" dataKey="count" stroke={C.accent} fill={`${C.accent}22`} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 健康状态 */}
            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: 18,
              border: `1px solid ${C.border}`
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Heart size={13} /> 设备健康状态评分
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <div style={{ position: 'relative', width: 90, height: 90 }}>
                  <svg viewBox="0 0 36 36" style={{ width: 90, height: 90 }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.2" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={device.healthScore > 80 ? C.success : device.healthScore > 60 ? C.warning : C.danger}
                      strokeWidth="3.2"
                      strokeDasharray={`${device.healthScore} 100`}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: C.textDark }}>{device.healthScore}</span>
                    <span style={{ fontSize: 8, color: C.textLight }}>健康分</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: C.textMid }}>
                  <span>运行时长：{device.totalRuntime}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: C.textMid }}>
                  <span>故障次数：{device.faultCount} 次</span>
                  <span>维保次数：{device.maintCount} 次</span>
                </div>
              </div>
            </div>
          </div>

          {/* 性能指标 */}
          <div style={{
            background: '#f8fafc', borderRadius: 12, padding: 18,
            border: `1px solid ${C.border}`, marginBottom: 20
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Gauge size={13} /> 性能指标
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: '平均检查时长', value: `${device.avgExamTime} 分钟`, color: C.accent },
                { label: '最大检查时长', value: `${device.maxExamTime} 分钟`, color: C.warning },
                { label: '最小检查时长', value: `${device.minExamTime} 分钟`, color: C.success },
              ].map(item => (
                <div key={item.label} style={{
                  background: C.white, borderRadius: 10, padding: '12px 14px',
                  border: `1px solid ${C.border}`, textAlign: 'center'
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 10.5, color: C.textLight, marginTop: 3 }}>{item.label}</div>
                </div>
              ))}
              <div style={{
                background: C.white, borderRadius: 10, padding: '12px 14px',
                border: `1px solid ${C.border}`, textAlign: 'center'
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{device.utilization}%</div>
                <div style={{ fontSize: 10.5, color: C.textLight, marginTop: 3 }}>设备利用率</div>
              </div>
              <div style={{
                background: C.white, borderRadius: 10, padding: '12px 14px',
                border: `1px solid ${C.border}`, textAlign: 'center'
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{device.uptime}%</div>
                <div style={{ fontSize: 10.5, color: C.textLight, marginTop: 3 }}>开机率</div>
              </div>
              <div style={{
                background: C.white, borderRadius: 10, padding: '12px 14px',
                border: `1px solid ${C.border}`, textAlign: 'center'
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{device.mtbf} 天</div>
                <div style={{ fontSize: 10.5, color: C.textLight, marginTop: 3 }}>MTBF（故障间隔）</div>
              </div>
            </div>
          </div>

          {/* 维保历史 */}
          <div style={{
            background: '#f8fafc', borderRadius: 12, padding: 18,
            border: `1px solid ${C.border}`
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wrench size={13} /> 维保历史
            </div>
            {maintRecords.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {maintRecords.map(record => (
                  <div key={record.id} style={{
                    background: C.white, borderRadius: 8, padding: '10px 14px',
                    border: `1px solid ${C.border}`, display: 'grid',
                    gridTemplateColumns: '100px 1fr 80px 80px 60px', gap: 10, alignItems: 'center'
                  }}>
                    <div style={{ fontSize: 11, color: C.textMid }}>{record.date}</div>
                    <div style={{ fontSize: 11, color: C.textDark, fontWeight: 600 }}>{record.content}</div>
                    <div style={{ fontSize: 10.5, color: C.textMid }}>{record.engineer}</div>
                    <div style={{ fontSize: 10.5, color: C.warning, fontWeight: 700 }}>¥{record.cost.toLocaleString()}</div>
                    <div style={{ fontSize: 10.5, color: C.success, fontWeight: 700 }}>{record.result}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 20, color: C.textLight, fontSize: 12 }}>
              暂无维保记录
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** 维保合同管理面板 */
function ContractManagementPanel() {
  const [selectedContract, setSelectedContract] = useState<typeof MAINTENANCE_CONTRACTS[0] | null>(null)

  // 计算合同到期提醒
  const getContractExpireStatus = (endDate: string) => {
    const now = new Date('2026-05-02')
    const end = new Date(endDate)
    const daysLeft = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return { label: '已到期', color: C.danger }
    if (daysLeft <= 30) return { label: `即将到期(${daysLeft}天)`, color: C.warning }
    if (daysLeft <= 90) return { label: `${daysLeft}天后到期`, color: C.info }
    return { label: '正常', color: C.success }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        <FileText size={14} style={{ color: C.accent }} /> 维保合同管理
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 合同列表 */}
        <div style={{
          background: C.white, borderRadius: 12, padding: 16,
          border: `1px solid ${C.border}`, maxHeight: 480, overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.textDark }}>合同列表（{MAINTENANCE_CONTRACTS.length}）</span>
            <button style={{
              padding: '4px 10px', borderRadius: 6, border: `1px solid ${C.accent}40`,
              background: `${C.accent}10`, color: C.accent, fontSize: 10.5, fontWeight: 600, cursor: 'pointer'
            }} onClick={() => alert('新建维保合同功能开发中')}>
              <Plus size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
              新建合同
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MAINTENANCE_CONTRACTS.map(contract => {
              const expireStatus = getContractExpireStatus(contract.endDate)
              return (
                <div
                  key={contract.id}
                  onClick={() => setSelectedContract(contract)}
                  style={{
                    background: selectedContract?.id === contract.id ? `${C.accent}10` : '#f8fafc',
                    borderRadius: 8, padding: '10px 12px',
                    border: `1px solid ${selectedContract?.id === contract.id ? C.accent : C.border}`,
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.textDark }}>{contract.deviceName.split('（')[0]}</div>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 9.5, fontWeight: 700,
                      background: `${expireStatus.color}15`, color: expireStatus.color
                    }}>
                      {expireStatus.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: C.textMid, marginBottom: 3 }}>{contract.company}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5 }}>
                    <span style={{ color: C.textLight }}>{contract.startDate} ~ {contract.endDate}</span>
                    <span style={{ color: C.warning, fontWeight: 700 }}>¥{contract.amount.toLocaleString()}/年</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 合同详情 */}
        <div style={{
          background: C.white, borderRadius: 12, padding: 16,
          border: `1px solid ${C.border}`
        }}>
          {selectedContract ? (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={13} /> 合同详情
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  ['合同编号', selectedContract.contractNo],
                  ['签约公司', selectedContract.company],
                  ['设备名称', selectedContract.deviceName.split('（')[0]],
                  ['合同期限', selectedContract.startDate],
                  ['到期日期', selectedContract.endDate],
                  ['合同金额', `¥${selectedContract.amount.toLocaleString()}`],
                  ['付款状态', selectedContract.paymentStatus],
                  ['保障范围', selectedContract.coverage],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: C.textLight }}>{label}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: C.textDark, marginTop: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px', marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>联系人</div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.textDark }}>{selectedContract.contactPerson}</div>
                <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>{selectedContract.contactTel}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{
                  flex: 1, padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.accent}40`,
                  background: `${C.accent}10`, color: C.accent, fontSize: 11.5, fontWeight: 600, cursor: 'pointer'
                }} onClick={() => alert('编辑合同功能开发中')}>
                  编辑合同
                </button>
                <button style={{
                  flex: 1, padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.warning}40`,
                  background: `${C.warning}10`, color: C.warning, fontSize: 11.5, fontWeight: 600, cursor: 'pointer'
                }} onClick={() => alert('续签合同功能开发中')}>
                  续签
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: C.textLight, fontSize: 12 }}>
              <FileText size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
              <div>选择合同查看详情</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** 开机率统计面板 */
function UptimeStatsPanel() {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Power size={14} style={{ color: C.success }} /> 开机率统计
      </div>
      <div style={{
        background: C.white, borderRadius: 12, padding: 16,
        border: `1px solid ${C.border}`
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: '平均开机率', value: '96.1%', icon: <Power size={16} />, color: C.success },
            { label: '总运行时长', value: '1716h', icon: <Timer size={16} />, color: C.accent },
            { label: '总停机时长', value: '52h', icon: <AlertCircle size={16} />, color: C.danger },
            { label: '故障设备', value: '2台', icon: <AlertTriangle size={16} />, color: C.warning },
          ].map(item => (
            <div key={item.label} style={{
              background: `${item.color}0d`, borderRadius: 10, padding: '12px 14px',
              border: `1px solid ${item.color}25`, textAlign: 'center'
            }}>
              <div style={{ color: item.color, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 10.5, color: C.textLight, marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
        {/* 开机率表格 */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
                {['设备名称', '开机率', '运行时长', '停机时长', '停机原因', '状态'].map(h => (
                  <th key={h} style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700, color: C.primary, fontSize: 11 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {UPTIME_STATS.map((item, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : '#fafbfc' }}
                >
                  <td style={{ padding: '9px 10px', fontWeight: 600, color: C.textDark }}>{item.deviceName}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      <div style={{ flex: 1, maxWidth: 60, height: 4, background: C.border, borderRadius: 2 }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          width: `${item.uptimeRate}%`,
                          background: item.uptimeRate >= 98 ? C.success : item.uptimeRate >= 95 ? C.warning : C.danger
                        }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 11, color: item.uptimeRate >= 98 ? C.success : item.uptimeRate >= 95 ? C.warning : C.danger, minWidth: 36 }}>
                        {item.uptimeRate}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: C.textMid }}>{item.runtimeHours}h</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: item.downtimeHours > 8 ? C.danger : C.textMid }}>{item.downtimeHours}h</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: C.textMid }}>{item.reason}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <StatusBadge status={item.uptimeRate >= 98 ? '空闲' : item.uptimeRate >= 95 ? '使用中' : '故障'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/** 维保日历面板 */
function MaintenanceCalendarPanel() {
  const [currentMonth, setCurrentMonth] = useState('2026-05')

  // 生成日历数据
  const getCalendarDays = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const days: Array<{ day: number | null; events: string[] }> = []

    // 填充空白
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, events: [] })
    }
    // 填充日期
    for (let d = 1; d <= daysInMonth; d++) {
      const events: string[] = []
      // 匹配维保计划
      MAINTENANCE_PLANS.forEach(plan => {
        const planDay = parseInt(plan.planDate.split('-')[2])
        if (planDay === d) events.push(plan.type)
      })
      days.push({ day: d, events })
    }
    return days
  }

  const calendarDays = getCalendarDays(currentMonth)
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  // 维保到期提醒
  const upcomingMaintenance = MAINTENANCE_PLANS
    .filter(p => {
      const planDate = new Date(p.planDate)
      const now = new Date('2026-05-02')
      const daysLeft = Math.floor((planDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysLeft >= 0 && daysLeft <= 30
    })
    .sort((a, b) => new Date(a.planDate).getTime() - new Date(b.planDate).getTime())

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 维保日历 */}
        <div style={{
          background: C.white, borderRadius: 12, padding: 16,
          border: `1px solid ${C.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarDays size={13} /> 维保日历
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => {
                  const [y, m] = currentMonth.split('-').map(Number)
                  const prev = new Date(y, m - 2, 1)
                  setCurrentMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`)
                }}
                style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', fontSize: 11 }}
              >
                &lt;
              </button>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textDark, minWidth: 70, textAlign: 'center' }}>{currentMonth}</span>
              <button
                onClick={() => {
                  const [y, m] = currentMonth.split('-').map(Number)
                  const next = new Date(y, m, 1)
                  setCurrentMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`)
                }}
                style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', fontSize: 11 }}
              >
                &gt;
              </button>
            </div>
          </div>
          {/* 星期头 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {weekDays.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: C.textLight, padding: '4px 0' }}>{d}</div>
            ))}
          </div>
          {/* 日期网格 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {calendarDays.map((item, i) => {
              const isWeekend = i % 7 === 0 || i % 7 === 6
              const hasWarning = item.events.some(e => e === '故障维修' || e === '年度检测')
              return (
                <div
                  key={i}
                  style={{
                    minHeight: 36, borderRadius: 6, padding: '4px 4px',
                    background: !item.day ? 'transparent' : isWeekend ? '#f8fafc' : hasWarning ? `${C.warning}10` : '#fff',
                    border: `1px solid ${item.day ? (hasWarning ? `${C.warning}30` : C.border) : 'transparent'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1
                  }}
                >
                  {item.day && (
                    <>
                      <span style={{
                        fontSize: 11, fontWeight: item.day === 2 ? 700 : 400,
                        color: isWeekend ? C.textLight : C.textDark
                      }}>
                        {item.day}
                      </span>
                      {item.events.length > 0 && (
                        <span style={{
                          fontSize: 7.5, fontWeight: 700, color: C.warning,
                          background: `${C.warning}15`, padding: '0 3px', borderRadius: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
                        }}>
                          {item.events[0]}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 10, justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.textMid }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: `${C.warning}30` }} /> 维保日
            </span>
          </div>
        </div>

        {/* 维保到期提醒 */}
        <div style={{
          background: C.white, borderRadius: 12, padding: 16,
          border: `1px solid ${C.border}`
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertBell size={13} style={{ color: C.danger }} /> 维保到期提醒（30天内）
          </div>
          {upcomingMaintenance.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcomingMaintenance.map(plan => {
                const planDate = new Date(plan.planDate)
                const now = new Date('2026-05-02')
                const daysLeft = Math.floor((planDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                const isUrgent = daysLeft <= 7
                return (
                  <div key={plan.id} style={{
                    background: isUrgent ? `${C.danger}08` : `${C.warning}08`,
                    borderRadius: 8, padding: '10px 12px',
                    border: `1px solid ${isUrgent ? `${C.danger}25` : `${C.warning}25`}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.textDark }}>{plan.deviceName.split('（')[0]}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 10, fontSize: 9.5, fontWeight: 700,
                        background: isUrgent ? `${C.danger}15` : `${C.warning}15`,
                        color: isUrgent ? C.danger : C.warning
                      }}>
                        {isUrgent ? `紧急(${daysLeft}天)` : `${daysLeft}天后`}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: C.textMid, marginBottom: 2 }}>{plan.content}</div>
                    <div style={{ fontSize: 10.5, color: C.textLight }}>
                      <Calendar size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                      {plan.planDate} · 预计 ¥{Number(plan.estimatedCost).toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 30, color: C.success, fontSize: 12 }}>
              <CheckCircle size={28} style={{ marginBottom: 6 }} />
              <div style={{ fontWeight: 600 }}>暂无即将到期的维保</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 主组件
// ============================================================
export default function DevicePage() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedDevice, setSelectedDevice] = useState<typeof DEVICE_EFFICIENCY[0] | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('全部')
  const [filterStatus, setFilterStatus] = useState('全部')
  const [filterMfg, setFilterMfg] = useState('全部')
  const [sortKey, setSortKey] = useState('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // 维保管理 state
  const [showMaintForm, setShowMaintForm] = useState(false)
  const [maintForm, setMaintForm] = useState({ deviceId: '', planDate: '', type: '定期保养', content: '', estimatedCost: '', assignee: '' })
  const [maintAlertDays, setMaintAlertDays] = useState(7)

  const TABS = [
    { label: '设备状态总览', icon: <Monitor size={14} /> },
    { label: '设备列表', icon: <BarChart2 size={14} /> },
    { label: '设备详情', icon: <Activity size={14} /> },
    { label: '维保管理', icon: <Wrench size={14} /> },
    { label: '效能分析', icon: <TrendingUp size={14} /> },
    { label: '效益分析', icon: <DollarSign size={14} /> },
  ]

  // 统计数据
  const stats = {
    total: DEVICE_EFFICIENCY.length,
    inUse: DEVICE_EFFICIENCY.filter(d => d.status === '使用中').length,
    idle: DEVICE_EFFICIENCY.filter(d => d.status === '空闲').length,
    maint: DEVICE_EFFICIENCY.filter(d => ['维护中', '维修中'].includes(d.status)).length,
    fault: DEVICE_EFFICIENCY.filter(d => d.status === '维修中').length,
    avgUtil: Math.round(DEVICE_EFFICIENCY.reduce((s, d) => s + d.utilization, 0) / DEVICE_EFFICIENCY.length),
    totalTodayExams: DEVICE_EFFICIENCY.reduce((s, d) => s + d.todayBookings, 0),
    pendingMaint: MAINTENANCE_PLANS.length,
    alertDevices: DEVICE_EFFICIENCY.filter(d => d.age > 6).length,
  }

  // 设备列表筛选 + 排序
  const manufacturers = ['全部', ...Array.from(new Set(DEVICE_EFFICIENCY.map(d => d.manufacturer)))]
  const filteredDevices = DEVICE_EFFICIENCY
    .filter(d => {
      const matchSearch = !search || d.name.includes(search) || d.model.includes(search) || d.manufacturer.includes(search)
      const matchType = filterType === '全部' || d.modality === filterType
      const matchStatus = filterStatus === '全部' || d.status === filterStatus
      const matchMfg = filterMfg === '全部' || d.manufacturer === filterMfg
      return matchSearch && matchType && matchStatus && matchMfg
    })
    .sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0
      switch (sortKey) {
        case 'id': av = a.id; bv = b.id; break
        case 'name': av = a.name; bv = b.name; break
        case 'modality': av = a.modality; bv = b.modality; break
        case 'status': av = a.status; bv = b.status; break
        case 'utilization': av = a.utilization; bv = b.utilization; break
        case 'todayBookings': av = a.todayBookings; bv = b.todayBookings; break
        case 'capacity': av = a.capacity; bv = b.capacity; break
        default: av = a.id; bv = b.id
      }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ChevronUp size={11} style={{ opacity: 0.3 }} />
    return sortDir === 'asc' ? <ChevronUp size={11} color={C.accent} /> : <ChevronDown size={11} color={C.accent} />
  }

  const handleSort = (col: string) => {
    if (sortKey === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(col); setSortDir('asc') }
  }

  const handleDetail = (device: typeof DEVICE_EFFICIENCY[0]) => {
    setSelectedDevice(device)
    setShowDetail(true)
  }

  const handleExam = (device: typeof DEVICE_EFFICIENCY[0]) => {
    alert(`已为 ${device.name} 开始新的检查流程`)
  }

  const handleMaintenance = (device: typeof DEVICE_EFFICIENCY[0]) => {
    setActiveTab(3)
    setMaintForm(f => ({ ...f, deviceId: device.id }))
  }

  const handleMaintSubmit = () => {
    if (!maintForm.deviceId || !maintForm.planDate) {
      alert('请填写必填项'); return
    }
    alert(`维保计划已创建：${maintForm.deviceId}，计划日期 ${maintForm.planDate}`)
    setShowMaintForm(false)
    setMaintForm({ deviceId: '', planDate: '', type: '定期保养', content: '', estimatedCost: '', assignee: '' })
  }

  // ============================================================
  // 效益分析数据准备
  // ============================================================

  // 设备利用率饼图数据（按设备类型汇总）
  const utilizationPieData = [
    { name: 'CT', value: DEVICE_EFFICIENCY.filter(d => d.modality === 'CT').reduce((s, d) => s + d.utilization, 0) },
    { name: 'MR', value: DEVICE_EFFICIENCY.filter(d => d.modality === 'MR').reduce((s, d) => s + d.utilization, 0) },
    { name: 'DR', value: DEVICE_EFFICIENCY.filter(d => d.modality === 'DR').reduce((s, d) => s + d.utilization, 0) },
    { name: 'DSA', value: DEVICE_EFFICIENCY.filter(d => d.modality === 'DSA').reduce((s, d) => s + d.utilization, 0) },
    { name: '其他', value: DEVICE_EFFICIENCY.filter(d => !['CT', 'MR', 'DR', 'DSA'].includes(d.modality)).reduce((s, d) => s + d.utilization, 0) },
  ]

  // 检查量趋势数据（按月份汇总）
  const examTrendData = [
    { month: '1月', ct: 280, mr: 120, dr: 850, dsa: 28 },
    { month: '2月', ct: 245, mr: 105, dr: 780, dsa: 22 },
    { month: '3月', ct: 310, mr: 140, dr: 920, dsa: 32 },
    { month: '4月', ct: 330, mr: 155, dr: 980, dsa: 35 },
    { month: '5月', ct: 295, mr: 130, dr: 890, dsa: 29 },
    { month: '6月', ct: 318, mr: 148, dr: 950, dsa: 33 },
  ]

  // 故障停机统计汇总
  const totalDowntimeLoss = DOWNTIME_DATA.reduce((s, d) => s + d.lossAmount, 0)
  const totalDowntimeHours = DOWNTIME_DATA.reduce((s, d) => s + d.downtimeHours, 0)
  const totalFaultCount = DOWNTIME_DATA.reduce((s, d) => s + d.faultCount, 0)

  // ============================================================
  // Tab 0: 设备状态实时监控
  // ============================================================
  const renderDeviceStatusOverview = () => (
    <div>
      {/* 顶部4个统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <div style={{
          background: C.white, borderRadius: 12, padding: '16px 18px', border: `1px solid ${C.border}`,
          boxShadow: '0 1px 4px rgba(30,58,95,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${C.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={22} color={C.success} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.textDark }}>{stats.inUse}</div>
              <div style={{ fontSize: 11.5, color: C.textLight }}>使用中设备</div>
            </div>
          </div>
        </div>
        <div style={{
          background: C.white, borderRadius: 12, padding: '16px 18px', border: `1px solid ${C.border}`,
          boxShadow: '0 1px 4px rgba(30,58,95,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${C.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} color={C.accent} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.textDark }}>{stats.idle}</div>
              <div style={{ fontSize: 11.5, color: C.textLight }}>空闲设备</div>
            </div>
          </div>
        </div>
        <div style={{
          background: C.white, borderRadius: 12, padding: '16px 18px', border: `1px solid ${C.border}`,
          boxShadow: '0 1px 4px rgba(30,58,95,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${C.warning}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={22} color={C.warning} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.textDark }}>{stats.maint + stats.fault}</div>
              <div style={{ fontSize: 11.5, color: C.textLight }}>维护/故障中</div>
            </div>
          </div>
        </div>
        <div style={{
          background: C.white, borderRadius: 12, padding: '16px 18px', border: `1px solid ${C.border}`,
          boxShadow: '0 1px 4px rgba(30,58,95,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${C.info}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} color={C.info} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.textDark }}>{stats.totalTodayExams}</div>
              <div style={{ fontSize: 11.5, color: C.textLight }}>今日检查量</div>
            </div>
          </div>
        </div>
      </div>

      {/* 实时状态概览 + 使用时长 + 故障率 + 开机率 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 实时状态看板 */}
        <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Monitor size={14} style={{ color: C.accent }} /> 设备运行状态看板
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '使用中', count: stats.inUse, color: C.success, icon: <Play size={14} /> },
              { label: '空闲', count: stats.idle, color: C.accent, icon: <Pause size={14} /> },
              { label: '维护中', count: stats.maint, color: C.warning, icon: <Settings size={14} /> },
              { label: '故障', count: stats.fault, color: C.danger, icon: <AlertCircle size={14} /> },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: `${item.color}0d`, borderRadius: 8, padding: '10px 14px',
                border: `1px solid ${item.color}20`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ color: item.color }}>{item.icon}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textDark }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 使用时长统计 */}
        <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Timer size={14} style={{ color: C.info }} /> 使用时长统计
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <ChartBar data={[
              { device: 'CT-1', hours: 216 },
              { device: 'MR-1', hours: 212 },
              { device: 'DR-1', hours: 220 },
              { device: 'DR-2', hours: 224 },
              { device: 'CT-2', hours: 221 },
              { device: 'MR-2', hours: 216 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="device" tick={{ fontSize: 10, fill: C.textLight }} />
              <YAxis tick={{ fontSize: 10, fill: C.textLight }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11 }} />
              <Bar dataKey="hours" fill={C.accent} radius={[4, 4, 0, 0]} />
            </ChartBar>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 故障率统计 */}
        <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} style={{ color: C.danger }} /> 故障率统计
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DOWNTIME_DATA.slice(0, 5).map(item => (
              <div key={item.deviceName} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.textDark, width: 50 }}>{item.deviceName}</span>
                <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 4 }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    width: `${Math.min(100, (item.faultCount / 4) * 100)}%`,
                    background: item.faultCount >= 3 ? C.danger : item.faultCount >= 2 ? C.warning : C.success
                  }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: item.faultCount >= 3 ? C.danger : item.faultCount >= 2 ? C.warning : C.success, width: 40, textAlign: 'right' }}>
                  {item.faultCount}次
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 开机率统计 */}
        <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Power size={14} style={{ color: C.success }} /> 开机率统计
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {UPTIME_STATS.slice(0, 5).map(item => (
              <div key={item.deviceName} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.textDark, width: 50 }}>{item.deviceName}</span>
                <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 4 }}>
                  <div style={{
                    height: '100%', borderRadius: 4, width: `${item.uptimeRate}%`,
                    background: item.uptimeRate >= 98 ? C.success : item.uptimeRate >= 95 ? C.warning : C.danger
                  }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: item.uptimeRate >= 98 ? C.success : item.uptimeRate >= 95 ? C.warning : C.danger, width: 40, textAlign: 'right' }}>
                  {item.uptimeRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 今日检查量排名 */}
      <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={14} style={{ color: C.accent }} /> 今日检查量排名
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
                {['排名', '设备名称', '类型', '今日检查', '等待人数', '平均等待'].map(h => (
                  <th key={h} style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700, color: C.primary, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TODAY_RANKING.map((item, i) => (
                <tr key={item.rank} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : '#fafbfc' }}>
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 22, height: 22, borderRadius: '50%',
                      background: i === 0 ? C.warning : i === 1 ? C.accent : i === 2 ? C.info : C.textLight,
                      color: '#fff', fontWeight: 800, fontSize: 11
                    }}>{item.rank}</span>
                  </td>
                  <td style={{ padding: '9px 10px', fontWeight: 600, color: C.textDark }}>{item.deviceName.split('（')[0]}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}><ModalityBadge modality={item.modality} /></td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700, color: C.accent }}>{item.examCount}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: item.waitingCount > 8 ? C.warning : C.textMid }}>{item.waitingCount}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: item.avgWaitTime > 20 ? C.danger : item.avgWaitTime > 10 ? C.warning : C.success }}>{item.avgWaitTime}分钟</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // ============================================================
  // Tab 1: 设备列表
  // ============================================================
  const renderDeviceList = () => (
    <div>
      {/* 筛选栏 */}
      <div style={{
        background: C.white, borderRadius: 12, padding: '12px 16px', border: `1px solid ${C.border}`,
        marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center'
      }}>
        {/* 搜索 */}
        <div style={{ position: 'relative', flex: '0 0 200px' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.textLight }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索设备名称/型号/厂商..."
            style={{
              width: '100%', padding: '7px 10px 7px 32px', borderRadius: 8,
              border: `1px solid ${C.border}`, fontSize: 12, outline: 'none', boxSizing: 'border-box',
              focus: { border: `1px solid ${C.accent}` }
            }}
          />
        </div>
        {/* 设备类型筛选 */}
        <div style={{ display: 'flex', gap: 6 }}>
          {DEVICE_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilterType(cat)} style={{
              padding: '5px 12px', borderRadius: 20, border: `1px solid ${filterType === cat ? C.accent : C.border}`,
              background: filterType === cat ? `${C.accent}10` : 'transparent',
              color: filterType === cat ? C.accent : C.textMid, fontSize: 11.5, fontWeight: filterType === cat ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.15s'
            }}>{cat}</button>
          ))}
        </div>
        {/* 状态筛选 */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
          padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12,
          color: C.textMid, outline: 'none', cursor: 'pointer'
        }}>
          {DEVICE_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        {/* 厂商筛选 */}
        <select value={filterMfg} onChange={e => setFilterMfg(e.target.value)} style={{
          padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12,
          color: C.textMid, outline: 'none', cursor: 'pointer'
        }}>
          {manufacturers.map(m => <option key={m}>{m}</option>)}
        </select>
        <span style={{ fontSize: 11.5, color: C.textLight, marginLeft: 'auto' }}>
          共 {filteredDevices.length} 台设备
        </span>
      </div>

      {/* 设备卡片网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {filteredDevices.map(device => (
          <DeviceCard
            key={device.id}
            device={device}
            onDetail={() => handleDetail(device)}
            onExam={() => handleExam(device)}
            onMaintenance={() => handleMaintenance(device)}
          />
        ))}
      </div>
    </div>
  )

  // ============================================================
  // Tab 3: 维保管理（完整版）
  // ============================================================
  const renderMaintenanceTab = () => (
    <div>
      {/* 顶部4个统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.warning}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} color={C.warning} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>{MAINTENANCE_PLANS.length}</div>
              <div style={{ fontSize: 11, color: C.textLight }}>待执行计划</div>
            </div>
          </div>
        </div>
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.danger}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertBell size={20} color={C.danger} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>
                {MAINTENANCE_PLANS.filter(p => { const d = new Date(p.planDate); const n = new Date('2026-05-02'); return Math.floor((d.getTime() - n.getTime()) / 86400000) <= 30 }).length}
              </div>
              <div style={{ fontSize: 11, color: C.textLight }}>30天内到期</div>
            </div>
          </div>
        </div>
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={20} color={C.accent} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>{MAINTENANCE_RECORDS.length}</div>
              <div style={{ fontSize: 11, color: C.textLight }}>维保记录</div>
            </div>
          </div>
        </div>
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} color={C.success} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>
                ¥{(MAINTENANCE_RECORDS.reduce((s, r) => s + r.cost, 0) / 10000).toFixed(1)}万
              </div>
              <div style={{ fontSize: 11, color: C.textLight }}>累计维保费用</div>
            </div>
          </div>
        </div>
      </div>

      {/* 维保到期提醒卡片 */}
      <div style={{
        background: `${C.danger}08`, borderRadius: 12, padding: 16,
        border: `1px solid ${C.danger}25`, marginBottom: 18
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertBell size={16} color={C.danger} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>维保到期提醒</span>
          </div>
          <span style={{ fontSize: 11, color: C.danger }}>共 {MAINTENANCE_PLANS.filter(p => { const d = new Date(p.planDate); const n = new Date('2026-05-02'); return Math.floor((d.getTime() - n.getTime()) / 86400000) <= 30 }).length} 项待执行</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {MAINTENANCE_PLANS
            .filter(p => { const d = new Date(p.planDate); const n = new Date('2026-05-02'); const days = Math.floor((d.getTime() - n.getTime()) / 86400000); return days >= 0 && days <= 30; })
            .map(plan => {
              const daysLeft = Math.floor((new Date(plan.planDate).getTime() - new Date('2026-05-02').getTime()) / 86400000)
              return (
                <div key={plan.id} style={{
                  background: C.white, borderRadius: 8, padding: '10px 12px',
                  border: `1px solid ${daysLeft <= 7 ? `${C.danger}40` : `${C.warning}40`}`
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textDark, marginBottom: 2 }}>{plan.deviceName.split('（')[0]}</div>
                  <div style={{ fontSize: 10.5, color: C.textMid, marginBottom: 3 }}>{plan.content}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: C.textLight }}>{plan.planDate}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: daysLeft <= 7 ? C.danger : C.warning,
                      background: `${daysLeft <= 7 ? C.danger : C.warning}15`, padding: '2px 6px', borderRadius: 8
                    }}>
                      {daysLeft <= 0 ? '今天' : `${daysLeft}天后`}
                    </span>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* 维保历史记录表格 */}
      <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} style={{ color: C.accent }} /> 维保历史记录
          </div>
          <span style={{ fontSize: 11, color: C.textLight }}>共 {MAINTENANCE_RECORDS.length} 条记录</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
                {['设备名称', '维保日期', '维保类型', '维保内容', '工程师', '费用', '结果', '下次日期'].map(h => (
                  <th key={h} style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700, color: C.primary, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MAINTENANCE_RECORDS.map((record, i) => (
                <tr key={record.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : '#fafbfc' }}>
                  <td style={{ padding: '9px 10px', fontWeight: 600, color: C.textDark }}>{record.deviceName.split('（')[0]}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: C.textMid }}>{record.date}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                      background: record.type === '故障维修' ? `${C.danger}15` : `${C.accent}15`,
                      color: record.type === '故障维修' ? C.danger : C.accent
                    }}>{record.type}</span>
                  </td>
                  <td style={{ padding: '9px 10px', color: C.textDark, maxWidth: 200 }}>{record.content}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: C.textMid }}>{record.engineer}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700, color: C.warning }}>¥{record.cost.toLocaleString()}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: `${C.success}15`, color: C.success }}>{record.result}</span>
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: C.textMid }}>{record.nextDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 保养计划列表 */}
      <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarDays size={14} style={{ color: C.warning }} /> 保养计划列表（季度/半年/年度）
          </div>
          <button
            onClick={() => setShowMaintForm(true)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.accent}40`,
              background: `${C.accent}10`, color: C.accent, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            <Plus size={12} /> 添加计划
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
                {['设备名称', '计划日期', '保养类型', '保养内容', '预计费用', '负责人'].map(h => (
                  <th key={h} style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700, color: C.primary, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MAINTENANCE_PLANS.map((plan, i) => {
                const daysLeft = Math.floor((new Date(plan.planDate).getTime() - new Date('2026-05-02').getTime()) / 86400000)
                return (
                  <tr key={plan.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : '#fafbfc' }}>
                    <td style={{ padding: '9px 10px', fontWeight: 600, color: C.textDark }}>{plan.deviceName.split('（')[0]}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: daysLeft <= 7 ? C.danger : daysLeft <= 30 ? C.warning : C.textMid, fontWeight: daysLeft <= 30 ? 700 : 400 }}>{plan.planDate}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                        background: plan.type === '年度保养' ? `${C.danger}15` : plan.type === '半年保养' ? `${C.warning}15` : `${C.accent}15`,
                        color: plan.type === '年度保养' ? C.danger : plan.type === '半年保养' ? C.warning : C.accent
                      }}>{plan.type}</span>
                    </td>
                    <td style={{ padding: '9px 10px', color: C.textDark }}>{plan.content}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700, color: C.warning }}>¥{Number(plan.estimatedCost).toLocaleString()}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: C.textMid }}>{plan.assignee}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 维保费用统计 */}
      <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <DollarSign size={14} style={{ color: C.success }} /> 维保费用统计（月度）
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ChartBar data={MAINTENANCE_COST_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.textLight }} />
            <YAxis tick={{ fontSize: 10, fill: C.textLight }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="ct" name="CT" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="mr" name="MR" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="dr" name="DR" fill="#059669" radius={[4, 4, 0, 0]} />
            <Bar dataKey="dsa" name="DSA" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </ChartBar>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // ============================================================
  // Tab 4: 效能分析
  // ============================================================
  const renderEfficiencyTab = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gauge size={20} color={C.accent} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>{stats.avgUtil}%</div>
              <div style={{ fontSize: 11, color: C.textLight }}>平均利用率</div>
            </div>
          </div>
        </div>
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Power size={20} color={C.success} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>96.1%</div>
              <div style={{ fontSize: 11, color: C.textLight }}>平均开机率</div>
            </div>
          </div>
        </div>
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.warning}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color={C.warning} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>{stats.fault}</div>
              <div style={{ fontSize: 11, color: C.textLight }}>故障设备</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7天检查量趋势 LineChart */}
      <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={14} style={{ color: C.accent }} /> 7天检查量趋势
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={WEEKLY_TREND_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.textLight }} />
            <YAxis tick={{ fontSize: 10, fill: C.textLight }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {initialModalityDevices.slice(0, 4).map((d, i) => (
              <Line key={d.id} type="monotone" dataKey={d.id} name={d.name.split('（')[0]} stroke={PIE_COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 使用时段热力图 */}
      <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart2 size={14} style={{ color: C.info }} /> 使用时段分布（周一~周日，8-18时）
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(11, 1fr)', gap: 3, minWidth: 500 }}>
            {/* 表头 */}
            <div />
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, color: C.textLight, padding: '2px 0' }}>{8 + i}:00</div>
            ))}
            {/* 数据行 */}
            {HEATMAP_DATA.map(row => (
              <div key={row.day} style={{ display: 'contents' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textDark, display: 'flex', alignItems: 'center' }}>{row.day}</div>
                {Array.from({ length: 11 }, (_, i) => {
                  const hourKey = 'h' + (8 + i)
                  const val = Number(row[hourKey])
                  const intensity = Math.floor(val / 100 * 5)
                  const bgAlpha = (0.1 + intensity * 0.18).toFixed(2)
                  return (
                    <div key={i} style={{
                      height: 28, borderRadius: 4,
                      background: 'rgba(59, 130, 246, ' + bgAlpha + ')',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, color: intensity >= 3 ? '#fff' : C.textDark
                    }}>{val}</div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ============================================================
  // Tab 5: 效益分析（新增完整版）
  // ============================================================
  const renderBenefitAnalysisTab = () => (
    <div>
      {/* 顶部4个统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color={C.success} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>¥{(REVENUE_DATA.reduce((s, d) => s + d.total, 0) / 100000000).toFixed(2)}亿</div>
              <div style={{ fontSize: 11, color: C.textLight }}>半年总收入</div>
            </div>
          </div>
        </div>
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} color={C.accent} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>{examTrendData.reduce((s, d) => s + d.ct + d.mr + d.dr + d.dsa, 0)}</div>
              <div style={{ fontSize: 11, color: C.textLight }}>半年总检查量</div>
            </div>
          </div>
        </div>
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.danger}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={20} color={C.danger} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>{totalFaultCount}次</div>
              <div style={{ fontSize: 11, color: C.textLight }}>故障次数</div>
            </div>
          </div>
        </div>
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.warning}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} color={C.warning} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>¥{(totalDowntimeLoss / 10000).toFixed(0)}万</div>
              <div style={{ fontSize: 11, color: C.textLight }}>故障停机损失</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 检查量趋势图 LineChart */}
        <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} style={{ color: C.accent }} /> 检查量趋势（近6月）
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={examTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.textLight }} />
              <YAxis tick={{ fontSize: 10, fill: C.textLight }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="ct" name="CT" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="mr" name="MR" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="dr" name="DR" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="dsa" name="DSA" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 设备利用率饼图 PieChart */}
        <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <PieChart size={14} style={{ color: C.warning }} /> 设备利用率分布（按类型）
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RePieChart>
              <Pie
                data={utilizationPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {utilizationPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 故障停机损失统计 */}
      <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={14} style={{ color: C.danger }} /> 故障停机损失统计
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: '故障设备数', value: `${DOWNTIME_DATA.filter(d => d.faultCount > 0).length} 台`, color: C.danger },
            { label: '总停机时长', value: `${totalDowntimeHours} 小时`, color: C.warning },
            { label: '总损失金额', value: `¥${(totalDowntimeLoss / 10000).toFixed(1)} 万`, color: C.danger },
            { label: '平均MTBF', value: `${Math.round(DOWNTIME_DATA.reduce((s, d) => s + d.mtbf, 0) / DOWNTIME_DATA.length)} 天`, color: C.info },
          ].map(item => (
            <div key={item.label} style={{
              background: `${item.color}0d`, borderRadius: 10, padding: '12px 14px',
              border: `1px solid ${item.color}25`, textAlign: 'center'
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
                {['设备名称', '故障次数', '停机时长', '损失金额', 'MTBF', '故障描述'].map(h => (
                  <th key={h} style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700, color: C.primary, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOWNTIME_DATA.map((item, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : '#fafbfc' }}>
                  <td style={{ padding: '9px 10px', fontWeight: 600, color: C.textDark }}>{item.deviceName}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: item.faultCount >= 3 ? C.danger : C.textMid }}>{item.faultCount}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: item.downtimeHours > 24 ? C.danger : C.textMid }}>{item.downtimeHours}h</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700, color: C.warning }}>¥{item.lossAmount.toLocaleString()}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: C.textMid }}>{item.mtbf}天</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: C.textMid }}>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // ============================================================
  // 主渲染：Tab 2 设备详情
  // ============================================================
  const renderDeviceDetailTab = () => (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textLight }}>
      <Activity size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
      <div style={{ fontSize: 14 }}>请从「设备列表」选择一个设备查看详情</div>
    </div>
  )

  // ============================================================
  // 添加维保记录表单弹窗
  // ============================================================
  const renderMaintenanceFormModal = () => {
    if (!showMaintForm) return null
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
      }}>
        <div style={{
          background: C.white, borderRadius: 16, width: '100%', maxWidth: 500,
          boxShadow: '0 20px 60px rgba(30,58,95,0.25)'
        }}>
          <div style={{
            padding: '16px 20px', background: C.primary, color: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderRadius: '16px 16px 0 0'
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> 添加维保计划
            </div>
            <button onClick={() => setShowMaintForm(false)} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
              padding: 6, cursor: 'pointer', color: '#fff', display: 'flex'
            }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textDark, display: 'block', marginBottom: 4 }}>设备 *</label>
                <select value={maintForm.deviceId} onChange={e => setMaintForm(f => ({ ...f, deviceId: e.target.value }))} style={{
                  width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`,
                  fontSize: 12, color: C.textDark, outline: 'none'
                }}>
                  <option value="">请选择设备</option>
                  {DEVICE_EFFICIENCY.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textDark, display: 'block', marginBottom: 4 }}>计划日期 *</label>
                <input type="date" value={maintForm.planDate} onChange={e => setMaintForm(f => ({ ...f, planDate: e.target.value }))} style={{
                  width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`,
                  fontSize: 12, color: C.textDark, outline: 'none', boxSizing: 'border-box'
                }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textDark, display: 'block', marginBottom: 4 }}>保养类型</label>
                <select value={maintForm.type} onChange={e => setMaintForm(f => ({ ...f, type: e.target.value }))} style={{
                  width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`,
                  fontSize: 12, color: C.textDark, outline: 'none'
                }}>
                  <option>定期保养</option>
                  <option>季度保养</option>
                  <option>半年保养</option>
                  <option>年度保养</option>
                  <option>故障维修</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textDark, display: 'block', marginBottom: 4 }}>保养内容</label>
                <textarea value={maintForm.content} onChange={e => setMaintForm(f => ({ ...f, content: e.target.value }))} placeholder="请输入保养内容..." style={{
                  width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`,
                  fontSize: 12, color: C.textDark, outline: 'none', minHeight: 60, resize: 'vertical', boxSizing: 'border-box'
                }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textDark, display: 'block', marginBottom: 4 }}>预计费用</label>
                <input type="number" value={maintForm.estimatedCost} onChange={e => setMaintForm(f => ({ ...f, estimatedCost: e.target.value }))} placeholder="请输入预计费用" style={{
                  width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`,
                  fontSize: 12, color: C.textDark, outline: 'none', boxSizing: 'border-box'
                }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textDark, display: 'block', marginBottom: 4 }}>负责人</label>
                <input value={maintForm.assignee} onChange={e => setMaintForm(f => ({ ...f, assignee: e.target.value }))} placeholder="请输入负责人" style={{
                  width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`,
                  fontSize: 12, color: C.textDark, outline: 'none', boxSizing: 'border-box'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={() => setShowMaintForm(false)} style={{
                flex: 1, padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.white, color: C.textMid, fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>取消</button>
              <button onClick={handleMaintSubmit} style={{
                flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none',
                background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer'
              }}>确认添加</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // 渲染入口
  // ============================================================
  return (
    <div style={{ padding: '0 24px 24px', minHeight: '100vh', background: C.bg }}>
      {/* 页面标题 */}
      <div style={{ padding: '20px 0 16px', borderBottom: `2px solid ${C.border}`, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: C.primary, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Monitor size={22} /> 影像设备管理
            </h1>
            <div style={{ fontSize: 12, color: C.textLight, marginTop: 3 }}>
              设备总数 {stats.total} 台 · 使用中 {stats.inUse} 台 · 空闲 {stats.idle} 台 · 维护 {stats.maint} 台
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.border}`,
              background: C.white, color: C.textMid, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
            }} onClick={() => alert('导出报表功能开发中')}>
              <Download size={13} /> 导出报表
            </button>
            <button
              onClick={() => { setActiveTab(3); setShowMaintForm(true) }}
              style={{
                padding: '7px 14px', borderRadius: 8, border: 'none',
                background: C.primary, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              <Plus size={13} /> 添加维保
            </button>
          </div>
        </div>
      </div>

      {/* 标签页切换 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: `2px solid ${C.border}`, paddingBottom: 0 }}>
        {TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === i ? 700 : 500,
              background: 'transparent',
              color: activeTab === i ? C.primary : C.textMid,
              borderBottom: `3px solid ${activeTab === i ? C.primary : 'transparent'}`,
              marginBottom: -2, transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.label}
            {i === 3 && <span style={{
              background: C.warning, color: '#fff', fontSize: 10, fontWeight: 800,
              padding: '1px 5px', borderRadius: 10, marginLeft: 2
            }}>{MAINTENANCE_PLANS.length}</span>}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div>
        {activeTab === 0 && renderDeviceStatusOverview()}
        {activeTab === 1 && renderDeviceList()}
        {activeTab === 2 && renderDeviceDetailTab()}
        {activeTab === 3 && renderMaintenanceTab()}
        {activeTab === 4 && renderEfficiencyTab()}
        {activeTab === 5 && renderBenefitAnalysisTab()}
      </div>

      {/* 设备详情弹窗 */}
      {showDetail && selectedDevice && (
        <DeviceDetailPanel device={selectedDevice} onClose={() => setShowDetail(false)} />
      )}

      {/* 维保记录表单弹窗 */}
      {renderMaintenanceFormModal()}
    </div>
  )
}

