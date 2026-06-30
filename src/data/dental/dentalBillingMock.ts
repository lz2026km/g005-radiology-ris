// [v3.0.6.8-95] Phase 4: 收费/划价/医保 mock 数据
// 对标: 领健·牙医管家

export const MOCK_FEE_CATALOG = [
  { code: 'D1001', name: '初诊检查费', category: '诊疗费', unitPrice: 50, insuranceType: '甲类', insuranceRatio: 0.8 },
  { code: 'D1002', name: '口腔CBCT（单颌）', category: '放射', unitPrice: 350, insuranceType: '乙类', insuranceRatio: 0.7 },
  { code: 'D1003', name: '全景片', category: '放射', unitPrice: 120, insuranceType: '甲类', insuranceRatio: 0.8 },
  { code: 'D1004', name: '根尖片', category: '放射', unitPrice: 40, insuranceType: '甲类', insuranceRatio: 0.8 },
  { code: 'D2001', name: '树脂充填（单面）', category: '治疗', unitPrice: 300, insuranceType: '乙类', insuranceRatio: 0.6 },
  { code: 'D2002', name: '树脂充填（双面）', category: '治疗', unitPrice: 450, insuranceType: '乙类', insuranceRatio: 0.6 },
  { code: 'D2003', name: '树脂充填（三面）', category: '治疗', unitPrice: 600, insuranceType: '乙类', insuranceRatio: 0.6 },
  { code: 'D2004', name: '根管治疗（前牙）', category: '治疗', unitPrice: 800, insuranceType: '乙类', insuranceRatio: 0.5 },
  { code: 'D2005', name: '根管治疗（前磨牙）', category: '治疗', unitPrice: 1200, insuranceType: '乙类', insuranceRatio: 0.5 },
  { code: 'D2006', name: '根管治疗（磨牙）', category: '治疗', unitPrice: 2000, insuranceType: '乙类', insuranceRatio: 0.5 },
  { code: 'D2007', name: '全口洁牙', category: '治疗', unitPrice: 400, insuranceType: '甲类', insuranceRatio: 0.8 },
  { code: 'D3001', name: '种植体植入术（单颗）', category: '种植', unitPrice: 4000, insuranceType: '丙类', insuranceRatio: 0 },
  { code: 'D3002', name: '种植体（Straumann BLT）', category: '材料', unitPrice: 8000, insuranceType: '丙类', insuranceRatio: 0 },
  { code: 'D3003', name: '种植体（Osstem TS III）', category: '材料', unitPrice: 3500, insuranceType: '丙类', insuranceRatio: 0 },
  { code: 'D3004', name: '种植体（Nobel Active）', category: '材料', unitPrice: 8500, insuranceType: '丙类', insuranceRatio: 0 },
  { code: 'D3005', name: '基台（钛合金）', category: '材料', unitPrice: 1500, insuranceType: '丙类', insuranceRatio: 0 },
  { code: 'D3006', name: '钴铬烤瓷冠', category: '修复', unitPrice: 1800, insuranceType: '乙类', insuranceRatio: 0.5 },
  { code: 'D3007', name: '氧化锆全瓷冠', category: '修复', unitPrice: 3500, insuranceType: '丙类', insuranceRatio: 0 },
  { code: 'D3008', name: 'E-max 贴面', category: '修复', unitPrice: 3000, insuranceType: '丙类', insuranceRatio: 0 },
  { code: 'D4001', name: '正畸初诊设计', category: '正畸', unitPrice: 500, insuranceType: '丙类', insuranceRatio: 0 },
  { code: 'D4002', name: '隐形矫治方案设计', category: '正畸', unitPrice: 2000, insuranceType: '丙类', insuranceRatio: 0 },
  { code: 'D4003', name: '固定矫治器（单颌）', category: '正畸', unitPrice: 8000, insuranceType: '丙类', insuranceRatio: 0 },
  { code: 'D4004', name: '隐形矫治（全口）', category: '正畸', unitPrice: 28000, insuranceType: '丙类', insuranceRatio: 0 },
  { code: 'D5001', name: '局部麻醉费', category: '其他', unitPrice: 50, insuranceType: '甲类', insuranceRatio: 0.8 },
  { code: 'D5002', name: '一次性材料费', category: '材料', unitPrice: 30, insuranceType: '自费', insuranceRatio: 0 },
];

export const MOCK_INVOICES = [
  { id: 'INV-20260628-001', patientId: 'P100001', patientName: '张伟', date: '2026-06-28', items: [
    { code: 'D2002', name: '树脂充填（双面）', qty: 1, unitPrice: 450, toothNo: 16, discount: 0 },
    { code: 'D5001', name: '局部麻醉费', qty: 1, unitPrice: 50, toothNo: 16, discount: 0 },
    { code: 'D5002', name: '一次性材料费', qty: 1, unitPrice: 30, toothNo: 16, discount: 0 },
  ], total: 530, insuranceType: '城镇职工', insuranceCover: 328, selfPay: 202, discountTotal: 0, copay: 10, status: 'paid', paidAt: '2026-06-28T10:30:00Z', paymentMethod: '微信' },
  { id: 'INV-20260625-002', patientId: 'P100001', patientName: '张伟', date: '2026-06-25', items: [
    { code: 'D2006', name: '根管治疗（磨牙）', qty: 1, unitPrice: 2000, toothNo: 36, discount: 0 },
  ], total: 2000, insuranceType: '城镇职工', insuranceCover: 1000, selfPay: 1000, discountTotal: 0, copay: 0, status: 'pending', paidAt: null, paymentMethod: null },
  { id: 'INV-20260620-003', patientId: 'P100003', patientName: '王芳', date: '2026-06-20', items: [
    { code: 'D3001', name: '种植体植入术（单颗）', qty: 1, unitPrice: 4000, toothNo: 46, discount: 500 },
    { code: 'D3002', name: '种植体（Straumann BLT）', qty: 1, unitPrice: 8000, toothNo: 46, discount: 0 },
  ], total: 12000, insuranceType: '城镇职工', insuranceCover: 3000, selfPay: 8500, discountTotal: 500, copay: 0, status: 'paid', paidAt: '2026-06-20T15:00:00Z', paymentMethod: '银行卡' },
  { id: 'INV-20260615-004', patientId: 'P100002', patientName: '李娜', date: '2026-06-15', items: [
    { code: 'D2007', name: '全口洁牙', qty: 1, unitPrice: 400, toothNo: 0, discount: 0 },
  ], total: 400, insuranceType: '城镇居民', insuranceCover: 240, selfPay: 160, discountTotal: 0, copay: 0, status: 'paid', paidAt: '2026-06-15T09:20:00Z', paymentMethod: '支付宝' },
];

export const MOCK_PAYMENT_METHODS = [
  { id: 'cash', name: '现金' }, { id: 'wechat', name: '微信支付' }, { id: 'alipay', name: '支付宝' },
  { id: 'bank-card', name: '银行卡' }, { id: 'medicare', name: '医保卡' }, { id: 'mixed', name: '混合支付' },
];

export const MOCK_PATIENT_INSURANCE = [
  { id: 'INS-001', name: '城镇职工基本医疗保险', type: '职工医保', annualLimit: 30000, used: 12450, balance: 17550 },
  { id: 'INS-002', name: '补充医疗保险', type: '企业补充', annualLimit: 10000, used: 3200, balance: 6800 },
  { id: 'INS-003', name: '商业齿科保险', type: '商业保险', annualLimit: 5000, used: 2000, balance: 3000 },
];
