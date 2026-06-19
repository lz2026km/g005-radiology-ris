// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 病灶追踪 Mock 数据
// Phase R11 W1: 12 个跨多次研究的病灶(覆盖靶/非靶/新发/已消退)
// 20 升级点:患者分布 / RECIST 趋势 / 治疗反应可视化
// ============================================================

import type { TrackedLesion } from '../../types/measurement';

/**
 * 12 个病灶记录,跨 2-5 次随访,体现 RECIST 1.1 反应类别(CR/PR/SD/PD)。
 *
 * 患者分布:
 * - patient-001 (右肺上叶癌):病灶 #1 / #2 / #3 (已 CR) / #4 (新发 PD)
 * - patient-002 (肝细胞癌):病灶 #5 / #6 (部分 PR)
 * - patient-003 (乳腺癌):病灶 #7 (SD) / #8 (PD 增大)
 * - patient-004 (淋巴瘤):病灶 #9 (CR) / #10
 * - patient-005 (肾癌):病灶 #11 (PR)
 * - patient-006 (胰腺癌):病灶 #12 (新发)
 */
export const LESION_MOCK: TrackedLesion[] = [
  {
    id: 'lesion-001',
    patientId: 'patient-001',
    label: '病灶 #1 · 右肺上叶',
    category: 'target',
    location: { region: 'chest', organ: '肺', subStructure: '右肺上叶尖段', snomedCode: '44029006' },
    baselineDate: '2025-03-15',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.1.20250315.1', acquisitionDate: '2025-03-15', longDiameter: 28, shortDiameter: 22, meanHU: 38, response: undefined },
      { studyInstanceUID: '1.2.840.0.1.1.20250510.1', acquisitionDate: '2025-05-10', longDiameter: 22, shortDiameter: 18, meanHU: 36, response: 'PR' },
      { studyInstanceUID: '1.2.840.0.1.1.20250705.1', acquisitionDate: '2025-07-05', longDiameter: 18, shortDiameter: 14, meanHU: 34, response: 'PR' },
      { studyInstanceUID: '1.2.840.0.1.1.20250901.1', acquisitionDate: '2025-09-01', longDiameter: 14, shortDiameter: 11, meanHU: 32, response: 'PR' },
    ],
    overallResponse: 'PR',
    createdAt: '2025-03-15T09:00:00+08:00',
    createdBy: 'doctor@g005.local',
  },
  {
    id: 'lesion-002',
    patientId: 'patient-001',
    label: '病灶 #2 · 右肺中叶',
    category: 'target',
    location: { region: 'chest', organ: '肺', subStructure: '右肺中叶外侧段' },
    baselineDate: '2025-03-15',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.1.20250315.1', acquisitionDate: '2025-03-15', longDiameter: 16, shortDiameter: 12, meanHU: 32, response: undefined },
      { studyInstanceUID: '1.2.840.0.1.1.20250510.1', acquisitionDate: '2025-05-10', longDiameter: 16, shortDiameter: 12, meanHU: 32, response: 'SD' },
      { studyInstanceUID: '1.2.840.0.1.1.20250705.1', acquisitionDate: '2025-07-05', longDiameter: 15, shortDiameter: 11, meanHU: 33, response: 'SD' },
      { studyInstanceUID: '1.2.840.0.1.1.20250901.1', acquisitionDate: '2025-09-01', longDiameter: 17, shortDiameter: 13, meanHU: 31, response: 'SD' },
    ],
    overallResponse: 'SD',
    createdAt: '2025-03-15T09:05:00+08:00',
    createdBy: 'doctor@g005.local',
  },
  {
    id: 'lesion-003',
    patientId: 'patient-001',
    label: '病灶 #3 · 纵隔淋巴结',
    category: 'non-target',
    location: { region: 'chest', organ: '淋巴', subStructure: '纵隔 4R 区' },
    baselineDate: '2025-03-15',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.1.20250315.1', acquisitionDate: '2025-03-15', longDiameter: 12, shortDiameter: 9, meanHU: 42, response: undefined },
      { studyInstanceUID: '1.2.840.0.1.1.20250510.1', acquisitionDate: '2025-05-10', longDiameter: 6, shortDiameter: 5, meanHU: 40, response: 'PR' },
      { studyInstanceUID: '1.2.840.0.1.1.20250705.1', acquisitionDate: '2025-07-05', longDiameter: 0, meanHU: undefined, response: 'CR' },
      { studyInstanceUID: '1.2.840.0.1.1.20250901.1', acquisitionDate: '2025-09-01', longDiameter: 0, meanHU: undefined, response: 'CR' },
    ],
    overallResponse: 'CR',
    createdAt: '2025-03-15T09:10:00+08:00',
    createdBy: 'doctor@g005.local',
  },
  {
    id: 'lesion-004',
    patientId: 'patient-001',
    label: '病灶 #4 · 新发 · 肝 S6',
    category: 'new',
    location: { region: 'abdomen', organ: '肝', subStructure: '肝 S6 段' },
    baselineDate: '2025-09-01',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.1.20250901.1', acquisitionDate: '2025-09-01', longDiameter: 8, shortDiameter: 7, meanHU: 48, response: 'PD' },
    ],
    overallResponse: 'PD',
    createdAt: '2025-09-01T11:30:00+08:00',
    createdBy: 'doctor@g005.local',
  },
  {
    id: 'lesion-005',
    patientId: 'patient-002',
    label: '病灶 #5 · 肝右叶',
    category: 'target',
    location: { region: 'abdomen', organ: '肝', subStructure: '右肝后下段(S6)' },
    baselineDate: '2025-04-20',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.2.20250420.1', acquisitionDate: '2025-04-20', longDiameter: 42, shortDiameter: 36, volume: 32100, meanHU: 56, response: undefined },
      { studyInstanceUID: '1.2.840.0.1.2.20250715.1', acquisitionDate: '2025-07-15', longDiameter: 32, shortDiameter: 27, volume: 18900, meanHU: 54, response: 'PR' },
      { studyInstanceUID: '1.2.840.0.1.2.20251008.1', acquisitionDate: '2025-10-08', longDiameter: 26, shortDiameter: 21, volume: 12700, meanHU: 52, response: 'PR' },
    ],
    overallResponse: 'PR',
    createdAt: '2025-04-20T14:20:00+08:00',
    createdBy: 'doctor@g005.local',
  },
  {
    id: 'lesion-006',
    patientId: 'patient-002',
    label: '病灶 #6 · 肝左叶',
    category: 'non-target',
    location: { region: 'abdomen', organ: '肝', subStructure: '左肝外叶(S3)' },
    baselineDate: '2025-04-20',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.2.20250420.1', acquisitionDate: '2025-04-20', longDiameter: 18, shortDiameter: 14, meanHU: 50, response: undefined },
      { studyInstanceUID: '1.2.840.0.1.2.20250715.1', acquisitionDate: '2025-07-15', longDiameter: 12, shortDiameter: 9, meanHU: 48, response: 'PR' },
      { studyInstanceUID: '1.2.840.0.1.2.20251008.1', acquisitionDate: '2025-10-08', longDiameter: 8, shortDiameter: 6, meanHU: 46, response: 'PR' },
    ],
    overallResponse: 'PR',
    createdAt: '2025-04-20T14:25:00+08:00',
    createdBy: 'doctor@g005.local',
  },
  {
    id: 'lesion-007',
    patientId: 'patient-003',
    label: '病灶 #7 · 左乳外上',
    category: 'target',
    location: { region: 'chest', organ: '乳腺', subStructure: '左乳外上象限' },
    baselineDate: '2025-02-08',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.3.20250208.1', acquisitionDate: '2025-02-08', longDiameter: 24, shortDiameter: 18, meanHU: 42, response: undefined },
      { studyInstanceUID: '1.2.840.0.1.3.20250512.1', acquisitionDate: '2025-05-12', longDiameter: 23, shortDiameter: 17, meanHU: 41, response: 'SD' },
      { studyInstanceUID: '1.2.840.0.1.3.20250818.1', acquisitionDate: '2025-08-18', longDiameter: 22, shortDiameter: 17, meanHU: 40, response: 'SD' },
      { studyInstanceUID: '1.2.840.0.1.3.20251125.1', acquisitionDate: '2025-11-25', longDiameter: 24, shortDiameter: 18, meanHU: 42, response: 'SD' },
    ],
    overallResponse: 'SD',
    createdAt: '2025-02-08T10:00:00+08:00',
    createdBy: 'doctor@g005.local',
  },
  {
    id: 'lesion-008',
    patientId: 'patient-003',
    label: '病灶 #8 · 腋窝淋巴结',
    category: 'target',
    location: { region: 'chest', organ: '淋巴', subStructure: '左腋窝 Level I' },
    baselineDate: '2025-02-08',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.3.20250208.1', acquisitionDate: '2025-02-08', longDiameter: 15, shortDiameter: 11, meanHU: 38, response: undefined },
      { studyInstanceUID: '1.2.840.0.1.3.20250512.1', acquisitionDate: '2025-05-12', longDiameter: 18, shortDiameter: 13, meanHU: 40, response: 'PD' },
      { studyInstanceUID: '1.2.840.0.1.3.20250818.1', acquisitionDate: '2025-08-18', longDiameter: 22, shortDiameter: 16, meanHU: 42, response: 'PD' },
      { studyInstanceUID: '1.2.840.0.1.3.20251125.1', acquisitionDate: '2025-11-25', longDiameter: 28, shortDiameter: 21, meanHU: 44, response: 'PD' },
    ],
    overallResponse: 'PD',
    createdAt: '2025-02-08T10:10:00+08:00',
    createdBy: 'doctor@g005.local',
  },
  {
    id: 'lesion-009',
    patientId: 'patient-004',
    label: '病灶 #9 · 颈部淋巴结',
    category: 'target',
    location: { region: 'neck', organ: '淋巴', subStructure: '右颈 II 区' },
    baselineDate: '2024-11-10',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.4.20241110.1', acquisitionDate: '2024-11-10', longDiameter: 32, shortDiameter: 24, meanHU: 44, response: undefined },
      { studyInstanceUID: '1.2.840.0.1.4.20250214.1', acquisitionDate: '2025-02-14', longDiameter: 18, shortDiameter: 14, meanHU: 40, response: 'PR' },
      { studyInstanceUID: '1.2.840.0.1.4.20250520.1', acquisitionDate: '2025-05-20', longDiameter: 9, shortDiameter: 7, meanHU: 38, response: 'PR' },
      { studyInstanceUID: '1.2.840.0.1.4.20250826.1', acquisitionDate: '2025-08-26', longDiameter: 0, meanHU: undefined, response: 'CR' },
    ],
    overallResponse: 'CR',
    createdAt: '2024-11-10T15:30:00+08:00',
    createdBy: 'doctor@g005.local',
  },
  {
    id: 'lesion-010',
    patientId: 'patient-004',
    label: '病灶 #10 · 腹主动脉旁',
    category: 'non-target',
    location: { region: 'abdomen', organ: '淋巴', subStructure: '腹主动脉旁' },
    baselineDate: '2024-11-10',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.4.20241110.1', acquisitionDate: '2024-11-10', longDiameter: 22, shortDiameter: 16, meanHU: 41, response: undefined },
      { studyInstanceUID: '1.2.840.0.1.4.20250214.1', acquisitionDate: '2025-02-14', longDiameter: 14, shortDiameter: 10, meanHU: 39, response: 'PR' },
      { studyInstanceUID: '1.2.840.0.1.4.20250520.1', acquisitionDate: '2025-05-20', longDiameter: 8, shortDiameter: 6, meanHU: 37, response: 'PR' },
      { studyInstanceUID: '1.2.840.0.1.4.20250826.1', acquisitionDate: '2025-08-26', longDiameter: 0, meanHU: undefined, response: 'CR' },
    ],
    overallResponse: 'CR',
    createdAt: '2024-11-10T15:35:00+08:00',
    createdBy: 'doctor@g005.local',
  },
  {
    id: 'lesion-011',
    patientId: 'patient-005',
    label: '病灶 #11 · 左肾上极',
    category: 'target',
    location: { region: 'abdomen', organ: '肾', subStructure: '左肾上极' },
    baselineDate: '2025-06-01',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.5.20250601.1', acquisitionDate: '2025-06-01', longDiameter: 38, shortDiameter: 32, volume: 24800, meanHU: 28, response: undefined },
      { studyInstanceUID: '1.2.840.0.1.5.20250905.1', acquisitionDate: '2025-09-05', longDiameter: 26, shortDiameter: 22, volume: 14200, meanHU: 30, response: 'PR' },
      { studyInstanceUID: '1.2.840.0.1.5.20251210.1', acquisitionDate: '2025-12-10', longDiameter: 18, shortDiameter: 15, volume: 8400, meanHU: 32, response: 'PR' },
    ],
    overallResponse: 'PR',
    createdAt: '2025-06-01T11:00:00+08:00',
    createdBy: 'doctor@g005.local',
  },
  {
    id: 'lesion-012',
    patientId: 'patient-006',
    label: '病灶 #12 · 胰尾',
    category: 'new',
    location: { region: 'abdomen', organ: '胰腺', subStructure: '胰尾' },
    baselineDate: '2025-10-15',
    snapshots: [
      { studyInstanceUID: '1.2.840.0.1.6.20251015.1', acquisitionDate: '2025-10-15', longDiameter: 22, shortDiameter: 18, meanHU: 36, response: undefined },
    ],
    overallResponse: undefined,
    createdAt: '2025-10-15T16:45:00+08:00',
    createdBy: 'doctor@g005.local',
  },
];

export const LESION_TOTAL = LESION_MOCK.length;
export const PATIENT_IDS = Array.from(new Set(LESION_MOCK.map((l) => l.patientId)));

export const RESPONSE_DISTRIBUTION = {
  CR: LESION_MOCK.filter((l) => l.overallResponse === 'CR').length,
  PR: LESION_MOCK.filter((l) => l.overallResponse === 'PR').length,
  SD: LESION_MOCK.filter((l) => l.overallResponse === 'SD').length,
  PD: LESION_MOCK.filter((l) => l.overallResponse === 'PD').length,
  NE: LESION_MOCK.filter((l) => l.overallResponse === undefined).length,
};

export const CATEGORY_DISTRIBUTION = {
  target: LESION_MOCK.filter((l) => l.category === 'target').length,
  'non-target': LESION_MOCK.filter((l) => l.category === 'non-target').length,
  new: LESION_MOCK.filter((l) => l.category === 'new').length,
  resolved: LESION_MOCK.filter((l) => l.category === 'resolved').length,
};
