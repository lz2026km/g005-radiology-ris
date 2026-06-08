/**
 * G005 放射RIS系统 v3.0.1 - HangingProtocolSwitcher Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { HangingProtocolProvider, HangingProtocolSwitcher } from './HangingProtocol'

const meta: Meta<typeof HangingProtocolSwitcher> = {
  title: 'v3/Dicom/HangingProtocolSwitcher',
  component: HangingProtocolSwitcher,
  decorators: [
    (Story) => (
      <HangingProtocolProvider>
        <Story />
      </HangingProtocolProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof HangingProtocolSwitcher>

export const Default: Story = {}
export const WithManager: Story = { args: { showManager: true } }
