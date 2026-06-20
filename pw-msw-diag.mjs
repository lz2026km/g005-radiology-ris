// 简单测试 MSW 启动
import { chromium } from 'playwright';
import { setTimeout as wait } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';

async function main() {
  console.log('=== MSW 诊断测试 ===\n');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const logs = [];
  page.on('console', (msg) => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (e) => logs.push(`[ERROR] ${e.message}`));
  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      logs.push(`[REQ] ${req.method()} ${req.url()}`);
    }
  });
  page.on('response', (res) => {
    if (res.url().includes('/api/')) {
      logs.push(`[RES] ${res.status()} ${res.url()}`);
    }
  });

  // 注入登录状态
  await ctx.addInitScript(() => {
    localStorage.setItem('ris_current_user', JSON.stringify({
      id: 'demo-admin',
      name: '系统管理员',
      role: '管理员',
      department: '放射科',
      username: 'admin',
    }));
  });

  await page.goto(BASE + '/worklist', { waitUntil: 'domcontentloaded' });
  await wait(20000);

  // 测一下 fetch 是否被 MSW 拦截
  const testResult = await page.evaluate(async () => {
    try {
      const r = await fetch('/api/v1/worklist?status=pending&limit=10');
      const ct = r.headers.get('content-type') || '';
      const text = await r.text();
      return { status: r.status, contentType: ct, textStart: text.substring(0, 200) };
    } catch (e) {
      return { error: e.message };
    }
  });

  console.log('Fetch /api/v1/worklist 结果:');
  console.log('  状态:', testResult.status || testResult.error);
  console.log('  Content-Type:', testResult.contentType);
  console.log('  Body start:', testResult.textStart);

  console.log('\n=== 浏览器日志 ===');
  logs.forEach(l => console.log(l));

  await browser.close();
}

main().catch(e => {
  console.error('崩溃:', e.message);
  process.exit(1);
});
