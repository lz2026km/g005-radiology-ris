#!/usr/bin/env node
/**
 * audit:dead-ui — 扫描 src/pages 与 src/components 中"死按钮/空表"的反模式
 * 用法: pnpm audit:dead-ui
 * 退出码: 0 (无新违例) / 1 (发现新违例)
 *
 * 匹配规则(可用 // @audit-ok 注释豁免单行):
 *   1. onClick / onChange 处理器内仅有 console.log(...)
 *   2. onClick 处理器内仅 showToast('...功能开发中') 或 alert('...(模拟|示例|开发中)')
 *   3. src/pages 中硬 <div>暂无数据</div> 早返回守卫(必须改为 EmptyBanner + 上下文)
 *
 * 排除: useState<T[]>([]) 本身在 SSR 友好的组件中是合法模式,不报错
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const ROOT = resolve(process.cwd(), 'src')
const PATTERNS = [
  // 1. dead console.log handlers
  /on(Click|Change|Submit)=?\{?[^}]*?console\.log\(/m,
  // 2a. dead toast: "功能开发中"
  /on(Click|Change)=?\{?[^}]*?showToast\(['"][^'"]*\u529f\u80fd\u5f00\u53d1\u4e2d/m,
  // 2b. dead alert: 模拟 / 示例 / 开发中
  /on(Click|Change)=?\{?[^}]*?alert\(['"][^'"]*(\u6a21\u62df|\u793a\u4f8b|\u5f00\u53d1\u4e2d)/m,
  // 3. hard 暂无数据 guard
  /<div[^>]*>\u6682\u65e0\u6570\u636e<\/div>/,
]
const AUDIT_OK = /@audit-ok/
const SCAN_DIRS = ['pages', 'components']

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...walk(full))
    } else if (['.tsx', '.ts'].includes(extname(entry))) {
      out.push(full)
    }
  }
  return out
}

let violations = 0
for (const sub of SCAN_DIRS) {
  const dir = join(ROOT, sub)
  let files
  try {
    files = walk(dir)
  } catch {
    continue
  }
  for (const file of files) {
    if (file.includes('__tests__') || file.includes('.stories.')) continue
    const text = readFileSync(file, 'utf8')
    const lines = text.split('\n')
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i]
      if (AUDIT_OK.test(line)) continue
      for (const re of PATTERNS) {
        if (re.test(line)) {
          const rel = relative(process.cwd(), file)
          process.stdout.write(`\u2716 ${rel}:${i + 1}  ${line.trim()}\n`)
          violations += 1
          break
        }
      }
    }
  }
}

if (violations > 0) {
  process.stderr.write(`\n[audit:dead-ui] ${violations} violation(s) found.\n`)
  process.exit(1)
}
process.stdout.write('[audit:dead-ui] OK \u2014 no dead UI handlers detected.\n')
