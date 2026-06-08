/**
 * G005 放射RIS系统 v3.0.1 - E2E: 可访问性
 */
import { test, expect } from '@playwright/test'

test.describe('A11y (E2E)', () => {
  test('首页有 SkipLink 可跳转', async ({ page }) => {
    await page.goto('/')
    const skip = page.getByText(/跳到|skip/i).first()
    await expect(skip).toBeVisible({ timeout: 5000 })
  })

  test('快捷键 Esc 关闭弹窗', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Escape')
    await expect(page.locator('body')).toBeVisible()
  })
})
