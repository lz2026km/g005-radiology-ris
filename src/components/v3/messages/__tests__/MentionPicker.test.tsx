/**
 * G005 放射RIS系统 v3.0.1 - MentionPicker 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MentionPicker, SAMPLE_USERS } from './MentionPicker'

describe('MentionPicker', () => {
  it('SAMPLE_USERS 至少 6 个示例用户', () => {
    expect(SAMPLE_USERS.length).toBeGreaterThanOrEqual(6)
  })

  it('受控 open 渲染 Modal + 搜索框', () => {
    render(<MentionPicker open onClose={() => {}} />)
    expect(screen.getByTestId('mention-search')).toBeInTheDocument()
  })

  it('搜索"李"过滤到李明辉', () => {
    render(<MentionPicker open onClose={() => {}} />)
    fireEvent.change(screen.getByTestId('mention-search'), { target: { value: '李' } })
    expect(screen.getByText('李明辉')).toBeInTheDocument()
  })

  it('点击用户多选 + 确认触发 onSelect', () => {
    const onSelect = vi.fn()
    render(<MentionPicker open onClose={() => {}} onSelect={onSelect} />)
    fireEvent.click(screen.getByTestId('mention-user-u1'))
    fireEvent.click(screen.getByTestId('mention-user-u2'))
    fireEvent.click(screen.getByText(/确认/))
    expect(onSelect).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'u1' }),
        expect.objectContaining({ id: 'u2' }),
      ])
    )
  })
})
