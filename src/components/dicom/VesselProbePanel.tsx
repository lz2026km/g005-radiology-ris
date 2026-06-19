import React, { useState } from 'react'

export interface VesselProbe {
  vesselId: string
  vesselName: string
  positionMm: number
  perpendicularAngleDeg: number
  radiusSamplesMm: number[]
  diameterMm: number
  stenosisPercent: number
  wallThicknessMm: number
  contrastAttenuation: number
}

export interface VesselProbePanelProps {
  probes: VesselProbe[]
  height?: number
  onProbeUpdate?: (probe: VesselProbe) => void
  onProbeDelete?: (vesselId: string, positionMm: number) => void
  onAddProbe?: () => void
}

export default function VesselProbePanel({
  probes,
  height = 300,
  onProbeUpdate,
  onProbeDelete,
  onAddProbe,
}: VesselProbePanelProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const probe = probes[selectedIdx]

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 8, height, color: '#cbd5e1', fontSize: 11 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontWeight: 700, color: '#fbbf24' }}>垂直探测 · Probe</span>
        <span style={{ color: '#64748b' }}>{probes.length} 探针</span>
        <div style={{ flex: 1 }} />
        {onAddProbe && (
          <button onClick={onAddProbe} style={btnStyle('#059669')}>+ 添加探针</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, height: height - 50 }}>
        <div style={{ width: 160, overflowY: 'auto' }}>
          {probes.map((p, i) => (
            <button
              key={`${p.vesselId}-${p.positionMm}`}
              onClick={() => setSelectedIdx(i)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: i === selectedIdx ? '#1e3a5f' : '#1a1a1a',
                border: '1px solid #333', borderRadius: 4,
                padding: '4px 6px', marginBottom: 4,
                color: '#cbd5e1', fontSize: 10, cursor: 'pointer',
              }}
            >
              <div style={{ color: '#fbbf24', fontWeight: 600 }}>{p.vesselName}</div>
              <div style={{ color: '#64748b' }}>@ {p.positionMm.toFixed(1)} mm</div>
            </button>
          ))}
        </div>

        {probe && (
          <div style={{ flex: 1, background: '#1a1a1a', borderRadius: 4, padding: 8 }}>
            <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: 6 }}>
              {probe.vesselName} @ {probe.positionMm.toFixed(1)} mm
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              <Metric label="直径" value={`${probe.diameterMm.toFixed(2)} mm`} />
              <Metric label="狭窄 %" value={`${probe.stenosisPercent.toFixed(1)}%`} color={stenosisColor(probe.stenosisPercent)} />
              <Metric label="壁厚" value={`${probe.wallThicknessMm.toFixed(2)} mm`} />
              <Metric label="对比剂衰减" value={`${probe.contrastAttenuation.toFixed(0)} HU`} />
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                角度
                <input type="range" min="-180" max="180" value={probe.perpendicularAngleDeg}
                  onChange={e => onProbeUpdate?.({ ...probe, perpendicularAngleDeg: parseInt(e.target.value) })}
                  style={{ flex: 1 }} />
                <span>{probe.perpendicularAngleDeg}°</span>
              </label>
            </div>

            <RadialChart samples={probe.radiusSamplesMm} angleDeg={probe.perpendicularAngleDeg} />

            <button onClick={() => onProbeDelete?.(probe.vesselId, probe.positionMm)} style={btnStyle('#7f1d1d')}>删除探针</button>
          </div>
        )}
      </div>
    </div>
  )
}

function RadialChart({ samples, angleDeg }: { samples: number[]; angleDeg: number }) {
  const size = 160
  const cx = size / 2, cy = size / 2
  const r = size / 2 - 14
  const max = Math.max(...samples, 0.1)
  const points = samples.map((v, i) => {
    const a = ((i / samples.length) * Math.PI * 2) - Math.PI / 2
    const radius = (v / max) * r
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius }
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '8px auto' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" />
      <circle cx={cx} cy={cy} r={r / 2} fill="none" stroke="#1f2937" />
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#1f2937" />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#1f2937" />
      <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(251,191,36,0.35)" stroke="#fbbf24" strokeWidth="1.4" />
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos((angleDeg * Math.PI) / 180 - Math.PI / 2) * r}
        y2={cy + Math.sin((angleDeg * Math.PI) / 180 - Math.PI / 2) * r}
        stroke="#22c55e"
        strokeWidth="2"
      />
      <text x={cx} y={size - 4} textAnchor="middle" fontSize="9" fill="#64748b">径向测量 (mm)</text>
    </svg>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: 4, padding: '4px 6px' }}>
      <div style={{ fontSize: 9, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: color ?? '#fbbf24', fontFamily: 'monospace' }}>{value}</div>
    </div>
  )
}

function stenosisColor(p: number): string {
  if (p < 25) return '#22c55e'
  if (p < 50) return '#fbbf24'
  if (p < 70) return '#f97316'
  return '#ef4444'
}

function btnStyle(bg: string): React.CSSProperties {
  return { background: bg, border: 'none', color: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 10, fontWeight: 600, marginTop: 4 }
}