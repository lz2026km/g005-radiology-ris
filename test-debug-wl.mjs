import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const res = await fetch('/api/v1/worklist/RPT-20260620-00006');
  const body = await res.json();
  return { status: res.status, body: JSON.stringify(body).slice(0, 500) };
});
console.log('worklist detail:', JSON.stringify(r, null, 2));
const r2 = await p.evaluate(async () => {
  const res = await fetch('/api/v1/worklist?pageSize=3');
  const body = await res.json();
  return { first: body?.data?.[0]?.id, second: body?.data?.[1]?.id, third: body?.data?.[2]?.id };
});
console.log('worklist list:', JSON.stringify(r2, null, 2));
await b.close();
