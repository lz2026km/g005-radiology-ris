/**
 * G005 放射RIS系统 v3.0.2 - MacroEngine 单元(沙箱表达式求值)
 */
import { describe, it, expect } from 'vitest'
import {
  evaluateExpression,
  renderMacro,
  validateTemplate,
  highlightMacros,
  buildSampleContext,
  structuredFieldsToContext,
  SAMPLE_TEMPLATE,
} from '../MacroEngine'

describe('MacroEngine.evaluateExpression', () => {
  const ctx = buildSampleContext()

  it('字面量:数字', () => {
    expect(evaluateExpression('42', ctx)).toBe(42)
    expect(evaluateExpression('3.14', ctx)).toBe(3.14)
  })

  it('字面量:字符串', () => {
    expect(evaluateExpression("'hello'", ctx)).toBe('hello')
    expect(evaluateExpression('"world"', ctx)).toBe('world')
  })

  it('字面量:布尔', () => {
    expect(evaluateExpression('true', ctx)).toBe(true)
    expect(evaluateExpression('false', ctx)).toBe(false)
  })

  it('字面量:null/undefined', () => {
    expect(evaluateExpression('null', ctx)).toBeNull()
    expect(evaluateExpression('undefined', ctx)).toBeUndefined()
  })

  it('变量访问:简单', () => {
    expect(evaluateExpression('patient.name', ctx)).toBe('张三')
    expect(evaluateExpression('patient.age', ctx)).toBe(45)
  })

  it('变量访问:路径', () => {
    expect(evaluateExpression('patient.id', ctx)).toBe('P-2026-001')
    expect(evaluateExpression('study.modality', ctx)).toBe('CT')
  })

  it('算术运算', () => {
    expect(evaluateExpression('1 + 2', ctx)).toBe(3)
    expect(evaluateExpression('10 - 3', ctx)).toBe(7)
    expect(evaluateExpression('4 * 5', ctx)).toBe(20)
    expect(evaluateExpression('20 / 4', ctx)).toBe(5)
    expect(evaluateExpression('10 % 3', ctx)).toBe(1)
  })

  it('字符串拼接(加号)', () => {
    expect(evaluateExpression("'患者:' + patient.name", ctx)).toBe('患者:张三')
  })

  it('比较运算', () => {
    expect(evaluateExpression('patient.age >= 18', ctx)).toBe(true)
    expect(evaluateExpression('patient.age < 18', ctx)).toBe(false)
    expect(evaluateExpression('patient.sex == "M"', ctx)).toBe(true)
    expect(evaluateExpression('patient.sex != "F"', ctx)).toBe(true)
  })

  it('逻辑运算', () => {
    expect(evaluateExpression('true && false', ctx)).toBe(false)
    expect(evaluateExpression('true || false', ctx)).toBe(true)
  })

  it('三元', () => {
    expect(evaluateExpression('patient.age >= 18 ? "成人" : "未成年"', ctx)).toBe('成人')
    expect(evaluateExpression('patient.age < 18 ? "成人" : "未成年"', ctx)).toBe('未成年')
  })

  it('函数:upper/lower/trim', () => {
    expect(evaluateExpression('upper(patient.name)', ctx)).toBe('张三') // 中文不变
    expect(evaluateExpression('lower("ABC")', ctx)).toBe('abc')
    expect(evaluateExpression('trim("  hi  ")', ctx)).toBe('hi')
  })

  it('函数:round/floor/ceil', () => {
    expect(evaluateExpression('round(3.5)', ctx)).toBe(4)
    expect(evaluateExpression('floor(3.9)', ctx)).toBe(3)
    expect(evaluateExpression('ceil(3.1)', ctx)).toBe(4)
  })

  it('函数:concat/join', () => {
    expect(evaluateExpression("concat('a', '-', 'b')", ctx)).toBe('a-b')
    expect(evaluateExpression("join(items, ',')", ctx)).toBe(
      '[object Object],[object Object]'
    )
  })

  it('函数:date', () => {
    const out = evaluateExpression('date("YYYY-MM-DD")', ctx)
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('函数:default', () => {
    expect(evaluateExpression('default(missingVar, "N/A")', ctx)).toBe('N/A')
    expect(evaluateExpression('default(patient.name, "N/A")', ctx)).toBe('张三')
  })

  it('混合算术+函数+变量', () => {
    expect(evaluateExpression('round(patient.age * 1.5, 1)', ctx)).toBe(67.5)
    expect(evaluateExpression('upperFirst("hello")', ctx)).toBe('Hello')
  })

  it('混合算术 round(45 * 1.5, 1) = 67.5', () => {
    expect(evaluateExpression('round(45 * 1.5, 1)', ctx)).toBe(67.5)
  })

  it('复杂表达式', () => {
    expect(evaluateExpression('(1+2)*3+4', ctx)).toBe(13)
  })

  it('未知函数抛错', () => {
    expect(() => evaluateExpression('eval("1")', ctx)).toThrow()
    expect(() => evaluateExpression('window.alert(1)', ctx)).toThrow()
  })

  it('未知变量返回 undefined', () => {
    expect(evaluateExpression('totallyMissing', ctx)).toBeUndefined()
  })
})

describe('MacroEngine.renderMacro', () => {
  const ctx = buildSampleContext()

  it('纯文本无宏', () => {
    const r = renderMacro('hello world', ctx)
    expect(r.ok).toBe(true)
    expect(r.text).toBe('hello world')
  })

  it('简单插值', () => {
    const r = renderMacro('{{patient.name}}', ctx)
    expect(r.text).toBe('张三')
    expect(r.variables).toContain('patient.name')
  })

  it('简单插值算术 age*2', () => {
    const r = renderMacro('{{age*2}}', { age: 5 })
    expect(r.text).toBe('10')
    expect(r.variables).toContain('age')
  })

  it('算术', () => {
    const r = renderMacro('{{age*2}}', { age: 5 })
    expect(r.text).toBe('10')
  })

  it('块条件 #if/#else', () => {
    const tpl = '{{#if age >= 18}}成人{{#else}}未成年{{/if}}'
    expect(renderMacro(tpl, { age: 20 }).text).toBe('成人')
    expect(renderMacro(tpl, { age: 10 }).text).toBe('未成年')
  })

  it('块循环 #each', () => {
    const tpl = '{{#each items as item}}[{{item.name}}]{{/each}}'
    const r = renderMacro(tpl, {
      items: [
        { name: 'A' },
        { name: 'B' },
        { name: 'C' },
      ],
    })
    expect(r.text).toBe('[A][B][C]')
  })

  it('嵌套块', () => {
    const tpl = `A:{{#if a}}Y{{#else}}N{{/if}}|B:{{#each bs as b}}{{b}}{{/each}}`
    const r = renderMacro(tpl, { a: true, bs: [1, 2, 3] })
    expect(r.text).toBe('A:Y|B:123')
  })

  it('SAMPLE_TEMPLATE 完整渲染', () => {
    const r = renderMacro(SAMPLE_TEMPLATE, ctx)
    expect(r.ok).toBe(true)
    expect(r.text).toContain('张三')
    expect(r.text).toContain('检查号:ACC-001')
    expect(r.variables).toBeDefined()
  })

  it('空模板', () => {
    expect(renderMacro('', ctx)).toEqual({ ok: true, text: '' })
  })
})

describe('MacroEngine.highlightMacros', () => {
  it('分割文本与宏', () => {
    const segs = highlightMacros('前{{name}}后{{age}}尾')
    expect(segs).toEqual([
      { type: 'text', content: '前' },
      { type: 'macro', content: '{{name}}' },
      { type: 'text', content: '后' },
      { type: 'macro', content: '{{age}}' },
      { type: 'text', content: '尾' },
    ])
  })

  it('块条件标为 block', () => {
    const segs = highlightMacros('{{#if x}}yes{{/if}}')
    expect(segs[0]?.type).toBe('block')
  })
})

describe('MacroEngine.validateTemplate', () => {
  it('有效模板', () => {
    const r = validateTemplate('{{name}} {{age*2}}')
    expect(r.ok).toBe(true)
    expect(r.variables).toContain('name')
    expect(r.variables).toContain('age')
  })
})

describe('MacroEngine.structuredFieldsToContext', () => {
  it('从字段数组构造 context', () => {
    const ctx = structuredFieldsToContext([
      { key: 'foo', value: 1, displayText: '1' },
      { key: 'bar', value: 'hi', displayText: 'hi' },
    ])
    expect(ctx['foo']).toBe(1)
    expect(ctx['bar']).toBe('hi')
  })
})
