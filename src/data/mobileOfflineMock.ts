/**
 * G005 放射RIS系统 v3.0.6.6 - 移动端离线缓存 Mock 数据
 * 10 升级点:20+ 缓存项(患者/报告/影像元数据/工作列表/模板)
 */

import type { MobileCacheEntry } from '../types/mobile';

const now = new Date();
const future = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();
const past = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

interface MockSeed {
  id: string;
  key: string;
  category: MobileCacheEntry['category'];
  data: unknown;
  priority: number;
  accessCount?: number;
  sizeBytes: number;
}

const SEEDS: MockSeed[] = [
  {
    id: 'c-001', key: 'patient:P001', category: 'patient', priority: 9, sizeBytes: 1024,
    data: { id: 'P001', name: '张志刚', gender: '男', age: 62, idCard: '310101196205121234', phone: '138****5678', lastVisit: '2026-06-15' },
  },
  {
    id: 'c-002', key: 'patient:P002', category: 'patient', priority: 8, sizeBytes: 980,
    data: { id: 'P002', name: '李秀英', gender: '女', age: 55, idCard: '310101197103154567', phone: '139****1234', lastVisit: '2026-06-14' },
  },
  {
    id: 'c-003', key: 'patient:P003', category: 'patient', priority: 7, sizeBytes: 920,
    data: { id: 'P003', name: '王建军', gender: '男', age: 45, idCard: '310101198107238901', phone: '136****5678', lastVisit: '2026-06-13' },
  },
  {
    id: 'c-004', key: 'report:R001', category: 'report', priority: 10, sizeBytes: 4500,
    data: { id: 'R001', examId: 'E001', accessionNumber: '20260615001', status: 'signed', impression: '胸部CT平扫未见明显异常', signedTime: past(120) },
  },
  {
    id: 'c-005', key: 'report:R002', category: 'report', priority: 9, sizeBytes: 4800,
    data: { id: 'R002', examId: 'E002', accessionNumber: '20260615002', status: 'preliminary', impression: '颅脑MR平扫,双侧基底节区腔隙灶', signedTime: past(45) },
  },
  {
    id: 'c-006', key: 'report:R003', category: 'report', priority: 8, sizeBytes: 4200,
    data: { id: 'R003', examId: 'E003', accessionNumber: '20260615003', status: 'draft', impression: '腹部CT增强,肝右叶低密度灶,建议增强扫描', signedTime: undefined },
  },
  {
    id: 'c-007', key: 'image:meta:S001', category: 'image', priority: 6, sizeBytes: 3200,
    data: { seriesId: 'S001', studyUid: '1.2.840.0.1.17.0.1.1', instanceCount: 128, modality: 'CT', bodyPart: '胸部', cachedSlices: 32, totalSizeMB: 56 },
  },
  {
    id: 'c-008', key: 'image:meta:S002', category: 'image', priority: 5, sizeBytes: 2800,
    data: { seriesId: 'S002', studyUid: '1.2.840.0.1.17.0.1.2', instanceCount: 256, modality: 'CT', bodyPart: '腹部', cachedSlices: 0, totalSizeMB: 112 },
  },
  {
    id: 'c-009', key: 'worklist:doctor', category: 'worklist', priority: 10, sizeBytes: 6800,
    data: { items: 12, lastUpdated: past(15), pendingReports: 12, urgentCases: 3, criticalCases: 1 },
  },
  {
    id: 'c-010', key: 'worklist:nurse', category: 'worklist', priority: 9, sizeBytes: 5400,
    data: { items: 8, lastUpdated: past(8), scheduledToday: 28, contrastPending: 5, completedToday: 23 },
  },
  {
    id: 'c-011', key: 'worklist:tech', category: 'worklist', priority: 9, sizeBytes: 5100,
    data: { items: 6, lastUpdated: past(3), activeExams: 2, queueDepth: 4, avgExamMin: 18 },
  },
  {
    id: 'c-012', key: 'template:T001', category: 'template', priority: 7, sizeBytes: 3400,
    data: { id: 'T001', name: '胸部CT平扫模板', modality: 'CT', bodyPart: '胸部', usageCount: 1248, sections: ['所见', '诊断意见'] },
  },
  {
    id: 'c-013', key: 'template:T002', category: 'template', priority: 6, sizeBytes: 3100,
    data: { id: 'T002', name: '颅脑MR平扫模板', modality: 'MR', bodyPart: '头颅', usageCount: 956, sections: ['所见', '诊断意见'] },
  },
  {
    id: 'c-014', key: 'template:T003', category: 'template', priority: 6, sizeBytes: 2900,
    data: { id: 'T003', name: '腹部CT增强模板', modality: 'CT', bodyPart: '腹部', usageCount: 723, sections: ['平扫所见', '增强所见', '诊断意见'] },
  },
  {
    id: 'c-015', key: 'protocol:P001', category: 'protocol', priority: 5, sizeBytes: 2200,
    data: { id: 'P001', name: '胸部低剂量CT', kVp: 120, mA: 80, sliceThickness: 1.0, contrast: false, indications: ['肺癌筛查', '体检'] },
  },
  {
    id: 'c-016', key: 'protocol:P002', category: 'protocol', priority: 4, sizeBytes: 2400,
    data: { id: 'P002', name: '颅脑MR平扫', sequences: ['T1', 'T2', 'FLAIR', 'DWI'], contrast: false, avgDurationMin: 22 },
  },
  {
    id: 'c-017', key: 'reference:R001', category: 'reference', priority: 3, sizeBytes: 8400,
    data: { title: '肺部影像术语标准(Lung-RADS)', version: '2022', pages: 28, lastReviewed: '2025-09-10' },
  },
  {
    id: 'c-018', key: 'reference:R002', category: 'reference', priority: 3, sizeBytes: 7600,
    data: { title: 'BI-RADS 乳腺影像词典', version: '5th', pages: 32, lastReviewed: '2025-08-15' },
  },
  {
    id: 'c-019', key: 'patient:P004', category: 'patient', priority: 6, sizeBytes: 940,
    data: { id: 'P004', name: '赵敏', gender: '女', age: 34, idCard: '310101199203042345', phone: '135****9876', lastVisit: '2026-06-12' },
  },
  {
    id: 'c-020', key: 'patient:P005', category: 'patient', priority: 6, sizeBytes: 900,
    data: { id: 'P005', name: '陈国强', gender: '男', age: 71, idCard: '310101195405127890', phone: '134****5432', lastVisit: '2026-06-12' },
  },
  {
    id: 'c-021', key: 'report:R004', category: 'report', priority: 7, sizeBytes: 4600,
    data: { id: 'R004', examId: 'E004', accessionNumber: '20260615004', status: 'signed', impression: '胸部DR正位,心肺膈未见明显异常', signedTime: past(360) },
  },
  {
    id: 'c-022', key: 'worklist:patient:张三', category: 'worklist', priority: 8, sizeBytes: 1200,
    data: { patientId: 'P001', unreadReports: 1, upcomingExams: 0, lastReportAt: past(120) },
  },
];

export const MOBILE_OFFLINE_CACHE: MobileCacheEntry[] = SEEDS.map(seed => ({
  id: seed.id,
  key: seed.key,
  category: seed.category,
  data: seed.data,
  metadata: {
    version: 1,
    cachedAt: past(60 + seed.accessCount ?? 0),
    expiresAt: future(7),
    lastAccessedAt: past(5 + (seed.accessCount ?? 0) * 2),
    accessCount: seed.accessCount ?? Math.floor(Math.random() * 20) + 1,
    sizeBytes: seed.sizeBytes,
    priority: seed.priority,
  },
  syncStatus: 'clean',
}));

export const MOBILE_OFFLINE_QUEUE: Array<{
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  capturedAt: string;
  status: 'pending' | 'syncing' | 'failed' | 'conflict';
  attempts: number;
  summary: string;
}> = [
  { id: 'q-001', entityType: 'report', entityId: 'R006', operation: 'update', capturedAt: past(15), status: 'pending', attempts: 0, summary: '修改报告意见:补充肝右叶结节描述' },
  { id: 'q-002', entityType: 'patient', entityId: 'P006', operation: 'update', capturedAt: past(22), status: 'pending', attempts: 0, summary: '更新联系电话' },
  { id: 'q-003', entityType: 'image', entityId: 'IMG-128', operation: 'create', capturedAt: past(30), status: 'pending', attempts: 0, summary: '新增标注:左肺下叶磨玻璃影' },
  { id: 'q-004', entityType: 'medication', entityId: 'M001', operation: 'create', capturedAt: past(45), status: 'failed', attempts: 3, summary: '记录用药:碘海醇100ml' },
  { id: 'q-005', entityType: 'report', entityId: 'R007', operation: 'update', capturedAt: past(60), status: 'conflict', attempts: 1, summary: '报告意见冲突,需手动解决' },
  { id: 'q-006', entityType: 'study', entityId: 'S005', operation: 'update', capturedAt: past(90), status: 'pending', attempts: 0, summary: '更新检查状态:已完成' },
  { id: 'q-007', entityType: 'note', entityId: 'N001', operation: 'create', capturedAt: past(120), status: 'pending', attempts: 0, summary: '新增随访备注' },
  { id: 'q-008', entityType: 'report', entityId: 'R008', operation: 'create', capturedAt: past(180), status: 'syncing', attempts: 1, summary: '新建报告:头颅MR平扫' },
];

export const MOBILE_OFFLINE_CONFLICTS: Array<{
  id: string;
  entityType: string;
  entityId: string;
  field: string;
  localValue: string;
  serverValue: string;
  localTime: string;
  serverTime: string;
  localUser: string;
  serverUser: string;
}> = [
  {
    id: 'cf-001',
    entityType: 'report',
    entityId: 'R007',
    field: 'impression',
    localValue: '肝右叶低密度灶,考虑血管瘤可能',
    serverValue: '肝右叶低密度灶,转移瘤待排,建议增强',
    localTime: past(60),
    serverTime: past(40),
    localUser: '李医生',
    serverUser: '王医生',
  },
  {
    id: 'cf-002',
    entityType: 'patient',
    entityId: 'P003',
    field: 'phone',
    localValue: '136****5678',
    serverValue: '136****9999',
    localTime: past(180),
    serverTime: past(150),
    localUser: '护士站',
    serverUser: '前台',
  },
];
