/**
 * G005 放射RIS系统 v3.0.5.1 - R3.SIGN 签章 Mock 数据
 * A5-REPORT 模块 / 100 点
 *
 * 数据原则：所有患者姓名/ID/签章哈希均虚构，禁止使用真实医院信息。
 */

import type {
  CertificateInfo,
  SignatureTimestamp,
  BlockchainProof,
  BiometricVerifyResult,
  SignLogEntry,
  SignRevokeRequest,
  UnlockRequest,
  VerifyResult,
  SignKPI,
  CertStatus,
} from '../types/R3/R3.SIGN';

// ============================================================
// 证书池 (5 张，覆盖 active / expired / revoked / 30 天过期)
// ============================================================

export const SIGN_CERTIFICATES: CertificateInfo[] = [
  {
    id: 'cert-001',
    serialNumber: '3A7F-9D2C-1145-E0B8',
    subject: {
      commonName: '张明远',
      userId: 'D001',
      role: 'doctor',
      title: '主任医师',
      licenseNumber: '110105197803150001',
      organization: 'G005 放射科',
      country: 'CN',
    },
    issuer: {
      commonName: 'G005 医院 CA 中心',
      organization: 'G005 信息科',
      userId: 'root-ca-001',
    },
    certType: 'RSA-SHA256',
    publicKeyFingerprint: 'SHA256:7e2b:fa3c:9d12:4801:e9a6:bb34:c7f2:1d50',
    notBefore: '2025-06-01T00:00:00Z',
    notAfter: '2027-06-01T00:00:00Z',
    status: 'active',
    notes: '主诊证书',
    usageCount: 248,
    createdAt: '2025-06-01T09:00:00Z',
    createdBy: 'admin-ca',
  },
  {
    id: 'cert-002',
    serialNumber: '8C1E-4B7A-93DF-2206',
    subject: {
      commonName: '李慧敏',
      userId: 'D002',
      role: 'doctor',
      title: '副主任医师',
      licenseNumber: '110105198207200002',
      organization: 'G005 放射科',
      country: 'CN',
    },
    issuer: {
      commonName: 'G005 医院 CA 中心',
      organization: 'G005 信息科',
      userId: 'root-ca-001',
    },
    certType: 'RSA-SHA256',
    publicKeyFingerprint: 'SHA256:1a3d:5e9b:c840:21fa:0e62:bb91:c723:4851',
    notBefore: '2025-08-15T00:00:00Z',
    notAfter: '2026-08-15T00:00:00Z',
    status: 'active',
    notes: '副诊证书',
    usageCount: 132,
    createdAt: '2025-08-15T10:30:00Z',
    createdBy: 'admin-ca',
  },
  {
    id: 'cert-003',
    serialNumber: '2F4D-8E1B-A039-7C58',
    subject: {
      commonName: '赵雪琴',
      userId: 'D006',
      role: 'doctor',
      title: '主任医师',
      licenseNumber: '110105197005120003',
      organization: 'G005 放射科',
      country: 'CN',
    },
    issuer: {
      commonName: 'G005 医院 CA 中心',
      organization: 'G005 信息科',
      userId: 'root-ca-001',
    },
    certType: 'SM3-SM2',
    publicKeyFingerprint: 'SM3:5c81:d3a7:9e42:01f6:7b9d:2148:cc05:6a39',
    notBefore: '2024-09-01T00:00:00Z',
    notAfter: '2025-09-01T00:00:00Z',
    status: 'expired',
    notes: '国密证书 已过期',
    usageCount: 67,
    createdAt: '2024-09-01T11:00:00Z',
    createdBy: 'admin-ca',
  },
  {
    id: 'cert-004',
    serialNumber: '6B5A-0FCE-7731-D49A',
    subject: {
      commonName: '王建华',
      userId: 'D003',
      role: 'doctor',
      title: '主治医师',
      licenseNumber: '110105198811090004',
      organization: 'G005 放射科',
      country: 'CN',
    },
    issuer: {
      commonName: 'G005 医院 CA 中心',
      organization: 'G005 信息科',
      userId: 'root-ca-001',
    },
    certType: 'RSA-SHA256',
    publicKeyFingerprint: 'SHA256:3f7a:e1c4:9b50:28d1:06a3:5e9f:c712:48b3',
    notBefore: '2025-04-10T00:00:00Z',
    notAfter: '2026-07-10T00:00:00Z',
    status: 'active',
    notes: '30 天内到期',
    usageCount: 89,
    createdAt: '2025-04-10T14:00:00Z',
    createdBy: 'admin-ca',
  },
  {
    id: 'cert-005',
    serialNumber: '9D2E-5B8F-A4C1-0336',
    subject: {
      commonName: '刘文博',
      userId: 'D005',
      role: 'doctor',
      title: '副主任医师',
      licenseNumber: '110105198502170005',
      organization: 'G005 放射科',
      country: 'CN',
    },
    issuer: {
      commonName: 'G005 医院 CA 中心',
      organization: 'G005 信息科',
      userId: 'root-ca-001',
    },
    certType: 'RSA-SHA256',
    publicKeyFingerprint: 'SHA256:8e21:0c5f:7d34:9a82:e1c6:4b50:f912:37a8',
    notBefore: '2025-11-20T00:00:00Z',
    notAfter: '2027-11-20T00:00:00Z',
    status: 'revoked',
    notes: '因医师离职已吊销',
    usageCount: 34,
    createdAt: '2025-11-20T08:30:00Z',
    createdBy: 'admin-ca',
  },
];

// ============================================================
// 时间戳池 (4 条，混合国家级/医院级)
// ============================================================

export const SIGN_TIMESTAMPS: SignatureTimestamp[] = [
  {
    id: 'ts-001',
    reportId: 'RP20260601001',
    timestamp: '2026-06-01T10:23:45Z',
    tsaName: '国家授时中心 TSA',
    tsaSerial: 'NTSA-2026-001',
    hashBefore: 'a3f5:0000:0000:0000:0000:0000:0000:0001',
    hashAfter: 'a3f5:0000:0000:0000:0000:0000:0000:0002',
    trustLevel: 'national',
    isValid: true,
    nonce: '7d8e-9f0a-1b2c',
  },
  {
    id: 'ts-002',
    reportId: 'RP20260602001',
    timestamp: '2026-06-02T14:08:12Z',
    tsaName: 'G005 医院 TSA',
    tsaSerial: 'GHTSA-2026-014',
    hashBefore: 'b4e6:0000:0000:0000:0000:0000:0000:0001',
    hashAfter: 'b4e6:0000:0000:0000:0000:0000:0000:0002',
    trustLevel: 'hospital',
    isValid: true,
    nonce: '2c3d-4e5f-6a7b',
  },
  {
    id: 'ts-003',
    reportId: 'RP20260603001',
    timestamp: '2026-06-03T09:15:33Z',
    tsaName: '国家授时中心 TSA',
    tsaSerial: 'NTSA-2026-002',
    hashBefore: 'c5d7:0000:0000:0000:0000:0000:0000:0001',
    hashAfter: 'c5d7:0000:0000:0000:0000:0000:0000:0002',
    trustLevel: 'national',
    isValid: true,
  },
  {
    id: 'ts-004',
    reportId: 'RP20260604001',
    timestamp: '2026-06-04T11:42:08Z',
    tsaName: 'G005 医院 TSA',
    tsaSerial: 'GHTSA-2026-015',
    hashBefore: 'd6e8:0000:0000:0000:0000:0000:0000:0001',
    hashAfter: 'd6e8:0000:0000:0000:0000:0000:0000:0002',
    trustLevel: 'hospital',
    isValid: true,
  },
];

// ============================================================
// 区块链存证 (4 条)
// ============================================================

export const BLOCKCHAIN_PROOFS: BlockchainProof[] = [
  {
    id: 'bc-001',
    reportId: 'RP20260601001',
    txHash: '0xa3f5b7c9d1e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4',
    blockNumber: 18429501,
    blockHash: '0x9c1e3f5a7b9d2c4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4',
    network: 'hospital-chain',
    anchoredAt: '2026-06-01T10:24:01Z',
    contentHash: 'a3f5:0000:0000:0000:0000:0000:0000:0002',
    signerId: 'D001',
    certificateSerial: '3A7F-9D2C-1145-E0B8',
    verifyUrl: 'https://verify.g005-hospital.local/tx/a3f5b7c9',
    confirmations: 12840,
    isImmutable: true,
  },
  {
    id: 'bc-002',
    reportId: 'RP20260602001',
    txHash: '0xb4f6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6',
    blockNumber: 18429812,
    blockHash: '0x8b2d4f6a8c0e2d4f6b8a0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4',
    network: 'national-health-chain',
    anchoredAt: '2026-06-02T14:08:55Z',
    contentHash: 'b4e6:0000:0000:0000:0000:0000:0000:0002',
    signerId: 'D002',
    certificateSerial: '8C1E-4B7A-93DF-2206',
    verifyUrl: 'https://verify.g005-hospital.local/tx/b4f6c8d0',
    confirmations: 9210,
    isImmutable: true,
  },
  {
    id: 'bc-003',
    reportId: 'RP20260603001',
    txHash: '0xc5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7',
    blockNumber: 18430124,
    blockHash: '0xa3c5e7f9b1d3a5c7e9f1b3d5a7c9e1f3b5d7a9c1e3f5b7d9a1c3e5f7b9d1a3c5e7',
    network: 'hospital-chain',
    anchoredAt: '2026-06-03T09:16:00Z',
    contentHash: 'c5d7:0000:0000:0000:0000:0000:0000:0002',
    signerId: 'D006',
    certificateSerial: '2F4D-8E1B-A039-7C58',
    verifyUrl: 'https://verify.g005-hospital.local/tx/c5d7e9f1',
    confirmations: 8420,
    isImmutable: true,
  },
  {
    id: 'bc-004',
    reportId: 'RP20260604001',
    txHash: '0xd6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8',
    blockNumber: 18430421,
    blockHash: '0xb4d6f8a0c2e4a6c8e0f2b4d6a8c0e2f4b6d8a0c2e4f6b8d0a2c4e6f8b0d2a4c6e8',
    network: 'ethereum-testnet',
    anchoredAt: '2026-06-04T11:42:45Z',
    contentHash: 'd6e8:0000:0000:0000:0000:0000:0000:0002',
    signerId: 'D001',
    certificateSerial: '3A7F-9D2C-1145-E0B8',
    verifyUrl: 'https://verify.g005-hospital.local/tx/d6e8f0a2',
    confirmations: 7512,
    isImmutable: true,
  },
];

// ============================================================
// 人脸识别 / 生物识别 (4 条)
// ============================================================

export const BIOMETRIC_VERIFICATIONS: BiometricVerifyResult[] = [
  {
    id: 'bio-001',
    userId: 'D001',
    method: 'face',
    success: true,
    confidence: 0.96,
    verifiedAt: '2026-06-01T10:23:30Z',
    deviceFingerprint: 'iPhone15-Pro-A2B4C6',
    livenessScore: 0.94,
  },
  {
    id: 'bio-002',
    userId: 'D002',
    method: 'face',
    success: true,
    confidence: 0.91,
    verifiedAt: '2026-06-02T14:08:00Z',
    deviceFingerprint: 'MacBook-Pro-M3-7F8E9D',
    livenessScore: 0.88,
  },
  {
    id: 'bio-003',
    userId: 'D006',
    method: 'fingerprint',
    success: true,
    confidence: 0.99,
    verifiedAt: '2026-06-03T09:15:20Z',
    deviceFingerprint: 'Windows-Desktop-X1Carbon',
    livenessScore: 1.0,
  },
  {
    id: 'bio-004',
    userId: 'D005',
    method: 'face',
    success: false,
    confidence: 0.42,
    verifiedAt: '2026-06-04T11:40:00Z',
    deviceFingerprint: 'Unknown-Device',
    errorMessage: '活体检测未通过',
  },
];

// ============================================================
// 签章日志 (8 条，覆盖 start/auth/sign/timestamp/publish/revoke/verify)
// ============================================================

export const SIGN_LOGS: SignLogEntry[] = [
  {
    id: 'slog-001',
    reportId: 'RP20260601001',
    signerId: 'D001',
    signerName: '张明远',
    signerTitle: '主任医师',
    certificateSerial: '3A7F-9D2C-1145-E0B8',
    algorithm: 'RSA-SHA256',
    signedAt: '2026-06-01T10:23:00Z',
    ipAddress: '10.20.30.41',
    device: 'iPhone15-Pro-A2B4C6',
    action: 'start',
    success: true,
  },
  {
    id: 'slog-002',
    reportId: 'RP20260601001',
    signerId: 'D001',
    signerName: '张明远',
    signerTitle: '主任医师',
    certificateSerial: '3A7F-9D2C-1145-E0B8',
    algorithm: 'RSA-SHA256',
    signedAt: '2026-06-01T10:23:30Z',
    ipAddress: '10.20.30.41',
    device: 'iPhone15-Pro-A2B4C6',
    action: 'auth',
    success: true,
  },
  {
    id: 'slog-003',
    reportId: 'RP20260601001',
    signerId: 'D001',
    signerName: '张明远',
    signerTitle: '主任医师',
    certificateSerial: '3A7F-9D2C-1145-E0B8',
    algorithm: 'RSA-SHA256',
    signedAt: '2026-06-01T10:23:45Z',
    ipAddress: '10.20.30.41',
    device: 'iPhone15-Pro-A2B4C6',
    action: 'sign',
    success: true,
    signatureValue: 'MEUCIQCx9a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4==',
    contentHash: 'a3f5:0000:0000:0000:0000:0000:0000:0002',
  },
  {
    id: 'slog-004',
    reportId: 'RP20260601001',
    signerId: 'D001',
    signerName: '张明远',
    signerTitle: '主任医师',
    certificateSerial: '3A7F-9D2C-1145-E0B8',
    algorithm: 'RSA-SHA256',
    signedAt: '2026-06-01T10:23:50Z',
    ipAddress: '10.20.30.41',
    device: 'iPhone15-Pro-A2B4C6',
    action: 'timestamp',
    success: true,
  },
  {
    id: 'slog-005',
    reportId: 'RP20260601001',
    signerId: 'D001',
    signerName: '张明远',
    signerTitle: '主任医师',
    certificateSerial: '3A7F-9D2C-1145-E0B8',
    algorithm: 'RSA-SHA256',
    signedAt: '2026-06-01T10:24:30Z',
    ipAddress: '10.20.30.41',
    device: 'iPhone15-Pro-A2B4C6',
    action: 'publish',
    success: true,
  },
  {
    id: 'slog-006',
    reportId: 'RP20260602003',
    signerId: 'D002',
    signerName: '李慧敏',
    signerTitle: '副主任医师',
    certificateSerial: '8C1E-4B7A-93DF-2206',
    algorithm: 'RSA-SHA256',
    signedAt: '2026-06-02T16:00:00Z',
    ipAddress: '10.20.30.42',
    device: 'MacBook-Pro-M3-7F8E9D',
    action: 'revoke',
    success: true,
    notes: '患者姓名更正',
  },
  {
    id: 'slog-007',
    reportId: 'RP20260603001',
    signerId: 'D003',
    signerName: '王建华',
    signerTitle: '主治医师',
    certificateSerial: '6B5A-0FCE-7731-D49A',
    algorithm: 'RSA-SHA256',
    signedAt: '2026-06-03T09:20:00Z',
    ipAddress: '10.20.30.43',
    device: 'Windows-Desktop-X1Carbon',
    action: 'sign',
    success: false,
    notes: '证书即将过期,已拒绝签章',
  },
  {
    id: 'slog-008',
    reportId: 'RP20260601001',
    signerId: 'D001',
    signerName: '张明远',
    signerTitle: '主任医师',
    certificateSerial: '3A7F-9D2C-1145-E0B8',
    algorithm: 'RSA-SHA256',
    signedAt: '2026-06-04T15:30:00Z',
    ipAddress: '203.0.113.42',
    device: 'Public-Verify-Portal',
    action: 'verify',
    success: true,
  },
];

// ============================================================
// 撤销申请 (2 条)
// ============================================================

export const SIGN_REVOKE_REQUESTS: SignRevokeRequest[] = [
  {
    id: 'rev-001',
    reportId: 'RP20260602003',
    signatureId: 'sig-20260602003',
    reason: '患者姓名拼写错误，需要重新签发',
    requesterId: 'D002',
    requesterName: '李慧敏',
    reviewerId: 'D006',
    reviewedAt: '2026-06-02T16:05:00Z',
    status: 'approved',
    createdAt: '2026-06-02T15:55:00Z',
  },
  {
    id: 'rev-002',
    reportId: 'RP20260603005',
    signatureId: 'sig-20260603005',
    reason: '危急值未及时标注',
    requesterId: 'D003',
    requesterName: '王建华',
    status: 'pending',
    createdAt: '2026-06-04T10:00:00Z',
  },
];

// ============================================================
// 解锁申请 (2 条)
// ============================================================

export const UNLOCK_REQUESTS: UnlockRequest[] = [
  {
    id: 'unlock-001',
    reportId: 'RP20260601008',
    reason: '临床补充病理回报，需修订报告',
    requesterId: 'D002',
    requesterName: '李慧敏',
    approverId: 'D001',
    approverName: '张明远',
    approvedAt: '2026-06-03T09:00:00Z',
    status: 'approved',
    createdAt: '2026-06-02T18:00:00Z',
  },
  {
    id: 'unlock-002',
    reportId: 'RP20260602011',
    reason: '原始 CT 影像发现新病灶',
    requesterId: 'D005',
    requesterName: '刘文博',
    status: 'pending',
    createdAt: '2026-06-04T11:00:00Z',
  },
];

// ============================================================
// 验证结果 (4 条)
// ============================================================

export const VERIFY_RESULTS: VerifyResult[] = [
  {
    reportId: 'RP20260601001',
    isValid: true,
    isExpired: false,
    isRevoked: false,
    signerName: '张明远',
    signerTitle: '主任医师',
    signedAt: '2026-06-01T10:23:45Z',
    algorithm: 'RSA-SHA256',
    certificateSerial: '3A7F-9D2C-1145-E0B8',
    contentHash: 'a3f5:0000:0000:0000:0000:0000:0000:0002',
    blockchainTxHash: '0xa3f5b7c9d1e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4',
    verifyCount: 3,
    verifiedAt: '2026-06-04T15:30:00Z',
  },
  {
    reportId: 'RP20260602001',
    isValid: true,
    isExpired: false,
    isRevoked: false,
    signerName: '李慧敏',
    signerTitle: '副主任医师',
    signedAt: '2026-06-02T14:08:12Z',
    algorithm: 'RSA-SHA256',
    certificateSerial: '8C1E-4B7A-93DF-2206',
    contentHash: 'b4e6:0000:0000:0000:0000:0000:0000:0002',
    blockchainTxHash: '0xb4f6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6',
    verifyCount: 1,
    verifiedAt: '2026-06-04T16:00:00Z',
  },
  {
    reportId: 'RP20260603001',
    isValid: false,
    isExpired: true,
    isRevoked: false,
    signerName: '赵雪琴',
    signerTitle: '主任医师',
    signedAt: '2025-09-01T11:00:00Z',
    algorithm: 'SM3-SM2',
    certificateSerial: '2F4D-8E1B-A039-7C58',
    verifyCount: 5,
    verifiedAt: '2026-06-04T16:30:00Z',
    failureReasons: ['证书已过期'],
  },
  {
    reportId: 'RP20260603003',
    isValid: false,
    isExpired: false,
    isRevoked: true,
    signerName: '刘文博',
    signerTitle: '副主任医师',
    signedAt: '2025-12-15T10:00:00Z',
    algorithm: 'RSA-SHA256',
    certificateSerial: '9D2E-5B8F-A4C1-0336',
    verifyCount: 2,
    verifiedAt: '2026-06-04T17:00:00Z',
    failureReasons: ['证书已吊销'],
  },
];

// ============================================================
// KPI (today/week/month)
// ============================================================

export const SIGN_KPI: SignKPI[] = [
  { period: 'today', totalSigned: 28, totalPublished: 24, totalRevoked: 1, avgSignDurationMs: 1850, failureRate: 0.035 },
  { period: 'week', totalSigned: 168, totalPublished: 142, totalRevoked: 4, avgSignDurationMs: 1980, failureRate: 0.024 },
  { period: 'month', totalSigned: 712, totalPublished: 638, totalRevoked: 18, avgSignDurationMs: 2050, failureRate: 0.025 },
];

// ============================================================
// CRL / OCSP 模拟
// ============================================================

export const CRL_ENTRIES = [
  {
    serialNumber: '9D2E-5B8F-A4C1-0336',
    revokedAt: '2026-01-15T10:00:00Z',
    reason: 'unspecified',
    issuerCommonName: 'G005 医院 CA 中心',
  },
  {
    serialNumber: '1A2B-3C4D-5E6F-7890',
    revokedAt: '2025-11-20T15:00:00Z',
    reason: 'key-compromise',
    issuerCommonName: 'G005 医院 CA 中心',
  },
];

export const OCSP_RESPONSE = {
  serialNumber: '3A7F-9D2C-1145-E0B8',
  status: 'good' as CertStatus,
  checkedAt: new Date().toISOString(),
  thisUpdate: new Date().toISOString(),
  nextUpdate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
};

export const CO_SIGN_TRIGGER_CONFIG = {
  criticalFinding: true,
  emergency: true,
  specialExam: true,
  directorSignRequired: true,
  checkIntervalMs: 5000,
};

export const CO_SIGNER_POOL = [
  { id: 'D001', name: '张明远', title: '主任医师', online: true },
  { id: 'D006', name: '赵雪琴', title: '主任医师', online: true },
  { id: 'D002', name: '李慧敏', title: '副主任医师', online: false },
];

export const SIGN_ALGORITHMS = [
  { id: 'RSA-SHA256', label: 'RSA-SHA256', description: '国际通用，2048 位 RSA + SHA-256' },
  { id: 'SM3-SM2', label: 'SM3-SM2', description: '国密合规，SM3 摘要 + SM2 签名' },
] as const;