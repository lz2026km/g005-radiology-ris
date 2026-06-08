/**
 * G005 放射RIS系统 v3.0.1 - WLCustomPanel Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { WLCustomPanel } from './WLCustomPanel'

const meta: Meta<typeof WLCustomPanel> = {
  title: 'v3/Dicom/WLCustomPanel',
  component: WLCustomPanel,
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof WLCustomPanel>

export const Default: Story = {}
export const WithDefaults: Story = { args: { defaultPreset: 'bone' } }
export const ReadOnly: Story = { args: { readOnly: true } }
