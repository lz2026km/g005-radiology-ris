import React, { useState } from 'react'
import type { PerfusionMapResult, PerfusionMapType } from '../../types/imaging/postprocess'

export interface PerfusionMapsProps {
  maps: Partial<Record<PerfusionMapType, PerfusionMapResult>>
  height?: number
  activeMap?: PerfusionMapType
  onMapChange?: (mapType: PerfusionMapType) => void
}

const MAP_TYPES: PerfusionMapType[] = ['Tmax', 'CBF', 'CBV', 'MTT', 'TTP']
const MAP_DESCRIPTIONS: Record<PerfusionMapType, string> = {
  Tmax: 'Tmax >6s 为缺血核心；常用于 RAPID / e-Stroke 自动评估',
  CBF: '脑血流量；CBF<12 ml/100g/min 提示梗死核心',
  CBV: '脑血容量；CBV<2 ml/100g 提示已梗死',
  MTT: '平均通过时间；升高提示侧支循环差',
  TTP: '达峰时间；用于筛查灌注延迟',
}

export default function PerfusionMaps({
  maps,
  height = 420,
  activeMap: controlledActive,
  onMapChange,
}: PerfusionMapsProps) {
  const [internalActive, setInternalActive] = useState<PerfusionMapType>('Tmax')
  const active = controlledActive ?? internalActive
  const setActive = (m: PerfusionMapType) => {
    if (!controlledActive) setInternalActive(m)
    onMapChange?.(m)
  }
  const current = maps[active]

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 8, height, color: '#cbd5e1', fontSize: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#fbbf24' }}>灌注参数图 (CTP / MRP)</span>
        <div style={{ width: 1, height: 14, background: '#333' }} />
        {MAP_TYPES.map(m => {
          const has = !!maps[m]
          const color = active === m ? '#1e40af' : has ? '#1a1a1a' : '#0a0a0a'
          return (
            <button
              key={m}
              onClick={() => setActive(m)}
              disabled={!has}
              style={{
                background: color, border: '1px solid', borderColor: active === m ? '#3b82f6' : '#333',
                borderRadius: 4, padding: '2px 8px', color: has ? '#cbd5e1' : '#475569', fontSize: 12, cursor: has ? 'pointer' : 'not-allowed',
              }}
            >
              {m}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, height: height - 60 }}>
        <div style={{ flex: 2, background: '#000', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
          {current ? <MapCanvas result={current} /> : <PlaceholderPanel text={`${active} 暂未计算`} />}
          <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 12, color: '#fbbf24', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 3 }}>
            {active} · 切片 {current?.sliceCount ?? 0}
          </div>
          {current && <Legend mapType={active} />}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', background: '#1a1a1a', borderRadius: 4, padding: 8 }}>
          <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>{active} · {MAP_DESCRIPTIONS[active]}</div>
          {current ? (
            <>
              <Stat label="最小" value={current.stats.min.toFixed(2)} />
              <Stat label="最大" value={current.stats.max.toFixed(2)} />
              <Stat label="均值" value={current.stats.mean.toFixed(2)} />
              <Stat label="中位" value={current.stats.median.toFixed(2)} />
              <Stat label="标准差" value={current.stats.stdDev.toFixed(2)} />
              <Stat label="P10" value={current.stats.p10.toFixed(2)} />
              <Stat label="P90" value={current.stats.p90.toFixed(2)} />
              <div style={{ marginTop: 8, padding: 6, background: '#7f1d1d', borderRadius: 4, color: '#fff' }}>
                <div style={{ fontSize: 12, color: '#fecaca' }}>梗死核心</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{current.stats.coreVolumeMl.toFixed(2)} ml</div>
              </div>
              <div style={{ marginTop: 4, padding: 6, background: '#9a3412', borderRadius: 4, color: '#fff' }}>
                <div style={{ fontSize: 12, color: '#fed7aa' }}>缺血半暗带</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{current.stats.penumbraVolumeMl.toFixed(2)} ml</div>
              </div>
              <div style={{ marginTop: 4, padding: 6, background: '#1e3a8a', borderRadius: 4, color: '#fff' }}>
                <div style={{ fontSize: 12, color: '#bfdbfe' }}>Mismatch (Tmax&gt;6s)</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{current.stats.ischemicVolumeMl.toFixed(2)} ml</div>
              </div>
            </>
          ) : (
            <div style={{ color: '#64748b' }}>PerfusionEngine.{active.toLowerCase()}() 待调用</div>
          )}
        </div>
      </div>
    </div>
  )
}

function MapCanvas({ result }: { result: PerfusionMapResult }) {
  const ref = React.useRef<HTMLCanvasElement | null>(null)
  React.useEffect(() => {
    if (!ref.current) return
    const canvas = ref.current
    canvas.width = result.width
    canvas.height = result.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (result.imageData) {
      ctx.putImageData(result.imageData, 0, 0)
    } else {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [result])
  return <canvas ref={ref} style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }} />
}

function Legend({ mapType }: { mapType: PerfusionMapType }) {
  const stops = legendStops(mapType)
  return (
    <div style={{ position: 'absolute', bottom: 6, left: 8, right: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#cbd5e1' }}>
      <span>{stops[0].label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 2, background: `linear-gradient(90deg, ${stops.map(s => s.color).join(',')})` }} />
      <span>{stops[stops.length - 1].label}</span>
    </div>
  )
}

function legendStops(mapType: PerfusionMapType): { color: string; label: string }[] {
  switch (mapType) {
    case 'Tmax':
      return [
        { color: '#1e3a8a', label: '0s' },
        { color: '#22c55e', label: '4s' },
        { color: '#fbbf24', label: '6s' },
        { color: '#ef4444', label: '>10s' },
      ]
    case 'CBF':
      return [
        { color: '#ef4444', label: '0' },
        { color: '#fbbf24', label: '12' },
        { color: '#22c55e', label: '25' },
        { color: '#22c55e', label: '60 ml' },
      ]
    case 'CBV':
      return [
        { color: '#3b82f6', label: '0' },
        { color: '#22c55e', label: '2' },
        { color: '#fbbf24', label: '4' },
        { color: '#ef4444', label: '>8' },
      ]
    case 'MTT':
      return [
        { color: '#1e3a8a', label: '0s' },
        { color: '#3b82f6', label: '4s' },
        { color: '#fbbf24', label: '8s' },
        { color: '#ef4444', label: '>12s' },
      ]
    case 'TTP':
      return [
        { color: '#1e3a8a', label: '0s' },
        { color: '#22c55e', label: '4s' },
        { color: '#fbbf24', label: '8s' },
        { color: '#ef4444', label: '>12s' },
      ]
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dashed #333' }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}

function PlaceholderPanel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
      {text}
    </div>
  )
}