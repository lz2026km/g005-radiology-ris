/**
 * G005 放射RIS系统 v3.0.5.1 - 签章/审批/合规 公共类型
 *
 * 覆盖 (15 pts):
 *  - 证书全生命周期
 *  - 多模态生物识别
 *  - RFC 3161 时间戳 / CRL / OCSP
 *  - 区块链多链锚定
 *  - PKCS#11 / HSM 适配
 *  - 多级审批 / 审批链 / 三人应急
 */

import type {
  CertificateInfo,
  SignLogEntry,
  SignatureTimestamp,
  BlockchainProof,
  BiometricVerifyResult,
  SignRevokeRequest,
} from '../R3/R3.SIGN';

// ============================================================
// 证书全生命周期
// ============================================================

export type CertLifecycleStatus =
  | 'pending-csr'
  | 'pending-issue'
  | 'active'
  | 'suspended'
  | 'expired'
  | 'revoked'
  | 'renewed';

export type CertLifecycleEventType =
  | 'issue'
  | 'renew'
  | 'suspend'
  | 'resume'
  | 'revoke'
  | 'archive';

export interface CertLifecycleEvent {
  id: string;
  certId: string;
  type: CertLifecycleEventType;
  occurredAt: string;
  actorId: string;
  actorName: string;
  reason?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface CertIssueRequest {
  userId: string;
  userName: string;
  userTitle?: string;
  organization?: string;
  certType: CertificateInfo['certType'];
  validityDays: number;
  reason?: string;
}

export interface CertRenewRequest {
  certId: string;
  newValidityDays: number;
  reason: string;
  operatorId: string;
  operatorName: string;
}

export interface CertRevokeRequestExt {
  certId: string;
  reason: CertRevocationReason;
  reasonText?: string;
  invalidationDate?: string;
  operatorId: string;
  operatorName: string;
}

export type CertRevocationReason =
  | 'unspecified'
  | 'key-compromise'
  | 'ca-compromise'
  | 'affiliation-changed'
  | 'superseded'
  | 'cessation-of-operation'
  | 'certificate-hold'
  | 'privilege-withdrawn'
  | 'aa-compromise';

export interface CertSuspensionRequest {
  certId: string;
  reason: string;
  operatorId: string;
  operatorName: string;
  resumeAt?: string;
}

export interface CertStatusResponse {
  certId: string;
  serialNumber: string;
  status: CertLifecycleStatus;
  notBefore: string;
  notAfter: string;
  daysToExpiry: number;
  isInCrL: boolean;
  ocspStatus: 'good' | 'revoked' | 'unknown' | 'suspended';
  lastCheckedAt: string;
}

// ============================================================
// 多模态生物识别
// ============================================================

export type BiometricModality = 'face' | 'fingerprint' | 'voice' | 'iris';

export interface BiometricSample {
  sampleId: string;
  userId: string;
  modality: BiometricModality;
  capturedAt: string;
  qualityScore: number;
  embedding?: string;
  payloadSize: number;
  deviceId: string;
}

export interface BiometricEnrollment {
  userId: string;
  modality: BiometricModality;
  samples: BiometricSample[];
  enrolledAt: string;
  isComplete: boolean;
  requiredSamples: number;
  templateId: string;
}

export interface BiometricMultiModalAttempt {
  userId: string;
  modalities: BiometricModality[];
  samples: BiometricSample[];
  deviceId: string;
  ipAddress?: string;
  geolocation?: { lat: number; lng: number };
}

export interface BiometricMultiModalResult extends BiometricVerifyResult {
  modalitiesAttempted: BiometricModality[];
  fusionScore: number;
  modalityScores: Partial<Record<BiometricModality, number>>;
  livenessPassed: boolean;
  decision: 'allow' | 'deny' | 'challenge';
}

// ============================================================
// RFC 3161 时间戳
// ============================================================

export type TimestampTrustLevel = SignatureTimestamp['trustLevel'];
export type TimestampAlgo = 'sha256' | 'sha384' | 'sha512' | 'sm3';

export interface TimeStampRequest {
  reportId: string;
  contentHash: string;
  algo?: TimestampAlgo;
  policyOid?: string;
  nonce?: string;
}

export interface TimeStampToken {
  id: string;
  reportId: string;
  hashAlgo: TimestampAlgo;
  messageImprint: string;
  serialNumber: string;
  genTime: string;
  policyOid: string;
  tsaName: string;
  tsaCommonName: string;
  tsaCountry: string;
  accuracySeconds: number;
  ordering: boolean;
  nonce?: string;
  signatureAlgorithm: string;
  signatureValue: string;
  rawDerBase64: string;
  trustLevel: TimestampTrustLevel;
}

export interface TimeStampVerifyResult {
  tokenId: string;
  isValid: boolean;
  hashMatch: boolean;
  signatureValid: boolean;
  certChainValid: boolean;
  notExpired: boolean;
  verifiedAt: string;
  failureReasons: string[];
}

// ============================================================
// CRL / OCSP
// ============================================================

export interface CrlEntry {
  serialNumber: string;
  revocationDate: string;
  reason: CertRevocationReason;
  invalidityDate?: string;
  issuerCommonName: string;
}

export interface CrlSnapshot {
  issuerCommonName: string;
  thisUpdate: string;
  nextUpdate: string;
  entries: CrlEntry[];
  crlNumber: string;
  signatureAlgorithm: string;
  isDelta: boolean;
}

export interface OcspRequest {
  serialNumber: string;
  issuerCommonName: string;
}

export type OcspCertStatus = 'good' | 'revoked' | 'unknown';

export interface OcspResponse {
  serialNumber: string;
  status: OcspCertStatus;
  thisUpdate: string;
  nextUpdate: string;
  responderId: string;
  producedAt: string;
  signatureAlgorithm: string;
  revocationReason?: CertRevocationReason;
  revokedAt?: string;
}

// ============================================================
// 区块链多链锚定
// ============================================================

export type BlockchainNetwork =
  | 'ethereum-mainnet'
  | 'ethereum-sepolia'
  | 'hyperledger-fabric'
  | 'fisco-bcos'
  | 'hospital-chain'
  | 'national-health-chain';

export interface ChainProfile {
  network: BlockchainNetwork;
  displayName: string;
  chainId: string;
  consensus: 'pow' | 'pos' | 'raft' | 'pbft' | 'hotstuff';
  explorerUrl: string;
  confirmationsRequired: number;
  averageFinalityMs: number;
}

export interface AnchorRequest {
  reportId: string;
  contentHash: string;
  signerId: string;
  certificateSerial: string;
  signatureValue: string;
  networks: BlockchainNetwork[];
  metadata?: Record<string, string>;
}

export interface AnchorReceipt {
  id: string;
  reportId: string;
  contentHash: string;
  signerId: string;
  certificateSerial: string;
  network: BlockchainNetwork;
  txHash: string;
  blockNumber: number;
  blockHash: string;
  anchoredAt: string;
  confirmations: number;
  confirmationsRequired: number;
  isFinal: boolean;
  verifyUrl: string;
  rawPayloadBase64: string;
  payloadHash: string;
}

export interface AnchorBatchResult {
  batchId: string;
  totalRequested: number;
  successCount: number;
  failedCount: number;
  receipts: AnchorReceipt[];
  startedAt: string;
  finishedAt: string;
}

// ============================================================
// HSM / PKCS#11
// ============================================================

export type HsmVendor =
  | 'thales-luna'
  | 'safenet-gemalto'
  | 'utimaco'
  | 'aws-cloudhsm'
  | 'azure-dedicated-hsm'
  | 'yubihsm2'
  | 'mock-pkcs11';

export type HsmKeyAlgo = 'RSA-2048' | 'RSA-4096' | 'EC-P256' | 'EC-P384' | 'SM2-256';

export type HsmKeyClass = 'private' | 'public' | 'secret' | 'certificate';

export type HsmSessionState = 'open' | 'closed' | 'rw' | 'ro';

export interface HsmSlot {
  slotId: number;
  description: string;
  manufacturer: string;
  hardwareVersion: string;
  firmwareVersion: string;
  tokenPresent: boolean;
  isRemovable: boolean;
}

export interface HsmToken {
  label: string;
  manufacturerId: string;
  model: string;
  serialNumber: string;
  flags: string[];
  maxSessionCount: number;
  maxRwSessionCount: number;
  maxPinLen: number;
  minPinLen: number;
  totalPublicMemory: number;
  freePublicMemory: number;
}

export interface HsmSession {
  sessionId: string;
  slotId: number;
  state: HsmSessionState;
  openedAt: string;
  userPinVerified: boolean;
}

export interface HsmKeyHandle {
  handleId: string;
  slotId: number;
  label: string;
  keyClass: HsmKeyClass;
  algo: HsmKeyAlgo;
  fingerprint: string;
  createdAt: string;
  usages: Array<'sign' | 'verify' | 'encrypt' | 'decrypt' | 'wrap' | 'unwrap'>;
  extractable: boolean;
  sensitive: boolean;
}

export interface HsmConfig {
  vendor: HsmVendor;
  libraryPath: string;
  slotId: number;
  userPin: string;
  soPin?: string;
  keyAlgo: HsmKeyAlgo;
  timeoutMs: number;
  enableAudit: boolean;
  fipsMode: boolean;
}

export interface HsmSignResult {
  keyHandleId: string;
  signatureValueBase64: string;
  algo: HsmKeyAlgo;
  signedAt: string;
  auditTrailId: string;
}

// ============================================================
// 审批
// ============================================================

export type ApprovalRole =
  | 'resident'
  | 'attending'
  | 'fellow'
  | 'director'
  | 'chief'
  | 'admin'
  | 'quality-officer'
  | 'security-officer';

export type ApprovalDecision = 'pending' | 'approved' | 'rejected' | 'skipped' | 'escalated';

export interface ApprovalLevel {
  levelId: string;
  order: number;
  role: ApprovalRole;
  label: string;
  requiredCount: number;
  slaHours: number;
  canSkip: boolean;
  autoApproveOnQualityScore?: number;
}

export interface ApprovalParticipant {
  userId: string;
  userName: string;
  role: ApprovalRole;
  department?: string;
  isOnDuty: boolean;
  contactedAt?: string;
}

export interface ApprovalAction {
  levelId: string;
  approverId: string;
  approverName: string;
  approverRole: ApprovalRole;
  decision: Exclude<ApprovalDecision, 'pending'>;
  comment?: string;
  actedAt: string;
  ipAddress: string;
  deviceId: string;
}

export interface MultiLevelApprovalRequest {
  reportId: string;
  initiatedBy: string;
  initiatedByName: string;
  priority: 'routine' | 'urgent' | 'stat';
  reason?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface MultiLevelApprovalState {
  approvalId: string;
  reportId: string;
  status: 'draft' | 'in-progress' | 'completed' | 'rejected' | 'expired';
  priority: MultiLevelApprovalRequest['priority'];
  initiatedBy: string;
  initiatedByName: string;
  initiatedAt: string;
  finishedAt?: string;
  currentLevelId?: string;
  levels: ApprovalLevel[];
  actions: ApprovalAction[];
  pendingApprovers: ApprovalParticipant[];
  completedLevelIds: string[];
  expiresAt: string;
  reason?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ApprovalChainTemplate {
  id: string;
  name: string;
  description: string;
  appliesTo: 'critical-finding' | 'cosign' | 'release-lock' | 'amend' | 'routine-sign';
  levels: ApprovalLevel[];
  createdAt: string;
  isDefault: boolean;
}

export interface EmergencyOverrideRequest {
  reportId: string;
  initiatorId: string;
  initiatorName: string;
  reason: string;
  severity: 'high' | 'critical' | 'life-threatening';
  eyesRequired: 3;
  witnesses: ApprovalParticipant[];
  expiresAt: string;
  justificationDoc?: string;
}

export interface EmergencyEyeApproval {
  witnessId: string;
  witnessName: string;
  witnessRole: ApprovalRole;
  approvalCode: string;
  approvedAt: string;
  ipAddress: string;
  biometricVerified: boolean;
}

export interface EmergencyOverrideRecord {
  id: string;
  request: EmergencyOverrideRequest;
  approvals: EmergencyEyeApproval[];
  status: 'pending' | 'authorized' | 'rejected' | 'expired' | 'consumed';
  createdAt: string;
  authorizedAt?: string;
  signatureValue?: string;
  auditHash?: string;
}

// ============================================================
// 签章扩展 (signService 复用)
// ============================================================

export interface IssueCertParams {
  userId: string;
  userName: string;
  userTitle?: string;
  organization?: string;
  certType: CertificateInfo['certType'];
  validityDays: number;
  hsmConfig?: HsmConfig;
}

export interface IssueCertResult {
  certificate: CertificateInfo;
  csrPem: string;
  privateKeyFingerprint: string;
  storedOnHsm: boolean;
  lifecycle: CertLifecycleEvent[];
}

export interface MultiModalSignPayload {
  reportId: string;
  content: string;
  certificateId: string;
  password: string;
  algorithm: CertificateInfo['certType'];
  qualityScore: number;
  modalities: BiometricModality[];
  includeTimestamp: boolean;
  includeBlockchain: boolean;
  includeApproval: boolean;
  approvalId?: string;
}

export interface MultiModalSignResult {
  signatureId: string;
  reportId: string;
  contentHash: string;
  signatureValue: string;
  certificateSerial: string;
  algorithm: CertificateInfo['certType'];
  biometric: BiometricMultiModalResult;
  timestampId?: string;
  blockchainId?: string;
  approvalId?: string;
  progress: SignLogEntry[];
}

export interface ApprovalStatusSnapshot {
  approvalId: string;
  reportId: string;
  status: MultiLevelApprovalState['status'];
  currentLevel?: ApprovalLevel;
  currentLevelApprovers: ApprovalParticipant[];
  completedLevels: ApprovalLevel[];
  pendingLevels: ApprovalLevel[];
  finishedAt?: string;
  expiresAt: string;
}

export type ApprovalLookupKind = 'by-report' | 'by-id' | 'by-approver';

export interface ApprovalLookupParams {
  kind: ApprovalLookupKind;
  reportId?: string;
  approvalId?: string;
  approverId?: string;
}

// ============================================================
// 工具导出
// ============================================================

export const SUPPORTED_BIOMETRIC_MODALITIES: BiometricModality[] = [
  'face',
  'fingerprint',
  'voice',
  'iris',
];

export const REQUIRED_ENROLLMENT_SAMPLES: Record<BiometricModality, number> = {
  face: 3,
  fingerprint: 3,
  voice: 2,
  iris: 2,
};

export const CHAIN_PROFILES: ChainProfile[] = [
  {
    network: 'ethereum-sepolia',
    displayName: 'Ethereum Sepolia (测试网)',
    chainId: '0xaa36a7',
    consensus: 'pos',
    explorerUrl: 'https://sepolia.etherscan.io',
    confirmationsRequired: 12,
    averageFinalityMs: 12_000,
  },
  {
    network: 'ethereum-mainnet',
    displayName: 'Ethereum Mainnet',
    chainId: '0x1',
    consensus: 'pos',
    explorerUrl: 'https://etherscan.io',
    confirmationsRequired: 64,
    averageFinalityMs: 12_000,
  },
  {
    network: 'hyperledger-fabric',
    displayName: 'Hyperledger Fabric (联盟链)',
    chainId: 'g005-fabric-v1',
    consensus: 'raft',
    explorerUrl: 'https://explorer.g005-fabric.local',
    confirmationsRequired: 1,
    averageFinalityMs: 1_500,
  },
  {
    network: 'fisco-bcos',
    displayName: 'FISCO BCOS (微众)',
    chainId: 'g005-fisco-v2',
    consensus: 'pbft',
    explorerUrl: 'https://explorer.fisco.local',
    confirmationsRequired: 1,
    averageFinalityMs: 1_000,
  },
  {
    network: 'hospital-chain',
    displayName: 'G005 医院内部链',
    chainId: 'g005-hosp-v3',
    consensus: 'pbft',
    explorerUrl: 'https://chain.g005-hospital.local',
    confirmationsRequired: 1,
    averageFinalityMs: 800,
  },
  {
    network: 'national-health-chain',
    displayName: '国家健康链',
    chainId: 'cn-health-v1',
    consensus: 'pbft',
    explorerUrl: 'https://health-chain.nhc.gov.cn',
    confirmationsRequired: 2,
    averageFinalityMs: 2_500,
  },
];

export const HSM_VENDOR_PROFILES: Array<{
  vendor: HsmVendor;
  label: string;
  defaultLibrary: string;
  fipsLevel: 'FIPS 140-2 L3' | 'FIPS 140-2 L4' | 'FIPS 140-3 L3' | 'None';
}> = [
  { vendor: 'thales-luna', label: 'Thales Luna', defaultLibrary: '/usr/lib/libCryptoki2_64.so', fipsLevel: 'FIPS 140-2 L3' },
  { vendor: 'safenet-gemalto', label: 'SafeNet Gemalto', defaultLibrary: '/usr/lib/libcklog2.so', fipsLevel: 'FIPS 140-2 L3' },
  { vendor: 'utimaco', label: 'Utimaco', defaultLibrary: '/usr/lib/utimaco/libcs_pkcs11_R3.so', fipsLevel: 'FIPS 140-2 L4' },
  { vendor: 'aws-cloudhsm', label: 'AWS CloudHSM', defaultLibrary: '/opt/cloudhsm/lib/libcloudhsm_pkcs11.so', fipsLevel: 'FIPS 140-2 L3' },
  { vendor: 'azure-dedicated-hsm', label: 'Azure Dedicated HSM', defaultLibrary: '/usr/lib/libazure_pkcs11.so', fipsLevel: 'FIPS 140-2 L3' },
  { vendor: 'yubihsm2', label: 'YubiHSM 2', defaultLibrary: '/usr/lib/x86_64-linux-gnu/yubihsm_pkcs11.so', fipsLevel: 'FIPS 140-2 L3' },
  { vendor: 'mock-pkcs11', label: 'Mock PKCS#11 (dev)', defaultLibrary: 'mock://pkcs11', fipsLevel: 'None' },
];
