import { api, invalidateApiCache, invalidateApiCacheByPrefix } from './client'
import type { ReportQueryParams } from './types'

export interface ReportDto {
  id: string
  reportId: string
  patientId: string
  patientName: string
  examId: string
  modality: string
  bodyPart: string
  status: string
  findings?: string
  diagnosis?: string
  impression?: string
  recommendations?: string
  createdTime: string
  updatedTime: string
  doctorId?: string
  qualityScore?: number
  reviewerId?: string
  coSignerId?: string
}

export const reportApi = {
  list: (params?: ReportQueryParams) =>
    api.get<ReportDto[]>(`/reports?${new URLSearchParams(params as Record<string, string>).toString()}`),

  getById: (id: string) =>
    api.get<ReportDto>(`/reports/${id}`),

  create: async (data: Partial<ReportDto>) => {
    const res = await api.post<ReportDto>('/reports', data)
    await invalidateApiCache('/reports')
    await invalidateApiCacheByPrefix('/reports')
    return res
  },

  update: async (id: string, data: Partial<ReportDto>) => {
    const res = await api.put<ReportDto>(`/reports/${id}`, data)
    await invalidateApiCache(`/reports/${id}`)
    return res
  },

  submit: async (id: string) => {
    const res = await api.post<ReportDto>(`/reports/${id}/submit`)
    await invalidateApiCache(`/reports/${id}`)
    await invalidateApiCacheByPrefix('/reports')
    return res
  },

  review: async (id: string) => {
    const res = await api.post<ReportDto>(`/reports/${id}/review`)
    await invalidateApiCache(`/reports/${id}`)
    return res
  },

  sign: async (id: string) => {
    const res = await api.post<ReportDto>(`/reports/${id}/sign`)
    await invalidateApiCache(`/reports/${id}`)
    await invalidateApiCacheByPrefix('/reports')
    return res
  },

  reject: async (id: string, reason: string) => {
    const res = await api.post<ReportDto>(`/reports/${id}/reject`, { reason })
    await invalidateApiCache(`/reports/${id}`)
    await invalidateApiCacheByPrefix('/reports')
    return res
  },

  publish: async (id: string, qualityScore?: number) => {
    const res = await api.post<ReportDto>(`/reports/${id}/publish`, { qualityScore })
    await invalidateApiCache(`/reports/${id}`)
    await invalidateApiCacheByPrefix('/reports')
    return res
  },

  revise: async (id: string) => {
    const res = await api.post<ReportDto>(`/reports/${id}/revise`)
    await invalidateApiCache(`/reports/${id}`)
    await invalidateApiCacheByPrefix('/reports')
    return res
  },
}
