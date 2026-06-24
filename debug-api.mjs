import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errs = [];
page.on('response', async (resp) => {
  if (resp.status() >= 400) {
    errs.push(`${resp.status()} ${resp.url()}`);
  }
});
page.on('pageerror', (e) => errs.push('PAGE: ' + e.message));
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/', { waitUntil: 'networkidle', timeout: 10000 });
await page.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({ id: 'A001', name: '管理员', role: '管理员', department: '信息科' })));
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await page.waitForTimeout(3000);
console.log('Errors:');
for (const e of errs.slice(0, 10)) console.log('  ' + e);
await browser.close();