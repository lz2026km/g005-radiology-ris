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
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(STORAGE_KEY_THEME, theme)
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
  const stored = localStorage.getItem(STORAGE_KEY_THEME) as Theme | null
  if (stored) {
    setTheme(stored)
    return stored
  }
  
  // Default to dark for this application (商业软件/蓝紫调)
  const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  setTheme(preferred)
  return preferred
}
