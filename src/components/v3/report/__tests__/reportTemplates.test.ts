/**
 * G005 放射RIS系统 v3.0.2 - 报告模板数据单测
 */
import { describe, it, expect } from 'vitest'
import { REPORT_TEMPLATES, listTemplates, findTemplate, getInheritanceChain } from '@data/reportTemplates'

describe('REPORT_TEMPLATES', () => {
  it('至少 30 个模板', () => {
    expect(REPORT_TEMPLATES.length).toBeGreaterThanOrEqual(30)
  })

  it('包含所有 PACS 必备类别', () => {
    const cats = new Set(REPORT_TEMPLATES.map((t) => t.category))
    expect(cats.has('CT')).toBe(true)
    expect(cats.has('MR')).toBe(true)
    expect(cats.has('DR')).toBe(true)
    expect(cats.has('US')).toBe(true)
    expect(cats.has('MG')).toBe(true)
    expect(cats.has('DSA')).toBe(true)
    expect(cats.has('CRITICAL')).toBe(true)
  })

  it('危急值模板至少 5 个', () => {
    const cv = REPORT_TEMPLATES.filter((t) => t.category === 'CRITICAL')
    expect(cv.length).toBeGreaterThanOrEqual(5)
    for (const t of cv) {
      expect(t.body).toContain('⚠️ 危急值 ⚠️')
    }
  })

  it('每模板必有 id/name/category/body', () => {
    for (const t of REPORT_TEMPLATES) {
      expect(t.id).toBeTruthy()
      expect(t.name).toBeTruthy()
      expect(t.category).toBeTruthy()
      expect(t.body).toBeTruthy()
    }
  })

  it('RADS 模板的 radsCategory 字段合法', () => {
    const rads = REPORT_TEMPLATES.filter((t) => t.radsCategory)
    expect(rads.length).toBeGreaterThanOrEqual(5)
    for (const t of rads) {
      expect(t.radsCategory).toMatch(/RADS|RECIST/i)
    }
  })
})

describe('listTemplates filter', () => {
  it('按 category 过滤', () => {
    const ct = listTemplates({ category: 'CT' })
    expect(ct.length).toBeGreaterThan(0)
    for (const t of ct) expect(t.category).toBe('CT')
  })

  it('按关键字搜索', () => {
    const lung = listTemplates({ keyword: '肺' })
    expect(lung.length).toBeGreaterThan(0)
    for (const t of lung) {
      expect(t.name.includes('肺') || t.tags.some((tag) => tag.includes('肺'))).toBe(true)
    }
  })

  it('空 filter 返回全部', () => {
    const all = listTemplates()
    expect(all.length).toBe(REPORT_TEMPLATES.length)
  })
})

describe('getInheritanceChain', () => {
  it('返回继承链(子到根)', () => {
    const chain = getInheritanceChain('t-ct-chest-enhanced')
    expect(chain.length).toBeGreaterThanOrEqual(2)
    expect(chain[0]?.id).toBe('t-ct-chest-enhanced')
    expect(chain[1]?.id).toBe('t-ct-chest')
  })

  it('无继承返回单元素', () => {
    const chain = getInheritanceChain('t-ct-chest')
    expect(chain.length).toBe(1)
  })
})

describe('findTemplate', () => {
  it('找到存在的模板', () => {
    const t = findTemplate('t-ct-chest')
    expect(t).toBeDefined()
    expect(t?.name).toBe('胸部 CT 平扫(常规)')
  })

  it('不存在返回 undefined', () => {
    expect(findTemplate('non-existent')).toBeUndefined()
  })
})
