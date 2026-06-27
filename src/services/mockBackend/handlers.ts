/**
 * G005 鏀惧皠RIS绯荤粺 v3.0.0 - MSW Mock 鍚庣澶勭悊鍣?
 * Phase T4-W9: 50+ 绔偣(瀵规帴 src/services/openapi.ts)
 *
 * 瑕嗙洊 9 澶?tag:
 *   reports / patients / imaging / ai / ca / audit / collab / terms / stats
 *   + 涓氬姟瀛愭ā鍧?worklist / device / critical / appointment / print
 */

import { http, HttpResponse, delay } from 'msw';
// [v3.0.6.8-32] 涓绘暟鎹睜 + 涓氬姟閫昏緫
import {
  list, get, create, update, remove, findMany, findOne, stats, isUsingIndexedDB, listAudit,
} from './store';
import {
  parseQuery, applyQuery, groupBy, sumBy, avgBy, filterByDateRange,
} from './queryBuilder';
import {
  toPatientDto, toDeviceDto, toUserDto, toExamDto, toReportDto,
  toExamItemDto, toDoctorPerformanceDto, toDailyKpiDto, toCriticalEventDto, toCosignTaskDto,
} from './adapters';
import { auditCreate, auditUpdate, auditDelete, auditStatusChange } from './audit';
import {
  canTransitionReport, transitionReport, canTransitionWorklist,
  getSlaMinutes, getEscalationTargets, checkSlaBreach,
  determineCosignTrigger, getCosignSlaMinutes, getReviewSlaMinutes,
  getNextMaintenanceDate, isMaintenanceOverdue, daysUntilMaintenance,
  recordWorkflowEvent, calculateImageGrade, listWorkflowEvents,
} from './businessLogic';
import { v4 as uuidv4 } from 'uuid';
import { reportSubsystemMock } from '@data/reportSubsystemMock';
import { initialRadiologyExams, initialUsers } from '@data/initialData';
import { TERM_CATEGORIES, FEATURED_TERMS } from '@data/knowledgeStatsMock';
import type { RadiologyReport } from '@/types';
import { writingHandlers, distributionHandlers, integrationHandlers, otherHandlers, cosignHandlers, qualityReportHandlers, aiAssistHandlers } from './v3ReportHandlers';
import { qualityScoringHandlers } from './qualityScoringHandlers';
import { reviewAssistHandlers } from './v3ReviewHandlers';
// [v3.0.6.8-33] 鐪肩涓撶 180+ 绔偣
import { eyeHandlers } from './eyeHandlers';
import {
  CHECK_ITEM_TEMPLATES,
  INITIAL_CHECK_LISTS,
  INITIAL_CHECK_AUDIT,
  INITIAL_CHECK_SLA_CONFIG,
  INITIAL_CHECK_CUSTOM_ITEMS,
  INITIAL_CHECK_WORKLOAD,
  INITIAL_CHECK_SUMMARY,
} from '@data/reportInitialCheckMock';
import {
  FINAL_CHECK_TEMPLATES,
  FINAL_CHECK_LISTS,
  CLINICAL_CONSISTENCY_RESULTS,
  FINAL_SCORING_RUBRICS,
  FINAL_SCORING_RESULTS,
  FINAL_REVIEW_NOTES,
  FINAL_CHECK_WORKLOAD,
  PRIOR_REPORT_COMPARISONS,
  FINAL_MULTI_SIGNATURE_REQUESTS,
  EMERGENCY_REVIEW_REQUESTS,
  FINAL_CHECK_WORKFLOW_CONFIGS,
  FINAL_CHECK_EVENTS,
  buildSummary as buildFinalCheckSummary,
} from '@data/reportFinalCheckMock';
import { REVIEW_TASKS } from '@data/reportReviewMock';
import { APPOINTMENT_RECORDS } from '@data/initialData';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// v3.0.6.8-13: 鍔ㄦ€?API_BASE,鍩轰簬褰撳墠 origin
// 鍘? 'http://localhost:5173/api/v1' 纭紪鐮佸鑷翠笉鍚岀鍙?5199)鏃犳硶鍖归厤
const API_BASE = (typeof window !== 'undefined' && window.location?.origin
  ? window.location.origin + '/api/v1'
  : 'http://localhost:5173/api/v1');

// ============= Auth (3) =============
export const authHandlers = [
  http.post(`${API_BASE}/auth/login`, async () => {
    await delay(150);
    return HttpResponse.json({
      success: true,
      data: {
        token: uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, ''),
        refreshToken: uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, ''),
        expiresAt: Date.now() + 15 * 60 * 1000,
        userId: 'u-' + uuidv4().slice(0, 8),
        userName: 'demo',
        role: '鍖荤敓',
      },
    });
  }),

  http.post(`${API_BASE}/auth/refresh`, async () => {
    await delay(80);
    return HttpResponse.json({
      success: true,
      data: { token: uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '') },
    });
  }),

  http.post(`${API_BASE}/auth/logout`, async () => new HttpResponse(null, { status: 204 })),
];

// ============= Reports(24) - v3.0.6.8-32 鎺ュ叆 EXAM_REPORT_PRE + QUALITY_SCORE_PRE =============
export const reportHandlers = [
  // 鍒楄〃 (EXAM_REPORT_PRE 600 + QUALITY_SCORE_PRE 250 鍚堝苟)
  http.get(`${API_BASE}/reports`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('exams');
    const qMap = new Map(list<any>('qualityScores').map((q: any) => [q.reportId, q]));
    const result = applyQuery(all, opts, ['patientName', 'reportId', 'examItem', 'bodyPart']);
    return HttpResponse.json({
      success: true,
      data: result.data.map((r: any) => toReportDto(r, qMap.get(r.reportId))),
      meta: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages },
    });
  }),

  // 缁熻 (蹇呴』鍦?:id 涔嬪墠)
  http.get(`${API_BASE}/reports/stats`, async () => {
    await delay(80);
    const all = list<any>('exams');
    const byStatus: Record<string, number> = {};
    const byModality: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let totalDefect = 0;
    let totalCritical = 0;
    for (const r of all) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      byModality[r.modality] = (byModality[r.modality] || 0) + 1;
      byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
      totalDefect += r.defectCount || 0;
      if (r.hasCriticalValue) totalCritical++;
    }
    return HttpResponse.json({ success: true, data: { total: all.length, byStatus, byModality, byPriority, totalDefect, totalCritical } });
  }),

  // 璇︽儏
  http.get(`${API_BASE}/reports/:id`, async ({ params }) => {
    await delay(50);
    const report = get<any>('exams', params.id as string);
    if (!report) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } }, { status: 404 });
    const q = findOne<any>('qualityScores', (x: any) => x.reportId === params.id);
    return HttpResponse.json({ success: true, data: toReportDto(report, q) });
  }),

  // 宸垎 (鏂版棫鐗堟湰瀵规瘮)
  http.get(`${API_BASE}/reports/:id/diff`, async ({ params }) => {
    await delay(80);
    const report = get<any>('exams', params.id as string);
    if (!report) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: {
      reportId: params.id,
      current: { findings: report.findings, impression: report.impression },
      previous: { findings: report.findings + ' (鏃х増)', impression: report.impression + ' (鏃х増)' },
      diff: [
        { field: 'findings', type: 'modified', oldValue: '鏃х増', newValue: '鏂扮増' },
      ],
    } });
  }),

  // 绛惧悕璇佷功淇℃伅
  http.get(`${API_BASE}/reports/:id/sign-cert`, async ({ params }) => {
    await delay(50);
    return HttpResponse.json({ success: true, data: {
      reportId: params.id,
      signedBy: 'D001',
      signedAt: new Date().toISOString(),
      certificateId: 'CFCA-' + Math.random().toString(36).substring(7).toUpperCase(),
      algorithm: 'RSA-SHA256',
      timestamp: new Date().toISOString(),
    } });
  }),

  // 鍙岀杩借釜
  http.get(`${API_BASE}/reports/:id/cosign-track`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: {
      reportId: params.id,
      slots: [
        { role: '涓绘不鍖诲笀', doctor: 'D002', status: 'signed', signedAt: new Date().toISOString() },
        { role: '涓讳换鍖诲笀', doctor: 'D001', status: 'pending', required: true },
      ],
    } });
  }),

  // 鍒涘缓
  http.post(`${API_BASE}/reports`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    const newReport = {
      reportId: body.reportId || `RPT-${Date.now()}`,
      ...body,
      status: 'draft',
      examAt: body.examAt || new Date().toISOString(),
      reportAt: new Date().toISOString(),
    };
    create('exams', newReport);
    auditCreate('reports', newReport);
    return HttpResponse.json({ success: true, data: toReportDto(newReport) }, { status: 201 });
  }),

  // 鏇存柊 (甯︾姸鎬佹満鏍￠獙)
  http.put(`${API_BASE}/reports/:id`, async ({ params, request }) => {
    await delay(120);
    const id = params.id as string;
    const body = (await request.json()) as any;
    const before = get<any>('exams', id);
    if (!before) return HttpResponse.json({ success: false }, { status: 404 });
    const updated = update<any>('exams', id, body);
    if (updated) auditUpdate('reports', before, updated);
    return HttpResponse.json({ success: true, data: updated ? toReportDto(updated) : null });
  }),

  // 鍒犻櫎
  http.delete(`${API_BASE}/reports/:id`, async ({ params }) => {
    await delay(100);
    const id = params.id as string;
    const before = get<any>('exams', id);
    const existed = remove('exams', id);
    if (existed) auditDelete({ resource: 'reports', resourceId: id, before });
    return new HttpResponse(null, { status: existed ? 204 : 404 });
  }),

  // 鐘舵€佹満: 鎻愪氦
  http.post(`${API_BASE}/reports/:id/submit`, async ({ params }) => {
    await delay(120);
    const id = params.id as string;
    const before = get<any>('exams', id);
    if (!before) return HttpResponse.json({ success: false }, { status: 404 });
    if (!canTransitionReport(mapReportStatus(before.status), 'submitted')) {
      return HttpResponse.json({ success: false, error: { code: 'INVALID_TRANSITION', message: `Cannot transition from ${before.status} to submitted` } }, { status: 400 });
    }
    const updated = update<any>('exams', id, { status: 'submitted', reportAt: new Date().toISOString() });
    if (updated) {
      auditStatusChange('reports', updated, before.status, 'submitted');
      recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'submit', entityType: 'reports', entityId: id, fromState: before.status, toState: 'submitted' });
    }
    return HttpResponse.json({ success: true, data: toReportDto(updated) });
  }),

  // 瀹℃牳
  http.post(`${API_BASE}/reports/:id/review`, async ({ params }) => {
    await delay(150);
    const id = params.id as string;
    const before = get<any>('exams', id);
    if (!before) return HttpResponse.json({ success: false }, { status: 404 });
    const updated = update<any>('exams', id, { status: 'reviewed', reviewedAt: new Date().toISOString() });
    if (updated) {
      auditStatusChange('reports', updated, before.status, 'reviewed');
      recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'review', entityType: 'reports', entityId: id, fromState: before.status, toState: 'reviewed' });
    }
    return HttpResponse.json({ success: true, data: toReportDto(updated) });
  }),

  // 绛惧彂 (CA 绛惧悕)
  http.post(`${API_BASE}/reports/:id/sign`, async ({ params, request }) => {
    await delay(300);
    const id = params.id as string;
    const before = get<any>('exams', id);
    if (!before) return HttpResponse.json({ success: false }, { status: 404 });
    const body = (await request.json()) as { certificateId: string };
    const updated = update<any>('exams', id, { status: 'published', signedAt: new Date().toISOString(), signatureHash: 'mock-' + Math.random().toString(36).substring(7) });
    if (updated) {
      auditStatusChange('reports', updated, before.status, 'published');
      recordWorkflowEvent({ actorId: 'system', actorName: '鍖荤敓', action: 'sign', entityType: 'reports', entityId: id, fromState: before.status, toState: 'published', metadata: body });
    }
    return HttpResponse.json({ success: true, data: { ...toReportDto(updated), signatureHash: 'mock-' + Math.random().toString(36).substring(7) } });
  }),

  // 椹冲洖
  http.post(`${API_BASE}/reports/:id/reject`, async ({ params, request }) => {
    await delay(150);
    const id = params.id as string;
    const before = get<any>('exams', id);
    if (!before) return HttpResponse.json({ success: false }, { status: 404 });
    const body = (await request.json()) as { reason: string };
    if (!body.reason || body.reason.trim().length < 5) {
      return HttpResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Reject reason must be at least 5 characters' } }, { status: 400 });
    }
    const updated = update<any>('exams', id, { status: 'draft', rejectReason: body.reason, rejectedAt: new Date().toISOString() });
    if (updated) auditStatusChange('reports', updated, before.status, 'rejected');
    return HttpResponse.json({ success: true, data: updated ? toReportDto(updated) : null });
  }),

  // 淇
  http.post(`${API_BASE}/reports/:id/revise`, async ({ params, request }) => {
    await delay(150);
    const id = params.id as string;
    const before = get<any>('exams', id);
    if (!before) return HttpResponse.json({ success: false }, { status: 404 });
    const body = (await request.json()) as { reason: string };
    const updated = update<any>('exams', id, { status: 'submitted', reviseReason: body.reason, revisedAt: new Date().toISOString() });
    if (updated) {
      auditStatusChange('reports', updated, before.status, 'revised');
      recordWorkflowEvent({ actorId: 'system', actorName: '鍖荤敓', action: 'revise', entityType: 'reports', entityId: id, fromState: before.status, toState: 'revised', metadata: body });
    }
    return HttpResponse.json({ success: true, data: toReportDto(updated) });
  }),

  // [v3.0.6.8-45] PR1: 鍙戝竷
  http.post(`${API_BASE}/reports/:id/publish`, async ({ params, request }) => {
    await delay(100);
    const id = params.id as string;
    const body = (await request.json().catch(() => ({}))) as { qualityScore?: number };
    const before = get<any>('exams', id);
    if (!before) return HttpResponse.json({ success: false }, { status: 404 });
    const updated = update<any>('exams', id, { status: 'published', publishedAt: new Date().toISOString(), qualityScore: body.qualityScore || 85 });
    if (updated) {
      auditStatusChange('reports', updated, before.status, 'published');
      recordWorkflowEvent({ actorId: 'system', actorName: '鍖荤敓', action: 'publish', entityType: 'reports', entityId: id, fromState: before.status, toState: 'published', metadata: body });
    }
    return HttpResponse.json({ success: true, data: toReportDto(updated) });
  }),

  // [v3.0.6.8-45] PR1: 鍙岀 (cosign)
  http.post(`${API_BASE}/reports/:id/cosign`, async ({ params, request }) => {
    await delay(100);
    const id = params.id as string;
    const body = (await request.json().catch(() => ({}))) as { cosignerId?: string };
    const before = get<any>('exams', id);
    if (!before) return HttpResponse.json({ success: false }, { status: 404 });
    const updated = update<any>('exams', id, { coSignerId: body.cosignerId, cosignedAt: new Date().toISOString(), status: 'cosigned' });
    if (updated) {
      auditStatusChange('reports', updated, before.status, 'cosigned');
      recordWorkflowEvent({ actorId: body.cosignerId || 'D002', actorName: '鍙岀鍖荤敓', action: 'cosign', entityType: 'reports', entityId: id, fromState: before.status, toState: 'cosigned', metadata: body });
    }
    return HttpResponse.json({ success: true, data: toReportDto(updated) });
  }),

  // 瀹℃牳鍘嗗彶
  http.get(`${API_BASE}/reports/:id/audit-trail`, async ({ params }) => {
    await delay(80);
    const events = listWorkflowEvents({ entityType: 'reports', entityId: params.id as string });
    return HttpResponse.json({ success: true, data: events });
  }),
];

function mapReportStatus(s: string): 'draft' | 'submitted' | 'reviewed' | 'cosigned' | 'published' | 'rejected' | 'revised' {
  const map: Record<string, any> = {
    draft: 'draft',
    submitted: 'submitted',
    reviewed: 'reviewed',
    cosigned: 'cosigned',
    published: 'published',
    rejected: 'rejected',
    revised: 'revised',
  };
  return map[s] || 'draft';
}

// ============= Appointments(5) - v3.0.6.8-13 =============
export const appointmentHandlers = [
  http.get(`${API_BASE}/appointments`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: clone(APPOINTMENT_RECORDS) });
  }),
  http.get(`${API_BASE}/appointments/:id`, async ({ params }) => {
    await delay(80);
    const apt = (APPOINTMENT_RECORDS as Array<Record<string, unknown>>).find((a) => a.id === params.id);
    return apt
      ? HttpResponse.json({ success: true, data: apt })
      : HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }),
  http.post(`${API_BASE}/appointments`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    const newApt = { id: `APT-${Date.now()}`, ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: newApt }, { status: 201 });
  }),
  http.put(`${API_BASE}/appointments/:id/cancel`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'cancelled' } });
  }),
  http.put(`${API_BASE}/appointments/:id`, async ({ params, request }) => {
    await delay(150);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: params.id, ...body } });
  }),
];

// ============= Worklist(20) - v3.0.6.8-32 鎺ュ叆 EXAM_REPORT_PRE =============
export const worklistHandlers = [
  // 鍒楄〃 (EXAM_REPORT_PRE 600 + 鍒嗛〉/鎺掑簭/杩囨护)
  http.get(`${API_BASE}/worklist`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('exams');
    const result = applyQuery<any>(all, opts, ['patientName', 'examItem', 'bodyPart', 'reportId']);
    return HttpResponse.json({ success: true, data: result.data.map(toExamDto), meta: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages } });
  }),

  // 宸ヤ綔鍒楄〃缁熻 (蹇呴』鍦?:id 涔嬪墠)
  http.get(`${API_BASE}/worklist/stats`, async () => {
    await delay(80);
    const all = list<any>('exams');
    const byStatus: Record<string, number> = {};
    const byModality: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    for (const e of all) {
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
      byModality[e.modality] = (byModality[e.modality] || 0) + 1;
      byPriority[e.priority] = (byPriority[e.priority] || 0) + 1;
    }
    return HttpResponse.json({ success: true, data: { total: all.length, byStatus, byModality, byPriority } });
  }),

  // 鍖荤敓鐨勫伐浣滃垪琛?
  http.get(`${API_BASE}/worklist/by-doctor/:doctorId`, async ({ params }) => {
    await delay(80);
    const all = list<any>('exams').filter((e: any) => e.reportDoctorId === params.doctorId);
    return HttpResponse.json({ success: true, data: all.map(toExamDto) });
  }),

  // 璇︽儏
  http.get(`${API_BASE}/worklist/:id`, async ({ params }) => {
    await delay(50);
    const exam = get<any>('exams', params.id as string);
    if (!exam) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Exam not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: toExamDto(exam) });
  }),

  // 闃熷垪娣卞害 (鎸夎澶?妯℃€?
  http.get(`${API_BASE}/worklist/queue-depth`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const modality = url.searchParams.get('modality');
    let all = list<any>('exams').filter((e: any) => e.status === 'submitted' || e.status === 'reviewed');
    if (modality) all = all.filter((e: any) => e.modality === modality);
    return HttpResponse.json({ success: true, data: { pendingCount: all.length, byModality: {} } });
  }),

  // 鍒涘缓
  http.post(`${API_BASE}/worklist`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    const newExam = { ...body, reportId: body.reportId || `RPT-${Date.now()}` };
    create('exams', newExam);
    auditCreate('worklist', newExam);
    return HttpResponse.json({ success: true, data: toExamDto(newExam) }, { status: 201 });
  }),

  // 瀹屾暣鏇存柊
  http.put(`${API_BASE}/worklist/:id`, async ({ params, request }) => {
    await delay(120);
    const id = params.id as string;
    const body = (await request.json()) as any;
    const before = get<any>('exams', id);
    const updated = update<any>('exams', id, body);
    if (updated) auditUpdate('worklist', before, updated);
    return HttpResponse.json({ success: true, data: updated ? toExamDto(updated) : null });
  }),

  // 鐘舵€佹洿鏂?
  http.put(`${API_BASE}/worklist/:id/status`, async ({ params, request }) => {
    await delay(100);
    const id = params.id as string;
    const body = (await request.json()) as { status: string };
    const before = get<any>('exams', id);
    const updated = update<any>('exams', id, { status: body.status });
    if (updated) {
      auditUpdate('worklist', before, updated);
      auditStatusChange('worklist', updated, before?.status || '', body.status);
    }
    return HttpResponse.json({ success: true, data: updated ? toExamDto(updated) : null });
  }),

  // 鐘舵€佹満: 鎶ュ埌 鈫?妫€鏌ヤ腑 鈫?瀹屾垚 鈫?鍙栨秷
  http.post(`${API_BASE}/worklist/:id/checkin`, async ({ params }) => {
    await delay(80);
    const id = params.id as string;
    const before = get<any>('exams', id);
    const updated = update<any>('exams', id, { status: 'submitted', checkinAt: new Date().toISOString() });
    if (updated) {
      auditStatusChange('worklist', updated, before?.status || '', 'submitted');
      recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'checkin', entityType: 'worklist', entityId: id, fromState: before?.status, toState: 'submitted' });
    }
    return HttpResponse.json({ success: true, data: updated ? toExamDto(updated) : null });
  }),

  http.post(`${API_BASE}/worklist/:id/start`, async ({ params }) => {
    await delay(80);
    const id = params.id as string;
    const before = get<any>('exams', id);
    const updated = update<any>('exams', id, { status: 'reviewed', startAt: new Date().toISOString() });
    if (updated) auditStatusChange('worklist', updated, before?.status || '', 'reviewed');
    return HttpResponse.json({ success: true, data: updated ? toExamDto(updated) : null });
  }),

  http.post(`${API_BASE}/worklist/:id/complete`, async ({ params }) => {
    await delay(80);
    const id = params.id as string;
    const before = get<any>('exams', id);
    const updated = update<any>('exams', id, { status: 'published', completeAt: new Date().toISOString() });
    if (updated) {
      auditStatusChange('worklist', updated, before?.status || '', 'published');
      recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'complete', entityType: 'worklist', entityId: id, fromState: before?.status, toState: 'published' });
    }
    return HttpResponse.json({ success: true, data: updated ? toExamDto(updated) : null });
  }),

  http.post(`${API_BASE}/worklist/:id/cancel`, async ({ params, request }) => {
    await delay(80);
    const id = params.id as string;
    const body = (await request.json()) as { reason: string };
    const before = get<any>('exams', id);
    const updated = update<any>('exams', id, { status: 'draft', cancelReason: body.reason, cancelledAt: new Date().toISOString() });
    if (updated) auditStatusChange('worklist', updated, before?.status || '', 'cancelled');
    return HttpResponse.json({ success: true, data: updated ? toExamDto(updated) : null });
  }),

  // 鎵归噺鏀规淳
  http.post(`${API_BASE}/worklist/batch-reassign`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { ids: string[]; doctorId: string; doctorName: string };
    const results: any[] = [];
    for (const id of body.ids) {
      const before = get<any>('exams', id);
      const updated = update<any>('exams', id, { reportDoctorId: body.doctorId });
      results.push({ id, success: !!updated });
      if (updated) auditUpdate('worklist', before, updated);
    }
    return HttpResponse.json({ success: true, data: { reassigned: results.filter(r => r.success).length, results } });
  }),

  // 鍒犻櫎
  http.delete(`${API_BASE}/worklist/:id`, async ({ params }) => {
    await delay(100);
    const id = params.id as string;
    const before = get<any>('exams', id);
    const existed = remove('exams', id);
    if (existed) auditDelete({ resource: 'worklist', resourceId: id, before });
    return new HttpResponse(null, { status: existed ? 204 : 404 });
  }),
];

// ============= Patients(14) - v3.0.6.8-32 鎺ュ叆 PATIENT_MASTER =============
export const patientHandlers = [
  // 鈿狅笍 鍏蜂綋璺緞蹇呴』鍦?:id 涔嬪墠娉ㄥ唽, 鍚﹀垯 /patients/stats 浼氳 :id 鎷︽埅
  // 鍒楄〃 (鎺ュ叆 PATIENT_MASTER 1500 + 鍒嗛〉/鎼滅储/杩囨护)
  http.get(`${API_BASE}/patients`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<unknown>('patients') as any[];
    const result = applyQuery<any>(all, opts, ['name', 'id', 'phone', 'idCard', 'chiefComplaint']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages } });
  }),

  // 鎮ｈ€呯粺璁?(蹇呴』鍦?:id 涔嬪墠)
  http.get(`${API_BASE}/patients/stats`, async () => {
    await delay(80);
    const all = list<any>('patients');
    const byGender: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byModality: Record<string, number> = {};
    let vipCount = 0;
    let totalAge = 0;
    for (const p of all) {
      byGender[p.gender] = (byGender[p.gender] || 0) + 1;
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      byModality[p.modality] = (byModality[p.modality] || 0) + 1;
      if (p.isVIP) vipCount++;
      totalAge += p.age;
    }
    return HttpResponse.json({ success: true, data: {
      total: all.length,
      byGender, byStatus, byModality, vipCount,
      avgAge: all.length > 0 ? Math.round(totalAge / all.length * 10) / 10 : 0,
    } });
  }),

  // 鎵归噺瀵煎叆 (鍏煎 { patients: [...] } 鍜?[...] 涓ょ鏍煎紡)
  http.post(`${API_BASE}/patients/bulk-import`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { patients?: any[] } | any[];
    const list = Array.isArray(body) ? body : (body.patients || []);
    const results: any[] = [];
    for (const item of list) {
      const id = item.id || `P${String(Date.now() + Math.random() * 1000).slice(-6).padStart(6, '0')}`;
      const newPatient = { ...item, id };
      try { create('patients', newPatient); } catch {}
      results.push({ id, success: true });
    }
    return HttpResponse.json({ success: true, data: { imported: results.length, results } });
  }),

  // 鎵归噺瀵煎嚭
  http.get(`${API_BASE}/patients/export.csv`, async () => {
    await delay(200);
    const all = list<any>('patients');
    const header = 'id,name,gender,age,birthDate,phone,patientType,modality,status,priority,isVIP';
    const rows = all.map((p: any) => `${p.id},${p.name},${p.gender},${p.age},${p.birthDate},${p.phone},${p.patientType},${p.modality},${p.status},${p.priority},${p.isVIP}`);
    return new HttpResponse([header, ...rows].join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="patients.csv"' } });
  }),

  // 鎸夋ā鎬佸垎缁?(蹇呴』鍦?:id 涔嬪墠)
  http.get(`${API_BASE}/patients/by-modality/:modality`, async ({ params }) => {
    await delay(80);
    const all = list<any>('patients').filter((p: any) => p.modality === params.modality);
    return HttpResponse.json({ success: true, data: all.map(toPatientDto) });
  }),

  // 鎸夌姸鎬佸垎缁?(蹇呴』鍦?:id 涔嬪墠)
  http.get(`${API_BASE}/patients/by-status/:status`, async ({ params }) => {
    await delay(80);
    const all = list<any>('patients').filter((p: any) => p.status === params.status);
    return HttpResponse.json({ success: true, data: all.map(toPatientDto) });
  }),

  // 璇︽儏 (瀹屾暣 PatientDto 25 瀛楁)
  http.get(`${API_BASE}/patients/:id`, async ({ params }) => {
    await delay(50);
    const p = get<any>('patients', params.id as string);
    if (!p) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Patient not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: toPatientDto(p) });
  }),

  // 鎮ｈ€呯殑妫€鏌?(鎺ュ叆 EXAM_REPORT_PRE)
  http.get(`${API_BASE}/patients/:id/exams`, async ({ params, request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('exams').filter((e: any) => e.patientId === params.id);
    const result = applyQuery<any>(all, opts);
    return HttpResponse.json({ success: true, data: result.data.map(toExamDto), meta: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages } });
  }),

  // 鎮ｈ€呯殑鎶ュ憡 (鎺ュ叆 EXAM_REPORT_PRE + QUALITY_SCORE_PRE)
  http.get(`${API_BASE}/patients/:id/reports`, async ({ params, request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const qMap = new Map(list<any>('qualityScores').map((q: any) => [q.reportId, q]));
    const all = list<any>('exams').filter((e: any) => e.patientId === params.id);
    const result = applyQuery<any>(all, opts);
    return HttpResponse.json({ success: true, data: result.data.map((r: any) => toReportDto(r, qMap.get(r.reportId))), meta: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages } });
  }),

  // 鎮ｈ€呮椂闂寸嚎 (璺ㄦ鏌?鎶ュ憡)
  http.get(`${API_BASE}/patients/:id/timeline`, async ({ params }) => {
    await delay(80);
    const exams = list<any>('exams').filter((e: any) => e.patientId === params.id);
    const criticalEvents = list<any>('criticalEvents').filter((c: any) => c.patientId === params.id);
    const timeline = [
      ...exams.map((e: any) => ({ type: 'exam' as const, timestamp: e.examAt, data: e })),
      ...criticalEvents.map((c: any) => ({ type: 'critical' as const, timestamp: c.discoveredAt, data: c })),
    ].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return HttpResponse.json({ success: true, data: timeline });
  }),

  // 鎮ｈ€呭鍑?
  http.get(`${API_BASE}/patients/:id/export.csv`, async ({ params }) => {
    await delay(150);
    const p = get<any>('patients', params.id as string);
    if (!p) return HttpResponse.json({ success: false }, { status: 404 });
    const csv = `id,name,gender,age,birthDate,phone,idCard,patientType,modality,bodyPart,status,priority,isVIP\n${p.id},${p.name},${p.gender},${p.age},${p.birthDate},${p.phone},${p.idCard},${p.patientType},${p.modality},${p.bodyPart},${p.status},${p.priority},${p.isVIP}`;
    return new HttpResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="patient-${p.id}.csv"` } });
  }),

  // 鍒涘缓 (POST /patients)
  http.post(`${API_BASE}/patients`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    const newId = body.id || `P${String(Date.now()).slice(-6).padStart(6, '0')}`;
    const newPatient = { ...body, id: newId, createdAt: new Date().toISOString() };
    create('patients', newPatient);
    auditCreate('patients', newPatient);
    return HttpResponse.json({ success: true, data: toPatientDto(newPatient) }, { status: 201 });
  }),

  // 鏇存柊 (PUT /patients/:id)
  http.put(`${API_BASE}/patients/:id`, async ({ params, request }) => {
    await delay(120);
    const id = params.id as string;
    const body = (await request.json()) as any;
    const before = get<any>('patients', id);
    const updated = update<any>('patients', id, body);
    if (updated) auditUpdate('patients', before, updated);
    return HttpResponse.json({ success: true, data: updated ? toPatientDto(updated) : null });
  }),

  // 鍒犻櫎 (DELETE /patients/:id) - 浠?RBAC 绠＄悊鍛?
  http.delete(`${API_BASE}/patients/:id`, async ({ params }) => {
    await delay(100);
    const id = params.id as string;
    const before = get<any>('patients', id);
    const existed = remove('patients', id);
    if (existed) auditDelete({ resource: 'patients', resourceId: id, before });
    return new HttpResponse(null, { status: existed ? 204 : 404 });
  }),
];

// ============= Devices(18) - v3.0.6.8-32 鎺ュ叆 DEVICE_MASTER =============
export const deviceHandlers = [
  // 鍒楄〃 (DEVICE_MASTER 35)
  http.get(`${API_BASE}/devices`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('devices');
    const result = applyQuery<any>(all, opts, ['id', 'model', 'brand', 'room', 'building']);
    return HttpResponse.json({ success: true, data: result.data.map(toDeviceDto), meta: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages } });
  }),

  // 缁熻 (蹇呴』鍦?:id 涔嬪墠)
  // 璁惧缁熻 (v3.0.6.8-46 PR2)
  http.get(`${API_BASE}/devices/stats`, async () => {
    await delay(50);
    const all = list<any>('devices');
    return HttpResponse.json({
      success: true,
      data: {
        total: all.length,
        byStatus: all.reduce((acc: any, d: any) => {
          const s = d.status || 'unknown';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {}),
        byModality: all.reduce((acc: any, d: any) => {
          const m = d.modality || 'unknown';
          acc[m] = (acc[m] || 0) + 1;
          return acc;
        }, {}),
        avgUtilization: 0.75,
      },
    });
  }),

  // 璁惧宸ヤ綔閲?(v3.0.6.8-46 PR2)
  http.get(`${API_BASE}/devices/workload`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');
    const all = list<any>('devices');
    return HttpResponse.json({
      success: true,
      data: all.slice(0, 10).map((d: any) => ({
        deviceId: d.id,
        deviceName: d.name,
        modality: d.modality,
        workload: Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString().slice(0, 10),
          scans: Math.floor(Math.random() * 30) + 5,
        })),
      })),
    });
  }),

  http.get(`${API_BASE}/devices/stats/today`, async () => {
    // 淇濈暀鍘熺姸
    await delay(50);
    await delay(80);
    const all = list<any>('devices');
    const byStatus: Record<string, number> = {};
    const byModality: Record<string, number> = {};
    const byGrade: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    let totalMonthlyScans = 0;
    let totalValue = 0;
    let totalDowntime = 0;
    for (const d of all) {
      byStatus[d.status] = (byStatus[d.status] || 0) + 1;
      byModality[d.modality] = (byModality[d.modality] || 0) + 1;
      byGrade[d.imageQualityGrade] = (byGrade[d.imageQualityGrade] || 0) + 1;
      totalMonthlyScans += d.monthlyScans;
      totalValue += d.purchasePrice;
      totalDowntime += d.monthlyDowntime;
    }
    return HttpResponse.json({ success: true, data: {
      total: all.length,
      inUse: byStatus['杩愯涓?] || 0,
      idle: byStatus['寰呮満'] || 0,
      maintenance: byStatus['缁存姢涓?] || 0,
      broken: byStatus['鏁呴殰'] || 0,
      byStatus, byModality, byGrade,
      totalMonthlyScans, totalValue, totalDowntime,
    } });
  }),

  // 鎺掔▼/缁存姢璁″垝
  http.get(`${API_BASE}/devices/schedule`, async () => {
    await delay(80);
    const all = list<any>('devices');
    const schedule = all.map((d: any) => ({
      deviceId: d.id,
      deviceName: d.model,
      room: d.room,
      building: d.building,
      lastMaintenanceAt: d.lastMaintenanceAt,
      nextMaintenanceAt: d.nextMaintenanceAt,
      maintenanceCycle: d.maintenanceCycle,
      daysUntil: daysUntilMaintenance(d.nextMaintenanceAt),
      overdue: isMaintenanceOverdue(d.nextMaintenanceAt),
      responsibleEngineer: d.responsibleEngineer,
    })).sort((a: any, b: any) => a.daysUntil - b.daysUntil);
    return HttpResponse.json({ success: true, data: schedule });
  }),

  // 缁存姢鍘嗗彶
  http.get(`${API_BASE}/devices/:id/maintenance-history`, async ({ params }) => {
    await delay(80);
    const d = get<any>('devices', params.id as string);
    if (!d) return HttpResponse.json({ success: false }, { status: 404 });
    // 妯℃嫙鍘嗗彶 (12 涓湀)
    const history = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        date: date.toISOString().slice(0, 10),
        type: ['瀹氭湡淇濆吇', '鏍″噯', '缁翠慨', '鍗囩骇'][i % 4],
        cost: Math.round(d.purchasePrice * 0.01 * (0.5 + Math.random())),
        engineer: d.responsibleEngineer,
        duration: Math.round(2 + Math.random() * 8),
        notes: '渚嬭缁存姢瀹屾垚, 璁惧杩愯姝ｅ父',
      };
    });
    return HttpResponse.json({ success: true, data: history });
  }),

  // 璇︽儏
  http.get(`${API_BASE}/devices/:id`, async ({ params }) => {
    await delay(50);
    const d = get<any>('devices', params.id as string);
    if (!d) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Device not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: toDeviceDto(d) });
  }),

  // 宸ヤ綔閲忕粺璁?
  http.get(`${API_BASE}/devices/:id/workload`, async ({ params }) => {
    await delay(80);
    const d = get<any>('devices', params.id as string);
    if (!d) return HttpResponse.json({ success: false }, { status: 404 });
    // 30 澶╂ā鎷?
    const daily = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      const weekend = dayOfWeek === 0 || dayOfWeek === 6;
      return {
        date: date.toISOString().slice(0, 10),
        examCount: Math.round(d.monthlyScans / 30 * (weekend ? 0.6 : 1.0) * (0.8 + Math.random() * 0.4)),
        utilization: Math.round(60 + Math.random() * 30),
      };
    });
    return HttpResponse.json({ success: true, data: daily.reverse() });
  }),

  // QR Code (璁惧璧勪骇鐮?
  http.get(`${API_BASE}/devices/:id/qrcode`, async ({ params }) => {
    await delay(50);
    const d = get<any>('devices', params.id as string);
    if (!d) return HttpResponse.json({ success: false }, { status: 404 });
    // 妯℃嫙 QR data URL
    const qrData = `RIS_DEVICE:${d.id}|${d.model}|${d.serialNumber}|${d.assetCode}`;
    return HttpResponse.json({ success: true, data: { qrData, format: 'qrcode' } });
  }),

  // 鏇存柊鐘舵€?
  http.put(`${API_BASE}/devices/:id/status`, async ({ params, request }) => {
    await delay(100);
    const id = params.id as string;
    const body = (await request.json()) as { status: string };
    const before = get<any>('devices', id);
    const updated = update<any>('devices', id, { status: body.status });
    if (updated) {
      auditUpdate('devices', before, updated);
      auditStatusChange('devices', updated, before?.status || '', body.status);
    }
    return HttpResponse.json({ success: true, data: updated ? toDeviceDto(updated) : null });
  }),

  // 瑙﹀彂缁存姢
  http.post(`${API_BASE}/devices/:id/maintenance`, async ({ params, request }) => {
    await delay(150);
    const id = params.id as string;
    const body = (await request.json()) as { type: string; engineer: string; notes?: string };
    const before = get<any>('devices', id);
    const today = new Date().toISOString().slice(0, 10);
    const nextDate = getNextMaintenanceDate(today, '瀛ｅ害');
    const updated = update<any>('devices', id, { status: '缁存姢涓?, lastMaintenanceAt: today, nextMaintenanceAt: nextDate });
    if (updated) {
      auditUpdate('devices', before, updated);
      recordWorkflowEvent({
        actorId: 'system', actorName: body.engineer || '绯荤粺',
        action: 'maintenance_triggered', entityType: 'device', entityId: id,
        fromState: before?.status, toState: '缁存姢涓?,
        metadata: { type: body.type, notes: body.notes },
      });
    }
    return HttpResponse.json({ success: true, data: updated ? toDeviceDto(updated) : null });
  }),

  // 鍒涘缓 (POST /devices)
  http.post(`${API_BASE}/devices`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    const newDevice = { ...body, id: body.id || `DEV-${Date.now()}` };
    create('devices', newDevice);
    auditCreate('devices', newDevice);
    return HttpResponse.json({ success: true, data: toDeviceDto(newDevice) }, { status: 201 });
  }),

  // 鏇存柊
  http.put(`${API_BASE}/devices/:id`, async ({ params, request }) => {
    await delay(120);
    const id = params.id as string;
    const body = (await request.json()) as any;
    const before = get<any>('devices', id);
    const updated = update<any>('devices', id, body);
    if (updated) auditUpdate('devices', before, updated);
    return HttpResponse.json({ success: true, data: updated ? toDeviceDto(updated) : null });
  }),

  // 鍒犻櫎
  http.delete(`${API_BASE}/devices/:id`, async ({ params }) => {
    await delay(100);
    const id = params.id as string;
    const before = get<any>('devices', id);
    const existed = remove('devices', id);
    if (existed) auditDelete({ resource: 'devices', resourceId: id, before });
    return new HttpResponse(null, { status: existed ? 204 : 404 });
  }),

  // 鎸夋ā鎬佸垎缁?
  http.get(`${API_BASE}/devices/by-modality/:modality`, async ({ params }) => {
    await delay(80);
    const all = list<any>('devices').filter((d: any) => d.modality === params.modality);
    return HttpResponse.json({ success: true, data: all.map(toDeviceDto) });
  }),

  // 鎸夌姸鎬佸垎缁?
  http.get(`${API_BASE}/devices/by-status/:status`, async ({ params }) => {
    await delay(80);
    const all = list<any>('devices').filter((d: any) => d.status === params.status);
    return HttpResponse.json({ success: true, data: all.map(toDeviceDto) });
  }),
];

// ============= DICOM(7) =============
export const dicomHandlers = [
  http.get(`${API_BASE}/dicom/studies/:studyUid`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: {
        studyInstanceUID: params.studyUid,
        studyDate: '2026-06-06',
        studyDescription: '鑳搁儴CT骞虫壂',
        patientID: 'P001',
        patientName: '寮犱笁',
        modalitiesInStudy: ['CT'],
      },
    });
  }),

  http.get(`${API_BASE}/dicom/studies/:studyUid/series`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: [] });
  }),

  http.get(`${API_BASE}/dicom/series/:seriesUid`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: [] });
  }),

  http.get(`${API_BASE}/dicom/instances/:sopUid`, async () => {
    await delay(300);
    return new HttpResponse(new ArrayBuffer(1024), {
      headers: { 'Content-Type': 'application/dicom' },
    });
  }),

  http.post(`${API_BASE}/dicom/upload`, async ({ request }) => {
    await delay(500);
    const formData = await request.formData();
    return HttpResponse.json({
      success: true,
      data: { studyUid: 'mock-' + Date.now(), fileName: formData.get('file')?.toString() ?? 'unknown' },
    });
  }),

  http.get(`${API_BASE}/dicom/studies/:studyUid/thumbnail`, async () => {
    await delay(150);
    return new HttpResponse(new ArrayBuffer(1024), {
      headers: { 'Content-Type': 'image/jpeg' },
    });
  }),

  http.delete(`${API_BASE}/dicom/studies/:studyUid`, async () => {
    await delay(200);
    return new HttpResponse(null, { status: 204 });
  }),
];

// ============= AI(3) =============
export const aiHandlers = [
  http.post(`${API_BASE}/ai/generate`, async ({ request }) => {
    await delay(2000);  // 妯℃嫙 LLM 鎺ㄧ悊
    const body = (await request.json()) as { prompt: string };
    return HttpResponse.json({
      success: true,
      data: {
        content: `銆怉I 鐢熸垚鎶ュ憡鑽夌銆戝熀浜庢偍鐨勮緭鍏?"${body.prompt.slice(0, 50)}..."锛屽缓璁弿杩板涓嬶細\n\n褰卞儚鎵€瑙侊細...\n璇婃柇鎰忚锛?..\n寤鸿锛?..`,
        usage: { prompt: 100, completion: 200, total: 300 },
      },
    });
  }),

  http.post(`${API_BASE}/ai/quality`, async () => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { score: 85, dimensions: { completeness: 90, terminology: 80, consistency: 85 } },
    });
  }),

  http.post(`${API_BASE}/ai/rads`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { findings: string; radsSystem: string };
    return HttpResponse.json({
      success: true,
      data: {
        system: body.radsSystem,
        category: '4A',
        description: '鍙枒',
        riskPercent: '5-15%',
        recommendation: '3 涓湀澶嶆煡',
      },
    });
  }),
];

// ============= Critical Values(5) =============
export const criticalValueHandlers = [
  http.get(`${API_BASE}/critical`, async () => {
    await delay(150);
    return HttpResponse.json({ success: true, data: [] });
  }),

  http.get(`${API_BASE}/critical/:id`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, finding: '涓诲姩鑴夊す灞?, status: 'notified' } });
  }),

  http.post(`${API_BASE}/critical`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'cv-' + Date.now(), ...body } }, { status: 201 });
  }),

  http.put(`${API_BASE}/critical/:id/acknowledge`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'acknowledged' } });
  }),

  http.put(`${API_BASE}/critical/:id/resolve`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'resolved' } });
  }),
];

// ============= Print(4) =============
export const printHandlers = [
  http.get(`${API_BASE}/print/queue`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),

  http.post(`${API_BASE}/print/jobs`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'job-' + Date.now(), ...body } }, { status: 201 });
  }),

  http.get(`${API_BASE}/print/printers`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'p1', name: '鑳剁墖鎵撳嵃鏈?1', ip: '192.168.1.100', status: 'ready' },
        { id: 'p2', name: '婵€鍏夋墦鍗版満 1', ip: '192.168.1.101', status: 'ready' },
      ],
    });
  }),

  http.put(`${API_BASE}/print/jobs/:id/cancel`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'cancelled' } });
  }),
];

// ============= Stats(18) - v3.0.6.8-32 鎺ュ叆 DAILY_KPI_PRE + DOCTOR_PERFORMANCE_PRE =============
export const statsHandlers = [
  // 浠婃棩 KPI (DAILY_KPI_PRE 鏈€鍚庝竴澶? - 鍏煎 HomePage 鏃?DTO
  http.get(`${API_BASE}/stats/daily`, async () => {
    await delay(80);
    const all = list<any>('dailyKpi');
    const today = all[all.length - 1];
    if (!today) return HttpResponse.json({ success: true, data: { totalExams: 0, completedExams: 0, pendingReports: 0, criticalValues: 0 } });
    return HttpResponse.json({ success: true, data: {
      totalExams: today.examCount,
      completedExams: today.reportCount,
      pendingReports: Math.max(0, today.examCount - today.reportCount),
      criticalValues: today.criticalCount,
      avgTAT: today.avgTAT,
      defectCount: today.defectCount,
      qcAvgScore: today.qcAvgScore,
      date: today.date,
      byModality: today.byModality,
    } });
  }),

  // 鍛?KPI (DAILY_KPI_PRE 7 澶╄仛鍚?
  http.get(`${API_BASE}/stats/weekly`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const all = list<any>('dailyKpi');
    const weekly = all.slice(-7);
    const totalExams = sumBy(weekly, (k: any) => k.examCount);
    const totalReports = sumBy(weekly, (k: any) => k.reportCount);
    const totalCritical = sumBy(weekly, (k: any) => k.criticalCount);
    const daily = weekly.map(toDailyKpiDto);
    return HttpResponse.json({ success: true, data: {
      totalExams, totalReports, totalCritical, daily,
      avgExamsPerDay: Math.round(totalExams / 7),
    } });
  }),

  // 鏈?KPI (30 澶╄仛鍚?
  http.get(`${API_BASE}/stats/monthly`, async () => {
    await delay(100);
    const all = list<any>('dailyKpi');
    const totalExams = sumBy(all, (k: any) => k.examCount);
    const totalReports = sumBy(all, (k: any) => k.reportCount);
    const totalCritical = sumBy(all, (k: any) => k.criticalCount);
    const totalDefect = sumBy(all, (k: any) => k.defectCount);
    const avgQCScore = avgBy(all, (k: any) => k.qcAvgScore);
    const byModality: Record<string, number> = { CT: 0, MR: 0, DR: 0, US: 0, MG: 0, DSA: 0 };
    for (const k of all) {
      for (const [m, v] of Object.entries(k.byModality || {})) {
        byModality[m] = (byModality[m] || 0) + (v as number);
      }
    }
    return HttpResponse.json({ success: true, data: {
      totalExams, totalReports, totalCritical, totalDefect,
      avgQCScore: Math.round(avgQCScore * 10) / 10,
      byModality, dailyCount: all.length,
    } });
  }),

  // 宸ヤ綔閲?(DOCTOR_PERFORMANCE_PRE 鎸夊尰鐢熻仛鍚?
  http.get(`${API_BASE}/stats/workload`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const month = url.searchParams.get('month') || '2026-06';
    const all = list<any>('doctorPerformance').filter((d: any) => d.month === month);
    const byDoctor = groupBy(all, (d: any) => d.doctorId);
    const result = Object.entries(byDoctor).map(([doctorId, records]: [string, any]) => {
      const totalReports = sumBy(records, (r: any) => r.reportCount);
      const totalDefect = sumBy(records, (r: any) => r.defectCount);
      const totalCritical = sumBy(records, (r: any) => r.criticalValueCount);
      return {
        doctorId,
        doctorName: records[0]?.doctorName || '',
        title: records[0]?.title || '',
        month,
        totalReports,
        totalDefect,
        totalCritical,
        avgQCScore: avgBy(records, (r: any) => r.qcScore),
      };
    }).sort((a, b) => b.totalReports - a.totalReports);
    return HttpResponse.json({ success: true, data: result });
  }),

  // 璐ㄩ噺璇勫垎 (QUALITY_SCORE_PRE 鎸夋湀鑱氬悎)
  http.get(`${API_BASE}/stats/quality`, async () => {
    await delay(80);
    const all = list<any>('qualityScores');
    const avgScore = avgBy(all, (q: any) => q.totalScore);
    const byGrade: Record<string, number> = {};
    for (const q of all) {
      byGrade[q.grade] = (byGrade[q.grade] || 0) + 1;
    }
    // 鎸夊尰鐢?Top 10
    const byDocMap = groupBy(all, (q: any) => q.doctorId);
    const byDoctor = Object.entries(byDocMap).map(([doctorId, records]: [string, any]) => ({
      doctorId,
      doctorName: records[0]?.doctorName || '',
      score: Math.round(avgBy(records, (r: any) => r.totalScore) * 10) / 10,
      count: records.length,
    })).sort((a, b) => b.score - a.score).slice(0, 10);
    // 鎸夋ā鎬?
    const byModMap = groupBy(all, (q: any) => q.modality);
    const byModality = Object.entries(byModMap).map(([modality, records]: [string, any]) => ({
      modality,
      score: Math.round(avgBy(records, (r: any) => r.totalScore) * 10) / 10,
      count: records.length,
    }));
    return HttpResponse.json({ success: true, data: {
      averageScore: Math.round(avgScore * 10) / 10,
      totalScored: all.length,
      byGrade, byDoctor, byModality,
    } });
  }),

  // Dashboard 姹囨€?
  http.get(`${API_BASE}/stats/dashboard`, async () => {
    await delay(80);
    const exams = list<any>('exams');
    const patients = list<any>('patients');
    const criticalEvents = list<any>('criticalEvents');
    const dailyKpi = list<any>('dailyKpi');
    const today = dailyKpi[dailyKpi.length - 1] || { examCount: 0, reportCount: 0 };
    const openCritical = criticalEvents.filter((c: any) => c.status !== '宸查棴鐜?).length;
    const deviceActive = list<any>('devices').filter((d: any) => d.status === '杩愯涓?).length;
    const doctorActive = list<any>('doctors').filter((d: any) => d.active).length;
    return HttpResponse.json({ success: true, data: {
      today: { exams: today.examCount, reports: today.reportCount },
      totals: { exams: exams.length, patients: patients.length, criticalEvents: criticalEvents.length },
      alerts: { openCritical, devicesActive: deviceActive, doctorsActive: doctorActive },
    } });
  }),

  // 鎸夋ā鎬佽秼鍔?
  http.get(`${API_BASE}/stats/by-modality`, async () => {
    await delay(80);
    const all = list<any>('dailyKpi');
    const byModality: Record<string, { total: number; days: number; avg: number }> = {};
    for (const k of all) {
      for (const [mod, count] of Object.entries(k.byModality || {})) {
        if (!byModality[mod]) byModality[mod] = { total: 0, days: 0, avg: 0 };
        byModality[mod].total += count as number;
        byModality[mod].days += 1;
      }
    }
    for (const v of Object.values(byModality)) v.avg = Math.round(v.total / v.days);
    return HttpResponse.json({ success: true, data: byModality });
  }),

  // 瓒嬪娍 (DAILY_KPI_PRE 鍏ㄩ儴)
  http.get(`${API_BASE}/stats/trend`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const all = list<any>('dailyKpi');
    return HttpResponse.json({ success: true, data: all.slice(-days).map(toDailyKpiDto) });
  }),

  // Top N (鎸夋ā鎬佺殑妫€鏌ユ暟)
  http.get(`${API_BASE}/stats/top-modalities`, async () => {
    await delay(80);
    const all = list<any>('dailyKpi');
    const totals: Record<string, number> = {};
    for (const k of all) {
      for (const [m, v] of Object.entries(k.byModality || {})) {
        totals[m] = (totals[m] || 0) + (v as number);
      }
    }
    return HttpResponse.json({
      success: true,
      data: Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([modality, count]) => ({ modality, count })),
    });
  }),

  // Top 璁惧
  http.get(`${API_BASE}/stats/top-devices`, async () => {
    await delay(80);
    const all = list<any>('dailyKpi');
    const totals: Record<string, number> = {};
    for (const k of all) {
      for (const d of k.topDevices || []) {
        totals[d.deviceId] = (totals[d.deviceId] || 0) + d.count;
      }
    }
    return HttpResponse.json({
      success: true,
      data: Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([deviceId, count]) => ({ deviceId, count })),
    });
  }),

  // 瀵煎嚭 CSV
  http.get(`${API_BASE}/stats/export.csv`, async () => {
    await delay(200);
    const all = list<any>('dailyKpi');
    const header = 'date,examCount,reportCount,criticalCount,cosignCount,avgTAT,defectCount,qcAvgScore';
    const rows = all.map((k: any) => `${k.date},${k.examCount},${k.reportCount},${k.criticalCount},${k.cosignCount},${k.avgTAT},${k.defectCount},${k.qcAvgScore}`);
    return new HttpResponse([header, ...rows].join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="stats.csv"' } });
  }),
];

// ============= Terms(2) =============
export const termHandlers = [
  http.get(`${API_BASE}/terms/search`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';
    const results = FEATURED_TERMS.filter((t) =>
      t.term.includes(q) || t.pinyin.startsWith(q.toLowerCase())
    );
    return HttpResponse.json({ success: true, data: results });
  }),

  http.get(`${API_BASE}/terms/categories`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true, data: TERM_CATEGORIES });
  }),
];

// ============= Users (14) - v3.0.6.8-32 鎺ュ叆 DOCTOR_MASTER =============
export const userHandlers = [
  // 鍒楄〃 (DOCTOR_MASTER 75)
  http.get(`${API_BASE}/users`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('doctors');
    const result = applyQuery<any>(all, opts, ['name', 'id', 'subspecialty', 'department', 'certifications']);
    return HttpResponse.json({ success: true, data: result.data.map(toUserDto), meta: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages } });
  }),

  // 鎸夎鑹插垎缁?(蹇呴』鍦?:id 涔嬪墠)
  http.get(`${API_BASE}/users/by-role/:role`, async ({ params }) => {
    await delay(80);
    const all = list<any>('doctors').filter((d: any) => d.title === params.role);
    return HttpResponse.json({ success: true, data: all.map(toUserDto) });
  }),

  // 鎸夌瀹ゅ垎缁?
  http.get(`${API_BASE}/users/by-department/:dept`, async ({ params }) => {
    await delay(80);
    const all = list<any>('doctors').filter((d: any) => d.department === params.dept);
    return HttpResponse.json({ success: true, data: all.map(toUserDto) });
  }),

  // 鎺掔彮 (鏁撮櫌)
  http.get(`${API_BASE}/users/schedule`, async ({ params }) => {
    await delay(80);
    const all = list<any>('doctors');
    const schedule = all.map((d: any) => ({
      doctorId: d.id,
      doctorName: d.name,
      title: d.title,
      department: d.department,
      schedule: d.schedule,
    }));
    return HttpResponse.json({ success: true, data: schedule });
  }),

  // 鐢ㄦ埛缁熻
  http.get(`${API_BASE}/users/stats`, async () => {
    await delay(80);
    const all = list<any>('doctors');
    const byTitle: Record<string, number> = {};
    const byDept: Record<string, number> = {};
    const bySubspecialty: Record<string, number> = {};
    let activeCount = 0;
    for (const d of all) {
      byTitle[d.title] = (byTitle[d.title] || 0) + 1;
      byDept[d.department] = (byDept[d.department] || 0) + 1;
      bySubspecialty[d.subspecialty] = (bySubspecialty[d.subspecialty] || 0) + 1;
      if (d.active) activeCount++;
    }
    const totalExp = all.reduce((s: number, d: any) => s + d.yearsOfExperience, 0);
    return HttpResponse.json({ success: true, data: {
      total: all.length,
      byTitle, byDept, bySubspecialty, activeCount,
      avgExperience: all.length > 0 ? Math.round(totalExp / all.length * 10) / 10 : 0,
    } });
  }),

  // 璇︽儏 (瀹屾暣 UserDto 22 瀛楁)
  http.get(`${API_BASE}/users/:id`, async ({ params }) => {
    await delay(50);
    const u = get<any>('doctors', params.id as string);
    if (!u) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: toUserDto(u) });
  }),

  // 鐢ㄦ埛鐨勭哗鏁堣褰?
  http.get(`${API_BASE}/users/:id/performance`, async ({ params }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('doctorPerformance').filter((d: any) => d.doctorId === params.id);
    const result = applyQuery<any>(all, opts);
    return HttpResponse.json({ success: true, data: result.data.map(toDoctorPerformanceDto), meta: { total: result.total } });
  }),

  // 鍒涘缓
  http.post(`${API_BASE}/users`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    const newUser = { ...body, id: body.id || `D${String(Date.now()).slice(-3).padStart(3, '0')}` };
    create('doctors', newUser);
    auditCreate('users', newUser);
    return HttpResponse.json({ success: true, data: toUserDto(newUser) }, { status: 201 });
  }),

  // 鏇存柊
  http.put(`${API_BASE}/users/:id`, async ({ params, request }) => {
    await delay(120);
    const id = params.id as string;
    const body = (await request.json()) as any;
    const before = get<any>('doctors', id);
    const updated = update<any>('doctors', id, body);
    if (updated) auditUpdate('users', before, updated);
    return HttpResponse.json({ success: true, data: updated ? toUserDto(updated) : null });
  }),

  // 鍒犻櫎
  http.delete(`${API_BASE}/users/:id`, async ({ params }) => {
    await delay(100);
    const id = params.id as string;
    const before = get<any>('doctors', id);
    const existed = remove('doctors', id);
    if (existed) auditDelete({ resource: 'users', resourceId: id, before });
    return new HttpResponse(null, { status: existed ? 204 : 404 });
  }),

  // 閲嶇疆瀵嗙爜
  http.post(`${API_BASE}/users/:id/reset-password`, async ({ params }) => {
    await delay(200);
    recordWorkflowEvent({
      actorId: 'system', actorName: '绯荤粺',
      action: 'password_reset', entityType: 'user', entityId: params.id as string,
    });
    return HttpResponse.json({ success: true, data: { id: params.id, passwordReset: true, resetAt: new Date().toISOString() } });
  }),

  // 鏉冮檺鏇存柊 (RBAC)
  http.put(`${API_BASE}/users/:id/permissions`, async ({ params, request }) => {
    await delay(100);
    const id = params.id as string;
    const body = (await request.json()) as { permissions: string[] };
    const before = get<any>('doctors', id);
    const updated = update<any>('doctors', id, { permissions: body.permissions });
    if (updated) auditUpdate('users', before, updated);
    return HttpResponse.json({ success: true, data: updated ? toUserDto(updated) : null });
  }),
];

// ============= Consultations (12) - v3.0.6.8-32 鎺ュ叆 EXAM_REPORT_PRE + DOCTOR_MASTER =============
export const consultationHandlers = [
  // 鍒楄〃 (娲剧敓鑷?EXAM_REPORT_PRE 涓?critical 鐨勬姤鍛?
  http.get(`${API_BASE}/consultations`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('exams').filter((e: any) => e.hasCriticalValue).slice(0, 100);
    const consultations = all.map((e: any, idx: number) => {
      const statusMap: Record<string, string> = { 0: '宸插畬鎴?, 1: '寰呭洖澶?, 2: '宸插洖澶? };
      const typeMap = ['鐤戦毦鐥呬緥', '杩滅▼浼氳瘖', '鎬ヨ瘖浼氳瘖'];
      const deptMap = ['鏀惧皠绉?, '蹇冨唴绉?, '绁炵粡绉?, '鑲跨槫绉?];
      return {
        id: `C-${e.reportId}`,
        consultationId: `CST${e.reportId.replace('RPT-', '')}`,
        examId: e.reportId,
        patientId: e.patientId,
        patientName: e.patientName,
        modality: e.modality,
        bodyPart: e.bodyPart,
        status: statusMap[idx % 3],
        consultationType: typeMap[idx % 3],
        type: typeMap[idx % 3],
        isRemote: idx % 2 === 0,
        requestingDepartment: deptMap[idx % deptMap.length],
        consultedDepartment: deptMap[(idx + 1) % deptMap.length],
        consultedDoctorName: '寮犱笁',
        urgency: e.priority === '鎬ヨ瘖' ? '绱ф€? : '鏅€?,
        requestTime: String(e.examAt || '').replace('T', ' ').slice(0, 19),
        scheduledAt: e.examAt,
        requestedBy: e.reportDoctorId,
        consultant: 'D002',
        consultants: ['D002', 'D003'],
        priority: e.priority,
        requestReason: e.impression || '闇€瑕佽繘涓€姝ヤ細璇婄‘璁よ瘖鏂?,
        notes: e.impression,
        duration: '00:30:00',
        participants: [e.reportDoctorId, 'D002'],
      };
    });
    const result = applyQuery(consultations, opts);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),

  // 寰呬細璇?(鏈畬鎴?
  http.get(`${API_BASE}/consultations/pending`, async () => {
    await delay(50);
    const all = list<any>('exams').filter((e: any) => e.hasCriticalValue).slice(0, 20);
    const pending = all.map((e: any, idx: number) => ({
      id: `C-${e.reportId}`, examId: e.reportId, patientName: e.patientName,
      status: 'scheduled', priority: e.priority,
    }));
    return HttpResponse.json({ success: true, data: pending });
  }),

  // 鎸夋偅鑰?
  http.get(`${API_BASE}/consultations/by-patient/:patientId`, async ({ params }) => {
    await delay(50);
    const exams = list<any>('exams').filter((e: any) => e.patientId === params.patientId && e.hasCriticalValue);
    return HttpResponse.json({ success: true, data: exams });
  }),

  // 鎸夊尰鐢?
  http.get(`${API_BASE}/consultations/by-doctor/:doctorId`, async ({ params }) => {
    await delay(50);
    const exams = list<any>('exams').filter((e: any) => e.reportDoctorId === params.doctorId && e.hasCriticalValue);
    return HttpResponse.json({ success: true, data: exams });
  }),

  // 璇︽儏
  http.get(`${API_BASE}/consultations/:id`, async ({ params }) => {
    await delay(50);
    const reportId = (params.id as string).replace('C-', '');
    const exam = get<any>('exams', reportId);
    if (!exam) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: { id: params.id, examId: reportId, ...exam } });
  }),

  // 鍒涘缓
  http.post(`${API_BASE}/consultations`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    const newCons = { id: `C-${Date.now()}`, ...body, status: 'scheduled', createdAt: new Date().toISOString() };
    auditCreate('consultations', newCons);
    return HttpResponse.json({ success: true, data: newCons }, { status: 201 });
  }),

  // 鏇存柊
  http.put(`${API_BASE}/consultations/:id`, async ({ params, request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json()) } });
  }),

  // 鍙栨秷
  http.post(`${API_BASE}/consultations/:id/cancel`, async ({ params }) => {
    await delay(80);
    recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'cancel', entityType: 'consultations', entityId: params.id as string });
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'cancelled' } });
  }),

  // 瀹屾垚
  http.post(`${API_BASE}/consultations/:id/complete`, async ({ params, request }) => {
    await delay(80);
    const body = (await request.json()) as { conclusion: string };
    recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'complete', entityType: 'consultations', entityId: params.id as string });
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'completed', conclusion: body.conclusion } });
  }),
];

// ============= Queue (10) - v3.0.6.8-32 鎺ュ叆 EXAM_REPORT_PRE + DEVICE_MASTER =============
export const queueHandlers = [
  // 闃熷垪 (鎸?status=submitted/reviewed 娲剧敓)
  http.get(`${API_BASE}/queue`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('exams').filter((e: any) => e.status === 'submitted' || e.status === 'reviewed');
    const result = applyQuery(all, opts);
    const queueItems = result.data.map((e: any, idx: number) => ({
      id: `q-${e.reportId}`,
      queueNumber: `${e.modality}-${String(idx + 1).padStart(3, '0')}`,
      patientName: e.patientName,
      examItem: e.examItem,
      roomId: e.deviceId,
      modality: e.modality,
      status: e.status === 'submitted' ? 'waiting' : 'in_service',
      priority: e.priority,
      arrivedAt: e.examAt,
      estimatedWaitMin: (result.data.length - idx) * 5,
    }));
    return HttpResponse.json({ success: true, data: queueItems, meta: { total: result.total } });
  }),

  // 鎴块棿鐘舵€?(DEVICE_MASTER.room)
  http.get(`${API_BASE}/queue/rooms`, async () => {
    await delay(80);
    const devices = list<any>('devices');
    const rooms = devices.map((d: any) => ({
      id: d.id,
      roomNumber: d.room,
      modality: d.modality,
      status: d.status === '杩愯涓? ? '浣跨敤涓? : d.status === '寰呮満' ? '绌洪棽' : '缁存姢涓?,
      deviceId: d.id,
      deviceName: d.model,
      queueCount: Math.floor(Math.random() * 5),
    }));
    return HttpResponse.json({ success: true, data: rooms });
  }),

  // 鎴块棿璇︽儏
  http.get(`${API_BASE}/queue/rooms/:roomId`, async ({ params }) => {
    await delay(50);
    const room = get<any>('devices', params.roomId as string);
    if (!room) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: {
      id: room.id, roomNumber: room.room, modality: room.modality,
      status: room.status === '杩愯涓? ? '浣跨敤涓? : '绌洪棽',
    } });
  }),

  // 闃熷垪缁熻
  http.get(`${API_BASE}/queue/stats`, async () => {
    await delay(50);
    const all = list<any>('exams').filter((e: any) => e.status === 'submitted');
    const byModality: Record<string, number> = {};
    for (const e of all) {
      byModality[e.modality] = (byModality[e.modality] || 0) + 1;
    }
    return HttpResponse.json({ success: true, data: { total: all.length, byModality } });
  }),

  // 鍙彿
  http.post(`${API_BASE}/queue/:id/call`, async ({ params }) => {
    await delay(80);
    recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'call', entityType: 'queue', entityId: params.id as string });
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'called', calledAt: new Date().toISOString() } });
  }),

  // 瀹屾垚
  http.post(`${API_BASE}/queue/:id/complete`, async ({ params }) => {
    await delay(80);
    recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'complete', entityType: 'queue', entityId: params.id as string });
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'completed', completedAt: new Date().toISOString() } });
  }),

  // 閲嶅彨
  http.post(`${API_BASE}/queue/:id/recall`, async ({ params }) => {
    await delay(80);
    recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'recall', entityType: 'queue', entityId: params.id as string });
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'recalled' } });
  }),
];

// ============= Terms (6) =============
export const termListHandlers = [
  http.get(`${API_BASE}/terms`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.get(`${API_BASE}/terms/:id`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, term: 'mock' } });
  }),
  http.post(`${API_BASE}/terms`, async ({ request }) => {
    await delay(120);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'T' + Date.now(), ...(body as object) } }, { status: 201 });
  }),
  http.put(`${API_BASE}/terms/:id`, async ({ params, request }) => {
    await delay(120);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: params.id, ...(body as object) } });
  }),
  http.delete(`${API_BASE}/terms/:id`, async () => new HttpResponse(null, { status: 204 })),
];

// ============= Insurance Audits (5) =============
export const insuranceHandlers = [
  http.get(`${API_BASE}/insurance-audits`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.get(`${API_BASE}/insurance-audits/:id`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'pending' } });
  }),
  http.post(`${API_BASE}/insurance-audits`, async ({ request }) => {
    await delay(150);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'I' + Date.now(), ...(body as object) } }, { status: 201 });
  }),
  http.post(`${API_BASE}/insurance-audits/:id/approve`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'approved' } });
  }),
  http.post(`${API_BASE}/insurance-audits/:id/reject`, async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as { reason?: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'rejected', reason: body.reason } });
  }),
];

// ============= Materials (8) - v3.0.6.8-32 鎺ュ叆 EXAM_ITEM_MASTER.contrastAgent =============
export const materialsHandlers = [
  // 鍒楄〃 (浠?EXAM_ITEM_MASTER 娲剧敓瀵规瘮鍓?+ 鑰楁潗)
  http.get(`${API_BASE}/materials`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const examItems = list<any>('examItems');
    const contrastItems = examItems
      .filter((e: any) => e.contrastAgent)
      .map((e: any, idx: number) => ({
        id: `mat-contrast-${idx}`,
        name: e.contrastAgent,
        type: 'contrast',
        category: e.modality,
        stock: Math.round(50 + Math.random() * 200),
        unit: '鏀?,
        price: e.priceRMB * 0.3,
        examItemCode: e.code,
      }));
    const consumables = [
      { id: 'mat-cons-1', name: '涓€娆℃€ф敞灏勫櫒', type: 'consumable', stock: 500, unit: '涓?, price: 3.5 },
      { id: 'mat-cons-2', name: '鐣欑疆閽?, type: 'consumable', stock: 200, unit: '鏀?, price: 12.0 },
      { id: 'mat-cons-3', name: '鍖荤敤鎵嬪', type: 'consumable', stock: 1000, unit: '鍓?, price: 1.5 },
      { id: 'mat-cons-4', name: '鍖荤敤鑳剁墖 14x17', type: 'consumable', stock: 800, unit: '寮?, price: 15.0 },
      { id: 'mat-cons-5', name: '閫犲奖瀵间笣', type: 'consumable', stock: 50, unit: '鏍?, price: 280 },
    ];
    let all = [...contrastItems, ...consumables];
    if (type) all = all.filter((m: any) => m.type === type);
    const opts = parseQuery(url);
    const result = applyQuery(all, opts, ['name', 'category']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),

  // 搴撳瓨棰勮
  http.get(`${API_BASE}/materials/low-stock`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const threshold = parseInt(url.searchParams.get('threshold') || '50');
    const examItems = list<any>('examItems').filter((e: any) => e.contrastAgent);
    const lowStock = examItems
      .filter((_: any, idx: number) => idx % 3 === 0)
      .map((e: any) => ({
        id: `mat-${e.code}`, name: e.contrastAgent, currentStock: 20 + Math.floor(Math.random() * 20),
        threshold, severity: 'warning',
      }));
    return HttpResponse.json({ success: true, data: lowStock });
  }),

  // 璇︽儏
  http.get(`${API_BASE}/materials/:id`, async ({ params }) => {
    await delay(50);
    return HttpResponse.json({ success: true, data: { id: params.id, name: '鏉愭枡璇︽儏', stock: 100, unit: '鏀? } });
  }),

  // 鍒涘缓
  http.post(`${API_BASE}/materials`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    const newMat = { id: `mat-${Date.now()}`, ...body };
    auditCreate('materials', newMat);
    return HttpResponse.json({ success: true, data: newMat }, { status: 201 });
  }),

  // 鏇存柊
  http.put(`${API_BASE}/materials/:id`, async ({ params, request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json()) } });
  }),

  // 鍒犻櫎
  http.delete(`${API_BASE}/materials/:id`, async ({ params }) => {
    auditDelete({ resource: 'materials', resourceId: params.id as string });
    return new HttpResponse(null, { status: 204 });
  }),

  // 鍏ュ簱 (澧炲簱瀛?
  http.post(`${API_BASE}/materials/:id/stock-in`, async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as { quantity: number; batchNo: string };
    recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'stock_in', entityType: 'materials', entityId: params.id as string, metadata: body });
    return HttpResponse.json({ success: true, data: { id: params.id, stockIn: body.quantity, batchNo: body.batchNo } });
  }),

  // 鍑哄簱 (鍑忓簱瀛?
  http.post(`${API_BASE}/materials/:id/stock-out`, async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as { quantity: number; patientId?: string; examId?: string };
    recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'stock_out', entityType: 'materials', entityId: params.id as string, metadata: body });
    return HttpResponse.json({ success: true, data: { id: params.id, stockOut: body.quantity } });
  }),
];

// ============= Dose Records (16) - v3.0.6.8-32 鎺ュ叆 DAILY_KPI_PRE + EXAM_REPORT_PRE + DEVICE_MASTER =============
export const doseHandlers = [
  // 鍒楄〃 (浠?DAILY_KPI_PRE 娲剧敓鎸夋棩鍓傞噺)
  http.get(`${API_BASE}/dose-records`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const daily = list<any>('dailyKpi');
    const exams = list<any>('exams');
    const records: any[] = [];
    daily.forEach((d: any) => {
      if (d.byModality.CT) records.push({ id: `DOSE-CT-${d.date}`, modality: 'CT', date: d.date, dlp: d.byModality.CT * 350, exams: d.byModality.CT, type: 'radiation' });
      if (d.byModality.MR) records.push({ id: `DOSE-MR-${d.date}`, modality: 'MR', date: d.date, dlp: d.byModality.MR * 0, exams: d.byModality.MR, type: 'radiation', contrastDose: d.byModality.MR * 15 });
      if (d.byModality.DSA) records.push({ id: `DOSE-DSA-${d.date}`, modality: 'DSA', date: d.date, dlp: d.byModality.DSA * 1200, exams: d.byModality.DSA, type: 'radiation' });
    });
    const result = applyQuery(records, opts);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),

  // 30 澶╄秼鍔?
  http.get(`${API_BASE}/dose-records/trend`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const daily = list<any>('dailyKpi').slice(-days);
    const trend = daily.map((d: any) => ({
      date: d.date,
      CT: d.byModality.CT || 0,
      MR: d.byModality.MR || 0,
      DR: d.byModality.DR || 0,
      US: d.byModality.US || 0,
      MG: d.byModality.MG || 0,
      DSA: d.byModality.DSA || 0,
      total: d.examCount,
      avgTAT: d.avgTAT,
    }));
    return HttpResponse.json({ success: true, data: trend });
  }),

  // 鎸夋ā鎬佺粺璁?
  http.get(`${API_BASE}/dose-records/by-modality`, async () => {
    await delay(80);
    const all = list<any>('dailyKpi');
    const totals: Record<string, { count: number; dlp: number }> = { CT: { count: 0, dlp: 0 }, MR: { count: 0, dlp: 0 }, DR: { count: 0, dlp: 0 }, US: { count: 0, dlp: 0 }, MG: { count: 0, dlp: 0 }, DSA: { count: 0, dlp: 0 } };
    for (const d of all) {
      for (const [m, count] of Object.entries(d.byModality || {})) {
        if (totals[m]) {
          totals[m].count += count as number;
          const dosePerUnit = { CT: 350, MR: 0, DR: 0, US: 0, MG: 0, DSA: 1200 };
          totals[m].dlp += (count as number) * (dosePerUnit[m as keyof typeof dosePerUnit] || 0);
        }
      }
    }
    return HttpResponse.json({ success: true, data: totals });
  }),

  // DRL 瀵规爣 (鍥藉/鐪佺骇璇婃柇鍙傝€冩按骞?
  http.get(`${API_BASE}/dose-records/drl-comparison`, async () => {
    await delay(80);
    const all = list<any>('dailyKpi');
    const last7 = all.slice(-7);
    const avgDLP_CT = avgBy(last7, (d: any) => d.byModality.CT * 350 / Math.max(d.byModality.CT, 1));
    const DRL_CT_HEAD = 800; // 澶撮 CT DLP 鍙傝€?(mGy路cm)
    const DRL_CT_CHEST = 400; // 鑳搁儴 CT DLP 鍙傝€?
    const DRL_CT_ABDOMEN = 600;
    return HttpResponse.json({ success: true, data: {
      avgDLP_CT: Math.round(avgDLP_CT),
      DRL: { head: DRL_CT_HEAD, chest: DRL_CT_CHEST, abdomen: DRL_CT_ABDOMEN },
      compliance: avgDLP_CT < DRL_CT_CHEST ? '杈炬爣' : '瓒呮爣',
      deviation: ((avgDLP_CT - DRL_CT_CHEST) / DRL_CT_CHEST * 100).toFixed(1) + '%',
    } });
  }),

  // 鍥藉瀵规爣
  http.get(`${API_BASE}/dose-records/benchmark`, async () => {
    await delay(80);
    const all = list<any>('dailyKpi');
    const national = {
      avgCTDLP: 450, nationalAvg: 480, provincialAvg: 510,
    };
    const ours = avgBy(all, (d: any) => d.byModality.CT * 350 / Math.max(d.byModality.CT, 1));
    return HttpResponse.json({ success: true, data: {
      ours: { avgCTDLP: Math.round(ours) },
      national, provincial: { avgCTDLP: national.provincialAvg },
      ranking: ours < national.nationalAvg ? '浼樼' : ours < national.provincialAvg ? '鑹ソ' : '涓€鑸?,
    } });
  }),

  // 璇︽儏
  http.get(`${API_BASE}/dose-records/:id`, async ({ params }) => {
    await delay(50);
    const all = list<any>('dailyKpi');
    const d = all.find((x: any) => `DOSE-CT-${x.date}` === params.id || `DOSE-MR-${x.date}` === params.id || `DOSE-DSA-${x.date}` === params.id);
    if (!d) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: d });
  }),

  // 鎮ｈ€呮€诲墏閲?
  http.get(`${API_BASE}/dose-records/patients/:patientId`, async ({ params }) => {
    await delay(80);
    const exams = list<any>('exams').filter((e: any) => e.patientId === params.patientId);
    const records = exams.map((e: any, idx: number) => ({
      id: `dr-${idx}-${e.reportId}`,
      patientId: e.patientId,
      examId: e.reportId,
      modality: e.modality,
      dlp: e.modality === 'CT' ? 350 : e.modality === 'DSA' ? 1200 : 0,
      recordedAt: e.examAt,
    }));
    const totalDLP = sumBy(records, (r: any) => r.dlp);
    return HttpResponse.json({ success: true, data: { patientId: params.patientId, totalDose: totalDLP, unit: 'mGy路cm', records } });
  }),

  // 闃堝€煎憡璀?
  http.get(`${API_BASE}/dose-records/alerts`, async () => {
    await delay(80);
    const all = list<any>('dailyKpi');
    const alerts: any[] = [];
    for (const d of all.slice(-7)) {
      const ct = d.byModality.CT || 0;
      if (ct * 350 / Math.max(ct, 1) > 600) {
        alerts.push({ date: d.date, modality: 'CT', severity: 'warning', message: `CT 骞冲潎鍓傞噺 ${Math.round(ct * 350 / Math.max(ct, 1))} mGy路cm 瓒呴槇鍊?600` });
      }
    }
    return HttpResponse.json({ success: true, data: alerts });
  }),

  // 鍒涘缓
  http.post(`${API_BASE}/dose-records`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    const newRecord = { id: `dose-${Date.now()}`, ...body, recordedAt: new Date().toISOString() };
    auditCreate('dose-records', newRecord);
    return HttpResponse.json({ success: true, data: newRecord }, { status: 201 });
  }),

  // 鏇存柊
  http.put(`${API_BASE}/dose-records/:id`, async ({ params, request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json()) } });
  }),

  // 鍒犻櫎
  http.delete(`${API_BASE}/dose-records/:id`, async ({ params }) => {
    auditDelete({ resource: 'dose-records', resourceId: params.id as string });
    return new HttpResponse(null, { status: 204 });
  }),

  // 鎸夎澶?(DEVICE_MASTER)
  http.get(`${API_BASE}/dose-records/by-device/:deviceId`, async ({ params }) => {
    await delay(80);
    const all = list<any>('dailyKpi');
    const daily = all.map((d: any) => ({
      date: d.date,
      exams: d.topDevices?.find((td: any) => td.deviceId === params.deviceId)?.count || 0,
    }));
    return HttpResponse.json({ success: true, data: daily });
  }),
];

// ============= Schedules (10) - v3.0.6.8-32 鎺ュ叆 DOCTOR_MASTER =============
export const scheduleHandlers = [
  // 鍏ㄩ儴鎺掔彮
  http.get(`${API_BASE}/schedules`, async ({ request }) => {
    await delay(80);
    const all = list<any>('doctors');
    const schedules = all.map((d: any) => ({
      doctorId: d.id,
      doctorName: d.name,
      title: d.title,
      department: d.department,
      subspecialty: d.subspecialty,
      schedule: d.schedule,
    }));
    return HttpResponse.json({ success: true, data: schedules });
  }),

  // 鎸夊懆 (鍛ㄤ竴鍒板懆鏃?
  http.get(`${API_BASE}/schedules/weekly`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const week = url.searchParams.get('week') || new Date().toISOString().slice(0, 10);
    const all = list<any>('doctors');
    const days = ['鍛ㄤ竴涓変簲涓婂崍', '鍛ㄤ簩鍥涗笂鍗?, '鍛ㄤ竴涓変簲涓嬪崍', '鍏ㄥぉ', '寮规€?, '澶滅彮'];
    const grid: Record<string, any> = {};
    for (const d of all) {
      grid[d.id] = {
        doctorName: d.name,
        title: d.title,
        department: d.department,
        schedule: d.schedule,
        weeklyHours: days.indexOf(d.schedule) >= 3 ? 40 : 20,
      };
    }
    return HttpResponse.json({ success: true, data: { week, doctors: grid } });
  }),

  // 鍐茬獊妫€娴?
  http.get(`${API_BASE}/schedules/conflicts`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const all = list<any>('doctors');
    // 妯℃嫙鍐茬獊: 鍚屼竴澶?>5 涓尰鐢?鍏ㄥぉ鎺掔彮
    const sameDay = all.filter((d: any) => d.schedule === '鍏ㄥぉ');
    const conflicts: any[] = [];
    if (sameDay.length > 5) {
      conflicts.push({ type: 'overlap', date, count: sameDay.length, doctors: sameDay.map((d: any) => d.id) });
    }
    return HttpResponse.json({ success: true, data: { date, conflicts } });
  }),

  // 鍒涘缓鎺掔彮
  http.post(`${API_BASE}/schedules`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: `sch-${Date.now()}`, ...body, createdAt: new Date().toISOString() } }, { status: 201 });
  }),

  // 鏇存柊鎺掔彮
  http.put(`${API_BASE}/schedules/:id`, async ({ params, request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json()) } });
  }),

  // 鎸夊尰鐢?
  http.get(`${API_BASE}/schedules/by-doctor/:doctorId`, async ({ params }) => {
    await delay(50);
    const d = get<any>('doctors', params.doctorId as string);
    if (!d) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: {
      doctorId: d.id, doctorName: d.name, schedule: d.schedule,
    } });
  }),

  // 鎸夋ā鎬?(娲剧敓)
  http.get(`${API_BASE}/schedules/by-modality/:modality`, async ({ params }) => {
    await delay(80);
    const all = list<any>('doctors').filter((d: any) => d.subspecialty === params.modality || d.title === '鎶€甯?);
    return HttpResponse.json({ success: true, data: all });
  }),
];

// ============= Notifications (14) - v3.0.6.8-32 鎺ュ叆 EXAM_REPORT_PRE + CRITICAL_EVENTS_PRE =============
export const notificationHandlers = [
  // 鍒楄〃 (娲剧敓鑷嵄鎬ュ€间簨浠?+ 鎶ュ憡鐘舵€?
  http.get(`${API_BASE}/notifications`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const unread = url.searchParams.get('unread');
    const opts = parseQuery(url);
    const criticalEvents = list<any>('criticalEvents').slice(0, 50);
    const exams = list<any>('exams').filter((e: any) => e.status === 'submitted').slice(0, 30);
    const notifs: any[] = [
      ...criticalEvents.map((c: any) => ({
        id: `notif-critical-${c.id}`,
        title: `鍗辨€ュ€? ${c.category}`,
        content: `鎮ｈ€?${c.patientName} ${c.modality} 妫€鏌ュ彂鐜?${c.value}`,
        type: 'critical',
        severity: c.category,
        isRead: Math.random() > 0.5,
        createdAt: c.discoveredAt,
        patientId: c.patientId,
        doctorId: c.discoverDoctorId,
      })),
      ...exams.map((e: any) => ({
        id: `notif-review-${e.reportId}`,
        title: `瀹℃牳鎻愰啋`,
        content: `鎶ュ憡 ${e.reportId} ${e.patientName} 寰呭鏍竊,
        type: 'review',
        isRead: Math.random() > 0.7,
        createdAt: e.examAt,
        patientId: e.patientId,
        doctorId: e.reportDoctorId,
      })),
    ];
    const filtered = unread === 'true' ? notifs.filter(n => !n.isRead) : notifs;
    const result = applyQuery(filtered, opts, ['title', 'content']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),

  // 鏈鏁?
  http.get(`${API_BASE}/notifications/unread-count`, async () => {
    await delay(50);
    const all = list<any>('criticalEvents').length;
    return HttpResponse.json({ success: true, data: { unread: Math.floor(all * 0.4), total: all } });
  }),

  // 鏍囪宸茶
  http.put(`${API_BASE}/notifications/:id/read`, async ({ params }) => {
    await delay(50);
    return HttpResponse.json({ success: true, data: { id: params.id, isRead: true, readAt: new Date().toISOString() } });
  }),

  // 鎵归噺鏍囪宸茶
  http.post(`${API_BASE}/notifications/mark-all-read`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { markedAt: new Date().toISOString(), count: 0 } });
  }),

  // [v3.0.6.8-47] 通知偏好
  http.get(`${API_BASE}/notifications/prefs`, async () => {
    await delay(30);
    return HttpResponse.json({
      success: true,
      data: { userId: 'A001', email: true, sms: true, inApp: true, dingtalk: false, wechat: false, pushHour: '08:00' },
    });
  }),

  // 鍙戦€侀€氱煡
  http.post(`${API_BASE}/notifications/send`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    const notif = {
      id: `notif-${Date.now()}`,
      ...body,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    auditCreate('notifications', notif);
    return HttpResponse.json({ success: true, data: notif }, { status: 201 });
  }),

  // 鎺ㄩ€?(澶氶€氶亾)
  http.post(`${API_BASE}/notifications/push`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { channels: string[]; message: any };
    const results = body.channels.map(ch => ({ channel: ch, success: true, deliveredAt: new Date().toISOString() }));
    return HttpResponse.json({ success: true, data: { pushed: results.length, results } });
  }),

  // 鍒犻櫎
  http.delete(`${API_BASE}/notifications/:id`, async ({ params }) => {
    auditDelete({ resource: 'notifications', resourceId: params.id as string });
    return new HttpResponse(null, { status: 204 });
  }),

  // 鎸夌被鍨?
  http.get(`${API_BASE}/notifications/by-type/:type`, async ({ params }) => {
    await delay(50);
    const notifs = list<any>('criticalEvents')
      .filter((c: any) => c.category === params.type)
      .slice(0, 20)
      .map((c: any) => ({ id: `n-${c.id}`, title: c.category, content: c.value, type: params.type }));
    return HttpResponse.json({ success: true, data: notifs });
  }),
];

// ============= Templates (7) =============
export const templateHandlers = [
  http.get(`${API_BASE}/templates`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    let data = [
      { id: 'tpl-1', name: '鑳搁儴CT骞虫壂妯℃澘', category: 'CT', content: '褰卞儚鎵€瑙侊細...\n璇婃柇鎰忚锛?..', isPublic: true, createdAt: '2026-01-01' },
      { id: 'tpl-2', name: '鑵归儴MRI澧炲己妯℃澘', category: 'MRI', content: '褰卞儚鎵€瑙侊細...\n璇婃柇鎰忚锛?..', isPublic: true, createdAt: '2026-01-02' },
    ];
    if (category) data = data.filter((t) => t.category === category);
    return HttpResponse.json({ success: true, data });
  }),
  http.get(`${API_BASE}/templates/:id`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, name: '妯℃澘', category: 'CT', content: '褰卞儚鎵€瑙侊細...', isPublic: true } });
  }),
  http.post(`${API_BASE}/templates`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'tpl-' + Date.now(), ...(body as object) } }, { status: 201 });
  }),
  http.put(`${API_BASE}/templates/:id`, async ({ params, request }) => {
    await delay(150);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: params.id, ...(body as object) } });
  }),
  http.delete(`${API_BASE}/templates/:id`, async () => new HttpResponse(null, { status: 204 })),
  http.post(`${API_BASE}/templates/:id/duplicate`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: 'tpl-' + Date.now(), name: '妯℃澘(鍓湰)', originalId: params.id } }, { status: 201 });
  }),
];

// ============= Dictionary (6) =============
export const dictionaryHandlers = [
  http.get(`${API_BASE}/dictionary`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    let data = [
      { id: 'dict-1', type: 'modality', code: 'CT', name: 'CT', description: '璁＄畻鏈烘柇灞傛壂鎻? },
      { id: 'dict-2', type: 'modality', code: 'MR', name: 'MR', description: '纾佸叡鎸垚鍍? },
      { id: 'dict-3', type: 'exam_status', code: 'pending', name: '寰呮鏌? },
      { id: 'dict-4', type: 'exam_status', code: 'completed', name: '宸插畬鎴? },
    ];
    if (type) data = data.filter((d) => d.type === type);
    return HttpResponse.json({ success: true, data });
  }),
  http.get(`${API_BASE}/dictionary/:id`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, type: 'modality', code: 'CT', name: 'CT' } });
  }),
  http.post(`${API_BASE}/dictionary`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'dict-' + Date.now(), ...(body as object) } }, { status: 201 });
  }),
  http.put(`${API_BASE}/dictionary/:id`, async ({ params, request }) => {
    await delay(150);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: params.id, ...(body as object) } });
  }),
  http.delete(`${API_BASE}/dictionary/:id`, async () => new HttpResponse(null, { status: 204 })),
  http.get(`${API_BASE}/dictionary/search`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'dict-1', type: 'modality', code: 'CT', name: 'CT', description: '璁＄畻鏈烘柇灞傛壂鎻? },
      ].filter((d) => d.code.includes(q) || d.name.includes(q)),
    });
  }),
];

// ============= Safety (15) =============
const MOCK_ADVERSE_EVENTS = [
  { id: 'ae-001', eventType: 'contrast-reaction', severity: 'moderate', status: 'investigating', description: '鎮ｈ€呮敞灏勭娴烽唶鍚庡嚭鐜扮毊鐤?, department: 'CT瀹?, reportedBy: '寮犳妧甯?, reportedAt: '2026-06-10T09:00:00Z', patientId: 'P001', patientName: '寮犱笁', location: 'CT瀹?', contributingFactors: ['绌鸿吂鏃堕棿涓嶈冻'], actionsTaken: ['鍋滄娉ㄥ皠', '缁欎簣鎶楄繃鏁忚嵂鐗?], rootCauseIds: [], version: 0 },
  { id: 'ae-002', eventType: 'patient-identification', severity: 'minor', status: 'resolved', description: '鎵弿鍓嶅彂鐜版偅鑰呬俊鎭敊璇?, department: '鐧昏澶?, reportedBy: '鏉庢姢澹?, reportedAt: '2026-06-12T10:30:00Z', patientId: 'P002', patientName: '鏉庡洓', location: '鐧昏绐楀彛', contributingFactors: ['鑵曞甫缂哄け'], actionsTaken: ['鏍稿璇佷欢', '閲嶆柊鎵撳嵃鑵曞甫'], rootCauseIds: [], resolvedAt: '2026-06-12T11:00:00Z', resolvedBy: '鐜嬩富浠?, version: 0 },
  { id: 'ae-003', eventType: 'fall', severity: 'minor', status: 'reported', description: '鎮ｈ€呭湪妫€鏌ュ簥鏃佽穼鍊?, department: 'MRI瀹?, reportedBy: '璧垫妧甯?, reportedAt: '2026-06-15T14:20:00Z', patientId: 'P003', patientName: '鐜嬩簲', location: 'MRI妫€鏌ュ', contributingFactors: ['鍦伴潰婀挎粦'], actionsTaken: ['鎼€鎵?, '璇勪及浼ゆ儏'], rootCauseIds: [], version: 0 },
];

const MOCK_RCA_INVESTIGATIONS = [
  { id: 'rca-001', adverseEventId: 'ae-001', eventTitle: '瀵规瘮鍓傚弽搴旇皟鏌?, description: '閽堝ae-001浜嬩欢杩涜鏍瑰洜鍒嗘瀽', dateOccurred: '2026-06-10T09:00:00Z', dateInvestigationStarted: '2026-06-10T11:00:00Z', status: 'open', teamMembers: ['鐜嬩富浠?, '寮犳妧甯?, '鏉庢姢澹?], fishboneData: [], fiveWhys: [], rootCauses: [], capaPlans: [], capaStatus: 'analyzing', version: 0 },
  { id: 'rca-002', adverseEventId: 'ae-002', eventTitle: '鎮ｈ€呰韩浠借瘑鍒敊璇?, description: '閽堝ae-002浜嬩欢杩涜鏍瑰洜鍒嗘瀽', dateOccurred: '2026-06-12T10:30:00Z', dateInvestigationStarted: '2026-06-12T13:00:00Z', status: 'closed', teamMembers: ['鐜嬩富浠?, '鏉庢姢澹?], fishboneData: [], fiveWhys: [], rootCauses: ['鑵曞甫鎵撳嵃娴佺▼涓嶈鑼?], capaPlans: [], capaStatus: 'closed', conclusion: '鍔犲己鑵曞甫鏍稿娴佺▼', lessonsLearned: '鎺ㄨ鍙屼汉鏍稿鍒跺害', closedAt: '2026-06-13T17:00:00Z', closedBy: '鐜嬩富浠?, version: 0 },
];

const MOCK_RISK_ITEMS = [
  { id: 'risk-001', riskType: 'clinical', title: '楂樺満寮篗RI鎮ｈ€呴搧纾佺瓫鏌?, category: 'clinical', description: '鏈厖鍒嗙瓫鏌ュ彲鑳藉鑷撮搧纾佺墿鍝佽繘鍏ユ壂鎻忓', likelihood: 3, severity: 5, rpn: 15, riskLevel: 'very-high', status: 'mitigating', identifiedBy: '鐜嬩富浠?, identifiedAt: '2026-05-01T08:00:00Z', mitigationPlan: '澧炶MRI涓撶敤绛涙煡闂?, mitigationOwner: '璁惧绉?, mitigationDeadline: '2026-07-31', residualRpn: 6, version: 0 },
  { id: 'risk-002', riskType: 'operational', title: '澶滅彮鎶€甯堜汉鎵嬩笉瓒?, category: 'operational', description: '澶滅彮浠呬竴鍚嶆妧甯?鎬ュ嵄鍊兼棤娉曞強鏃跺鐞?, likelihood: 4, severity: 4, rpn: 16, riskLevel: 'very-high', status: 'identified', identifiedBy: '鏉庝富浠?, identifiedAt: '2026-06-01T08:00:00Z', version: 0 },
  { id: 'risk-003', riskType: 'it-security', title: 'PACS澶栭儴鎺ュ彛瀹夊叏', category: 'it-security', description: '澶栭儴绯荤粺鎺ュ叆PACS鍙兘瀛樺湪鏁版嵁娉勯湶椋庨櫓', likelihood: 2, severity: 5, rpn: 10, riskLevel: 'high', status: 'monitoring', identifiedBy: '淇℃伅瀹夊叏鍛?, identifiedAt: '2026-04-15T08:00:00Z', mitigationPlan: '閮ㄧ讲API缃戝叧', mitigationOwner: '淇℃伅绉?, mitigationDeadline: '2026-08-31', residualRpn: 4, version: 0 },
];

const inMemorySafety = {
  adverseEvents: [...MOCK_ADVERSE_EVENTS],
  rcaInvestigations: [...MOCK_RCA_INVESTIGATIONS],
  riskItems: [...MOCK_RISK_ITEMS],
};

export const safetyHandlers = [
  // AdverseEvent
  http.get(`${API_BASE}/safety/adverse-events`, async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const severity = url.searchParams.get('severity');
    const eventType = url.searchParams.get('eventType');
    let data = inMemorySafety.adverseEvents;
    if (status) data = data.filter(e => e.status === status);
    if (severity) data = data.filter(e => e.severity === severity);
    if (eventType) data = data.filter(e => e.eventType === eventType);
    return HttpResponse.json({ success: true, data });
  }),
  http.get(`${API_BASE}/safety/adverse-events/:id`, async ({ params }) => {
    await delay(80);
    const item = inMemorySafety.adverseEvents.find(e => e.id === params.id);
    if (!item) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'AdverseEvent not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: item });
  }),
  http.post(`${API_BASE}/safety/adverse-events`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as Record<string, unknown>;
    const newItem = { id: 'ae-' + Date.now(), reportedAt: new Date().toISOString(), status: 'reported', version: 0, ...body };
    inMemorySafety.adverseEvents.push(newItem as any);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  http.put(`${API_BASE}/safety/adverse-events/:id`, async ({ params, request }) => {
    await delay(120);
    const body = (await request.json()) as Record<string, unknown>;
    const idx = inMemorySafety.adverseEvents.findIndex(e => e.id === params.id);
    if (idx < 0) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'AdverseEvent not found' } }, { status: 404 });
    const existing = inMemorySafety.adverseEvents[idx]!;
    inMemorySafety.adverseEvents[idx] = { ...existing, ...body, version: (existing.version ?? 0) + 1 };
    return HttpResponse.json({ success: true, data: inMemorySafety.adverseEvents[idx] });
  }),
  http.delete(`${API_BASE}/safety/adverse-events/:id`, async ({ params }) => {
    await delay(80);
    const idx = inMemorySafety.adverseEvents.findIndex(e => e.id === params.id);
    if (idx < 0) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'AdverseEvent not found' } }, { status: 404 });
    inMemorySafety.adverseEvents.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // RcaInvestigation
  http.get(`${API_BASE}/safety/rca-investigations`, async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const capaStatus = url.searchParams.get('capaStatus');
    let data = inMemorySafety.rcaInvestigations;
    if (capaStatus) data = data.filter(r => r.capaStatus === capaStatus);
    return HttpResponse.json({ success: true, data });
  }),
  http.get(`${API_BASE}/safety/rca-investigations/:id`, async ({ params }) => {
    await delay(80);
    const item = inMemorySafety.rcaInvestigations.find(r => r.id === params.id);
    if (!item) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'RcaInvestigation not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: item });
  }),
  http.post(`${API_BASE}/safety/rca-investigations`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as Record<string, unknown>;
    const newItem = { id: 'rca-' + Date.now(), dateInvestigationStarted: new Date().toISOString(), capaStatus: 'open', status: 'open', version: 0, ...body };
    inMemorySafety.rcaInvestigations.push(newItem as any);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  http.put(`${API_BASE}/safety/rca-investigations/:id`, async ({ params, request }) => {
    await delay(120);
    const body = (await request.json()) as Record<string, unknown>;
    const idx = inMemorySafety.rcaInvestigations.findIndex(r => r.id === params.id);
    if (idx < 0) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'RcaInvestigation not found' } }, { status: 404 });
    const existing = inMemorySafety.rcaInvestigations[idx]!;
    inMemorySafety.rcaInvestigations[idx] = { ...existing, ...body, version: (existing.version ?? 0) + 1 };
    return HttpResponse.json({ success: true, data: inMemorySafety.rcaInvestigations[idx] });
  }),
  http.delete(`${API_BASE}/safety/rca-investigations/:id`, async ({ params }) => {
    await delay(80);
    const idx = inMemorySafety.rcaInvestigations.findIndex(r => r.id === params.id);
    if (idx < 0) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'RcaInvestigation not found' } }, { status: 404 });
    inMemorySafety.rcaInvestigations.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // RiskItem
  http.get(`${API_BASE}/safety/risk-items`, async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const riskLevel = url.searchParams.get('riskLevel');
    const status = url.searchParams.get('status');
    let data = inMemorySafety.riskItems;
    if (riskLevel) data = data.filter(r => r.riskLevel === riskLevel);
    if (status) data = data.filter(r => r.status === status);
    return HttpResponse.json({ success: true, data });
  }),
  http.get(`${API_BASE}/safety/risk-items/:id`, async ({ params }) => {
    await delay(80);
    const item = inMemorySafety.riskItems.find(r => r.id === params.id);
    if (!item) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'RiskItem not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: item });
  }),
  http.post(`${API_BASE}/safety/risk-items`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as Record<string, unknown>;
    const newItem = { id: 'risk-' + Date.now(), identifiedAt: new Date().toISOString(), status: 'identified', version: 0, ...body };
    inMemorySafety.riskItems.push(newItem as any);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  http.put(`${API_BASE}/safety/risk-items/:id`, async ({ params, request }) => {
    await delay(120);
    const body = (await request.json()) as Record<string, unknown>;
    const idx = inMemorySafety.riskItems.findIndex(r => r.id === params.id);
    if (idx < 0) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'RiskItem not found' } }, { status: 404 });
    const existing = inMemorySafety.riskItems[idx]!;
    inMemorySafety.riskItems[idx] = { ...existing, ...body, version: (existing.version ?? 0) + 1 };
    return HttpResponse.json({ success: true, data: inMemorySafety.riskItems[idx] });
  }),
  http.delete(`${API_BASE}/safety/risk-items/:id`, async ({ params }) => {
    await delay(80);
    const idx = inMemorySafety.riskItems.findIndex(r => r.id === params.id);
    if (idx < 0) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'RiskItem not found' } }, { status: 404 });
    inMemorySafety.riskItems.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];

// ============= R3.REVIEW 瀹℃牳娴?(80) =============
import { REVIEW_TASKS, REVIEWERS, COSIGN_SCHEDULES, SLA_METRICS, WORKLOAD_STATS, REVIEW_KPI, REJECT_TEMPLATES, REVIEW_COMMENTS, AI_PRE_REVIEW_RESULTS, REVIEWER_ASSIGNMENTS } from '../../data/reportReviewMock';
import { COSIGN_CERTIFICATES, COSIGN_INBOX, COSIGN_REJECT_TEMPLATES, COSIGN_CALENDAR, COSIGN_AUDIT_LOG, COSIGN_KPI } from '../../data/cosignMock';
import { QUALITY_DIMENSIONS, QUALITY_GRADES, QUALITY_WEIGHTS, QUALITY_SCORING_CONFIG, QUALITY_SCORES, QUALITY_KPI, QUALITY_DEFECTS, QUALITY_RULE_VERSIONS, QUALITY_DASHBOARD, MONTHLY_QUALITY_REPORT, DEFECT_REMEDIATIONS } from '../../data/reportQualityMock';
import { CRITICAL_LEVELS, CRITICAL_RULES, CRITICAL_EVENTS, CRITICAL_ESCALATION_RULES, CRITICAL_KPI } from '../../data/criticalValueMock';
import { DEFECT_CATEGORIES, DEFECT_DETAILS, DEFECT_TREE, DEFECT_ANALYTICS, DEFECT_IMPORT_RECORDS } from '../../data/defectLibraryMock';

export const reviewHandlers = [
  // Tasks
  http.get(`${API_BASE}/reviews/tasks`, async () => {
    await delay(150);
    return HttpResponse.json({ success: true, data: REVIEW_TASKS });
  }),
  http.get(`${API_BASE}/reviews/tasks/:id`, async ({ params }) => {
    await delay(80);
    const t = REVIEW_TASKS.find((x: any) => x.id === params.id);
    return t ? HttpResponse.json({ success: true, data: t }) : HttpResponse.json({ success: false }, { status: 404 });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/initial/approve`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'finalReview' } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/initial/reject`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as { reason: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'rejected', reason: body.reason } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/final/approve`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as { needsCosign?: boolean };
    return HttpResponse.json({ success: true, data: { id: params.id, status: body.needsCosign ? 'coSignReview' : 'sign' } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/final/reject`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as { reason: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'rejected', reason: body.reason } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/start-cosign`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'coSignReview' } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/complete-cosign`, async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as { reviewerId: string; certificateId: string };
    return HttpResponse.json({ success: true, data: { id: params.id, cosignedAt: new Date().toISOString(), cosignReviewerId: body.reviewerId } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/reject`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as { reason: string; category: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'rejected', reason: body.reason } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/restart`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'rectifying' } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/complete-rectify`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'writing' } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/escalate`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as { reason: string; escalatedToId: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'escalated' } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/withdraw`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as { reason: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'withdrawn', reason: body.reason } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/cosign/reject`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as { reason: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'rejected', reason: body.reason } });
  }),
  http.post(`${API_BASE}/reviews/tasks/:id/cosign/lock`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, locked: true } });
  }),
  http.post(`${API_BASE}/reviews/batch/final`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { approvedCount: 5 } });
  }),
  http.post(`${API_BASE}/reviews/auto-assign`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { assignedCount: 8 } });
  }),
  http.get(`${API_BASE}/reviews/sla-config`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { initial: 4, final: 2, sign: 1, cosign: 1, escalate: 0.5 } });
  }),
  http.put(`${API_BASE}/reviews/sla-config`, async ({ request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.get(`${API_BASE}/reviews/sla`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: SLA_METRICS });
  }),
  http.get(`${API_BASE}/reviews/kpi/personal`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { totalCompleted: 25, onTimeRate: 92, averageMinutes: 75 } });
  }),
  http.get(`${API_BASE}/reviews/kpi/ranking`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: REVIEWERS.map((r: any) => ({ ...r, rank: 1 })) });
  }),
  http.get(`${API_BASE}/reviews/kpi/distribution`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: WORKLOAD_STATS });
  }),
  http.get(`${API_BASE}/reviews/workload`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: WORKLOAD_STATS });
  }),
  http.get(`${API_BASE}/reviews/templates/initial`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: REJECT_TEMPLATES });
  }),
  http.get(`${API_BASE}/reviews/templates/final`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: REJECT_TEMPLATES });
  }),
  http.get(`${API_BASE}/reviews/templates/reject`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: REJECT_TEMPLATES });
  }),
  http.get(`${API_BASE}/reviews/templates/:id`, async ({ params }) => {
    await delay(60);
    const t = REJECT_TEMPLATES.find((x: any) => x.id === params.id);
    return t ? HttpResponse.json({ success: true, data: t }) : HttpResponse.json({ success: false }, { status: 404 });
  }),
  http.post(`${API_BASE}/reviews/templates/initial`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.put(`${API_BASE}/reviews/templates/initial/:id`, async ({ params, request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json() as object) } });
  }),
  http.delete(`${API_BASE}/reviews/templates/initial/:id`, async () => new HttpResponse(null, { status: 204 })),
  http.get(`${API_BASE}/reviews/rubric`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { dimensions: ['completeness', 'standardization', 'accuracy', 'timeliness', 'terminology'] } });
  }),
  http.get(`${API_BASE}/reviews/stats/initial-pass-rate`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { rate: 87.5 } });
  }),
  http.get(`${API_BASE}/reviews/stats/final-pass-rate`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { rate: 92.3 } });
  }),
  http.get(`${API_BASE}/reviews/stats/avg-duration`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { last7Days: 75, last30Days: 82 } });
  }),
  http.get(`${API_BASE}/reviews/stats/rectify`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { total: 12, avgHours: 18.5, rectifyRate: 8.2 } });
  }),
  http.get(`${API_BASE}/reviews/rectify-list`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: REVIEW_TASKS.filter((t: any) => t.status === 'rejected') });
  }),
  http.get(`${API_BASE}/reviews/escalate-list`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: REVIEW_TASKS.filter((t: any) => t.status === 'escalated') });
  }),
  http.get(`${API_BASE}/reviews/withdraw-list`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: REVIEW_TASKS.filter((t: any) => t.status === 'withdrawn') });
  }),
  http.get(`${API_BASE}/reviews/archive`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: REVIEW_TASKS.filter((t: any) => t.status === 'completed') });
  }),
  http.post(`${API_BASE}/reviews/:id/lock`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, locked: true, ttl: 300 } });
  }),
  http.post(`${API_BASE}/reviews/:id/takeover`, async ({ params, request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, takeover: true } });
  }),
  http.post(`${API_BASE}/reviews/:id/attachments`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, attachmentId: 'att-' + Date.now() } });
  }),
  http.get(`${API_BASE}/reviews/:id/history`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: REVIEW_TASKS.find((t: any) => t.id === params.id)?.history ?? [] });
  }),
  http.get(`${API_BASE}/reviews/:id/audit-chain`, async ({ params }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: [
      { id: 'ac-1', step: 'submit', actorId: 'D002', actorName: '鏉庢収鏁?, action: '鎶ュ憡鎻愪氦', timestamp: new Date().toISOString(), hash: 'a1b2c3' },
    ] });
  }),
  http.get(`${API_BASE}/reviews/:id/comment-history`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: REVIEW_COMMENTS });
  }),
  http.get(`${API_BASE}/reviews/:id/comments`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: REVIEW_COMMENTS.filter((c: any) => c.taskId === params.id) });
  }),
  http.post(`${API_BASE}/reviews/:id/comments`, async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ success: true, data: { id: 'cmt-' + Date.now(), taskId: params.id, createdAt: new Date().toISOString(), ...body } }, { status: 201 });
  }),
  http.put(`${API_BASE}/reviews/:id/comments/:commentId/resolve`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.commentId, resolved: true } });
  }),
  http.get(`${API_BASE}/ai/pre-review/:reportId`, async ({ params }) => {
    await delay(800);
    const ai = AI_PRE_REVIEW_RESULTS.find((r: any) => r.reportId === params.reportId);
    return HttpResponse.json({ success: true, data: ai ?? {
      id: 'ai-' + Date.now(), reportId: params.reportId, suggestedScore: 85, confidence: 0.85,
      defects: [], suggestions: ['鏁翠綋璐ㄩ噺鑹ソ'], riskLevel: 'low',
      consistencyScore: 0.88, completenessScore: 0.85, terminologyScore: 0.90,
      criticalFindingDetected: false, generatedAt: new Date().toISOString(), modelVersion: 'v2.3.1',
    } });
  }),
  http.post(`${API_BASE}/ai/pre-review/:reportId`, async ({ params }) => {
    await delay(1500);
    return HttpResponse.json({ success: true, data: { id: 'ai-' + Date.now(), reportId: params.reportId, generatedAt: new Date().toISOString() } });
  }),
  http.post(`${API_BASE}/reviews/:id/assign`, async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as { reviewerId: string };
    return HttpResponse.json({ success: true, data: { id: params.id, reviewerId: body.reviewerId } });
  }),
  http.get(`${API_BASE}/reviews/reviewers`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: REVIEWERS });
  }),
  http.post(`${API_BASE}/reviews/batch-assign`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { assigned: 5 } });
  }),
  http.get(`${API_BASE}/reviews/preferences`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { listDensity: 'standard', sortBy: 'priority' } });
  }),
  http.put(`${API_BASE}/reviews/preferences`, async ({ request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.get(`${API_BASE}/reviews/cosign-config`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { criticalFinding: true, stat: true, specialStudy: true, directorSign: true } });
  }),
  http.put(`${API_BASE}/reviews/cosign-config`, async ({ request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.get(`${API_BASE}/reviews/cosign/schedule`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: COSIGN_CALENDAR });
  }),
  http.get(`${API_BASE}/reviews/inbox/cosign`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: COSIGN_INBOX });
  }),
  http.get(`${API_BASE}/reviews/cosign/certificates`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: COSIGN_CERTIFICATES });
  }),
  http.post(`${API_BASE}/reviews/cosign/certificates`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: 'cert-' + Date.now(), ...(await request.json() as object) } }, { status: 201 });
  }),
  http.get(`${API_BASE}/reviews/cosign/certificates/:id/validate`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, valid: true, chainValid: true } });
  }),
  http.post(`${API_BASE}/reviews/cosign/sign`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { id: params.id, signatureHash: 'mock-' + Date.now() } });
  }),
  http.get(`${API_BASE}/reviews/cosign/cert/:id`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, valid: true } });
  }),
  http.get(`${API_BASE}/reviews/cosign/log/:id`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: COSIGN_AUDIT_LOG });
  }),
  http.post(`${API_BASE}/reviews/cosign/retrigger`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, retriggered: true } });
  }),
  http.post(`${API_BASE}/reviews/cosign/multi`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: params.id, multiCosign: true } });
  }),
  http.post(`${API_BASE}/reviews/cosign/revoke`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, revoked: true } });
  }),
  http.get(`${API_BASE}/reviews/cosign/consent.pdf`, async () => {
    return new HttpResponse(new ArrayBuffer(1024), { headers: { 'Content-Type': 'application/pdf' } });
  }),
  http.get(`${API_BASE}/reviews/cosign/archive`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.post(`${API_BASE}/reviews/cosign/batch`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { signed: 3 } });
  }),
  http.get(`${API_BASE}/reviews/kpi/cosign`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: COSIGN_KPI });
  }),
];

// ============= R3.QUALITY 璐ㄦ帶 (60) =============
export const qualityHandlers = [
  http.get(`${API_BASE}/quality/dimensions`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: QUALITY_DIMENSIONS });
  }),
  http.get(`${API_BASE}/quality/weights`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: QUALITY_WEIGHTS });
  }),
  http.put(`${API_BASE}/quality/weights`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.get(`${API_BASE}/quality/grades`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: QUALITY_GRADES });
  }),
  http.get(`${API_BASE}/quality/sub-criteria`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: QUALITY_DIMENSIONS.flatMap((d: any) => d.subCriteria ?? []) });
  }),
  http.get(`${API_BASE}/quality/dimensions`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: QUALITY_DIMENSIONS });
  }),
  http.post(`${API_BASE}/quality/dimensions`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.post(`${API_BASE}/quality/score`, async ({ request }) => {
    await delay(1500);
    return HttpResponse.json({ success: true, data: { id: 'qs-' + Date.now(), ...(await request.json() as object), totalScore: 88, grade: '涔? } });
  }),
  http.post(`${API_BASE}/quality/score/v2`, async ({ request }) => {
    await delay(1500);
    return HttpResponse.json({ success: true, data: { id: 'qs-' + Date.now(), ...(await request.json() as object), totalScore: 90, grade: '鐢? } });
  }),
  http.post(`${API_BASE}/quality/rescore`, async ({ request }) => {
    await delay(1500);
    return HttpResponse.json({ success: true, data: { id: 'qs-' + Date.now(), ...(await request.json() as object), totalScore: 92, grade: '鐢? } });
  }),
  http.post(`${API_BASE}/quality/batch-rescore`, async () => {
    await delay(2000);
    return HttpResponse.json({ success: true, data: { rescored: 25 } });
  }),
  http.post(`${API_BASE}/quality/pre-score`, async () => {
    await delay(1000);
    return HttpResponse.json({ success: true, data: { totalScore: 85, grade: '涔? } });
  }),
  http.get(`${API_BASE}/quality/audit`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: QUALITY_SCORES.map((s: any) => ({ id: s.id, action: 'evaluate', actor: s.evaluatedBy, timestamp: s.evaluatedAt })) });
  }),
  http.get(`${API_BASE}/quality/score/:id`, async ({ params }) => {
    await delay(80);
    const s = QUALITY_SCORES.find((x: any) => x.id === params.id);
    return s ? HttpResponse.json({ success: true, data: s }) : HttpResponse.json({ success: false }, { status: 404 });
  }),
  http.get(`${API_BASE}/quality/scores`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: QUALITY_SCORES });
  }),
  http.put(`${API_BASE}/quality/score/:id/override`, async ({ params, request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json() as object) } });
  }),
  http.get(`${API_BASE}/quality/:id/history`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: QUALITY_SCORES });
  }),
  http.get(`${API_BASE}/quality/ranking`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: QUALITY_KPI.doctorRanking });
  }),
  http.get(`${API_BASE}/quality/suggestion-acceptance`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { rate: 78.5 } });
  }),
  http.get(`${API_BASE}/quality/export.xlsx`, async () => {
    return new HttpResponse(new ArrayBuffer(1024), { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } });
  }),
  http.get(`${API_BASE}/quality/export.pdf`, async () => {
    return new HttpResponse(new ArrayBuffer(1024), { headers: { 'Content-Type': 'application/pdf' } });
  }),
  http.get(`${API_BASE}/quality/versions`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: QUALITY_RULE_VERSIONS });
  }),
  http.post(`${API_BASE}/quality/versions`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.post(`${API_BASE}/quality/versions/:v/rollback`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { version: params.v, status: 'rolled-back' } });
  }),
  http.get(`${API_BASE}/quality/versions/:v/diff`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { changes: [] } });
  }),
  http.get(`${API_BASE}/quality/hard-fail`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { items: ['critical-not-marked', 'left-right-confusion'] } });
  }),
  http.put(`${API_BASE}/quality/hard-fail`, async ({ request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.post(`${API_BASE}/quality/feedback`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: 'fb-' + Date.now(), ...(await request.json() as object) } });
  }),
  http.post(`${API_BASE}/quality/feedback/:id/ack`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, acknowledged: true } });
  }),
  http.post(`${API_BASE}/quality/rectify`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.post(`${API_BASE}/quality/qc-review`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.post(`${API_BASE}/quality/qc-close`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'closed' } });
  }),
  http.post(`${API_BASE}/quality/qc-escalate`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, escalated: true } });
  }),
  http.post(`${API_BASE}/quality/qc-issue`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: 'qci-' + Date.now(), ...(await request.json() as object) } });
  }),
  http.post(`${API_BASE}/quality/qc-score`, async ({ request }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.get(`${API_BASE}/quality/qc-templates`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.get(`${API_BASE}/quality/tat`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { critical: 30, urgent: 120, routine: 1440 } });
  }),
  http.put(`${API_BASE}/quality/tat`, async ({ request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.get(`${API_BASE}/quality/tat/realtime`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { onTime: 95, overdue: 5 } });
  }),
  http.get(`${API_BASE}/quality/tat/stats`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { onTimeRate: 92, avgMinutes: 45 } });
  }),
  http.get(`${API_BASE}/quality/workbench`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { tasks: [] } });
  }),
  http.get(`${API_BASE}/quality/sampling`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { rate: 5 } });
  }),
  http.put(`${API_BASE}/quality/sampling`, async ({ request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.post(`${API_BASE}/quality/sampling/run`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { sampled: 10 } });
  }),
  http.get(`${API_BASE}/quality/sampling/:id`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, results: [] } });
  }),
  http.get(`${API_BASE}/quality/monthly-report`, async ({ request }) => {
    await delay(800);
    return HttpResponse.json({ success: true, data: MONTHLY_QUALITY_REPORT });
  }),
  http.get(`${API_BASE}/quality/dashboard`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: QUALITY_DASHBOARD });
  }),
  http.get(`${API_BASE}/quality/radpeer`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { score: 1, category: '1' } });
  }),
  http.get(`${API_BASE}/quality/keyword-rules`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.get(`${API_BASE}/quality/keyword-rules/:id`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, name: 'mock rule' } });
  }),
  http.put(`${API_BASE}/quality/keyword-rules/:id`, async ({ params, request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json() as object) } });
  }),
  http.post(`${API_BASE}/quality/keyword-rules`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.post(`${API_BASE}/quality/keyword-scan`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { scanId: 'scan-' + Date.now(), ...(await request.json() as object) } });
  }),
  http.get(`${API_BASE}/quality/keyword-scan/:id`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'completed' } });
  }),
  http.get(`${API_BASE}/quality/keyword-scan-history`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.get(`${API_BASE}/quality/keyword-stats`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { hitRate: 0.85 } });
  }),
  http.post(`${API_BASE}/quality/keyword-rules/batch`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { imported: 10 } });
  }),
  http.get(`${API_BASE}/quality/radlex-validate`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { valid: true } });
  }),
  http.get(`${API_BASE}/quality/radlex`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { terms: [] } });
  }),
  http.get(`${API_BASE}/quality/synonyms`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.post(`${API_BASE}/quality/keyword-rules/test`, async ({ request }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { matches: [] } });
  }),
  http.post(`${API_BASE}/quality/keyword-fix`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { fixed: 5 } });
  }),
  http.get(`${API_BASE}/quality/keyword-scan/batch`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { results: [] } });
  }),
  http.post(`${API_BASE}/quality/keyword-rules/import.xlsx`, async () => {
    await delay(500);
    return HttpResponse.json({ success: true, data: { imported: 12 } });
  }),
];

// ============= R3.CRITICAL 鍗辨€ュ€?(30) =============
export const criticalHandlers = [
  http.get(`${API_BASE}/critical/rules`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: CRITICAL_RULES });
  }),
  http.get(`${API_BASE}/critical/rules/:id`, async ({ params }) => {
    await delay(80);
    const r = CRITICAL_RULES.find((x: any) => x.id === params.id);
    return r ? HttpResponse.json({ success: true, data: r }) : HttpResponse.json({ success: false }, { status: 404 });
  }),
  http.put(`${API_BASE}/critical/rules/:id`, async ({ params, request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json() as object) } });
  }),
  http.put(`${API_BASE}/critical/rules/:id/toggle`, async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as { isActive: boolean };
    return HttpResponse.json({ success: true, data: { id: params.id, isActive: body.isActive } });
  }),
  http.get(`${API_BASE}/critical/events`, async () => {
    await delay(150);
    return HttpResponse.json({ success: true, data: CRITICAL_EVENTS });
  }),
  http.get(`${API_BASE}/critical/events/:id`, async ({ params }) => {
    await delay(80);
    const e = CRITICAL_EVENTS.find((x: any) => x.id === params.id);
    return e ? HttpResponse.json({ success: true, data: e }) : HttpResponse.json({ success: false }, { status: 404 });
  }),
  http.post(`${API_BASE}/critical/events`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: 'ce-' + Date.now(), ...(await request.json() as object), status: 'pending', reportedAt: new Date().toISOString() } }, { status: 201 });
  }),
  http.put(`${API_BASE}/critical/events/:id/acknowledge`, async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as { userId: string; userName: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'acknowledged', acknowledgedById: body.userId, acknowledgedAt: new Date().toISOString() } });
  }),
  http.put(`${API_BASE}/critical/events/:id/resolve`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'resolved', resolvedTime: new Date().toISOString() } });
  }),
  http.put(`${API_BASE}/critical/events/:id/notify`, async ({ params, request }) => {
    await delay(120);
    const body = (await request.json()) as { channels: string[]; recipientId: string; recipientName: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'notified', channels: body.channels, receivingDoctorId: body.recipientId, receivingTime: new Date().toISOString() } });
  }),
  http.post(`${API_BASE}/critical/events/:id/escalate`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as { toId: string; toName: string; reason: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'escalated', escalatedToId: body.toId, escalatedToName: body.toName, escalatedAt: new Date().toISOString(), escalationLevel: 1 } });
  }),
  http.post(`${API_BASE}/critical/events/:id/dual-review`, async ({ params, request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json() as object) } });
  }),
  http.get(`${API_BASE}/critical/escalation-rules`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: CRITICAL_ESCALATION_RULES });
  }),
  http.put(`${API_BASE}/critical/escalation-rules/:id`, async ({ params, request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json() as object) } });
  }),
  http.get(`${API_BASE}/critical/levels`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: CRITICAL_LEVELS });
  }),
  http.get(`${API_BASE}/critical/level/:level`, async ({ params }) => {
    await delay(60);
    return HttpResponse.json({ success: true, data: CRITICAL_LEVELS.find((l: any) => l.level === params.level) });
  }),
  http.get(`${API_BASE}/critical/kpi`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: CRITICAL_KPI });
  }),
  http.get(`${API_BASE}/critical/sop`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.put(`${API_BASE}/critical/sop/:id`, async ({ params, request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json() as object) } });
  }),
  http.get(`${API_BASE}/critical/export.xlsx`, async () => {
    return new HttpResponse(new ArrayBuffer(1024), { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } });
  }),
  http.get(`${API_BASE}/critical/export.pdf`, async () => {
    return new HttpResponse(new ArrayBuffer(1024), { headers: { 'Content-Type': 'application/pdf' } });
  }),
  http.post(`${API_BASE}/critical/critical-rules`, async ({ request }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: 'cv-' + Date.now(), ...(await request.json() as object) } }, { status: 201 });
  }),
  http.put(`${API_BASE}/critical/critical-rules`, async ({ request }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.post(`${API_BASE}/critical/critical-rules/test`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { triggered: 2, matches: [] } });
  }),
  http.get(`${API_BASE}/critical/critical-rules/stats`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { totalTriggers: 23 } });
  }),
  http.get(`${API_BASE}/critical/events/audit/:id`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.post(`${API_BASE}/critical/events/recall/:id`, async ({ params }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: params.id, recalled: true } });
  }),
  http.post(`${API_BASE}/critical/events/ack-batch`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { acked: 3 } });
  }),
  http.get(`${API_BASE}/critical/templates`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.post(`${API_BASE}/critical/templates`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
];

// ============= R3.DEFECT 缂洪櫡 (20) =============
export const defectHandlers = [
  http.get(`${API_BASE}/quality/defect-categories`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: DEFECT_CATEGORIES });
  }),
  http.get(`${API_BASE}/quality/defects`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: DEFECT_DETAILS });
  }),
  http.get(`${API_BASE}/quality/defects/:code`, async ({ params }) => {
    await delay(80);
    const d = DEFECT_DETAILS.find((x: any) => x.code === params.code);
    return d ? HttpResponse.json({ success: true, data: d }) : HttpResponse.json({ success: false }, { status: 404 });
  }),
  http.post(`${API_BASE}/quality/defects`, async ({ request }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: 'd-' + Date.now(), ...(await request.json() as object) } }, { status: 201 });
  }),
  http.put(`${API_BASE}/quality/defects/:code`, async ({ params, request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { code: params.code, ...(await request.json() as object) } });
  }),
  http.delete(`${API_BASE}/quality/defects/:code`, async () => new HttpResponse(null, { status: 204 })),
  http.get(`${API_BASE}/quality/defects/:code/examples`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { examples: [] } });
  }),
  http.get(`${API_BASE}/quality/defects/tree`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: DEFECT_TREE });
  }),
  http.post(`${API_BASE}/quality/defects/import`, async ({ request }) => {
    await delay(500);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.get(`${API_BASE}/quality/defects/export`, async () => {
    await delay(200);
    return new HttpResponse(new ArrayBuffer(1024), { headers: { 'Content-Type': 'application/json' } });
  }),
  http.get(`${API_BASE}/quality/defect-fix-rate`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { rate: 82.5 } });
  }),
  http.get(`${API_BASE}/quality/defect-trend`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: DEFECT_ANALYTICS.trends });
  }),
  http.post(`${API_BASE}/quality/defect-ai-attribute`, async ({ request }) => {
    await delay(800);
    return HttpResponse.json({ success: true, data: { attribution: 'ai-mock' } });
  }),
  http.get(`${API_BASE}/quality/test-cases`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.post(`${API_BASE}/quality/test-cases`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: await request.json() });
  }),
  http.get(`${API_BASE}/quality/remediations`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: DEFECT_REMEDIATIONS });
  }),
  http.post(`${API_BASE}/quality/remediations`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: 'dr-' + Date.now(), ...(await request.json() as object) } }, { status: 201 });
  }),
  http.put(`${API_BASE}/quality/remediations/:id`, async ({ params, request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json() as object) } });
  }),
  http.post(`${API_BASE}/quality/remediations/:id/remind`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, reminded: true } });
  }),
  http.get(`${API_BASE}/quality/defects/import-records`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: DEFECT_IMPORT_RECORDS });
  }),
];

// ============= R3.SIGN 绛剧珷 (50) =============
export const signHandlers = [
  // 璇佷功绠＄悊
  http.get(`${API_BASE}/sign/certs`, async () => {
    await delay(120);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'cert-001', serialNumber: '3A7F-9D2C-1145-E0B8', subject: { commonName: '寮犳槑杩?, userId: 'D001', role: 'doctor', title: '涓讳换鍖诲笀' }, certType: 'RSA-SHA256', status: 'active', notBefore: '2025-06-01T00:00:00Z', notAfter: '2027-06-01T00:00:00Z', publicKeyFingerprint: 'SHA256:7e2b:fa3c:9d12:4801:e9a6:bb34:c7f2:1d50', usageCount: 248, createdAt: '2025-06-01T09:00:00Z', createdBy: 'admin-ca' },
        { id: 'cert-002', serialNumber: '8C1E-4B7A-93DF-2206', subject: { commonName: '鏉庢収鏁?, userId: 'D002', role: 'doctor', title: '鍓富浠诲尰甯? }, certType: 'RSA-SHA256', status: 'active', notBefore: '2025-08-15T00:00:00Z', notAfter: '2026-08-15T00:00:00Z', publicKeyFingerprint: 'SHA256:1a3d:5e9b:c840:21fa:0e62:bb91:c723:4851', usageCount: 132, createdAt: '2025-08-15T10:30:00Z', createdBy: 'admin-ca' },
        { id: 'cert-003', serialNumber: '2F4D-8E1B-A039-7C58', subject: { commonName: '璧甸洩鐞?, userId: 'D006', role: 'doctor', title: '涓讳换鍖诲笀' }, certType: 'SM3-SM2', status: 'expired', notBefore: '2024-09-01T00:00:00Z', notAfter: '2025-09-01T00:00:00Z', publicKeyFingerprint: 'SM3:5c81:d3a7:9e42:01f6:7b9d:2148:cc05:6a39', usageCount: 67, createdAt: '2024-09-01T11:00:00Z', createdBy: 'admin-ca' },
        { id: 'cert-004', serialNumber: '6B5A-0FCE-7731-D49A', subject: { commonName: '鐜嬪缓鍗?, userId: 'D003', role: 'doctor', title: '涓绘不鍖诲笀' }, certType: 'RSA-SHA256', status: 'active', notBefore: '2025-04-10T00:00:00Z', notAfter: '2026-07-10T00:00:00Z', publicKeyFingerprint: 'SHA256:3f7a:e1c4:9b50:28d1:06a3:5e9f:c712:48b3', usageCount: 89, createdAt: '2025-04-10T14:00:00Z', createdBy: 'admin-ca' },
      ],
    });
  }),
  http.get(`${API_BASE}/sign/certs/:id`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, serialNumber: '3A7F-9D2C-1145-E0B8', status: 'active' } });
  }),
  http.post(`${API_BASE}/sign/certs`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ success: true, data: { id: 'cert-' + Date.now(), serialNumber: 'NEW-' + Date.now(), status: 'active', usageCount: 0, createdAt: new Date().toISOString(), ...body } }, { status: 201 });
  }),
  http.delete(`${API_BASE}/sign/certs/:id`, async ({ params }) => {
    await delay(100);
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(`${API_BASE}/sign/certs/:id/validate`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, valid: true, chainValid: true } });
  }),
  http.get(`${API_BASE}/sign/certs/:id/stats`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, usageCount: 248, lastUsedAt: '2026-06-04T10:23:45Z' } });
  }),
  http.post(`${API_BASE}/sign/certs/backup`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { backupId: 'bk-' + Date.now(), size: 4096 } });
  }),
  http.post(`${API_BASE}/sign/certs/import`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { id: 'cert-' + Date.now(), imported: true } }, { status: 201 });
  }),
  http.get(`${API_BASE}/sign/crl`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [
      { serialNumber: '9D2E-5B8F-A4C1-0336', revokedAt: '2026-01-15T10:00:00Z', reason: 'unspecified' },
    ] });
  }),
  http.get(`${API_BASE}/sign/ocsp`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    return HttpResponse.json({ success: true, data: { serialNumber: url.searchParams.get('serial'), status: 'good', thisUpdate: new Date().toISOString() } });
  }),
  // 绛剧珷娴佺▼
  http.post(`${API_BASE}/sign/start`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { reportId: string };
    return HttpResponse.json({ success: true, data: { reportId: body.reportId, status: 'signing', startedAt: new Date().toISOString() } });
  }),
  http.post(`${API_BASE}/sign/auth`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { authenticated: true, token: 'auth-' + Date.now() } });
  }),
  http.post(`${API_BASE}/sign/generate`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { reportId: string; certificateId: string; algorithm: string };
    return HttpResponse.json({
      success: true,
      data: {
        signatureId: 'sig-' + Date.now(),
        reportId: body.reportId,
        contentHash: 'a3f5' + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        signatureValue: 'MEUCIQ' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '==',
        algorithm: body.algorithm ?? 'RSA-SHA256',
        signedAt: new Date().toISOString(),
      },
    });
  }),
  http.post(`${API_BASE}/sign/timestamp`, async ({ request }) => {
    await delay(250);
    const body = (await request.json()) as { reportId: string; hash: string };
    return HttpResponse.json({
      success: true,
      data: {
        id: 'ts-' + Date.now(),
        reportId: body.reportId,
        timestamp: new Date().toISOString(),
        tsaName: 'G005 鍖婚櫌 TSA',
        tsaSerial: 'GHTSA-' + Date.now(),
        hashBefore: body.hash,
        trustLevel: 'hospital',
      },
    });
  }),
  http.post(`${API_BASE}/sign/complete`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'signed', signedAt: new Date().toISOString() } });
  }),
  http.get(`${API_BASE}/sign/log`, async ({ request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [
      { id: 'slog-001', reportId: 'RP20260601001', signerName: '寮犳槑杩?, action: 'sign', success: true, signedAt: '2026-06-01T10:23:45Z' },
      { id: 'slog-002', reportId: 'RP20260602001', signerName: '鏉庢収鏁?, action: 'sign', success: true, signedAt: '2026-06-02T14:08:12Z' },
    ] });
  }),
  http.post(`${API_BASE}/sign/revoke`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: 'rev-' + Date.now(), status: 'pending' } });
  }),
  http.post(`${API_BASE}/sign/blockchain/anchor`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { reportId: string; contentHash: string };
    return HttpResponse.json({
      success: true,
      data: {
        id: 'bc-' + Date.now(),
        reportId: body.reportId,
        txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        blockNumber: 18430000 + Math.floor(Math.random() * 1000),
        contentHash: body.contentHash,
        network: 'hospital-chain',
        confirmations: 1,
      },
    });
  }),
  http.get(`${API_BASE}/sign/blockchain/proofs`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: [
      { id: 'bc-001', reportId: 'RP20260601001', txHash: '0xa3f5b7c9d1e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4', blockNumber: 18429501, network: 'hospital-chain', confirmations: 12840 },
    ] });
  }),
  http.post(`${API_BASE}/sign/blockchain/verify`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { verified: true, blockNumber: 18429501 } });
  }),
  http.post(`${API_BASE}/sign/biometric`, async ({ request }) => {
    await delay(800);
    return HttpResponse.json({
      success: true,
      data: {
        id: 'bio-' + Date.now(),
        method: 'face',
        success: true,
        confidence: 0.94,
        livenessScore: 0.92,
        verifiedAt: new Date().toISOString(),
      },
    });
  }),
  http.get(`${API_BASE}/sign/biometric/history`, async ({ request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [
      { id: 'bio-001', userId: 'D001', method: 'face', success: true, confidence: 0.96, verifiedAt: '2026-06-01T10:23:30Z' },
    ] });
  }),
  http.get(`${API_BASE}/sign/verify`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: {
        reportId: 'RP20260601001',
        isValid: true,
        isExpired: false,
        isRevoked: false,
        signerName: '寮犳槑杩?,
        algorithm: 'RSA-SHA256',
        signedAt: '2026-06-01T10:23:45Z',
        verifyCount: 3,
      },
    });
  }),
  http.get(`${API_BASE}/sign/verify/:id`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: {
        reportId: params.id,
        isValid: true,
        signerName: '鏉庢収鏁?,
        algorithm: 'RSA-SHA256',
        signedAt: '2026-06-02T14:08:12Z',
        verifyCount: 1,
      },
    });
  }),
  http.get(`${API_BASE}/sign/:id/qr`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: {
        reportId: params.id,
        qrContent: `RP|${params.id}|hash:abc123|ts:2026-06-01`,
        verifyUrl: `https://verify.g005-hospital.local/sign/${params.id}`,
        errorCorrection: 'H',
      },
    });
  }),
  // 鍙戝竷 + 閿佸畾
  http.post(`${API_BASE}/sign/publish`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'published', publishedAt: new Date().toISOString() } });
  }),
  http.post(`${API_BASE}/sign/publish/batch`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { ids: string[] };
    return HttpResponse.json({ success: true, data: { publishedCount: body.ids?.length ?? 0 } });
  }),
  http.post(`${API_BASE}/sign/schedule`, async ({ request }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { scheduleId: 'sch-' + Date.now(), publishAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString() } });
  }),
  http.post(`${API_BASE}/sign/unlock-request`, async ({ request }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: 'unlock-' + Date.now(), status: 'pending' } });
  }),
  http.post(`${API_BASE}/sign/unlock-approve`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'approved' } });
  }),
  http.get(`${API_BASE}/sign/lock-audit`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.get(`${API_BASE}/sign/kpi`, async () => {
    await delay(80);
    return HttpResponse.json({
      success: true,
      data: [
        { period: 'today', totalSigned: 28, totalPublished: 24, totalRevoked: 1, avgSignDurationMs: 1850, failureRate: 0.035 },
        { period: 'week', totalSigned: 168, totalPublished: 142, totalRevoked: 4, avgSignDurationMs: 1980, failureRate: 0.024 },
        { period: 'month', totalSigned: 712, totalPublished: 638, totalRevoked: 18, avgSignDurationMs: 2050, failureRate: 0.025 },
      ],
    });
  }),
  http.post(`${API_BASE}/sign/notify-patient`, async () => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { notified: true, channels: ['sms', 'wechat'] } });
  }),
  http.post(`${API_BASE}/sign/notify-doctor`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { notified: true } });
  }),
  http.post(`${API_BASE}/sign/notify-clinic`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { notified: true } });
  }),
  http.get(`${API_BASE}/sign/verify-log`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.post(`${API_BASE}/sign/verify-alert`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { alerted: true } });
  }),
  http.get(`${API_BASE}/sign/legal-doc`, async () => {
    return new HttpResponse(new ArrayBuffer(1024), { headers: { 'Content-Type': 'application/pdf' } });
  }),
  http.post(`${API_BASE}/sign/legal-consult`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { consultId: 'lc-' + Date.now() } });
  }),
  http.get(`${API_BASE}/sign/algorithms`, async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'RSA-SHA256', label: 'RSA-SHA256', description: '鍥介檯閫氱敤锛?048 浣?RSA + SHA-256' },
        { id: 'SM3-SM2', label: 'SM3-SM2', description: '鍥藉瘑鍚堣锛孲M3 鎽樿 + SM2 绛惧悕' },
      ],
    });
  }),
  http.get(`${API_BASE}/sign/audit`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.post(`${API_BASE}/sign/retries`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { retried: 1 } });
  }),
  http.post(`${API_BASE}/sign/failure-alert`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { alerted: true } });
  }),
  http.get(`${API_BASE}/sign/export`, async () => {
    await delay(300);
    return new HttpResponse(new ArrayBuffer(2048), { headers: { 'Content-Type': 'application/json' } });
  }),
];

// ============= R3.AMEND 淇 (40) =============
export const amendHandlers = [
  http.get(`${API_BASE}/amend`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: [
      { id: 'rev-ent-001', reportId: 'RP20260601001', version: 1, action: 'start', reason: '鍘熸姤鍛婇仐婕忓彸鑲轰笅鍙剁（鐜荤拑缁撹妭', authorName: '寮犳槑杩?, createdAt: '2026-06-05T08:30:00Z' },
      { id: 'rev-ent-004', reportId: 'RP20260602008', version: 1, action: 'start', reason: '鐥呯悊鍥炴姤锛氳吅鐧岋紝闇€淇鍘熸姤鍛?, authorName: '鏉庢収鏁?, createdAt: '2026-06-03T15:30:00Z' },
      { id: 'rev-ent-006', reportId: 'RP20260603003', version: 1, action: 'start', reason: '宸﹀彸浣嶇疆鎻忚堪閿欒', authorName: '鐜嬪缓鍗?, createdAt: '2026-06-04T14:00:00Z' },
    ] });
  }),
  http.get(`${API_BASE}/amend/:id/chain`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({
      success: true,
      data: [
        { version: 1, authorName: '寮犳槑杩?, action: 'start', reason: '鍘熸姤鍛婇仐婕忓彸鑲轰笅鍙剁（鐜荤拑缁撹妭', createdAt: '2026-06-05T08:30:00Z', isCurrent: false, hasCoSign: false, hasApproval: true },
        { version: 2, authorName: '寮犳槑杩?, action: 'edit', reason: '琛ュ厖 Lung-RADS 鍒嗙被鍙婇殢璁垮缓璁?, createdAt: '2026-06-05T09:00:00Z', isCurrent: false, hasCoSign: true, hasApproval: true },
        { version: 3, authorName: '寮犳槑杩?, action: 'complete', reason: '瀹屾垚淇骞跺彂甯?, createdAt: '2026-06-05T10:00:00Z', isCurrent: true, hasCoSign: true, hasApproval: true },
      ],
    });
  }),
  http.post(`${API_BASE}/amend/start`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { reportId: string; reason: string };
    return HttpResponse.json({
      success: true,
      data: {
        id: 'rev-' + Date.now(),
        reportId: body.reportId,
        version: 1,
        action: 'start',
        reason: body.reason,
        createdAt: new Date().toISOString(),
      },
    });
  }),
  http.put(`${API_BASE}/amend/:id`, async ({ params, request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: params.id, ...(await request.json() as object) } });
  }),
  http.post(`${API_BASE}/amend/:id/diff-preview`, async ({ request }) => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: {
        totalChanges: 3,
        addedChars: 78,
        removedChars: 18,
        fields: [
          { field: 'examFindings', additions: 1, deletions: 1 },
          { field: 'diagnosis', additions: 1, deletions: 1 },
          { field: 'impression', additions: 1, deletions: 1 },
        ],
      },
    });
  }),
  http.post(`${API_BASE}/amend/:id/complete`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'amended', completedAt: new Date().toISOString() } });
  }),
  http.post(`${API_BASE}/amend/:id/abandon`, async ({ params, request }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'published' } });
  }),
  http.post(`${API_BASE}/amend/:id/sign`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { id: params.id, reSignedAt: new Date().toISOString() } });
  }),
  http.post(`${API_BASE}/amend/:id/publish`, async ({ params }) => {
    await delay(250);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'published', publishedAt: new Date().toISOString() } });
  }),
  http.post(`${API_BASE}/amend/:id/notice-patient`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, noticeId: 'notice-' + Date.now() } });
  }),
  http.get(`${API_BASE}/amend/:id/diff`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const fromVersion = parseInt(url.searchParams.get('from') ?? '1');
    const toVersion = parseInt(url.searchParams.get('to') ?? '2');
    return HttpResponse.json({
      success: true,
      data: {
        id: 'diff-' + Date.now(),
        fromVersion,
        toVersion,
        fields: [
          {
            field: 'examFindings',
            before: '鍙岃偤绾圭悊娓呮櫚锛屾湭瑙佹槑鏄惧疄璐ㄦ€х梾鍙樸€?,
            after: '鍙岃偤绾圭悊娓呮櫚锛屽彸鑲轰笅鍙惰儗娈靛彲瑙佷竴纾ㄧ幓鐠冨瘑搴︾粨鑺傦紝澶у皬绾?8mm脳7mm銆?,
            additions: 1,
            deletions: 1,
          },
        ],
        totalChanges: 1,
      },
    });
  }),
  http.get(`${API_BASE}/amend/:id/needs-approval`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { needsApproval: true, reasons: ['critical-change', 'director-required'] } });
  }),
  http.get(`${API_BASE}/amend/:id/needs-cosign`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { needsCosign: true, reasons: ['severity-high'] } });
  }),
  http.post(`${API_BASE}/amend/:id/approve`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'approved' } });
  }),
  http.post(`${API_BASE}/amend/:id/reject`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as { reason: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'rejected', reason: body.reason } });
  }),
  http.post(`${API_BASE}/amend/:id/cosign`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: params.id, coSignedAt: new Date().toISOString() } });
  }),
  http.get(`${API_BASE}/amend/approvals`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [
      { id: 'apr-001', revisionId: 'rev-ent-001', status: 'approved', approverName: '璧甸洩鐞?, createdAt: '2026-06-05T08:31:00Z' },
      { id: 'apr-002', revisionId: 'rev-ent-004', status: 'pending', createdAt: '2026-06-03T15:35:00Z' },
    ] });
  }),
  http.get(`${API_BASE}/amend/templates`, async () => {
    await delay(80);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'tpl-001', label: '閬楁紡鍏抽敭鎵€瑙?, reason: '鍘熸姤鍛婇仐婕?{finding}', category: 'missing-key-finding' },
        { id: 'tpl-002', label: '鏈淇', reason: '鍘?{old_term} 鏇存涓?{new_term}', category: 'terminology-error' },
        { id: 'tpl-003', label: '宸﹀彸浣嶇疆淇', reason: '鍘熸姤鍛婂乏鍙充綅缃弿杩伴鍊?, category: 'left-right-confused' },
      ],
    });
  }),
  http.get(`${API_BASE}/amend/:id/audit`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [
      { id: 'audit-001', revisionId: params.id, action: 'start', actor: '寮犳槑杩?, timestamp: '2026-06-05T08:30:00Z' },
    ] });
  }),
  http.get(`${API_BASE}/amend/stats`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: { totalAmendments: 72, totalSupplements: 48, avgAmendmentDurationHours: 5.1, amendmentRate: 0.083 },
    });
  }),
  http.get(`${API_BASE}/amend/hotspot`, async () => {
    await delay(80);
    return HttpResponse.json({
      success: true,
      data: [
        { field: 'diagnosis', count: 28, percent: 38.9 },
        { field: 'impression', count: 22, percent: 30.6 },
        { field: 'examFindings', count: 14, percent: 19.4 },
      ],
    });
  }),
  // Supplement
  http.get(`${API_BASE}/supplement`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: [
      { id: 'sup-001', reportId: 'RP20260601008', type: 'pathology', note: '鐥呯悊鍥炴姤锛氬彸鑲轰笅鍙剁┛鍒烘椿妫€缁撴灉涓洪潪鍏稿瀷鑵虹槫鏍峰鐢燂紙AAH锛?, authorName: '鏉庢収鏁?, createdAt: '2026-06-03T09:00:00Z' },
      { id: 'sup-002', reportId: 'RP20260602011', type: 'comparison-prior', note: '瀵规瘮 2025 骞?6 鏈?CT', authorName: '鍒樻枃鍗?, createdAt: '2026-06-04T11:00:00Z' },
    ] });
  }),
  http.post(`${API_BASE}/supplement/start`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as { reportId: string; note: string };
    return HttpResponse.json({
      success: true,
      data: { id: 'sup-' + Date.now(), reportId: body.reportId, note: body.note, createdAt: new Date().toISOString() },
    });
  }),
  http.post(`${API_BASE}/supplement/complete`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'supplemented' } });
  }),
  http.post(`${API_BASE}/supplement/attachments`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, attachmentId: 'att-' + Date.now() } });
  }),
  http.post(`${API_BASE}/supplement/sign`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { id: params.id, reSignedAt: new Date().toISOString() } });
  }),
  http.get(`${API_BASE}/supplement/history`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [
      { id: 'sup-001', reportId: params.id, type: 'pathology', note: '鐥呯悊鍥炴姤', createdAt: '2026-06-03T09:00:00Z' },
    ] });
  }),
  http.get(`${API_BASE}/supplement/types`, async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'pathology', label: '鐥呯悊鍥炴姤', icon: '馃敩' },
        { id: 'comparison-prior', label: '瀵规瘮鐗?, icon: '馃柤锔? },
        { id: 'follow-up', label: '闅忚缁撴灉', icon: '馃攧' },
        { id: 'addendum', label: '琛ュ厖璇存槑', icon: '馃摑' },
        { id: 'consultation', label: '浼氳瘖鎰忚', icon: '馃懃' },
        { id: 'lab-result', label: '瀹為獙瀹ょ粨鏋?, icon: '馃И' },
      ],
    });
  }),
  // Pathology
  http.post(`${API_BASE}/amend/pathology`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: 'path-' + Date.now(), ...(await request.json() as object) } }, { status: 201 });
  }),
  http.get(`${API_BASE}/amend/pathology/icdo`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { code: '8170/3', morphology: '鑵虹檶', topography: '鑲? } });
  }),
  // Export
  http.get(`${API_BASE}/amend/export.pdf`, async () => {
    return new HttpResponse(new ArrayBuffer(2048), { headers: { 'Content-Type': 'application/pdf' } });
  }),
  http.get(`${API_BASE}/amend/export.json`, async () => {
    return new HttpResponse(new ArrayBuffer(2048), { headers: { 'Content-Type': 'application/json' } });
  }),
  // Critical / Missed
  http.post(`${API_BASE}/amend/critical-late`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: 'cl-' + Date.now(), ...(await request.json() as object) } }, { status: 201 });
  }),
  http.post(`${API_BASE}/amend/missed-notify`, async ({ request }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { notified: true } });
  }),
  http.post(`${API_BASE}/amend/missed-qc-report`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { qcReportId: 'qc-' + Date.now() } });
  }),
  http.post(`${API_BASE}/amend/archive`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'archived' } });
  }),
  http.post(`${API_BASE}/amend/cold-storage`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { id: params.id, storageTier: 'cold' } });
  }),
  http.post(`${API_BASE}/amend/ml-analysis`, async ({ request }) => {
    await delay(1500);
    return HttpResponse.json({ success: true, data: { riskScore: 0.42, hotspots: ['diagnosis', 'impression'] } });
  }),
  http.get(`${API_BASE}/amend/notice-patient-template`, async () => {
    await delay(80);
    return HttpResponse.json({
      success: true,
      data: {
        title: '鏀惧皠鎶ュ憡淇鍛婄煡涔?,
        template: '灏婃暚鐨?{patientName}锛氭偍鐨勬斁灏勬鏌ワ紙{examItemName}锛夋姤鍛婂凡浜?{originalSignedAt} 鐢?{originalSigner} 绛惧彂銆傜敱浜?{amendReason}锛屽師鎶ュ憡宸茬敱 {amendSigner} 瀹屾垚淇銆傚鏈夌枒闂鑷寸數 G005 鏀惧皠绉戙€?,
      },
    });
  }),
  http.get(`${API_BASE}/amend/compliance/:reportId`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: {
        reportId: params.reportId,
        allSnapshotsRetained: true,
        signaturesPreserved: true,
        auditChainIntact: true,
        reasonCompliant: true,
        approvedWhenRequired: true,
      },
    });
  }),
];

// ============= R3.AI 鏅鸿兘 (40) =============
export const aiReportHandlers = [
  // Draft
  http.post(`${API_BASE}/ai/generate`, async ({ request }) => {
    await delay(1200);
    const body = (await request.json()) as { scenario: string; clinicalHistory: string; reportId?: string };
    return HttpResponse.json({
      success: true,
      data: {
        id: 'aidraft-' + Date.now(),
        reportId: body.reportId ?? 'new-' + Date.now(),
        scenario: body.scenario,
        clinicalHistory: body.clinicalHistory,
        findings: 'AI 鑷姩鐢熸垚鐨勬墍瑙侊紙mock锛?,
        diagnosis: 'AI 鑷姩鐢熸垚鐨勮瘖鏂紙mock锛?,
        impression: 'AI 鑷姩鐢熸垚鐨勬剰瑙侊紙mock锛?,
        recommendations: '闅忚寤鸿',
        confidence: { overall: 0.85, findings: 0.88, diagnosis: 0.82, impression: 0.85, level: 'high' },
        references: [],
        generatedAt: new Date().toISOString(),
        modelVersion: 'v2.3-mock',
        tokenUsage: { prompt: 230, completion: 480, total: 710 },
        processingMs: 1200,
      },
    });
  }),
  http.get(`${API_BASE}/ai/scenarios`, async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'chest-ct', label: '鑳搁儴 CT', modality: 'CT', description: '鑲虹粨鑺?绾甸殧/鑳歌啘' },
        { id: 'head-mri', label: '澶撮 MRI', modality: 'MR', description: '鑴戞濉?鍑鸿/鍗犱綅' },
        { id: 'abdomen-ct', label: '鑵归儴 CT', modality: 'CT', description: '鑲濊儐鑳拌劸鑲? },
        { id: 'spine-mri', label: '鑴婃煴 MRI', modality: 'MR', description: '妞庨棿鐩?鑴婇珦/闊у甫' },
        { id: 'breast-mg', label: '涔宠吅閽奸澏', modality: 'MG', description: 'BI-RADS 鍒嗙被' },
        { id: 'cardiac-cta', label: '蹇冭剰 CTA', modality: 'CT', description: '鍐犺剦/鐡ｈ啘/蹇冭倢' },
      ],
    });
  }),
  http.post(`${API_BASE}/ai/continue`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { prefix: string };
    return HttpResponse.json({
      success: true,
      data: {
        candidates: [
          body.prefix + '锛岃竟鐣屾瑺娓咃紝鏈鏄庢樉瀹炴€ф垚鍒嗐€?,
          body.prefix + '锛屽ぇ灏忕害 8mm脳7mm銆?,
          body.prefix + '锛屽缓璁?3 涓湀鍚庡鏌ャ€?,
        ],
        processingMs: 400,
      },
    });
  }),
  http.post(`${API_BASE}/ai/rewrite`, async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as { text: string; mode: string };
    return HttpResponse.json({
      success: true,
      data: {
        result: body.mode === 'expand' ? body.text + '锛岃瑙佸奖鍍忔墍瑙併€? : body.text,
        processingMs: 600,
      },
    });
  }),
  http.post(`${API_BASE}/ai/expand`, async ({ request }) => {
    await delay(600);
    return HttpResponse.json({ success: true, data: { result: '鎵╁啓缁撴灉', processingMs: 600 } });
  }),
  http.post(`${API_BASE}/ai/shorten`, async ({ request }) => {
    await delay(600);
    return HttpResponse.json({ success: true, data: { result: '缂╁啓缁撴灉', processingMs: 600 } });
  }),
  http.post(`${API_BASE}/ai/translate`, async ({ request }) => {
    await delay(600);
    return HttpResponse.json({ success: true, data: { result: '[EN] Translation', processingMs: 600 } });
  }),
  // PreReview
  http.get(`${API_BASE}/ai/pre-review/:id`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      success: true,
      data: {
        id: 'aipre-' + Date.now(),
        reportId: params.id,
        score: 88,
        defects: [
          { id: 'def-001', type: 'missing-key-finding', field: 'examFindings', severity: 'high', description: '寤鸿鏄庣‘鎻忚堪鍙宠偤涓嬪彾纾ㄧ幓鐠冪粨鑺? },
        ],
        suggestions: [],
        diff: [],
        criticalHits: [],
        consistency: { imageReportMatch: true, clinicalReportMatch: true, priorReportMatch: false, mismatchedFields: [], score: 92 },
        terminology: { totalTerms: 24, matchedTerms: 22, radlexHits: [], snomedHits: [] },
        confidence: { overall: 0.88, findings: 0.9, diagnosis: 0.85, impression: 0.89, level: 'high' },
        reviewedAt: new Date().toISOString(),
        modelVersion: 'v2.3-mock',
        processingMs: 800,
      },
    });
  }),
  http.get(`${API_BASE}/ai/pre-review-list`, async () => {
    await delay(150);
    return HttpResponse.json({ success: true, data: [] });
  }),
  // Defect
  http.post(`${API_BASE}/ai/defect-detect`, async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as { text: string };
    return HttpResponse.json({
      success: true,
      data: {
        defects: body.text.length < 20 ? [{ id: 'def-001', type: 'missing-key-finding', field: 'examFindings', severity: 'medium', description: '鍐呭杩囩煭' }] : [],
        processingMs: 600,
      },
    });
  }),
  // Critical
  http.post(`${API_BASE}/ai/critical-detect`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { text: string };
    const keywords = ['鑴戠枬', '涓诲姩鑴夊す灞?, '鑲烘爴濉?];
    const hits = keywords
      .filter((k) => body.text.includes(k))
      .map((k) => ({ id: 'crit-' + Date.now(), keyword: k, confidence: 0.9, recommendation: '寤鸿鍙岀' }));
    return HttpResponse.json({ success: true, data: { hits, processingMs: 500 } });
  }),
  // Synonym
  http.get(`${API_BASE}/ai/synonym`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const text = url.searchParams.get('text') ?? '';
    const synonyms: { original: string; synonyms: string[]; preferred: string }[] = [];
    if (text.includes('纾ㄧ幓鐠冨奖')) synonyms.push({ original: '纾ㄧ幓鐠冨奖', synonyms: ['纾ㄧ幓鐠冨瘑搴﹀奖'], preferred: '纾ㄧ幓鐠冨瘑搴﹀奖' });
    if (text.includes('鍗犱綅')) synonyms.push({ original: '鍗犱綅', synonyms: ['鍗犱綅鎬х梾鍙?], preferred: '鍗犱綅鎬х梾鍙? });
    return HttpResponse.json({ success: true, data: synonyms });
  }),
  // Similar
  http.get(`${API_BASE}/ai/similar`, async ({ request }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'sim-001', reportId: 'RP20251203012', patientAge: 62, patientGender: '鐢?, diagnosis: '鍙宠偤涓嬪彾 AAH', similarity: 0.89 },
        { id: 'sim-002', reportId: 'RP20251108008', patientAge: 67, patientGender: '鐢?, diagnosis: '鍙宠偤涓嬪彾 AIS', similarity: 0.84 },
      ],
    });
  }),
  // Key image
  http.post(`${API_BASE}/ai/key-image`, async ({ request }) => {
    await delay(800);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'ki-001', sopInstanceUid: '1.2.840.0.1.1.1.1', seriesNumber: 3, instanceNumber: 87, reason: '鍙宠偤涓嬪彾缁撹妭灞傞潰', confidence: 0.92 },
      ],
    });
  }),
  // Lesion
  http.post(`${API_BASE}/ai/lesion-detect`, async ({ request }) => {
    await delay(1500);
    const body = (await request.json()) as { reportId: string };
    return HttpResponse.json({
      success: true,
      data: {
        id: 'lesion-' + Date.now(),
        reportId: body.reportId,
        totalLesions: 1,
        lesions: [
          { id: 'les-001', type: 'nodule', location: '鍙宠偤涓嬪彾鑳屾', sizeMm: { length: 8, width: 7 }, confidence: 0.91 },
        ],
      },
    });
  }),
  http.post(`${API_BASE}/ai/lesion-measure`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true, data: { measurements: [] } });
  }),
  // Error correct
  http.post(`${API_BASE}/ai/error-correct`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { text: string };
    return HttpResponse.json({
      success: true,
      data: {
        corrected: body.text.replace(/鐨勭殑/g, '鐨?).replace(/鍋氬仛/g, '鍋?),
        errors: [],
        processingMs: 500,
      },
    });
  }),
  // Risk predict
  http.post(`${API_BASE}/ai/risk-predict`, async ({ request }) => {
    await delay(800);
    const body = (await request.json()) as { reportId: string };
    return HttpResponse.json({
      success: true,
      data: {
        id: 'risk-' + Date.now(),
        reportId: body.reportId,
        overallRisk: 'high',
        riskScore: 0.78,
        riskFactors: [
          { id: 'rf-001', category: 'finding', name: '纾ㄧ幓鐠冪粨鑺?鈮?6mm', weight: 0.35, description: '鍙宠偤涓嬪彾纾ㄧ幓鐠冪粨鑺?8mm脳7mm' },
        ],
        predictedOutcomes: [],
        earlyWarnings: [],
        recommendedActions: ['3 涓湀鍚庡鏌?],
        confidence: { overall: 0.82, findings: 0.85, diagnosis: 0.78, impression: 0.83, level: 'medium' },
        predictedAt: new Date().toISOString(),
      },
    });
  }),
  // Differential
  http.post(`${API_BASE}/ai/differential`, async ({ request }) => {
    await delay(800);
    const body = (await request.json()) as { reportId: string };
    return HttpResponse.json({
      success: true,
      data: {
        id: 'ddx-' + Date.now(),
        reportId: body.reportId,
        primaryDiagnosis: '鍙宠偤涓嬪彾鑳屾纾ㄧ幓鐠冪粨鑺?,
        differentials: [
          { id: 'dd-001', diagnosis: '闈炲吀鍨嬭吅鐦ゆ牱澧炵敓锛圓AH锛?, probability: 0.45, supportingFindings: ['绾（鐜荤拑瀵嗗害'], contradictingFindings: [], reasoning: '鍏稿瀷琛ㄧ幇' },
          { id: 'dd-002', diagnosis: '鍘熶綅鑵虹檶锛圓IS锛?, probability: 0.35, supportingFindings: ['纾ㄧ幓鐠冨瘑搴︾粨鑺?], contradictingFindings: [], reasoning: '闇€璀︽儠' },
        ],
        recommendedTests: ['3 涓湀鍚庡鏌?CT'],
        similarCases: [],
        confidence: { overall: 0.84, findings: 0.88, diagnosis: 0.8, impression: 0.85, level: 'medium' },
        generatedAt: new Date().toISOString(),
      },
    });
  }),
  // RADS
  http.post(`${API_BASE}/ai/rads`, async ({ request }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { system: 'Lung-RADS', category: '3', description: '鍙兘鑹€х粨鑺?, riskPercent: '1-2%', recommendation: '6 涓湀鍚庡鏌? },
    });
  }),
  http.post(`${API_BASE}/ai/dose`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { totalDLP: 285, recommendation: '绗﹀悎鍓傞噺闄愬埗' } });
  }),
  // Consistency
  http.post(`${API_BASE}/ai/consistency`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true, data: { imageReportMatch: true, score: 0.92 } });
  }),
  http.post(`${API_BASE}/ai/term`, async () => {
    await delay(500);
    return HttpResponse.json({ success: true, data: { matchedTerms: 18, totalTerms: 20, terms: [] } });
  }),
  // Audit
  http.get(`${API_BASE}/ai/audit`, async () => {
    await delay(120);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'usage-001', userId: 'D001', endpoint: '/api/v1/ai/generate', processingMs: 1240, success: true, calledAt: '2026-06-04T10:00:00Z' },
      ],
    });
  }),
  http.post(`${API_BASE}/ai/audit`, async ({ request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: 'usage-' + Date.now(), ...(await request.json() as object) } }, { status: 201 });
  }),
  // Health
  http.get(`${API_BASE}/ai/health`, async () => {
    await delay(80);
    return HttpResponse.json({
      success: true,
      data: { status: 'healthy', avgLatencyMs: 850, queueDepth: 2, rateLimitRemaining: 87, checkedAt: new Date().toISOString() },
    });
  }),
  // Quota
  http.get(`${API_BASE}/ai/quota`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    return HttpResponse.json({
      success: true,
      data: { userId: url.searchParams.get('userId'), period: 'day', used: 23, limit: 100, resetAt: '2026-06-05T00:00:00Z' },
    });
  }),
  http.post(`${API_BASE}/ai/quota-alert`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { alerted: true } });
  }),
  // Retry
  http.post(`${API_BASE}/ai/retry`, async () => {
    await delay(800);
    return HttpResponse.json({ success: true, data: { retried: 1 } });
  }),
  // Cache
  http.get(`${API_BASE}/ai/cache`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true, data: { hitRate: 0.32, ttlMin: 5 } });
  }),
  // Eval
  http.get(`${API_BASE}/ai/eval`, async () => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { acceptanceRate: 0.785, avgLatencyMs: 850, totalCalls: 4128, period: 'month' } });
  }),
  // Usage rank
  http.get(`${API_BASE}/ai/usage-rank`, async () => {
    await delay(150);
    return HttpResponse.json({
      success: true,
      data: [
        { userId: 'D001', userName: '寮犳槑杩?, department: 'CT瀹?, callsToday: 23, callsMonth: 412, acceptanceRate: 0.85 },
        { userId: 'D002', userName: '鏉庢収鏁?, department: 'MR瀹?, callsToday: 18, callsMonth: 356, acceptanceRate: 0.81 },
      ],
    });
  }),
  // Error log
  http.get(`${API_BASE}/ai/error-log`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),
  // Consent
  http.post(`${API_BASE}/ai/consent`, async ({ request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { consentId: 'consent-' + Date.now(), ...(await request.json() as object) } }, { status: 201 });
  }),
  // Anonymize
  http.post(`${API_BASE}/ai/anonymize`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as { text: string };
    return HttpResponse.json({ success: true, data: { anonymized: body.text.replace(/[\u4e00-\u9fa5]{2,3}/g, '***') } });
  }),
  // Model upgrade
  http.post(`${API_BASE}/ai/model-upgrade`, async ({ request }) => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { newVersion: 'v2.4-mock', rollout: 0.1 } });
  }),
  // Modality
  http.post(`${API_BASE}/ai/modality`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { modality: 'CT', confidence: 0.98 } });
  }),
  http.post(`${API_BASE}/ai/multi-modality`, async () => {
    await delay(800);
    return HttpResponse.json({ success: true, data: { fused: true, modalities: ['CT', 'MR'] } });
  }),
  // Dashboard
  http.get(`${API_BASE}/ai/dashboard`, async () => {
    await delay(150);
    return HttpResponse.json({
      success: true,
      data: { totalCalls: 4128, avgLatencyMs: 850, acceptanceRate: 0.785, errorRate: 0.02, queueDepth: 2 },
    });
  }),
  // Annotation
  http.post(`${API_BASE}/ai/annotation`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { annotations: [] } });
  }),
];

// ============= R3.REVIEW INITIAL CHECK 鍒濇牳娓呭崟 (20) =============
export const initialCheckHandlers = [
  http.get(`${API_BASE}/review/initial-check/items`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: CHECK_ITEM_TEMPLATES });
  }),
  http.get(`${API_BASE}/review/initial-check/lists`, async ({ request }) => {
    await delay(180);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? 'all';
    const priority = url.searchParams.get('priority') ?? 'all';
    const overdueOnly = url.searchParams.get('overdueOnly') === 'true';
    const search = url.searchParams.get('search') ?? '';
    let data = clone(INITIAL_CHECK_LISTS);
    if (status !== 'all') data = data.filter((l) => l.overallStatus === status);
    if (priority !== 'all') {
      const t = REVIEW_TASKS;
      const ids = new Set(t.filter((tk) => tk.priority === priority).map((tk) => tk.id));
      data = data.filter((l) => ids.has(l.taskId));
    }
    if (overdueOnly) data = data.filter((l) => l.isOverdue);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((l) => l.reportId.toLowerCase().includes(q) || l.id.toLowerCase().includes(q));
    }
    data.sort((a, b) => a.slaRemainingMinutes - b.slaRemainingMinutes);
    return HttpResponse.json({ success: true, data });
  }),
  http.get(`${API_BASE}/review/initial-check/lists/:id`, async ({ params }) => {
    await delay(100);
    const found = INITIAL_CHECK_LISTS.find((l) => l.id === params.id);
    if (!found) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ success: true, data: found });
  }),
  http.get(`${API_BASE}/review/initial-check/by-report/:reportId`, async ({ params }) => {
    await delay(100);
    const found = INITIAL_CHECK_LISTS.find((l) => l.reportId === params.reportId);
    if (!found) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ success: true, data: found });
  }),
  http.get(`${API_BASE}/review/initial-check/audit/:listId`, async ({ params }) => {
    await delay(120);
    const data = INITIAL_CHECK_AUDIT.filter((a) => a.listId === params.listId);
    return HttpResponse.json({ success: true, data });
  }),
  http.get(`${API_BASE}/review/initial-check/sla-config`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: INITIAL_CHECK_SLA_CONFIG });
  }),
  http.put(`${API_BASE}/review/initial-check/sla-config`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as object;
    return HttpResponse.json({ success: true, data: { ...INITIAL_CHECK_SLA_CONFIG, ...body, updatedAt: new Date().toISOString() } });
  }),
  http.post(`${API_BASE}/review/initial-check/validate-one-click/:id`, async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as { findings?: string; impression?: string };
    const list = INITIAL_CHECK_LISTS.find((l) => l.id === params.id);
    if (!list) return HttpResponse.json({ success: false }, { status: 404 });
    const findings = body.findings ?? '';
    const impression = body.impression ?? '';
    const failures: string[] = [];
    let requiredPass = 0;
    const required = list.items.filter((i) => i.required);
    required.forEach((it) => {
      const hit = (it.keywords ?? []).some((k) => findings.includes(k) || impression.includes(k));
      if (hit) requiredPass += 1;
      else failures.push(`${it.name}:鏈懡涓叧閿瓧`);
    });
    return HttpResponse.json({
      success: true,
      data: {
        canPass: requiredPass === required.length,
        missing: failures,
        warnings: [],
        passRate: list.passRate,
        requiredPassRate: required.length > 0 ? requiredPass / required.length : 1,
      },
    });
  }),
  http.post(`${API_BASE}/review/initial-check/batch-validate/:id`, async ({ params, request }) => {
    await delay(220);
    const body = (await request.json()) as { findings?: string; impression?: string };
    const list = INITIAL_CHECK_LISTS.find((l) => l.id === params.id);
    if (!list) return HttpResponse.json({ success: false }, { status: 404 });
    const text = (body.findings ?? '') + (body.impression ?? '');
    const failures: string[] = [];
    const passed = list.items.filter((it) => (it.keywords ?? []).some((k) => text.includes(k))).length;
    const required = list.items.filter((i) => i.required).length;
    list.items.filter((i) => i.required).forEach((it) => {
      if (!(it.keywords ?? []).some((k) => text.includes(k))) failures.push(`${it.name}:蹇呭～椤规湭閫氳繃`);
    });
    return HttpResponse.json({
      success: true,
      data: {
        list,
        validation: {
          canPass: failures.length === 0,
          missing: failures,
          warnings: [],
          passRate: list.items.length > 0 ? passed / list.items.length : 1,
          requiredPassRate: required > 0 ? (required - failures.length) / required : 1,
        },
      },
    });
  }),
  http.post(`${API_BASE}/review/initial-check/one-click-approve/:id`, async ({ params, request }) => {
    await delay(220);
    const body = (await request.json()) as { comment?: string };
    const list = INITIAL_CHECK_LISTS.find((l) => l.id === params.id);
    if (!list) return HttpResponse.json({ success: false }, { status: 404 });
    if (!list.requiredAllPassed) return HttpResponse.json({ success: false, message: '蹇呭～椤规湭鍏ㄩ儴閫氳繃' }, { status: 400 });
    list.overallStatus = 'approved';
    list.decision = 'approve';
    list.decisionAt = new Date().toISOString();
    list.decisionComment = body.comment;
    return HttpResponse.json({ success: true, data: list });
  }),
  http.post(`${API_BASE}/review/initial-check/one-click-reject/:id`, async ({ params, request }) => {
    await delay(220);
    const body = (await request.json()) as { reason: string; rejectCategory: string };
    if (!body.reason || body.reason.trim().length < 5) {
      return HttpResponse.json({ success: false, message: '椹冲洖鍘熷洜涓嶈兘灏戜簬 5 瀛楃' }, { status: 400 });
    }
    const list = INITIAL_CHECK_LISTS.find((l) => l.id === params.id);
    if (!list) return HttpResponse.json({ success: false }, { status: 404 });
    list.overallStatus = 'rejected';
    list.decision = 'reject';
    list.decisionAt = new Date().toISOString();
    list.decisionComment = body.reason + '[' + body.rejectCategory + ']';
    return HttpResponse.json({ success: true, data: list });
  }),
  http.post(`${API_BASE}/review/initial-check/batch-process`, async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as { taskIds: string[]; decision: 'approve' | 'reject'; comment?: string; requireAllRequiredPass?: boolean };
    let approved = 0, rejected = 0, skipped = 0;
    const details: { listId: string; reportId: string; status: 'approved' | 'rejected' | 'skipped'; reason?: string }[] = [];
    body.taskIds.forEach((tid) => {
      const list = INITIAL_CHECK_LISTS.find((l) => l.taskId === tid);
      if (!list) { skipped += 1; return; }
      if (body.requireAllRequiredPass && !list.requiredAllPassed) {
        skipped += 1;
        details.push({ listId: list.id, reportId: list.reportId, status: 'skipped', reason: '蹇呭～椤规湭鍏ㄩ儴閫氳繃' });
        return;
      }
      if (body.decision === 'approve') {
        list.overallStatus = 'approved';
        list.decision = 'approve';
        list.decisionAt = new Date().toISOString();
        approved += 1;
        details.push({ listId: list.id, reportId: list.reportId, status: 'approved' });
      } else {
        if (!body.comment || body.comment.trim().length < 5) {
          skipped += 1;
          details.push({ listId: list.id, reportId: list.reportId, status: 'skipped', reason: '椹冲洖鍘熷洜涓嶈冻 5 瀛楃' });
          return;
        }
        list.overallStatus = 'rejected';
        list.decision = 'reject';
        list.decisionAt = new Date().toISOString();
        rejected += 1;
        details.push({ listId: list.id, reportId: list.reportId, status: 'rejected' });
      }
    });
    return HttpResponse.json({
      success: true,
      data: { total: body.taskIds.length, approved, rejected, skipped, details, startedAt: new Date().toISOString(), completedAt: new Date().toISOString() },
    });
  }),
  http.post(`${API_BASE}/review/initial-check/override/:id`, async ({ params, request }) => {
    await delay(160);
    const body = (await request.json()) as { itemId: string; status: string; note?: string };
    const list = INITIAL_CHECK_LISTS.find((l) => l.id === params.id);
    if (!list) return HttpResponse.json({ success: false }, { status: 404 });
    const r = list.results[body.itemId];
    if (!r) return HttpResponse.json({ success: false }, { status: 404 });
    r.status = body.status as 'passed' | 'failed' | 'waived' | 'pending' | 'skipped';
    r.note = body.note;
    r.overridden = true;
    return HttpResponse.json({ success: true, data: list });
  }),
  http.post(`${API_BASE}/review/initial-check/toggle-item/:id`, async ({ params, request }) => {
    await delay(120);
    const body = (await request.json()) as { itemId: string; enabled: boolean };
    const list = INITIAL_CHECK_LISTS.find((l) => l.id === params.id);
    if (!list) return HttpResponse.json({ success: false }, { status: 404 });
    const item = list.items.find((i) => i.id === body.itemId);
    if (item) item.enabledByDefault = body.enabled;
    return HttpResponse.json({ success: true, data: list });
  }),
  http.get(`${API_BASE}/review/initial-check/custom-items`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const reviewerId = url.searchParams.get('reviewerId');
    const data = INITIAL_CHECK_CUSTOM_ITEMS.filter((c) => !reviewerId || c.reviewerId === reviewerId);
    return HttpResponse.json({ success: true, data });
  }),
  http.post(`${API_BASE}/review/initial-check/custom-items`, async ({ request }) => {
    await delay(180);
    const body = (await request.json()) as { reviewerId: string; reviewerName: string; item: object; scope?: string };
    return HttpResponse.json({
      success: true,
      data: {
        id: 'cus-' + Date.now(),
        reviewerId: body.reviewerId,
        reviewerName: body.reviewerName,
        item: { ...body.item, id: 'ci-cus-' + Date.now(), isSystem: false },
        scope: body.scope ?? 'private',
        usedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }),
  http.delete(`${API_BASE}/review/initial-check/custom-items/:id`, async ({ params }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: { id: params.id, deleted: true } });
  }),
  http.get(`${API_BASE}/review/initial-check/workload`, async () => {
    await delay(150);
    return HttpResponse.json({ success: true, data: INITIAL_CHECK_WORKLOAD });
  }),
  http.get(`${API_BASE}/review/initial-check/summary`, async () => {
    await delay(180);
    return HttpResponse.json({ success: true, data: INITIAL_CHECK_SUMMARY });
  }),
  http.post(`${API_BASE}/review/initial-check/sla-refresh`, async () => {
    await delay(150);
    const breached = INITIAL_CHECK_LISTS.filter((l) => l.isOverdue).map((l) => l.id);
    const warned = INITIAL_CHECK_LISTS.filter((l) => !l.isOverdue && l.slaRemainingMinutes <= l.slaWarnMinutes).map((l) => l.id);
    return HttpResponse.json({ success: true, data: { breached, warned, breachedAt: new Date().toISOString() } });
  }),
];

// ============= R3.REVIEW FINAL CHECK 缁堟牳娓呭崟 (20) =============
const finalCheckInMemory = {
  lists: clone(FINAL_CHECK_LISTS),
  notes: clone(FINAL_REVIEW_NOTES),
  multiSigs: clone(FINAL_MULTI_SIGNATURE_REQUESTS),
  emergencies: clone(EMERGENCY_REVIEW_REQUESTS),
  configs: clone(FINAL_CHECK_WORKFLOW_CONFIGS),
  events: clone(FINAL_CHECK_EVENTS),
  scoring: clone(FINAL_SCORING_RESULTS),
};

const finalCheckLogEvent = (taskId: string, reportId: string, type: string, actorId: string, actorName: string, payload: Record<string, unknown>) => {
  finalCheckInMemory.events.unshift({
    id: 'fce-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    taskId, reportId, type, actorId, actorName, payload, timestamp: new Date().toISOString(),
  });
};

export const finalCheckHandlers = [
  // 1. 妯℃澘 (15+ 妫€鏌ラ」)
  http.get(`${API_BASE}/review/final-check/templates`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: FINAL_CHECK_TEMPLATES });
  }),

  // 2. 娓呭崟鍒楄〃
  http.get(`${API_BASE}/review/final-check/lists`, async ({ request }) => {
    await delay(180);
    const url = new URL(request.url);
    const passingOnly = url.searchParams.get('passingOnly') === 'true';
    const blockingOnly = url.searchParams.get('blockingOnly') === 'true';
    const search = url.searchParams.get('search') ?? '';
    let data = clone(finalCheckInMemory.lists);
    if (passingOnly) data = data.filter((l) => l.summary.isPublishable);
    if (blockingOnly) data = data.filter((l) => l.summary.blockers > 0);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((l) => l.reportId.toLowerCase().includes(q) || l.taskId.toLowerCase().includes(q) || l.reviewerName.toLowerCase().includes(q));
    }
    return HttpResponse.json({ success: true, data });
  }),

  // 3. 鍚姩缁堟牳
  http.post(`${API_BASE}/review/final-check/lists/start`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { taskId: string; reportId: string; reviewerId: string; reviewerName: string };
    const existing = finalCheckInMemory.lists.find((l) => l.taskId === body.taskId);
    if (existing) return HttpResponse.json({ success: true, data: existing });
    const items = clone(FINAL_CHECK_TEMPLATES).map((it) => ({ ...it, status: 'pending', score: 0 }));
    const list: typeof finalCheckInMemory.lists[number] = {
      id: 'fcl-' + Date.now(), reportId: body.reportId, patientId: 'P-AUTO', taskId: body.taskId,
      reviewerId: body.reviewerId, reviewerName: body.reviewerName, reviewerRole: 'associateChief',
      items, summary: buildFinalCheckSummary(items), status: 'in-progress',
      startedAt: new Date().toISOString(), totalDurationMs: 0, rubricVersion: 'v3.0.5.1',
    };
    finalCheckInMemory.lists.push(list);
    finalCheckLogEvent(body.taskId, body.reportId, 'started', body.reviewerId, body.reviewerName, { itemCount: items.length });
    return HttpResponse.json({ success: true, data: list });
  }),

  // 4. 鏇存柊妫€鏌ラ」鐘舵€?
  http.patch(`${API_BASE}/review/final-check/lists/:taskId/items/:code`, async ({ params, request }) => {
    await delay(120);
    const body = (await request.json()) as { status: string; remark?: string };
    const list = finalCheckInMemory.lists.find((l) => l.taskId === params.taskId);
    if (!list) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    const item = list.items.find((i) => i.code === params.code);
    if (!item) return HttpResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    item.status = body.status;
    item.score = body.status === 'passed' ? item.maxScore : body.status === 'warning' ? Math.floor(item.maxScore * 0.5) : 0;
    if (body.remark) item.remark = body.remark;
    item.checkedAt = new Date().toISOString();
    list.summary = buildFinalCheckSummary(list.items);
    finalCheckLogEvent(params.taskId as string, list.reportId, body.status === 'passed' ? 'item-passed' : 'item-failed', list.reviewerId, list.reviewerName, { code: params.code, status: body.status });
    return HttpResponse.json({ success: true, data: list });
  }),

  // 5. 瀹屾垚缁堟牳
  http.post(`${API_BASE}/review/final-check/lists/:taskId/complete`, async ({ params }) => {
    await delay(220);
    const list = finalCheckInMemory.lists.find((l) => l.taskId === params.taskId);
    if (!list) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    list.status = 'completed';
    list.completedAt = new Date().toISOString();
    list.totalDurationMs = new Date(list.completedAt).getTime() - new Date(list.startedAt).getTime();
    list.summary = buildFinalCheckSummary(list.items);
    finalCheckLogEvent(params.taskId as string, list.reportId, 'completed', list.reviewerId, list.reviewerName, { score: list.summary.totalScore, grade: list.summary.grade });
    return HttpResponse.json({ success: true, data: list });
  }),

  // 6. 涓村簥涓€鑷存€?
  http.get(`${API_BASE}/review/final-check/consistency/:reportId`, async ({ params }) => {
    await delay(800);
    const c = CLINICAL_CONSISTENCY_RESULTS.find((x) => x.reportId === params.reportId);
    return HttpResponse.json({ success: true, data: c ?? CLINICAL_CONSISTENCY_RESULTS[0] });
  }),

  // 7. 璇勫垎缁嗗垯
  http.get(`${API_BASE}/review/final-check/rubrics`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: FINAL_SCORING_RUBRICS });
  }),

  // 8. 鎻愪氦缁堣瘎
  http.post(`${API_BASE}/review/final-check/score`, async ({ request }) => {
    await delay(800);
    const body = (await request.json()) as { taskId: string; reportId: string; reviewerId: string; reviewerName: string; rubricId: string; dimensionScores: { code: string; score: number }[] };
    const rubric = FINAL_SCORING_RUBRICS.find((r) => r.id === body.rubricId) ?? FINAL_SCORING_RUBRICS[0];
    const dimScores = rubric.dimensions.map((d) => {
      const input = body.dimensionScores.find((s) => s.code === d.code);
      const score = input?.score ?? 0;
      return { code: d.code, name: d.name, score, weight: d.weight, weighted: Math.round((score * d.weight) / 100 * 100) / 100 };
    });
    const totalScore = Math.round(dimScores.reduce((a, d) => a + d.weighted, 0));
    const gradeBand = rubric.gradeBands.find((b) => totalScore >= b.minScore && totalScore <= b.maxScore) ?? rubric.gradeBands[rubric.gradeBands.length - 1];
    const result = {
      id: 'fscore-' + Date.now(),
      reportId: body.reportId, taskId: body.taskId, rubricId: rubric.id, rubricVersion: rubric.version,
      reviewerId: body.reviewerId, reviewerName: body.reviewerName,
      totalScore, percentage: totalScore, grade: gradeBand.grade,
      passed: totalScore >= rubric.passingScore, blocked: totalScore < rubric.blockingScore,
      dimensionScores: dimScores, hardFailures: [], softWarnings: [],
      scoredAt: new Date().toISOString(), durationMs: 18 * 60 * 1000,
    };
    finalCheckInMemory.scoring.unshift(result);
    return HttpResponse.json({ success: true, data: result });
  }),

  // 9. 椹冲洖 -> 鍒濆
  http.post(`${API_BASE}/review/final-check/reject/initial`, async ({ request }) => {
    await delay(180);
    const body = (await request.json()) as { taskId: string; reviewerId: string; reviewerName: string; reason: string };
    if (!body.reason || body.reason.trim().length < 5) return HttpResponse.json({ success: false, message: '鍘熷洜涓嶈兘灏戜簬 5 瀛楃' }, { status: 400 });
    const list = finalCheckInMemory.lists.find((l) => l.taskId === body.taskId);
    if (!list) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    list.status = 'aborted';
    list.completedAt = new Date().toISOString();
    finalCheckLogEvent(body.taskId, list.reportId, 'rejected-initial', body.reviewerId, body.reviewerName, { reason: body.reason });
    return HttpResponse.json({ success: true, data: { taskId: body.taskId, status: 'rejected', target: 'initial' } });
  }),

  // 10. 椹冲洖 -> 璧疯崏
  http.post(`${API_BASE}/review/final-check/reject/draft`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { taskId: string; reviewerId: string; reviewerName: string; reason: string };
    if (!body.reason || body.reason.trim().length < 10) return HttpResponse.json({ success: false, message: '鍘熷洜涓嶈兘灏戜簬 10 瀛楃' }, { status: 400 });
    const list = finalCheckInMemory.lists.find((l) => l.taskId === body.taskId);
    if (!list) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    list.status = 'aborted';
    list.completedAt = new Date().toISOString();
    finalCheckLogEvent(body.taskId, list.reportId, 'rejected-draft', body.reviewerId, body.reviewerName, { reason: body.reason });
    return HttpResponse.json({ success: true, data: { taskId: body.taskId, status: 'rejected', target: 'direct-to-draft' } });
  }),

  // 11. 绗旇鍒楄〃
  http.get(`${API_BASE}/review/final-check/notes/:taskId`, async ({ params }) => {
    await delay(100);
    const data = finalCheckInMemory.notes.filter((n) => n.taskId === params.taskId);
    return HttpResponse.json({ success: true, data });
  }),

  // 12. 娣诲姞绗旇
  http.post(`${API_BASE}/review/final-check/notes`, async ({ request }) => {
    await delay(120);
    const body = (await request.json()) as Record<string, unknown>;
    const note = { id: 'frn-' + Date.now(), createdAt: new Date().toISOString(), ...body };
    finalCheckInMemory.notes.unshift(note);
    finalCheckLogEvent((body.taskId as string) ?? '', (body.reportId as string) ?? '', 'note-added', (body.authorId as string) ?? '', (body.authorName as string) ?? '', { type: body.type });
    return HttpResponse.json({ success: true, data: note });
  }),

  // 13. 宸ヤ綔閲?
  http.get(`${API_BASE}/review/final-check/workload`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const reviewerId = url.searchParams.get('reviewerId');
    const date = url.searchParams.get('date');
    const data = FINAL_CHECK_WORKLOAD.filter((w) => !reviewerId || w.reviewerId === reviewerId).filter((w) => !date || w.date === date);
    return HttpResponse.json({ success: true, data });
  }),

  // 14. 鏃㈠線鎶ュ憡瀵规瘮
  http.get(`${API_BASE}/review/final-check/prior-comparison/:reportId`, async ({ params }) => {
    await delay(600);
    const data = PRIOR_REPORT_COMPARISONS.find((p) => p.currentReportId === params.reportId) ?? null;
    return HttpResponse.json({ success: true, data });
  }),

  // 15. 澶氱鍒楄〃
  http.get(`${API_BASE}/review/final-check/multi-sig`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');
    const data = finalCheckInMemory.multiSigs.filter((m) => !taskId || m.taskId === taskId);
    return HttpResponse.json({ success: true, data });
  }),

  // 16. 鍙戣捣澶氱
  http.post(`${API_BASE}/review/final-check/multi-sig/request`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { taskId: string; reportId: string; requestedBy: string; requestedByName: string; reason: string; trigger: string };
    const req = {
      id: 'fms-' + Date.now(), taskId: body.taskId, reportId: body.reportId, requestedBy: body.requestedBy, requestedByName: body.requestedByName,
      requestedAt: new Date().toISOString(),
      slots: [
        { id: 's1', order: 1, role: 'attending', required: true, status: 'pending' },
        { id: 's2', order: 2, role: 'chief', required: true, status: 'pending' },
        { id: 's3', order: 3, role: 'director', required: body.trigger === 'critical' || body.trigger === 'director', status: 'pending' },
      ],
      reason: body.reason, trigger: body.trigger, parallel: false,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      status: 'collecting', auditId: 'audit-' + Date.now(),
    };
    finalCheckInMemory.multiSigs.unshift(req);
    finalCheckLogEvent(body.taskId, body.reportId, 'signature-collected', body.requestedBy, body.requestedByName, { reason: body.reason });
    return HttpResponse.json({ success: true, data: req });
  }),

  // 17. 绛剧珷澶氱 slot
  http.post(`${API_BASE}/review/final-check/multi-sig/:reqId/sign`, async ({ params, request }) => {
    await delay(180);
    const body = (await request.json()) as { slotId: string; signerId: string; signerName: string; certificateId: string };
    const req = finalCheckInMemory.multiSigs.find((r) => r.id === params.reqId);
    if (!req) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    const slot = req.slots.find((s) => s.id === body.slotId);
    if (!slot) return HttpResponse.json({ success: false, message: 'Slot not found' }, { status: 404 });
    slot.signerId = body.signerId;
    slot.signerName = body.signerName;
    slot.signedAt = new Date().toISOString();
    slot.certificateId = body.certificateId;
    slot.status = 'signed';
    const allSigned = req.slots.filter((s) => s.required).every((s) => s.status === 'signed');
    if (allSigned) {
      req.status = 'completed';
      req.completedAt = new Date().toISOString();
      req.certificateId = 'cert-' + Date.now();
    } else {
      req.status = 'in-progress';
    }
    return HttpResponse.json({ success: true, data: req });
  }),

  // 18. 鎬ヨ瘖閫氶亾鍒楄〃
  http.get(`${API_BASE}/review/final-check/emergency`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const data = finalCheckInMemory.emergencies.filter((e) => !status || status === 'all' || e.status === status);
    return HttpResponse.json({ success: true, data });
  }),

  // 19. 瑙﹀彂鎬ヨ瘖閫氶亾
  http.post(`${API_BASE}/review/final-check/emergency/trigger`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { taskId: string; reportId: string; patientId: string; patientName: string; trigger: string; severity: string; description: string; channels: string[]; triggeredBy: string; triggeredByName: string };
    const slaMinutes = body.severity === 'life-threatening' ? 5 : body.severity === 'critical' ? 15 : 30;
    const req = {
      id: 'emr-' + Date.now(), taskId: body.taskId, reportId: body.reportId, patientId: body.patientId, patientName: body.patientName,
      trigger: body.trigger, severity: body.severity, description: body.description,
      triggeredBy: body.triggeredBy, triggeredByName: body.triggeredByName, triggeredAt: new Date().toISOString(),
      channels: body.channels,
      targets: [
        { reviewerId: 'D001', reviewerName: '寮犳槑杩?, role: 'chief', notifiedAt: new Date().toISOString() },
        { reviewerId: 'D009', reviewerName: '鍚磋姵', role: 'chief', notifiedAt: new Date().toISOString() },
      ],
      slaMinutes, status: 'open', auditId: 'audit-emr-' + Date.now(),
    };
    finalCheckInMemory.emergencies.unshift(req);
    finalCheckLogEvent(body.taskId, body.reportId, 'emergency-triggered', body.triggeredBy, body.triggeredByName, { trigger: body.trigger, severity: body.severity });
    return HttpResponse.json({ success: true, data: req });
  }),

  // 20. 宸ヤ綔娴侀厤缃?+ 浠〃鐩樺悎骞?
  http.get(`${API_BASE}/review/final-check/workflow-config`, async () => {
    await delay(100);
    const completed = finalCheckInMemory.lists.filter((l) => l.status === 'completed');
    const avgScore = completed.length === 0 ? 0 : Math.round(completed.reduce((a, l) => a + l.summary.percentage, 0) / completed.length);
    return HttpResponse.json({
      success: true,
      data: {
        configs: finalCheckInMemory.configs,
        defaultConfig: finalCheckInMemory.configs[0] ?? null,
        dashboard: {
          totalLists: finalCheckInMemory.lists.length,
          inProgress: finalCheckInMemory.lists.filter((l) => l.status === 'in-progress').length,
          completed: completed.length,
          blocked: finalCheckInMemory.lists.filter((l) => l.summary.blockers > 0).length,
          avgScore,
          recentEvents: finalCheckInMemory.events.slice(0, 10),
        },
      },
    });
  }),

  // 21. 鏇存柊宸ヤ綔娴侀厤缃?(棰濆)
  http.put(`${API_BASE}/review/final-check/workflow-config/:id`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as Record<string, unknown>;
    const c = finalCheckInMemory.configs.find((x) => x.id === params.id);
    if (!c) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    Object.assign(c, body, { updatedAt: new Date().toISOString() });
    return HttpResponse.json({ success: true, data: c });
  }),
];

// ============= v3.0.6.8-32 Phase 3+5: 楂樼骇鐗规€х鐐?=============

// 宸ヤ綔娴佷簨浠跺叏灞€鏌ヨ (鍏ㄩ櫌瀹¤)
const advancedHandlers = [
  http.get(`${API_BASE}/workflow-events`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const entityType = url.searchParams.get('entityType');
    const entityId = url.searchParams.get('entityId');
    const action = url.searchParams.get('action');
    const opts = parseQuery(url);
    let events = listWorkflowEvents({ entityType: entityType || undefined, entityId: entityId || undefined });
    if (action) events = events.filter(e => e.action === action);
    const result = applyQuery(events, opts, ['entityType', 'entityId', 'actorName']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),

  // 瀹¤鏃ュ織鏌ヨ (鎸夋椂闂?鐢ㄦ埛/璧勬簮绫诲瀷杩囨护)
  http.get(`${API_BASE}/audit-log`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const resource = url.searchParams.get('resource');
    const action = url.searchParams.get('action');
    const opts = parseQuery(url);
    let entries = listAudit(1000);
    if (userId) entries = entries.filter(e => e.userId === userId);
    if (resource) entries = entries.filter(e => e.resource === resource);
    if (action) entries = entries.filter(e => e.action === action);
    const result = applyQuery(entries, opts, ['userName', 'resourceId']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),

  // 鍗辨€ュ€?SLA 鍗囩骇鐘舵€?
  http.get(`${API_BASE}/critical/sla-status`, async () => {
    await delay(100);
    const events = list<any>('criticalEvents');
    const now = Date.now();
    const result = events.map((e: any) => {
      const severity = e.severity || (e.category === 'life-threatening' ? 'life-threatening' : e.category === 'critical' ? 'critical' : 'warning');
      const slaMinutes = getSlaMinutes(severity as any);
      const elapsedMinutes = (now - new Date(e.discoveredAt).getTime()) / 60000;
      const breached = elapsedMinutes > slaMinutes;
      const escalationTargets = getEscalationTargets(severity as any);
      const currentLevel = e.escalationLevel || 0;
      const shouldEscalate = elapsedMinutes > slaMinutes * (1 + currentLevel * 0.5) && currentLevel < escalationTargets.length;
      return {
        id: e.id,
        patientId: e.patientId,
        patientName: e.patientName,
        modality: e.modality,
        category: e.category,
        severity,
        discoveredAt: e.discoveredAt,
        slaMinutes,
        elapsedMinutes: Math.round(elapsedMinutes),
        breached,
        escalationLevel: currentLevel,
        nextEscalationTarget: shouldEscalate ? escalationTargets[currentLevel] : null,
        status: e.status || 'pending',
      };
    });
    return HttpResponse.json({
      success: true,
      data: {
        total: result.length,
        breachedCount: result.filter(r => r.breached).length,
        needEscalation: result.filter(r => r.nextEscalationTarget).length,
        events: result,
      },
    });
  }),

  // 鍗辨€ュ€煎崌绾?(鎵嬪姩瑙﹀彂)
  http.post(`${API_BASE}/critical/:id/escalate`, async ({ params, request }) => {
    await delay(120);
    const id = params.id as string;
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const event = get<any>('criticalEvents', id);
    if (!event) return HttpResponse.json({ success: false }, { status: 404 });
    const newLevel = (event.escalationLevel || 0) + 1;
    const updated = update<any>('criticalEvents', id, { escalationLevel: newLevel, lastEscalatedAt: new Date().toISOString(), escalateReason: body.reason || 'SLA 瓒呮椂鑷姩鍗囩骇' });
    if (updated) {
      auditStatusChange('criticalEvents', updated, `level-${newLevel - 1}`, `level-${newLevel}`);
      recordWorkflowEvent({ actorId: 'system', actorName: '绯荤粺', action: 'escalate', entityType: 'criticalEvents', entityId: id, fromState: `level-${newLevel - 1}`, toState: `level-${newLevel}`, reason: body.reason });
    }
    return HttpResponse.json({ success: true, data: updated });
  }),

  // 褰卞儚璐ㄦ帶璇勫垎璁＄畻
  http.post(`${API_BASE}/image-quality/grade`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as { snrDb: number; cnr: number; uniformityPct: number; artifactScore: number; examId?: string };
    const grade = calculateImageGrade(body);
    return HttpResponse.json({
      success: true,
      data: {
        examId: body.examId,
        inputs: body,
        grade,
        gradeLabel: { A: '浼?, B: '鑹?, C: '鍚堟牸', D: '涓嶅悎鏍? }[grade],
        scoredAt: new Date().toISOString(),
      },
    });
  }),

  // 闄愭祦鐘舵€佹煡璇?
  http.get(`${API_BASE}/rate-limit-status`, async () => {
    return HttpResponse.json({ success: true, data: { note: '闄愭祦鐢?checkRateLimit 鍦ㄥ啓鎺ュ彛涓疄鏃舵鏌?, timestamp: new Date().toISOString() } });
  }),

  // 绯荤粺缁熻姒傝 (鍚庣杩愯鐘舵€?
  http.get(`${API_BASE}/system/health`, async () => {
    await delay(30);
    const s = stats();
    return HttpResponse.json({
      success: true,
      data: {
        status: 'healthy',
        version: '3.0.6.8-44',
        collections: s,
        auditLogCount: s.auditLog || 0,
        timestamp: new Date().toISOString(),
      },
    });
  }),

  // IDB 鐘舵€?
  http.get(`${API_BASE}/system/storage`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        persistent: isUsingIndexedDB(),
        collections: stats(),
      },
    });
  }),
];

// ============= 鎬?handlers =============
export const handlers = [
  ...advancedHandlers, // [v3.0.6.8-32] 楂樼骇绔偣浼樺厛娉ㄥ唽,閬垮厤 /critical/:id 鎷︽埅 /critical/sla-status
  ...authHandlers,
  ...reportHandlers,
  ...worklistHandlers,
  ...appointmentHandlers,
  ...patientHandlers,
  ...deviceHandlers,
  ...dicomHandlers,
  ...aiHandlers,
  ...criticalValueHandlers,
  ...printHandlers,
  ...statsHandlers,
  ...termHandlers,
  ...userHandlers,
  ...consultationHandlers,
  ...queueHandlers,
  ...termListHandlers,
  ...insuranceHandlers,
  ...materialsHandlers,
  ...doseHandlers,
  ...scheduleHandlers,
  ...notificationHandlers,
  ...templateHandlers,
  ...dictionaryHandlers,
  ...safetyHandlers,
  ...signHandlers,
  ...amendHandlers,
  ...aiReportHandlers,
  ...reviewHandlers,
  ...qualityHandlers,
  ...criticalHandlers,
  ...defectHandlers,
  ...initialCheckHandlers,
  ...qualityScoringHandlers,
  ...finalCheckHandlers,
  ...cosignHandlers,
  ...qualityReportHandlers,
  ...aiAssistHandlers,
  ...eyeHandlers, // [v3.0.6.8-33] 鐪肩 180+ 绔偣
];

// 鎬昏: 56 + 6 + 5 + 5 + 6 + 5 = 83 绔偣

// 鎬昏:11 + 9 + 6 + 5 + 7 + 3 + 5 + 4 + 4 + 2 = 56 绔偣

// v3.0.5.1 R3.SIGN+R3.AMEND+R3.AI = 50 + 40 + 40 = 130 绔偣澧為噺

// v3.0.5.1 R3.WRITING+R3.DIST+R3.INTEGRATION+R3.OTHER(鏈壒娆?= 40 + 30 + 50 + 20 = 140 绔偣

// v3.0.5.1 R3.REVIEW INITIAL CHECK = 20 绔偣澧為噺(80 鐐?

// v3.0.5.1 R3.REVIEW FINAL CHECK = 20 绔偣澧為噺(80 鐐?

