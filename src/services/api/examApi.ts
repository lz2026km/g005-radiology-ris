import { api } from './client'
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
}

export const examApi = {
  list: (params?: ExamQueryParams) =>
    api.get<ExamDto[]>(`/worklist?${new URLSearchParams(params as Record<string, string>).toString()}`),

  getById: (id: string) =>
    api.get<ExamDto>(`/worklist/${id}`),

  create: (data: Partial<ExamDto>) =>
    api.post<ExamDto>('/worklist', data),

  updateStatus: (id: string, status: string) =>
    api.put<ExamDto>(`/worklist/${id}/status`, { status }),

  checkIn: (id: string) =>
    api.post<ExamDto>(`/worklist/${id}/checkin`),

  start: (id: string) =>
    api.post<ExamDto>(`/worklist/${id}/start`),

  complete: (id: string) =>
    api.post<ExamDto>(`/worklist/${id}/complete`),

  cancel: (id: string) =>
    api.post<ExamDto>(`/worklist/${id}/cancel`),
}
