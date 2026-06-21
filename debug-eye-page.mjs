import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('response', (r) => { if (r.status() >= 400) errors.push('HTTP' + r.status() + ': ' + r.url()); });
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/eye', { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(8000);
const data = await page.evaluate(() => {
  return {
    bodyText: (document.body.innerText || '').substring(0, 2000),
    bodyHTML: (document.body.innerHTML || '').substring(0, 2000),
    title: document.title,
    url: location.href,
    rootHTML: (document.getElementById('root')?.innerHTML || '').substring(0, 1500),
  };
});
console.log('URL:', data.url);
console.log('TITLE:', data.title);
console.log('--- BODY TEXT (first 2000 chars) ---');
console.log(data.bodyText);
console.log('--- ROOT HTML (first 1500 chars) ---');
console.log(data.rootHTML);
console.log('--- ERRORS ---');
errors.forEach((e) => console.log('  ' + e.substring(0, 200)));
await browser.close();
