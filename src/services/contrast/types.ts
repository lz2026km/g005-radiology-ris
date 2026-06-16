// ── 14.1 Contrast Inventory ────────────────────────────
export type ContrastAgentType = 'iodinated' | 'gadolinium' | 'ultrasound' | 'barium' | 'other'

export interface ContrastInventoryItem {
  batchId: string
  contrastName: string
  genericName: string
  agentType: ContrastAgentType
  concentration: string
  volumeMl: number
  remainingMl: number
  expiryDate: string
  supplier: string
  lotNumber: string
  receivedDate: string
  status: 'available' | 'low' | 'expired' | 'depleted'
  lowStockThresholdMl: number
  unitPrice: number
}

export interface StockAdjustment {
  id: string
  batchId: string
  type: 'receive' | 'dispense' | 'return' | 'adjust'
  volumeMl: number
  balanceAfterMl: number
  operator: string
  timestamp: string
  reason: string
  referenceType?: 'exam' | 'order'
  referenceId?: string
}

export interface LowStockThreshold {
  contrastName: string
  agentType: ContrastAgentType
  thresholdMl: number
}

// ── 14.2 Injection Workstation ──────────────────────────
export type InjectionPhaseType = 'bolus' | 'chaser' | 'delay' | 'split'

export interface InjectionPhase {
  phase: InjectionPhaseType
  volumeMl: number
  flowRateMls: number
  durationSec: number
  delaySec: number
  description: string
}

export interface InjectionProtocol {
  id: string
  name: string
  contrastName: string
  agentType: ContrastAgentType
  concentration: string
  totalVolumeMl: number
  phases: InjectionPhase[]
  weightBased: boolean
  egfrAdjusted: boolean
  defaultForModality?: string[]
  notes: string
  isActive: boolean
  createdTime: string
}

export interface InjectionRecord {
  id: string
  examId: string
  patientId: string
  patientName: string
  protocolId: string
  protocolName: string
  contrastName: string
  batchId: string
  totalVolumeMl: number
  flowRateMls: number
  actualVolumeMl?: number
  startTime: string
  endTime?: string
  operator: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'interrupted' | 'cancelled'
  parameters: {
    weightKg: number
    eGFR: number
    adjustedVolumeMl: number
    rationale: string
  }
  adverseReactionId?: string
  notes: string
}

export interface InjectorDeviceStatus {
  deviceId: string
  deviceName: string
  model: string
  status: 'online' | 'offline' | 'busy' | 'error'
  batteryLevel?: number
  syringeLoaded: boolean
  currentProtocol?: string
  lastCalibration: string
  errorMessage?: string
}

// ── 14.3 Adverse Reaction ──────────────────────────────
export type ReactionType = 'allergic' | 'nephrotoxic' | 'extravasation' | 'vasovagal' | 'other'
export type ReactionSeverity = 'mild' | 'moderate' | 'severe'
export type ReactionOutcome = 'resolved' | 'improving' | 'ongoing' | 'fatal'

export interface AdverseReaction {
  id: string
  patientId: string
  patientName: string
  examId: string
  contrastName: string
  batchId?: string
  reactionType: ReactionType
  severity: ReactionSeverity
  symptoms: string[]
  description: string
  occurredAt: string
  reportedBy: string
  action: string
  medicationGiven: string
  outcome: ReactionOutcome
  resolvedAt?: string
  followUpNotes: string
  isReported: boolean
  createdAt: string
}

export interface ReactionStats {
  totalReactions: number
  byType: Record<ReactionType, number>
  bySeverity: Record<ReactionSeverity, number>
  byOutcome: Record<ReactionOutcome, number>
  severeReactionRate: number
  totalExamsWithContrast: number
  periodStart: string
  periodEnd: string
}

// ── 14.4 Renal Function ────────────────────────────────
export type EgfrFormula = 'MDRD' | 'CKD-EPI' | 'Cockcroft-Gault'
export type CINRiskLevel = 'low' | 'moderate' | 'high' | 'very_high'

export interface RenalFunctionAssessment {
  id: string
  patientId: string
  serumCreatinineUmoll: number
  eGFR: number
  formula: EgfrFormula
  riskLevel: CINRiskLevel
  assessedAt: string
  contrastType?: string
  weightKg?: number
  age: number
  gender: 'male' | 'female'
  race?: string
}

export interface HydrationProtocol {
  riskLevel: CINRiskLevel
  description: string
  regimen: string
  duration: string
  rate: string
  totalVolume: string
  notes: string
}

// ── 14.6 Quality & Compliance ──────────────────────────
export interface QualityMetric {
  id: string
  name: string
  category: 'usage' | 'safety' | 'adherence' | 'regulatory'
  currentValue: number
  targetValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  periodStart: string
  periodEnd: string
  details: string
}

export interface ContrastUsageReport {
  totalContrastExams: number
  totalVolumeMl: number
  byAgentType: Record<ContrastAgentType, { exams: number; volumeMl: number }>
  byModality: Record<string, { exams: number; volumeMl: number }>
  averageVolumePerExam: number
  periodStart: string
  periodEnd: string
}

export interface ComplianceReport {
  id: string
  reportType: 'monthly' | 'quarterly' | 'annual'
  periodStart: string
  periodEnd: string
  generatedAt: string
  generatedBy: string
  metrics: QualityMetric[]
  usageReport: ContrastUsageReport
  adverseEventRate: number
  protocolAdherenceRate: number
  regulatoryChecks: RegulatoryCheck[]
  summary: string
}

export interface RegulatoryCheck {
  checkId: string
  name: string
  regulation: string
  status: 'pass' | 'fail' | 'pending' | 'na'
  details: string
  checkedAt: string
}
