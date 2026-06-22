/**
 * Theme Management Utility (v3.0.6.8-23c stub)
 * 暗色模式支持 - CSS变量切换theme=dark/light
 */

let initialized = false;

export function initTheme(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try {
    const saved = (() => {
      try { return localStorage.getItem('g005-theme'); } catch { return null; }
    })();
    const theme = saved === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch {
    /* ignore */
  }
}

export function setTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('g005-theme', theme); } catch { /* ignore */ }
}

export function toggleTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function getTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}