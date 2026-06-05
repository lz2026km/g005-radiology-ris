// P10: Service Worker静态资源CDN缓存
// 放射RIS系统离线缓存策略

const CACHE_NAME = 'ris-cache-v2'
const STATIC_ASSETS = [
  '/',
  '/index.html',
]

// 静态资源缓存策略：Cache-First（优先缓存）
const STATIC_CACHE_PATTERNS = [
  /\.(js|css|woff2?|ttf|eot)$/,
  /\.(png|jpg|jpeg|gif|svg|ico)$/,
  /\.(wasm|map)$/,
]

// CDN资源（长缓存）
const CDN_CACHE_PATTERNS = [
  /cdn\.jsdelivr\.net/,
  /cdnjs\.cloudflare\.com/,
  /unpkg\.com/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
]

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache opened')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  self.clients.claim()
})

// 工具：安全缓存 + 返回（避免 Response body 复用问题）
function putAndReturn(response, request) {
  if (response && response.ok) {
    // 克隆用于缓存，原 response 用于返回
    const cloned = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 跳过非GET请求
  if (request.method !== 'GET') return

  // 跳过chrome-extension和chrome://协议
  if (url.protocol === 'chrome-extension:' || url.protocol === 'chrome:') return

  // 跳过 modulepreload（Vite 自动生成，避免 SW 与浏览器缓存冲突）
  if (request.destination === 'script' && event.request.headers.get('purpose') === 'preload') {
    return;
  }

  // CDN资源：Stale-While-Revalidate
  if (CDN_CACHE_PATTERNS.some((pattern) => pattern.test(url.href))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // 后台更新（不 await 错误）
          fetch(request).then((resp) => putAndReturn(resp, request)).catch(() => {});
          return cached;
        }
        return fetch(request).then((response) => putAndReturn(response, request));
      })
    )
    return
  }

  // 静态资源：Stale-While-Revalidate
  if (STATIC_CACHE_PATTERNS.some((pattern) => pattern.test(url.href))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const promise = fetch(request).then((response) => putAndReturn(response, request));
        return cached || promise;
      })
    )
    return
  }

  // API请求：Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => putAndReturn(response, request))
        .catch(() => caches.match(request))
    )
    return
  }

  // 页面：Network-First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => putAndReturn(response, request))
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    )
    return
  }
})
