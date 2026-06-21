/**
 * G005 眼科模块 - 集成自测脚本 (启动服务 + Playwright 测试)
 */
import { spawn } from 'child_process';
import { setTimeout as wait } from 'timers/promises';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}/g005-radiology-ris`;
const SHOT_DIR = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\test-screenshots';
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

console.log('=== Step 1: 启动 vite preview server ===');
const server = spawn('node', ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
  cwd: 'E:\\opencode work\\FS\\G005-RISv-3.0.0',
  stdio: 'ignore',
  shell: true,
  windowsHide: true,
});

let serverReady = false;
for (let i = 0; i < 30; i++) {
  await wait(1000);
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/`, { method: 'HEAD' });
    if (r.status === 200) {
      serverReady = true;
      console.log(`  ✓ Server up at ${BASE} (after ${i+1}s)`);
      break;
    }
  } catch (e) { /* not ready yet */ }
}
if (!serverReady) {
  console.log('  ✗ Server not ready in 30s');
  server.kill();
  process.exit(1);
}

console.log('\n=== Step 2: 启动 Playwright 测试 ===');
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const allErrors = [];
page.on('pageerror', (e) => allErrors.push(`[pageerror] ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') allErrors.push(`[console] ${m.text()}`); });

// 注入认证
console.log('  注入认证态...');
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => {
  localStorage.setItem('ris_current_user', JSON.stringify({
    id: 'D001', name: '张明远', role: '医生', department: '放射科',
  }));
});
console.log('  ✓ 认证态注入完成');

const PAGES = [
  { name: '01-eye-workspace', url: '/eye' },
  { name: '02-eye-pacs-list', url: '/eye/pacs' },
  { name: '03-eye-pacs-viewer', url: '/eye/pacs/viewer?studyId=es-001' },
  { name: '04-eye-oct', url: '/eye/pacs/oct' },
  { name: '05-eye-iol-calc', url: '/eye/ris/iol-calculator' },
  { name: '06-eye-va', url: '/eye/ris/va' },
  { name: '07-eye-iop', url: '/eye/ris/iop' },
];

for (const pg of PAGES) {
  console.log(`\n  [${pg.name}] (${pg.url})`);
  const before = allErrors.length;
  try {
    const t0 = Date.now();
    await page.goto(`${BASE}${pg.url}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const ms = Date.now() - t0;
    await page.waitForTimeout(3000);
    const bodyText = (await page.locator('body').textContent()) || '';
    const errors = allErrors.slice(before);
    const shot = path.join(SHOT_DIR, `${pg.name}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    console.log(`    加载: ${ms}ms, 内容: ${bodyText.length} 字符, 错误: ${errors.length}`);
    if (errors.length > 0) {
      errors.slice(0, 2).forEach((e) => console.log(`    - ${e.substring(0, 200)}`));
    }
    // 检查关键内容
    if (pg.name === '01-eye-workspace') {
      if (!bodyText.includes('眼科')) console.log(`    ⚠ 缺少"眼科"内容`);
    }
    if (pg.name === '05-eye-iol-calc') {
      if (!bodyText.includes('SRK/T')) console.log(`    ⚠ 缺少"SRK/T"`);
    }
  } catch (e) {
    console.log(`    ❌ ${e.message.substring(0, 200)}`);
  }
}

await browser.close();
server.kill();

console.log(`\n=== 总错误: ${allErrors.length} ===`);
if (allErrors.length > 0) {
  const unique = [...new Set(allErrors)];
  unique.slice(0, 10).forEach((e) => console.log(`  ${e.substring(0, 300)}`));
}
process.exit(allErrors.length > 0 ? 1 : 0);
