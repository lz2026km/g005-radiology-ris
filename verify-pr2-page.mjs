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
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/eye/ai-report?t=' + Date.now());
await p.waitForTimeout(4000);
const hasError = await p.evaluate(() => document.body.innerText.includes('ErrorBoundary caught'));
console.log('ErrorBoundary:', hasError);
const sample = await p.evaluate(() => document.body.innerText.slice(0, 500));
console.log('Sample:', sample);
await p.screenshot({ path: 'verify-pr2.png', fullPage: false });
console.log('📸 verify-pr2.png');
const err = await p.evaluate(() => {
  const root = document.querySelector('[class*="ant"]')?.outerHTML?.slice(0, 500);
  return root;
});
console.log('Root:', err);
await b.close();
