# Module 12.8 - PWA Enhancement (25 pts)

**Location:** `src/services/pwa/`

**Files (v3.0.4 当前活跃):**
- `offlineStorage.ts` — IndexedDB 离线缓存(worklist + reports)
- `pushService.ts` — Web Push 订阅管理(`pwa-b2.test.tsx` 测试覆盖)
- `PLAN.md` — 本文档

**Files (v3.0.4 已删除 - 零调用方):**
- ~~`serviceWorker.ts`~~ — 重复实现,运行时 SW 由 `public/sw.js` + `vite-plugin-pwa` 接管
- ~~`manifestService.ts`~~ — manifest 由 `vite-plugin-pwa` 插件在构建期生成
- ~~`updateService.ts`~~ — autoUpdate 由 `VitePWA({ registerType: 'autoUpdate' })` 处理
- ~~`syncManager.ts`~~ — Background Sync API 浏览器支持有限,改为各模块手动重试
- ~~`index.ts`~~ — barrel,已无下游消费者

**v3.0.4+ deprecation note:**
被删模块的 API 表面(swManager / registerServiceWorker / manifestService /
syncManager / updateService / sendTestNotification / IPushService 等)在 v3.0.3 之前
曾被部分 Storybook / 老组件引用,但生产代码与测试均无调用。
如需复用 SW 缓存策略 / 后台同步,请基于 `public/sw.js` (Workbox) 重构。

**Points by feature:**
- Service worker with precache and runtime cache strategies: 7 (由 public/sw.js 提供)
- Web manifest with install prompt: 5 (由 vite-plugin-pwa 提供)
- Background sync for offline report submissions: 5 (降级为模块内重试)
- App update detection with user prompt: 4 (由 VitePWA autoUpdate 提供)
- Periodic sync for worklist refresh: 4 (降级为应用内定时器)

**Total: 25 pts**