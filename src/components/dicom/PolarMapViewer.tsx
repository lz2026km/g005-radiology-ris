import React from 'react'
import { AHA_17_SEGMENTS, PolarMap } from '../../services/cardiac/function/PolarMap'
import type { PolarMapResult, AhaSegment } from '../../types/imaging/postprocess'

export interface PolarMapViewerProps {
  result: PolarMapResult | null
  height?: number
  showLabels?: boolean
  onSegmentClick?: (segment: AhaSegment) => void
}

export default function PolarMapViewer({
  result,
  height = 360,
  showLabels = true,
  onSegmentClick,
}: PolarMapViewerProps) {
  const polar = React.useMemo(() => new PolarMap(), [])
  const size = Math.max(280, height - 60)
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 20

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 8, height, color: '#cbd5e1', fontSize: 11 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontWeight: 700, color: '#fbbf24' }}>17-段 AHA 极坐标图 (Bull's-eye)</span>
        {result && (
          <span>
            Global WMS <span style={{ color: '#fbbf24', fontWeight: 600 }}>{result.globalScore.toFixed(2)}</span> ·
            LAD <span style={{ color: '#ef4444' }}>{result.coronaryTerritoryScore.LAD.toFixed(2)}</span> ·
            LCX <span style={{ color: '#22c55e' }}>{result.coronaryTerritoryScore.LCX.toFixed(2)}</span> ·
            RCA <span style={{ color: '#3b82f6' }}>{result.coronaryTerritoryScore.RCA.toFixed(2)}</span>
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {[1, 0.66, 0.33, 0.05].map((r, i) => (
            <circle key={i} cx={cx} cy={cy} r={radius * r} fill="none" stroke="#334155" strokeWidth="0.8" />
          ))}
          {[0, 1, 2, 3, 4, 5].map(i => {
            const a = (i / 6) * Math.PI
            return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * radius} y2={cy + Math.sin(a) * radius} stroke="#334155" strokeWidth="0.6" />
          })}
          {AHA_17_SEGMENTS.map(seg => {
            const centroid = polar.segmentCentroid(seg.number, radius)
            const segResult = result?.segments.find(s => s.segment === seg.number)
            const score = segResult?.score ?? 1
            const color = polar.colorFor(score)
            return (
              <g key={seg.number} onClick={() => onSegmentClick?.(seg.number)} style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}>
                <circle
                  cx={cx + centroid.x}
                  cy={cy + centroid.y}
                  r={centroid.radius}
                  fill={color}
                  fillOpacity={0.7}
                  stroke="#0a0a0a"
                  strokeWidth="1"
                />
                {showLabels && (
                  <text x={cx + centroid.x} y={cy + centroid.y + 4} textAnchor="middle" fontSize="10" fill="#0a0a0a" fontWeight="700">
                    {seg.number}
                  </text>
                )}
              </g>
            )
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fill="#64748b">Apex</text>
        </svg>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: 4 }}>分段评分</div>
          <table style={{ width: '100%', fontSize: 10, color: '#cbd5e1' }}>
            <thead>
              <tr style={{ color: '#64748b', textAlign: 'left' }}>
                <th>#</th>
                <th>节段</th>
                <th>冠脉</th>
                <th>评分</th>
                <th>灌注%</th>
              </tr>
            </thead>
            <tbody>
              {AHA_17_SEGMENTS.map(def => {
                const seg = result?.segments.find(s => s.segment === def.number)
                return (
                  <tr key={def.number} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ color: '#fbbf24' }}>{def.number}</td>
                    <td>{def.name}</td>
                    <td style={{ color: territoryColor(def.territory) }}>{def.territory}</td>
                    <td style={{ color: polar.colorFor(seg?.score ?? 1), fontWeight: 700 }}>{(seg?.score ?? 1).toFixed(1)}</td>
                    <td style={{ color: '#cbd5e1' }}>{(seg?.perfusionPercent ?? 0).toFixed(1)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function territoryColor(t: 'LAD' | 'LCX' | 'RCA'): string {
  return t === 'LAD' ? '#ef4444' : t === 'LCX' ? '#22c55e' : '#3b82f6'
}