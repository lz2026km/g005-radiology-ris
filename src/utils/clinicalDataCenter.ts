/**
 * CDR Clinical Data Center / 临床数据中心
 * G005 Radiology RIS System
 * 
 * 用于聚合患者临床数据，包括检验结果、诊断、用药、过敏史等信息
 * 支持放射科检查申请中的临床数据展示
 * 
 * @module clinicalDataCenter
 */

import { z } from 'zod';

// ============================================================================
// Zod Schemas / 数据模型校验
// ============================================================================

/** 检验项目类别枚举 */
export const LabCategorySchema = z.enum([
  '血常规', '生化', '免疫', '凝血', '尿常规', '粪便常规', 
  '感染标志物', '肿瘤标志物', '内分泌', '其他'
]);
export type LabCategory = z.infer<typeof LabCategorySchema>;

/** 检验结果状态 */
export const LabResultStatusSchema = z.enum(['正常', '异常', '危急', '待复检']);
export type LabResultStatus = z.infer<typeof LabResultStatusSchema>;

/** 诊断状态 */
export const DiagnosisStatusSchema = z.enum(['活动性', '非活动性', '待确诊', '已排除']);
export type DiagnosisStatus = z.infer<typeof DiagnosisStatusSchema>;

/** 用药途径 */
export const MedicationRouteSchema = z.enum(['口服', '静脉', '肌注', '皮下', '外用', '吸入', '其他']);
export type MedicationRoute = z.infer<typeof MedicationRouteSchema>;

/** 过敏严重程度 */
export const AllergySeveritySchema = z.enum(['轻度', '中度', '重度', '危及生命']);
export type AllergySeverity = z.infer<typeof AllergySeveritySchema>;

/** 过敏反应类型 */
export const AllergyReactionTypeSchema = z.enum(['皮疹', '瘙痒', '水肿', '呼吸困难', '过敏性休克', '其他']);
export type AllergyReactionType = z.infer<typeof AllergyReactionTypeSchema>;

/** 临床数据类型 */
export const ClinicalDataTypeSchema = z.enum(['lab', 'diagnosis', 'medication', 'allergy', 'procedure', 'vital']);
export type ClinicalDataType = z.infer<typeof ClinicalDataTypeSchema>;

// ============================================================================
// Type Definitions / 类型定义
// ============================================================================

/**
 * 检验结果记录
 * 用于存储患者的实验室检验数据
 */
export interface LabResult {
  id: string;
  patientId: string;
  testCode: string;              // 检验项目编码
  testName: string;             // 检验项目名称
  category: LabCategory;        // 检验类别
  value: string | number;       // 检验值
  unit: string;                 // 单位
  referenceRange: string;       // 参考范围
  status: LabResultStatus;      // 结果状态
  isAbnormal: boolean;          // 是否异常
  isCritical: boolean;           // 是否危急值
  collectionDate: string;        // 采样时间
  reportDate: string;           // 报告时间
  performedBy: string;          // 检验者
  instrument?: string;          // 检验仪器
  notes?: string;               // 备注
}

/**
 * 诊断记录
 * 包含患者诊断信息及状态
 */
export interface Diagnosis {
  id: string;
  patientId: string;
  icdCode: string;              // ICD编码
  diagnosisName: string;        // 诊断名称
  diagnosisType: '主要诊断' | '次要诊断' | '并发症' | '既往诊断';
  status: DiagnosisStatus;      // 诊断状态
  onsetDate?: string;           // 发病日期
  diagnosisDate: string;        // 诊断日期
  resolvedDate?: string;        // 解除日期
  severity?: '轻' | '中' | '重' | '危';
  attendingDoctor: string;      // 主诊医生
  department: string;           // 科室
  notes?: string;               // 备注
}

/**
 * 过敏记录
 */
export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;             // 过敏原
  allergenType: '药物' | '食物' | '环境' | '其他';
  severity: AllergySeverity;    // 严重程度
  reactionType: AllergyReactionType[];
  reactionDescription?: string;  // 反应描述
  onsetDate?: string;           // 发现日期
  reportedDate: string;         // 报告日期
  reportedBy: string;           // 报告人
  verified: boolean;            // 是否已核实
  notes?: string;               // 备注
}

/**
 * 用药记录
 */
export interface Medication {
  id: string;
  patientId: string;
  drugName: string;             // 药品名称
  genericName?: string;         // 通用名
  dosage: string;               // 剂量
  route: MedicationRoute;      // 用药途径
  frequency: string;            // 用药频率
  startDate: string;           // 开始日期
  endDate?: string;             // 结束日期
  isActive: boolean;           // 是否在用
  prescriber: string;           // 开方医生
  department: string;           // 科室
  indication?: string;          // 用药指征
  isControlled: boolean;        // 是否管制药品
  notes?: string;               // 备注
}

/**
 * 临床数据时间线事件
 * 用于展示患者临床事件的时间线
 */
export interface ClinicalTimelineEvent {
  id: string;
  patientId: string;
  type: ClinicalDataType;
  title: string;
  description: string;
  date: string;
  time?: string;
  category?: string;
  status?: string;
  doctor?: string;
  department?: string;
  isCritical?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * 临床数据聚合结果
 * 包含患者所有临床数据的聚合视图
 */
export interface PatientClinicalData {
  patientId: string;
  patientName: string;
  gender: '男' | '女' | '其他';
  age: number;
  collectedAt: string;          // 数据收集时间
  labResults: LabResult[];
  diagnoses: Diagnosis[];
  allergies: Allergy[];
  medications: Medication[];
  timeline: ClinicalTimelineEvent[];
  summary: {
    totalLabTests: number;
    abnormalLabCount: number;
    criticalLabCount: number;
    activeDiagnosesCount: number;
    knownAllergiesCount: number;
    activeMedicationsCount: number;
  };
}

/**
 * 检验结果聚合统计
 */
export interface LabAggregation {
  category: LabCategory;
  testName: string;
  count: number;
  abnormalCount: number;
  criticalCount: number;
  averageValue?: number;
  minValue?: number;
  maxValue?: number;
  lastReportDate: string;
}

/**
 * 检验结果筛选参数
 */
export interface LabFilterParams {
  patientId?: string;
  category?: LabCategory;
  status?: LabResultStatus;
  startDate?: string;
  endDate?: string;
  isAbnormal?: boolean;
  isCritical?: boolean;
  testName?: string;
  limit?: number;
  offset?: number;
}

/**
 * 时间线筛选参数
 */
export interface TimelineFilterParams {
  patientId: string;
  startDate?: string;
  endDate?: string;
  types?: ClinicalDataType[];
  includeCritical?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Mock Data / 模拟数据
// ============================================================================

/**
 * 生成模拟检验结果数据
 */
function generateMockLabResults(): LabResult[] {
  return [
    {
      id: 'LAB-2024-001',
      patientId: 'PT-001',
      testCode: 'WBC',
      testName: '白细胞计数',
      category: '血常规',
      value: 12.5,
      unit: '×10⁹/L',
      referenceRange: '4-10',
      status: '异常',
      isAbnormal: true,
      isCritical: false,
      collectionDate: '2024-12-15 08:30:00',
      reportDate: '2024-12-15 10:45:00',
      performedBy: '李检验',
      instrument: 'Sysmex XN-2000',
      notes: '轻度升高，可能存在感染',
    },
    {
      id: 'LAB-2024-002',
      patientId: 'PT-001',
      testCode: 'PLT',
      testName: '血小板计数',
      category: '血常规',
      value: 85,
      unit: '×10⁹/L',
      referenceRange: '100-300',
      status: '异常',
      isAbnormal: true,
      isCritical: false,
      collectionDate: '2024-12-15 08:30:00',
      reportDate: '2024-12-15 10:45:00',
      performedBy: '李检验',
      instrument: 'Sysmex XN-2000',
      notes: '血小板减少，需关注',
    },
    {
      id: 'LAB-2024-003',
      patientId: 'PT-001',
      testCode: 'ALT',
      testName: '谷丙转氨酶',
      category: '生化',
      value: 78,
      unit: 'U/L',
      referenceRange: '0-40',
      status: '异常',
      isAbnormal: true,
      isCritical: false,
      collectionDate: '2024-12-14 07:00:00',
      reportDate: '2024-12-14 11:20:00',
      performedBy: '王检验',
      instrument: 'Beckman AU5800',
      notes: '肝功能轻度异常',
    },
    {
      id: 'LAB-2024-004',
      patientId: 'PT-001',
      testCode: 'AST',
      testName: '谷草转氨酶',
      category: '生化',
      value: 65,
      unit: 'U/L',
      referenceRange: '0-40',
      status: '异常',
      isAbnormal: true,
      isCritical: false,
      collectionDate: '2024-12-14 07:00:00',
      reportDate: '2024-12-14 11:20:00',
      performedBy: '王检验',
      instrument: 'Beckman AU5800',
    },
    {
      id: 'LAB-2024-005',
      patientId: 'PT-001',
      testCode: 'CRP',
      testName: 'C反应蛋白',
      category: '感染标志物',
      value: 45.2,
      unit: 'mg/L',
      referenceRange: '0-10',
      status: '危急',
      isAbnormal: true,
      isCritical: true,
      collectionDate: '2024-12-15 08:30:00',
      reportDate: '2024-12-15 11:00:00',
      performedBy: '李检验',
      instrument: 'Roche Cobas c702',
      notes: 'CRP显著升高，提示严重感染',
    },
    {
      id: 'LAB-2024-006',
      patientId: 'PT-002',
      testCode: 'HGB',
      testName: '血红蛋白',
      category: '血常规',
      value: 9.2,
      unit: 'g/dL',
      referenceRange: '11-16',
      status: '异常',
      isAbnormal: true,
      isCritical: false,
      collectionDate: '2024-12-13 09:00:00',
      reportDate: '2024-12-13 11:30:00',
      performedBy: '张检验',
      instrument: 'Sysmex XN-2000',
      notes: '轻度贫血',
    },
    {
      id: 'LAB-2024-007',
      patientId: 'PT-002',
      testCode: 'CEA',
      testName: '癌胚抗原',
      category: '肿瘤标志物',
      value: 8.5,
      unit: 'ng/mL',
      referenceRange: '0-5',
      status: '异常',
      isAbnormal: true,
      isCritical: false,
      collectionDate: '2024-12-10 07:30:00',
      reportDate: '2024-12-10 12:00:00',
      performedBy: '赵检验',
      instrument: 'Roche Cobas e801',
      notes: '轻度升高，需追踪观察',
    },
    {
      id: 'LAB-2024-008',
      patientId: 'PT-003',
      testCode: 'GLU',
      testName: '空腹血糖',
      category: '生化',
      value: 14.2,
      unit: 'mmol/L',
      referenceRange: '3.9-6.1',
      status: '危急',
      isAbnormal: true,
      isCritical: true,
      collectionDate: '2024-12-12 07:00:00',
      reportDate: '2024-12-12 09:30:00',
      performedBy: '王检验',
      instrument: 'Beckman AU5800',
      notes: '血糖显著升高，需紧急处理',
    },
    {
      id: 'LAB-2024-009',
      patientId: 'PT-003',
      testCode: 'HbA1c',
      testName: '糖化血红蛋白',
      category: '内分泌',
      value: 11.5,
      unit: '%',
      referenceRange: '4-6',
      status: '异常',
      isAbnormal: true,
      isCritical: false,
      collectionDate: '2024-12-12 07:00:00',
      reportDate: '2024-12-12 10:00:00',
      performedBy: '王检验',
      instrument: 'Tosoh G8',
      notes: '血糖控制差',
    },
    {
      id: 'LAB-2024-010',
      patientId: 'PT-004',
      testCode: 'PCT',
      testName: '降钙素原',
      category: '感染标志物',
      value: 2.8,
      unit: 'ng/mL',
      referenceRange: '0-0.05',
      status: '危急',
      isAbnormal: true,
      isCritical: true,
      collectionDate: '2024-12-14 15:00:00',
      reportDate: '2024-12-14 16:30:00',
      performedBy: '李检验',
      instrument: 'Roche Cobas e801',
      notes: 'PCT显著升高，高度提示细菌感染',
    },
    {
      id: 'LAB-2024-011',
      patientId: 'PT-004',
      testCode: 'WBC',
      testName: '白细胞计数',
      category: '血常规',
      value: 18.2,
      unit: '×10⁹/L',
      referenceRange: '4-10',
      status: '异常',
      isAbnormal: true,
      isCritical: true,
      collectionDate: '2024-12-14 15:00:00',
      reportDate: '2024-12-14 17:00:00',
      performedBy: '李检验',
      instrument: 'Sysmex XN-2000',
      notes: '白细胞显著升高',
    },
    {
      id: 'LAB-2024-012',
      patientId: 'PT-005',
      testCode: 'Cr',
      testName: '肌酐',
      category: '生化',
      value: 256,
      unit: 'μmol/L',
      referenceRange: '44-133',
      status: '异常',
      isAbnormal: true,
      isCritical: false,
      collectionDate: '2024-12-11 08:00:00',
      reportDate: '2024-12-11 10:30:00',
      performedBy: '王检验',
      instrument: 'Beckman AU5800',
      notes: '肾功能异常',
    },
    {
      id: 'LAB-2024-013',
      patientId: 'PT-005',
      testCode: 'BUN',
      testName: '尿素氮',
      category: '生化',
      value: 18.5,
      unit: 'mmol/L',
      referenceRange: '2.6-7.5',
      status: '异常',
      isAbnormal: true,
      isCritical: false,
      collectionDate: '2024-12-11 08:00:00',
      reportDate: '2024-12-11 10:30:00',
      performedBy: '王检验',
      instrument: 'Beckman AU5800',
      notes: '肾功能轻度异常',
    },
    {
      id: 'LAB-2024-014',
      patientId: 'PT-006',
      testCode: 'TP',
      testName: '总蛋白',
      category: '生化',
      value: 55,
      unit: 'g/L',
      referenceRange: '60-85',
      status: '异常',
      isAbnormal: true,
      isCritical: false,
      collectionDate: '2024-12-10 07:30:00',
      reportDate: '2024-12-10 10:00:00',
      performedBy: '张检验',
      instrument: 'Beckman AU5800',
      notes: '低蛋白血症',
    },
    {
      id: 'LAB-2024-015',
      patientId: 'PT-006',
      testCode: 'ALB',
      testName: '白蛋白',
      category: '生化',
      value: 28,
      unit: 'g/L',
      referenceRange: '35-50',
      status: '异常',
      isAbnormal: true,
      isCritical: false,
      collectionDate: '2024-12-10 07:30:00',
      reportDate: '2024-12-10 10:00:00',
      performedBy: '张检验',
      instrument: 'Beckman AU5800',
      notes: '白蛋白偏低',
    },
  ];
}

/**
 * 生成模拟诊断数据
 */
function generateMockDiagnoses(): Diagnosis[] {
  return [
    {
      id: 'DIA-2024-001',
      patientId: 'PT-001',
      icdCode: 'J18.900',
      diagnosisName: '肺部感染',
      diagnosisType: '主要诊断',
      status: '活动性',
      onsetDate: '2024-12-14',
      diagnosisDate: '2024-12-15',
      severity: '中',
      attendingDoctor: '张医生',
      department: '呼吸内科',
      notes: 'CT显示右下肺炎症',
    },
    {
      id: 'DIA-2024-002',
      patientId: 'PT-001',
      icdCode: 'K76.000',
      diagnosisName: '脂肪肝',
      diagnosisType: '既往诊断',
      status: '非活动性',
      onsetDate: '2023-06-15',
      diagnosisDate: '2023-06-20',
      severity: '轻',
      attendingDoctor: '李医生',
      department: '消化内科',
    },
    {
      id: 'DIA-2024-003',
      patientId: 'PT-002',
      icdCode: 'D64.900',
      diagnosisName: '贫血',
      diagnosisType: '主要诊断',
      status: '活动性',
      onsetDate: '2024-12-10',
      diagnosisDate: '2024-12-13',
      severity: '中',
      attendingDoctor: '王医生',
      department: '血液科',
      notes: '需进一步检查贫血原因',
    },
    {
      id: 'DIA-2024-004',
      patientId: 'PT-002',
      icdCode: 'C18.901',
      diagnosisName: '结肠息肉',
      diagnosisType: '次要诊断',
      status: '待确诊',
      diagnosisDate: '2024-12-10',
      attendingDoctor: '陈医生',
      department: '消化内科',
      notes: '肠镜发现，需病理确诊',
    },
    {
      id: 'DIA-2024-005',
      patientId: 'PT-003',
      icdCode: 'E11.900',
      diagnosisName: '2型糖尿病',
      diagnosisType: '主要诊断',
      status: '活动性',
      onsetDate: '2019-08-15',
      diagnosisDate: '2019-08-20',
      severity: '中',
      attendingDoctor: '赵医生',
      department: '内分泌科',
      notes: '血糖控制欠佳',
    },
    {
      id: 'DIA-2024-006',
      patientId: 'PT-003',
      icdCode: 'I10.x00',
      diagnosisName: '高血压',
      diagnosisType: '次要诊断',
      status: '活动性',
      onsetDate: '2020-03-10',
      diagnosisDate: '2020-03-15',
      severity: '轻',
      attendingDoctor: '赵医生',
      department: '内分泌科',
    },
    {
      id: 'DIA-2024-007',
      patientId: 'PT-004',
      icdCode: 'A41.900',
      diagnosisName: '脓毒症',
      diagnosisType: '主要诊断',
      status: '活动性',
      onsetDate: '2024-12-14',
      diagnosisDate: '2024-12-14',
      severity: '危',
      attendingDoctor: '刘医生',
      department: '重症医学科',
      notes: 'PCT显著升高，经验性抗感染治疗',
    },
    {
      id: 'DIA-2024-008',
      patientId: 'PT-004',
      icdCode: 'K65.900',
      diagnosisName: '腹膜炎',
      diagnosisType: '并发症',
      status: '活动性',
      onsetDate: '2024-12-13',
      diagnosisDate: '2024-12-14',
      severity: '重',
      attendingDoctor: '刘医生',
      department: '重症医学科',
    },
    {
      id: 'DIA-2024-009',
      patientId: 'PT-005',
      icdCode: 'N18.900',
      diagnosisName: '慢性肾脏病',
      diagnosisType: '主要诊断',
      status: '活动性',
      onsetDate: '2022-05-20',
      diagnosisDate: '2022-05-25',
      severity: '中',
      attendingDoctor: '周医生',
      department: '肾内科',
      notes: 'eGFR下降，需监测肾功能',
    },
    {
      id: 'DIA-2024-010',
      patientId: 'PT-005',
      icdCode: 'E11.600',
      diagnosisName: '糖尿病肾病',
      diagnosisType: '并发症',
      status: '活动性',
      onsetDate: '2022-05-20',
      diagnosisDate: '2022-06-01',
      severity: '中',
      attendingDoctor: '周医生',
      department: '肾内科',
    },
    {
      id: 'DIA-2024-011',
      patientId: 'PT-006',
      icdCode: 'K74.600',
      diagnosisName: '肝硬化',
      diagnosisType: '主要诊断',
      status: '活动性',
      onsetDate: '2021-10-15',
      diagnosisDate: '2021-10-20',
      severity: '重',
      attendingDoctor: '孙医生',
      department: '消化内科',
      notes: '失代偿期，有腹水',
    },
    {
      id: 'DIA-2024-012',
      patientId: 'PT-006',
      icdCode: 'K76.600',
      diagnosisName: '门脉高压',
      diagnosisType: '并发症',
      status: '活动性',
      onsetDate: '2021-10-15',
      diagnosisDate: '2021-10-25',
      severity: '重',
      attendingDoctor: '孙医生',
      department: '消化内科',
    },
  ];
}

/**
 * 生成模拟过敏数据
 */
function generateMockAllergies(): Allergy[] {
  return [
    {
      id: 'ALL-2024-001',
      patientId: 'PT-001',
      allergen: '青霉素',
      allergenType: '药物',
      severity: '重度',
      reactionType: ['皮疹', '呼吸困难'],
      reactionDescription: '用药后出现全身皮疹伴呼吸困难',
      onsetDate: '2020-05-15',
      reportedDate: '2020-05-15',
      reportedBy: '张医生',
      verified: true,
      notes: '皮试阳性',
    },
    {
      id: 'ALL-2024-002',
      patientId: 'PT-001',
      allergen: '磺胺类',
      allergenType: '药物',
      severity: '中度',
      reactionType: ['皮疹', '瘙痒'],
      reactionDescription: '口服磺胺后出现皮肤瘙痒',
      onsetDate: '2019-08-20',
      reportedDate: '2019-08-20',
      reportedBy: '李医生',
      verified: true,
    },
    {
      id: 'ALL-2024-003',
      patientId: 'PT-002',
      allergen: '虾',
      allergenType: '食物',
      severity: '中度',
      reactionType: ['皮疹', '瘙痒'],
      reactionDescription: '食用虾后出现荨麻疹',
      onsetDate: '2018-03-10',
      reportedDate: '2018-03-10',
      reportedBy: '王医生',
      verified: true,
    },
    {
      id: 'ALL-2024-004',
      patientId: 'PT-003',
      allergen: '碘造影剂',
      allergenType: '药物',
      severity: '轻度',
      reactionType: ['皮疹'],
      reactionDescription: 'CT增强扫描后出现轻度皮疹',
      onsetDate: '2021-12-05',
      reportedDate: '2021-12-05',
      reportedBy: '赵医生',
      verified: true,
      notes: '可考虑使用激素预处理',
    },
    {
      id: 'ALL-2024-005',
      patientId: 'PT-004',
      allergen: '头孢类',
      allergenType: '药物',
      severity: '重度',
      reactionType: ['过敏性休克'],
      reactionDescription: '静脉输注头孢时发生过敏性休克',
      onsetDate: '2022-06-18',
      reportedDate: '2022-06-18',
      reportedBy: '刘医生',
      verified: true,
      notes: '绝对禁用头孢类药物',
    },
    {
      id: 'ALL-2024-006',
      patientId: 'PT-005',
      allergen: '花粉',
      allergenType: '环境',
      severity: '轻度',
      reactionType: ['瘙痒', '水肿'],
      reactionDescription: '春秋季接触花粉后出现眼痒、鼻塞',
      onsetDate: '2017-04-01',
      reportedDate: '2017-04-05',
      reportedBy: '周医生',
      verified: true,
    },
    {
      id: 'ALL-2024-007',
      patientId: 'PT-005',
      allergen: '芒果',
      allergenType: '食物',
      severity: '中度',
      reactionType: ['皮疹'],
      reactionDescription: '食用芒果后口唇红肿',
      onsetDate: '2020-09-10',
      reportedDate: '2020-09-10',
      reportedBy: '周医生',
      verified: true,
    },
    {
      id: 'ALL-2024-008',
      patientId: 'PT-006',
      allergen: '酒精',
      allergenType: '其他',
      severity: '轻度',
      reactionType: ['皮疹'],
      reactionDescription: '饮酒后出现面部潮红',
      onsetDate: '2016-08-15',
      reportedDate: '2016-08-15',
      reportedBy: '孙医生',
      verified: true,
    },
    {
      id: 'ALL-2024-009',
      patientId: 'PT-006',
      allergen: '止痛药',
      allergenType: '药物',
      severity: '中度',
      reactionType: ['皮疹', '瘙痒'],
      reactionDescription: '服用止痛药后出现皮疹',
      onsetDate: '2019-11-20',
      reportedDate: '2019-11-20',
      reportedBy: '孙医生',
      verified: false,
      notes: '待核实具体药物名称',
    },
    {
      id: 'ALL-2024-010',
      patientId: 'PT-007',
      allergen: '海鲜',
      allergenType: '食物',
      severity: '重度',
      reactionType: ['呼吸困难', '水肿'],
      reactionDescription: '食用海鲜后出现喉头水肿、呼吸困难',
      onsetDate: '2015-07-22',
      reportedDate: '2015-07-22',
      reportedBy: '陈医生',
      verified: true,
      notes: '需随身携带肾上腺素笔',
    },
  ];
}

/**
 * 生成模拟用药数据
 */
function generateMockMedications(): Medication[] {
  return [
    {
      id: 'MED-2024-001',
      patientId: 'PT-001',
      drugName: '头孢曲松',
      genericName: 'Ceftriaxone',
      dosage: '2g',
      route: '静脉',
      frequency: '每日一次',
      startDate: '2024-12-15',
      isActive: true,
      prescriber: '张医生',
      department: '呼吸内科',
      indication: '肺部感染抗感染治疗',
      isControlled: false,
      notes: '皮试阴性后使用',
    },
    {
      id: 'MED-2024-002',
      patientId: 'PT-001',
      drugName: '氨溴索',
      genericName: 'Ambroxol',
      dosage: '30mg',
      route: '静脉',
      frequency: '每日三次',
      startDate: '2024-12-15',
      isActive: true,
      prescriber: '张医生',
      department: '呼吸内科',
      indication: '祛痰',
      isControlled: false,
    },
    {
      id: 'MED-2024-003',
      patientId: 'PT-002',
      drugName: '多糖铁复合物',
      genericName: 'Polysaccharide Iron Complex',
      dosage: '150mg',
      route: '口服',
      frequency: '每日一次',
      startDate: '2024-12-13',
      isActive: true,
      prescriber: '王医生',
      department: '血液科',
      indication: '缺铁性贫血补铁治疗',
      isControlled: false,
    },
    {
      id: 'MED-2024-004',
      patientId: 'PT-003',
      drugName: '二甲双胍',
      genericName: 'Metformin',
      dosage: '500mg',
      route: '口服',
      frequency: '每日两次',
      startDate: '2019-08-25',
      isActive: true,
      prescriber: '赵医生',
      department: '内分泌科',
      indication: '2型糖尿病降糖治疗',
      isControlled: false,
    },
    {
      id: 'MED-2024-005',
      patientId: 'PT-003',
      drugName: '硝苯地平',
      genericName: 'Nifedipine',
      dosage: '30mg',
      route: '口服',
      frequency: '每日一次',
      startDate: '2020-03-20',
      isActive: true,
      prescriber: '赵医生',
      department: '内分泌科',
      indication: '高血压控制',
      isControlled: false,
    },
    {
      id: 'MED-2024-006',
      patientId: 'PT-003',
      drugName: '胰岛素',
      genericName: 'Insulin',
      dosage: '12U',
      route: '皮下',
      frequency: '睡前一次',
      startDate: '2024-12-12',
      isActive: true,
      prescriber: '赵医生',
      department: '内分泌科',
      indication: '血糖控制不佳，调整方案',
      isControlled: true,
      notes: '基础-餐时方案',
    },
    {
      id: 'MED-2024-007',
      patientId: 'PT-004',
      drugName: '美罗培南',
      genericName: 'Meropenem',
      dosage: '1g',
      route: '静脉',
      frequency: '每8小时一次',
      startDate: '2024-12-14',
      isActive: true,
      prescriber: '刘医生',
      department: '重症医学科',
      indication: '脓毒症经验性抗感染',
      isControlled: false,
      notes: '广谱碳青霉烯类',
    },
    {
      id: 'MED-2024-008',
      patientId: 'PT-004',
      drugName: '去甲肾上腺素',
      genericName: 'Norepinephrine',
      dosage: '0.1μg/kg/min',
      route: '静脉',
      frequency: '持续泵入',
      startDate: '2024-12-14',
      isActive: true,
      prescriber: '刘医生',
      department: '重症医学科',
      indication: '脓毒性休克血管活性药物',
      isControlled: true,
      notes: '需深静脉给药',
    },
    {
      id: 'MED-2024-009',
      patientId: 'PT-005',
      drugName: '尿毒清',
      genericName: 'Niaoduqing',
      dosage: '5g',
      route: '口服',
      frequency: '每日三次',
      startDate: '2022-06-01',
      isActive: true,
      prescriber: '周医生',
      department: '肾内科',
      indication: '慢性肾脏病辅助治疗',
      isControlled: false,
    },
    {
      id: 'MED-2024-010',
      patientId: 'PT-005',
      drugName: '拜阿司匹林',
      genericName: 'Aspirin',
      dosage: '100mg',
      route: '口服',
      frequency: '每日一次',
      startDate: '2022-06-01',
      isActive: true,
      prescriber: '周医生',
      department: '肾内科',
      indication: '心脑血管事件预防',
      isControlled: false,
    },
    {
      id: 'MED-2024-011',
      patientId: 'PT-006',
      drugName: '螺内酯',
      genericName: 'Spironolactone',
      dosage: '20mg',
      route: '口服',
      frequency: '每日一次',
      startDate: '2021-10-25',
      isActive: true,
      prescriber: '孙医生',
      department: '消化内科',
      indication: '肝硬化腹水利尿治疗',
      isControlled: false,
    },
    {
      id: 'MED-2024-012',
      patientId: 'PT-006',
      drugName: '普萘洛尔',
      genericName: 'Propranolol',
      dosage: '10mg',
      route: '口服',
      frequency: '每日两次',
      startDate: '2021-11-01',
      isActive: true,
      prescriber: '孙医生',
      department: '消化内科',
      indication: '门脉高压预防出血',
      isControlled: false,
      notes: '需监测心率',
    },
  ];
}

// ============================================================================
// Data Stores / 数据存储
// ============================================================================

const labResultsStore: LabResult[] = generateMockLabResults();
const diagnosesStore: Diagnosis[] = generateMockDiagnoses();
const allergiesStore: Allergy[] = generateMockAllergies();
const medicationsStore: Medication[] = generateMockMedications();

// ============================================================================
// Utility Functions / 工具函数
// ============================================================================

/**
 * 根据patientId获取对应的模拟患者信息
 */
function getPatientInfo(patientId: string): { name: string; gender: '男' | '女' | '其他'; age: number } {
  const patientMap: Record<string, { name: string; gender: '男' | '女' | '其他'; age: number }> = {
    'PT-001': { name: '张伟', gender: '男', age: 49 },
    'PT-002': { name: '陈美', gender: '女', age: 36 },
    'PT-003': { name: '王健', gender: '男', age: 32 },
    'PT-004': { name: '李秀', gender: '女', age: 64 },
    'PT-005': { name: '刘浩', gender: '男', age: 23 },
    'PT-006': { name: '周青', gender: '女', age: 46 },
    'PT-007': { name: '杨峰', gender: '男', age: 41 },
  };
  return patientMap[patientId] || { name: '未知', gender: '其他', age: 0 };
}

/**
 * 按日期排序临床事件
 */
function sortByDate<T extends { date: string; time?: string }>(items: T[]): T[] {
  return items.sort((a, b) => {
    const dateA = a.time ? `${a.date} ${a.time}` : a.date;
    const dateB = b.time ? `${b.date} ${b.time}` : b.date;
    return dateB.localeCompare(dateA);
  });
}

// ============================================================================
// Exported Functions / 导出函数
// ============================================================================

/**
 * 获取患者完整临床数据
 * 
 * @param patientId - 患者ID
 * @returns 患者临床数据聚合结果
 * 
 * @example
 * ```typescript
 * const clinicalData = getPatientClinicalData('PT-001');
 * console.log(clinicalData.summary);
 * ```
 */
export function getPatientClinicalData(patientId: string): PatientClinicalData | null {
  const patientInfo = getPatientInfo(patientId);
  
  const labResults = labResultsStore.filter(l => l.patientId === patientId);
  const diagnoses = diagnosesStore.filter(d => d.patientId === patientId);
  const allergies = allergiesStore.filter(a => a.patientId === patientId);
  const medications = medicationsStore.filter(m => m.patientId === patientId);
  
  // 构建时间线
  const timeline: ClinicalTimelineEvent[] = [];
  
  // 添加检验事件
  labResults.forEach(lab => {
    timeline.push({
      id: `TL-LAB-${lab.id}`,
      patientId,
      type: 'lab',
      title: `${lab.testName}`,
      description: `${lab.value} ${lab.unit} (参考值: ${lab.referenceRange})`,
      date: lab.reportDate.split(' ')[0],
      time: lab.reportDate.split(' ')[1],
      category: lab.category,
      status: lab.status,
      isCritical: lab.isCritical,
      metadata: { testCode: lab.testCode, isAbnormal: lab.isAbnormal },
    });
  });
  
  // 添加诊断事件
  diagnoses.forEach(diag => {
    timeline.push({
      id: `TL-DIA-${diag.id}`,
      patientId,
      type: 'diagnosis',
      title: diag.diagnosisName,
      description: `${diag.diagnosisType} | ${diag.status}`,
      date: diag.diagnosisDate,
      category: diag.department,
      status: diag.status,
      doctor: diag.attendingDoctor,
      isCritical: diag.severity === '危',
      metadata: { icdCode: diag.icdCode, severity: diag.severity },
    });
  });
  
  // 添加用药事件
  medications.filter(m => m.isActive).forEach(med => {
    timeline.push({
      id: `TL-MED-${med.id}`,
      patientId,
      type: 'medication',
      title: med.drugName,
      description: `${med.dosage} ${med.route} ${med.frequency}`,
      date: med.startDate,
      category: med.department,
      doctor: med.prescriber,
      isCritical: med.isControlled,
      metadata: { genericName: med.genericName, indication: med.indication },
    });
  });
  
  // 添加过敏事件
  allergies.forEach(allergy => {
    timeline.push({
      id: `TL-ALL-${allergy.id}`,
      patientId,
      type: 'allergy',
      title: `过敏: ${allergy.allergen}`,
      description: `${allergy.allergenType} | ${allergy.severity}`,
      date: allergy.reportedDate,
      status: allergy.verified ? '已核实' : '待核实',
      isCritical: allergy.severity === '危及生命',
      metadata: { reactionType: allergy.reactionType },
    });
  });
  
  // 计算摘要
  const summary = {
    totalLabTests: labResults.length,
    abnormalLabCount: labResults.filter(l => l.isAbnormal).length,
    criticalLabCount: labResults.filter(l => l.isCritical).length,
    activeDiagnosesCount: diagnoses.filter(d => d.status === '活动性').length,
    knownAllergiesCount: allergies.length,
    activeMedicationsCount: medications.filter(m => m.isActive).length,
  };
  
  return {
    patientId,
    patientName: patientInfo.name,
    gender: patientInfo.gender,
    age: patientInfo.age,
    collectedAt: new Date().toISOString(),
    labResults,
    diagnoses,
    allergies,
    medications,
    timeline: sortByDate(timeline),
    summary,
  };
}

/**
 * 获取患者临床时间线
 * 
 * @param params - 筛选参数
 * @returns 按时间排序的临床事件数组
 */
export function getClinicalTimeline(params: TimelineFilterParams): {
  events: ClinicalTimelineEvent[];
  total: number;
} {
  const clinicalData = getPatientClinicalData(params.patientId);
  if (!clinicalData) {
    return { events: [], total: 0 };
  }
  
  let events = clinicalData.timeline;
  
  // 按类型过滤
  if (params.types && params.types.length > 0) {
    events = events.filter(e => params.types!.includes(e.type));
  }
  
  // 按日期范围过滤
  if (params.startDate) {
    events = events.filter(e => e.date >= params.startDate!);
  }
  if (params.endDate) {
    events = events.filter(e => e.date <= params.endDate!);
  }
  
  // 包含危急事件
  if (params.includeCritical) {
    events = events.filter(e => e.isCritical);
  }
  
  const total = events.length;
  
  // 分页
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 50;
  events = events.slice(offset, offset + limit);
  
  return { events, total };
}

/**
 * 聚合检验结果数据
 * 
 * @param params - 筛选参数
 * @returns 按类别和项目聚合的检验结果统计
 */
export function aggregateLabResults(params: LabFilterParams = {}): LabAggregation[] {
  let results = [...labResultsStore];
  
  // 应用筛选
  if (params.patientId) {
    results = results.filter(r => r.patientId === params.patientId);
  }
  if (params.category) {
    results = results.filter(r => r.category === params.category);
  }
  if (params.status) {
    results = results.filter(r => r.status === params.status);
  }
  if (params.isAbnormal !== undefined) {
    results = results.filter(r => r.isAbnormal === params.isAbnormal);
  }
  if (params.isCritical !== undefined) {
    results = results.filter(r => r.isCritical === params.isCritical);
  }
  if (params.testName) {
    results = results.filter(r => r.testName.includes(params.testName!));
  }
  if (params.startDate) {
    results = results.filter(r => r.reportDate >= params.startDate!);
  }
  if (params.endDate) {
    results = results.filter(r => r.reportDate <= params.endDate!);
  }
  
  // 按类别和项目名分组聚合
  const aggregationMap = new Map<string, LabAggregation>();
  
  results.forEach(lab => {
    const key = `${lab.category}-${lab.testName}`;
    const existing = aggregationMap.get(key);
    
    if (existing) {
      existing.count += 1;
      if (lab.isAbnormal) existing.abnormalCount += 1;
      if (lab.isCritical) existing.criticalCount += 1;
      if (typeof lab.value === 'number') {
        existing.minValue = existing.minValue !== undefined 
          ? Math.min(existing.minValue, lab.value) 
          : lab.value;
        existing.maxValue = existing.maxValue !== undefined 
          ? Math.max(existing.maxValue, lab.value) 
          : lab.value;
        existing.averageValue = existing.averageValue !== undefined
          ? (existing.averageValue * (existing.count - 1) + lab.value) / existing.count
          : lab.value;
      }
      if (lab.reportDate > existing.lastReportDate) {
        existing.lastReportDate = lab.reportDate;
      }
    } else {
      const agg: LabAggregation = {
        category: lab.category,
        testName: lab.testName,
        count: 1,
        abnormalCount: lab.isAbnormal ? 1 : 0,
        criticalCount: lab.isCritical ? 1 : 0,
        lastReportDate: lab.reportDate,
      };
      if (typeof lab.value === 'number') {
        agg.minValue = lab.value;
        agg.maxValue = lab.value;
        agg.averageValue = lab.value;
      }
      aggregationMap.set(key, agg);
    }
  });
  
  return Array.from(aggregationMap.values()).sort((a, b) => 
    b.lastReportDate.localeCompare(a.lastReportDate)
  );
}

/**
 * 获取患者过敏记录
 * 
 * @param patientId - 患者ID
 * @param includeVerifiedOnly - 仅返回已核实的过敏记录
 * @returns 过敏记录数组
 */
export function getAllergies(patientId: string, includeVerifiedOnly = false): Allergy[] {
  let allergies = allergiesStore.filter(a => a.patientId === patientId);
  
  if (includeVerifiedOnly) {
    allergies = allergies.filter(a => a.verified);
  }
  
  return allergies;
}

/**
 * 获取患者活动性诊断
 * 
 * @param patientId - 患者ID
 * @param status - 诊断状态筛选，默认返回活动性诊断
 * @returns 诊断记录数组
 */
export function getActiveDiagnoses(
  patientId: string, 
  status: DiagnosisStatus = '活动性'
): Diagnosis[] {
  return diagnosesStore.filter(d => 
    d.patientId === patientId && d.status === status
  );
}

/**
 * 获取患者用药历史
 * 
 * @param patientId - 患者ID
 * @param activeOnly - 仅返回当前在用药物
 * @returns 用药记录数组
 */
export function getMedicationHistory(patientId: string, activeOnly = false): Medication[] {
  let medications = medicationsStore.filter(m => m.patientId === patientId);
  
  if (activeOnly) {
    medications = medications.filter(m => m.isActive);
  }
  
  return medications;
}

/**
 * 获取危急检验结果
 * 
 * @param patientId - 可选的 患者ID，不提供则返回所有患者
 * @returns 危急检验结果数组
 */
export function getCriticalLabResults(patientId?: string): LabResult[] {
  let results = labResultsStore.filter(r => r.isCritical);
  
  if (patientId) {
    results = results.filter(r => r.patientId === patientId);
  }
  
  return results;
}

/**
 * 获取患者过敏信息摘要（用于显示在检查申请中）
 * 
 * @param patientId - 患者ID
 * @returns 过敏摘要信息
 */
export function getAllergySummary(patientId: string): {
  hasAllergy: boolean;
  count: number;
  severeCount: number;
  highRiskAllergens: string[];
  displayText: string;
} {
  const allergies = getAllergies(patientId, false);
  const severeAllergies = allergies.filter(a => 
    a.severity === '重度' || a.severity === '危及生命'
  );
  
  const hasAllergy = allergies.length > 0;
  const count = allergies.length;
  const severeCount = severeAllergies.length;
  const highRiskAllergens = severeAllergies.map(a => a.allergen);
  
  let displayText = '无已知过敏';
  if (hasAllergy) {
    if (severeCount > 0) {
      displayText = `有${severeCount}种严重过敏: ${highRiskAllergens.join(', ')}`;
    } else {
      displayText = `有${count}种过敏: ${allergies.map(a => a.allergen).slice(0, 3).join(', ')}${count > 3 ? '...' : ''}`;
    }
  }
  
  return { hasAllergy, count, severeCount, highRiskAllergens, displayText };
}

// ============================================================================
// Color Scheme Constants / 颜色方案常量
// ============================================================================

/**
 * 临床数据中心配色方案
 * 使用蓝色 #3b82f6 作为主色调，符合项目要求
 */
export const ClinicalDataColors = {
  // 主色 - 蓝色
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  
  // 状态颜色
  normal: '#22c55e',        // 绿色 - 正常
  abnormal: '#f59e0b',      // 橙色 - 异常
  critical: '#ef4444',       // 红色 - 危急
  pending: '#6366f1',        // 靛蓝 - 待复检
  
  // 类别颜色
  labCategory: {
    '血常规': '#3b82f6',
    '生化': '#06b6d4',
    '免疫': '#8b5cf6',
    '凝血': '#ec4899',
    '尿常规': '#14b8a6',
    '粪便常规': '#f97316',
    '感染标志物': '#ef4444',
    '肿瘤标志物': '#dc2626',
    '内分泌': '#7c3aed',
    '其他': '#64748b',
  },
  
  // 严重程度颜色
  severity: {
    '轻度': '#22c55e',
    '中度': '#f59e0b',
    '重度': '#ef4444',
    '危及生命': '#dc2626',
  },
  
  // 诊断状态颜色
  diagnosisStatus: {
    '活动性': '#3b82f6',
    '非活动性': '#64748b',
    '待确诊': '#f59e0b',
    '已排除': '#22c55e',
  },
  
  // 时间线事件类型颜色
  timelineType: {
    'lab': '#3b82f6',
    'diagnosis': '#8b5cf6',
    'medication': '#06b6d4',
    'allergy': '#ef4444',
    'procedure': '#f97316',
    'vital': '#22c55e',
  },
} as const;

export default {
  getPatientClinicalData,
  getClinicalTimeline,
  aggregateLabResults,
  getAllergies,
  getActiveDiagnoses,
  getMedicationHistory,
  getCriticalLabResults,
  getAllergySummary,
};