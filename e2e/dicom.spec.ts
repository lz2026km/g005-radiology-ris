/**
 * G005 放射RIS系统 v3.0.1 - E2E: DICOM 查看器
 */
import { test, expect } from '@playwright/test'

test.describe('DICOM Viewer (E2E)', () => {
  test('访问 /dicom-viewer 渲染主区 + 工具栏', async ({ page }) => {
    await page.goto('/dicom-viewer')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=DICOM').first()).toBeVisible({ timeout: 10000 })
  })

  test('按 ? 唤起快捷键速查面板', async ({ page }) => {
    await page.goto('/dicom-viewer')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Shift+/')
    await expect(page.getByText('快捷键速查').first()).toBeVisible({ timeout: 5000 })
  })
})
