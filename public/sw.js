// v3.0.6.8-10: SOFT-EXIT Service Worker
// 仍然清理缓存,但不再强制 reload 页面 (这造成之前的无限循环)
// 这个 SW 完成清理后会自动 unregister

import { precacheAndRoute } from 'workbox-precaching'

try { precacheAndRoute(self.__WB_MANIFEST) } catch {}

const CACHE_PREFIX = 'ris-cache-'

self.addEventListener('install', (event) => {
  console.log('[SW v3.0.6.8-10] Installing - will clean caches and exit')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW v3.0.6.8-10] Activating - cleaning all caches')
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys()
        console.log('[SW v3.0.6.8-10] Deleting', cacheNames.length, 'caches')
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      } catch (err) {
        console.warn('[SW v3.0.6.8-10] Cache delete error:', err)
      }
      // 不再强制 reload 客户端,避免无限循环
      // SW 完成清理后自动 unregister
      try {
        await self.registration.unregister()
        console.log('[SW v3.0.6.8-10] Unregistered self - app will run without SW')
      } catch (err) {
        console.warn('[SW v3.0.6.8-10] Unregister error:', err)
      }
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  // 不拦截任何 fetch - 让浏览器走网络
  return
})