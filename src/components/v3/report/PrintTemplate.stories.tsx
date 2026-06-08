/**
 * G005 放射RIS系统 v3.0.1 - PrintTemplate Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from 'antd'
import { PrintTemplate } from './PrintTemplate'

const meta: Meta<typeof PrintTemplate> = {
  title: 'v3/Report/PrintTemplate',
  component: PrintTemplate,
}
export default meta
type Story = StoryObj<typeof PrintTemplate>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>打开打印模板</Button>
        <PrintTemplate open={open} onClose={() => setOpen(false)} />
      </>
    )
  },
}
