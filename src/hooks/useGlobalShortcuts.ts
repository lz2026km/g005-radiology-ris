/**
 * useGlobalShortcuts - Central global keyboard shortcut registration
 * G005 Radiology RIS System v3.0.0
 *
 * Registers all application-level keyboard shortcuts from the SHORTCUTS config.
 * Automatically skips when focus is inside input/textarea elements to avoid conflicts.
 * Supports editor-aware shortcuts via an isEditorFocused callback.
 */

import { useEffect, useRef } from 'react'
import { SHORTCUTS, type ShortcutDef } from '../config/shortcuts'

export interface GlobalShortcutHandlers {
  /** Editor formatting */
  bold?: () => void
  italic?: () => void
  underline?: () => void
  strikethrough?: () => void
  undo?: () => void
  redo?: () => void

  /** Navigation */
  toggleLeftPanel?: () => void
  toggleRightPanel?: () => void
  switchTab0?: () => void
  switchTab1?: () => void
  switchTab2?: () => void
  switchTab3?: () => void
  switchTab4?: () => void
  switchTab5?: () => void
  switchTab6?: () => void
  switchTab7?: () => void
  switchTab8?: () => void
  switchTab9?: () => void
  switchToMeasurements?: () => void
  switchToTemplates?: () => void
  switchToAiAssist?: () => void

  /** Actions */
  save?: () => void
  submit?: () => void
  cancel?: () => void
  openCommandPalette?: () => void
  printPreview?: () => void

  /** Tools */
  findReplace?: () => void
  fullscreen?: () => void
  focusSearch?: () => void

  /** Allow any extra actions */
  [key: string]: (() => void) | undefined
}

export interface GlobalShortcutsOptions {
  /** Enable/disable all shortcuts (default: true) */
  enabled?: boolean
  /**
   * Callback to check if the TipTap (or any rich text) editor is focused.
   * When true, editor shortcuts (bold/italic/etc.) will fire even inside contenteditable.
   * Return false to suppress editor shortcuts in inputs.
   */
  isEditorFocused?: () => boolean
  /** Shortcut definitions to register (defaults to SHORTCUTS) */
  shortcuts?: Record<string, ShortcutDef>
}

const DEFAULT_IGNORE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

/**
 * Converts a ShortcutDef + handler into a keydown listener.
 */
function createHandler(
  def: ShortcutDef,
  handler: () => void,
  isEditorFocused: () => boolean,
) {
  return (e: KeyboardEvent) => {
    // Check modifier keys
    const matchCtrl = def.ctrlKey ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey)
    const matchShift = def.shiftKey ? e.shiftKey : !e.shiftKey
    const matchAlt = def.altKey ? e.altKey : !e.altKey
    const matchKey = e.key === def.key || e.key.toLowerCase() === def.key.toLowerCase()

    if (!(matchKey && matchCtrl && matchShift && matchAlt)) return

    // Check if we should ignore this event based on the active element
    const target = e.target as HTMLElement
    const tag = target.tagName
    const isContentEditable = target.isContentEditable || target.closest('[contenteditable]')

    // Editor shortcuts (bold, italic, etc.) should fire when the editor is focused
    const isEditorAction = def.group === 'editor'

    if (isEditorAction && isContentEditable) {
      if (!isEditorFocused()) return
      // Let TipTap handle its own shortcuts if we don't have a handler
      if (!handler) return
      e.preventDefault()
      e.stopPropagation()
      handler()
      return
    }

    // For non-editor shortcuts, skip if in input-like elements
    if (DEFAULT_IGNORE_TAGS.has(tag) && !target.dataset.enableShortcuts) {
      return
    }

    // Also skip if in a contenteditable and it's not an editor shortcut
    if (isContentEditable && !isEditorAction) return

    if (handler) {
      e.preventDefault()
      e.stopPropagation()
      handler()
    }
  }
}

/**
 * Register all global keyboard shortcuts.
 *
 * @example
 * ```tsx
 * useGlobalShortcuts({
 *   save: () => handleSave(),
 *   submit: () => handleSubmit(),
 *   openCommandPalette: () => setCommandPaletteOpen(true),
 * })
 * ```
 */
export function useGlobalShortcuts(
  handlers: GlobalShortcutHandlers,
  { enabled = true, isEditorFocused = () => false, shortcuts = SHORTCUTS }: GlobalShortcutsOptions = {},
) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!enabled) return

    const defs = Object.values(shortcuts).filter((def) => handlersRef.current[def.action])
    if (defs.length === 0) return

    const listeners = defs.map((def) => {
      const handler = createHandler(def, () => handlersRef.current[def.action]?.(), isEditorFocused)
      window.addEventListener('keydown', handler, { capture: true })
      return { def, handler }
    })

    return () => {
      for (const { handler } of listeners) {
        window.removeEventListener('keydown', handler, { capture: true })
      }
    }
  }, [enabled, isEditorFocused, shortcuts])
}

export default useGlobalShortcuts
