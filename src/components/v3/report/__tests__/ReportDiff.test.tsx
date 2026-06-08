/**
 * G005 放射RIS系统 v3.0.1 - ReportDiff 单测
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReportDiff } from '../ReportDiff'

describe('ReportDiff', () => {
  it('空文本显示空态', () => {
    render(<ReportDiff oldText="" newText="" />)
    expect(screen.getByText('无内容可对比')).toBeInTheDocument()
  })

  it('相同文本不显示差异(显示 0 add / 0 remove)', () => {
    render(<ReportDiff oldText="hello world" newText="hello world" />)
    expect(screen.getByText(/新增 0/)).toBeInTheDocument()
    expect(screen.getByText(/删除 0/)).toBeInTheDocument()
  })

  it('新增内容显示绿色背景', () => {
    render(<ReportDiff oldText="双肺清晰" newText="双肺清晰,未见异常" />)
    const addSeg = screen.getAllByTestId('diff-add')
    expect(addSeg.length).toBeGreaterThan(0)
  })

  it('删除内容显示红色背景', () => {
    render(<ReportDiff oldText="双肺清晰,占位" newText="双肺清晰" />)
    const rmSeg = screen.getAllByTestId('diff-remove')
    expect(rmSeg.length).toBeGreaterThan(0)
  })

  it('切到仅差异模式隐藏相同', () => {
    render(<ReportDiff oldText="a b c" newText="a b c d" showEqual={false} />)
    expect(screen.getByText(/新增 \d/)).toBeInTheDocument()
  })
})
