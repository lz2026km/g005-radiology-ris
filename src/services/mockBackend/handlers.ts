/**
 * G005 放射RIS系统 v3.0.0 - MSW Mock 后端处理器
 * Phase T4-W9: 50+ 端点(对接 src/services/openapi.ts)
 *
 * 覆盖 9 大 tag:
 *   reports / patients / imaging / ai / ca / audit / collab / terms / stats
 *   + 业务子模块 worklist / device / critical / appointment / print
 */

import { http, HttpResponse, delay } from 'msw';
import { reportSubsystemMock } from '@data/reportSubsystemMock';
import { initialRadiologyExams } from '@data/initialData';
import { TERM_CATEGORIES, FEATURED_TERMS } from '@data/knowledgeStatsMock';
import type { RadiologyReport } from '@/types';

const API_BASE = 'http://localhost:5173/api/v1';

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

// ============= 总 handlers =============
export const handlers = [
  ...reportHandlers,
  ...worklistHandlers,
  ...patientHandlers,
  ...deviceHandlers,
  ...dicomHandlers,
  ...aiHandlers,
  ...criticalValueHandlers,
  ...printHandlers,
  ...statsHandlers,
  ...termHandlers,
];

// 总计:11 + 9 + 6 + 5 + 7 + 3 + 5 + 4 + 4 + 2 = 56 端点
