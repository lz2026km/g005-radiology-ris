import { useState, useCallback, useEffect } from 'react'

export type ThemeMode = 'light' | 'dark' | 'high-contrast'

interface UseThemeReturn {
  mode: ThemeMode
  isDark: boolean
  isHighContrast: boolean
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const STORAGE_KEY = 'g005_theme'

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'high-contrast') return stored
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode)
  document.documentElement.style.colorScheme = mode === 'dark' ? 'dark' : 'light'
}

export function useTheme(): UseThemeReturn {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    applyTheme(mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'high-contrast'
      return 'light'
    })
  }, [])

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode)
  }, [])

  return {
    mode,
    isDark: mode === 'dark',
    isHighContrast: mode === 'high-contrast',
    toggleTheme,
    setTheme,
  }
}

export default useTheme
