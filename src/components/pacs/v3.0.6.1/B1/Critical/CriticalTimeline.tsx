/**
 * G005 放射RIS系统 v3.0.6.1 - 危急值时间轴
 */
import React from 'react'
import { Timeline, Tag, Space } from 'antd'
import { Bell, Phone, MessageSquare, Mail, CheckCircle, XCircle } from 'lucide-react'
import type { CriticalFlowItem } from './CriticalFlow'

export interface CriticalTimelineProps {
  item: CriticalFlowItem
}

export const CriticalTimeline: React.FC<CriticalTimelineProps> = ({ item }) => {
  const events: { ts: string; label: string; color: string; icon: React.ReactNode }[] = [
    { ts: item.triggeredAt, label: `AI 触发: ${item.notifier}`, color: 'red', icon: <Bell size={12} /> },
  ]
  item.notifMethod.forEach((m) => {
    const icon = m === 'PHONE' ? <Phone size={12} /> : m === 'SMS' ? <MessageSquare size={12} /> : m === 'EMAIL' ? <Mail size={12} /> : <MessageSquare size={12} />
    events.push({ ts: item.triggeredAt, label: `通知:${m}`, color: 'blue', icon })
  })
  if (item.acknowledgedAt) {
    events.push({ ts: item.acknowledgedAt, label: `${item.acker} 已确认`, color: 'green', icon: <CheckCircle size={12} /> })
  } else {
    events.push({ ts: '—', label: '等待临床确认', color: 'gray', icon: <XCircle size={12} /> })
  }
  if (item.closedAt) {
    events.push({ ts: item.closedAt, label: '闭环完成', color: 'green', icon: <CheckCircle size={12} /> })
  }

  return (
    <Timeline
      data-testid="critical-timeline"
      items={events.map((e, i) => ({
        key: i,
        color: e.color,
        dot: e.icon,
        children: (
          <Space size={6}>
            <span style={{ fontSize: 12 }}>{e.label}</span>
            <Tag color={e.color}>{e.ts}</Tag>
          </Space>
        ),
      }))}
    />
  )
}

export default CriticalTimeline