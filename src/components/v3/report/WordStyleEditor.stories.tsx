/**
 * G005 放射RIS系统 v3.0.1 - WordStyleEditor Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { WordStyleEditor } from './WordStyleEditor'

const meta: Meta<typeof WordStyleEditor> = {
  title: 'v3/Report/WordStyleEditor',
  component: WordStyleEditor,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof WordStyleEditor>

export const Default: Story = {
  args: {
    patientName: '张三',
    patientId: 'P-2026-001',
    reportType: '胸部 CT 平扫',
    initialFindings: '双肺纹理清晰,未见明显异常密度影。\n气管支气管通畅。',
    initialConclusion: '胸部 CT 平扫未见明显异常。',
  },
}
