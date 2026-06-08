/**
 * G005 放射RIS系统 v3.0.1 - SequenceThumbnailStrip 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SequenceThumbnailStrip, type DicomSeries } from './SequenceThumbnailStrip'

const SERIES: DicomSeries[] = [
  { id: 's1', seriesNumber: 1, modality: 'CT', bodyPart: 'CHEST', description: 'CT 胸部', instanceCount: 320 },
  { id: 's2', seriesNumber: 2, modality: 'CT', bodyPart: 'CHEST', description: 'CT 胸部增强', instanceCount: 280 },
  { id: 's3', seriesNumber: 3, modality: 'CT', bodyPart: 'CHEST', description: '冠脉', instanceCount: 240 },
]

describe('SequenceThumbnailStrip', () => {
  it('渲染所有序列', () => {
    render(<SequenceThumbnailStrip series={SERIES} />)
    expect(screen.getByTestId('series-thumb-s1')).toBeInTheDocument()
    expect(screen.getByTestId('series-thumb-s2')).toBeInTheDocument()
    expect(screen.getByTestId('series-thumb-s3')).toBeInTheDocument()
  })

  it('默认 active 是首个', () => {
    render(<SequenceThumbnailStrip series={SERIES} />)
    const first = screen.getByTestId('series-thumb-s1')
    expect(first.style.border).toContain('1e3a5f')
  })

  it('点击序列触发 onSelect', () => {
    const onSelect = vi.fn()
    render(<SequenceThumbnailStrip series={SERIES} onSelect={onSelect} />)
    fireEvent.click(screen.getByTestId('series-thumb-s2'))
    expect(onSelect).toHaveBeenCalledWith('s2')
  })

  it('高度与缩略图尺寸可定制', () => {
    render(<SequenceThumbnailStrip series={SERIES} height={120} thumbnailSize={84} />)
    const strip = screen.getByTestId('sequence-thumbnail-strip')
    expect(strip.style.height).toBe('120px')
  })
})
