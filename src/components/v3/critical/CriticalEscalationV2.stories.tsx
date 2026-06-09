/**
 * G005 放射RIS系统 v3.0.2 - 危急值升级 Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import CriticalEscalationV2 from './CriticalEscalationV2'

const meta: Meta<typeof CriticalEscalationV2> = {
  title: 'v3/Critical/EscalationV2',
  component: CriticalEscalationV2,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof CriticalEscalationV2>

const SAMPLE = [
  {
    id: 'C1', patientName: '张三', patientId: 'P001', modality: 'CT', bodyPart: 'CHEST',
    finding: '主动脉夹层 Stanford A 型', category: 'LIFE_THREATENING' as const,
    triggeredAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    reporter: '张医师', recipient: '李主任', recipientDept: '心外科', recipientPhone: '13800001111',
    notifyStatus: 'NOTIFIED' as const, channels: ['PHONE', 'SMS'] as ('PHONE' | 'SMS')[],
    notifications: [{ channel: 'PHONE' as const, at: '2024-06-15 15:00', status: 'SUCCESS' as const }],
    escalationChain: [], slaSeconds: 300,
  },
]

export const Default: Story = {
  args: { values: SAMPLE },
}

export const Overdue: Story = {
  args: {
    values: [
      {
        ...SAMPLE[0],
        id: 'C2',
        triggeredAt: new Date(Date.now() - 600 * 1000).toISOString(),
        notifyStatus: 'NOTIFIED' as const,
      },
    ],
  },
}
