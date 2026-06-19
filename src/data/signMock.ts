/**
 * G005 放射RIS系统 v3.0.5.1 - 签章/审批/合规 Mock 数据
 * 15 pts
 *
 * 数据原则: 患者姓名/医师姓名/证书哈希全部虚构, 禁止使用真实医院信息。
 */

import type {
  CertLifecycleEvent,
  CertLifecycleStatus,
  BiometricModality,
  BiometricSample,
  CrlEntry,
  CrlSnapshot,
  OcspResponse,
  HsmSlot,
  HsmToken,
  HsmKeyHandle,
  HsmConfig,
  MultiLevelApprovalState,
  ApprovalChainTemplate,
  EmergencyOverrideRecord,
  ApprovalParticipant,
  TimeStampToken,
  AnchorReceipt,
} from '../types/sign';

// ============================================================
// 证书全生命周期事件
// ============================================================

export const CERT_LIFECYCLE_EVENTS: CertLifecycleEvent[] = [
  {
    id: 'evt-cert-001-issue',
    certId: 'cert-001',
    type: 'issue',
    occurredAt: '2025-06-01T09:00:00Z',
    actorId: 'admin-ca',
    actorName: 'CA 管理员',
    reason: '新员工入职',
    metadata: { source: 'inperson', hsmSlot: 1 },
  },
  {
    id: 'evt-cert-001-renew',
    certId: 'cert-001',
    type: 'renew',
    occurredAt: '2026-06-01T08:55:00Z',
    actorId: 'admin-ca',
    actorName: 'CA 管理员',
    reason: '有效期续期 1 年',
  },
  {
    id: 'evt-cert-005-revoke',
    certId: 'cert-005',
    type: 'revoke',
    occurredAt: '2026-01-15T10:00:00Z',
    actorId: 'admin-ca',
    actorName: 'CA 管理员',
    reason: '医师离职',
    metadata: { hrCaseId: 'HR-2025-1108' },
  },
  {
    id: 'evt-cert-006-suspend',
    certId: 'cert-006',
    type: 'suspend',
    occurredAt: '2026-06-10T14:00:00Z',
    actorId: 'security-officer-01',
    actorName: '信息安全员',
    reason: '设备丢失临时冻结',
  },
];

export const CERT_STATUS_INDEX: Array<{
  certId: string;
  serialNumber: string;
  status: CertLifecycleStatus;
  notBefore: string;
  notAfter: string;
  isInCrL: boolean;
  ocspStatus: 'good' | 'revoked' | 'unknown' | 'suspended';
}> = [
  { certId: 'cert-001', serialNumber: '3A7F-9D2C-1145-E0B8', status: 'active', notBefore: '2025-06-01T00:00:00Z', notAfter: '2027-06-01T00:00:00Z', isInCrL: false, ocspStatus: 'good' },
  { certId: 'cert-002', serialNumber: '8C1E-4B7A-93DF-2206', status: 'active', notBefore: '2025-08-15T00:00:00Z', notAfter: '2026-08-15T00:00:00Z', isInCrL: false, ocspStatus: 'good' },
  { certId: 'cert-003', serialNumber: '2F4D-8E1B-A039-7C58', status: 'expired', notBefore: '2024-09-01T00:00:00Z', notAfter: '2025-09-01T00:00:00Z', isInCrL: false, ocspStatus: 'unknown' },
  { certId: 'cert-004', serialNumber: '6B5A-0FCE-7731-D49A', status: 'active', notBefore: '2025-04-10T00:00:00Z', notAfter: '2026-07-10T00:00:00Z', isInCrL: false, ocspStatus: 'good' },
  { certId: 'cert-005', serialNumber: '9D2E-5B8F-A4C1-0336', status: 'revoked', notBefore: '2025-11-20T00:00:00Z', notAfter: '2027-11-20T00:00:00Z', isInCrL: true, ocspStatus: 'revoked' },
  { certId: 'cert-006', serialNumber: '7C8D-9E0F-1234-5678', status: 'suspended', notBefore: '2026-01-01T00:00:00Z', notAfter: '2027-01-01T00:00:00Z', isInCrL: false, ocspStatus: 'suspended' },
];

// ============================================================
// 生物识别样本 (多模态)
// ============================================================

export const BIOMETRIC_SAMPLES: BiometricSample[] = [
  {
    sampleId: 'bs-001',
    userId: 'D001',
    modality: 'face',
    capturedAt: '2025-06-01T08:30:00Z',
    qualityScore: 0.96,
    payloadSize: 48_512,
    deviceId: 'iPhone15-Pro-A2B4C6',
  },
  {
    sampleId: 'bs-002',
    userId: 'D001',
    modality: 'fingerprint',
    capturedAt: '2025-06-01T08:32:00Z',
    qualityScore: 0.94,
    payloadSize: 8_240,
    deviceId: 'iPhone15-Pro-A2B4C6',
  },
  {
    sampleId: 'bs-003',
    userId: 'D001',
    modality: 'voice',
    capturedAt: '2025-06-01T08:34:00Z',
    qualityScore: 0.88,
    payloadSize: 32_768,
    deviceId: 'iPhone15-Pro-A2B4C6',
  },
  {
    sampleId: 'bs-004',
    userId: 'D002',
    modality: 'face',
    capturedAt: '2025-08-15T09:00:00Z',
    qualityScore: 0.92,
    payloadSize: 46_104,
    deviceId: 'MacBook-Pro-M3-7F8E9D',
  },
  {
    sampleId: 'bs-005',
    userId: 'D002',
    modality: 'voice',
    capturedAt: '2025-08-15T09:02:00Z',
    qualityScore: 0.85,
    payloadSize: 28_672,
    deviceId: 'MacBook-Pro-M3-7F8E9D',
  },
  {
    sampleId: 'bs-006',
    userId: 'D006',
    modality: 'fingerprint',
    capturedAt: '2024-09-01T10:30:00Z',
    qualityScore: 0.99,
    payloadSize: 9_120,
    deviceId: 'Windows-Desktop-X1Carbon',
  },
];

export const BIOMETRIC_MODALITY_THRESHOLDS: Record<BiometricModality, number> = {
  face: 0.85,
  fingerprint: 0.90,
  voice: 0.80,
  iris: 0.92,
};

// ============================================================
// CRL / OCSP
// ============================================================

export const CRL_FULL: CrlSnapshot = {
  issuerCommonName: 'G005 医院 CA 中心',
  thisUpdate: '2026-06-15T00:00:00Z',
  nextUpdate: '2026-06-22T00:00:00Z',
  crlNumber: '20260615001',
  signatureAlgorithm: 'SHA256withRSA',
  isDelta: false,
  entries: [
    { serialNumber: '9D2E-5B8F-A4C1-0336', revocationDate: '2026-01-15T10:00:00Z', reason: 'cessation-of-operation', issuerCommonName: 'G005 医院 CA 中心' },
    { serialNumber: '1A2B-3C4D-5E6F-7890', revocationDate: '2025-11-20T15:00:00Z', reason: 'key-compromise', invalidityDate: '2025-11-18T00:00:00Z', issuerCommonName: 'G005 医院 CA 中心' },
    { serialNumber: 'FE01-DC02-BA03-9804', revocationDate: '2025-09-08T11:30:00Z', reason: 'superseded', issuerCommonName: 'G005 医院 CA 中心' },
  ],
};

export const CRL_DELTA: CrlSnapshot = {
  issuerCommonName: 'G005 医院 CA 中心',
  thisUpdate: '2026-06-18T00:00:00Z',
  nextUpdate: '2026-06-22T00:00:00Z',
  crlNumber: '20260618001-delta',
  signatureAlgorithm: 'SHA256withRSA',
  isDelta: true,
  entries: [
    { serialNumber: '7C8D-9E0F-1234-5678', revocationDate: '2026-06-17T16:00:00Z', reason: 'certificate-hold', issuerCommonName: 'G005 医院 CA 中心' },
  ],
};

export const OCSP_RESPONSES: OcspResponse[] = [
  {
    serialNumber: '3A7F-9D2C-1145-E0B8',
    status: 'good',
    thisUpdate: '2026-06-19T00:00:00Z',
    nextUpdate: '2026-06-20T00:00:00Z',
    responderId: 'ocsp.g005-hospital.local',
    producedAt: '2026-06-19T00:00:00Z',
    signatureAlgorithm: 'SHA256withRSA',
  },
  {
    serialNumber: '9D2E-5B8F-A4C1-0336',
    status: 'revoked',
    thisUpdate: '2026-06-19T00:00:00Z',
    nextUpdate: '2026-06-20T00:00:00Z',
    responderId: 'ocsp.g005-hospital.local',
    producedAt: '2026-06-19T00:00:00Z',
    signatureAlgorithm: 'SHA256withRSA',
    revocationReason: 'cessation-of-operation',
    revokedAt: '2026-01-15T10:00:00Z',
  },
];

// ============================================================
// RFC 3161 时间戳 Token 样例
// ============================================================

export const TIMESTAMP_TOKENS: TimeStampToken[] = [
  {
    id: 'tst-001',
    reportId: 'RP20260601001',
    hashAlgo: 'sha256',
    messageImprint: 'a3f5d8e2c1b94f6701dde9aabbccddeeff00112233445566778899aabbccddee',
    serialNumber: 'NTSA-2026-001',
    genTime: '2026-06-01T10:23:50Z',
    policyOid: '1.2.3.4.5.6.7.8.1',
    tsaName: '国家授时中心 TSA',
    tsaCommonName: 'CN Time Stamp Authority',
    tsaCountry: 'CN',
    accuracySeconds: 1,
    ordering: false,
    nonce: '7d8e9f0a1b2c',
    signatureAlgorithm: 'SHA256withRSA',
    signatureValue: 'MEUCIQDx...sig...',
    rawDerBase64: 'MIIR9AYJKoZIhvcNAQ...',
    trustLevel: 'national',
  },
  {
    id: 'tst-002',
    reportId: 'RP20260602001',
    hashAlgo: 'sha256',
    messageImprint: 'b4e6f8d2c1b94f6701dde9aabbccddeeff00112233445566778899aabbccddee',
    serialNumber: 'GHTSA-2026-014',
    genTime: '2026-06-02T14:08:30Z',
    policyOid: '1.2.3.4.5.6.7.8.2',
    tsaName: 'G005 医院 TSA',
    tsaCommonName: 'G005 Hospital TSA',
    tsaCountry: 'CN',
    accuracySeconds: 1,
    ordering: false,
    nonce: '2c3d4e5f6a7b',
    signatureAlgorithm: 'SHA256withRSA',
    signatureValue: 'MEQCIBx...sig...',
    rawDerBase64: 'MIIR9AYJKoZIhvcNAQ...',
    trustLevel: 'hospital',
  },
];

// ============================================================
// 区块链锚定 (多链)
// ============================================================

export const ANCHOR_RECEIPTS: AnchorReceipt[] = [
  {
    id: 'arc-001',
    reportId: 'RP20260601001',
    contentHash: 'a3f5d8e2c1b94f6701dde9aabbccddeeff00112233445566778899aabbccddee',
    signerId: 'D001',
    certificateSerial: '3A7F-9D2C-1145-E0B8',
    network: 'hospital-chain',
    txHash: '0xa3f5b7c9d1e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4',
    blockNumber: 18429501,
    blockHash: '0x9c1e3f5a7b9d2c4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4',
    anchoredAt: '2026-06-01T10:24:01Z',
    confirmations: 12840,
    confirmationsRequired: 1,
    isFinal: true,
    verifyUrl: 'https://chain.g005-hospital.local/tx/a3f5b7c9',
    rawPayloadBase64: 'eyJyZXBvcnRJZCI6IlJQMjAyNjA2MDEwMDEiLCJzaWduZXIiOiJEUDAwMSJ9',
    payloadHash: 'sha256:a3f5d8e2c1b94f6701dde9aabbccddeeff00112233445566778899aabbccddee',
  },
  {
    id: 'arc-002',
    reportId: 'RP20260602001',
    contentHash: 'b4e6f8d2c1b94f6701dde9aabbccddeeff00112233445566778899aabbccddee',
    signerId: 'D002',
    certificateSerial: '8C1E-4B7A-93DF-2206',
    network: 'ethereum-sepolia',
    txHash: '0xb4f6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6',
    blockNumber: 8234120,
    blockHash: '0x8b2d4f6a8c0e2d4f6b8a0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4',
    anchoredAt: '2026-06-02T14:08:55Z',
    confirmations: 64,
    confirmationsRequired: 12,
    isFinal: true,
    verifyUrl: 'https://sepolia.etherscan.io/tx/0xb4f6c8d0',
    rawPayloadBase64: 'eyJyZXBvcnRJZCI6IlJQMjAyNjA2MDIwMDEiLCJzaWduZXIiOiJEMDAyIn0=',
    payloadHash: 'sha256:b4e6f8d2c1b94f6701dde9aabbccddeeff00112233445566778899aabbccddee',
  },
  {
    id: 'arc-003',
    reportId: 'RP20260603001',
    contentHash: 'c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7',
    signerId: 'D006',
    certificateSerial: '2F4D-8E1B-A039-7C58',
    network: 'hyperledger-fabric',
    txHash: '0xc5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7',
    blockNumber: 41203,
    blockHash: '0xa3c5e7f9b1d3a5c7e9f1b3d5a7c9e1f3b5d7a9c1e3f5b7d9a1c3e5f7b9d1a3c5e7',
    anchoredAt: '2026-06-03T09:16:00Z',
    confirmations: 1,
    confirmationsRequired: 1,
    isFinal: true,
    verifyUrl: 'https://explorer.g005-fabric.local/tx/c5d7e9f1',
    rawPayloadBase64: 'eyJyZXBvcnRJZCI6IlJQMjAyNjA2MDMwMDEiLCJzaWduZXIiOiJEMDA2In0=',
    payloadHash: 'sha256:c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7',
  },
];

// ============================================================
// HSM / PKCS#11
// ============================================================

export const HSM_SLOTS: HsmSlot[] = [
  {
    slotId: 1,
    description: 'G005 HSM Slot 1 (主签章密钥)',
    manufacturer: 'Thales',
    hardwareVersion: '1.0',
    firmwareVersion: '7.7.0',
    tokenPresent: true,
    isRemovable: false,
  },
  {
    slotId: 2,
    description: 'G005 HSM Slot 2 (时间戳密钥)',
    manufacturer: 'Thales',
    hardwareVersion: '1.0',
    firmwareVersion: '7.7.0',
    tokenPresent: true,
    isRemovable: false,
  },
  {
    slotId: 3,
    description: 'G005 HSM Slot 3 (备份)',
    manufacturer: 'Thales',
    hardwareVersion: '1.0',
    firmwareVersion: '7.7.0',
    tokenPresent: false,
    isRemovable: true,
  },
];

export const HSM_TOKENS: HsmToken[] = [
  {
    label: 'G005-MAIN-Token',
    manufacturerId: 'Thales',
    model: 'Luna K7',
    serialNumber: '5432109876543210',
    flags: ['RNG', 'LOGIN_REQUIRED', 'USER_PIN_INITIALIZED', 'TOKEN_INITIALIZED'],
    maxSessionCount: 1024,
    maxRwSessionCount: 256,
    maxPinLen: 32,
    minPinLen: 4,
    totalPublicMemory: 262_144,
    freePublicMemory: 198_240,
  },
];

export const HSM_KEY_HANDLES: HsmKeyHandle[] = [
  {
    handleId: 'hkey-signer-001',
    slotId: 1,
    label: 'G005-D001-Signer-Key',
    keyClass: 'private',
    algo: 'RSA-2048',
    fingerprint: 'sha256:7e2b:fa3c:9d12:4801:e9a6:bb34:c7f2:1d50',
    createdAt: '2025-06-01T08:55:00Z',
    usages: ['sign', 'verify'],
    extractable: false,
    sensitive: true,
  },
  {
    handleId: 'hkey-signer-002',
    slotId: 1,
    label: 'G005-D002-Signer-Key',
    keyClass: 'private',
    algo: 'RSA-2048',
    fingerprint: 'sha256:1a3d:5e9b:c840:21fa:0e62:bb91:c723:4851',
    createdAt: '2025-08-15T10:25:00Z',
    usages: ['sign', 'verify'],
    extractable: false,
    sensitive: true,
  },
  {
    handleId: 'hkey-tsa-001',
    slotId: 2,
    label: 'G005-TSA-Signer',
    keyClass: 'private',
    algo: 'RSA-2048',
    fingerprint: 'sha256:9a8b:7c6d:5e4f:3a2b:1c0d:9e8f:7a6b:5c4d',
    createdAt: '2024-01-15T09:00:00Z',
    usages: ['sign', 'verify'],
    extractable: false,
    sensitive: true,
  },
];

export const HSM_DEFAULT_CONFIG: HsmConfig = {
  vendor: 'thales-luna',
  libraryPath: '/usr/lib/libCryptoki2_64.so',
  slotId: 1,
  userPin: '********',
  soPin: undefined,
  keyAlgo: 'RSA-2048',
  timeoutMs: 15_000,
  enableAudit: true,
  fipsMode: true,
};

// ============================================================
// 多级审批模板
// ============================================================

export const APPROVAL_CHAIN_TEMPLATES: ApprovalChainTemplate[] = [
  {
    id: 'tmpl-cosign',
    name: '危急值双签',
    description: '适用于危急值报告, 住院医师 → 主治 → 主任三级双签',
    appliesTo: 'critical-finding',
    isDefault: true,
    createdAt: '2025-09-01T08:00:00Z',
    levels: [
      { levelId: 'lv-cosign-1', order: 1, role: 'attending', label: '主治医师审核', requiredCount: 1, slaHours: 2, canSkip: false },
      { levelId: 'lv-cosign-2', order: 2, role: 'director', label: '主任医师复核', requiredCount: 1, slaHours: 4, canSkip: false, autoApproveOnQualityScore: 95 },
    ],
  },
  {
    id: 'tmpl-amend',
    name: '已签章修订',
    description: '已签章报告修订, 需原签章医师 + 质控员审核',
    appliesTo: 'amend',
    isDefault: false,
    createdAt: '2025-10-15T10:00:00Z',
    levels: [
      { levelId: 'lv-amend-1', order: 1, role: 'attending', label: '原签章医师复核', requiredCount: 1, slaHours: 4, canSkip: false },
      { levelId: 'lv-amend-2', order: 2, role: 'quality-officer', label: '质控员审核', requiredCount: 1, slaHours: 8, canSkip: false },
    ],
  },
  {
    id: 'tmpl-release',
    name: '锁定报告解锁',
    description: '已发布已锁定报告解锁, 适用于补充病理回报等场景',
    appliesTo: 'release-lock',
    isDefault: false,
    createdAt: '2025-11-20T14:00:00Z',
    levels: [
      { levelId: 'lv-rel-1', order: 1, role: 'attending', label: '主诊医师', requiredCount: 1, slaHours: 4, canSkip: false },
      { levelId: 'lv-rel-2', order: 2, role: 'director', label: '科主任审批', requiredCount: 1, slaHours: 8, canSkip: false },
      { levelId: 'lv-rel-3', order: 3, role: 'quality-officer', label: '质控复核', requiredCount: 1, slaHours: 12, canSkip: false },
    ],
  },
  {
    id: 'tmpl-routine',
    name: '常规签章',
    description: '常规报告签章, 单级签字',
    appliesTo: 'routine-sign',
    isDefault: true,
    createdAt: '2025-09-01T08:00:00Z',
    levels: [
      { levelId: 'lv-routine-1', order: 1, role: 'attending', label: '签章医师', requiredCount: 1, slaHours: 24, canSkip: false },
    ],
  },
];

export const APPROVAL_PARTICIPANTS_POOL: ApprovalParticipant[] = [
  { userId: 'D001', userName: '张明远', role: 'director', department: '放射科', isOnDuty: true },
  { userId: 'D002', userName: '李慧敏', role: 'attending', department: '放射科', isOnDuty: true },
  { userId: 'D003', userName: '王建华', role: 'attending', department: '放射科', isOnDuty: false },
  { userId: 'D004', userName: '陈晓东', role: 'fellow', department: '放射科', isOnDuty: true },
  { userId: 'D005', userName: '刘文博', role: 'attending', department: '放射科', isOnDuty: false },
  { userId: 'D006', userName: '赵雪琴', role: 'director', department: '放射科', isOnDuty: true },
  { userId: 'Q001', userName: '孙明', role: 'quality-officer', department: '质控科', isOnDuty: true },
  { userId: 'S001', userName: '吴娜', role: 'security-officer', department: '信息科', isOnDuty: true },
];

export const APPROVAL_INFLIGHT: MultiLevelApprovalState[] = [
  {
    approvalId: 'apr-001',
    reportId: 'RP20260619001',
    status: 'in-progress',
    priority: 'urgent',
    initiatedBy: 'D002',
    initiatedByName: '李慧敏',
    initiatedAt: '2026-06-19T09:00:00Z',
    currentLevelId: 'lv-cosign-2',
    levels: APPROVAL_CHAIN_TEMPLATES[0]!.levels,
    actions: [
      {
        levelId: 'lv-cosign-1',
        approverId: 'D002',
        approverName: '李慧敏',
        approverRole: 'attending',
        decision: 'approved',
        comment: '已核实影像所见',
        actedAt: '2026-06-19T09:30:00Z',
        ipAddress: '10.20.30.42',
        deviceId: 'MacBook-Pro-M3-7F8E9D',
      },
    ],
    pendingApprovers: [{ userId: 'D001', userName: '张明远', role: 'director', department: '放射科', isOnDuty: true }],
    completedLevelIds: ['lv-cosign-1'],
    expiresAt: '2026-06-19T13:00:00Z',
    reason: '危急值: 主动脉夹层',
  },
];

export const APPROVAL_COMPLETED: MultiLevelApprovalState[] = [
  {
    approvalId: 'apr-002',
    reportId: 'RP20260618001',
    status: 'completed',
    priority: 'routine',
    initiatedBy: 'D003',
    initiatedByName: '王建华',
    initiatedAt: '2026-06-18T08:00:00Z',
    finishedAt: '2026-06-18T08:35:00Z',
    currentLevelId: 'lv-amend-2',
    levels: APPROVAL_CHAIN_TEMPLATES[1]!.levels,
    actions: [
      {
        levelId: 'lv-amend-1',
        approverId: 'D003',
        approverName: '王建华',
        approverRole: 'attending',
        decision: 'approved',
        comment: '原签章医师复核通过',
        actedAt: '2026-06-18T08:20:00Z',
        ipAddress: '10.20.30.43',
        deviceId: 'Windows-Desktop-X1Carbon',
      },
      {
        levelId: 'lv-amend-2',
        approverId: 'Q001',
        approverName: '孙明',
        approverRole: 'quality-officer',
        decision: 'approved',
        comment: '修订合理, 已签字',
        actedAt: '2026-06-18T08:35:00Z',
        ipAddress: '10.20.30.50',
        deviceId: 'QC-Desktop-01',
      },
    ],
    pendingApprovers: [],
    completedLevelIds: ['lv-amend-1', 'lv-amend-2'],
    expiresAt: '2026-06-19T08:00:00Z',
    reason: '病理回报补充, 修订诊断',
  },
];

// ============================================================
// 三人应急 (3-eye principle)
// ============================================================

export const EMERGENCY_OVERRIDES: EmergencyOverrideRecord[] = [
  {
    id: 'emerg-002',
    request: {
      reportId: 'RP20260618002',
      initiatorId: 'D002',
      initiatorName: '李慧敏',
      reason: '术后大出血, 须立即锁定报告进行二次复核',
      severity: 'critical',
      eyesRequired: 3,
      witnesses: [
        { userId: 'D001', userName: '张明远', role: 'director', department: '放射科', isOnDuty: true, contactedAt: '2026-06-18T14:00:00Z' },
        { userId: 'D006', userName: '赵雪琴', role: 'director', department: '放射科', isOnDuty: true, contactedAt: '2026-06-18T14:01:00Z' },
      ],
      expiresAt: '2026-06-18T15:00:00Z',
    },
    approvals: [],
    status: 'pending',
    createdAt: '2026-06-18T14:00:00Z',
  },
  {
    id: 'emerg-001',
    request: {
      reportId: 'RP20260617099',
      initiatorId: 'D004',
      initiatorName: '陈晓东',
      reason: '急诊脑出血患者, 须立即发布报告进行术前准备',
      severity: 'life-threatening',
      eyesRequired: 3,
      witnesses: [
        { userId: 'D001', userName: '张明远', role: 'director', department: '放射科', isOnDuty: true, contactedAt: '2026-06-17T22:30:00Z' },
        { userId: 'D006', userName: '赵雪琴', role: 'director', department: '放射科', isOnDuty: true, contactedAt: '2026-06-17T22:31:00Z' },
        { userId: 'Q001', userName: '孙明', role: 'quality-officer', department: '质控科', isOnDuty: true, contactedAt: '2026-06-17T22:32:00Z' },
      ],
      expiresAt: '2026-06-17T23:30:00Z',
      justificationDoc: 'INCIDENT-2026-0617-001',
    },
    approvals: [
      {
        witnessId: 'D001',
        witnessName: '张明远',
        witnessRole: 'director',
        approvalCode: 'EMRG-7F8A9B',
        approvedAt: '2026-06-17T22:33:00Z',
        ipAddress: '10.20.30.41',
        biometricVerified: true,
      },
      {
        witnessId: 'D006',
        witnessName: '赵雪琴',
        witnessRole: 'director',
        approvalCode: 'EMRG-3C4D5E',
        approvedAt: '2026-06-17T22:34:00Z',
        ipAddress: '10.20.30.46',
        biometricVerified: true,
      },
      {
        witnessId: 'Q001',
        witnessName: '孙明',
        witnessRole: 'quality-officer',
        approvalCode: 'EMRG-1A2B3C',
        approvedAt: '2026-06-17T22:35:00Z',
        ipAddress: '10.20.30.50',
        biometricVerified: true,
      },
    ],
    status: 'authorized',
    createdAt: '2026-06-17T22:30:00Z',
    authorizedAt: '2026-06-17T22:35:00Z',
    signatureValue: 'MEYCIQD...emergency-sig...',
    auditHash: 'sha256:abcd1234ef567890',
  },
];
