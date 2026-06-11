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

export { userApi } from './userApi'
export type { UserDto } from './userApi'

export { consultationApi } from './consultationApi'
export type { ConsultationDto } from './consultationApi'

export { queueApi } from './queueApi'
export type { QueueCallDto, ExamRoomStatus } from './queueApi'

export { termApi } from './termApi'
export type { TermDto } from './termApi'

export { insuranceApi } from './insuranceApi'
export type { InsuranceAuditDto } from './insuranceApi'
