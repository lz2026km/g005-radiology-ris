import React, { useEffect, useRef, useState } from 'react'
import type { SegmentationAlgorithm, SegmentationMask, SegmentationSeed } from '../../types/imaging/postprocess'

export interface SegmentationBrushProps {
  width: number
  height: number
  brushRadius: number
  brushLabel: 'foreground' | 'background'
  algorithm: SegmentationAlgorithm
  mask: SegmentationMask | null
  onSeedAdd: (seed: SegmentationSeed) => void
  onSeedRemove: (id: string) => void
  onRunSegmentation: () => void
  onAlgorithmChange: (alg: SegmentationAlgorithm) => void
  onBrushRadiusChange: (r: number) => void
  onClearSeeds: () => void
  height?: number
}

const ALGORITHMS: SegmentationAlgorithm[] = ['grow-cut', 'region-growing', 'watershed', 'threshold', 'random-walker']

export default function SegmentationBrush(props: SegmentationBrushProps) {
  const { width, height, brushRadius, brushLabel, algorithm, mask, height: panelHeight = 420 } = props
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [sliceIndex, setSliceIndex] = useState(0)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 512
    canvas.height = 384
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (mask?.binaryMask) {
      const imgData = ctx.createImageData(canvas.width, canvas.height)
      const maskSlice = sliceIndex * canvas.width * canvas.height
      for (let i = 0; i < canvas.width * canvas.height; i++) {
        const m = mask.binaryMask[maskSlice + i]
        if (m) {
          imgData.data[i * 4] = 251
          imgData.data[i * 4 + 1] = 191
          imgData.data[i * 4 + 2] = 36
          imgData.data[i * 4 + 3] = 130
        }
      }
      ctx.putImageData(imgData, 0, 0)
    }

    if (props.mask?.seeds) {
      for (const seed of props.mask.seeds) {
        ctx.fillStyle = seed.label === 'foreground' ? '#22c55e' : '#ef4444'
        ctx.beginPath()
        ctx.arc((seed.voxel.x / width) * canvas.width, (seed.voxel.y / height) * canvas.height, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (hoverPos) {
      ctx.strokeStyle = brushLabel === 'foreground' ? '#22c55e' : '#ef4444'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(hoverPos.x, hoverPos.y, brushRadius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [props.mask, hoverPos, brushRadius, brushLabel, sliceIndex, width, height])

  const screenToVoxel = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const sx = (e.clientX - rect.left) / rect.width
    const sy = (e.clientY - rect.top) / rect.height
    return { x: Math.round(sx * width), y: Math.round(sy * height), z: sliceIndex }
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) {
      const v = screenToVoxel(e)
      props.onSeedAdd({ id: `seed-${Date.now()}`, voxel: v, label: brushLabel, strength: 1 })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const v = screenToVoxel(e)
    props.onSeedAdd({ id: `seed-${Date.now()}-${Math.random()}`, voxel: v, label: brushLabel, strength: 0.6 })
  }

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 8, height: panelHeight, color: '#cbd5e1', fontSize: 11 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#fbbf24' }}>交互式分割 · Brush</span>
        <div style={{ width: 1, height: 14, background: '#333' }} />
        <select value={algorithm} onChange={e => props.onAlgorithmChange(e.target.value as SegmentationAlgorithm)} style={selectStyle}>
          {ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          半径
          <input type="range" min="3" max="40" value={brushRadius} onChange={e => props.onBrushRadiusChange(parseInt(e.target.value))} style={{ width: 80 }} />
          <span style={{ minWidth: 24 }}>{brushRadius}</span>
        </label>
        <div style={{ width: 1, height: 14, background: '#333' }} />
        <label>
          <input type="radio" checked={brushLabel === 'foreground'} onChange={() => { /* controlled via parent */ }} /> 前景
        </label>
        <label>
          <input type="radio" checked={brushLabel === 'background'} onChange={() => { /* controlled via parent */ }} /> 背景
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="checkbox" checked={drawing} onChange={e => setDrawing(e.target.checked)} /> 拖拽绘制
        </label>
        <div style={{ flex: 1 }} />
        <button onClick={props.onClearSeeds} style={btnStyle('#475569')}>清空种子</button>
        <button onClick={props.onRunSegmentation} style={btnStyle('#059669')}>▶ 运行分割</button>
      </div>

      <div style={{ display: 'flex', gap: 8, height: panelHeight - 80 }}>
        <div style={{ flex: 2, position: 'relative', background: '#000', borderRadius: 4, overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            onMouseDown={() => setDrawing(true)}
            onMouseUp={() => setDrawing(false)}
            onMouseLeave={() => setHoverPos(null)}
            onMouseMove={handleMouseMove}
            onMouseMoveCapture={handleDrag}
            style={{ width: '100%', height: '100%', cursor: 'crosshair', imageRendering: 'pixelated' }}
          />
          <div style={{ position: 'absolute', top: 6, right: 8, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 3, fontSize: 10 }}>
            切片 {sliceIndex + 1} · {algorithm}
          </div>
        </div>

        <div style={{ flex: 1, background: '#1a1a1a', borderRadius: 4, padding: 8, overflowY: 'auto' }}>
          <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>分割结果</div>
          {mask ? (
            <>
              <Row label="算法" value={mask.algorithm} />
              <Row label="体素数" value={mask.voxelCount.toLocaleString()} />
              <Row label="体积" value={`${mask.volumeMl.toFixed(2)} ml`} />
              <Row label="HU 均值" value={mask.meanIntensityHU.toFixed(1)} />
              <Row label="HU 标准差" value={mask.stdIntensityHU.toFixed(1)} />
              <Row label="耗时" value={`${mask.processingTimeMs} ms`} />
              <Row label="种子数" value={String(mask.seeds.length)} />
              <div style={{ marginTop: 6, fontSize: 9, color: '#94a3b8' }}>
                BBox: [{mask.boundingBox.min.x},{mask.boundingBox.min.y},{mask.boundingBox.min.z}] → [{mask.boundingBox.max.x},{mask.boundingBox.max.y},{mask.boundingBox.max.z}]
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  浏览
                  <input type="range" min={0} max={32} value={sliceIndex} onChange={e => setSliceIndex(parseInt(e.target.value))} style={{ flex: 1 }} />
                </label>
              </div>
            </>
          ) : (
            <div style={{ color: '#64748b' }}>在画布上点击添加前景 / 背景种子，然后点击 ▶ 运行分割</div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dashed #333' }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontSize: 10 }}>{value}</span>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  background: '#0a0a0a',
  color: '#cbd5e1',
  border: '1px solid #333',
  borderRadius: 4,
  padding: '2px 6px',
  fontSize: 10,
}

function btnStyle(bg: string): React.CSSProperties {
  return { background: bg, border: 'none', color: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 10, fontWeight: 600 }
}