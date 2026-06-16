import type { CSSProperties } from 'react'

const containerStyle: CSSProperties = {
  padding: 8,
  marginBottom: 12,
  background: '#fef3c7',
  color: '#92400e',
  borderRadius: 6,
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

export function ErrorBanner({ message = 'API 不可用,使用本地数据' }: { message?: string }) {
  return (
    <div style={containerStyle} data-testid="api-error-banner" role="alert" aria-live="assertive">
      <span aria-hidden="true">⚠️</span> {message}
    </div>
  )
}
