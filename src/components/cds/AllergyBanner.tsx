import { AlertTriangle, Info, X, Syringe } from 'lucide-react'
import type { AllergyCheckResult } from '../../types/cds'
import type { CdsAlertSeverity } from '../../types/cds'

const RISK_COLORS: Record<string, { bg: string; border: string; color: string; label: string }> = {
  absolute: { bg: '#2d0a0a', border: '#f85149', color: '#f85149', label: '绝对禁忌' },
  high: { bg: '#22120c', border: '#d73a4a', color: '#d73a4a', label: '高风险' },
  moderate: { bg: '#1f1c10', border: '#d29922', color: '#d29922', label: '中风险' },
  low: { bg: '#0d1117', border: '#30363d', color: '#8b949e', label: '低风险' },
  none: { bg: '#0d1117', border: '#30363d', color: '#22c55e', label: '无风险' },
}

interface AllergyBannerProps {
  result: AllergyCheckResult
  onClose?: () => void
}

export default function AllergyBanner({ result, onClose }: AllergyBannerProps) {
  const style = RISK_COLORS[result.riskLevel] ?? RISK_COLORS.none
  const isAlert = result.riskLevel === 'high' || result.riskLevel === 'absolute'

  return (
    <div style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px' }}>
        {isAlert ? <AlertTriangle size={18} style={{ color: style.color, flexShrink: 0, marginTop: 2 }} />
          : <Info size={18} style={{ color: style.color, flexShrink: 0, marginTop: 2 }} />
        }
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Syringe size={14} color={style.color} />
            <span style={{ fontSize: 14, fontWeight: 600, color: style.color }}>
              过敏检查: {result.agent}
            </span>
            <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: style.color + '20', color: style.color }}>{style.label}</span>
          </div>
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 6 }}>{result.recommendation}</div>
          {result.crossReactiveAgents && result.crossReactiveAgents.length > 0 && (
            <div style={{ fontSize: 11, color: '#6e7681', marginBottom: 4 }}>
              交叉反应: {result.crossReactiveAgents.join(', ')}
            </div>
          )}
          {result.premedication && result.premedication.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 12, color: '#d29922', fontWeight: 600, marginBottom: 2 }}>预处理方案</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>
                {result.premedication.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          {result.alternatives && result.alternatives.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {result.alternatives.map((alt, i) => (
                <span key={i} style={{ padding: '2px 8px', background: '#1e40af20', borderRadius: 4, fontSize: 11, color: '#58a6ff' }}>{alt}</span>
              ))}
            </div>
          )}
          {result.requiresSkinTest && (
            <div style={{ marginTop: 6, fontSize: 11, color: '#d29922', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} /> 建议皮试
            </div>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} style={{ padding: 4, borderRadius: 4, border: 'none', background: 'transparent', color: '#6e7681', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export function allergySeverityToCds(s: string): CdsAlertSeverity {
  if (s === 'mild') return 'notice'
  if (s === 'moderate') return 'warning'
  if (s === 'severe') return 'high'
  if (s === 'life_threatening') return 'fatal'
  return 'info'
}
