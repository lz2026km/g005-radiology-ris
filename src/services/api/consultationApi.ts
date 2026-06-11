import { api } from './client'

export interface ConsultationDto {
  id: string
  examId: string
  patientName: string
  modality: string
  bodyPart: string
  status: string
  type: string
  scheduledAt: string
  requestedBy?: string
  consultant?: string
  notes?: string
  priority?: string
}

export const consultationApi = {
  list: (params?: { status?: string; priority?: string }) =>
    api.get<ConsultationDto[]>(`/consultations?${new URLSearchParams(params as Record<string, string> ?? {}).toString()}`),

  getById: (id: string) =>
    api.get<ConsultationDto>(`/consultations/${id}`),

  create: (data: Partial<ConsultationDto>) =>
    api.post<ConsultationDto>('/consultations', data),

  update: (id: string, data: Partial<ConsultationDto>) =>
    api.put<ConsultationDto>(`/consultations/${id}`, data),

  cancel: (id: string) =>
    api.post<ConsultationDto>(`/consultations/${id}/cancel`),
}
