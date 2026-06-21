// Test: 2 pages with new context per page
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:5200/g005-radiology-ris';
const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

for (const p of ['/eye', '/eye/pacs']) {
  console.log('\n=== ' + p + ' ===');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('ris_current_user', JSON.stringify({
        id: 'A001', name: '系统管理员', role: '管理员', department: '信息科',
        phone: '13800000000', username: 'admin',
      }));
    } catch (e) {}
  });
  const page = await ctx.newPage();
  await page.goto(BASE + p, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(8000);
  const data = await page.evaluate(() => ({
    url: location.href,
    bodyLen: (document.body.innerText || '').length,
    bodyHead: (document.body.innerText || '').substring(0, 100),
  }));
  console.log('  url:', data.url);
  console.log('  bodyLen:', data.bodyLen);
  console.log('  bodyHead:', data.bodyHead);
  await ctx.close();
}
await browser.close();
