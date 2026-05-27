/**
 * DRG/DIP 分组器工具
 * G005 放射科RIS系统 - 诊断相关组/诊断介入包分组
 * 
 * 用于中国医院DRG/DIP支付方式下的诊断分组、费用计算、 主诊断推荐等功能
 * 
 * @module drgDipGrouper
 * @version 1.0.0
 */

import { z } from 'zod';

// ============================================================
// 类型定义
// ============================================================

/**
 * 诊断类型枚举
 */
export type DiagnosisType = '主要诊断' | '其他诊断' | '并发诊断' | '伴随诊断';

/**
 * 手术/操作类型枚举
 */
export type ProcedureType = '手术' | '操作' | '检查';

/**
 * DRG分组结果
 */
export interface DRGGroup {
  /** DRG编码 */
  code: string;
  /** DRG名称 */
  name: string;
  /** 分组版本 */
  version: string;
  /** 分组权重 */
  weight: number;
  /** 基础费用 */
  baseFee: number;
  /** 所属MDC */
  mdcCode: string;
  /** MDC名称 */
  mdcName: string;
  /** 分组说明 */
  description?: string;
  /** 是否为例外病例 */
  isException?: boolean;
  /** 例外原因 */
  exceptionReason?: string;
}

/**
 * DIP分组结果
 */
export interface DIPGroup {
  /** DIP编码 */
  code: string;
  /** DIP名称 */
  name: string;
  /** 分组版本 */
  version: string;
  /** 病种分值 */
  score: number;
  /** 基础点数 */
  basePoints: number;
  /** 点值单价 */
  unitPrice: number;
  /** 总费用 */
  totalFee: number;
  /** 所属亚目 */
  subgroupCode: string;
  /** 亚目名称 */
  subgroupName: string;
  /** 分组说明 */
  description?: string;
}

/**
 * 诊断信息
 */
export interface Diagnosis {
  /** 诊断编码（ICD-10） */
  code: string;
  /** 诊断名称 */
  name: string;
  /** 诊断类型 */
  type: DiagnosisType;
  /** 是否为有效诊断 */
  isValid: boolean;
}

/**
 * 手术/操作信息
 */
export interface Procedure {
  /** 操作编码（ICD-9-CM-3） */
  code: string;
  /** 操作名称 */
  name: string;
  /** 操作类型 */
  type: ProcedureType;
  /** 麻醉方式 */
  anesthesiaType?: '全身麻醉' | '椎管内麻醉' | '局部麻醉' | '复合麻醉' | '未用麻醉';
  /** 手术等级 */
  surgeryLevel?: '一级' | '二级' | '三级' | '四级';
  /** 手术时长（分钟） */
  duration?: number;
}

/**
 * 分组输入参数
 */
export interface GrouperInput {
  /** 患者类型：门诊/住院/急诊 */
  patientType: '门诊' | '住院' | '体检' | '急诊';
  /** 诊断列表 */
  diagnoses: Diagnosis[];
  /** 手术/操作列表 */
  procedures: Procedure[];
  /** 就诊日期 */
  admissionDate?: string;
  /** 出院日期 */
  dischargeDate?: string;
  /** 年龄 */
  age: number;
  /** 性别 */
  gender: '男' | '女' | '其他';
  /** 医院等级 */
  hospitalLevel?: '三级甲等' | '三级乙等' | '二级甲等' | '二级乙等' | '一级';
  /** 科室代码 */
  deptCode?: string;
}

/**
 * 分组结果
 */
export interface GrouperResult {
  /** 分组成功标识 */
  success: boolean;
  /** 分组类型：DRG或DIP */
  groupType: 'DRG' | 'DIP';
  /** 分组结果 */
  group: DRGGroup | DIPGroup | null;
  /** 分组明细 */
  details: {
    /** 进入的MDC/亚目 */
    enterMdc?: string;
    /** 分组路径描述 */
    pathway: string[];
    /** 匹配规则 */
    matchedRules: string[];
  };
  /** 错误信息 */
  error?: string;
  /** 建议 */
  suggestions?: string[];
}

/**
 * 费用明细
 */
export interface FeeDetail {
  /** 费用项目编码 */
  code: string;
  /** 费用项目名称 */
  name: string;
  /** 金额 */
  amount: number;
  /** 类别 */
  category: '药品' | '检查' | '手术' | '护理' | '床位' | '材料' | '其他';
}

/**
 * 费用计算结果
 */
export interface FeeCalculationResult {
  /** 诊断编码 */
  diagnosisCode: string;
  /** 诊断名称 */
  diagnosisName: string;
  /** 分组编码 */
  groupCode: string;
  /** 分组名称 */
  groupName: string;
  /** 总费用 */
  totalFee: number;
  /** 统筹支付 */
  insurancePayment: number;
  /** 个人自付 */
  patientPayment: number;
  /** 费用明细 */
  feeDetails: FeeDetail[];
  /** 费率说明 */
  feeNote?: string;
}

/**
 * 主诊断推荐结果
 */
export interface MainDiagnosisSuggestion {
  /** 推荐诊断编码 */
  code: string;
  /** 推荐诊断名称 */
  name: string;
  /** 推荐理由 */
  reason: string;
  /** 置信度 */
  confidence: number;
  /** 相关手术推荐 */
  relatedProcedures?: Procedure[];
}

// ============================================================
// Zod验证模式
// ============================================================

/**
 * 诊断信息验证模式
 */
export const DiagnosisSchema = z.object({
  code: z.string().min(1, '诊断编码不能为空'),
  name: z.string().min(1, '诊断名称不能为空'),
  type: z.enum(['主要诊断', '其他诊断', '并发诊断', '伴随诊断']),
  isValid: z.boolean().default(true),
});

/**
 * 手术/操作信息验证模式
 */
export const ProcedureSchema = z.object({
  code: z.string().min(1, '操作编码不能为空'),
  name: z.string().min(1, '操作名称不能为空'),
  type: z.enum(['手术', '操作', '检查']),
  anesthesiaType: z.enum(['全身麻醉', '椎管内麻醉', '局部麻醉', '复合麻醉', '未用麻醉']).optional(),
  surgeryLevel: z.enum(['一级', '二级', '三级', '四级']).optional(),
  duration: z.number().int().min(0).optional(),
});

/**
 * 分组输入验证模式
 */
export const GrouperInputSchema = z.object({
  patientType: z.enum(['门诊', '住院', '体检', '急诊']),
  diagnoses: z.array(DiagnosisSchema).min(1, '至少需要一个诊断'),
  procedures: z.array(ProcedureSchema).default([]),
  admissionDate: z.string().optional(),
  dischargeDate: z.string().optional(),
  age: z.number().int().min(0).max(150),
  gender: z.enum(['男', '女', '其他']),
  hospitalLevel: z.enum(['三级甲等', '三级乙等', '二级甲等', '二级乙等', '一级']).optional(),
  deptCode: z.string().optional(),
});

// ============================================================
// 常量定义
// ============================================================

/**
 * 蓝色主题色
 */
export const DRG_COLOR = '#3b82f6';

/**
 * DRG版本信息
 */
export const DRG_VERSION = 'CHS-DRG 1.1 (2024)';

/**
 * DIP版本信息
 */
export const DIP_VERSION = 'DIP 2024';

// ============================================================
// DRG主表数据结构（模拟数据）
// ============================================================

interface DRGEntry {
  code: string;
  name: string;
  mdcCode: string;
  mdcName: string;
  weight: number;
  baseFee: number;
  validDiagnoses: string[];
  validProcedures: string[];
  exceptionCodes?: string[];
}

/**
 * DRG分组主表（模拟数据）
 * 包含主要放射科相关DRG分组
 */
const DRG_MASTER_TABLE: DRGEntry[] = [
  {
    code: 'BR21',
    name: '神经系统诊断伴危急值处置',
    mdcCode: 'MDCB',
    mdcName: '神经系统疾病及功能障碍',
    weight: 2.5,
    baseFee: 15000,
    validDiagnoses: ['I64', 'I63', 'I61', 'S06'],
    validProcedures: ['87.03', '88.01'],
  },
  {
    code: 'BR25',
    name: '神经系统诊断不伴并发症',
    mdcCode: 'MDCB',
    mdcName: '神经系统疾病及功能障碍',
    weight: 1.2,
    baseFee: 8000,
    validDiagnoses: ['I63', 'I64', 'G40'],
    validProcedures: [],
  },
  {
    code: 'CT31',
    name: 'CT检查伴造影',
    mdcCode: 'MDCF',
    mdcName: '循环系统疾病及功能障碍',
    weight: 1.8,
    baseFee: 3500,
    validDiagnoses: ['I25', 'I63', 'I64'],
    validProcedures: ['87.03'],
  },
  {
    code: 'CT35',
    name: 'CT检查不伴造影',
    mdcCode: 'MDCF',
    mdcName: '循环系统疾病及功能障碍',
    weight: 1.0,
    baseFee: 2000,
    validDiagnoses: ['I25', 'I63', 'I64', 'J18', 'J44'],
    validProcedures: [],
  },
  {
    code: 'MR31',
    name: '磁共振检查伴造影',
    mdcCode: 'MDCF',
    mdcName: '循环系统疾病及功能障碍',
    weight: 2.2,
    baseFee: 4500,
    validDiagnoses: ['I63', 'G35', 'M54'],
    validProcedures: ['88.85'],
  },
  {
    code: 'MR35',
    name: '磁共振检查不伴造影',
    mdcCode: 'MDCF',
    mdcName: '循环系统疾病及功能障碍',
    weight: 1.5,
    baseFee: 2800,
    validDiagnoses: ['G35', 'M54', 'S14', 'S24'],
    validProcedures: [],
  },
  {
    code: 'XR11',
    name: 'X线检查伴复杂操作',
    mdcCode: 'MDCR',
    mdcName: '放射检查相关',
    weight: 0.8,
    baseFee: 800,
    validDiagnoses: ['M54', 'S72', 'S82'],
    validProcedures: ['78.5', '79.3'],
  },
  {
    code: 'XR15',
    name: 'X线检查不伴复杂操作',
    mdcCode: 'MDCR',
    mdcName: '放射检查相关',
    weight: 0.5,
    baseFee: 400,
    validDiagnoses: ['M54', 'S72', 'Z96'],
    validProcedures: [],
  },
  {
    code: 'DS21',
    name: 'DSA检查及介入治疗',
    mdcCode: 'MDCF',
    mdcName: '循环系统疾病及功能障碍',
    weight: 4.5,
    baseFee: 25000,
    validDiagnoses: ['I63', 'I64', 'I25'],
    validProcedures: ['88.5', '88.55', '39.5'],
    exceptionCodes: ['I64.003'],
  },
  {
    code: 'US21',
    name: '超声检查',
    mdcCode: 'MDCU',
    mdcName: '超声检查相关',
    weight: 0.6,
    baseFee: 350,
    validDiagnoses: ['O80', 'R10', 'N83', 'I35'],
    validProcedures: [],
  },
  {
    code: 'PU41',
    name: '肺部感染影像检查',
    mdcCode: 'MDCE',
    mdcName: '呼吸系统疾病及功能障碍',
    weight: 1.6,
    baseFee: 9000,
    validDiagnoses: ['J18', 'J12', 'J15', 'U04'],
    validProcedures: ['87.41'],
  },
  {
    code: 'AB21',
    name: '腹部CT平扫+增强',
    mdcCode: 'MDCG',
    mdcName: '消化系统疾病及功能障碍',
    weight: 2.0,
    baseFee: 5500,
    validDiagnoses: ['K35', 'K81', 'K56', 'C18'],
    validProcedures: ['87.03', '88.01'],
  },
  {
    code: 'NG21',
    name: '头颅CT/MRI检查伴危急值',
    mdcCode: 'MDCB',
    mdcName: '神经系统疾病及功能障碍',
    weight: 2.8,
    baseFee: 12000,
    validDiagnoses: ['I61', 'I63', 'S06', 'I64'],
    validProcedures: ['87.03', '88.85'],
    exceptionCodes: ['I64.003'],
  },
  {
    code: 'MH23',
    name: '乳腺钼靶检查',
    mdcCode: 'MDCM',
    mdcName: '乳腺疾病',
    weight: 0.9,
    baseFee: 600,
    validDiagnoses: ['C50', 'N60', 'N63', 'Z80'],
    validProcedures: ['87.35'],
  },
  {
    code: 'GB31',
    name: '骨关节MRI检查',
    mdcCode: 'MDCM',
    mdcName: '肌肉骨骼系统疾病',
    weight: 1.7,
    baseFee: 3200,
    validDiagnoses: ['M54', 'M47', 'S72', 'S82'],
    validProcedures: ['88.85'],
  },
];

// ============================================================
// DIP主表数据结构（模拟数据）
// ============================================================

interface DIPEntry {
  code: string;
  name: string;
  subgroupCode: string;
  subgroupName: string;
  score: number;
  basePoints: number;
  unitPrice: number;
  validDiagnoses: string[];
  validProcedures: string[];
}

const DIP_MASTER_TABLE: DIPEntry[] = [
  {
    code: 'ADI001',
    name: '脑梗死影像诊断',
    subgroupCode: 'G3A1',
    subgroupName: '脑血管病影像诊断',
    score: 85,
    basePoints: 450,
    unitPrice: 10.5,
    validDiagnoses: ['I63', 'I64'],
    validProcedures: ['87.03'],
  },
  {
    code: 'ADI002',
    name: '脑梗死影像诊断伴介入',
    subgroupCode: 'G3A2',
    subgroupName: '脑血管病影像诊断伴介入',
    score: 120,
    basePoints: 680,
    unitPrice: 10.5,
    validDiagnoses: ['I63', 'I64'],
    validProcedures: ['88.5', '39.5'],
  },
  {
    code: 'ADI003',
    name: '颅内出血影像诊断',
    subgroupCode: 'G3B1',
    subgroupName: '颅内出血影像诊断',
    score: 95,
    basePoints: 520,
    unitPrice: 10.5,
    validDiagnoses: ['I61', 'I62'],
    validProcedures: ['87.03'],
  },
  {
    code: 'CTP001',
    name: '肺部感染CT检查',
    subgroupCode: 'E2A1',
    subgroupName: '肺部感染检查',
    score: 65,
    basePoints: 380,
    unitPrice: 10.5,
    validDiagnoses: ['J18', 'J15', 'J12'],
    validProcedures: ['87.41'],
  },
  {
    code: 'CTP002',
    name: '肺肿瘤CT检查',
    subgroupCode: 'E2B1',
    subgroupName: '肺肿瘤检查',
    score: 88,
    basePoints: 480,
    unitPrice: 10.5,
    validDiagnoses: ['C34', 'D02'],
    validProcedures: ['87.41'],
  },
  {
    code: 'ABD001',
    name: '急性阑尾炎CT检查',
    subgroupCode: 'G4A1',
    subgroupName: '急腹症影像诊断',
    score: 72,
    basePoints: 420,
    unitPrice: 10.5,
    validDiagnoses: ['K35', 'K36'],
    validProcedures: ['87.03'],
  },
  {
    code: 'ABD002',
    name: '胆石症CT检查',
    subgroupCode: 'G4B1',
    subgroupName: '胆道疾病影像诊断',
    score: 68,
    basePoints: 390,
    unitPrice: 10.5,
    validDiagnoses: ['K80', 'K81'],
    validProcedures: ['87.03'],
  },
  {
    code: 'MSC001',
    name: '腰椎间盘突出MRI检查',
    subgroupCode: 'M3A1',
    subgroupName: '脊柱疾病MRI检查',
    score: 78,
    basePoints: 440,
    unitPrice: 10.5,
    validDiagnoses: ['M51', 'M54'],
    validProcedures: ['88.85'],
  },
  {
    code: 'MSC002',
    name: '膝关节损伤MRI检查',
    subgroupCode: 'M3B1',
    subgroupName: '关节疾病MRI检查',
    score: 82,
    basePoints: 460,
    unitPrice: 10.5,
    validDiagnoses: ['M23', 'S83'],
    validProcedures: ['88.85'],
  },
  {
    code: 'CRS001',
    name: '乳腺钼靶检查',
    subgroupCode: 'M5A1',
    subgroupName: '乳腺疾病影像诊断',
    score: 55,
    basePoints: 320,
    unitPrice: 10.5,
    validDiagnoses: ['C50', 'N60', 'N63'],
    validProcedures: ['87.35'],
  },
  {
    code: 'CRD001',
    name: '冠心病CT检查',
    subgroupCode: 'F2A1',
    subgroupName: '冠心病影像诊断',
    score: 92,
    basePoints: 510,
    unitPrice: 10.5,
    validDiagnoses: ['I25', 'I24'],
    validProcedures: ['87.03', '88.55'],
  },
  {
    code: 'CRD002',
    name: '先天性心脏病影像检查',
    subgroupCode: 'F2B1',
    subgroupName: '先天性心脏病影像诊断',
    score: 105,
    basePoints: 580,
    unitPrice: 10.5,
    validDiagnoses: ['Q20', 'Q21', 'Q24'],
    validProcedures: ['88.42', '87.53'],
  },
];

// ============================================================
// Mock诊断/手术组合数据（至少10个）
// ============================================================

/**
 * Mock诊断/手术组合，用于测试分组功能
 */
export interface MockCombo {
  /** 组合ID */
  id: string;
  /** 组合描述 */
  description: string;
  /** 诊断列表 */
  diagnoses: Diagnosis[];
  /** 手术列表 */
  procedures: Procedure[];
  /** 患者类型 */
  patientType: '门诊' | '住院' | '急诊';
  /** 期望DRG分组 */
  expectedDRG?: string;
  /** 期望DIP分组 */
  expectedDIP?: string;
}

export const MOCK_COMBOS: MockCombo[] = [
  {
    id: 'MC001',
    description: '急性脑梗死CT检查（住院）',
    diagnoses: [
      { code: 'I63.900', name: '急性脑梗死', type: '主要诊断', isValid: true },
      { code: 'I10', name: '高血压', type: '伴随诊断', isValid: true },
    ],
    procedures: [
      { code: '87.03', name: 'CT头部平扫', type: '检查' },
      { code: '88.85', name: '脑MRI平扫', type: '检查' },
    ],
    patientType: '住院',
    expectedDRG: 'BR21',
    expectedDIP: 'ADI001',
  },
  {
    id: 'MC002',
    description: '肺部感染CT检查（住院）',
    diagnoses: [
      { code: 'J18.900', name: '肺部感染', type: '主要诊断', isValid: true },
      { code: 'J96.000', name: '呼吸衰竭', type: '并发诊断', isValid: true },
    ],
    procedures: [
      { code: '87.41', name: 'CT胸部平扫', type: '检查' },
    ],
    patientType: '住院',
    expectedDRG: 'PU41',
    expectedDIP: 'CTP001',
  },
  {
    id: 'MC003',
    description: '急性阑尾炎CT检查（急诊）',
    diagnoses: [
      { code: 'K35.000', name: '急性阑尾炎', type: '主要诊断', isValid: true },
    ],
    procedures: [
      { code: '87.03', name: 'CT腹部平扫', type: '检查' },
    ],
    patientType: '急诊',
    expectedDRG: 'AB21',
    expectedDIP: 'ABD001',
  },
  {
    id: 'MC004',
    description: '腰椎间盘突出MRI检查（门诊）',
    diagnoses: [
      { code: 'M51.200', name: '腰椎间盘突出', type: '主要诊断', isValid: true },
      { code: 'M54.500', name: '腰痛', type: '伴随诊断', isValid: true },
    ],
    procedures: [
      { code: '88.85', name: '腰椎MRI平扫', type: '检查' },
    ],
    patientType: '门诊',
    expectedDRG: 'GB31',
    expectedDIP: 'MSC001',
  },
  {
    id: 'MC005',
    description: '乳腺钼靶检查（门诊）',
    diagnoses: [
      { code: 'C50.900', name: '乳腺恶性肿瘤', type: '主要诊断', isValid: true },
      { code: 'N60.000', name: '乳腺囊性增生病', type: '其他诊断', isValid: true },
    ],
    procedures: [
      { code: '87.35', name: '乳腺钼靶X线摄影', type: '检查' },
    ],
    patientType: '门诊',
    expectedDRG: 'MH23',
    expectedDIP: 'CRS001',
  },
  {
    id: 'MC006',
    description: '冠心病CT冠脉成像（住院）',
    diagnoses: [
      { code: 'I25.100', name: '动脉粥样硬化性心脏病', type: '主要诊断', isValid: true },
      { code: 'E11.900', name: '2型糖尿病', type: '伴随诊断', isValid: true },
    ],
    procedures: [
      { code: '87.03', name: 'CT冠脉成像', type: '检查' },
      { code: '88.55', name: '冠脉造影', type: '检查' },
    ],
    patientType: '住院',
    expectedDRG: 'CT31',
    expectedDIP: 'CRD001',
  },
  {
    id: 'MC007',
    description: '颅内出血CT检查（急诊）',
    diagnoses: [
      { code: 'I61.000', name: '脑出血', type: '主要诊断', isValid: true },
      { code: 'S06.200', name: '脑震荡', type: '其他诊断', isValid: true },
    ],
    procedures: [
      { code: '87.03', name: 'CT头部平扫', type: '检查' },
    ],
    patientType: '急诊',
    expectedDRG: 'NG21',
    expectedDIP: 'ADI003',
  },
  {
    id: 'MC008',
    description: '膝关节损伤MRI检查（门诊）',
    diagnoses: [
      { code: 'M23.900', name: '膝关节损伤', type: '主要诊断', isValid: true },
      { code: 'S83.600', name: '膝关节韧带损伤', type: '其他诊断', isValid: true },
    ],
    procedures: [
      { code: '88.85', name: '膝关节MRI检查', type: '检查' },
    ],
    patientType: '门诊',
    expectedDRG: 'GB31',
    expectedDIP: 'MSC002',
  },
  {
    id: 'MC009',
    description: '胆石症CT检查（住院）',
    diagnoses: [
      { code: 'K80.200', name: '胆囊结石', type: '主要诊断', isValid: true },
      { code: 'K81.000', name: '胆囊炎', type: '并发诊断', isValid: true },
    ],
    procedures: [
      { code: '87.03', name: 'CT腹部平扫', type: '检查' },
    ],
    patientType: '住院',
    expectedDRG: 'AB21',
    expectedDIP: 'ABD002',
  },
  {
    id: 'MC010',
    description: '脑血管病DSA检查+介入治疗（住院）',
    diagnoses: [
      { code: 'I63.900', name: '脑梗死', type: '主要诊断', isValid: true },
      { code: 'I10', name: '高血压', type: '伴随诊断', isValid: true },
    ],
    procedures: [
      { code: '88.50', name: '脑血管造影', type: '手术' },
      { code: '39.50', name: '脑血管取栓术', type: '手术' },
    ],
    patientType: '住院',
    expectedDRG: 'DS21',
    expectedDIP: 'ADI002',
  },
  {
    id: 'MC011',
    description: '头痛待查CT检查（门诊）',
    diagnoses: [
      { code: 'G44.100', name: '血管性头痛', type: '主要诊断', isValid: true },
    ],
    procedures: [
      { code: '87.03', name: 'CT头部平扫', type: '检查' },
    ],
    patientType: '门诊',
    expectedDRG: 'CT35',
  },
  {
    id: 'MC012',
    description: '骨折X线检查（急诊）',
    diagnoses: [
      { code: 'S72.300', name: '股骨骨折', type: '主要诊断', isValid: true },
    ],
    procedures: [
      { code: '78.50', name: '骨折内固定术', type: '手术' },
    ],
    patientType: '急诊',
    expectedDRG: 'XR11',
  },
];

// ============================================================
// 分组辅助函数
// ============================================================

/**
 * 从诊断编码提取主分类（前三码）
 */
function getDiagnosisCategory(code: string): string {
  return code.replace(/\./g, '').substring(0, 3);
}

/**
 * 匹配诊断编码
 */
function matchDiagnosis(mainCode: string, validCodes: string[]): boolean {
  const mainCategory = getDiagnosisCategory(mainCode);
  return validCodes.some(validCode => {
    const validCategory = getDiagnosisCategory(validCode);
    return mainCategory === validCategory;
  });
}

/**
 * 匹配手术编码
 */
function matchProcedure(procCode: string, validCodes: string[]): boolean {
  if (validCodes.length === 0) return true;
  const procPrefix = procCode.split('.')[0];
  return validCodes.some(validCode => {
    const validPrefix = validCode.split('.')[0];
    return procPrefix === validPrefix;
  });
}

/**
 * 计算医院等级系数
 */
function getHospitalLevelFactor(level?: string): number {
  switch (level) {
    case '三级甲等': return 1.0;
    case '三级乙等': return 0.95;
    case '二级甲等': return 0.85;
    case '二级乙等': return 0.8;
    case '一级': return 0.7;
    default: return 0.9;
  }
}

/**
 * 计算年龄系数
 */
function getAgeFactor(age: number): number {
  if (age < 1) return 1.2;      // 新生儿
  if (age >= 70) return 1.1;   // 高龄
  if (age >= 60) return 1.05; // 老年
  return 1.0;
}

// ============================================================
// 核心分组函数
// ============================================================

/**
 * DRG分组函数
 * 根据诊断和手术信息进行DRG分组
 * 
 * @param input - 分组输入参数
 * @returns 分组结果
 * @example
 * ```ts
 * const result = groupDRG({
 *   patientType: '住院',
 *   diagnoses: [{ code: 'I63.900', name: '急性脑梗死', type: '主要诊断', isValid: true }],
 *   procedures: [{ code: '87.03', name: 'CT头部平扫', type: '检查' }],
 *   age: 65,
 *   gender: '男',
 * });
 * console.log(result.group); // DRGGroup
 * ```
 */
export function groupDRG(input: GrouperInput): GrouperResult {
  const { diagnoses, procedures, hospitalLevel, age } = input;
  
  // 获取主要诊断
  const mainDiagnosis = diagnoses.find(d => d.type === '主要诊断');
  if (!mainDiagnosis) {
    return {
      success: false,
      groupType: 'DRG',
      group: null,
      details: { pathway: [], matchedRules: [] },
      error: '未找到主要诊断',
    };
  }

  // 遍历DRG表进行匹配
  for (const entry of DRG_MASTER_TABLE) {
    // 检查主要诊断是否匹配
    if (!matchDiagnosis(mainDiagnosis.code, entry.validDiagnoses)) {
      continue;
    }

    // 检查是否有匹配的手术
    if (entry.validProcedures.length > 0) {
      const hasMatch = procedures.some(p => 
        matchProcedure(p.code, entry.validProcedures)
      );
      if (!hasMatch) continue;
    }

    // 检查是否为危急值例外病例
    let isException = false;
    let exceptionReason = '';
    if (entry.exceptionCodes && mainDiagnosis.code.includes('003')) {
      isException = true;
      exceptionReason = '特殊编码病例';
    }

    // 计算调整后权重
    const ageFactor = getAgeFactor(age);
    const hospitalFactor = getHospitalLevelFactor(hospitalLevel);
    const adjustedWeight = entry.weight * ageFactor * hospitalFactor;
    const adjustedFee = Math.round(entry.baseFee * adjustedWeight * 100) / 100;

    const group: DRGGroup = {
      code: entry.code,
      name: entry.name,
      version: DRG_VERSION,
      weight: adjustedWeight,
      baseFee: adjustedFee,
      mdcCode: entry.mdcCode,
      mdcName: entry.mdcName,
      description: `基于${mainDiagnosis.name}和${procedures.length > 0 ? procedures[0].name : '无手术'}分组`,
      isException,
      exceptionReason: isException ? exceptionReason : undefined,
    };

    return {
      success: true,
      groupType: 'DRG',
      group,
      details: {
        enterMdc: entry.mdcCode,
        pathway: [
          `MDC: ${entry.mdcCode} - ${entry.mdcName}`,
          `主要诊断: ${mainDiagnosis.code} - ${mainDiagnosis.name}`,
          procedures.length > 0 
            ? `手术操作: ${procedures.map(p => p.code).join(', ')}`
            : '无手术操作',
          `DRG: ${entry.code} - ${entry.name}`,
        ],
        matchedRules: [
          `诊断匹配规则: ${entry.validDiagnoses.join(', ')}`,
          procedures.length > 0 
            ? `手术匹配规则: ${entry.validProcedures.join(', ')}`
            : '无手术要求',
          `年龄系数: ${ageFactor}`,
          `医院等级系数: ${hospitalFactor}`,
        ],
      },
    };
  }

  // 未匹配到具体DRG，返回MDC级别分组
  const mdcCode = guessMDC(mainDiagnosis.code);
  return {
    success: true,
    groupType: 'DRG',
    group: {
      code: `${mdcCode}00`,
      name: `${mdcCode}未分类`,
      version: DRG_VERSION,
      weight: 1.0,
      baseFee: 5000,
      mdcCode,
      mdcName: getMDCName(mdcCode),
      description: '未能精确匹配，进入MDC未分类组',
    },
    details: {
      enterMdc: mdcCode,
      pathway: [
        `主要诊断: ${mainDiagnosis.code} - ${mainDiagnosis.name}`,
        '未匹配到精确DRG组',
        `进入MDC: ${mdcCode}`,
      ],
      matchedRules: ['诊断编码不在标准DRG范围内'],
    },
    suggestions: ['建议完善诊断编码', '可考虑使用DIP分组'],
  };
}

/**
 * DIP分组函数
 * 根据诊断和手术信息进行DIP分组
 * 
 * @param input - 分组输入参数
 * @returns 分组结果
 * @example
 * ```ts
 * const result = groupDIP({
 *   patientType: '住院',
 *   diagnoses: [{ code: 'I63.900', name: '急性脑梗死', type: '主要诊断', isValid: true }],
 *   procedures: [{ code: '87.03', name: 'CT头部平扫', type: '检查' }],
 *   age: 65,
 *   gender: '男',
 * });
 * console.log(result.group); // DIPGroup
 * ```
 */
export function groupDIP(input: GrouperInput): GrouperResult {
  const { diagnoses, procedures } = input;
  
  const mainDiagnosis = diagnoses.find(d => d.type === '主要诊断');
  if (!mainDiagnosis) {
    return {
      success: false,
      groupType: 'DIP',
      group: null,
      details: { pathway: [], matchedRules: [] },
      error: '未找到主要诊断',
    };
  }

  // 遍历DIP表进行匹配
  for (const entry of DIP_MASTER_TABLE) {
    // 检查主要诊断是否匹配
    if (!matchDiagnosis(mainDiagnosis.code, entry.validDiagnoses)) {
      continue;
    }

    // 检查是否有匹配的手术
    if (entry.validProcedures.length > 0) {
      const hasMatch = procedures.some(p => 
        matchProcedure(p.code, entry.validProcedures)
      );
      if (!hasMatch) continue;
    }

    // 计算总费用
    const totalFee = Math.round(entry.basePoints * entry.unitPrice * 100) / 100;

    const group: DIPGroup = {
      code: entry.code,
      name: entry.name,
      version: DIP_VERSION,
      score: entry.score,
      basePoints: entry.basePoints,
      unitPrice: entry.unitPrice,
      totalFee,
      subgroupCode: entry.subgroupCode,
      subgroupName: entry.subgroupName,
      description: `基于${mainDiagnosis.name}和${procedures.length > 0 ? procedures[0].name : '无手术'}分组`,
    };

    return {
      success: true,
      groupType: 'DIP',
      group,
      details: {
        enterMdc: entry.subgroupCode,
        pathway: [
          `亚目: ${entry.subgroupCode} - ${entry.subgroupName}`,
          `主要诊断: ${mainDiagnosis.code} - ${mainDiagnosis.name}`,
          procedures.length > 0 
            ? `手术操作: ${procedures.map(p => p.code).join(', ')}`
            : '无手术操作',
          `DIP: ${entry.code} - ${entry.name}`,
        ],
        matchedRules: [
          `诊断匹配: ${entry.validDiagnoses.join(', ')}`,
          procedures.length > 0 
            ? `手术匹配: ${entry.validProcedures.join(', ')}`
            : '无手术要求',
        ],
      },
    };
  }

  // 未匹配到具体DIP，返回亚目级别分组
  const subgroupCode = guessSubgroup(mainDiagnosis.code);
  return {
    success: true,
    groupType: 'DIP',
    group: {
      code: `${subgroupCode}-99`,
      name: '未分类',
      version: DIP_VERSION,
      score: 50,
      basePoints: 300,
      unitPrice: 10.5,
      totalFee: 3150,
      subgroupCode,
      subgroupName: getSubgroupName(subgroupCode),
      description: '未能精确匹配，进入DIP未分类组',
    },
    details: {
      enterMdc: subgroupCode,
      pathway: [
        `主要诊断: ${mainDiagnosis.code} - ${mainDiagnosis.name}`,
        '未匹配到精确DIP组',
        `进入亚目: ${subgroupCode}`,
      ],
      matchedRules: ['诊断编码不在标准DIP范围内'],
    },
    suggestions: ['建议完善诊断编码', '可考虑使用DRG分组'],
  };
}

/**
 * 猜测MDC编码
 */
function guessMDC(diagnosisCode: string): string {
  const code = diagnosisCode.replace(/\./g, '').substring(0, 3);
  if (code.startsWith('I') || code.startsWith('S')) return 'MDCB'; // 神经系统/循环系统
  if (code.startsWith('J')) return 'MDCE'; // 呼吸系统
  if (code.startsWith('K')) return 'MDCG'; // 消化系统
  if (code.startsWith('M') || code.startsWith('S7')) return 'MDCM'; // 肌肉骨骼
  if (code.startsWith('C') || code.startsWith('D')) return 'MDCZ'; // 肿瘤/诊断异常
  return 'MDCR'; // 放射检查相关
}

/**
 * 获取MDC名称
 */
function getMDCName(mdcCode: string): string {
  const names: Record<string, string> = {
    'MDCB': '神经系统疾病及功能障碍',
    'MDCF': '循环系统疾病及功能障碍',
    'MDCE': '呼吸系统疾病及功能障碍',
    'MDCG': '消化系统疾病及功能障碍',
    'MDCM': '肌肉骨骼系统疾病',
    'MDCR': '放射检查相关',
    'MDCZ': '肿瘤及诊断异常',
    'MDCU': '超声检查相关',
  };
  return names[mdcCode] || '未分类';
}

/**
 * 猜测亚目编码
 */
function guessSubgroup(diagnosisCode: string): string {
  const code = diagnosisCode.replace(/\./g, '').substring(0, 3);
  if (code.startsWith('I6') || code.startsWith('I6')) return 'G3A1';
  if (code.startsWith('J1')) return 'E2A1';
  if (code.startsWith('K3')) return 'G4A1';
  if (code.startsWith('M5')) return 'M3A1';
  return 'X99';
}

/**
 * 获取亚目名称
 */
function getSubgroupName(subgroupCode: string): string {
  const names: Record<string, string> = {
    'G3A1': '脑血管病影像诊断',
    'G3B1': '颅内出血影像诊断',
    'E2A1': '肺部感染检查',
    'G4A1': '急腹症影像诊断',
    'M3A1': '脊柱疾病MRI检查',
    'X99': '其他未分类',
  };
  return names[subgroupCode] || '未分类';
}

// ============================================================
// 费用计算函数
// ============================================================

/**
 * 计算费用
 * 根据分组结果计算DRG/DIP对应的费用
 * 
 * @param input - 分组输入参数
 * @param groupType - 分组类型：DRG或DIP
 * @returns 费用计算结果
 * @example
 * ```ts
 * const result = calculateFee({
 *   patientType: '住院',
 *   diagnoses: [{ code: 'I63.900', name: '急性脑梗死', type: '主要诊断', isValid: true }],
 *   procedures: [{ code: '87.03', name: 'CT头部平扫', type: '检查' }],
 *   age: 65,
 *   gender: '男',
 * }, 'DRG');
 * ```
 */
export function calculateFee(input: GrouperInput, groupType: 'DRG' | 'DIP'): FeeCalculationResult {
  const mainDiagnosis = input.diagnoses.find(d => d.type === '主要诊断');
  
  if (!mainDiagnosis) {
    return {
      diagnosisCode: '',
      diagnosisName: '',
      groupCode: '',
      groupName: '',
      totalFee: 0,
      insurancePayment: 0,
      patientPayment: 0,
      feeDetails: [],
      feeNote: '未找到主要诊断',
    };
  }

  // 获取分组结果
  const groupResult = groupType === 'DRG' ? groupDRG(input) : groupDIP(input);
  
  if (!groupResult.success || !groupResult.group) {
    return {
      diagnosisCode: mainDiagnosis.code,
      diagnosisName: mainDiagnosis.name,
      groupCode: '',
      groupName: '',
      totalFee: 0,
      insurancePayment: 0,
      patientPayment: 0,
      feeDetails: [],
      feeNote: groupResult.error || '分组失败',
    };
  }

  let totalFee: number;
  let groupCode: string;
  let groupName: string;

  if (groupType === 'DRG') {
    const drgGroup = groupResult.group as DRGGroup;
    totalFee = drgGroup.baseFee;
    groupCode = drgGroup.code;
    groupName = drgGroup.name;
  } else {
    const dipGroup = groupResult.group as DIPGroup;
    totalFee = dipGroup.totalFee;
    groupCode = dipGroup.code;
    groupName = dipGroup.name;
  }

  // 计算费率（模拟）
  const insurancePaymentRate = input.patientType === '住院' ? 0.7 : 0.5;
  const insurancePayment = Math.round(totalFee * insurancePaymentRate * 100) / 100;
  const patientPayment = Math.round(totalFee * (1 - insurancePaymentRate) * 100) / 100;

  // 生成费用明细
  const feeDetails: FeeDetail[] = generateFeeDetails(totalFee, groupType);

  return {
    diagnosisCode: mainDiagnosis.code,
    diagnosisName: mainDiagnosis.name,
    groupCode,
    groupName,
    totalFee,
    insurancePayment,
    patientPayment,
    feeDetails,
    feeNote: `${groupType}费率：医保支付${insurancePaymentRate * 100}%，个人自付${(1 - insurancePaymentRate) * 100}%`,
  };
}

/**
 * 生成费用明细
 */
function generateFeeDetails(totalFee: number, groupType: string): FeeDetail[] {
  // 模拟费用明细分配
  const details: FeeDetail[] = [
    { code: 'A001', name: '检查费', amount: totalFee * 0.4, category: '检查' },
    { code: 'B001', name: '药品费', amount: totalFee * 0.25, category: '药品' },
    { code: 'C001', name: '手术/操作费', amount: totalFee * 0.2, category: '手术' },
    { code: 'D001', name: '材料费', amount: totalFee * 0.1, category: '材料' },
    { code: 'E001', name: '护理费', amount: totalFee * 0.05, category: '护理' },
  ];

  // 确保四舍五入到分
  return details.map(d => ({
    ...d,
    amount: Math.round(d.amount * 100) / 100,
  }));
}

// ============================================================
// 描述查询函数
// ============================================================

/**
 * 获取DRG描述信息
 * 
 * @param code - DRG编码
 * @returns DRG描述信息或null
 * @example
 * ```ts
 * const desc = getDRGDescription('BR21');
 * console.log(desc); // { code: 'BR21', name: '...', ... }
 * ```
 */
export function getDRGDescription(code: string): DRGGroup | null {
  const entry = DRG_MASTER_TABLE.find(e => e.code === code);
  if (!entry) return null;

  return {
    code: entry.code,
    name: entry.name,
    version: DRG_VERSION,
    weight: entry.weight,
    baseFee: entry.baseFee,
    mdcCode: entry.mdcCode,
    mdcName: entry.mdcName,
    description: `MDC: ${entry.mdcCode} ${entry.mdcName}`,
  };
}

/**
 * 获取DIP描述信息
 * 
 * @param code - DIP编码
 * @returns DIP描述信息或null
 * @example
 * ```ts
 * const desc = getDIPDescription('ADI001');
 * console.log(desc); // { code: 'ADI001', name: '...', ... }
 * ```
 */
export function getDIPDescription(code: string): DIPGroup | null {
  const entry = DIP_MASTER_TABLE.find(e => e.code === code);
  if (!entry) return null;

  return {
    code: entry.code,
    name: entry.name,
    version: DIP_VERSION,
    score: entry.score,
    basePoints: entry.basePoints,
    unitPrice: entry.unitPrice,
    totalFee: entry.basePoints * entry.unitPrice,
    subgroupCode: entry.subgroupCode,
    subgroupName: entry.subgroupName,
    description: `亚目: ${entry.subgroupCode} ${entry.subgroupName}`,
  };
}

// ============================================================
// 主诊断推荐函数
// ============================================================

/**
 * 推荐主诊断
 * 基于诊断列表和手术列表，推荐最合适的主诊断
 * 
 * @param diagnoses - 诊断列表
 * @param procedures - 手术列表（可选）
 * @returns 主诊断推荐结果
 * @example
 * ```ts
 * const suggestions = suggestMainDiagnosis(
 *   [{ code: 'I63.900', name: '急性脑梗死', type: '其他诊断', isValid: true }],
 *   [{ code: '87.03', name: 'CT头部平扫', type: '检查' }]
 * );
 * ```
 */
export function suggestMainDiagnosis(
  diagnoses: Diagnosis[],
  procedures: Procedure[] = []
): MainDiagnosisSuggestion[] {
  const suggestions: MainDiagnosisSuggestion[] = [];

  // 已有主诊断直接返回
  const existingMain = diagnoses.find(d => d.type === '主要诊断');
  if (existingMain) {
    return [{
      code: existingMain.code,
      name: existingMain.name,
      reason: '已明确为主要诊断',
      confidence: 1.0,
      relatedProcedures: procedures,
    }];
  }

  // 根据规则推荐
  for (const diag of diagnoses) {
    let confidence = 0.5;
    let reason = '默认推荐';

    // 危急值诊断优先
    if (['I61', 'I63', 'I64', 'S06'].some(c => diag.code.startsWith(c))) {
      confidence = 0.9;
      reason = '危急值相关诊断，建议作为主诊断';
    }

    // 肿瘤诊断优先
    if (diag.code.startsWith('C')) {
      confidence = Math.max(confidence, 0.85);
      reason = '肿瘤诊断通常作为主诊断';
    }

    // 手术相关诊断加分
    if (procedures.length > 0) {
      const surgeryCodes = procedures.map(p => p.code.split('.')[0]);
      if (['87', '88', '39', '78', '79'].some(c => surgeryCodes.includes(c))) {
        confidence = Math.min(confidence + 0.1, 1.0);
        reason = '与手术操作相关，建议作为主诊断';
      }
    }

    suggestions.push({
      code: diag.code,
      name: diag.name,
      reason,
      confidence,
      relatedProcedures: procedures,
    });
  }

  // 按置信度排序
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ============================================================
// 工具函数
// ============================================================

/**
 * 验证输入数据
 * 
 * @param data - 待验证数据
 * @returns 验证结果
 */
export function validateGrouperInput(data: unknown): { success: true; data: GrouperInput } | { success: false; errors: string[] } {
  const result = GrouperInputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as GrouperInput };
  }
  return { success: false, errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`) };
}

/**
 * 获取DRG颜色（蓝色主题）
 */
export function getDRGColor(): string {
  return DRG_COLOR;
}

/**
 * 获取所有DRG编码列表
 */
export function getAllDRGCodes(): string[] {
  return DRG_MASTER_TABLE.map(e => e.code);
}

/**
 * 获取所有DIP编码列表
 */
export function getAllDIPCodes(): string[] {
  return DIP_MASTER_TABLE.map(e => e.code);
}

/**
 * 导出Mock组合数据
 */
export function getMockCombos(): MockCombo[] {
  return MOCK_COMBOS;
}

// ============================================================
// 快速测试函数
// ============================================================

/**
 * 运行Mock组合测试
 */
export function testMockCombos(): void {
  console.log('='.repeat(60));
  console.log('DRG/DIP 分组器测试');
  console.log('='.repeat(60));

  for (const combo of MOCK_COMBOS) {
    console.log(`\n测试: ${combo.description}`);
    console.log('-'.repeat(40));

    // 构建完整的输入参数（使用测试默认值）
    const input: GrouperInput = {
      patientType: combo.patientType,
      diagnoses: combo.diagnoses,
      procedures: combo.procedures,
      age: 50,
      gender: '男',
      hospitalLevel: '三级甲等',
    };

    // DRG分组测试
    const drgResult = groupDRG(input);
    if (drgResult.success && drgResult.group) {
      const drg = drgResult.group as DRGGroup;
      const expectedMatch = combo.expectedDRG && drg.code === combo.expectedDRG ? '✓' : '?';
      console.log(`DRG结果: ${drg.code} - ${drg.name} [期望:${combo.expectedDRG || '无'}]${expectedMatch}`);
      console.log(`  权重: ${drg.weight}, 费用: ¥${drg.baseFee}`);
    } else {
      console.log(`DRG结果: ${drgResult.error}`);
    }

    // DIP分组测试
    const dipResult = groupDIP(input);
    if (dipResult.success && dipResult.group) {
      const dip = dipResult.group as DIPGroup;
      const expectedMatch = combo.expectedDIP && dip.code === combo.expectedDIP ? '✓' : '?';
      console.log(`DIP结果: ${dip.code} - ${dip.name} [期望:${combo.expectedDIP || '无'}]${expectedMatch}`);
      console.log(`  病种分值: ${dip.score}, 总费用: ¥${dip.totalFee}`);
    } else {
      console.log(`DIP结果: ${dipResult.error}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('测试完成');
  console.log('='.repeat(60));
}