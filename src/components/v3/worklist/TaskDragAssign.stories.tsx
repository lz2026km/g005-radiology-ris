/**
 * G005 放射RIS系统 v3.0.1 - TaskDragAssign Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { TaskDragAssign, type WorklistColumn } from './TaskDragAssign'

const meta: Meta<typeof TaskDragAssign> = {
  title: 'v3/Worklist/TaskDragAssign',
  component: TaskDragAssign,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof TaskDragAssign>

const columns: WorklistColumn[] = [
  { id: 'pending', title: '待开始', color: '#1e3a5f', items: [
    { id: '1', patientName: '张三', modality: 'CT', bodyPart: 'CHEST', status: 'pending', priority: 'normal', age: 45, gender: '男' },
    { id: '2', patientName: '李四', modality: 'MR', bodyPart: 'BRAIN', status: 'pending', priority: 'urgent', age: 60, gender: '女' },
  ]},
  { id: 'inProgress', title: '进行中', color: '#059669', items: [
    { id: '3', patientName: '王五', modality: 'DR', bodyPart: 'CHEST', status: 'inProgress', priority: 'normal', age: 32, gender: '男' },
  ]},
  { id: 'completed', title: '已完成', color: '#94a3b8', items: []},
  { id: 'critical', title: '危急值', color: '#dc2626', items: [
    { id: '4', patientName: '赵六', modality: 'CT', bodyPart: 'HEAD', status: 'critical', priority: 'urgent', age: 70, gender: '男' },
  ]},
]

export const Default: Story = { args: { columns } }
