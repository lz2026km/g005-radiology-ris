import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

// 登录
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/', { waitUntil: 'load' });
await page.waitForTimeout(3500);
await page.evaluate(() => {
  localStorage.setItem('ris_current_user', JSON.stringify({
    id: 'D001', name: '张明远', role: '医生', department: '放射科',
  }));
});
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(4000);

// 截图 1: 主页 - 看侧栏
await page.screenshot({ path: 'E:/opencode work/FS/G005-RISv-3.0.0/test-screenshots/dbg-01-home.png', fullPage: false });

// 抓取侧栏所有文字
const sidebarText = await page.locator('aside').textContent();
console.log('=== SIDEBAR TEXT ===');
console.log(sidebarText);
console.log('=== HAS_EYE:', sidebarText.includes('眼科'));

// 抓取所有 data-testid="nav-*" 元素
const navIds = await page.$$eval('[data-testid^="nav-"]', els => els.map(e => e.getAttribute('data-testid')));
console.log('=== NAV ITEMS ===');
console.log(navIds);

// 检查每个眼科链接
for (const path of ['/eye', '/eye/pacs', '/eye/ris', '/eye/ris/iol-calculator', '/eye/emr', '/eye/ai']) {
  const found = await page.$(`[data-testid="nav-${path}"]`);
  console.log(`nav-${path}: ${found ? '✓' : '✗ MISSING'}`);
}

console.log('\n=== ERRORS ===');
errors.forEach((e) => console.log(e.substring(0, 200)));

await browser.close();
