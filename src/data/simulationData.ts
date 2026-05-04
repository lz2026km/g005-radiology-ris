// @ts-nocheck
// G005 放射科RIS系统 - 模拟数据 v1.0.0
// 包含：预约记录、医保审核、患者随访、设备维保合同、临床数据同步、影像会诊

import { generateId, formatDate, addDays } from './simulationStore'

// ==================== 类型定义 ====================
export interface AppointmentRecord {
  id: string
  patientId: string
  patientName: string
  gender: '男' | '女'
  age: number
  phone: string
  idCard: string
  examItemId: string
  examItemName: string
  modality: 'CT' | 'MR' | 'DR' | 'DSA' | '乳腺钼靶' | 'PET-CT' | 'SPECT-CT'
  bodyPart: string
  examDate: string
  examTime: string
  deviceId: string
  deviceName: string
  roomId: string
  roomName: string
  referringDoctorId: string
  referringDoctorName: string
  clinicalDiagnosis: string
  notes: string
  status: '待确认' | '已确认' | '已报到' | '已检查' | '已取消' | '旷到'
  priority: '普通' | '紧急' | '危重'
  registrationType: '门诊' | '住院' | '体检' | '急诊'
  createdAt: string
}

export interface InsuranceAuditRecord {
  id: string
  patientName: string
  patientId: string
  examType: 'CT增强' | 'MRI增强' | 'DSA手术'
  examItem: string
  drugName: string
  drugCategory: 'CT对比剂' | 'MRI对比剂' | '抗凝药物'
  drugSpec: string
  restriction: string
  reason: string
  submitTime: string
  submitDept: string
  urgency: '高' | '中' | '低'
  result?: '通过' | '拒绝' | '补充资料'
  auditor?: string
  auditTime?: string
  auditNotes?: string
}

export interface FollowUpRecord {
  id: string
  patientId: string
  patientName: string
  gender: '男' | '女'
  age: number
  phone: string
  examType: string
  examItemName: string
  examDate: string
  followUpType: '对比剂反应' | '肿瘤复查' | '早期肺癌跟踪' | '治疗评估' | '术后复查' | '介入治疗后评估'
  nextFollowUpDate: string
  status: '待随访' | '进行中' | '已完成' | '逾期'
  reaction?: '无反应' | '轻度' | '中度' | '重度'
  notes: string
  referringDoctor: string
  department: string
  createdAt: string
}

export interface DeviceMaintenanceContract {
  id: string
  contractNo: string
  deviceId: string
  deviceName: string
  deviceModel: string
  serialNumber: string
  company: string
  contactPerson: string
  contactTel: string
  startDate: string
  endDate: string
  amount: number
  paymentStatus: '已付款' | '待付款' | '已逾期'
  coverage: string
  serviceLevel: '标准' | '高级' | '白金'
  renewHistory: { year: number; amount: number; status: string }[]
  createdAt: string
}

export interface ClinicalSyncRecord {
  id: string
  systemName: string
  systemCode: string
  recordType: string
  patientId: string
  patientName: string
  dataContent: string
  syncTime: string
  status: '同步中' | '已同步' | '失败' | '待同步'
  errorMessage?: string
  retryCount: number
  lastRetryTime?: string
  dataVolume: string
  sourceDept: string
}

export interface ConsultationRecord {
  id: string
  consultationNo: string
  patientName: string
  patientId: string
  gender: '男' | '女'
  age: number
  examType: string
  examItemName: string
  requestDept: string
  requestDoctor: string
  targetHospital?: string
  targetDoctor?: string
  consultationType: 'MDT' | '疑难病例' | '远程会诊' | '二次意见'
  urgency: '紧急' | '普通'
  status: '待回复' | '已回复' | '已拒绝' | '进行中' | '已完成'
  requestTime: string
  completedTime?: string
  diagnosis?: string
  opinion?: string
  remarks?: string
}

// ==================== 20条预约记录 ====================
const today = new Date()
export const APPOINTMENT_RECORDS: AppointmentRecord[] = [
  {
    id: 'APT-001', patientId: 'P202600001', patientName: '张伟', gender: '男', age: 45, phone: '138****1234',
    idCard: '110101197801011234', examItemId: 'EI-CT-001', examItemName: '胸部CT平扫', modality: 'CT', bodyPart: '胸部',
    examDate: formatDate(today), examTime: '08:30', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）',
    roomId: 'ROOM-CT1', roomName: 'CT室1', referringDoctorId: 'D001', referringDoctorName: '李建国',
    clinicalDiagnosis: '咳嗽待查', notes: '需空腹', status: '已确认', priority: '普通',
    registrationType: '门诊', createdAt: '2026-05-01 10:00:00'
  },
  {
    id: 'APT-002', patientId: 'P202600002', patientName: '王芳', gender: '女', age: 38, phone: '139****5678',
    idCard: '310101198801023456', examItemId: 'EI-MR-001', examItemName: '头颅MRI平扫', modality: 'MR', bodyPart: '头颅',
    examDate: formatDate(today), examTime: '09:00', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）',
    roomId: 'ROOM-MR1', roomName: 'MR室1', referringDoctorId: 'D002', referringDoctorName: '赵红',
    clinicalDiagnosis: '头痛头晕', notes: '有金属假牙', status: '已报到', priority: '紧急',
    registrationType: '门诊', createdAt: '2026-05-01 11:30:00'
  },
  {
    id: 'APT-003', patientId: 'P202600003', patientName: '李明', gender: '男', age: 62, phone: '137****9012',
    idCard: '440101196401039012', examItemId: 'EI-CT-002', examItemName: '腹部CT增强', modality: 'CT', bodyPart: '腹部',
    examDate: formatDate(today), examTime: '10:00', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）',
    roomId: 'ROOM-CT1', roomName: 'CT室1', referringDoctorId: 'D003', referringDoctorName: '孙强',
    clinicalDiagnosis: '肝占位待查', notes: '需家属陪同', status: '待确认', priority: '危重',
    registrationType: '住院', createdAt: '2026-05-01 14:00:00'
  },
  {
    id: 'APT-004', patientId: 'P202600004', patientName: '刘洋', gender: '女', age: 28, phone: '136****3456',
    idCard: '510101199801043456', examItemId: 'EI-MR-002', examItemName: '乳腺MRI增强', modality: 'MR', bodyPart: '胸部',
    examDate: formatDate(addDays(today, 1)), examTime: '14:00', deviceId: 'DEV-MR-02', deviceName: 'MR-2（飞利浦Ingenia）',
    roomId: 'ROOM-MR2', roomName: 'MR室2', referringDoctorId: 'D004', referringDoctorName: '周婷',
    clinicalDiagnosis: '乳腺结节复查', notes: '月经结束后检查', status: '已确认', priority: '普通',
    registrationType: '门诊', createdAt: '2026-05-01 15:30:00'
  },
  {
    id: 'APT-005', patientId: 'P202600005', patientName: '陈静', gender: '女', age: 55, phone: '135****7890',
    idCard: '320101197101057890', examItemId: 'EI-DR-001', examItemName: '腰椎正侧位', modality: 'DR', bodyPart: '脊柱',
    examDate: formatDate(today), examTime: '11:00', deviceId: 'DEV-DR-01', deviceName: 'DR-1（飞利浦DigitalDiagnost）',
    roomId: 'ROOM-DR1', roomName: 'DR室1', referringDoctorId: 'D005', referringDoctorName: '吴磊',
    clinicalDiagnosis: '腰痛待查', notes: '', status: '已检查', priority: '普通',
    registrationType: '门诊', createdAt: '2026-05-01 08:00:00'
  },
  {
    id: 'APT-006', patientId: 'P202600006', patientName: '杨勇', gender: '男', age: 71, phone: '133****2345',
    idCard: '210101195501022345', examItemId: 'EI-DS-001', examItemName: '冠脉造影', modality: 'DSA', bodyPart: '心脏',
    examDate: formatDate(addDays(today, 2)), examTime: '08:00', deviceId: 'DEV-DSA-01', deviceName: 'DSA-1（飞利浦Azurion 7）',
    roomId: 'ROOM-DSA1', roomName: 'DSA室1', referringDoctorId: 'D006', referringDoctorName: '郑浩',
    clinicalDiagnosis: '冠心病待排', notes: '需术前检查', status: '已确认', priority: '紧急',
    registrationType: '住院', createdAt: '2026-05-02 09:00:00'
  },
  {
    id: 'APT-007', patientId: 'P202600007', patientName: '赵磊', gender: '男', age: 42, phone: '132****6789',
    idCard: '440301198401036789', examItemId: 'EI-CT-003', examItemName: '肺动脉CTA', modality: 'CT', bodyPart: '胸部',
    examDate: formatDate(today), examTime: '15:00', deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）',
    roomId: 'ROOM-CT2', roomName: 'CT室2', referringDoctorId: 'D007', referringDoctorName: '王芳',
    clinicalDiagnosis: '胸痛待查', notes: '疑似肺栓塞', status: '已报到', priority: '危重',
    registrationType: '急诊', createdAt: '2026-05-02 12:00:00'
  },
  {
    id: 'APT-008', patientId: 'P202600008', patientName: '黄丽', gender: '女', age: 33, phone: '131****0123',
    idCard: '330101199301041234', examItemId: 'EI-MR-003', examItemName: '膝关节MR', modality: 'MR', bodyPart: '关节',
    examDate: formatDate(addDays(today, 1)), examTime: '10:00', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）',
    roomId: 'ROOM-MR1', roomName: 'MR室1', referringDoctorId: 'D008', referringDoctorName: '刘海',
    clinicalDiagnosis: '膝关节损伤', notes: '外伤后3天', status: '已确认', priority: '普通',
    registrationType: '门诊', createdAt: '2026-05-02 14:30:00'
  },
  {
    id: 'APT-009', patientId: 'P202600009', patientName: '周强', gender: '男', age: 58, phone: '130****4567',
    idCard: '510101196801045678', examItemId: 'EI-CT-004', examItemName: '前列腺CT增强', modality: 'CT', bodyPart: '盆腔',
    examDate: formatDate(addDays(today, 3)), examTime: '09:00', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）',
    roomId: 'ROOM-CT1', roomName: 'CT室1', referringDoctorId: 'D009', referringDoctorName: '高峰',
    clinicalDiagnosis: '前列腺癌筛查', notes: 'PSA升高', status: '待确认', priority: '紧急',
    registrationType: '门诊', createdAt: '2026-05-02 16:00:00'
  },
  {
    id: 'APT-010', patientId: 'P202600010', patientName: '吴敏', gender: '女', age: 47, phone: '159****8901',
    idCard: '320101197901048901', examItemId: 'EI-MG-001', examItemName: '乳腺钼靶', modality: '乳腺钼靶', bodyPart: '胸部',
    examDate: formatDate(today), examTime: '14:00', deviceId: 'DEV-MG-01', deviceName: '乳腺钼靶（GE Senographe）',
    roomId: 'ROOM-MG1', roomName: '钼靶室1', referringDoctorId: 'D010', referringDoctorName: '林梅',
    clinicalDiagnosis: '乳腺癌筛查', notes: '有家族史', status: '已确认', priority: '普通',
    registrationType: '体检', createdAt: '2026-05-01 09:00:00'
  },
  {
    id: 'APT-011', patientId: 'P202600011', patientName: '徐涛', gender: '男', age: 35, phone: '158****2345',
    idCard: '110101199101052345', examItemId: 'EI-MR-004', examItemName: '颈椎MR', modality: 'MR', bodyPart: '脊柱',
    examDate: formatDate(addDays(today, 1)), examTime: '11:00', deviceId: 'DEV-MR-02', deviceName: 'MR-2（飞利浦Ingenia）',
    roomId: 'ROOM-MR2', roomName: 'MR室2', referringDoctorId: 'D011', referringDoctorName: '崔勇',
    clinicalDiagnosis: '颈椎病', notes: '手臂麻木', status: '已确认', priority: '普通',
    registrationType: '门诊', createdAt: '2026-05-03 10:00:00'
  },
  {
    id: 'APT-012', patientId: 'P202600012', patientName: '孙燕', gender: '女', age: 29, phone: '157****6789',
    idCard: '440301199701063456', examItemId: 'EI-CT-005', examItemName: '头颅CT平扫', modality: 'CT', bodyPart: '头颅',
    examDate: formatDate(today), examTime: '16:00', deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）',
    roomId: 'ROOM-CT2', roomName: 'CT室2', referringDoctorId: 'D012', referringDoctorName: '彭磊',
    clinicalDiagnosis: '头痛', notes: '', status: '已报到', priority: '普通',
    registrationType: '门诊', createdAt: '2026-05-03 11:00:00'
  },
  {
    id: 'APT-013', patientId: 'P202600013', patientName: '马超', gender: '男', age: 65, phone: '156****0123',
    idCard: '310101196101071234', examItemId: 'EI-DR-002', examItemName: '骨盆平片', modality: 'DR', bodyPart: '盆腔',
    examDate: formatDate(addDays(today, 1)), examTime: '09:00', deviceId: 'DEV-DR-02', deviceName: 'DR-2（GE Optima）',
    roomId: 'ROOM-DR2', roomName: 'DR室2', referringDoctorId: 'D013', referringDoctorName: '龙云',
    clinicalDiagnosis: '骨折复查', notes: '髋部骨折术后', status: '已确认', priority: '紧急',
    registrationType: '住院', createdAt: '2026-05-03 13:00:00'
  },
  {
    id: 'APT-014', patientId: 'P202600014', patientName: '朱琳', gender: '女', age: 52, phone: '155****3456',
    idCard: '510101197401083456', examItemId: 'EI-MR-005', examItemName: '腹部MRI平扫', modality: 'MR', bodyPart: '腹部',
    examDate: formatDate(addDays(today, 2)), examTime: '15:00', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）',
    roomId: 'ROOM-MR1', roomName: 'MR室1', referringDoctorId: 'D014', referringDoctorName: '徐静',
    clinicalDiagnosis: '肝血管瘤', notes: '随访复查', status: '待确认', priority: '普通',
    registrationType: '门诊', createdAt: '2026-05-03 15:30:00'
  },
  {
    id: 'APT-015', patientId: 'P202600015', patientName: '胡鹏', gender: '男', age: 48, phone: '154****7890',
    idCard: '330101197801097890', examItemId: 'EI-DS-002', examItemName: '脑血管DSA', modality: 'DSA', bodyPart: '头颅',
    examDate: formatDate(addDays(today, 4)), examTime: '07:00', deviceId: 'DEV-DSA-01', deviceName: 'DSA-1（飞利浦Azurion 7）',
    roomId: 'ROOM-DSA1', roomName: 'DSA室1', referringDoctorId: 'D015', referringDoctorName: '肖强',
    clinicalDiagnosis: '脑动脉瘤待排', notes: 'MRA提示异常', status: '已确认', priority: '危重',
    registrationType: '住院', createdAt: '2026-05-04 08:00:00'
  },
  {
    id: 'APT-016', patientId: 'P202600016', patientName: '郭芳', gender: '女', age: 41, phone: '153****1234',
    idCard: '210101198501101234', examItemId: 'EI-CT-006', examItemName: '甲状腺CT', modality: 'CT', bodyPart: '颈部',
    examDate: formatDate(today), examTime: '17:00', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）',
    roomId: 'ROOM-CT1', roomName: 'CT室1', referringDoctorId: 'D016', referringDoctorName: '白霞',
    clinicalDiagnosis: '甲状腺结节', notes: '', status: '已确认', priority: '普通',
    registrationType: '门诊', createdAt: '2026-05-04 10:00:00'
  },
  {
    id: 'APT-017', patientId: 'P202600017', patientName: '林峰', gender: '男', age: 55, phone: '152****5678',
    idCard: '440101197101115678', examItemId: 'EI-PET-001', examItemName: '全身PET-CT', modality: 'PET-CT', bodyPart: '全身',
    examDate: formatDate(addDays(today, 5)), examTime: '08:00', deviceId: 'DEV-PET-01', deviceName: 'PET-CT（西门子Biograph）',
    roomId: 'ROOM-PET1', roomName: 'PET-CT室1', referringDoctorId: 'D017', referringDoctorName: '谭伟',
    clinicalDiagnosis: '肿瘤分期', notes: '肺癌术后', status: '待确认', priority: '紧急',
    registrationType: '住院', createdAt: '2026-05-04 12:00:00'
  },
  {
    id: 'APT-018', patientId: 'P202600018', patientName: '何婷', gender: '女', age: 36, phone: '151****9012',
    idCard: '320101199001129012', examItemId: 'EI-SPECT-001', examItemName: '骨扫描', modality: 'SPECT-CT', bodyPart: '全身',
    examDate: formatDate(addDays(today, 1)), examTime: '13:00', deviceId: 'DEV-SPECT-01', deviceName: 'SPECT-CT（GE Discovery）',
    roomId: 'ROOM-SPECT1', roomName: 'SPECT-CT室1', referringDoctorId: 'D018', referringDoctorName: '蒋丽',
    clinicalDiagnosis: '骨转移筛查', notes: '乳腺癌病史', status: '已确认', priority: '紧急',
    registrationType: '门诊', createdAt: '2026-05-04 14:00:00'
  },
  {
    id: 'APT-019', patientId: 'P202600019', patientName: '高建', gender: '男', age: 68, phone: '150****3456',
    idCard: '310101195801133456', examItemId: 'EI-MR-006', examItemName: '心脏MR', modality: 'MR', bodyPart: '心脏',
    examDate: formatDate(addDays(today, 3)), examTime: '10:00', deviceId: 'DEV-MR-02', deviceName: 'MR-2（飞利浦Ingenia）',
    roomId: 'ROOM-MR2', roomName: 'MR室2', referringDoctorId: 'D019', referringDoctorName: '汤敏',
    clinicalDiagnosis: '心肌病', notes: '心功能不全', status: '待确认', priority: '紧急',
    registrationType: '住院', createdAt: '2026-05-04 16:00:00'
  },
  {
    id: 'APT-020', patientId: 'P202600020', patientName: '许刚', gender: '男', age: 44, phone: '149****7890',
    idCard: '510101198201147890', examItemId: 'EI-CT-007', examItemName: '结肠CT仿真内镜', modality: 'CT', bodyPart: '腹部',
    examDate: formatDate(addDays(today, 2)), examTime: '11:00', deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）',
    roomId: 'ROOM-CT2', roomName: 'CT室2', referringDoctorId: 'D020', referringDoctorName: '贺勇',
    clinicalDiagnosis: '结肠息肉随访', notes: '需清洁肠道', status: '已确认', priority: '普通',
    registrationType: '门诊', createdAt: '2026-05-04 17:30:00'
  }
]

// ==================== 15条医保审核记录 ====================
export const INSURANCE_AUDIT_RECORDS: InsuranceAuditRecord[] = [
  {
    id: 'INS-001', patientName: '张伟', patientId: 'P202600001', examType: 'CT增强', examItem: '胸部CT增强',
    drugName: '碘海醇注射液', drugCategory: 'CT对比剂', drugSpec: '50ml:15g',
    restriction: '限CT增强检查使用', reason: '申请使用碘海醇注射液行胸部CT增强检查',
    submitTime: '2026-05-02 08:30', submitDept: '呼吸内科', urgency: '高',
    result: '通过', auditor: '医保办-李审核', auditTime: '2026-05-02 09:15', auditNotes: '符合医保限定支付条件'
  },
  {
    id: 'INS-002', patientName: '王芳', patientId: 'P202600002', examType: 'MRI增强', examItem: '头颅MRI增强',
    drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:7.5mmol',
    restriction: '限MRI增强检查使用', reason: '申请使用钆喷酸葡胺注射液行头颅MRI增强检查',
    submitTime: '2026-05-02 09:15', submitDept: '神经内科', urgency: '中',
    result: '通过', auditor: '医保办-王审核', auditTime: '2026-05-02 10:00', auditNotes: '影像学评估需要'
  },
  {
    id: 'INS-003', patientName: '李明', patientId: 'P202600003', examType: 'CT增强', examItem: '腹部CT增强',
    drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:32g',
    restriction: '限CT增强检查使用', reason: '申请使用碘克沙醇注射液行腹部CT增强检查',
    submitTime: '2026-05-02 10:20', submitDept: '消化内科', urgency: '高',
    result: '通过', auditor: '医保办-张审核', auditTime: '2026-05-02 11:00', auditNotes: '肝占位评估需要'
  },
  {
    id: 'INS-004', patientName: '刘洋', patientId: 'P202600004', examType: 'MRI增强', examItem: '乳腺MRI增强',
    drugName: '钆布醇注射液', drugCategory: 'MRI对比剂', drugSpec: '10ml:2.5mmol',
    restriction: '限MRI增强检查使用', reason: '申请使用钆布醇注射液行乳腺MRI增强检查',
    submitTime: '2026-05-02 11:45', submitDept: '乳腺外科', urgency: '中',
    result: '补充资料', auditor: '医保办-刘审核', auditTime: '2026-05-02 14:00', auditNotes: '需补充病理报告'
  },
  {
    id: 'INS-005', patientName: '陈静', patientId: 'P202600005', examType: 'DSA手术', examItem: '冠脉造影',
    drugName: '比伐卢定注射液', drugCategory: '抗凝药物', drugSpec: '0.6ml:5000IU',
    restriction: '限DSA手术使用', reason: '申请使用比伐卢定注射液行冠脉造影检查',
    submitTime: '2026-05-02 13:00', submitDept: '心内科', urgency: '高',
    result: '通过', auditor: '医保办-陈审核', auditTime: '2026-05-02 13:30', auditNotes: '冠心病诊断明确'
  },
  {
    id: 'INS-006', patientName: '杨勇', patientId: 'P202600006', examType: 'CT增强', examItem: '肺动脉CTA',
    drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:61.2g',
    restriction: '限CT增强检查使用', reason: '申请使用碘普罗胺注射液行肺动脉CTA检查',
    submitTime: '2026-05-02 14:30', submitDept: '呼吸内科', urgency: '高',
    result: '通过', auditor: '医保办-李审核', auditTime: '2026-05-02 15:00', auditNotes: '疑似肺栓塞，紧急'
  },
  {
    id: 'INS-007', patientName: '赵磊', patientId: 'P202600007', examType: 'MRI增强', examItem: '前列腺MRI增强',
    drugName: '钆贝葡胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:4.305g',
    restriction: '限MRI增强检查使用', reason: '申请使用钆贝葡胺注射液行前列腺MRI增强检查',
    submitTime: '2026-05-02 15:45', submitDept: '泌尿外科', urgency: '中',
    result: '通过', auditor: '医保办-王审核', auditTime: '2026-05-02 16:30', auditNotes: '前列腺癌筛查需要'
  },
  {
    id: 'INS-008', patientName: '黄丽', patientId: 'P202600008', examType: 'DSA手术', examItem: '脑血管DSA',
    drugName: '肝素钠注射液', drugCategory: '抗凝药物', drugSpec: '12500U/支',
    restriction: '限DSA手术使用', reason: '申请使用肝素钠注射液行脑血管DSA检查',
    submitTime: '2026-05-03 08:00', submitDept: '神经内科', urgency: '低',
    result: '拒绝', auditor: '医保办-张审核', auditTime: '2026-05-03 09:00', auditNotes: 'MRA未见明确异常，暂不需要DSA'
  },
  {
    id: 'INS-009', patientName: '周强', patientId: 'P202600009', examType: 'CT增强', examItem: '冠脉CTA',
    drugName: '碘佛醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:35g',
    restriction: '限CT增强检查使用', reason: '申请使用碘佛醇注射液行冠脉CTA检查',
    submitTime: '2026-05-03 09:30', submitDept: '心内科', urgency: '高',
    result: '通过', auditor: '医保办-刘审核', auditTime: '2026-05-03 10:15', auditNotes: '冠心病筛查需要'
  },
  {
    id: 'INS-010', patientName: '吴敏', patientId: 'P202600010', examType: 'MRI增强', examItem: '心脏MR',
    drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:4.305g',
    restriction: '限MRI增强检查使用', reason: '申请使用钆双胺注射液行心脏MR检查',
    submitTime: '2026-05-03 10:45', submitDept: '心内科', urgency: '中',
    result: '通过', auditor: '医保办-陈审核', auditTime: '2026-05-03 11:30', auditNotes: '心肌病评估需要'
  },
  {
    id: 'INS-011', patientName: '徐涛', patientId: 'P202600011', examType: 'CT增强', examItem: '头颅CT增强',
    drugName: '碘帕醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:37g',
    restriction: '限CT增强检查使用', reason: '申请使用碘帕醇注射液行头颅CT增强检查',
    submitTime: '2026-05-03 11:30', submitDept: '神经内科', urgency: '高',
    result: '通过', auditor: '医保办-李审核', auditTime: '2026-05-03 12:00', auditNotes: '脑血管病评估'
  },
  {
    id: 'INS-012', patientName: '孙燕', patientId: 'P202600012', examType: 'DSA手术', examItem: '肾动脉DSA',
    drugName: '磺达肝癸钠注射液', drugCategory: '抗凝药物', drugSpec: '2.5mg/支',
    restriction: '限DSA手术使用', reason: '申请使用磺达肝癸钠注射液行肾动脉DSA检查',
    submitTime: '2026-05-03 13:00', submitDept: '肾内科', urgency: '低',
    result: '补充资料', auditor: '医保办-王审核', auditTime: '2026-05-03 14:00', auditNotes: '需补充肾功能报告'
  },
  {
    id: 'INS-013', patientName: '马超', patientId: 'P202600013', examType: 'CT增强', examItem: '腹部CT增强',
    drugName: '碘海醇注射液', drugCategory: 'CT对比剂', drugSpec: '50ml:15g',
    restriction: '限CT增强检查使用', reason: '申请使用碘海醇注射液行腹部CT增强检查',
    submitTime: '2026-05-03 14:15', submitDept: '肿瘤科', urgency: '中',
    result: '通过', auditor: '医保办-张审核', auditTime: '2026-05-03 15:00', auditNotes: '肿瘤复查需要'
  },
  {
    id: 'INS-014', patientName: '朱琳', patientId: 'P202600014', examType: 'MRI增强', examItem: '颅底MRI增强',
    drugName: '钆特醇注射液', drugCategory: 'MRI对比剂', drugSpec: '10ml:3.0mmol',
    restriction: '限MRI增强检查使用', reason: '申请使用钆特醇注射液行颅底MRI增强检查',
    submitTime: '2026-05-03 15:30', submitDept: '神经外科', urgency: '中',
    result: '通过', auditor: '医保办-刘审核', auditTime: '2026-05-03 16:00', auditNotes: '颅底病变评估'
  },
  {
    id: 'INS-015', patientName: '胡鹏', patientId: 'P202600015', examType: 'DSA手术', examItem: '外周血管DSA',
    drugName: '阿加曲班注射液', drugCategory: '抗凝药物', drugSpec: '20mg/支',
    restriction: '限DSA手术使用', reason: '申请使用阿加曲班注射液行外周血管DSA检查',
    submitTime: '2026-05-03 16:45', submitDept: '血管外科', urgency: '低',
    result: '拒绝', auditor: '医保办-陈审核', auditTime: '2026-05-03 17:30', auditNotes: '抗凝药物选择不符合指南'
  }
]

// ==================== 10条患者随访记录 ====================
export const FOLLOW_UP_RECORDS: FollowUpRecord[] = [
  {
    id: 'FU-001', patientId: 'P202500001', patientName: '李四', gender: '男', age: 58, phone: '138****1111',
    examType: 'MRI增强', examItemName: '头颅MRI增强', examDate: '2026-01-15',
    followUpType: '肿瘤复查', nextFollowUpDate: '2026-07-15', status: '进行中',
    reaction: '轻度', notes: '肺癌术后3个月复查，影像学评估显示稳定',
    referringDoctor: '肿瘤科-张主任', department: '肿瘤科', createdAt: '2026-01-15 10:00:00'
  },
  {
    id: 'FU-002', patientId: 'P202500002', patientName: '王五', gender: '女', age: 45, phone: '139****2222',
    examType: 'CT平扫', examItemName: '胸部CT平扫', examDate: '2026-04-23',
    followUpType: '早期肺癌跟踪', nextFollowUpDate: '2026-06-23', status: '已完成',
    reaction: '中度', notes: '肺结节6个月随访，大小稳定，继续观察',
    referringDoctor: '呼吸科-李医生', department: '呼吸内科', createdAt: '2026-04-23 14:00:00'
  },
  {
    id: 'FU-003', patientId: 'P202500003', patientName: '赵六', gender: '男', age: 62, phone: '137****3333',
    examType: 'MRI平扫', examItemName: '腹部MRI平扫', examDate: '2026-03-21',
    followUpType: '治疗评估', nextFollowUpDate: '2026-05-21', status: '逾期',
    reaction: '重度', notes: '肝癌介入治疗后影像学评估，肿瘤标记物升高',
    referringDoctor: '消化科-王主任', department: '消化内科', createdAt: '2026-03-21 09:00:00'
  },
  {
    id: 'FU-004', patientId: 'P202500004', patientName: '钱七', gender: '女', age: 52, phone: '136****4444',
    examType: 'PET-CT', examItemName: '全身PET-CT', examDate: '2026-05-15',
    followUpType: '术后复查', nextFollowUpDate: '2026-08-15', status: '待随访',
    reaction: '无反应', notes: '乳腺癌术后全身评估，未见转移征象',
    referringDoctor: '乳腺科-赵医生', department: '乳腺外科', createdAt: '2026-05-15 11:00:00'
  },
  {
    id: 'FU-005', patientId: 'P202500005', patientName: '孙八', gender: '男', age: 68, phone: '135****5555',
    examType: 'SPECT-CT', examItemName: '骨扫描', examDate: '2026-05-02',
    followUpType: '介入治疗后评估', nextFollowUpDate: '2026-12-02', status: '进行中',
    reaction: '轻度', notes: '前列腺癌骨转移治疗后疗效评估',
    referringDoctor: '泌尿科-刘主任', department: '泌尿外科', createdAt: '2026-05-02 08:30:00'
  },
  {
    id: 'FU-006', patientId: 'P202500006', patientName: '周九', gender: '女', age: 41, phone: '134****6666',
    examType: 'CT增强', examItemName: '腹部CT增强', examDate: '2026-01-17',
    followUpType: '对比剂反应', nextFollowUpDate: '2026-12-17', status: '已完成',
    reaction: '中度', notes: '常规增强检查后出现轻微恶心，休息后缓解，已恢复',
    referringDoctor: '体检科-陈医生', department: '体检科', createdAt: '2026-01-17 10:30:00'
  },
  {
    id: 'FU-007', patientId: 'P202500007', patientName: '吴十', gender: '男', age: 55, phone: '133****7777',
    examType: 'MRI增强', examItemName: '前列腺MRI增强', examDate: '2026-04-16',
    followUpType: '肿瘤复查', nextFollowUpDate: '2026-06-16', status: '逾期',
    reaction: '重度', notes: '前列腺癌根治术后生化复发，需进一步评估',
    referringDoctor: '泌尿科-孙主任', department: '泌尿外科', createdAt: '2026-04-16 14:00:00'
  },
  {
    id: 'FU-008', patientId: 'P202500008', patientName: '郑一', gender: '女', age: 38, phone: '132****8888',
    examType: 'CT平扫', examItemName: '胸部CT平扫', examDate: '2026-01-20',
    followUpType: '早期肺癌跟踪', nextFollowUpDate: '2026-06-20', status: '待随访',
    reaction: '无反应', notes: '肺结节随访中，CT增强后皮疹，给予抗过敏处理后好转',
    referringDoctor: '呼吸科-周医生', department: '呼吸内科', createdAt: '2026-01-20 09:00:00'
  },
  {
    id: 'FU-009', patientId: 'P202500009', patientName: '冯二', gender: '男', age: 48, phone: '131****9999',
    examType: 'MRI平扫', examItemName: '腹部MRI平扫', examDate: '2026-03-16',
    followUpType: '治疗评估', nextFollowUpDate: '2026-10-16', status: '进行中',
    reaction: '轻度', notes: '肝癌介入治疗后复查，MRI增强后肝功能异常，保肝治疗中',
    referringDoctor: '消化科-吴主任', department: '消化内科', createdAt: '2026-03-16 11:30:00'
  },
  {
    id: 'FU-010', patientId: 'P202500010', patientName: '陈三', gender: '女', age: 35, phone: '130****0000',
    examType: 'PET-CT', examItemName: '全身PET-CT', examDate: '2026-01-18',
    followUpType: '术后复查', nextFollowUpDate: '2026-08-18', status: '已完成',
    reaction: '中度', notes: '淋巴瘤治疗后评估，注射碘对比剂后出现轻微恶心，休息后缓解',
    referringDoctor: '血液科-杨主任', department: '血液科', createdAt: '2026-01-18 08:00:00'
  }
]

// ==================== 10条设备维保合同 ====================
export const DEVICE_MAINTENANCE_CONTRACTS: DeviceMaintenanceContract[] = [
  {
    id: 'MC-001', contractNo: 'HT-2026-CT-001', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）',
    deviceModel: 'GE Revolution CT', serialNumber: 'CT2020GE001',
    company: 'GE医疗中国', contactPerson: '张工', contactTel: '400-880-1001',
    startDate: '2026-01-01', endDate: '2026-12-31', amount: 850000,
    paymentStatus: '已付款', coverage: '全保（含CT球管、探测器、软件升级）',
    serviceLevel: '白金', renewHistory: [
      { year: 2025, amount: 820000, status: '已到期' },
      { year: 2024, amount: 780000, status: '已到期' }
    ], createdAt: '2025-12-15 10:00:00'
  },
  {
    id: 'MC-002', contractNo: 'HT-2026-CT-002', deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）',
    deviceModel: 'SOMATOM Force', serialNumber: 'CT2021SI002',
    company: '西门子医疗', contactPerson: '李工', contactTel: '400-880-2002',
    startDate: '2026-01-01', endDate: '2026-12-31', amount: 920000,
    paymentStatus: '已付款', coverage: '全保（含球管、探测器、迭代软件）',
    serviceLevel: '白金', renewHistory: [
      { year: 2025, amount: 880000, status: '已到期' },
      { year: 2024, amount: 850000, status: '已到期' }
    ], createdAt: '2025-12-10 14:00:00'
  },
  {
    id: 'MC-003', contractNo: 'HT-2026-MR-001', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）',
    deviceModel: 'MAGNETOM Vida 3.0T', serialNumber: 'MR2020SI001',
    company: '西门子医疗', contactPerson: '王工', contactTel: '400-880-2003',
    startDate: '2026-01-01', endDate: '2026-12-31', amount: 1200000,
    paymentStatus: '待付款', coverage: '全保（含磁体、梯度线圈、射频系统）',
    serviceLevel: '白金', renewHistory: [
      { year: 2025, amount: 1150000, status: '已到期' },
      { year: 2024, amount: 1100000, status: '已到期' }
    ], createdAt: '2025-12-20 09:00:00'
  },
  {
    id: 'MC-004', contractNo: 'HT-2026-MR-002', deviceId: 'DEV-MR-02', deviceName: 'MR-2（飞利浦Ingenia）',
    deviceModel: 'Ingenia 3.0T', serialNumber: 'MR2021PH002',
    company: '飞利浦医疗', contactPerson: '赵工', contactTel: '400-880-3004',
    startDate: '2026-01-01', endDate: '2026-12-31', amount: 1100000,
    paymentStatus: '已付款', coverage: '标准维保（不含液氦消耗）',
    serviceLevel: '高级', renewHistory: [
      { year: 2025, amount: 1050000, status: '已到期' },
      { year: 2024, amount: 1000000, status: '已到期' }
    ], createdAt: '2025-12-18 11:00:00'
  },
  {
    id: 'MC-005', contractNo: 'HT-2026-DR-001', deviceId: 'DEV-DR-01', deviceName: 'DR-1（飞利浦DigitalDiagnost）',
    deviceModel: 'DigitalDiagnost C90', serialNumber: 'DR2020PH001',
    company: '飞利浦医疗', contactPerson: '刘工', contactTel: '400-880-3005',
    startDate: '2026-01-01', endDate: '2026-12-31', amount: 350000,
    paymentStatus: '已付款', coverage: '标准维保（含探测器、平板）',
    serviceLevel: '标准', renewHistory: [
      { year: 2025, amount: 330000, status: '已到期' },
      { year: 2024, amount: 310000, status: '已到期' }
    ], createdAt: '2025-12-25 15:00:00'
  },
  {
    id: 'MC-006', contractNo: 'HT-2026-DSA-001', deviceId: 'DEV-DSA-01', deviceName: 'DSA-1（飞利浦Azurion 7）',
    deviceModel: 'Azurion 7 M20', serialNumber: 'DSA2021PH001',
    company: '飞利浦医疗', contactPerson: '陈工', contactTel: '400-880-3006',
    startDate: '2026-01-01', endDate: '2026-12-31', amount: 1500000,
    paymentStatus: '已付款', coverage: '全保（含球管、系统软件、介入工具）',
    serviceLevel: '白金', renewHistory: [
      { year: 2025, amount: 1450000, status: '已到期' },
      { year: 2024, amount: 1400000, status: '已到期' }
    ], createdAt: '2025-12-22 10:00:00'
  },
  {
    id: 'MC-007', contractNo: 'HT-2026-MG-001', deviceId: 'DEV-MG-01', deviceName: '乳腺钼靶（GE Senographe）',
    deviceModel: 'Senographe Pristina', serialNumber: 'MG2021GE001',
    company: 'GE医疗中国', contactPerson: '周工', contactTel: '400-880-1007',
    startDate: '2026-01-01', endDate: '2026-12-31', amount: 420000,
    paymentStatus: '待付款', coverage: '标准维保（含探测器、压迫板）',
    serviceLevel: '高级', renewHistory: [
      { year: 2025, amount: 400000, status: '已到期' },
      { year: 2024, amount: 380000, status: '已到期' }
    ], createdAt: '2025-12-28 14:00:00'
  },
  {
    id: 'MC-008', contractNo: 'HT-2026-PET-001', deviceId: 'DEV-PET-01', deviceName: 'PET-CT（西门子Biograph）',
    deviceModel: 'Biograph mCT Flow', serialNumber: 'PET2020SI001',
    company: '西门子医疗', contactPerson: '吴工', contactTel: '400-880-2008',
    startDate: '2026-01-01', endDate: '2026-12-31', amount: 1800000,
    paymentStatus: '已付款', coverage: '全保（含晶体、CT部分、软件）',
    serviceLevel: '白金', renewHistory: [
      { year: 2025, amount: 1750000, status: '已到期' },
      { year: 2024, amount: 1700000, status: '已到期' }
    ], createdAt: '2025-12-15 16:00:00'
  },
  {
    id: 'MC-009', contractNo: 'HT-2026-SPECT-001', deviceId: 'DEV-SPECT-01', deviceName: 'SPECT-CT（GE Discovery）',
    deviceModel: 'Discovery NM/CT 670', serialNumber: 'SPECT2021GE001',
    company: 'GE医疗中国', contactPerson: '郑工', contactTel: '400-880-1009',
    startDate: '2026-01-01', endDate: '2026-12-31', amount: 680000,
    paymentStatus: '已逾期', coverage: '标准维保（含探头、CT部分）',
    serviceLevel: '标准', renewHistory: [
      { year: 2025, amount: 650000, status: '已到期' },
      { year: 2024, amount: 620000, status: '已到期' }
    ], createdAt: '2025-12-30 11:00:00'
  },
  {
    id: 'MC-010', contractNo: 'HT-2026-DR-002', deviceId: 'DEV-DR-02', deviceName: 'DR-2（GE Optima）',
    deviceModel: 'Optima XR646', serialNumber: 'DR2021GE002',
    company: 'GE医疗中国', contactPerson: '孙工', contactTel: '400-880-1010',
    startDate: '2026-01-01', endDate: '2026-12-31', amount: 320000,
    paymentStatus: '已付款', coverage: '标准维保（含探测器）',
    serviceLevel: '标准', renewHistory: [
      { year: 2025, amount: 300000, status: '已到期' },
      { year: 2024, amount: 280000, status: '已到期' }
    ], createdAt: '2025-12-26 09:00:00'
  }
]

// ==================== 20条临床数据同步记录 ====================
export const CLINICAL_SYNC_RECORDS: ClinicalSyncRecord[] = [
  {
    id: 'SYNC-001', systemName: 'HIS医院信息系统', systemCode: 'HIS', recordType: '患者信息',
    patientId: 'P202600001', patientName: '张伟', dataContent: '门诊就诊记录、处方信息',
    syncTime: '2026-05-04 08:00:15', status: '已同步', retryCount: 0,
    dataVolume: '2.3KB', sourceDept: '呼吸内科'
  },
  {
    id: 'SYNC-002', systemName: 'PACS影像归档系统', systemCode: 'PACS', recordType: '检查图像',
    patientId: 'P202600002', patientName: '王芳', dataContent: 'MRI图像147幅，DICOM文件',
    syncTime: '2026-05-04 08:15:30', status: '已同步', retryCount: 0,
    dataVolume: '156.7MB', sourceDept: '放射科'
  },
  {
    id: 'SYNC-003', systemName: 'LIS检验信息系统', systemCode: 'LIS', recordType: '检验结果',
    patientId: 'P202600003', patientName: '李明', dataContent: '肝功能、肿瘤标志物结果',
    syncTime: '2026-05-04 08:30:45', status: '已同步', retryCount: 0,
    dataVolume: '15.2KB', sourceDept: '检验科'
  },
  {
    id: 'SYNC-004', systemName: 'EMR电子病历系统', systemCode: 'EMR', recordType: '病历文书',
    patientId: 'P202600001', patientName: '张伟', dataContent: '门诊病历、入院记录',
    syncTime: '2026-05-04 08:45:00', status: '同步中', retryCount: 1,
    dataVolume: '45.8KB', sourceDept: '呼吸内科'
  },
  {
    id: 'SYNC-005', systemName: 'RIS放射信息系统', systemCode: 'RIS', recordType: '检查申请',
    patientId: 'P202600004', patientName: '刘洋', dataContent: '乳腺MRI增强申请单',
    syncTime: '2026-05-04 09:00:20', status: '已同步', retryCount: 0,
    dataVolume: '8.5KB', sourceDept: '乳腺外科'
  },
  {
    id: 'SYNC-006', systemName: 'CIS临床信息系统', systemCode: 'CIS', recordType: '手术记录',
    patientId: 'P202600005', patientName: '陈静', dataContent: '介入手术记录、术后小结',
    syncTime: '2026-05-04 09:15:10', status: '失败', errorMessage: 'CIS服务器连接超时',
    retryCount: 3, lastRetryTime: '2026-05-04 09:18:00', dataVolume: '128.4KB', sourceDept: '心内科'
  },
  {
    id: 'SYNC-007', systemName: 'HIS医院信息系统', systemCode: 'HIS', recordType: '费用信息',
    patientId: 'P202600006', patientName: '杨勇', dataContent: '住院费用明细、医保结算',
    syncTime: '2026-05-04 09:30:00', status: '已同步', retryCount: 0,
    dataVolume: '32.1KB', sourceDept: '心内科'
  },
  {
    id: 'SYNC-008', systemName: 'PACS影像归档系统', systemCode: 'PACS', recordType: '检查图像',
    patientId: 'P202600007', patientName: '赵磊', dataContent: 'CTA图像326幅，3D重建数据',
    syncTime: '2026-05-04 09:45:30', status: '已同步', retryCount: 0,
    dataVolume: '456.2MB', sourceDept: '放射科'
  },
  {
    id: 'SYNC-009', systemName: 'NIS护理信息系统', systemCode: 'NIS', recordType: '护理记录',
    patientId: 'P202600008', patientName: '黄丽', dataContent: '术前护理评估、宣教记录',
    syncTime: '2026-05-04 10:00:15', status: '已同步', retryCount: 0,
    dataVolume: '18.7KB', sourceDept: '骨科'
  },
  {
    id: 'SYNC-010', systemName: 'LIS检验信息系统', systemCode: 'LIS', recordType: '检验结果',
    patientId: 'P202600009', patientName: '周强', dataContent: '前列腺特异性抗原(PSA)结果',
    syncTime: '2026-05-04 10:15:40', status: '已同步', retryCount: 0,
    dataVolume: '5.3KB', sourceDept: '泌尿外科'
  },
  {
    id: 'SYNC-011', systemName: 'EMR电子病历系统', systemCode: 'EMR', recordType: '病历文书',
    patientId: 'P202600010', patientName: '吴敏', dataContent: '体检报告、随访建议',
    syncTime: '2026-05-04 10:30:00', status: '待同步', retryCount: 0,
    dataVolume: '56.2KB', sourceDept: '体检科'
  },
  {
    id: 'SYNC-012', systemName: 'RIS放射信息系统', systemCode: 'RIS', recordType: '报告结果',
    patientId: 'P202600002', patientName: '王芳', dataContent: '头颅MRI平扫报告',
    syncTime: '2026-05-04 10:45:20', status: '已同步', retryCount: 0,
    dataVolume: '12.8KB', sourceDept: '放射科'
  },
  {
    id: 'SYNC-013', systemName: 'HIS医院信息系统', systemCode: 'HIS', recordType: '患者信息',
    patientId: 'P202600011', patientName: '徐涛', dataContent: '门诊挂号信息、就诊卡',
    syncTime: '2026-05-04 11:00:00', status: '已同步', retryCount: 0,
    dataVolume: '3.1KB', sourceDept: '神经内科'
  },
  {
    id: 'SYNC-014', systemName: 'PACS影像归档系统', systemCode: 'PACS', recordType: '检查图像',
    patientId: 'P202600012', patientName: '孙燕', dataContent: '急诊头颅CT图像89幅',
    syncTime: '2026-05-04 11:15:45', status: '已同步', retryCount: 0,
    dataVolume: '89.5MB', sourceDept: '放射科'
  },
  {
    id: 'SYNC-015', systemName: 'CIS临床信息系统', systemCode: 'CIS', recordType: '会诊记录',
    patientId: 'P202600013', patientName: '马超', dataContent: '骨科会诊意见',
    syncTime: '2026-05-04 11:30:10', status: '失败', errorMessage: '会诊数据格式错误',
    retryCount: 2, lastRetryTime: '2026-05-04 11:33:00', dataVolume: '22.4KB', sourceDept: '骨科'
  },
  {
    id: 'SYNC-016', systemName: 'NIS护理信息系统', systemCode: 'NIS', recordType: '护理记录',
    patientId: 'P202600014', patientName: '朱琳', dataContent: 'CT增强检查前护理记录',
    syncTime: '2026-05-04 11:45:00', status: '已同步', retryCount: 0,
    dataVolume: '9.8KB', sourceDept: '消化内科'
  },
  {
    id: 'SYNC-017', systemName: 'LIS检验信息系统', systemCode: 'LIS', recordType: '检验结果',
    patientId: 'P202600015', patientName: '胡鹏', dataContent: '凝血功能、D-二聚体结果',
    syncTime: '2026-05-04 12:00:30', status: '已同步', retryCount: 0,
    dataVolume: '11.2KB', sourceDept: '检验科'
  },
  {
    id: 'SYNC-018', systemName: 'EMR电子病历系统', systemCode: 'EMR', recordType: '病历文书',
    patientId: 'P202600016', patientName: '郭芳', dataContent: '甲状腺结节诊治讨论记录',
    syncTime: '2026-05-04 12:15:00', status: '同步中', retryCount: 1,
    dataVolume: '34.5KB', sourceDept: '内分泌科'
  },
  {
    id: 'SYNC-019', systemName: 'RIS放射信息系统', systemCode: 'RIS', recordType: '检查预约',
    patientId: 'P202600017', patientName: '林峰', dataContent: 'PET-CT全身检查预约信息',
    syncTime: '2026-05-04 12:30:45', status: '已同步', retryCount: 0,
    dataVolume: '7.6KB', sourceDept: '肿瘤科'
  },
  {
    id: 'SYNC-020', systemName: 'HIS医院信息系统', systemCode: 'HIS', recordType: '药品信息',
    patientId: 'P202600018', patientName: '何婷', dataContent: '对比剂使用记录、过敏史',
    syncTime: '2026-05-04 12:45:00', status: '已同步', retryCount: 0,
    dataVolume: '4.2KB', sourceDept: '核医学科'
  }
]

// ==================== 5条影像会诊记录 ====================
export const CONSULTATION_RECORDS: ConsultationRecord[] = [
  {
    id: 'CONS-001', consultationNo: 'HZ-2026-001', patientName: '王芳', patientId: 'P202600002',
    gender: '女', age: 38, examType: 'MRI增强', examItemName: '头颅MRI增强',
    requestDept: '神经内科', requestDoctor: '赵红', targetHospital: '北京天坛医院',
    targetDoctor: '李明教授', consultationType: '远程会诊', urgency: '紧急',
    status: '已完成', requestTime: '2026-04-28 10:00:00', completedTime: '2026-04-29 15:30:00',
    diagnosis: '左侧桥小脑角区占位，考虑脑膜瘤可能性大',
    opinion: '建议行MRA进一步评估肿瘤血供，必要时行术前栓塞',
    remarks: '患者已收入院，准备手术'
  },
  {
    id: 'CONS-002', consultationNo: 'HZ-2026-002', patientName: '李明', patientId: 'P202600003',
    gender: '男', age: 62, examType: 'CT增强', examItemName: '腹部CT增强',
    requestDept: '消化内科', requestDoctor: '孙强', targetHospital: '上海华山医院',
    targetDoctor: '张伟教授', consultationType: 'MDT', urgency: '普通',
    status: '进行中', requestTime: '2026-05-02 14:00:00',
    diagnosis: undefined, opinion: undefined,
    remarks: '等待MDT讨论'
  },
  {
    id: 'CONS-003', consultationNo: 'HZ-2026-003', patientName: '刘洋', patientId: 'P202600004',
    gender: '女', age: 28, examType: 'MRI增强', examItemName: '乳腺MRI增强',
    requestDept: '乳腺外科', requestDoctor: '周婷', consultationType: '疑难病例', urgency: '普通',
    status: '待回复', requestTime: '2026-05-03 09:00:00',
    diagnosis: undefined, opinion: undefined,
    remarks: '患者有乳腺癌家族史，需排除遗传性乳腺癌'
  },
  {
    id: 'CONS-004', consultationNo: 'HZ-2026-004', patientName: '杨勇', patientId: 'P202600006',
    gender: '男', age: 71, examType: 'DSA手术', examItemName: '冠脉造影',
    requestDept: '心内科', requestDoctor: '郑浩', targetHospital: '北京阜外医院',
    targetDoctor: '王强教授', consultationType: '二次意见', urgency: '紧急',
    status: '已回复', requestTime: '2026-04-30 11:00:00', completedTime: '2026-05-01 16:00:00',
    diagnosis: '冠心病，三支病变，左主干+前降支+回旋支狭窄',
    opinion: '建议行冠脉搭桥手术，不适合支架治疗',
    remarks: '已与家属沟通，同意转院治疗'
  },
  {
    id: 'CONS-005', consultationNo: 'HZ-2026-005', patientName: '赵磊', patientId: 'P202600007',
    gender: '男', age: 42, examType: 'CT增强', examItemName: '肺动脉CTA',
    requestDept: '呼吸内科', requestDoctor: '王芳', consultationType: '疑难病例', urgency: '紧急',
    status: '已完成', requestTime: '2026-05-02 08:00:00', completedTime: '2026-05-02 12:00:00',
    diagnosis: '双侧肺动脉栓塞，下叶为著',
    opinion: '建议抗凝治疗，排除下肢深静脉血栓来源',
    remarks: '已启动抗凝治疗，病情稳定'
  }
]

// ==================== 数据初始化函数 ====================
export const initializeSimulationData = () => {
  // 如果存储中没有数据，则写入初始数据
  if (!localStorage.getItem('g005_appointments')) {
    localStorage.setItem('g005_appointments', JSON.stringify(APPOINTMENT_RECORDS))
  }
  if (!localStorage.getItem('g005_insurance_audits')) {
    localStorage.setItem('g005_insurance_audits', JSON.stringify(INSURANCE_AUDIT_RECORDS))
  }
  if (!localStorage.getItem('g005_follow_ups')) {
    localStorage.setItem('g005_follow_ups', JSON.stringify(FOLLOW_UP_RECORDS))
  }
  if (!localStorage.getItem('g005_device_contracts')) {
    localStorage.setItem('g005_device_contracts', JSON.stringify(DEVICE_MAINTENANCE_CONTRACTS))
  }
  if (!localStorage.getItem('g005_clinical_sync')) {
    localStorage.setItem('g005_clinical_sync', JSON.stringify(CLINICAL_SYNC_RECORDS))
  }
  if (!localStorage.getItem('g005_consultations')) {
    localStorage.setItem('g005_consultations', JSON.stringify(CONSULTATION_RECORDS))
  }
}

// ==================== 导出所有数据 ====================
export const SIMULATION_DATA = {
  APPOINTMENT_RECORDS,
  INSURANCE_AUDIT_RECORDS,
  FOLLOW_UP_RECORDS,
  DEVICE_MAINTENANCE_CONTRACTS,
  CLINICAL_SYNC_RECORDS,
  CONSULTATION_RECORDS
}
