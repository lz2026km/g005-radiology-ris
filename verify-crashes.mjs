import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404') && !m.text().includes('favicon')) errors.push(`console: ${m.text()}`); });
await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(3500);
await page.evaluate(() => { localStorage.setItem('ris_current_user', JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' })); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(4000);

// Test 4 critical pages
const PAGES = [
  { n: '医保审核', p: '/insurance-audit' },
  { n: '数据字典', p: '/dictionary' },
  { n: '设备效率', p: '/equipment-efficiency' },
  { n: '企业搜索', p: '/enterprise-search' },
];
for (const pg of PAGES) {
  await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(2000);
  await page.evaluate((p) => { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }, BASE + pg.p);
  await page.waitForTimeout(3500);
  const bodyText = (await page.locator('body').textContent()) || '';
  const hasError = bodyText.includes('出错') || bodyText.includes('Error') || bodyText.includes('t is not');
  const len = bodyText.length;
  console.log(`  ${pg.n}: ${len}ch ${hasError ? '❌ 错误' : '✓'}`);
  if (hasError) {
    console.log(`    内容: ${bodyText.substring(0, 200)}`);
  }
}
console.log(`\n总 console 错误: ${errors.length}`);
errors.slice(0, 5).forEach(e => console.log(`  - ${e.substring(0, 200)}`));
await browser.close();
