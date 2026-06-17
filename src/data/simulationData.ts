// G005 放射科RIS系统 - 模拟数据 v1.1.0 (动态日期版)
// 包含：预约记录、医保审核、患者随访、设备维保合同、临床数据同步、影像会诊
// 更新：使用相对日期实现动态模拟数据

import { formatDate } from './simulationStore'

// ==================== 辅助函数：生成相对日期 ====================
function getRelativeDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

function getRelativeDateStr(daysAgo: number): string {
  return formatDate(getRelativeDate(daysAgo))
}

function randomElement<T>(arr: T[]): T {
  const item = arr[Math.floor(Math.random() * arr.length)]
  if (item === undefined) {
    throw new Error('randomElement: array is empty')
  }
  return item
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

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
  modality: 'CT' | 'MR' | 'DR' | 'DSA' | '乳腺钼靶' | 'PET-CT' | 'SPECT-CT' | 'US'
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

// ==================== 数据池 ====================
const FIRST_NAMES = ['张', '王', '李', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '林', '何', '高', '许', '罗', '郑', '梁', '谢', '韩', '唐', '冯', '于', '董', '潘', '袁', '蔡', '余', '叶', '苏', '魏', '吕', '丁', '邓', '沈', '彭']
const LAST_NAMES = ['伟', '芳', '明', '洋', '静', '勇', '磊', '丽', '强', '敏', '涛', '燕', '超', '琳', '鹏', '峰', '婷', '建', '刚', '辉', '华', '红', '龙', '云', '梅', '洁', '芬', '芝', '丹', '萍', '娟', '军', '杰', '波', '玲', '秀', '英', '兰', '桂', '怡', '欣', '琪', '萱', '怡', '鑫', '宇']
const DEPARTMENTS = ['呼吸内科', '心内科', '消化内科', '神经内科', '肾内科', '血液科', '内分泌科', '风湿免疫科', '感染科', '肿瘤科', '乳腺外科', '泌尿外科', '骨科', '神经外科', '普外科', '胸外科', '血管外科', '妇科', '产科', '儿科']
const DOCTORS = ['李建国', '赵红', '孙强', '周婷', '吴磊', '郑浩', '王芳', '刘海', '高峰', '林梅', '崔勇', '彭磊', '龙云', '徐静', '肖强', '白霞', '谭伟', '蒋丽', '汤敏', '贺勇', '马骏', '杨帆', '杨志远', '杨晓燕', '徐志明', '徐建国', '徐秀英', '徐涛']
const CLINICAL_DIAGNOSES = ['咳嗽待查', '头痛头晕', '肝占位待查', '乳腺结节复查', '腰痛待查', '冠心病待排', '胸痛待查', '膝关节损伤', '前列腺癌筛查', '乳腺癌筛查', '颈椎病', '骨折复查', '肝血管瘤', '脑动脉瘤待排', '甲状腺结节', '肿瘤分期', '骨转移筛查', '心肌病', '结肠息肉随访', '肺炎', '肺结节', '脑梗死', '胆结石', '肾结石', '胰腺炎', '阑尾炎', '肠梗阻', '消化道穿孔', '腹膜炎', '胸腔积液']
const MODALITIES = ['CT', 'MR', 'DR', 'DSA', '乳腺钼靶', 'PET-CT', 'SPECT-CT', 'US']
const STATUSES = ['待确认', '已确认', '已报到', '已检查', '已取消', '旷到']
const PRIORITIES = ['普通', '普通', '普通', '紧急', '危重']
const REGISTRATION_TYPES = ['门诊', '门诊', '门诊', '住院', '体检', '急诊']

// Kept for parity with src/data/initialData.ts; unused at runtime here.
void DEPARTMENTS
void MODALITIES

// ==================== 检查项目字典（50+项）====================
export const EXAM_ITEMS_DICT = [
  // CT检查（15项）
  { id: 'EI-CT-001', name: '头颅CT平扫', modality: 'CT', bodyPart: '头颅', price: 380, duration: 15 },
  { id: 'EI-CT-002', name: '头颅CT增强', modality: 'CT', bodyPart: '头颅', price: 680, duration: 25 },
  { id: 'EI-CT-003', name: '胸部CT平扫', modality: 'CT', bodyPart: '胸部', price: 420, duration: 10 },
  { id: 'EI-CT-004', name: '胸部CT增强', modality: 'CT', bodyPart: '胸部', price: 720, duration: 20 },
  { id: 'EI-CT-005', name: '腹部CT平扫', modality: 'CT', bodyPart: '腹部', price: 450, duration: 15 },
  { id: 'EI-CT-006', name: '腹部CT增强', modality: 'CT', bodyPart: '腹部', price: 780, duration: 30 },
  { id: 'EI-CT-007', name: '盆腔CT平扫', modality: 'CT', bodyPart: '盆腔', price: 450, duration: 20 },
  { id: 'EI-CT-008', name: '盆腔CT增强', modality: 'CT', bodyPart: '盆腔', price: 780, duration: 35 },
  { id: 'EI-CT-009', name: '脊柱CT', modality: 'CT', bodyPart: '脊柱', price: 480, duration: 20 },
  { id: 'EI-CT-010', name: '冠脉CTA', modality: 'CT', bodyPart: '心脏', price: 980, duration: 25 },
  { id: 'EI-CT-011', name: '肺动脉CTA', modality: 'CT', bodyPart: '胸部', price: 880, duration: 20 },
  { id: 'EI-CT-012', name: '主动脉CTA', modality: 'CT', bodyPart: '血管', price: 980, duration: 25 },
  { id: 'EI-CT-013', name: '头颅CTA', modality: 'CT', bodyPart: '头颅', price: 780, duration: 20 },
  { id: 'EI-CT-014', name: '甲状腺CT', modality: 'CT', bodyPart: '颈部', price: 420, duration: 15 },
  { id: 'EI-CT-015', name: '结肠CT仿真内镜', modality: 'CT', bodyPart: '腹部', price: 680, duration: 30 },
  // MR检查（15项）
  { id: 'EI-MR-001', name: '头颅MR平扫', modality: 'MR', bodyPart: '头颅', price: 680, duration: 25 },
  { id: 'EI-MR-002', name: '头颅MR增强', modality: 'MR', bodyPart: '头颅', price: 980, duration: 40 },
  { id: 'EI-MR-003', name: '颈椎MR', modality: 'MR', bodyPart: '脊柱', price: 680, duration: 20 },
  { id: 'EI-MR-004', name: '腰椎MR', modality: 'MR', bodyPart: '脊柱', price: 680, duration: 20 },
  { id: 'EI-MR-005', name: '胸椎MR', modality: 'MR', bodyPart: '脊柱', price: 680, duration: 20 },
  { id: 'EI-MR-006', name: '膝关节MR', modality: 'MR', bodyPart: '四肢', price: 620, duration: 20 },
  { id: 'EI-MR-007', name: '髋关节MR', modality: 'MR', bodyPart: '四肢', price: 620, duration: 20 },
  { id: 'EI-MR-008', name: '肩关节MR', modality: 'MR', bodyPart: '四肢', price: 620, duration: 20 },
  { id: 'EI-MR-009', name: '踝关节MR', modality: 'MR', bodyPart: '四肢', price: 620, duration: 20 },
  { id: 'EI-MR-010', name: '腹部MR平扫', modality: 'MR', bodyPart: '腹部', price: 780, duration: 30 },
  { id: 'EI-MR-011', name: '腹部MR增强', modality: 'MR', bodyPart: '腹部', price: 1080, duration: 45 },
  { id: 'EI-MR-012', name: '乳腺MR增强', modality: 'MR', bodyPart: '胸部', price: 980, duration: 35 },
  { id: 'EI-MR-013', name: '心脏MR', modality: 'MR', bodyPart: '心脏', price: 880, duration: 40 },
  { id: 'EI-MR-014', name: '前列腺MR', modality: 'MR', bodyPart: '盆腔', price: 780, duration: 30 },
  { id: 'EI-MR-015', name: '子宫MR', modality: 'MR', bodyPart: '盆腔', price: 780, duration: 30 },
  // DR检查（10项）
  { id: 'EI-DR-001', name: '胸部DR正侧位', modality: 'DR', bodyPart: '胸部', price: 120, duration: 5 },
  { id: 'EI-DR-002', name: '腹部立卧位平片', modality: 'DR', bodyPart: '腹部', price: 100, duration: 5 },
  { id: 'EI-DR-003', name: '腰椎正侧位', modality: 'DR', bodyPart: '脊柱', price: 110, duration: 5 },
  { id: 'EI-DR-004', name: '颈椎正侧位', modality: 'DR', bodyPart: '脊柱', price: 110, duration: 5 },
  { id: 'EI-DR-005', name: '胸椎正侧位', modality: 'DR', bodyPart: '脊柱', price: 110, duration: 5 },
  { id: 'EI-DR-006', name: '骨盆平片', modality: 'DR', bodyPart: '盆腔', price: 100, duration: 5 },
  { id: 'EI-DR-007', name: '四肢关节片', modality: 'DR', bodyPart: '四肢', price: 90, duration: 5 },
  { id: 'EI-DR-008', name: '手片', modality: 'DR', bodyPart: '四肢', price: 70, duration: 5 },
  { id: 'EI-DR-009', name: '足片', modality: 'DR', bodyPart: '四肢', price: 70, duration: 5 },
  { id: 'EI-DR-010', name: '鼻窦片', modality: 'DR', bodyPart: '头颅', price: 80, duration: 5 },
  // DSA检查（5项）
  { id: 'EI-DS-001', name: '冠脉造影', modality: 'DSA', bodyPart: '心脏', price: 2500, duration: 60 },
  { id: 'EI-DS-002', name: '脑血管DSA', modality: 'DSA', bodyPart: '头颅', price: 2200, duration: 90 },
  { id: 'EI-DS-003', name: '肾动脉DSA', modality: 'DSA', bodyPart: '血管', price: 2000, duration: 60 },
  { id: 'EI-DS-004', name: '外周血管DSA', modality: 'DSA', bodyPart: '血管', price: 2000, duration: 90 },
  { id: 'EI-DS-005', name: '肺动脉造影', modality: 'DSA', bodyPart: '血管', price: 2100, duration: 60 },
  // 乳腺钼靶（3项）
  { id: 'EI-MG-001', name: '乳腺钼靶', modality: '乳腺钼靶', bodyPart: '胸部', price: 220, duration: 15 },
  { id: 'EI-MG-002', name: '乳腺钼靶增强', modality: '乳腺钼靶', bodyPart: '胸部', price: 380, duration: 20 },
  { id: 'EI-MG-003', name: '乳腺钼靶三维断层', modality: '乳腺钼靶', bodyPart: '胸部', price: 320, duration: 20 },
  // PET-CT（3项）
  { id: 'EI-PET-001', name: '全身PET-CT', modality: 'PET-CT', bodyPart: '全身', price: 5800, duration: 60 },
  { id: 'EI-PET-002', name: '颅脑PET-CT', modality: 'PET-CT', bodyPart: '头颅', price: 4500, duration: 45 },
  { id: 'EI-PET-003', name: '心脏PET-CT', modality: 'PET-CT', bodyPart: '心脏', price: 5200, duration: 50 },
  // SPECT-CT（3项）
  { id: 'EI-SPECT-001', name: '骨扫描', modality: 'SPECT-CT', bodyPart: '全身', price: 980, duration: 30 },
  { id: 'EI-SPECT-002', name: '心肌灌注显像', modality: 'SPECT-CT', bodyPart: '心脏', price: 1200, duration: 45 },
  { id: 'EI-SPECT-003', name: '甲状腺显像', modality: 'SPECT-CT', bodyPart: '颈部', price: 480, duration: 30 },
  // 超声（5项）
  { id: 'EI-US-001', name: '腹部彩超', modality: 'US', bodyPart: '腹部', price: 180, duration: 20 },
  { id: 'EI-US-002', name: '甲状腺彩超', modality: 'US', bodyPart: '颈部', price: 150, duration: 15 },
  { id: 'EI-US-003', name: '心脏彩超', modality: 'US', bodyPart: '心脏', price: 220, duration: 25 },
  { id: 'EI-US-004', name: '乳腺彩超', modality: 'US', bodyPart: '胸部', price: 150, duration: 15 },
  { id: 'EI-US-005', name: '血管彩超', modality: 'US', bodyPart: '血管', price: 200, duration: 25 },
]

// ==================== 设备数据（15台）====================
export const DEVICE_DATA = [
  { id: 'DEV-CT-01', name: 'CT-1（GE Revolution CT）', modality: 'CT', manufacturer: 'GE', model: 'Revolution CT', location: 'CT室1', status: '使用中' },
  { id: 'DEV-CT-02', name: 'CT-2（西门子SOMATOM Force）', modality: 'CT', manufacturer: 'Siemens', model: 'SOMATOM Force', location: 'CT室2', status: '空闲' },
  { id: 'DEV-CT-03', name: 'CT-3（飞利浦Access CT）', modality: 'CT', manufacturer: 'Philips', model: 'Access CT', location: 'CT室3', status: '使用中' },
  { id: 'DEV-MR-01', name: 'MR-1（西门子MAGNETOM Vida）', modality: 'MR', manufacturer: 'Siemens', model: 'MAGNETOM Vida', location: 'MR室1', status: '使用中' },
  { id: 'DEV-MR-02', name: 'MR-2（飞利浦Ingenia）', modality: 'MR', manufacturer: 'Philips', model: 'Ingenia', location: 'MR室2', status: '维护中' },
  { id: 'DEV-MR-03', name: 'MR-3（GE SIGNA Premier）', modality: 'MR', manufacturer: 'GE', model: 'SIGNA Premier', location: 'MR室3', status: '空闲' },
  { id: 'DEV-DR-01', name: 'DR-1（飞利浦DigitalDiagnost）', modality: 'DR', manufacturer: 'Philips', model: 'DigitalDiagnost', location: 'DR室1', status: '使用中' },
  { id: 'DEV-DR-02', name: 'DR-2（GE Optima）', modality: 'DR', manufacturer: 'GE', model: 'Optima', location: 'DR室2', status: '空闲' },
  { id: 'DEV-DR-03', name: 'DR-3（西门子Yiso）', modality: 'DR', manufacturer: 'Siemens', model: 'Yiso', location: 'DR室3', status: '使用中' },
  { id: 'DEV-DSA-01', name: 'DSA-1（飞利浦Azurion 7）', modality: 'DSA', manufacturer: 'Philips', model: 'Azurion 7', location: 'DSA室1', status: '使用中' },
  { id: 'DEV-DSA-02', name: 'DSA-2（西门子Artis）', modality: 'DSA', manufacturer: 'Siemens', model: 'Artis', location: 'DSA室2', status: '空闲' },
  { id: 'DEV-MG-01', name: '乳腺钼靶（GE Senographe）', modality: '乳腺钼靶', manufacturer: 'GE', model: 'Senographe', location: '钼靶室1', status: '空闲' },
  { id: 'DEV-PET-01', name: 'PET-CT（西门子Biograph）', modality: 'PET-CT', manufacturer: 'Siemens', model: 'Biograph', location: 'PET-CT室1', status: '使用中' },
  { id: 'DEV-SPECT-01', name: 'SPECT-CT（GE Discovery）', modality: 'SPECT-CT', manufacturer: 'GE', model: 'Discovery', location: 'SPECT-CT室1', status: '空闲' },
  { id: 'DEV-US-01', name: '超声（GE Voluson）', modality: 'US', manufacturer: 'GE', model: 'Voluson', location: '超声室1', status: '使用中' },
]

// ==================== 检查室数据 ====================
export const EXAM_ROOMS_DATA = [
  { id: 'ROOM-CT1', name: 'CT室1', modality: ['CT'], deviceId: 'DEV-CT-01' },
  { id: 'ROOM-CT2', name: 'CT室2', modality: ['CT'], deviceId: 'DEV-CT-02' },
  { id: 'ROOM-CT3', name: 'CT室3', modality: ['CT'], deviceId: 'DEV-CT-03' },
  { id: 'ROOM-MR1', name: 'MR室1', modality: ['MR'], deviceId: 'DEV-MR-01' },
  { id: 'ROOM-MR2', name: 'MR室2', modality: ['MR'], deviceId: 'DEV-MR-02' },
  { id: 'ROOM-MR3', name: 'MR室3', modality: ['MR'], deviceId: 'DEV-MR-03' },
  { id: 'ROOM-DR1', name: 'DR室1', modality: ['DR'], deviceId: 'DEV-DR-01' },
  { id: 'ROOM-DR2', name: 'DR室2', modality: ['DR'], deviceId: 'DEV-DR-02' },
  { id: 'ROOM-DR3', name: 'DR室3', modality: ['DR'], deviceId: 'DEV-DR-03' },
  { id: 'ROOM-DSA1', name: 'DSA室1', modality: ['DSA'], deviceId: 'DEV-DSA-01' },
  { id: 'ROOM-DSA2', name: 'DSA室2', modality: ['DSA'], deviceId: 'DEV-DSA-02' },
  { id: 'ROOM-MG1', name: '钼靶室1', modality: ['乳腺钼靶'], deviceId: 'DEV-MG-01' },
  { id: 'ROOM-PET1', name: 'PET-CT室1', modality: ['PET-CT'], deviceId: 'DEV-PET-01' },
  { id: 'ROOM-SPECT1', name: 'SPECT-CT室1', modality: ['SPECT-CT'], deviceId: 'DEV-SPECT-01' },
  { id: 'ROOM-US1', name: '超声室1', modality: ['US'], deviceId: 'DEV-US-01' },
]

// ==================== 用户角色权限矩阵（5种角色）===================
export const ROLE_PERMISSIONS = {
  '医生': {
    menus: ['工作台', '报告书写', '报告审核', '历史报告', '我的报告', '统计报表'],
    buttons: ['书写报告', '提交报告', '撤回报告', '申请修改', '查看危急值', '查看历史'],
    examActions: ['查看', '书写', '提交'],
    reportActions: ['查看', '书写', '提交', '撤回'],
    canAudit: false,
    canManageTemplates: false,
  },
  '技师': {
    menus: ['工作台', '检查执行', '设备管理', '质控统计'],
    buttons: ['开始检查', '完成检查', '取消检查', '图像采集', '设备维护记录'],
    examActions: ['查看', '执行', '完成'],
    reportActions: ['查看'],
    canAudit: false,
    canManageTemplates: false,
  },
  '护士': {
    menus: ['工作台', '预约管理', '患者管理', '检查登记'],
    buttons: ['预约', '登记', '修改预约', '取消预约', '患者信息编辑', '打印检查单'],
    examActions: ['查看', '登记', '修改', '取消'],
    reportActions: ['查看'],
    canAudit: false,
    canManageTemplates: false,
  },
  '管理员': {
    menus: ['工作台', '患者管理', '报告管理', '设备管理', '预约管理', '统计报表', '系统设置', '用户管理', '字典管理'],
    buttons: ['增删改查', '导出数据', '系统配置', '用户管理', '数据备份', '权限管理'],
    examActions: ['查看', '新建', '修改', '删除', '执行', '报告'],
    reportActions: ['查看', '书写', '提交', '审核', '发布', '撤回', '删除'],
    canAudit: true,
    canManageTemplates: true,
  },
  '主任': {
    menus: ['工作台', '患者管理', '报告管理', '设备管理', '预约管理', '统计报表', '系统设置', '用户管理', '字典管理', '质控管理', '危急值管理', '会诊管理'],
    buttons: ['增删改查', '导出数据', '系统配置', '用户管理', '数据备份', '权限管理', '质控审核', '发布公告'],
    examActions: ['查看', '新建', '修改', '删除', '执行', '报告', '审核', '发布'],
    reportActions: ['查看', '书写', '提交', '审核', '发布', '撤回', '删除', '批量审核'],
    canAudit: true,
    canManageTemplates: true,
  },
}

// ==================== 200+条预约记录生成 ====================
function generateAppointmentRecords(): AppointmentRecord[] {
  const records: AppointmentRecord[] = []
  
  for (let i = 1; i <= 220; i++) {
    const firstName = randomElement(FIRST_NAMES)
    const lastName = randomElement(LAST_NAMES)
    const name = firstName + lastName
    const gender = Math.random() > 0.5 ? '男' : '女'
    const age = randomInt(18, 85)
    const phone = `1${randomInt(3, 9)}${'*'.repeat(4)}${randomInt(1000, 9999)}`
    const idCard = `${randomInt(110000, 659999)}${randomInt(1950, 2005)}${String(randomInt(1, 12)).padStart(2, '0')}${String(randomInt(1, 28)).padStart(2, '0')}${randomInt(1000, 9999)}`
    
    const examItem = randomElement(EXAM_ITEMS_DICT)
    const device = randomElement(DEVICE_DATA)
    const foundRoom = EXAM_ROOMS_DATA.find(r => r.deviceId === device.id)
    const fallbackRoom = EXAM_ROOMS_DATA[0]
    if (!foundRoom && !fallbackRoom) {
      continue
    }
    const room = foundRoom ?? fallbackRoom!
    const doctor = randomElement(DOCTORS)
    
    const daysAgo = randomInt(-7, 30)
    const examDate = getRelativeDateStr(daysAgo)
    const hour = randomInt(7, 18)
    const minute = randomInt(0, 5) * 10
    const examTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    
    const status = randomElement(STATUSES)
    const priority = randomElement(PRIORITIES)
    const regType = randomElement(REGISTRATION_TYPES)
    
    const createdDaysAgo = randomInt(1, 60)
    const createdDate = getRelativeDate(createdDaysAgo)
    const createdAt = `${formatDate(createdDate)} ${String(randomInt(8, 18)).padStart(2, '0')}:${String(randomInt(0, 5) * 10).padStart(2, '0')}:${String(randomInt(0, 5) * 10).padStart(2, '0')}`
    
    records.push({
      id: `APT-${String(i).padStart(4, '0')}`,
      patientId: `P2026${String(i).padStart(5, '0')}`,
      patientName: name,
      gender: gender as '男' | '女',
      age,
      phone,
      idCard,
      examItemId: examItem.id,
      examItemName: examItem.name,
      modality: examItem.modality as any,
      bodyPart: examItem.bodyPart,
      examDate,
      examTime,
      deviceId: device.id,
      deviceName: device.name,
      roomId: room.id,
      roomName: room.name,
      referringDoctorId: `D${String(randomInt(1, 30)).padStart(3, '0')}`,
      referringDoctorName: doctor,
      clinicalDiagnosis: randomElement(CLINICAL_DIAGNOSES),
      notes: Math.random() > 0.7 ? '需空腹' : (Math.random() > 0.5 ? '需家属陪同' : ''),
      status: status as any,
      priority: priority as any,
      registrationType: regType as any,
      createdAt,
    })
  }
  
  return records
}

export const APPOINTMENT_RECORDS = generateAppointmentRecords()

// ==================== 100条患者数据 ====================
function generatePatientRecords() {
  const patients: any[] = []
  
  for (let i = 1; i <= 100; i++) {
    const firstName = randomElement(FIRST_NAMES)
    const lastName = randomElement(LAST_NAMES)
    const name = firstName + lastName
    const gender = Math.random() > 0.5 ? '男' : '女'
    const age = randomInt(18, 90)
    const phone = `1${randomInt(3, 9)}${'*'.repeat(4)}${randomInt(1000, 9999)}`
    const idCard = `${randomInt(110000, 659999)}${randomInt(1950, 2005)}${String(randomInt(1, 12)).padStart(2, '0')}${String(randomInt(1, 28)).padStart(2, '0')}${randomInt(1000, 9999)}`
    
    const allergies = ['无', '青霉素', '碘对比剂', '海鲜', '花粉', '尘螨']
    const patientType = randomElement(['门诊', '住院', '体检', '急诊'])
    const primaryDiagnosis = randomElement(CLINICAL_DIAGNOSES)
    const address = `${randomElement(['上海市', '北京市', '广州市', '深圳市'])}${randomElement(['浦东新区', '徐汇区', '海淀区', '天河区', '朝阳区'])}`
    
    patients.push({
      id: `P2026${String(i).padStart(5, '0')}`,
      name,
      gender,
      age,
      phone,
      idCard,
      address,
      patientType,
      primaryDiagnosis,
      allergyHistory: randomElement(allergies),
    })
  }
  
  return patients
}

export const PATIENT_RECORDS = generatePatientRecords()

// ==================== 15条医保审核记录 ====================
export const INSURANCE_AUDIT_RECORDS: InsuranceAuditRecord[] = [
  {
    id: 'INS-001', patientName: '张伟', patientId: 'P202600001', examType: 'CT增强', examItem: '胸部CT增强',
    drugName: '碘海醇注射液', drugCategory: 'CT对比剂', drugSpec: '50ml:15g',
    restriction: '限CT增强检查使用', reason: '申请使用碘海醇注射液行胸部CT增强检查',
    submitTime: getRelativeDateStr(5) + ' 08:30', submitDept: '呼吸内科', urgency: '高',
    result: '通过', auditor: '医保办-李审核', auditTime: getRelativeDateStr(5) + ' 09:15', auditNotes: '符合医保限定支付条件'
  },
  {
    id: 'INS-002', patientName: '王芳', patientId: 'P202600002', examType: 'MRI增强', examItem: '头颅MRI增强',
    drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:7.5mmol',
    restriction: '限MRI增强检查使用', reason: '申请使用钆喷酸葡胺注射液行头颅MRI增强检查',
    submitTime: getRelativeDateStr(5) + ' 09:15', submitDept: '神经内科', urgency: '中',
    result: '通过', auditor: '医保办-王审核', auditTime: getRelativeDateStr(5) + ' 10:00', auditNotes: '影像学评估需要'
  },
  {
    id: 'INS-003', patientName: '李明', patientId: 'P202600003', examType: 'CT增强', examItem: '腹部CT增强',
    drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:32g',
    restriction: '限CT增强检查使用', reason: '申请使用碘克沙醇注射液行腹部CT增强检查',
    submitTime: getRelativeDateStr(4) + ' 10:20', submitDept: '消化内科', urgency: '高',
    result: '通过', auditor: '医保办-张审核', auditTime: getRelativeDateStr(4) + ' 11:00', auditNotes: '肝占位评估需要'
  },
  {
    id: 'INS-004', patientName: '刘洋', patientId: 'P202600004', examType: 'MRI增强', examItem: '乳腺MRI增强',
    drugName: '钆布醇注射液', drugCategory: 'MRI对比剂', drugSpec: '10ml:2.5mmol',
    restriction: '限MRI增强检查使用', reason: '申请使用钆布醇注射液行乳腺MRI增强检查',
    submitTime: getRelativeDateStr(4) + ' 11:45', submitDept: '乳腺外科', urgency: '中',
    result: '补充资料', auditor: '医保办-刘审核', auditTime: getRelativeDateStr(4) + ' 14:00', auditNotes: '需补充病理报告'
  },
  {
    id: 'INS-005', patientName: '陈静', patientId: 'P202600005', examType: 'DSA手术', examItem: '冠脉造影',
    drugName: '比伐卢定注射液', drugCategory: '抗凝药物', drugSpec: '0.6ml:5000IU',
    restriction: '限DSA手术使用', reason: '申请使用比伐卢定注射液行冠脉造影检查',
    submitTime: getRelativeDateStr(4) + ' 13:00', submitDept: '心内科', urgency: '高',
    result: '通过', auditor: '医保办-陈审核', auditTime: getRelativeDateStr(4) + ' 13:30', auditNotes: '冠心病诊断明确'
  },
  {
    id: 'INS-006', patientName: '杨勇', patientId: 'P202600006', examType: 'CT增强', examItem: '肺动脉CTA',
    drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:61.2g',
    restriction: '限CT增强检查使用', reason: '申请使用碘普罗胺注射液行肺动脉CTA检查',
    submitTime: getRelativeDateStr(3) + ' 14:30', submitDept: '呼吸内科', urgency: '高',
    result: '通过', auditor: '医保办-李审核', auditTime: getRelativeDateStr(3) + ' 15:00', auditNotes: '疑似肺栓塞，紧急'
  },
  {
    id: 'INS-007', patientName: '赵磊', patientId: 'P202600007', examType: 'MRI增强', examItem: '前列腺MRI增强',
    drugName: '钆贝葡胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:4.305g',
    restriction: '限MRI增强检查使用', reason: '申请使用钆贝葡胺注射液行前列腺MRI增强检查',
    submitTime: getRelativeDateStr(3) + ' 15:45', submitDept: '泌尿外科', urgency: '中',
    result: '通过', auditor: '医保办-王审核', auditTime: getRelativeDateStr(3) + ' 16:30', auditNotes: '前列腺癌筛查需要'
  },
  {
    id: 'INS-008', patientName: '黄丽', patientId: 'P202600008', examType: 'DSA手术', examItem: '脑血管DSA',
    drugName: '肝素钠注射液', drugCategory: '抗凝药物', drugSpec: '12500U/支',
    restriction: '限DSA手术使用', reason: '申请使用肝素钠注射液行脑血管DSA检查',
    submitTime: getRelativeDateStr(2) + ' 08:00', submitDept: '神经内科', urgency: '低',
    result: '拒绝', auditor: '医保办-张审核', auditTime: getRelativeDateStr(2) + ' 09:00', auditNotes: 'MRA未见明确异常，暂不需要DSA'
  },
  {
    id: 'INS-009', patientName: '周强', patientId: 'P202600009', examType: 'CT增强', examItem: '冠脉CTA',
    drugName: '碘佛醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:35g',
    restriction: '限CT增强检查使用', reason: '申请使用碘佛醇注射液行冠脉CTA检查',
    submitTime: getRelativeDateStr(2) + ' 09:30', submitDept: '心内科', urgency: '高',
    result: '通过', auditor: '医保办-刘审核', auditTime: getRelativeDateStr(2) + ' 10:15', auditNotes: '冠心病筛查需要'
  },
  {
    id: 'INS-010', patientName: '吴敏', patientId: 'P202600010', examType: 'MRI增强', examItem: '心脏MR',
    drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:4.305g',
    restriction: '限MRI增强检查使用', reason: '申请使用钆双胺注射液行心脏MR检查',
    submitTime: getRelativeDateStr(2) + ' 10:45', submitDept: '心内科', urgency: '中',
    result: '通过', auditor: '医保办-陈审核', auditTime: getRelativeDateStr(2) + ' 11:30', auditNotes: '心肌病评估需要'
  },
  {
    id: 'INS-011', patientName: '徐涛', patientId: 'P202600011', examType: 'CT增强', examItem: '头颅CT增强',
    drugName: '碘帕醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:37g',
    restriction: '限CT增强检查使用', reason: '申请使用碘帕醇注射液行头颅CT增强检查',
    submitTime: getRelativeDateStr(1) + ' 11:30', submitDept: '神经内科', urgency: '高',
    result: '通过', auditor: '医保办-李审核', auditTime: getRelativeDateStr(1) + ' 12:00', auditNotes: '脑血管病评估'
  },
  {
    id: 'INS-012', patientName: '孙燕', patientId: 'P202600012', examType: 'DSA手术', examItem: '肾动脉DSA',
    drugName: '磺达肝癸钠注射液', drugCategory: '抗凝药物', drugSpec: '2.5mg/支',
    restriction: '限DSA手术使用', reason: '申请使用磺达肝癸钠注射液行肾动脉DSA检查',
    submitTime: getRelativeDateStr(1) + ' 13:00', submitDept: '肾内科', urgency: '低',
    result: '补充资料', auditor: '医保办-王审核', auditTime: getRelativeDateStr(1) + ' 14:00', auditNotes: '需补充肾功能报告'
  },
  {
    id: 'INS-013', patientName: '马超', patientId: 'P202600013', examType: 'CT增强', examItem: '腹部CT增强',
    drugName: '碘海醇注射液', drugCategory: 'CT对比剂', drugSpec: '50ml:15g',
    restriction: '限CT增强检查使用', reason: '申请使用碘海醇注射液行腹部CT增强检查',
    submitTime: getRelativeDateStr(1) + ' 14:15', submitDept: '肿瘤科', urgency: '中',
    result: '通过', auditor: '医保办-张审核', auditTime: getRelativeDateStr(1) + ' 15:00', auditNotes: '肿瘤复查需要'
  },
  {
    id: 'INS-014', patientName: '朱琳', patientId: 'P202600014', examType: 'MRI增强', examItem: '颅底MRI增强',
    drugName: '钆特醇注射液', drugCategory: 'MRI对比剂', drugSpec: '10ml:3.0mmol',
    restriction: '限MRI增强检查使用', reason: '申请使用钆特醇注射液行颅底MRI增强检查',
    submitTime: getRelativeDateStr(0) + ' 15:30', submitDept: '神经外科', urgency: '中',
    result: '通过', auditor: '医保办-刘审核', auditTime: getRelativeDateStr(0) + ' 16:00', auditNotes: '颅底病变评估'
  },
  {
    id: 'INS-015', patientName: '胡鹏', patientId: 'P202600015', examType: 'DSA手术', examItem: '外周血管DSA',
    drugName: '阿加曲班注射液', drugCategory: '抗凝药物', drugSpec: '20mg/支',
    restriction: '限DSA手术使用', reason: '申请使用阿加曲班注射液行外周血管DSA检查',
    submitTime: getRelativeDateStr(0) + ' 16:45', submitDept: '血管外科', urgency: '低',
    result: '拒绝', auditor: '医保办-陈审核', auditTime: getRelativeDateStr(0) + ' 17:30', auditNotes: '抗凝药物选择不符合指南'
  },
]

// ==================== 10条患者随访记录 ====================
export const FOLLOW_UP_RECORDS: FollowUpRecord[] = [
  {
    id: 'FU-001', patientId: 'P202500001', patientName: '李四', gender: '男', age: 58, phone: '138****1111',
    examType: 'MRI增强', examItemName: '头颅MRI增强', examDate: getRelativeDateStr(130),
    followUpType: '肿瘤复查', nextFollowUpDate: getRelativeDateStr(-60), status: '进行中',
    reaction: '轻度', notes: '肺癌术后3个月复查，影像学评估显示稳定',
    referringDoctor: '肿瘤科-张主任', department: '肿瘤科', createdAt: getRelativeDateStr(130) + ' 10:00:00'
  },
  {
    id: 'FU-002', patientId: 'P202500002', patientName: '王五', gender: '女', age: 45, phone: '139****2222',
    examType: 'CT平扫', examItemName: '胸部CT平扫', examDate: getRelativeDateStr(30),
    followUpType: '早期肺癌跟踪', nextFollowUpDate: getRelativeDateStr(-30), status: '已完成',
    reaction: '中度', notes: '肺结节6个月随访，大小稳定，继续观察',
    referringDoctor: '呼吸科-李医生', department: '呼吸内科', createdAt: getRelativeDateStr(30) + ' 14:00:00'
  },
  {
    id: 'FU-003', patientId: 'P202500003', patientName: '赵六', gender: '男', age: 62, phone: '137****3333',
    examType: 'MRI平扫', examItemName: '腹部MRI平扫', examDate: getRelativeDateStr(60),
    followUpType: '治疗评估', nextFollowUpDate: getRelativeDateStr(7), status: '逾期',
    reaction: '重度', notes: '肝癌介入治疗后影像学评估，肿瘤标记物升高',
    referringDoctor: '消化科-王主任', department: '消化内科', createdAt: getRelativeDateStr(60) + ' 09:00:00'
  },
  {
    id: 'FU-004', patientId: 'P202500004', patientName: '钱七', gender: '女', age: 52, phone: '136****4444',
    examType: 'PET-CT', examItemName: '全身PET-CT', examDate: getRelativeDateStr(15),
    followUpType: '术后复查', nextFollowUpDate: getRelativeDateStr(-75), status: '待随访',
    reaction: '无反应', notes: '乳腺癌术后全身评估，未见转移征象',
    referringDoctor: '乳腺科-赵医生', department: '乳腺外科', createdAt: getRelativeDateStr(15) + ' 11:00:00'
  },
  {
    id: 'FU-005', patientId: 'P202500005', patientName: '孙八', gender: '男', age: 68, phone: '135****5555',
    examType: 'SPECT-CT', examItemName: '骨扫描', examDate: getRelativeDateStr(25),
    followUpType: '介入治疗后评估', nextFollowUpDate: getRelativeDateStr(-190), status: '进行中',
    reaction: '轻度', notes: '前列腺癌骨转移治疗后疗效评估',
    referringDoctor: '泌尿科-刘主任', department: '泌尿外科', createdAt: getRelativeDateStr(25) + ' 08:30:00'
  },
  {
    id: 'FU-006', patientId: 'P202500006', patientName: '周九', gender: '女', age: 41, phone: '134****6666',
    examType: 'CT增强', examItemName: '腹部CT增强', examDate: getRelativeDateStr(120),
    followUpType: '对比剂反应', nextFollowUpDate: getRelativeDateStr(-240), status: '已完成',
    reaction: '中度', notes: '常规增强检查后出现轻微恶心，休息后缓解，已恢复',
    referringDoctor: '体检科-陈医生', department: '体检科', createdAt: getRelativeDateStr(120) + ' 10:30:00'
  },
  {
    id: 'FU-007', patientId: 'P202500007', patientName: '吴十', gender: '男', age: 55, phone: '133****7777',
    examType: 'MRI增强', examItemName: '前列腺MRI增强', examDate: getRelativeDateStr(40),
    followUpType: '肿瘤复查', nextFollowUpDate: getRelativeDateStr(20), status: '逾期',
    reaction: '重度', notes: '前列腺癌根治术后生化复发，需进一步评估',
    referringDoctor: '泌尿科-孙主任', department: '泌尿外科', createdAt: getRelativeDateStr(40) + ' 14:00:00'
  },
  {
    id: 'FU-008', patientId: 'P202500008', patientName: '郑一', gender: '女', age: 38, phone: '132****8888',
    examType: 'CT平扫', examItemName: '胸部CT平扫', examDate: getRelativeDateStr(125),
    followUpType: '早期肺癌跟踪', nextFollowUpDate: getRelativeDateStr(-15), status: '待随访',
    reaction: '无反应', notes: '肺结节随访中，CT增强后皮疹，给予抗过敏处理后好转',
    referringDoctor: '呼吸科-周医生', department: '呼吸内科', createdAt: getRelativeDateStr(125) + ' 09:00:00'
  },
  {
    id: 'FU-009', patientId: 'P202500009', patientName: '冯二', gender: '男', age: 48, phone: '131****9999',
    examType: 'MRI平扫', examItemName: '腹部MRI平扫', examDate: getRelativeDateStr(65),
    followUpType: '治疗评估', nextFollowUpDate: getRelativeDateStr(-150), status: '进行中',
    reaction: '轻度', notes: '肝癌介入治疗后复查，MRI增强后肝功能异常，保肝治疗中',
    referringDoctor: '消化科-吴主任', department: '消化内科', createdAt: getRelativeDateStr(65) + ' 11:30:00'
  },
  {
    id: 'FU-010', patientId: 'P202500010', patientName: '陈三', gender: '女', age: 35, phone: '130****0000',
    examType: 'PET-CT', examItemName: '全身PET-CT', examDate: getRelativeDateStr(115),
    followUpType: '术后复查', nextFollowUpDate: getRelativeDateStr(-90), status: '已完成',
    reaction: '中度', notes: '淋巴瘤治疗后评估，注射碘对比剂后出现轻微恶心，休息后缓解',
    referringDoctor: '血液科-杨主任', department: '血液科', createdAt: getRelativeDateStr(115) + ' 08:00:00'
  },
]

// ==================== 10条设备维保合同 ====================
export const DEVICE_MAINTENANCE_CONTRACTS: DeviceMaintenanceContract[] = [
  {
    id: 'MC-001', contractNo: 'HT-2026-CT-001', deviceId: 'DEV-CT-01', deviceName: 'CT-1（GE Revolution CT）',
    deviceModel: 'GE Revolution CT', serialNumber: 'CT2020GE001',
    company: 'GE医疗中国', contactPerson: '张工', contactTel: '400-880-1001',
    startDate: getRelativeDateStr(150), endDate: getRelativeDateStr(-15), amount: 850000,
    paymentStatus: '已付款', coverage: '全保（含CT球管、探测器、软件升级）',
    serviceLevel: '白金', renewHistory: [
      { year: 2025, amount: 820000, status: '已到期' },
      { year: 2024, amount: 780000, status: '已到期' }
    ], createdAt: getRelativeDateStr(180) + ' 10:00:00'
  },
  {
    id: 'MC-002', contractNo: 'HT-2026-CT-002', deviceId: 'DEV-CT-02', deviceName: 'CT-2（西门子SOMATOM Force）',
    deviceModel: 'SOMATOM Force', serialNumber: 'CT2021SI002',
    company: '西门子医疗', contactPerson: '李工', contactTel: '400-880-2002',
    startDate: getRelativeDateStr(150), endDate: getRelativeDateStr(-15), amount: 920000,
    paymentStatus: '已付款', coverage: '全保（含球管、探测器）',
    serviceLevel: '白金', renewHistory: [
      { year: 2025, amount: 880000, status: '已到期' },
      { year: 2024, amount: 850000, status: '已到期' }
    ], createdAt: getRelativeDateStr(180) + ' 11:00:00'
  },
  {
    id: 'MC-003', contractNo: 'HT-2026-MR-001', deviceId: 'DEV-MR-01', deviceName: 'MR-1（西门子MAGNETOM Vida）',
    deviceModel: 'MAGNETOM Vida', serialNumber: 'MR2020SI001',
    company: '西门子医疗', contactPerson: '王工', contactTel: '400-880-2003',
    startDate: getRelativeDateStr(150), endDate: getRelativeDateStr(-15), amount: 1200000,
    paymentStatus: '已付款', coverage: '全保（含磁体、梯度放大器、谱仪）',
    serviceLevel: '白金', renewHistory: [
      { year: 2025, amount: 1150000, status: '已到期' },
      { year: 2024, amount: 1100000, status: '已到期' }
    ], createdAt: getRelativeDateStr(180) + ' 09:00:00'
  },
  {
    id: 'MC-004', contractNo: 'HT-2026-MR-002', deviceId: 'DEV-MR-02', deviceName: 'MR-2（飞利浦Ingenia）',
    deviceModel: 'Ingenia', serialNumber: 'MR2021PH002',
    company: '飞利浦医疗', contactPerson: '赵工', contactTel: '400-880-3001',
    startDate: getRelativeDateStr(150), endDate: getRelativeDateStr(-15), amount: 1150000,
    paymentStatus: '已付款', coverage: '全保',
    serviceLevel: '白金', renewHistory: [
      { year: 2025, amount: 1100000, status: '已到期' },
      { year: 2024, amount: 1050000, status: '已到期' }
    ], createdAt: getRelativeDateStr(180) + ' 10:30:00'
  },
  {
    id: 'MC-005', contractNo: 'HT-2026-DR-001', deviceId: 'DEV-DR-01', deviceName: 'DR-1（飞利浦DigitalDiagnost）',
    deviceModel: 'DigitalDiagnost', serialNumber: 'DR2019PH001',
    company: '飞利浦医疗', contactPerson: '刘工', contactTel: '400-880-3002',
    startDate: getRelativeDateStr(150), endDate: getRelativeDateStr(-15), amount: 350000,
    paymentStatus: '待付款', coverage: '标准保养（不含探测器）',
    serviceLevel: '标准', renewHistory: [
      { year: 2025, amount: 330000, status: '已到期' },
      { year: 2024, amount: 320000, status: '已到期' }
    ], createdAt: getRelativeDateStr(180) + ' 14:00:00'
  },
  {
    id: 'MC-006', contractNo: 'HT-2026-DSA-001', deviceId: 'DEV-DSA-01', deviceName: 'DSA-1（飞利浦Azurion 7）',
    deviceModel: 'Azurion 7', serialNumber: 'DSA2020PH001',
    company: '飞利浦医疗', contactPerson: '陈工', contactTel: '400-880-3003',
    startDate: getRelativeDateStr(150), endDate: getRelativeDateStr(-15), amount: 1500000,
    paymentStatus: '已付款', coverage: '全保（含球管、平板探测器）',
    serviceLevel: '高级', renewHistory: [
      { year: 2025, amount: 1420000, status: '已到期' },
      { year: 2024, amount: 1380000, status: '已到期' }
    ], createdAt: getRelativeDateStr(180) + ' 15:00:00'
  },
  {
    id: 'MC-007', contractNo: 'HT-2026-MG-001', deviceId: 'DEV-MG-01', deviceName: '乳腺钼靶（GE Senographe）',
    deviceModel: 'Senographe', serialNumber: 'MG2019GE001',
    company: 'GE医疗中国', contactPerson: '周工', contactTel: '400-880-1002',
    startDate: getRelativeDateStr(150), endDate: getRelativeDateStr(-15), amount: 280000,
    paymentStatus: '已付款', coverage: '标准保养',
    serviceLevel: '标准', renewHistory: [
      { year: 2025, amount: 265000, status: '已到期' },
      { year: 2024, amount: 250000, status: '已到期' }
    ], createdAt: getRelativeDateStr(180) + ' 16:00:00'
  },
  {
    id: 'MC-008', contractNo: 'HT-2026-PET-001', deviceId: 'DEV-PET-01', deviceName: 'PET-CT（西门子Biograph）',
    deviceModel: 'Biograph', serialNumber: 'PET2020SI001',
    company: '西门子医疗', contactPerson: '吴工', contactTel: '400-880-2004',
    startDate: getRelativeDateStr(150), endDate: getRelativeDateStr(-15), amount: 2800000,
    paymentStatus: '已付款', coverage: '全保（含晶体、探测器、软件）',
    serviceLevel: '白金', renewHistory: [
      { year: 2025, amount: 2650000, status: '已到期' },
      { year: 2024, amount: 2500000, status: '已到期' }
    ], createdAt: getRelativeDateStr(180) + ' 08:00:00'
  },
  {
    id: 'MC-009', contractNo: 'HT-2026-SPECT-001', deviceId: 'DEV-SPECT-01', deviceName: 'SPECT-CT（GE Discovery）',
    deviceModel: 'Discovery', serialNumber: 'SPECT2019GE001',
    company: 'GE医疗中国', contactPerson: '郑工', contactTel: '400-880-1003',
    startDate: getRelativeDateStr(150), endDate: getRelativeDateStr(-15), amount: 680000,
    paymentStatus: '已付款', coverage: '全保',
    serviceLevel: '高级', renewHistory: [
      { year: 2025, amount: 650000, status: '已到期' },
      { year: 2024, amount: 620000, status: '已到期' }
    ], createdAt: getRelativeDateStr(180) + ' 09:30:00'
  },
  {
    id: 'MC-010', contractNo: 'HT-2026-CT-003', deviceId: 'DEV-CT-03', deviceName: 'CT-3（飞利浦Access CT）',
    deviceModel: 'Access CT', serialNumber: 'CT2018PH003',
    company: '飞利浦医疗', contactPerson: '冯工', contactTel: '400-880-3004',
    startDate: getRelativeDateStr(150), endDate: getRelativeDateStr(-15), amount: 420000,
    paymentStatus: '已逾期', coverage: '标准保养',
    serviceLevel: '标准', renewHistory: [
      { year: 2025, amount: 400000, status: '已到期' }
    ], createdAt: getRelativeDateStr(180) + ' 10:00:00'
  },
]

// ==================== 临床数据同步记录 ====================
export const CLINICAL_SYNC_RECORDS: ClinicalSyncRecord[] = [
  {
    id: 'SYNC-001', systemName: 'HIS系统', systemCode: 'HIS', recordType: '患者信息',
    patientId: 'P202600001', patientName: '张伟', dataContent: '门诊挂号信息',
    syncTime: getRelativeDateStr(1) + ' 08:00:00', status: '已同步', retryCount: 0, dataVolume: '2KB', sourceDept: '挂号处'
  },
  {
    id: 'SYNC-002', systemName: 'PACS系统', systemCode: 'PACS', recordType: '检查图像',
    patientId: 'P202600002', patientName: '王芳', dataContent: 'MRI头颅检查图像',
    syncTime: getRelativeDateStr(1) + ' 09:30:00', status: '已同步', retryCount: 0, dataVolume: '120MB', sourceDept: '放射科'
  },
  {
    id: 'SYNC-003', systemName: 'LIS系统', systemCode: 'LIS', recordType: '检验结果',
    patientId: 'P202600003', patientName: '李明', dataContent: '肝功能检验结果',
    syncTime: getRelativeDateStr(1) + ' 10:15:00', status: '已同步', retryCount: 0, dataVolume: '15KB', sourceDept: '检验科'
  },
  {
    id: 'SYNC-004', systemName: 'HIS系统', systemCode: 'HIS', recordType: '医嘱信息',
    patientId: 'P202600004', patientName: '刘洋', dataContent: '乳腺MRI增强医嘱',
    syncTime: getRelativeDateStr(0) + ' 11:00:00', status: '同步中', retryCount: 1, dataVolume: '3KB', sourceDept: '乳腺外科'
  },
  {
    id: 'SYNC-005', systemName: 'PACS系统', systemCode: 'PACS', recordType: '检查图像',
    patientId: 'P202600005', patientName: '陈静', dataContent: 'DR腰椎正侧位图像',
    syncTime: getRelativeDateStr(0) + ' 11:30:00', status: '已同步', retryCount: 0, dataVolume: '8MB', sourceDept: '放射科'
  },
]

// ==================== 影像会诊记录 ====================
export const CONSULTATION_RECORDS: ConsultationRecord[] = [
  {
    id: 'CONS-001', consultationNo: 'MDT-2026-001', patientName: '李明', patientId: 'P202600003',
    gender: '男', age: 62, examType: 'CT增强', examItemName: '腹部CT增强',
    requestDept: '消化内科', requestDoctor: '孙强', targetHospital: '北京协和医院', targetDoctor: '影像科-张教授',
    consultationType: 'MDT', urgency: '紧急', status: '已完成',
    requestTime: getRelativeDateStr(5) + ' 14:00:00', completedTime: getRelativeDateStr(3) + ' 10:00:00',
    diagnosis: '肝占位性病变，倾向于肝血管瘤可能',
    opinion: '建议行MRI增强进一步明确性质'
  },
  {
    id: 'CONS-002', consultationNo: '远程-2026-015', patientName: '刘洋', patientId: 'P202600004',
    gender: '女', age: 28, examType: 'MR增强', examItemName: '乳腺MR增强',
    requestDept: '乳腺外科', requestDoctor: '周婷', targetHospital: '复旦大学肿瘤医院', targetDoctor: '乳腺科-王教授',
    consultationType: '远程会诊', urgency: '普通', status: '已回复',
    requestTime: getRelativeDateStr(3) + ' 09:00:00',
    diagnosis: '乳腺结节BI-RADS 4A类',
    opinion: '建议穿刺活检明确病理'
  },
  {
    id: 'CONS-003', consultationNo: '疑难-2026-022', patientName: '胡鹏', patientId: 'P202600015',
    gender: '男', age: 48, examType: 'DSA', examItemName: '脑血管DSA',
    requestDept: '神经外科', requestDoctor: '肖强', targetHospital: '上海华山医院', targetDoctor: '神经介入科-李教授',
    consultationType: '疑难病例', urgency: '紧急', status: '进行中',
    requestTime: getRelativeDateStr(1) + ' 08:00:00',
    diagnosis: '待明确',
    opinion: ''
  },
]

// ==================== 导出数据统计 ====================
// console.log(`[simulationData] 生成数据统计:`)
// console.log(`  - 预约记录: ${APPOINTMENT_RECORDS.length} 条`)
// console.log(`  - 患者记录: ${PATIENT_RECORDS.length} 条`)
// console.log(`  - 检查项目: ${EXAM_ITEMS_DICT.length} 项`)
// console.log(`  - 设备数据: ${DEVICE_DATA.length} 台`)
// console.log(`  - 医保审核: ${INSURANCE_AUDIT_RECORDS.length} 条`)
// console.log(`  - 随访记录: ${FOLLOW_UP_RECORDS.length} 条`)
// console.log(`  - 维保合同: ${DEVICE_MAINTENANCE_CONTRACTS.length} 条`)
// console.log(`  - 临床同步: ${CLINICAL_SYNC_RECORDS.length} 条`)
// console.log(`  - 会诊记录: ${CONSULTATION_RECORDS.length} 条`)
// console.log(`  - 角色权限: ${Object.keys(ROLE_PERMISSIONS).length} 种角色`)