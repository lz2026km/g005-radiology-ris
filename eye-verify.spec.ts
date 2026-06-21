/**
 * G005 眼科模块 E2E - 正确处理 SPA + 404 fallback
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SHOT_DIR = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\test-screenshots';
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const PAGES = [
  { name: '01-eye-workspace', url: '/eye' },
  { name: '02-eye-pacs-list', url: '/eye/pacs' },
  { name: '03-eye-pacs-viewer', url: '/eye/pacs/viewer?studyId=es-001' },
  { name: '04-eye-oct', url: '/eye/pacs/oct' },
  { name: '05-eye-iol-calc', url: '/eye/ris/iol-calculator' },
  { name: '06-eye-va', url: '/eye/ris/va' },
  { name: '07-eye-iop', url: '/eye/ris/iop' },
];

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) console.log('  [console]', m.text()); });

  // 注入认证
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('ris_current_user', JSON.stringify({
      id: 'D001', name: '张明远', role: '医生', department: '放射科',
    }));
  });
  // 加载根页面, 等待 React 渲染
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
});

for (const pg of PAGES) {
  test(`眼科页面: ${pg.name} ${pg.url}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(`console: ${m.text()}`); });

    // 访问眼�?路由 - vite preview 会返回 404.html, 等待 meta-refresh
    await page.goto(pg.url, { waitUntil: 'load', timeout: 15000 });
    // 等待 meta-refresh + JS redirect 完�?
    await page.waitForTimeout(2000);
    // 404.html 的 JS 会跳转到根, 然后再走真实路由
    // 改用 history.pushState + dispatchEvent 触发 React Router
    await page.evaluate((url) => {
      // 检查是否在 404 fallback 页面
      if (document.title === 'G005 RIS') {
        // 是 404 fallback, 重新加载
        window.location.replace(url);
      } else {
        // 在 SPA 内, 触发 client-side nav
        window.history.pushState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }, pg.url);
    await page.waitForTimeout(3000);
    // 如果还在 fallback, 强制刷新
    if (await page.locator('text=did you mean').isVisible({ timeout: 500 }).catch(() => false)) {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await page.evaluate((url) => {
        window.history.pushState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, pg.url);
      await page.waitForTimeout(3000);
    }

    const bodyText = (await page.locator('body').textContent()) || '';
    const is404 = bodyText.includes('did you mean') || bodyText.length < 200;
    await page.screenshot({ path: path.join(SHOT_DIR, `${pg.name}.png`), fullPage: false });

    const status = is404 ? '✗ 404' : '✓';
    console.log(`  ${status} ${pg.name}: ${bodyText.length}ch, ${errors.length}err, url=${page.url()}`);
    if (is404) {
      console.log(`    内容: ${bodyText.substring(0, 150)}`);
    } else if (errors.length > 0) {
      errors.slice(0, 2).forEach((e) => console.log(`    - ${e.substring(0, 180)}`));
    }
  });
}
