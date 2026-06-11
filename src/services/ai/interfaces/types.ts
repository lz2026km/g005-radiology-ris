export type AiProviderType = 'mock' | 'deepseek' | 'openai' | 'custom'

export type AiEngineType = 'generation' | 'review' | 'quality' | 'summary' | 'translation'

export interface AiRequestContext {
  modality?: string
  bodyPart?: string
  clinicalHistory?: string
  patientAge?: number
  patientSex?: string
  priorStudies?: string[]
  technique?: string
  comparisonFindings?: string
}

export interface AiCompletionRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface AiCompletionResponse {
  id: string
  content: string
  finishReason: 'stop' | 'length' | 'error'
  usage?: { promptTokens: number; completionTokens: number }
}

export interface AiStreamChunk {
  id: string
  content: string
  finishReason: 'stop' | 'length' | 'error' | null
}

export interface ReportGenerationInput {
  modality: string
  bodyPart: string
  findings: string
  impression?: string
  context?: AiRequestContext
}

export interface ReportGenerationOutput {
  reportText: string
  sections: Array<{ heading: string; content: string }>
  confidence: number
  radsCategory?: string
  criticalFindings?: string[]
}

export interface ReportReviewInput {
  reportText: string
  findings: string
  conclusion: string
  context?: AiRequestContext
}

export interface ReviewIssue {
  id: string
  severity: 'error' | 'warning' | 'info'
  category: 'omission' | 'conflict' | 'format' | 'terminology' | 'completeness'
  field: string
  message: string
  suggestion?: string
}

export interface ReportReviewOutput {
  issues: ReviewIssue[]
  summary: string
  overallScore: number
}

export interface QualityScoringInput {
  reportText: string
  findings: string
  conclusion: string
  radsCategory?: string
  hasCritical?: boolean
  structuredCompletion?: number
}

export interface QualityDimension {
  key: string
  label: string
  score: number
  max: number
  weight: number
  issues: string[]
}

export interface QualityScoringOutput {
  totalScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  dimensions: QualityDimension[]
  suggestions: string[]
  evaluatedAt: string
}

export interface AiProviderConfig {
  type: AiProviderType
  apiKey?: string
  baseUrl?: string
  model?: string
  temperature?: number
  maxTokens?: number
}
