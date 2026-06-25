import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const USER = JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' });
page.on('pageerror', (e) => console.log('[err]', e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[c]', m.type(), m.text().slice(0, 200)); });
await page.goto('http://127.0.0.1:5199/g005-radiology-ris/', { waitUntil: 'networkidle' });
await page.evaluate((u) => localStorage.setItem('ris_current_user', u), USER);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
// Inject debug code
const debug = await page.evaluate(() => {
  const result = {};
  // Find i18n instance
  try {
    const i = window.__i18nInstance;
    result.i18nGlobal = !!i;
    if (i) {
      result.language = i.language;
      result.namespaces = i.options?.ns;
    }
  } catch (e) {
    result.i18nError = String(e);
  }
  // Check localStorage for lang
  result.g005Lang = localStorage.getItem('g005.i18n.language');
  result.i18nextLng = localStorage.getItem('i18nextLng');
  return result;
});
console.log('Debug:', JSON.stringify(debug, null, 2));
// Click dose-track link
const link = await page.$('aside a[href="/dose-track"]');
if (link) await link.click();
await page.waitForTimeout(3000);
// Check what t() returns in page context
const tResult = await page.evaluate(async () => {
  const i = window.__i18nInstance;
  if (!i) return 'no i18n';
  const hasV3exam = i.hasLoadedNamespace && i.hasLoadedNamespace('v3exam');
  const bundle = i.getResourceBundle('zh_CN', 'v3exam');
  return {
    lang: i.language,
    hasV3exam,
    bundleExists: !!bundle,
    bundleKeys: bundle ? Object.keys(bundle).slice(0, 5) : null,
    sample: bundle ? bundle.doseTrack : null,
  };
});
console.log('t() context:', JSON.stringify(tResult, null, 2));
await browser.close();