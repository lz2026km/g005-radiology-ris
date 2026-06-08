/**
 * G005 放射RIS系统 v3.0.1 - FlowTimeline Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { FlowTimeline, DEFAULT_FLOW, CRITICAL_FLOW } from './FlowTimeline'

const meta: Meta<typeof FlowTimeline> = {
  title: 'v3/Worklist/FlowTimeline',
  component: FlowTimeline,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof FlowTimeline>

export const Horizontal: Story = {
  args: { states: DEFAULT_FLOW, currentKey: 'reviewing' },
}
export const Vertical: Story = {
  args: { states: DEFAULT_FLOW, currentKey: 'completed', orientation: 'vertical' },
}
export const Critical: Story = {
  args: { states: CRITICAL_FLOW, currentKey: 'acknowledged' },
}
