/**
 * HIE Adapter - 医疗信息交换适配器
 * G005 Radiology RIS System
 *
 * 功能：支持与外部医疗机构进行PIX/eMPI患者交叉引用、
 * FHIR-like观察结果交换、文档引用同步
 *
 * 主题色：蓝色 #3b82f6
 */

import { z } from 'zod';

// ============= 颜色主题 =============
export const HIE_COLOR = '#3b82f6';
export const HIE_COLORS = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#1d4ed8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  background: {
    light: '#eff6ff',
    dark: '#1e3a5f',
  },
};

// ============= Zod 验证模式 =============
export const InstitutionSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  level: z.enum(['三级甲等', '三级乙等', '二级甲等', '二级乙等', '一级', '社区']),
  type: z.enum(['综合医院', '专科医院', '中医医院', '妇幼保健院', '疾控中心', '其他']),
  region: z.string(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  isConnected: z.boolean(),
  lastSyncTime: z.string().optional(),
});

export const PatientIdentitySchema = z.object({
  id: z.string(),
  patientId: z.string(),
  identityDomain: z.enum(['MRN', 'NID', 'PP', 'SSN', 'DL']),
  identityNumber: z.string(),
  patientName: z.string(),
  gender: z.enum(['男', '女', '其他']),
  birthDate: z.string(),
  institutionId: z.string(),
  verified: z.boolean(),
  verifiedAt: z.string().optional(),
});

export const ObservationSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  code: z.string(),
  display: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  effectiveDateTime: z.string(),
  status: z.enum(['正常', '异常', '危急']),
  interpretation: z.string().optional(),
  institutionId: z.string(),
  category: z.enum(['实验室检查', '影像检查', '体格检查', '生命体征', '病理检查']),
});

export const DocumentReferenceSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  institutionId: z.string(),
  type: z.enum(['检查报告', '检验报告', '病历', '处方', '出院小结', '其他']),
  modality: z.string().optional(),
  studyDate: z.string(),
  reportDate: z.string(),
  authorName: z.string(),
  reportContent: z.string().optional(),
  fileUrl: z.string().optional(),
  status: z.enum(['原始', '已同步', '已归档', '已作废']),
  isAvailable: z.boolean(),
});

export const CrossInstitutionQuerySchema = z.object({
  patientName: z.string().optional(),
  idCard: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['男', '女', '其他']).optional(),
  queryDomains: z.array(z.enum(['MRN', 'NID', 'PP', 'SSN', 'DL'])).optional(),
  institutions: z.array(z.string()).optional(),
});

export const DataExchangeResultSchema = z.object({
  success: z.boolean(),
  transactionId: z.string(),
  timestamp: z.string(),
  dataType: z.enum(['patient', 'observation', 'document']),
  direction: z.enum(['send', 'receive']),
  institutionId: z.string(),
  recordsAffected: z.number(),
  errors: z.array(z.string()).optional(),
});

// ============= 类型定义 =============
export type InstitutionLevel = '三级甲等' | '三级乙等' | '二级甲等' | '二级乙等' | '一级' | '社区';
export type InstitutionType = '综合医院' | '专科医院' | '中医医院' | '妇幼保健院' | '疾控中心' | '其他';
export type IdentityDomain = 'MRN' | 'NID' | 'PP' | 'SSN' | 'DL';
export type ObservationCategory = '实验室检查' | '影像检查' | '体格检查' | '生命体征' | '病理检查';
export type ObservationStatus = '正常' | '异常' | '危急';
export type DocumentType = '检查报告' | '检验报告' | '病历' | '处方' | '出院小结' | '其他';
export type DocumentStatus = '原始' | '已同步' | '已归档' | '已作废';
export type DataDirection = 'send' | 'receive';
export type DataType = 'patient' | 'observation' | 'document';

export interface Institution {
  id: string;
  name: string;
  code: string;
  level: InstitutionLevel;
  type: InstitutionType;
  region: string;
  contactPhone?: string;
  address?: string;
  isConnected: boolean;
  lastSyncTime?: string;
}

export interface PatientIdentity {
  id: string;
  patientId: string;
  identityDomain: IdentityDomain;
  identityNumber: string;
  patientName: string;
  gender: '男' | '女' | '其他';
  birthDate: string;
  institutionId: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface Observation {
  id: string;
  patientId: string;
  code: string;
  display: string;
  value: string | number;
  unit?: string;
  effectiveDateTime: string;
  status: ObservationStatus;
  interpretation?: string;
  institutionId: string;
  category: ObservationCategory;
}

export interface DocumentReference {
  id: string;
  patientId: string;
  institutionId: string;
  type: DocumentType;
  modality?: string;
  studyDate: string;
  reportDate: string;
  authorName: string;
  reportContent?: string;
  fileUrl?: string;
  status: DocumentStatus;
  isAvailable: boolean;
}

export interface CrossInstitutionQuery {
  patientName?: string;
  idCard?: string;
  birthDate?: string;
  gender?: '男' | '女' | '其他';
  queryDomains?: IdentityDomain[];
  institutions?: string[];
}

export interface DataExchangeResult {
  success: boolean;
  transactionId: string;
  timestamp: string;
  dataType: DataType;
  direction: DataDirection;
  institutionId: string;
  recordsAffected: number;
  errors?: string[];
}

export interface ExchangeHistory {
  id: string;
  transactionId: string;
  dataType: DataType;
  direction: DataDirection;
  sourceInstitutionId: string;
  targetInstitutionId: string;
  patientId: string;
  recordCount: number;
  timestamp: string;
  status: '成功' | '部分成功' | '失败';
  errorMessage?: string;
}

// ============= 模拟数据 =============

/** 模拟医疗机构数据 */
export const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'INST001',
    name: '中山大学附属第一医院',
    code: 'ZSYD001',
    level: '三级甲等',
    type: '综合医院',
    region: '广州市越秀区',
    contactPhone: '020-87755777',
    address: '广州市越秀区中山二路58号',
    isConnected: true,
    lastSyncTime: '2026-05-27T10:30:00+08:00',
  },
  {
    id: 'INST002',
    name: '广东省人民医院',
    code: 'GDSY002',
    level: '三级甲等',
    type: '综合医院',
    region: '广州市越秀区',
    contactPhone: '020-83827812',
    address: '广州市越秀区中山二路106号',
    isConnected: true,
    lastSyncTime: '2026-05-27T09:15:00+08:00',
  },
  {
    id: 'INST003',
    name: '广州市第一人民医院',
    code: 'GZSY003',
    level: '三级甲等',
    type: '综合医院',
    region: '广州市越秀区',
    contactPhone: '020-81048888',
    address: '广州市越秀区盘福路1号',
    isConnected: true,
    lastSyncTime: '2026-05-27T08:45:00+08:00',
  },
  {
    id: 'INST004',
    name: '中山大学肿瘤防治中心',
    code: 'ZSYD004',
    level: '三级甲等',
    type: '专科医院',
    region: '广州市越秀区',
    contactPhone: '020-87343088',
    address: '广州市越秀区东风东路651号',
    isConnected: true,
    lastSyncTime: '2026-05-26T16:20:00+08:00',
  },
  {
    id: 'INST005',
    name: '广东省中医院',
    code: 'GDSZY005',
    level: '三级甲等',
    type: '中医医院',
    region: '广州市越秀区',
    contactPhone: '020-81887233',
    address: '广州市越秀区大德路111号',
    isConnected: true,
    lastSyncTime: '2026-05-27T07:30:00+08:00',
  },
  {
    id: 'INST006',
    name: '广州医科大学附属第一医院',
    code: 'GZYD006',
    level: '三级甲等',
    type: '综合医院',
    region: '广州市越秀区',
    contactPhone: '020-83062000',
    address: '广州市越秀区沿江路151号',
    isConnected: true,
    lastSyncTime: '2026-05-27T11:00:00+08:00',
  },
  {
    id: 'INST007',
    name: '中山大学孙逸仙纪念医院',
    code: 'ZSYD007',
    level: '三级甲等',
    type: '综合医院',
    region: '广州市越秀区',
    contactPhone: '020-81332199',
    address: '广州市越秀区沿江路107号',
    isConnected: false,
    lastSyncTime: '2026-05-25T14:30:00+08:00',
  },
  {
    id: 'INST008',
    name: '广东省妇幼保健院',
    code: 'GDSFY008',
    level: '三级甲等',
    type: '妇幼保健院',
    region: '广州市越秀区',
    contactPhone: '020-61118666',
    address: '广州市越秀区广园西路13号',
    isConnected: true,
    lastSyncTime: '2026-05-27T06:45:00+08:00',
  },
  {
    id: 'INST009',
    name: '广州市胸科医院',
    code: 'GZXK009',
    level: '三级甲等',
    type: '专科医院',
    region: '广州市越秀区',
    contactPhone: '020-83595977',
    address: '广州市越秀区横枝岗路62号',
    isConnected: true,
    lastSyncTime: '2026-05-26T20:10:00+08:00',
  },
  {
    id: 'INST010',
    name: '越秀区妇幼保健院',
    code: 'YXQFY010',
    level: '二级甲等',
    type: '妇幼保健院',
    region: '广州市越秀区',
    contactPhone: '020-83394547',
    address: '广州市越秀区中山五路2号',
    isConnected: true,
    lastSyncTime: '2026-05-27T12:00:00+08:00',
  },
];

/** 模拟跨机构患者身份数据 */
export const MOCK_PATIENT_IDENTITIES: PatientIdentity[] = [
  {
    id: 'PI001', patientId: 'PAT001',
    identityDomain: 'MRN', identityNumber: 'MRN440103001',
    patientName: '张伟', gender: '男', birthDate: '1965-03-15',
    institutionId: 'INST001', verified: true, verifiedAt: '2026-01-10T09:00:00+08:00',
  },
  {
    id: 'PI002', patientId: 'PAT001',
    identityDomain: 'NID', identityNumber: '440102196503151234',
    patientName: '张伟', gender: '男', birthDate: '1965-03-15',
    institutionId: 'INST001', verified: true, verifiedAt: '2026-01-10T09:05:00+08:00',
  },
  {
    id: 'PI003', patientId: 'PAT002',
    identityDomain: 'MRN', identityNumber: 'MRN440103002',
    patientName: '李娜', gender: '女', birthDate: '1978-07-22',
    institutionId: 'INST001', verified: true, verifiedAt: '2026-02-05T14:30:00+08:00',
  },
  {
    id: 'PI004', patientId: 'PAT002',
    identityDomain: 'NID', identityNumber: '440102197807221567',
    patientName: '李娜', gender: '女', birthDate: '1978-07-22',
    institutionId: 'INST002', verified: true, verifiedAt: '2026-02-05T14:35:00+08:00',
  },
  {
    id: 'PI005', patientId: 'PAT003',
    identityDomain: 'MRN', identityNumber: 'MRN440103003',
    patientName: '王建国', gender: '男', birthDate: '1952-11-08',
    institutionId: 'INST001', verified: true, verifiedAt: '2026-01-20T10:00:00+08:00',
  },
  {
    id: 'PI006', patientId: 'PAT004',
    identityDomain: 'MRN', identityNumber: 'MRN440103004',
    patientName: '陈淑芬', gender: '女', birthDate: '1988-04-30',
    institutionId: 'INST001', verified: true, verifiedAt: '2026-03-01T11:20:00+08:00',
  },
  {
    id: 'PI007', patientId: 'PAT004',
    identityDomain: 'NID', identityNumber: '440102198804301234',
    patientName: '陈淑芬', gender: '女', birthDate: '1988-04-30',
    institutionId: 'INST003', verified: true, verifiedAt: '2026-03-01T11:25:00+08:00',
  },
  {
    id: 'PI008', patientId: 'PAT005',
    identityDomain: 'MRN', identityNumber: 'MRN440103005',
    patientName: '刘德华', gender: '男', birthDate: '1975-09-17',
    institutionId: 'INST004', verified: true, verifiedAt: '2026-02-15T16:00:00+08:00',
  },
  {
    id: 'PI009', patientId: 'PAT006',
    identityDomain: 'MRN', identityNumber: 'MRN440103006',
    patientName: '赵敏', gender: '女', birthDate: '1990-12-03',
    institutionId: 'INST005', verified: true, verifiedAt: '2026-03-10T09:30:00+08:00',
  },
  {
    id: 'PI010', patientId: 'PAT006',
    identityDomain: 'NID', identityNumber: '440102199012031890',
    patientName: '赵敏', gender: '女', birthDate: '1990-12-03',
    institutionId: 'INST006', verified: true, verifiedAt: '2026-03-10T09:35:00+08:00',
  },
  {
    id: 'PI011', patientId: 'PAT007',
    identityDomain: 'MRN', identityNumber: 'MRN440103007',
    patientName: '周杰', gender: '男', birthDate: '1968-06-25',
    institutionId: 'INST007', verified: true, verifiedAt: '2026-01-05T13:00:00+08:00',
  },
  {
    id: 'PI012', patientId: 'PAT008',
    identityDomain: 'MRN', identityNumber: 'MRN440103008',
    patientName: '吴晓燕', gender: '女', birthDate: '1995-01-18',
    institutionId: 'INST008', verified: true, verifiedAt: '2026-04-02T10:45:00+08:00',
  },
  {
    id: 'PI013', patientId: 'PAT008',
    identityDomain: 'NID', identityNumber: '440102199501181234',
    patientName: '吴晓燕', gender: '女', birthDate: '1995-01-18',
    institutionId: 'INST010', verified: true, verifiedAt: '2026-04-02T10:50:00+08:00',
  },
  {
    id: 'PI014', patientId: 'PAT009',
    identityDomain: 'MRN', identityNumber: 'MRN440103009',
    patientName: '郑浩', gender: '男', birthDate: '1982-08-09',
    institutionId: 'INST009', verified: true, verifiedAt: '2026-02-28T15:20:00+08:00',
  },
];

/** 模拟观察结果数据 */
export const MOCK_OBSERVATIONS: Observation[] = [
  {
    id: 'OBS001', patientId: 'PAT001', code: 'WBC', display: '白细胞计数',
    value: 8.5, unit: '×10⁹/L', effectiveDateTime: '2026-05-20T08:30:00+08:00',
    status: '正常', interpretation: '在正常范围内', institutionId: 'INST001', category: '实验室检查',
  },
  {
    id: 'OBS002', patientId: 'PAT001', code: 'RBC', display: '红细胞计数',
    value: 4.8, unit: '×10¹²/L', effectiveDateTime: '2026-05-20T08:30:00+08:00',
    status: '正常', interpretation: '在正常范围内', institutionId: 'INST001', category: '实验室检查',
  },
  {
    id: 'OBS003', patientId: 'PAT001', code: 'PLT', display: '血小板计数',
    value: 220, unit: '×10⁹/L', effectiveDateTime: '2026-05-20T08:30:00+08:00',
    status: '正常', interpretation: '在正常范围内', institutionId: 'INST001', category: '实验室检查',
  },
  {
    id: 'OBS004', patientId: 'PAT001', code: 'HGB', display: '血红蛋白',
    value: 145, unit: 'g/L', effectiveDateTime: '2026-05-20T08:30:00+08:00',
    status: '正常', interpretation: '在正常范围内', institutionId: 'INST001', category: '实验室检查',
  },
  {
    id: 'OBS005', patientId: 'PAT002', code: 'ALT', display: '谷丙转氨酶',
    value: 65, unit: 'U/L', effectiveDateTime: '2026-05-21T09:00:00+08:00',
    status: '异常', interpretation: '轻度升高，提示肝功能轻度异常', institutionId: 'INST002', category: '实验室检查',
  },
  {
    id: 'OBS006', patientId: 'PAT002', code: 'AST', display: '谷草转氨酶',
    value: 58, unit: 'U/L', effectiveDateTime: '2026-05-21T09:00:00+08:00',
    status: '异常', interpretation: '轻度升高', institutionId: 'INST002', category: '实验室检查',
  },
  {
    id: 'OBS007', patientId: 'PAT002', code: 'GLU', display: '空腹血糖',
    value: 7.2, unit: 'mmol/L', effectiveDateTime: '2026-05-22T08:00:00+08:00',
    status: '异常', interpretation: '偏高，提示空腹血糖受损或糖尿病可能', institutionId: 'INST001', category: '实验室检查',
  },
  {
    id: 'OBS008', patientId: 'PAT002', code: 'Cr', display: '肌酐',
    value: 98, unit: 'μmol/L', effectiveDateTime: '2026-05-22T08:00:00+08:00',
    status: '正常', interpretation: '在正常范围内', institutionId: 'INST002', category: '实验室检查',
  },
  {
    id: 'OBS009', patientId: 'PAT003', code: 'BP_SYS', display: '收缩压',
    value: 155, unit: 'mmHg', effectiveDateTime: '2026-05-23T10:00:00+08:00',
    status: '异常', interpretation: '偏高，诊断为高血压', institutionId: 'INST001', category: '生命体征',
  },
  {
    id: 'OBS010', patientId: 'PAT003', code: 'BP_DIA', display: '舒张压',
    value: 95, unit: 'mmHg', effectiveDateTime: '2026-05-23T10:00:00+08:00',
    status: '异常', interpretation: '偏高', institutionId: 'INST001', category: '生命体征',
  },
  {
    id: 'OBS011', patientId: 'PAT004', code: 'HGB', display: '血红蛋白',
    value: 92, unit: 'g/L', effectiveDateTime: '2026-05-24T08:30:00+08:00',
    status: '异常', interpretation: '偏低，提示轻度贫血', institutionId: 'INST003', category: '实验室检查',
  },
  {
    id: 'OBS012', patientId: 'PAT004', code: 'T', display: '体温',
    value: 38.5, unit: '℃', effectiveDateTime: '2026-05-25T14:20:00+08:00',
    status: '异常', interpretation: '发热，提示感染可能', institutionId: 'INST004', category: '生命体征',
  },
];

/** 模拟文档引用数据 */
export const MOCK_DOCUMENT_REFERENCES: DocumentReference[] = [
  {
    id: 'DOC001', patientId: 'PAT001', institutionId: 'INST001',
    type: '检查报告', modality: 'CT', studyDate: '2026-05-15', reportDate: '2026-05-16',
    authorName: '张明主任医师', reportContent: '头颅CT平扫：未见明显异常。',
    fileUrl: 'https://hie.example.com/reports/DOC001.pdf', status: '已同步', isAvailable: true,
  },
  {
    id: 'DOC002', patientId: 'PAT001', institutionId: 'INST001',
    type: '检验报告', studyDate: '2026-05-20', reportDate: '2026-05-20',
    authorName: '李华检验技师', status: '已同步', isAvailable: true,
  },
  {
    id: 'DOC003', patientId: 'PAT002', institutionId: 'INST002',
    type: '检查报告', modality: 'MR', studyDate: '2026-05-18', reportDate: '2026-05-19',
    authorName: '王强主任医师', reportContent: '腰椎MRI平扫：L4-L5椎间盘轻度突出。',
    fileUrl: 'https://hie.example.com/reports/DOC003.pdf', status: '已同步', isAvailable: true,
  },
  {
    id: 'DOC004', patientId: 'PAT002', institutionId: 'INST001',
    type: '检查报告', modality: 'CT', studyDate: '2026-05-10', reportDate: '2026-05-11',
    authorName: '陈林副主任医师', reportContent: '胸部CT平扫：双肺纹理增粗，余未见明显异常。',
    status: '已同步', isAvailable: true,
  },
  {
    id: 'DOC005', patientId: 'PAT003', institutionId: 'INST003',
    type: '病历', studyDate: '2026-05-05', reportDate: '2026-05-05',
    authorName: '刘芳主治医师', reportContent: '门诊病历：患者因"反复头晕1周"就诊...',
    status: '已同步', isAvailable: true,
  },
  {
    id: 'DOC006', patientId: 'PAT003', institutionId: 'INST001',
    type: '出院小结', studyDate: '2026-04-28', reportDate: '2026-04-28',
    authorName: '赵敏主任医师', reportContent: '出院小结：患者因"冠心病"入院...',
    status: '已归档', isAvailable: true,
  },
  {
    id: 'DOC007', patientId: 'PAT004', institutionId: 'INST005',
    type: '检查报告', modality: 'CT', studyDate: '2026-05-22', reportDate: '2026-05-23',
    authorName: '孙伟主任医师', reportContent: '腹部CT平扫：肝脏未见明显异常，胆囊壁略显增厚。',
    fileUrl: 'https://hie.example.com/reports/DOC007.pdf', status: '已同步', isAvailable: true,
  },
  {
    id: 'DOC008', patientId: 'PAT004', institutionId: 'INST006',
    type: '检验报告', studyDate: '2026-05-25', reportDate: '2026-05-25',
    authorName: '周婷检验技师', status: '原始', isAvailable: true,
  },
  {
    id: 'DOC009', patientId: 'PAT005', institutionId: 'INST004',
    type: '检查报告', modality: 'PET-CT', studyDate: '2026-05-12', reportDate: '2026-05-14',
    authorName: '吴昊主任医师', reportContent: 'PET-CT检查：未见明确恶性肿瘤证据。',
    fileUrl: 'https://hie.example.com/reports/DOC009.pdf', status: '已同步', isAvailable: true,
  },
  {
    id: 'DOC010', patientId: 'PAT006', institutionId: 'INST007',
    type: '处方', studyDate: '2026-05-20', reportDate: '2026-05-20',
    authorName: '郑军副主任医师', status: '已同步', isAvailable: true,
  },
  {
    id: 'DOC011', patientId: 'PAT006', institutionId: 'INST008',
    type: '检查报告', modality: 'US', studyDate: '2026-05-08', reportDate: '2026-05-08',
    authorName: '王丽主治医师', reportContent: '腹部B超：肝胆脾胰未见明显异常。',
    status: '已归档', isAvailable: true,
  },
  {
    id: 'DOC012', patientId: 'PAT007', institutionId: 'INST009',
    type: '检查报告', modality: 'CT', studyDate: '2026-05-15', reportDate: '2026-05-16',
    authorName: '李敏主任医师', reportContent: '肺部CT平扫：右肺上叶见一结节影，大小约8mm×6mm。',
    fileUrl: 'https://hie.example.com/reports/DOC012.pdf', status: '已同步', isAvailable: true,
  },
];

// ============= 内部数据存储 =============
const exchangeHistoryStore: ExchangeHistory[] = [];

// ============= 工具函数 =============
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getHieColor(): string {
  return HIE_COLOR;
}

export function getInstitutionById(id: string): Institution | undefined {
  return MOCK_INSTITUTIONS.find((inst) => inst.id === id);
}

export function getConnectedInstitutions(): Institution[] {
  return MOCK_INSTITUTIONS.filter((inst) => inst.isConnected);
}

export function getPatientIdentities(patientId: string): PatientIdentity[] {
  return MOCK_PATIENT_IDENTITIES.filter((pi) => pi.patientId === patientId);
}

export function validateQueryInput(input: unknown): { valid: boolean; errors: string[] } {
  const result = CrossInstitutionQuerySchema.safeParse(input);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
  }
  return { valid: true, errors: [] };
}

// ============= 核心功能函数 =============

/**
 * 查询跨机构患者数据
 *
 * @example
 * const results = await exchangePatientData({
 *   patientName: '张伟',
 *   idCard: '440102196503151234',
 *   institutions: ['INST001', 'INST002']
 * });
 */
export async function exchangePatientData(
  query: CrossInstitutionQuery
): Promise<{
  success: boolean;
  patients: PatientIdentity[];
  institutions: Institution[];
  errors?: string[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const validation = validateQueryInput(query);
  if (!validation.valid) {
    return { success: false, patients: [], institutions: [], errors: validation.errors };
  }

  let filtered = [...MOCK_PATIENT_IDENTITIES];

  if (query.institutions && query.institutions.length > 0) {
    filtered = filtered.filter((pi) => query.institutions!.includes(pi.institutionId));
  }

  if (query.patientName) {
    const nameLower = query.patientName.toLowerCase();
    filtered = filtered.filter((pi) => pi.patientName.toLowerCase().includes(nameLower));
  }

  if (query.idCard) {
    filtered = filtered.filter((pi) => {
      const nidRecord = MOCK_PATIENT_IDENTITIES.find(
        (p) => p.identityDomain === 'NID' && p.patientName === pi.patientName
      );
      return nidRecord?.identityNumber === query.idCard;
    });
  }

  if (query.birthDate) {
    filtered = filtered.filter((pi) => pi.birthDate === query.birthDate);
  }

  if (query.gender) {
    filtered = filtered.filter((pi) => pi.gender === query.gender);
  }

  if (query.queryDomains && query.queryDomains.length > 0) {
    filtered = filtered.filter((pi) => query.queryDomains!.includes(pi.identityDomain));
  }

  const involvedInstitutionIds = Array.from(new Set(filtered.map((pi) => pi.institutionId)));
  const involvedInstitutions = MOCK_INSTITUTIONS.filter((inst) =>
    involvedInstitutionIds.includes(inst.id)
  );

  exchangeHistoryStore.push({
    id: generateId(),
    transactionId: `TXN-${Date.now()}`,
    dataType: 'patient',
    direction: 'receive',
    sourceInstitutionId: query.institutions?.[0] || 'LOCAL',
    targetInstitutionId: 'LOCAL',
    patientId: filtered[0]?.patientId || '',
    recordCount: filtered.length,
    timestamp: new Date().toISOString(),
    status: '成功',
  });

  return { success: true, patients: filtered, institutions: involvedInstitutions };
}

/**
 * 查询外部患者
 *
 * @example
 * const external = await queryExternalPatient({
 *   patientName: '李娜',
 *   birthDate: '1978-07-22'
 * });
 */
export async function queryExternalPatient(
  params: { patientName?: string; birthDate?: string; idCard?: string }
): Promise<{
  success: boolean;
  patients: PatientIdentity[];
  sourceInstitution?: Institution;
  errors?: string[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  if (!params.patientName && !params.idCard) {
    return { success: false, patients: [], errors: ['至少需要提供患者姓名或身份证号'] };
  }

  let filtered = [...MOCK_PATIENT_IDENTITIES];

  if (params.patientName) {
    const nameLower = params.patientName.toLowerCase();
    filtered = filtered.filter((pi) => pi.patientName.toLowerCase().includes(nameLower));
  }

  if (params.birthDate) {
    filtered = filtered.filter((pi) => pi.birthDate === params.birthDate);
  }

  if (params.idCard) {
    filtered = filtered.filter((pi) => {
      if (pi.identityDomain === 'NID') return pi.identityNumber === params.idCard;
      const nidRecord = MOCK_PATIENT_IDENTITIES.find(
        (p) => p.identityDomain === 'NID' && p.patientName === pi.patientName
      );
      return nidRecord?.identityNumber === params.idCard;
    });
  }

  const externalPatients = filtered.filter((pi) => pi.institutionId !== 'LOCAL');
  const sourceInstitution = externalPatients[0]
    ? MOCK_INSTITUTIONS.find((inst) => inst.id === externalPatients[0].institutionId)
    : undefined;

  return { success: true, patients: externalPatients, sourceInstitution };
}

/**
 * 发送观察结果到外部机构
 *
 * @example
 * const result = await sendObservation(obs, 'INST002');
 */
export async function sendObservation(
  observation: Omit<Observation, 'id'>,
  targetInstitutionId: string
): Promise<DataExchangeResult> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const targetInstitution = MOCK_INSTITUTIONS.find((inst) => inst.id === targetInstitutionId);
  if (!targetInstitution) {
    return {
      success: false, transactionId: `TXN-${Date.now()}`,
      timestamp: new Date().toISOString(), dataType: 'observation', direction: 'send',
      institutionId: targetInstitutionId, recordsAffected: 0,
      errors: [`目标机构 ${targetInstitutionId} 不存在`],
    };
  }

  if (!targetInstitution.isConnected) {
    return {
      success: false, transactionId: `TXN-${Date.now()}`,
      timestamp: new Date().toISOString(), dataType: 'observation', direction: 'send',
      institutionId: targetInstitutionId, recordsAffected: 0,
      errors: [`目标机构 ${targetInstitution.name} 未连接`],
    };
  }

  exchangeHistoryStore.push({
    id: generateId(), transactionId: `TXN-${Date.now()}`,
    dataType: 'observation', direction: 'send',
    sourceInstitutionId: 'LOCAL', targetInstitutionId,
    patientId: observation.patientId, recordCount: 1,
    timestamp: new Date().toISOString(), status: '成功',
  });

  return {
    success: true, transactionId: `TXN-${Date.now()}`,
    timestamp: new Date().toISOString(), dataType: 'observation', direction: 'send',
    institutionId: targetInstitutionId, recordsAffected: 1,
  };
}

/**
 * 接收外部文档引用
 *
 * @example
 * const docs = await receiveDocument('INST001', 'PAT001');
 */
export async function receiveDocument(
  sourceInstitutionId: string,
  patientId: string
): Promise<{
  success: boolean;
  documents: DocumentReference[];
  sourceInstitution?: Institution;
  errors?: string[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 180));

  const sourceInstitution = MOCK_INSTITUTIONS.find((inst) => inst.id === sourceInstitutionId);
  if (!sourceInstitution) {
    return { success: false, documents: [], errors: [`来源机构 ${sourceInstitutionId} 不存在`] };
  }

  if (!sourceInstitution.isConnected) {
    return { success: false, documents: [], errors: [`来源机构 ${sourceInstitution.name} 未连接`] };
  }

  const documents = MOCK_DOCUMENT_REFERENCES.filter(
    (doc) => doc.institutionId === sourceInstitutionId && doc.patientId === patientId
  );

  exchangeHistoryStore.push({
    id: generateId(), transactionId: `TXN-${Date.now()}`,
    dataType: 'document', direction: 'receive',
    sourceInstitutionId, targetInstitutionId: 'LOCAL',
    patientId, recordCount: documents.length,
    timestamp: new Date().toISOString(),
    status: documents.length > 0 ? '成功' : '部分成功',
  });

  return { success: true, documents, sourceInstitution };
}

/**
 * 获取跨机构历史记录
 *
 * @example
 * const history = await getCrossInstitutionHistory({
 *   patientId: 'PAT001',
 *   dataType: 'document',
 *   limit: 10
 * });
 */
export async function getCrossInstitutionHistory(options?: {
  patientId?: string;
  dataType?: DataType;
  direction?: DataDirection;
  institutionId?: string;
  limit?: number;
}): Promise<{ success: boolean; history: ExchangeHistory[]; total: number }> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  let filtered = [...exchangeHistoryStore];

  if (options?.patientId) filtered = filtered.filter((h) => h.patientId === options.patientId);
  if (options?.dataType) filtered = filtered.filter((h) => h.dataType === options.dataType);
  if (options?.direction) filtered = filtered.filter((h) => h.direction === options.direction);
  if (options?.institutionId) {
    filtered = filtered.filter(
      (h) => h.sourceInstitutionId === options.institutionId || h.targetInstitutionId === options.institutionId
    );
  }

  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const total = filtered.length;
  const paginated = filtered.slice(0, options?.limit || 50);

  return { success: true, history: paginated, total };
}

/**
 * 获取患者所有观察结果（跨机构）
 */
export async function getPatientObservations(patientId: string): Promise<{
  success: boolean;
  observations: Observation[];
  institutions: Institution[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 120));

  const observations = MOCK_OBSERVATIONS.filter((obs) => obs.patientId === patientId);
  const institutionIds = Array.from(new Set(observations.map((obs) => obs.institutionId)));
  const institutions = MOCK_INSTITUTIONS.filter((inst) => institutionIds.includes(inst.id));

  return { success: true, observations, institutions };
}

/**
 * 获取患者所有文档（跨机构）
 */
export async function getPatientDocuments(patientId: string): Promise<{
  success: boolean;
  documents: DocumentReference[];
  institutions: Institution[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 120));

  const documents = MOCK_DOCUMENT_REFERENCES.filter((doc) => doc.patientId === patientId);
  const institutionIds = Array.from(new Set(documents.map((doc) => doc.institutionId)));
  const institutions = MOCK_INSTITUTIONS.filter((inst) => institutionIds.includes(inst.id));

  return { success: true, documents, institutions };
}

/**
 * 测试所有模拟数据连接
 */
export async function testHIEConnections(): Promise<{
  success: boolean;
  results: Array<{
    institution: Institution;
    reachable: boolean;
    latencyMs?: number;
    error?: string;
  }>;
}> {
  const results = [];

  for (const inst of MOCK_INSTITUTIONS) {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const latencyMs = Date.now() - startTime;

    results.push({
      institution: inst,
      reachable: inst.isConnected,
      latencyMs: inst.isConnected ? latencyMs : undefined,
      error: inst.isConnected ? undefined : '机构未连接',
    });
  }

  const allReachable = results.every((r) => r.reachable);
  return { success: allReachable, results };
}
