// @ts-nocheck
// G005 放射科RIS系统 - 危急值管理 v0.1.0
import { useState } from 'react'
import { ShieldAlert, AlertTriangle, Phone, Clock, CheckCircle, Bell, Search, X } from 'lucide-react'
import { initialCriticalValues, initialUsers } from '../data/initialData'

const SEVERITY_COLORS: Record<string, { bg: string; color: string }> = {
  '高危': { bg: '#fef3c7', color: '#d97706' },
  '危急': { bg: '#fee2e2', color: '#dc2626' },
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  '待通知': { bg: '#fee2e2', color: '#dc2626' },
  '已通知': { bg: '#fef3c7', color: '#d97706' },
  '已接收': { bg: '#dbeafe', color: '#2563eb' },
  '已处理': { bg: '#d1fae5', color: '#059669' },
}

export default function CriticalValuePage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const criticalValues = initialCriticalValues
  const users = initialUsers

  const filtered = criticalValues.filter(cv => {
    if (search && !cv.patientName.includes(search)) return false
    if (statusFilter !== '全部' && cv.status !== statusFilter) return false
    return true
  })

  const stats = {
    total: criticalValues.length,
    pending: criticalValues.filter(c => c.status === '待通知').length,
    processing: criticalValues.filter(c => ['已通知', '已接收'].includes(c.status)).length,
    resolved: criticalValues.filter(c => c.status === '已处理').length,
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>
          <ShieldAlert size={20} style={{ marginRight: 8, color: '#dc2626', verticalAlign: 'text-bottom' }} />
          危急值管理
        </h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>危急值发现 · 即时通知 · 接收确认 · 随访记录 · 自动推送临床</p>
      </div>

      {/* 统计 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '全部危急值', value: stats.total, icon: <ShieldAlert size={16} />, color: '#7c3aed' },
          { label: '待通知', value: stats.pending, icon: <Bell size={16} />, color: '#dc2626' },
          { label: '处理中', value: stats.processing, icon: <Clock size={16} />, color: '#d97706' },
          { label: '已处理', value: stats.resolved, icon: <CheckCircle size={16} />, color: '#059669' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: item.color }}>{item.icon}</div>
            <div><div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f', lineHeight: 1 }}>{item.value}</div><div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.label}</div></div>
          </div>
        ))}
      </div>

      {/* 筛选 */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '10px 16px', border: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <Search size={14} style={{ color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索患者姓名..." style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['全部', '待通知', '已通知', '已接收', '已处理'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '4px 12px', borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              borderColor: statusFilter === s ? '#dc2626' : '#e2e8f0',
              background: statusFilter === s ? '#fef2f2' : '#fff', color: statusFilter === s ? '#dc2626' : '#64748b'
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* 列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(cv => {
          const sc = STATUS_COLORS[cv.status] || STATUS_COLORS['待通知']
          const sev = SEVERITY_COLORS[cv.severity] || SEVERITY_COLORS['高危']
          return (
            <div key={cv.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertTriangle size={16} style={{ color: '#dc2626' }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#dc2626' }}>⚠ 危急值通报</span>
                  <span style={{ ...sev, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{cv.severity}</span>
                </div>
                <span style={{ ...sc, padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{cv.status}</span>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>患者信息</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginTop: 2 }}>{cv.patientName}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{cv.examItemName} · {cv.modality}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>报告医师</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginTop: 2 }}>{cv.reportedByName}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>通报时间：{cv.reportedTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>接收医生</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginTop: 2 }}>{cv.receivingDoctorName || '待指定'}</div>
                    {cv.receivingTime && <div style={{ fontSize: 11, color: '#64748b' }}>接收时间：{cv.receivingTime}</div>}
                  </div>
                </div>
                {/* 危急值描述 */}
                <div style={{ background: '#fff5f5', borderRadius: 8, padding: '10px 14px', marginBottom: 12, border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, marginBottom: 4 }}>危急值详情</div>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>{cv.findingDetails || cv.criticalFinding}</div>
                </div>
                {/* 时间线 */}
                <div style={{ display: 'flex', gap: 16, padding: '8px 0', borderTop: '1px solid #f1f5f9' }}>
                  {[
                    { label: '报告发现', time: cv.reportedTime, user: cv.reportedByName },
                    { label: '临床通知', time: cv.receivingTime || '-', user: cv.receivingDoctorName || '待通知' },
                    { label: '确认接收', time: cv.acknowledgedTime || '-', user: cv.acknowledgedBy || '待确认' },
                  ].map(item => (
                    <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{item.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', marginTop: 2 }}>{item.time}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{item.user}</div>
                    </div>
                  ))}
                </div>
                {/* 跟进 */}
                {cv.followUpNotes && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', padding: '6px 10px', background: '#f8fafc', borderRadius: 6 }}>
                    跟进：{cv.followUpNotes}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
