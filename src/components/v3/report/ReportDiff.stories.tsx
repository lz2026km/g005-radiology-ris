/**
 * G005 放射RIS系统 v3.0.1 - ReportDiff Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { ReportDiff } from './ReportDiff'

const meta: Meta<typeof ReportDiff> = {
  title: 'v3/Report/ReportDiff',
  component: ReportDiff,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof ReportDiff>

export const Default: Story = {
  args: {
    oldText: '双肺纹理清晰。纵隔居中。',
    newText: '双肺纹理清晰,未见明显异常密度影。纵隔居中,未见肿大淋巴结。',
  },
}
export const Equal: Story = {
  args: { oldText: '完全相同的内容', newText: '完全相同的内容' },
}
