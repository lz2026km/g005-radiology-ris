import { X, AlertTriangle, Info, AlertCircle, Clock, User, FileText, Activity } from 'lucide-react'
import type { CdsAlert } from '../../types/cds'

interface AlertDetailProps {
  alert: CdsAlert
  onClose: () => void
  onAcknowledge?: (id: string) => void
  onDismiss?: (id: string) => void
  onOverride?: (id: string, reason: string) => void
}

export default function AlertDetail({ alert, onClose, onAcknowledge, onDismiss, onOverride }: AlertDetailProps) {
  const severityColor = alert.severity === 'fatal' || alert.severity === 'critical' ? '#f85149'
    : alert.severity === 'high' ? '#d73a4a'
    : alert.severity === 'warning' ? '#d29922'
    : alert.severity === 'notice' ? '#58a6ff'
    : '#8b949e'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}>
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, width: 560, maxHeight: '80vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #30363d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {alert.severity === 'fatal' || alert.severity === 'critical' ? <AlertCircle size={20} color={severityColor} />
              : alert.severity === 'high' || alert.severity === 'warning' ? <AlertTriangle size={20} color={severityColor} />
              : <Info size={20} color={severityColor} />}
            <span style={{ fontSize: 16, fontWeight: 600, color: severityColor }}>{alert.title}</span>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', color: '#6e7681', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 16, lineHeight: 1.5 }}>{alert.message}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 10, background: '#0d1117', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={14} color="#6e7681" /><div><div style={{ fontSize: 12, color: '#6e7681' }}>规则</div><div style={{ fontSize: 13 }}>{alert.ruleName}</div></div>
            </div>
            <div style={{ padding: 10, background: '#0d1117', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={14} color="#6e7681" /><div><div style={{ fontSize: 12, color: '#6e7681' }}>分类</div><div style={{ fontSize: 13 }}>{alert.category}</div></div>
            </div>
            <div style={{ padding: 10, background: '#0d1117', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={14} color="#6e7681" /><div><div style={{ fontSize: 12, color: '#6e7681' }}>触发时间</div><div style={{ fontSize: 13 }}>{new Date(alert.triggeredAt).toLocaleString('zh-CN')}</div></div>
            </div>
            <div style={{ padding: 10, background: '#0d1117', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={14} color="#6e7681" /><div><div style={{ fontSize: 12, color: '#6e7681' }}>患者</div><div style={{ fontSize: 13 }}>{alert.patientName ?? 'N/A'}</div></div>
            </div>
          </div>
          {alert.recommendations && alert.recommendations.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 600, marginBottom: 6 }}>推荐操作</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#8b949e', lineHeight: 1.8 }}>
                {alert.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {alert.evidence && alert.evidence.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 600, marginBottom: 6 }}>证据</div>
              {alert.evidence.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 8px', background: '#0d1117', borderRadius: 4, marginBottom: 4, fontSize: 12, color: '#8b949e' }}>
                  <span style={{ color: '#6e7681', minWidth: 80 }}>{e.label}</span>
                  <span>{String(e.value)}{e.unit ? ' ' + e.unit : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderTop: '1px solid #30363d', justifyContent: 'flex-end' }}>
          {onOverride && (
            <button onClick={() => onOverride(alert.id, '')}
              style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #d29922', background: 'transparent', color: '#d29922', cursor: 'pointer', fontSize: 13 }}>覆盖</button>
          )}
          {onAcknowledge && (
            <button onClick={() => onAcknowledge(alert.id)}
              style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #30363d', background: '#21262d', color: '#f0f6fc', cursor: 'pointer', fontSize: 13 }}>确认</button>
          )}
          {onDismiss && (
            <button onClick={() => onDismiss(alert.id)}
              style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#30363d', color: '#8b949e', cursor: 'pointer', fontSize: 13 }}>忽略</button>
          )}
        </div>
      </div>
    </div>
  )
}
