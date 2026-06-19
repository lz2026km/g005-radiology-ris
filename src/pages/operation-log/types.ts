export type ViewTab = 'logs' | 'duration' | 'heatmap' | 'hipaa'
export type QuickTimeValue = 'today' | 'week' | 'month' | 'custom' | ''
export type ComplianceLevel = 'compliant' | 'warning' | 'critical'

export interface ComplianceAlert {
  type: 'non_work_hours' | 'cross_department' | 'batch_export' | 'high_frequency'
  level: ComplianceLevel
  message: string
}

export interface OperationLog {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  targetId: string
  targetDesc: string
  beforeData?: string
  afterData?: string
  timestamp: string
  ipAddress: string
  device: string
  source: string
  duration?: number
  patientId?: string
  reportId?: string
  department?: string
  complianceLevel?: ComplianceLevel
  complianceAlerts?: ComplianceAlert[]
}

export interface HipaaStats {
  todayTotal: number
  abnormalCount: number
  mostActiveUser: string
  highestRiskOperation: string
}

export interface LogDetailModalProps {
  log: OperationLog | null
  onClose: () => void
}
