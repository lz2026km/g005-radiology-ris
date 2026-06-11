import { api } from './client'
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
  createdTime: string
  updatedTime: string
  doctorId?: string
  qualityScore?: number
}

export const reportApi = {
  list: (params?: ReportQueryParams) =>
    api.get<ReportDto[]>(`/reports?${new URLSearchParams(params as Record<string, string>).toString()}`),

  getById: (id: string) =>
    api.get<ReportDto>(`/reports/${id}`),

  create: (data: Partial<ReportDto>) =>
    api.post<ReportDto>('/reports', data),

  update: (id: string, data: Partial<ReportDto>) =>
    api.put<ReportDto>(`/reports/${id}`, data),

  submit: (id: string) =>
    api.post<ReportDto>(`/reports/${id}/submit`),

  review: (id: string) =>
    api.post<ReportDto>(`/reports/${id}/review`),

  sign: (id: string) =>
    api.post<ReportDto>(`/reports/${id}/sign`),

  reject: (id: string) =>
    api.post<ReportDto>(`/reports/${id}/reject`),

  revise: (id: string) =>
    api.post<ReportDto>(`/reports/${id}/revise`),
}
