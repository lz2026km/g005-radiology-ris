/**
 * G005 放射RIS系统 v3.0.5.1 - 多模态生物识别 Service
 * 50 pts
 *
 * 支持 face / fingerprint / voice / iris 四种模态的注册与多模态融合验证。
 * 真实环境接入 WebAuthn / 厂商 SDK; 当前为 mock 实现, 保留真实接口形状。
 */

import type {
  BiometricVerifyResult,
} from '../../types/R3/R3.SIGN';
import type {
  BiometricEnrollment,
  BiometricModality,
  BiometricMultiModalAttempt,
  BiometricMultiModalResult,
  BiometricSample,
} from '../../types/sign';
import {
  REQUIRED_ENROLLMENT_SAMPLES,
  SUPPORTED_BIOMETRIC_MODALITIES,
} from '../../types/sign';
import {
  BIOMETRIC_SAMPLES,
  BIOMETRIC_MODALITY_THRESHOLDS,
} from '../../data/signMock';

const MIN_DELAY_MS = 180;
const MAX_DELAY_MS = 700;

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

export interface BiometricEnrollParams {
  userId: string;
  modality: BiometricModality;
  samples: Omit<BiometricSample, 'sampleId' | 'capturedAt'>[];
}

export interface BiometricVerifyAttempt {
  userId: string;
  method: BiometricVerifyResult['method'];
  deviceFingerprint?: string;
}

export class BiometricService {
  private samples: BiometricSample[] = [...BIOMETRIC_SAMPLES];
  private enrollments: BiometricEnrollment[] = [];
  private records: BiometricVerifyResult[] = [];

  async enroll(params: BiometricEnrollParams): Promise<BiometricEnrollment> {
    await randomDelay();
    const required = REQUIRED_ENROLLMENT_SAMPLES[params.modality];
    if (params.samples.length < required) {
      throw new Error(
        `${params.modality} 至少需要 ${required} 个样本, 当前 ${params.samples.length}`,
      );
    }
    const enrichedSamples: BiometricSample[] = params.samples.map((s) => ({
      ...s,
      sampleId: uuid('bs'),
      capturedAt: nowIso(),
    }));
    this.samples.push(...enrichedSamples);
    const enrollment: BiometricEnrollment = {
      userId: params.userId,
      modality: params.modality,
      samples: enrichedSamples,
      enrolledAt: nowIso(),
      isComplete: true,
      requiredSamples: required,
      templateId: uuid('tpl'),
    };
    this.enrollments.push(enrollment);
    return enrollment;
  }

  async verify(attempt: BiometricVerifyAttempt): Promise<BiometricVerifyResult> {
    await randomDelay();
    const success = Math.random() > 0.08;
    const confidence = success
      ? 0.85 + Math.random() * 0.14
      : 0.3 + Math.random() * 0.3;
    const result: BiometricVerifyResult = {
      id: uuid('bio'),
      userId: attempt.userId,
      method: attempt.method,
      success,
      confidence,
      verifiedAt: nowIso(),
      deviceFingerprint: attempt.deviceFingerprint ?? 'mock-device',
      livenessScore: success
        ? 0.85 + Math.random() * 0.14
        : 0.2 + Math.random() * 0.3,
      ...(success
        ? {}
        : {
            errorMessage:
              attempt.method === 'face'
                ? '活体检测未通过'
                : attempt.method === 'fingerprint'
                  ? '指纹匹配失败'
                  : attempt.method === 'voice'
                    ? '声纹相似度不足'
                    : '虹膜识别失败',
          }),
    };
    this.records.push(result);
    return result;
  }

  async verifyMultiModal(attempt: BiometricMultiModalAttempt): Promise<BiometricMultiModalResult> {
    await randomDelay();
    if (attempt.modalities.length === 0) {
      throw new Error('至少选择一种生物识别模态');
    }
    const modalityScores: Partial<Record<BiometricModality, number>> = {};
    let total = 0;
    for (const modality of attempt.modalities) {
      const sample = attempt.samples.find((s) => s.modality === modality);
      const baseQuality = sample?.qualityScore ?? 0.9;
      const noise = (Math.random() - 0.5) * 0.05;
      const threshold = BIOMETRIC_MODALITY_THRESHOLDS[modality];
      const score = Math.min(1, Math.max(0, baseQuality + noise));
      modalityScores[modality] = Number(score.toFixed(4));
      total += score >= threshold ? score : score * 0.4;
    }
    const fusionScore = total / attempt.modalities.length;
    const allPass = attempt.modalities.every(
      (m) => (modalityScores[m] ?? 0) >= BIOMETRIC_MODALITY_THRESHOLDS[m],
    );
    const result: BiometricMultiModalResult = {
      id: uuid('bio-mm'),
      userId: attempt.userId,
      method: attempt.modalities[0]!,
      success: allPass,
      confidence: Number(fusionScore.toFixed(4)),
      verifiedAt: nowIso(),
      deviceFingerprint: attempt.deviceId,
      livenessPassed: allPass,
      modalitiesAttempted: [...attempt.modalities],
      fusionScore: Number(fusionScore.toFixed(4)),
      modalityScores,
      decision: allPass ? 'allow' : 'deny',
      ...(allPass
        ? {}
        : { errorMessage: '部分模态置信度未达标, 已拒绝' }),
    };
    this.records.push(result);
    return result;
  }

  async getEnrollment(userId: string, modality: BiometricModality): Promise<BiometricEnrollment | null> {
    await randomDelay();
    return (
      this.enrollments.find(
        (e) => e.userId === userId && e.modality === modality && e.isComplete,
      ) ?? null
    );
  }

  async listEnrollments(userId: string): Promise<BiometricEnrollment[]> {
    await randomDelay();
    return this.enrollments.filter((e) => e.userId === userId && e.isComplete);
  }

  async listSupportedModalities(): Promise<BiometricModality[]> {
    await randomDelay();
    return [...SUPPORTED_BIOMETRIC_MODALITIES];
  }

  async listSamples(userId: string): Promise<BiometricSample[]> {
    await randomDelay();
    return this.samples.filter((s) => s.userId === userId);
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
    const randomHex = (n: number): string =>
      Array.from({ length: n }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0'),
      ).join('');
    return {
      imageData: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=${randomHex(16)}`,
      capturedAt: nowIso(),
    };
  }

  async simulateFingerprintCapture(): Promise<{ minutiaeData: string; capturedAt: string }> {
    await delay(250);
    const randomHex = (n: number): string =>
      Array.from({ length: n }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0'),
      ).join('');
    return {
      minutiaeData: `fingerprint-minutiae:${randomHex(48)}`,
      capturedAt: nowIso(),
    };
  }

  async simulateVoiceCapture(): Promise<{ audioBase64: string; capturedAt: string; durationMs: number }> {
    await delay(400);
    const randomHex = (n: number): string =>
      Array.from({ length: n }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0'),
      ).join('');
    return {
      audioBase64: `audio:opus:${randomHex(32)}`,
      capturedAt: nowIso(),
      durationMs: 3000 + Math.floor(Math.random() * 2000),
    };
  }
}

export const biometricService = new BiometricService();
