// ============================================================
// G005 放射RIS系统 v2.0.0 - Dexie Hooks (React 集成)
// Phase R8 W6-D
// ============================================================

import { useLiveQuery } from 'dexie-react-hooks';
import { db, reportsRepo, patientsRepo, phrasesRepo, templatesRepo, annotationsRepo, auditRepo, getDbStats } from './schema';

// 实时订阅报告列表
export function useReports(filter?: { status?: string; doctorId?: string; isCritical?: boolean }) {
  return useLiveQuery(async () => {
    if (!filter) return db.reports.orderBy('updatedAt').reverse().toArray();
    let q = db.reports.toCollection();
    if (filter.status) q = q.filter(r => r.status === filter.status);
    if (filter.doctorId) q = q.filter(r => r.doctorId === filter.doctorId);
    if (filter.isCritical !== undefined) q = q.filter(r => r.isCritical === filter.isCritical);
    return q.reverse().sortBy('updatedAt');
  }, [filter?.status, filter?.doctorId, filter?.isCritical]) || [];
}

// 实时订阅单个报告
export function useReport(id: string | undefined) {
  return useLiveQuery(
    () => id ? db.reports.get(id) : undefined,
    [id]
  );
}

// 实时订阅患者列表
export function usePatients() {
  return useLiveQuery(() => db.patients.toArray()) || [];
}

// 实时搜索患者
export function usePatientSearch(query: string) {
  return useLiveQuery(
    async () => {
      if (!query || query.length < 1) return [];
      return patientsRepo.search(query);
    },
    [query]
  ) || [];
}

// 实时订阅短语
export function usePhrases() {
  return useLiveQuery(() => db.phrases.toArray()) || [];
}

// 实时订阅模板
export function useTemplates() {
  return useLiveQuery(() => db.templates.toArray()) || [];
}

// 实时订阅标注
export function useAnnotations(reportId: string | undefined) {
  return useLiveQuery(
    () => reportId ? db.annotations.where('reportId').equals(reportId).toArray() : [],
    [reportId]
  ) || [];
}

// 实时订阅审计日志
export function useAuditLogs(limit = 100) {
  return useLiveQuery(
    () => db.auditLogs.orderBy('id').reverse().limit(limit).toArray(),
    [limit]
  ) || [];
}

// 实时数据库统计
export function useDbStats() {
  return useLiveQuery(() => getDbStats()) || null;
}

export { db, reportsRepo, patientsRepo, phrasesRepo, templatesRepo, annotationsRepo, auditRepo };
