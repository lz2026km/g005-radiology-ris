/** 全面 Playwright 测试所有页面，揪出出错页面 + 确切错误信息 */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const results = [];

page.on('pageerror', (e) => {
  const last = results[results.length - 1];
  if (last) last.errs.push(`pageerror: ${e.message.substring(0, 250)}`);
});
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('404') && !m.text().includes('favicon')) {
    const last = results[results.length - 1];
    if (last) last.errs.push(`console: ${m.text().substring(0, 250)}`);
  }
});

// Login
await page.goto(BASE + '/', { waitUntil: 'load' });
await page.waitForTimeout(3000);
await page.evaluate(() => {
  localStorage.setItem('ris_current_user', JSON.stringify({
    id: 'A001', name: '系统管理员', role: '管理员', department: '信息科',
  }));
});
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(4000);

// ALL key pages
const ALL_PAGES = [
  '/', '/eye', '/eye/pacs', '/eye/pacs/fundus', '/eye/pacs/oct', '/eye/pacs/oct-a',
  '/eye/pacs/visual-field', '/eye/pacs/topography', '/eye/pacs/ffa', '/eye/pacs/compare',
  '/eye/pacs/montage', '/eye/pacs/viewer', '/eye/ris', '/eye/report-write',
  '/eye/emr', '/eye/ai', '/eye/kpi-dashboard',
  '/insurance-audit', '/dictionary', '/equipment-efficiency', '/enterprise-search',
  '/exams', '/worklist', '/patients', '/write-report', '/report-review',
  '/critical-value', '/critical-value-center', '/critical-value-rule', '/critical-value-stats',
  '/quality-control', '/review-center', '/score-rule', '/defect-library', '/defect-management',
  '/special-assessment',
  '/ai-qc', '/ai-structured-report', '/ai-report-draft', '/ai-assist', '/ai-medical-device',
  '/dicom-viewer', '/dose-track', '/print-management', '/vna-dashboard',
  '/schedule', '/appointment-management', '/queue-call', '/follow-up',
  '/workflow-designer', '/routing-rules', '/sla-policy', '/workload-heatmap',
  '/report-revisions', '/report-export', '/report-delivery', '/co-sign',
  '/typical-cases', '/finding-library', '/term-library', '/template-management',
  '/template-designer', '/template-inheritance', '/template-category',
  '/report-phrase-bank', '/term-synonym-graph',
  '/statistics', '/department-dashboard', '/operations-center', '/cost-analysis',
  '/user-management', '/operation-log', '/notification-center',
  '/regional-imaging', '/regional-report', '/medical-alliance',
  '/national-report', '/data-report-center', '/insurance-audit',
  '/research', '/clinical-data', '/enterprise-search',
  '/finance/department', '/finance/patient',
  '/equipment-lifecycle', '/equipment-efficiency', '/device-page',
  '/mammo/operations', '/mammo/quality', '/director-dashboard',
  '/cds/management', '/cds/statistics',
  '/safety/adverse-events', '/safety/cqi', '/safety/patient-safety-goals',
  '/safety/radiation-safety', '/safety/rca-analysis', '/safety/risk-management',
  '/contrast/adverse-reactions', '/contrast/injection-workstation',
  '/contrast/inventory', '/contrast/quality-compliance',
  '/mobile/patient', '/mobile/doctor', '/mobile/nurse', '/mobile/tech',
  '/patient-portal', '/patient-report-portal', '/patient-education',
  '/cancer-screen', '/kiosk/check-in',
];

for (const path of ALL_PAGES) {
  const entry = { path, ok: false, len: 0, errs: [] };
  results.push(entry);
  try {
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
    await page.evaluate((p) => {
      window.history.pushState({}, '', p);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, BASE + path);
    await page.waitForTimeout(2500);
    const body = (await page.locator('body').textContent()) || '';
    entry.len = body.length;
    const crash = body.includes('不是有效的') || body.includes('意外错误') || body.includes('出错');
    const ok = body.length > 200 && !crash;
    entry.ok = ok;
  } catch (e) {
    entry.errs.push(`navig: ${e.message.substring(0, 100)}`);
  }
}

// Output results
const ok = results.filter(r => r.ok).length;
const fail = results.filter(r => !r.ok).length;
console.log(`\n=== 结果: ${ok}/${results.length} OK, ${fail} FAIL ===\n`);

// Failed pages summary
const fails = results.filter(r => !r.ok);
if (fails.length > 0) {
  console.log('❌ 失败页面:');
  for (const f of fails) {
    const ic = f.errs.filter(e => e.includes('not defined'));
    console.log(`  ${f.path}: ${f.len}ch errors=${f.errs.length} ${ic.length > 0 ? 'IMPORT_MISSING' : ''}`);
    if (f.errs.length > 0) {
      const unique = [...new Set(f.errs.map(e => e.replace(/http:\/\/[^\s]+/g, '')))];
      unique.slice(0, 2).forEach(e => console.log(`    -> ${e.substring(0, 180)}`));
    }
  }
}

// Collect all unique error types
const allErrs = [];
for (const r of results) {
  for (const e of r.errs) {
    if (!allErrs.some(x => x.includes(e.substring(0, 80)))) allErrs.push(e);
  }
}
if (allErrs.length > 0) {
  console.log(`\n📋 所有唯一错误 (${allErrs.length}):`);
  allErrs.slice(0, 20).forEach(e => console.log(`  ${e.substring(0, 200)}`));
}

await browser.close();
