/**
 * G005 RIS v3.0.6.6 - 患者门户域类型定义
 * 覆盖患者端访问、加密分享链接、通知、知情同意、安全邮件等能力
 */

// ============================================================
// 1. 患者端报告访问
// ============================================================
export type PatientPortalAccessStatus =
  | 'pending'        // 待激活
  | 'active'         // 已激活可用
  | 'expired'        // 已过期
  | 'revoked'        // 已撤销
  | 'consumed';      // 已用完配额

export type PatientIdentityMethod =
  | 'phone-otp'      // 手机号 OTP
  | 'id-card'        // 身份证号
  | 'face-recog'     // 人脸识别
  | 'wechat-oauth'   // 微信 OAuth
  | 'alipay-oauth'   // 支付宝 OAuth
  | 'health-card';   // 电子健康卡

export interface PatientPortalAccess {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientIdCard?: string;
  reportIds: string[];
  status: PatientPortalAccessStatus;
  identityMethod: PatientIdentityMethod;
  identityVerified: boolean;
  identityVerifiedAt?: string;
  accessToken: string;             // 患者访问令牌
  deviceBinding: boolean;          // 是否绑定设备
  maxDevices: number;              // 最多绑定的设备数
  boundDevices: number;            // 已绑定设备数
  requireConsent: boolean;         // 是否需要签署知情同意
  consentId?: string;              // 已签署同意书 ID
  watermark: string;               // 患者姓名水印
  expireDays: number;
  activatedAt?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
  revokedAt?: string;
  revokeReason?: string;
}

// ============================================================
// 2. 加密分享链接
// ============================================================
export type ShareLinkStatus = 'active' | 'expired' | 'revoked' | 'exhausted' | 'pending';

export type ShareLinkScope = 'single-report' | 'multi-report' | 'study-set' | 'entire-folder';

export type ShareLinkEncryption = 'AES-256-GCM' | 'ChaCha20-Poly1305' | 'SM4-GCM';

export interface ShareLink {
  id: string;
  shortCode: string;                // 8 位短码
  shortUrl: string;                 // 完整短链
  qrPayload: string;                // 二维码内容(已加密)
  encryption: ShareLinkEncryption;
  encryptionKeyId: string;          // KMS 密钥标识
  scope: ShareLinkScope;
  resourceIds: string[];            // 报告 / 研究 / 文件夹
  resourceSummary: string;          // 摘要(医生可见)
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  status: ShareLinkStatus;
  createdAt: string;
  expiresAt: string;                // 失效时间(短)
  maxOpens: number;                 // 最大打开次数
  maxDownloads: number;             // 最大下载次数
  currentOpens: number;
  currentDownloads: number;
  requirePhone: boolean;            // 是否需要手机号验证
  requireIdCard: boolean;           // 是否需要身份证
  requireFace: boolean;             // 是否需要人脸
  passwordProtected: boolean;
  passwordHint?: string;
  watermark: string;
  ipWhitelist?: string[];           // IP 白名单
  deviceLock: boolean;              // 设备锁定
  notifyOnOpen: boolean;            // 打开时通知医生
  notifyOnDownload: boolean;        // 下载时通知医生
  auditLog: ShareLinkAuditEvent[];
  lastOpenedAt?: string;
  lastOpenedIp?: string;
}

export interface ShareLinkAuditEvent {
  id: string;
  linkId: string;
  occurredAt: string;
  action: 'created' | 'opened' | 'viewed' | 'downloaded' | 'shared' | 'expired' | 'revoked' | 'rejected';
  ip: string;
  userAgent?: string;
  deviceFingerprint?: string;
  geoLocation?: { country?: string; province?: string; city?: string };
  result: 'success' | 'denied' | 'error';
  reason?: string;
}

// ============================================================
// 3. 多通道患者通知
// ============================================================
export type PatientNotificationChannel =
  | 'wechat-mp'        // 微信公众号
  | 'wechat-mini'      // 微信小程序
  | 'sms'              // 短信
  | 'app-push'         // App 推送
  | 'email'            // 邮件
  | 'voice'            // 语音电话
  | 'in-app'           // 应用内
  | 'postal';          // 邮政信件

export type PatientNotificationTrigger =
  | 'report-ready'           // 报告已出
  | 'report-amended'         // 报告修订
  | 'critical-value'         // 危急值
  | 'share-link-created'     // 分享链接已生成
  | 'consent-required'       // 需要签署知情同意
  | 'followup-reminder'      // 复查提醒
  | 'appointment-reminder'   // 预约提醒
  | 'expiring-soon';         // 即将过期

export type PatientNotificationStatus =
  | 'pending' | 'sending' | 'delivered' | 'read' | 'clicked' | 'failed' | 'expired';

export interface PatientNotification {
  id: string;
  patientId: string;
  patientName: string;
  patientContact: string;     // 手机/邮箱/openId
  channel: PatientNotificationChannel;
  trigger: PatientNotificationTrigger;
  templateId: string;
  templateName: string;
  title: string;
  body: string;
  payload?: Record<string, string | number | boolean>;
  linkUrl?: string;
  status: PatientNotificationStatus;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  clickedAt?: string;
  retryCount: number;
  maxRetries: number;
  errorCode?: string;
  errorMessage?: string;
  cost: number;
  durationMs: number;
  traceId: string;
}

// ============================================================
// 4. 知情同意
// ============================================================
export type PatientConsentType =
  | 'report-access'       // 报告查阅授权
  | 'image-share'         // 影像分享授权
  | 'research-use'        // 科研使用授权
  | 'telemedicine'        // 远程会诊授权
  | 'data-export'         // 数据导出授权
  | 'marketing';          // 健康宣教授权

export type PatientConsentStatus =
  | 'draft' | 'pending' | 'signed' | 'rejected' | 'expired' | 'revoked';

export type PatientConsentMethod = 'electronic-signature' | 'handwritten' | 'ca-cert' | 'biometric';

export interface PatientConsent {
  id: string;
  patientId: string;
  patientName: string;
  patientIdCard?: string;
  type: PatientConsentType;
  templateId: string;
  templateName: string;
  templateVersion: string;
  contentSummary: string;        // 摘要(列表展示)
  fullContent: string;          // 完整条款
  status: PatientConsentStatus;
  signedAt?: string;
  signedMethod?: PatientConsentMethod;
  signatureData?: string;       // base64 或哈希
  signatureCertId?: string;     // CA 证书 ID
  witnessName?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  expiresAt?: string;           // 同意有效期
  validFrom?: string;
  validTo?: string;
  revokedAt?: string;
  revokeReason?: string;
  pdfSnapshotUrl?: string;      // PDF 快照
  pdfHash?: string;             // SHA-256
  relatedResourceIds: string[]; // 关联的报告 / 影像
  createdAt: string;
  createdBy: string;
}

// ============================================================
// 5. 安全邮件
// ============================================================
export type SecureMailStatus = 'draft' | 'queued' | 'sending' | 'delivered' | 'read' | 'failed' | 'expired' | 'revoked';

export type SecureMailEncryption = 'TLS-1.3' | 'S/MIME' | 'PGP' | 'SMIME-SM2';

export interface SecureMail {
  id: string;
  mailId: string;              // 业务流水号
  threadId?: string;           // 会话 ID
  fromUserId: string;
  fromName: string;
  fromEmail: string;
  toRecipients: { name: string; email: string; type: 'to' | 'cc' | 'bcc' }[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  attachments: { name: string; size: number; mimeType: string; encrypted: boolean; url?: string }[];
  encryption: SecureMailEncryption;
  status: SecureMailStatus;
  digitalSignature?: string;   // 数字签名
  priority: 'low' | 'normal' | 'high';
  isReadReceipt: boolean;      // 要求回执
  readReceiptDeadline?: string;
  expiresAt?: string;          // 失效时间
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  recalledAt?: string;
  failureReason?: string;
  spamScore: number;           // 0-100
  dlpViolations: string[];     // 数据防泄漏命中规则
  traceId: string;
  relatedReportId?: string;
  relatedPatientId?: string;
}

// ============================================================
// 6. 患者端报告(与 patient 报告 viewer 共享)
// ============================================================
export interface PatientReportItem {
  id: string;
  reportId: string;
  examId: string;
  modality: string;
  bodyPart: string;
  examDate: string;
  reportDate: string;
  status: 'pending' | 'final' | 'amended' | 'critical';
  diagnosisSummary: string;
  findingsSummary: string;
  recommendations: string[];
  hasImages: boolean;
  imageCount: number;
  signedBy?: string;
  signedAt?: string;
  reviewedBy?: string;
  blockchainTxId?: string;
}

// ============================================================
// 7. 门户 KPI 摘要
// ============================================================
export interface PortalKpiSnapshot {
  activeAccess: number;
  activeShareLinks: number;
  notificationsSentToday: number;
  notificationsReadRate: number;
  consentsSignedToday: number;
  secureMailSentToday: number;
  avgOpenLatencySec: number;
  totalPatients: number;
}