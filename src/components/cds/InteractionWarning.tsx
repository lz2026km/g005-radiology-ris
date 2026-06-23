import { Pill, AlertTriangle, X, Info } from 'lucide-react'
import type { DrugInteraction, InteractionSeverity } from '../../types/cds'

interface InteractionWarningProps {
  interaction: DrugInteraction
  onClose?: () => void
}

const SEVERITY_STYLES: Record<InteractionSeverity, { bg: string; border: string; color: string; label: string }> = {
  contraindicated: { bg: '#2d0a0a', border: '#f85149', color: '#f85149', label: '禁忌联用' },
  major: { bg: '#22120c', border: '#d73a4a', color: '#d73a4a', label: '严重' },
  moderate: { bg: '#1f1c10', border: '#d29922', color: '#d29922', label: '中等' },
  minor: { bg: '#0d1117', border: '#30363d', color: '#8b949e', label: '轻微' },
}

export default function InteractionWarning({ interaction, onClose }: InteractionWarningProps) {
  const style = SEVERITY_STYLES[interaction.severity]
  return (
    <div style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px' }}>
        {interaction.severity === 'contraindicated' || interaction.severity === 'major'
          ? <AlertTriangle size={18} style={{ color: style.color, flexShrink: 0, marginTop: 2 }} />
          : <Info size={18} style={{ color: style.color, flexShrink: 0, marginTop: 2 }} />
        }
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Pill size={14} color={style.color} />
            <span style={{ fontSize: 14, fontWeight: 600, color: style.color }}>
              {interaction.drugA} + {interaction.drugB}
            </span>
            <span style={{ fontSize: 12, padding: '1px 6px', borderRadius: 4, background: style.color + '20', color: style.color }}>{style.label}</span>
          </div>
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 6, lineHeight: 1.4 }}>{interaction.clinicalEffect}</div>
          <div style={{ fontSize: 12, color: '#6e7681', marginBottom: 6 }}>机制: {interaction.mechanism}</div>
          <div style={{ fontSize: 12, color: style.color, lineHeight: 1.4 }}>推荐: {interaction.recommendation}</div>
          {interaction.monitoring && (
            <div style={{ fontSize: 12, color: '#58a6ff', marginTop: 4 }}>监测: {interaction.monitoring}</div>
          )}
          {interaction.management && (
            <div style={{ fontSize: 12, color: '#d29922', marginTop: 2 }}>处理: {interaction.management}</div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 12, color: '#6e7681' }}>
            <span>证据: {interaction.documentation}</span>
            <span>等级: {interaction.evidenceLevel}</span>
            {interaction.onsetTime && <span>起效: {interaction.onsetTime}</span>}
          </div>
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
