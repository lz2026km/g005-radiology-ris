import { create } from 'zustand'
import { criticalApi, examApi } from '../services/api'

interface CriticalValue {
  id: string
  patientName: string
  finding: string
  severity: string
  status: 'pending' | 'notified' | 'acknowledged' | 'resolved'
  triggeredAt: string
  notifiedAt?: string
  acknowledgedAt?: string
  resolvedAt?: string
}

interface CriticalState {
  values: CriticalValue[]
  loading: boolean
  error: string | null
  load: () => Promise<void>
  acknowledge: (id: string) => Promise<void>
  resolve: (id: string) => Promise<void>
  notify: (id: string) => Promise<void>
}

export const useCriticalStore = create<CriticalState>((set) => ({
  values: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true })
    const res = await criticalApi.list()
    if (res.success && Array.isArray(res.data)) {
      set({ values: res.data as CriticalValue[], loading: false, error: null })
    } else {
      set({ loading: false, error: res.error?.message ?? '加载失败' })
    }
  },

  acknowledge: async (id) => {
    const res = await criticalApi.acknowledge(id)
    if (res.success) {
      set((s) => ({
        values: s.values.map((v) =>
          v.id === id ? { ...v, status: 'acknowledged' as const, acknowledgedAt: new Date().toISOString() } : v
        ),
      }))
    }
  },

  resolve: async (id) => {
    const res = await criticalApi.resolve(id)
    if (res.success) {
      set((s) => ({
        values: s.values.map((v) =>
          v.id === id ? { ...v, status: 'resolved' as const, resolvedAt: new Date().toISOString() } : v
        ),
      }))
    }
  },

  notify: async (id) => {
    set((s) => ({
      values: s.values.map((v) =>
        v.id === id ? { ...v, status: 'notified' as const, notifiedAt: new Date().toISOString() } : v
      ),
    }))
  },
}))
