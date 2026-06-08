/**
 * G005 放射RIS系统 v3.0.1 - OverlayQuad Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { OverlayQuad } from './OverlayQuad'

const meta: Meta<typeof OverlayQuad> = {
  title: 'v3/Dicom/OverlayQuad',
  component: OverlayQuad,
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof OverlayQuad>

export const Default: Story = {
  args: {
    data: {
      ww: 400,
      wl: 40,
      patient: { name: '张三', sex: '男', age: 45, id: 'P-001' },
      study: { modality: 'CT', description: '胸部 CT', date: '2026-06-08' },
      series: { number: 2, total: 5 },
      instance: { number: 80, total: 320 },
      measurements: [
        { label: 'L1', value: '12.5 mm' },
        { label: 'A1', value: '45°' },
      ],
      zoom: 1.5,
      fps: 8,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 600, height: 400, background: '#0a0a0a' }}>
        <Story />
      </div>
    ),
  ],
}
