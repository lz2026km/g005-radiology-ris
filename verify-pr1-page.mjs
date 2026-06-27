import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PE:', e.message.slice(0, 200)));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
await p.evaluate(async () => {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) await r.unregister();
  }
});
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'SysAdmin',role:'管理员',department:'信息科'})));
await p.waitForTimeout(2500);
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/report-workflow?t=' + Date.now());
await p.waitForTimeout(4000);
const hasEB = await p.evaluate(() => document.body.innerText.includes('ErrorBoundary caught'));
console.log('ErrorBoundary:', hasEB);
const text = await p.evaluate(() => document.body.innerText.slice(0, 200));
console.log('Sample:', text);
await p.screenshot({ path: 'verify-pr1-page.png', fullPage: false });
console.log('📸 verify-pr1-page.png');
await b.close();
