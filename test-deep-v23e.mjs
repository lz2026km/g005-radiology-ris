// 基础 159 页面深度审计 - 真实点击侧栏链接
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris/';
const USER = JSON.stringify({ id: 'A001', name: '系统管理员', role: '管理员', department: '信息科' });
const CSP_NOISE = ['frame-ancestors', 'X-Frame-Options', 'Content Security Policy', 'may only be set via'];
const isNoise = (m) => CSP_NOISE.some(k => m.includes(k));

const SIDEBAR_PATHS = [
  '/', '/worklist', '/exams', '/patients', '/appointments', '/appointment-management',
  '/queue-call', '/follow-up', '/kiosk/check-in', '/patient/self-service', '/patient/service-management',
  '/write-report', '/reports/v3-write', '/reports', '/critical-value', '/consultation',
  '/report-review', '/report-revisions', '/collaboration', '/keyword-check', '/report-score-rule',
  '/report-defect-library', '/ai-report-draft', '/critical-value-rule', '/critical-value-stats',
  '/special-assessment', '/report-export', '/publish', '/report-delivery', '/patient-report-portal',
  '/ca-signature', '/blockchain-proof', '/cds/management', '/cds/statistics',
  '/review-center', '/quality-control', '/critical-value-center', '/defect-management', '/cosign',
  '/workflow-designer', '/routing-rules', '/workload-heatmap', '/sla-policy',
  '/dicom-viewer', '/print-management', '/ai-assist', '/vna-dashboard',
  '/ai-qc', '/ai-structured-report', '/ai-medical-device',
  '/qc', '/equipment-efficiency', '/typical-cases', '/finding-library', '/term-library',
  '/template-management', '/template-designer', '/template-inheritance', '/template-category',
  '/term-synonym-graph', '/report-phrase-bank',
  '/safety/adverse-events', '/safety/cqi', '/safety/patient-safety-goals',
  '/safety/radiation-safety', '/safety/rca-analysis', '/safety/risk-management',
  '/regional-imaging', '/regional-report', '/schedule', '/department', '/hie/medical-alliance',
  '/integration/fhir-server', '/integration/ihe-connectathon', '/integration/mllp-monitor',
  '/cancer-screen', '/patient-portal', '/clinical-data', '/education/patient-education',
  '/mobile/patient', '/mobile/doctor', '/mobile/nurse', '/mobile/tech',
  '/statistics', '/green-it', '/department-dashboard', '/operations-center', '/cost-analysis',
  '/stats-report', '/nuclear-stats', '/report-kpi-dashboard', '/doctor-workload',
  '/diagnosis-accuracy', '/report-timeliness', '/report-search',
  '/cardiac/database', '/cardiac/operations', '/cardiac/qc',
  '/ops/devices', '/ops/hr', '/ops/dashboard',
  '/quality/department',
  '/charge-items', '/accounts-receivable', '/revenue-analysis', '/cost-accounting', '/financial-reports',
  '/national-report', '/data-report-center', '/insurance-audit', '/enterprise-search',
  '/eye', '/eye/pacs', '/eye/pacs/fundus', '/eye/pacs/oct', '/eye/pacs/oct-a',
  '/eye/pacs/visual-field', '/eye/pacs/topography', '/eye/pacs/ffa', '/eye/pacs/compare',
  '/eye/pacs/montage', '/eye/ris', '/eye/report-write', '/eye/ris/iol-calculator',
  '/eye/ris/va', '/eye/ris/iop', '/eye/emr', '/eye/ai', '/eye/kpi-dashboard',
  '/user-management', '/dictionary', '/operation-log', '/notification-center', '/system/dicom-print',
  '/business-continuity', '/multi-site', '/cloud-storage',
  '/finance/department', '/finance/patient',
  '/equipment-lifecycle', '/devices', '/device-fault', '/materials', '/dose-track',
  '/contrast/adverse-reactions', '/contrast/injection-workstation', '/contrast/inventory', '/contrast/quality-compliance',
];
const EXTRA = ['/director-dashboard', '/research', '/mammo/operations', '/mammo/quality', '/eye/pacs/viewer',
  '/workbench', '/patient/P001', '/template-designer/T001', '/login', '/forbidden', '/404'];

async function audit(page, path, useClick) {
  const r = { path, pageerrors: [], consoleErrors: [], networkFails: [], alertErrors: [], errorBoundary: [], status: 'OK', issues: [] };
  const onPE = (e) => r.pageerrors.push(e.message || String(e));
  const onC = (m) => {
    const t = m.text();
    if (isNoise(t)) return;
    if (m.type() === 'error') r.consoleErrors.push(t);
  };
  const onR = (resp) => { if (resp.status() >= 400 && !resp.url().includes('favicon') && !resp.url().includes('mockServiceWorker')) r.networkFails.push(`${resp.status()} ${resp.url().slice(-80)}`); };
  page.on('pageerror', onPE); page.on('console', onC); page.on('response', onR);

  try {
    if (useClick) {
      const link = await page.$(`aside a[href="${path}"]`);
      if (!link) { r.issues.push('NO_SIDEBAR_LINK'); }
      else {
        await link.click();
        try { await page.waitForSelector('[role="status"][aria-busy="true"]', { state: 'detached', timeout: 5000 }); } catch (_) { }
        await page.waitForTimeout(800);
      }
    } else {
      await page.goto(BASE.replace(/\/$/, '') + path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      try { await page.waitForSelector('[role="status"][aria-busy="true"]', { state: 'detached', timeout: 5000 }); } catch (_) { }
      await page.waitForTimeout(1500);
    }

    const c = await page.evaluate(() => {
      const main = document.querySelector('#main-content, main');
      const body = (document.body.innerText || '').trim();
      const mText = (main?.textContent || '').trim();
      const ae = Array.from(document.querySelectorAll('.ant-alert-error, [class*="ant-alert-error"]')).map(e => e.textContent?.trim().slice(0, 100) || '').filter(Boolean);
      const eb = [];
      if (body.includes('Something went wrong')) eb.push('Something went wrong');
      if (body.match(/Error:\s*[\u4e00-\u9fff]/)) eb.push('Chinese Error');
      // NaN 仅在数值上下文 (NaN%, NaN°, NaN) 等) 报错
      if (body.match(/NaN[%°)]/)) eb.push('NaN');
      return { bodyLen: body.length, mLen: mText.length, ae, eb };
    });
    r.alertErrors = c.ae;
    r.errorBoundary = c.eb;
    if (r.pageerrors.length) r.issues.push(...r.pageerrors.slice(0, 3).map(e => 'JS: ' + e.slice(0, 100)));
    if (r.consoleErrors.length) r.issues.push(...r.consoleErrors.slice(0, 3).map(e => 'CE: ' + e.slice(0, 100)));
    if (c.ae.length) r.issues.push(...c.ae.slice(0, 2).map(e => 'UI_ERR: ' + e));
    if (c.eb.length) r.issues.push(...c.eb.map(e => 'EB: ' + e));
    if (r.networkFails.length) r.issues.push(...r.networkFails.slice(0, 2).map(e => 'NET: ' + e));
    if (c.bodyLen < 100) r.issues.push('EMPTY_BODY(' + c.bodyLen + ')');
    if (c.mLen < 50) r.issues.push('EMPTY_MAIN(' + c.mLen + ')');
    r.status = r.issues.length === 0 ? 'OK' : 'FAIL';
  } catch (e) { r.status = 'ERROR'; r.issues.push('Script: ' + e.message); }
  page.off('pageerror', onPE); page.off('console', onC); page.off('response', onR);
  return r;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(u => localStorage.setItem('ris_current_user', u), USER);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const all = [];
  for (let i = 0; i < SIDEBAR_PATHS.length; i++) {
    const r = await audit(page, SIDEBAR_PATHS[i], true);
    all.push(r);
    process.stdout.write(`[${i + 1}/${SIDEBAR_PATHS.length}] ${r.status === 'OK' ? '✓' : '✗'} ${r.path}${r.status !== 'OK' ? '  ' + r.issues[0]?.slice(0, 80) : ''}\n`);
  }
  for (let i = 0; i < EXTRA.length; i++) {
    const r = await audit(page, EXTRA[i], false);
    all.push(r);
    process.stdout.write(`[E${i + 1}/${EXTRA.length}] ${r.status === 'OK' ? '✓' : '✗'} ${r.path}${r.status !== 'OK' ? '  ' + r.issues[0]?.slice(0, 80) : ''}\n`);
  }
  await browser.close();
  const ok = all.filter(r => r.status === 'OK').length;
  const fail = all.filter(r => r.status !== 'OK');
  console.log(`\n=== 结果: ${ok}/${all.length} OK, ${fail.length} FAIL ===`);
  for (const f of fail) console.log(`  ${f.path}: ${f.issues.slice(0, 3).join(' | ')}`);
  writeFileSync('E:\\opencode work\\FS\\G005-RISv-3.0.0\\deep-audit-v24.json', JSON.stringify(all, null, 2));
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });