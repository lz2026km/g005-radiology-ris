import type { CohortDefinition, CohortFilter, CohortComparisonRow, CohortRetention, Period, TimeRange } from '../../../types/analytics';
import { ANALYTICS_KPIS } from '../../../data/analyticsKpis';

export class CohortAnalyzer {
  private cohorts: Map<string, CohortDefinition>;

  constructor() {
    this.cohorts = new Map();
  }

  addCohort(def: CohortDefinition): void {
    this.cohorts.set(def.id, def);
  }

  getCohort(id: string): CohortDefinition | undefined {
    return this.cohorts.get(id);
  }

  getAllCohorts(): CohortDefinition[] {
    return [...this.cohorts.values()];
  }

  compare(cohortIds: string[], _range: TimeRange): CohortComparisonRow[] {
    return cohortIds.map(id => {
      const cohort = this.cohorts.get(id);
      const metrics: Record<string, number> = {};
      const subset = ANALYTICS_KPIS.slice(0, 6);
      for (const def of subset) {
        const base = Math.abs(this.hashCode(id + def.id)) % 100;
        metrics[def.id] = Math.round((base + 10) * 10) / 10;
      }
      return {
        cohortId: id,
        cohortName: cohort?.name ?? id,
        size: cohort?.size ?? Math.floor(Math.random() * 500 + 50),
        metrics,
      };
    });
  }

  retention(cohortId: string, months: number): CohortRetention[] {
    return Array.from({ length: months }, (_, i) => ({
      cohortId,
      period: i + 1,
      retention: Math.round(Math.max(0, 1 - (i * 0.12 + Math.random() * 0.05)) * 1000) / 1000,
    }));
  }

  filterBy(filter: CohortFilter): CohortDefinition[] {
    return this.getAllCohorts().filter(c => {
      if (filter.ageMin !== undefined && (c.filter.ageMin ?? 0) < filter.ageMin) return false;
      if (filter.ageMax !== undefined && (c.filter.ageMax ?? 999) > filter.ageMax) return false;
      if (filter.gender && c.filter.gender !== filter.gender) return false;
      if (filter.modality?.length && !filter.modality.some(m => c.filter.modality?.includes(m))) return false;
      if (filter.diagnosis?.length && !filter.diagnosis.some(d => c.filter.diagnosis?.includes(d))) return false;
      return true;
    });
  }

  registerDefaults(): void {
    this.addCohort({ id: 'cohort-all', name: '全体患者', filter: {}, size: 5842 });
    this.addCohort({ id: 'cohort-ct', name: 'CT检查', filter: { modality: ['CT'] }, size: 2134 });
    this.addCohort({ id: 'cohort-mr', name: 'MR检查', filter: { modality: ['MR'] }, size: 1256 });
    this.addCohort({ id: 'cohort-male', name: '男性患者', filter: { gender: '男' }, size: 3120 });
    this.addCohort({ id: 'cohort-female', name: '女性患者', filter: { gender: '女' }, size: 2722 });
    this.addCohort({ id: 'cohort-elderly', name: '老年(≥60岁)', filter: { ageMin: 60 }, size: 1845 });
    this.addCohort({ id: 'cohort-young', name: '青年(<30岁)', filter: { ageMax: 30 }, size: 1234 });
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

export const cohortAnalyzer = new CohortAnalyzer();
cohortAnalyzer.registerDefaults();
