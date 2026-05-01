// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 报告列表 v0.1.0
// ============================================================
import { useState, useMemo } from 'react'
import { Search, FileText, Clock, CheckCircle, AlertTriangle, Filter, X, Printer } from 'lucide-react'
import { initialRadiologyReports, initialRadiologyExams, initialUsers } from '../data/initialData'
import type { RadiologyReport } from '../types'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  '未开始': { bg: '#f1f5f9', color: '#64748b' },
  '书写中': { bg: '#fef3c7', color: '#d97706' },
  '待审核': { bg: '#ede9fe', color: '#7c3aed' },
  '已审核': { bg: '#dbeafe', color: '#2563eb' },
  '已发布': { bg: '#d1fae5', color: '#059669' },
  '已驳回': { bg: '#fee2e2', color: '#dc2626' },
}

export default function ReportPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [modalityFilter, setModalityFilter] = useState<string>('全部')
  const [dateFilter, setDateFilter] = useState('2026-05-01')

  const reports = initialRadiologyReports
  const exams = initialRadiologyExams
  const users = initialUsers

  const modalities = ['全部', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶']
  const statuses = ['全部', '未开始', '书写中', '待审核', '已审核', '已发布', '已驳回']

  const filtered = useMemo(() => {
    return reports.filter(r => {
      if (search && !r.patientName.includes(search) && !r.reportId.includes(search) && !r.examItemName.includes(search)) return false
      if (statusFilter !== '全部' && r.status !== statusFilter) return false
      if (modalityFilter !== '全部' && r.modality !== modalityFilter) return false
      return true
    })
  }, [reports, search, statusFilter, modalityFilter])

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter(r => ['未开始', '书写中'].includes(r.status)).length,
    review: reports.filter(r => r.status === '待审核').length,
    published: reports.filter(r => r.status === '已发布').length,
    critical: reports.filter(r => r.criticalFinding).length,
  }), [reports])

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>放射报告管理</h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>报告书写 · 审核发布 · 危急值通知 · 模板管理</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '8px 16px', background: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Printer size={14} /> 批量打印
          </button>
          <button style={{ padding: '8px 16px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + 书写新报告
          </button>
        </div>
      </div>

      {/* 统计 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '全部报告', value: stats.total, icon: <FileText size={14} />, color: '#3b82f6' },
          { label: '待书写', value: stats.pending, icon: <Clock size={14} />, color: '#d97706' },
          { label: '待审核', value: stats.review, icon: <AlertTriangle size={14} />, color: '#7c3aed' },
          { label: '已发布', value: stats.published, icon: <CheckCircle size={14} />, color: '#059669' },
          { label: '含危急值', value: stats.critical, icon: <AlertTriangle size={14} />, color: '#dc2626' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: item.color }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f', lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 筛选 */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索患者 / 报告ID / 检查项目..." style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {modalities.map(m => (
            <button key={m} onClick={() => setModalityFilter(m)} style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              borderColor: modalityFilter === m ? '#3b82f6' : '#e2e8f0',
              background: modalityFilter === m ? '#eff6ff' : '#fff', color: modalityFilter === m ? '#2563eb' : '#64748b'
            }}>{m}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              borderColor: statusFilter === s ? '#7c3aed' : '#e2e8f0',
              background: statusFilter === s ? '#ede9fe' : '#fff', color: statusFilter === s ? '#6d28d9' : '#64748b'
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['状态', '患者', '检查项目', '设备', '报告医师', '审核医师', '报告时间', '质量分', '危急值', 'Accession', '操作'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => {
              const sc = STATUS_COLORS[r.status] || STATUS_COLORS['未开始']
              const exam = exams.find(e => e.id === r.examId)
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f7ff'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ ...sc, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{r.status}</span>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{r.patientName}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{r.gender}/{r.age}岁/{r.patientType}</div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{r.examItemName}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{r.modality} · {r.examDate}</div>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{r.deviceName?.split('（')[0] || '-'}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontSize: 12, color: '#334155' }}>{r.reportDoctorName || '-'}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{r.signedTime ? `签: ${r.signedTime}` : '-'}</div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontSize: 12, color: '#334155' }}>{r.auditorName || '-'}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{r.approvedTime ? `审: ${r.approvedTime}` : '-'}</div>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{r.createdTime}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {r.qualityScore ? (
                      <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: r.qualityScore >= 90 ? '#d1fae5' : r.qualityScore >= 80 ? '#fef3c7' : '#fee2e2', color: r.qualityScore >= 90 ? '#047857' : r.qualityScore >= 80 ? '#d97706' : '#dc2626' }}>
                        {r.qualityScore}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    {r.criticalFinding ? (
                      <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>危急值</span>
                    ) : <span style={{ color: '#94a3b8', fontSize: 11 }}>-</span>}
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{r.accessionNumber}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ padding: '3px 8px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>查看</button>
                      <button style={{ padding: '3px 8px', background: '#f5f3ff', color: '#7c3aed', border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>编辑</button>
                    </div>
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
