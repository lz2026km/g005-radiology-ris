// [v3.0.6.8-87] 修复 CAD/CAM mock 数据
// 对标: Sirona Cerec + 3Shape Dental Designer

export const MOCK_CAD_DESIGNS = [
  {
    id: 'CAD-001', patientId: 'P100001', patientName: '张伟', toothNo: 16,
    type: 'crown', material: 'zirconia',
    colorShade: 'A2', status: 'designed',
    assignedDentist: '王医生', millingUnit: 'sirona-mcxl',
    createdAt: '2026-06-28T09:00:00Z',
    marginLine: [[180,220],[185,210],[195,200],[210,195],[225,198],[235,210],[238,225],[235,240],[225,250],[210,255],[195,252],[185,240]],
    occlusalAnatomy: 'anatomic', thickness: 1.5, cementGap: 30, contactStrength: 'normal',
    designTime: 420, designer: 'Dr. CAD',
  },
  {
    id: 'CAD-002', patientId: 'P100002', patientName: '李娜', toothNo: 26,
    type: 'inlay', material: 'lithium-disilicate',
    colorShade: 'A1', status: 'milled',
    assignedDentist: '王医生', millingUnit: 'imes-icore',
    createdAt: '2026-06-27T14:30:00Z',
    marginLine: [[200,180],[210,175],[225,172],[240,175],[250,185],[255,200],[250,215],[240,225],[225,228],[210,225],[200,215],[195,200]],
    occlusalAnatomy: 'semi-anatomic', thickness: 2.0, cementGap: 25, contactStrength: 'tight',
    designTime: 380, designer: 'Dr. CAD',
  },
  {
    id: 'CAD-003', patientId: 'P100003', patientName: '王芳', toothNo: 14,
    type: 'veneer', material: 'lithium-disilicate',
    colorShade: 'B1', status: 'cemented',
    assignedDentist: '李医生', millingUnit: null,
    createdAt: '2026-06-25T10:00:00Z',
    marginLine: [[150,230],[160,215],[175,205],[190,200],[205,205],[215,215],[218,230],[215,245],[205,255],[190,258],[175,255],[160,248]],
    occlusalAnatomy: 'anatomic', thickness: 0.8, cementGap: 20, contactStrength: 'light',
    designTime: 290, designer: 'Dr. CAD',
  },
];

export const MOCK_CAD_MATERIALS = [
  { id: 'zirconia', name: '氧化锆', category: 'full-ceramic', shades: ['A1','A2','A3','A3.5','A4','B1','B2','B3','C1','C2','C3','D2','D3','D4'], strength: 1200, translucency: 'opaque', price: 1800 },
  { id: 'lithium-disilicate', name: '二硅酸锂 (e.max)', category: 'full-ceramic', shades: ['A1','A2','A3','A3.5','A4','B1','B2','B3','C1','C2','D2','D3','HO','MO','LO','BL'], strength: 400, translucency: 'high', price: 2500 },
  { id: 'composite', name: '复合树脂', category: 'indirect', shades: ['A1','A2','A3','B1','B2','C2'], strength: 200, translucency: 'medium', price: 800 },
  { id: 'feldspathic', name: '长石瓷', category: 'full-ceramic', shades: ['A1','A2','A3','B1','B2'], strength: 120, translucency: 'very-high', price: 2200 },
  { id: 'pmma', name: 'PMMA (暂冠)', category: 'provisional', shades: ['A1','A2','A3','B1','B2'], strength: 100, translucency: 'medium', price: 300 },
  { id: 'metal', name: '钴铬金属', category: 'metal-ceramic', shades: ['standard'], strength: 1800, translucency: 'opaque', price: 1500 },
  { id: 'titanium', name: '纯钛', category: 'metal', shades: ['standard'], strength: 1400, translucency: 'opaque', price: 2800 },
  { id: 'peek', name: 'PEEK', category: 'polymer', shades: ['tooth','pink'], strength: 180, translucency: 'opaque', price: 2000 },
];

export const MOCK_VITA_SHADES: Record<string, { L: number; a: number; b: number }> = {
  'A1': { L: 68.5, a: -0.5, b: 12.5 }, 'A2': { L: 65.8, a: 0.8, b: 15.2 },
  'A3': { L: 62.1, a: 1.5, b: 18.0 }, 'A3.5': { L: 59.3, a: 2.5, b: 20.5 },
  'A4': { L: 56.5, a: 3.2, b: 22.8 }, 'B1': { L: 69.8, a: -2.5, b: 13.5 },
  'B2': { L: 66.5, a: -1.2, b: 16.0 }, 'B3': { L: 63.0, a: 0.5, b: 19.5 },
  'C1': { L: 64.2, a: 0.0, b: 16.0 }, 'C2': { L: 60.5, a: 1.2, b: 19.5 },
  'C3': { L: 57.8, a: 2.0, b: 22.0 }, 'D2': { L: 62.0, a: -0.5, b: 17.5 },
  'D3': { L: 59.0, a: 0.5, b: 20.0 }, 'D4': { L: 56.0, a: 1.5, b: 22.5 },
};

export const MOCK_MILLING_UNITS = [
  { id: 'sirona-mcxl', name: 'Sirona CEREC MC XL', type: 'wet', axes: 4, materials: ['zirconia','lithium-disilicate','composite','feldspathic'], price: 280000 },
  { id: 'imes-icore', name: 'imes-icore 350i', type: 'dry', axes: 5, materials: ['zirconia','lithium-disilicate','pmma','peek'], price: 350000 },
  { id: 'ceramill', name: 'Amann Girrbach Ceramill Motion 2', type: 'wet-dry', axes: 5, materials: ['zirconia','lithium-disilicate','composite','titanium'], price: 320000 },
  { id: 'custom', name: '外送加工厂', type: 'external', axes: 0, materials: ['zirconia','lithium-disilicate','feldspathic','metal','peek'], price: 0 },
];
