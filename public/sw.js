// v3.0.6.8-14: DISABLED Service Worker (simple, no PWA features)
// 重要: 不要 unregister self!
// 这会破坏 MSW 的 mockServiceWorker.js
// 完全 no-op,只 claim clients,不干预任何 fetch
// 让 MSW 的 mockServiceWorker.js 接管 API 拦截

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  return
})
