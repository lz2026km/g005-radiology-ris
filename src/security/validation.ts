/**
 * G005 放射RIS系统 v3.0.0 - 输入校验(Zod)
 * Phase T4-W10: 关键 API 输入校验
 *
 * ⚠️ 前端校验仅为 UX 优化,真实安全在后端
 * 医疗数据 Schema 严格遵循 HIPAA / 个保法
 */

import { z } from 'zod';

// ============= 通用 =============
export const IdSchema = z.string().min(1).max(64);
export const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date format');
export const DateTimeStringSchema = z.string().datetime();

// ============= 报告 =============
export const ReportStatusSchema = z.enum([
  '待分配', '已分配', '书写中', '已提交',
  '初审中', '初审通过', '终审中', '已审核',
  '签发中', '已签发', '已发布',
  '修订中', '已修订', '已撤回', '已驳回', '已归档',
]);

export const ModalitySchema = z.enum(['CT', 'MR', 'DR', 'CR', 'DSA', 'MG', 'RF', 'US', 'PET_CT', 'SPECT']);
export const PrioritySchema = z.enum(['ROUTINE', 'URGENT', 'EMERGENCY', 'STAT']);
export const GenderSchema = z.enum(['男', '女', '其他']);
export const SeveritySchema = z.enum(['critical', 'high', 'urgent']);

export const ReportInputSchema = z.object({
  examId: IdSchema,
  findings: z.string().min(10, '所见至少 10 字').max(10000),
  diagnosis: z.string().min(5, '诊断至少 5 字').max(5000),
  impression: z.string().max(5000).optional(),
  recommendations: z.string().max(2000).optional(),
});

export const ReportUpdateSchema = ReportInputSchema.partial();

// ============= 患者 =============
export const PatientInputSchema = z.object({
  name: z.string().min(1, '姓名必填').max(50),
  gender: GenderSchema,
  birthDate: DateStringSchema,
  idCard: z.string().regex(/^\d{17}[\dXx]$/, '身份证格式错误').optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式错误').optional(),
  email: z.string().email().optional(),
  address: z.string().max(200).optional(),
  allergies: z.string().max(500).optional(),
});

// ============= 检查 =============
export const ExamInputSchema = z.object({
  patientId: IdSchema,
  modality: ModalitySchema,
  examType: z.string().min(1).max(100),
  bodyPart: z.string().min(1).max(50),
  priority: PrioritySchema,
  scheduledAt: DateTimeStringSchema.optional(),
  clinicalDiagnosis: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
});

// ============= 危急值 =============
export const CriticalValueInputSchema = z.object({
  examId: IdSchema,
  finding: z.string().min(5, '描述至少 5 字').max(1000),
  category: z.string().regex(/^CV-RAD-\d{3}$/, '目录编码错误'),
  severity: SeveritySchema,
  notifyMethods: z.array(z.enum(['phone', 'sms', 'system', 'email', 'wechat'])).min(1),
  contactDept: z.string().min(1).max(50),
  contactDoctor: z.string().min(1).max(50),
});

// ============= 用户认证 =============
export const LoginInputSchema = z.object({
  username: z.string().min(3, '用户名至少 3 字符').max(50),
  password: z.string().min(6, '密码至少 6 字符').max(128),
  captcha: z.string().length(4).optional(),
  remember: z.boolean().default(false),
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(6).max(128),
  newPassword: z.string().min(8, '新密码至少 8 字符').max(128)
    .regex(/[A-Z]/, '需含大写字母')
    .regex(/[a-z]/, '需含小写字母')
    .regex(/\d/, '需含数字'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});

// ============= AI 输入 =============
export const AIRequestSchema = z.object({
  task: z.enum(['generate', 'summarize', 'translate', 'quality', 'rads', 'expand', 'vision', 'differential']),
  context: z.object({
    modality: ModalitySchema.optional(),
    bodyPart: z.string().max(50).optional(),
    clinicalHistory: z.string().max(2000).optional(),
    indication: z.string().max(500).optional(),
  }).optional(),
  text: z.string().max(50000).optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().min(1).max(8000).default(2000),
});

// ============= 搜索 =============
export const SearchSchema = z.object({
  q: z.string().min(1).max(200),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(200).default(20),
  filters: z.record(z.string(), z.unknown()).optional(),
});

// ============= 工具 =============

/** 校验并返回类型化结果 */
export function validateInput<T>(schema: z.ZodType<T>, input: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/** 抛出版本(用于 React 表单 onSubmit) */
export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  return schema.parse(input);
}

/** 校验并自动转错误消息 */
export function formatZodErrors(error: z.ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));
}

// ============= 导出全部 =============
export const schemas = {
  Id: IdSchema,
  DateString: DateStringSchema,
  DateTimeString: DateTimeStringSchema,
  ReportStatus: ReportStatusSchema,
  Modality: ModalitySchema,
  Priority: PrioritySchema,
  Gender: GenderSchema,
  Severity: SeveritySchema,
  ReportInput: ReportInputSchema,
  ReportUpdate: ReportUpdateSchema,
  PatientInput: PatientInputSchema,
  ExamInput: ExamInputSchema,
  CriticalValueInput: CriticalValueInputSchema,
  LoginInput: LoginInputSchema,
  ChangePassword: ChangePasswordSchema,
  AIRequest: AIRequestSchema,
  Search: SearchSchema,
};
