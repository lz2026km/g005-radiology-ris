/**
 * G005 放射RIS系统 v3.0.6.6 - 移动端生物识别登录服务
 * 20 升级点:WebAuthn / TouchID / FaceID / 指纹 / 回退PIN / 挑战响应 / 设备绑定
 */

import type { BiometricType, BiometricAuthResult, BiometricCredentials } from '../../types/mobile';
import { v4 as uuid } from 'uuid';

const STORAGE_PREFIX = 'g005-biometric-';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

class BiometricLoginService {
  private lockoutUntil: number = 0;
  private attempts: number = 0;

  get isAvailable(): boolean {
    return typeof window !== 'undefined' && 'PublicKeyCredential' in window;
  }

  get biometricType(): BiometricType {
    if (!this.isAvailable) return 'none';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad')) return 'face-id';
    if (ua.includes('android') && ua.includes('fingerprint')) return 'fingerprint';
    if (ua.includes('windows.hello') || ua.includes('edge')) return 'fingerprint';
    return 'none';
  }

  async authenticate(challenge?: string): Promise<BiometricAuthResult> {
    const now = Date.now();
    if (now < this.lockoutUntil) {
      return {
        success: false,
        type: this.biometricType,
        errorCode: 'lockout',
        errorMessage: `请等待 ${Math.ceil((this.lockoutUntil - now) / 1000)} 秒后重试`,
        attemptsRemaining: 0,
        timestamp: new Date().toISOString(),
      };
    }

    if (!this.isAvailable) {
      return {
        success: false,
        type: 'none',
        errorCode: 'hardware-error',
        errorMessage: '设备不支持生物识别',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const credential = await navigator.credentials.get({
        publicKey: this.buildCredentialRequest(challenge ?? uuid()),
      });

      if (credential) {
        this.attempts = 0;
        return {
          success: true,
          type: this.biometricType,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false,
        type: this.biometricType,
        errorCode: 'user-cancel',
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      this.attempts++;
      if (this.attempts >= MAX_ATTEMPTS) {
        this.lockoutUntil = Date.now() + LOCKOUT_MS;
        this.attempts = 0;
      }

      const msg = String(err);
      if (msg.includes('cancel') || msg.includes('NotAllowed')) {
        return {
          success: false, type: this.biometricType,
          errorCode: 'user-cancel',
          attemptsRemaining: Math.max(0, MAX_ATTEMPTS - this.attempts),
          timestamp: new Date().toISOString(),
        };
      }
      if (msg.includes('not found') || msg.includes('NotSupported')) {
        return {
          success: false, type: this.biometricType,
          errorCode: 'no-enrollment',
          attemptsRemaining: Math.max(0, MAX_ATTEMPTS - this.attempts),
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false, type: this.biometricType,
        errorCode: 'hardware-error',
        errorMessage: msg,
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - this.attempts),
        timestamp: new Date().toISOString(),
      };
    }
  }

  async register(userId: string, deviceId: string): Promise<BiometricCredentials | null> {
    if (!this.isAvailable) return null;

    try {
      const challenge = uuid();
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: this.strToBuffer(challenge),
          rp: { name: 'G005 RIS', id: window.location.hostname },
          user: {
            id: this.strToBuffer(userId),
            name: userId,
            displayName: `G005-${userId}`,
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 30_000,
        },
      });

      if (!credential) return null;

      const creds: BiometricCredentials = {
        type: this.biometricType,
        challenge,
        credentialId: credential.id,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(creds));
      return creds;
    } catch {
      return null;
    }
  }

  async hasCredentials(userId: string): Promise<boolean> {
    return !!localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
  }

  async removeCredentials(userId: string): Promise<void> {
    localStorage.removeItem(`${STORAGE_PREFIX}${userId}`);
  }

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${userId}-pin`);
    if (!stored) return false;
    const { hash, salt } = JSON.parse(stored) as { hash: string; salt: string };
    const check = await this.simpleHash(pin + salt);
    return check === hash;
  }

  async setPin(userId: string, pin: string): Promise<void> {
    const salt = uuid().slice(0, 8);
    const hash = await this.simpleHash(pin + salt);
    localStorage.setItem(`${STORAGE_PREFIX}${userId}-pin`, JSON.stringify({ hash, salt }));
  }

  getAttemptsRemaining(): number {
    return Math.max(0, MAX_ATTEMPTS - this.attempts);
  }

  resetLockout(): void {
    this.lockoutUntil = 0;
    this.attempts = 0;
  }

  private buildCredentialRequest(challenge: string): PublicKeyCredentialRequestOptions {
    return {
      challenge: this.strToBuffer(challenge),
      timeout: 30_000,
      userVerification: 'required',
    };
  }

  private strToBuffer(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  private async simpleHash(input: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

export const biometricLogin = new BiometricLoginService();
