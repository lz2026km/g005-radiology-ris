/**
 * G005 RIS v3.0.5.1 - R3.REVIEW FINAL CHECK 终核类型定义
 * 覆盖 80 点 (15+ 检查项 / 临床一致性 / 终评 / 双驳回路径 / 终审笔记 / 工作量 / 既往报告 / 多签 / 急诊通道 / 工作流配置)
 */
import type { ReviewerRole, ReviewerStatus } from './R3.REVIEW';

export type FinalCheckCategory =
  | 'demographics'
  | 'clinical-history'
  | 'image-quality'
  | 'image-consistency'
  | 'findings-completeness'
  | 'diagnosis-accuracy'
  | 'critical-marking'
  | 'laterality'
  | 'modality-consistency'
  | 'icd-coding'
  | 'recommendation'
  | 'prior-comparison'
  | 'signature'
  | 'confidentiality'
  | 'terminology'
  | 'grammar'
  | 'quality-score'
  | 'audit-trail';

export type FinalCheckStatus = 'pending' | 'passed' | 'failed' | 'warning' | 'skipped' | 'not-applicable';

export type FinalCheckSeverity = 'info' | 'minor' | 'major' | 'critical' | 'blocker';

export interface FinalCheckItem {
  id: string;
  code: string;
  category: FinalCheckCategory;
  title: string;
  description: string;
  status: FinalCheckStatus;
  severity: FinalCheckSeverity;
  weight: number;
  score: number;
  maxScore: number;
  evidence?: string;
  reference?: string;
  autoCheckable: boolean;
  checkedBy?: string;
  checkedAt?: string;
  remark?: string;
  mandatory: boolean;
}

export interface FinalCheckSummary {
  total: number;
  passed: number;
  failed: number;
  warning: number;
  skipped: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  blockers: number;
  mandatoryPending: number;
  isPublishable: boolean;
}

export interface FinalCheckList {
  id: string;
  reportId: string;
  patientId: string;
  taskId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: ReviewerRole;
  items: FinalCheckItem[];
  summary: FinalCheckSummary;
  status: 'in-progress' | 'completed' | 'aborted';
  startedAt: string;
  completedAt?: string;
  totalDurationMs: number;
  rubricVersion: string;
}

export interface ClinicalConsistencyCheck {
  id: string;
  reportId: string;
  patientId: string;
  patientName: string;
  checkedAt: string;
  overallScore: number;
  consistencyLevel: 'excellent' | 'good' | 'fair' | 'poor' | 'inconsistent';
  dimensions: {
    code: string;
    name: string;
    score: number;
    status: 'consistent' | 'minor-deviation' | 'major-deviation' | 'inconsistent';
    findings: string[];
    recommendation?: string;
  }[];
  contradictions: {
    field: string;
    reported: string;
    expected: string;
    severity: 'minor' | 'major' | 'critical';
    autoDetected: boolean;
  }[];
  crossReference: {
    source: 'PACS' | 'HIS' | 'EHR' | 'prior' | 'critical';
    matched: boolean;
    detail: string;
  }[];
  aiConfidence: number;
}

export interface FinalScoringRubric {
  id: string;
  name: string;
  version: string;
  totalWeight: number;
  dimensions: {
    code: string;
    name: string;
    weight: number;
    criteria: { code: string; description: string; maxScore: number }[];
  }[];
  gradeBands: { grade: string; minScore: number; maxScore: number; color: string; label: string }[];
  passingScore: number;
  blockingScore: number;
  isDefault: boolean;
}

export interface FinalScoringResult {
  id: string;
  reportId: string;
  taskId: string;
  rubricId: string;
  rubricVersion: string;
  reviewerId: string;
  reviewerName: string;
  totalScore: number;
  percentage: number;
  grade: string;
  passed: boolean;
  blocked: boolean;
  dimensionScores: {
    code: string;
    name: string;
    score: number;
    weight: number;
    weighted: number;
    comment?: string;
  }[];
  hardFailures: string[];
  softWarnings: string[];
  deltaFromInitial?: number;
  deltaFromPrior?: number;
  scoredAt: string;
  durationMs: number;
}

export type FinalRejectTarget = 'initial' | 'direct-to-draft' | 'previous-stage';

export interface FinalRejectRequest {
  taskId: string;
  reviewerId: string;
  reviewerName: string;
  target: FinalRejectTarget;
  reason: string;
  category: string;
  preservePriorComment: boolean;
  notifyAuthor: boolean;
  reAuditRequired: boolean;
}

export interface FinalReviewNote {
  id: string;
  taskId: string;
  reportId: string;
  authorId: string;
  authorName: string;
  authorRole: ReviewerRole;
  content: string;
  type: 'comment' | 'instruction' | 'warning' | 'suggestion' | 'directive';
  pinned: boolean;
  visibility: 'private' | 'team' | 'department' | 'all';
  mentions: string[];
  attachments: string[];
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface FinalCheckWorkload {
  reviewerId: string;
  reviewerName: string;
  reviewerTitle: ReviewerRole;
  reviewerStatus: ReviewerStatus;
  date: string;
  totalFinalChecks: number;
  passedFirstTime: number;
  rejectedCount: number;
  rejectedToInitial: number;
  rejectedToDraft: number;
  averageDurationMin: number;
  medianDurationMin: number;
  p95DurationMin: number;
  onTimeRate: number;
  blockerRate: number;
  averageScore: number;
  byModality: { modality: string; count: number; avgScore: number }[];
  byPriority: { priority: string; count: number; avgScore: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  trend: { date: string; count: number; avgScore: number; rejected: number }[];
}

export interface PriorReportComparison {
  id: string;
  reportId: string;
  currentReportId: string;
  priorReportId: string;
  priorStudyDate: string;
  daysSince: number;
  modalityMatch: boolean;
  bodyPartMatch: boolean;
  findings: {
    field: string;
    currentValue: string;
    priorValue: string;
    change: 'new' | 'resolved' | 'enlarged' | 'shrunk' | 'stable' | 'changed' | 'unchanged';
    significance: 'minor' | 'moderate' | 'major' | 'critical';
    detail?: string;
  }[];
  overallChange: 'improved' | 'stable' | 'worsened' | 'new-finding' | 'mixed';
  aiSummary: string;
  recommendedAction?: string;
  comparedAt: string;
}

export type FinalSignatureRole = 'resident' | 'attending' | 'associateChief' | 'chief' | 'director' | 'cosigner' | 'witness';

export interface FinalSignatureSlot {
  id: string;
  order: number;
  role: FinalSignatureRole;
  required: boolean;
  signerId?: string;
  signerName?: string;
  signedAt?: string;
  certificateId?: string;
  signatureHash?: string;
  status: 'pending' | 'in-progress' | 'signed' | 'rejected' | 'skipped';
  note?: string;
  reason?: string;
}

export interface FinalMultiSignatureRequest {
  id: string;
  taskId: string;
  reportId: string;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  slots: FinalSignatureSlot[];
  reason: string;
  trigger: 'critical' | 'stat' | 'special' | 'director' | 'manual' | 'audit';
  parallel: boolean;
  expiresAt: string;
  status: 'collecting' | 'in-progress' | 'completed' | 'failed' | 'expired' | 'revoked';
  completedAt?: string;
  certificateId?: string;
  auditId?: string;
}

export type EmergencyChannel = 'sms' | 'phone' | 'in-app' | 'wechat' | 'email' | 'pager';

export interface EmergencyReviewRequest {
  id: string;
  taskId: string;
  reportId: string;
  patientId: string;
  patientName: string;
  trigger: 'critical-finding' | 'stat-imaging' | 'icu-request' | 'er-request' | 'manual';
  severity: 'urgent' | 'critical' | 'life-threatening';
  description: string;
  triggeredBy: string;
  triggeredByName: string;
  triggeredAt: string;
  channels: EmergencyChannel[];
  targets: { reviewerId: string; reviewerName: string; role: ReviewerRole; notifiedAt?: string; acknowledgedAt?: string; responseTimeMs?: number }[];
  slaMinutes: number;
  status: 'open' | 'acknowledged' | 'in-review' | 'completed' | 'expired' | 'cancelled';
  completedAt?: string;
  auditId: string;
}

export interface FinalCheckWorkflowStage {
  id: string;
  code: string;
  name: string;
  order: number;
  required: boolean;
  skippable: boolean;
  rolesAllowed: ReviewerRole[];
  slaMinutes: number;
  exitCriteria: string[];
}

export interface FinalCheckWorkflowConfig {
  id: string;
  name: string;
  version: string;
  isDefault: boolean;
  enabled: boolean;
  description: string;
  stages: FinalCheckWorkflowStage[];
  rejectTargets: FinalRejectTarget[];
  multiSignatureRequired: boolean;
  emergencyChannelEnabled: boolean;
  defaultRubricId: string;
  passingThreshold: number;
  blockingThreshold: number;
  autoEscalateOnBlocker: boolean;
  notifyOnReject: boolean;
  preserveAuditChain: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface FinalCheckFilter {
  reviewerId?: string;
  status?: string;
  priority?: string;
  modality?: string;
  category?: FinalCheckCategory | 'all';
  dateFrom?: string;
  dateTo?: string;
  passingOnly?: boolean;
  blockingOnly?: boolean;
  search?: string;
}

export type FinalCheckEventType =
  | 'started'
  | 'item-checked'
  | 'item-passed'
  | 'item-failed'
  | 'item-warning'
  | 'completed'
  | 'rejected-initial'
  | 'rejected-draft'
  | 'note-added'
  | 'signature-collected'
  | 'emergency-triggered'
  | 'workflow-updated';

export interface FinalCheckEvent {
  id: string;
  taskId: string;
  reportId: string;
  type: FinalCheckEventType;
  actorId: string;
  actorName: string;
  payload: Record<string, unknown>;
  timestamp: string;
}
