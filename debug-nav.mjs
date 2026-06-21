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
page.on('response', (r) => { if (r.status() >= 400) errors.push('HTTP' + r.status() + ': ' + r.url()); });

// 预热
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/eye', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(5000);

console.log('--- After warmup ---');
let info = await page.evaluate(() => ({
  url: location.href,
  pathname: location.pathname,
  bodyLen: (document.body.innerText || '').length,
  hasUser: !!localStorage.getItem('ris_current_user'),
  user: localStorage.getItem('ris_current_user')?.substring(0, 100),
}));
console.log(JSON.stringify(info, null, 2));

// pushState to /eye/pacs
console.log('\n--- pushState to /eye/pacs ---');
await page.evaluate(() => {
  window.history.pushState({}, '', '/g005-radiology-ris/eye/pacs');
  window.dispatchEvent(new PopStateEvent('popstate'));
});
await page.waitForTimeout(5000);
info = await page.evaluate(() => ({
  url: location.href,
  pathname: location.pathname,
  bodyLen: (document.body.innerText || '').length,
  bodyHead: (document.body.innerText || '').substring(0, 300),
}));
console.log(JSON.stringify(info, null, 2));

// Try page.goto instead
console.log('\n--- page.goto to /eye/pacs ---');
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/eye/pacs', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(5000);
info = await page.evaluate(() => ({
  url: location.href,
  pathname: location.pathname,
  bodyLen: (document.body.innerText || '').length,
  bodyHead: (document.body.innerText || '').substring(0, 300),
  hasUser: !!localStorage.getItem('ris_current_user'),
}));
console.log(JSON.stringify(info, null, 2));

console.log('\n--- Errors ---');
errors.forEach((e) => console.log('  ' + e.substring(0, 200)));
await browser.close();
