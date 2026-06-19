import { useState } from 'react'
import { BookOpen, Search, Filter, ChevronDown, ChevronRight, ExternalLink, Award, FileText } from 'lucide-react'
import type { ClinicalGuideline } from '../../types/cds'

interface GuidelineViewerProps {
  guidelines: ClinicalGuideline[]
  onSelect?: (guideline: ClinicalGuideline) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  fleischner: 'Fleischner Society',
  acr: 'ACR',
  rsna: 'RSNA',
  nice: 'NICE / NCCN',
  acr_white_paper: 'ACR白皮书',
  esr: 'ESR / ESUR',
  rsna_peds: '儿科',
  custom: '自定义',
}

export default function GuidelineViewer({ guidelines, onSelect }: GuidelineViewerProps) {
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = guidelines.filter((g) => {
    if (categoryFilter && g.category !== categoryFilter) return false
    if (searchText) {
      const q = searchText.toLowerCase()
      if (!g.title.toLowerCase().includes(q) && !g.shortName.toLowerCase().includes(q) && !(g.condition ?? '').toLowerCase().includes(q)) return false
    }
    return true
  })

  const categories = Array.from(new Set(guidelines.map((g) => g.category)))

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#f0f6fc', fontSize: 14, fontFamily: '"Segoe UI",sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#1e40af,#1e3a8a)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BookOpen size={24} /><span style={{ fontSize: 20, fontWeight: 600 }}>临床指南库</span>
        </div>
        <span style={{ fontSize: 13, color: '#8b949e' }}>共 {filtered.length} 部指南</span>
      </div>
      <div style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#6e7681' }} />
            <input type="text" placeholder="搜索指南..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
              style={{ padding: '8px 12px 8px 34px', borderRadius: 6, border: '1px solid #30363d', background: '#161b22', color: '#f0f6fc', fontSize: 13, width: 280, outline: 'none' }} />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc', fontSize: 13, outline: 'none' }}>
            <option value="">全部</option>
            {categories.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((g) => (
            <div key={g.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', cursor: 'pointer' }}
                onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1e40af20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={16} color="#58a6ff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f6fc', marginBottom: 2 }}>{g.title}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6e7681', marginBottom: 4 }}>
                    <span>{g.organization} {g.publicationYear}</span>
                    {g.modality && <span>{g.modality}</span>}
                    {g.bodyPart && <span>{g.bodyPart}</span>}
                    {g.condition && <span>{g.condition}</span>}
                    <span style={{ padding: '1px 6px', borderRadius: 4, background: '#21262d' }}>{g.evidenceLevel}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.4 }}>{g.abstract}</div>
                </div>
                {expandedId === g.id ? <ChevronDown size={16} color="#6e7681" /> : <ChevronRight size={16} color="#6e7681" />}
              </div>
              {expandedId === g.id && (
                <div style={{ padding: '0 14px 12px 56px', borderTop: '1px solid #30363d20' }}>
                  {g.keyPoints.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 600, marginBottom: 4 }}>要点</div>
                      {g.keyPoints.map((kp) => (
                        <div key={kp.id} style={{ fontSize: 12, color: '#8b949e', padding: '4px 0', display: 'flex', gap: 6 }}>
                          <Award size={12} color="#58a6ff" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span>{kp.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {g.recommendations.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 600, marginBottom: 4 }}>推荐</div>
                      {g.recommendations.map((r) => (
                        <div key={r.id} style={{ fontSize: 12, color: '#8b949e', padding: '4px 0', display: 'flex', gap: 6 }}>
                          <span style={{ padding: '1px 6px', borderRadius: 4, background: '#21262d', fontSize: 11, color: '#6e7681', flexShrink: 0 }}>
                            {r.strength === 'strong_for' ? '强烈推荐' : r.strength === 'conditional_for' ? '条件推荐' : r.strength === 'conditional_against' ? '条件反对' : '强烈反对'}
                          </span>
                          <span>{r.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {onSelect && (
                    <button onClick={() => onSelect(g)}
                      style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #30363d', background: '#21262d', color: '#58a6ff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ExternalLink size={12} /> 查看详情
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#6e7681' }}>
              <BookOpen size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div>未找到匹配指南</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
