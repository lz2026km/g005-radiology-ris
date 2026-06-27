import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  ['GET', '/api/v1/sign/certs?pageSize=3', null],
  ['POST', '/api/v1/sign/certs', { commonName: 'Test v49', userId: 'D001', department: 'CT', title: '主治' }],
  ['POST', '/api/v1/sign/certs/cert-001/revoke', { reason: 'v49 test' }],
  ['POST', '/api/v1/sign/start', { reportId: 'RPT-001', certificateId: 'CERT-001' }],
  ['GET', '/api/v1/sign/verify/mock-hash-001', null],
  ['POST', '/api/v1/sign/timestamp', { dataHash: 'mock', reportId: 'RPT-001' }],
  ['GET', '/api/v1/sign/blockchain/proofs?reportId=RPT-001', null],
  ['GET', '/api/v1/amend?pageSize=3', null],
  ['GET', '/api/v1/amend?reportId=RP20260601001', null],
  ['POST', '/api/v1/amend/start', { reportId: 'RPT-001', reason: 'v49 test' }],
  ['PUT', '/api/v1/amend/rev-ent-001', { changes: 'v49 update' }],
  ['POST', '/api/v1/amend/rev-ent-001/complete', { finalReason: 'v49', changes: 'all updated' }],
  ['POST', '/api/v1/amend/rev-ent-001/approve', { comment: 'v49 ok' }],
  ['POST', '/api/v1/amend/rev-ent-001/reject', { reason: 'v49 reject' }],
  ['GET', '/api/v1/amend?reportId=RPT-001', null],
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
