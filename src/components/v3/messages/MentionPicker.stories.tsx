/**
 * G005 放射RIS系统 v3.0.1 - MentionPicker Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from 'antd'
import { MentionPicker } from './MentionPicker'

const meta: Meta<typeof MentionPicker> = {
  title: 'v3/Collab/MentionPicker',
  component: MentionPicker,
}
export default meta
type Story = StoryObj<typeof MentionPicker>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>打开 @</Button>
        <MentionPicker open={open} onClose={() => setOpen(false)} onSelect={(u) => console.log(u)} />
      </>
    )
  },
}
