/**
 * G005 放射RIS系统 v3.0.1 - DICOM 四象限信息叠加
 * 对标 GE / 西门子 / 岱嘉
 * TL: 检查/患者 / TR: 窗宽窗位 / BL: 测量数据 / BR: 序列/实例号
 */
import React from 'react'

export interface OverlayQuadData {
  patient?: { name?: string; id?: string; age?: number; sex?: string }
  study?: { description?: string; date?: string; modality?: string }
  ww?: number
  wl?: number
  measurements?: { label: string; value: string }[]
  series?: { number: number; total: number; description?: string }
  instance?: { number: number; total: number }
  zoom?: number
  fps?: number
}

export interface OverlayQuadProps {
  data: OverlayQuadData
  visible?: boolean
  background?: string
  textColor?: string
}

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  background: 'rgba(0,0,0,0.75)',
  color: '#fff',
  fontSize: 11,
  padding: '4px 8px',
  borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.1)',
  pointerEvents: 'none',
  lineHeight: 1.5,
  fontFamily: 'monospace',
  maxWidth: 280,
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
}

const labelStyle: React.CSSProperties = {
  opacity: 0.6,
  fontSize: 10,
}

const valueStyle: React.CSSProperties = {
  fontWeight: 600,
}

export const OverlayQuad: React.FC<OverlayQuadProps> = ({ data, visible = true }) => {
  if (!visible) return null
  return (
    <div data-testid="overlay-quad" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ ...containerStyle, top: 8, left: 8 }} data-testid="overlay-tl">
        {data.patient && (
          <div style={rowStyle}>
            <span style={labelStyle}>患者</span>
            <span style={valueStyle}>
              {data.patient.name ?? '-'} {data.patient.sex ?? ''}/{data.patient.age ?? '-'}
            </span>
            <span style={labelStyle}>{data.patient.id ?? ''}</span>
          </div>
        )}
        {data.study && (
          <div style={rowStyle}>
            <span style={labelStyle}>检查</span>
            <span style={valueStyle}>
              {data.study.modality ?? ''} {data.study.description ?? ''}
            </span>
          </div>
        )}
        {data.study?.date && (
          <div style={rowStyle}>
            <span style={labelStyle}>日期</span>
            <span style={valueStyle}>{data.study.date}</span>
          </div>
        )}
      </div>

      <div style={{ ...containerStyle, top: 8, right: 8 }} data-testid="overlay-tr">
        <div style={rowStyle}>
          <span style={labelStyle}>WW</span>
          <span style={valueStyle}>{data.ww ?? '-'}</span>
          <span style={labelStyle}>WL</span>
          <span style={valueStyle}>{data.wl ?? '-'}</span>
        </div>
        {data.zoom != null && (
          <div style={rowStyle}>
            <span style={labelStyle}>缩放</span>
            <span style={valueStyle}>{(data.zoom * 100).toFixed(0)}%</span>
          </div>
        )}
        {data.fps != null && (
          <div style={rowStyle}>
            <span style={labelStyle}>FPS</span>
            <span style={valueStyle}>{data.fps}</span>
          </div>
        )}
      </div>

      <div style={{ ...containerStyle, bottom: 8, left: 8 }} data-testid="overlay-bl">
        {data.measurements && data.measurements.length > 0 ? (
          <>
            {data.measurements.map((m, i) => (
              <div key={i} style={rowStyle}>
                <span style={labelStyle}>{m.label}</span>
                <span style={valueStyle}>{m.value}</span>
              </div>
            ))}
          </>
        ) : (
          <div style={{ opacity: 0.4 }}>无测量</div>
        )}
      </div>

      <div style={{ ...containerStyle, bottom: 8, right: 8 }} data-testid="overlay-br">
        {data.series && (
          <div style={rowStyle}>
            <span style={labelStyle}>序列</span>
            <span style={valueStyle}>
              {data.series.number}/{data.series.total}
            </span>
            {data.series.description && <span style={labelStyle}>{data.series.description}</span>}
          </div>
        )}
        {data.instance && (
          <div style={rowStyle}>
            <span style={labelStyle}>实例</span>
            <span style={valueStyle}>
              {data.instance.number}/{data.instance.total}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OverlayQuad
