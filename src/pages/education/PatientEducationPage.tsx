import React, { useState, useEffect } from 'react'
import { getEducationService, type EducationMaterial, type PatientEducationRecord, type CommunicationTemplate } from '../../services/education/EducationService'

// ===== Styles =====
const s = {
  container: { maxWidth: 1000, margin: '0 auto', padding: 24, fontFamily: '-apple-system, sans-serif' },
  card: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  title: { fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0, marginBottom: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  badge: (color: string, bg: string) => ({ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: bg, color }),
  btn: { padding: '8px 16px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#1e40af', color: '#fff' },
  select: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff' },
  label: { fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4, display: 'block' },
  tab: (active: boolean) => ({
    flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: active ? '#fff' : 'transparent', color: active ? '#1e40af' : '#64748b',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
  }),
}

const CATEGORY_LABELS: Record<string, string> = {
  pre_exam: '检查前准备', post_exam: '检查后指导', condition: '疾病知识', medication: '药物指导', general: '一般宣教',
}

// ===== Component =====
export default function PatientEducationPage() {
  const [activeTab, setActiveTab] = useState<'materials' | 'records' | 'communication'>('materials')
  const [materials, setMaterials] = useState<EducationMaterial[]>([])
  const [records, setRecords] = useState<PatientEducationRecord[]>([])
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<EducationMaterial | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const svc = getEducationService()

  useEffect(() => {
    svc.getMaterials().then(setMaterials)
    svc.getPatientRecords('P001').then(setRecords)
    svc.getTemplates().then(setTemplates)
  }, [])

  const filtered = categoryFilter ? materials.filter(m => m.category === categoryFilter) : materials

  return (
    <div style={s.container}>
      <h2 style={s.title}>患者教育与沟通</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
        {(['materials', 'records', 'communication'] as const).map(tab => (
          <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            {tab === 'materials' ? '教育资料' : tab === 'records' ? '学习记录' : '沟通模板'}
          </button>
        ))}
      </div>

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...s.title, margin: 0, fontSize: 16 }}>健康教育资料库</h3>
            <select style={s.select} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">全部分类</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {selectedMaterial ? (
            <div>
              <button style={{ ...s.btn, background: '#64748b', marginBottom: 16 }} onClick={() => setSelectedMaterial(null)}>← 返回列表</button>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{selectedMaterial.title}</div>
              <span style={s.badge('#fff', '#1e40af')}>{CATEGORY_LABELS[selectedMaterial.category] || selectedMaterial.category}</span>
              {selectedMaterial.modality && <span style={{ ...s.badge('#0369a1', '#e0f2fe'), marginLeft: 8 }}>{selectedMaterial.modality}</span>}
              <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 8, fontSize: 14, color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {selectedMaterial.content}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 4 }}>
                {selectedMaterial.tags.map(t => <span key={t} style={s.badge('#64748b', '#f1f5f9')}>{t}</span>)}
              </div>
            </div>
          ) : (
            <div style={s.grid2}>
              {filtered.map(m => (
                <div key={m.id} style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer' }}
                  onClick={() => setSelectedMaterial(m)}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{m.summary}</div>
                  <span style={s.badge('#fff', '#1e40af')}>{CATEGORY_LABELS[m.category]}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>{m.contentType}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div style={s.card}>
          <h3 style={{ ...s.title, fontSize: 16 }}>患者学习记录</h3>
          {records.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{r.materialTitle}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>分配时间：{new Date(r.assignedAt).toLocaleString()}</div>
              </div>
              <span style={s.badge(r.completed ? '#166534' : '#854d0e', r.completed ? '#dcfce7' : '#fef9c3')}>
                {r.completed ? '已学习' : '未学习'}
              </span>
            </div>
          ))}
          {records.length === 0 && <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 24 }}>暂无学习记录</div>}
        </div>
      )}

      {/* Communication Tab */}
      {activeTab === 'communication' && (
        <div style={s.card}>
          <h3 style={{ ...s.title, fontSize: 16 }}>沟通模板</h3>
          {templates.map(t => (
            <div key={t.id} style={{ padding: 16, marginBottom: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{t.name}</span>
                <span style={s.badge('#fff', { 'sms': '#0369a1', 'wechat': '#166534', 'email': '#92400e', 'app_push': '#7c3aed' }[t.channel] || '#64748b')}>{t.channel}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>标题：{t.title}</div>
              <div style={{ fontSize: 12, color: '#475569', background: '#fff', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>{t.body}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                {t.variables.map(v => <span key={v} style={s.badge('#7c3aed', '#f3e8ff')}>{`{${v}}`}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
