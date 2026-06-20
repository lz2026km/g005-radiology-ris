// 详细查看 MSW handlers 注册
import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';

async function main() {
  console.log('=== MSW Handlers 验证 ===\n');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  page.on('console', (msg) => console.log(`[BROWSER ${msg.type()}] ${msg.text()}`));

  await ctx.addInitScript(() => {
    localStorage.setItem('ris_current_user', JSON.stringify({
      id: 'demo-admin', name: '系统管理员', role: '管理员', department: '放射科', username: 'admin',
    }));
  });

  // 监听 SW 的所有消息 (handler count etc)
  await page.addInitScript(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const d = event.data;
        if (d && d.type === 'MOCKING_ENABLED') {
          console.log('[MOCK ENABLED]', JSON.stringify(d));
        }
        if (d && d.type === 'MOCK_NOT_FOUND') {
          console.log('[MOCK NOT FOUND]', d.payload?.url);
        }
        if (d && d.type === 'RESPONSE' && d.payload?.isMockedResponse) {
          console.log('[MOCKED RESPONSE]', d.payload.requestId, d.payload.status);
        }
      });
    }
  });

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await wait(15000);

  // 测试具体 API
  const r1 = await page.evaluate(async () => {
    const r = await fetch('/api/v1/stats/daily');
    return { status: r.status, ct: r.headers.get('content-type'), body: (await r.text()).substring(0, 200) };
  });
  console.log('\n/api/v1/stats/daily:', JSON.stringify(r1));

  const r2 = await page.evaluate(async () => {
    const r = await fetch('/api/v1/worklist?limit=5');
    return { status: r.status, ct: r.headers.get('content-type'), body: (await r.text()).substring(0, 200) };
  });
  console.log('/api/v1/worklist:', JSON.stringify(r2));

  // 查看 worker 状态
  const wstate = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    return {
      hasController: !!navigator.serviceWorker.controller,
      controllerScript: navigator.serviceWorker.controller?.scriptURL,
      activeState: reg?.active?.state,
      activeScript: reg?.active?.scriptURL,
    };
  });
  console.log('\nSW 状态:', JSON.stringify(wstate, null, 2));

  await browser.close();
}

main().catch(e => {
  console.error('崩溃:', e.message);
  process.exit(1);
});
