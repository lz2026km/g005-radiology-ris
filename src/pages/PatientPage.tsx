// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 患者管理 v0.1.0
// ============================================================
import { useState, useMemo } from 'react'
import { Search, User, Phone, AlertCircle, Calendar, Plus, X } from 'lucide-react'
import { initialPatients, initialRadiologyExams } from '../data/initialData'
import type { Patient } from '../types'

export default function PatientPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('全部')
  const [selected, setSelected] = useState<Patient | null>(null)

  const patients = initialPatients
  const exams = initialRadiologyExams
  const types = ['全部', '门诊', '住院', '体检', '急诊']

  const filtered = useMemo(() => patients.filter(p => {
    if (search && !p.name.includes(search) && !p.id.includes(search) && !p.phone.includes(search)) return false
    if (typeFilter !== '全部' && p.patientType !== typeFilter) return false
    return true
  }), [search, typeFilter])

  const getPatientExams = (patientId: string) => exams.filter(e => e.patientId === patientId)

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>患者管理</h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>患者档案 · 就诊记录 · 过敏史 · 危急值预警</p>
        </div>
        <button style={{ padding: '8px 16px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> 新建患者
        </button>
      </div>

      {/* 统计 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '总患者数', value: patients.length, color: '#3b82f6' },
          { label: '住院患者', value: patients.filter(p => p.patientType === '住院').length, color: '#8b5cf6' },
          { label: '今日新增', value: 3, color: '#059669' },
          { label: '有危急值', value: 1, color: '#dc2626' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* 搜索 */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Search size={14} style={{ color: '#94a3b8' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索姓名 / ID / 电话..." style={{ border: 'none', outline: 'none', fontSize: 13, width: 300 }} />
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '4px 12px', borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              borderColor: typeFilter === t ? '#3b82f6' : '#e2e8f0',
              background: typeFilter === t ? '#eff6ff' : '#fff', color: typeFilter === t ? '#2563eb' : '#64748b'
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* 列表 */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['患者ID', '姓名', '性别/年龄', '类型', '电话', '过敏史', '累计检查', '最近检查', '操作'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => {
              const pExams = getPatientExams(p.id)
              const hasAllergy = p.allergyHistory && p.allergyHistory !== '无'
              const hasCritical = pExams.some(e => e.criticalFinding)
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}
                  onClick={() => setSelected(p)}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'}
                >
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{p.id}</td>
                  <td style={{ padding: '8px 12px' }}><span style={{ fontWeight: 600, color: '#1e3a5f' }}>{p.name}</span></td>
                  <td style={{ padding: '8px 12px', color: '#64748b' }}>{p.gender} / {p.age}岁</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>{p.patientType}</span>
                  </td>
                  <td style={{ padding: '8px 12px', color: '#64748b' }}>{p.phone}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {hasAllergy ? (
                      <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 3, width: 'fit-content' }}>
                        <AlertCircle size={10} /> {p.allergyHistory}
                      </span>
                    ) : <span style={{ color: '#94a3b8', fontSize: 11 }}>无</span>}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>{p.totalExamCount}</td>
                  <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11 }}>{p.lastExamDate || '-'}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <button style={{ padding: '3px 10px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>详情</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 详情 */}
      {selected && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: 420, height: '100vh', background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>患者档案</h3>
            <button onClick={() => setSelected(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{selected.name.slice(0, 1)}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{selected.gender} · {selected.age}岁 · {selected.patientType}</div>
            </div>
            {[
              ['患者ID', selected.id], ['电话', selected.phone], ['身份证', selected.idCard],
              ['住址', selected.address], ['医保类型', selected.insuranceType || '-'],
              ['床位号', selected.bedNumber || '-'], ['主治医师', selected.attendingDoctor || '-'],
              ['过敏史', selected.allergyHistory || '无'], ['病史', selected.medicalHistory],
              ['登记日期', selected.registrationDate], ['累计检查', `${selected.totalExamCount} 次`],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{label}</div>
                <div style={{ fontSize: 13, color: '#334155', marginTop: 2 }}>{value}</div>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>检查记录</div>
              {getPatientExams(selected.id).map(ex => (
                <div key={ex.id} style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{ex.examItemName}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{ex.examDate}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{ex.modality} · {ex.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
