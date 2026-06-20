/**
 * G005 放射RIS系统 v3.0.6.8-19 — E2E: 报告书写
 * 注意: 需要使用 `npm run dev` (port 5191) 启动开发服务
 */
import { test, expect } from '@playwright/test'

test.describe('报告书写 V3', () => {
  test('页面基础结构加载', async ({ page }) => {
    // 设置认证态后加载页面
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      localStorage.setItem('ris_current_user', JSON.stringify({
        id: 'D001', name: '张明远', role: '医生', department: '放射科',
      }));
    })
    await page.goto('/reports/v3-write', { waitUntil: 'domcontentloaded', timeout: 30000 })
    // 等待 5 秒确保 React 有足够时间渲染
    await page.waitForTimeout(5000)
    // 如果还显示加载中，再多等一会儿
    try {
      await expect(page.getByText('报告书写').first()).toBeVisible({ timeout: 15000 })
    } catch {
      // 尝试再次设置 auth（如果被重定向）
      await page.evaluate(() => {
        localStorage.setItem('ris_current_user', JSON.stringify({
          id: 'D001', name: '张明远', role: '医生', department: '放射科',
        }));
      })
      await page.goto('/reports/v3-write', { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(5000)
      await expect(page.getByText('报告书写').first()).toBeVisible({ timeout: 15000 })
    }
  })

  test('右侧 AI 草稿和语音 Tab 存在', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      localStorage.setItem('ris_current_user', JSON.stringify({
        id: 'D001', name: '张明远', role: '医生', department: '放射科',
      }));
    })
    await page.goto('/reports/v3-write', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(5000)
    try {
      await expect(page.getByText('AI 草稿').first()).toBeVisible({ timeout: 15000 })
    } catch {
      await page.evaluate(() => {
        localStorage.setItem('ris_current_user', JSON.stringify({
          id: 'D001', name: '张明远', role: '医生', department: '放射科',
        }));
      })
      await page.goto('/reports/v3-write', { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(8000)
      await expect(page.getByText('AI 草稿').first()).toBeVisible({ timeout: 15000 })
    }
  })
})
