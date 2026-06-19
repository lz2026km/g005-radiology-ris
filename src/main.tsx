// v3.0.6.8-5: KILL-SWITCH + Aggressive cleanup + Comprehensive diagnostics
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 初始化 i18n
import './i18n/index.ts'

import './styles/animations.css'
import './styles/transitions.css'
import './styles/responsive.css'

const APP_VERSION = '3.0.6.8-5'
console.info(`[v${APP_VERSION}] === BOOT START ===`)
console.info(`[v${APP_VERSION}] Location:`, window.location.href)
console.info(`[v${APP_VERSION}] User Agent:`, navigator.userAgent)

// Kill-switch: 在 React 启动前,先清理所有旧 SW 和缓存
async function nukeOldServiceWorkers(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  console.info(`[v${APP_VERSION}] Cleaning up old service workers...`)
  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    console.info(`[v${APP_VERSION}] Found`, regs.length, 'SW registrations')
    for (const r of regs) {
      try {
        await r.unregister()
        console.info(`[v${APP_VERSION}] Unregistered:`, r.scope)
      } catch (err) {
        console.warn(`[v${APP_VERSION}] Failed to unregister SW:`, err)
      }
    }

    if ('caches' in window) {
      const names = await caches.keys()
      console.info(`[v${APP_VERSION}] Found`, names.length, 'caches:', names)
      await Promise.all(names.map((n) => caches.delete(n).catch(() => {})))
      console.info(`[v${APP_VERSION}] All caches deleted`)
    }

    // 监听 SW 发的 KILL_SWITCH_RELOAD 消息
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.type === 'KILL_SWITCH_RELOAD') {
        console.info(`[v${APP_VERSION}] KILL_SWITCH_RELOAD received - reloading page`)
        window.location.reload()
      }
    })

    // 如果旧 SW 还是 controller, 等 1.5s 让它执行 unregister + reload
    if (navigator.serviceWorker.controller) {
      console.info(`[v${APP_VERSION}] Old SW still controlling - waiting for reload...`)
      setTimeout(() => {
        if (navigator.serviceWorker.controller) {
          console.warn(`[v${APP_VERSION}] Old SW still active after 1.5s, forcing reload`)
          window.location.reload()
        }
      }, 1500)
    }
  } catch (err) {
    console.warn(`[v${APP_VERSION}] SW cleanup failed:`, err)
  }
}

async function bootstrap(): Promise<void> {
  console.info(`[v${APP_VERSION}] Phase 1: Cleanup`)
  await nukeOldServiceWorkers()

  console.info(`[v${APP_VERSION}] Phase 2: MSW (best effort)`)
  try {
    const { startMockBackend } = await import('./services/mockBackend/worker')
    await startMockBackend()
    console.info(`[v${APP_VERSION}] MSW started OK`)
  } catch (err) {
    console.warn(`[v${APP_VERSION}] MSW failed to start (will use initial data fallback):`, err)
  }

  console.info(`[v${APP_VERSION}] Phase 3: React render`)
  try {
    const rootEl = document.getElementById('root')
    if (!rootEl) {
      throw new Error('Root element #root not found in DOM')
    }
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    console.info(`[v${APP_VERSION}] === BOOT DONE in ${Date.now() - (window.__bootStart || 0)}ms ===`)
  } catch (err) {
    console.error(`[v${APP_VERSION}] FATAL: React render failed:`, err)
    throw err
  }
}

void bootstrap().catch((err) => {
  console.error(`[v${APP_VERSION}] Bootstrap fatal error:`, err)
  const root = document.getElementById('root')
  if (root && !root.dataset.errorRendered) {
    root.dataset.errorRendered = '1'
    root.innerHTML = '<div style="max-width:800px;margin:40px auto;padding:24px;font-family:monospace;background:#1e293b;color:#f1f5f9;border-radius:8px"><h2 style="color:#ef4444">⚠ ' +
      APP_VERSION + ' 启动失败</h2><pre style="white-space:pre-wrap">' + (err?.stack || err?.message || String(err)) + '</pre><button onclick="location.reload()" style="padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer">刷新</button></div>'
  }
})