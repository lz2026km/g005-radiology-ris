/**
 * G005 放射RIS系统 v3.0.6.1 - 任务链 (Task Chain)
 */
import React from 'react'
import { Tag, Button, Tooltip } from 'antd'
import { Zap, Bell, CheckCircle, GitBranch, Trash2, Bot } from 'lucide-react'

export type TaskType = 'TRIGGER' | 'AI' | 'TASK' | 'NOTIFY' | 'CONDITION' | 'END'

export interface TaskNode {
  id: string
  type: TaskType
  label: string
  x: number
  y: number
  config: Record<string, unknown>
}

export interface TaskChainProps {
  nodes: TaskNode[]
  onUpdate?: (id: string, patch: Partial<TaskNode>) => void
  onRemove?: (id: string) => void
}

const TYPE_META: Record<TaskType, { color: string; icon: React.ReactNode; label: string }> = {
  TRIGGER: { color: 'blue', icon: <Zap size={12} />, label: '触发' },
  AI: { color: 'purple', icon: <Bot size={12} />, label: 'AI' },
  TASK: { color: 'orange', icon: <CheckCircle size={12} />, label: '任务' },
  NOTIFY: { color: 'cyan', icon: <Bell size={12} />, label: '通知' },
  CONDITION: { color: 'gold', icon: <GitBranch size={12} />, label: '条件' },
  END: { color: 'green', icon: <CheckCircle size={12} />, label: '结束' },
}

export const TaskChain: React.FC<TaskChainProps> = ({ nodes, onUpdate: _onUpdate, onRemove }) => {
  return (
    <div data-testid="task-chain">
      <div style={{ position: 'relative', height: 100 }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {nodes.slice(0, -1).map((n, i) => {
            const next = nodes[i + 1]
            if (!next) return null
            return (
              <line key={`l-${n.id}`} x1={n.x + 100} y1={50} x2={next.x} y2={50} stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" />
            )
          })}
        </svg>
        {nodes.map((n) => {
          const meta = TYPE_META[n.type]
          return (
            <div
              key={n.id}
              data-testid={`task-${n.id}`}
              style={{
                position: 'absolute',
                left: n.x,
                top: n.y,
                width: 100,
                background: '#fff',
                border: `2px solid ${meta.color === 'blue' ? '#3b82f6' : meta.color === 'purple' ? '#a855f7' : meta.color === 'orange' ? '#f97316' : meta.color === 'cyan' ? '#06b6d4' : meta.color === 'gold' ? '#eab308' : '#16a34a'}`,
                borderRadius: 6,
                padding: 8,
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                {meta.icon} {n.label}
              </div>
              <Tag color={meta.color as string} style={{ marginTop: 4, fontSize: 10 }}>{meta.label}</Tag>
              {onRemove && (
                <Tooltip title="删除">
                  <Button
                    type="text"
                    size="small"
                    icon={<Trash2 size={10} />}
                    onClick={(e) => { e.stopPropagation(); onRemove(n.id) }}
                    style={{ position: 'absolute', top: 2, right: 2 }}
                  />
                </Tooltip>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TaskChain