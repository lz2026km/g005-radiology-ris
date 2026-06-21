/**
 * G005 眼科模块自测 - 走真实 SPA 流程
 * 1. 启动 vite preview
 * 2. 打开根页面, 等 404.html 重定向 + React 渲染
 * 3. 通过 evaluate 触发 React Router 路由 (内部 API)
 * 4. 截图 + 抓取 body 内容
 */
import { spawn } from 'child_process';
import { setTimeout as wait } from 'timers/promises';
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const SHOT_DIR = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\test-screenshots';
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

console.log('[启动] vite preview...');
const server = spawn('node', ['node_modules/vite/bin/vite.js', 'preview', '--port', '5199', '--host', '127.0.0.1'], {
  cwd: 'E:\\opencode work\\FS\\G005-RISv-3.0.0',
  stdio: 'ignore',
  shell: true,
  windowsHide: true,
  detached: true,
});

let ready = false;
for (let i = 0; i < 20; i++) {
  await wait(1000);
  try {
    const r = await fetch(`${BASE}/`, { method: 'HEAD' });
    if (r.status === 200) { ready = true; break; }
  } catch (e) { /* */ }
}
if (!ready) { console.log('[失败]'); try { server.kill(); } catch (e) {}; process.exit(1); }
console.log(`[就绪] ${BASE}`);

const PAGES = [
  { name: '01-eye-workspace', url: '/eye' },
  { name: '02-eye-pacs-list', url: '/eye/pacs' },
  { name: '03-eye-pacs-viewer', url: '/eye/pacs/viewer?studyId=es-001' },
  { name: '04-eye-oct', url: '/eye/pacs/oct' },
  { name: '05-eye-iol-calc', url: '/eye/ris/iol-calculator' },
  { name: '06-eye-va', url: '/eye/ris/va' },
  { name: '07-eye-iop', url: '/eye/ris/iop' },
];

const allErrors = [];
let okCount = 0;

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

page.on('pageerror', (e) => allErrors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) allErrors.push(`console: ${m.text()}`); });

console.log('\n[认证] 注入...');
await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(3000);
await page.evaluate(() => {
  localStorage.setItem('ris_current_user', JSON.stringify({
    id: 'D001', name: '张明远', role: '医生', department: '放射科',
  }));
});
console.log('  ✓ Auth set');

for (const pg of PAGES) {
  const before = allErrors.length;
  try {
    // 访问根, 让 404.html 跳转生效
    await page.goto(`${BASE}/`, { waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(3000);
    // 等 React 渲染完成
    await page.waitForSelector('.ant-layout, .ant-card, [class*="ant"]', { timeout: 10000 }).catch(() => {});
    // 现在 React Router 已加载, 通过 history 跳转
    // 重要: history.pushState 使用完整 URL (含 base)
    await page.evaluate((url) => {
      // url 是相对路径如 /eye, 需要拼上 base
      const fullUrl = '/g005-radiology-ris' + url;
      window.history.pushState({}, '', fullUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, pg.url);
    await page.waitForTimeout(3500);

    const bodyText = (await page.locator('body').textContent()) || '';
    const errors = allErrors.slice(before);
    await page.screenshot({ path: `${SHOT_DIR}\\${pg.name}.png` });
    const is404 = bodyText.includes('did you mean') || bodyText.length < 200;
    const status = is404 ? '✗ 404' : '✓';
    if (!is404) okCount++;
    console.log(`  ${status} ${pg.name}: ${bodyText.length}ch, ${errors.length}err, url=${page.url().substring(0, 80)}`);
    if (is404) console.log(`    body="${bodyText.substring(0, 100)}"`);
    if (errors.length > 0) errors.slice(0, 2).forEach((e) => console.log(`    - ${e.substring(0, 180)}`));
  } catch (e) {
    console.log(`  ✗ ${pg.name}: ${e.message.substring(0, 100)}`);
  }
}

await browser.close();
try { server.kill(); } catch (e) {}
console.log(`\n[结果] ${okCount}/${PAGES.length} OK, ${allErrors.length} errors`);
if (allErrors.length > 0) {
  const unique = [...new Set(allErrors)];
  unique.slice(0, 10).forEach((e) => console.log(`  ${e.substring(0, 300)}`));
}
process.exit(0);
