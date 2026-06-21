// Minimal test: exactly the same code as eye-deep-test.mjs but only 1 page
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:5200/g005-radiology-ris';
const SHOT_DIR = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\test-screenshots\\deep';
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  try {
    localStorage.setItem('ris_current_user', JSON.stringify({
      id: 'A001', name: '系统管理员', role: '管理员', department: '信息科',
      phone: '13800000000', username: 'admin',
    }));
  } catch (e) {}
});

const page = await ctx.newPage();
const errors = [];
page.on('response', (res) => {
  if (res.status() >= 400 && !res.url().includes('favicon')) {
    errors.push('HTTP' + res.status() + ': ' + res.url());
  }
});

await page.goto(BASE + '/eye', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(8000);

const data = await page.evaluate(() => ({
  url: location.href,
  bodyLen: (document.body.innerText || '').length,
  bodyText: (document.body.innerText || '').substring(0, 200),
  hasUser: !!localStorage.getItem('ris_current_user'),
}));
console.log('URL:', data.url);
console.log('bodyLen:', data.bodyLen);
console.log('bodyText:', data.bodyText);
console.log('hasUser:', data.hasUser);
console.log('Errors:', errors);
await page.screenshot({ path: path.join(SHOT_DIR, 'debug-test-1.png') });
await browser.close();
