import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://127.0.0.1:5199/g005-radiology-ris/');
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
await p.waitForTimeout(2000);
const r1 = await p.evaluate(() => fetch('/api/v1/eye/system/health').then(r => r.json()));
console.log('health:', JSON.stringify(r1).slice(0, 200));
await b.close();
