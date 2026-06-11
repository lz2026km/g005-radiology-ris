import { api } from './client'

export interface DailyStatsDto {
  totalExams: number
  completedExams: number
  pendingReports: number
  criticalValues: number
}

export interface WeeklyStatsDto {
  totalExams: number
  daily: { date: string; count: number }[]
}

export interface WorkloadDto {
  doctorName: string
  examCount: number
  reportCount: number
  avgTime: number
}

export interface QualityDto {
  averageScore: number
  byDoctor: { doctorName: string; score: number }[]
  byModality: { modality: string; score: number }[]
}

export const statsApi = {
  getDaily: () =>
    api.get<DailyStatsDto>('/stats/daily'),

  getWeekly: () =>
    api.get<WeeklyStatsDto>('/stats/weekly'),

  getWorkload: () =>
    api.get<WorkloadDto[]>('/stats/workload'),

  getQuality: () =>
    api.get<QualityDto>('/stats/quality'),
}
