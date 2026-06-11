import { api } from './client'
import type { PatientQueryParams } from './types'

export interface PatientDto {
  id: string
  name: string
  gender: string
  age: number
  birthDate?: string
  phone?: string
  idCard?: string
  address?: string
  patientType?: string
}

export const patientApi = {
  list: (params?: PatientQueryParams) =>
    api.get<PatientDto[]>(`/patients?${new URLSearchParams(params as Record<string, string>).toString()}`),

  getById: (id: string) =>
    api.get<PatientDto>(`/patients/${id}`),

  getExams: (id: string) =>
    api.get<unknown[]>(`/patients/${id}/exams`),

  getReports: (id: string) =>
    api.get<unknown[]>(`/patients/${id}/reports`),

  create: (data: Partial<PatientDto>) =>
    api.post<PatientDto>('/patients', data),

  update: (id: string, data: Partial<PatientDto>) =>
    api.put<PatientDto>(`/patients/${id}`, data),
}
