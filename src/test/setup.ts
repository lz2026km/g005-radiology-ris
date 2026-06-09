/**
 * G005 放射RIS系统 v3.0.0 - Vitest 测试环境设置
 * Phase T1-W1/W2: 测试基线
 *
 * 在每个测试文件运行前执行,提供:
 * - Canvas / WebGL Mock(DICOM 渲染需要)
 * - matchMedia / scrollIntoView polyfill
 * - i18next 初始化
 * - @testing-library/jest-dom 扩展 expect
 * - localStorage / sessionStorage / IndexedDB Mock
 */

import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import i18n from '@/i18n';

// ============= Canvas Mock(DICOM/cornerstone 必需) =============
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4 * 512 * 512),
      width: 512,
      height: 512,
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn((w: number, h: number) => ({
      data: new Uint8ClampedArray(4 * w * h),
      width: w,
      height: h,
    })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    canvas: { width: 512, height: 512 },
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}

// ============= DOM Polyfills =============
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

if (typeof window !== 'undefined' && !window.matchMedia) {
  // 让 matchMedia 同时支持 add/removeEventListener(antd ResponsiveObserver 需要)
  let mmListeners: Array<(e: MediaQueryListEvent) => void> = []
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    const mql: Partial<MediaQueryList> = {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn((cb: (e: MediaQueryListEvent) => void) => { mmListeners.push(cb) }),
      removeListener: vi.fn((cb: (e: MediaQueryListEvent) => void) => {
        mmListeners = mmListeners.filter((x) => x !== cb)
      }),
      addEventListener: vi.fn((_event: string, cb: (e: MediaQueryListEvent) => void) => { mmListeners.push(cb) }),
      removeEventListener: vi.fn((_event: string, cb: (e: MediaQueryListEvent) => void) => {
        mmListeners = mmListeners.filter((x) => x !== cb)
      }),
      dispatchEvent: vi.fn(),
    }
    return mql as MediaQueryList
  })
}

if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  // antd ResponsiveObserver / useBreakpoint 需要
  ;(window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  } as unknown as typeof ResizeObserver
}
if (typeof globalThis !== 'undefined' && !('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as unknown as typeof ResizeObserver;
}

// ============= IntersectionObserver Mock =============
if (typeof globalThis !== 'undefined' && !('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => []),
  })) as unknown as typeof IntersectionObserver;
}

// ============= Web Speech API Mock =============
if (typeof window !== 'undefined') {
  // @ts-expect-error - Mock SpeechRecognition for voice tests
  window.SpeechRecognition = vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onresult: null,
    onerror: null,
    onend: null,
  }));
  // @ts-expect-error - webkit prefix
  window.webkitSpeechRecognition = window.SpeechRecognition;
}

// ============= Web Crypto API Mock (如果 Node 环境缺失) =============
if (typeof globalThis.crypto === 'undefined') {
  // @ts-expect-error - 注入到 globalThis
  globalThis.crypto = (await import('node:crypto')).webcrypto;
}

// ============= IndexedDB Mock (Dexie 兼容) =============
// 简单实现,生产测试用 fake-indexeddb 更佳
const indexedDBStore = new Map<string, unknown>();
if (typeof globalThis !== 'undefined') {
  // @ts-expect-error - 提供简单 IDB shim
  globalThis.indexedDB = {
    open: vi.fn(() => ({
      result: {
        createObjectStore: vi.fn(),
        transaction: vi.fn(),
        objectStore: vi.fn(),
      },
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    })),
    deleteDatabase: vi.fn(),
  };
}

// ============= i18n 初始化 =============
beforeEach(async () => {
  await i18n.changeLanguage('zh_CN');
});

// ============= React Testing Library 自动清理 =============
afterEach(() => {
  cleanup();
  indexedDBStore.clear();
  vi.clearAllMocks();
});

// ============= 测试环境全局标记 =============
(globalThis as Record<string, unknown>).__G005_TEST__ = true;
(globalThis as Record<string, unknown>).__G005_VERSION__ = '3.0.0';

// ============= 控制台噪音抑制(可选) =============
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    const msg = String(args[0] ?? '');
    // 抑制 React 18 act 警告
    if (msg.includes('not wrapped in act')) return;
    // 抑制 i18n 缺失 key 警告
    if (msg.includes('[i18n] Missing key')) return;
    originalError(...args);
  };
});
afterEach(() => {
  console.error = originalError;
});
