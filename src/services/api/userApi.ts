import { api } from './client'

export interface UserDto {
  id: string
  name: string
  username: string
  role: string
  department?: string
  title?: string
  phone?: string
  email?: string
  permissions?: string[]
  isActive?: boolean
}

export const userApi = {
  list: () =>
    api.get<UserDto[]>('/users'),

  getById: (id: string) =>
    api.get<UserDto>(`/users/${id}`),

  create: (data: Partial<UserDto>) =>
    api.post<UserDto>('/users', data),

  update: (id: string, data: Partial<UserDto>) =>
    api.put<UserDto>(`/users/${id}`, data),

  delete: (id: string) =>
    api.delete<UserDto>(`/users/${id}`),

  resetPassword: (id: string) =>
    api.post<UserDto>(`/users/${id}/reset-password`),
}
