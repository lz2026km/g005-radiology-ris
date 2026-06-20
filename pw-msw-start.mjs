// 直接调 MSW worker.start 看 hang 在哪
import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';

async function main() {
  console.log('=== MSW worker.start 详细诊断 ===\n');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  page.on('console', (msg) => console.log(`[BROWSER ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (e) => console.log(`[PAGE ERROR] ${e.message}`));

  await ctx.addInitScript(() => {
    localStorage.setItem('ris_current_user', JSON.stringify({
      id: 'demo-admin', name: '系统管理员', role: '管理员', department: '放射科', username: 'admin',
    }));
  });

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await wait(2000);

  // 直接在浏览器内调 MSW worker.start，不走我们的 main.tsx 启动
  console.log('\n--- 手动启动 MSW (绕过 SW cleanup) ---');
  const startResult = await page.evaluate(async () => {
    const log = (msg) => console.log(`[MSW-START] ${msg}`);

    try {
      log('importing worker module...');
      const { startMockBackend } = await import('/g005-radiology-ris/' + (window.__mswChunk || 'assets/') + 'index-' + (window.__mswIndex || 'unknown') + '.js').catch(() => null) || {};

      // 直接用 setupWorker
      const msw = await import('https://esm.sh/msw@2.6.0/browser');
      log('msw module loaded: ' + Object.keys(msw).join(', '));

      const { handlers } = await import('/src/services/mockBackend/handlers.ts').catch(e => {
        log('handlers import failed: ' + e.message);
        return { handlers: [] };
      });
      log('handlers: ' + handlers.length);

      const worker = msw.setupWorker(...handlers);
      log('worker created, calling start()...');

      const startTime = Date.now();
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/g005-radiology-ris/mockServiceWorker.js',
        },
        quiet: false,
      });
      log('MSW started! Took ' + (Date.now() - startTime) + 'ms');

      // 测试拦截
      const r = await fetch('/api/v1/worklist?status=pending&limit=10');
      const text = await r.text();
      return {
        ok: true,
        status: r.status,
        contentType: r.headers.get('content-type'),
        bodyStart: text.substring(0, 100)
      };
    } catch (e) {
      return { ok: false, error: e.message, stack: e.stack };
    }
  });

  console.log('\n结果:', JSON.stringify(startResult, null, 2));

  await browser.close();
}

main().catch(e => {
  console.error('崩溃:', e.message);
  process.exit(1);
});
