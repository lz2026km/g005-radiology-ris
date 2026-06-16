export interface SyncTask {
  id: string
  type: string
  payload: unknown
  priority: 'high' | 'normal' | 'low'
  createdAt: number
  retries: number
  maxRetries: number
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'pending'

class SyncManager {
  private queue: SyncTask[] = []
  private status: SyncStatus = 'idle'
  private syncInProgress = false
  private listeners: Array<(status: SyncStatus) => void> = []
  private periodicInterval: ReturnType<typeof setInterval> | null = null

  getStatus(): SyncStatus {
    return this.status
  }

  onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.status)
    }
  }

  async enqueue(task: Omit<SyncTask, 'id' | 'createdAt' | 'retries'>): Promise<string> {
    const id = `sync-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    this.queue.push({
      ...task,
      id,
      createdAt: Date.now(),
      retries: 0,
    })
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    if (!this.syncInProgress) {
      this.syncInProgress = true
      setTimeout(() => this.processQueue(), 100)
    }
    return id
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.syncInProgress = false
      return
    }
    this.status = 'syncing'
    this.notifyListeners()

    const task = this.queue[0]
    try {
      await this.executeTask(task)
      this.queue.shift()
    } catch {
      task.retries++
      if (task.retries >= task.maxRetries) {
        this.queue.shift()
      } else {
        this.queue.push(this.queue.shift()!)
      }
      this.status = 'error'
      this.notifyListeners()
    }

    await this.processQueue()
    if (this.queue.length === 0) {
      this.status = 'idle'
      this.notifyListeners()
    }
  }

  private async executeTask(task: SyncTask): Promise<void> {
    switch (task.type) {
      case 'submit-report':
        await fetch('/api/v1/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task.payload) })
        break
      case 'update-exam-status':
        await fetch(`/api/v1/exams/${(task.payload as any).id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task.payload) })
        break
      case 'sync-worklist':
        await fetch('/api/v1/worklist/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task.payload) })
        break
      default:
        await fetch(`/api/v1/sync/${task.type}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task.payload) })
    }
  }

  getQueueLength(): number {
    return this.queue.length
  }

  clearQueue(): void {
    this.queue = []
  }

  startPeriodicSync(intervalMs = 300000): void {
    if (this.periodicInterval) return
    this.periodicInterval = setInterval(async () => {
      if (this.queue.length > 0 && !this.syncInProgress) {
        this.syncInProgress = true
        await this.processQueue()
      }
    }, intervalMs)
  }

  stopPeriodicSync(): void {
    if (this.periodicInterval) {
      clearInterval(this.periodicInterval)
      this.periodicInterval = null
    }
  }

  async requestBackgroundSync(): Promise<boolean> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register('g005-sync')
        return true
      } catch {
        return false
      }
    }
    return false
  }
}

export const syncManager = new SyncManager()
