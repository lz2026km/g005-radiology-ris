/**
 * G005 眼科模块 - Playwright 内置 webServer 自测
 * 跑这个文件就会自动启动服务+测试
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: /eye-verify\.spec\.ts$/,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5199/g005-radiology-ris',
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --port 5199 --host 127.0.0.1',
    cwd: 'E:\\opencode work\\FS\\G005-RISv-3.0.0',
    url: 'http://127.0.0.1:5199/',
    reuseExistingServer: false,
    timeout: 30000,
  },
  reporter: 'list',
});
