/**
 * G005 放射RIS系统 v3.0.1 - AdvancedFilter Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from 'antd'
import { AdvancedFilter } from './AdvancedFilter'

const meta: Meta<typeof AdvancedFilter> = {
  title: 'v3/Worklist/AdvancedFilter',
  component: AdvancedFilter,
}
export default meta
type Story = StoryObj<typeof AdvancedFilter>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>打开高级筛选</Button>
        <AdvancedFilter
          open={open}
          onClose={() => setOpen(false)}
          onApply={(v) => console.log('apply', v)}
          doctors={[
            { id: '1', name: '李明辉' },
            { id: '2', name: '王芳' },
          ]}
          rooms={[{ id: 'r1', name: 'CT 室 1' }]}
        />
      </>
    )
  },
}
