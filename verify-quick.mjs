import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = {};
page.on('pageerror', (e) => {
  const k = page.url();
  errors[k] = errors[k] || [];
  errors[k].push(`pageerror: ${e.message.substring(0, 200)}`);
});
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404') && !m.text().includes('favicon')) {
  const k = page.url();
  errors[k] = errors[k] || [];
  errors[k].push(`console: ${m.text().substring(0, 200)}`);
} });
await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(3500);
await page.evaluate(() => { localStorage.setItem('ris_current_user', JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' })); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(4000);

// Just the previously failing pages
const PAGES = [
  '/worklist', '/score-rule', '/defect-library', '/medical-alliance',
  '/finance/department', '/finance/patient', '/revenue-analysis', '/cost-analysis',
  '/financial-reports', '/safety/cqi',
];
let ok = 0, fail = 0;
const fails = [];
for (const path of PAGES) {
  await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(800);
  await page.evaluate((p) => { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }, BASE + path);
  await page.waitForTimeout(2500);
  const bodyText = (await page.locator('body').textContent()) || '';
  const is403 = bodyText.includes('无权访问') || bodyText.includes('403');
  const is404 = bodyText.length < 200;
  const isCrash = bodyText.includes('t is not defined') || bodyText.includes('Minified React error') || bodyText.includes('ErrorBoundary caught') || bodyText.includes('undefined is not') || bodyText.includes('TypeError');
  const pageErrs = errors[BASE + path] || [];
  if (!isCrash && !is403 && !is404) ok++; else { fail++; fails.push({ path, err: isCrash ? 'crash' : is403 ? '403' : 'empty', msgs: pageErrs.slice(0,2) }); }
  console.log(`  ${path}: ${bodyText.length}ch, ${pageErrs.length}err, ${isCrash?'崩溃':is403?'403':is404?'空':'OK'}`);
}
console.log(`\n[结果] ${ok}/${PAGES.length} OK, ${fail} FAIL`);
fails.forEach(f => { console.log(`  ❌ ${f.path}: ${f.err}`); f.msgs.forEach(m => console.log(`     - ${m}`)); });
await browser.close();
