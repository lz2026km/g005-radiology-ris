/**
 * G005 放射RIS系统 v3.0.0 - 安全模块索引
 * Phase T4-W10: CSP + 输入校验 + 数据脱敏
 */

export {
  CSP_HEADER,
  injectCSP,
  injectSecurityMetaTags,
  SECURITY_META_TAGS,
} from './csp';

export {
  schemas,
  validateInput,
  parseInput,
  formatZodErrors,
  IdSchema,
  DateStringSchema,
  DateTimeStringSchema,
  ReportStatusSchema,
  ModalitySchema,
  PrioritySchema,
  GenderSchema,
  SeveritySchema,
  ReportInputSchema,
  ReportUpdateSchema,
  PatientInputSchema,
  ExamInputSchema,
  CriticalValueInputSchema,
  LoginInputSchema,
  ChangePasswordSchema,
  AIRequestSchema,
  SearchSchema,
} from './validation';

export {
  maskName,
  maskIdCard,
  maskPhone,
  maskEmail,
  maskDiagnosis,
  maskPatient,
  sanitizeHTML,
  isSafeURL,
  hasSQLInjection,
  hasXSSAttempt,
  type Patient,
} from './sanitization';
