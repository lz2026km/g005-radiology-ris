/**
 * G005 放射RIS系统 v3.0.2 - RequiredFieldGuard 单测
 */
import { describe, it, expect, vi } from 'vitest'
import { runValidation, DEFAULT_REPORT_RULES, fromFieldSchemas, type ValidationRule } from '../RequiredFieldGuard'

describe('runValidation', () => {
  it('所有必填已填 → ok', () => {
    const r = runValidation(DEFAULT_REPORT_RULES, {
      findings: '双肺纹理清晰未见明显异常密度影气管通畅',
      conclusion: '未见明显异常',
      signature: '李明辉',
    })
    expect(r.ok).toBe(true)
    expect(r.errors).toHaveLength(0)
  })

  it('必填缺失 → error', () => {
    const r = runValidation(DEFAULT_REPORT_RULES, {})
    expect(r.ok).toBe(false)
    expect(r.errors.length).toBeGreaterThan(0)
    expect(r.errors.find((e) => e.key === 'findings')).toBeDefined()
    expect(r.errors.find((e) => e.key === 'conclusion')).toBeDefined()
    expect(r.errors.find((e) => e.key === 'signature')).toBeDefined()
  })

  it('所见最小长度 < 10 → error', () => {
    const r = runValidation(DEFAULT_REPORT_RULES, { findings: '太短', conclusion: 'x', signature: 'y' })
    expect(r.errors.find((e) => e.key === 'findings')?.message).toContain('不能小于')
  })

  it('黑名单关键字 → error', () => {
    const r = runValidation(DEFAULT_REPORT_RULES, {
      findings: '内容包含 TODO 标记',
      conclusion: 'ok',
      signature: 'y',
    })
    expect(r.errors.find((e) => e.key === 'findings')?.message).toContain('禁用词')
  })

  it('警告(severity=warning) 不阻塞', () => {
    const r = runValidation(DEFAULT_REPORT_RULES, {
      findings: '这是有效的所见描述,需要更长的内容',
      conclusion: 'ok 结论',
      signature: '李医生',
      lesionSize: 9999,
    })
    expect(r.ok).toBe(true)
    expect(r.warnings.length).toBeGreaterThan(0)
    expect(r.blocking).toBe(false)
  })

  it('数字超范围 → warning', () => {
    const r = runValidation(DEFAULT_REPORT_RULES, {
      findings: 'ok ok ok ok ok',
      conclusion: 'ok',
      signature: 'y',
      lesionSize: 9999,
    })
    expect(r.warnings.find((w) => w.key === 'lesionSize')).toBeDefined()
  })

  it('空数组视为必填缺失', () => {
    const rule: ValidationRule = {
      key: 'tags',
      label: '标签',
      required: true,
    }
    const r = runValidation([rule], { tags: [] })
    expect(r.ok).toBe(false)
  })

  it('BI-RADS 自定义校验', () => {
    const r = runValidation(DEFAULT_REPORT_RULES, {
      findings: 'ok ok ok ok ok',
      conclusion: 'ok',
      signature: 'y',
      birads: '7', // 非法
    })
    expect(r.warnings.find((w) => w.key === 'birads')?.message).toContain('BI-RADS')
  })

  it('空字符串视同缺失', () => {
    const r = runValidation(DEFAULT_REPORT_RULES, {
      findings: '',
      conclusion: '',
      signature: '',
    })
    expect(r.errors.length).toBe(3)
  })
})

describe('fromFieldSchemas', () => {
  it('从 FieldSchema[] 提取 required 规则', () => {
    const rules = fromFieldSchemas([
      { key: 'foo', label: 'Foo', type: 'text', required: true },
      { key: 'bar', label: 'Bar', type: 'text' },
      { key: 'baz', label: 'Baz', type: 'number', required: true, min: 0, max: 100 },
    ])
    expect(rules).toHaveLength(2)
    expect(rules.find((r) => r.key === 'foo')).toBeDefined()
    expect(rules.find((r) => r.key === 'baz')).toBeDefined()
    expect(rules.find((r) => r.key === 'bar')).toBeUndefined()
  })

  it('multiselect 必填生成 custom validator', () => {
    const rules = fromFieldSchemas([
      { key: 'tags', label: 'Tags', type: 'multiselect', required: true },
    ])
    const r = runValidation(rules, { tags: ['a'] })
    expect(r.ok).toBe(true)
    const r2 = runValidation(rules, { tags: [] })
    expect(r2.ok).toBe(false)
  })
})
