// ============================================================
// G005 放射RIS系统 v3.0.6 - 安全/合规模块类型定义
// Security & Compliance Module - Type Definitions
// ============================================================

// ---------- 通用安全枚举 ----------
export type SecurityLevel = 'public' | 'internal' | 'confidential' | 'restricted';
export type ThreatSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type RiskScore = number; // 0-100

// ---------- HSM 硬件安全模块 ----------
export type HsmKeyAlgorithm = 'AES-256' | 'SM4' | 'RSA-2048' | 'SM2' | 'ECDSA-P256';
export type HsmKeyUsage = 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'wrap' | 'unwrap' | 'derive';

export interface HsmSlot {
  slotId: string;
  label: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  hardwareVersion: string;
  serial: string;
  isInserted: boolean;
  tokenPresent: boolean;
}

export interface HsmKeyHandle {
  handleId: string;
  label: string;
  algorithm: HsmKeyAlgorithm;
  usage: HsmKeyUsage[];
  extractable: boolean;
  sensitive: boolean;
  createdAt: string;
  expiresAt?: string;
  fingerprint: string;
}

export interface HsmOperationResult<T = Uint8Array> {
  success: boolean;
  data?: T;
  error?: string;
  auditTrail: string;
}

export interface HsmSession {
  sessionId: string;
  slotId: string;
  openedAt: string;
  lastUsed: string;
  authenticatedUser?: string;
}

// ---------- 审计日志 ----------
export type AuditSeverity = 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency';

export type AuditCategory =
  | 'auth'         // 认证/登录
  | 'authorization' // 授权/权限
  | 'data_access'  // 数据访问
  | 'data_change'  // 数据变更
  | 'system'       // 系统事件
  | 'security'     // 安全事件
  | 'compliance'   // 合规事件
  | 'phi'          // PHI/PII 访问
  | 'admin';       // 管理操作

export interface AuditLogEntry {
  id: string;
  seq: number;
  timestamp: string;
  category: AuditCategory;
  severity: AuditSeverity;
  actor: {
    userId: string;
    userName: string;
    role: string;
    department?: string;
  };
  action: string;
  target: {
    type: string;          // report/patient/exam/system
    id: string;
    name?: string;
  };
  outcome: 'success' | 'failure' | 'denied' | 'partial';
  source: {
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    geoLocation?: string;
  };
  detail?: Record<string, unknown>;
  riskScore: number;
  prevHash: string;
  hash: string;
  signature?: string;
  certSerial?: string;
}

export interface IntegrityCheckResult {
  valid: boolean;
  totalChecked: number;
  totalEntries: number;
  brokenAt?: number;
  reason?: string;
  merkleRoot: string;
  verifiedAt: string;
}

// ---------- DLP 数据防泄漏 ----------
export type DlpSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DlpMatch {
  type: 'PHI' | 'PII' | 'CREDENTIAL' | 'CREDIT_CARD' | 'ID_CARD' | 'PHONE' | 'EMAIL' | 'ADDRESS' | 'MEDICAL_RECORD' | 'CUSTOM';
  pattern: string;
  matchedText: string;
  position: { start: number; end: number };
  confidence: number; // 0-1
  severity: DlpSeverity;
  recommendation: string;
}

export interface DlpScanResult {
  scannedAt: string;
  contentLength: number;
  scanDurationMs: number;
  matches: DlpMatch[];
  riskScore: number;
  action: 'allow' | 'mask' | 'warn' | 'block';
  maskedContent?: string;
  blockReason?: string;
}

export interface DlpPolicy {
  id: string;
  name: string;
  enabled: boolean;
  patterns: string[];
  action: 'allow' | 'mask' | 'warn' | 'block';
  scope: ('email' | 'export' | 'print' | 'upload' | 'api')[];
}

// ---------- 零信任网络 ----------
export interface ZeroTrustContext {
  userId: string;
  userName: string;
  role: string;
  deviceId?: string;
  deviceTrust: 'trusted' | 'managed' | 'unknown' | 'compromised';
  ipAddress: string;
  geoLocation?: string;
  networkType: 'hospital-internal' | 'vpn' | 'public' | 'partner';
  timeOfAccess: Date;
  mfaCompleted: boolean;
  riskSignals: RiskSignal[];
}

export interface RiskSignal {
  type: 'impossible-travel' | 'unusual-time' | 'new-device' | 'brute-force' | 'data-exfiltration' | 'privilege-escalation';
  severity: ThreatSeverity;
  description: string;
  detectedAt: string;
}

export interface ZeroTrustDecision {
  allow: boolean;
  trustScore: number;
  requiredActions: ('mfa' | 'device-recheck' | 'password-reset' | 'manager-approval')[];
  reason: string;
  expiresAt: string;
  sessionPolicy: 'permissive' | 'standard' | 'restricted' | 'denied';
}

export interface TrustScore {
  userId: string;
  score: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: { name: string; weight: number; contribution: number }[];
  calculatedAt: string;
}

// ---------- IP 白名单 ----------
export interface IpWhitelistEntry {
  id: string;
  cidr: string;
  label: string;
  description?: string;
  enabled: boolean;
  scope: ('admin' | 'clinical' | 'reporting' | 'api' | 'all')[];
  addedBy: string;
  addedAt: string;
  expiresAt?: string;
}

export interface IpCheckResult {
  allowed: boolean;
  matchedEntry?: IpWhitelistEntry;
  ip: string;
  reason: string;
  checkedAt: string;
}

// ---------- MFA 多因素认证 ----------
export type MfaMethod = 'totp' | 'sms' | 'email' | 'push' | 'fido2' | 'backup-code';
export type MfaChallengeStatus = 'pending' | 'verified' | 'expired' | 'failed' | 'locked';

export interface MfaEnrollment {
  userId: string;
  methods: MfaMethod[];
  primaryMethod: MfaMethod;
  totpSecret?: string;
  phoneNumber?: string;
  email?: string;
  backupCodes: string[];
  enrolledAt: string;
  lastUsedAt?: string;
  enabled: boolean;
}

export interface MfaChallenge {
  challengeId: string;
  userId: string;
  method: MfaMethod;
  code: string;
  issuedAt: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  status: MfaChallengeStatus;
  ipAddress: string;
}

export interface MfaVerificationResult {
  success: boolean;
  method: MfaMethod;
  reason?: string;
  trustScore?: number;
  remainingAttempts?: number;
  nextStep?: MfaMethod;
}

// ---------- TOTP ----------
export interface TotpConfig {
  secret: string;
  digits: 6 | 8;
  period: number; // seconds
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512';
  issuer: string;
  accountName: string;
}

export interface TotpQrPayload {
  uri: string;
  secret: string;
  manualEntryKey: string;
}

// ---------- 会话管理 ----------
export type SessionStatus = 'active' | 'idle' | 'expired' | 'revoked' | 'concurrent';

export interface UserSession {
  sessionId: string;
  userId: string;
  userName: string;
  role: string;
  department: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  status: SessionStatus;
  mfaVerified: boolean;
  riskScore: number;
}

export interface SessionPolicy {
  maxConcurrentSessions: number;
  idleTimeoutSeconds: number;
  absoluteTimeoutSeconds: number;
  requireMfaForSensitive: boolean;
  bindToDevice: boolean;
}

// ---------- 密码策略 ----------
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigits: boolean;
  requireSpecialChars: boolean;
  specialChars: string;
  minUniqueChars: number;
  disallowUsername: boolean;
  disallowCommonPasswords: boolean;
  historySize: number;
  maxAge: number; // days
  minAge: number; // days
  lockoutThreshold: number;
  lockoutDurationSeconds: number;
}

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  entropy: number;
  strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
  suggestions: string[];
  passed: boolean;
  failedRules: string[];
}

// ---------- 密钥轮换 ----------
export interface KeyRotationPolicy {
  algorithm: HsmKeyAlgorithm;
  rotationIntervalDays: number;
  retentionPeriodDays: number;
  autoRotate: boolean;
  notifyBeforeDays: number;
}

export interface KeyVersion {
  keyId: string;
  version: number;
  algorithm: HsmKeyAlgorithm;
  createdAt: string;
  activatedAt?: string;
  retiredAt?: string;
  status: 'pending' | 'active' | 'retired' | 'compromised';
  fingerprint: string;
  useCount: number;
}

export interface KeyRotationEvent {
  id: string;
  keyId: string;
  fromVersion: number;
  toVersion: number;
  triggeredBy: 'schedule' | 'manual' | 'incident';
  triggeredAt: string;
  completedAt?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  reason: string;
}

// ---------- PHI 检测 / 去标识化 ----------
export type PhiCategory =
  | 'name' | 'address' | 'phone' | 'email' | 'id-card' | 'medical-record'
  | 'account' | 'certificate' | 'vehicle-plate' | 'biometric' | 'photo'
  | 'date-of-birth' | 'date-of-death' | 'age-over-89' | 'geo-location';

export interface PhiMatch {
  category: PhiCategory;
  value: string;
  originalValue: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  rule: string;
}

export interface DeIdResult {
  originalText: string;
  deIdentifiedText: string;
  matches: PhiMatch[];
  categories: PhiCategory[];
  method: 'safe-harbor' | 'expert-determination' | 'pseudonymization';
  retentionRatio: number; // 信息保留比例 0-1
  reversible: boolean;
  pseudonyms?: Record<string, string>;
  processedAt: string;
}

// ---------- 等保 2.0 ----------
export type MlpsLevel = 1 | 2 | 3 | 4 | 5;

export interface MlpsCheckItem {
  id: string;
  level: MlpsLevel;
  category: string;
  area: 'physical' | 'network' | 'host' | 'application' | 'data' | 'management';
  control: string;
  description: string;
  implementation: string;
  evidence: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
  score: number;
  remediation?: string;
}

export interface MlpsAuditResult {
  targetLevel: MlpsLevel;
  systemName: string;
  auditedAt: string;
  auditedBy: string;
  overallScore: number;
  areaSummaries: Record<string, { total: number; compliant: number; partial: number; nonCompliant: number; score: number }>;
  items: MlpsCheckItem[];
  gapAnalysis: { control: string; currentScore: number; targetScore: number; gap: number }[];
  recommendation: string;
}

// ---------- HIPAA ----------
export type HipaaRule = 'privacy' | 'security' | 'breach-notification' | 'enforcement' | 'omnibus';

export interface HipaaSafeguard {
  id: string;
  rule: HipaaRule;
  category: 'administrative' | 'physical' | 'technical';
  name: string;
  description: string;
  required: boolean;
  implemented: boolean;
  status: 'met' | 'partially-met' | 'not-met';
  evidence: string;
  citations: string[];
  score: number;
}

export interface HipaaAssessment {
  assessedAt: string;
  assessedBy: string;
  overallScore: number;
  privacyScore: number;
  securityScore: number;
  safeguards: HipaaSafeguard[];
  gapItems: string[];
  recommendations: string[];
}

// ---------- GDPR ----------
export type GdprRight =
  | 'access' | 'rectification' | 'erasure' | 'restrict-processing'
  | 'data-portability' | 'object' | 'automated-decision' | 'be-informed';

export type GdprLawfulBasis =
  | 'consent' | 'contract' | 'legal-obligation' | 'vital-interests'
  | 'public-task' | 'legitimate-interests';

export interface GdprSubjectRequest {
  id: string;
  subjectId: string;
  subjectName: string;
  right: GdprRight;
  requestedAt: string;
  completedAt?: string;
  dueBy: string;
  status: 'received' | 'in-progress' | 'completed' | 'rejected' | 'escalated';
  assignedTo?: string;
  lawfulBasis?: GdprLawfulBasis;
  notes?: string;
  dataCategories?: string[];
  erasureScope?: ('patient-data' | 'images' | 'reports' | 'audit-logs' | 'all');
}

export interface GdprProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  lawfulBasis: GdprLawfulBasis;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retentionDays: number;
  crossBorderTransfer: boolean;
  transferMechanism?: string;
  dpo?: string;
}

// ---------- ISO 27001 ----------
export type IsoControlCategory =
  | 'A.5-organizational' | 'A.6-people' | 'A.7-physical'
  | 'A.8-technological' | 'A.9-communication';

export interface IsoControl {
  id: string;
  category: IsoControlCategory;
  control: string;
  objective: string;
  description: string;
  applicable: boolean;
  implemented: boolean;
  maturityLevel: 0 | 1 | 2 | 3 | 4 | 5;
  evidence: string;
  gaps: string[];
}

export interface IsoStatementApplicability {
  version: string;
  generatedAt: string;
  organization: string;
  scope: string;
  controls: IsoControl[];
  overallMaturity: number;
  risksAccepted: number;
  risksTreated: number;
}