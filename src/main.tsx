// v3.0.6.8-8: Fixed infinite reload loop + better diagnostics
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './i18n/index.ts'

import './styles/animations.css'
import './styles/transitions.css'
import './styles/responsive.css'

const APP_VERSION = '3.0.6.8-9'
console.info(`[v${APP_VERSION}] === BOOT START ===`)
console.info(`[v${APP_VERSION}] Location:`, window.location.href)

// 在 boot 时只清理一次,不要 KILL-SWITCH_RELOAD 触发 reload
// 因为 SW 会自我 unregister,下一次访问就不会有 SW 了
async function cleanupOnce(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  // 用 Promise.race 加超时,避免 cleanup 永远卡住
  const timeout = (ms: number) => new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms)
  )

  try {
    const cleanupPromise = (async () => {
      const regs = await navigator.serviceWorker.getRegistrations()
      if (regs.length === 0) return
      console.info(`[v${APP_VERSION}] Unregistering`, regs.length, 'SWs (fire-and-forget)')
      // 不要 await unregister() — 让它后台执行
      regs.forEach((r) => {
        r.unregister().catch(() => {})
      })

      if ('caches' in window) {
        try {
          const names = await caches.keys()
          if (names.length > 0) {
            console.info(`[v${APP_VERSION}] Deleting`, names.length, 'caches (fire-and-forget)')
            names.forEach((n) => {
              caches.delete(n).catch(() => {})
            })
          }
        } catch {}
      }
    })()

    await Promise.race([cleanupPromise, timeout(2000)])
    console.info(`[v${APP_VERSION}] Cleanup dispatched. Continuing to MSW.`)
  } catch (err) {
    console.warn(`[v${APP_VERSION}] SW cleanup error (ignored):`, err)
  }
}

async function bootstrap(): Promise<void> {
  console.info(`[v${APP_VERSION}] Phase 1: Cleanup (one-time)`)
  await cleanupOnce()

  console.info(`[v${APP_VERSION}] Phase 2: MSW (best effort)`)
  try {
    const { startMockBackend } = await import('./services/mockBackend/worker')
    await startMockBackend()
    console.info(`[v${APP_VERSION}] MSW started OK`)
  } catch (err) {
    console.warn(`[v${APP_VERSION}] MSW failed (will use initial data fallback):`, err)
  }

  console.info(`[v${APP_VERSION}] Phase 3: React render`)
  try {
    const rootEl = document.getElementById('root')
    if (!rootEl) throw new Error('Root element #root not found')

    // 清掉 loading placeholder
    const placeholder = document.getElementById('loading-placeholder')
    if (placeholder) placeholder.remove()

    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    console.info(`[v${APP_VERSION}] === BOOT DONE ===`)
  } catch (err) {
    console.error(`[v${APP_VERSION}] FATAL: React render failed:`, err)
    throw err
  }
}

void bootstrap().catch((err) => {
  console.error(`[v${APP_VERSION}] Bootstrap fatal error:`, err)
})