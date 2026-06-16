import type { CSSProperties } from 'react'

const containerStyle: CSSProperties = {
  padding: 8,
  marginBottom: 12,
  background: '#dbeafe',
  color: '#1e40af',
  borderRadius: 6,
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const spinnerStyle: CSSProperties = {
  width: 14,
  height: 14,
  border: '2px solid #93c5fd',
  borderTopColor: '#1e40af',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  display: 'inline-block',
}

export function LoadingBanner({ message = '正在从 API 加载数据...' }: { message?: string }) {
  return (
    <div style={containerStyle} data-testid="api-loading-banner" role="status" aria-live="polite" aria-busy="true">
      <span style={spinnerStyle} />
      <span>{message}</span>
    </div>
  )
}
