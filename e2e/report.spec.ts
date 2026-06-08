/**
 * G005 放射RIS系统 v3.0.1 - E2E: 报告
 */
import { test, expect } from '@playwright/test'

test.describe('Report V3 (E2E)', () => {
  test('访问 /report-write-v3 显示 Word 风格编辑器 4 段', async ({ page }) => {
    await page.goto('/report-write-v3')
    await expect(page.getByText('报告编辑器').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('检查所见')).toBeVisible()
    await expect(page.getByText('检查结论')).toBeVisible()
    await expect(page.getByText('建议')).toBeVisible()
    await expect(page.getByText('签名')).toBeVisible()
  })

  test('打印按钮可点击', async ({ page }) => {
    await page.goto('/report-write-v3')
    const printBtn = page.getByTestId('print-btn')
    await expect(printBtn).toBeVisible()
  })
})
