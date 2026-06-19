/**
 * G005 放射RIS系统 v3.0.6.6 - 移动端触觉反馈服务
 * 10 升级点:振动模式 / 触觉预设 / 静默降级 / 配置化 / 节流
 */

import type { HapticPattern } from '../../types/mobile';

const PATTERN_MAP: Record<HapticPattern, VibratePattern> = {
  light: [10],
  medium: [20, 30, 20],
  heavy: [40, 60, 40, 60, 40],
  success: [20, 50, 20, 50, 20],
  warning: [30, 80, 30],
  error: [50, 100, 50, 100, 50],
  selection: [5, 15, 5],
  none: [],
};

type VibratePattern = number | number[];

class HapticsService {
  private enabled = true;
  private lastVibrateAt = 0;
  private throttleMs = 50;

  get isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
  }

  setThrottle(ms: number): void {
    this.throttleMs = ms;
  }

  vibrate(pattern: HapticPattern = 'light'): boolean {
    if (!this.enabled || !this.isSupported) return false;
    if (pattern === 'none') return false;
    const now = Date.now();
    if (now - this.lastVibrateAt < this.throttleMs) return false;
    this.lastVibrateAt = now;
    try {
      return navigator.vibrate(PATTERN_MAP[pattern]);
    } catch {
      return false;
    }
  }

  light(): boolean { return this.vibrate('light'); }
  medium(): boolean { return this.vibrate('medium'); }
  heavy(): boolean { return this.vibrate('heavy'); }
  success(): boolean { return this.vibrate('success'); }
  warning(): boolean { return this.vibrate('warning'); }
  error(): boolean { return this.vibrate('error'); }
  selection(): boolean { return this.vibrate('selection'); }

  async supportedPatterns(): Promise<HapticPattern[]> {
    if (!this.isSupported) return ['none'];
    return Object.keys(PATTERN_MAP).filter(k => k !== 'none') as HapticPattern[];
  }
}

export const haptics = new HapticsService();
