/**
 * G005 放射RIS系统 v3.0.1 - ShortcutsCheatsheet 单测
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SHORTCUTS, ShortcutsCheatsheet } from '../ShortcutsCheatsheet'

describe('ShortcutsCheatsheet', () => {
  it('SHORTCUTS 至少 20 条,覆盖 3 个 scope', () => {
    expect(SHORTCUTS.length).toBeGreaterThanOrEqual(20)
    const scopes = new Set(SHORTCUTS.map((s) => s.scope))
    expect(scopes.has('viewer')).toBe(true)
    expect(scopes.has('report')).toBe(true)
    expect(scopes.has('global')).toBe(true)
  })

  it('必含行业标准快捷键', () => {
    const keys = SHORTCUTS.map((s) => s.key)
    expect(keys).toContain('W / Shift+W')
    expect(keys).toContain('R')
    expect(keys).toContain('Ctrl+S')
    expect(keys).toContain('Ctrl+Enter')
    expect(keys).toContain('Alt+A')
    expect(keys).toContain('?')
    expect(keys).toContain('Esc')
  })

  it('受控 open 渲染 Modal', () => {
    render(<ShortcutsCheatsheet open onClose={() => {}} />)
    expect(screen.getByText('快捷键速查')).toBeInTheDocument()
    expect(screen.getByText('影像')).toBeInTheDocument()
    expect(screen.getByText('报告')).toBeInTheDocument()
    expect(screen.getByText('全局')).toBeInTheDocument()
  })
})
