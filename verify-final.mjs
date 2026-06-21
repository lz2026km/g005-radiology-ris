import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404') && !m.text().includes('favicon')) errors.push(`console: ${m.text()}`); });
await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(3500);
await page.evaluate(() => { localStorage.setItem('ris_current_user', JSON.stringify({ id: 'D001', name: '张明远', role: '医生', department: '放射科' })); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(4000);

const PAGES = [
  '/', '/worklist', '/patients', '/exams', '/follow-up', '/kiosk/check-in',
  '/write-report', '/reports', '/report-review', '/reports/v3-write',
  '/report-export', '/report-delivery', '/report-revisions', '/co-sign',
  '/critical-value', '/critical-value-center', '/critical-value-rule', '/critical-value-stats',
  '/quality-control', '/review-center', '/score-rule', '/defect-library', '/defect-management',
  '/ai-qc', '/ai-structured-report', '/ai-report-draft', '/ai-assist', '/ai-medical-device',
  '/dicom-viewer', '/vna-dashboard', '/dose-track', '/print-management',
  '/patient-portal', '/patient-self-service', '/patient-image-query', '/patient-report-portal', '/patient-education',
  '/cancer-screen', '/kiosk/check-in', '/queue-call', '/appointment-management', '/schedule',
  '/workflow-designer', '/routing-rules', '/department-schedule', '/department-dashboard',
  '/operations-center', '/workload-heatmap', '/sla-policy', '/green-it', '/cost-analysis',
  '/statistics', '/national-report', '/data-report-center', '/insurance-audit',
  '/research', '/clinical-data', '/typical-cases', '/finding-library', '/term-library',
  '/template-management', '/template-designer', '/template-inheritance', '/template-category',
  '/report-phrase-bank', '/term-synonym-graph', '/enterprise-search',
  '/user-management', '/dictionary', '/operation-log', '/notification-center',
  '/business-continuity', '/multi-site', '/cloud-storage', '/finance/department', '/finance/patient',
  '/equipment-lifecycle', '/equipment-efficiency', '/device-page', '/materials', '/dose-track',
  '/eye', '/eye/pacs', '/eye/pacs/fundus', '/eye/pacs/oct', '/eye/pacs/oct-a',
  '/eye/pacs/visual-field', '/eye/pacs/topography', '/eye/pacs/ffa', '/eye/pacs/compare', '/eye/pacs/montage',
  '/eye/ris', '/eye/report-write', '/eye/emr', '/eye/ai', '/eye/kpi-dashboard',
  '/insurance-audit', '/equipment-efficiency', '/enterprise-search', '/dictionary',
  '/contrast/adverse-reactions', '/contrast/injection-workstation', '/contrast/inventory', '/contrast/quality-compliance',
  '/safety/adverse-events', '/safety/cqi', '/safety/patient-safety-goals', '/safety/radiation-safety', '/safety/rca-analysis', '/safety/risk-management',
  '/regional-imaging', '/regional-report', '/medical-alliance',
  '/mobile/patient', '/mobile/doctor', '/mobile/nurse', '/mobile/tech',
  '/ca-signature', '/blockchain-proof', '/collaboration', '/collaborative-report',
];

let ok = 0, fail = 0;
const fails = [];
for (const path of PAGES) {
  try {
    await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(600);
    await page.evaluate((p) => { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }, BASE + path);
    await page.waitForTimeout(2200);
    const bodyText = (await page.locator('body').textContent()) || '';
    const is403 = bodyText.includes('无权访问') || bodyText.includes('403');
    const is404 = bodyText.length < 200;
    const isCrash = bodyText.includes('t is not defined') || bodyText.includes('Minified React error') || bodyText.includes('ErrorBoundary caught') || bodyText.includes('undefined is not') || bodyText.includes('TypeError');
    if (!isCrash && !is403 && !is404) ok++; else { fail++; fails.push({ path, err: isCrash ? 'crash' : is403 ? '403' : 'empty', body: bodyText.substring(0, 150) }); }
  } catch (e) { fail++; fails.push({ path, err: 'nav-fail', body: e.message.substring(0, 80) }); }
}
console.log(`[结果] ${ok}/${PAGES.length} OK, ${fail} FAIL, ${errors.length} console errors`);
if (fails.length > 0) {
  console.log(`\n失败 (${fails.length}):`);
  fails.slice(0, 25).forEach(f => console.log(`  ❌ ${f.path}: ${f.err} - ${f.body.substring(0, 80)}`));
}
if (errors.length > 0) {
  console.log(`\n控制台错误 (${errors.length}):`);
  [...new Set(errors)].slice(0, 8).forEach(e => console.log(`  - ${e.substring(0, 200)}`));
}
await browser.close();
