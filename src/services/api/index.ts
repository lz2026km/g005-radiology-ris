export { api } from './client'
export type { ApiResponse, PageResult, ApiError, ExamQueryParams, PatientQueryParams, ReportQueryParams } from './types'

export { examApi } from './examApi'
export type { ExamDto } from './examApi'

export { patientApi } from './patientApi'
export type { PatientDto } from './patientApi'

export { reportApi } from './reportApi'
export type { ReportDto } from './reportApi'

export { deviceApi } from './deviceApi'
export type { DeviceDto } from './deviceApi'

export { criticalApi } from './criticalApi'
export type { CriticalValueDto } from './criticalApi'

export { appointmentApi } from './appointmentApi'
export type { AppointmentDto } from './appointmentApi'

export { statsApi } from './statsApi'
export type { DailyStatsDto, WeeklyStatsDto, WorkloadDto, QualityDto } from './statsApi'
