/**
 * G005 放射RIS系统 v3.0.1 - ReportLockBadge Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { ReportLockBadge } from './ReportLockBadge'

const meta: Meta<typeof ReportLockBadge> = {
  title: 'v3/Report/ReportLockBadge',
  component: ReportLockBadge,
}
export default meta
type Story = StoryObj<typeof ReportLockBadge>

export const Signed: Story = {
  args: { signed: true, signedBy: '李明辉', signedAt: '2026-06-08 10:30', certId: 'CN-CERT-001' },
}
export const Pending: Story = { args: { signed: false } }
