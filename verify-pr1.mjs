import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PE:', e.message.slice(0, 200)));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const REPORT_ID = 'RPT-20260526-00001';
const apis = [
  // 9 端点 - 报告流程
  ['GET', '/api/v1/reports?pageSize=5', null],
  ['GET', '/api/v1/reports/' + REPORT_ID, null],
  ['POST', '/api/v1/reports/' + REPORT_ID + '/submit', null],
  ['POST', '/api/v1/reports/' + REPORT_ID + '/review', null],
  ['POST', '/api/v1/reports/' + REPORT_ID + '/sign', { certificateId: 'cert-001' }],
  ['POST', '/api/v1/reports/' + REPORT_ID + '/reject', { reason: 'test reject reason from v45 PR1' }],
  ['POST', '/api/v1/reports/' + REPORT_ID + '/revise', { reason: 'test revise from v45' }],
  ['POST', '/api/v1/reports/' + REPORT_ID + '/publish', { qualityScore: 88 }],
  ['POST', '/api/v1/reports/' + REPORT_ID + '/cosign', { cosignerId: 'D002' }],
  ['GET', '/api/v1/reports/' + REPORT_ID + '/diff', null],
  ['GET', '/api/v1/reports/' + REPORT_ID + '/audit-trail', null],
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
  if (r.status === 200 && r.has) { passC++; console.log('[PASS]', m, u); }
  else { failC++; console.log('[FAIL]', m, u, r.status); }
}
console.log('\nResult: ' + passC + '/' + (passC + failC));
await b.close();
