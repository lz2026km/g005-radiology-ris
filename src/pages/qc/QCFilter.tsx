import { Search } from 'lucide-react'

const ACCENT = '#3b82f6'
const GRAY = '#64748b'
const LIGHT_BG = '#f8fafc'
const BORDER = '#e2e8f0'
const WHITE = '#ffffff'
const PRIMARY = '#1e40af'

export interface QCFilterProps {
  search: string
  onSearchChange: (value: string) => void
  filterStatus: string
  onFilterStatusChange: (value: string) => void
  statusOptions?: string[]
}

export default function QCFilter({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  statusOptions = ['全部', '优秀', '良好', '一般', '差'],
}: QCFilterProps) {
  return (
    <div style={{ background: WHITE, borderRadius: 10, padding: 12, border: `1px solid ${BORDER}`, display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: LIGHT_BG, borderRadius: 8, padding: '8px 12px' }}>
        <Search size={14} color={GRAY} />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="搜索患者姓名、报告ID..."
          style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%', background: 'transparent', color: PRIMARY }}
        />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {statusOptions.map(s => (
          <button
            key={s}
            onClick={() => onFilterStatusChange(s)}
            style={{
              padding: '4px 12px',
              borderRadius: 16,
              border: `1px solid ${filterStatus === s ? ACCENT : BORDER}`,
              background: filterStatus === s ? ACCENT : WHITE,
              color: filterStatus === s ? WHITE : GRAY,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
