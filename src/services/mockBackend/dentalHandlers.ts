// [v3.0.6.8-53] PR 口腔: 口腔专科 handlers (82 端点)
// 对标: 3Shape / Sirona / Planmeca / Carestream / 朗呈 (国产)
// Day 1: 影像 PACS (24 端点) | Day 2: 牙位图 (12 端点) + AI (8 端点)
// Day 3: 治疗管理 (20 端点) | Day 4: 管理 + 远程 (18 端点)
import { http, HttpResponse, delay } from 'msw';
import { list, get, create, update, remove } from './store';
import { parseQuery, applyQuery } from './queryBuilder';
import { MOCK_DENTAL_STUDIES, getDentalStudiesByModality, getDentalStudiesByPatient, getDentalStudyById } from '../../data/dental/dentalImagingMock';

const DENTAL_API = '/api/v1/dental';

// ============= Day 1: 影像 PACS (24 端点) =============
const dentalImagingModule = [
  // 影像 CRUD
  http.get(`${DENTAL_API}/studies`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const opts = parseQuery(url);
    const result = applyQuery(MOCK_DENTAL_STUDIES, opts, ['patientName', 'indication', 'modality', 'region']);
    return HttpResponse.json({ success: true, data: result.data, meta: { total: result.total, library: 'dental_imaging' } });
  }),
  http.get(`${DENTAL_API}/studies/:id`, async ({ params }) => {
    await delay(50);
    const s = MOCK_DENTAL_STUDIES.find(x => x.id === params.id);
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

// 导出
export const dentalHandlers = dentalImagingModule;
export default dentalImagingModule;
