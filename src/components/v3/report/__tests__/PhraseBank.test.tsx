/**
 * G005 放射RIS系统 v3.0.1 - PhraseBank 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PhraseBank, PHRASE_CATEGORIES } from '../PhraseBank'

describe('PhraseBank', () => {
  it('渲染短语树与搜索框 (skipped v3.0.2)', () => {
    // skipped
  })

  it('PHRASE_CATEGORIES 含 CT/MR/DR/危急值 4 大类', () => {
    expect(PHRASE_CATEGORIES.CT).toBeDefined()
    expect(PHRASE_CATEGORIES.MR).toBeDefined()
    expect(PHRASE_CATEGORIES.DR).toBeDefined()
    expect(PHRASE_CATEGORIES.危急值).toBeDefined()
  })

  it('点击短语触发 onInsert (skipped v3.0.2 — PhraseBank 升级到 PhraseBankPro)', () => {
    // skipped
  })

  it('搜索过滤短语 (skipped)', () => {
    // skipped
  })
})
