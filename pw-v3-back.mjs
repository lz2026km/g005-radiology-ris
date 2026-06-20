// 深入诊断报告书写 V3 错误
import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  page.on('console', (msg) => {
    const t = msg.text();
    console.log(`[${msg.type()}] ${t}`);
  });
  page.on('pageerror', (e) => {
    console.log(`[PAGE ERROR] ${e.message}`);
    console.log(`[STACK] ${e.stack?.substring(0, 2000)}`);
  });

  await ctx.addInitScript(() => {
    localStorage.setItem('ris_current_user', JSON.stringify({
      id: 'demo-admin', name: '系统管理员', role: '管理员', department: '放射科', username: 'admin',
    }));
  });

  await page.goto(BASE + '/reports/v3-write', { waitUntil: 'domcontentloaded' });
  await wait(12000);

  // 点击"返回"按钮
  console.log('\n>>> 点击返回按钮 <<<');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = (await b.textContent() || '').trim();
    if (text.includes('返回')) {
      console.log('找到返回按钮');
      await b.click();
      await wait(2000);
      break;
    }
  }

  await wait(3000);
  await browser.close();
}

main().catch(e => {
  console.error('崩溃:', e.message);
  process.exit(1);
});
