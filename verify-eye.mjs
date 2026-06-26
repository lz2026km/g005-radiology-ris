import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PE:', e.message.slice(0, 200)));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

// 测试所有 8 模块的代表性端点
const apis = [
  // Ris (26)
  ['GET', '/api/v1/eye/ris/appointments'],
  ['GET', '/api/v1/eye/ris/appointments/today'],
  ['GET', '/api/v1/eye/ris/follow-ups'],
  ['GET', '/api/v1/eye/ris/referrals'],
  ['GET', '/api/v1/eye/ris/surgeries'],
  ['GET', '/api/v1/eye/ris/schedules'],
  ['GET', '/api/v1/eye/ris/workflow-status'],
  // Pacs (32)
  ['GET', '/api/v1/eye/pacs/studies'],
  ['GET', '/api/v1/eye/pacs/series'],
  ['GET', '/api/v1/eye/pacs/instances'],
  ['GET', '/api/v1/eye/pacs/qido/studies'],
  ['GET', '/api/v1/eye/pacs/measurements'],
  ['GET', '/api/v1/eye/pacs/annotations'],
  ['GET', '/api/v1/eye/pacs/lesion-segmentations'],
  ['GET', '/api/v1/eye/pacs/key-images'],
  // Emr (24)
  ['GET', '/api/v1/eye/emr/records'],
  ['GET', '/api/v1/eye/emr/ophthalmic-exams'],
  ['GET', '/api/v1/eye/emr/preop-assessments'],
  ['GET', '/api/v1/eye/emr/anes-assessments'],
  // Ai (18)
  ['GET', '/api/v1/eye/ai/models'],
  ['GET', '/api/v1/eye/ai/inferences'],
  ['GET', '/api/v1/eye/ai/inferences/pending'],
  ['GET', '/api/v1/eye/ai/heatmaps'],
  ['GET', '/api/v1/eye/ai/stats/disease-distribution'],
  // Report (22)
  ['GET', '/api/v1/eye/report/reports'],
  ['GET', '/api/v1/eye/report/drafts'],
  ['GET', '/api/v1/eye/report/templates'],
  ['GET', '/api/v1/eye/report/print-records'],
  // Kpi (16)
  ['GET', '/api/v1/eye/kpi/overview'],
  ['GET', '/api/v1/eye/kpi/trend'],
  ['GET', '/api/v1/eye/kpi/by-doctor'],
  ['GET', '/api/v1/eye/kpi/targets'],
  ['GET', '/api/v1/eye/kpi/satisfaction'],
  // Subspecialty (24) - 8 亚专科
  ['GET', '/api/v1/eye/subspecialty/strabismus/records'],
  ['GET', '/api/v1/eye/subspecialty/neuro-ophthalmology/records'],
  ['GET', '/api/v1/eye/subspecialty/ocular-oncology/records'],
  ['GET', '/api/v1/eye/subspecialty/cornea/records'],
  ['GET', '/api/v1/eye/subspecialty/cataract/records'],
  ['GET', '/api/v1/eye/subspecialty/refractive/records'],
  ['GET', '/api/v1/eye/subspecialty/contact-lens/records'],
  ['GET', '/api/v1/eye/subspecialty/low-vision/records'],
  // Journey (18)
  ['GET', '/api/v1/eye/journey/timeline/EP001'],
  ['GET', '/api/v1/eye/journey/education'],
  ['GET', '/api/v1/eye/journey/insurance-claims'],
  ['GET', '/api/v1/eye/journey/notification-templates'],
  ['GET', '/api/v1/eye/journey/rules'],
  ['GET', '/api/v1/eye/journey/stats'],
  // Rbac
  ['GET', '/api/v1/eye/rbac/points'],
  ['GET', '/api/v1/eye/rbac/role-matrix'],
];

let pass = 0, fail = 0;
for (const [method, url] of apis) {
  const r = await p.evaluate(async ({ method, url }) => {
    const res = await fetch(url);
    let body = null; try { body = await res.json(); } catch {}
    return { status: res.status, success: body?.success, hasData: body?.data !== undefined };
  }, { method, url });
  const ok = r.status === 200 && r.hasData;
  if (ok) { pass++; } else { fail++; console.log(`✗ ${method} ${url}: status=${r.status}`); }
}
console.log(`\n=== ${pass}/${pass + fail} 通过 ===`);
console.log(`测试覆盖 ${apis.length} 个代表性端点 (8 模块 + RBAC)`);
await b.close();
