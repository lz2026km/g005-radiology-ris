import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

// 抽样测试 v3 端点 (从 8 个 client 各选 1-2 个)
const apis = [
  ['GET', '/api/v1/analytics/dashboard?period=month', null],
  ['GET', '/api/v1/quality/reports?pageSize=3', null],
  ['GET', '/api/v1/pacs/studies?pageSize=3', null],
  ['GET', '/api/v1/integration/fhir?pageSize=3', null],
  ['GET', '/api/v1/integration/webhooks', null],
  ['GET', '/api/v1/integration/xds/registries', null],
  ['GET', '/api/v1/dist/tasks?pageSize=3', null],
  ['GET', '/api/v1/dist/channels', null],
  ['GET', '/api/v1/writing/templates', null],
  ['GET', '/api/v1/writing/drafts', null],
  ['GET', '/api/v1/writing/phrases', null],
  ['GET', '/api/v1/ai-assist/drafts', null],
  ['GET', '/api/v1/reviews/templates/initial', null],
  ['GET', '/api/v1/reviews/templates/final', null],
  ['GET', '/api/v1/reviews/cosign/calendar', null],
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
