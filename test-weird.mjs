import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = new Set();
page.on('pageerror', (e) => errs.add(e.message.substring(0, 300)));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404') && !m.text().includes('favicon')) errs.add(m.text().substring(0, 300)); });
await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(3000);
await page.evaluate(() => { localStorage.setItem('ris_current_user', JSON.stringify({ id: 'D001', name: '张明远', role: '医生', department: '放射科' })); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(3000);

const pages = ['/exams', '/reports/v3-write', '/report-export', '/report-delivery', '/critical-value', '/quality-control', '/review-center', '/eye', '/dicom-viewer', '/dose-track', '/print-management', '/worklist'];
let ok = 0, fail = 0;
for (const p of pages) {
  await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(500);
  await page.evaluate((u) => { window.history.pushState({}, '', u); window.dispatchEvent(new PopStateEvent('popstate')); }, BASE + p);
  await page.waitForTimeout(2000);
  const body = await page.locator('body').textContent() || '';
  const crash = body.includes('not defined') || body.includes('ErrorBoundary caught');
  if (crash) fail++; else ok++;
  console.log(`${crash ? 'FAIL' : 'OK  '} ${p}: ${body.length}ch`);
}
console.log(`\n[结果] ${ok}/${pages.length} OK, ${fail} FAIL`);
if (errs.size > 0) {
  console.log('\nErrors:');
  errs.forEach(e => console.log(`  ${e.substring(0, 200)}`));
}
await browser.close();
