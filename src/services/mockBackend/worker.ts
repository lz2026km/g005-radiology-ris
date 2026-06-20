/**
 * G005 放射RIS系统 v3.0.0 - MSW Service Worker 启动
 * Phase T4-W9: MSW 浏览器端
 *
 * v3.0.6.8-13: 手动控制 SW 生命周期，绕过 MSW worker.start() 的 wait-for-activated
 *   卡死问题 (当 SW 已 activated 时，statechange 事件不触发)
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

const MSW_WORKER_URL = import.meta.env.BASE_URL + 'mockServiceWorker.js';
const MSW_SCOPE = import.meta.env.BASE_URL;

/** 手动启动 SW,等激活后调 MSW worker.start */
async function startSWManually(timeoutMs = 5000): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  console.info('[MSW] Phase A1: checking existing SW...');
  // 先看是否已有 SW
  const existing = await navigator.serviceWorker.getRegistration(MSW_SCOPE);
  if (existing && existing.active) {
    console.info(`[MSW] Phase A2: existing SW active: ${existing.active.state}`);
    return existing;
  }
  console.info('[MSW] Phase A2: registering SW...');
  let reg: ServiceWorkerRegistration;
  try {
    reg = await navigator.serviceWorker.register(MSW_WORKER_URL, { scope: MSW_SCOPE });
  } catch (e) {
    console.error('[MSW] Phase A2: register() threw:', e);
    return null;
  }
  console.info(`[MSW] Phase A3: registered, active=${!!reg.active}, installing=${!!reg.installing}, waiting=${!!reg.waiting}`);
  try {
    // 等待 SW 激活 (处理直接 active 情况)
    if (reg.active && reg.active.state === 'activated') {
      console.info('[MSW] Phase A4: SW already activated');
      return reg;
    }
    const sw = reg.installing || reg.waiting;
    if (!sw) {
      console.warn('[MSW] Phase A4: no installing/waiting SW, returning reg');
      return reg;
    }
    await Promise.race([
      new Promise<void>((resolve) => {
        if (sw.state === 'activated') { resolve(); return; }
        const onChange = () => {
          console.info(`[MSW] SW state: ${sw.state}`);
          if (sw.state === 'activated') { sw.removeEventListener('statechange', onChange); resolve(); }
        };
        sw.addEventListener('statechange', onChange);
      }),
      new Promise<void>((_, reject) => setTimeout(() => reject(new Error('SW activation timeout')), timeoutMs))
    ]);
    console.info('[MSW] Phase A4: SW activated');
    return reg;
  } catch (e) {
    console.error('[MSW] Phase A3: activation failed:', e);
    return null;
  }
}

/** 启动 MSW (开发模式) */
export async function startMockBackend(): Promise<void> {
  if (typeof window === 'undefined') return;
  console.info('[MSW] Phase A: startSWManually...');
  const reg = await startSWManually(5000);
  if (!reg) {
    console.warn('[MSW] No SW available, skipping MSW');
    return;
  }
  console.info('[MSW] Phase B: worker.start()...');
  // 调 MSW 自己的 start(它会复用已注册的 SW)
  // 不 await (因为可能 hang 在等 activated)
  // 用 Promise.race + 短 timeout,如果它太快完成就 OK,否则已经激活的 SW 可直接用
  try {
    await Promise.race([
      worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: { url: MSW_WORKER_URL },
        quiet: true,
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]);
    console.info('[MSW] Phase C: worker.start() resolved');
  } catch (e) {
    console.warn('[MSW] worker.start failed, but SW is active:', e);
  }
  // handlers 计数从 handlers.ts 自动派生
  console.info(`[MSW] Mock backend started. ${handlers.length} endpoints ready.`);
}

/** 停止 MSW(测试清理) */
export async function stopMockBackend(): Promise<void> {
  await worker.stop();
}
