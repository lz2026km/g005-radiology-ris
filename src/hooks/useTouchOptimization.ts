import { useMemo } from 'react';
import type { CSSProperties } from 'react';

export function useTouchOptimization(isTouch: boolean) {
  return useMemo(() => ({
    buttonStyle: {
      minHeight: isTouch ? 44 : 32,
      minWidth: isTouch ? 44 : 32,
      padding: isTouch ? '10px 16px' : '6px 12px',
    } as CSSProperties,
    inputStyle: {
      fontSize: isTouch ? 16 : 13,
      padding: isTouch ? '10px 12px' : '6px 8px',
    } as CSSProperties,
    tooltipDelay: isTouch ? 500 : 200,
    swipeThreshold: isTouch ? 50 : 30,
  }), [isTouch]);
}
