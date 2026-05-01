// @ts-nocheck
// G005 放射科RIS系统 - 检查记录 v0.1.0
import { useState } from 'react'
import { Search, Scan, FileText, Clock, AlertCircle, Filter } from 'lucide-react'
import { initialRadiologyExams, initialModalityDevices } from '../data/initialData'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  '已登记': { bg: '#dbeafe', color: '#2563eb' },
  '待检查': { bg: '#ede9fe', color: '#7c3aed' },
  '检查中': { bg: '#fce7f3', color: '#db2777' },
  '待报告': { bg: '#fef9c3', color: '#ca8a04' },
  '已报告': { bg: '#d1fae5', color: '#059669' },
  '已发布': { bg: '#ecfdf5', color: '#047857' },
}

export default function ExamPage() {
  const [search, setSearch] = useState('')
  const [modalityFilter, setModalityFilter] = useState('全部')
  const exams = initialRadiologyExams
  const modalities = ['全部', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶', '胃肠造影']

  const filtered = exams.filter(e => {
    if (search && !e.patientName.includes(search) && !e.accessionNumber.includes(search)) return false
    if (modalityFilter !== '全部' && e.modality !== modalityFilter) return false
    return true
  })

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>
          <Scan size={20} style={{ marginRight: 8, color: '#3b82f6', verticalAlign: 'text-bottom' }} />
          检查记录
        </h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>全部检查记录 · 状态追踪 · 图像管理 · DICOM关联</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '全部', value: exams.length, color: '#3b82f6' },
          { label: '检查中', value: exams.filter(e => e.status === '检查中').length, color: '#db2777' },
          { label: '待报告', value: exams.filter(e => e.status === '待报告').length, color: '#ca8a04' },
          { label: '已报告', value: exams.filter(e => ['已报告', '已发布'].includes(e.status)).length, color: '#059669' },
          { label: '危急值', value: exams.filter(e => e.criticalFinding).length, color: '#dc2626' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, padding: '10px 16px', border: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Search size={14} style={{ color: '#94a3b8' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索患者/Accession..." style={{ border: 'none', outline: 'none', fontSize: 13, width: 300 }} />
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {modalities.map(m => (
            <button key={m} onClick={() => setModalityFilter(m)} style={{
              padding: '4px 12px', borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              borderColor: modalityFilter === m ? '#3b82f6' : '#e2e8f0',
              background: modalityFilter === m ? '#eff6ff' : '#fff', color: modalityFilter === m ? '#2563eb' : '#64748b'
            }}>{m}</button>
          ))}
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['患者', '检查项目', '设备', '检查室', '类型', '状态', '检查日期', 'Accession', '图像', '危急值'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((exam, idx) => {
              const sc = STATUS_COLORS[exam.status] || { bg: '#f1f5f9', color: '#64748b' }
              return (
                <tr key={exam.id} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{exam.patientName}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{exam.gender}/{exam.age}岁</div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{exam.examItemName}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{exam.modality} · {exam.bodyPart}</div>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{exam.deviceName?.split('（')[0]}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{exam.roomName}</td>
                  <td style={{ padding: '8px 12px' }}><span style={{ padding: '2px 6px', background: '#eff6ff', color: '#2563eb', borderRadius: 4, fontSize: 10 }}>{exam.patientType}</span></td>
                  <td style={{ padding: '8px 12px' }}><span style={{ ...sc, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{exam.status}</span></td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{exam.examDate} {exam.examTime}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{exam.accessionNumber}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>{exam.imagesAcquired}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {exam.criticalFinding ? <span style={{ padding: '2px 6px', background: '#fee2e2', color: '#dc2626', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>⚠</span> : <span style={{ color: '#94a3b8' }}>-</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
