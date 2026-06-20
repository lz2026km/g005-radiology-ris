/**
 * Theme Management Utility
 * U10: 暗色模式支持 - CSS变量切换theme=dark/light
 */

export type Theme = 'light' | 'dark'

export const STORAGE_KEY_THEME = 'g005-ris-theme'

/**
 * Get current theme from DOM
 */
export function getCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  const theme = document.documentElement.getAttribute('data-theme')
  return theme === 'light' ? 'light' : 'dark'
}

/**
 * Set theme on document
 */
export function setTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  try {
    document.documentElement.setAttribute('data-theme', theme)
  } catch { /* ignore */ }
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme)
  } catch { /* ignore */ }
}

/**
 * Toggle between light and dark
 */
export function toggleTheme(): Theme {
  const current = getCurrentTheme()
  const next = current === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

/**
 * Initialize theme from localStorage or system preference
 */
export function initTheme(): Theme {
  let stored: Theme | null = null
  try {
    stored = localStorage.getItem(STORAGE_KEY_THEME) as Theme | null
  } catch {
    // localStorage 不可用 (如 SPA 跳转中 document 临时 about:blank)
    return 'dark'
  }
  if (stored) {
    try { setTheme(stored) } catch { /* ignore */ }
    return stored
  }

  // Default to dark for this application (商业软件/蓝紫调)
  let preferred: Theme = 'dark'
  try {
    preferred = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch { /* ignore */ }
  try { setTheme(preferred) } catch { /* ignore */ }
  return preferred
}
