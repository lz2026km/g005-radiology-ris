import { Plus, Minus, RotateCw, FlipHorizontal, FlipVertical, Maximize2, Sun, Droplets } from 'lucide-react'

export interface ViewportControlsProps {
  zoom: number
  windowWidth: number
  windowLevel: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onRotate: () => void
  onFlipH: () => void
  onFlipV: () => void
  onWindowLevelChange: (ww: number, wl: number) => void
}

const btnStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)',
  color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

export default function ViewportControls({ zoom, windowWidth, windowLevel, onZoomIn, onZoomOut, onReset, onRotate, onFlipH, onFlipV, onWindowLevelChange }: ViewportControlsProps) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: '#1a1a2e', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={onZoomIn} style={btnStyle}><Plus size={16} /></button>
        <button onClick={onZoomOut} style={btnStyle}><Minus size={16} /></button>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, minWidth: 50, textAlign: 'center' }}>{zoom.toFixed(1)}x</div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={onRotate} style={btnStyle}><RotateCw size={16} /></button>
        <button onClick={onFlipH} style={btnStyle}><FlipHorizontal size={16} /></button>
        <button onClick={onFlipV} style={btnStyle}><FlipVertical size={16} /></button>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginLeft: 'auto' }}>
        <Sun size={12} color="rgba(255,255,255,0.6)" />
        <input type="range" min={100} max={4000} value={windowWidth} onChange={e => onWindowLevelChange(Number(e.target.value), windowLevel)}
          style={{ width: 60, accentColor: '#3b82f6' }} />
        <Droplets size={12} color="rgba(255,255,255,0.6)" />
        <input type="range" min={-1000} max={1000} value={windowLevel} onChange={e => onWindowLevelChange(windowWidth, Number(e.target.value))}
          style={{ width: 60, accentColor: '#3b82f6' }} />
      </div>
      <button onClick={onReset} style={{ ...btnStyle, background: 'rgba(239,68,68,0.3)' }}><Maximize2 size={14} /></button>
    </div>
  )
}
