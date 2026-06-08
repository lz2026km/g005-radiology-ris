/**
 * G005 放射RIS系统 v3.0.1 - CriticalEscalation Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { CriticalEscalation } from './CriticalEscalation'

const meta: Meta<typeof CriticalEscalation> = {
  title: 'v3/Critical/CriticalEscalation',
  component: CriticalEscalation,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof CriticalEscalation>

const detectedAt = Date.now() - 12 * 60_000

export const Active: Story = {
  args: {
    detectedAt,
    description: '主动脉夹层',
    config: {
      initialNotifiedTo: '王芳',
      escalationChain: [
        { thresholdMin: 5, target: '王芳', via: 'phone' },
        { thresholdMin: 10, target: '李明辉(主任)', via: 'sms' },
        { thresholdMin: 15, target: '医务处', via: 'system' },
      ],
    },
  },
}
