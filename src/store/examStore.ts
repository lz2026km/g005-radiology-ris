import { create } from 'zustand'
import { examApi } from '../services/api'
import type { ExamDto } from '../services/api'

interface ExamState {
  exams: ExamDto[]
  loading: boolean
  error: string | null
  load: () => Promise<void>
  transition: (id: string, action: 'checkIn' | 'start' | 'complete' | 'cancel') => Promise<void>
}

export const useExamStore = create<ExamState>((set) => ({
  exams: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true })
    const res = await examApi.list({})
    if (res.success && Array.isArray(res.data)) {
      set({ exams: res.data as ExamDto[], loading: false, error: null })
    } else {
      set({ loading: false, error: res.error?.message ?? '加载失败' })
    }
  },

  transition: async (id, action) => {
    const actions: Record<string, (id: string) => ReturnType<typeof examApi.checkIn>> = {
      checkIn: examApi.checkIn,
      start: examApi.start,
      complete: examApi.complete,
      cancel: examApi.cancel,
    }
    const fn = actions[action]
    if (!fn) return
    const res = await fn(id)
    if (res.success && res.data) {
      set((state) => ({
        exams: state.exams.map((e) => (e.id === id ? { ...e, status: (res.data as unknown as Record<string, unknown>).status as string } : e)),
        error: null,
      }))
    } else {
      set({ error: res.error?.message ?? '操作失败' })
    }
  },
}))
