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
const navIds = await page.$$eval('[data-testid^="nav-/eye"]', els => els.map(e => e.getAttribute('data-testid')));
console.log('=== 侧栏眼科项:', navIds.length, '===', navIds);
const PAGES = [
  { n: '工作台', p: '/eye' }, { n: '影像中心', p: '/eye/pacs' }, { n: '眼底彩照', p: '/eye/pacs/fundus' },
  { n: 'OCT', p: '/eye/pacs/oct' }, { n: 'OCT-A', p: '/eye/pacs/oct-a' }, { n: '视野', p: '/eye/pacs/visual-field' },
  { n: '角膜地形', p: '/eye/pacs/topography' }, { n: 'FFA', p: '/eye/pacs/ffa' }, { n: '影像对比', p: '/eye/pacs/compare' },
  { n: '拼图', p: '/eye/pacs/montage' }, { n: '查看器', p: '/eye/pacs/viewer?studyId=es-001' },
  { n: 'RIS流程', p: '/eye/ris' }, { n: '报告书写', p: '/eye/report-write' },
  { n: 'IOL计算器', p: '/eye/ris/iol-calculator' }, { n: '视力', p: '/eye/ris/va' },
  { n: '眼压', p: '/eye/ris/iop' }, { n: '眼科EMR', p: '/eye/emr' }, { n: 'AI辅助', p: '/eye/ai' },
];
let ok = 0, fail = 0;
for (const pg of PAGES) {
  try {
    await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(2000);
    await page.evaluate((p) => { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }, BASE + pg.p);
    await page.waitForTimeout(3500);
    const bodyText = await page.locator('body').textContent() || '';
    const is403 = bodyText.includes('无权访问') || bodyText.includes('403');
    const is404 = bodyText.length < 200;
    const status = is403 ? '✗ 403' : is404 ? '✗ 404' : '✓';
    if (!is403 && !is404) ok++; else fail++;
    console.log(`  ${status} ${pg.n}: ${bodyText.length}ch, url=${page.url().substring(0, 80)}`);
  } catch (e) { console.log(`  ✗ ${pg.n}: ${e.message.substring(0, 80)}`); fail++; }
}
console.log(`\n[结果] ${ok}/${PAGES.length} OK, ${fail} FAIL, ${errors.length} errors`);
if (errors.length > 0) [...new Set(errors)].slice(0, 5).forEach(e => console.log(`  ${e.substring(0, 150)}`));
await browser.close();
