/**
 * G005 放射RIS系统 v3.0.5.1 - PKCS#11 HSM 适配器 (mock)
 * 30 pts
 *
 * 支持 Thales Luna / SafeNet / Utimaco / AWS CloudHSM / Azure HSM / YubiHSM2
 */

import type {
  HsmConfig,
  HsmKeyHandle,
  HsmSession,
  HsmSignResult,
  HsmSlot,
  HsmToken,
  HsmVendor,
} from '../../types/sign';
import {
  HSM_SLOTS,
  HSM_TOKENS,
  HSM_KEY_HANDLES,
  HSM_DEFAULT_CONFIG,
} from '../../data/signMock';

const MIN_DELAY_MS = 100;
const MAX_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay(): Promise<void> {
  return delay(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function randomHex(bytes: number): string {
  let s = '';
  for (let i = 0; i < bytes * 2; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

export class HsmAdapter {
  private slots: HsmSlot[] = [...HSM_SLOTS];
  private tokens: HsmToken[] = [...HSM_TOKENS];
  private keyHandles: HsmKeyHandle[] = [...HSM_KEY_HANDLES];
  private sessions: HsmSession[] = [];
  private config: HsmConfig = { ...HSM_DEFAULT_CONFIG };
  private initialized = false;

  async initialize(config?: Partial<HsmConfig>): Promise<boolean> {
    await randomDelay();
    this.config = { ...this.config, ...config };
    this.initialized = true;
    return true;
  }

  async isInitialized(): Promise<boolean> {
    await delay(50);
    return this.initialized;
  }

  async listSlots(tokenPresent?: boolean): Promise<HsmSlot[]> {
    await randomDelay();
    return tokenPresent !== undefined
      ? this.slots.filter((s) => s.tokenPresent === tokenPresent)
      : [...this.slots];
  }

  async getTokenInfo(slotId: number): Promise<HsmToken | null> {
    await randomDelay();
    return this.tokens[0] ?? null;
  }

  async openSession(slotId: number, pin: string): Promise<HsmSession> {
    await randomDelay();
    if (pin.length < 4) throw new Error('PIN 长度不足 4 位');
    const session: HsmSession = {
      sessionId: uuid('hses'),
      slotId,
      state: 'rw',
      openedAt: nowIso(),
      userPinVerified: true,
    };
    this.sessions.push(session);
    return session;
  }

  async closeSession(sessionId: string): Promise<boolean> {
    await randomDelay();
    const idx = this.sessions.findIndex((s) => s.sessionId === sessionId);
    if (idx < 0) return false;
    this.sessions.splice(idx, 1);
    return true;
  }

  async listSessions(): Promise<HsmSession[]> {
    await randomDelay();
    return [...this.sessions];
  }

  async findKeys(label?: string): Promise<HsmKeyHandle[]> {
    await randomDelay();
    return label ? this.keyHandles.filter((k) => k.label.includes(label)) : [...this.keyHandles];
  }

  async sign(
    keyHandleId: string,
    data: string,
  ): Promise<HsmSignResult> {
    await randomDelay();
    const key = this.keyHandles.find((k) => k.handleId === keyHandleId);
    if (!key) throw new Error(`密钥句柄 ${keyHandleId} 未找到`);
    if (!key.usages.includes('sign')) throw new Error('密钥不支持签名操作');
    return {
      keyHandleId,
      signatureValueBase64: btoa(randomHex(128)),
      algo: key.algo,
      signedAt: nowIso(),
      auditTrailId: uuid('audit'),
    };
  }

  async verify(keyHandleId: string, _data: string, _signatureBase64: string): Promise<boolean> {
    await randomDelay();
    const key = this.keyHandles.find((k) => k.handleId === keyHandleId);
    if (!key) throw new Error(`密钥句柄 ${keyHandleId} 未找到`);
    return Math.random() > 0.05;
  }

  async generateKey(label: string, algo: HsmKeyHandle['algo']): Promise<HsmKeyHandle> {
    await randomDelay();
    const handle: HsmKeyHandle = {
      handleId: uuid('hkey'),
      slotId: this.config.slotId,
      label,
      keyClass: 'private',
      algo,
      fingerprint: `sha256:${randomHex(8)}:${randomHex(8)}:${randomHex(8)}:${randomHex(8)}`,
      createdAt: nowIso(),
      usages: ['sign', 'verify'],
      extractable: false,
      sensitive: true,
    };
    this.keyHandles.push(handle);
    return handle;
  }

  async getConfig(): Promise<HsmConfig> {
    await delay(50);
    return { ...this.config };
  }

  async updateConfig(partial: Partial<HsmConfig>): Promise<HsmConfig> {
    await randomDelay();
    this.config = { ...this.config, ...partial };
    return { ...this.config };
  }

  async selfTest(): Promise<{ ok: boolean; results: Array<{ test: string; passed: boolean }> }> {
    await delay(500);
    return {
      ok: true,
      results: [
        { test: 'RNG', passed: true },
        { test: 'RSA-2048 sign/verify', passed: true },
        { test: 'EC-P256 sign/verify', passed: true },
        { test: 'Digest SHA-256', passed: true },
        { test: 'Session Management', passed: true },
      ],
    };
  }
}

export const hsmAdapter = new HsmAdapter();
