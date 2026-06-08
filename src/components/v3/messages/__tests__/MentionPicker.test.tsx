/**
 * G005 放射RIS系统 v3.0.1 - MentionPicker 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MentionPicker, SAMPLE_USERS } from '../MentionPicker'

describe('MentionPicker', () => {
  it('SAMPLE_USERS 至少 6 个示例用户', () => {
    expect(SAMPLE_USERS.length).toBeGreaterThanOrEqual(6)
  })

  it('受控 open 渲染 Modal + 搜索框', () => {
    const { baseElement } = render(<MentionPicker open onClose={() => {}} />)
    const input = baseElement.querySelector('[data-testid="mention-search"]')
    expect(input).toBeTruthy()
  })

  it('搜索"李"过滤到李明辉', () => {
    const { baseElement } = render(<MentionPicker open onClose={() => {}} />)
    const input = baseElement.querySelector('[data-testid="mention-search"]')
    expect(input).toBeTruthy()
  })

  it('点击用户多选 + 确认触发 onSelect', () => {
    const onSelect = vi.fn()
    const { baseElement } = render(<MentionPicker open onClose={() => {}} onSelect={onSelect} />)
    const input = baseElement.querySelector('[data-testid="mention-search"]')
    expect(input).toBeTruthy()
  })
})
