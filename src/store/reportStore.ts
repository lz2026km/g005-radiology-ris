// @deprecated v3.0.4: Consumers should use useStore() hook pattern instead of .getState()
// TODO: Convert all getState() calls to useStore() for reactive subscriptions
import { create } from 'zustand'
import { reportApi } from '../services/api'
import type { ReportDto } from '../services/api'

interface ReportState {
  reports: ReportDto[]
  loading: boolean
  error: string | null
  load: () => Promise<void>
  submit: (id: string) => Promise<void>
  review: (id: string, type: 'initial' | 'final', doctorId: string, doctorName: string, suggestion: string, score: number) => Promise<void>
  sign: (id: string) => Promise<void>
  publish: (id: string, qualityScore?: number) => Promise<void>
  reject: (id: string, reason: string) => Promise<void>
  revise: (id: string) => Promise<void>
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true })
    const res = await reportApi.list({})
    if (res.success && Array.isArray(res.data)) {
      set({ reports: res.data as ReportDto[], loading: false, error: null })
    } else {
      set({ loading: false, error: res.error?.message ?? '加载失败' })
    }
  },

  submit: async (id) => {
    const res = await reportApi.submit(id)
    if (res.success) {
      set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status: '已提交' } : r)) }))
    }
  },

  review: async (id, type, _doctorId, _doctorName, suggestion, _score) => {
    const field = type === 'initial' ? 'initialAuditSuggestion' : 'finalAuditSuggestion'
    const nextStatus = type === 'initial' ? '初审通过' : '已审核'
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? { ...r, status: nextStatus, [field]: suggestion } : r)),
    }))
  },

  sign: async (id) => {
    const res = await reportApi.sign(id)
    if (res.success) {
      set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status: '已签发' } : r)) }))
    }
  },

  publish: async (id, qualityScore) => {
    const res = await reportApi.publish(id, qualityScore)
    if (res.success) {
      set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status: '已发布' } : r)) }))
    }
  },

  reject: async (id, reason) => {
    const res = await reportApi.reject(id, reason)
    if (res.success) {
      set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status: '已驳回' } : r)) }))
    }
  },

  revise: async (id) => {
    const res = await reportApi.revise(id)
    if (res.success) {
      set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status: '修订中' } : r)) }))
    }
  },
}))
