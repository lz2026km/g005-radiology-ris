#!/usr/bin/env node
/**
 * audit:exports — 检测未使用的 export
 * 用法: pnpm audit:exports
 * 退出码: 0 (有 warnings 但不失败) / 1 (无)
 *
 * 通过正则扫描 src/**\/*.ts(x) 中所有 `export ...` 声明,再在仓库内 grep 是否
 * 至少有一个引用方。无任何 import 的 export 会列入"待复核"列表。
 *
 * 注意:这是粗扫(不含类型擦除、动态 import),上线前建议运行
 *   pnpm dlx ts-prune
 * 做权威检测(参见 docs/v3.0.5.1-A1-CODE.md MAJOR-CODE-19)。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

const ROOT = resolve(process.cwd(), 'src')
const EXTS = new Set(['.ts', '.tsx'])

/** @returns {[string, string, number][]} list of [exportName, file, line] */
function collectExports(file) {
  const text = readFileSync(file, 'utf8')
  const lines = text.split('\n')
  const found = []
  const namedExportRe = /^\s*export\s+(?:async\s+function|function|const|let|var|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const m = line.match(namedExportRe)
    if (m) {
      found.push([m[1], file, i + 1])
    }
  }
  return found
}

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    const s = statSync(p)
    if (s.isDirectory()) {
      out.push(...walk(p))
    } else if (EXTS.has(extname(p))) {
      out.push(p)
    }
  }
  return out
}

const files = walk(ROOT)
const allExports = []
for (const f of files) {
  allExports.push(...collectExports(f))
}

const allText = allExports.map(([, f]) => f).reduce((acc, f) => {
  acc[f] = readFileSync(f, 'utf8')
  return acc
}, {})

const unused = []
for (const [name, file, line] of allExports) {
  let refs = 0
  for (const [otherFile, text] of Object.entries(allText)) {
    if (otherFile === file) continue
    const re = new RegExp(`\\b${name}\\b`)
    if (re.test(text)) refs += 1
  }
  if (refs === 0) {
    unused.push({ name, file: file.replace(process.cwd() + '\\', ''), line })
  }
}

if (unused.length === 0) {
  process.stdout.write(`[audit:exports] OK — all ${allExports.length} exports are referenced.\n`)
  process.exit(0)
}

process.stdout.write(`[audit:exports] ${unused.length} export(s) have zero importers (manual review required):\n`)
for (const u of unused) {
  process.stdout.write(`  - ${u.file}:${u.line}  ${u.name}\n`)
}
process.stdout.write(`\n提示:对粗扫结果请运行 \`pnpm dlx ts-prune\` 做权威检测。\n`)
process.exit(0)
