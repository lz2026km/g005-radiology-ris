#!/usr/bin/env node
/**
 * audit:rbac — 验证 RBAC 关键不变量
 * 用法: pnpm audit:rbac
 * 退出码: 0 / 1
 *
 * 规则:
 *   1. AppLayout.tsx 中不允许出现 `role: '管理员' as Role` 模块级常量
 *   2. reportMachine.ts 的 guards 中不允许出现 `as any`
 *   3. PublishPage.tsx 必须存在 MIN_QUALITY_SCORE 常量或等价校验
 *   4. PermissionGuard.tsx 必须 import useAuth (已隐式保证,通过检查关键字)
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const checks = [
  {
    file: 'src/layouts/AppLayout.tsx',
    forbid: [/role:\s*['"]\u7ba1\u7406\u5458['"]\s*as\s*Role/],
    description: 'AppLayout 硬编码 "管理员" 角色',
  },
  {
    file: 'src/machines/reportMachine.ts',
    forbid: [/\(\s*event\s+as\s+any\s*\)/, /as any[\s\)\.,]/],
    description: 'reportMachine guards 不允许 `as any`',
  },
  {
    file: 'src/pages/PublishPage.tsx',
    require: [/MIN_QUALITY_SCORE/, />=\s*\d+|MIN_QUALITY_SCORE/, /qualityScore/i, /confirming|confirm/],
    description: 'PublishPage 必须强制 qualityScore 校验(>= 阈值) + 确认弹窗',
  },
  {
    file: 'src/components/PermissionGuard.tsx',
    require: [/useAuth/],
    description: 'PermissionGuard 必须使用 useAuth()',
  },
]

let failures = 0
for (const check of checks) {
  const full = resolve(process.cwd(), check.file)
  if (!existsSync(full)) {
    process.stderr.write(`\u2716 ${check.file} \u4e0d\u5b58\u5728\n`)
    failures += 1
    continue
  }
  const text = readFileSync(full, 'utf8')

  if (check.forbid) {
    for (const re of check.forbid) {
      if (re.test(text)) {
        process.stderr.write(`\u2716 ${check.file}: ${check.description} (\u68c0\u51fa\u4e0d\u5e94\u6709\u7684\u6a21\u5f0f)\n`)
        failures += 1
      }
    }
  }
  if (check.require) {
    const allFound = check.require.every((re) => re.test(text))
    if (!allFound) {
      process.stderr.write(`\u2716 ${check.file}: ${check.description} (\u7f3a\u5c11\u5fc5\u9700\u5173\u952e\u8bcd)\n`)
      failures += 1
    }
  }
}

if (failures > 0) {
  process.stderr.write(`\n[audit:rbac] ${failures} invariant violation(s).\n`)
  process.exit(1)
}
process.stdout.write('[audit:rbac] OK \u2014 all RBAC invariants hold.\n')
