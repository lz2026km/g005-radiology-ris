/**
 * G005 放射RIS系统 v3.0.6.1 - 乳腺 AI 叠加层
 */
import React from 'react'
import { Card, Tag, Empty, Space } from 'antd'

export type MammoLesionType = 'MASS' | 'CALCIFICATION' | 'ARCHITECTURAL_DISTORTION' | 'ASYMMETRY'

export interface MammoLesionMark {
  id: string
  x: number
  y: number
  type: MammoLesionType
  confidence: number
  birads: string
  size_mm: number
}

export interface MammoOverlayProps {
  marks: MammoLesionMark[]
  show?: boolean
  onAccept?: (m: MammoLesionMark) => void
}

const TYPE_COLOR: Record<MammoLesionType, string> = {
  MASS: '#dc2626',
  CALCIFICATION: '#f59e0b',
  ARCHITECTURAL_DISTORTION: '#8b5cf6',
  ASYMMETRY: '#3b82f6',
}

const TYPE_LABEL: Record<MammoLesionType, string> = {
  MASS: '肿块',
  CALCIFICATION: '钙化',
  ARCHITECTURAL_DISTORTION: '结构紊乱',
  ASYMMETRY: '不对称',
}

export const MammoOverlay: React.FC<MammoOverlayProps> = ({ marks, show = true, onAccept }) => {
  return (
    <Card size="small" title="乳腺影像 (CC 位) - AI 叠加" data-testid="mammo-overlay">
      <div
        style={{
          position: 'relative',
          height: 320,
          background: '#1e293b',
          borderRadius: 6,
          backgroundImage: 'radial-gradient(circle at 40% 50%, #475569 0%, #1e293b 60%)',
          overflow: 'hidden',
        }}
      >
        {show ? marks.map((m) => (
          <div
            key={m.id}
            data-testid={`overlay-mark-${m.id}`}
            onClick={() => onAccept?.(m)}
            style={{
              position: 'absolute',
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: 32,
              height: 32,
              borderRadius: m.type === 'CALCIFICATION' ? '50%' : 4,
              border: `2px solid ${TYPE_COLOR[m.type]}`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              boxShadow: `0 0 8px ${TYPE_COLOR[m.type]}`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 36,
                left: 0,
                fontSize: 9,
                color: '#fff',
                background: TYPE_COLOR[m.type],
                padding: '1px 4px',
                borderRadius: 2,
                whiteSpace: 'nowrap',
              }}
            >
              {TYPE_LABEL[m.type]} {m.size_mm}mm BI-RADS {m.birads}
            </div>
          </div>
        )) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="AI 叠加已关闭" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <Space wrap>
          {Object.entries(TYPE_COLOR).map(([t, c]) => (
            <Tag key={t} color={c}>{TYPE_LABEL[t as MammoLesionType]}</Tag>
          ))}
        </Space>
      </div>
    </Card>
  )
}

export default MammoOverlay