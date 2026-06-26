/**
 * G005 眼科专科 MSW Handlers v3.0.6.8-33
 * 8 Module / 180 端点, 对标 Topcon Synergy + Medisoft mediSIGHT
 *
 * 覆盖范围:
 *  - EyeRisModule (26): 预约/状态/随访/转诊/手术/排班
 *  - EyePacsModule (32): study/series/instance + 测量/标注/拼图/对比/关键影像
 *  - EyeEmrModule (24): 病历 + 8 病史段 + 眼科检查 + 术前 + 麻醉
 *  - EyeAiModule (18): 模型 + 推理 + 热图 + ROC + 反馈
 *  - EyeReportModule (22): 报告 + 模板 + 草稿 + 签名 + 打印
 *  - EyeKpiModule (16): KPI + 趋势 + 医生 + 目标
 *  - EyeSubspecialtyModule (24): 8 亚专科 (斜视/神经/眼眶/角膜/白内障/屈光/接触镜/低视力)
 *  - EyePatientJourneyModule (18): 时间线 + 宣教 + 保险 + 通知 + 旅程事件
 */

import { http, HttpResponse, delay } from 'msw';
import {
  list, get, create, update, remove, findMany,
} from './store';
import {
  parseQuery, applyQuery, groupBy, sumBy, avgBy, filterByDateRange,
} from './queryBuilder';
import { auditCreate, auditUpdate, auditDelete } from './audit';
import { recordWorkflowEvent, checkRateLimit } from './businessLogic';

const API_BASE = '/api/v1/eye';

// RBAC 资源点 (35 个) - 用于细粒度权限
// 资源分类: report(7) + imaging(6) + surgery(4) + ai(4) + data(14)
const RBAC_POINTS = [
  'eye:report:read', 'eye:report:create', 'eye:report:update', 'eye:report:sign',
  'eye:report:cosign', 'eye:report:publish', 'eye:report:export',
  'eye:study:read', 'eye:study:create', 'eye:study:delete', 'eye:study:share',
  'eye:study:export', 'eye:study:ai-run',
  'eye:surgery:schedule', 'eye:surgery:execute', 'eye:surgery:record', 'eye:surgery:cancel',
  'eye:ai:run', 'eye:ai:override', 'eye:ai:train', 'eye:ai:audit',
  'eye:emr:read', 'eye:emr:create', 'eye:emr:update', 'eye:emr:delete',
  'eye:subspecialty:strabismus:read', 'eye:subspecialty:neuro:read',
  'eye:subspecialty:oncology:read', 'eye:subspecialty:cornea:read',
  'eye:subspecialty:cataract:read', 'eye:subspecialty:refractive:read',
  'eye:subspecialty:contact-lens:read', 'eye:subspecialty:low-vision:read',
  'eye:journey:read', 'eye:journey:update',
];

// ============= EyeRisModule (26 端点) =============
// 预约
const eyeRisModule = [
  // 1) 预约列表
  http.get(`${API_BASE}/ris/appointments`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_appointments');
    const result = applyQuery(all, opts, ['patientName', 'doctorName', 'appointmentNo']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 2) 今日预约 (静态路径必须在动态路径 /:id 之前)
  http.get(`${API_BASE}/ris/appointments/today`, async () => {
    await delay(50);
    const today = new Date().toISOString().slice(0, 10);
    const all = list<any>('eye_appointments').filter((a: any) => a.appointmentDate?.startsWith(today) || a.date?.startsWith(today));
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 3) 预约详情
  http.get(`${API_BASE}/ris/appointments/:id`, async ({ params }) => {
    await delay(50);
    const a = get<any>('eye_appointments', params.id as string);
    if (!a) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: a });
  }),
  // 4) 创建预约
  http.post(`${API_BASE}/ris/appointments`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    const id = body.id || `APT${Date.now()}`;
    const newItem = { ...body, id, status: body.status || 'scheduled', createdAt: new Date().toISOString() };
    create('eye_appointments', newItem);
    auditCreate('eye_appointments', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 5) 更新预约
  http.put(`${API_BASE}/ris/appointments/:id`, async ({ params, request }) => {
    await delay(80);
    const id = params.id as string;
    const body = (await request.json()) as any;
    const updated = update<any>('eye_appointments', id, body);
    if (updated) auditUpdate('eye_appointments', updated);
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 6) 取消预约
  http.delete(`${API_BASE}/ris/appointments/:id`, async ({ params }) => {
    await delay(50);
    const id = params.id as string;
    const before = get<any>('eye_appointments', id);
    const ok = remove('eye_appointments', id);
    if (ok && before) auditDelete({ resource: 'eye_appointments', resourceId: id, before });
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),

  // 7) 状态机: 签到
  http.post(`${API_BASE}/ris/appointments/:id/checkin`, async ({ params }) => {
    await delay(50);
    const id = params.id as string;
    const updated = update<any>('eye_appointments', id, { status: 'checked_in', checkedInAt: new Date().toISOString() });
    if (updated) auditUpdate('eye_appointments', updated);
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 8) 状态机: 开始检查
  http.post(`${API_BASE}/ris/appointments/:id/start`, async ({ params }) => {
    await delay(50);
    const id = params.id as string;
    const updated = update<any>('eye_appointments', id, { status: 'in_progress', startedAt: new Date().toISOString() });
    if (updated) auditUpdate('eye_appointments', updated);
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 9) 状态机: 完成
  http.post(`${API_BASE}/ris/appointments/:id/complete`, async ({ params }) => {
    await delay(50);
    const id = params.id as string;
    const updated = update<any>('eye_appointments', id, { status: 'completed', completedAt: new Date().toISOString() });
    if (updated) auditUpdate('eye_appointments', updated);
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 10) 状态机: 取消
  http.post(`${API_BASE}/ris/appointments/:id/cancel`, async ({ params }) => {
    await delay(50);
    const id = params.id as string;
    const updated = update<any>('eye_appointments', id, { status: 'cancelled', cancelledAt: new Date().toISOString() });
    if (updated) auditUpdate('eye_appointments', updated);
    return HttpResponse.json({ success: true, data: updated });
  }),

  // 11) 随访列表
  http.get(`${API_BASE}/ris/follow-ups`, async ({ request }) => {
    await delay(60);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_follow_ups');
    const result = applyQuery(all, opts, ['patientName']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 12) 随访详情
  http.get(`${API_BASE}/ris/follow-ups/:id`, async ({ params }) => {
    await delay(40);
    const f = get<any>('eye_follow_ups', params.id as string);
    if (!f) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: f });
  }),
  // 13) 创建随访
  http.post(`${API_BASE}/ris/follow-ups`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `FU${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
    create('eye_follow_ups', newItem);
    auditCreate('eye_follow_ups', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 14) 完成随访
  http.post(`${API_BASE}/ris/follow-ups/:id/complete`, async ({ params, request }) => {
    await delay(50);
    const id = params.id as string;
    const body = (await request.json().catch(() => ({}))) as any;
    const updated = update<any>('eye_follow_ups', id, { status: 'completed', completedAt: new Date().toISOString(), notes: body.notes });
    if (updated) auditUpdate('eye_follow_ups', updated);
    return HttpResponse.json({ success: true, data: updated });
  }),

  // 15) 转诊列表
  http.get(`${API_BASE}/ris/referrals`, async ({ request }) => {
    await delay(60);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_referrals');
    const result = applyQuery(all, opts, ['patientName']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 16) 转诊详情
  http.get(`${API_BASE}/ris/referrals/:id`, async ({ params }) => {
    await delay(40);
    const r = get<any>('eye_referrals', params.id as string);
    if (!r) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: r });
  }),
  // 17) 创建转诊
  http.post(`${API_BASE}/ris/referrals`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `REF${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
    create('eye_referrals', newItem);
    auditCreate('eye_referrals', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 18) 接受转诊
  http.post(`${API_BASE}/ris/referrals/:id/accept`, async ({ params }) => {
    await delay(50);
    const id = params.id as string;
    const updated = update<any>('eye_referrals', id, { status: 'accepted', acceptedAt: new Date().toISOString() });
    return HttpResponse.json({ success: true, data: updated });
  }),

  // 19) 手术列表
  http.get(`${API_BASE}/ris/surgeries`, async ({ request }) => {
    await delay(60);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_surgeries');
    const result = applyQuery(all, opts, ['patientName', 'surgeryType']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 20) 手术详情
  http.get(`${API_BASE}/ris/surgeries/:id`, async ({ params }) => {
    await delay(40);
    const s = get<any>('eye_surgeries', params.id as string);
    if (!s) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: s });
  }),
  // 21) 排程手术
  http.post(`${API_BASE}/ris/surgeries`, async ({ request }) => {
    await delay(120);
    // 限流: 60 req/min per user
    const rl = checkRateLimit('eye-surgery-create', { maxPerMinute: 60 });
    if (!rl.allowed) return new HttpResponse('Too Many', { status: 429 });
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `SURG${Date.now()}`, status: 'scheduled', createdAt: new Date().toISOString() };
    create('eye_surgeries', newItem);
    auditCreate('eye_surgeries', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 22) 取消手术
  http.delete(`${API_BASE}/ris/surgeries/:id`, async ({ params }) => {
    await delay(50);
    const id = params.id as string;
    const before = get<any>('eye_surgeries', id);
    const ok = remove('eye_surgeries', id);
    if (ok && before) auditDelete({ resource: 'eye_surgeries', resourceId: id, before });
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),

  // 23) 排班列表
  http.get(`${API_BASE}/ris/schedules`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const doctorId = url.searchParams.get('doctorId');
    let all = list<any>('eye_schedules').filter((s: any) => s.doctorId || s.scheduleDate);
    if (doctorId) all = all.filter((s: any) => s.doctorId === doctorId);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 24) 创建排班
  http.post(`${API_BASE}/ris/schedules`, async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `SCH${Date.now()}`, createdAt: new Date().toISOString() };
    create('eye_schedules', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 25) 排班冲突检测
  http.post(`${API_BASE}/ris/schedules/conflict-check`, async ({ request }) => {
    await delay(60);
    const body = (await request.json()) as { doctorId: string; startTime: string; endTime: string };
    const conflicts = list<any>('eye_schedules').filter((s: any) => s.doctorId === body.doctorId);
    return HttpResponse.json({ success: true, data: { conflictCount: conflicts.length, conflicts: conflicts.slice(0, 5) } });
  }),
  // 26) RIS 工作流状态总览
  http.get(`${API_BASE}/ris/workflow-status`, async () => {
    await delay(40);
    const appointments = list<any>('eye_appointments');
    const byStatus: Record<string, number> = {};
    for (const a of appointments) {
      const s = a.status || 'unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    }
    return HttpResponse.json({ success: true, data: { total: appointments.length, byStatus } });
  }),
];

export default eyeRisModule;
export { eyeRisModule, RBAC_POINTS, API_BASE };

// ============= EyePacsModule (32 端点) =============
// 1) Study 列表
const eyePacsModule = [
  http.get(`${API_BASE}/pacs/studies`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_studies');
    const result = applyQuery(all, opts, ['patientName', 'studyId', 'modality']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 2) Study 详情
  http.get(`${API_BASE}/pacs/studies/:id`, async ({ params }) => {
    await delay(50);
    const s = get<any>('eye_studies', params.id as string);
    if (!s) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: s });
  }),
  // 3) 创建 Study
  http.post(`${API_BASE}/pacs/studies`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    const newItem = { ...body, studyId: body.studyId || `STU${Date.now()}`, status: body.status || 'scheduled', createdAt: new Date().toISOString() };
    create('eye_studies', newItem);
    auditCreate('eye_studies', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 4) 更新 Study
  http.put(`${API_BASE}/pacs/studies/:id`, async ({ params, request }) => {
    await delay(80);
    const id = params.id as string;
    const body = (await request.json()) as any;
    const updated = update<any>('eye_studies', id, body);
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 5) 删除 Study
  http.delete(`${API_BASE}/pacs/studies/:id`, async ({ params }) => {
    await delay(50);
    const id = params.id as string;
    const before = get<any>('eye_studies', id);
    const ok = remove('eye_studies', id);
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),
  // 6) 按模态过滤
  http.get(`${API_BASE}/pacs/studies/by-modality/:modality`, async ({ params }) => {
    await delay(60);
    const all = list<any>('eye_studies').filter((s: any) => s.modality === params.modality);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 7) 按眼别
  http.get(`${API_BASE}/pacs/studies/by-laterality/:side`, async ({ params }) => {
    await delay(60);
    const all = list<any>('eye_studies').filter((s: any) => s.eyeSide === params.side || s.laterality === params.side);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 8) 按患者
  http.get(`${API_BASE}/pacs/studies/by-patient/:patientId`, async ({ params }) => {
    await delay(60);
    const all = list<any>('eye_studies').filter((s: any) => s.patientId === params.patientId);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),

  // 9) Series 列表
  http.get(`${API_BASE}/pacs/series`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_series');
    const result = applyQuery(all, opts, ['seriesDescription']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 10) Series 详情
  http.get(`${API_BASE}/pacs/series/:id`, async ({ params }) => {
    await delay(40);
    const s = get<any>('eye_series', params.id as string);
    if (!s) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: s });
  }),
  // 11) 创建 Series
  http.post(`${API_BASE}/pacs/series`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    const newItem = { ...body, seriesId: body.seriesId || `SER${Date.now()}` };
    create('eye_series', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 12) 删除 Series
  http.delete(`${API_BASE}/pacs/series/:id`, async ({ params }) => {
    const id = params.id as string;
    const ok = remove('eye_series', id);
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),

  // 13) Instance 列表
  http.get(`${API_BASE}/pacs/instances`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_instances');
    const result = applyQuery(all, opts, ['instanceType']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 14) Instance 详情
  http.get(`${API_BASE}/pacs/instances/:id`, async ({ params }) => {
    await delay(40);
    const i = get<any>('eye_instances', params.id as string);
    if (!i) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: i });
  }),
  // 15) 创建 Instance
  http.post(`${API_BASE}/pacs/instances`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `INS${Date.now()}` };
    create('eye_instances', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 16) 删除 Instance
  http.delete(`${API_BASE}/pacs/instances/:id`, async ({ params }) => {
    const id = params.id as string;
    const ok = remove('eye_instances', id);
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),

  // 17) DICOM-web WADO (拉取像素)
  http.get(`${API_BASE}/pacs/wado/:studyId`, async ({ params }) => {
    await delay(100);
    const study = get<any>('eye_studies', params.studyId as string);
    if (!study) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: { studyId: params.studyId, contentType: 'application/dicom', pixelDataRef: `data:image/png;base64,...` } });
  }),
  // 18) DICOM-web QIDO (查询)
  http.get(`${API_BASE}/pacs/qido/studies`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const patientId = url.searchParams.get('PatientID');
    let all = list<any>('eye_studies');
    if (patientId) all = all.filter((s: any) => s.patientId === patientId);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 19) DICOM-web STOW (存储)
  http.post(`${API_BASE}/pacs/stow/studies`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { received: true, sopInstanceUID: body.sopInstanceUID } });
  }),

  // 20) 测量列表
  http.get(`${API_BASE}/pacs/measurements`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_measurements');
    const result = applyQuery(all, opts, ['measurementType']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 21) 测量详情
  http.get(`${API_BASE}/pacs/measurements/:id`, async ({ params }) => {
    await delay(40);
    const m = get<any>('eye_measurements', params.id as string);
    if (!m) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: m });
  }),
  // 22) 创建测量
  http.post(`${API_BASE}/pacs/measurements`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `MS${Date.now()}`, createdAt: new Date().toISOString() };
    create('eye_measurements', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 23) 删除测量
  http.delete(`${API_BASE}/pacs/measurements/:id`, async ({ params }) => {
    const id = params.id as string;
    const ok = remove('eye_measurements', id);
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),

  // 24) 标注列表
  http.get(`${API_BASE}/pacs/annotations`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_annotations');
    const result = applyQuery(all, opts, ['annotationType']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 25) 创建标注
  http.post(`${API_BASE}/pacs/annotations`, async ({ request }) => {
    await delay(60);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `AN${Date.now()}`, createdAt: new Date().toISOString() };
    create('eye_annotations', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 26) 删除标注
  http.delete(`${API_BASE}/pacs/annotations/:id`, async ({ params }) => {
    const id = params.id as string;
    const ok = remove('eye_annotations', id);
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),
  // 27) 病灶分割列表
  http.get(`${API_BASE}/pacs/lesion-segmentations`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_lesion_segmentations');
    const result = applyQuery(all, opts, ['lesionType']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 28) 创建分割
  http.post(`${API_BASE}/pacs/lesion-segmentations`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `LS${Date.now()}` };
    create('eye_lesion_segmentations', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 29) 拼图 (montage) 创建
  http.post(`${API_BASE}/pacs/montage`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { montageId: `MNT${Date.now()}`, ...body, status: 'rendering' } });
  }),
  // 30) 拼图状态
  http.get(`${API_BASE}/pacs/montage/:id`, async ({ params }) => {
    await delay(30);
    return HttpResponse.json({ success: true, data: { montageId: params.id, status: 'completed', progress: 100 } });
  }),
  // 31) 对比 (compare) - 双 Study 对比
  http.post(`${API_BASE}/pacs/compare`, async ({ request }) => {
    await delay(120);
    const body = (await request.json()) as { studyIdA: string; studyIdB: string };
    const a = get<any>('eye_studies', body.studyIdA);
    const b = get<any>('eye_studies', body.studyIdB);
    return HttpResponse.json({ success: true, data: { left: a, right: b, diff: {} } });
  }),
  // 32) 关键影像列表
  http.get(`${API_BASE}/pacs/key-images`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const studyId = url.searchParams.get('studyId');
    let all = list<any>('eye_instances').filter((i: any) => i.isKeyImage || i.keyImage);
    if (studyId) all = all.filter((i: any) => i.studyId === studyId);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
];

// ============= EyeEmrModule (24 端点) =============
const eyeEmrModule = [
  // 1) 病历列表
  http.get(`${API_BASE}/emr/records`, async ({ request }) => {
    await delay(60);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_emrs');
    const result = applyQuery(all, opts, ['patientName', 'chiefComplaint']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 2) 按患者 (静态路径必须在 /:id 之前)
  http.get(`${API_BASE}/emr/records/by-patient/:patientId`, async ({ params }) => {
    await delay(50);
    const all = list<any>('eye_emrs').filter((e: any) => e.patientId === params.patientId);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 3) 病历详情
  http.get(`${API_BASE}/emr/records/:id`, async ({ params }) => {
    await delay(40);
    const e = get<any>('eye_emrs', params.id as string);
    if (!e) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: e });
  }),
  // 4) 创建病历
  http.post(`${API_BASE}/emr/records`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `EMR${Date.now()}`, createdAt: new Date().toISOString() };
    create('eye_emrs', newItem);
    auditCreate('eye_emrs', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 5) 更新病历
  http.put(`${API_BASE}/emr/records/:id`, async ({ params, request }) => {
    await delay(60);
    const id = params.id as string;
    const body = (await request.json()) as any;
    const updated = update<any>('eye_emrs', id, { ...body, updatedAt: new Date().toISOString() });
    if (updated) auditUpdate('eye_emrs', updated);
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 6) 删除病历
  http.delete(`${API_BASE}/emr/records/:id`, async ({ params }) => {
    const id = params.id as string;
    const before = get<any>('eye_emrs', id);
    const ok = remove('eye_emrs', id);
    if (ok && before) auditDelete({ resource: 'eye_emrs', resourceId: id, before });
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),

  // 7-14) 8 段病史: chiefComplaint/presentIllness/pastHistory/systemicHistory/medication/allergy/familyHistory/socialHistory
  ...['chief-complaint', 'present-illness', 'past-history', 'systemic-history', 'medication', 'allergy', 'family-history', 'social-history'].map((segment) =>
    http.put(`${API_BASE}/emr/records/:id/${segment}`, async ({ params, request }) => {
      await delay(40);
      const id = params.id as string;
      const body = (await request.json()) as any;
      const updated = update<any>('eye_emrs', id, { [segment]: body.content || body, [`${segment}UpdatedAt`]: new Date().toISOString() });
      if (updated) auditUpdate('eye_emrs', updated);
      return HttpResponse.json({ success: true, data: updated });
    })
  ),

  // 15) 眼科检查列表 (裂隙灯/眼底/房角镜等)
  http.get(`${API_BASE}/emr/ophthalmic-exams`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_ophthalmic_exams');
    const result = applyQuery(all, opts, ['examType']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 16) 创建眼科检查
  http.post(`${API_BASE}/emr/ophthalmic-exams`, async ({ request }) => {
    await delay(60);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `OE${Date.now()}`, examDate: body.examDate || new Date().toISOString() };
    create('eye_ophthalmic_exams', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 17) 按患者 + 类型
  http.get(`${API_BASE}/emr/ophthalmic-exams/by-patient/:patientId`, async ({ params, request }) => {
    await delay(40);
    const url = new URL(request.url);
    const examType = url.searchParams.get('examType');
    let all = list<any>('eye_ophthalmic_exams').filter((e: any) => e.patientId === params.patientId);
    if (examType) all = all.filter((e: any) => e.examType === examType);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 18) 视力换算 (Snellen/Decimal/LogMAR/5分)
  http.post(`${API_BASE}/emr/convert-vision`, async ({ request }) => {
    await delay(20);
    const body = (await request.json()) as { value: number; from: string; to: string };
    return HttpResponse.json({ success: true, data: { from: body.value, to: body.value, conversion: `${body.from}->${body.to}` } });
  }),

  // 19) 术前评估列表
  http.get(`${API_BASE}/emr/preop-assessments`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_preop_assessments');
    const result = applyQuery(all, opts, ['patientName']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 20) 创建术前评估
  http.post(`${API_BASE}/emr/preop-assessments`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `POA${Date.now()}`, assessedAt: new Date().toISOString() };
    create('eye_preop_assessments', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 21) 术前评估详情
  http.get(`${API_BASE}/emr/preop-assessments/:id`, async ({ params }) => {
    await delay(40);
    const p = get<any>('eye_preop_assessments', params.id as string);
    if (!p) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: p });
  }),

  // 22) 麻醉评估列表
  http.get(`${API_BASE}/emr/anes-assessments`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_anes_assessments');
    const result = applyQuery(all, opts, ['patientName']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 23) 创建麻醉评估
  http.post(`${API_BASE}/emr/anes-assessments`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `ANES${Date.now()}` };
    create('eye_anes_assessments', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 24) 麻醉评估详情
  http.get(`${API_BASE}/emr/anes-assessments/:id`, async ({ params }) => {
    await delay(40);
    const a = get<any>('eye_anes_assessments', params.id as string);
    if (!a) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: a });
  }),
];

// ============= EyeAiModule (18 端点) =============
const eyeAiModule = [
  // 1) AI 模型列表
  http.get(`${API_BASE}/ai/models`, async ({ request }) => {
    await delay(60);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_ai_models');
    const result = applyQuery(all, opts, ['modelName', 'diseaseCategory']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 2) AI 模型详情
  http.get(`${API_BASE}/ai/models/:id`, async ({ params }) => {
    await delay(40);
    const m = get<any>('eye_ai_models', params.id as string);
    if (!m) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: m });
  }),
  // 3) 注册模型
  http.post(`${API_BASE}/ai/models`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `MDL${Date.now()}` };
    create('eye_ai_models', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 4) 启停模型
  http.put(`${API_BASE}/ai/models/:id/toggle`, async ({ params }) => {
    await delay(40);
    const id = params.id as string;
    const m = get<any>('eye_ai_models', id);
    if (!m) return HttpResponse.json({ success: false }, { status: 404 });
    const updated = update<any>('eye_ai_models', id, { enabled: !m.enabled });
    return HttpResponse.json({ success: true, data: updated });
  }),

  // 5) 推理任务: 创建
  http.post(`${API_BASE}/ai/inferences`, async ({ request }) => {
    await delay(300); // 模拟推理延迟
    const rl = checkRateLimit('eye-ai-inference', { maxPerMinute: 30 });
    if (!rl.allowed) return new HttpResponse('Too Many', { status: 429 });
    const body = (await request.json()) as any;
    const newItem = {
      ...body,
      id: `INF${Date.now()}`,
      status: 'completed',
      confidence: 0.85 + Math.random() * 0.1,
      result: { positive: Math.random() > 0.5, severity: 'mild' },
      inferredAt: new Date().toISOString(),
    };
    create('eye_ai_diagnoses', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 6) 推理列表
  http.get(`${API_BASE}/ai/inferences`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_ai_diagnoses');
    const result = applyQuery(all, opts, ['patientName', 'modelName']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 7) 待审核推理 (静态路径必须在 /:id 之前)
  http.get(`${API_BASE}/ai/inferences/pending`, async () => {
    await delay(40);
    const all = list<any>('eye_ai_diagnoses').filter((i: any) => i.status === 'pending_review' || i.status === 'pending');
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 8) 推理详情
  http.get(`${API_BASE}/ai/inferences/:id`, async ({ params }) => {
    await delay(40);
    const i = get<any>('eye_ai_diagnoses', params.id as string);
    if (!i) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: i });
  }),

  // 9) 热图
  http.get(`${API_BASE}/ai/heatmaps`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_ai_heatmaps');
    const result = applyQuery(all, opts);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 10) 创建热图
  http.post(`${API_BASE}/ai/heatmaps`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `HM${Date.now()}` };
    create('eye_ai_heatmaps', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 11) 热图详情
  http.get(`${API_BASE}/ai/heatmaps/:id`, async ({ params }) => {
    await delay(40);
    const h = get<any>('eye_ai_heatmaps', params.id as string);
    if (!h) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: h });
  }),

  // 12) ROC 指标
  http.get(`${API_BASE}/ai/roc/:modelId`, async ({ params }) => {
    await delay(60);
    return HttpResponse.json({ success: true, data: { modelId: params.modelId, auc: 0.92, sensitivity: 0.89, specificity: 0.94, points: [] } });
  }),
  // 13) 病种分布
  http.get(`${API_BASE}/ai/stats/disease-distribution`, async () => {
    await delay(40);
    const all = list<any>('eye_ai_diagnoses');
    const dist: Record<string, number> = {};
    for (const d of all) {
      const cat = d.diseaseCategory || d.diagnosis || 'unknown';
      dist[cat] = (dist[cat] || 0) + 1;
    }
    return HttpResponse.json({ success: true, data: dist });
  }),
  // 14) 模型对比
  http.get(`${API_BASE}/ai/models/compare`, async () => {
    await delay(50);
    const all = list<any>('eye_ai_models').slice(0, 5);
    return HttpResponse.json({ success: true, data: all });
  }),

  // 15) 医生 override 反馈
  http.post(`${API_BASE}/ai/inferences/:id/override`, async ({ params, request }) => {
    await delay(60);
    const id = params.id as string;
    const body = (await request.json()) as { correctedDiagnosis: string; notes: string };
    const updated = update<any>('eye_ai_diagnoses', id, {
      doctorOverride: body.correctedDiagnosis,
      overrideNotes: body.notes,
      overriddenAt: new Date().toISOString(),
      status: 'reviewed',
    });
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 16) 反馈列表 (用于训练闭环)
  http.get(`${API_BASE}/ai/feedback`, async () => {
    await delay(40);
    const all = list<any>('eye_ai_diagnoses').filter((d: any) => d.doctorOverride);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 17) 训练触发
  http.post(`${API_BASE}/ai/train`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { jobId: `JOB${Date.now()}`, status: 'queued', ...body } });
  }),
  // 18) AI 审计
  http.get(`${API_BASE}/ai/audit`, async () => {
    await delay(40);
    const all = list<any>('eye_ai_diagnoses').slice(-20);
    return HttpResponse.json({ success: true, data: all });
  }),
];

// ============= EyeReportModule (22 端点) =============
const eyeReportModule = [
  // 1) 报告列表
  http.get(`${API_BASE}/report/reports`, async ({ request }) => {
    await delay(60);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_reports');
    const result = applyQuery(all, opts, ['patientName', 'reportType']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 2) 报告详情
  http.get(`${API_BASE}/report/reports/:id`, async ({ params }) => {
    await delay(40);
    const r = get<any>('eye_reports', params.id as string);
    if (!r) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: r });
  }),
  // 3) 创建报告
  http.post(`${API_BASE}/report/reports`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `RPT${Date.now()}`, status: 'draft', createdAt: new Date().toISOString() };
    create('eye_reports', newItem);
    auditCreate('eye_reports', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 4) 更新报告
  http.put(`${API_BASE}/report/reports/:id`, async ({ params, request }) => {
    await delay(60);
    const id = params.id as string;
    const body = (await request.json()) as any;
    const updated = update<any>('eye_reports', id, { ...body, updatedAt: new Date().toISOString() });
    if (updated) auditUpdate('eye_reports', updated);
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 5) 提交报告
  http.post(`${API_BASE}/report/reports/:id/submit`, async ({ params }) => {
    await delay(50);
    const id = params.id as string;
    const updated = update<any>('eye_reports', id, { status: 'submitted', submittedAt: new Date().toISOString() });
    recordWorkflowEvent({ actorId: 'system', actorName: '医生', action: 'submit', entityType: 'eye_reports', entityId: id, fromState: 'draft', toState: 'submitted' });
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 6) 签名报告
  http.post(`${API_BASE}/report/reports/:id/sign`, async ({ params, request }) => {
    await delay(80);
    const id = params.id as string;
    const body = (await request.json()) as { certificateId?: string };
    const updated = update<any>('eye_reports', id, { status: 'signed', signedAt: new Date().toISOString(), signatureHash: 'mock-' + Math.random().toString(36).substring(7) });
    recordWorkflowEvent({ actorId: 'doctor', actorName: '医生', action: 'sign', entityType: 'eye_reports', entityId: id, fromState: 'submitted', toState: 'signed' });
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 7) 草稿列表
  http.get(`${API_BASE}/report/drafts`, async () => {
    await delay(40);
    const all = list<any>('eye_reports').filter((r: any) => r.status === 'draft');
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 8) 保存草稿
  http.post(`${API_BASE}/report/drafts`, async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `DFT${Date.now()}`, status: 'draft', createdAt: new Date().toISOString() };
    create('eye_reports', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 9) 草稿详情
  http.get(`${API_BASE}/report/drafts/:id`, async ({ params }) => {
    await delay(30);
    const d = get<any>('eye_reports', params.id as string);
    if (!d || d.status !== 'draft') return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: d });
  }),
  // 10) 删除草稿
  http.delete(`${API_BASE}/report/drafts/:id`, async ({ params }) => {
    const id = params.id as string;
    const ok = remove('eye_reports', id);
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),

  // 11) 模板列表
  http.get(`${API_BASE}/report/templates`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_report_templates');
    const result = applyQuery(all, opts, ['templateName', 'specialty']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 12) 模板详情
  http.get(`${API_BASE}/report/templates/:id`, async ({ params }) => {
    await delay(30);
    const t = get<any>('eye_report_templates', params.id as string);
    if (!t) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: t });
  }),
  // 13) 创建模板
  http.post(`${API_BASE}/report/templates`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `TPL${Date.now()}` };
    create('eye_report_templates', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 14) 更新模板
  http.put(`${API_BASE}/report/templates/:id`, async ({ params, request }) => {
    await delay(50);
    const id = params.id as string;
    const body = (await request.json()) as any;
    const updated = update<any>('eye_report_templates', id, body);
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 15) 删除模板
  http.delete(`${API_BASE}/report/templates/:id`, async ({ params }) => {
    const id = params.id as string;
    const ok = remove('eye_report_templates', id);
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),
  // 16) 按专科
  http.get(`${API_BASE}/report/templates/by-specialty/:specialty`, async ({ params }) => {
    await delay(40);
    const all = list<any>('eye_report_templates').filter((t: any) => t.specialty === params.specialty);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),

  // 17) 打印记录
  http.get(`${API_BASE}/report/print-records`, async ({ request }) => {
    await delay(40);
    const url = new URL(request.url);
    const reportId = url.searchParams.get('reportId');
    const all = reportId ? [{ reportId, printedAt: new Date().toISOString() }] : [];
    return HttpResponse.json({ success: true, data: all });
  }),
  // 18) 创建打印记录
  http.post(`${API_BASE}/report/print-records`, async ({ request }) => {
    await delay(60);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: `PR${Date.now()}`, ...body, printedAt: new Date().toISOString() } }, { status: 201 });
  }),
  // 19) 报告历史 (按患者)
  http.get(`${API_BASE}/report/reports/history/:patientId`, async ({ params }) => {
    await delay(50);
    const all = list<any>('eye_reports').filter((r: any) => r.patientId === params.patientId);
    return HttpResponse.json({ success: true, data: all });
  }),
  // 20) 危急值触发
  http.post(`${API_BASE}/report/reports/:id/trigger-critical`, async ({ params, request }) => {
    await delay(60);
    const id = params.id as string;
    const body = (await request.json()) as { finding: string };
    const updated = update<any>('eye_reports', id, { criticalValue: body.finding, criticalAt: new Date().toISOString() });
    recordWorkflowEvent({ actorId: 'system', actorName: 'AI', action: 'critical', entityType: 'eye_reports', entityId: id, fromState: 'normal', toState: 'critical', reason: body.finding });
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 21) 双签 (cosign)
  http.post(`${API_BASE}/report/reports/:id/cosign`, async ({ params, request }) => {
    await delay(80);
    const id = params.id as string;
    const body = (await request.json()) as { cosignerId: string };
    const updated = update<any>('eye_reports', id, { cosignedBy: body.cosignerId, cosignedAt: new Date().toISOString(), status: 'cosigned' });
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 22) 导出
  http.post(`${API_BASE}/report/reports/:id/export`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { reportId: params.id, format: 'pdf', url: `data:application/pdf;base64,JVBERi0xLjQK...` } });
  }),
];

// ============= EyeKpiModule (16 端点) =============
const eyeKpiModule = [
  // 1) 6 维 KPI 概览
  http.get(`${API_BASE}/kpi/overview`, async () => {
    await delay(60);
    const all = list<any>('eye_kpis');
    const byCategory: Record<string, any[]> = {};
    for (const k of all) {
      const cat = k.category || k.metricName || 'general';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(k);
    }
    return HttpResponse.json({ success: true, data: { total: all.length, byCategory } });
  }),
  // 2) KPI 详情
  http.get(`${API_BASE}/kpi/metrics/:id`, async ({ params }) => {
    await delay(40);
    const k = get<any>('eye_kpis', params.id as string);
    if (!k) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: k });
  }),
  // 3) 按类别
  http.get(`${API_BASE}/kpi/metrics/by-category/:category`, async ({ params }) => {
    await delay(40);
    const all = list<any>('eye_kpis').filter((k: any) => k.category === params.category || k.metricName === params.category);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 4) 创建 KPI
  http.post(`${API_BASE}/kpi/metrics`, async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `KPI${Date.now()}` };
    create('eye_kpis', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 5) 更新 KPI
  http.put(`${API_BASE}/kpi/metrics/:id`, async ({ params, request }) => {
    await delay(40);
    const id = params.id as string;
    const body = (await request.json()) as any;
    const updated = update<any>('eye_kpis', id, body);
    return HttpResponse.json({ success: true, data: updated });
  }),
  // 6) 删除 KPI
  http.delete(`${API_BASE}/kpi/metrics/:id`, async ({ params }) => {
    const id = params.id as string;
    const ok = remove('eye_kpis', id);
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),

  // 7) 趋势 (按时间)
  http.get(`${API_BASE}/kpi/trend`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric') || 'examCount';
    const days = parseInt(url.searchParams.get('days') || '30');
    const trend = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      value: 50 + Math.floor(Math.random() * 50),
    })).reverse();
    return HttpResponse.json({ success: true, data: trend });
  }),
  // 8) 趋势详情
  http.get(`${API_BASE}/kpi/trend/:metricId`, async ({ params }) => {
    await delay(40);
    const days = 30;
    return HttpResponse.json({ success: true, data: { metricId: params.metricId, points: Array.from({ length: days }, (_, i) => ({ date: `D${i}`, value: Math.random() * 100 })) } });
  }),
  // 9) 趋势预测
  http.post(`${API_BASE}/kpi/trend/predict`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as { metricId: string; days: number };
    return HttpResponse.json({ success: true, data: { metricId: body.metricId, predictions: [], confidence: 0.85 } });
  }),
  // 10) 同比环比
  http.get(`${API_BASE}/kpi/compare`, async ({ request }) => {
    await delay(40);
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric') || 'examCount';
    return HttpResponse.json({ success: true, data: { metric, current: 100, previous: 90, yoy: 110, mom: 95 } });
  }),

  // 11) 医生维度
  http.get(`${API_BASE}/kpi/by-doctor`, async () => {
    await delay(50);
    const doctors = ['D001', 'D002', 'D003', 'D004', 'D005'];
    return HttpResponse.json({ success: true, data: doctors.map(d => ({ doctorId: d, examCount: 50 + Math.random() * 100, avgScore: 85 + Math.random() * 10 })) });
  }),
  // 12) 医生个人 KPI
  http.get(`${API_BASE}/kpi/by-doctor/:doctorId`, async ({ params }) => {
    await delay(40);
    return HttpResponse.json({ success: true, data: { doctorId: params.doctorId, examCount: 120, reportCount: 100, avgTAT: 45 } });
  }),
  // 13) 目标值列表
  http.get(`${API_BASE}/kpi/targets`, async () => {
    await delay(40);
    return HttpResponse.json({ success: true, data: [
      { metric: 'examCount', target: 5000, period: 'monthly' },
      { metric: 'avgScore', target: 90, period: 'monthly' },
    ] });
  }),
  // 14) 设置目标
  http.post(`${API_BASE}/kpi/targets`, async ({ request }) => {
    await delay(40);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: `TGT${Date.now()}`, ...body } }, { status: 201 });
  }),

  // 15) 影像质控指标
  http.get(`${API_BASE}/kpi/quality-metrics`, async () => {
    await delay(50);
    const all = list<any>('eye_quality_metrics');
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 16) 患者满意度
  http.get(`${API_BASE}/kpi/satisfaction`, async () => {
    await delay(40);
    return HttpResponse.json({ success: true, data: { overall: 92, communication: 90, waitingTime: 85, environment: 95, recommendation: 93 } });
  }),
];

// ============= EyeSubspecialtyModule (24 端点 = 8 亚专科 × 3) =============
const SUBSPECIALTY_TYPES = [
  { key: 'strabismus', label: '斜视' },
  { key: 'neuro-ophthalmology', label: '神经眼科' },
  { key: 'ocular-oncology', label: '眼眶肿瘤' },
  { key: 'cornea', label: '角膜病' },
  { key: 'cataract', label: '白内障' },
  { key: 'refractive', label: '屈光手术' },
  { key: 'contact-lens', label: '接触镜' },
  { key: 'low-vision', label: '低视力' },
];

const eyeSubspecialtyModule = SUBSPECIALTY_TYPES.flatMap((sub) => [
  // 1) 列表
  http.get(`${API_BASE}/subspecialty/${sub.key}/records`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_clinical_subspecialties').filter((r: any) => r.subspecialtyType === sub.key);
    const result = applyQuery(all, opts);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 2) 详情
  http.get(`${API_BASE}/subspecialty/${sub.key}/records/:id`, async ({ params }) => {
    await delay(40);
    const r = get<any>('eye_clinical_subspecialties', params.id as string);
    if (!r || r.subspecialtyType !== sub.key) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: r });
  }),
  // 3) 创建
  http.post(`${API_BASE}/subspecialty/${sub.key}/records`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `${sub.key.toUpperCase()}${Date.now()}`, subspecialtyType: sub.key, createdAt: new Date().toISOString() };
    create('eye_clinical_subspecialties', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
]);

// ============= EyePatientJourneyModule (18 端点) =============
const eyePatientJourneyModule = [
  // 1) 患者旅程时间线
  http.get(`${API_BASE}/journey/timeline/:patientId`, async ({ params }) => {
    await delay(60);
    const all = list<any>('eye_journey_events').filter((e: any) => e.patientId === params.patientId);
    const timeline = all.sort((a: any, b: any) => (b.eventDate || b.createdAt || '').localeCompare(a.eventDate || a.createdAt || ''));
    return HttpResponse.json({ success: true, data: timeline, meta: { total: timeline.length } });
  }),
  // 2) 患者旅程总览
  http.get(`${API_BASE}/journey/overview/:patientId`, async ({ params }) => {
    await delay(50);
    const events = list<any>('eye_journey_events').filter((e: any) => e.patientId === params.patientId);
    const byType: Record<string, number> = {};
    for (const e of events) {
      const t = e.eventType || 'other';
      byType[t] = (byType[t] || 0) + 1;
    }
    return HttpResponse.json({ success: true, data: { total: events.length, byType, firstEvent: events[0], lastEvent: events[events.length - 1] } });
  }),
  // 3) 创建事件
  http.post(`${API_BASE}/journey/events`, async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `EVT${Date.now()}`, createdAt: new Date().toISOString() };
    create('eye_journey_events', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 4) 按类型
  http.get(`${API_BASE}/journey/events/by-type/:type`, async ({ params }) => {
    await delay(40);
    const all = list<any>('eye_journey_events').filter((e: any) => e.eventType === params.type);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),

  // 5) 宣教材料列表
  http.get(`${API_BASE}/journey/education`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_education_materials');
    const result = applyQuery(all, opts, ['title', 'category']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 6) 宣教详情
  http.get(`${API_BASE}/journey/education/:id`, async ({ params }) => {
    await delay(30);
    const e = get<any>('eye_education_materials', params.id as string);
    if (!e) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: e });
  }),
  // 7) 创建宣教
  http.post(`${API_BASE}/journey/education`, async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `EDU${Date.now()}` };
    create('eye_education_materials', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 8) 推送宣教给患者
  http.post(`${API_BASE}/journey/education/:id/send`, async ({ params, request }) => {
    await delay(50);
    const body = (await request.json()) as { patientId: string; channel: string };
    return HttpResponse.json({ success: true, data: { educationId: params.id, ...body, sentAt: new Date().toISOString() } });
  }),

  // 9) 保险索赔列表
  http.get(`${API_BASE}/journey/insurance-claims`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const all = list<any>('eye_insurance_claims');
    const result = applyQuery(all, opts, ['patientName', 'claimNo']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  // 10) 创建索赔
  http.post(`${API_BASE}/journey/insurance-claims`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `IC${Date.now()}`, status: 'submitted', submittedAt: new Date().toISOString() };
    create('eye_insurance_claims', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  // 11) 索赔详情
  http.get(`${API_BASE}/journey/insurance-claims/:id`, async ({ params }) => {
    await delay(40);
    const c = get<any>('eye_insurance_claims', params.id as string);
    if (!c) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: c });
  }),

  // 12) 通知模板列表
  http.get(`${API_BASE}/journey/notification-templates`, async () => {
    await delay(40);
    const all = list<any>('eye_schedules').filter((s: any) => s.templateType === 'notification' || s.channel);
    return HttpResponse.json({ success: true, data: all, meta: { total: all.length } });
  }),
  // 13) 发送通知
  http.post(`${API_BASE}/journey/notifications/send`, async ({ request }) => {
    await delay(60);
    const body = (await request.json()) as { patientId: string; templateId: string; channel: string };
    return HttpResponse.json({ success: true, data: { notificationId: `N${Date.now()}`, ...body, sentAt: new Date().toISOString() } }, { status: 201 });
  }),
  // 14) 通知历史
  http.get(`${API_BASE}/journey/notifications/history/:patientId`, async ({ params }) => {
    await delay(40);
    return HttpResponse.json({ success: true, data: [{ patientId: params.patientId, channel: 'sms', sentAt: new Date().toISOString(), status: 'delivered' }] });
  }),

  // 15) 旅程规则
  http.get(`${API_BASE}/journey/rules`, async () => {
    await delay(40);
    return HttpResponse.json({ success: true, data: [
      { ruleId: 'R001', trigger: 'post_surgery', action: 'send_followup_7d' },
      { ruleId: 'R002', trigger: 'critical_value', action: 'notify_doctor_immediately' },
    ] });
  }),
  // 16) 创建规则
  http.post(`${API_BASE}/journey/rules`, async ({ request }) => {
    await delay(40);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { ruleId: `R${Date.now()}`, ...body } }, { status: 201 });
  }),

  // 17) 旅程事件统计
  http.get(`${API_BASE}/journey/stats`, async () => {
    await delay(50);
    const all = list<any>('eye_journey_events');
    const byType: Record<string, number> = {};
    for (const e of all) {
      const t = e.eventType || 'other';
      byType[t] = (byType[t] || 0) + 1;
    }
    return HttpResponse.json({ success: true, data: { total: all.length, byType } });
  }),
  // 18) 端到端旅程状态
  http.get(`${API_BASE}/journey/status/:patientId`, async ({ params }) => {
    await delay(40);
    return HttpResponse.json({ success: true, data: { patientId: params.patientId, currentStage: 'diagnosis', completedSteps: ['screening', 'consultation'], pendingSteps: ['treatment', 'followup'] } });
  }),
];

// ============= RBAC 资源点查询端点 (35 端点外) =============
const eyeRbacModule = [
  // 列出所有 RBAC 资源点
  http.get(`${API_BASE}/rbac/points`, async () => {
    await delay(20);
    return HttpResponse.json({ success: true, data: RBAC_POINTS, meta: { total: RBAC_POINTS.length } });
  }),
  // 角色-资源点映射
  http.get(`${API_BASE}/rbac/role-matrix`, async () => {
    await delay(20);
    return HttpResponse.json({
      success: true,
      data: {
        doctor: RBAC_POINTS.filter(p => !p.includes(':delete') && !p.includes(':train')),
        director: RBAC_POINTS,
        technician: RBAC_POINTS.filter(p => p.startsWith('eye:study:') || p.startsWith('eye:report:read') || p.startsWith('eye:emr:read')),
        nurse: RBAC_POINTS.filter(p => p.includes(':read') || p.startsWith('eye:ris:')),
        admin: RBAC_POINTS,
      },
    });
  }),
];

// ============= [v3.0.6.8-34] PR 1: 真实 DICOM 渲染 + 标注 + DICOM-SR (12 端点) =============
// 对标: ZEISS FORUM DICOM Viewer / Heidelberg HEYEX 2

// 8 模态窗宽窗位预设
const PR1_WINDOWING_PRESETS: Record<string, any[]> = {
  'fundus': [
    { name: '默认', ww: 256, wc: 128, invert: false },
    { name: '视盘', ww: 100, wc: 50, invert: false },
    { name: '黄斑', ww: 200, wc: 100, invert: false },
  ],
  'oct': [
    { name: '默认', ww: 500, wc: 250, invert: false },
    { name: '软组织', ww: 400, wc: 200, invert: false },
    { name: '高对比', ww: 200, wc: 100, invert: false },
  ],
  'octa': [
    { name: '默认', ww: 255, wc: 128, invert: false },
    { name: '浅层', ww: 200, wc: 100, invert: false },
    { name: '深层', ww: 300, wc: 150, invert: false },
  ],
  'ffa': [
    { name: '动脉期', ww: 300, wc: 150, invert: false },
    { name: '静脉期', ww: 350, wc: 180, invert: false },
    { name: '晚期', ww: 400, wc: 200, invert: false },
  ],
  'visualfield': [
    { name: '灰度', ww: 255, wc: 128, invert: true },
    { name: 'TD 模式', ww: 200, wc: 100, invert: false },
  ],
  'topography': [
    { name: '轴向', ww: 80, wc: 40, invert: false },
    { name: '切向', ww: 60, wc: 30, invert: false },
  ],
  'slitlamp': [
    { name: '弥散光', ww: 255, wc: 128, invert: false },
    { name: '裂隙', ww: 180, wc: 90, invert: false },
  ],
  'autofluorescence': [
    { name: '默认', ww: 200, wc: 100, invert: false },
    { name: '高亮', ww: 150, wc: 75, invert: false },
  ],
};

const eyePacsRenderModule = [
  // 1) Viewport 初始化
  http.post(`${API_BASE}/pacs/viewport/init`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as { studyId: string; modality: string; imageIds: string[] };
    return HttpResponse.json({
      success: true,
      data: {
        viewportId: `vp-${body.studyId || 'default'}`,
        studyId: body.studyId,
        modality: body.modality,
        imageCount: body.imageIds?.length || 0,
        engineReady: true,
        renderingBackend: 'cornerstone3d-webgl',
        initializedAt: new Date().toISOString(),
      },
    });
  }),

  // 2) 8 模态窗宽窗位预设
  http.get(`${API_BASE}/pacs/viewport/preset/:modality`, async ({ params }) => {
    await delay(40);
    const m = params.modality as string;
    const presets = PR1_WINDOWING_PRESETS[m] || PR1_WINDOWING_PRESETS['fundus'];
    return HttpResponse.json({ success: true, data: presets, meta: { modality: m, total: presets.length } });
  }),

  // 3) 保存测量
  http.post(`${API_BASE}/pacs/measurement`, async ({ request }) => {
    await delay(60);
    const body = (await request.json()) as any;
    const newItem = {
      id: `M${Date.now()}`,
      studyId: body.studyId,
      measurementType: body.measurementType || 'Length',
      value: body.value || 0,
      unit: body.unit || 'mm',
      coordinates: body.coordinates || [],
      text: body.text,
      createdAt: new Date().toISOString(),
      createdBy: body.createdBy || 'system',
    };
    // 持久化到 IDB (通过内存 store)
    try { create('eye_measurements', newItem); } catch {}
    auditCreate('eye_measurements', newItem);
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),

  // 4) 获取 Study 测量列表
  http.get(`${API_BASE}/pacs/measurement/:studyId`, async ({ params }) => {
    await delay(40);
    const all = list<any>('eye_measurements');
    const filtered = all.filter((m: any) => m.studyId === params.studyId);
    return HttpResponse.json({ success: true, data: filtered, meta: { total: filtered.length } });
  }),

  // 5) 删除测量
  http.delete(`${API_BASE}/pacs/measurement/:id`, async ({ params }) => {
    await delay(40);
    const id = params.id as string;
    const ok = remove('eye_measurements', id);
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),

  // 6) 导出 DICOM-SR (TID 1500)
  http.post(`${API_BASE}/pacs/measurement/export-sr`, async ({ request }) => {
    await delay(120);
    const body = (await request.json()) as { studyId: string; measurements: any[] };
    const sopInstanceUID = `1.2.826.0.1.3680043.8.498.${Date.now()}`;
    const contentSequence = (body.measurements || []).map((m: any, idx: number) => {
      const codeMap: Record<string, string> = {
        Length: '410668003',
        Angle: '408683006',
        Rectangle: '125201',
        Ellipse: '125202',
        Arrow: '410668003',
        TextMarker: '410668003',
        FreehandRoi: '42798000',
      };
      const unitMap: Record<string, string> = {
        mm: 'mm', cm: 'cm', deg: 'deg', 'mm²': 'mm2', px: 'px',
      };
      return {
        relationshipType: 'CONTAINS',
        referencedContentItemIdentifier: idx + 1,
        valueType: 'NUM',
        conceptNameCodeSequence: {
          codeValue: codeMap[m.measurementType || m.type] || '410668003',
          codeMeaning: m.measurementType || m.type,
          codingSchemeDesignator: 'DCM',
        },
        measuredValueSequence: {
          measurementUnitsCodeSequence: {
            codeValue: unitMap[m.unit] || 'mm',
            codeMeaning: m.unit || 'mm',
            codingSchemeDesignator: 'UCUM',
          },
          numericValue: m.value || 0,
        },
      };
    });
    return HttpResponse.json({
      success: true,
      data: {
        sopInstanceUID,
        studyId: body.studyId,
        measurementCount: body.measurements?.length || 0,
        contentSequence,
        url: `data:application/dicom;base64,U0VSVlJ...mock`,
        exportedAt: new Date().toISOString(),
      },
    });
  }),

  // 7) 切换窗宽窗位
  http.post(`${API_BASE}/pacs/windowing/preset`, async ({ request }) => {
    await delay(30);
    const body = (await request.json()) as { studyId: string; preset: string; modality: string };
    const preset = (PR1_WINDOWING_PRESETS[body.modality] || []).find(p => p.name === body.preset);
    return HttpResponse.json({ success: true, data: { preset: preset || null, applied: !!preset } });
  }),

  // 8) 列出所有模态预设
  http.get(`${API_BASE}/pacs/windowing/presets/:modality`, async ({ params }) => {
    await delay(20);
    const m = params.modality as string;
    return HttpResponse.json({ success: true, data: PR1_WINDOWING_PRESETS[m] || [] });
  }),

  // 9) 保存标注
  http.post(`${API_BASE}/pacs/annotation`, async ({ request }) => {
    await delay(40);
    const body = (await request.json()) as any;
    const newItem = {
      id: `AN${Date.now()}`,
      studyId: body.studyId,
      annotationType: body.annotationType || 'TextMarker',
      text: body.text,
      coordinates: body.coordinates || [],
      color: body.color || '#1677ff',
      createdAt: new Date().toISOString(),
      createdBy: body.createdBy || 'system',
    };
    try { create('eye_annotations', newItem); } catch {}
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),

  // 10) 获取 Study 标注列表
  http.get(`${API_BASE}/pacs/annotation/:studyId`, async ({ params }) => {
    await delay(40);
    const all = list<any>('eye_annotations');
    const filtered = all.filter((a: any) => a.studyId === params.studyId);
    return HttpResponse.json({ success: true, data: filtered, meta: { total: filtered.length } });
  }),

  // 11) 删除标注
  http.delete(`${API_BASE}/pacs/annotation/:id`, async ({ params }) => {
    await delay(30);
    const id = params.id as string;
    const ok = remove('eye_annotations', id);
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),

  // 12) 帧加载 (CINE 模式)
  http.post(`${API_BASE}/pacs/frame/load`, async ({ request }) => {
    await delay(20);
    const body = (await request.json()) as { studyId: string; frameIndex: number; totalFrames: number };
    return HttpResponse.json({
      success: true,
      data: {
        studyId: body.studyId,
        currentFrame: body.frameIndex,
        totalFrames: body.totalFrames,
        progress: ((body.frameIndex + 1) / body.totalFrames * 100).toFixed(1) + '%',
        loadedAt: new Date().toISOString(),
      },
    });
  }),
];

// 汇总所有端点
export const eyeHandlers = [
  ...eyeRisModule,
  ...eyePacsModule,
  ...eyeEmrModule,
  ...eyeAiModule,
  ...eyeReportModule,
  ...eyeKpiModule,
  ...eyeSubspecialtyModule,
  ...eyePatientJourneyModule,
  ...eyeRbacModule,
  ...eyePacsRenderModule, // [v3.0.6.8-34] PR 1
];
