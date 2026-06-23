import React, { useMemo, useState } from 'react'

export interface DensityRoi {
  id: string
  label: string
  meanHU: number
  minHU: number
  maxHU: number
  stdDevHU: number
  pixelCount: number
  areaMm2: number
  histogram: { bin: number; count: number }[]
}

export interface DensityRoiPanelProps {
  rois: DensityRoi[]
  height?: number
  onRoiDelete?: (id: string) => void
  onExportCsv?: () => void
}

export default function DensityRoiPanel({ rois, height = 300, onRoiDelete, onExportCsv }: DensityRoiPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(rois[0]?.id ?? null)
  const selected = useMemo(() => rois.find(r => r.id === selectedId) ?? rois[0], [rois, selectedId])

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 8, height, color: '#cbd5e1', fontSize: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontWeight: 700, color: '#fbbf24' }}>HU 直方图 · Density ROI</span>
        <span style={{ color: '#64748b' }}>{rois.length} ROI</span>
        <div style={{ flex: 1 }} />
        {onExportCsv && (
          <button onClick={onExportCsv} style={btnStyle('#1e40af')}>导出 CSV</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, height: height - 50 }}>
        <div style={{ width: 200, overflowY: 'auto' }}>
          {rois.length === 0 && <div style={{ color: '#64748b' }}>画一个 ROI 来查看 HU 分布</div>}
          {rois.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: r.id === selectedId ? '#1e3a5f' : '#1a1a1a',
                border: '1px solid #333', borderRadius: 4,
                padding: '4px 6px', marginBottom: 4,
                color: '#cbd5e1', fontSize: 12, cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{r.label}</span>
                {onRoiDelete && <span onClick={(e) => { e.stopPropagation(); onRoiDelete(r.id) }} style={{ color: '#ef4444' }}>×</span>}
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>
                {r.meanHU.toFixed(0)} HU · {r.stdDevHU.toFixed(1)} σ · {r.pixelCount} px
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div style={{ flex: 1, background: '#1a1a1a', borderRadius: 4, padding: 8 }}>
            <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: 4 }}>{selected.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
              <Metric label="均值" value={`${selected.meanHU.toFixed(1)}`} unit="HU" />
              <Metric label="最小" value={`${selected.minHU}`} unit="HU" />
              <Metric label="最大" value={`${selected.maxHU}`} unit="HU" />
              <Metric label="标准差" value={`${selected.stdDevHU.toFixed(2)}`} unit="HU" />
              <Metric label="像素" value={selected.pixelCount.toLocaleString()} />
              <Metric label="面积" value={`${selected.areaMm2.toFixed(2)}`} unit="mm²" />
            </div>
            <HistogramChart histogram={selected.histogram} />
          </div>
        )}
      </div>
    </div>
  )
}

function HistogramChart({ histogram }: { histogram: { bin: number; count: number }[] }) {
  const max = Math.max(...histogram.map(b => b.count), 1)
  const w = 100 / histogram.length
  return (
    <svg viewBox={`0 0 ${histogram.length * 4} 100`} preserveAspectRatio="none" width="100%" height="120" style={{ background: '#000', borderRadius: 4 }}>
      <line x1="0" y1="0" x2="0" y2="100" stroke="#1f2937" />
      <line x1="0" y1="100" x2={histogram.length * 4} y2="100" stroke="#1f2937" />
      {histogram.map((b, i) => (
        <rect
          key={i}
          x={i * 4 + 0.5}
          y={100 - (b.count / max) * 96}
          width={3}
          height={(b.count / max) * 96}
          fill={binColor(b.bin)}
          opacity={0.85}
        />
      ))}
      <line x1={(0 - histogram[0]!.bin) * 4} y1="0" x2={(0 - histogram[0]!.bin) * 4} y2="100" stroke="#22c55e" strokeWidth="0.6" strokeDasharray="2,2" />
      <text x="4" y="12" fontSize="8" fill="#22c55e">HU=0</text>
    </svg>
  )
}

function binColor(bin: number): string {
  if (bin < -100) return '#3b82f6'
  if (bin < 0) return '#06b6d4'
  if (bin < 50) return '#22c55e'
  if (bin < 200) return '#fbbf24'
  return '#ef4444'
}

function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: 4, padding: '4px 6px' }}>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
        {value}<span style={{ fontSize: 12, color: '#64748b', marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return { background: bg, border: 'none', color: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }
}