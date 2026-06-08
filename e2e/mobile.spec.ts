/**
 * G005 放射RIS系统 v3.0.1 - E2E: 移动端
 */
import { test, expect } from '@playwright/test'

test.describe('Mobile (E2E)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('移动端访问 / 正常渲染', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })
})
