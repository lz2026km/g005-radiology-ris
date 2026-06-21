import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
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
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

await page.goto('http://127.0.0.1:5199/g005-radiology-ris/eye/pacs', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(7000);
const info = await page.evaluate(() => {
  const t = document.body.innerText || '';
  return {
    url: location.href,
    pathname: location.pathname,
    bodyLen: t.length,
    bodyTail: t.substring(t.length - 500),
    title: document.title,
  };
});
console.log(JSON.stringify(info, null, 2));
console.log('\nErrors:');
errors.forEach((e) => console.log('  ' + e.substring(0, 200)));
await browser.close();
