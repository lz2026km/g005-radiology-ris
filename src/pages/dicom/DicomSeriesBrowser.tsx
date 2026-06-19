import { Layers, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Series } from './types'

const s = {
  seriesStrip: {
    height: 100,
    background: '#0d1117',
    borderTop: `1px solid #1e2533`,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 16px',
    overflowX: 'auto',
    flexShrink: 0,
  },
  seriesThumb: {
    width: 72,
    height: 72,
    borderRadius: 6,
    border: '2px solid #333',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flexShrink: 0,
    transition: 'all 0.2s',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  seriesThumbActive: {
    border: '2px solid #1e3a5f',
    boxShadow: '0 0 12px #1e3a5f',
  },
  seriesThumbInner: {
    width: 48,
    height: 48,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    color: '#fff',
    fontWeight: 700,
  },
  layoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    transition: 'all 0.15s',
  },
}

interface DicomSeriesBrowserProps {
  seriesList: Series[]
  activeSeriesIdx: number
  handleSeriesSelect: (idx: number) => void
  modality: string
  bodyPart: string
  onPrevImage: () => void
  onNextImage: () => void
}

export default function DicomSeriesBrowser({
  seriesList, activeSeriesIdx, handleSeriesSelect,
  modality, bodyPart, onPrevImage, onNextImage,
}: DicomSeriesBrowserProps) {
  return (
    <div style={s.seriesStrip}>
      {seriesList.map((sItem, idx) => (
        <div
          key={sItem.id}
          style={{
            ...s.seriesThumb,
            ...(activeSeriesIdx === idx ? s.seriesThumbActive : {}),
          }}
          onClick={() => handleSeriesSelect(idx)}
          title={`${sItem.seriesDescription} (${sItem.imageCount}幅)`}
        >
          <div style={{
            ...s.seriesThumbInner,
            background: sItem.thumbnail,
            opacity: activeSeriesIdx === idx ? 1 : 0.7,
          }}>
            <Layers size={16} />
          </div>
          <span style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>
            {sItem.seriesNumber}
          </span>
          <span style={{ fontSize: 8, color: '#6b7280' }}>
            {sItem.imageCount}幅
          </span>
        </div>
      ))}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#6b7280' }}>
          {modality} · {bodyPart}
        </span>
        <button
          style={{ ...s.layoutBtn, background: '#1e3a5f', borderColor: '#1e3a5f' }}
          onClick={onPrevImage}
          title="上一幅"
        >
          <ChevronLeft size={14} color="#fff" />
        </button>
        <button
          style={{ ...s.layoutBtn, background: '#1e3a5f', borderColor: '#1e3a5f' }}
          onClick={onNextImage}
          title="下一幅"
        >
          <ChevronRight size={14} color="#fff" />
        </button>
      </div>
    </div>
  )
}
