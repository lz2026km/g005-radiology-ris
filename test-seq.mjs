import { chromium } from 'playwright';
const SIDEBAR_PATHS = ['/', '/worklist', '/exams', '/patients', '/appointments', '/appointment-management', '/queue-call', '/follow-up', '/kiosk/check-in', '/patient/self-service', '/patient/service-management', '/write-report', '/reports/v3-write', '/reports', '/critical-value', '/consultation', '/report-review'];
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
p.on('pageerror', e => console.log(`PE[${p.url()}]:`, e.message.slice(0, 200)));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
for (let i = 0; i < SIDEBAR_PATHS.length; i++) {
  const path = SIDEBAR_PATHS[i];
  const link = await p.$(`aside a[href="${path}"]`);
  if (!link) { console.log(`[${i+1}] ${path}: NO_LINK (sidebar count=${await p.$$eval('aside a', els => els.length)})`); continue; }
  await link.click();
  await p.waitForTimeout(800);
  console.log(`[${i+1}] ${path}: CLICKED, url=${p.url().slice(-40)}`);
}
await b.close();
