import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 初始化 i18n
import './i18n/index.ts'

import './styles/animations.css'
import './styles/transitions.css'
import './styles/responsive.css'

// v3.0.6.8-3: 自动清理旧 Service Worker 和缓存
// 解决用户浏览器被旧版本 SW 拦截而无法加载新版本的问题
async function cleanupOldServiceWorkers(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const reg of registrations) {
      // 注销所有旧版本 SW
      const ok = await reg.unregister()
      console.info(`[v3.0.6.8-3] Unregistered SW (${reg.scope}):`, ok)
    }

    // 清理所有缓存
    if ('caches' in window) {
      const names = await caches.keys()
      await Promise.all(
        names
          .filter((n) => n.startsWith('ris-cache-') && n !== 'ris-cache-v6')
          .map((n) => caches.delete(n))
      )
      console.info(`[v3.0.6.8-3] Cleaned ${names.length} old caches`)
    }
  } catch (err) {
    console.warn('[v3.0.6.8-3] SW cleanup failed:', err)
  }
}

async function bootstrap(): Promise<void> {
  // 先清理旧 SW
  await cleanupOldServiceWorkers()

  // 启动 MSW Mock 后端(生产模式也需要,因无真实后端API)
  try {
    const { startMockBackend } = await import('./services/mockBackend/worker')
    await startMockBackend()
  } catch (err) {
    console.warn('[MSW] Mock backend failed to start, using initial data fallback.', err)
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

void bootstrap()