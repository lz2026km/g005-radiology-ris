/**
 * Keyboard Shortcuts Configuration
 * G005 Radiology RIS System v3.0.0
 *
 * Central registry for all keyboard shortcuts in the application.
 * Each shortcut defines key combos, descriptions in both zh-CN and en-US,
 * grouping, and action identifiers for the command palette.
 */

export interface ShortcutDef {
  /** Primary key (e.g., 's', 'Enter', 'F11') */
  key: string
  /** Require Ctrl key (or Cmd on Mac — callers should map) */
  ctrlKey?: boolean
  /** Require Shift key */
  shiftKey?: boolean
  /** Require Alt key */
  altKey?: boolean
  /** Require Meta key (Win/Cmd) */
  metaKey?: boolean
  /** Display label in Chinese */
  descriptionZh: string
  /** Display label in English */
  descriptionEn: string
  /** Group for categorization in command palette */
  group: 'editor' | 'navigation' | 'actions' | 'tools'
  /** Unique action name for programmatic reference */
  action: string
}

/**
 * Full shortcut registry — keep this list exhaustive.
 * Any feature that needs a keyboard shortcut should define it here.
 */
export const SHORTCUTS: Record<string, ShortcutDef> = {
  // ============ Editor / Formatting ============
  BOLD: {
    key: 'b',
    ctrlKey: true,
    descriptionZh: '加粗',
    descriptionEn: 'Bold',
    group: 'editor',
    action: 'bold',
  },
  ITALIC: {
    key: 'i',
    ctrlKey: true,
    descriptionZh: '斜体',
    descriptionEn: 'Italic',
    group: 'editor',
    action: 'italic',
  },
  UNDERLINE: {
    key: 'u',
    ctrlKey: true,
    descriptionZh: '下划线',
    descriptionEn: 'Underline',
    group: 'editor',
    action: 'underline',
  },
  STRIKETHROUGH: {
    key: 's',
    ctrlKey: true,
    shiftKey: true,
    descriptionZh: '删除线',
    descriptionEn: 'Strikethrough',
    group: 'editor',
    action: 'strikethrough',
  },
  UNDO: {
    key: 'z',
    ctrlKey: true,
    descriptionZh: '撤销',
    descriptionEn: 'Undo',
    group: 'editor',
    action: 'undo',
  },
  REDO: {
    key: 'z',
    ctrlKey: true,
    shiftKey: true,
    descriptionZh: '重做',
    descriptionEn: 'Redo',
    group: 'editor',
    action: 'redo',
  },
  /** Align left / right / center could be added here */

  // ============ Navigation ============
  TOGGLE_LEFT_PANEL: {
    key: 'b',
    ctrlKey: true,
    descriptionZh: '切换左侧面板',
    descriptionEn: 'Toggle Left Panel',
    group: 'navigation',
    action: 'toggleLeftPanel',
  },
  TOGGLE_RIGHT_PANEL: {
    key: 'b',
    ctrlKey: true,
    shiftKey: true,
    descriptionZh: '切换右侧面板',
    descriptionEn: 'Toggle Right Panel',
    group: 'navigation',
    action: 'toggleRightPanel',
  },
  TAB_0: {
    key: '0',
    ctrlKey: true,
    descriptionZh: '切换标签页 0',
    descriptionEn: 'Switch to Tab 0',
    group: 'navigation',
    action: 'switchTab0',
  },
  TAB_1: {
    key: '1',
    ctrlKey: true,
    descriptionZh: '切换标签页 1',
    descriptionEn: 'Switch to Tab 1',
    group: 'navigation',
    action: 'switchTab1',
  },
  TAB_2: {
    key: '2',
    ctrlKey: true,
    descriptionZh: '切换标签页 2',
    descriptionEn: 'Switch to Tab 2',
    group: 'navigation',
    action: 'switchTab2',
  },
  TAB_3: {
    key: '3',
    ctrlKey: true,
    descriptionZh: '切换标签页 3',
    descriptionEn: 'Switch to Tab 3',
    group: 'navigation',
    action: 'switchTab3',
  },
  TAB_4: {
    key: '4',
    ctrlKey: true,
    descriptionZh: '切换标签页 4',
    descriptionEn: 'Switch to Tab 4',
    group: 'navigation',
    action: 'switchTab4',
  },
  TAB_5: {
    key: '5',
    ctrlKey: true,
    descriptionZh: '切换标签页 5',
    descriptionEn: 'Switch to Tab 5',
    group: 'navigation',
    action: 'switchTab5',
  },
  TAB_6: {
    key: '6',
    ctrlKey: true,
    descriptionZh: '切换标签页 6',
    descriptionEn: 'Switch to Tab 6',
    group: 'navigation',
    action: 'switchTab6',
  },
  TAB_7: {
    key: '7',
    ctrlKey: true,
    descriptionZh: '切换标签页 7',
    descriptionEn: 'Switch to Tab 7',
    group: 'navigation',
    action: 'switchTab7',
  },
  TAB_8: {
    key: '8',
    ctrlKey: true,
    descriptionZh: '切换标签页 8',
    descriptionEn: 'Switch to Tab 8',
    group: 'navigation',
    action: 'switchTab8',
  },
  TAB_9: {
    key: '9',
    ctrlKey: true,
    descriptionZh: '切换标签页 9',
    descriptionEn: 'Switch to Tab 9',
    group: 'navigation',
    action: 'switchTab9',
  },
  MEASUREMENTS_TAB: {
    key: 'm',
    ctrlKey: true,
    descriptionZh: '测量标签页',
    descriptionEn: 'Measurements Tab',
    group: 'navigation',
    action: 'switchToMeasurements',
  },
  TEMPLATES_TAB: {
    key: 't',
    ctrlKey: true,
    shiftKey: true,
    descriptionZh: '模板标签页',
    descriptionEn: 'Templates Tab',
    group: 'navigation',
    action: 'switchToTemplates',
  },
  AI_ASSIST_TAB: {
    key: 'a',
    ctrlKey: true,
    shiftKey: true,
    descriptionZh: 'AI 辅助标签页',
    descriptionEn: 'AI Assist Tab',
    group: 'navigation',
    action: 'switchToAiAssist',
  },

  // ============ Actions ============
  SAVE: {
    key: 's',
    ctrlKey: true,
    descriptionZh: '保存',
    descriptionEn: 'Save',
    group: 'actions',
    action: 'save',
  },
  SUBMIT: {
    key: 'Enter',
    ctrlKey: true,
    descriptionZh: '提交',
    descriptionEn: 'Submit',
    group: 'actions',
    action: 'submit',
  },
  CANCEL: {
    key: 'Escape',
    descriptionZh: '取消 / 关闭',
    descriptionEn: 'Cancel / Close',
    group: 'actions',
    action: 'cancel',
  },
  COMMAND_PALETTE: {
    key: 'k',
    ctrlKey: true,
    descriptionZh: '命令面板',
    descriptionEn: 'Command Palette',
    group: 'actions',
    action: 'openCommandPalette',
  },
  PRINT_PREVIEW: {
    key: 'p',
    ctrlKey: true,
    shiftKey: true,
    descriptionZh: '打印 / 预览',
    descriptionEn: 'Print / Preview',
    group: 'actions',
    action: 'printPreview',
  },

  // ============ Tools ============
  FIND_REPLACE: {
    key: 'f',
    ctrlKey: true,
    shiftKey: true,
    descriptionZh: '查找与替换',
    descriptionEn: 'Find & Replace',
    group: 'tools',
    action: 'findReplace',
  },
  FULLSCREEN: {
    key: 'F11',
    descriptionZh: '全屏',
    descriptionEn: 'Fullscreen',
    group: 'tools',
    action: 'fullscreen',
  },
  FOCUS_SEARCH: {
    key: 'l',
    ctrlKey: true,
    descriptionZh: '聚焦搜索',
    descriptionEn: 'Focus Search',
    group: 'tools',
    action: 'focusSearch',
  },
}

/**
 * Groups list with display metadata for the command palette
 */
export const SHORTCUT_GROUPS: Record<string, { labelZh: string; labelEn: string }> = {
  editor: { labelZh: '编辑器', labelEn: 'Editor' },
  navigation: { labelZh: '导航', labelEn: 'Navigation' },
  actions: { labelZh: '操作', labelEn: 'Actions' },
  tools: { labelZh: '工具', labelEn: 'Tools' },
}

/**
 * Convert a ShortcutDef to a human-readable shortcut string (e.g., "Ctrl+Shift+S")
 */
export function formatShortcut(def: ShortcutDef): string {
  const parts: string[] = []
  if (def.ctrlKey) parts.push('Ctrl')
  if (def.shiftKey) parts.push('Shift')
  if (def.altKey) parts.push('Alt')
  if (def.metaKey) parts.push('Meta')
  parts.push(def.key.length === 1 ? def.key.toUpperCase() : def.key)
  return parts.join('+')
}

/**
 * All shortcut definitions as an array (useful for iteration)
 */
export const SHORTCUT_LIST: ShortcutDef[] = Object.values(SHORTCUTS)

export default SHORTCUTS
