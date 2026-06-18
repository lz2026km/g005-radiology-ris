/**
 * G005 放射RIS系统 v3.0.5.1 - R3.SIGN 生物识别 Service (mock)
 * A5-REPORT / 100 点
 *
 * 模拟人脸识别 / 指纹识别 / WebAuthn 流程
 */

import type { BiometricVerifyResult } from '../../types/R3/R3.SIGN';
import { BIOMETRIC_VERIFICATIONS } from '../../data/reportSignMock';

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 900;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay(): Promise<void> {
  return delay(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

export interface BiometricRequest {
  userId: string;
  method: BiometricVerifyResult['method'];
  deviceFingerprint?: string;
}

export class BiometricService {
  private records: BiometricVerifyResult[] = [...BIOMETRIC_VERIFICATIONS];

  async verify(req: BiometricRequest): Promise<BiometricVerifyResult> {
    await randomDelay();
    const success = Math.random() > 0.08;
    const confidence = success ? 0.85 + Math.random() * 0.14 : 0.3 + Math.random() * 0.3;
    const result: BiometricVerifyResult = {
      id: 'bio-' + Date.now().toString(36),
      userId: req.userId,
      method: req.method,
      success,
      confidence,
      verifiedAt: new Date().toISOString(),
      deviceFingerprint: req.deviceFingerprint ?? 'mock-device',
      livenessScore: success ? 0.85 + Math.random() * 0.14 : 0.2 + Math.random() * 0.3,
      ...(success ? {} : { errorMessage: success ? undefined : (req.method === 'face' ? '活体检测未通过' : '指纹匹配失败') }),
    };
    this.records.push(result);
    return result;
  }

  async listByUser(userId: string): Promise<BiometricVerifyResult[]> {
    await randomDelay();
    return this.records.filter((r) => r.userId === userId);
  }

  async list(): Promise<BiometricVerifyResult[]> {
    await randomDelay();
    return [...this.records];
  }

  async simulateFaceCapture(): Promise<{ imageData: string; capturedAt: string }> {
    await delay(300);
    const randomHex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    return {
      imageData: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=${randomHex(16)}`,
      capturedAt: new Date().toISOString(),
    };
  }
}

export const biometricService = new BiometricService();