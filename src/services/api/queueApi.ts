import { api } from './client'

export interface QueueCallDto {
  id: string
  patientName: string
  examItem: string
  roomId: string
  roomName: string
  status: 'waiting' | 'called' | 'in_service' | 'completed'
  queueNumber: string
  calledAt?: string
  completedAt?: string
  priority?: string
}

export interface ExamRoomStatus {
  id: string
  roomNumber: string
  modality: string
  status: '空闲' | '使用中' | '维护中'
  currentPatient?: string
  queueCount: number
}

export const queueApi = {
  list: () =>
    api.get<QueueCallDto[]>('/queue'),

  getRoomStatus: () =>
    api.get<ExamRoomStatus[]>('/queue/rooms'),

  call: (id: string) =>
    api.post<QueueCallDto>(`/queue/${id}/call`),

  complete: (id: string) =>
    api.post<QueueCallDto>(`/queue/${id}/complete`),

  recall: (id: string) =>
    api.post<QueueCallDto>(`/queue/${id}/recall`),
}
