/**
 * G005 放射RIS系统 v3.0.1 - E2E: 协同
 */
import { test, expect } from '@playwright/test'

test.describe('Collaboration (E2E)', () => {
  test('访问 /collaboration 渲染协同页', async ({ page }) => {
    await page.goto('/collaboration')
    await expect(page.getByText('协同').first()).toBeVisible({ timeout: 10000 })
  })

  test('访问 /consultation 渲染会诊页', async ({ page }) => {
    await page.goto('/consultation')
    await expect(page.getByText('会诊').first()).toBeVisible({ timeout: 10000 })
  })
})
