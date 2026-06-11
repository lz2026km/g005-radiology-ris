import type { ComplianceReport, ComplianceCheckItem, IComplianceProvider } from './types'
import { MockComplianceProvider } from './MockComplianceProvider'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export class BackendComplianceProvider implements IComplianceProvider {
  private mock = new MockComplianceProvider()

  async getReport(): Promise<ComplianceReport> {
    try {
      const res = await fetch(`${API_BASE}/compliance/report`, {
        headers: this.getHeaders(),
      })
      if (!res.ok) throw new Error('API unavailable')
      const data = await res.json()
      return data as ComplianceReport
    } catch {
      return this.mock.getReport()
    }
  }

  async checkItem(id: string): Promise<ComplianceCheckItem> {
    try {
      const items = (await this.getReport()).items
      const item = items.find((i) => i.id === id)
      if (!item) throw new Error('Item not found')
      return item
    } catch {
      return this.mock.checkItem(id)
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = localStorage.getItem('g005.auth.token')
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }
}
