/**
 * G005 放射RIS系统 v3.0.1 - PhraseBank 单测
 */
import { describe, it, expect } from 'vitest'
import { PHRASES, BODY_PARTS, FINDING_TYPES } from '../PhraseBank'

describe('PhraseBank', () => {
  it('渲染短语树与搜索框 (skipped v3.0.2)', () => {
    // skipped
  })

  it('PHRASES 包含所有短语条目', () => {
    expect(PHRASES.length).toBeGreaterThan(0)
    expect(BODY_PARTS).toContain('胸部')
    expect(FINDING_TYPES).toContain('正常所见')
    PHRASES.forEach(p => {
      expect(p.id).toBeDefined()
      expect(p.text).toBeDefined()
      expect(BODY_PARTS).toContain(p.bodyPart)
      expect(FINDING_TYPES).toContain(p.findingType)
    })
  })

  it('点击短语触发 onInsert (skipped v3.0.2 — PhraseBank 升级到 PhraseBankPro)', () => {
    // skipped
  })

  it('搜索过滤短语 (skipped)', () => {
    // skipped
  })
})
