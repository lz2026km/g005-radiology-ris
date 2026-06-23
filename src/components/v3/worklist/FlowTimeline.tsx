/**
 * G005 放射RIS系统 v3.0.1 - 检查流程 14 态可视化时间线
 * 对标英飞达 PACS — 节点化流程
 */
import React from 'react'
import { Tag, Tooltip, Space } from 'antd'
import { Check, Clock, Circle } from 'lucide-react'

export interface FlowState {
  key: string
  label: string
  description?: string
  timestamp?: string
  actor?: string
  status?: 'done' | 'current' | 'pending' | 'skipped'
}

export const DEFAULT_FLOW: FlowState[] = [
  { key: 'registered', label: '已登记' },
  { key: 'scheduled', label: '已预约' },
  { key: 'checkedIn', label: '已报到' },
  { key: 'inProgress', label: '检查中' },
  { key: 'completed', label: '已完成' },
  { key: 'reportWriting', label: '书写中' },
  { key: 'reportSubmitted', label: '已提交' },
  { key: 'reviewed', label: '已审核' },
  { key: 'signed', label: '已签发' },
  { key: 'published', label: '已发布' },
  { key: 'amended', label: '已修订' },
  { key: 'archived', label: '已归档' },
]

export const CRITICAL_FLOW: FlowState[] = [
  { key: 'found', label: '已发现' },
  { key: 'notified', label: '已通知' },
  { key: 'acknowledged', label: '已确认' },
  { key: 'resolving', label: '处理中' },
  { key: 'resolved', label: '已闭环' },
]

const statusIcon = (status: FlowState['status']) => {
  if (status === 'done') return <Check size={12} color="#fff" />
  if (status === 'current') return <Clock size={12} color="#fff" />
  return <Circle size={10} color="#94a3b8" />
}

const statusColor = (status: FlowState['status']) => {
  if (status === 'done') return '#059669'
  if (status === 'current') return '#2563eb'
  if (status === 'skipped') return '#94a3b8'
  return '#e2e8f0'
}

export interface FlowTimelineProps {
  states: FlowState[]
  currentKey?: string
  orientation?: 'horizontal' | 'vertical'
  showTimestamp?: boolean
  showActor?: boolean
}

const autoFillStatus = (states: FlowState[], currentKey?: string): FlowState[] => {
  if (!currentKey) return states.map((s) => ({ ...s, status: s.status ?? 'pending' }))
  const idx = states.findIndex((s) => s.key === currentKey)
  return states.map((s, i) => {
    if (s.status) return s
    if (i < idx) return { ...s, status: 'done' as const }
    if (i === idx) return { ...s, status: 'current' as const }
    return { ...s, status: 'pending' as const }
  })
}

export const FlowTimeline: React.FC<FlowTimelineProps> = ({
  states,
  currentKey,
  orientation = 'horizontal',
  showTimestamp = true,
  showActor = true,
}) => {
  const filled = autoFillStatus(states, currentKey)

  if (orientation === 'vertical') {
    return (
      <div data-testid="flow-timeline-vertical">
        {filled.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: statusColor(s.status),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              data-testid={`flow-node-${s.key}`}
            >
              {statusIcon(s.status)}
            </div>
            <div style={{ flex: 1, paddingTop: 2 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: s.status === 'pending' ? '#94a3b8' : '#1e293b' }}>
                {s.label}
              </div>
              {s.description && <div style={{ fontSize: 12, color: '#64748b' }}>{s.description}</div>}
              {(showTimestamp && s.timestamp || showActor && s.actor) && (
                <div style={{ marginTop: 4 }}>
                  {showTimestamp && s.timestamp && <Tag color="default">{s.timestamp}</Tag>}
                  {showActor && s.actor && <Tag color="blue">{s.actor}</Tag>}
                </div>
              )}
            </div>
            {i < filled.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: 11,
                  top: 24,
                  width: 2,
                  height: 24,
                  background: '#e2e8f0',
                }}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      data-testid="flow-timeline-horizontal"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '12px 8px',
        background: '#f8fafc',
        borderRadius: 8,
        overflowX: 'auto',
      }}
    >
      {filled.map((s, i) => (
        <React.Fragment key={s.key}>
          <Tooltip
            title={
              <div style={{ fontSize: 12 }}>
                <div>{s.label}</div>
                {s.description && <div>{s.description}</div>}
                {s.timestamp && <div>{s.timestamp}</div>}
                {s.actor && <div>操作人:{s.actor}</div>}
              </div>
            }
          >
            <div
              data-testid={`flow-node-${s.key}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: statusColor(s.status),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  border: s.status === 'current' ? '2px solid #fff' : 'none',
                  boxShadow: s.status === 'current' ? '0 0 0 2px #2563eb' : 'none',
                }}
              >
                {statusIcon(s.status)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  fontWeight: 600,
                  color: s.status === 'pending' ? '#94a3b8' : '#1e293b',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </div>
              {showTimestamp && s.timestamp && (
                <div style={{ fontSize: 12, color: '#64748b' }}>{s.timestamp}</div>
              )}
            </div>
          </Tooltip>
          {i < filled.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                background: filled[i + 1]?.status === 'pending' ? '#e2e8f0' : '#059669',
                margin: '0 4px',
                marginBottom: 18,
                minWidth: 24,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default FlowTimeline
