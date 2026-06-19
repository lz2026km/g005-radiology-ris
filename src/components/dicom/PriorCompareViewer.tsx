// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 既往 vs 当前 对比查看器
// 左右双 viewport, 联动滚动, 差异高亮
// ============================================================

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Link2, Link2Off, ChevronLeft, ChevronRight, Eye, EyeOff, Columns2, SplitSquareHorizontal } from 'lucide-react'

export interface PriorStudyDescriptor {
  studyId: string
  studyDate: string
  modality: string
  bodyPart: string
  /** mock 图像层数 */
  sliceCount: number
  /** 描述 */
  description?: string
}

export interface PriorCompareViewerProps {
  prior: PriorStudyDescriptor
  current: PriorStudyDescriptor
  height?: number
  initialSlice?: number
  onSliceChange?: (slice: number) => void
}

export const PriorCompareViewer: React.FC<PriorCompareViewerProps> = ({
  prior,
  current,
  height = 540,
  initialSlice = 0,
  onSliceChange,
}) => {
  const [slice, setSlice] = useState(initialSlice)
  const [linked, setLinked] = useState(true)
  const [priorSlice, setPriorSlice] = useState(initialSlice)
  const [currentSlice, setCurrentSlice] = useState(initialSlice)
  const [showDiff, setShowDiff] = useState(false)
  const [splitPct, setSplitPct] = useState(0.5)
  const [layout, setLayout] = useState<'side' | 'overlay'>('side')
  const priorRef = useRef<HTMLDivElement>(null)
  const currentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (linked) {
      setPriorSlice(slice)
      setCurrentSlice(slice)
    }
    onSliceChange?.(slice)
  }, [slice, linked, onSliceChange])

  const maxSlice = Math.max(prior.sliceCount, current.sliceCount) - 1

  const handleScroll = useCallback((delta: number) => {
    setSlice((s) => Math.max(0, Math.min(maxSlice, s + delta)))
  }, [maxSlice])

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!priorRef.current?.contains(e.target as Node) && !currentRef.current?.contains(e.target as Node)) return
      e.preventDefault()
      handleScroll(e.deltaY > 0 ? 1 : -1)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [handleScroll])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleScroll(-1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleScroll(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleScroll])

  const onPriorScroll = useCallback((s: number) => {
    if (linked) {
      setSlice(s)
    } else {
      setPriorSlice(s)
    }
  }, [linked])

  const onCurrentScroll = useCallback((s: number) => {
    if (linked) {
      setSlice(s)
    } else {
      setCurrentSlice(s)
    }
  }, [linked])

  return (
    <div
      data-testid="prior-compare-viewer"
      style={{ background: '#0a0a0a', borderRadius: 8, padding: 8, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', background: '#1a1a1a', borderRadius: 4 }}>
        <Columns2 size={14} color="#3b82f6" />
        <span style={{ fontSize: 12, fontWeight: 600 }}>既往 / 当前 对比</span>
        <div style={{ flex: 1 }} />
        <button
          data-testid="layout-toggle"
          onClick={() => setLayout((l) => (l === 'side' ? 'overlay' : 'side'))}
          style={iconBtnStyle}
          title={layout === 'side' ? '切换为叠加' : '切换为分屏'}
        >
          {layout === 'side' ? <SplitSquareHorizontal size={12} /> : <Columns2 size={12} />}
          {layout === 'side' ? '分屏' : '并排'}
        </button>
        <button
          data-testid="link-toggle"
          onClick={() => setLinked((l) => !l)}
          style={{ ...iconBtnStyle, color: linked ? '#10b981' : '#94a3b8' }}
        >
          {linked ? <Link2 size={12} /> : <Link2Off size={12} />}
          {linked ? '已联动' : '未联动'}
        </button>
        <button
          data-testid="diff-toggle"
          onClick={() => setShowDiff((d) => !d)}
          style={{ ...iconBtnStyle, color: showDiff ? '#fbbf24' : '#94a3b8' }}
        >
          {showDiff ? <Eye size={12} /> : <EyeOff size={12} />}
          差异
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          height: height - 110,
          flexDirection: layout === 'side' ? 'row' : 'column',
        }}
      >
        <Pane
          ref={priorRef}
          descriptor={prior}
          label="既往"
          color="#94a3b8"
          slice={priorSlice}
          maxSlice={prior.sliceCount - 1}
          showDiff={showDiff}
          splitPct={layout === 'overlay' ? splitPct : 0}
          mode={layout}
          onSlice={onPriorScroll}
        />
        <Pane
          ref={currentRef}
          descriptor={current}
          label="当前"
          color="#22d3ee"
          slice={currentSlice}
          maxSlice={current.sliceCount - 1}
          showDiff={showDiff}
          splitPct={layout === 'overlay' ? splitPct : 1}
          mode={layout}
          onSlice={onCurrentScroll}
        />
      </div>

      {layout === 'overlay' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#94a3b8' }}>
          叠加比例
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={splitPct}
            onChange={(e) => setSplitPct(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <span>{(splitPct * 100).toFixed(0)}%</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => handleScroll(-1)} style={iconBtnStyle} title="上一层 (↑)">
          <ChevronLeft size={12} />
        </button>
        <input
          type="range"
          min={0}
          max={maxSlice}
          value={slice}
          onChange={(e) => setSlice(parseInt(e.target.value, 10))}
          style={{ flex: 1 }}
        />
        <button onClick={() => handleScroll(1)} style={iconBtnStyle} title="下一层 (↓)">
          <ChevronRight size={12} />
        </button>
        <span style={{ fontSize: 10, color: '#94a3b8', minWidth: 100, textAlign: 'right' }}>
          {slice + 1} / {maxSlice + 1}
        </span>
      </div>
    </div>
  )
}

const Pane = React.forwardRef<HTMLDivElement, {
  descriptor: PriorStudyDescriptor
  label: string
  color: string
  slice: number
  maxSlice: number
  showDiff: boolean
  splitPct: number
  mode: 'side' | 'overlay'
  onSlice: (s: number) => void
}>(({ descriptor, label, color, slice, maxSlice, showDiff, splitPct, mode, onSlice }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        background: '#000',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid #1e293b`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          fontSize: 10,
          color,
          background: 'rgba(0,0,0,0.7)',
          padding: '2px 6px',
          borderRadius: 2,
          zIndex: 5,
        }}
      >
        {label} · {descriptor.studyId} · {descriptor.studyDate} · {descriptor.modality}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          fontSize: 9,
          color: '#94a3b8',
          background: 'rgba(0,0,0,0.7)',
          padding: '2px 6px',
          borderRadius: 2,
          zIndex: 5,
        }}
      >
        {descriptor.bodyPart} · {slice + 1}/{maxSlice + 1}
      </div>
      <SliceMock slice={slice} maxSlice={maxSlice} showDiff={showDiff} color={color} splitPct={splitPct} mode={mode} />
      <input
        type="range"
        min={0}
        max={maxSlice}
        value={slice}
        onChange={(e) => onSlice(parseInt(e.target.value, 10))}
        style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: '60%' }}
      />
    </div>
  )
})
Pane.displayName = 'Pane'

function SliceMock({ slice, maxSlice, showDiff, color, splitPct, mode }: { slice: number; maxSlice: number; showDiff: boolean; color: string; splitPct: number; mode: 'side' | 'overlay' }) {
  const w = 256
  const h = 256
  const seed = (slice * 31) % 100
  const phase = (slice / Math.max(1, maxSlice)) * Math.PI * 2
  const lines: React.ReactNode[] = []
  for (let y = 0; y < h; y += 8) {
    const intensity = 60 + Math.sin((y + seed) * 0.2) * 40
    lines.push(<rect key={`h${y}`} x={0} y={y} width={w} height={2} fill={`rgba(${intensity},${intensity},${intensity},0.4)`} />)
  }
  const cx = w / 2 + Math.sin(phase) * 30
  const cy = h / 2 + Math.cos(phase) * 20
  const clip = mode === 'overlay' ? `polygon(0 0, ${splitPct * 100}% 0, ${splitPct * 100}% 100%, 0 100%)` : undefined
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        clipPath: clip,
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        {lines}
        <circle cx={cx} cy={cy} r={20 + Math.sin(phase) * 5} fill="none" stroke={showDiff ? '#fbbf24' : color} strokeWidth="1" opacity="0.5" />
        <circle cx={cx} cy={cy} r={10} fill="none" stroke={showDiff ? '#fbbf24' : color} strokeWidth="1" opacity="0.8" />
        <text x={cx + 14} y={cy + 4} fontSize="8" fill={color} opacity="0.7">L{slice + 1}</text>
        {showDiff && (
          <g opacity="0.7">
            <circle cx={cx + 8} cy={cy + 12} r={3} fill="#ef4444" />
            <text x={cx + 16} y={cy + 15} fontSize="7" fill="#ef4444">Δ</text>
          </g>
        )}
      </svg>
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 4,
  padding: '4px 8px',
  color: '#cbd5e1',
  fontSize: 10,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}

export default PriorCompareViewer
