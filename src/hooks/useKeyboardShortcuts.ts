/**
 * useKeyboardShortcuts - E6: 快捷键支持
 * Ctrl+S保存 / Ctrl+Enter提交 / ESC取消 等快捷键
 * G005 Radiology RIS System
 */
import { useEffect, useCallback, useRef } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  /** 快捷键描述（用于提示） */
  description?: string
  /** 在哪些元素上不响应（防止输入框冲突） */
  ignoreOn?: string[]
}

const DEFAULT_IGNORE_ON = ['INPUT', 'TEXTAREA', 'SELECT', 'CONTENTEDITABLE']

/**
 * 全局快捷键Hook
 * @param shortcuts 快捷键配置数组
 * @param enabled 是否启用，默认true
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true
) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      // 检查是否在忽略的元素上
      const target = e.target as HTMLElement
      if (DEFAULT_IGNORE_ON.includes(target.tagName) && !target.dataset.enableShortcuts) {
        return
      }

      for (const shortcut of shortcutsRef.current) {
        const matchCtrl = shortcut.ctrlKey ? e.ctrlKey : !shortcut.ctrlKey
        const matchShift = shortcut.shiftKey ? e.shiftKey : !shortcut.shiftKey
        const matchAlt = shortcut.altKey ? e.altKey : !shortcut.altKey
        const matchMeta = shortcut.metaKey ? e.metaKey : !shortcut.metaKey
        const matchKey = e.key.toLowerCase() === shortcut.key.toLowerCase()

        if (matchKey && matchCtrl && matchShift && matchAlt && matchMeta) {
          e.preventDefault()
          e.stopPropagation()
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener('keydown', handler, { capture: true })
    return () => window.removeEventListener('keydown', handler, { capture: true })
  }, [enabled])
}

/**
 * 快捷键提示组件渲染数据
 */
export function getShortcutHint(shortcut: KeyboardShortcut): string {
  const parts: string[] = []
  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.shiftKey) parts.push('Shift')
  if (shortcut.altKey) parts.push('Alt')
  if (shortcut.metaKey) parts.push('Meta')
  parts.push(shortcut.key.toUpperCase())
  return parts.join('+')
}

/**
 * 预设快捷键配置
 */
export const SHORTCUTS = {
  SAVE: (action: () => void) => ({
    key: 's',
    ctrlKey: true,
    action,
    description: '保存',
  }),
  SUBMIT: (action: () => void) => ({
    key: 'Enter',
    ctrlKey: true,
    action,
    description: '提交',
  }),
  CANCEL: (action: () => void) => ({
    key: 'Escape',
    action,
    description: '取消',
  }),
  SEARCH: (action: () => void) => ({
    key: 'f',
    ctrlKey: true,
    action,
    description: '搜索',
  }),
  QUICK_ADD: (action: () => void) => ({
    key: 'n',
    ctrlKey: true,
    action,
    description: '新建',
  }),
  REFRESH: (action: () => void) => ({
    key: 'r',
    ctrlKey: true,
    action,
    description: '刷新',
  }),
  EXPORT: (action: () => void) => ({
    key: 'e',
    ctrlKey: true,
    action,
    description: '导出',
  }),
  PRINT: (action: () => void) => ({
    key: 'p',
    ctrlKey: true,
    action,
    description: '打印',
  }),
  UNDO: (action: () => void) => ({
    key: 'z',
    ctrlKey: true,
    action,
    description: '撤销',
  }),
  REDO: (action: () => void) => ({
    key: 'z',
    ctrlKey: true,
    shiftKey: true,
    action,
    description: '重做',
  }),
} as const

export default useKeyboardShortcuts