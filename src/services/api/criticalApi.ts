import { api } from './client'

export type NotificationMethod = 'PHONE' | 'SMS' | 'SYSTEM' | 'EMAIL' | 'WECHAT' | 'DINGTALK'

export interface CriticalValueDto {
  id: string
  examId: string
  patientName: string
  finding: string
  severity: string
  status: string
  triggeredAt: string
  notifiedAt?: string
  acknowledgedAt?: string
  doctorId?: string
  notificationMethod?: NotificationMethod
}

export const criticalApi = {
  list: () =>
    api.get<CriticalValueDto[]>('/critical'),

  getById: (id: string) =>
    api.get<CriticalValueDto>(`/critical/${id}`),

  create: (data: Partial<CriticalValueDto>) =>
    api.post<CriticalValueDto>('/critical', data),

  acknowledge: (id: string) =>
    api.put<CriticalValueDto>(`/critical/${id}/acknowledge`),

  resolve: (id: string) =>
    api.put<CriticalValueDto>(`/critical/${id}/resolve`),

  notify: (id: string, method: NotificationMethod) =>
    api.put<CriticalValueDto>(`/critical/${id}/notify`, { method }),
}
