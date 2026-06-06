/**
 * G005 放射RIS系统 v3.0.0 - 响应式断点 hooks
 * Phase T3-W8: 移动端 H5
 *
 * 断点(与 antd / Tailwind 一致):
 *   xs: < 576px
 *   sm: ≥ 576px
 *   md: ≥ 768px (平板)
 *   lg: ≥ 992px (笔记本)
 *   xl: ≥ 1200px (桌面)
 *   xxl: ≥ 1600px (大屏)
 */

import { useEffect, useState } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

export function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.xxl) return 'xxl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/** 当前断点 */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window === 'undefined' ? 'lg' : getBreakpoint(window.innerWidth)
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handler = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // 防抖 100ms
      timeoutId = setTimeout(() => setBp(getBreakpoint(window.innerWidth)), 100);
    };

    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return bp;
}

/** 是否为移动端(< md) */
export function useIsMobile(): boolean {
  const bp = useBreakpoint();
  return bp === 'xs' || bp === 'sm';
}

/** 是否为平板 */
export function useIsTablet(): boolean {
  const bp = useBreakpoint();
  return bp === 'md';
}

/** 是否为桌面 */
export function useIsDesktop(): boolean {
  const bp = useBreakpoint();
  return bp === 'lg' || bp === 'xl' || bp === 'xxl';
}

/** 视口宽度(防抖) */
export function useViewportWidth(): number {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 1200 : window.innerWidth
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const handler = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setWidth(window.innerWidth), 100);
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return width;
}

/** 设备方向 */
export function useOrientation(): 'portrait' | 'landscape' {
  const width = useViewportWidth();
  return width >= 768 ? 'landscape' : 'portrait';
}

/** 触摸设备检测 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });
  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return;
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    window.addEventListener('touchstart', check, { once: true });
    return () => window.removeEventListener('touchstart', check);
  }, []);
  return isTouch;
}
