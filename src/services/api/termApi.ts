import { api } from './client'

export interface TermDto {
  id: string
  term: string
  pinyin: string
  category: string
  synonyms?: string[]
  definition?: string
  typicalFindings?: string[]
  typicalDiagnosis?: string[]
  radsSystem?: string
  isFeatured?: boolean
}

export const termApi = {
  list: (params?: { category?: string; search?: string }) =>
    api.get<TermDto[]>(`/terms?${new URLSearchParams(params as Record<string, string> ?? {}).toString()}`),

  getById: (id: string) =>
    api.get<TermDto>(`/terms/${id}`),

  create: (data: Partial<TermDto>) =>
    api.post<TermDto>('/terms', data),

  update: (id: string, data: Partial<TermDto>) =>
    api.put<TermDto>(`/terms/${id}`, data),

  delete: (id: string) =>
    api.delete<TermDto>(`/terms/${id}`),

  search: (q: string) =>
    api.get<TermDto[]>(`/terms/search?q=${encodeURIComponent(q)}`),
}
