/**
 * G005 放射RIS系统 v3.0.6.1 - 优先级徽章
 */
import React from 'react'
import { Tag, Tooltip } from 'antd'

export type Priority = 'STAT' | 'URGENT' | 'ROUTINE' | 'LOW'

export interface PriorityBadgeProps {
  priority: Priority | string
  size?: 'small' | 'default'
  showIcon?: boolean
  tooltip?: string
}

const META: Record<string, { color: string; label: string; emoji: string }> = {
  STAT: { color: 'red', label: 'STAT', emoji: '🚨' },
  URGENT: { color: 'orange', label: '加急', emoji: '⚡' },
  ROUTINE: { color: 'blue', label: '常规', emoji: '🟢' },
  LOW: { color: 'default', label: '低', emoji: '⚪' },
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, tooltip }) => {
  const meta: { color: string; label: string; emoji: string } = META[priority] ?? META.ROUTINE!
  const badge = (
    <Tag color={meta.color} data-testid={`priority-${priority}`} style={{ fontWeight: 600 }}>
      {meta.emoji} {meta.label}
    </Tag>
  )
  if (tooltip) return <Tooltip title={tooltip}>{badge}</Tooltip>
  return badge
}

export default PriorityBadge