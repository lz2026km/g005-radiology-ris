import { api } from './client'

export interface InsuranceAuditDto {
  id: string
  examId: string
  patientId: string
  patientName: string
  examItem: string
  contrastAgent?: string
  anticoagulant?: string
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  amount?: number
  auditedBy?: string
  auditedAt?: string
}

export const insuranceApi = {
  list: (params?: { status?: string }) =>
    api.get<InsuranceAuditDto[]>(`/insurance-audits?${new URLSearchParams(params as Record<string, string> ?? {}).toString()}`),

  getById: (id: string) =>
    api.get<InsuranceAuditDto>(`/insurance-audits/${id}`),

  create: (data: Partial<InsuranceAuditDto>) =>
    api.post<InsuranceAuditDto>('/insurance-audits', data),

  approve: (id: string) =>
    api.post<InsuranceAuditDto>(`/insurance-audits/${id}/approve`),

  reject: (id: string, reason: string) =>
    api.post<InsuranceAuditDto>(`/insurance-audits/${id}/reject`, { reason }),
}
