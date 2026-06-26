import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PE:', e.message.slice(0, 200)));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
// 清除 SW 缓存
await p.evaluate(async () => {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) await r.unregister();
  }
  if ('caches' in window) {
    const keys = await caches.keys();
    for (const k of keys) await caches.delete(k);
  }
});
await p.evaluate(() => localStorage.setItem('ris_current_user', JSON.stringify({id:'A001',name:'系统管理员',role:'管理员',department:'信息科'})));
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/eye/pacs/real-viewer?studyId=STU-20260620-00001&modality=fundus&t=' + Date.now());
await p.waitForTimeout(5000);
const hasError = await p.evaluate(() => document.body.innerText.includes('ErrorBoundary caught'));
const text = await p.evaluate(() => document.body.innerText.slice(0, 400));
console.log('ErrorBoundary:', hasError);
console.log('Body sample:', text);
await p.screenshot({ path: 'verify-pr1-viewer.png', fullPage: false });
console.log('📸 verify-pr1-viewer.png');
await b.close();
