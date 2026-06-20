// 详细诊断 MSW: 监听所有 SW 消息
import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';

async function main() {
  console.log('=== MSW 详细诊断 v2 ===\n');
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

  // 监听 SW 消息
  await page.addInitScript(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[SW MESSAGE]', JSON.stringify(event.data));
      });
      const origPostMessage = MessagePort.prototype.postMessage;
      MessagePort.prototype.postMessage = function(msg) {
        console.log('[POST TO SW]', JSON.stringify(msg));
        return origPostMessage.call(this, ...arguments);
      };
    }
  });

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await wait(15000);

  const finalState = await page.evaluate(async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    return {
      hasController: !!navigator.serviceWorker.controller,
      controllerScript: navigator.serviceWorker.controller?.scriptURL,
      registrationsCount: regs.length,
      registrations: regs.map(r => ({ scope: r.scope, state: r.active?.state || r.installing?.state || r.waiting?.state })),
    };
  });
  console.log('\n最终状态:', JSON.stringify(finalState, null, 2));

  await browser.close();
}

main().catch(e => {
  console.error('崩溃:', e.message);
  process.exit(1);
});
