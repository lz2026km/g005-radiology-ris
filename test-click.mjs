import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const USER = JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' });
const requests = [];
page.on('request', (r) => requests.push(r.url()));
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/', { waitUntil: 'networkidle' });
await page.evaluate((u) => localStorage.setItem('ris_current_user', u), USER);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const link = await page.$('aside a[href="/dose-track"]');
console.log('Sidebar link exists?', !!link);
if (link) {
  requests.length = 0;
  await link.click();
  await page.waitForTimeout(5000);
  console.log('After click, locale requests:');
  for (const r of requests) if (r.includes('locale') || r.includes('v3exam')) console.log('  ', r);
  // Check page text
  const txt = await page.evaluate(() => document.body.innerText);
  const idx = txt.indexOf('005放射信息系统 -');
  console.log('Page text after 005放射信息系统:');
  console.log(txt.substring(idx, idx+400));
}
await browser.close();