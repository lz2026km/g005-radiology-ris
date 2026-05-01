// @ts-nocheck
// G005 放射科RIS系统 - 会诊管理 v0.1.0
import { useState } from 'react'
import { Radio, Search, Video, CheckCircle, Clock, Phone } from 'lucide-react'
import { initialConsultations } from '../data/initialData'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  '待回复': { bg: '#fef3c7', color: '#d97706' },
  '已回复': { bg: '#d1fae5', color: '#059669' },
  '已拒绝': { bg: '#f1f5f9', color: '#94a3b8' },
}

export default function ConsultationPage() {
  const [search, setSearch] = useState('')
  const consultations = initialConsultations
  const filtered = consultations.filter(c => !search || c.patientName.includes(search))

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>
          <Radio size={20} style={{ marginRight: 8, color: '#2563eb', verticalAlign: 'text-bottom' }} />
          会诊管理
        </h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>疑难病例讨论 · MDT多学科会诊 · 远程会诊 · 二次意见</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '全部会诊', value: consultations.length, color: '#2563eb' },
          { label: '待回复', value: consultations.filter(c => c.status === '待回复').length, color: '#d97706' },
          { label: '已回复', value: consultations.filter(c => c.status === '已回复').length, color: '#059669' },
          { label: '远程会诊', value: consultations.filter(c => c.isRemote).length, color: '#7c3aed' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, padding: '10px 16px', border: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', gap: 8 }}>
        <Search size={14} style={{ color: '#94a3b8' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索患者..." style={{ border: 'none', outline: 'none', fontSize: 13, width: 300 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(c => {
          const sc = STATUS_COLORS[c.status] || STATUS_COLORS['待回复']
          return (
            <div key={c.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, color: '#1e3a5f' }}>{c.patientName}</span>
                  <span style={{ padding: '2px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: 4, fontSize: 11 }}>{c.modality}</span>
                  <span style={{ padding: '2px 8px', background: '#f5f3ff', color: '#7c3aed', borderRadius: 4, fontSize: 11 }}>{c.consultationType}</span>
                  {c.isRemote && <span style={{ padding: '2px 8px', background: '#ede9fe', color: '#6d28d9', borderRadius: 4, fontSize: 11 }}><Video size={10} style={{ marginRight: 3, display: 'inline' }} />远程</span>}
                </div>
                <span style={{ ...sc, padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{c.status}</span>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>申请科室/医师</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{c.requestingDoctorName}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{c.requestingDepartment}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>会诊科室/医师</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{c.consultedDoctorName || '待指定'}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{c.consultedDepartment || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>会诊时间</div>
                    <div style={{ fontSize: 12, color: '#334155' }}>申请：{c.requestTime}</div>
                    {c.responseTime && <div style={{ fontSize: 12, color: '#059669' }}>回复：{c.responseTime}</div>}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>会诊原因</div>
                  <div style={{ fontSize: 13, color: '#334155' }}>{c.requestReason}</div>
                </div>
                {c.responseContent && (
                  <div style={{ background: '#ecfdf5', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginBottom: 4 }}>会诊意见</div>
                    <div style={{ fontSize: 13, color: '#334155' }}>{c.responseContent}</div>
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
