/**
 * G005 放射RIS系统 v3.0.1 - PhraseBank 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PhraseBank, PHRASE_CATEGORIES } from './PhraseBank'

describe('PhraseBank', () => {
  it('渲染短语树与搜索框', () => {
    render(<PhraseBank open onClose={() => {}} />)
    expect(screen.getByTestId('phrase-search')).toBeInTheDocument()
    expect(screen.getByText('CT')).toBeInTheDocument()
    expect(screen.getByText('MR')).toBeInTheDocument()
  })

  it('PHRASE_CATEGORIES 含 CT/MR/DR/危急值 4 大类', () => {
    expect(PHRASE_CATEGORIES.CT).toBeDefined()
    expect(PHRASE_CATEGORIES.MR).toBeDefined()
    expect(PHRASE_CATEGORIES.DR).toBeDefined()
    expect(PHRASE_CATEGORIES.危急值).toBeDefined()
  })

  it('点击短语触发 onInsert', () => {
    const onInsert = vi.fn()
    render(<PhraseBank open onClose={() => {}} onInsert={onInsert} />)
    const firstPhrase = screen.getByTestId('phrase-ct-1')
    fireEvent.click(firstPhrase)
    expect(onInsert).toHaveBeenCalledWith(expect.stringContaining('双肺纹理'))
  })

  it('搜索过滤短语', () => {
    render(<PhraseBank open onClose={() => {}} />)
    const input = screen.getByTestId('phrase-search')
    fireEvent.change(input, { target: { value: '气胸' } })
    expect(screen.getByText('大量气胸')).toBeInTheDocument()
  })
})
