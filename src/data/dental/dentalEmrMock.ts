// [v3.0.6.8-94] Phase 4: 口腔 360° 患者视图 mock 数据
// 对标: 领健·牙医管家 患者档案

export const MOCK_DENTAL_PATIENTS = [
  {
    id: 'P100001', name: '张伟', gender: 'M', age: 35, phone: '13800138001', idCard: '110101199001011234',
    address: '北京市朝阳区建国路88号', occupation: '软件工程师',
    firstVisit: '2025-03-15', lastVisit: '2026-06-28', totalVisits: 12,
    totalSpent: 28500, insuranceType: '城镇职工',
    allergies: ['青霉素'], systemicDisease: ['高血压'], medications: ['氨氯地平'],
    dentist: '王医生', tags: ['VIP', '种植意向'],
  },
  {
    id: 'P100002', name: '李娜', gender: 'F', age: 28, phone: '13900139002', idCard: '110102199512051234',
    address: '北京市海淀区中关村大街1号', occupation: '教师',
    firstVisit: '2025-08-20', lastVisit: '2026-06-27', totalVisits: 8,
    totalSpent: 18600, insuranceType: '城镇职工',
    allergies: [], systemicDisease: [], medications: [],
    dentist: '李医生', tags: ['正畸'],
  },
  {
    id: 'P100003', name: '王芳', gender: 'F', age: 45, phone: '13700137003', idCard: '110103197812051234',
    address: '上海市浦东新区陆家嘴环路1000号', occupation: '银行经理',
    firstVisit: '2024-11-10', lastVisit: '2026-06-22', totalVisits: 15,
    totalSpent: 52000, insuranceType: '城镇职工',
    allergies: ['磺胺类'], systemicDisease: ['糖尿病'], medications: ['二甲双胍'],
    dentist: '张主任', tags: ['VIP', '种植完成', '定期复查'],
  },
];

export const MOCK_PATIENT_TREATMENT_HISTORY = [
  { id: 'TH-001', date: '2026-06-28', type: 'Restorative', toothNo: 16, description: '树脂充填 MOD', dentist: '王医生', cost: 800, insurancePaid: 400, patientPaid: 400 },
  { id: 'TH-002', date: '2026-06-25', type: 'Endodontic', toothNo: 36, description: '根管治疗 - 已完成', dentist: '王医生', cost: 2500, insurancePaid: 1200, patientPaid: 1300 },
  { id: 'TH-003', date: '2026-06-20', type: 'Implant', toothNo: 36, description: '种植体植入 Straumann BLT 4.1x10', dentist: '张主任', cost: 12000, insurancePaid: 3000, patientPaid: 9000 },
  { id: 'TH-004', date: '2026-06-15', type: 'Periodontal', toothNo: 0, description: '全口洁牙 + 牙周探查', dentist: '李医生', cost: 600, insurancePaid: 300, patientPaid: 300 },
  { id: 'TH-005', date: '2026-06-10', type: 'Examination', toothNo: 0, description: '初诊检查 + CBCT', dentist: '王医生', cost: 1200, insurancePaid: 600, patientPaid: 600 },
];

export const MOCK_PATIENT_APPOINTMENTS = [
  { id: 'APT-001', date: '2026-07-05', time: '09:00', type: '复诊', toothNo: '16', description: '充填后复查', dentist: '王医生', chair: '1号椅', status: 'scheduled' },
  { id: 'APT-002', date: '2026-07-12', time: '14:30', type: '复诊', toothNo: '36', description: '种植二期手术', dentist: '张主任', chair: '1号椅', status: 'scheduled' },
  { id: 'APT-003', date: '2026-06-28', time: '10:00', type: '治疗', toothNo: '26', description: '根管治疗复诊', dentist: '王医生', chair: '2号椅', status: 'completed' },
];

export const MOCK_PATIENT_RECALLS = [
  { id: 'REC-001', date: '2026-08-28', type: '复查', description: '种植术后 2 月复查', status: 'pending', method: 'SMS', sent: false },
  { id: 'REC-002', date: '2026-09-15', type: '洁牙', description: '常规洁牙提醒', status: 'pending', method: 'WeChat', sent: false },
];

export const MOCK_PATIENT_CONSENTS = [
  { id: 'CON-001', date: '2026-06-20', type: '种植手术同意书', signed: true, signedBy: '张伟', witness: '王医生' },
  { id: 'CON-002', date: '2026-05-15', type: 'CBCT 检查知情同意', signed: true, signedBy: '张伟', witness: '技师赵' },
  { id: 'CON-003', date: '2026-06-25', type: '根管治疗同意书', signed: false },
];

export const MOCK_PATIENT_PRESCRIPTIONS = [
  { id: 'RX-001', date: '2026-06-20', drug: '阿莫西林胶囊 0.5g', dosage: '一次一粒 一日三次', days: 7, dentist: '王医生', note: '种植术后抗感染' },
  { id: 'RX-002', date: '2026-06-20', drug: '布洛芬缓释胶囊 0.3g', dosage: '必要时服用', days: 3, dentist: '王医生', note: '止痛' },
  { id: 'RX-003', date: '2026-06-15', drug: '复方氯己定漱口水', dosage: '一日两次 含漱', days: 14, dentist: '李医生', note: '牙周护理' },
];

export const MOCK_PATIENT_BILLING = [
  { id: 'BILL-001', date: '2026-06-28', items: [{ name: '树脂充填 MOD', qty: 1, price: 800 }], total: 800, insurance: 400, selfPay: 400, status: 'paid' },
  { id: 'BILL-002', date: '2026-06-20', items: [{ name: '种植体 Straumann BLT', qty: 1, price: 8000 }, { name: '种植手术费', qty: 1, price: 4000 }], total: 12000, insurance: 3000, selfPay: 9000, status: 'partial' },
  { id: 'BILL-003', date: '2026-06-25', items: [{ name: '根管治疗', qty: 1, price: 2500 }], total: 2500, insurance: 1200, selfPay: 1300, status: 'pending' },
];
