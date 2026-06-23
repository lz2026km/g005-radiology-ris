// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 形变场可视化
// 用颜色编码 (HSV) 显示控制点位移大小,支持轴向切片切换
// ============================================================

import React, { useState, useMemo, useCallback } from 'react'
import type { DeformableField } from '../../types/fusion'
import { fieldMaxDisplacement, fieldSmoothness } from '../../services/fusion/metrics/RegistrationMetrics'
import { createMockDeformableField } from '../../data/fusionMock'

export interface DeformableFieldViewProps {
  field?: DeformableField
  height?: number
  showLegend?: boolean
}

export const DeformableFieldView: React.FC<DeformableFieldViewProps> = ({
  field: fieldProp,
  height = 360,
  showLegend = true,
}) => {
  const field = useMemo(() => fieldProp ?? createMockDeformableField(), [fieldProp])
  const [sliceIndex, setSliceIndex] = useState(Math.floor(field.gridSize.slices / 2))
  const [viewMode, setViewMode] = useState<'magnitude' | 'component-x' | 'component-y' | 'component-z'>('magnitude')

  const maxDisp = useMemo(() => fieldMaxDisplacement(field), [field])
  const smooth = useMemo(() => fieldSmoothness(field), [field])

  const slice = field.displacements[Math.max(0, Math.min(sliceIndex, field.gridSize.slices - 1))]
  const rows = field.gridSize.rows
  const cols = field.gridSize.cols

  const handleMode = useCallback((m: typeof viewMode) => setViewMode(m), [])
  const handleSlice = useCallback((delta: number) => {
    setSliceIndex((i) => Math.max(0, Math.min(field.gridSize.slices - 1, i + delta)))
  }, [field.gridSize.slices])

  return (
    <div
      data-testid="deformable-field-view"
      style={{ background: '#0a0a0a', borderRadius: 8, padding: 10, height, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>形变场 (B-spline)</span>
        <span style={{ fontSize: 12, color: '#64748b' }}>网格 {rows}×{cols}×{field.gridSize.slices} @ {field.spacing}mm</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#94a3b8' }}>最大位移 {maxDisp.toFixed(2)} mm · 平滑 {smooth.toFixed(3)}</span>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {(['magnitude', 'component-x', 'component-y', 'component-z'] as const).map((m) => (
          <button
            key={m}
            data-testid={`field-mode-${m}`}
            onClick={() => handleMode(m)}
            style={chipStyle(viewMode === m)}
          >
            {m === 'magnitude' ? '幅度' : m === 'component-x' ? 'X' : m === 'component-y' ? 'Y' : 'Z'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, position: 'relative', background: '#000', borderRadius: 4, overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${cols * 30} ${rows * 30}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            {slice?.map((row, r) =>
              row.map((d, c) => {
                let value = 0
                if (viewMode === 'magnitude') {
                  value = Math.hypot(d[0]!, d[1]!, d[2]!) / Math.max(maxDisp, 1e-3)
                } else if (viewMode === 'component-x') {
                  value = (d[0]! + maxDisp) / (2 * maxDisp)
                } else if (viewMode === 'component-y') {
                  value = (d[1]! + maxDisp) / (2 * maxDisp)
                } else {
                  value = (d[2]! + maxDisp) / (2 * maxDisp)
                }
                const v = Math.max(0, Math.min(1, value))
                const color = valueToColor(v, viewMode)
                return (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={c * 30}
                      y={r * 30}
                      width={30}
                      height={30}
                      fill={color}
                      opacity={0.85}
                    />
                    <text
                      x={c * 30 + 15}
                      y={r * 30 + 18}
                      fontSize="9"
                      textAnchor="middle"
                      fill={v > 0.5 ? '#000' : '#fff'}
                    >
                      {viewMode === 'magnitude' ? Math.hypot(d[0]!, d[1]!, d[2]!).toFixed(1) : d[['component-x', 'component-y', 'component-z'].indexOf(viewMode)]!.toFixed(1)}
                    </text>
                  </g>
                )
              }),
            )}
          </svg>
          <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 12, color: '#94a3b8' }}>
            切片 #{sliceIndex + 1} / {field.gridSize.slices}
          </div>
        </div>

        {showLegend && (
          <div style={{ width: 80, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
            <div style={{ color: '#94a3b8' }}>色阶</div>
            <div style={{ flex: 1, borderRadius: 4, background: 'linear-gradient(to top, #1e3a8a, #22d3ee, #fbbf24, #ef4444)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>0</span>
              <span>{(maxDisp / 2).toFixed(1)}</span>
              <span>{maxDisp.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          data-testid="field-prev"
          onClick={() => handleSlice(-1)}
          disabled={sliceIndex === 0}
          style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
        >
          ◀ 上一片
        </button>
        <input
          type="range"
          min={0}
          max={field.gridSize.slices - 1}
          value={sliceIndex}
          onChange={(e) => setSliceIndex(parseInt(e.target.value, 10))}
          style={{ flex: 1 }}
        />
        <button
          data-testid="field-next"
          onClick={() => handleSlice(1)}
          disabled={sliceIndex === field.gridSize.slices - 1}
          style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
        >
          下一片 ▶
        </button>
      </div>
    </div>
  )
}

function valueToColor(v: number, mode: 'magnitude' | 'component-x' | 'component-y' | 'component-z'): string {
  if (mode === 'component-x') {
    if (v < 0.5) {
      const f = v * 2
      return `rgb(${Math.round(30 * (1 - f))}, ${Math.round(58 + 100 * f)}, ${Math.round(138 + 50 * f)})`
    }
    const f = (v - 0.5) * 2
    return `rgb(${Math.round(34 + 221 * f)}, ${Math.round(211 - 50 * f)}, ${Math.round(238 - 100 * f)})`
  }
  if (v < 0.25) {
    return `rgb(30, 58, 138)`
  }
  if (v < 0.5) {
    return `rgb(34, 211, 238)`
  }
  if (v < 0.75) {
    return `rgb(251, 191, 36)`
  }
  return `rgb(239, 68, 68)`
}

const chipStyle = (active: boolean): React.CSSProperties => ({
  background: active ? '#1e40af' : 'transparent',
  border: '1px solid',
  borderColor: active ? '#3b82f6' : '#334155',
  color: active ? '#fff' : '#94a3b8',
  borderRadius: 4,
  padding: '3px 10px',
  fontSize: 12,
  cursor: 'pointer',
})

export default DeformableFieldView
