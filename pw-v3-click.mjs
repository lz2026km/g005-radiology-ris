// 用浏览器中转储所有 window.error 事件
import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';

async function main() {
  console.log('=== 详细 V3 错误捕获 ===\n');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  page.on('console', (msg) => console.log(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (e) => console.log(`[PAGE ERROR] msg=${e.message} stack=${e.stack?.substring(0, 1000)}`));

  await ctx.addInitScript(() => {
    localStorage.setItem('ris_current_user', JSON.stringify({
      id: 'demo-admin', name: '系统管理员', role: '管理员', department: '放射科', username: 'admin',
    }));
  });

  // 拦截 React 的错误报告
  await page.addInitScript(() => {
    const origOnError = window.onerror;
    window.onerror = function (msg, url, lineNo, columnNo, error) {
      console.log('[onerror] msg=' + msg + ' url=' + url + ' line=' + lineNo + ' col=' + columnNo);
      if (error) console.log('[onerror] error.stack=' + (error.stack || 'no stack'));
      if (origOnError) return origOnError.apply(this, arguments);
      return false;
    };
  });

  await page.goto(BASE + '/reports/v3-write', { waitUntil: 'domcontentloaded' });
  await wait(15000);

  // 尝试点击一些按钮触发更多错误
  const buttons = await page.$$('button');
  console.log(`找到 ${buttons.length} 个按钮`);
  for (let i = 0; i < Math.min(5, buttons.length); i++) {
    try {
      const text = await buttons[i].textContent();
      console.log(`点击按钮: ${text?.trim().substring(0, 30)}`);
      await buttons[i].click();
      await wait(1000);
    } catch (e) {
      console.log(`点击失败: ${e.message}`);
    }
  }

  await browser.close();
}

main().catch(e => {
  console.error('崩溃:', e.message);
  process.exit(1);
});
