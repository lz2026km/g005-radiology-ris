/**
 * G005 放射RIS系统 v3.0.0 - MSW Mock 后端处理器
 * Phase T4-W9: 50+ 端点(对接 src/services/openapi.ts)
 *
 * 覆盖 9 大 tag:
 *   reports / patients / imaging / ai / ca / audit / collab / terms / stats
 *   + 业务子模块 worklist / device / critical / appointment / print
 */

import { http, HttpResponse, delay } from 'msw';
import { v4 as uuidv4 } from 'uuid';
import { reportSubsystemMock } from '@data/reportSubsystemMock';
import { initialRadiologyExams, initialUsers } from '@data/initialData';
import { TERM_CATEGORIES, FEATURED_TERMS } from '@data/knowledgeStatsMock';
import type { RadiologyReport } from '@/types';
import { writingHandlers, distributionHandlers, integrationHandlers, otherHandlers, cosignHandlers, qualityReportHandlers, aiAssistHandlers } from './v3ReportHandlers';
import { qualityScoringHandlers } from './qualityScoringHandlers';
import { reviewAssistHandlers } from './v3ReviewHandlers';
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

// v3.0.6.8-13: 动态 API_BASE,基于当前 origin
// 原: 'http://localhost:5173/api/v1' 硬编码导致不同端口(5199)无法匹配
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
        role: '医生',
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

// ============= Reports(11) =============
export const reportHandlers = [
  http.get(`${API_BASE}/reports`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '20');

    let filtered = reportSubsystemMock.reports as RadiologyReport[];
    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }
    const start = (page - 1) * pageSize;
    return HttpResponse.json({
      success: true,
      data: filtered.slice(start, start + pageSize),
      meta: { page, pageSize, total: filtered.length, totalPages: Math.ceil(filtered.length / pageSize) },
    });
  }),

  http.get(`${API_BASE}/reports/stats`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: {
        total: reportSubsystemMock.reports.length,
        byStatus: reportSubsystemMock.reports.reduce((acc, r) => {
          acc[r.status] = (acc[r.status] ?? 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  }),

  http.get(`${API_BASE}/reports/:id`, async ({ params }) => {
    await delay(100);
    const report = reportSubsystemMock.reports.find(
      (r) => r.id === params.id || r.reportId === params.id
    );
    if (!report) {
      return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: report });
  }),

  http.post(`${API_BASE}/reports`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Partial<RadiologyReport>;
    const newReport: RadiologyReport = {
      id: `rpt-${Date.now()}`,
      reportId: `RP${Date.now()}`,
      status: '待分配',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
      ...body,
    } as RadiologyReport;
    return HttpResponse.json({ success: true, data: newReport }, { status: 201 });
  }),

  http.put(`${API_BASE}/reports/:id`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as Partial<RadiologyReport>;
    return HttpResponse.json({ success: true, data: { id: params.id, ...body } });
  }),

  http.delete(`${API_BASE}/reports/:id`, async () => {
    await delay(100);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE}/reports/:id/submit`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: '已提交' } });
  }),

  http.post(`${API_BASE}/reports/:id/review`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: '已审核' } });
  }),

  http.post(`${API_BASE}/reports/:id/sign`, async ({ params }) => {
    await delay(300);  // CA 签名稍慢
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        status: '已签发',
        signedAt: new Date().toISOString(),
        signatureHash: 'mock-' + Math.random().toString(36).substring(7),
      },
    });
  }),

  http.post(`${API_BASE}/reports/:id/reject`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: '已驳回' } });
  }),

  http.post(`${API_BASE}/reports/:id/revise`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({ success: true, data: { id: params.id, status: '修订中' } });
  }),

];

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

// ============= Worklist(9) =============
export const worklistHandlers = [
  http.get(`${API_BASE}/worklist`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const modality = url.searchParams.get('modality');
    const status = url.searchParams.get('status');
    let filtered = initialRadiologyExams as Array<Record<string, unknown>>;
    if (modality) filtered = filtered.filter((e) => e.modality === modality);
    if (status) filtered = filtered.filter((e) => e.status === status);
    return HttpResponse.json({ success: true, data: filtered });
  }),

  http.get(`${API_BASE}/worklist/:id`, async ({ params }) => {
    await delay(100);
    const exam = (initialRadiologyExams as Array<Record<string, unknown>>).find((e) => e.id === params.id);
    if (!exam) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Exam not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: exam });
  }),

  http.post(`${API_BASE}/worklist`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'EX' + Date.now(), ...body } }, { status: 201 });
  }),

  http.put(`${API_BASE}/worklist/:id`, async ({ params, request }) => {
    await delay(150);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: params.id, ...body } });
  }),

  http.put(`${API_BASE}/worklist/:id/status`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as { status: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: body.status } });
  }),

  http.post(`${API_BASE}/worklist/:id/checkin`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, status: '已报到' } });
  }),

  http.post(`${API_BASE}/worklist/:id/start`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, status: '检查中' } });
  }),

  http.post(`${API_BASE}/worklist/:id/complete`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, status: '已完成' } });
  }),

  http.post(`${API_BASE}/worklist/:id/cancel`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, status: '已取消' } });
  }),
];

// ============= Patients(6) =============
export const patientHandlers = [
  http.get(`${API_BASE}/patients`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    let patients = (initialRadiologyExams as Array<Record<string, unknown>>).map((e) => ({
      id: e.patientId,
      name: e.patientName,
      gender: e.gender,
      age: e.age,
    }));
    if (search) {
      patients = patients.filter((p) => String(p.name).includes(search) || String(p.id).includes(search));
    }
    return HttpResponse.json({ success: true, data: patients });
  }),

  http.get(`${API_BASE}/patients/:id`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        name: '模拟患者',
        gender: '男',
        age: 50,
        birthDate: '1976-06-06',
        phone: '138****0000',
      },
    });
  }),

  http.get(`${API_BASE}/patients/:id/exams`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({
      success: true,
      data: (initialRadiologyExams as Array<Record<string, unknown>>).filter((e) => e.patientId === params.id),
    });
  }),

  http.get(`${API_BASE}/patients/:id/reports`, async () => {
    await delay(150);
    return HttpResponse.json({ success: true, data: reportSubsystemMock.reports.slice(0, 5) });
  }),

  http.post(`${API_BASE}/patients`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'P' + Date.now(), ...body } }, { status: 201 });
  }),

  http.put(`${API_BASE}/patients/:id`, async ({ params, request }) => {
    await delay(150);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: params.id, ...body } });
  }),
];

// ============= Devices(5) =============
export const deviceHandlers = [
  http.get(`${API_BASE}/devices`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),

  http.get(`${API_BASE}/devices/:id`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, code: 'CT-1', name: '64排CT', status: 'idle' } });
  }),

  http.put(`${API_BASE}/devices/:id/status`, async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as { status: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: body.status } });
  }),

  http.get(`${API_BASE}/devices/stats/today`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: { totalDevices: 9, inUse: 4, idle: 3, maintenance: 1, broken: 1 },
    });
  }),

  http.get(`${API_BASE}/devices/schedule`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
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
        studyDescription: '胸部CT平扫',
        patientID: 'P001',
        patientName: '张三',
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
    await delay(2000);  // 模拟 LLM 推理
    const body = (await request.json()) as { prompt: string };
    return HttpResponse.json({
      success: true,
      data: {
        content: `【AI 生成报告草稿】基于您的输入 "${body.prompt.slice(0, 50)}..."，建议描述如下：\n\n影像所见：...\n诊断意见：...\n建议：...`,
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
        description: '可疑',
        riskPercent: '5-15%',
        recommendation: '3 个月复查',
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
    return HttpResponse.json({ success: true, data: { id: params.id, finding: '主动脉夹层', status: 'notified' } });
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
        { id: 'p1', name: '胶片打印机 1', ip: '192.168.1.100', status: 'ready' },
        { id: 'p2', name: '激光打印机 1', ip: '192.168.1.101', status: 'ready' },
      ],
    });
  }),

  http.put(`${API_BASE}/print/jobs/:id/cancel`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'cancelled' } });
  }),
];

// ============= Stats(4) =============
export const statsHandlers = [
  http.get(`${API_BASE}/stats/daily`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: {
        totalExams: 247,
        completedExams: 150,
        pendingReports: 97,
        criticalValues: 10,
      },
    });
  }),

  http.get(`${API_BASE}/stats/weekly`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { totalExams: 1730, daily: [] } });
  }),

  http.get(`${API_BASE}/stats/workload`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),

  http.get(`${API_BASE}/stats/quality`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: { averageScore: 85, byDoctor: [], byModality: [] },
    });
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

// ============= Users (6) =============
export const userHandlers = [
  http.get(`${API_BASE}/users`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: initialUsers.slice(0, 20) });
  }),
  http.get(`${API_BASE}/users/:id`, async ({ params }) => {
    await delay(80);
    const u = (initialUsers as Array<Record<string, unknown>>).find((x) => x.id === params.id);
    return HttpResponse.json({ success: true, data: u ?? { id: params.id, name: 'User' } });
  }),
  http.post(`${API_BASE}/users`, async ({ request }) => {
    await delay(150);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'U' + Date.now(), ...(body as object) } }, { status: 201 });
  }),
  http.put(`${API_BASE}/users/:id`, async ({ params, request }) => {
    await delay(120);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: params.id, ...(body as object) } });
  }),
  http.delete(`${API_BASE}/users/:id`, async () => new HttpResponse(null, { status: 204 })),
  http.post(`${API_BASE}/users/:id/reset-password`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: params.id, passwordReset: true } });
  }),
];

// ============= Consultations (5) =============
export const consultationHandlers = [
  http.get(`${API_BASE}/consultations`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.get(`${API_BASE}/consultations/:id`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'scheduled' } });
  }),
  http.post(`${API_BASE}/consultations`, async ({ request }) => {
    await delay(150);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'C' + Date.now(), ...(body as object) } }, { status: 201 });
  }),
  http.put(`${API_BASE}/consultations/:id`, async ({ params, request }) => {
    await delay(120);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: params.id, ...(body as object) } });
  }),
  http.post(`${API_BASE}/consultations/:id/cancel`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'cancelled' } });
  }),
];

// ============= Queue (5) =============
export const queueHandlers = [
  http.get(`${API_BASE}/queue`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.get(`${API_BASE}/queue/rooms`, async () => {
    await delay(80);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.post(`${API_BASE}/queue/:id/call`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'called' } });
  }),
  http.post(`${API_BASE}/queue/:id/complete`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'completed' } });
  }),
  http.post(`${API_BASE}/queue/:id/recall`, async ({ params }) => {
    await delay(80);
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

// ============= Materials (5) =============
export const materialsHandlers = [
  http.get(`${API_BASE}/materials`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    let data = [
      { id: 'mat-1', name: '碘海醇注射液', type: 'contrast', stock: 50, unit: '支', price: 180 },
      { id: 'mat-2', name: '钆喷酸葡胺', type: 'contrast', stock: 30, unit: '支', price: 320 },
      { id: 'mat-3', name: '一次性注射器', type: 'consumable', stock: 200, unit: '个', price: 3.5 },
    ];
    if (type) data = data.filter((m) => m.type === type);
    return HttpResponse.json({ success: true, data });
  }),
  http.get(`${API_BASE}/materials/:id`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, name: '碘海醇注射液', type: 'contrast', stock: 50, unit: '支', price: 180 } });
  }),
  http.post(`${API_BASE}/materials`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'mat-' + Date.now(), ...(body as object) } }, { status: 201 });
  }),
  http.put(`${API_BASE}/materials/:id`, async ({ params, request }) => {
    await delay(150);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: params.id, ...(body as object) } });
  }),
  http.delete(`${API_BASE}/materials/:id`, async () => new HttpResponse(null, { status: 204 })),
];

// ============= Dose Records (4) =============
export const doseHandlers = [
  http.get(`${API_BASE}/dose-records`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const patientId = url.searchParams.get('patientId');
    let data = [
      { id: 'dose-1', patientId: 'P001', examId: 'EX001', contrastType: '碘海醇', dose: 80, unit: 'mL', recordedAt: '2026-06-15T10:00:00Z' },
      { id: 'dose-2', patientId: 'P002', examId: 'EX002', contrastType: '钆喷酸葡胺', dose: 15, unit: 'mL', recordedAt: '2026-06-15T11:00:00Z' },
    ];
    if (patientId) data = data.filter((d) => d.patientId === patientId);
    return HttpResponse.json({ success: true, data });
  }),
  http.get(`${API_BASE}/dose-records/:id`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, patientId: 'P001', contrastType: '碘海醇', dose: 80, unit: 'mL' } });
  }),
  http.post(`${API_BASE}/dose-records`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'dose-' + Date.now(), ...(body as object) } }, { status: 201 });
  }),
  http.get(`${API_BASE}/dose-records/patients/:patientId`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: { patientId: params.patientId, totalDose: 160, unit: 'mL', records: [] },
    });
  }),
];

// ============= Schedules (3) =============
export const scheduleHandlers = [
  http.get(`${API_BASE}/schedules`, async () => {
    await delay(150);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.post(`${API_BASE}/schedules`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'sch-' + Date.now(), ...(body as object) } }, { status: 201 });
  }),
  http.get(`${API_BASE}/schedules/conflicts`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    return HttpResponse.json({ success: true, data: { date, conflicts: [] } });
  }),
];

// ============= Notifications (3) =============
export const notificationHandlers = [
  http.get(`${API_BASE}/notifications`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const unread = url.searchParams.get('unread');
    let data = [
      { id: 'notif-1', title: '急危值通知', content: '患者张三 CT发现主动脉夹层', type: 'critical', isRead: false, createdAt: '2026-06-15T09:00:00Z' },
      { id: 'notif-2', title: '审核提醒', content: '报告 RP20260615001 待审核', type: 'review', isRead: true, createdAt: '2026-06-15T08:00:00Z' },
    ];
    if (unread === 'true') data = data.filter((n) => !n.isRead);
    return HttpResponse.json({ success: true, data });
  }),
  http.put(`${API_BASE}/notifications/:id/read`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, isRead: true } });
  }),
  http.post(`${API_BASE}/notifications/send`, async ({ request }) => {
    await delay(200);
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'notif-' + Date.now(), ...(body as object), createdAt: new Date().toISOString() } }, { status: 201 });
  }),
];

// ============= Templates (7) =============
export const templateHandlers = [
  http.get(`${API_BASE}/templates`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    let data = [
      { id: 'tpl-1', name: '胸部CT平扫模板', category: 'CT', content: '影像所见：...\n诊断意见：...', isPublic: true, createdAt: '2026-01-01' },
      { id: 'tpl-2', name: '腹部MRI增强模板', category: 'MRI', content: '影像所见：...\n诊断意见：...', isPublic: true, createdAt: '2026-01-02' },
    ];
    if (category) data = data.filter((t) => t.category === category);
    return HttpResponse.json({ success: true, data });
  }),
  http.get(`${API_BASE}/templates/:id`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { id: params.id, name: '模板', category: 'CT', content: '影像所见：...', isPublic: true } });
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
    return HttpResponse.json({ success: true, data: { id: 'tpl-' + Date.now(), name: '模板(副本)', originalId: params.id } }, { status: 201 });
  }),
];

// ============= Dictionary (6) =============
export const dictionaryHandlers = [
  http.get(`${API_BASE}/dictionary`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    let data = [
      { id: 'dict-1', type: 'modality', code: 'CT', name: 'CT', description: '计算机断层扫描' },
      { id: 'dict-2', type: 'modality', code: 'MR', name: 'MR', description: '磁共振成像' },
      { id: 'dict-3', type: 'exam_status', code: 'pending', name: '待检查' },
      { id: 'dict-4', type: 'exam_status', code: 'completed', name: '已完成' },
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
        { id: 'dict-1', type: 'modality', code: 'CT', name: 'CT', description: '计算机断层扫描' },
      ].filter((d) => d.code.includes(q) || d.name.includes(q)),
    });
  }),
];

// ============= Safety (15) =============
const MOCK_ADVERSE_EVENTS = [
  { id: 'ae-001', eventType: 'contrast-reaction', severity: 'moderate', status: 'investigating', description: '患者注射碘海醇后出现皮疹', department: 'CT室', reportedBy: '张技师', reportedAt: '2026-06-10T09:00:00Z', patientId: 'P001', patientName: '张三', location: 'CT室1', contributingFactors: ['空腹时间不足'], actionsTaken: ['停止注射', '给予抗过敏药物'], rootCauseIds: [], version: 0 },
  { id: 'ae-002', eventType: 'patient-identification', severity: 'minor', status: 'resolved', description: '扫描前发现患者信息错误', department: '登记处', reportedBy: '李护士', reportedAt: '2026-06-12T10:30:00Z', patientId: 'P002', patientName: '李四', location: '登记窗口', contributingFactors: ['腕带缺失'], actionsTaken: ['核对证件', '重新打印腕带'], rootCauseIds: [], resolvedAt: '2026-06-12T11:00:00Z', resolvedBy: '王主任', version: 0 },
  { id: 'ae-003', eventType: 'fall', severity: 'minor', status: 'reported', description: '患者在检查床旁跌倒', department: 'MRI室', reportedBy: '赵技师', reportedAt: '2026-06-15T14:20:00Z', patientId: 'P003', patientName: '王五', location: 'MRI检查室', contributingFactors: ['地面湿滑'], actionsTaken: ['搀扶', '评估伤情'], rootCauseIds: [], version: 0 },
];

const MOCK_RCA_INVESTIGATIONS = [
  { id: 'rca-001', adverseEventId: 'ae-001', eventTitle: '对比剂反应调查', description: '针对ae-001事件进行根因分析', dateOccurred: '2026-06-10T09:00:00Z', dateInvestigationStarted: '2026-06-10T11:00:00Z', status: 'open', teamMembers: ['王主任', '张技师', '李护士'], fishboneData: [], fiveWhys: [], rootCauses: [], capaPlans: [], capaStatus: 'analyzing', version: 0 },
  { id: 'rca-002', adverseEventId: 'ae-002', eventTitle: '患者身份识别错误', description: '针对ae-002事件进行根因分析', dateOccurred: '2026-06-12T10:30:00Z', dateInvestigationStarted: '2026-06-12T13:00:00Z', status: 'closed', teamMembers: ['王主任', '李护士'], fishboneData: [], fiveWhys: [], rootCauses: ['腕带打印流程不规范'], capaPlans: [], capaStatus: 'closed', conclusion: '加强腕带核对流程', lessonsLearned: '推行双人核对制度', closedAt: '2026-06-13T17:00:00Z', closedBy: '王主任', version: 0 },
];

const MOCK_RISK_ITEMS = [
  { id: 'risk-001', riskType: 'clinical', title: '高场强MRI患者铁磁筛查', category: 'clinical', description: '未充分筛查可能导致铁磁物品进入扫描室', likelihood: 3, severity: 5, rpn: 15, riskLevel: 'very-high', status: 'mitigating', identifiedBy: '王主任', identifiedAt: '2026-05-01T08:00:00Z', mitigationPlan: '增设MRI专用筛查门', mitigationOwner: '设备科', mitigationDeadline: '2026-07-31', residualRpn: 6, version: 0 },
  { id: 'risk-002', riskType: 'operational', title: '夜班技师人手不足', category: 'operational', description: '夜班仅一名技师,急危值无法及时处理', likelihood: 4, severity: 4, rpn: 16, riskLevel: 'very-high', status: 'identified', identifiedBy: '李主任', identifiedAt: '2026-06-01T08:00:00Z', version: 0 },
  { id: 'risk-003', riskType: 'it-security', title: 'PACS外部接口安全', category: 'it-security', description: '外部系统接入PACS可能存在数据泄露风险', likelihood: 2, severity: 5, rpn: 10, riskLevel: 'high', status: 'monitoring', identifiedBy: '信息安全员', identifiedAt: '2026-04-15T08:00:00Z', mitigationPlan: '部署API网关', mitigationOwner: '信息科', mitigationDeadline: '2026-08-31', residualRpn: 4, version: 0 },
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

// ============= R3.REVIEW 审核流 (80) =============
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
      { id: 'ac-1', step: 'submit', actorId: 'D002', actorName: '李慧敏', action: '报告提交', timestamp: new Date().toISOString(), hash: 'a1b2c3' },
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
      defects: [], suggestions: ['整体质量良好'], riskLevel: 'low',
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

// ============= R3.QUALITY 质控 (60) =============
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
    return HttpResponse.json({ success: true, data: { id: 'qs-' + Date.now(), ...(await request.json() as object), totalScore: 88, grade: '乙' } });
  }),
  http.post(`${API_BASE}/quality/score/v2`, async ({ request }) => {
    await delay(1500);
    return HttpResponse.json({ success: true, data: { id: 'qs-' + Date.now(), ...(await request.json() as object), totalScore: 90, grade: '甲' } });
  }),
  http.post(`${API_BASE}/quality/rescore`, async ({ request }) => {
    await delay(1500);
    return HttpResponse.json({ success: true, data: { id: 'qs-' + Date.now(), ...(await request.json() as object), totalScore: 92, grade: '甲' } });
  }),
  http.post(`${API_BASE}/quality/batch-rescore`, async () => {
    await delay(2000);
    return HttpResponse.json({ success: true, data: { rescored: 25 } });
  }),
  http.post(`${API_BASE}/quality/pre-score`, async () => {
    await delay(1000);
    return HttpResponse.json({ success: true, data: { totalScore: 85, grade: '乙' } });
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

// ============= R3.CRITICAL 危急值 (30) =============
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

// ============= R3.DEFECT 缺陷 (20) =============
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

// ============= R3.SIGN 签章 (50) =============
export const signHandlers = [
  // 证书管理
  http.get(`${API_BASE}/sign/certs`, async () => {
    await delay(120);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'cert-001', serialNumber: '3A7F-9D2C-1145-E0B8', subject: { commonName: '张明远', userId: 'D001', role: 'doctor', title: '主任医师' }, certType: 'RSA-SHA256', status: 'active', notBefore: '2025-06-01T00:00:00Z', notAfter: '2027-06-01T00:00:00Z', publicKeyFingerprint: 'SHA256:7e2b:fa3c:9d12:4801:e9a6:bb34:c7f2:1d50', usageCount: 248, createdAt: '2025-06-01T09:00:00Z', createdBy: 'admin-ca' },
        { id: 'cert-002', serialNumber: '8C1E-4B7A-93DF-2206', subject: { commonName: '李慧敏', userId: 'D002', role: 'doctor', title: '副主任医师' }, certType: 'RSA-SHA256', status: 'active', notBefore: '2025-08-15T00:00:00Z', notAfter: '2026-08-15T00:00:00Z', publicKeyFingerprint: 'SHA256:1a3d:5e9b:c840:21fa:0e62:bb91:c723:4851', usageCount: 132, createdAt: '2025-08-15T10:30:00Z', createdBy: 'admin-ca' },
        { id: 'cert-003', serialNumber: '2F4D-8E1B-A039-7C58', subject: { commonName: '赵雪琴', userId: 'D006', role: 'doctor', title: '主任医师' }, certType: 'SM3-SM2', status: 'expired', notBefore: '2024-09-01T00:00:00Z', notAfter: '2025-09-01T00:00:00Z', publicKeyFingerprint: 'SM3:5c81:d3a7:9e42:01f6:7b9d:2148:cc05:6a39', usageCount: 67, createdAt: '2024-09-01T11:00:00Z', createdBy: 'admin-ca' },
        { id: 'cert-004', serialNumber: '6B5A-0FCE-7731-D49A', subject: { commonName: '王建华', userId: 'D003', role: 'doctor', title: '主治医师' }, certType: 'RSA-SHA256', status: 'active', notBefore: '2025-04-10T00:00:00Z', notAfter: '2026-07-10T00:00:00Z', publicKeyFingerprint: 'SHA256:3f7a:e1c4:9b50:28d1:06a3:5e9f:c712:48b3', usageCount: 89, createdAt: '2025-04-10T14:00:00Z', createdBy: 'admin-ca' },
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
  // 签章流程
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
        tsaName: 'G005 医院 TSA',
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
      { id: 'slog-001', reportId: 'RP20260601001', signerName: '张明远', action: 'sign', success: true, signedAt: '2026-06-01T10:23:45Z' },
      { id: 'slog-002', reportId: 'RP20260602001', signerName: '李慧敏', action: 'sign', success: true, signedAt: '2026-06-02T14:08:12Z' },
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
        signerName: '张明远',
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
        signerName: '李慧敏',
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
  // 发布 + 锁定
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
        { id: 'RSA-SHA256', label: 'RSA-SHA256', description: '国际通用，2048 位 RSA + SHA-256' },
        { id: 'SM3-SM2', label: 'SM3-SM2', description: '国密合规，SM3 摘要 + SM2 签名' },
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

// ============= R3.AMEND 修订 (40) =============
export const amendHandlers = [
  http.get(`${API_BASE}/amend`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ success: true, data: [
      { id: 'rev-ent-001', reportId: 'RP20260601001', version: 1, action: 'start', reason: '原报告遗漏右肺下叶磨玻璃结节', authorName: '张明远', createdAt: '2026-06-05T08:30:00Z' },
      { id: 'rev-ent-004', reportId: 'RP20260602008', version: 1, action: 'start', reason: '病理回报：腺癌，需修订原报告', authorName: '李慧敏', createdAt: '2026-06-03T15:30:00Z' },
      { id: 'rev-ent-006', reportId: 'RP20260603003', version: 1, action: 'start', reason: '左右位置描述错误', authorName: '王建华', createdAt: '2026-06-04T14:00:00Z' },
    ] });
  }),
  http.get(`${API_BASE}/amend/:id/chain`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({
      success: true,
      data: [
        { version: 1, authorName: '张明远', action: 'start', reason: '原报告遗漏右肺下叶磨玻璃结节', createdAt: '2026-06-05T08:30:00Z', isCurrent: false, hasCoSign: false, hasApproval: true },
        { version: 2, authorName: '张明远', action: 'edit', reason: '补充 Lung-RADS 分类及随访建议', createdAt: '2026-06-05T09:00:00Z', isCurrent: false, hasCoSign: true, hasApproval: true },
        { version: 3, authorName: '张明远', action: 'complete', reason: '完成修订并发布', createdAt: '2026-06-05T10:00:00Z', isCurrent: true, hasCoSign: true, hasApproval: true },
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
            before: '双肺纹理清晰，未见明显实质性病变。',
            after: '双肺纹理清晰，右肺下叶背段可见一磨玻璃密度结节，大小约 8mm×7mm。',
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
      { id: 'apr-001', revisionId: 'rev-ent-001', status: 'approved', approverName: '赵雪琴', createdAt: '2026-06-05T08:31:00Z' },
      { id: 'apr-002', revisionId: 'rev-ent-004', status: 'pending', createdAt: '2026-06-03T15:35:00Z' },
    ] });
  }),
  http.get(`${API_BASE}/amend/templates`, async () => {
    await delay(80);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'tpl-001', label: '遗漏关键所见', reason: '原报告遗漏 {finding}', category: 'missing-key-finding' },
        { id: 'tpl-002', label: '术语修正', reason: '原 {old_term} 更正为 {new_term}', category: 'terminology-error' },
        { id: 'tpl-003', label: '左右位置修正', reason: '原报告左右位置描述颠倒', category: 'left-right-confused' },
      ],
    });
  }),
  http.get(`${API_BASE}/amend/:id/audit`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: [
      { id: 'audit-001', revisionId: params.id, action: 'start', actor: '张明远', timestamp: '2026-06-05T08:30:00Z' },
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
      { id: 'sup-001', reportId: 'RP20260601008', type: 'pathology', note: '病理回报：右肺下叶穿刺活检结果为非典型腺瘤样增生（AAH）', authorName: '李慧敏', createdAt: '2026-06-03T09:00:00Z' },
      { id: 'sup-002', reportId: 'RP20260602011', type: 'comparison-prior', note: '对比 2025 年 6 月 CT', authorName: '刘文博', createdAt: '2026-06-04T11:00:00Z' },
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
      { id: 'sup-001', reportId: params.id, type: 'pathology', note: '病理回报', createdAt: '2026-06-03T09:00:00Z' },
    ] });
  }),
  http.get(`${API_BASE}/supplement/types`, async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'pathology', label: '病理回报', icon: '🔬' },
        { id: 'comparison-prior', label: '对比片', icon: '🖼️' },
        { id: 'follow-up', label: '随访结果', icon: '🔄' },
        { id: 'addendum', label: '补充说明', icon: '📝' },
        { id: 'consultation', label: '会诊意见', icon: '👥' },
        { id: 'lab-result', label: '实验室结果', icon: '🧪' },
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
    return HttpResponse.json({ success: true, data: { code: '8170/3', morphology: '腺癌', topography: '肝' } });
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
        title: '放射报告修订告知书',
        template: '尊敬的 {patientName}：您的放射检查（{examItemName}）报告已于 {originalSignedAt} 由 {originalSigner} 签发。由于 {amendReason}，原报告已由 {amendSigner} 完成修订。如有疑问请致电 G005 放射科。',
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

// ============= R3.AI 智能 (40) =============
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
        findings: 'AI 自动生成的所见（mock）',
        diagnosis: 'AI 自动生成的诊断（mock）',
        impression: 'AI 自动生成的意见（mock）',
        recommendations: '随访建议',
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
        { id: 'chest-ct', label: '胸部 CT', modality: 'CT', description: '肺结节/纵隔/胸膜' },
        { id: 'head-mri', label: '头颅 MRI', modality: 'MR', description: '脑梗塞/出血/占位' },
        { id: 'abdomen-ct', label: '腹部 CT', modality: 'CT', description: '肝胆胰脾肾' },
        { id: 'spine-mri', label: '脊柱 MRI', modality: 'MR', description: '椎间盘/脊髓/韧带' },
        { id: 'breast-mg', label: '乳腺钼靶', modality: 'MG', description: 'BI-RADS 分类' },
        { id: 'cardiac-cta', label: '心脏 CTA', modality: 'CT', description: '冠脉/瓣膜/心肌' },
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
          body.prefix + '，边界欠清，未见明显实性成分。',
          body.prefix + '，大小约 8mm×7mm。',
          body.prefix + '，建议 3 个月后复查。',
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
        result: body.mode === 'expand' ? body.text + '，详见影像所见。' : body.text,
        processingMs: 600,
      },
    });
  }),
  http.post(`${API_BASE}/ai/expand`, async ({ request }) => {
    await delay(600);
    return HttpResponse.json({ success: true, data: { result: '扩写结果', processingMs: 600 } });
  }),
  http.post(`${API_BASE}/ai/shorten`, async ({ request }) => {
    await delay(600);
    return HttpResponse.json({ success: true, data: { result: '缩写结果', processingMs: 600 } });
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
          { id: 'def-001', type: 'missing-key-finding', field: 'examFindings', severity: 'high', description: '建议明确描述右肺下叶磨玻璃结节' },
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
        defects: body.text.length < 20 ? [{ id: 'def-001', type: 'missing-key-finding', field: 'examFindings', severity: 'medium', description: '内容过短' }] : [],
        processingMs: 600,
      },
    });
  }),
  // Critical
  http.post(`${API_BASE}/ai/critical-detect`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { text: string };
    const keywords = ['脑疝', '主动脉夹层', '肺栓塞'];
    const hits = keywords
      .filter((k) => body.text.includes(k))
      .map((k) => ({ id: 'crit-' + Date.now(), keyword: k, confidence: 0.9, recommendation: '建议双签' }));
    return HttpResponse.json({ success: true, data: { hits, processingMs: 500 } });
  }),
  // Synonym
  http.get(`${API_BASE}/ai/synonym`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const text = url.searchParams.get('text') ?? '';
    const synonyms: { original: string; synonyms: string[]; preferred: string }[] = [];
    if (text.includes('磨玻璃影')) synonyms.push({ original: '磨玻璃影', synonyms: ['磨玻璃密度影'], preferred: '磨玻璃密度影' });
    if (text.includes('占位')) synonyms.push({ original: '占位', synonyms: ['占位性病变'], preferred: '占位性病变' });
    return HttpResponse.json({ success: true, data: synonyms });
  }),
  // Similar
  http.get(`${API_BASE}/ai/similar`, async ({ request }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'sim-001', reportId: 'RP20251203012', patientAge: 62, patientGender: '男', diagnosis: '右肺下叶 AAH', similarity: 0.89 },
        { id: 'sim-002', reportId: 'RP20251108008', patientAge: 67, patientGender: '男', diagnosis: '右肺下叶 AIS', similarity: 0.84 },
      ],
    });
  }),
  // Key image
  http.post(`${API_BASE}/ai/key-image`, async ({ request }) => {
    await delay(800);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'ki-001', sopInstanceUid: '1.2.840.0.1.1.1.1', seriesNumber: 3, instanceNumber: 87, reason: '右肺下叶结节层面', confidence: 0.92 },
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
          { id: 'les-001', type: 'nodule', location: '右肺下叶背段', sizeMm: { length: 8, width: 7 }, confidence: 0.91 },
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
        corrected: body.text.replace(/的的/g, '的').replace(/做做/g, '做'),
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
          { id: 'rf-001', category: 'finding', name: '磨玻璃结节 ≥ 6mm', weight: 0.35, description: '右肺下叶磨玻璃结节 8mm×7mm' },
        ],
        predictedOutcomes: [],
        earlyWarnings: [],
        recommendedActions: ['3 个月后复查'],
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
        primaryDiagnosis: '右肺下叶背段磨玻璃结节',
        differentials: [
          { id: 'dd-001', diagnosis: '非典型腺瘤样增生（AAH）', probability: 0.45, supportingFindings: ['纯磨玻璃密度'], contradictingFindings: [], reasoning: '典型表现' },
          { id: 'dd-002', diagnosis: '原位腺癌（AIS）', probability: 0.35, supportingFindings: ['磨玻璃密度结节'], contradictingFindings: [], reasoning: '需警惕' },
        ],
        recommendedTests: ['3 个月后复查 CT'],
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
      data: { system: 'Lung-RADS', category: '3', description: '可能良性结节', riskPercent: '1-2%', recommendation: '6 个月后复查' },
    });
  }),
  http.post(`${API_BASE}/ai/dose`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { totalDLP: 285, recommendation: '符合剂量限制' } });
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
        { userId: 'D001', userName: '张明远', department: 'CT室', callsToday: 23, callsMonth: 412, acceptanceRate: 0.85 },
        { userId: 'D002', userName: '李慧敏', department: 'MR室', callsToday: 18, callsMonth: 356, acceptanceRate: 0.81 },
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

// ============= R3.REVIEW INITIAL CHECK 初核清单 (20) =============
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
      else failures.push(`${it.name}:未命中关键字`);
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
      if (!(it.keywords ?? []).some((k) => text.includes(k))) failures.push(`${it.name}:必填项未通过`);
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
    if (!list.requiredAllPassed) return HttpResponse.json({ success: false, message: '必填项未全部通过' }, { status: 400 });
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
      return HttpResponse.json({ success: false, message: '驳回原因不能少于 5 字符' }, { status: 400 });
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
        details.push({ listId: list.id, reportId: list.reportId, status: 'skipped', reason: '必填项未全部通过' });
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
          details.push({ listId: list.id, reportId: list.reportId, status: 'skipped', reason: '驳回原因不足 5 字符' });
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

// ============= R3.REVIEW FINAL CHECK 终核清单 (20) =============
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
  // 1. 模板 (15+ 检查项)
  http.get(`${API_BASE}/review/final-check/templates`, async () => {
    await delay(120);
    return HttpResponse.json({ success: true, data: FINAL_CHECK_TEMPLATES });
  }),

  // 2. 清单列表
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

  // 3. 启动终核
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

  // 4. 更新检查项状态
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

  // 5. 完成终核
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

  // 6. 临床一致性
  http.get(`${API_BASE}/review/final-check/consistency/:reportId`, async ({ params }) => {
    await delay(800);
    const c = CLINICAL_CONSISTENCY_RESULTS.find((x) => x.reportId === params.reportId);
    return HttpResponse.json({ success: true, data: c ?? CLINICAL_CONSISTENCY_RESULTS[0] });
  }),

  // 7. 评分细则
  http.get(`${API_BASE}/review/final-check/rubrics`, async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: FINAL_SCORING_RUBRICS });
  }),

  // 8. 提交终评
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

  // 9. 驳回 -> 初审
  http.post(`${API_BASE}/review/final-check/reject/initial`, async ({ request }) => {
    await delay(180);
    const body = (await request.json()) as { taskId: string; reviewerId: string; reviewerName: string; reason: string };
    if (!body.reason || body.reason.trim().length < 5) return HttpResponse.json({ success: false, message: '原因不能少于 5 字符' }, { status: 400 });
    const list = finalCheckInMemory.lists.find((l) => l.taskId === body.taskId);
    if (!list) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    list.status = 'aborted';
    list.completedAt = new Date().toISOString();
    finalCheckLogEvent(body.taskId, list.reportId, 'rejected-initial', body.reviewerId, body.reviewerName, { reason: body.reason });
    return HttpResponse.json({ success: true, data: { taskId: body.taskId, status: 'rejected', target: 'initial' } });
  }),

  // 10. 驳回 -> 起草
  http.post(`${API_BASE}/review/final-check/reject/draft`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { taskId: string; reviewerId: string; reviewerName: string; reason: string };
    if (!body.reason || body.reason.trim().length < 10) return HttpResponse.json({ success: false, message: '原因不能少于 10 字符' }, { status: 400 });
    const list = finalCheckInMemory.lists.find((l) => l.taskId === body.taskId);
    if (!list) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    list.status = 'aborted';
    list.completedAt = new Date().toISOString();
    finalCheckLogEvent(body.taskId, list.reportId, 'rejected-draft', body.reviewerId, body.reviewerName, { reason: body.reason });
    return HttpResponse.json({ success: true, data: { taskId: body.taskId, status: 'rejected', target: 'direct-to-draft' } });
  }),

  // 11. 笔记列表
  http.get(`${API_BASE}/review/final-check/notes/:taskId`, async ({ params }) => {
    await delay(100);
    const data = finalCheckInMemory.notes.filter((n) => n.taskId === params.taskId);
    return HttpResponse.json({ success: true, data });
  }),

  // 12. 添加笔记
  http.post(`${API_BASE}/review/final-check/notes`, async ({ request }) => {
    await delay(120);
    const body = (await request.json()) as Record<string, unknown>;
    const note = { id: 'frn-' + Date.now(), createdAt: new Date().toISOString(), ...body };
    finalCheckInMemory.notes.unshift(note);
    finalCheckLogEvent((body.taskId as string) ?? '', (body.reportId as string) ?? '', 'note-added', (body.authorId as string) ?? '', (body.authorName as string) ?? '', { type: body.type });
    return HttpResponse.json({ success: true, data: note });
  }),

  // 13. 工作量
  http.get(`${API_BASE}/review/final-check/workload`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const reviewerId = url.searchParams.get('reviewerId');
    const date = url.searchParams.get('date');
    const data = FINAL_CHECK_WORKLOAD.filter((w) => !reviewerId || w.reviewerId === reviewerId).filter((w) => !date || w.date === date);
    return HttpResponse.json({ success: true, data });
  }),

  // 14. 既往报告对比
  http.get(`${API_BASE}/review/final-check/prior-comparison/:reportId`, async ({ params }) => {
    await delay(600);
    const data = PRIOR_REPORT_COMPARISONS.find((p) => p.currentReportId === params.reportId) ?? null;
    return HttpResponse.json({ success: true, data });
  }),

  // 15. 多签列表
  http.get(`${API_BASE}/review/final-check/multi-sig`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');
    const data = finalCheckInMemory.multiSigs.filter((m) => !taskId || m.taskId === taskId);
    return HttpResponse.json({ success: true, data });
  }),

  // 16. 发起多签
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

  // 17. 签章多签 slot
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

  // 18. 急诊通道列表
  http.get(`${API_BASE}/review/final-check/emergency`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const data = finalCheckInMemory.emergencies.filter((e) => !status || status === 'all' || e.status === status);
    return HttpResponse.json({ success: true, data });
  }),

  // 19. 触发急诊通道
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
        { reviewerId: 'D001', reviewerName: '张明远', role: 'chief', notifiedAt: new Date().toISOString() },
        { reviewerId: 'D009', reviewerName: '吴芳', role: 'chief', notifiedAt: new Date().toISOString() },
      ],
      slaMinutes, status: 'open', auditId: 'audit-emr-' + Date.now(),
    };
    finalCheckInMemory.emergencies.unshift(req);
    finalCheckLogEvent(body.taskId, body.reportId, 'emergency-triggered', body.triggeredBy, body.triggeredByName, { trigger: body.trigger, severity: body.severity });
    return HttpResponse.json({ success: true, data: req });
  }),

  // 20. 工作流配置 + 仪表盘合并
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

  // 21. 更新工作流配置 (额外)
  http.put(`${API_BASE}/review/final-check/workflow-config/:id`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as Record<string, unknown>;
    const c = finalCheckInMemory.configs.find((x) => x.id === params.id);
    if (!c) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    Object.assign(c, body, { updatedAt: new Date().toISOString() });
    return HttpResponse.json({ success: true, data: c });
  }),
];

// ============= 总 handlers =============
export const handlers = [
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
];

// 总计: 56 + 6 + 5 + 5 + 6 + 5 = 83 端点

// 总计:11 + 9 + 6 + 5 + 7 + 3 + 5 + 4 + 4 + 2 = 56 端点

// v3.0.5.1 R3.SIGN+R3.AMEND+R3.AI = 50 + 40 + 40 = 130 端点增量

// v3.0.5.1 R3.WRITING+R3.DIST+R3.INTEGRATION+R3.OTHER(本批次)= 40 + 30 + 50 + 20 = 140 端点

// v3.0.5.1 R3.REVIEW INITIAL CHECK = 20 端点增量(80 点)

// v3.0.5.1 R3.REVIEW FINAL CHECK = 20 端点增量(80 点)

