import React, { useEffect, useRef, useState } from 'react'
import type { CprPath, CprProjectionMode } from '../../types/imaging/postprocess'

export interface CprViewportProps {
  cprPath: CprPath | null
  height?: number
  showProbe?: boolean
  showMeasurements?: boolean
  onProbePositionChange?: (positionMm: number) => void
}

const MODE_LABEL: Record<CprProjectionMode, string> = {
  straightened: '拉直',
  stretched: '拉伸',
  'cross-section': '横截面',
}

export default function CprViewport({
  cprPath,
  height = 220,
  showProbe = true,
  showMeasurements = false,
  onProbePositionChange,
}: CprViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [probeMm, setProbeMm] = useState(0)
  const [showCrossSection, setShowCrossSection] = useState(false)
  const [rotationDeg, setRotationDeg] = useState(0)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const imageData = cprPath?.imageData
    if (!imageData) {
      canvas.width = 800
      canvas.height = Math.max(96, Math.floor(height - 60))
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#64748b'
      ctx.font = '11px monospace'
      ctx.fillText('等待 CPR 中心线…  (请在视口里点击血管截面设定起点)', 12, 24)
      return
    }
    canvas.width = imageData.width
    canvas.height = imageData.height
    ctx.putImageData(imageData, 0, 0)
  }, [cprPath, height])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cprPath) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const positionMm = x * cprPath.samples.length * cprPath.samplingStepMm
    setProbeMm(positionMm)
    onProbePositionChange?.(positionMm)
  }

  const probeX = cprPath ? (probeMm / Math.max(0.0001, cprPath.samples.length * cprPath.samplingStepMm)) * 100 : 0

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 8, height }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12, color: '#cbd5e1' }}>
        <span style={{ fontWeight: 600, color: '#fbbf24' }}>CPR (Curved Planar Reformation)</span>
        <span style={{ color: '#64748b' }}>
          {cprPath
            ? `${cprPath.samples.length} 采样点 · 模式 ${MODE_LABEL[cprPath.projectionMode]} · 步长 ${cprPath.samplingStepMm.toFixed(2)}mm`
            : '未生成'}
        </span>
        <div style={{ flex: 1 }} />
        <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <input type="checkbox" checked={showCrossSection} onChange={e => setShowCrossSection(e.target.checked)} />
          横截面
        </label>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          旋转
          <input type="range" min="-180" max="180" value={rotationDeg} onChange={e => setRotationDeg(parseInt(e.target.value))} style={{ width: 80 }} />
          <span>{rotationDeg}°</span>
        </label>
      </div>

      <div style={{ position: 'relative', width: '100%', height: height - 60, background: '#000', borderRadius: 4, overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          style={{
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            cursor: 'crosshair',
            transform: `rotate(${rotationDeg}deg)`,
            transformOrigin: 'center',
          }}
        />
        {showProbe && cprPath && (
          <div
            style={{
              position: 'absolute',
              top: 0, bottom: 0,
              left: `${probeX}%`,
              width: 2,
              background: '#fbbf24',
              boxShadow: '0 0 6px rgba(251,191,36,0.6)',
              pointerEvents: 'none',
            }}
          >
            <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 12, color: '#fbbf24', fontFamily: 'monospace' }}>
              {probeMm.toFixed(1)} mm
            </div>
          </div>
        )}
        {showCrossSection && cprPath && (
          <div style={{ position: 'absolute', right: 8, top: 8, width: 80, height: 80, background: 'rgba(0,0,0,0.7)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CrossSectionPreview rotationDeg={rotationDeg} />
          </div>
        )}
      </div>

      {showMeasurements && cprPath && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#94a3b8' }}>
          总长度 <span style={{ color: '#fbbf24' }}>{(cprPath.samples.length * cprPath.samplingStepMm).toFixed(1)} mm</span> ·
          当前位置 <span style={{ color: '#fbbf24' }}>{probeMm.toFixed(1)} mm</span>
        </div>
      )}
    </div>
  )
}

function CrossSectionPreview({ rotationDeg }: { rotationDeg: number }) {
  return (
    <svg width="64" height="64" viewBox="-32 -32 64 64">
      <circle cx="0" cy="0" r="22" fill="rgba(220,38,38,0.4)" stroke="#ef4444" />
      <circle cx="0" cy="0" r="14" fill="rgba(251,191,36,0.4)" stroke="#fbbf24" />
      <line x1="-30" y1="0" x2="30" y2="0" stroke="#94a3b8" strokeWidth="0.5" />
      <line x1="0" y1="-30" x2="0" y2="30" stroke="#94a3b8" strokeWidth="0.5" />
      <text x="-30" y="30" fontSize="8" fill="#94a3b8" transform={`rotate(${rotationDeg})`}>R{rotationDeg}°</text>
    </svg>
  )
}