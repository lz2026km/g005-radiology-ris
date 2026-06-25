import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const USER = JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' });
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/', { waitUntil: 'networkidle' });
await page.evaluate((u) => localStorage.setItem('ris_current_user', u), USER);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
// Check sidebar hrefs
const hrefs = await page.$$eval('aside a', els => els.slice(0, 30).map(e => e.getAttribute('href')));
console.log('First 30 sidebar hrefs:', hrefs);
// Check if /quality-control exists
const qc = await page.$('aside a[href="/quality-control"]');
console.log('Has /quality-control link?', !!qc);
const qc2 = await page.$('aside a[href*="quality-control"]');
console.log('Has *quality-control link?', !!qc2);
const qc3 = await page.$eval('aside a[href*="quality-control"]', el => el.getAttribute('href')).catch(() => null);
console.log('Found:', qc3);
await browser.close();
