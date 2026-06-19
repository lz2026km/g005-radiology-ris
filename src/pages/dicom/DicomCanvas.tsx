import { useRef, useEffect } from 'react'
import type { Tool, PseudoColorMode, Series, DicomImage } from './types'

export type MeasureSubMenuInternal = 'length' | 'angle' | 'area' | 'ct' | 'ellipse' | 'rectangle' | 'circle' | 'ctvalue' | null

export function DicomCanvas({
  zoom, rotation, flipH, flipV, ww, wl, brightness, contrast,
  activeTool, panX, panY, windowPreset, measureType, activeSeries,
  imageIndex, images, pseudoColorMode,
  onWheel
}: {
  zoom: number; rotation: number; flipH: boolean; flipV: boolean;
  ww: number; wl: number; brightness: number; contrast: number;
  activeTool: Tool; panX: number; panY: number;
  windowPreset: string; measureType: MeasureSubMenuInternal;
  activeSeries: Series; imageIndex: number; images: DicomImage[];
  pseudoColorMode?: PseudoColorMode;
  onWheel?: (deltaY: number, deltaX: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const img = images[imageIndex] || images[0]
  const w = 512
  const h = 512

  const applyPseudoColor = (gray: number, mode: PseudoColorMode) => {
    let r = gray, g = gray, b = gray
    if (mode === 'hotIron') {
      if (gray < 85) { r = 0; g = 0; b = gray * 3 }
      else if (gray < 170) { r = (gray - 85) * 3; g = 0; b = 255 - (gray - 85) * 3 }
      else { r = 255; g = (gray - 170) * 3; b = 0 }
    } else if (mode === 'coolBlue') {
      if (gray < 128) { r = 0; g = gray * 2; b = 255 - gray }
      else { r = (gray - 128) * 2; g = 255 - (gray - 128); b = 128 }
    } else if (mode === 'softTissue') {
      r = Math.min(255, gray * 1.2); g = Math.min(255, gray * 1.1); b = Math.min(255, gray * 0.9)
    }
    return { r, g, b }
  }

  const windowLevel = (base: number, windowCenter: number, windowWidth: number): number => {
    const min = windowCenter - windowWidth / 2
    const max = windowCenter + windowWidth / 2
    const normalized = (base - min) / (max - min)
    return Math.max(0, Math.min(1, normalized))
  }

  const generateCTData = () => {
    const data = new Uint8Array(w * h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - w / 2
        const dy = y - h / 2
        const dist = Math.sqrt(dx * dx + dy * dy)
        let v = 20
        if (dist < 200) {
          const nx = dx / 200, ny = dy / 200
          const lungL = Math.sqrt((dx + 80) ** 2 + (dy + 20) ** 2)
          const lungR = Math.sqrt((dx - 80) ** 2 + (dy + 20) ** 2)
          if (lungL < 55 || lungR < 55) {
            v = -800 + Math.random() * 100
          } else {
            v = 45 + Math.sin(nx * 3 + ny * 2) * 8 + Math.random() * 5
            const heart = Math.sqrt((dx - 10) ** 2 + (dy + 30) ** 2)
            if (heart < 60) v = 50 + Math.sin(nx * 5 + ny * 4) * 6
            if (dy > 60 && dy < 140) v = 50 + Math.sin(ny * 0.1) * 5
            if (Math.abs(dx) < 20 && dy > 80 && dy < 110) v = 250
            const ribDist = Math.abs(Math.sqrt(dy ** 2 + ((dx % 40) - 20) ** 2) - 120)
            if (ribDist < 8 && dy < 60) v = 300 + Math.random() * 50
          }
        }
        data[y * w + x] = Math.max(0, Math.min(255, ((v + 1024) / 4096) * 255))
      }
    }
    return data
  }

  const generateMRData = () => {
    const data = new Uint8Array(w * h * 3)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - w / 2, dy = y - h / 2
        const dist = Math.sqrt(dx * dx + dy * dy)
        let v = 30
        if (dist < 200) {
          const brain = Math.sqrt((dx - 5) ** 2 + (dy - 10) ** 2)
          if (brain < 120) {
            v = 60 + Math.sin(dx * 0.08) * 15 + Math.cos(dy * 0.1) * 15
            if (Math.abs(dx - 5) < 15 && dy < -20 && dy > -60) v = 20
          }
        }
        const idx = (y * w + x) * 3
        data[idx] = Math.max(0, Math.min(255, v + 10))
        data[idx + 1] = Math.max(0, Math.min(255, v))
        data[idx + 2] = Math.max(0, Math.min(255, v - 5))
      }
    }
    return data
  }

  const generateDRData = () => {
    const data = new Uint8Array(w * h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - w / 2, dy = y - h / 2
        let v = 180
        if (dy < 50 && Math.abs(dx) > 40) v = 40 + Math.random() * 30
        if (dx > -60 && dx < 20 && dy > -80 && dy < -20) v = 200 + Math.random() * 40
        const dist = Math.sqrt(dx * dx + dy * dy)
        const ribAngle = Math.atan2(dy, dx)
        if (dist < 180 && Math.abs(Math.sin(ribAngle * 6)) < 0.15 && dy < 0) v = 220 + Math.random() * 35
        data[y * w + x] = Math.max(0, Math.min(255, v))
      }
    }
    return data
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.createImageData(w, h)
    const pixelData = imageData.data

    let rawData: Uint8Array
    if (activeSeries.modality === 'CT') {
      rawData = generateCTData()
    } else if (activeSeries.modality === 'MR') {
      rawData = generateMRData()
    } else {
      rawData = generateDRData()
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x
        const pixelIdx = idx * 4
        let r: number, g: number, b: number, gray: number

        if (activeSeries.modality === 'MR') {
          r = rawData[idx * 3]; g = rawData[idx * 3 + 1]; b = rawData[idx * 3 + 2]
          const wwFactor = ww / 400; const wlFactor = (wl - 40) / 100
          r = Math.max(0, Math.min(255, r * wwFactor + wlFactor * 50))
          g = Math.max(0, Math.min(255, g * wwFactor + wlFactor * 50))
          b = Math.max(0, Math.min(255, b * wwFactor + wlFactor * 50))
        } else {
          gray = rawData[idx]
          const windowedGray = windowLevel(gray * (ww / 400) + (wl - 40), 128, 256) * 255
          const finalGray = Math.max(0, Math.min(255, windowedGray))
          if (pseudoColorMode && pseudoColorMode !== 'none') {
            const pseudo = applyPseudoColor(finalGray, pseudoColorMode)
            r = pseudo.r; g = pseudo.g; b = pseudo.b
          } else {
            r = g = b = finalGray
          }
        }

        pixelData[pixelIdx] = r; pixelData[pixelIdx + 1] = g
        pixelData[pixelIdx + 2] = b; pixelData[pixelIdx + 3] = 255
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }, [ww, wl, brightness, contrast, activeSeries.modality, pseudoColorMode])

  const handleWheel = (e: React.WheelEvent) => {
    if (onWheel) onWheel(e.deltaY, e.deltaX)
  }

  const cursorStyle = (() => {
    switch (activeTool) {
      case 'zoom': return 'zoom-in'
      case 'pan': return 'grab'
      case 'wl': return 'crosshair'
      case 'measure': return 'crosshair'
      case 'annotate': return 'crosshair'
      default: return 'default'
    }
  })()

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: w, height: h,
        transform: `translate(${panX}px, ${panY}px) scale(${zoom / 100}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
        transition: 'transform 0.15s ease-out, filter 0.15s ease-out',
        transformOrigin: 'center center',
        cursor: cursorStyle,
      }}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} width={w} height={h} style={{ display: 'block' }} />
      {activeTool === 'annotate' && (
        <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="rgba(255,0,0,0.5)" strokeWidth={1} strokeDasharray="4" />
          <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="rgba(255,0,0,0.5)" strokeWidth={1} strokeDasharray="4" />
        </svg>
      )}
    </div>
  )
}
