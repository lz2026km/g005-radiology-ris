/**
 * G005 放射RIS系统 v3.0.0 - MSW Service Worker 启动
 * Phase T4-W9: MSW 浏览器端
 *
 * 用法:
 *   if (import.meta.env.DEV) {
 *     const { worker } = await import('@services/mockBackend/worker');
 *     await worker.start({ onUnhandledRequest: 'bypass' });
 *   }
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

/** 启动 MSW(开发模式) */
export async function startMockBackend(): Promise<void> {
  if (typeof window === 'undefined') return;
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
    quiet: false,
  });
  // handlers 计数从 handlers.ts 自动派生(v3.0.4) — 增减 endpoint 后自动同步
  console.info(`[MSW] Mock backend started. ${handlers.length} endpoints ready.`);
}

/** 停止 MSW(测试清理) */
export async function stopMockBackend(): Promise<void> {
  await worker.stop();
}
