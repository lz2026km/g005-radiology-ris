// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 首页 v0.1.0
// ============================================================
import { useState } from 'react'
import {
  Activity, FileText, ShieldCheck, AlertTriangle,
  TrendingUp, Users, Clock, CheckCircle, BarChart3,
  Scan, Radio, Monitor, Bell, Plus, CalendarClock,
  ShieldAlert, AlertCircle, TestTube, Printer, ListChecks,
  ChevronRight, Wifi, Heart, Cpu, BellRing
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { initialStatisticsData, initialRadiologyExams, initialModalityDevices, initialCriticalValues, initialDoctorSchedules, initialUsers } from '../data/initialData'
import type { ModalityType } from '../types'

const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1e3a5f', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  quickActions: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 },
  quickAction: { background: '#fff', borderRadius: 12, padding: '16px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #e2e8f0' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#1e3a5f' },
  badge: { padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 },
  row: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
}

const modalityColors: Record<string, string> = {
  CT: '#3b82f6', MR: '#8b5cf6', DR: '#22c55e', DSA: '#f59e0b',
  '乳腺钼靶': '#ec4899', '胃肠造影': '#14b8a6', PET: '#f97316'
}

export default function HomePage() {
  const [user] = useState(initialUsers[0])
  const stats = initialStatisticsData
  const exams = initialRadiologyExams
  const devices = initialModalityDevices
  const criticalValues = initialCriticalValues
  const schedules = initialDoctorSchedules

  const pendingExams = exams.filter(e => ['已登记', '待检查'].includes(e.status))
  const todayReports = exams.filter(e => e.status === '待报告' || e.status === '已报告')
  const criticalPending = criticalValues.filter(c => c.status !== '已处理')

  const chartData = [
    { name: '周一', CT: 98, MR: 45, DR: 85, DSA: 8 },
    { name: '周二', CT: 105, MR: 52, DR: 90, DSA: 10 },
    { name: '周三', CT: 112, MR: 48, DR: 78, DSA: 12 },
    { name: '周四', CT: 95, MR: 55, DR: 82, DSA: 9 },
    { name: '周五', CT: 108, MR: 50, DR: 88, DSA: 11 },
    { name: '周六', CT: 60, MR: 25, DR: 40, DSA: 3 },
    { name: '周日', CT: 30, MR: 10, DR: 20, DSA: 1 },
  ]

  const modalityDistData = [
    { name: 'CT', value: stats.byModality['CT'], color: '#3b82f6' },
    { name: 'MR', value: stats.byModality['MR'], color: '#8b5cf6' },
    { name: 'DR', value: stats.byModality['DR'], color: '#22c55e' },
    { name: 'DSA', value: stats.byModality['DSA'], color: '#f59e0b' },
    { name: '钼靶', value: stats.byModality['乳腺钼靶'], color: '#ec4899' },
  ]

  const deviceStatusData = [
    { status: '使用中', count: devices.filter(d => d.status === '使用中').length, color: '#3b82f6' },
    { status: '空闲', count: devices.filter(d => d.status === '空闲').length, color: '#22c55e' },
    { status: '维护中', count: devices.filter(d => ['维护中', '维修中'].includes(d.status)).length, color: '#f59e0b' },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* 顶部标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>欢迎回来，{user.name} 主任</h1>
            <p style={s.subtitle}>上海市第一人民医院 · 放射科 · {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ ...s.badge, background: '#fef2f2', color: '#dc2626' }}>
              <ShieldAlert size={12} style={{ marginRight: 4 }} />
              {criticalPending.length} 危急值待处理
            </span>
            <span style={{ ...s.badge, background: '#eff6ff', color: '#2563eb' }}>
              <BellRing size={12} style={{ marginRight: 4 }} />
              {pendingExams.length} 检查待完成
            </span>
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div style={s.quickActions}>
        {[
          { icon: <Scan size={22} />, label: '检查工作列表', color: '#3b82f6', bg: '#eff6ff', path: '/worklist' },
          { icon: <FileText size={22} />, label: '书写报告', color: '#8b5cf6', bg: '#f5f3ff', path: '/report-write' },
          { icon: <ShieldAlert size={22} />, label: '危急值管理', color: '#dc2626', bg: '#fef2f2', path: '/critical-value' },
          { icon: <BarChart3 size={22} />, label: '统计分析', color: '#059669', bg: '#ecfdf5', path: '/statistics' },
          { icon: <Monitor size={22} />, label: '设备状态', color: '#d97706', bg: '#fffbeb', path: '/devices' },
        ].map(item => (
          <div key={item.label} style={s.quickAction} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
              {item.icon}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* 统计卡片行 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: '今日检查', value: stats.today.exams, sub: `待报告 ${stats.today.pending}`, icon: <Scan size={18} />, color: '#3b82f6', bg: '#eff6ff' },
          { label: '今日报告', value: stats.today.reports, sub: `已审核 ${Math.round(stats.today.reports * 0.85)}份`, icon: <FileText size={18} />, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: '本月检查', value: stats.month.exams, sub: `本月收入 ¥${(stats.month.revenue / 10000).toFixed(0)}万`, icon: <Activity size={18} />, color: '#059669', bg: '#ecfdf5' },
          { label: '危急值', value: stats.today.critical, sub: `待处理 ${criticalPending.length}例`, icon: <ShieldAlert size={18} />, color: '#dc2626', bg: '#fef2f2' },
        ].map(card => (
          <div key={card.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.2 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{card.sub}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 图表区 */}
      <div style={s.grid}>
        {/* 检查量趋势 */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>本周检查量趋势（按设备类型）</span>
            <span style={{ ...s.badge, background: '#eff6ff', color: '#3b82f6' }}>本周 {stats.week.exams} 例</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconSize={10} iconType="circle" />
              <Bar dataKey="CT" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="MR" fill="#8b5cf6" radius={[4,4,0,0]} />
              <Bar dataKey="DR" fill="#22c55e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 设备类型分布 */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>本月检查类型分布</span>
            <span style={{ ...s.badge, background: '#f5f3ff', color: '#7c3aed' }}>总 {stats.month.exams} 例</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PieChart width={160} height={160}>
              <Pie data={modalityDistData} cx={70} cy={70} innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {modalityDistData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
            <div style={{ flex: 1 }}>
              {modalityDistData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 12, color: '#334155' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 待处理检查 */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>紧急待处理检查</span>
            <span style={{ ...s.badge, background: '#fef2f2', color: '#dc2626' }}>{pendingExams.filter(e => e.priority === '紧急' || e.priority === '危重').length} 紧急</span>
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {pendingExams.slice(0, 8).map(exam => (
              <div key={exam.id} style={s.row}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{exam.patientName}</span>
                    <span style={{ ...s.badge, background: exam.modality === 'CT' ? '#eff6ff' : exam.modality === 'MR' ? '#f5f3ff' : '#ecfdf5', color: exam.modality === 'CT' ? '#2563eb' : exam.modality === 'MR' ? '#7c3aed' : '#059669', fontSize: 10 }}>{exam.modality}</span>
                    {exam.priority !== '普通' && <span style={{ ...s.badge, background: '#fef2f2', color: '#dc2626', fontSize: 10 }}>{exam.priority}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{exam.examItemName} · {exam.patientType} · {exam.patientName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{exam.examDate}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{exam.examTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 设备状态 */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>设备状态监控</span>
            <span style={{ ...s.badge, background: '#ecfdf5', color: '#059669' }}>{deviceStatusData[0].count} 使用中</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {deviceStatusData.map(item => (
              <div key={item.status} style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.count}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{item.status}</div>
              </div>
            ))}
          </div>
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {devices.slice(0, 6).map(device => (
              <div key={device.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{device.name.split('（')[0]}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{device.roomNumber} · {device.modality}</div>
                </div>
                <span style={{
                  ...s.badge,
                  background: device.status === '使用中' ? '#eff6ff' : device.status === '空闲' ? '#ecfdf5' : '#fef9c3',
                  color: device.status === '使用中' ? '#2563eb' : device.status === '空闲' ? '#059669' : '#ca8a04'
                }}>{device.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
