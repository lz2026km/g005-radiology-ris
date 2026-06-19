// KILL-SWITCH Service Worker - G005 放射RIS系统 v3.0.6.8-5
// 此 SW 在 install 时立即:
//   1. 删除所有缓存
//   2. unregister 自己
//   3. 通知所有 clients 强制刷新
//
// 目的: 解决用户浏览器被旧 SW (v3.0.6.8-3) 拦截,无法加载新版本的问题
// 部署后,首次访问会清理所有 SW 和缓存,以后此 SW 会被浏览器自动 unregister

import { precacheAndRoute } from 'workbox-precaching'

// 仍然需要这个 import 让 vite-plugin-pwa 能正确编译
// 但实际上 precacheAndRoute 不做任何事因为我们立刻 unregister
try { precacheAndRoute(self.__WB_MANIFEST) } catch {}

self.addEventListener('install', (event) => {
  console.log('[SW KILL-SWITCH v3.0.6.8-5] Installing - will self-destruct')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW KILL-SWITCH v3.0.6.8-5] Activating - clearing all caches')
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys()
        console.log('[SW KILL-SWITCH v3.0.6.8-5] Deleting', cacheNames.length, 'caches:', cacheNames)
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      } catch (err) {
        console.warn('[SW KILL-SWITCH v3.0.6.8-5] Cache delete error:', err)
      }

      try {
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        console.log('[SW KILL-SWITCH v3.0.6.8-5] Notifying', clients.length, 'clients to reload')
        for (const client of clients) {
          client.postMessage({ type: 'KILL_SWITCH_RELOAD' })
        }
      } catch (err) {
        console.warn('[SW KILL-SWITCH v3.0.6.8-5] Client notify error:', err)
      }

      try {
        await self.registration.unregister()
        console.log('[SW KILL-SWITCH v3.0.6.8-5] Unregistered self')
      } catch (err) {
        console.warn('[SW KILL-SWITCH v3.0.6.8-5] Unregister error:', err)
      }

      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  return
})