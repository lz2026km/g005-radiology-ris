/**
 * G005 放射RIS系统 v3.0.5.1 - R3.SIGN 签章 类型定义
 * A5-REPORT 模块 / 100 点
 *
 * 覆盖:
 *  - 证书管理 (R3.SIGN.001 ~ .025)
 *  - 签章流程 (R3.SIGN.026 ~ .060)
 *  - 发布 + 锁定 (R3.SIGN.061 ~ .080)
 *  - 二维码 + 防伪 + 法规 (R3.SIGN.081 ~ .100)
 */

export type CertType = 'RSA-SHA256' | 'SM3-SM2';

export type CertStatus = 'active' | 'expired' | 'revoked' | 'suspended';

export type SignatureAlgorithm = 'RSA-SHA256' | 'SM3-SM2';

export type SignImageStyle =
  | 'classic-red'
  | 'modern-blue'
  | 'hospital-green'
  | 'minimal-black'
  | 'gradient-purple'
  | 'corporate-red';

export type SignPosition = 'top-right' | 'bottom-right' | 'bottom-center';

export type LockStrength = 'soft' | 'hard';

export interface CertificateInfo {
  id: string;
  serialNumber: string;
  subject: {
    commonName: string;
    userId: string;
    role: string;
    title?: string;
    licenseNumber?: string;
    organization?: string;
    country?: string;
  };
  issuer: {
    commonName: string;
    organization?: string;
    userId: string;
  };
  certType: CertType;
  publicKeyFingerprint: string;
  notBefore: string;
  notAfter: string;
  status: CertStatus;
  notes?: string;
  usageCount: number;
  createdAt: string;
  createdBy: string;
}

export interface SignatureTimestamp {
  id: string;
  reportId: string;
  timestamp: string;
  tsaName: string;
  tsaSerial: string;
  hashBefore: string;
  hashAfter: string;
  trustLevel: 'national' | 'hospital' | 'self-signed';
  isValid: boolean;
  nonce?: string;
}

export interface BlockchainProof {
  id: string;
  reportId: string;
  txHash: string;
  blockNumber: number;
  blockHash: string;
  network: 'hospital-chain' | 'national-health-chain' | 'ethereum-testnet';
  anchoredAt: string;
  contentHash: string;
  signerId: string;
  certificateSerial: string;
  verifyUrl: string;
  confirmations: number;
  isImmutable: boolean;
}

export interface BiometricVerifyResult {
  id: string;
  userId: string;
  method: 'face' | 'fingerprint' | 'voice';
  success: boolean;
  confidence: number;
  verifiedAt: string;
  deviceFingerprint?: string;
  livenessScore?: number;
  errorMessage?: string;
}

export interface SignProgress {
  stage:
    | 'idle'
    | 'select-cert'
    | 'auth-verify'
    | 'biometric'
    | 'compute-hash'
    | 'rsa-sign'
    | 'timestamp'
    | 'blockchain-anchor'
    | 'persist'
    | 'complete'
    | 'failed';
  percent: number;
  message: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface SignLogEntry {
  id: string;
  reportId: string;
  signerId: string;
  signerName: string;
  signerTitle: string;
  certificateSerial: string;
  algorithm: SignatureAlgorithm;
  signedAt: string;
  ipAddress: string;
  device: string;
  action: 'start' | 'auth' | 'sign' | 'timestamp' | 'publish' | 'revoke' | 'verify';
  success: boolean;
  signatureValue?: string;
  contentHash?: string;
  notes?: string;
}

export interface SignImageTemplate {
  id: SignImageStyle;
  name: string;
  preview: string;
  color: string;
}

export const SIGN_IMAGE_TEMPLATES: SignImageTemplate[] = [
  { id: 'classic-red', name: '经典红', preview: '印', color: '#dc2626' },
  { id: 'modern-blue', name: '现代蓝', preview: '签', color: '#2563eb' },
  { id: 'hospital-green', name: '医院绿', preview: '诊', color: '#059669' },
  { id: 'minimal-black', name: '极简黑', preview: '字', color: '#111827' },
  { id: 'gradient-purple', name: '渐变紫', preview: '核', color: '#7c3aed' },
  { id: 'corporate-red', name: '企业红', preview: '审', color: '#b91c1c' },
];

export interface QualityGate {
  required: boolean;
  minimumScore: number;
  reason?: string;
}

export const QUALITY_GATE: QualityGate = {
  required: true,
  minimumScore: 60,
  reason: '签发前必须通过质量门禁（qualityScore ≥ 60）',
};

export interface SignRevokeRequest {
  id: string;
  reportId: string;
  signatureId: string;
  reason: string;
  requesterId: string;
  requesterName: string;
  reviewerId?: string;
  reviewedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface PublishConfirmRequest {
  reportId: string;
  qualityScore: number;
  secondConfirm: boolean;
  notifyPatient: boolean;
  notifyDoctor: boolean;
  notifyClinic: boolean;
}

export interface VerifyResult {
  reportId: string;
  isValid: boolean;
  isExpired: boolean;
  isRevoked: boolean;
  signerName?: string;
  signerTitle?: string;
  signedAt?: string;
  algorithm?: SignatureAlgorithm;
  certificateSerial?: string;
  contentHash?: string;
  blockchainTxHash?: string;
  verifyCount: number;
  verifiedAt: string;
  failureReasons?: string[];
}

export interface UnlockRequest {
  id: string;
  reportId: string;
  reason: string;
  requesterId: string;
  requesterName: string;
  approverId?: string;
  approverName?: string;
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface SignKPI {
  period: 'today' | 'week' | 'month';
  totalSigned: number;
  totalPublished: number;
  totalRevoked: number;
  avgSignDurationMs: number;
  failureRate: number;
}