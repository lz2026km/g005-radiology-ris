/**
 * G005 放射RIS系统 v3.0.6.1 - AI 分诊队列 (列表视图)
 */
import React from 'react'
import { Empty, List, Button, Tag, Space, Progress } from 'antd'
import { TriageCard, type TriageItem } from './TriageCard'

export interface TriageQueueProps {
  items: TriageItem[]
  onAssign?: (id: string, assignee: string) => void
  onSelect?: (item: TriageItem) => void
  loading?: boolean
  view?: 'list' | 'card'
}

export const TriageQueue: React.FC<TriageQueueProps> = ({ items, onSelect, view = 'card' }) => {
  if (items.length === 0) return <Empty description="队列为空" />

  if (view === 'list') {
    return (
      <List
        size="small"
        dataSource={items}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            data-testid={`queue-row-${item.id}`}
            actions={[
              <Button key="sel" size="small" onClick={() => onSelect?.(item)}>选择</Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <span>{item.patientName}</span>
                  <Tag>{item.patientId}</Tag>
                  <Tag color="blue">{item.modality} {item.bodyPart}</Tag>
                  <Tag color={item.priority === 'STAT' ? 'red' : 'orange'}>{item.priority}</Tag>
                </Space>
              }
              description={
                <Space>
                  <span style={{ fontSize: 11 }}>{item.arrivedAt}</span>
                  <Progress percent={Math.round(item.confidence * 100)} size="small" style={{ width: 80 }} />
                </Space>
              }
            />
          </List.Item>
        )}
      />
    )
  }

  return (
    <div data-testid="triage-queue">
      {items.map((it) => (
        <TriageCard
          key={it.id}
          item={it}
          onAssign={(id) => onSelect?.(items.find((x) => x.id === id) ?? it)}
        />
      ))}
    </div>
  )
}

export default TriageQueue