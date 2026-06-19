// ============================================================
// G005 放射RIS系统 v3.0.6 - HSM 硬件安全模块适配器
// HSM Adapter - Mock PKCS#11 接口
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import type {
  HsmSlot, HsmKeyHandle, HsmOperationResult, HsmSession,
  HsmKeyAlgorithm, HsmKeyUsage,
} from '../../../types/security';

const MOCK_SLOTS: HsmSlot[] = [
  {
    slotId: 'slot-001',
    label: '国家信通院 HSM',
    manufacturer: '卫士通',
    model: 'SJJ1528-GCM',
    firmwareVersion: '2.4.1',
    hardwareVersion: 'Rev.C',
    serial: 'CN-WST-2026-001',
    isInserted: true,
    tokenPresent: true,
  },
  {
    slotId: 'slot-002',
    label: '院内 HSM 集群',
    manufacturer: '三未信安',
    model: 'Sanhsm-3000',
    firmwareVersion: '3.1.0',
    hardwareVersion: 'Rev.D',
    serial: 'CN-SWX-2026-002',
    isInserted: true,
    tokenPresent: true,
  },
];

const MOCK_KEYS: HsmKeyHandle[] = [
  {
    handleId: 'hsk-master-001',
    label: 'G005-RIS 主加密密钥',
    algorithm: 'AES-256',
    usage: ['encrypt', 'decrypt', 'wrap', 'unwrap'],
    extractable: false,
    sensitive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2027-01-01T00:00:00.000Z',
    fingerprint: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
  },
  {
    handleId: 'hsk-sm4-001',
    label: 'SM4 国密对称密钥',
    algorithm: 'SM4',
    usage: ['encrypt', 'decrypt'],
    extractable: false,
    sensitive: true,
    createdAt: '2026-01-05T00:00:00.000Z',
    expiresAt: '2027-01-05T00:00:00.000Z',
    fingerprint: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
  },
  {
    handleId: 'hsk-sm2-signer',
    label: 'G005 CA 签名密钥',
    algorithm: 'SM2',
    usage: ['sign', 'verify'],
    extractable: false,
    sensitive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2031-01-01T00:00:00.000Z',
    fingerprint: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
  },
  {
    handleId: 'hsk-aes-data',
    label: 'PHI 静态加密密钥',
    algorithm: 'AES-256',
    usage: ['encrypt', 'decrypt'],
    extractable: false,
    sensitive: true,
    createdAt: '2026-02-01T00:00:00.000Z',
    expiresAt: '2026-08-01T00:00:00.000Z',
    fingerprint: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
  },
];

let sessions: HsmSession[] = [];

function ensureSlot(slotId: string): HsmSlot | null {
  return MOCK_SLOTS.find(s => s.slotId === slotId && s.isInserted && s.tokenPresent) ?? null;
}

function ensureKey(handleId: string): HsmKeyHandle | null {
  return MOCK_KEYS.find(k => k.handleId === handleId) ?? null;
}

function nowIso(): string { return new Date().toISOString(); }

function auditTrail(op: string, args: Record<string, unknown>): string {
  return `${nowIso()} [HSM-MOCK] ${op} ${JSON.stringify(args)}`;
}

export class HSMAdapter {
  /** 获取所有可用卡槽 */
  async listSlots(): Promise<HsmSlot[]> {
    return MOCK_KEYS.map(() => MOCK_SLOTS).flat().filter((s, i, arr) => arr.findIndex(x => x.slotId === s.slotId) === i);
  }

  /** 打开会话 */
  async openSession(slotId: string, authenticatedUser?: string): Promise<HsmSession> {
    const slot = ensureSlot(slotId);
    if (!slot) throw new Error(`Slot ${slotId} not available`);
    const session: HsmSession = {
      sessionId: uuidv4(),
      slotId,
      openedAt: nowIso(),
      lastUsed: nowIso(),
      authenticatedUser,
    };
    sessions.push(session);
    return session;
  }

  /** 关闭会话 */
  async closeSession(sessionId: string): Promise<void> {
    sessions = sessions.filter(s => s.sessionId !== sessionId);
  }

  /** 列出所有密钥句柄 */
  async listKeys(): Promise<HsmKeyHandle[]> {
    return [...MOCK_KEYS];
  }

  /** 按算法查找密钥 */
  async findKey(algorithm: HsmKeyAlgorithm, usage: HsmKeyUsage): Promise<HsmKeyHandle | null> {
    return MOCK_KEYS.find(k => k.algorithm === algorithm && k.usage.includes(usage)) ?? null;
  }

  /** 生成对称密钥 (SM4 / AES) */
  async generateSymmetricKey(opts: {
    label: string;
    algorithm: 'AES-256' | 'SM4';
    usage: HsmKeyUsage[];
    slotId?: string;
  }): Promise<HsmKeyHandle> {
    const handle: HsmKeyHandle = {
      handleId: `hsk-${uuidv4()}`,
      label: opts.label,
      algorithm: opts.algorithm,
      usage: opts.usage,
      extractable: false,
      sensitive: true,
      createdAt: nowIso(),
      expiresAt: new Date(Date.now() + 365 * 86400_000).toISOString(),
      fingerprint: uuidv4().replace(/-/g, '').slice(0, 32),
    };
    MOCK_KEYS.push(handle);
    return handle;
  }

  /** 生成非对称密钥对 (RSA / SM2 / ECDSA) */
  async generateKeyPair(opts: {
    label: string;
    algorithm: 'RSA-2048' | 'SM2' | 'ECDSA-P256';
    usage: HsmKeyUsage[];
    slotId?: string;
  }): Promise<{ publicHandle: HsmKeyHandle; privateHandle: HsmKeyHandle }> {
    const pub: HsmKeyHandle = {
      handleId: `hsk-pub-${uuidv4()}`,
      label: opts.label + ' (public)',
      algorithm: opts.algorithm,
      usage: opts.usage.filter(u => u !== 'sign' && u !== 'decrypt'),
      extractable: true,
      sensitive: false,
      createdAt: nowIso(),
      fingerprint: uuidv4().replace(/-/g, '').slice(0, 32),
    };
    const priv: HsmKeyHandle = {
      handleId: `hsk-priv-${uuidv4()}`,
      label: opts.label + ' (private)',
      algorithm: opts.algorithm,
      usage: opts.usage.filter(u => u === 'sign' || u === 'decrypt' || u === 'unwrap'),
      extractable: false,
      sensitive: true,
      createdAt: nowIso(),
      expiresAt: new Date(Date.now() + 365 * 86400_000).toISOString(),
      fingerprint: uuidv4().replace(/-/g, '').slice(0, 32),
    };
    MOCK_KEYS.push(pub, priv);
    return { publicHandle: pub, privateHandle: priv };
  }

  /** 在 HSM 内部加密 (数据不离开硬件) */
  async encryptInHsm(handleId: string, plaintext: Uint8Array): Promise<HsmOperationResult> {
    const key = ensureKey(handleId);
    if (!key) return { success: false, error: `Key ${handleId} not found`, auditTrail: auditTrail('encrypt', { handleId, error: 'key_not_found' }) };
    if (!key.usage.includes('encrypt')) {
      return { success: false, error: 'Key usage does not permit encrypt', auditTrail: auditTrail('encrypt', { handleId, error: 'usage_denied' }) };
    }
    const simulated = new Uint8Array(plaintext.length + 16);
    for (let i = 0; i < plaintext.length; i++) simulated[i] = plaintext[i]! ^ 0x5A;
    return { success: true, data: simulated, auditTrail: auditTrail('encrypt', { handleId, bytes: plaintext.length }) };
  }

  /** 在 HSM 内部解密 */
  async decryptInHsm(handleId: string, ciphertext: Uint8Array): Promise<HsmOperationResult> {
    const key = ensureKey(handleId);
    if (!key) return { success: false, error: `Key ${handleId} not found`, auditTrail: auditTrail('decrypt', { handleId, error: 'key_not_found' }) };
    if (!key.usage.includes('decrypt')) {
      return { success: false, error: 'Key usage does not permit decrypt', auditTrail: auditTrail('decrypt', { handleId, error: 'usage_denied' }) };
    }
    const out = new Uint8Array(Math.max(0, ciphertext.length - 16));
    for (let i = 0; i < out.length; i++) out[i] = ciphertext[i]! ^ 0x5A;
    return { success: true, data: out, auditTrail: auditTrail('decrypt', { handleId, bytes: ciphertext.length }) };
  }

  /** HSM 内部签名 */
  async signInHsm(handleId: string, digest: Uint8Array): Promise<HsmOperationResult> {
    const key = ensureKey(handleId);
    if (!key) return { success: false, error: `Key ${handleId} not found`, auditTrail: auditTrail('sign', { handleId, error: 'key_not_found' }) };
    if (!key.usage.includes('sign')) {
      return { success: false, error: 'Key usage does not permit sign', auditTrail: auditTrail('sign', { handleId, error: 'usage_denied' }) };
    }
    const sig = new Uint8Array(64);
    crypto.getRandomValues(sig);
    return { success: true, data: sig, auditTrail: auditTrail('sign', { handleId, digestBytes: digest.length }) };
  }

  /** HSM 内部验签 */
  async verifyInHsm(handleId: string, digest: Uint8Array, signature: Uint8Array): Promise<HsmOperationResult<boolean>> {
    const key = ensureKey(handleId);
    if (!key) return { success: false, error: `Key ${handleId} not found`, auditTrail: auditTrail('verify', { handleId, error: 'key_not_found' }) };
    if (!key.usage.includes('verify')) {
      return { success: false, error: 'Key usage does not permit verify', auditTrail: auditTrail('verify', { handleId, error: 'usage_denied' }) };
    }
    return { success: true, data: signature.length === 64, auditTrail: auditTrail('verify', { handleId, valid: signature.length === 64 }) };
  }

  /** 包装密钥 (key wrap, 用于密钥分发) */
  async wrapKey(wrappingKeyHandle: string, targetKeyHandle: string): Promise<HsmOperationResult> {
    const wrap = ensureKey(wrappingKeyHandle);
    const target = ensureKey(targetKeyHandle);
    if (!wrap || !target) return { success: false, error: 'Key not found', auditTrail: auditTrail('wrap', { error: 'key_not_found' }) };
    if (!wrap.usage.includes('wrap') || !target.extractable) {
      return { success: false, error: 'Wrap not permitted', auditTrail: auditTrail('wrap', { error: 'usage_denied_or_not_extractable' }) };
    }
    const wrapped = new TextEncoder().encode(`WRAPPED-${target.handleId}-${uuidv4()}`);
    return { success: true, data: wrapped, auditTrail: auditTrail('wrap', { wrappingKey: wrappingKeyHandle, target: targetKeyHandle }) };
  }

  /** 健康检查 */
  async healthCheck(): Promise<{ ok: boolean; slotsAvailable: number; keysManaged: number; sessions: number; uptime: number }> {
    return {
      ok: true,
      slotsAvailable: MOCK_SLOTS.filter(s => s.isInserted && s.tokenPresent).length,
      keysManaged: MOCK_KEYS.length,
      sessions: sessions.length,
      uptime: Math.floor(performance.now() / 1000),
    };
  }

  /** FIPS 140-2 Level 3 状态 */
  async getFipsStatus(): Promise<{ level: 2 | 3; certified: boolean; algorithms: string[]; physicalSecurity: boolean; tamperResistant: boolean }> {
    return {
      level: 3,
      certified: true,
      algorithms: ['AES-256', 'SM4', 'SM2', 'SM3', 'SHA-256', 'SHA-512', 'RSA-2048'],
      physicalSecurity: true,
      tamperResistant: true,
    };
  }
}

export const hsmAdapter = new HSMAdapter();