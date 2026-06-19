/**
 * G005 放射RIS系统 v3.0.6.5 - 说话人识别 (声纹 mock MFCC)
 * 30 升级点:声纹注册 / 余弦相似度 / 活体检测 / 阈值决策
 */

import type { SpeakerProfile, SpeakerMatchResult, SpeakerEmbedding, SpeakerEnrollmentRequest } from '../../../types/voice';

const ACCEPT_THRESHOLD = 0.78;
const REJECT_THRESHOLD = 0.55;
const COSINE_ACCEPT = 0.82;

function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function euclidean(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < len; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    s += d * d;
  }
  return Math.sqrt(s);
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function newId(): string {
  return 'emb-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 9999).toString(36);
}

function extractMfcc(_audio: ArrayBuffer, sampleCount: number): { mfcc: number[]; pitch: number; energy: number } {
  const mfcc: number[] = [];
  for (let i = 0; i < 13; i++) {
    mfcc.push(Math.sin(sampleCount * 0.13 + i * 0.71) * 0.5 + Math.cos(sampleCount + i) * 0.3);
  }
  const pitch = 100 + Math.sin(sampleCount * 0.07) * 50;
  const energy = 0.4 + Math.abs(Math.cos(sampleCount * 0.05)) * 0.5;
  return { mfcc, pitch, energy };
}

export class SpeakerId {
  private liveProfiles: SpeakerProfile[] = [];
  private livenessEnabled = true;

  constructor(initialProfiles: SpeakerProfile[] = []) {
    this.liveProfiles = [...initialProfiles];
  }

  // ---------- 公共 API ----------

  async enroll(req: SpeakerEnrollmentRequest): Promise<SpeakerProfile> {
    if (req.samples.length < 3) throw new Error('At least 3 audio samples required for enrollment');
    await delay(300);

    const samples: SpeakerEmbedding[] = req.samples.map((s, i) => {
      const { mfcc, pitch, energy } = extractMfcc(s.audio, i + 1);
      return {
        id: newId(),
        speakerId: req.userId,
        mfcc,
        pitch,
        energy,
        durationMs: s.durationMs,
        capturedAt: new Date().toISOString(),
        quality: 0.85 + Math.random() * 0.1,
      };
    });

    const mfccMean = average(samples.map((s) => s.mfcc));
    const mfccStd = std(samples.map((s) => s.mfcc));
    const pitchMean = samples.reduce((a, b) => a + b.pitch, 0) / samples.length;
    const pitchStd = Math.sqrt(samples.reduce((a, b) => a + (b.pitch - pitchMean) ** 2, 0) / samples.length);
    const speechRate = 200 + Math.random() * 100;

    const profile: SpeakerProfile = {
      id: 'spk-' + Date.now().toString(36),
      userId: req.userId,
      userName: req.userName,
      role: 'unknown',
      enrollmentSamples: samples,
      embeddingDimension: 13,
      enrolledAt: new Date().toISOString(),
      totalVerifications: 0,
      successRate: 0,
      mfccMean,
      mfccStd,
      pitchMean,
      pitchStd,
      speechRate,
      active: true,
    };
    this.liveProfiles.push(profile);
    return profile;
  }

  async identify(audio: ArrayBuffer, options: { topK?: number; threshold?: number } = {}): Promise<SpeakerMatchResult> {
    const topK = options.topK ?? 3;
    const threshold = options.threshold ?? ACCEPT_THRESHOLD;
    await delay(180);
    const { mfcc, pitch, energy } = extractMfcc(audio, Math.floor(Math.random() * 1000));

    const candidates: { profile: SpeakerProfile; confidence: number; distance: number }[] = this.liveProfiles
      .filter((p) => p.active)
      .map((p) => {
        const cos = cosineSimilarity(mfcc, p.mfccMean);
        const dist = euclidean(mfcc, p.mfccMean);
        const pitchDelta = Math.abs(pitch - p.pitchMean) / (p.pitchStd + 1);
        const score = cos * 0.7 - pitchDelta * 0.1 - Math.min(dist, 1) * 0.2;
        return { profile: p, confidence: Math.max(0, Math.min(1, score)), distance: dist };
      })
      .sort((a, b) => b.confidence - a.confidence);

    const top = candidates[0];
    const livenessScore = this.livenessEnabled ? Math.min(1, 0.7 + energy * 0.3) : 1;

    if (!top || top.confidence < REJECT_THRESHOLD) {
      return {
        matched: false,
        confidence: top?.confidence ?? 0,
        distance: top?.distance ?? 1,
        livenessScore,
        decision: 'reject',
        alternatives: candidates.slice(0, topK).map((c) => ({ speakerId: c.profile.id, userName: c.profile.userName, confidence: c.confidence })),
        threshold,
        capturedAt: new Date().toISOString(),
      };
    }

    const decision: SpeakerMatchResult['decision'] = top.confidence >= threshold ? 'accept' : 'uncertain';
    return {
      matched: decision === 'accept',
      speakerId: decision === 'accept' ? top.profile.id : undefined,
      userId: decision === 'accept' ? top.profile.userId : undefined,
      userName: decision === 'accept' ? top.profile.userName : undefined,
      confidence: top.confidence,
      distance: top.distance,
      livenessScore,
      decision,
      alternatives: candidates.slice(0, topK).map((c) => ({ speakerId: c.profile.id, userName: c.profile.userName, confidence: c.confidence })),
      threshold,
      capturedAt: new Date().toISOString(),
    };
  }

  async verify(userId: string, audio: ArrayBuffer): Promise<SpeakerMatchResult> {
    const profile = this.liveProfiles.find((p) => p.userId === userId);
    if (!profile) {
      return {
        matched: false,
        confidence: 0,
        distance: 1,
        livenessScore: 0,
        decision: 'reject',
        alternatives: [],
        threshold: ACCEPT_THRESHOLD,
        capturedAt: new Date().toISOString(),
      };
    }
    const result = await this.identify(audio);
    if (result.matched) {
      profile.totalVerifications += 1;
      profile.lastVerifiedAt = new Date().toISOString();
      if (result.matched) {
        const ok = profile.totalVerifications;
        profile.successRate = (profile.successRate * (ok - 1) + 1) / ok;
      }
    }
    return result;
  }

  getProfile(userId: string): SpeakerProfile | undefined {
    return this.liveProfiles.find((p) => p.userId === userId);
  }

  listProfiles(): SpeakerProfile[] {
    return [...this.liveProfiles];
  }

  removeProfile(userId: string): boolean {
    const idx = this.liveProfiles.findIndex((p) => p.userId === userId);
    if (idx < 0) return false;
    this.liveProfiles.splice(idx, 1);
    return true;
  }

  setLivenessEnabled(enabled: boolean): void {
    this.livenessEnabled = enabled;
  }

  getStats(): { total: number; avgSuccessRate: number; totalVerifications: number } {
    const total = this.liveProfiles.length;
    const totalVerifications = this.liveProfiles.reduce((a, b) => a + b.totalVerifications, 0);
    const avgSuccessRate = total === 0 ? 0 : this.liveProfiles.reduce((a, b) => a + b.successRate, 0) / total;
    return { total, avgSuccessRate, totalVerifications };
  }
}

function average(arr: number[][]): number[] {
  if (arr.length === 0) return [];
  const len = arr[0]?.length ?? 0;
  const out: number[] = new Array(len).fill(0);
  for (const a of arr) {
    for (let i = 0; i < len; i++) out[i] = (out[i] ?? 0) + (a[i] ?? 0);
  }
  return out.map((v) => v / arr.length);
}

function std(arr: number[][]): number[] {
  if (arr.length === 0) return [];
  const mean = average(arr);
  const len = mean.length;
  const out: number[] = new Array(len).fill(0);
  for (const a of arr) {
    for (let i = 0; i < len; i++) {
      const d = (a[i] ?? 0) - (mean[i] ?? 0);
      out[i] = (out[i] ?? 0) + d * d;
    }
  }
  return out.map((v) => Math.sqrt(v / arr.length));
}

export const speakerId = new SpeakerId();
export { ACCEPT_THRESHOLD, REJECT_THRESHOLD, COSINE_ACCEPT };
