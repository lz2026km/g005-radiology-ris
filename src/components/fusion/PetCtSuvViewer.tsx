// ============================================================
// G005 放射RIS系统 v3.0.6.5 - PET/CT SUV 查看器
// CT 灰阶 + SUV 颜色叠加 + 阈值控制 + 直方图
// ============================================================

import React, { useEffect, useState, useCallback } from 'react'
import { Sliders, BarChart3, RefreshCw } from 'lucide-react'
import { SuvOverlayEngine, sampleColorMap, colorMap } from '../../services/fusion/pet/SuvOverlay'
import type { SuvConfig, SuvColorMapType, SuvOverlay } from '../../types/fusion'
import { DEFAULT_SUV_CONFIG, SUV_COLOR_MAPS } from '../../data/fusionMock'

export interface PetCtSuvViewerProps {
  studyId: string
  modality?: string
  width?: number
  height?: number
  initialConfig?: Partial<SuvConfig>
  onConfigChange?: (cfg: SuvConfig) => void
  onStatsChange?: (stats: SuvOverlay['stats']) => void
}

const COLOR_OPTIONS: SuvColorMapType[] = ['hot', 'jet', 'rainbow', 'grayscale', 'viridis', 'plasma']

export const PetCtSuvViewer: React.FC<PetCtSuvViewerProps> = ({
  studyId,
  modality = 'PET/CT',
  width = 512,
  height = 512,
  initialConfig,
  onConfigChange,
  onStatsChange,
}) => {
  const [config, setConfig] = useState<SuvConfig>({ ...DEFAULT_SUV_CONFIG, ...initialConfig })
  const [overlay, setOverlay] = useState<SuvOverlay | null>(null)
  const engineRef = React.useRef(new SuvOverlayEngine(config))

  useEffect(() => {
    engineRef.current.setConfig(config)
    const ov = engineRef.current.computeMap({ studyId, modality }, width, height)
    setOverlay(ov)
    onConfigChange?.(config)
    onStatsChange?.(ov.stats)
  }, [config, studyId, modality, width, height, onConfigChange, onStatsChange])

  const handleThreshold = useCallback((v: number) => {
    setConfig((c) => ({ ...c, threshold: v, thresholdEnabled: v > 0 }))
  }, [])

  const handleMax = useCallback((v: number) => {
    setConfig((c) => ({ ...c, maxSuv: v }))
  }, [])

  const handleOpacity = useCallback((v: number) => {
    setConfig((c) => ({ ...c, opacity: Math.max(0, Math.min(1, v)) }))
  }, [])

  const handleColor = useCallback((t: SuvColorMapType) => {
    setConfig((c) => ({ ...c, colorMap: t }))
  }, [])

  const refresh = useCallback(() => {
    const ov = engineRef.current.computeMap({ studyId, modality }, width, height)
    setOverlay(ov)
  }, [studyId, modality, width, height])

  const suvMap = overlay?.suvMap
  const stats = overlay?.stats

  return (
    <div
      data-testid="petct-suv-viewer"
      style={{ background: '#0a0a0a', borderRadius: 8, padding: 10, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>PET/CT SUV 叠加</span>
        <span style={{ fontSize: 12, color: '#64748b' }}>{studyId}</span>
        <div style={{ flex: 1 }} />
        <button
          data-testid="suv-refresh"
          onClick={refresh}
          style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 4, padding: '2px 6px', color: '#94a3b8', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <RefreshCw size={11} /> 重新计算
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <canvas
            data-testid="suv-canvas"
            width={width}
            height={height}
            style={{ width, height, background: '#000', borderRadius: 4, imageRendering: 'pixelated' }}
            ref={(el) => {
              if (!el || !suvMap) return
              const ctx = el.getContext('2d')
              if (!ctx) return
              const img = ctx.createImageData(width, height)
              const map = colorMap(config.colorMap)
              for (let i = 0; i < suvMap.length; i++) {
                const v = suvMap[i]!
                if (config.thresholdEnabled && v < config.threshold) {
                  img.data[i * 4 + 0] = 0
                  img.data[i * 4 + 1] = 0
                  img.data[i * 4 + 2] = 0
                  img.data[i * 4 + 3] = 0
                  continue
                }
                const t = Math.max(0, Math.min(1, v / config.maxSuv))
                const [r, g, b] = sampleColorMap(map, t)
                img.data[i * 4 + 0] = r
                img.data[i * 4 + 1] = g
                img.data[i * 4 + 2] = b
                img.data[i * 4 + 3] = Math.round(255 * config.opacity)
              }
              ctx.putImageData(img, 0, 0)
              ctx.fillStyle = 'rgba(0,0,0,0.6)'
              ctx.fillRect(width - 30, 10, 18, height - 20)
              for (let y = 0; y < height - 20; y++) {
                const t = 1 - y / (height - 20)
                const v = t * config.maxSuv
                if (config.thresholdEnabled && v < config.threshold) continue
                const [r, g, b] = sampleColorMap(map, t)
                ctx.fillStyle = `rgb(${r},${g},${b})`
                ctx.fillRect(width - 28, 10 + y, 14, 1)
              }
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
            <span>0</span>
            <span>{config.maxSuv.toFixed(1)}</span>
          </div>
        </div>

        <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Field
            icon={<Sliders size={11} />}
            label={`SUV 阈值 (${config.threshold.toFixed(1)})`}
            value={config.threshold}
            min={0}
            max={20}
            step={0.1}
            onChange={handleThreshold}
          />
          <Field
            icon={<Sliders size={11} />}
            label={`最大 SUV (${config.maxSuv.toFixed(1)})`}
            value={config.maxSuv}
            min={2}
            max={40}
            step={0.5}
            onChange={handleMax}
          />
          <Field
            icon={<Sliders size={11} />}
            label={`不透明度 (${(config.opacity * 100).toFixed(0)}%)`}
            value={config.opacity}
            min={0}
            max={1}
            step={0.05}
            onChange={handleOpacity}
          />

          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>颜色表</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  data-testid={`suv-cmap-${c}`}
                  onClick={() => handleColor(c)}
                  style={{
                    background: config.colorMap === c ? '#1e40af' : '#1e293b',
                    border: '1px solid',
                    borderColor: config.colorMap === c ? '#3b82f6' : '#334155',
                    color: '#cbd5e1',
                    borderRadius: 3,
                    padding: '3px 4px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {stats && (
            <div style={{ background: '#0f172a', borderRadius: 4, padding: 8, fontSize: 12, color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', marginBottom: 4 }}>
                <BarChart3 size={11} /> 统计
              </div>
              <StatLine label="SUVmax" value={stats.suvMax.toFixed(2)} color="#ef4444" />
              <StatLine label="SUVmean" value={stats.suvMean.toFixed(2)} color="#fbbf24" />
              <StatLine label="MTV" value={`${stats.metabolicVolume.toFixed(1)} mL`} color="#22d3ee" />
              <StatLine label="TLG" value={stats.totalLesionGlycolysis.toFixed(1)} color="#a78bfa" />
              <Histogram data={stats.histogram} maxSuv={config.maxSuv} threshold={config.threshold} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, min, max, step, icon }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; icon?: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>
        {icon}
        {label}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  )
}

function StatLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function Histogram({ data, maxSuv, threshold }: { data: number[]; maxSuv: number; threshold: number }) {
  const max = Math.max(...data, 1)
  return (
    <div style={{ marginTop: 6, height: 36, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
      {data.map((v, i) => {
        const t = (i / data.length) * maxSuv
        const above = t >= threshold
        const map = SUV_COLOR_MAPS.hot!
        const [r, g, b] = sampleColorMap(map, t / maxSuv)
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${(v / max) * 100}%`,
              background: above ? `rgb(${r},${g},${b})` : 'rgba(71,85,105,0.4)',
              minHeight: 1,
            }}
          />
        )
      })}
    </div>
  )
}

export default PetCtSuvViewer
