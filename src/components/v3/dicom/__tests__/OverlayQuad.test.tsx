/**
 * G005 放射RIS系统 v3.0.1 - OverlayQuad 单测
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OverlayQuad } from '../OverlayQuad'

describe('OverlayQuad', () => {
  it('默认 visible 时渲染 4 象限', () => {
    render(<OverlayQuad data={{ ww: 400, wl: 40, patient: { name: '张三' } }} />)
    expect(screen.getByTestId('overlay-tl')).toBeInTheDocument()
    expect(screen.getByTestId('overlay-tr')).toBeInTheDocument()
    expect(screen.getByTestId('overlay-bl')).toBeInTheDocument()
    expect(screen.getByTestId('overlay-br')).toBeInTheDocument()
  })

  it('visible=false 不渲染任何象限', () => {
    render(<OverlayQuad data={{}} visible={false} />)
    expect(screen.queryByTestId('overlay-tl')).toBeNull()
  })

  it('象限显示患者姓名与窗宽窗位', () => {
    render(
      <OverlayQuad
        data={{
          ww: 1500,
          wl: -600,
          patient: { name: '李四', sex: '男', age: 45, id: 'P-001' },
          series: { number: 2, total: 5 },
        }}
      />
    )
    expect(screen.getByTestId('overlay-tl').textContent).toContain('李四')
    expect(screen.getByTestId('overlay-tl').textContent).toContain('45')
    expect(screen.getByTestId('overlay-tr').textContent).toContain('1500')
    expect(screen.getByTestId('overlay-tr').textContent).toContain('-600')
    expect(screen.getByTestId('overlay-br').textContent).toContain('2/5')
  })

  it('无测量数据显示"无测量"', () => {
    render(<OverlayQuad data={{}} />)
    expect(screen.getByTestId('overlay-bl').textContent).toContain('无测量')
  })
})
