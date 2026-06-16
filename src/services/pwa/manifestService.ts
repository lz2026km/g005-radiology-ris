export interface WebManifest {
  name: string
  short_name: string
  description: string
  start_url: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  orientation?: 'any' | 'natural' | 'portrait' | 'landscape'
  theme_color: string
  background_color: string
  icons: Array<{ src: string; sizes: string; type: string; purpose?: string }>
  categories?: string[]
  iarc_rating_id?: string
  prefer_related_applications?: boolean
}

const DEFAULT_MANIFEST: WebManifest = {
  name: 'G005 放射科RIS系统',
  short_name: 'G005 RIS',
  description: '放射科放射信息系统 - 移动工作站',
  start_url: '/mobile/',
  display: 'standalone',
  orientation: 'portrait',
  theme_color: '#1e3a5f',
  background_color: '#f8fafc',
  icons: [
    { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    { src: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
    { src: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
  ],
  categories: ['medical', 'healthcare', 'productivity'],
}

class ManifestService {
  private manifest: WebManifest = DEFAULT_MANIFEST
  private deferredPrompt: Event | null = null

  getManifest(): WebManifest {
    return { ...this.manifest }
  }

  updateManifest(updates: Partial<WebManifest>): void {
    this.manifest = { ...this.manifest, ...updates }
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
    if (link) {
      link.href = `/manifest.json?t=${Date.now()}`
    }
  }

  async injectManifest(): Promise<void> {
    const blob = new Blob([JSON.stringify(this.manifest)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('link')
    link.rel = 'manifest'
    link.href = url
    document.head.appendChild(link)
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false
    const prompt = this.deferredPrompt as any
    prompt.prompt()
    const result = await prompt.userChoice
    this.deferredPrompt = null
    return result.outcome === 'accepted'
  }

  listenForInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
    })
  }

  checkInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches
  }
}

export const manifestService = new ManifestService()
