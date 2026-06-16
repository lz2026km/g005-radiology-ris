import type { CSSProperties } from 'react'

const containerStyle: CSSProperties = {
  padding: 24,
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: 13,
  background: '#f8fafc',
  borderRadius: 8,
  border: '1px dashed #e2e8f0',
  marginBottom: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
}

const iconStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: '#e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 4,
}

export function EmptyBanner({ message = '暂无数据' }: { message?: string }) {
  return (
    <div style={containerStyle} data-testid="empty-banner" role="status">
      <div style={iconStyle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
      </div>
      <span>{message}</span>
    </div>
  )
}
