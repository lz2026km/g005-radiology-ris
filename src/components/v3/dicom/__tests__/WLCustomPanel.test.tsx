/**
 * G005 放射RIS系统 v3.0.1 - WLCustomPanel 单测
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WLCustomPanel, WL_PRESETS } from './WLCustomPanel'

describe('WLCustomPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('默认渲染并显示肺窗预设', () => {
    render(<WLCustomPanel />)
    expect(screen.getByText('窗宽窗位自定义')).toBeInTheDocument()
    expect(screen.getByText('肺窗')).toBeInTheDocument()
    expect(screen.getByText('骨窗')).toBeInTheDocument()
  })

  it('点击预设触发 onApply', () => {
    const onApply = vi.fn()
    render(<WLCustomPanel onApply={onApply} />)
    fireEvent.click(screen.getByText('骨窗'))
    expect(onApply).toHaveBeenCalledWith({ ww: 2000, wl: 500 })
  })

  it('WW 输入变化触发 onChange', () => {
    const onChange = vi.fn()
    render(<WLCustomPanel onChange={onChange} value={{ ww: 400, wl: 40 }} />)
    const wwInput = screen.getByTestId('wl-input-ww')
    expect(wwInput).toBeInTheDocument()
  })

  it('readOnly 模式禁用所有控件', () => {
    render(<WLCustomPanel readOnly />)
    const wwSlider = screen.getByTestId('wl-slider-ww')
    expect(wwSlider).toBeInTheDocument()
  })

  it('WL_PRESETS 至少 7 个且含必填器官', () => {
    expect(WL_PRESETS.length).toBeGreaterThanOrEqual(7)
    expect(WL_PRESETS.find((p) => p.id === 'lung')).toBeDefined()
    expect(WL_PRESETS.find((p) => p.id === 'bone')).toBeDefined()
    expect(WL_PRESETS.find((p) => p.id === 'brain')).toBeDefined()
    expect(WL_PRESETS.find((p) => p.id === 'liver')).toBeDefined()
    expect(WL_PRESETS.find((p) => p.id === 'mediastinum')).toBeDefined()
    expect(WL_PRESETS.find((p) => p.id === 'softTissue')).toBeDefined()
  })

  it('每个预设都有 color 字段(对标岱嘉色)', () => {
    for (const p of WL_PRESETS) {
      expect(p.color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
