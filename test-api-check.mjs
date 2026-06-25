import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
let err500 = 0, err = 0;
p.on('response', r => { if (r.status() >= 500) { err500++; console.log('500:', r.url().slice(-80)); } if (r.status() >= 400 && !r.url().includes('favicon') && !r.url().includes('mockServiceWorker') && !r.url().includes('sw.js') && !r.url().includes('locales/')) { err++; if (err < 30) console.log(`${r.status()}:`, r.url().slice(-80)); } });
p.on('pageerror', e => { if (err < 30) console.log('PE:', e.message.slice(0, 150)); });
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.waitForTimeout(3000);
const apis = ['/patients', '/devices', '/users', '/worklist', '/reports', '/stats/daily', '/stats/quality', '/stats/workload', '/stats/dashboard', '/consultations', '/doses', '/queues', '/materials', '/notifications', '/critical-values', '/appointments', '/schedules', '/exams', '/exams/stats'];
for (const a of apis) {
  const r = await p.evaluate(async (url) => {
    const res = await fetch(`/api/v1${url}`);
    let body = null; try { body = await res.json(); } catch {}
    return { status: res.status, success: body?.success, dataLen: Array.isArray(body?.data) ? body.data.length : (typeof body?.data === 'object' ? Object.keys(body?.data || {}).length : 0) };
  }, a);
  console.log(`${r.status} ${a}: success=${r.success} dataLen=${r.dataLen}`);
}
console.log(`\n500 errors: ${err500}, other errors: ${err}`);
await b.close();
