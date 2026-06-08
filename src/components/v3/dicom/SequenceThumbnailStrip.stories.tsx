/**
 * G005 放射RIS系统 v3.0.1 - SequenceThumbnailStrip Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import { SequenceThumbnailStrip, type DicomSeries } from './SequenceThumbnailStrip'

const meta: Meta<typeof SequenceThumbnailStrip> = {
  title: 'v3/Dicom/SequenceThumbnailStrip',
  component: SequenceThumbnailStrip,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof SequenceThumbnailStrip>

const series: DicomSeries[] = Array.from({ length: 8 }, (_, i) => ({
  id: `s${i + 1}`,
  seriesNumber: i + 1,
  modality: 'CT',
  bodyPart: 'CHEST',
  description: `序列 ${i + 1}`,
  instanceCount: 200 + i * 10,
}))

export const Default: Story = { args: { series } }
export const Tall: Story = { args: { series, height: 120, thumbnailSize: 84 } }
