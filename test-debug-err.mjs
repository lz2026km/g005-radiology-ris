import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
p.on('console', m => { if (m.type() === 'error') console.log('CE:', m.text().slice(0, 300)); });
p.on('pageerror', e => console.log('PE:', e.message.slice(0, 300)));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const res = await fetch('/api/v1/system/health');
  const text = await res.text();
  return { status: res.status, text: text.slice(0, 500) };
});
console.log('health:', JSON.stringify(r, null, 2));
const r2 = await p.evaluate(async () => {
  const res = await fetch('/api/v1/workflow-events');
  const text = await res.text();
  return { status: res.status, text: text.slice(0, 500) };
});
console.log('workflow:', JSON.stringify(r2, null, 2));
await b.close();
