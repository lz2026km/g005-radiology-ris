// [v3.0.6.8-53] PR 口腔: 口腔专科 handlers (82 端点)
// 对标: 3Shape / Sirona / Planmeca / Carestream / 朗呈 (国产)
// Day 1: 影像 PACS (24 端点) | Day 2: 牙位图 (12 端点) + AI (8 端点)
// Day 3: 治疗管理 (20 端点) | Day 4: 管理 + 远程 (18 端点)
import { http, HttpResponse, delay } from 'msw';
import { list, get, create, update, remove } from './store';
import { parseQuery, applyQuery } from './queryBuilder';
import { getDentalChart } from '../../data/dental/dentalChartMock';
import { MOCK_DENTAL_STUDIES, getDentalStudiesByModality, getDentalStudiesByPatient, getDentalStudyById } from '../../data/dental/dentalImagingMock';
import { MOCK_CAD_DESIGNS, MOCK_CAD_MATERIALS, MOCK_VITA_SHADES, MOCK_MILLING_UNITS } from '../../data/dental/dentalCadMock';
import { MOCK_IMPLANT_BRANDS, MOCK_IMPLANT_PLANS_3D, MOCK_NERVE_3D, MOCK_BONE_DENSITY_MAP, MOCK_NERVE_DISTANCES } from '../../data/dental/dentalImplant3dMock';
import { MOCK_SURGICAL_GUIDES, MOCK_GUIDE_SLEEVES, MOCK_ABUTMENT_OPTIONS, MOCK_GUIDE_MATERIALS } from '../../data/dental/dentalGuideMock';
import { MOCK_CEPH_STUDIES, MOCK_LANDMARKS, MOCK_ANALYSIS_TYPES, MOCK_STEINER_ANALYSIS, MOCK_ARCH_ANALYSIS } from '../../data/dental/dentalCephMock';

const DENTAL_API = '/api/v1/dental';

// ============= Day 1: 影像 PACS (24 端点) =============
const dentalImagingModule = [
  // 影像 CRUD
  http.get(`${DENTAL_API}/studies`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const toothNo = url.searchParams.get('toothNo');
    // [v3.0.6.8-81] 优先查 store 中新增的, fallback 到 mock
    let storeItems: any[] = [];
    try { storeItems = list<any>('dental_studies'); } catch {}
    const combined = [...storeItems, ...MOCK_DENTAL_STUDIES];
    const dedup = Array.from(new Map(combined.map(s => [s.id, s])).values());
    let filtered = dedup;
    if (toothNo) {
      const tn = parseInt(toothNo);
      filtered = dedup.filter((s: any) => s.toothNumbers?.includes(tn));
    }
    const result = applyQuery(filtered, opts, ['patientName', 'indication', 'modality', 'region']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total, library: 'dental_imaging' } });
  }),
  http.get(`${DENTAL_API}/studies/:id`, async ({ params }) => {
    await delay(50);
    // [v3.0.6.8-81] 先查 store, fallback mock
    let s: any = null;
    try { s = get<any>('dental_studies', params.id as string); } catch {}
    if (!s) s = MOCK_DENTAL_STUDIES.find(x => x.id === params.id);
    if (!s) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: s });
  }),
  http.post(`${DENTAL_API}/studies`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `STU${Date.now()}`, createdAt: new Date().toISOString() };
    try { create('dental_studies', newItem); } catch {}
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  http.put(`${DENTAL_API}/studies/:id`, async ({ params, request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const updated = update<any>('dental_studies', params.id as string, { ...body, updatedAt: new Date().toISOString() });
    return HttpResponse.json({ success: true, data: updated });
  }),
  http.delete(`${DENTAL_API}/studies/:id`, async ({ params }) => {
    await delay(50);
    const ok = remove('dental_studies', params.id as string);
    return new HttpResponse(null, { status: ok ? 204 : 404 });
  }),
  // 影像路径
  http.get(`${DENTAL_API}/studies/:id/dicom-paths`, async ({ params }) => {
    await delay(30);
    const s = MOCK_DENTAL_STUDIES.find(x => x.id === params.id);
    if (!s) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: { series: [{ path: s.dicomPath, modality: s.modality, instanceCount: s.imageCount }] } });
  }),
  // 分割
  http.get(`${DENTAL_API}/studies/:id/segments`, async ({ params }) => {
    await delay(30);
    const s = MOCK_DENTAL_STUDIES.find(x => x.id === params.id);
    return HttpResponse.json({ success: true, data: { segments: s?.segments || [] } });
  }),
  http.post(`${DENTAL_API}/studies/:id/segment`, async ({ params, request }) => {
    await delay(2000); // 模拟 AI 分割耗时
    const body = (await request.json()) as { model?: string };
    const newSeg = {
      id: `seg-${Date.now()}`,
      type: body.model || 'tooth',
      label: '自动分割结果',
      volume: 100,
      color: '#52c41a',
    };
    // [v3.0.6.8-81] 写回 study.segments
    try {
      const existing = get<any>('dental_studies', params.id as string)
        || MOCK_DENTAL_STUDIES.find(x => x.id === params.id);
      if (existing) {
        const segs = existing.segments || [];
        update<any>('dental_studies', params.id as string, { segments: [...segs, newSeg] });
      }
    } catch {}
    return HttpResponse.json({ success: true, data: newSeg }, { status: 201 });
  }),
  // MPR
  http.get(`${DENTAL_API}/studies/:id/mpr`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({
      success: true,
      data: {
        axes: ['axial', 'sagittal', 'coronal'],
        sliceCount: 100,
        resolution: '512x512',
        format: 'DICOM',
      },
    });
  }),
  // 3D 模型
  http.get(`${DENTAL_API}/studies/:id/3d-model`, async ({ params }) => {
    await delay(200);
    const s = MOCK_DENTAL_STUDIES.find(x => x.id === params.id);
    return HttpResponse.json({
      success: true,
      data: {
        modelUrl: `/api/v1/dental/studies/${params.id}/3d-model.stl`,
        format: s?.modality === 'Scan' ? 'STL' : 'OBJ',
        triangleCount: 50000,
        size: '2.4 MB',
      },
    });
  }),
  // CBCT 专项
  http.get(`${DENTAL_API}/cbct/list`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true, data: getDentalStudiesByModality('CBCT').slice(0, 50) });
  }),
  http.get(`${DENTAL_API}/cbct/:id/nerve-canal`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({
      success: true,
      data: {
        lowerAlveolarNerve: { path: [[100, 200, 50], [105, 210, 55], [110, 220, 60]], diameter: 3.2, safeDistance: 8.5 },
        mentalForamen: { left: { x: 45, y: 180, z: 30 }, right: { x: 155, y: 180, z: 30 } },
      },
    });
  }),
  http.get(`${DENTAL_API}/cbct/:id/bone-density`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: {
        regions: [
          { region: '下颌前牙区', density: 850, unit: 'HU' },
          { region: '下颌后牙区', density: 1100, unit: 'HU' },
          { region: '上颌前牙区', density: 720, unit: 'HU' },
          { region: '上颌后牙区', density: 480, unit: 'HU' },
          { region: '颏部', density: 1450, unit: 'HU' },
        ],
      },
    });
  }),
  http.get(`${DENTAL_API}/cbct/:id/measure`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: {
        measurements: [
          { id: 'meas-1', type: 'distance', label: '缺牙区骨高度', value: 12.5, unit: 'mm' },
          { id: 'meas-2', type: 'distance', label: '下牙槽神经管距牙槽嵴', value: 15.2, unit: 'mm' },
          { id: 'meas-3', type: 'angle', label: '下颌平面角', value: 28.5, unit: '°' },
        ],
      },
    });
  }),
  // 全景片
  http.get(`${DENTAL_API}/panoramic/list`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true, data: getDentalStudiesByModality('Panoramic').slice(0, 50) });
  }),
  http.get(`${DENTAL_API}/panoramic/:id`, async ({ params }) => {
    await delay(30);
    return HttpResponse.json({ success: true, data: MOCK_DENTAL_STUDIES.find(x => x.id === params.id) });
  }),
  // 根尖片
  http.get(`${DENTAL_API}/periapical/list`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true, data: getDentalStudiesByModality('Periapical').slice(0, 50) });
  }),
  http.get(`${DENTAL_API}/periapical/:id`, async ({ params }) => {
    await delay(30);
    return HttpResponse.json({ success: true, data: MOCK_DENTAL_STUDIES.find(x => x.id === params.id) });
  }),
  // 口扫
  http.get(`${DENTAL_API}/scan/list`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true, data: getDentalStudiesByModality('Scan').slice(0, 50) });
  }),
  http.get(`${DENTAL_API}/scan/:id/model`, async ({ params }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { modelUrl: `/api/v1/dental/scan/${params.id}/model.stl`, format: 'STL' } });
  }),
  http.get(`${DENTAL_API}/scan/:id/compare`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({
      success: true,
      data: { differences: { volume: 0.12, surfaceArea: 0.05, toothMovement: [] } },
    });
  }),
  http.post(`${DENTAL_API}/scan/:id/align`, async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as { targetScanId: string };
    return HttpResponse.json({ success: true, data: { aligned: true, targetScanId: body.targetScanId } });
  }),
  // 咬合翼片
  http.get(`${DENTAL_API}/bitewing/list`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true, data: getDentalStudiesByModality('Bitewing').slice(0, 50) });
  }),
  // 影像对比
  http.get(`${DENTAL_API}/compare/:idA/:idB`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: {
        studyA: MOCK_DENTAL_STUDIES.find(x => x.id === params.idA),
        studyB: MOCK_DENTAL_STUDIES.find(x => x.id === params.idB),
        differences: ['36 牙位骨密度变化', '根尖周透亮影增加', '下牙槽神经管位置未变'],
      },
    });
  }),
  // 龋齿 on-image (Day 1 早期 AI)
  http.post(`${DENTAL_API}/ai/caries-onimage`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { imageBase64?: string; toothArea?: string };
    return HttpResponse.json({
      success: true,
      data: {
        detections: [
          { id: 'det-1', toothNo: '16', surface: 'O', bbox: [120, 80, 200, 160], confidence: 0.82, severity: 'moderate' },
          { id: 'det-2', toothNo: '26', surface: 'D', bbox: [340, 100, 410, 170], confidence: 0.75, severity: 'mild' },
        ],
        modelVersion: 'YOLOv8n-dental-v1.2',
        method: 'on-device-onnx',
      },
    });
  }),
];


const FDI_TEETH = [11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28,31,32,33,34,35,36,37,38,41,42,43,44,45,46,47,48];

const dentalChartAiModule = [
  // 获取患者牙位图
  http.get(`${DENTAL_API}/chart/:patientId`, async ({ params }) => {
    await delay(50);
    const chart = list<any>('dental_charts').length > 0 ? get<any>('dental_charts', params.patientId as string) : null;
    if (chart) return HttpResponse.json({ success: true, data: chart });
    // 从 mock 获取
    const mockChart = getDentalChart(params.patientId as string);
    if (mockChart) return HttpResponse.json({ success: true, data: mockChart });
    return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
  }),

  // 更新单牙状态
  http.put(`${DENTAL_API}/chart/:patientId/teeth/:toothNo`, async ({ params, request }) => {
    await delay(40);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { patientId: params.patientId, toothNo: parseInt(params.toothNo as string), ...body, updatedAt: new Date().toISOString() } });
  }),

  // 牙面状态
  http.post(`${DENTAL_API}/chart/:patientId/teeth/:toothNo/surface/:surface`, async ({ params, request }) => {
    await delay(30);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { patientId: params.patientId, toothNo: parseInt(params.toothNo as string), surface: params.surface, ...body } });
  }),

  // 牙周记录
  http.post(`${DENTAL_API}/chart/:patientId/periodontal`, async ({ params, request }) => {
    await delay(50);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { patientId: params.patientId, ...body, recordedAt: new Date().toISOString() } });
  }),

  // 牙位图历史
  http.get(`${DENTAL_API}/chart/:patientId/history`, async ({ params }) => {
    await delay(40);
    return HttpResponse.json({ success: true, data: [getDentalChart(params.patientId as string)].filter(Boolean) });
  }),

  // 牙位图模板
  http.get(`${DENTAL_API}/chart/template`, async () => {
    await delay(20);
    return HttpResponse.json({ success: true, data: FDI_TEETH });
  }),

  // 编号系统
  http.get(`${DENTAL_API}/numbering-systems`, async () => {
    await delay(20);
    return HttpResponse.json({ success: true, data: FDI_TEETH.map(t => ({ fdi: t, universal: t > 50 ? t - 50 : t > 10 ? 32 - t + 10 : t, palmer: t.toString() })) });
  }),

  // 导入牙位图
  http.post(`${DENTAL_API}/chart/:patientId/import`, async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { patientId: params.patientId, imported: Object.keys(body.teeth || {}).length } });
  }),

  // 导出牙位图
  http.get(`${DENTAL_API}/chart/export`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true, data: { url: 'dental-chart-export.csv' } });
  }),

  // 治疗计划 (牙位图关联)
  http.post(`${DENTAL_API}/chart/:patientId/treatment-plan`, async ({ params, request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { planId: `PLAN${Date.now()}`, patientId: params.patientId, ...body } }, { status: 201 });
  }),

  // 复诊安排
  http.get(`${DENTAL_API}/chart/:patientId/followup`, async ({ params }) => {
    await delay(30);
    return HttpResponse.json({ success: true, data: { patientId: params.patientId, followups: [] } });
  }),

  // 删除牙记录
  http.delete(`${DENTAL_API}/chart/:patientId/teeth/:toothNo`, async ({ params }) => {
    await delay(30);
    return new HttpResponse(null, { status: 204 });
  }),

  // 龋齿检测 AI
  http.post(`${DENTAL_API}/ai/caries-detection`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { imageBase64?: string; modality?: string };
    return HttpResponse.json({
      success: true,
      data: {
        detections: [
          { toothNo: '16', surface: 'O', confidence: 0.88, severity: 'moderate', bbox: [100, 80, 180, 150] },
          { toothNo: '36', surface: 'M', confidence: 0.75, severity: 'mild', bbox: [280, 90, 350, 160] },
          { toothNo: '24', surface: 'O', confidence: 0.62, severity: 'incipient', bbox: [200, 70, 260, 140] },
        ],
        analysisTimeMs: 450,
        model: 'dental-yolov8n-v1.3',
        method: 'backend-mock',
      },
    });
  }),

  // 根尖周炎分级 AI
  http.post(`${DENTAL_API}/ai/periapical-grading`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { imageBase64?: string };
    return HttpResponse.json({
      success: true,
      data: {
        periapicalIndex: 2.5,
        rcpScore: 7,
        lesions: [
          { toothNo: '36', region: 'mesial-root', diameter: 4.2, unit: 'mm', stage: 'RCP-stage-2' },
        ],
        confidence: 0.82,
      },
    });
  }),

  // 牙周骨丧失测量 AI
  http.post(`${DENTAL_API}/ai/bone-loss`, async ({ request }) => {
    await delay(350);
    const body = (await request.json()) as { imageBase64?: string };
    return HttpResponse.json({
      success: true,
      data: {
        boneLoss: { maxilla: 15, mandible: 22, unit: '%' },
        furcationInvolvements: ['36-buccal', '37-mesial'],
        confidence: 0.78,
      },
    });
  }),

  // 根管检测 AI
  http.post(`${DENTAL_API}/ai/root-canal-detection`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { imageBase64?: string };
    return HttpResponse.json({
      success: true,
      data: {
        canals: [
          { toothNo: '36', canalCount: 3, filled: 2, missed: 'mesiolingual', difficulty: 'moderate' },
          { toothNo: '46', canalCount: 2, filled: 2, missed: null, difficulty: 'easy' },
        ],
      },
    });
  }),

  // 口腔黏膜筛查 AI
  http.post(`${DENTAL_API}/ai/oral-cavity-screening`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { imageBase64?: string };
    return HttpResponse.json({
      success: true,
      data: {
        findings: [
          { location: '左侧颊黏膜', type: 'leukoplakia', probability: 0.72, risk: 'moderate' },
          { location: '舌腹', type: 'normal', probability: 0.91, risk: 'low' },
        ],
      },
    });
  }),

  // AI 模型列表
  http.get(`${DENTAL_API}/ai/models`, async () => {
    await delay(30);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'dental-yolov8n-v1.3', name: '龋齿检测', type: 'object-detection', accuracy: 0.76, version: '1.3', dataset: '3000 根尖片' },
        { id: 'dental-periapical-v1.0', name: '根尖周炎分级', type: 'classification', accuracy: 0.81, version: '1.0', dataset: '1200 CBCT' },
        { id: 'dental-bone-loss-v1.0', name: '牙周骨丧失', type: 'segmentation', accuracy: 0.72, version: '1.0', dataset: '800 全景片' },
      ],
    });
  }),

  // AI 检测历史
  http.get(`${DENTAL_API}/ai/history/:patientId`, async ({ params }) => {
    await delay(30);
    return HttpResponse.json({ success: true, data: { patientId: params.patientId, history: [] } });
  }),

  // AI 反馈
  http.post(`${DENTAL_API}/ai/feedback`, async ({ request }) => {
    await delay(30);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { feedbackId: `FB${Date.now()}`, ...body, receivedAt: new Date().toISOString() } });
  }),
];

import { MOCK_DENTAL_TREATMENTS } from '../../data/dental/dentalTreatmentMock';

// ============= Day 3: 治疗管理 (20 端点) =============
const dentalTreatmentModule = [
  // 治疗列表
  http.get(`${DENTAL_API}/treatments`, async ({ request }) => {
    await delay(60);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const result = applyQuery(MOCK_DENTAL_TREATMENTS, opts, ['patientName', 'diagnosis', 'type']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total } });
  }),
  http.get(`${DENTAL_API}/treatments/:id`, async ({ params }) => {
    await delay(40);
    const t = MOCK_DENTAL_TREATMENTS.find(x => x.id === params.id) || get<any>('dental_treatments', params.id as string);
    if (!t) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: t });
  }),
  http.post(`${DENTAL_API}/treatments`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    const newItem = { ...body, id: body.id || `TREAT${Date.now()}`, createdAt: new Date().toISOString() };
    try { create('dental_treatments', newItem); } catch {}
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),
  http.put(`${DENTAL_API}/treatments/:id`, async ({ params, request }) => {
    await delay(60);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: params.id, ...body, updatedAt: new Date().toISOString() } });
  }),
  http.post(`${DENTAL_API}/treatments/:id/start`, async ({ params }) => {
    await delay(40);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'InProgress', startedAt: new Date().toISOString() } });
  }),
  http.post(`${DENTAL_API}/treatments/:id/complete`, async ({ params }) => {
    await delay(40);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'Completed', completedAt: new Date().toISOString() } });
  }),
  http.post(`${DENTAL_API}/treatments/:id/approve`, async ({ params, request }) => {
    await delay(40);
    const body = (await request.json().catch(() => ({}))) as any;
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'Approved', ...body } });
  }),
  http.post(`${DENTAL_API}/treatments/:id/insurance`, async ({ params, request }) => {
    await delay(60);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: params.id, ...body, insuranceApproved: true } });
  }),
  http.get(`${DENTAL_API}/treatments/:id/cost`, async ({ params }) => {
    await delay(30);
    const t = MOCK_DENTAL_TREATMENTS.find(x => x.id === params.id);
    return HttpResponse.json({ success: true, data: { total: t?.cost || 1000, insuranceCoverage: t?.insuranceCoverage || 70, patientShare: ((t?.cost || 1000) * (1 - (t?.insuranceCoverage || 70) / 100)).toFixed(0) } });
  }),
  http.get(`${DENTAL_API}/treatments/types`, async () => {
    await delay(20);
    return HttpResponse.json({ success: true, data: ['Restorative','Endodontic','Periodontal','Implant','Orthodontic','Extraction','Surgery','Pediatric'] });
  }),
  http.get(`${DENTAL_API}/treatments/:id/consent`, async ({ params }) => {
    await delay(40);
    return HttpResponse.json({ success: true, data: { id: params.id, content: '知情同意书内容', signed: true, signedAt: new Date().toISOString() } });
  }),
  http.post(`${DENTAL_API}/treatments/:id/recall`, async ({ params, request }) => {
    await delay(40);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: params.id, ...body, recallDate: body.recallDate || new Date().toISOString() } });
  }),
  http.get(`${DENTAL_API}/implant/plans`, async ({ request }) => {
    await delay(50);
    return HttpResponse.json({ success: true, data: MOCK_DENTAL_TREATMENTS.filter(t => t.type === 'Implant').slice(0, 20) });
  }),
  http.post(`${DENTAL_API}/implant/plans`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { planId: `IMPL${Date.now()}`, ...body, createdAt: new Date().toISOString() } }, { status: 201 });
  }),
  http.get(`${DENTAL_API}/implant/plans/:id`, async ({ params }) => {
    await delay(40);
    return HttpResponse.json({ success: true, data: { id: params.id, type: 'Implant', manufacturer: 'Straumann BLT', fixtureLength: 10, fixtureDiameter: 4.1, abutment: 'RC' } });
  }),
  http.put(`${DENTAL_API}/implant/plans/:id/guide`, async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: params.id, guideUrl: `/dental/guides/${params.id}.stl`, ...body } });
  }),
  http.get(`${DENTAL_API}/ortho/plans`, async ({ request }) => {
    await delay(50);
    return HttpResponse.json({ success: true, data: MOCK_DENTAL_TREATMENTS.filter(t => t.type === 'Orthodontic').slice(0, 10) });
  }),
  http.post(`${DENTAL_API}/ortho/plans`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { planId: `ORTHO${Date.now()}`, ...body } }, { status: 201 });
  }),
  http.get(`${DENTAL_API}/ortho/plans/:id/progress`, async ({ params }) => {
    await delay(40);
    return HttpResponse.json({ success: true, data: { id: params.id, currentStage: 8, totalStages: 20, progress: 0.4 } });
  }),
  http.post(`${DENTAL_API}/endodontic/treatments`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: `ENDO${Date.now()}`, ...body } }, { status: 201 });
  }),
];

// [v3.0.6.8-87] Phase 1: 修复 CAD/CAM (15 端点) =============
const dentalCadModule = [
  // 材料列表
  http.get(`${DENTAL_API}/cad/materials`, async () => {
    await delay(30);
    return HttpResponse.json({ success: true, data: MOCK_CAD_MATERIALS });
  }),
  // VITA 比色板
  http.get(`${DENTAL_API}/cad/shades`, async () => {
    await delay(20);
    return HttpResponse.json({ success: true, data: MOCK_VITA_SHADES });
  }),
  // 研磨机列表
  http.get(`${DENTAL_API}/cad/milling-units`, async () => {
    await delay(20);
    return HttpResponse.json({ success: true, data: MOCK_MILLING_UNITS });
  }),
  // 开始设计
  http.post(`${DENTAL_API}/cad/design`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    const newDesign = {
      id: `CAD-${Date.now()}`,
      ...body,
      marginLine: Array.from({length:12},(_,i)=>[200+Math.sin(i/12*Math.PI*2)*30,200+Math.cos(i/12*Math.PI*2)*30]),
      occlusalAnatomy: 'anatomic', thickness: 1.5, cementGap: 30, contactStrength: 'normal',
      status: 'draft', designTime: 0, designer: 'Dr. CAD',
      createdAt: new Date().toISOString(),
    };
    try { create('cad_designs', newDesign); } catch {}
    return HttpResponse.json({ success: true, data: newDesign }, { status: 201 });
  }),
  // 获取设计
  http.get(`${DENTAL_API}/cad/design/:id`, async ({ params }) => {
    await delay(40);
    let d: any = null;
    try { d = get<any>('cad_designs', params.id as string); } catch {}
    if (!d) d = MOCK_CAD_DESIGNS.find(x => x.id === params.id);
    if (!d) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: d });
  }),
  // 设计列表
  http.get(`${DENTAL_API}/cad/designs`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const patientId = url.searchParams.get('patientId');
    let list = MOCK_CAD_DESIGNS;
    try { list = [...list, ...list<any>('cad_designs')]; } catch {}
    if (patientId) list = list.filter((d: any) => d.patientId === patientId);
    return HttpResponse.json({ success: true, data: list });
  }),
  // 保存边缘线
  http.put(`${DENTAL_API}/cad/design/:id/margin-line`, async ({ params, request }) => {
    await delay(60);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: params.id, marginLine: body.marginLine, updatedAt: new Date().toISOString() } });
  }),
  // 保存解剖形态参数
  http.put(`${DENTAL_API}/cad/design/:id/anatomy`, async ({ params, request }) => {
    await delay(40);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: params.id, ...body, updatedAt: new Date().toISOString() } });
  }),
  // 生成 3D 预览
  http.post(`${DENTAL_API}/cad/design/:id/preview`, async ({ params }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        previewUrl: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
        stlUrl: `/api/v1/dental/cad/design/${params.id}/model.stl`,
        triangleCount: 18500,
        volume: 0.28,
        facets: ['occlusal','buccal','lingual','mesial','distal'].map(f => ({ facet: f, quality: 'good' })),
      },
    });
  }),
  // 导出 STL
  http.post(`${DENTAL_API}/cad/design/:id/export-stl`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { url: `/api/v1/dental/cad/design/${params.id}/model.stl`, format: 'STL', size: '1.2 MB' } });
  }),
  // 更新设计状态
  http.put(`${DENTAL_API}/cad/design/:id/status`, async ({ params, request }) => {
    await delay(40);
    const body = (await request.json()) as { status: string };
    return HttpResponse.json({ success: true, data: { id: params.id, status: body.status, updatedAt: new Date().toISOString() } });
  }),
  // 提交研磨
  http.post(`${DENTAL_API}/cad/design/:id/submit-mill`, async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as { millingUnit: string };
    return HttpResponse.json({
      success: true,
      data: { id: params.id, millingUnit: body.millingUnit, submittedAt: new Date().toISOString(), estimatedTime: '15min', status: 'milling' },
    });
  }),
  // 研磨状态查询
  http.get(`${DENTAL_API}/cad/milling-status/:id`, async ({ params }) => {
    await delay(20);
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'in-progress', progress: 65, estimatedRemaining: '5min', errors: [] },
    });
  }),
  // 设计模板列表
  http.get(`${DENTAL_API}/cad/templates`, async () => {
    await delay(30);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'tpl-1', name: '标准全冠 (前磨牙)', type: 'crown', anatomy: 'anatomic', thickness: 1.5 },
        { id: 'tpl-2', name: '标准全冠 (磨牙)', type: 'crown', anatomy: 'semi-anatomic', thickness: 1.5 },
        { id: 'tpl-3', name: '嵌体 MOD 预备型', type: 'inlay', anatomy: 'semi-anatomic', thickness: 2.0 },
        { id: 'tpl-4', name: '贴面 (前牙)', type: 'veneer', anatomy: 'anatomic', thickness: 0.8 },
      ],
    });
  }),
];

// [v3.0.6.8-88] Phase 1: 种植 3D 规划 (12 端点)
const dentalImplant3dModule = [
  // 种植体品牌/型号库
  http.get(`${DENTAL_API}/implant/inventory/brands`, async () => {
    await delay(30);
    return HttpResponse.json({ success: true, data: MOCK_IMPLANT_BRANDS.map(b=>({id:b.id,name:b.name,country:b.country,modelCount:b.models.length})) });
  }),
  http.get(`${DENTAL_API}/implant/inventory/models`, async ({ request }) => {
    await delay(40);
    const url = new URL(request.url);
    const brandId = url.searchParams.get('brandId');
    const toothNo = parseInt(url.searchParams.get('toothNo') || '0');
    let brands = MOCK_IMPLANT_BRANDS;
    if (brandId) brands = brands.filter(b => b.id === brandId);
    const models = brands.flatMap(b => b.models.map(m => ({ ...m, brand: b.id, brandName: b.name })));
    return HttpResponse.json({ success: true, data: models });
  }),
  // 3D 种植规划 CRUD
  http.post(`${DENTAL_API}/implant/plan-3d`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    const newPlan = {
      id: `IMP3D-${Date.now()}`,
      ...body,
      entryPoint: { x: 150, y: 120, z: 80 },
      apexPoint: { x: 148, y: 109, z: 30 },
      distanceToNerve: 3.5, boneDensityAtApex: 800,
      status: 'planning', guideDesigned: false,
      createdAt: new Date().toISOString(),
    };
    try { create('implant_plans_3d', newPlan); } catch {}
    return HttpResponse.json({ success: true, data: newPlan }, { status: 201 });
  }),
  http.get(`${DENTAL_API}/implant/plan-3d/:id`, async ({ params }) => {
    await delay(40);
    let p: any = null;
    try { p = get<any>('implant_plans_3d', params.id as string); } catch {}
    if (!p) p = MOCK_IMPLANT_PLANS_3D.find(x => x.id === params.id);
    if (!p) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: p });
  }),
  http.get(`${DENTAL_API}/implant/plan-3d`, async () => {
    await delay(50);
    let list: any[] = [];
    try { list = list<any>('implant_plans_3d'); } catch {}
    return HttpResponse.json({ success: true, data: [...list, ...MOCK_IMPLANT_PLANS_3D] });
  }),
  http.put(`${DENTAL_API}/implant/plan-3d/:id/placement`, async ({ params, request }) => {
    await delay(60);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: params.id, ...body, updatedAt: new Date().toISOString() } });
  }),
  http.put(`${DENTAL_API}/implant/plan-3d/:id/implant`, async ({ params, request }) => {
    await delay(50);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: params.id, brand: body.brand, model: body.model, updatedAt: new Date().toISOString() } });
  }),
  http.get(`${DENTAL_API}/implant/plan-3d/:id/nerve-distance`, async ({ params }) => {
    await delay(50);
    const plan = MOCK_IMPLANT_PLANS_3D.find(x => x.id === params.id);
    return HttpResponse.json({
      success: true,
      data: {
        distances: MOCK_NERVE_DISTANCES,
        nervePath: MOCK_NERVE_3D,
        closestNerve: { distance: plan?.distanceToNerve || 3.2, safe: (plan?.distanceToNerve || 3.2) > 2, position: { x: 150, y: 115, z: 35 } },
      },
    });
  }),
  http.post(`${DENTAL_API}/implant/plan-3d/:id/bone-density-roi`, async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    return HttpResponse.json({
      success: true,
      data: {
        studyId: params.id,
        roi: body.roi || { x: 145, y: 110, z: 30, radius: 3 },
        ...MOCK_BONE_DENSITY_MAP,
      },
    });
  }),
  http.post(`${DENTAL_API}/implant/plan-3d/:id/nerve-mark`, async ({ params, request }) => {
    await delay(60);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { planId: params.id, markedPoints: body.points } });
  }),
  http.post(`${DENTAL_API}/implant/plan-3d/:id/validate`, async ({ params }) => {
    await delay(150);
    return HttpResponse.json({
      success: true,
      data: { valid: true, collision: false, minDistanceToNerve: 3.2, warnings: [], decisions: [ { key: '36 distal bone', action: '注意远中骨量', severity: 'info' } ] },
    });
  }),
  http.post(`${DENTAL_API}/implant/plan-3d/:id/approve`, async ({ params }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { id: params.id, status: 'approved', approvedAt: new Date().toISOString() } });
  }),
];

// [v3.0.6.8-89] Phase 1: 导板 + 上部 + 种植体库 (8 端点)
const dentalGuideModule = [
  http.get(`${DENTAL_API}/implant/inventory/sleeves`, async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const brand = url.searchParams.get('brand');
    let list = MOCK_GUIDE_SLEEVES;
    if (brand) list = list.filter(s => s.brand === brand);
    return HttpResponse.json({ success: true, data: list });
  }),
  http.get(`${DENTAL_API}/implant/abutments`, async ({ request }) => {
    await delay(30);
    const url = new URL(request.url);
    const brand = url.searchParams.get('brand');
    let list = MOCK_ABUTMENT_OPTIONS;
    if (brand) list = list.filter(a => a.brand === brand);
    return HttpResponse.json({ success: true, data: list });
  }),
  http.get(`${DENTAL_API}/guide/materials`, async () => {
    await delay(20);
    return HttpResponse.json({ success: true, data: MOCK_GUIDE_MATERIALS });
  }),
  http.get(`${DENTAL_API}/guide/list`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true, data: MOCK_SURGICAL_GUIDES });
  }),
  http.post(`${DENTAL_API}/guide`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    const newGuide = { id: `GUIDE-${Date.now()}`, ...body, status: 'designing', createdAt: new Date().toISOString() };
    try { create('surgical_guides', newGuide); } catch {}
    return HttpResponse.json({ success: true, data: newGuide }, { status: 201 });
  }),
  http.put(`${DENTAL_API}/guide/:id/sleeve`, async ({ params, request }) => {
    await delay(40);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: params.id, sleeve: body.sleeveType } });
  }),
  http.post(`${DENTAL_API}/guide/:id/export`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { url: `/dental/guides/${params.id}.stl`, format: 'STL', size: '3.5 MB', estimatedPrintTime: '4h' } });
  }),
  http.get(`${DENTAL_API}/implant/inventory/price-check`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const brand = url.searchParams.get('brand');
    const models = url.searchParams.get('models')?.split(',') || [];
    return HttpResponse.json({ success: true, data: models.map(m => {
      const item = MOCK_IMPLANT_BRANDS.flatMap(b => b.models).find(mo => mo.id === m);
      return { modelId: m, brand, price: item?.price || 0 };
    })     });
  }),
];

// [v3.0.6.8-90] Phase 2: 头影测量分析 (12 端点)
const dentalCephModule = [
  http.get(`${DENTAL_API}/ceph/studies`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const pid = url.searchParams.get('patientId');
    let list = MOCK_CEPH_STUDIES;
    if (pid) list = list.filter(s => s.patientId === pid);
    return HttpResponse.json({ success: true, data: list });
  }),
  http.get(`${DENTAL_API}/ceph/studies/:id`, async ({ params }) => {
    await delay(30);
    const s = MOCK_CEPH_STUDIES.find(x => x.id === params.id);
    if (!s) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: s });
  }),
  http.post(`${DENTAL_API}/ceph/studies`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as any;
    const newStudy = { id: `CEPH-${Date.now()}`, ...body, status: 'pending', acquisitionDate: new Date().toISOString().slice(0,10) };
    try { create('ceph_studies', newStudy); } catch {}
    return HttpResponse.json({ success: true, data: newStudy }, { status: 201 });
  }),
  http.get(`${DENTAL_API}/ceph/landmarks`, async () => {
    await delay(30);
    return HttpResponse.json({ success: true, data: MOCK_LANDMARKS });
  }),
  http.put(`${DENTAL_API}/ceph/:id/landmarks`, async ({ params, request }) => {
    await delay(60);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { studyId: params.id, landmarks: body.landmarks, updatedAt: new Date().toISOString() } });
  }),
  http.get(`${DENTAL_API}/ceph/:id/analysis`, async ({ params }) => {
    await delay(80);
    const study = MOCK_CEPH_STUDIES.find(x => x.id === params.id);
    if (!study || !study.analysisType) return HttpResponse.json({ success: false }, { status: 404 });
    return HttpResponse.json({ success: true, data: { ...MOCK_STEINER_ANALYSIS, analysisType: study.analysisType, studyId: params.id } });
  }),
  http.get(`${DENTAL_API}/ceph/analysis-types`, async () => {
    await delay(20);
    return HttpResponse.json({ success: true, data: MOCK_ANALYSIS_TYPES });
  }),
  http.post(`${DENTAL_API}/ceph/:id/analysis`, async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as { type: string };
    return HttpResponse.json({ success: true, data: { studyId: params.id, ...MOCK_STEINER_ANALYSIS, analysisType: body.type || 'steiner', performedAt: new Date().toISOString() } });
  }),
  http.post(`${DENTAL_API}/ceph/:id/vto`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json({ success: true, data: { studyId: params.id, vtoUrl: 'data:image/png;base64,VTO_DUMMY', prediction: '治疗后侧貌改善, 唇部前突减少 2mm' } });
  }),
  http.get(`${DENTAL_API}/ceph/patient/:pid/history`, async ({ params }) => {
    await delay(50);
    return HttpResponse.json({ success: true, data: MOCK_CEPH_STUDIES.filter(s => s.patientId === params.pid) });
  }),
  // 牙弓分析
  http.post(`${DENTAL_API}/ortho/arch-analysis`, async ({ request }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: MOCK_ARCH_ANALYSIS });
  }),
  http.post(`${DENTAL_API}/ortho/space-analysis`, async ({ request }) => {
    await delay(80);
    return HttpResponse.json({ success: true, data: { ...MOCK_ARCH_ANALYSIS.discrepancy, analysisType: 'space-analysis' } });
  }),
];

// ============= Day 4: 管理 + 远程 (18 端点) =============
const dentalManagementModule = [
  http.get(`${DENTAL_API}/patients`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    return HttpResponse.json({ success: true, data: MOCK_DENTAL_TREATMENTS.slice(0, 50).map(t => ({ id: t.patientId, name: t.patientName })), meta: { total: 200 } });
  }),
  http.get(`${DENTAL_API}/patients/:id`, async ({ params }) => {
    await delay(30);
    return HttpResponse.json({ success: true, data: { id: params.id, name: '患者姓名', age: 35, phone: '13800000000' } });
  }),
  http.post(`${DENTAL_API}/patients`, async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: `P${Date.now()}`, ...body } }, { status: 201 });
  }),
  http.put(`${DENTAL_API}/patients/:id`, async ({ params, request }) => {
    await delay(40);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: params.id, ...body } });
  }),
  http.get(`${DENTAL_API}/recalls`, async ({ request }) => {
    await delay(40);
    return HttpResponse.json({ success: true, data: MOCK_DENTAL_TREATMENTS.slice(0, 20).map(t => ({ id: t.id, patientId: t.patientId, patientName: t.patientName, recallDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(), type: 'Routine', sent: Math.random() > 0.5 })) });
  }),
  http.post(`${DENTAL_API}/recalls/:id/send`, async ({ params }) => {
    await delay(30);
    return HttpResponse.json({ success: true, data: { id: params.id, sent: true, sentAt: new Date().toISOString() } });
  }),
  http.get(`${DENTAL_API}/consents`, async () => {
    await delay(30);
    return HttpResponse.json({ success: true, data: [{ id: 'consent-1', title: '根管治疗知情同意书', version: 'v1.0', createdAt: new Date().toISOString() }] });
  }),
  http.post(`${DENTAL_API}/consents`, async ({ request }) => {
    await delay(40);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { id: `consent-${Date.now()}`, ...body } }, { status: 201 });
  }),
  http.post(`${DENTAL_API}/consents/:id/sign`, async ({ params }) => {
    await delay(40);
    return HttpResponse.json({ success: true, data: { id: params.id, signed: true, signedAt: new Date().toISOString() } });
  }),
  http.get(`${DENTAL_API}/inventory`, async () => {
    await delay(30);
    return HttpResponse.json({ success: true, data: [
      { id: 'inv-1', name: '3M Filtek Z350 树脂 (A2)', category: 'Filling', stock: 45, unit: '支', minStock: 10 },
      { id: 'inv-2', name: 'Straumann BLT 种植体 RC 4.1x10mm', category: 'Implant', stock: 12, unit: '颗', minStock: 5 },
      { id: 'inv-3', name: 'ProTaper Gold 根管锉', category: 'Endo', stock: 8, unit: '盒', minStock: 3 },
      { id: 'inv-4', name: 'E-max CAD 瓷块 HT A2', category: 'Restorative', stock: 3, unit: '块', minStock: 5 },
    ] });
  }),
  http.post(`${DENTAL_API}/inventory/use`, async ({ request }) => {
    await delay(30);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { ...body, used: true, usedAt: new Date().toISOString() } });
  }),
  http.get(`${DENTAL_API}/stats`, async () => {
    await delay(40);
    return HttpResponse.json({ success: true, data: { todayPatients: 12, thisWeek: 58, avgPerDay: 10, revenueToday: 18500, topTreatments: { Restorative: 25, Endodontic: 15, Extraction: 10, Implant: 5 } } });
  }),
  http.post(`${DENTAL_API}/tele/sessions`, async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, data: { sessionId: `TEL${Date.now()}`, ...body, createdAt: new Date().toISOString() } });
  }),
  http.get(`${DENTAL_API}/tele/sessions`, async () => {
    await delay(30);
    return HttpResponse.json({ success: true, data: [] });
  }),
  http.post(`${DENTAL_API}/tele/upload`, async ({ request }) => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { fileId: `FILE${Date.now()}`, status: 'received' } });
  }),
  http.post(`${DENTAL_API}/tele/ai-screen`, async ({ request }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { triage: 'routine', findings: '未见异常', confidence: 0.85 } });
  }),
  http.get(`${DENTAL_API}/tele/experts`, async () => {
    await delay(30);
    return HttpResponse.json({ success: true, data: [{ id: 'exp-1', name: '王专家', specialty: '种植', hospital: '省口腔医院' }] });
  }),
];

// 合并所有模块
export const dentalHandlers = [
  ...dentalImagingModule,
  ...dentalChartAiModule,
  ...dentalTreatmentModule,
  ...dentalCadModule, // [v3.0.6.8-87] Phase 1: 修复 CAD/CAM
  ...dentalImplant3dModule, // [v3.0.6.8-88] Phase 1: 种植 3D 规划
  ...dentalGuideModule, // [v3.0.6.8-89] Phase 1: 导板+上部+种植体库
  ...dentalCephModule, // [v3.0.6.8-90] Phase 2: 头影测量分析
  ...dentalManagementModule,
];
export default dentalHandlers;
