import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto('http://127.0.0.1:5199/g005-radiology-ris/', { waitUntil: 'load' });
await page.waitForTimeout(3500);
await page.evaluate(() => {
  localStorage.setItem('ris_current_user', JSON.stringify({
    id: 'D001', name: '张明远', role: '医生', department: '放射科',
  }));
});
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(4000);

// 滚动侧栏到底
await page.evaluate(() => {
  const nav = document.querySelector('aside nav');
  if (nav) nav.scrollTop = nav.scrollHeight;
});
await page.waitForTimeout(1000);

await page.screenshot({ path: 'E:/opencode work/FS/G005-RISv-3.0.0/test-screenshots/dbg-02-scrolled.png' });

// 眼科链接是否在视口内
const eyeNav = await page.$('[data-testid="nav-/eye"]');
if (eyeNav) {
  const box = await eyeNav.boundingBox();
  const nav = await page.$('aside nav');
  const navBox = await nav.boundingBox();
  console.log('eye link box:', box);
  console.log('aside nav box:', navBox);
  console.log('eye visible in viewport:', box.y >= navBox.y && box.y + box.height <= navBox.y + navBox.height);
}

// 点击 "眼科工作台"
await page.click('[data-testid="nav-/eye"]');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'E:/opencode work/FS/G005-RISv-3.0.0/test-screenshots/dbg-03-eye-clicked.png' });
console.log('clicked /eye, current url:', page.url());

await browser.close();
