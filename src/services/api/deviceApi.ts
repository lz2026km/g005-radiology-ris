import { api } from './client'

export interface DeviceDto {
  id: string
  deviceId?: string
  code: string
  name: string
  modality: string
  status: string
  manufacturer?: string
  model?: string
  roomId?: string
  utilization?: number
  deviceType?: string
  room?: string
  building?: string
  grade?: string
  totalMonthlyScans?: number
  totalValue?: number
  totalDowntime?: number
  lastMaintenanceAt?: string
  nextMaintenanceAt?: string
  maintenanceCycle?: string
  responsibleEngineer?: string
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

  getStats: () =>
    api.get<any>('/devices/stats'),

  getByModality: (modality: string) =>
    api.get<DeviceDto[]>(`/devices/by-modality/${modality}`),

  getMaintenanceHistory: (id: string) =>
    api.get<any[]>(`/devices/${id}/maintenance-history`),

  getWorkload: (params?: { days?: number }) =>
    api.get<any[]>(`/devices/workload?${new URLSearchParams(params as Record<string, string> ?? {}).toString()}`),

  getQrCode: (id: string) =>
    api.get<{ qrCode: string; url: string }>(`/devices/${id}/qrcode`),

  triggerMaintenance: (id: string, reason?: string) =>
    api.post<any>(`/devices/${id}/maintenance`, { reason }),
}
