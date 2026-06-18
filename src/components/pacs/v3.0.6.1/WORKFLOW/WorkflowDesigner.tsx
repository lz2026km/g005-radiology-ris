/**
 * G005 放射RIS系统 v3.0.6.1 - 工作流设计器 (Workflow Designer)
 * 对标:Visual Workflow / BPMN-lite
 */
import React, { useState } from 'react'
import { Card, Space, Tag, Button, Select, Input } from 'antd'
import { Plus, Play, Save, GitBranch } from 'lucide-react'
import { TaskChain, type TaskNode } from './TaskChain'

export interface WorkflowDef {
  id: string
  name: string
  trigger: string
  nodes: TaskNode[]
  enabled: boolean
}

const DEFAULT_NODES: TaskNode[] = [
  { id: 'n1', type: 'TRIGGER', label: '检查完成', x: 30, y: 20, config: {} },
  { id: 'n2', type: 'AI', label: 'AI 分诊', x: 200, y: 20, config: { algorithm: 'CT-Lung-Nodule' } },
  { id: 'n3', type: 'TASK', label: '危急值检查', x: 370, y: 20, config: { sla: 30 } },
  { id: 'n4', type: 'NOTIFY', label: '短信通知', x: 540, y: 20, config: { channel: 'SMS' } },
  { id: 'n5', type: 'END', label: '归档', x: 700, y: 20, config: {} },
]

export interface WorkflowDesignerProps {
  workflow?: WorkflowDef
}

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({ workflow }) => {
  const [name, setName] = useState(workflow?.name ?? '危急值自动通知')
  const [trigger, setTrigger] = useState(workflow?.trigger ?? 'EXAM_COMPLETED')
  const [nodes, setNodes] = useState<TaskNode[]>(workflow?.nodes ?? DEFAULT_NODES)

  const remove = (id: string) => setNodes(nodes.filter((n) => n.id !== id))
  const updateNode = (id: string, patch: Partial<TaskNode>) => {
    setNodes(nodes.map((n) => n.id === id ? { ...n, ...patch } : n))
  }

  return (
    <div data-testid="workflow-designer">
      <Card
        size="small"
        title={<Space><GitBranch size={14} />工作流设计器</Space>}
        extra={
          <Space>
            <Tag color="blue">{nodes.length} 节点</Tag>
            <Button size="small" icon={<Play size={12} />}>试运行</Button>
            <Button size="small" type="primary" icon={<Save size={12} />}>保存</Button>
          </Space>
        }
      >
        <Space wrap style={{ marginBottom: 12 }}>
          <span>名称:</span>
          <Input size="small" value={name} onChange={(e) => setName(e.target.value)} style={{ width: 200 }} />
          <span>触发器:</span>
          <Select
            size="small"
            value={trigger}
            onChange={setTrigger}
            style={{ width: 180 }}
            options={[
              { value: 'EXAM_COMPLETED', label: '检查完成' },
              { value: 'CRITICAL_FOUND', label: '危急值发现' },
              { value: 'MANUAL', label: '手动' },
            ]}
          />
          <Button size="small" icon={<Plus size={12} />} onClick={() => setNodes([...nodes, { id: `n${Date.now()}`, type: 'TASK', label: '新任务', x: nodes.length * 170 + 30, y: 20, config: {} }])}>
            节点
          </Button>
        </Space>
        <div
          data-testid="workflow-canvas"
          style={{
            minHeight: 200,
            background: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: 6,
            padding: 12,
            position: 'relative',
            overflow: 'auto',
          }}
        >
          <TaskChain nodes={nodes} onUpdate={updateNode} onRemove={remove} />
        </div>
      </Card>
    </div>
  )
}

export default WorkflowDesigner