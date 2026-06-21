import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto('http://127.0.0.1:5199/g005-radiology-ris/', { waitUntil: 'load' });
await page.waitForTimeout(3500);
await page.evaluate(() => {
  localStorage.setItem('ris_current_user', JSON.stringify({
    id: 'A001', name: '系统管理员', role: '管理员', department: '信息科',
  }));
});
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(4000);

// 直接定位眼科工作台并 scrollIntoView
await page.evaluate(() => {
  const eye = document.querySelector('[data-testid="nav-/eye"]');
  if (eye) eye.scrollIntoView({ behavior: 'instant', block: 'center' });
});
await page.waitForTimeout(800);
await page.screenshot({ path: 'E:/opencode work/FS/G005-RISv-3.0.0/test-screenshots/admin-eye-section.png' });

// 点击眼科工作台
await page.click('[data-testid="nav-/eye"]');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'E:/opencode work/FS/G005-RISv-3.0.0/test-screenshots/admin-eye-clicked.png' });
const bodyText = (await page.locator('body').textContent()) || '';
const is403 = bodyText.includes('无权访问') || bodyText.includes('403');
console.log('眼科工作台访问:', is403 ? '✗ 403' : '✓ OK');

// 访问 IOL
await page.click('[data-testid="nav-/eye/ris/iol-calculator"]');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'E:/opencode work/FS/G005-RISv-3.0.0/test-screenshots/admin-iol.png' });
const body2 = (await page.locator('body').textContent()) || '';
console.log('IOL 计算器访问:', body2.includes('无权') ? '✗ 403' : '✓ OK');

await browser.close();
