export interface AppUpdateInfo {
  available: boolean
  version?: string
  releaseDate?: string
  changelog?: string
  size?: number
}

type UpdateListener = (info: AppUpdateInfo) => void

class UpdateService {
  private listeners: UpdateListener[] = []
  private updateInfo: AppUpdateInfo = { available: false }
  private checkInterval: ReturnType<typeof setInterval> | null = null
  private registration: ServiceWorkerRegistration | null = null

  async initialize(): Promise<void> {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        this.registration = reg
        reg.onupdatefound = () => {
          const installingWorker = reg.installing
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateInfo = { available: true }
                this.notifyListeners()
              }
            }
          }
        }
      })
    }
  }

  onUpdateAvailable(listener: UpdateListener): () => void {
    this.listeners.push(listener)
    if (this.updateInfo.available) {
      listener(this.updateInfo)
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.updateInfo)
    }
  }

  getUpdateInfo(): AppUpdateInfo {
    return { ...this.updateInfo }
  }

  async checkForUpdates(): Promise<AppUpdateInfo> {
    if (this.registration) {
      await this.registration.update()
    }
    return this.getUpdateInfo()
  }

  async applyUpdate(): Promise<boolean> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
      return true
    }
    return false
  }

  setUpdateInfo(info: AppUpdateInfo): void {
    this.updateInfo = info
    this.notifyListeners()
  }

  startPeriodicCheck(intervalMs = 3600000): void {
    this.stopPeriodicCheck()
    this.checkInterval = setInterval(() => this.checkForUpdates(), intervalMs)
  }

  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  setRegistration(reg: ServiceWorkerRegistration): void {
    this.registration = reg
  }
}

export const updateService = new UpdateService()
