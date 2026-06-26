import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  // PR 5: AI 模型扩充
  ['GET', '/api/v1/eye/ai/models/dr-grader', null],
  ['POST', '/api/v1/eye/ai/infer/dr', { studyId: 'STU001', patientId: 'P000001' }],
  ['POST', '/api/v1/eye/ai/infer/glaucoma-vf', { studyId: 'STU002', visualFieldData: [] }],
  ['POST', '/api/v1/eye/ai/infer/pcv-quant', { studyId: 'STU003' }],
  ['POST', '/api/v1/eye/ai/infer/amd-ga', { studyId: 'STU004' }],
  ['POST', '/api/v1/eye/ai/infer/cnv-quant', { studyId: 'STU005' }],
  ['GET', '/api/v1/eye/ai/biomarker/STU001', null],
  ['POST', '/api/v1/eye/ai/governance/compare', { modelIds: ['mdl-001', 'mdl-002'] }],

  // PR 6: 影像质控 AI
  ['POST', '/api/v1/eye/qc/auto-grade', { instanceId: 'INS001' }],
  ['GET', '/api/v1/eye/qc/score/INS001', null],
  ['POST', '/api/v1/eye/qc/reject', { instanceId: 'INS002', reason: '运动伪影', severity: 'high' }],
  ['POST', '/api/v1/eye/qc/rescan', { instanceId: 'INS002', modality: 'fundus', protocol: '增强协议' }],
  ['GET', '/api/v1/eye/qc/rules', null],
  ['GET', '/api/v1/eye/qc/stats', null],

  // PR 7: 多模态融合
  ['POST', '/api/v1/eye/fusion/late', { studyId: 'STU001', modalities: { fundus: 'a', oct: 'b' } }],
  ['POST', '/api/v1/eye/fusion/attention', { studyId: 'STU001', modalities: { fundus: 'a', oct: 'b' } }],
  ['GET', '/api/v1/eye/fusion/result/STU001', null],
  ['GET', '/api/v1/eye/fusion/explain/FUSE001', null],
  ['POST', '/api/v1/eye/fusion/report', { fusionId: 'FUSE001', reportType: 'ophthalmology' }],
  ['GET', '/api/v1/eye/fusion/comparison?studyId=STU001', null],
  ['POST', '/api/v1/eye/fusion/register', { fundusStudyId: 'STU001', octStudyId: 'STU002' }],
  ['GET', '/api/v1/eye/fusion/heatmap/FUSE001', null],
];

let pass = 0, fail = 0;
for (const [method, url, body] of apis) {
  const r = await p.evaluate(async ({ method, url, body }) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const text = await res.text();
    return { status: res.status, hasSuccess: text.includes('"success":true') };
  }, { method, url, body });
  const ok = r.status === 200 && r.hasSuccess;
  if (ok) { pass++; }
  else { fail++; console.log(`✗ ${method} ${url}: status=${r.status}`); }
}
console.log(`\n=== ${pass}/${pass + fail} 通过 ===`);
await b.close();
