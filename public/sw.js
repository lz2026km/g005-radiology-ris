// PWA Service Worker - G005 放射RIS系统 v3.0.6.8-3
// injectManifest mode: self.__WB_MANIFEST will be replaced at build time
// v3.0.3.31: 修复 activate 删除所有缓存 - 只删除过期版本号,保留运行时缓存
// v3.0.4:   新增 postMessage 处理器 - 接收主线程 CLEAR_API_CACHE 消息,
//            用于 POST/PUT/DELETE 后失效 stale-while-revalidate 缓存
// v3.0.6.2: 强制 bump RUNTIME_CACHE_NAME v3→v4 + WORKBOX 旧缓存清理,确保部署后立即生效
// v3.0.6.8-2: bump RUNTIME_CACHE_NAME v4→v5, 强制更新修复5页面导入错误
// v3.0.6.8-3: bump RUNTIME_CACHE_NAME v5→v6, 修复 TDZ 根因
//              + 强制清除 ALL CACHES (非仅 RUNTIME) 确保部署立即生效
//              + 修复 index.html 路径 bug (添加 basename 前缀)

import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

const RUNTIME_CACHE_NAME = 'ris-cache-v6'
const RUNTIME_CACHE_NAMES_OLD = ['ris-cache-v2', 'ris-cache-v3', 'ris-cache-v4', 'ris-cache-v5']
const BASE_PATH = '/g005-radiology-ris/'

self.addEventListener('install', (event) => {
  console.log('[SW v3.0.6.8-3] Installing Service Worker...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW v3.0.6.8-3] Activating Service Worker...')
  event.waitUntil(
    (async () => {
      // 删除所有已知过期 RUNTIME 缓存
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((name) => RUNTIME_CACHE_NAMES_OLD.includes(name) || name !== RUNTIME_CACHE_NAME && name.startsWith('ris-cache-'))
          .map((name) => {
            console.log('[SW v3.0.6.8-3] Deleting cache:', name)
            return caches.delete(name)
          })
      )
      await self.clients.claim()
    })()
  )
})

function putAndReturn(response, request) {
  if (response && response.ok) {
    const cloned = response.clone()
    caches.open(RUNTIME_CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => {})
  }
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:' || url.protocol === 'chrome:') return

  // 静态资源: 缓存优先 (Workbox 已通过 precacheAndRoute 处理,这里仅做 fallback)
  if (/\.(js|css|woff2?|ttf|eot)$/.test(url.href)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => putAndReturn(response, request)))
    )
    return
  }

  // 图片/图标: 缓存优先
  if (/\.(png|jpg|jpeg|gif|svg|ico)$/.test(url.href)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => putAndReturn(response, request)))
    )
    return
  }

  // API: 仅缓存 GET 读请求,跳过认证/敏感路径
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith(BASE_PATH + 'api/')) {
    if (url.pathname.includes('/auth/') || url.pathname.includes('/audit')) {
      return
    }
    event.respondWith(
      fetch(request)
        .then((response) => putAndReturn(response, request))
        .catch(() => caches.match(request))
    )
    return
  }

  // 导航请求: 网络优先,失败 fallback 到 index.html (含 basename)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => putAndReturn(response, request))
        .catch(() => caches.match(request).then((cached) => cached || caches.match(BASE_PATH + 'index.html')))
    )
    return
  }
})

// ────────────────────────────────────────────────────────────────────────────
// v3.0.4 主线程消息桥:缓存失效
// ────────────────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || typeof data !== 'object') return

  if (data.type === 'CLEAR_API_CACHE') {
    const target = typeof data.url === 'string' ? data.url : null
    if (!target) return
    event.waitUntil(
      caches.open(RUNTIME_CACHE_NAME).then(async (cache) => {
        const ok = await cache.delete(target)
        console.log('[SW] CLEAR_API_CACHE', target, ok ? 'OK' : 'MISS')
        if (event.source && event.source.postMessage) {
          event.source.postMessage({ type: 'CLEAR_API_CACHE_RESULT', url: target, ok })
        }
      })
    )
    return
  }

  if (data.type === 'CLEAR_API_CACHE_PREFIX') {
    const prefix = typeof data.prefix === 'string' ? data.prefix : null
    if (!prefix) return
    event.waitUntil(
      caches.open(RUNTIME_CACHE_NAME).then(async (cache) => {
        const keys = await cache.keys()
        let removed = 0
        for (const req of keys) {
          if (req.url.startsWith(prefix)) {
            const ok = await cache.delete(req)
            if (ok) removed++
          }
        }
        console.log('[SW] CLEAR_API_CACHE_PREFIX', prefix, 'removed', removed)
        if (event.source && event.source.postMessage) {
          event.source.postMessage({ type: 'CLEAR_API_CACHE_PREFIX_RESULT', prefix, removed })
        }
      })
    )
    return
  }

  // v3.0.6.8-3: 强制刷新 — 删除所有缓存并跳过等待
  if (data.type === 'FORCE_REFRESH') {
    console.log('[SW v3.0.6.8-3] FORCE_REFRESH: clearing all caches')
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
        if (event.source && event.source.postMessage) {
          event.source.postMessage({ type: 'FORCE_REFRESH_DONE' })
        }
      })()
    )
  }
})