// @ts-nocheck
// G005 放射科RIS系统 - 影像质量控制 v0.1.0
import { useState } from 'react'
import { ShieldCheck, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react'
import { initialRadiologyExams } from '../data/initialData'

export default function QCPage() {
  const [search, setSearch] = useState('')
  const exams = initialRadiologyExams.filter(e => e.status === '已报告')

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>
          <ShieldCheck size={20} style={{ marginRight: 8, color: '#059669', verticalAlign: 'text-bottom' }} />
          影像质量控制
        </h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>图像质量评分 · 规范化检查 · 复查追踪 · 质量统计</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '已报告检查', value: exams.length, color: '#3b82f6' },
          { label: '优（≥90分）', value: Math.round(exams.length * 0.7), color: '#059669' },
          { label: '良（80-89分）', value: Math.round(exams.length * 0.25), color: '#d97706' },
          { label: '差（<80分）', value: Math.round(exams.length * 0.05), color: '#dc2626' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['患者', '检查项目', '设备', '图像数量', '质量评分', '评分详情', '操作'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exams.map((exam, idx) => {
              const score = Math.floor(75 + Math.random() * 25)
              return (
                <tr key={exam.id} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'}
                >
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e3a5f' }}>{exam.patientName}</td>
                  <td style={{ padding: '8px 12px' }}><div style={{ fontSize: 12, color: '#334155' }}>{exam.examItemName}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>{exam.modality}</div></td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{exam.deviceName?.split('（')[0]}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>{exam.imagesAcquired}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: score >= 90 ? '#d1fae5' : score >= 80 ? '#fef3c7' : '#fee2e2', color: score >= 90 ? '#047857' : score >= 80 ? '#d97706' : '#dc2626' }}>{score}分</span>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>序列完整 / 对比度良好 / 无运动伪影</td>
                  <td style={{ padding: '8px 12px' }}>
                    <button style={{ padding: '3px 10px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>审核</button>
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
