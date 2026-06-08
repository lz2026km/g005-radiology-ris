/**
 * G005 放射RIS系统 v3.0.1 - RadLexSearch 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RadLexSearch, RADLEX_SAMPLE } from './RadLexSearch'

describe('RadLexSearch', () => {
  it('RADLEX_SAMPLE 至少 15 条', () => {
    expect(RADLEX_SAMPLE.length).toBeGreaterThanOrEqual(15)
  })

  it('每条 term 有 code + 中文名 + 英文名', () => {
    for (const t of RADLEX_SAMPLE) {
      expect(t.code).toMatch(/^RID/)
      expect(t.name.length).toBeGreaterThan(0)
      expect(t.nameEn.length).toBeGreaterThan(0)
    }
  })

  it('搜索"肺"过滤出肺结节/肺栓塞', () => {
    render(<RadLexSearch open onClose={() => {}} />)
    const input = screen.getByTestId('radlex-input')
    fireEvent.change(input, { target: { value: '肺' } })
    expect(screen.getByText('肺结节')).toBeInTheDocument()
    expect(screen.getByText('肺栓塞')).toBeInTheDocument()
  })

  it('点击插入按钮触发 onInsert', () => {
    const onInsert = vi.fn()
    render(<RadLexSearch open onClose={() => {}} onInsert={onInsert} />)
    const insertBtn = screen.getByTestId('radlex-insert-rl-1')
    fireEvent.click(insertBtn)
    expect(onInsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'rl-1' })
    )
  })
})
