import { api } from './client'

export interface DeviceDto {
  id: string
  code: string
  name: string
  modality: string
  status: string
  manufacturer?: string
  model?: string
  roomId?: string
  utilization?: number
}

export const deviceApi = {
  list: () =>
    api.get<DeviceDto[]>('/devices'),

  getById: (id: string) =>
    api.get<DeviceDto>(`/devices/${id}`),

  updateStatus: (id: string, status: string) =>
    api.put<DeviceDto>(`/devices/${id}/status`, { status }),

  getTodayStats: () =>
    api.get<{ totalDevices: number; inUse: number; idle: number; maintenance: number }>('/devices/stats/today'),

  getSchedule: () =>
    api.get<unknown[]>('/devices/schedule'),
}
