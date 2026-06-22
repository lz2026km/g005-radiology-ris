// 全导航测试 v3.0.6.8-23d - 测试所有 sidebar + routeTable 页面
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

// 148 sidebar paths + 11 extra from routeTable
const ALL_PATHS = [
  '/','/accounts-receivable','/ai-assist','/ai-medical-device','/ai-qc','/ai-report-draft','/ai-structured-report',
  '/appointment-management','/appointments','/blockchain-proof','/business-continuity','/cancer-screen',
  '/cardiac/database','/cardiac/operations','/cardiac/qc','/ca-signature','/cds/management','/cds/statistics',
  '/charge-items','/clinical-data','/cloud-storage','/collaboration','/consultation','/contrast/adverse-reactions',
  '/contrast/injection-workstation','/contrast/inventory','/contrast/quality-compliance','/cosign','/cost-accounting',
  '/cost-analysis','/critical-value','/critical-value-center','/critical-value-rule','/critical-value-stats',
  '/data-report-center','/defect-management','/department','/department-dashboard','/device-fault','/devices',
  '/diagnosis-accuracy','/dicom-viewer','/dictionary','/doctor-workload','/dose-track','/education/patient-education',
  '/enterprise-search','/equipment-efficiency','/equipment-lifecycle','/exams','/eye','/eye/ai','/eye/emr',
  '/eye/kpi-dashboard','/eye/pacs','/eye/pacs/compare','/eye/pacs/ffa','/eye/pacs/fundus','/eye/pacs/montage',
  '/eye/pacs/oct','/eye/pacs/oct-a','/eye/pacs/topography','/eye/pacs/visual-field','/eye/report-write','/eye/ris',
  '/eye/ris/iol-calculator','/eye/ris/iop','/eye/ris/va','/finance/department','/finance/patient','/financial-reports',
  '/finding-library','/follow-up','/green-it','/hie/medical-alliance','/insurance-audit','/integration/fhir-server',
  '/integration/ihe-connectathon','/integration/mllp-monitor','/keyword-check','/kiosk/check-in','/materials',
  '/mobile/doctor','/mobile/nurse','/mobile/patient','/mobile/tech','/multi-site','/national-report',
  '/notification-center','/nuclear-stats','/operation-log','/operations-center','/ops/dashboard','/ops/devices',
  '/ops/hr','/patient/self-service','/patient/service-management','/patient-portal','/patient-report-portal',
  '/patients','/print-management','/publish','/qc','/quality/department','/quality-control','/queue-call',
  '/regional-imaging','/regional-report','/report-defect-library','/report-delivery','/report-export',
  '/report-kpi-dashboard','/report-phrase-bank','/report-review','/report-revisions','/reports','/reports/v3-write',
  '/report-score-rule','/report-search','/report-timeliness','/revenue-analysis','/review-center','/routing-rules',
  '/safety/adverse-events','/safety/cqi','/safety/patient-safety-goals','/safety/radiation-safety','/safety/rca-analysis',
  '/safety/risk-management','/schedule','/sla-policy','/special-assessment','/statistics','/stats-report',
  '/system/dicom-print','/template-category','/template-designer','/template-inheritance','/template-management',
  '/term-library','/term-synonym-graph','/typical-cases','/user-management','/vna-dashboard','/workflow-designer',
  '/worklist','/workload-heatmap','/write-report',
  // Extra non-sidebar paths
  '/patient/:id','/template-designer/:id','/director-dashboard','/research','/mammo/operations','/mammo/quality',
  '/eye/pacs/viewer','/critical-value-center','/dose-track','/mobile/settings','/analytics/predictive',
];

await page.goto(BASE + '/', { waitUntil: 'load' });
await page.waitForTimeout(2500);
await page.evaluate(() => {
  localStorage.setItem('ris_current_user', JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' }));
});
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(3000);

const results = [];
for (const path of ALL_PATHS) {
  const errors = [];
  page.removeAllListeners('pageerror');
  page.removeAllListeners('console');
  page.on('pageerror', e => errors.push({ type: 'pageerror', msg: e.message.substring(0, 200) }));
  page.on('console', m => {
    if (m.type() === 'error' && !m.text().includes('frame-ancestors') && !m.text().includes('X-Frame-Options')) {
      errors.push({ type: 'console', msg: m.text().substring(0, 200) });
    }
  });
  
  try {
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 8000 });
    await page.waitForTimeout(300);
    await page.evaluate((p) => { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }, BASE + path);
    await page.waitForTimeout(1500);
    const body = (await page.locator('body').textContent()) || '';
    const ok = body.length > 200 && !errors.some(e => e.type === 'pageerror');
    results.push({ path, ok, len: body.length, errors: errors.length, firstErr: errors[0]?.msg || '' });
  } catch (e) {
    results.push({ path, ok: false, len: 0, errors: 1, firstErr: e.message.substring(0, 200) });
  }
}

const ok = results.filter(r => r.ok).length;
const fail = results.filter(r => !r.ok);
console.log(`\n=== 全导航测试结果: ${ok}/${results.length} OK, ${fail.length} FAIL ===\n`);
if (fail.length > 0) {
  console.log('失败页面:');
  for (const f of fail) {
    console.log(`  FAIL ${f.path} len=${f.len} errs=${f.errors} ${f.firstErr.substring(0, 120)}`);
  }
}
await browser.close();
