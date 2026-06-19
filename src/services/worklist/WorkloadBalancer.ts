/**
 * G005 RIS v3.0.6.6 - 跨院区工作量均衡器
 * 60 点升级 - 工作负载监控 + 自动再分配
 */

import type { WorkloadSite, WorkloadRedistributionPlan } from '../../types/workflow';

export interface SiteCapacityInput {
  siteId: string;
  siteName: string;
  doctors: number;
  activeStudies: number;
  pendingReports: number;
  completedToday: number;
  averageReportMinutes: number;
  utilizationPct: number;
}

export interface BalanceInput {
  sites: SiteCapacityInput[];
  pendingStudyIds: string[];
  reason?: string;
  minTransferSize?: number;
  maxTransferSize?: number;
}

export class WorkloadBalancer {
  private sites: WorkloadSite[] = [];

  ingest(sites: SiteCapacityInput[]): WorkloadSite[] {
    const now = new Date().toISOString();
    this.sites = sites.map((s) => ({
      siteId: s.siteId,
      siteName: s.siteName,
      doctors: s.doctors,
      activeStudies: s.activeStudies,
      pendingReports: s.pendingReports,
      completedToday: s.completedToday,
      averageReportMinutes: s.averageReportMinutes,
      utilizationPct: s.utilizationPct,
      capacityScore: this.computeCapacityScore(s),
      lastUpdated: now,
    }));
    return this.sites;
  }

  private computeCapacityScore(site: SiteCapacityInput): number {
    const perDoctorLoad = site.doctors > 0 ? site.pendingReports / site.doctors : site.pendingReports;
    const utilization = site.utilizationPct / 100;
    return Math.round((perDoctorLoad * 0.6 + utilization * 50 * 0.4) * 10) / 10;
  }

  getSites(): WorkloadSite[] {
    return [...this.sites];
  }

  findHotspots(threshold = 80): WorkloadSite[] {
    return this.sites.filter((s) => s.utilizationPct >= threshold);
  }

  findIdle(threshold = 40): WorkloadSite[] {
    return this.sites.filter((s) => s.utilizationPct < threshold);
  }

  balance(input: BalanceInput): WorkloadRedistributionPlan[] {
    this.ingest(input.sites);
    const hot = [...this.findHotspots()].sort((a, b) => b.utilizationPct - a.utilizationPct);
    const idle = [...this.findIdle()].sort((a, b) => a.utilizationPct - b.utilizationPct);
    const plans: WorkloadRedistributionPlan[] = [];

    if (hot.length === 0 || idle.length === 0) return plans;

    const minSize = input.minTransferSize ?? 1;
    const maxSize = input.maxTransferSize ?? 8;

    for (const heavy of hot) {
      if (heavy.utilizationPct < 70) continue;
      for (const light of idle) {
        if (light.utilizationPct > 65) continue;
        const transferCount = Math.min(
          maxSize,
          Math.max(minSize, Math.round((heavy.utilizationPct - light.utilizationPct) / 10)),
        );
        if (transferCount <= 0) continue;
        plans.push({
          fromSiteId: heavy.siteId,
          toSiteId: light.siteId,
          studyIds: input.pendingStudyIds.slice(0, transferCount),
          reason: input.reason ?? `${heavy.siteName} 利用率 ${heavy.utilizationPct}% → ${light.siteName} 利用率 ${light.utilizationPct}%`,
          estimatedImpactMinutes: transferCount * (heavy.averageReportMinutes - light.averageReportMinutes),
          generatedAt: new Date().toISOString(),
        });
        input.pendingStudyIds = input.pendingStudyIds.slice(transferCount);
        if (input.pendingStudyIds.length === 0) break;
      }
      if (input.pendingStudyIds.length === 0) break;
    }

    return plans;
  }

  redistribute(siteId: string, targetSiteId: string, studyIds: string[]): WorkloadRedistributionPlan {
    const plan: WorkloadRedistributionPlan = {
      fromSiteId: siteId,
      toSiteId: targetSiteId,
      studyIds,
      reason: '手动触发跨院区重分配',
      estimatedImpactMinutes: studyIds.length * 5,
      generatedAt: new Date().toISOString(),
    };
    const from = this.sites.find((s) => s.siteId === siteId);
    const to = this.sites.find((s) => s.siteId === targetSiteId);
    if (from) {
      from.activeStudies = Math.max(0, from.activeStudies - studyIds.length);
      from.utilizationPct = Math.max(0, from.utilizationPct - studyIds.length * 2);
      from.lastUpdated = new Date().toISOString();
    }
    if (to) {
      to.activeStudies += studyIds.length;
      to.utilizationPct = Math.min(100, to.utilizationPct + studyIds.length * 2);
      to.lastUpdated = new Date().toISOString();
    }
    return plan;
  }
}

export const workloadBalancer = new WorkloadBalancer();