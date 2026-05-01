// @ts-nocheck
// G005 放射科RIS系统 - 统计分析 v0.1.0
import { useState } from 'react'
import { BarChart3, TrendingUp, Calendar, Download, Activity } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { initialStatisticsData, initialWorkloadStats, initialRadiologyExams, initialModalityDevices } from '../data/initialData'

export default function StatisticsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week')
  const stats = initialStatisticsData
  const workload = initialWorkloadStats
  const exams = initialRadiologyExams
  const devices = initialModalityDevices

  const weekData = [
    { name: '周一', exams: 98, reports: 95, critical: 3 },
    { name: '周二', exams: 105, reports: 100, critical: 2 },
    { name: '周三', exams: 112, reports: 108, critical: 4 },
    { name: '周四', exams: 95, reports: 92, critical: 1 },
    { name: '周五', exams: 108, reports: 103, critical: 2 },
    { name: '周六', exams: 60, reports: 58, critical: 0 },
    { name: '周日', exams: 30, reports: 28, critical: 0 },
  ]

  const monthData = [
    { name: '第1周', CT: 168, MR: 98, DR: 95, DSA: 22 },
    { name: '第2周', CT: 175, MR: 105, DR: 102, DSA: 25 },
    { name: '第3周', CT: 182, MR: 112, DR: 98, DSA: 20 },
    { name: '第4周', CT: 155, MR: 105, DR: 85, DSA: 18 },
  ]

  const modalityDist = [
    { name: 'CT', value: stats.byModality['CT'], color: '#3b82f6' },
    { name: 'MR', value: stats.byModality['MR'], color: '#8b5cf6' },
    { name: 'DR', value: stats.byModality['DR'], color: '#22c55e' },
    { name: 'DSA', value: stats.byModality['DSA'], color: '#f59e0b' },
    { name: '乳腺钼靶', value: stats.byModality['乳腺钼靶'], color: '#ec4899' },
    { name: '胃肠造影', value: stats.byModality['RF'], color: '#14b8a6' },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>统计分析</h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>检查量趋势 · 收入统计 · 医师工作量 · 设备产能分析</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['today', 'week', 'month', 'year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              borderColor: period === p ? '#3b82f6' : '#e2e8f0',
              background: period === p ? '#eff6ff' : '#fff', color: period === p ? '#2563eb' : '#64748b'
            }}>{p === 'today' ? '今日' : p === 'week' ? '本周' : p === 'month' ? '本月' : '本年'}</button>
          ))}
          <button style={{ padding: '6px 14px', background: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={13} /> 导出
          </button>
        </div>
      </div>

      {/* 核心统计 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: period === 'today' ? '今日检查' : period === 'week' ? '本周检查' : period === 'month' ? '本月检查' : '本年检查', value: period === 'today' ? stats.today.exams : period === 'week' ? stats.week.exams : period === 'month' ? stats.month.exams : stats.month.exams * 12, icon: <Activity size={16} />, color: '#3b82f6', bg: '#eff6ff', change: '+12%' },
          { label: '报告完成率', value: '96.8%', icon: <TrendingUp size={16} />, color: '#059669', bg: '#ecfdf5', change: '+2.1%' },
          { label: '危急值发现', value: period === 'today' ? stats.today.critical : period === 'week' ? stats.week.critical : period === 'month' ? stats.month.critical : stats.month.critical * 12, icon: <BarChart3 size={16} />, color: '#dc2626', bg: '#fef2f2', change: '-5%' },
          { label: '本月收入', value: `¥${(stats.month.revenue / 10000).toFixed(0)}万`, icon: <Calendar size={16} />, color: '#d97706', bg: '#fffbeb', change: '+8.3%' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{item.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.2, marginTop: 4 }}>{item.value}</div>
              <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>{item.change} ↑</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 图表区 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>检查量趋势</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend iconSize={10} />
              <Line type="monotone" dataKey="exams" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="检查量" />
              <Line type="monotone" dataKey="reports" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="报告量" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>设备类型分布</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PieChart width={160} height={160}>
              <Pie data={modalityDist} cx={70} cy={70} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {modalityDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
            <div style={{ flex: 1 }}>
              {modalityDist.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f8fafc' }}>
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
      </div>

      {/* 医师工作量排名 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>医师工作量排名（本月）</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {workload.sort((a, b) => b.monthReports - a.monthReports).map((w, idx) => (
            <div key={w.doctorId} style={{ background: '#f8fafc', borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 14, fontWeight: 800, color: idx === 0 ? '#d97706' : '#64748b' }}>
                {idx + 1}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>{w.doctorName}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{w.modality}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#3b82f6', marginTop: 6 }}>{w.monthReports}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>份报告</div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>均分 {w.avgReportTime}min</div>
              <div style={{ fontSize: 10, color: w.qualityScore >= 95 ? '#059669' : '#d97706' }}>质量 {w.qualityScore}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
