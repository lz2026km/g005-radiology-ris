import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  ['GET', '/api/v1/eye/edu/cases?pageSize=5', null],
  ['POST', '/api/v1/eye/edu/cases', { id: 'CASE001', patientName: 'Test', diagnosis: 'DR III' }],
  ['POST', '/api/v1/eye/edu/annotate', { caseId: 'CASE001', annotationType: 'roi', coordinates: [[100,100],[200,200]], label: '视盘' }],
  ['GET', '/api/v1/eye/edu/annotate/CASE001', null],
  ['POST', '/api/v1/eye/edu/export-sr', { caseId: 'CASE001', annotations: [{ label: '视盘', annotationType: 'roi' }], format: 'sr-tid1500' }],
  ['POST', '/api/v1/eye/edu/deidentify', { caseId: 'CASE001', level: 'basic' }],
  ['POST', '/api/v1/eye/edu/cohort', { criteria: { disease: 'DR' } }],
  ['GET', '/api/v1/eye/edu/annotation-projects', null],
  ['GET', '/api/v1/eye/edu/stats?cohortId=COH001', null],
  ['GET', '/api/v1/eye/edu/cases/CASE001', null],
];

let passC = 0, failC = 0;
for (const [m, u, b2] of apis) {
  const r = await p.evaluate(async ({ m, u, b2 }) => {
    const opts = { method: m, headers: { 'Content-Type': 'application/json' } };
    if (b2) opts.body = JSON.stringify(b2);
    const res = await fetch(u, opts);
    const text = await res.text();
    return { status: res.status, has: text.includes('"success":true') };
  }, { m, u, b2 });
  if ((r.status === 200 || r.status === 201) && r.has) { passC++; console.log('[PASS]', m, u, r.status); }
  else { failC++; console.log('[FAIL]', m, u, r.status); }
}
console.log('\nResult: ' + passC + '/' + (passC + failC));
await b.close();
