// 详细诊断报告书写 V3 的 window.error
import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';

async function main() {
  console.log('=== 报告书写 V3 错误诊断 ===\n');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  page.on('console', (msg) => console.log(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (e) => console.log(`[PAGE ERROR] ${e.message}\n  Stack: ${e.stack?.substring(0, 500)}`));

  await ctx.addInitScript(() => {
    localStorage.setItem('ris_current_user', JSON.stringify({
      id: 'demo-admin', name: '系统管理员', role: '管理员', department: '放射科', username: 'admin',
    }));
    // 监听所有错误事件
    window.addEventListener('error', (e) => {
      const err = {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack?.substring(0, 500),
        errString: String(e.error),
      };
      console.log('[WINDOW ERROR DETAIL]', JSON.stringify(err, null, 2));
    }, true);
  });

  await page.goto(BASE + '/reports/v3-write', { waitUntil: 'domcontentloaded' });
  await wait(15000);

  // 看看 ErrorBoundary 捕获的错误
  const ebErrors = await page.evaluate(() => {
    return window.__errors || [];
  });
  console.log('\n__errors array:', JSON.stringify(ebErrors, null, 2));

  await browser.close();
}

main().catch(e => {
  console.error('崩溃:', e.message);
  process.exit(1);
});
