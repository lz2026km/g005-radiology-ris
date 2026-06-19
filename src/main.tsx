// v3.0.6.8-10: Robust bootstrap - NO await on SW APIs that can hang
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './i18n/index.ts'

import './styles/animations.css'
import './styles/transitions.css'
import './styles/responsive.css'

const APP_VERSION = '3.0.6.8-10'
console.info(`[v${APP_VERSION}] === BOOT START ===`)
console.info(`[v${APP_VERSION}] Location:`, window.location.href)

// 完全 fire-and-forget,不 await 任何 SW API
// 不管 SW 状态如何,都要继续 React render
function nukeSWAndCacheInBackground(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  // 不 await getRegistrations() - 立即 fire-and-forget
  Promise.resolve()
    .then(() => navigator.serviceWorker.getRegistrations())
    .then((regs) => {
      if (regs && regs.length > 0) {
        console.info(`[v${APP_VERSION}] BG: cleaning ${regs.length} SWs`)
        regs.forEach((r) => r.unregister().catch(() => {}))
      }
    })
    .catch(() => {})

  // 同样 fire-and-forget 清缓存
  if ('caches' in window) {
    Promise.resolve()
      .then(() => caches.keys())
      .then((names) => {
        if (names && names.length > 0) {
          console.info(`[v${APP_VERSION}] BG: clearing ${names.length} caches`)
          names.forEach((n) => caches.delete(n).catch(() => {}))
        }
      })
      .catch(() => {})
  }
}

async function bootstrap(): Promise<void> {
  // 立即 dispatch 清理 (异步,后台运行)
  nukeSWAndCacheInBackground()

  // Phase 2: MSW - 不 await 启动 (即使失败也继续)
  console.info(`[v${APP_VERSION}] Phase 2: MSW (background)`)
  void (async () => {
    try {
      const { startMockBackend } = await import('./services/mockBackend/worker')
      await startMockBackend()
      console.info(`[v${APP_VERSION}] MSW started OK`)
    } catch (err) {
      console.warn(`[v${APP_VERSION}] MSW failed (fallback):`, err)
    }
  })()

  // Phase 3: 立即渲染 React
  console.info(`[v${APP_VERSION}] Phase 3: React render (immediate)`)
  const rootEl = document.getElementById('root')
  if (!rootEl) {
    console.error(`[v${APP_VERSION}] FATAL: no #root element`)
    return
  }

  // 清掉 loading placeholder
  const placeholder = document.getElementById('loading-placeholder')
  if (placeholder) placeholder.remove()

  try {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    console.info(`[v${APP_VERSION}] === BOOT DONE ===`)
  } catch (err) {
    console.error(`[v${APP_VERSION}] FATAL: React render failed:`, err)
  }
}

void bootstrap()