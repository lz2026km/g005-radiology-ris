// v3.0.6.8-44 最终综合 E2E 测试
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:5199/g005-radiology-ris/';
const API = '/api/v1';
const results = [];
let passC = 0, failC = 0;

function ok(name, info) {
  results.push({ name, status: 'PASS', info });
  passC++;
  console.log('[PASS] ' + name + (info ? ' (' + info + ')' : ''));
}
function failT(name, err) {
  results.push({ name, status: 'FAIL', err: String(err).slice(0, 200) });
  failC++;
  console.log('[FAIL] ' + name + ': ' + err);
}

async function callApi(page, path, options = {}) {
  return await page.evaluate(async ({ path, options }) => {
    const opts = { method: options.method || 'GET', headers: { 'Content-Type': 'application/json' } };
    if (options.body) opts.body = JSON.stringify(options.body);
    const res = await fetch(path, opts);
    const text = await res.text();
    let body = null; try { body = JSON.parse(text); } catch {}
    return { status: res.status, body, ok: res.ok };
  }, { path, options });
}

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', e => console.log('[PE]', e.message.slice(0, 200)));

await p.goto(BASE);
await p.evaluate(async () => {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) await r.unregister();
  }
});
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

console.log('=== v3.0.6.8-44 Comprehensive E2E ===\n');

// Version check
const rV = await callApi(p, '/api/v1/system/health');
if (rV.body?.data?.version === '3.0.6.8-44') ok('Version', rV.body.data.version);
else failT('Version', rV.body?.data?.version || 'fail');

// PR 8
console.log('\n[PR 8] Tele-ophthalmology');
const r8a = await callApi(p, API + '/eye/tele/session', { method: 'POST', body: { patientId: 'P001', studyId: 'STU001', participants: ['D001'], mode: 'video' } });
if (r8a.ok) ok('Tele session', r8a.body.data.sessionId);
else failT('Tele session', '');

const r8b = await callApi(p, API + '/eye/tele/turn');
if (r8b.ok) ok('TURN/5G', r8b.body.data['5G_edge']?.slice || 'healthcare-mmtc');
else failT('TURN', '');

const r8c = await callApi(p, API + '/eye/optometry/refraction', { method: 'POST', body: { patientId: 'P001', reSphere: -2.5, reCylinder: -0.75, reAxis: 180, leSphere: -2.75, leCylinder: -1, leAxis: 175, prescriptionType: '眼镜' } });
if (r8c.ok) ok('Refraction', r8c.body.data.refractionId);
else failT('Refraction', '');

const r8d = await callApi(p, API + '/eye/optometry/ok-lens', { method: 'POST', body: { patientId: 'P001', k1: 43, k2: 43.5, kAxis: 180, targetReduction: 3 } });
if (r8d.ok) ok('OK lens', r8d.body.data.okLensId);
else failT('OK lens', '');

// PR 9
console.log('\n[PR 9] Case library');
const r9a = await callApi(p, API + '/eye/edu/cases?pageSize=5');
if (r9a.ok) ok('Cases list', r9a.body.data.length);
else failT('Cases', '');

const r9b = await callApi(p, API + '/eye/edu/annotate', { method: 'POST', body: { caseId: 'CASE001', annotationType: 'roi', coordinates: [[100,100]], label: '视盘' } });
if (r9b.status === 201) ok('Annotate', r9b.body.data.annotationId);
else failT('Annotate', r9b.status);

const r9c = await callApi(p, API + '/eye/edu/export-sr', { method: 'POST', body: { caseId: 'CASE001', annotations: [], format: 'sr-tid1500' } });
if (r9c.ok) ok('SR export', r9c.body.data.sopInstanceUID.slice(-12));
else failT('SR', '');

const r9d = await callApi(p, API + '/eye/edu/deidentify', { method: 'POST', body: { caseId: 'CASE001', level: 'basic' } });
if (r9d.ok) ok('Deidentify', r9d.body.data.deidentifiedId);
else failT('Deidentify', '');

const r9e = await callApi(p, API + '/eye/edu/cohort', { method: 'POST', body: { criteria: { disease: 'DR' } } });
if (r9e.ok) ok('Cohort', r9e.body.data.totalCases);
else failT('Cohort', '');

// PR 10
console.log('\n[PR 10] Pixel rendering');
const r10a = await callApi(p, API + '/eye/pixel/instance/frame-1');
if (r10a.ok) ok('Pixel meta', r10a.body.data.rows + 'x' + r10a.body.data.columns);
else failT('Pixel meta', '');

const r10b = await callApi(p, API + '/eye/pixel/histogram/frame-1');
if (r10b.ok) ok('Histogram', r10b.body.data.bins.length + ' bins');
else failT('Histogram', '');

const r10c = await callApi(p, API + '/eye/pixel/colormap/fundus');
if (r10c.ok) ok('Colormap', r10c.body.data.type);
else failT('Colormap', '');

const r10d = await callApi(p, API + '/eye/pixel/mpr', { method: 'POST', body: { studyId: 'STU001', axis: 'axial', seriesIds: ['f1','f2'] } });
if (r10d.ok) ok('MPR', r10d.body.data.mprId);
else failT('MPR', '');

const r10e = await callApi(p, API + '/eye/pixel/sharpness', { method: 'POST', body: { instanceId: 'frame-1' } });
if (r10e.ok) ok('Sharpness', r10e.body.data.sharpness.overall);
else failT('Sharpness', '');

const r10f = await callApi(p, API + '/eye/pixel/detect-artifact', { method: 'POST', body: { instanceId: 'frame-1' } });
if (r10f.ok) ok('Artifact AI', r10f.body.data.qualityScore);
else failT('Artifact AI', '');

// PR 11
console.log('\n[PR 11] Optometry closed-loop');
const r11a = await callApi(p, API + '/eye/optometry/screening', { method: 'POST', body: { patientId: 'P099', age: 10, parentRefraction: { reSphere: -4, leSphere: -3.5 } } });
if (r11a.ok) ok('Myopia screening', r11a.body.data.myopiaRisk + ' risk');
else failT('Screening', '');

const r11b = await callApi(p, API + '/eye/optometry/refraction-curve/P099');
if (r11b.ok) ok('Refraction curve', r11b.body.data.history.length + ' years');
else failT('Curve', '');

const r11c = await callApi(p, API + '/eye/optometry/ok-trial', { method: 'POST', body: { patientId: 'P099', trialLensId: 'T1', fluoresceinPattern: 'bulls-eye' } });
if (r11c.ok) ok('OK trial', r11c.body.data.fit);
else failT('OK trial', '');

const r11d = await callApi(p, API + '/eye/optometry/ortho-k-order', { method: 'POST', body: { patientId: 'P099', design: { baseCurve: 7.8 }, prescriptionId: 'P001' } });
if (r11d.ok) ok('Ortho-K order', '¥' + r11d.body.data.cost.total);
else failT('Ortho-K', '');

const r11e = await callApi(p, API + '/eye/optometry/defocus-order', { method: 'POST', body: { patientId: 'P099', frameSelection: 'RB', lensType: 'DIMS' } });
if (r11e.ok) ok('Defocus order', r11e.body.data.brand);
else failT('Defocus', '');

const r11f = await callApi(p, API + '/eye/optometry/stats');
if (r11f.ok) ok('Optometry stats', r11f.body.data.totalPatients + ' patients');
else failT('Optometry stats', '');

// Pages
console.log('\n[Pages] Key pages');
const pages = [
  ['/eye/pacs/real-viewer', 'PR10 RealDicomViewer'],
  ['/eye/case-library', 'PR9 CaseLibrary'],
  ['/eye/tele', 'PR8 TeleConsult'],
  ['/eye/optometry-loop', 'PR11 OptometryLoop'],
];
for (const [path, name] of pages) {
  await p.goto(BASE + path.slice(1) + '?t=' + Date.now());
  await p.waitForTimeout(2500);
  const hasEB = await p.evaluate(() => document.body.innerText.includes('ErrorBoundary caught'));
  if (!hasEB) ok(name);
  else failT(name, 'ErrorBoundary');
}

await p.goto(BASE + '?t=' + Date.now());
await p.waitForTimeout(2000);
await p.screenshot({ path: 'verify-v44-home.png', fullPage: false });
console.log('\nScreenshot: verify-v44-home.png');

console.log('\n=== v44 E2E: ' + passC + '/' + (passC + failC) + ' ===');
if (failC > 0) {
  console.log('\nFailed:');
  for (const f of results.filter(r => r.status === 'FAIL')) {
    console.log('  - ' + f.name + ': ' + f.err);
  }
}

import('fs').then(fs => fs.writeFileSync('verify-v44-result.json', JSON.stringify(results, null, 2)));
await b.close();
process.exit(failC > 0 ? 1 : 0);
