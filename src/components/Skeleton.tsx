// P8: 首屏数据区域使用Skeleton骨架屏
import React from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style = {}
}) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.5s infinite',
      ...style
    }}
  />
)

// 表格行骨架屏
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} style={{ padding: '12px 8px' }}>
        <Skeleton height={16} width={i === 0 ? '60%' : '80%'} />
      </td>
    ))}
  </tr>
)

// 卡片骨架屏
export const CardSkeleton: React.FC = () => (
  <div style={{
    padding: 20,
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <Skeleton height={24} width="40%" style={{ marginBottom: 16 }} />
    <Skeleton height={16} style={{ marginBottom: 8 }} />
    <Skeleton height={16} width="70%" style={{ marginBottom: 8 }} />
    <Skeleton height={16} width="50%" />
  </div>
)

// 统计卡片骨架屏
export const StatCardSkeleton: React.FC = () => (
  <div style={{
    padding: 20,
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <Skeleton height={14} width="50%" style={{ marginBottom: 12 }} />
    <Skeleton height={32} width="60%" style={{ marginBottom: 8 }} />
    <Skeleton height={12} width="40%" />
  </div>
)

// 检查列表项骨架屏
export const ExamListItemSkeleton: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#fff',
    borderRadius: 6,
    marginBottom: 8
  }}>
    <Skeleton width={40} height={40} borderRadius="50%" />
    <div style={{ flex: 1 }}>
      <Skeleton height={16} width="50%" style={{ marginBottom: 6 }} />
      <Skeleton height={12} width="30%" />
    </div>
    <Skeleton width={60} height={24} borderRadius={4} />
  </div>
)

// 添加CSS动画
const skeletonStyles = `
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`

export const SkeletonStyles: React.FC = () => (
  <style>{skeletonStyles}</style>
)

export default {
  Skeleton,
  TableRowSkeleton,
  CardSkeleton,
  StatCardSkeleton,
  ExamListItemSkeleton,
  SkeletonStyles
}