/**
 * G005 RIS v3.0.6.6 - 自动重分配引擎
 * 40 点升级 - 医生缺席时自动重新分配任务
 */

import type { RadiologyExam } from '../../types';
import type { WorkloadRedistributionPlan } from '../../types/workflow';
import { WorkloadBalancer, type SiteCapacityInput } from './WorkloadBalancer';

export interface AbsenceEvent {
  doctorId: string;
  doctorName: string;
  reason: 'leave' | 'sick' | 'meeting' | 'training' | 'emergency';
  startedAt: string;
  expectedReturnAt?: string;
}

export interface RedistributionResult {
  plan: WorkloadRedistributionPlan[];
  affectedExams: RadiologyExam[];
  redistributedExamIds: string[];
  notificationTargets: string[];
  generatedAt: string;
}

export class RedistributionEngine {
  constructor(private readonly balancer: WorkloadBalancer = new WorkloadBalancer()) {}

  handleAbsence(
    event: AbsenceEvent,
    exams: RadiologyExam[],
    sites: SiteCapacityInput[],
  ): RedistributionResult {
    const affected = exams.filter((e) => e.radiologistId === event.doctorId && ['已分配', '书写中', '待报告'].includes(e.status));
    if (affected.length === 0) {
      return {
        plan: [],
        affectedExams: [],
        redistributedExamIds: [],
        notificationTargets: [],
        generatedAt: new Date().toISOString(),
      };
    }
    const plan = this.balancer.balance({
      sites,
      pendingStudyIds: affected.map((e) => e.id),
      reason: `医生 ${event.doctorName} ${event.reason} 自动重分配`,
      minTransferSize: 1,
      maxTransferSize: Math.min(6, affected.length),
    });
    const redistributedExamIds = plan.flatMap((p) => p.studyIds);
    const notificationTargets = Array.from(
      new Set(
        plan.flatMap((p) => {
          const site = sites.find((s) => s.siteId === p.toSiteId);
          return site ? [`site:${site.siteId}`] : [];
        }),
      ),
    );

    return {
      plan,
      affectedExams: affected,
      redistributedExamIds,
      notificationTargets,
      generatedAt: new Date().toISOString(),
    };
  }

  redistributeOnDemand(
    siteId: string,
    targetSiteId: string,
    examIds: string[],
    exams: RadiologyExam[],
  ): { plan: WorkloadRedistributionPlan; movedExams: RadiologyExam[] } {
    const plan = this.balancer.redistribute(siteId, targetSiteId, examIds);
    const movedExams = exams.filter((e) => examIds.includes(e.id));
    return { plan, movedExams };
  }
}

export const redistributionEngine = new RedistributionEngine();