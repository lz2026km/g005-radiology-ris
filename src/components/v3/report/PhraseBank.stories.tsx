/**
 * G005 放射RIS系统 v3.0.1 - PhraseBank Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from 'antd'
import { PhraseBank } from './PhraseBank'

const meta: Meta<typeof PhraseBank> = {
  title: 'v3/Report/PhraseBank',
  component: PhraseBank,
}
export default meta
type Story = StoryObj<typeof PhraseBank>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>打开短语库</Button>
        <PhraseBank open={open} onClose={() => setOpen(false)} onInsert={(t) => console.log(t)} />
      </>
    )
  },
}
