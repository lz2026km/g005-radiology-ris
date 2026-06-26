import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PE:', e.message.slice(0, 200)));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.waitForTimeout(1000);
const apis = [
  { url: '/system/health', method: 'GET' },
  { url: '/system/storage', method: 'GET' },
  { url: '/workflow-events', method: 'GET' },
  { url: '/audit-log', method: 'GET' },
  { url: '/critical/sla-status', method: 'GET' },
  { url: '/image-quality/grade', method: 'POST', body: { snrDb: 45, cnr: 4, uniformityPct: 80, artifactScore: 3 } },
];
for (const a of apis) {
  const r = await p.evaluate(async (req) => {
    const opts = { method: req.method, headers: { 'Content-Type': 'application/json' } };
    if (req.body) opts.body = JSON.stringify(req.body);
    const res = await fetch('/api/v1' + req.url, opts);
    let body = null; try { body = await res.json(); } catch {}
    return { status: res.status, success: body?.success, dataType: typeof body?.data };
  }, a);
  console.log(`${r.status} ${a.method} ${a.url}: success=${r.success} dataType=${r.dataType}`);
}
await b.close();
