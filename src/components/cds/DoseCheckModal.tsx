import { X, Activity, AlertTriangle, Info } from 'lucide-react'
import type { DoseAlertLevel, DoseCheckResult, DoseThreshold } from '../../types/cds'

interface DoseCheckModalProps {
  result: DoseCheckResult
  thresholds?: DoseThreshold[]
  onClose: () => void
  onConfirm?: () => void
}

const LEVEL_COLORS: Record<DoseAlertLevel, string> = {
  within_limit: '#22c55e',
  approaching: '#d29922',
  exceeded: '#f85149',
  significantly_exceeded: '#ff0000',
  achievable_breakthrough: '#58a6ff',
}

const LEVEL_LABELS: Record<DoseAlertLevel, string> = {
  within_limit: '剂量达标',
  approaching: '接近限值',
  exceeded: '剂量超限',
  significantly_exceeded: '严重超限',
  achievable_breakthrough: '突破ALARA',
}

export default function DoseCheckModal({ result, thresholds, onClose, onConfirm }: DoseCheckModalProps) {
  const color = LEVEL_COLORS[result.alertLevel]
  const isSevere = result.alertLevel === 'exceeded' || result.alertLevel === 'significantly_exceeded'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}>
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, width: 520, maxHeight: '80vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #30363d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isSevere ? <AlertTriangle size={20} color={color} /> : <Activity size={20} color={color} />}
            <span style={{ fontSize: 16, fontWeight: 600, color }}>剂量检查 - {LEVEL_LABELS[result.alertLevel]}</span>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', color: '#6e7681', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 10, background: '#0d1117', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#6e7681', marginBottom: 2 }}>CTDIvol</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: result.ctdiVol && result.ctdiVolLimit && result.ctdiVol > result.ctdiVolLimit ? '#f85149' : '#f0f6fc' }}>
                {result.ctdiVol ?? '-'} <span style={{ fontSize: 12, color: '#6e7681' }}>mGy</span>
              </div>
              {result.ctdiVolLimit && <div style={{ fontSize: 12, color: '#6e7681' }}>限值: {result.ctdiVolLimit} mGy ({result.ctdiVolPct}%)</div>}
            </div>
            <div style={{ padding: 10, background: '#0d1117', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#6e7681', marginBottom: 2 }}>DLP</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: result.dlp && result.dlpLimit && result.dlp > result.dlpLimit ? '#f85149' : '#f0f6fc' }}>
                {result.dlp ?? '-'} <span style={{ fontSize: 12, color: '#6e7681' }}>mGy·cm</span>
              </div>
              {result.dlpLimit && <div style={{ fontSize: 12, color: '#6e7681' }}>限值: {result.dlpLimit} mGy·cm ({result.dlpPct}%)</div>}
            </div>
            <div style={{ padding: 10, background: '#0d1117', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#6e7681', marginBottom: 2 }}>SSDE</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{result.ssde ?? '-'} <span style={{ fontSize: 12, color: '#6e7681' }}>mGy</span></div>
            </div>
            <div style={{ padding: 10, background: '#0d1117', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#6e7681', marginBottom: 2 }}>有效剂量</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{result.effectiveDose ?? '-'} <span style={{ fontSize: 12, color: '#6e7681' }}>mSv</span></div>
            </div>
          </div>
          {result.cumulative && (
            <div style={{ padding: 10, background: '#0d1117', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6e7681', marginBottom: 4 }}>累积剂量 (30天)</div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                <span>CTDI: {result.cumulative.ctdiAccumulated} mGy</span>
                <span>DLP: {result.cumulative.dlpAccumulated} mGy·cm</span>
                <span>检查: {result.cumulative.exams} 次</span>
              </div>
            </div>
          )}
          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 600, marginBottom: 6 }}>推荐操作</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#8b949e', lineHeight: 1.8 }}>
                {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {thresholds && thresholds.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: '#6e7681' }}>
              参考来源: {thresholds[0]!.source} v{thresholds[0]!.version}
            </div>
          )}
        </div>
        {result.requiresAcknowledgement && (
          <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderTop: '1px solid #30363d', justifyContent: 'flex-end' }}>
            <button onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #30363d', background: '#21262d', color: '#8b949e', cursor: 'pointer', fontSize: 13 }}>取消</button>
            {onConfirm && (
              <button onClick={onConfirm}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: isSevere ? '#d73a4a' : '#1e40af', color: '#fff', cursor: 'pointer', fontSize: 13 }}>
                确认继续
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
