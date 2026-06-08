/**
 * G005 放射RIS系统 v3.0.1 - FrameSync Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FrameSync } from './FrameSync'

const meta: Meta<typeof FrameSync> = {
  title: 'v3/Dicom/FrameSync',
  component: FrameSync,
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof FrameSync>

export const Off: Story = { args: { enabled: false, onToggle: () => {} } }
export const On: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(true)
    return <FrameSync enabled={enabled} onToggle={setEnabled} viewportCount={4} />
  },
}
