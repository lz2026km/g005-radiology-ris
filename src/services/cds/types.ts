import type { ModalityType, BodyPart, Gender } from '../../types'

// ── 8.1 Exam Appropriateness ──────────────────────────────
export type AppropriatenessLevel = 'appropriate' | 'maybe_appropriate' | 'inappropriate'

export interface AppropriatenessRule {
  id: string
  indication: string
  icdCode?: string
  recommendedExams: ExamRecommendation[]
  guidelineSource: GuidelineSource
  version: string
  isActive: boolean
  createdTime: string
  updatedTime: string
}

export interface ExamRecommendation {
  examName: string
  examCode: string
  modality: ModalityType
  bodyPart: BodyPart
  level: AppropriatenessLevel
  rationale: string
  radiationExposure?: string
  preparation?: string
  alternativeExams?: string[]
}

export interface GuidelineSource {
  organization: 'ACR' | 'ESR' | 'RSNA' | 'NICE' | 'custom'
  guidelineName: string
  guidelineUrl?: string
  publicationYear: number
}

export interface AppropriateOverride {
  ruleId: string
  overriddenBy: string
  overriddenAt: string
  previousLevel: AppropriatenessLevel
  newLevel: AppropriatenessLevel
  reason: string
}

export interface PatientCdsData {
  age: number
  gender: Gender
  weightKg?: number
  heightCm?: number
  eGFR?: number
  allergies?: string[]
  contrastAllergy?: boolean
  pregnancyWeeks?: number
  medications?: string[]
  diagnoses?: string[]
  priorExams?: string[]
}

// ── 8.2 Report Decision Support ──────────────────────────
export type SuggestionType =
  | 'differential_diagnosis'
  | 'follow_up'
  | 'terminology'
  | 'template'
  | 'guideline'
  | 'critical_value'

export type SuggestionSeverity = 'info' | 'warning' | 'critical'

export interface ReportSuggestion {
  id: string
  type: SuggestionType
  severity: SuggestionSeverity
  title: string
  description: string
  snippet?: string
  applicableSection?: string
  source: 'ai' | 'rule' | 'guideline' | 'library'
  confidence?: number
  isAccepted?: boolean
  acceptedAt?: string
}

export interface CompletenessCheckResult {
  isComplete: boolean
  missingSections: string[]
  missingFields: string[]
  suggestions: ReportSuggestion[]
  overallScore: number
}

export interface TerminologyValidationResult {
  term: string
  found: boolean
  standard: 'RadLex' | 'SNOMED' | 'LOINC' | 'ICD-10'
  mappedCode?: string
  preferredTerm?: string
  suggestions?: string[]
}

// ── 8.3 Clinical Pathways ─────────────────────────────────
export interface ClinicalPathway {
  id: string
  name: string
  condition: string
  icdCode?: string
  modality?: ModalityType
  steps: PathwayStep[]
  estimatedDurationDays: number
  isActive: boolean
  version: string
  createdTime: string
  updatedTime: string
}

export interface PathwayStep {
  id: string
  order: number
  type: 'exam' | 'consultation' | 'lab' | 'follow_up' | 'procedure' | 'decision'
  name: string
  description: string
  modality?: ModalityType
  bodyPart?: BodyPart
  defaultTimingDays: number
  isOptional: boolean
  dependsOnStepIds?: string[]
}

export interface PathwayInstance {
  id: string
  pathwayId: string
  pathwayName: string
  patientId: string
  patientName: string
  activatedAt: string
  activatedBy: string
  currentStepIndex: number
  steps: PathwayInstanceStep[]
  status: 'active' | 'completed' | 'discontinued'
  completedAt?: string
}

export interface PathwayInstanceStep {
  stepId: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  startedAt?: string
  completedAt?: string
  performedBy?: string
  notes?: string
  resultSummary?: string
}

// ── 8.4 Drug & Contrast CDS ───────────────────────────────
export type ContrastRiskLevel = 'contraindicated' | 'caution' | 'safe'

export interface ContrastCheck {
  contrastName: string
  genericName?: string
  riskLevel: ContrastRiskLevel
  riskFactors: string[]
  recommendations: string[]
  egfrThreshold?: number
  patientEgfr?: number
  alternativeContrasts?: string[]
}

export interface DrugInteractionCheck {
  drugA: string
  drugB: string
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor'
  mechanism: string
  clinicalEffect: string
  recommendation: string
  evidenceLevel: 'A' | 'B' | 'C' | 'D'
}

export interface ContrastProtocol {
  contrastName: string
  route: 'IV' | 'IA' | 'oral' | 'other'
  dose: string
  doseMgIkg?: number
  flowRate?: string
  concentration: string
  maxVolume?: string
  premedication?: string
  notes?: string
  weightBased: boolean
  egfrAdjusted: boolean
}

export interface AdverseEvent {
  id: string
  patientId: string
  patientName: string
  examId?: string
  contrastName?: string
  drugName?: string
  eventType: 'allergic' | 'nephrotoxic' | 'extravasation' | 'other'
  severity: 'mild' | 'moderate' | 'severe'
  description: string
  occurredAt: string
  reportedBy: string
  action: string
  outcome: string
}

// ── 8.5 CDS Management ────────────────────────────────────
export interface CdsRuleSummary {
  type: 'appropriateness' | 'pathway' | 'contrast' | 'drug'
  id: string
  name: string
  isActive: boolean
  version: string
  updatedTime: string
  usageCount: number
}

export interface CdsAuditEntry {
  id: string
  ruleId: string
  ruleType: CdsRuleSummary['type']
  action: 'created' | 'updated' | 'activated' | 'deactivated' | 'overridden'
  performedBy: string
  performedAt: string
  details: string
}

// ── 8.6 CDS Statistics ────────────────────────────────────
export interface CdsStatsOverview {
  totalRules: number
  activeRules: number
  totalOverrides: number
  overrideRate: number
  suggestionAcceptanceRate: number
  pathwayCompletionRate: number
  contrastAlertsThisMonth: number
  topOverriddenRules: { ruleId: string; ruleName: string; count: number }[]
  topPathways: { pathwayId: string; pathwayName: string; activationCount: number }[]
  dailyUsage: { date: string; suggestions: number; overrides: number }[]
}
