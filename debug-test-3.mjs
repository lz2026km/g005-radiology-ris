// Test: 3 pages with full data collection (but no button clicking)
import { chromium } from 'playwright';
import path from 'path';

const BASE = 'http://127.0.0.1:5200/g005-radiology-ris';
const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const PAGES = [
  { id: '01-eye', path: '/eye' },
  { id: '02-pacs-list', path: '/eye/pacs' },
  { id: '03-pacs-viewer', path: '/eye/pacs/viewer?studyId=es-001' },
];

for (const pg of PAGES) {
  console.log('\n=== ' + pg.id + ' (' + pg.path + ') ===');
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
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push('PAGE: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') pageErrors.push('CONSOLE: ' + m.text()); });
  page.on('requestfailed', (req) => pageErrors.push('REQ: ' + req.failure()?.errorText + ' ' + req.url()));
  page.on('response', (res) => { if (res.status() >= 400) pageErrors.push('HTTP' + res.status() + ': ' + res.url()); });

  await page.goto(BASE + pg.path, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(8000);

  const data = await page.evaluate(() => {
    const text = (document.body.innerText || '');
    return {
      url: location.href,
      bodyLen: text.length,
      bodyHead: text.substring(0, 100),
      btnCount: document.querySelectorAll('button').length,
      tableCount: document.querySelectorAll('table').length,
    };
  });
  console.log('  url:', data.url);
  console.log('  bodyLen:', data.bodyLen);
  console.log('  btn:', data.btnCount, 'table:', data.tableCount);
  console.log('  bodyHead:', data.bodyHead);
  if (pageErrors.length > 0) {
    console.log('  ERRORS:');
    pageErrors.forEach((e) => console.log('    ' + e.substring(0, 200)));
  }
  await ctx.close();
}
await browser.close();
