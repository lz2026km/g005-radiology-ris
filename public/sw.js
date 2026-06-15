// PWA Service Worker - G005 放射RIS系统 v3.0.2.3
// injectManifest mode: self.__WB_MANIFEST will be replaced at build time

import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

const CACHE_NAME = 'ris-cache-v3'

const STATIC_CACHE_PATTERNS = [
  /\.(js|css|woff2?|ttf|eot)$/,
  /\.(png|jpg|jpeg|gif|svg|ico)$/,
  /\.(wasm|map)$/,
]

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .map((name) => {
            console.log('[SW] Deleting cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  self.clients.claim()
})

function putAndReturn(response, request) {
  if (response && response.ok) {
    const cloned = response.clone()
    caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => {})
  }
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:' || url.protocol === 'chrome:') return

  if (STATIC_CACHE_PATTERNS.some((pattern) => pattern.test(url.href))) {
    event.respondWith(
      fetch(request)
        .then((response) => putAndReturn(response, request))
        .catch(() => caches.match(request))
    )
    return
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => putAndReturn(response, request))
        .catch(() => caches.match(request))
    )
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => putAndReturn(response, request))
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    )
    return
  }
})
