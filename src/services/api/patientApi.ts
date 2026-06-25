import { api } from './client'
import type { PatientQueryParams } from './types'

export interface PatientDto {
  id: string
  patientId?: string
  name: string
  patientName?: string
  gender: string
  age: number
  birthDate?: string
  phone?: string
  idCard?: string
  address?: string
  patientType?: string
  insuranceType?: string
  emergencyContact?: string
  allergyHistory?: string
  medicalHistory?: string
  bloodType?: string
  department?: string
  diagnosis?: string
  lastVisitAt?: string
  registeredAt?: string
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

  getTimeline: (id: string) =>
    api.get<any[]>(`/patients/${id}/timeline`),

  getStats: (params?: { modality?: string }) =>
    api.get<any>(`/patients/stats?${new URLSearchParams(params as Record<string, string> ?? {}).toString()}`),

  getByModality: (modality: string) =>
    api.get<PatientDto[]>(`/patients/by-modality/${modality}`),

  getByStatus: (status: string) =>
    api.get<PatientDto[]>(`/patients/by-status/${status}`),

  exportCsv: (params?: PatientQueryParams) =>
    api.get<{ url: string }>(`/patients/export.csv?${new URLSearchParams(params as Record<string, string> ?? {}).toString()}`),

  bulkImport: (data: Partial<PatientDto>[]) =>
    api.post<{ imported: number }>('/patients/bulk-import', { patients: data }),

  create: (data: Partial<PatientDto>) =>
    api.post<PatientDto>('/patients', data),

  update: (id: string, data: Partial<PatientDto>) =>
    api.put<PatientDto>(`/patients/${id}`, data),
}
