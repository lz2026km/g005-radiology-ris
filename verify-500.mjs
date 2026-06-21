/** Playwright 自测: 眼科 PACS 500 升级点 v3.0.6.8-21 */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404') && !m.text().includes('favicon')) errors.push(`console: ${m.text()}`); });

await page.goto(BASE + '/', { waitUntil: 'load' });
await page.waitForTimeout(3500);
await page.evaluate(() => { localStorage.setItem('ris_current_user', JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' })); });
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(4000);

// 检查侧栏眼科项
const navIds = await page.$$eval('[data-testid^="nav-/eye"]', els => els.map(e => e.getAttribute('data-testid')));
console.log('=== 侧栏眼科项:', navIds.length, '===', navIds);

// 直接 URL 测试所有新页面
const PAGES = [
  { name: '眼科工作台', path: '/eye' },
  { name: '影像中心', path: '/eye/pacs' },
  { name: '眼底彩照', path: '/eye/pacs/fundus' },
  { name: 'OCT', path: '/eye/pacs/oct' },
  { name: 'OCT-A', path: '/eye/pacs/oct-a' },
  { name: '视野', path: '/eye/pacs/visual-field' },
  { name: '角膜地形', path: '/eye/pacs/topography' },
  { name: 'FFA', path: '/eye/pacs/ffa' },
  { name: '影像对比', path: '/eye/pacs/compare' },
  { name: '拼图', path: '/eye/pacs/montage' },
  { name: '查看器', path: '/eye/pacs/viewer?studyId=es-001' },
  { name: 'RIS流程', path: '/eye/ris' },
  { name: 'IOL计算器', path: '/eye/ris/iol-calculator' },
  { name: '视力', path: '/eye/ris/va' },
  { name: '眼压', path: '/eye/ris/iop' },
  { name: '眼科EMR', path: '/eye/emr' },
  { name: 'AI辅助', path: '/eye/ai' },
];

let ok = 0, fail = 0;
for (const pg of PAGES) {
  try {
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const errBefore = errors.length;
    await page.evaluate((p) => { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }, BASE + pg.path);
    await page.waitForTimeout(3500);
    const bodyText = await page.locator('body').textContent() || '';
    const is403 = bodyText.includes('无权访问') || bodyText.includes('403');
    const is404 = bodyText.length < 200;
    const status = is403 ? '✗ 403' : is404 ? '✗ 404' : '✓';
    if (!is403 && !is404) ok++; else fail++;
    console.log(`  ${status} ${pg.name}: ${bodyText.length}ch, ${errors.length - errBefore}err, url=${page.url().substring(0, 80)}`);
  } catch (e) {
    console.log(`  ✗ ${pg.name}: ${e.message.substring(0, 80)}`);
    fail++;
  }
}

console.log(`\n[结果] ${ok}/${PAGES.length} OK, ${fail} FAIL, ${errors.length} total errors`);
if (errors.length > 0) [...new Set(errors)].slice(0, 10).forEach(e => console.log(`  ${e.substring(0, 200)}`));
await browser.close();
