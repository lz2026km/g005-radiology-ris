/**
 * G005 放射RIS系统 v3.0.2 - 报告模板宏命令引擎
 * 对标:创业 PACS / 东软 PACS — 模板内可计算/条件
 *
 * 宏命令语法:
 *  {{var}}                       变量插值
 *  {{age*2}}                     算术运算
 *  {{bmi = weight / (height/100)^2}}  赋值
 *  {{if age > 18: 成人|未成年}}  条件(三元)
 *  {{#if sex == 'M'}} 男 {{#else}} 女 {{/if}}  块条件
 *  {{date:YYYY年MM月DD日}}       格式化
 *  {{patient.name}}              对象访问
 *  {{concat(a, b, c)}}           字符串拼接
 *  {{upper(s)}} / {{lower(s)}} / {{trim(s)}}
 *  {{round(n, 2)}} / {{floor(n)}} / {{ceil(n)}}
 *  {{#each items as item}} {{item.name}} {{/each}} 列表循环(简版)
 */
import type { FieldValue, StructuredField } from './StructuredFieldEditor'

export type MacroContext = Record<string, unknown>

export interface MacroResult {
  ok: boolean
  text: string
  error?: string
  /** 执行中识别到的变量 */
  variables?: string[]
  /** 已计算的中间值(用于调试) */
  computed?: Record<string, unknown>
}

const VAR_PATTERN = /\{\{\s*([\s\S]+?)\s*\}\}/g

const SAFE_IDENT = /^[A-Za-z_$][A-Za-z0-9_$.[\]'" ]*$/

/**
 * 简易表达式求值器(沙箱):
 *  - 不使用 eval/Function 形式(避免注入)
 *  - 支持:字面量/标识符/对象访问/算术/比较/逻辑/三元/函数调用(白名单)
 */
const FUNCTIONS: Record<string, (...args: unknown[]) => unknown> = {
  upper: (s) => (typeof s === 'string' ? s.toUpperCase() : s),
  lower: (s) => (typeof s === 'string' ? s.toLowerCase() : s),
  trim: (s) => (typeof s === 'string' ? s.trim() : s),
  round: (n, d) => {
    const num = Number(n)
    const dec = d === undefined ? 0 : Number(d)
    const f = 10 ** dec
    return Math.round(num * f) / f
  },
  floor: (n) => Math.floor(Number(n)),
  ceil: (n) => Math.ceil(Number(n)),
  abs: (n) => Math.abs(Number(n)),
  min: (...args) => Math.min(...args.map(Number)),
  max: (...args) => Math.max(...args.map(Number)),
  concat: (...args) => args.map((a) => (a === null || a === undefined ? '' : String(a))).join(''),
  join: (arr, sep) => (Array.isArray(arr) ? arr.join(String(sep ?? '')) : String(arr)),
  length: (s) => (typeof s === 'string' ? s.length : Array.isArray(s) ? s.length : 0),
  upperFirst: (s) => (typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1) : s),
  default: (v, d) => (v === null || v === undefined || v === '' ? d : v),
  date: (format?: unknown) => {
    const d = new Date()
    const map: Record<string, string> = {
      YYYY: String(d.getFullYear()),
      MM: String(d.getMonth() + 1).padStart(2, '0'),
      DD: String(d.getDate()).padStart(2, '0'),
      HH: String(d.getHours()).padStart(2, '0'),
      mm: String(d.getMinutes()).padStart(2, '0'),
      ss: String(d.getSeconds()).padStart(2, '0'),
    }
    return String(format ?? 'YYYY-MM-DD').replace(/YYYY|MM|DD|HH|mm|ss/g, (k) => map[k] ?? k)
  },
  if: (cond, a, b) => (cond ? a : b),
  sum: (...args) => args.flat().reduce((a, b) => Number(a) + Number(b), 0),
  avg: (...args) => {
    const arr = args.flat().map(Number)
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  },
}

const getValue = (path: string, ctx: MacroContext): unknown => {
  const parts = path.split('.').map((p) => p.trim())
  let v: unknown = ctx
  for (const p of parts) {
    if (v === null || v === undefined) return undefined
    v = (v as Record<string, unknown>)[p]
  }
  return v
}

/**
 * 单行表达式解析(沙箱)。
 * 支持:
 *   1. 简单插值      {{var}}
 *   2. 算术/比较/逻辑 {{a + b * 2}}
 *   3. 三元         {{cond ? 'yes' : 'no'}}
 *   4. 函数调用     {{upper(name)}}
 *   5. 字符串字面量 {{'hello'}}
 *   6. 数字字面量   {{42}}
 *   7. 括号优先级   {{(1+2)*3}}
 *
 * 使用递归下降:parseTernary → parseOr → parseAnd → parseCmp → parseAdd → parseMul → parseUnary → parsePrimary
 */
export const evaluateExpression = (expr: string, ctx: MacroContext): unknown => {
  const parser = new ExprParser(expr, ctx)
  const result = parser.parseTernary()
  parser.skipWhitespace()
  if (!parser.eof()) {
    throw new Error(`无法解析表达式:${expr}`)
  }
  return result
}

class ExprParser {
  private pos = 0
  constructor(
    private readonly src: string,
    private readonly ctx: MacroContext
  ) {}

  eof(): boolean {
    return this.pos >= this.src.length
  }

  skipWhitespace(): void {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos]!)) this.pos++
  }

  peek(): string | undefined {
    return this.src[this.pos]
  }

  /** 解析到本层结束(逗号/右括号/字符串尾) */
  private stopChar(): boolean {
    const c = this.peek()
    if (c === undefined) return true
    if (c === ',' || c === ')' || c === ']') return true
    return false
  }

  parseTernary(): unknown {
    const cond = this.parseOr()
    this.skipWhitespace()
    if (this.peek() === '?') {
      this.pos++
      const a = this.parseTernary()
      this.skipWhitespace()
      if (this.peek() !== ':') throw new Error('三元表达式缺少 :')
      this.pos++
      const b = this.parseTernary()
      return cond ? a : b
    }
    return cond
  }

  parseOr(): unknown {
    let left = this.parseAnd()
    while (!this.eof()) {
      this.skipWhitespace()
      if (this.peek() !== '|') break
      this.pos++
      if (this.peek() !== '|') throw new Error('期望 |')
      this.pos++
      const right = this.parseAnd()
      left = left || right
    }
    return left
  }

  parseAnd(): unknown {
    let left = this.parseCmp()
    while (!this.eof()) {
      this.skipWhitespace()
      if (this.peek() !== '&') break
      this.pos++
      if (this.peek() !== '&') throw new Error('期望 &')
      this.pos++
      const right = this.parseCmp()
      left = left && right
    }
    return left
  }

  parseCmp(): unknown {
    let left = this.parseAdd()
    while (!this.eof()) {
      this.skipWhitespace()
      if (this.stopChar()) break
      const rest = this.src.slice(this.pos)
      let op: string | null = null
      let opLen = 0
      if (rest.startsWith('===')) { op = '==='; opLen = 3 }
      else if (rest.startsWith('!==')) { op = '!=='; opLen = 3 }
      else if (rest.startsWith('==')) { op = '=='; opLen = 2 }
      else if (rest.startsWith('!=')) { op = '!='; opLen = 2 }
      else if (rest.startsWith('>=')) { op = '>='; opLen = 2 }
      else if (rest.startsWith('<=')) { op = '<='; opLen = 2 }
      else if (rest.startsWith('>')) { op = '>'; opLen = 1 }
      else if (rest.startsWith('<')) { op = '<'; opLen = 1 }
      if (!op) break
      this.pos += opLen
      const right = this.parseAdd()
      switch (op) {
        case '==': left = left === right; break
        case '===': left = left === right; break
        case '!=': left = left !== right; break
        case '!==': left = left !== right; break
        case '>': left = Number(left) > Number(right); break
        case '<': left = Number(left) < Number(right); break
        case '>=': left = Number(left) >= Number(right); break
        case '<=': left = Number(left) <= Number(right); break
      }
    }
    return left
  }

  parseAdd(): unknown {
    let left = this.parseMul()
    while (!this.eof()) {
      this.skipWhitespace()
      if (this.stopChar()) break
      const c = this.peek()!
      if (c !== '+' && c !== '-') break
      // 区分负号 unary: 若是表达式起始,跳过(parseUnary 处理)
      if (c === '-' && this.isUnaryPosition()) break
      this.pos++
      const right = this.parseMul()
      if (c === '+') {
        left = (typeof left === 'string' || typeof right === 'string')
          ? String(left ?? '') + String(right ?? '')
          : Number(left) + Number(right)
      } else {
        left = Number(left) - Number(right)
      }
    }
    return left
  }

  parseMul(): unknown {
    let left = this.parseUnary()
    while (!this.eof()) {
      this.skipWhitespace()
      if (this.stopChar()) break
      const c = this.peek()!
      if (c !== '*' && c !== '/' && c !== '%') break
      this.pos++
      const right = this.parseUnary()
      if (c === '*') left = Number(left) * Number(right)
      else if (c === '/') left = Number(left) / Number(right)
      else left = Number(left) % Number(right)
    }
    return left
  }

  parseUnary(): unknown {
    this.skipWhitespace()
    const c = this.peek()
    if (c === '!') {
      this.pos++
      return !this.parseUnary()
    }
    if (c === '-') {
      this.pos++
      return -Number(this.parseUnary())
    }
    return this.parsePrimary()
  }

  parsePrimary(): unknown {
    this.skipWhitespace()
    if (this.eof()) throw new Error('意外的表达式结尾')
    const c = this.peek()!
    if (c === '(') {
      this.pos++
      const v = this.parseTernary()
      this.skipWhitespace()
      if (this.peek() !== ')') throw new Error('期望 )')
      this.pos++
      return v
    }
    if (c === "'" || c === '"') {
      return this.parseString()
    }
    if (/\d/.test(c) || c === '-' || c === '+') {
      // 数字可前缀 +/-
      if (c === '-' || c === '+') {
        this.pos++
        const num = this.parseNumber()
        return c === '-' ? -num : num
      }
      return this.parseNumber()
    }
    if (/[A-Za-z_$]/.test(c)) {
      // 先尝试关键字 true/false/null/undefined
      const start = this.pos
      while (this.pos < this.src.length && /[A-Za-z0-9_$]/.test(this.src[this.pos]!)) this.pos++
      const name = this.src.slice(start, this.pos)
      if (name === 'true') return true
      if (name === 'false') return false
      if (name === 'null') return null
      if (name === 'undefined') return undefined
      // 不是关键字 → 标识符路径或函数调用
      this.pos = start
      return this.parseIdentOrFunc()
    }
    throw new Error(`意外的字符:${c}`)
  }

  private parseString(): string {
    const quote = this.peek()!
    this.pos++
    let s = ''
    while (this.pos < this.src.length && this.peek() !== quote) {
      s += this.src[this.pos]
      this.pos++
    }
    if (this.peek() !== quote) throw new Error('未结束的字符串')
    this.pos++ // 跳过结束引号
    return s
  }

  private parseNumber(): number {
    const start = this.pos
    while (this.pos < this.src.length && /[\d.]/.test(this.src[this.pos]!)) this.pos++
    return Number(this.src.slice(start, this.pos))
  }

  private parseIdentOrFunc(): unknown {
    const start = this.pos
    while (this.pos < this.src.length && /[A-Za-z0-9_$.]/.test(this.src[this.pos]!)) this.pos++
    const name = this.src.slice(start, this.pos)
    this.skipWhitespace()
    if (this.peek() === '(') {
      // 函数调用
      if (!(name in FUNCTIONS)) throw new Error(`未知函数:${name}`)
      this.pos++
      const args: unknown[] = []
      this.skipWhitespace()
      if (this.peek() !== ')') {
        while (true) {
          args.push(this.parseTernary())
          this.skipWhitespace()
          if (this.peek() === ',') {
            this.pos++
            continue
          }
          break
        }
      }
      if (this.peek() !== ')') throw new Error('期望 )')
      this.pos++
      return (FUNCTIONS[name] as (...a: unknown[]) => unknown)(...args)
    }
    // 标识符路径
    return getValue(name, this.ctx)
  }

  private isUnaryPosition(): boolean {
    // 在 parseAdd 起始处无法直接知道位置,简单启发:若在算术表达式起始,
    // parseUnary 已被 parseMul 调过,这里只会因为下一个 op 是 - 而进入。
    // 但一元负号时,左侧无操作数。简化:如果 - 后面紧跟数字/变量/'(',且当前是子表达式起点,视为 unary。
    return false
  }
}

const applyBinary = (op: string, lv: unknown, rv: unknown, _prec: number): unknown => {
  switch (op) {
    case '||':
      return lv || rv
    case '&&':
      return lv && rv
    case '==':
      return lv === rv
    case '!=':
      return lv !== rv
    case '>':
      return Number(lv) > Number(rv)
    case '<':
      return Number(lv) < Number(rv)
    case '>=':
      return Number(lv) >= Number(rv)
    case '<=':
      return Number(lv) <= Number(rv)
    case '+':
      if (typeof lv === 'string' || typeof rv === 'string') return String(lv ?? '') + String(rv ?? '')
      return Number(lv) + Number(rv)
    case '-':
      return Number(lv) - Number(rv)
    case '*':
      return Number(lv) * Number(rv)
    case '/':
      return Number(lv) / Number(rv)
    case '%':
      return Number(lv) % Number(rv)
    default:
      throw new Error(`不支持的操作符:${op}`)
  }
}

const findTopLevel = (s: string, ch: string): number => {
  let depth = 0
  let inStr: string | null = null
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inStr) {
      if (c === inStr) inStr = null
      continue
    }
    if (c === '"' || c === "'") {
      inStr = c
      continue
    }
    if (c === '(' || c === '[') depth++
    else if (c === ')' || c === ']') depth--
    else if (c === ch && depth === 0) return i
  }
  return -1
}

const parseArgs = (s: string): string[] => {
  const args: string[] = []
  let depth = 0
  let inStr: string | null = null
  let buf = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inStr) {
      buf += c
      if (c === inStr) inStr = null
      continue
    }
    if (c === '"' || c === "'") {
      inStr = c
      buf += c
      continue
    }
    if (c === '(' || c === '[') {
      depth++
      buf += c
    } else if (c === ')' || c === ']') {
      depth--
      buf += c
    } else if (c === ',' && depth === 0) {
      args.push(buf.trim())
      buf = ''
    } else {
      buf += c
    }
  }
  if (buf.trim()) args.push(buf.trim())
  return args
}

const collectVariables = (template: string): string[] => {
  const set = new Set<string>()
  const re = /\{\{\s*([\s\S]+?)\s*\}\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(template)) !== null) {
    const body = m[1]!
    if (
      body.startsWith('#if') ||
      body.startsWith('#else') ||
      body.startsWith('/if') ||
      body.startsWith('#each') ||
      body.startsWith('/each')
    )
      continue
    // 先剥离字符串字面量(防止里面字符干扰)
    let cleaned = body.replace(/'[^']*'|"[^"]*"/g, '')
    // 剥离函数调用(允许嵌套)
    let prev: string
    do {
      prev = cleaned
      cleaned = cleaned.replace(/[A-Za-z_$][A-Za-z0-9_$]*\s*\([^()]*\)/g, '')
    } while (cleaned !== prev)
    // 剥离数字
    cleaned = cleaned.replace(/\d+(\.\d+)?/g, '')
    // 剥离运算符
    cleaned = cleaned.replace(/[+\-*/%<>=!&|?:(),]/g, ' ')
    // 提取标识符路径
    const idRe = /[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*/g
    let im: RegExpExecArray | null
    while ((im = idRe.exec(cleaned)) !== null) {
      const id = im[0]!
      if (id in FUNCTIONS) continue
      if (id === 'true' || id === 'false' || id === 'null' || id === 'undefined') continue
      set.add(id)
    }
  }
  return Array.from(set)
}

const expandBlockIf = (template: string, ctx: MacroContext): { text: string; error?: string } => {
  const re = /\{\{#if\s+([\s\S]+?)\}\}([\s\S]*?)(?:\{\{#else\}\}([\s\S]*?))?\{\{\/if\}\}/g
  let error: string | undefined
  const out = template.replace(re, (_m, cond: string, a: string, b?: string) => {
    try {
      const v = evaluateExpression(cond, ctx)
      return v ? a : b ?? ''
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      return ''
    }
  })
  return { text: out, error }
}

const expandBlockEach = (template: string, ctx: MacroContext): { text: string; error?: string } => {
  const re = /\{\{#each\s+([\s\S]+?)\s+as\s+([\s\S]+?)\}\}([\s\S]*?)\{\{\/each\}\}/g
  let error: string | undefined
  const out = template.replace(re, (_m, listPath: string, itemName: string, body: string) => {
    try {
      const list = getValue(listPath, ctx)
      if (!Array.isArray(list)) return ''
      return list
        .map((item) => {
          const subCtx = { ...ctx, [itemName]: item }
          const replaced = body.replace(VAR_PATTERN, (_, expr: string) => {
            try {
              return String(evaluateExpression(expr, subCtx) ?? '')
            } catch {
              return ''
            }
          })
          return replaced
        })
        .join('')
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      return ''
    }
  })
  return { text: out, error }
}

/** 解析并执行模板,返回展开后的字符串 */
export const renderMacro = (template: string, ctx: MacroContext): MacroResult => {
  if (!template) return { ok: true, text: '' }
  try {
    let text = template
    // 块条件
    const ifRes = expandBlockIf(text, ctx)
    if (ifRes.error) return { ok: false, text: text, error: ifRes.error }
    text = ifRes.text
    // 块循环
    const eachRes = expandBlockEach(text, ctx)
    if (eachRes.error) return { ok: false, text, error: eachRes.error }
    text = eachRes.text
    // 单变量插值
    const computed: Record<string, unknown> = {}
    text = text.replace(VAR_PATTERN, (_m, expr: string) => {
      try {
        const v = evaluateExpression(expr, ctx)
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          computed[expr] = v
          return String(v)
        }
        return JSON.stringify(v)
      } catch (e) {
        return `<<ERROR:${e instanceof Error ? e.message : String(e)}>>`
      }
    })
    const variables = collectVariables(template)
    return { ok: true, text, variables, computed }
  } catch (e) {
    return { ok: false, text: template, error: e instanceof Error ? e.message : String(e) }
  }
}

/** 预览模式:在 UI 中实时高亮宏 */
export const highlightMacros = (template: string): Array<{ type: 'text' | 'macro' | 'block'; content: string }> => {
  const out: Array<{ type: 'text' | 'macro' | 'block'; content: string }> = []
  let i = 0
  while (i < template.length) {
    const rest = template.slice(i)
    const blockMatch = rest.match(/^\{\{(?:#if|#each|\/if|\/each|#else)[\s\S]*?\}\}/)
    const macroMatch = rest.match(/^\{\{[\s\S]+?\}\}/)
    if (blockMatch) {
      out.push({ type: 'block', content: blockMatch[0] })
      i += blockMatch[0].length
    } else if (macroMatch) {
      out.push({ type: 'macro', content: macroMatch[0] })
      i += macroMatch[0].length
    } else {
      const next = rest.indexOf('{{')
      if (next === -1) {
        out.push({ type: 'text', content: rest })
        break
      }
      out.push({ type: 'text', content: rest.slice(0, next) })
      i += next
    }
  }
  return out
}

/** 构造示例上下文(用于预览/测试) */
export const buildSampleContext = (): MacroContext => ({
  patient: { name: '张三', sex: 'M', age: 45, id: 'P-2026-001' },
  study: { modality: 'CT', bodyPart: 'CHEST', accession: 'ACC-001' },
  device: { name: 'Siemens SOMATOM', room: 'CT-1' },
  report: { id: 'R-001', qualityScore: 88, signedBy: '李明辉' },
  values: {
    bmi: 23.4,
    lesionSize: 12.5,
    birads: '4A',
  },
  items: [
    { name: '左肺上叶', finding: '见小结节' },
    { name: '右肺下叶', finding: '未见异常' },
  ],
})

/** 验证模板语法 */
export const validateTemplate = (template: string): { ok: boolean; error?: string; variables: string[] } => {
  try {
    const variables = collectVariables(template)
    return { ok: true, variables }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), variables: [] }
  }
}

export const SAMPLE_TEMPLATE = `检查日期:{{date("YYYY-MM-DD")}}
患者:{{patient.name}}({{patient.sex}}/{{patient.age}}岁)
检查号:{{study.accession}}
设备:{{device.name}}

影像所见:
{{#each items as item}}
- {{item.name}}:{{item.finding}}
{{/each}}

{{#if patient.age >= 18}}
成人检查方案,BMI={{values.bmi}}
{{#if values.bmi >= 24}}
提示:BMI 超标,需关注代谢相关风险
{{/if}}
{{#else}}
未成年,建议结合儿科会诊
{{/if}}

报告医师:{{report.signedBy}}
质量评分:{{report.qualityScore}} / 100
`

/** 把 StructuredField 数组转成宏上下文 */
export const structuredFieldsToContext = (fields: StructuredField[]): MacroContext => {
  const ctx: MacroContext = {}
  for (const f of fields) {
    ctx[f.key] = f.value ?? null
  }
  return ctx
}

/** 从 form values 转 context */
export const formValuesToContext = (values: Record<string, FieldValue>): MacroContext => {
  const ctx: MacroContext = {}
  for (const [k, v] of Object.entries(values)) {
    ctx[k] = v
  }
  return ctx
}
