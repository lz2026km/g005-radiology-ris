// [v3.0.6.8-89] 导板 + 种植上部 mock 数据

export const MOCK_SURGICAL_GUIDES = [
  {
    id: 'GUIDE-001', plan3dId: 'IMP3D-002', toothNo: 46,
    type: 'fully-guided', material: 'resin-print',
    sleeveBrand: 'straumann', sleeveType: 'RC-4.3',
    guideFile: '/dental/guides/GUIDE-001.stl',
    fixationPin: true, windowForBone: false,
    status: 'designed', createdBy: 'Dr. Chen',
    createdAt: '2026-06-27T15:00:00Z',
    patientName: 'Li Na',
  },
  {
    id: 'GUIDE-002', plan3dId: 'IMP3D-001', toothNo: 36,
    type: 'partially-guided', material: 'resin-print',
    sleeveBrand: 'straumann', sleeveType: 'BLT-RC-4.1',
    guideFile: null,
    fixationPin: true, windowForBone: false,
    status: 'designing', createdBy: 'Dr. Wang',
    createdAt: '2026-06-28T10:30:00Z',
    patientName: 'Zhang Wei',
  },
];

export const MOCK_GUIDE_SLEEVES = [
  { brand: 'straumann', type: 'BLT-RC-3.3', diameter: 3.5, height: 5.0, compatible: ['BLT-RC-3.3x8','BLT-RC-3.3x10','BLT-RC-3.3x12','BLT-RC-3.3x14'] },
  { brand: 'straumann', type: 'BLT-RC-4.1', diameter: 4.3, height: 5.0, compatible: ['BLT-RC-4.1x8','BLT-RC-4.1x10','BLT-RC-4.1x12','BLT-RC-4.1x14'] },
  { brand: 'straumann', type: 'BLT-RC-4.8', diameter: 5.0, height: 5.0, compatible: ['BLT-RC-4.8x6','BLT-RC-4.8x8','BLT-RC-4.8x10','BLT-RC-4.8x12'] },
  { brand: 'nobel', type: 'NP-RP-3.5', diameter: 3.8, height: 5.0, compatible: ['NP-RP-3.5x8','NP-RP-3.5x10','NP-RP-3.5x13','NP-RP-3.5x16'] },
  { brand: 'nobel', type: 'NP-RP-4.3', diameter: 4.5, height: 5.0, compatible: ['NP-RP-4.3x8','NP-RP-4.3x10','NP-RP-4.3x13','NP-RP-4.3x16'] },
  { brand: 'nobel', type: 'NP-RP-5.0', diameter: 5.2, height: 5.0, compatible: ['NP-RP-5.0x8','NP-RP-5.0x10','NP-RP-5.0x13','NP-RP-5.0x16'] },
  { brand: 'osstem', type: 'IS-4.0', diameter: 4.2, height: 5.0, compatible: ['TS-III-4.0x8.5','TS-III-4.0x10','TS-III-4.0x11.5','TS-III-4.0x13'] },
  { brand: 'osstem', type: 'IS-4.5', diameter: 4.7, height: 5.0, compatible: ['TS-III-4.5x8.5','TS-III-4.5x10','TS-III-4.5x11.5','TS-III-4.5x13'] },
  { brand: 'neobiotech', type: 'NR-4.0', diameter: 4.2, height: 5.0, compatible: ['NR-4.0x8','NR-4.0x10','NR-4.0x12','NR-4.0x14'] },
];

export const MOCK_ABUTMENT_OPTIONS = [
  { id: 'AB-001', brand: 'straumann', type: 'titanium-base', material: 'titanium-grade-23', compatibleWith: ['BLT-RC-4.1','BLT-RC-4.8'], price: 800, angle: 0 },
  { id: 'AB-002', brand: 'straumann', type: 'ti-base-angled', material: 'titanium-grade-23', compatibleWith: ['BLT-RC-4.1','BLT-RC-4.8'], price: 1200, angle: 17 },
  { id: 'AB-003', brand: 'straumann', type: 'custom-zirconia', material: 'zirconia-3y', compatibleWith: ['BLT-RC-4.1','BLT-RC-4.8'], price: 2500, angle: 0 },
  { id: 'AB-004', brand: 'straumann', type: 'prefab-titanium', material: 'titanium', compatibleWith: ['SP-BB-4.1'], price: 600, angle: 0 },
  { id: 'AB-005', brand: 'nobel', type: 'conical-base', material: 'titanium', compatibleWith: ['NP-RP-4.3','NP-RP-5.0'], price: 950, angle: 0 },
  { id: 'AB-006', brand: 'nobel', type: 'multi-unit', material: 'titanium', compatibleWith: ['NP-RP-4.3','NP-RP-5.0','NP-RP-3.5'], price: 1500, angle: 30 },
  { id: 'AB-007', brand: 'nobel', type: 'custom-zirconia', material: 'zirconia-5y', compatibleWith: ['AC-4.3','CC-4.3'], price: 2800, angle: 0 },
  { id: 'AB-008', brand: 'osstem', type: 'internal-hex-base', material: 'titanium', compatibleWith: ['TS-III-4.0','TS-III-4.5','TS-III-5.0'], price: 500, angle: 0 },
  { id: 'AB-009', brand: 'neobiotech', type: 'conical-base', material: 'titanium', compatibleWith: ['NR-4.0','NR-4.5'], price: 450, angle: 0 },
];

export const MOCK_GUIDE_MATERIALS = [
  { id: 'resin-print', name: '树脂 3D 打印', type: 'additive', price: 800, accuracy: '0.1mm', color: 'transparent-orange' },
  { id: 'resin-mold', name: '树脂压膜', type: 'vacuum-form', price: 300, accuracy: '0.3mm', color: 'transparent' },
  { id: 'metal-laser', name: '金属激光烧结 (钛)', type: 'additive', price: 2500, accuracy: '0.05mm', color: 'silver' },
];
