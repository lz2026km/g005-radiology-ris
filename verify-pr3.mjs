import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);

const apis = [
  // 通知 (8)
  ['GET', '/api/v1/notifications?pageSize=10', null],
  ['GET', '/api/v1/notifications/unread-count', null],
  ['PUT', '/api/v1/notifications/N001/read', null],
  ['POST', '/api/v1/notifications/mark-all-read', null],
  ['GET', '/api/v1/notifications/prefs', null],
  ['POST', '/api/v1/notifications/send', { title: 'test', content: 'test', type: 'system' }],
  // 模板 (6)
  ['GET', '/api/v1/templates?pageSize=10', null],
  ['GET', '/api/v1/templates/TPL001', null],
  ['POST', '/api/v1/templates', { name: 'New Tpl v47', modality: 'CT', category: 'CT' }],
  ['PUT', '/api/v1/templates/TPL001', { name: 'Updated' }],
  ['DELETE', '/api/v1/templates/TPL-NONEXISTENT', null],
  // 词典 (6)
  ['GET', '/api/v1/dictionary?pageSize=10', null],
  ['GET', '/api/v1/dictionary/categories', null],
  ['POST', '/api/v1/dictionary', { category: 'test', code: 'T001', name: 'Test Item v47' }],
  ['PUT', '/api/v1/dictionary/D001', { name: 'Updated' }],
  ['DELETE', '/api/v1/dictionary/D-NONEXISTENT', null],
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
  // 200/201 有 success/data, 204 无 body 算 success
  if (r.status === 204) { passC++; }
  else if ((r.status === 200 || r.status === 201) && r.has) { passC++; }
  else { failC++; console.log('[FAIL]', m, u, r.status); }
}
console.log('Result: ' + passC + '/' + (passC + failC));
await b.close();
