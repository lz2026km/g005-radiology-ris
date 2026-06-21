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
const reqs = [];
page.on('request', (r) => reqs.push(r.method() + ' ' + r.url()));
page.on('response', (r) => { if (r.status() >= 400) console.log('HTTP ' + r.status() + ': ' + r.url()); });

await page.goto('http://127.0.0.1:5200/g005-radiology-ris/eye', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(8000);

const data = await page.evaluate(() => ({
  url: location.href,
  bodyLen: (document.body.innerText || '').length,
  bodyText: (document.body.innerText || '').substring(0, 300),
  hasUser: !!localStorage.getItem('ris_current_user'),
  rootHTML: (document.getElementById('root')?.innerHTML || '').substring(0, 500),
}));
console.log('URL:', data.url);
console.log('bodyLen:', data.bodyLen);
console.log('bodyText:', data.bodyText);
console.log('rootHTML:', data.rootHTML);
console.log('--- REQUESTS ---');
reqs.forEach((r) => console.log('  ' + r));
await browser.close();
