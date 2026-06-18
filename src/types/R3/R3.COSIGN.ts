/**
 * G005 RIS v3.0.5.1 - R3.REVIEW COSIGN 类型定义
 * 对应章节 1.2.3 + 1.3 CoSign 双签扩展(80 点)
 *
 * 覆盖 10 大特性:
 *  - Cosign scheduling      (排班)
 *  - Emergency dual sign    (急诊双签)
 *  - Multi-signature mgmt   (多人签)
 *  - Sign conflict resolve  (签冲突)
 *  - Auto-assign superior   (自动派主任)
 *  - Cosign SLA monitor     (SLA 监控)
 *  - Cosign history         (历史记录)
 *  - Skip Cosign config     (跳过配置)
 *  - Cosign temp auth       (临时授权)
 *  - Batch Cosign           (批量签)
 */
import type { Reviewer, ReviewerRole, ReviewStage } from './R3.REVIEW';

export type CosignTriggerReason =
  | 'critical-finding'
  | 'stat-emergency'
  | 'special-study'
  | 'director-required'
  | 'quality-flag'
  | 'manual-escalation'
  | 'rectify-after-reject';

export type CosignPriority = 'stat' | 'urgent' | 'routine' | 'scheduled';

export type CosignStatus =
  | 'pending'
  | 'scheduled'
  | 'in-progress'
  | 'signed'
  | 'rejected'
  | 'expired'
  | 'escalated'
  | 'skipped'
  | 'cancelled';

export type ConflictType =
  | 'duplicate-signature'
  | 'overlapping-cosigner'
  | 'expired-cert'
  | 'role-violation'
  | 'time-window-violation'
  | 'identity-mismatch'
  | 'lock-conflict';

export type ConflictResolution =
  | 'reassign-cosigner'
  | 'use-secondary-cert'
  | 'director-override'
  | 'extend-window'
  | 'reject-and-restart'
  | 'escalate-to-dean';

export type TemporaryAuthScope =
  | 'single-cosign'
  | 'department-cosign'
  | 'modality-cosign'
  | 'shift-window';

export type SkipReason =
  | 'chief-signed-by-resident'
  | 'verified-by-ai'
  | 'training-case'
  | 'legacy-migration'
  | 'director-authorized';

export interface CosignRecord {
  id: string;
  reportId: string;
  taskId: string;
  patientName: string;
  modality: string;
  bodyPart: string;
  triggerReason: CosignTriggerReason;
  priority: CosignPriority;
  status: CosignStatus;
  authorId: string;
  authorName: string;
  authorTitle: ReviewerRole;
  cosignerId: string;
  cosignerName: string;
  cosignerTitle: ReviewerRole;
  certificateId?: string;
  certificateSerial?: string;
  scheduledAt?: string;
  startedAt?: string;
  signedAt?: string;
  expiresAt?: string;
  slaMinutes: number;
  elapsedMinutes: number;
  remainMinutes: number;
  signatureValue?: string;
  remark?: string;
  rejectReason?: string;
  history: CosignHistoryStep[];
}

export interface CosignHistoryStep {
  id: string;
  step: 'trigger' | 'assign' | 'schedule' | 'notify' | 'start' | 'cert-verify' | 'sign' | 'reject' | 'skip' | 'escalate' | 'expire' | 'batch' | 'remind';
  actorId: string;
  actorName: string;
  action: string;
  detail?: string;
  timestamp: string;
  hash?: string;
  prevHash?: string;
}

export interface EmergencyCosign {
  id: string;
  recordId: string;
  reportId: string;
  patientName: string;
  modality: string;
  bodyPart: string;
  criticalLevel: 'critical' | 'stat' | 'urgent';
  triggeredAt: string;
  requiredResponseSeconds: number;
  smsSent: boolean;
  emailSent: boolean;
  phoneCalled: boolean;
  appPushed: boolean;
  firstResponseAt?: string;
  firstResponseBy?: string;
  responseSeconds?: number;
  resolvedBy?: 'signed' | 'rejected' | 'reassigned' | 'expired';
  escalatedToId?: string;
  escalatedToName?: string;
}

export interface MultiSignConfig {
  id: string;
  reportId: string;
  requiredSignerCount: number;
  signers: MultiSigner[];
  currentSignedCount: number;
  status: 'collecting' | 'partial' | 'completed' | 'rejected' | 'expired';
  parallelAllowed: boolean;
  windowHours: number;
  startedAt: string;
  completedAt?: string;
}

export interface MultiSigner {
  order: number;
  signerId: string;
  signerName: string;
  signerTitle: ReviewerRole;
  required: boolean;
  signed: boolean;
  signedAt?: string;
  certificateId?: string;
  reason?: string;
  notifyChannel: ('app' | 'sms' | 'email')[];
}

export interface SignConflict {
  id: string;
  reportId: string;
  recordId: string;
  conflictType: ConflictType;
  detectedAt: string;
  detectedBy: 'system' | 'manual' | 'audit-scan';
  parties: SignConflictParty[];
  description: string;
  resolution?: ConflictResolution;
  resolvedAt?: string;
  resolvedById?: string;
  resolvedByName?: string;
  status: 'open' | 'investigating' | 'resolved' | 'unresolvable';
}

export interface SignConflictParty {
  partyId: string;
  partyName: string;
  partyTitle: ReviewerRole;
  role: 'cosigner' | 'author' | 'reviewer' | 'witness';
  involved: boolean;
  statement?: string;
}

export interface SuperiorAssignRule {
  id: string;
  name: string;
  enabled: boolean;
  scope: {
    modalities?: string[];
    bodyParts?: string[];
    departments?: string[];
    priorities?: CosignPriority[];
  };
  criteria: {
    minTitle: ReviewerRole;
    excludeSamePerson: boolean;
    excludeRecentAuthors: boolean;
    preferOnline: boolean;
    preferLowestWorkload: boolean;
    requireValidCert: boolean;
  };
  fallbackStrategy: 'next-rank' | 'round-robin' | 'manual-pool' | 'dean';
  notifyChannels: ('app' | 'sms' | 'email')[];
  createdAt: string;
  updatedAt: string;
}

export interface CosignSLAConfig {
  id: string;
  stage: ReviewStage;
  defaultMinutes: number;
  byPriority: Record<CosignPriority, number>;
  byModality: Record<string, number>;
  byReason: Record<CosignTriggerReason, number>;
  warnMinutes: number;
  breachAction: 'remind' | 'reassign' | 'escalate';
  remindIntervalMinutes: number;
  maxRemindCount: number;
  escalateToRole?: ReviewerRole;
  updatedAt: string;
  updatedBy: string;
}

export interface CosignSLAMetric {
  recordId: string;
  reportId: string;
  cosignerId: string;
  cosignerName: string;
  triggerReason: CosignTriggerReason;
  priority: CosignPriority;
  slaMinutes: number;
  elapsedMinutes: number;
  status: 'on-track' | 'warning' | 'breached';
  breachByMinutes: number;
  remainingMinutes: number;
  reminderSentCount?: number;
  lastReminderAt?: string;
}

export interface CosignSkipConfig {
  id: string;
  enabled: boolean;
  conditions: CosignSkipCondition[];
  requiresAuthorization: boolean;
  authorizedRoles: ReviewerRole[];
  auditLevel: 'standard' | 'enhanced' | 'legal';
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CosignSkipCondition {
  id: string;
  reason: SkipReason;
  description: string;
  enabled: boolean;
  matchRules: {
    modality?: string[];
    bodyPart?: string[];
    priority?: CosignPriority[];
    authorTitle?: ReviewerRole[];
    minQualityScore?: number;
  };
  requiresComment: boolean;
}

export interface TemporaryAuth {
  id: string;
  granteeId: string;
  granteeName: string;
  granteeTitle: ReviewerRole;
  granterId: string;
  granterName: string;
  scope: TemporaryAuthScope;
  scopeDetail: {
    reportIds?: string[];
    departmentId?: string;
    modality?: string;
    startAt: string;
    endAt: string;
  };
  reason: string;
  status: 'active' | 'expired' | 'revoked';
  usedCount: number;
  createdAt: string;
  revokedAt?: string;
  revokedBy?: string;
  revokeReason?: string;
}

export interface BatchCosignRequest {
  id: string;
  reportIds: string[];
  cosignerId: string;
  cosignerName: string;
  decision: 'approve' | 'reject';
  comment?: string;
  skipReason?: SkipReason;
  requireCertCheck: boolean;
  startedAt: string;
  completedAt?: string;
  results: BatchCosignResult[];
  totalCount: number;
  successCount: number;
  failCount: number;
  skipCount: number;
}

export interface BatchCosignResult {
  recordId: string;
  reportId: string;
  status: 'approved' | 'rejected' | 'skipped' | 'failed';
  reason?: string;
  signedAt?: string;
  signatureValue?: string;
}

export interface CosignCalendarEntry {
  id: string;
  date: string;
  shiftType: 'morning' | 'afternoon' | 'evening' | 'night';
  reviewerId: string;
  reviewerName: string;
  reviewerTitle: ReviewerRole;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  reserved: number;
  status: 'scheduled' | 'on-duty' | 'off-duty' | 'leave';
  specialties?: string[];
  note?: string;
}

export interface CosignDashboardKPI {
  totalScheduled: number;
  totalTriggered: number;
  totalSigned: number;
  totalRejected: number;
  totalExpired: number;
  totalSkipped: number;
  avgResponseMinutes: number;
  p95ResponseMinutes: number;
  onTimeRate: number;
  conflictCount: number;
  conflictResolvedCount: number;
  tempAuthActive: number;
  batchCount: number;
  byReason: Record<CosignTriggerReason, number>;
  byPriority: Record<CosignPriority, number>;
  byCosigner: { cosignerId: string; cosignerName: string; count: number; avgMinutes: number }[];
}

export const COSIGN_SLA_DEFAULTS = {
  routine: 240,
  urgent: 60,
  stat: 15,
  scheduled: 1440,
  warnRatio: 0.25,
};

export const COSIGN_TRIGGER_REASON_LABEL: Record<CosignTriggerReason, string> = {
  'critical-finding': '危急值',
  'stat-emergency': '急诊',
  'special-study': '特殊检查',
  'director-required': '主任签发',
  'quality-flag': '质量告警',
  'manual-escalation': '人工升级',
  'rectify-after-reject': '整改重审',
};

export const COSIGN_STATUS_LABEL: Record<CosignStatus, string> = {
  pending: '待签',
  scheduled: '已排',
  'in-progress': '签中',
  signed: '已签',
  rejected: '已拒',
  expired: '已超时',
  escalated: '已升级',
  skipped: '已跳',
  cancelled: '已撤',
};

export const CONFLICT_TYPE_LABEL: Record<ConflictType, string> = {
  'duplicate-signature': '重复签',
  'overlapping-cosigner': '同主任覆盖',
  'expired-cert': '证书过期',
  'role-violation': '角色越权',
  'time-window-violation': '时窗越界',
  'identity-mismatch': '身份不符',
  'lock-conflict': '锁冲突',
};

export const TEMP_AUTH_SCOPE_LABEL: Record<TemporaryAuthScope, string> = {
  'single-cosign': '单次签',
  'department-cosign': '科室签',
  'modality-cosign': '设备签',
  'shift-window': '班次窗',
};

export const SKIP_REASON_LABEL: Record<SkipReason, string> = {
  'chief-signed-by-resident': '住院代签',
  'verified-by-ai': 'AI 验证',
  'training-case': '教学案例',
  'legacy-migration': '历史迁移',
  'director-authorized': '主任特批',
};

export type CosignTriggerReasonKey = keyof typeof COSIGN_TRIGGER_REASON_LABEL;
export type CosignStatusKey = keyof typeof COSIGN_STATUS_LABEL;
export type ConflictTypeKey = keyof typeof CONFLICT_TYPE_LABEL;
export type TemporaryAuthScopeKey = keyof typeof TEMP_AUTH_SCOPE_LABEL;
export type SkipReasonKey = keyof typeof SKIP_REASON_LABEL;

export type CosignPayload = {
  reviewer?: Reviewer;
  calendar?: CosignCalendarEntry[];
  records?: CosignRecord[];
};