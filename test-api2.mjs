import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const USER = JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/', { waitUntil: 'networkidle' });
await page.evaluate((u) => localStorage.setItem('ris_current_user', u), USER);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const r = await page.evaluate(async () => {
  try {
    const r = await fetch('/api/v1/stats/daily');
    return { status: r.status, body: await r.text() };
  } catch (e) {
    return { error: e.message };
  }
});
console.log('Result:', r);
console.log('Console errors:', errors.length);
errors.forEach((e, i) => console.log(i, ':', e.slice(0, 200)));
await browser.close();
