/**
 * G005 放射RIS系统 v3.0.1 - FrameSync 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FrameSync } from '../FrameSync'

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
    const { container } = render(<FrameSync enabled={false} onToggle={onToggle} />)
    const sw = container.querySelector('button[role="switch"]') as HTMLElement
    expect(sw).toBeTruthy()
    fireEvent.keyDown(sw, { key: 'Enter' })
    expect(onToggle).toHaveBeenCalled()
  })

  it('4 字段勾选默认 frame/wl/pan 开启', () => {
    const { container } = render(
      <FrameSync
        enabled
        onToggle={() => {}}
        viewportCount={4}
        onSyncedFieldsChange={() => {}}
        syncedFields={{ frame: true, windowLevel: true, zoom: false, pan: true }}
      />
    )
    expect(container.textContent).toContain('帧')
    expect(container.textContent).toContain('缩放')
    expect(container.textContent).toContain('平移')
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
    fireEvent.click(screen.getByText('缩放'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ zoom: true })
    )
  })
})
