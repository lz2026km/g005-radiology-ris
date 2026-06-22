import type { CSSProperties } from 'react'

const bannerStyle: CSSProperties = {
  position: 'sticky',
  top: 52,
  zIndex: 'var(--z-fixed)' as unknown as number,
  padding: '6px 16px',
  background: '#dc2626',
  color: '#ffffff',
  fontSize: 12,
  fontWeight: 600,
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

export function NetworkOfflineBanner() {
  return (
    <div style={bannerStyle} role="alert" aria-live="assertive" data-testid="network-offline-banner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.88 15.88 0 0 1 4.4-2.84" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      网络已断开，部分功能不可用
    </div>
  )
}