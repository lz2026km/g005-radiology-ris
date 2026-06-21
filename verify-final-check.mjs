import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.substring(0, 200)}`));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404') && !m.text().includes('favicon')) errors.push(`console: ${m.text().substring(0, 200)}`); });
await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(3000);
await page.evaluate(() => { localStorage.setItem('ris_current_user', JSON.stringify({ id: 'D001', name: '张明远', role: '医生', department: '放射科' })); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(3500);

const KEY_PAGES = ['/', '/eye', '/worklist', '/patients', '/exams', '/write-report', '/reports', '/report-review', '/critical-value', '/dicom-viewer', '/insurance-audit', '/dictionary', '/enterprise-search', '/queue-call', '/schedule', '/report-delivery', '/report-revisions', '/co-sign', '/ai-qc', '/ai-report-draft', '/dose-track', '/print-management', '/typical-cases', '/term-library', '/finding-library', '/template-management', '/statistics', '/operation-log', '/notification-center'];

let ok = 0, fail = 0;
for (const path of KEY_PAGES) {
  try {
    await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(500);
    await page.evaluate((p) => { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }, BASE + path);
    await page.waitForTimeout(2500);
    const body = (await page.locator('body').textContent()) || '';
    const crash = body.includes('不是有效的') || errors.length > 5;
    const okLen = body.length > 200;
    if (okLen && !crash) ok++; else fail++;
    console.log(`${okLen ? '✓' : '✗'} ${path}: ${body.length}ch`);
  } catch (e) {
    console.log(`✗ ${path}: ${e.message.substring(0, 60)}`);
    fail++;
  }
}
console.log(`\n[结果] ${ok}/${KEY_PAGES.length} OK, ${fail} FAIL, ${errors.length} errors`);
if (errors.length > 0) [...new Set(errors)].slice(0, 8).forEach(e => console.log(`  ${e}`));
await browser.close();
