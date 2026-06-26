// v3.0.6.8-40 综合 E2E 测试 (ASCII only)
const fs = require('fs');
const content = `// v3.0.6.8-40 Comprehensive E2E Test
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
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'Admin',department:'IT'})));
await p.waitForTimeout(2500);

console.log('=== v3.0.6.8-40 E2E Test ===\\n');

// Phase 1 baseline
console.log('[Phase 1] Baseline');
const r1 = await callApi(p, API + '/eye/system/health');
if (r1.ok && r1.body?.data?.version === '3.0.6.8-40') ok('system/health v40', r1.body.data.version);
else failT('system/health', r1.body?.data?.version || 'fail');

const r2 = await callApi(p, API + '/eye/patients?pageSize=1');
if (r2.ok && r2.body?.meta?.total >= 1500) ok('patients total', r2.body.meta.total);
else failT('patients', r2.body?.meta?.total || 'fail');

const r3 = await callApi(p, API + '/eye/worklist?pageSize=1');
if (r3.ok && r3.body?.meta?.total >= 600) ok('worklist total', r3.body.meta.total);
else failT('worklist', r3.body?.meta?.total || 'fail');

// PR 1
console.log('\\n[PR 1] Real DICOM Rendering');
const r4 = await callApi(p, API + '/eye/pacs/viewport/preset/fundus', { method: 'POST', body: { studyId: 'STU001', modality: 'fundus' } });
if (r4.ok && r4.body?.data?.engineReady) ok('viewport init');
else failT('viewport init', JSON.stringify(r4.body?.error || ''));

const r5 = await callApi(p, API + '/eye/pacs/viewport/preset/fundus');
if (r5.ok && r5.body?.data?.length >= 1) ok('fundus presets', r5.body.data.length);
else failT('fundus presets', '');

const r6 = await callApi(p, API + '/eye/pacs/measurement', { method: 'POST', body: { studyId: 'STU001', measurementType: 'Length', value: 3.45, unit: 'mm', coordinates: [[100,200],[300,400]] } });
if (r6.status === 201) ok('measurement save', r6.body?.data?.id);
else failT('measurement', JSON.stringify(r6.body));

const r7 = await callApi(p, API + '/eye/pacs/measurement/export-sr', { method: 'POST', body: { studyId: 'STU001', measurements: [{ measurementType: 'Length', value: 3.45, unit: 'mm' }] } });
if (r7.ok && r7.body?.data?.sopInstanceUID) ok('DICOM-SR export', r7.body.data.sopInstanceUID.slice(-12));
else failT('DICOM-SR', '');

// PR 2
console.log('\\n[PR 2] Report AI');
const r8 = await callApi(p, API + '/eye/report/asr/vocab/dr');
if (r8.ok && r8.body?.data?.terms?.length > 0) ok('DR vocab', r8.body.data.terms.length);
else failT('DR vocab', '');

const r9 = await callApi(p, API + '/eye/report/nlp/extract', { method: 'POST', body: { text: 'right eye DR, NPDR III, ME, IOL 21.5D', condition: 'dr' } });
if (r9.ok && r9.body?.data?.extracted) ok('NLP extract', r9.body.data.extracted.diagnoses?.length || 0);
else failT('NLP', '');

const r10 = await callApi(p, API + '/eye/report/ai/continue', { method: 'POST', body: { patientName: 'Zhang San', findings: 'DR III', modality: 'fundus', condition: 'dr' } });
if (r10.ok && r10.body?.data?.text) ok('AI continue', r10.body.data.wordCount);
else failT('AI continue', '');

// PR 3
console.log('\\n[PR 3] IOL Planning');
const r11 = await callApi(p, API + '/eye/iol/constant/SA60AT');
if (r11.ok && r11.body?.data?.['Barrett-true-K']) ok('SA60AT constants');
else failT('SA60AT', '');

const r12 = await callApi(p, API + '/eye/iol/calculate/barrett', { method: 'POST', body: { AL: 23.5, K1: 43.0, K2: 43.5, ACD: 3.0, LT: 4.5, CCT: 0.55, iolModel: 'SA60AT' } });
if (r12.ok && r12.body?.data?.power > 0) ok('Barrett calc', r12.body.data.power + 'D');
else failT('Barrett', '');

const r13 = await callApi(p, API + '/eye/iol/toric/plan', { method: 'POST', body: { eye: 'OD', preOpK1: 42.5, preOpK2: 44.0, preOpAxis: 90, inducedAstigmatism: 0.3, iolModel: 'SN6AT5', iolCylinderPower: 2.25 } });
if (r13.ok && r13.body?.data?.suggestedAxis !== undefined) ok('Toric plan', r13.body.data.suggestedAxis + 'deg');
else failT('Toric', '');

const r14 = await callApi(p, API + '/eye/iol/predict/postop', { method: 'POST', body: { targetPower: 21.0, K1: 43.0, K2: 43.5, AL: 23.5, ACD: 3.0 } });
if (r14.ok && r14.body?.data?.predictedSE) ok('Postop predict', r14.body.data.predictedSE);
else failT('Postop', '');

// PR 4
console.log('\\n[PR 4] 8 Subspecialty');
const r15 = await callApi(p, API + '/eye/subspecialty/strabismus/synoptophore', { method: 'POST', body: { patientId: 'P000001', eye: 'OD', horizontalPrism: 10, verticalPrism: 0, torsion: 0 } });
if (r15.ok) ok('Strabismus synop');
else failT('Strabismus', '');

const r16 = await callApi(p, API + '/eye/subspecialty/cornea/pentacam', { method: 'POST', body: { patientId: 'P000001', eye: 'OD', kmax: 48, thinnestPachy: 460, pachyMin: 460, pachyMinX: 0, pachyMinY: -0.5 } });
if (r16.ok) ok('Cornea Pentacam');
else failT('Cornea', '');

const r17 = await callApi(p, API + '/eye/contact-lens/fitting', { method: 'POST', body: { patientId: 'P000001', lensType: 'RGP', brand: 'B+L', bc: 7.8, dia: 14, power: -3.0 } });
if (r17.ok) ok('Contact lens', r17.body.data.fittingId);
else failT('Contact lens', '');

const r18 = await callApi(p, API + '/eye/low-vision/prescription', { method: 'POST', body: { patientId: 'P000001', reDist: '0.1', reNear: '0.5', leDist: '0.08', leNear: '0.4', reDevice: 'glass', leDevice: 'glass', recommendation: 'magnifier 4X' } });
if (r18.ok) ok('Low vision', r18.body.data.prescriptionId);
else failT('Low vision', '');

// PR 5
console.log('\\n[PR 5] AI Models 12');
const r19 = await callApi(p, API + '/eye/ai/models/dr-grader');
if (r19.ok && r19.body?.data?.grades?.length === 5) ok('DR 5-grade model');
else failT('DR grader', '');

const r20 = await callApi(p, API + '/eye/ai/infer/dr', { method: 'POST', body: { studyId: 'STU001', patientId: 'P000001' } });
if (r20.ok && r20.body?.data?.grade) ok('DR infer', r20.body.data.grade.label);
else failT('DR infer', '');

const r21 = await callApi(p, API + '/eye/ai/biomarker/STU001');
if (r21.ok && r21.body?.data?.biomarkers) ok('Biomarker', Object.keys(r21.body.data.biomarkers).length);
else failT('Biomarker', '');

// PR 6
console.log('\\n[PR 6] Imaging QC AI');
const r22 = await callApi(p, API + '/eye/qc/auto-grade', { method: 'POST', body: { instanceId: 'INS001' } });
if (r22.ok && r22.body?.data?.overallScore) ok('AI QC', r22.body.data.overallScore + '/100');
else failT('AI QC', '');

const r23 = await callApi(p, API + '/eye/qc/rules');
if (r23.ok && r23.body?.data?.length === 5) ok('QC rules', r23.body.data.length);
else failT('QC rules', '');

const r24 = await callApi(p, API + '/eye/qc/rescan', { method: 'POST', body: { instanceId: 'INS002', modality: 'fundus' } });
if (r24.ok && r24.body?.data?.dcmMwLEntry) ok('DICOM MWL rescan');
else failT('DICOM MWL', '');

// PR 7
console.log('\\n[PR 7] Multimodal Fusion');
const r25 = await callApi(p, API + '/eye/fusion/late', { method: 'POST', body: { studyId: 'STU001', modalities: { fundus: 'a', oct: 'b' } } });
if (r25.ok && r25.body?.data?.fused) ok('Late Fusion');
else failT('Late Fusion', '');

const r26 = await callApi(p, API + '/eye/fusion/attention', { method: 'POST', body: { studyId: 'STU001', modalities: { fundus: 'a', oct: 'b' } } });
if (r26.ok && r26.body?.data?.attentionScores) ok('Cross-Modal Attention');
else failT('Cross-Modal', '');

const r27 = await callApi(p, API + '/eye/fusion/explain/FUSE001');
if (r27.ok && r27.body?.data?.shapValues) ok('SHAP explain');
else failT('SHAP', '');

const r28 = await callApi(p, API + '/eye/fusion/register', { method: 'POST', body: { fundusStudyId: 'STU001', octStudyId: 'STU002' } });
if (r28.ok && r28.body?.data?.transform) ok('Multimodal register');
else failT('Register', '');

// Pages
console.log('\\n[Pages] Key pages render');
const pages = [
  ['/eye/pacs/real-viewer', 'PR1 Real DicomViewer'],
  ['/eye/ai-report', 'PR2 AI Report'],
  ['/eye/toric-planner', 'PR3 Toric Planner'],
  ['/eye/sub/strabismus', 'PR4 Strabismus'],
  ['/eye/sub/neuro', 'PR4 NeuroOph'],
  ['/eye/sub/oncology', 'PR4 Oncology'],
  ['/eye/sub/cornea', 'PR4 Cornea'],
  ['/eye/sub/contact-lens', 'PR4 ContactLens'],
  ['/eye/sub/low-vision', 'PR4 LowVision'],
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
await p.screenshot({ path: 'verify-v40-home.png', fullPage: false });
console.log('Screenshot: verify-v40-home.png');

await p.goto(BASE + 'eye/pacs/real-viewer?modality=oct&t=' + Date.now());
await p.waitForTimeout(2500);
await p.screenshot({ path: 'verify-v40-pr1.png', fullPage: false });

await p.goto(BASE + 'eye/ai-report?t=' + Date.now());
await p.waitForTimeout(2500);
await p.screenshot({ path: 'verify-v40-pr2.png', fullPage: false });

await p.goto(BASE + 'eye/toric-planner?t=' + Date.now());
await p.waitForTimeout(2500);
await p.screenshot({ path: 'verify-v40-pr3.png', fullPage: false });

await p.goto(BASE + 'eye/sub/cornea?t=' + Date.now());
await p.waitForTimeout(2500);
await p.screenshot({ path: 'verify-v40-pr4.png', fullPage: false });

console.log('\\n=== E2E Result: ' + passC + '/' + (passC + failC) + ' ===');
if (failC > 0) {
  console.log('\\nFailed:');
  for (const f of results.filter(r => r.status === 'FAIL')) {
    console.log('  - ' + f.name + ': ' + f.err);
  }
}

import('fs').then(fs => fs.writeFileSync('verify-v40-result.json', JSON.stringify(results, null, 2)));
await b.close();
process.exit(failC > 0 ? 1 : 0);
`;
fs.writeFileSync('E:/opencode work/FS/G005-RISv-3.0.0/test-v40-e2e.mjs', content, 'utf8');
console.log('Written ASCII-only test file');
