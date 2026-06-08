/**
 * G005 放射RIS系统 v3.0.1 - RadLexSearch Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from 'antd'
import { RadLexSearch } from './RadLexSearch'

const meta: Meta<typeof RadLexSearch> = {
  title: 'v3/Report/RadLexSearch',
  component: RadLexSearch,
}
export default meta
type Story = StoryObj<typeof RadLexSearch>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>打开 RadLex</Button>
        <RadLexSearch open={open} onClose={() => setOpen(false)} onInsert={(t) => console.log(t)} />
      </>
    )
  },
}
