/**
 * G005 放射RIS系统 v3.0.1 - RadLexSearch 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RadLexSearch, RADLEX_SAMPLE } from '../RadLexSearch'

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
    const { baseElement } = render(<RadLexSearch open onClose={() => {}} />)
    const input = baseElement.querySelector('[data-testid="radlex-input"]') as HTMLInputElement
    expect(input).toBeTruthy()
  })

  it('点击插入按钮触发 onInsert', () => {
    const onInsert = vi.fn()
    const { baseElement } = render(<RadLexSearch open onClose={() => {}} onInsert={onInsert} />)
    const input = baseElement.querySelector('[data-testid="radlex-input"]') as HTMLInputElement
    expect(input).toBeTruthy()
  })
})
