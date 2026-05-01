// @ts-nocheck
// G005 放射科RIS系统 - 报告词库 v0.1.0
import { useState } from 'react'
import { BookOpen, Search, Plus, Edit2, Trash2 } from 'lucide-react'
import { initialTermLibrary } from '../data/initialData'

const CATEGORIES = ['全部', 'CT-器官-肝', 'CT-器官-肺', 'MR-信号-脑', 'DR-胸片', '危急值']

export default function TermLibraryPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const terms = initialTermLibrary

  const filtered = terms.filter(t => {
    if (category !== '全部' && t.category !== category) return false
    if (search && !t.keyword.includes(search) && !t.fullTerm.includes(search)) return false
    return true
  })

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>
            <BookOpen size={20} style={{ marginRight: 8, color: '#7c3aed', verticalAlign: 'text-bottom' }} />
            报告词库管理
          </h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>标准化术语 · 快捷辅助输入 · 模板关联 · 典型表现库</p>
        </div>
        <button style={{ padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> 新增词条
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '词条总数', value: terms.length, color: '#7c3aed' },
          { label: 'CT词条', value: terms.filter(t => t.modality.includes('CT')).length, color: '#3b82f6' },
          { label: 'MR词条', value: terms.filter(t => t.modality.includes('MR')).length, color: '#8b5cf6' },
          { label: '危急值词条', value: terms.filter(t => t.category === '危急值').length, color: '#dc2626' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, padding: '10px 16px', border: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Search size={14} style={{ color: '#94a3b8' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索关键词/术语..." style={{ border: 'none', outline: 'none', fontSize: 13, width: 300 }} />
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '4px 12px', borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              borderColor: category === c ? '#7c3aed' : '#e2e8f0',
              background: category === c ? '#f5f3ff' : '#fff', color: category === c ? '#6d28d9' : '#64748b'
            }}>{c}</button>
          ))}
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['关键词', '完整术语', '类别', '设备类型', '典型表现', '典型诊断', '操作'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(term => (
              <tr key={term.id} style={{ borderBottom: '1px solid #f8fafc' }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafbff'}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fff'}
              >
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ padding: '2px 8px', background: '#f5f3ff', color: '#7c3aed', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{term.keyword}</span>
                </td>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e3a5f' }}>{term.fullTerm}</td>
                <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{term.category}</td>
                <td style={{ padding: '8px 12px' }}>
                  {term.modality.map(m => <span key={m} style={{ padding: '1px 5px', background: '#eff6ff', color: '#2563eb', borderRadius: 3, fontSize: 10, marginRight: 3 }}>{m}</span>)}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b', maxWidth: 200 }}>{term.typicalFindings || '-'}</td>
                <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{term.typicalDiagnosis || '-'}</td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={{ padding: '3px 8px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}><Edit2 size={10} /></button>
                    <button style={{ padding: '3px 8px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}><Trash2 size={10} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
