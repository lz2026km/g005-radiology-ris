// [v3.0.6.8-47] PR3: 通知 + 模板 + 词典综合管理
import { api } from './client';

// ============= 通知 =============
export interface NotificationDto {
  id: string;
  title: string;
  content: string;
  type: 'critical' | 'review' | 'system' | 'reminder' | 'task';
  severity?: 'info' | 'warning' | 'error' | 'critical';
  isRead: boolean;
  createdAt: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  actionUrl?: string;
  expiresAt?: string;
}

export const notificationApi = {
  list: (params?: { isRead?: boolean; type?: string; pageSize?: number }) =>
    api.get<NotificationDto[]>(`/notifications?${new URLSearchParams(params as Record<string, string> ?? {}).toString()}`),

  unread: () =>
    api.get<{ unread: number; total: number; recent: NotificationDto[] }>('/notifications/unread-count'),

  markRead: (id: string) =>
    api.put<{ id: string; isRead: boolean; readAt: string }>(`/notifications/${id}/read`, {}),

  markAllRead: () =>
    api.post<{ markedAt: string; count: number }>('/notifications/mark-all-read', {}),

  getPrefs: () =>
    api.get<{ userId: string; channels: { email: boolean; sms: boolean; inApp: boolean; dingtalk: boolean } }>('/notifications/prefs'),
};

// ============= 模板 =============
export interface ReportTemplateDto {
  id: string;
  templateId?: string;
  name: string;
  modality: string;
  bodyPart?: string;
  category: 'CT' | 'MR' | 'DR' | 'US' | 'MG' | '通用';
  sections: Array<{ title: string; type: 'text' | 'select' | 'measure'; required: boolean; options?: string[] }>;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export const templateApi = {
  list: (params?: { modality?: string; category?: string; pageSize?: number }) =>
    api.get<ReportTemplateDto[]>(`/templates?${new URLSearchParams(params as Record<string, string> ?? {}).toString()}`),

  getById: (id: string) =>
    api.get<ReportTemplateDto>(`/templates/${id}`),

  create: (data: Partial<ReportTemplateDto>) =>
    api.post<ReportTemplateDto>('/templates', data),

  update: (id: string, data: Partial<ReportTemplateDto>) =>
    api.put<ReportTemplateDto>(`/templates/${id}`, data),

  delete: (id: string) =>
    api.delete(`/templates/${id}`),
};

// ============= 词典 =============
export interface DictionaryItemDto {
  id: string;
  category: string;
  code: string;
  name: string;
  enName?: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export const dictionaryApi = {
  list: (params?: { category?: string; keyword?: string; pageSize?: number }) =>
    api.get<DictionaryItemDto[]>(`/dictionary?${new URLSearchParams(params as Record<string, string> ?? {}).toString()}`),

  create: (data: Partial<DictionaryItemDto>) =>
    api.post<DictionaryItemDto>('/dictionary', data),

  update: (id: string, data: Partial<DictionaryItemDto>) =>
    api.put<DictionaryItemDto>(`/dictionary/${id}`, data),

  delete: (id: string) =>
    api.delete(`/dictionary/${id}`),
};
