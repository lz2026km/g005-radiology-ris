import { AlertTriangle, Info, AlertCircle, X, ChevronDown } from 'lucide-react'
import type { CdsAlert, CdsAlertSeverity } from '../../types/cds'

const SEVERITY_STYLES: Record<CdsAlertSeverity, { bg: string; border: string; icon: typeof AlertTriangle; color: string }> = {
  info: { bg: '#0d1117', border: '#30363d', icon: Info, color: '#8b949e' },
  notice: { bg: '#1a2332', border: '#1e40af', icon: Info, color: '#58a6ff' },
  warning: { bg: '#1f1c10', border: '#d29922', icon: AlertTriangle, color: '#d29922' },
  high: { bg: '#22120c', border: '#d73a4a', icon: AlertCircle, color: '#f85149' },
  critical: { bg: '#2d0a0a', border: '#f85149', icon: AlertCircle, color: '#f85149' },
  fatal: { bg: '#3d0a0a', border: '#ff0000', icon: AlertCircle, color: '#ff5555' },
}

interface AlertBannerProps {
  alert: CdsAlert
  onDismiss?: (id: string) => void
  onAcknowledge?: (id: string) => void
  expanded?: boolean
  onToggleExpand?: (id: string) => void
}

export default function AlertBanner({ alert, onDismiss, onAcknowledge, expanded, onToggleExpand }: AlertBannerProps) {
  const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info
  const Icon = style.icon
  return (
    <div style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: onToggleExpand ? 'pointer' : 'default' }}
        onClick={() => onToggleExpand?.(alert.id)}
      >
        <Icon size={18} style={{ color: style.color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: style.color }}>{alert.title}</span>
            <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: style.color + '20', color: style.color }}>{alert.category}</span>
            {alert.blocking && <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: '#f8514920', color: '#f85149' }}>BLOCKING</span>}
          </div>
          <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.4 }}>{alert.message}</div>
        </div>
        {onToggleExpand && (
          <ChevronDown size={16} style={{ color: '#6e7681', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
        )}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {onAcknowledge && alert.status === 'active' && (
            <button onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id) }}
              style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #30363d', background: '#21262d', color: '#8b949e', cursor: 'pointer', fontSize: 11 }}>确认</button>
          )}
          {onDismiss && (
            <button onClick={(e) => { e.stopPropagation(); onDismiss(alert.id) }}
              style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: 'transparent', color: '#6e7681', cursor: 'pointer' }}><X size={14} /></button>
          )}
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '0 14px 12px 48px', borderTop: `1px solid ${style.border}20`, marginTop: 4 }}>
          {alert.recommendations && alert.recommendations.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#6e7681', fontWeight: 600, marginBottom: 4 }}>推荐操作</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>
                {alert.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {alert.evidence && alert.evidence.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#6e7681', fontWeight: 600, marginBottom: 4 }}>证据</div>
              {alert.evidence.map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: '#8b949e', display: 'flex', gap: 8, marginBottom: 2 }}>
                  <span style={{ color: '#6e7681' }}>{e.label}:</span> {String(e.value)}{e.unit ? ' ' + e.unit : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
