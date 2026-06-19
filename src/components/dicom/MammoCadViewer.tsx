import React, { useState } from 'react'
import type { CadResult, CadFinding } from '../../types/imaging/postprocess'

export interface MammoCadViewerProps {
  result: CadResult | null
  height?: number
  onFindingClick?: (finding: CadFinding) => void
}

export default function MammoCadViewer({ result, height = 380, onFindingClick }: MammoCadViewerProps) {
  const [filterType, setFilterType] = useState<'all' | CadFinding['type']>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const findings = result?.findings.filter(f => filterType === 'all' || f.type === filterType) ?? []

  if (!result) {
    return (
      <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 12, height, color: '#64748b', fontSize: 11 }}>
        MammoCadEngine.detect() 待调用…
      </div>
    )
  }

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 8, height, color: '#cbd5e1', fontSize: 11 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#fbbf24' }}>乳腺 CAD · {result.view}</span>
        <span style={{ color: '#64748b' }}>腺体密度 {result.breastDensity}</span>
        <span style={{ color: '#64748b' }}>综合评分 {(result.overallScore * 100).toFixed(0)}%</span>
        <div style={{ flex: 1 }} />
        {(['all', 'mass', 'calcification', 'asymmetry', 'architectural-distortion'] as const).map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={btnStyle(filterType === t)}>
            {t === 'all' ? '全部' : t === 'mass' ? '肿块' : t === 'calcification' ? '钙化' : t === 'asymmetry' ? '不对称' : '结构扭曲'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, height: height - 60 }}>
        <div style={{ flex: 2, background: '#000', borderRadius: 4, position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 512 512">
            <rect width="512" height="512" fill="#1a1a1a" />
            <ellipse cx="256" cy="256" rx="240" ry="220" fill="rgba(0,0,0,0.4)" stroke="#64748b" strokeWidth="1" />
            {findings.map(f => (
              <g
                key={f.id}
                style={{ cursor: 'pointer' }}
                onClick={() => { setSelectedId(f.id); onFindingClick?.(f) }}
              >
                <rect
                  x={f.boundingBox.x}
                  y={f.boundingBox.y}
                  width={f.boundingBox.width}
                  height={f.boundingBox.height}
                  fill={colorForType(f.type)}
                  fillOpacity={0.18}
                  stroke={colorForType(f.type)}
                  strokeWidth={selectedId === f.id ? 3 : 1.5}
                />
                <text x={f.boundingBox.x + 4} y={f.boundingBox.y + 14} fontSize="11" fill="#0a0a0a" fontWeight="700">
                  {f.id.toUpperCase()} {(f.confidence * 100).toFixed(0)}%
                </text>
              </g>
            ))}
          </svg>
          <div style={{ position: 'absolute', top: 6, left: 8, padding: '2px 6px', background: 'rgba(0,0,0,0.7)', borderRadius: 3, color: '#fbbf24', fontSize: 10 }}>
            {result.view} · {result.findings.length} 发现
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: 4 }}>发现列表 ({findings.length})</div>
          {findings.length === 0 && <div style={{ color: '#64748b' }}>无匹配</div>}
          {findings.map(f => (
            <button
              key={f.id}
              onClick={() => { setSelectedId(f.id); onFindingClick?.(f) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: selectedId === f.id ? '#1e3a5f' : '#1a1a1a',
                border: '1px solid #333', borderRadius: 4,
                padding: '4px 6px', marginBottom: 4,
                color: '#cbd5e1', fontSize: 10, cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colorForType(f.type), fontWeight: 600 }}>{labelForType(f.type)}</span>
                <span style={{ color: '#fbbf24' }}>{(f.confidence * 100).toFixed(0)}%</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 9 }}>
                {f.location.side}-{f.location.view} · {f.location.quadrant}
              </div>
              <div style={{ color: '#22c55e', fontSize: 9 }}>{f.biRadsSuggestion}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function colorForType(t: CadFinding['type']): string {
  switch (t) {
    case 'mass': return '#ef4444'
    case 'calcification': return '#fbbf24'
    case 'asymmetry': return '#3b82f6'
    case 'architectural-distortion': return '#a855f7'
  }
}

function labelForType(t: CadFinding['type']): string {
  switch (t) {
    case 'mass': return '肿块'
    case 'calcification': return '钙化'
    case 'asymmetry': return '不对称'
    case 'architectural-distortion': return '结构扭曲'
  }
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? '#1e40af' : '#1a1a1a',
    border: '1px solid', borderColor: active ? '#3b82f6' : '#333',
    borderRadius: 4, padding: '2px 8px', color: '#cbd5e1', fontSize: 10, cursor: 'pointer',
  }
}