import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  ['GET', '/api/v1/eye/iol/constant/SA60AT', null],
  ['GET', '/api/v1/eye/iol/constant/TECNIS-1PC', null],
  ['GET', '/api/v1/eye/iol/constant/PanOptix', null],
  ['GET', '/api/v1/eye/iol/constant/SN6AT3-SN6AT9', null],
  ['POST', '/api/v1/eye/iol/calculate/barrett', { AL: 23.5, K1: 43.0, K2: 43.5, ACD: 3.0, LT: 4.5, CCT: 0.55, iolModel: 'SA60AT' }],
  ['POST', '/api/v1/eye/iol/calculate/kane', { AL: 23.0, K1: 42.5, K2: 44.0, ACD: 2.8, LT: 4.6, CCT: 0.55, iolModel: 'TECNIS-1PC' }],
  ['POST', '/api/v1/eye/iol/calculate/hill-rbf', { AL: 24.0, K1: 43.0, K2: 43.5, ACD: 3.0 }],
  ['POST', '/api/v1/eye/iol/toric/plan', { eye: 'OD', preOpK1: 42.5, preOpK2: 44.0, preOpAxis: 90, inducedAstigmatism: 0.3, iolModel: 'SN6AT5', iolCylinderPower: 2.25 }],
  ['GET', '/api/v1/eye/iol/toric/candidate?cornealAst=1.5&sia=0.3', null],
  ['POST', '/api/v1/eye/iol/predict/postop', { targetPower: 21.0, K1: 43.0, K2: 43.5, AL: 23.5, ACD: 3.0 }],
  ['GET', '/api/v1/eye/iol/inventory', null],
];

let pass = 0, fail = 0;
for (const [method, url, body] of apis) {
  const r = await p.evaluate(async ({ method, url, body }) => {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const text = await res.text();
    return { status: res.status, hasSuccess: text.includes('"success":true'), sample: text.slice(0, 150) };
  }, { method, url, body });
  const ok = r.status === 200 && r.hasSuccess;
  if (ok) { pass++; }
  else { fail++; console.log(`✗ ${method} ${url}: status=${r.status}`); }
}
console.log(`\n=== ${pass}/${pass + fail} 通过 ===`);
await b.close();
