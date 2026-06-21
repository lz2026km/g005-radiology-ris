import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

await page.goto('http://127.0.0.1:5199/g005-radiology-ris/', { waitUntil: 'load' });
await page.waitForTimeout(3500);
await page.evaluate(() => {
  localStorage.setItem('ris_current_user', JSON.stringify({
    id: 'A001', name: '系统管理员', role: '管理员', department: '信息科',
  }));
});
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(4000);

const navIds = await page.$$eval('[data-testid^="nav-"]', els => els.map(e => e.getAttribute('data-testid')));
console.log('=== 管理员侧栏 (总数', navIds.length, ') ===');
const eyeNav = navIds.filter(n => n.includes('eye'));
console.log('眼科相关:', eyeNav);

// 滚动侧栏到底
await page.evaluate(() => {
  const nav = document.querySelector('aside nav');
  if (nav) nav.scrollTop = nav.scrollHeight;
});
await page.waitForTimeout(800);
await page.screenshot({ path: 'E:/opencode work/FS/G005-RISv-3.0.0/test-screenshots/admin-sider.png' });

// 点击 /eye
await page.click('[data-testid="nav-/eye"]');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'E:/opencode work/FS/G005-RISv-3.0.0/test-screenshots/admin-eye.png' });

const bodyText = (await page.locator('body').textContent()) || '';
const is403 = bodyText.includes('无权访问') || bodyText.includes('403');
console.log('=== /eye 状态 ===', is403 ? '✗ 403 无权' : '✓ OK');
console.log('url:', page.url());

// 试 /eye/ris/iol-calculator
await page.evaluate(() => {
  window.history.pushState({}, '', '/g005-radiology-ris/eye/ris/iol-calculator');
  window.dispatchEvent(new PopStateEvent('popstate'));
});
await page.waitForTimeout(3000);
const bodyText2 = (await page.locator('body').textContent()) || '';
const is403_2 = bodyText2.includes('无权访问') || bodyText2.includes('403');
console.log('=== /eye/ris/iol-calculator ===', is403_2 ? '✗ 403' : '✓ OK');

console.log('\n=== ERRORS ===');
errors.slice(0, 5).forEach((e) => console.log(e.substring(0, 200)));

await browser.close();
