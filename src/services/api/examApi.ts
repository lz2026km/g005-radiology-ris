import { api, invalidateApiCache, invalidateApiCacheByPrefix } from './client'
import type { ExamQueryParams } from './types'

export interface ExamDto {
  id: string
  examId: string
  patientId: string
  patientName: string
  gender: string
  age: number
  modality: string
  bodyPart: string
  status: string
  priority: string
  scheduledAt: string
  patientType: string
  deviceId?: string
  roomId?: string
  doctorId?: string
  contrastUsed?: boolean
  radiationDose?: number
  dlp?: number
  technicianId?: string
  imageCount?: number
}

export const examApi = {
  list: (params?: ExamQueryParams) =>
    api.get<ExamDto[]>(`/worklist?${new URLSearchParams(params as Record<string, string>).toString()}`),

  getById: (id: string) =>
    api.get<ExamDto>(`/worklist/${id}`),

  create: async (data: Partial<ExamDto>) => {
    const res = await api.post<ExamDto>('/worklist', data)
    await invalidateApiCache('/worklist')
    await invalidateApiCacheByPrefix('/worklist')
    return res
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api.put<ExamDto>(`/worklist/${id}/status`, { status })
    await invalidateApiCache(`/worklist/${id}`)
    return res
  },

  checkIn: async (id: string) => {
    const res = await api.post<ExamDto>(`/worklist/${id}/checkin`)
    await invalidateApiCache(`/worklist/${id}`)
    await invalidateApiCacheByPrefix('/worklist')
    return res
  },

  start: async (id: string) => {
    const res = await api.post<ExamDto>(`/worklist/${id}/start`)
    await invalidateApiCache(`/worklist/${id}`)
    await invalidateApiCacheByPrefix('/worklist')
    return res
  },

  complete: async (id: string) => {
    const res = await api.post<ExamDto>(`/worklist/${id}/complete`)
    await invalidateApiCache(`/worklist/${id}`)
    await invalidateApiCacheByPrefix('/worklist')
    return res
  },

  cancel: async (id: string) => {
    const res = await api.post<ExamDto>(`/worklist/${id}/cancel`)
    await invalidateApiCache(`/worklist/${id}`)
    await invalidateApiCacheByPrefix('/worklist')
    return res
  },
}
