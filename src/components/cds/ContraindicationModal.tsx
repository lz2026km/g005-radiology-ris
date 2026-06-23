import { X, AlertTriangle, Shield, FileText, ExternalLink } from 'lucide-react'
import type { ContraindicationRule } from '../../types/cds'

interface ContraindicationModalProps {
  rule: ContraindicationRule
  onClose: () => void
  onOverride?: (reason: string) => void
}

export default function ContraindicationModal({ rule, onClose, onOverride }: ContraindicationModalProps) {
  const typeColor = rule.type === 'absolute' ? '#f85149'
    : rule.type === 'relative' ? '#d73a4a'
    : rule.type === 'conditional' ? '#d29922'
    : '#58a6ff'

  const typeLabel = rule.type === 'absolute' ? '绝对禁忌' : rule.type === 'relative' ? '相对禁忌' : rule.type === 'conditional' ? '条件限制' : '注意事项'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}>
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, width: 540, maxHeight: '80vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #30363d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={20} color={typeColor} />
            <div>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#f0f6fc' }}>{rule.name}</span>
              <span style={{ fontSize: 12, marginLeft: 8, padding: '2px 8px', borderRadius: 4, background: typeColor + '20', color: typeColor }}>{typeLabel}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', color: '#6e7681', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 16, lineHeight: 1.5 }}>{rule.description}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <InfoBox label="对比剂" value={rule.agent} />
            <InfoBox label="严重度" value={rule.severity} />
            <InfoBox label="证据等级" value={rule.evidenceLevel} />
            <InfoBox label="适用人群" value={rule.population} />
            {rule.modality && <InfoBox label="设备类型" value={rule.modality} />}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 600, marginBottom: 6 }}>建议操作</div>
            <div style={{ padding: 10, background: '#0d1117', borderRadius: 8, fontSize: 13, color: '#8b949e', lineHeight: 1.5 }}>{rule.action}</div>
          </div>
          {rule.alternatives && rule.alternatives.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 600, marginBottom: 6 }}>替代方案</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {rule.alternatives.map((alt, i) => (
                  <span key={i} style={{ padding: '4px 10px', background: '#1e40af20', border: '1px solid #1e40af40', borderRadius: 4, fontSize: 12, color: '#58a6ff' }}>
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 600, marginBottom: 6 }}>条件规则</div>
            {rule.conditions.map((c, i) => (
              <div key={i} style={{ padding: '6px 10px', background: '#0d1117', borderRadius: 4, marginBottom: 4, fontSize: 12, color: '#8b949e', display: 'flex', gap: 8 }}>
                <FileText size={12} color="#6e7681" />
                <span>{c.field} {c.operator} {String(c.value)}{c.unit ? ' ' + c.unit : ''}</span>
              </div>
            ))}
          </div>
          {rule.references && rule.references.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 600, marginBottom: 6 }}>参考文献</div>
              {rule.references.map((ref, i) => (
                <div key={i} style={{ fontSize: 12, color: '#58a6ff', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ExternalLink size={12} /> {ref}
                </div>
              ))}
            </div>
          )}
        </div>
        {onOverride && (
          <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderTop: '1px solid #30363d', justifyContent: 'flex-end' }}>
            <button onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #30363d', background: '#21262d', color: '#8b949e', cursor: 'pointer', fontSize: 13 }}>取消</button>
            <button onClick={() => onOverride('')}
              style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #d29922', background: 'transparent', color: '#d29922', cursor: 'pointer', fontSize: 13 }}>
              医生覆盖
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 10, background: '#0d1117', borderRadius: 8 }}>
      <div style={{ fontSize: 12, color: '#6e7681', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#f0f6fc' }}>{value}</div>
    </div>
  )
}
