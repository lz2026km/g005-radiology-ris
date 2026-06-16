export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only'

export interface CacheRoute {
  pattern: RegExp
  strategy: CacheStrategy
  maxAge?: number
  maxEntries?: number
}

const DEFAULT_ROUTES: CacheRoute[] = [
  { pattern: /^\/api\/v1\/worklist/, strategy: 'stale-while-revalidate', maxAge: 300000 },
  { pattern: /^\/api\/v1\/patients/, strategy: 'cache-first', maxAge: 600000 },
  { pattern: /^\/api\/v1\/reports/, strategy: 'network-first', maxAge: 300000 },
  { pattern: /^\/dicom\//, strategy: 'cache-first', maxAge: 86400000, maxEntries: 200 },
  { pattern: /^\/static\//, strategy: 'cache-first', maxAge: 604800000 },
  { pattern: /^\/api\/v1\/auth/, strategy: 'network-only' },
]

const CACHE_NAME = 'g005-cache-v1'
const STATIC_CACHE = 'g005-static-v1'

class ServiceWorkerManager {
  private routes: CacheRoute[]
  private registration: ServiceWorkerRegistration | null = null

  constructor(routes: CacheRoute[] = DEFAULT_ROUTES) {
    this.routes = routes
  }

  async register(swUrl = '/service-worker.js'): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null
    try {
      this.registration = await navigator.serviceWorker.register(swUrl, { scope: '/' })
      return this.registration
    } catch {
      return null
    }
  }

  async unregister(): Promise<boolean> {
    if (this.registration) {
      return this.registration.unregister()
    }
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const reg of registrations) {
      await reg.unregister()
    }
    return true
  }

  getRoutes(): CacheRoute[] {
    return [...this.routes]
  }

  addRoute(route: CacheRoute): void {
    this.routes.push(route)
  }

  async getCachedResponse(request: Request): Promise<Response | undefined> {
    const cache = await caches.open(CACHE_NAME)
    return cache.match(request)
  }

  async precacheStaticAssets(assets: string[]): Promise<void> {
    const cache = await caches.open(STATIC_CACHE)
    await cache.addAll(assets)
  }

  async clearAllCaches(): Promise<void> {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => k.startsWith('g005-')).map(k => caches.delete(k)))
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }
}

export const swManager = new ServiceWorkerManager()

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  return swManager.register()
}
