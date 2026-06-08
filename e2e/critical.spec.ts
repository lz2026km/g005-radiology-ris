/**
 * G005 放射RIS系统 v3.0.1 - E2E: 危急值
 */
import { test, expect } from '@playwright/test'

test.describe('Critical Value (E2E)', () => {
  test('访问 /critical-value 渲染主列表', async ({ page }) => {
    await page.goto('/critical-value')
    await expect(page.getByText('危急值').first()).toBeVisible({ timeout: 10000 })
  })

  test('访问 /v3/critical-value 渲染 V3 重构页', async ({ page }) => {
    await page.goto('/v3/critical-value')
    await expect(page.locator('text=危急值').first()).toBeVisible({ timeout: 10000 })
  })
})
