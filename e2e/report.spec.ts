/**
 * G005 放射RIS系统 v3.0.6.8-19 — E2E: 报告书写
 * 使用 dev server (port 5191) 而非 preview, MSW 在 dev 模式正常工作
 */
import { test, expect } from '@playwright/test'

test.describe('报告书写 V3', () => {
  // baseURL 来自 playwright.config.ts (默认 http://localhost:5191)

  test('页面基础结构加载 (UI 重构 A2)', async ({ page }) => {
    // 1. 首次访问 - 注入认证态
    await page.goto('/reports/v3-write', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => {
      localStorage.setItem('ris_current_user', JSON.stringify({
        id: 'D001', name: '张明远', role: '医生', department: '放射科',
      }));
    });

    // 2. 重新加载让 React 读取到认证态
    await page.goto('/reports/v3-write', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // 3. 等待 MSW + React 渲染
    await page.waitForSelector('.v3-root, .v3-topbar, .ant-card', { timeout: 60000 });

    // 4. 验证 UI 重构 A2 的关键元素
    // 4a. 顶栏
    await expect(page.locator('.v3-topbar')).toBeVisible();
    await expect(page.getByText('报告书写').first()).toBeVisible();
    // 4b. 临床信息条
    await expect(page.locator('.v3-clinical-strip')).toBeVisible();
    // 4c. 主区: 左右分栏
    await expect(page.locator('.v3-main-grid')).toBeVisible();
    // 4d. 富文本编辑器 (新 3 段 toolbar)
    await expect(page.locator('.rte-toolbar').first()).toBeVisible();
    // 4e. 结构化字段 Card (4 Tab + 其他)
    await expect(page.getByText('结构化字段').first()).toBeVisible();
    // 4f. 关键图像
    await expect(page.getByText(/关键图像|影像锚定/).first()).toBeVisible();
  });
})
