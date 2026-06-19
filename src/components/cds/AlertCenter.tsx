import { useState } from 'react'
import { Bell, Filter, Search, AlertTriangle, Check } from 'lucide-react'
import AlertBanner from './AlertBanner'
import type { CdsAlert, CdsAlertCategory, CdsAlertSeverity, CdsAlertStatus } from '../../types/cds'

const CATEGORY_OPTIONS: { value: CdsAlertCategory | ''; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'contraindication', label: '禁忌' },
  { value: 'drug_interaction', label: '药物交互' },
  { value: 'allergy', label: '过敏' },
  { value: 'dose_alert', label: '剂量' },
  { value: 'dose_exceed', label: '剂量超限' },
  { value: 'guideline_recommendation', label: '指南' },
  { value: 'pathway_deviation', label: '路径' },
  { value: 'completeness', label: '完整性' },
]

const SEVERITY_OPTIONS: { value: CdsAlertSeverity | ''; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'fatal', label: '致命' },
  { value: 'critical', label: '危急' },
  { value: 'high', label: '高' },
  { value: 'warning', label: '警告' },
  { value: 'notice', label: '注意' },
  { value: 'info', label: '信息' },
]

interface AlertCenterListProps {
  alerts: CdsAlert[]
  onDismiss?: (id: string) => void
  onAcknowledge?: (id: string) => void
  onDismissAll?: () => void
  onAcknowledgeAll?: () => void
}

export default function AlertCenterList({ alerts, onDismiss, onAcknowledge, onDismissAll, onAcknowledgeAll }: AlertCenterListProps) {
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CdsAlertCategory | ''>('')
  const [severityFilter, setSeverityFilter] = useState<CdsAlertSeverity | ''>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = alerts.filter((a) => {
    if (categoryFilter && a.category !== categoryFilter) return false
    if (severityFilter && a.severity !== severityFilter) return false
    if (searchText) {
      const q = searchText.toLowerCase()
      if (!a.title.toLowerCase().includes(q) && !a.message.toLowerCase().includes(q) && !a.ruleName.toLowerCase().includes(q)) return false
    }
    return true
  })

  const blockingCount = alerts.filter((a) => a.blocking && a.status === 'active').length

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#f0f6fc', fontSize: 14, fontFamily: '"Segoe UI",sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#1e40af,#1e3a8a)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bell size={24} /><span style={{ fontSize: 20, fontWeight: 600 }}>告警中心</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {blockingCount > 0 && (
            <span style={{ padding: '4px 10px', borderRadius: 4, background: '#f8514920', color: '#f85149', fontSize: 12, fontWeight: 600 }}>
              {blockingCount} 阻塞
            </span>
          )}
          <span style={{ fontSize: 13, color: '#8b949e' }}>共 {filtered.length} 条</span>
        </div>
      </div>
      <div style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#6e7681' }} />
            <input type="text" placeholder="搜索告警..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
              style={{ padding: '8px 12px 8px 34px', borderRadius: 6, border: '1px solid #30363d', background: '#161b22', color: '#f0f6fc', fontSize: 13, width: 240, outline: 'none' }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #30363d', background: showFilters ? '#1e40af' : '#21262d', color: '#f0f6fc', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} />筛选
          </button>
          {onAcknowledgeAll && alerts.filter((a) => a.status === 'active').length > 0 && (
            <button onClick={onAcknowledgeAll}
              style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #30363d', background: '#21262d', color: '#8b949e', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={14} />全部确认
            </button>
          )}
          {onDismissAll && alerts.filter((a) => a.status === 'active' || a.status === 'acknowledged').length > 0 && (
            <button onClick={onDismissAll}
              style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #30363d', background: '#21262d', color: '#8b949e', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} />全部忽略
            </button>
          )}
        </div>
        {showFilters && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, padding: 12, background: '#161b22', borderRadius: 8, border: '1px solid #30363d' }}>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as CdsAlertCategory | '')}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc', fontSize: 13, outline: 'none' }}>
              {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as CdsAlertSeverity | '')}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc', fontSize: 13, outline: 'none' }}>
              {SEVERITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filtered.map((alert) => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              expanded={expandedId === alert.id}
              onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
              onDismiss={onDismiss}
              onAcknowledge={onAcknowledge}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#6e7681', fontSize: 14 }}>
              <Bell size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div>暂无告警</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
