import { Layers } from 'lucide-react'

export interface SeriesInfo {
  id: string
  seriesNumber: number
  seriesDescription: string
  modality: string
  instanceCount: number
  thumbnail?: string
}

export interface SeriesListProps {
  series: SeriesInfo[]
  activeSeriesId: string
  onSeriesSelect: (seriesId: string) => void
}

const MOCK_SERIES: SeriesInfo[] = [
  { id: 's1', seriesNumber: 1, seriesDescription: '胸部平扫 轴位', modality: 'CT', instanceCount: 128 },
  { id: 's2', seriesNumber: 2, seriesDescription: '胸部平扫 冠状位', modality: 'CT', instanceCount: 96 },
  { id: 's3', seriesNumber: 3, seriesDescription: '胸部平扫 矢状位', modality: 'CT', instanceCount: 96 },
  { id: 's4', seriesNumber: 4, seriesDescription: '胸部增强 轴位', modality: 'CT', instanceCount: 128 },
]

export default function SeriesList({ series = MOCK_SERIES, activeSeriesId, onSeriesSelect }: SeriesListProps) {
  return (
    <div style={{ background: '#1a1a2e', padding: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: '4px 8px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Layers size={14} /> 序列列表 ({series.length})
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0' }}>
        {series.map(s => (
          <div key={s.id} onClick={() => onSeriesSelect(s.id)}
            style={{ flexShrink: 0, width: 100, padding: 8, borderRadius: 8, cursor: 'pointer', background: activeSeriesId === s.id ? '#3b82f6' : 'rgba(255,255,255,0.08)', border: activeSeriesId === s.id ? '1px solid #3b82f6' : '1px solid transparent' }}>
            <div style={{ width: '100%', aspectRatio: '1', background: 'linear-gradient(135deg, #16213e, #1a1a2e)', borderRadius: 4, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
              {s.modality}
            </div>
            <div style={{ fontSize: 10, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              S{s.seriesNumber}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{s.instanceCount}幅</div>
          </div>
        ))}
      </div>
    </div>
  )
}
