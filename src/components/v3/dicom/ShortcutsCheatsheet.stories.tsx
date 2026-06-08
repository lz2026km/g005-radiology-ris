/**
 * G005 放射RIS系统 v3.0.1 - ShortcutsCheatsheet Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from 'antd'
import { ShortcutsCheatsheet } from './ShortcutsCheatsheet'

const meta: Meta<typeof ShortcutsCheatsheet> = {
  title: 'v3/Dicom/ShortcutsCheatsheet',
  component: ShortcutsCheatsheet,
}
export default meta
type Story = StoryObj<typeof ShortcutsCheatsheet>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>打开速查</Button>
        <ShortcutsCheatsheet open={open} onClose={() => setOpen(false)} />
      </>
    )
  },
}
