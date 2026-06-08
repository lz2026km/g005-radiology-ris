/**
 * G005 放射RIS系统 v3.0.1 - FrameSync 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FrameSync } from './FrameSync'

describe('FrameSync', () => {
  it('OFF 状态显示 OFF Tag', () => {
    render(<FrameSync enabled={false} onToggle={() => {}} />)
    expect(screen.getByText('OFF')).toBeInTheDocument()
  })

  it('ON 状态显示 ON · N 视口', () => {
    render(<FrameSync enabled onToggle={() => {}} viewportCount={4} />)
    expect(screen.getByText(/ON · 4视口/)).toBeInTheDocument()
  })

  it('切换开关触发 onToggle', () => {
    const onToggle = vi.fn()
    render(<FrameSync enabled={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByTestId('frame-sync-switch'))
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('4 字段勾选默认 frame/wl/pan 开启', () => {
    render(<FrameSync enabled onToggle={() => {}} />)
    const frame = screen.getByTestId('frame-sync-field-frame')
    const wl = screen.getByTestId('frame-sync-field-windowLevel')
    const zoom = screen.getByTestId('frame-sync-field-zoom')
    const pan = screen.getByTestId('frame-sync-field-pan')
    expect(frame.textContent).toBe('帧')
    expect(wl.textContent).toBe('WW/WL')
    expect(zoom.textContent).toBe('缩放')
    expect(pan.textContent).toBe('平移')
  })

  it('点击字段勾选触发 onSyncedFieldsChange', () => {
    const onChange = vi.fn()
    render(
      <FrameSync
        enabled
        onToggle={() => {}}
        onSyncedFieldsChange={onChange}
        syncedFields={{ frame: true, windowLevel: true, zoom: false, pan: true }}
      />
    )
    fireEvent.click(screen.getByTestId('frame-sync-field-zoom'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ zoom: true })
    )
  })
})
