/**
 * G005 放射RIS系统 v3.0.0 - Playwright E2E 配置
 * Phase T1-W2: E2E 测试基础
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: process.env['CI']
    ? {
        command: 'pnpm build && pnpm preview --port 4173',
        url: 'http://localhost:4173',
        timeout: 120 * 1000,
        reuseExistingServer: false,
      }
    : undefined,
});
