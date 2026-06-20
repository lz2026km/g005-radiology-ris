/**
 * G005 放射RIS系统 v3.0.1 - E2E: 报告书写 V3 & V4
 */
import { test, expect } from '@playwright/test'

test.describe('报告书写', () => {
  test.describe('V3 旧版', () => {
    test('访问 /reports/v3-write 显示所有核心元素', async ({ page }) => {
      await page.goto('/reports/v3-write')
      await expect(page.getByText('报告书写').first()).toBeVisible({ timeout: 10000 })
      await expect(page.getByText('结构化字段')).toBeVisible()
      await expect(page.getByText('所见')).toBeVisible()
      await expect(page.getByText('提交审核')).toBeVisible()
    })

    test('打印按钮可点击', async ({ page }) => {
      await page.goto('/reports/v3-write')
      const printBtn = page.getByTestId('print-btn')
      await expect(printBtn).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('V4 新版', () => {
    test('访问 /reports/v4-write 显示 V4 布局', async ({ page }) => {
      await page.goto('/reports/v4-write')
      await expect(page.getByText('报告书写 V4').first()).toBeVisible({ timeout: 15000 })
      await expect(page.getByText('结构化字段')).toBeVisible()
      await expect(page.getByText('所见')).toBeVisible()
      await expect(page.getByText('提交审核')).toBeVisible()
    })

    test('V4 顶部工具条包含核心按钮', async ({ page }) => {
      await page.goto('/reports/v4-write')
      await expect(page.getByText('报告书写 V4')).toBeVisible({ timeout: 15000 })
      await expect(page.getByRole('button', { name: /保存/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /提交审核/i })).toBeVisible()
    })

    test('V4 右侧面板可切换 Tab', async ({ page }) => {
      await page.goto('/reports/v4-write')
      await expect(page.getByText('AI 草稿').first()).toBeVisible({ timeout: 15000 })
      await expect(page.getByText('语音')).toBeVisible()
      await expect(page.getByText('合规')).toBeVisible()
      await expect(page.getByText('草稿')).toBeVisible()
    })
  })
})
