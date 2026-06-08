/**
 * G005 放射RIS系统 v3.0.1 - 序列缩略图条
 * 对标 GE Centricity / Siemens syngo / 联影 uAI
 * 功能:底部 100px 高,72x72 缩略图,激活边框,2x1 网格缩略
 */
import React, { useState, useCallback } from 'react'
import { Tooltip } from 'antd'
import { Image as ImageIcon } from 'lucide-react'

export interface DicomSeries {
  id: string
  seriesNumber: number
  modality: string
  bodyPart: string
  description: string
  instanceCount: number
  thumbnail?: string
}

export interface SequenceThumbnailStripProps {
  series: DicomSeries[]
  activeId?: string
  onSelect?: (seriesId: string) => void
  height?: number
  thumbnailSize?: number
}

export const SequenceThumbnailStrip: React.FC<SequenceThumbnailStripProps> = ({
  series,
  activeId,
  onSelect,
  height = 100,
  thumbnailSize = 72,
}) => {
  const [internalActive, setInternalActive] = useState<string | undefined>(activeId ?? series[0]?.id)
  const current = activeId ?? internalActive

  const handleClick = useCallback(
    (id: string) => {
      if (!activeId) setInternalActive(id)
      onSelect?.(id)
    },
    [activeId, onSelect]
  )

  return (
    <div
      data-testid="sequence-thumbnail-strip"
      style={{
        background: '#0d1117',
        borderTop: '1px solid #1e2533',
        height,
        padding: 10,
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      {series.map((s) => {
        const active = s.id === current
        return (
          <Tooltip
            key={s.id}
            title={
              <div style={{ fontSize: 12 }}>
                <div>Series {s.seriesNumber}</div>
                <div>{s.modality} · {s.bodyPart}</div>
                <div>{s.description}</div>
                <div>{s.instanceCount} 帧</div>
              </div>
            }
          >
            <div
              onClick={() => handleClick(s.id)}
              data-testid={`series-thumb-${s.id}`}
              style={{
                width: thumbnailSize,
                height: thumbnailSize,
                borderRadius: 6,
                background: s.thumbnail ? `url(${s.thumbnail}) center/cover` : '#1e2533',
                border: active ? '2px solid #1e3a5f' : '2px solid transparent',
                boxShadow: active ? '0 0 12px #1e3a5f' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s',
                color: '#64748b',
                fontSize: 10,
                fontWeight: 600,
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {!s.thumbnail && (
                <>
                  <ImageIcon size={20} />
                  <span>#{s.seriesNumber}</span>
                </>
              )}
            </div>
          </Tooltip>
        )
      })}
    </div>
  )
}

export default SequenceThumbnailStrip
