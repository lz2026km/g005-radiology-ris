import type { Bell, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

export interface TimelineEvent {
  time: string
  event: string
  user: string
  detail?: string
}

export interface DocumentItem {
  id: string
  name: string
  type: string
  uploadTime: string
  url?: string
}

export interface CriticalValue {
  id: string
  reportId: string
  examId: string
  patientId: string
  patientName: string
  gender: string
  age: number
  patientType: string
  phone?: string
  contactPerson?: string
  modality: string
  examItemName: string
  bodyPart?: string
  criticalFinding: string
  findingDetails: string
  severity: '危急' | '高危' | '紧急'
  resultValue?: string
  resultUnit?: string
  normalRange?: string
  criticalRange?: string
  exceedRatio?: string
  reportedBy: string
  reportedByName: string
  reportedTime: string
  receivingDoctorId?: string
  receivingDoctorName?: string
  receivingTime?: string
  receivingDepartment?: string
  notificationMethod?: string
  acknowledged?: boolean
  acknowledgedBy?: string
  acknowledgedTime?: string
  status: '待处理' | '处理中' | '已处理' | '超时'
  processingDoctor?: string
  processingDoctorName?: string
  processingTime?: string
  processingDepartment?: string
  processingMeasure?: string
  processingResult?: string
  processingDuration?: string
  followUpNotes?: string
  examDoctor?: string
  examDoctorName?: string
  examTime?: string
  deviceName?: string
  accessionNumber?: string
  timeline: TimelineEvent[]
  documents?: DocumentItem[]
  transferredToFollowUp?: boolean
  followUpId?: string
  followUpDate?: string
}

export interface ClosedLoopStage5 {
  key: string
  label: string
  time?: string
  user?: string
  measure?: string
  done: boolean
  active: boolean
}

export interface FollowUpRecord {
  id: string
  time: string
  type: '电话回访' | '短信确认' | '现场走访' | '系统通知'
  result: '已回复' | '无响应' | '转接成功' | '需再次回访'
  operator: string
  content: string
  relatedCVId?: string
  followUpDate?: string
}

export const PRIMARY_COLOR = '#1e40af'
export const PRIMARY_LIGHT = '#3b82f6'
export const PRIMARY_BG = '#eff6ff'

export const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  '待处理': { bg: '#fee2e2', color: '#dc2626', label: '待处理' },
  '处理中': { bg: '#fef3c7', color: '#d97706', label: '处理中' },
  '已处理': { bg: '#d1fae5', color: '#059669', label: '已处理' },
  '超时': { bg: '#fecaca', color: '#991b1b', label: '超时' },
}

export const SEVERITY_CONFIG: Record<string, { bg: string; color: string; borderColor: string }> = {
  '危急': { bg: '#fef2f2', color: '#dc2626', borderColor: '#dc2626' },
  '高危': { bg: '#fffbeb', color: '#d97706', borderColor: '#d97706' },
  '紧急': { bg: '#eff6ff', color: '#2563eb', borderColor: '#2563eb' },
}
