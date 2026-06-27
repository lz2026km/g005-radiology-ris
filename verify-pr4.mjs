import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  // 初核 6
  ['GET', '/api/v1/review/initial-check?pageSize=5', null],
  ['GET', '/api/v1/review/initial-check/IC-001', null],
  ['POST', '/api/v1/review/initial-check', { reportId: 'RPT-001', checkItems: [{name:'description',passed:true}], note: 'v48 test' }],
  ['POST', '/api/v1/review/initial-check/IC-001/approve', { note: 'approved' }],
  ['POST', '/api/v1/review/initial-check/IC-002/reject', { reason: 'test reject' }],
  ['GET', '/api/v1/review/initial-check/summary', null],
  // 终核 7
  ['GET', '/api/v1/review/final-check?pageSize=5', null],
  ['GET', '/api/v1/review/final-check/FC-001', null],
  ['POST', '/api/v1/review/final-check', { reportId: 'RPT-001', templateId: 'TPL001', priority: 'normal' }],
  ['POST', '/api/v1/review/final-check/FC-001/score', { score: 90 }],
  ['POST', '/api/v1/review/final-check/FC-001/approve', { finalNote: 'v48 test' }],
  ['POST', '/api/v1/review/final-check/FC-002/reject', { reason: 'test', requiredChanges: [] }],
  ['GET', '/api/v1/review/final-check/summary', null],
  // 复审 7
  ['GET', '/api/v1/reviews/list?pageSize=5', null],
  ['GET', '/api/v1/reviews/R-001', null],
  ['POST', '/api/v1/reviews/R-001/assign', { assignee: 'D002' }],
  ['POST', '/api/v1/reviews/R-001/approve', { note: 'v48' }],
  ['POST', '/api/v1/reviews/R-002/reject', { reason: 'v48 test' }],
  ['GET', '/api/v1/reviews/workload', null],
  ['GET', '/api/v1/reviews/sla', null],
];

let passC = 0, failC = 0;
for (const [m, u, b2] of apis) {
  const r = await p.evaluate(async ({ m, u, b2 }) => {
    const opts = { method: m, headers: { 'Content-Type': 'application/json' } };
    if (b2) opts.body = JSON.stringify(b2);
    const res = await fetch(u, opts);
    const text = await res.text();
    return { status: res.status, has: text.includes('"success":true') || text.includes('"data"') };
  }, { m, u, b2 });
  if ((r.status === 200 || r.status === 201) && r.has) { passC++; }
  else { failC++; console.log('[FAIL]', m, u, r.status); }
}
console.log('Result: ' + passC + '/' + (passC + failC));
await b.close();
