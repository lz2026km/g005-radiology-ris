// 详细诊断 MSW 启动过程
import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';

async function main() {
  console.log('=== MSW 详细诊断 ===\n');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    serviceWorkers: 'allow',
  });
  const page = await ctx.newPage();

  page.on('console', (msg) => {
    console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (e) => {
    console.log(`[PAGE ERROR] ${e.message}`);
  });

  // 注入登录状态
  await ctx.addInitScript(() => {
    localStorage.setItem('ris_current_user', JSON.stringify({
      id: 'demo-admin', name: '系统管理员', role: '管理员', department: '放射科', username: 'admin',
    }));
  });

  // 直接在浏览器中手动尝试启动 MSW
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await wait(3000);

  console.log('\n--- 1. 检查 SW 支持 ---');
  const swSupport = await page.evaluate(async () => {
    return {
      hasServiceWorker: 'serviceWorker' in navigator,
      hasCaches: 'caches' in window,
    };
  });
  console.log(swSupport);

  console.log('\n--- 2. 检查现有 SW ---');
  const existingSWs = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return [];
    const regs = await navigator.serviceWorker.getRegistrations();
    return regs.map(r => ({ scope: r.scope, active: !!r.active, installing: !!r.installing, waiting: !!r.waiting }));
  });
  console.log(existingSWs);

  console.log('\n--- 3. 手动注册 MSW worker ---');
  const regResult = await page.evaluate(async () => {
    try {
      const reg = await navigator.serviceWorker.register('/g005-radiology-ris/mockServiceWorker.js', { scope: '/g005-radiology-ris/' });
      // 等 10s 让 SW 激活
      await new Promise((resolve) => {
        const sw = reg.installing || reg.waiting || reg.active;
        if (!sw) { resolve(); return; }
        if (sw.state === 'activated') { resolve(); return; }
        sw.addEventListener('statechange', () => {
          console.log('SW state:', sw.state);
          if (sw.state === 'activated') resolve();
        });
        setTimeout(() => resolve(), 10000);
      });
      return { ok: true, scope: reg.scope, state: reg.active?.state || 'none' };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  console.log(regResult);

  console.log('\n--- 4. 测试 MSW 拦截 ---');
  const fetchTest = await page.evaluate(async () => {
    try {
      const r = await fetch('/api/v1/worklist?status=pending&limit=10');
      const ct = r.headers.get('content-type') || '';
      const text = await r.text();
      return { status: r.status, contentType: ct, textStart: text.substring(0, 200) };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log(fetchTest);

  await browser.close();
}

main().catch(e => {
  console.error('崩溃:', e.message);
  process.exit(1);
});
