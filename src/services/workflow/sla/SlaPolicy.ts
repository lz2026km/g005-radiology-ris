/**
 * G005 RIS v3.0.6.6 - SLA 策略引擎
 * 60 点升级 - 时效监控/违规检测/升级流转
 */

import type {
  SLACheckResult,
  SLAPolicyConfig,
  SLASeverity,
} from '../../../types/workflow';

export interface SLACheckInput {
  studyId: string;
  modality: string;
  priority: 'normal' | 'urgent' | 'critical';
  createdAt: string;
  stage?: 'exam' | 'report' | 'review' | 'publish';
  examCompletedAt?: string;
  reportStartedAt?: string;
  reportCompletedAt?: string;
  publishedAt?: string;
}

export interface SLAEscalationAction {
  level: 'warning' | 'lead' | 'director' | 'admin';
  notifyUserIds: string[];
  message: string;
  generatedAt: string;
}

export interface SLABreach {
  stage: string;
  severity: SLASeverity;
  elapsedMinutes: number;
  thresholdMinutes: number;
  detectedAt: string;
}

const DEFAULT_POLICIES: SLAPolicyConfig[] = [
  { modality: 'CT', priority: 'critical', minutesToReport: 30, minutesToReview: 15, minutesToPublish: 60, escalationMinutes: 45 },
  { modality: 'CT', priority: 'urgent', minutesToReport: 90, minutesToReview: 60, minutesToPublish: 180, escalationMinutes: 120 },
  { modality: 'CT', priority: 'normal', minutesToReport: 240, minutesToReview: 240, minutesToPublish: 480, escalationMinutes: 360 },
  { modality: 'MR', priority: 'critical', minutesToReport: 45, minutesToReview: 30, minutesToPublish: 90, escalationMinutes: 60 },
  { modality: 'MR', priority: 'urgent', minutesToReport: 180, minutesToReview: 120, minutesToPublish: 360, escalationMinutes: 240 },
  { modality: 'MR', priority: 'normal', minutesToReport: 480, minutesToReview: 360, minutesToPublish: 720, escalationMinutes: 600 },
  { modality: 'DR', priority: 'critical', minutesToReport: 15, minutesToReview: 10, minutesToPublish: 30, escalationMinutes: 20 },
  { modality: 'DR', priority: 'urgent', minutesToReport: 60, minutesToReview: 30, minutesToPublish: 120, escalationMinutes: 90 },
  { modality: 'DR', priority: 'normal', minutesToReport: 120, minutesToReview: 120, minutesToPublish: 240, escalationMinutes: 180 },
  { modality: 'DSA', priority: 'critical', minutesToReport: 20, minutesToReview: 10, minutesToPublish: 40, escalationMinutes: 30 },
  { modality: 'US', priority: 'normal', minutesToReport: 60, minutesToReview: 60, minutesToPublish: 180 },
];

export class SlaPolicyEngine {
  private policies: SLAPolicyConfig[];

  constructor(policies: SLAPolicyConfig[] = DEFAULT_POLICIES) {
    this.policies = [...policies];
  }

  setPolicies(policies: SLAPolicyConfig[]): void {
    this.policies = [...policies];
  }

  listPolicies(): SLAPolicyConfig[] {
    return [...this.policies];
  }

  upsert(policy: SLAPolicyConfig): void {
    const idx = this.policies.findIndex((p) => p.modality === policy.modality && p.priority === policy.priority);
    if (idx >= 0) this.policies[idx] = policy;
    else this.policies.push(policy);
  }

  remove(modality: string, priority: SLAPolicyConfig['priority']): void {
    this.policies = this.policies.filter((p) => !(p.modality === modality && p.priority === priority));
  }

  private lookupPolicy(modality: string, priority: string): SLAPolicyConfig {
    const direct = this.policies.find((p) => p.modality === modality && p.priority === priority);
    if (direct) return direct;
    const fallbackPriority = priority === 'critical' || priority === 'urgent' ? 'urgent' : 'normal';
    const fallback = this.policies.find((p) => p.modality === modality && p.priority === fallbackPriority);
    if (fallback) return fallback;
    return {
      modality,
      priority: fallbackPriority as SLAPolicyConfig['priority'],
      minutesToReport: 240,
      minutesToReview: 240,
      minutesToPublish: 480,
      escalationMinutes: 360,
    };
  }

  check(input: SLACheckInput): SLACheckResult {
    const policy = this.lookupPolicy(input.modality, input.priority);
    const now = Date.now();
    const createdMs = Date.parse(input.createdAt);
    const elapsedMinutes = Number.isFinite(createdMs) ? Math.max(0, Math.floor((now - createdMs) / 60000)) : 0;
    const breachedStages: string[] = [];
    let stageLimit = policy.minutesToReport;
    let stageName = '报告';

    if (input.stage === 'report' || input.stage === 'review') {
      stageLimit = policy.minutesToReview;
      stageName = '审核';
    } else if (input.stage === 'publish') {
      stageLimit = policy.minutesToPublish;
      stageName = '发布';
    }

    if (elapsedMinutes > stageLimit) breachedStages.push(stageName);

    const remaining = stageLimit - elapsedMinutes;
    let severity: SLASeverity = 'normal';
    if (elapsedMinutes > stageLimit) severity = 'breached';
    else if (elapsedMinutes > stageLimit * 0.85) severity = 'critical';
    else if (elapsedMinutes > stageLimit * 0.7) severity = 'warning';

    return {
      studyId: input.studyId,
      modality: input.modality,
      priority: input.priority,
      elapsedMinutes,
      remainingMinutes: remaining,
      severity,
      configuredLimit: stageLimit,
      breachedStages,
    };
  }

  breach(input: SLACheckInput): SLABreach[] {
    const result = this.check(input);
    if (result.severity !== 'breached') return [];
    const policy = this.lookupPolicy(input.modality, input.priority);
    return result.breachedStages.map((stage) => ({
      stage,
      severity: 'breached' as const,
      elapsedMinutes: result.elapsedMinutes,
      thresholdMinutes: policy.minutesToReport,
      detectedAt: new Date().toISOString(),
    }));
  }

  escalate(input: SLACheckInput): SLAEscalationAction | null {
    const result = this.check(input);
    if (result.severity === 'normal') return null;
    const policy = this.lookupPolicy(input.modality, input.priority);
    const escalationMin = policy.escalationMinutes ?? policy.minutesToReport;
    if (result.elapsedMinutes < escalationMin && result.severity !== 'breached') return null;

    let level: SLAEscalationAction['level'] = 'warning';
    const ratio = result.elapsedMinutes / Math.max(1, result.configuredLimit);
    if (ratio >= 1.5) level = 'admin';
    else if (ratio >= 1.2) level = 'director';
    else if (ratio >= 1) level = 'lead';

    const notifyMap: Record<SLAEscalationAction['level'], string[]> = {
      warning: ['role:resident'],
      lead: ['role:lead'],
      director: ['role:director'],
      admin: ['role:admin'],
    };

    return {
      level,
      notifyUserIds: notifyMap[level],
      message: `检查 ${input.studyId} (${input.modality}/${input.priority}) 已耗时 ${result.elapsedMinutes} 分钟,超过阈值 ${result.configuredLimit} 分钟`,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const slaPolicyEngine = new SlaPolicyEngine();