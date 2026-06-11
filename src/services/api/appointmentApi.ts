import { api } from './client'

export interface AppointmentDto {
  id: string
  patientId: string
  patientName: string
  modality: string
  bodyPart: string
  scheduledAt: string
  status: string
  doctorId?: string
  roomId?: string
}

export const appointmentApi = {
  list: () =>
    api.get<AppointmentDto[]>('/appointments'),

  getById: (id: string) =>
    api.get<AppointmentDto>(`/appointments/${id}`),

  create: (data: Partial<AppointmentDto>) =>
    api.post<AppointmentDto>('/appointments', data),

  cancel: (id: string) =>
    api.put<AppointmentDto>(`/appointments/${id}/cancel`),
}
