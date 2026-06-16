export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'VIEW_PATIENT' | 'VIEW_REPORT'
  | 'CREATE_REPORT' | 'UPDATE_REPORT' | 'SIGN_REPORT'
  | 'VIEW_IMAGE' | 'EXPORT_DATA' | 'DELETE_DATA'
  | 'ACCESS_DENIED' | 'CONFIG_CHANGE'

export interface AuditEntry {
  id: string
  timestamp: number
  userId: string
  userName: string
  action: AuditAction
  resourceType: string
  resourceId: string
  detail?: string
  ipAddress?: string
  userAgent?: string
}

class AuditService {
  private entries: AuditEntry[] = []
  private readonly maxEntries = 5000

  async log(action: AuditAction, resourceType: string, resourceId: string, detail?: string): Promise<void> {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      userId: 'current-user-id',
      userName: 'current-user',
      action,
      resourceType,
      resourceId,
      detail,
      ipAddress: window.location.hostname,
      userAgent: navigator.userAgent,
    }
    this.entries.push(entry)
    if (this.entries.length > this.maxEntries) {
      this.entries.shift()
    }
    try {
      await fetch('/api/v1/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    } catch {
      this.entries.push({ ...entry, id: `${entry.id}-offline` })
    }
  }

  async query(options: { userId?: string; action?: AuditAction; resourceType?: string; from?: number; to?: number; limit?: number }): Promise<AuditEntry[]> {
    let results = [...this.entries]
    if (options.userId) results = results.filter(e => e.userId === options.userId)
    if (options.action) results = results.filter(e => e.action === options.action)
    if (options.resourceType) results = results.filter(e => e.resourceType === options.resourceType)
    if (options.from) results = results.filter(e => e.timestamp >= options.from!)
    if (options.to) results = results.filter(e => e.timestamp <= options.to!)
    results.sort((a, b) => b.timestamp - a.timestamp)
    return results.slice(0, options.limit || 100)
  }

  getRecent(count = 20): AuditEntry[] {
    return this.entries.slice(-count).reverse()
  }
}

export const auditService = new AuditService()
