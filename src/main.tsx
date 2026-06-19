// v3.0.6.8-5: KILL-SWITCH - 在所有 JS 执行前立即清理
// 这一段必须在 React/Vite/任何模块加载之前执行
// 直接内联到 index.html 或作为第一个 import

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 初始化 i18n
import './i18n/index.ts'

import './styles/animations.css'
import './styles/transitions.css'
import './styles/responsive.css'

// v3.0.6.8-5: 终极清理 - 解决用户浏览器被旧 SW 拦截的问题
async function nukeOldServiceWorkers(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  try {
    // 1. 注销所有 SW
    const regs = await navigator.serviceWorker.getRegistrations()
    for (const r of regs) {
      try {
        await r.unregister()
      } catch {}
    }

    // 2. 删除所有缓存
    if ('caches' in window) {
      const names = await caches.keys()
      await Promise.all(names.map((n) => caches.delete(n).catch(() => {})))
    }

    // 3. 监听 KILL_SWITCH_RELOAD 消息 - 收到后强制刷新
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.type === 'KILL_SWITCH_RELOAD') {
        window.location.reload()
      }
    })

    // 4. 如果有 controller, 等 1 秒让 SW 发送 KILL_SWITCH_RELOAD
    if (navigator.serviceWorker.controller) {
      // SW 已经接管, 它会自我 unregister 并通知 reload
      // 这里等一下, 然后如果还没收到 reload 消息, 主动刷新一次
      setTimeout(() => {
        if (navigator.serviceWorker.controller) {
          window.location.reload()
        }
      }, 1500)
    }
  } catch (err) {
    // 忽略错误, 继续加载 app
  }
}

async function bootstrap(): Promise<void> {
  // 第一件事: 清理所有旧 SW 和缓存
  await nukeOldServiceWorkers()

  // 启动 MSW Mock 后端
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