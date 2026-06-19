import React, { useEffect, useRef, useState } from 'react'
import type { CineAnalysisResult } from '../../types/imaging/postprocess'

export interface CineViewportProps {
  result: CineAnalysisResult | null
  height?: number
  onPhaseChange?: (phaseIndex: number) => void
}

export default function CineViewport({
  result,
  height = 420,
  onPhaseChange,
}: CineViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 512
    canvas.height = 320
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (!result || result.phases.length === 0) {
      ctx.fillStyle = '#64748b'
      ctx.font = '12px monospace'
      ctx.fillText('等待 CineAnalysis.analyze() 返回结果…', 16, 32)
      return
    }
    const phase = result.phases[phaseIndex] ?? result.phases[0]!
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(8, 8, 240, 90)
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 14px monospace'
    ctx.fillText(`Phase ${phase.phaseIndex + 1}/${result.phases.length} (${phase.phasePercent.toFixed(0)}% R-R)`, 16, 28)
    ctx.font = '11px monospace'
    ctx.fillStyle = '#cbd5e1'
    ctx.fillText(`LV: ${phase.lvVolumeMl.toFixed(1)} ml`, 16, 46)
    ctx.fillText(`RV: ${phase.rvVolumeMl.toFixed(1)} ml`, 16, 62)
    ctx.fillText(`LA: ${phase.laVolumeMl.toFixed(1)} ml`, 120, 46)
    ctx.fillText(`RA: ${phase.raVolumeMl.toFixed(1)} ml`, 120, 62)
    ctx.fillText(`Mass: ${phase.myocardialMassG.toFixed(1)} g`, 16, 86)
    if (phase.isEndDiastolic) {
      ctx.fillStyle = '#22c55e'
      ctx.fillText('ED', 200, 28)
    }
    if (phase.isEndSystolic) {
      ctx.fillStyle = '#ef4444'
      ctx.fillText('ES', 230, 28)
    }

    drawVolumeCurve(ctx, result)
    drawBullseye(ctx, result, phaseIndex)
  }, [result, phaseIndex])

  useEffect(() => {
    if (!playing || !result || result.phases.length === 0) return
    const interval = setInterval(() => {
      setPhaseIndex(prev => (prev + 1) % result.phases.length)
    }, Math.max(40, 220 / speed))
    return () => clearInterval(interval)
  }, [playing, result, speed])

  useEffect(() => {
    onPhaseChange?.(phaseIndex)
  }, [phaseIndex, onPhaseChange])

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 8, height }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 11, color: '#cbd5e1' }}>
        <span style={{ fontWeight: 600, color: '#fbbf24' }}>心脏 4D Cine 视口</span>
        {result && (
          <>
            <span>EF <span style={{ color: '#22c55e' }}>{result.ejectionFractionPercent.toFixed(1)}%</span></span>
            <span>SV <span style={{ color: '#3b82f6' }}>{result.strokeVolumeMl.toFixed(1)} ml</span></span>
            <span>HR <span style={{ color: '#a855f7' }}>{result.heartRateBpm} bpm</span></span>
            <span>CO <span style={{ color: '#fbbf24' }}>{result.cardiacOutputLmin.toFixed(2)} L/min</span></span>
          </>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={() => setPlaying(p => !p)} style={btnStyle(playing ? '#ef4444' : '#22c55e')}>
          {playing ? '⏸ 暂停' : '▶ 播放'}
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          速度
          <input type="range" min="0.25" max="4" step="0.25" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} style={{ width: 80 }} />
          <span>{speed.toFixed(2)}x</span>
        </label>
      </div>

      <canvas ref={canvasRef} style={{ width: '100%', height: height - 100, background: '#000', borderRadius: 4 }} />

      {result && (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>相位</span>
          <input
            type="range"
            min={0}
            max={Math.max(0, result.phases.length - 1)}
            value={phaseIndex}
            onChange={e => setPhaseIndex(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 10, color: '#fbbf24', fontFamily: 'monospace', minWidth: 60 }}>
            {phaseIndex + 1}/{result.phases.length}
          </span>
        </div>
      )}
    </div>
  )
}

function drawVolumeCurve(ctx: CanvasRenderingContext2D, result: CineAnalysisResult) {
  const w = 280, h = 90
  const x0 = 264, y0 = 8
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(x0, y0, w, h)
  ctx.strokeStyle = '#334155'
  ctx.strokeRect(x0, y0, w, h)
  if (result.phases.length === 0) return
  const max = Math.max(...result.phases.map(p => p.lvVolumeMl), 1)
  const min = Math.min(...result.phases.map(p => p.lvVolumeMl), 0)
  const range = Math.max(1, max - min)
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let i = 0; i < result.phases.length; i++) {
    const x = x0 + (i / Math.max(1, result.phases.length - 1)) * w
    const y = y0 + h - ((result.phases[i]!.lvVolumeMl - min) / range) * h
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px monospace'
  ctx.fillText('LV Volume (ml)', x0 + 6, y0 + 14)
}

function drawBullseye(ctx: CanvasRenderingContext2D, result: CineAnalysisResult, phaseIdx: number) {
  const cx = 460, cy = 170, r = 100
  ctx.save()
  ctx.translate(cx, cy)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 0.6
  for (const ratio of [1, 0.66, 0.33, 0.05]) {
    ctx.beginPath()
    ctx.arc(0, 0, r * ratio, 0, Math.PI * 2)
    ctx.stroke()
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    ctx.stroke()
  }
  const scores = result.segmentalScores
  for (let i = 1; i <= 17; i++) {
    const a = ((i - 1) / 17) * Math.PI * 2 - Math.PI / 2
    const ring = i <= 6 ? 0.85 : i <= 12 ? 0.55 : i <= 16 ? 0.22 : 0.05
    const px = Math.cos(a) * r * ring
    const py = Math.sin(a) * r * ring
    const score = scores[i] ?? 1
    ctx.fillStyle = scoreColor(score)
    ctx.beginPath()
    ctx.arc(px, py, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0a0a0a'
    ctx.font = '8px monospace'
    ctx.fillText(String(i), px - 3, py + 3)
  }
  ctx.restore()
  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px monospace'
  ctx.fillText(`Polar · phase ${phaseIdx + 1}`, cx - r, cy + r + 12)
}

function scoreColor(score: number): string {
  if (score <= 1) return '#22c55e'
  if (score <= 2) return '#fbbf24'
  if (score <= 3) return '#f97316'
  return '#ef4444'
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    border: 'none',
    color: '#fff',
    borderRadius: 4,
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 600,
  }
}