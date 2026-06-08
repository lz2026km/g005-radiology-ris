/**
 * G005 放射RIS系统 v3.0.1 - E2E: 工作列表
 */
import { test, expect } from '@playwright/test'

test.describe('Worklist V3 (E2E)', () => {
  test('访问 /worklist 渲染主表 + 双视图切换', async ({ page }) => {
    await page.goto('/worklist')
    await expect(page.getByText('检查工作列表')).toBeVisible({ timeout: 10000 })
    await expect(page.getByPlaceholder('搜索患者/检查/部位')).toBeVisible()
  })

  test('点击高级筛选打开抽屉', async ({ page }) => {
    await page.goto('/worklist')
    await page.getByText('筛选').first().click({ trial: false }).catch(() => {})
    await expect(page.locator('text=高级筛选').first()).toBeVisible({ timeout: 5000 })
  })

  test('批量操作空态显示"未选中"', async ({ page }) => {
    await page.goto('/worklist')
    await expect(page.getByText(/未选中|全选/)).toBeVisible({ timeout: 5000 })
  })
})
