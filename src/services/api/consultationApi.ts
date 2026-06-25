import { api } from './client'

export interface ConsultationDto {
  id: string
  consultationId?: string
  examId: string
  patientId?: string
  patientName: string
  modality: string
  bodyPart: string
  status: string
  type: string
  consultationType?: string
  isRemote?: boolean
  requestingDepartment?: string
  consultedDepartment?: string
  consultedDoctorName?: string
  scheduledAt: string
  requestTime?: string
  requestedBy?: string
  consultant?: string
  consultants?: string[]
  notes?: string
  requestReason?: string
  priority?: string
  urgency?: string
  duration?: string
  participants?: string[]
}

export const consultationApi = {
  list: (params?: { status?: string; priority?: string }) =>
    api.get<ConsultationDto[]>(`/consultations?${new URLSearchParams(params as Record<string, string> ?? {}).toString()}`),

  getById: (id: string) =>
    api.get<ConsultationDto>(`/consultations/${id}`),

  getPending: () =>
    api.get<ConsultationDto[]>('/consultations/pending'),

  getByPatient: (patientId: string) =>
    api.get<ConsultationDto[]>(`/consultations/by-patient/${patientId}`),

  getByDoctor: (doctorId: string) =>
    api.get<ConsultationDto[]>(`/consultations/by-doctor/${doctorId}`),

  create: (data: Partial<ConsultationDto>) =>
    api.post<ConsultationDto>('/consultations', data),

  update: (id: string, data: Partial<ConsultationDto>) =>
    api.put<ConsultationDto>(`/consultations/${id}`, data),

  cancel: (id: string) =>
    api.post<ConsultationDto>(`/consultations/${id}/cancel`),

  complete: (id: string, notes?: string) =>
    api.post<ConsultationDto>(`/consultations/${id}/complete`, { notes }),
}
