// @ts-nocheck
// G005 放射科RIS系统 - 设备管理页面 v2.0.0 (800+行)
import { useState } from 'react'
import {
  Monitor, Wrench, AlertCircle, CheckCircle, Clock, Search, Activity,
  Settings, TrendingUp, BarChart2, Calendar, User, Filter, ChevronUp,
  ChevronDown, RefreshCw, Wrench, AlertTriangle, Zap, Timer,
  Plus, X, Check, Bell, Shield, Eye, Pause, Play, Download,
  BarChart, PieChart, Droplet, Heart, Cpu, Gauge, Settings2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
}

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
]

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

  // 模拟24小时时间轴数据
  const timelineHours = Array.from({ length: 25 }, (_, i) => {
    const busy = i >= 8 && i <= 12 || i >= 14 && i <= 17
    return { hour: i, busy: busy && Math.random() > 0.2, examCount: busy ? Math.floor(Math.random() * 4) : 0 }
  })

  // 7天数据 for line chart
  const device7d = deviceStatsData.dates.map((date, i) => ({
    date, count: deviceStatsData.deviceUsageMap[device.id][i]
  }))

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: C.white, borderRadius: 16, width: '100%', maxWidth: 820,
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
          {/* 基本信息卡 */}
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
                ['安装位置', device.location],
                ['购置年份', device.acquisitionYear ? `${device.acquisitionYear}年` : '-'],
                ['当前状态', device.status],
              ].map(([label, val]) => (
                <div key={label} style={{ background: C.white, borderRadius: 8, padding: '8px 12px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.textLight }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textDark, marginTop: 2 }}>{val}</div>
                </div>
              ))}
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
              <Tool size={13} /> 维保历史
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

  // 排行榜数据
  const rankedDevices = [...DEVICE_EFFICIENCY].sort((a, b) => b.utilization - a.utilization)

  // 利用率对比数据
  const utilizationChartData = rankedDevices.map(d => ({
    name: d.name.split('（')[0], utilization: d.utilization, todayExams: d.todayBookings
  }))

  // 综合效能数据
  const efficiencyChartData = DEVICE_EFFICIENCY.map(d => ({
    name: d.name.split('（')[0], health: d.healthScore, uptime: d.uptime, util: d.utilization
  }))

  // 老旧设备
  const oldDevices = DEVICE_EFFICIENCY.filter(d => d.age >= 5)
    .sort((a, b) => b.age - a.age)

  // 设备类型分布饼图
  const modalityPieData = Object.entries(
    DEVICE_EFFICIENCY.reduce((acc, d) => { acc[d.modality] = (acc[d.modality] || 0) + 1; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  return (
    <div style={{ padding: '0', maxWidth: 1400, margin: '0 auto' }}>
      {/* 页面标题 */}
      <div style={{
        padding: '20px 28px 16px',
        borderBottom: `1px solid ${C.border}`,
        background: C.white,
        borderRadius: '0 0 0 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: C.primary, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Monitor size={20} /> 设备管理
            </h1>
            <p style={{ fontSize: 12, color: C.textLight, margin: 0 }}>
              设备状态监控 · 维护记录 · 产能分析 · 故障预警 · 效能评估
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: `${C.primary}10`, color: C.primary, border: `1px solid ${C.primary}30`,
              borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer'
            }}>
              <Download size={13} /> 导出报表
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: C.primary, color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(30,58,95,0.25)'
            }}>
              <Plus size={13} /> 新建维保
            </button>
          </div>
        </div>
      </div>

      {/* 标签导航 */}
      <div style={{
        padding: '12px 28px 0', background: C.white,
        borderBottom: `2px solid ${C.border}`, display: 'flex', gap: 4
      }}>
        {TABS.map((tab, i) => (
          <TabBtn
            key={i} label={tab.label} icon={tab.icon}
            active={activeTab === i} onClick={() => setActiveTab(i)}
          />
        ))}
      </div>

      {/* 内容区 */}
      <div style={{ padding: 24, background: C.bg, minHeight: 'calc(100vh - 160px)' }}>
        {/* ==================== 标签页1：设备状态总览 ==================== */}
        {activeTab === 0 && (
          <div>
            {/* 统计卡片行 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
              <StatCard
                label="设备总数" value={stats.total}
                icon={<Monitor size={18} />} color={C.accent}
                subtitle={`${MODALITY_LABELS['CT'].label} ${DEVICE_EFFICIENCY.filter(d => d.modality === 'CT').length}台 · ${MODALITY_LABELS['MR'].label} ${DEVICE_EFFICIENCY.filter(d => d.modality === 'MR').length}台`}
              />
              <StatCard
                label="使用中" value={stats.inUse}
                icon={<CheckCircle size={18} />} color={C.success}
                subtitle={`利用率 ${stats.avgUtil}%`}
              />
              <StatCard
                label="空闲" value={stats.idle}
                icon={<Clock size={18} />} color={C.info}
              />
              <StatCard
                label="维护/维修" value={stats.maint}
                icon={<Wrench size={18} />} color={C.warning}
                subtitle={`计划维保 ${stats.pendingMaint} 项`}
              />
              <StatCard
                label="今日检查量" value={stats.totalTodayExams}
                icon={<Activity size={18} />} color={C.primary}
                subtitle={`故障设备 ${stats.fault} 台`}
              />
            </div>

            {/* 设备卡片网格 */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
              marginBottom: 20
            }}>
              {DEVICE_EFFICIENCY.map(device => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onDetail={() => { setSelectedDevice(device); setActiveTab(2) }}
                  onExam={() => handleExam(device)}
                  onMaintenance={() => handleMaintenance(device)}
                />
              ))}
            </div>

            {/* 设备类型分布 */}
            <div style={{
              background: C.white, borderRadius: 12, padding: 20,
              border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <PieChart size={14} style={{ color: C.accent }} /> 设备类型分布
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                <ResponsiveContainer width={200} height={140}>
                  <RePieChart>
                    <Pie data={modalityPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey="value">
                      {modalityPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {modalityPieData.map((item, i) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: C.textMid }}>
                        {item.name}：{item.value} 台
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 标签页2：设备列表表格 ==================== */}
        {activeTab === 1 && (
          <div>
            {/* 筛选栏 */}
            <div style={{
              background: C.white, borderRadius: 12, padding: '14px 18px',
              border: `1px solid ${C.border}`, marginBottom: 16,
              display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
              boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.textMid }}>
                <Filter size={13} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>筛选：</span>
              </div>
              {/* 搜索 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', borderRadius: 8, padding: '6px 12px', border: `1px solid ${C.border}` }}>
                <Search size={12} style={{ color: C.textLight }} />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="搜索设备名称/型号..."
                  style={{ border: 'none', outline: 'none', fontSize: 12, width: 160, background: 'transparent' }}
                />
              </div>
              {/* 类型 */}
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, color: C.textDark, background: '#f8fafc', cursor: 'pointer' }}>
                <option value="全部">全部类型</option>
                {Object.keys(MODALITY_LABELS).map(m => <option key={m} value={m}>{MODALITY_LABELS[m].label}</option>)}
              </select>
              {/* 状态 */}
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, color: C.textDark, background: '#f8fafc', cursor: 'pointer' }}>
                <option value="全部">全部状态</option>
                <option value="使用中">使用中</option>
                <option value="空闲">空闲</option>
                <option value="维护中">维护中</option>
                <option value="维修中">维修中</option>
              </select>
              {/* 厂商 */}
              <select value={filterMfg} onChange={e => setMfg(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, color: C.textDark, background: '#f8fafc', cursor: 'pointer' }}>
                {manufacturers.map(m => <option key={m} value={m}>{m === '全部' ? '全部厂商' : m}</option>)}
              </select>
              <button onClick={() => { setSearch(''); setFilterType('全部'); setFilterStatus('全部'); setFilterMfg('全部') }}
                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 11.5, color: C.textMid, cursor: 'pointer' }}>
                <RefreshCw size={11} /> 重置
              </button>
            </div>

            {/* 表格 */}
            <div style={{
              background: C.white, borderRadius: 12, border: `1px solid ${C.border}`,
              overflow: 'hidden', boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
                      {[
                        { key: 'id', label: '设备编号', width: 110 },
                        { key: 'name', label: '设备名称', width: 150 },
                        { key: 'modality', label: '类型', width: 80 },
                        { key: 'status', label: '状态', width: 85 },
                        { key: 'todayBookings', label: '今日检查量', width: 90 },
                        { key: 'capacity', label: '日产能', width: 80 },
                        { key: 'utilization', label: '利用率', width: 70 },
                        { key: null, label: '操作', width: 120 },
                      ].map(col => (
                        <th
                          key={col.key || col.label}
                          onClick={() => col.key && handleSort(col.key)}
                          style={{
                            padding: '11px 12px', textAlign: 'left', fontWeight: 700,
                            color: C.primary, fontSize: 11.5, whiteSpace: 'nowrap',
                            cursor: col.key ? 'pointer' : 'default',
                            width: col.width,
                            userSelect: 'none',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            {col.label}
                            {col.key && <SortIcon col={col.key} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: C.textLight, fontSize: 13 }}>
                          未找到匹配设备
                        </td>
                      </tr>
                    )}
                    {filteredDevices.map((device, idx) => {
                      const room = initialExamRooms.find(r => r.deviceId === device.id)
                      return (
                        <tr
                          key={device.id}
                          style={{
                            borderBottom: `1px solid ${C.border}`,
                            background: idx % 2 === 0 ? C.white : '#fafbfc',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${C.accent}08`}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? C.white : '#fafbfc'}
                        >
                          <td style={{ padding: '10px 12px', color: C.textMid, fontFamily: 'monospace', fontSize: 11.5 }}>{device.id}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 600, color: C.textDark, fontSize: 12 }}>{device.name.split('（')[0]}</div>
                            <div style={{ fontSize: 10.5, color: C.textLight }}>{device.manufacturer} · {device.model}</div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <ModalityBadge modality={device.modality} />
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <StatusBadge status={device.status} />
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: C.textDark, textAlign: 'center' }}>
                            {device.todayBookings}
                          </td>
                          <td style={{ padding: '10px 12px', color: C.textMid, textAlign: 'center' }}>
                            {device.capacity}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2 }}>
                                <div style={{ height: '100%', width: `${device.utilization}%`, background: device.utilization > 80 ? C.success : device.utilization > 50 ? C.accent : C.warning, borderRadius: 2 }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: C.textDark, minWidth: 28 }}>{device.utilization}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => handleDetail(device)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.accent}40`, background: `${C.accent}0e`, color: C.accent, fontSize: 10.5, cursor: 'pointer', fontWeight: 600 }}>
                                详情
                              </button>
                              <button onClick={() => handleMaintenance(device)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.warning}40`, background: `${C.warning}0e`, color: C.warning, fontSize: 10.5, cursor: 'pointer', fontWeight: 600 }}>
                                维保
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11.5, color: C.textLight }}>
                  共 {filteredDevices.length} 台设备
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button disabled style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, color: C.textLight, fontSize: 11, cursor: 'not-allowed' }}>上一页</button>
                  <button style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${C.accent}`, background: C.accent, color: '#fff', fontSize: 11, cursor: 'pointer' }}>下一页</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 标签页3：设备详情 ==================== */}
        {activeTab === 2 && (
          <div>
            {selectedDevice ? (
              <DeviceDetailPanel device={selectedDevice} onClose={() => setActiveTab(0)} />
            ) : (
              <div style={{
                background: C.white, borderRadius: 12, padding: 60,
                border: `1px solid ${C.border}`, textAlign: 'center',
                boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
              }}>
                <Activity size={40} style={{ color: C.textLight, marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: C.textMid, fontWeight: 600, marginBottom: 6 }}>请选择要查看的设备</div>
                <div style={{ fontSize: 12, color: C.textLight }}>
                  从「设备状态总览」或「设备列表」中选择设备，点击「详情」查看完整信息
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 标签页4：维保管理 ==================== */}
        {activeTab === 3 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {/* 维保计划 */}
              <div style={{
                background: C.white, borderRadius: 12, padding: 20,
                border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} style={{ color: C.warning }} /> 待执行维保计划（{MAINTENANCE_PLANS.length}）
                  </div>
                  <button
                    onClick={() => setShowMaintForm(!showMaintForm)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Plus size={12} /> 新建计划
                  </button>
                </div>

                {/* 新建表单 */}
                {showMaintForm && (
                  <div style={{
                    background: `${C.primary}06`, borderRadius: 10, padding: 16,
                    border: `1px solid ${C.primary}20`, marginBottom: 14
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 10 }}>+ 新建维保计划</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <select value={maintForm.deviceId} onChange={e => setMaintForm(f => ({ ...f, deviceId: e.target.value }))}
                        style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, background: C.white }}>
                        <option value="">选择设备</option>
                        {DEVICE_EFFICIENCY.map(d => <option key={d.id} value={d.id}>{d.name.split('（')[0]}</option>)}
                      </select>
                      <input type="date" value={maintForm.planDate} onChange={e => setMaintForm(f => ({ ...f, planDate: e.target.value }))}
                        style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, background: C.white }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <select value={maintForm.type} onChange={e => setMaintForm(f => ({ ...f, type: e.target.value }))}
                        style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, background: C.white }}>
                        <option>定期保养</option><option>故障维修</option><option>年度检测</option><option>升级改造</option>
                      </select>
                      <input placeholder="预估费用（元）" value={maintForm.estimatedCost} onChange={e => setMaintForm(f => ({ ...f, estimatedCost: e.target.value }))}
                        style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, background: C.white }} />
                    </div>
                    <input placeholder="维保内容" value={maintForm.content} onChange={e => setMaintForm(f => ({ ...f, content: e.target.value }))}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, background: C.white, marginBottom: 8, boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input placeholder="负责人" value={maintForm.assignee} onChange={e => setMaintForm(f => ({ ...f, assignee: e.target.value }))}
                        style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, background: C.white }} />
                      <button onClick={handleMaintSubmit} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: C.success, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        <Check size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> 提交
                      </button>
                      <button onClick={() => setShowMaintForm(false)} style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.textMid, fontSize: 12, cursor: 'pointer' }}>
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {MAINTENANCE_PLANS.map(plan => (
                    <div key={plan.id} style={{
                      background: '#fff', borderRadius: 8, padding: '10px 14px',
                      border: `1px solid ${C.border}`, display: 'grid',
                      gridTemplateColumns: '1fr auto', gap: 6, alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.textDark, marginBottom: 2 }}>{plan.deviceName.split('（')[0]}</div>
                        <div style={{ fontSize: 10.5, color: C.textMid }}>
                          <span style={{ color: C.warning }}>{plan.type}</span> · {plan.content} · 预计 ¥{Number(plan.estimatedCost).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 10.5, color: C.textLight, marginTop: 2 }}>
                          <Calendar size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                          {plan.planDate} · 负责人：{plan.assignee}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                        background: `${C.warning}15`, color: C.warning, whiteSpace: 'nowrap'
                      }}>
                        待执行
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 维保记录 */}
              <div style={{
                background: C.white, borderRadius: 12, padding: 20,
                border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tool size={14} style={{ color: C.success }} /> 已完成维保记录（{MAINTENANCE_RECORDS.length}）
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
                  {MAINTENANCE_RECORDS.map(record => (
                    <div key={record.id} style={{
                      background: '#fff', borderRadius: 8, padding: '10px 14px',
                      border: `1px solid ${C.border}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.textDark }}>
                          {record.deviceName.split('（')[0]}
                        </div>
                        <div style={{ fontSize: 10.5, color: C.success, fontWeight: 700 }}>{record.result}</div>
                      </div>
                      <div style={{ fontSize: 10.5, color: C.textMid, marginBottom: 3 }}>{record.content}</div>
                      <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: C.textLight }}>
                        <span>{record.date}</span>
                        <span>{record.engineer}</span>
                        <span style={{ color: C.warning, fontWeight: 700 }}>¥{record.cost.toLocaleString()}</span>
                        <span>下次：{record.nextDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 维保提醒设置 */}
            <div style={{
              background: C.white, borderRadius: 12, padding: 20,
              border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bell size={14} style={{ color: C.accent }} /> 维保提醒设置
              </div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.textMid }}>提前提醒天数：</span>
                  <input
                    type="number" min={1} max={30} value={maintAlertDays}
                    onChange={e => setMaintAlertDays(Number(e.target.value))}
                    style={{ width: 60, padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.primary, textAlign: 'center' }}
                  />
                  <span style={{ fontSize: 12, color: C.textMid }}>天</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[3, 7, 14, 30].map(d => (
                    <button
                      key={d}
                      onClick={() => setMaintAlertDays(d)}
                      style={{
                        padding: '5px 12px', borderRadius: 20, border: `1px solid ${maintAlertDays === d ? C.accent : C.border}`,
                        background: maintAlertDays === d ? `${C.accent}15` : C.white,
                        color: maintAlertDays === d ? C.accent : C.textMid,
                        fontSize: 11.5, fontWeight: maintAlertDays === d ? 700 : 500, cursor: 'pointer'
                      }}
                    >
                      {d} 天
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textMid, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: C.accent }} />
                    短信提醒
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textMid, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: C.accent }} />
                    系统通知
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textMid, cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: C.accent }} />
                    邮件提醒
                  </label>
                </div>
                <button style={{
                  padding: '7px 16px', borderRadius: 8, border: 'none',
                  background: C.primary, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}>
                  保存设置
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 标签页5：设备效能分析 ==================== */}
        {activeTab === 4 && (
          <div>
            {/* 统计行 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
              <StatCard label="平均利用率" value={`${stats.avgUtil}%`} icon={<TrendingUp size={18} />} color={C.accent} subtitle="整体效能" />
              <StatCard label="建议更换设备" value={stats.alertDevices} icon={<AlertTriangle size={18} />} color={C.danger} subtitle={`${MODALITY_LABELS['CT'].label} 等老旧设备`} />
              <StatCard label="MTBF平均" value={`${Math.round(DEVICE_EFFICIENCY.reduce((s, d) => s + d.mtbf, 0) / DEVICE_EFFICIENCY.length)} 天`} icon={<Timer size={18} />} color={C.success} />
              <StatCard label="健康度平均" value={`${Math.round(DEVICE_EFFICIENCY.reduce((s, d) => s + d.healthScore, 0) / DEVICE_EFFICIENCY.length)} 分`} icon={<Shield size={18} />} color={C.primary} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {/* 利用率排行榜 */}
              <div style={{
                background: C.white, borderRadius: 12, padding: 20,
                border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BarChart size={14} style={{ color: C.accent }} /> 设备利用率排行榜
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rankedDevices.map((device, i) => (
                    <div key={device.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2f' : C.border,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, color: i < 3 ? '#fff' : C.textLight, flexShrink: 0
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: C.textDark, marginBottom: 2 }}>
                          {device.name.split('（')[0]}
                        </div>
                        <div style={{ height: 5, background: C.border, borderRadius: 3 }}>
                          <div style={{
                            height: '100%', borderRadius: 3,
                            width: `${device.utilization}%`,
                            background: device.utilization > 80 ? C.success : device.utilization > 50 ? C.accent : C.warning,
                          }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.primary, minWidth: 38, textAlign: 'right' }}>
                        {device.utilization}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 利用率对比柱状图 */}
              <div style={{
                background: C.white, borderRadius: 12, padding: 20,
                border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BarChart2 size={14} style={{ color: C.accent }} /> 各设备利用率对比
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={utilizationChartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={60} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11 }}
                      formatter={(v: number) => [`${v}%`, '利用率']}
                    />
                    <Bar dataKey="utilization" fill={C.accent} radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {/* 使用时段热力图 */}
              <div style={{
                background: C.white, borderRadius: 12, padding: 20,
                border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Droplet size={14} style={{ color: C.accent }} /> 设备使用时段热力图（周一至周日）
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 4, paddingLeft: 40 }}>
                    {Array.from({ length: 11 }, (_, i) => (
                      <div key={i} style={{ width: 28, textAlign: 'center', fontSize: 9, color: C.textLight }}>{8 + i}:00</div>
                    ))}
                  </div>
                  {HEATMAP_DATA.map((row, ri) => (
                    <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                      <div style={{ width: 28, fontSize: 9, color: C.textMid, textAlign: 'right', paddingRight: 6 }}>{row.day}</div>
                      {Array.from({ length: 11 }, (_, i) => {
                        const val = row[`h${8 + i}`] as number
                        const pct = val / 100
                        return (
                          <div
                            key={i}
                            title={`${row.day} ${8 + i}:00 - ${val}%`}
                            style={{
                              width: 28, height: 18, borderRadius: 3,
                              background: `rgba(59, 130, 246, ${pct})`,
                              cursor: 'pointer',
                            }}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: C.textLight }}>低</span>
                  {[0.15, 0.35, 0.55, 0.75, 0.95].map((op, i) => (
                    <div key={i} style={{ width: 14, height: 10, borderRadius: 2, background: `rgba(59,130,246,${op})` }} />
                  ))}
                  <span style={{ fontSize: 10, color: C.textLight }}>高</span>
                </div>
              </div>

              {/* 设备综合效能对比 */}
              <div style={{
                background: C.white, borderRadius: 12, padding: 20,
                border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Cpu size={14} style={{ color: C.accent }} /> 设备综合效能对比（健康度/开机率/利用率）
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={efficiencyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={0} angle={-20} textAnchor="end" height={40} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} unit="%" />
                    <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="health" name="健康度" fill={C.success} barSize={12} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="uptime" name="开机率" fill={C.accent} barSize={12} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="util" name="利用率" fill={C.warning} barSize={12} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 设备故障间隔分析 */}
            <div style={{
              background: C.white, borderRadius: 12, padding: 20,
              border: `1px solid ${C.border}`, marginBottom: 20,
              boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} style={{ color: C.danger }} /> 设备故障间隔时间分析（MTBF）
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {DEVICE_EFFICIENCY.map(device => (
                  <div key={device.id} style={{
                    background: device.mtbf < 150 ? `${C.danger}0a` : '#f8fafc',
                    borderRadius: 10, padding: '14px 16px',
                    border: `1px solid ${device.mtbf < 150 ? `${C.danger}30` : C.border}`
                  }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: C.textDark, marginBottom: 6 }}>
                      {device.name.split('（')[0]}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                      <span style={{
                        fontSize: 22, fontWeight: 800,
                        color: device.mtbf < 150 ? C.danger : device.mtbf < 200 ? C.warning : C.success
                      }}>
                        {device.mtbf}
                      </span>
                      <span style={{ fontSize: 11, color: C.textLight }}>天</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: C.textMid, marginTop: 2 }}>
                      故障 {device.faultCount} 次 · 维保 {device.maintCount} 次
                    </div>
                    {device.mtbf < 150 && (
                      <div style={{ marginTop: 6, fontSize: 10, color: C.danger, fontWeight: 700 }}>
                        ⚠ 需关注
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 建议更换设备 */}
            <div style={{
              background: C.white, borderRadius: 12, padding: 20,
              border: `1px solid ${C.border}`,
              boxShadow: '0 1px 4px rgba(30,58,95,0.05)'
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} style={{ color: C.danger }} /> 建议更换设备列表（使用年限 ≥ 5年）
              </div>
              {oldDevices.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {oldDevices.map(device => (
                    <div key={device.id} style={{
                      background: `${C.danger}08`, borderRadius: 10, padding: '14px 16px',
                      border: `1px solid ${C.danger}25`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <AlertTriangle size={14} style={{ color: C.danger }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.textDark }}>
                          {device.name.split('（')[0]}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
                        {[
                          ['使用年限', `${device.age} 年`],
                          ['健康评分', `${device.healthScore} 分`],
                          ['故障次数', `${device.faultCount} 次`],
                          ['利用率', `${device.utilization}%`],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <div style={{ color: C.textLight, fontSize: 10 }}>{label}</div>
                            <div style={{ color: C.textDark, fontWeight: 700, fontSize: 12 }}>{val}</div>
                          </div>
                        ))}
                      </div>
                      <button style={{
                        marginTop: 10, width: '100%', padding: '6px 10px', borderRadius: 8,
                        border: `1px solid ${C.danger}40`, background: `${C.danger}10`,
                        color: C.danger, fontSize: 11, fontWeight: 700, cursor: 'pointer'
                      }}>
                        申请更换
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 30, color: C.success, fontSize: 13 }}>
                  <CheckCircle size={30} style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 700 }}>所有设备状态良好，暂无更换建议</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 设备详情弹层 */}
      {showDetail && selectedDevice && (
        <DeviceDetailPanel
          device={selectedDevice}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  )
}
