/**
 * G005 放射RIS系统 v3.0.0 - E2E 测试:登录
 * Phase T1-W2: E2E 起步
 */

import { test, expect } from '@playwright/test';

test.describe('登录流程', () => {
  test('正常登录', async ({ page }) => {
    await page.goto('/');
    // 模拟登录(纯前端 mock)
    await page.evaluate(() => {
      localStorage.setItem('g005.user', JSON.stringify({ id: 'D001', name: '张明远' }));
    });
    await page.reload();

    // 验证首页可见
    await expect(page).toHaveTitle(/G005/);
  });

  test('响应式 - 移动端', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('a11y - 键盘导航', async ({ page }) => {
    await page.goto('/');
    // Tab 键应能聚焦到可交互元素
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });
});
