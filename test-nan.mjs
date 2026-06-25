import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const USER = JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' });
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/', { waitUntil: 'networkidle' });
await page.evaluate((u) => localStorage.setItem('ris_current_user', u), USER);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const text = await page.evaluate(() => document.body.innerText);
const idx = text.indexOf('NaN');
if (idx >= 0) {
  console.log('Found NaN at idx', idx, ':');
  console.log(text.substring(Math.max(0, idx-50), idx+100));
} else {
  console.log('No NaN in body text');
}
await browser.close();
