import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
p.on('console', m => { if (m.type() === 'error') console.log('CE:', m.text().slice(0, 300)); });
p.on('pageerror', e => console.log('PE:', e.message.slice(0, 300)));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/consultation');
await p.waitForTimeout(3000);
const r = await p.evaluate(async () => {
  const res = await fetch('/api/v1/consultations');
  const body = await res.json();
  return { status: res.status, hasData: body?.data !== undefined, dataLen: body?.data?.length, dataType: typeof body?.data, sample: body?.data?.[0] ? JSON.stringify(body.data[0]).slice(0, 200) : 'none', fullBody: JSON.stringify(body).slice(0, 300) };
});
console.log('API:', JSON.stringify(r, null, 2));
await b.close();
