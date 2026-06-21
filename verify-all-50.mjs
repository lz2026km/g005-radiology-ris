import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = {};
const deadBtns = [];
page.on('pageerror', (e) => {
  const k = page.url();
  errors[k] = (errors[k] || []);
  errors[k].push(`pageerror: ${e.message.substring(0, 150)}`);
});
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404') && !m.text().includes('favicon')) {
  const k = page.url();
  errors[k] = (errors[k] || []);
  errors[k].push(`console: ${m.text().substring(0, 150)}`);
} });

await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(3500);
await page.evaluate(() => { localStorage.setItem('ris_current_user', JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' })); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(4000);

const PAGES = [
  '/insurance-audit', '/dictionary', '/equipment-efficiency', '/enterprise-search',
  '/eye', '/eye/pacs', '/eye/pacs/fundus', '/eye/pacs/oct', '/eye/pacs/oct-a',
  '/eye/pacs/visual-field', '/eye/pacs/topography', '/eye/pacs/ffa', '/eye/pacs/compare', '/eye/pacs/montage',
  '/eye/pacs/viewer', '/eye/ris', '/eye/report-write', '/eye/ris/iol-calculator', '/eye/ris/va', '/eye/ris/iop',
  '/eye/emr', '/eye/ai', '/eye/kpi-dashboard',
  '/worklist', '/patients', '/exams', '/report-write', '/reports', '/report-review',
  '/critical-value', '/quality-control', '/review-center',
  '/ai-qc', '/ai-structured-report', '/ai-report-draft',
  '/dicom-viewer', '/dose-track', '/print-management',
  '/typical-cases', '/template-management', '/term-library', '/finding-library',
  '/statistics', '/operations-center', '/department-dashboard',
  '/notification-center', '/operation-log', '/user-management',
  '/follow-up', '/queue-call', '/schedule', '/appointment-management',
  '/report-revisions', '/report-export', '/report-delivery', '/co-sign',
  '/cds/management', '/cds/statistics', '/score-rule', '/defect-library',
  '/critical-value-rule', '/critical-value-stats', '/special-assessment',
  '/finance/department', '/finance/patient', '/revenue-analysis', '/cost-analysis',
  '/research', '/clinical-data', '/enterprise-search', '/data-report-center',
  '/director-dashboard', '/mammo/operations', '/mammo/quality',
  '/medical-alliance', '/regional-imaging', '/regional-report',
  '/safety/adverse-events', '/safety/cqi',
  '/contrast/inventory', '/contrast/injection-workstation',
  '/equipment-lifecycle', '/equipment-efficiency',
  '/business-continuity', '/multi-site', '/cloud-storage',
  '/claims-management', '/authorization', '/eligibility', '/denials', '/remittance',
  '/cardiology/echo', '/cardiology/holter', '/cardiology/ecg-management',
  '/cds/dose-monitoring',
];

let ok = 0, fail = 0, errCount = 0;
const fails = [];

for (const path of PAGES) {
  try {
    await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(800);
    await page.evaluate((p) => { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }, BASE + path);
    await page.waitForTimeout(2500);
    const bodyText = (await page.locator('body').textContent()) || '';
    const is403 = bodyText.includes('无权访问') || bodyText.includes('403');
    const is404 = bodyText.length < 200;
    const isCrash = bodyText.includes('t is not defined') || bodyText.includes('Minified React error') || bodyText.includes('ErrorBoundary caught');
    const status = isCrash ? '🔴崩溃' : is403 ? '🔴403' : is404 ? '🔴空' : '✓';
    if (!isCrash && !is403 && !is404) ok++; else { fail++; fails.push(path); }
    const pageErrs = errors[BASE + path] || [];
    if (pageErrs.length > 0) errCount += pageErrs.length;
    console.log(`  ${status} ${path}: ${bodyText.length}ch, ${pageErrs.length}err`);
  } catch (e) { fail++; fails.push(path); console.log(`  ✗ ${path}: ${e.message.substring(0, 60)}`); }
}

console.log(`\n[结果] ${ok}/${PAGES.length} OK, ${fail} FAIL, ${errCount} console errors`);
console.log(`失败页面 (${fails.length}):`);
fails.slice(0, 20).forEach(p => console.log(`  - ${p}`));
await browser.close();
