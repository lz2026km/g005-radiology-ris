import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:5199/g005-radiology-ris';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
const deadBtns = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404') && !m.text().includes('favicon')) errors.push(`console: ${m.text()}`); });

// Try with doctor role instead of admin
await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(3500);
await page.evaluate(() => { localStorage.setItem('ris_current_user', JSON.stringify({ id: 'D001', name: '张明远', role: '医生', department: '放射科' })); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(4000);
await page.goto(BASE + '/worklist', { waitUntil: 'load' }); await page.waitForTimeout(3000);
const body = await page.locator('body').textContent() || '';
console.log(`/worklist as 医生: ${body.length}ch, is403: ${body.includes('无权访问')}`);
await browser.close();
