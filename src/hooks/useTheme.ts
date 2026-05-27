/**
 * useTheme Hook - 主题与样式管理
 * G005 Radiology RIS System
 */
import { useCallback } from 'react';

type ThemeMode = 'dark' | 'light';

interface UseThemeReturn {
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// CSS变量名称映射
const CSS_VARS = {
  'bg-deepest': '--bg-deepest',
  'bg-deep': '--bg-deep',
  'bg-card': '--bg-card',
  'bg-elevated': '--bg-elevated',
  'blue-accent': '--blue-accent',
  'text-primary': '--text-primary',
  'text-secondary': '--text-secondary',
  'border-subtle': '--border-subtle',
};

export function useTheme(): UseThemeReturn {
  const mode: ThemeMode = 'dark'; // 当前固定为dark模式
  const isDark = mode === 'dark';

  const toggleTheme = useCallback(() => {
    // 预留主题切换功能
    console.log('Theme toggle not implemented');
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    console.log('Set theme:', newMode);
  }, []);

  return {
    mode,
    isDark,
    toggleTheme,
    setTheme,
  };
}

// 预设颜色工具
export const statusColors = {
  success: 'var(--status-success)',
  warning: 'var(--status-warning)',
  error: 'var(--status-error)',
  info: 'var(--status-info)',
  pending: 'var(--status-pending)',
};

export const accentColors = {
  primary: 'var(--blue-accent)',
  light: 'var(--blue-light)',
  dark: 'var(--blue-dark)',
  purple: 'var(--purple-accent)',
};

export default useTheme;