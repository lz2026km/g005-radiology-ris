/**
 * G005 放射RIS系统 v3.0.1 - BatchActions Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { BatchActions } from './BatchActions'

const meta: Meta<typeof BatchActions> = {
  title: 'v3/Worklist/BatchActions',
  component: BatchActions,
}
export default meta
type Story = StoryObj<typeof BatchActions>

export const Empty: Story = { args: { selectedCount: 0, totalCount: 20 } }
export const Selected: Story = {
  args: {
    selectedCount: 5,
    totalCount: 20,
    onReassign: () => {},
    onPrint: () => {},
    onExport: () => {},
    onDelete: () => {},
    onSubmit: () => {},
    onClear: () => {},
    assignees: [
      { id: '1', name: '李明辉' },
      { id: '2', name: '王芳' },
    ],
  },
}
