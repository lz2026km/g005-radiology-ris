import type { ReactNode, CSSProperties } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  color?: string
  trend?: { value: number; isUp?: boolean }
  style?: CSSProperties
}

export function StatCard({ title, value, icon, color = '#3b82f6', trend, style }: StatCardProps) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>}
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f' }}>{value}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            {title}
            {trend && <span style={{ color: trend.isUp ? '#059669' : '#dc2626', fontWeight: 600 }}>{trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
