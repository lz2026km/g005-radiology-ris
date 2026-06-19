/**
 * G005 放射RIS系统 v3.0.6.5 - 安全聚合服务器 (全 mock)
 * A5-AI-ORCH / 60 点
 *
 * 模拟安全聚合协议：
 *  1. 收集 n 个站点的加密梯度
 *  2. Shamir 秘密分享掩码
 *  3. 验证阈值 ≥ k 才聚合
 *  4. 加噪 + 输出全局梯度
 */

import type {
  AISecureAggregation,
  AIFederatedUpdate,
  AIFederatedRound,
} from '../../../types/ai/orchestrator';
import { federatedClient } from './FederatedClient';

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const _aggregations: AISecureAggregation[] = [
  {
    id: 'agg-001',
    roundId: 'fl-001',
    participants: 8,
    threshold: 5,
    status: 'aggregated',
    aggregatedAt: '2026-05-15T18:00:00Z',
    noiseScale: 0.01,
    privacyEpsilon: 1.0,
  },
  {
    id: 'agg-002',
    roundId: 'fl-002',
    participants: 10,
    threshold: 5,
    status: 'aggregated',
    aggregatedAt: '2026-05-22T20:00:00Z',
    noiseScale: 0.012,
    privacyEpsilon: 0.8,
  },
  {
    id: 'agg-003',
    roundId: 'fl-003',
    participants: 7,
    threshold: 5,
    status: 'verifying',
    noiseScale: 0.015,
    privacyEpsilon: 0.7,
  },
];

export class SecureAggregator {
  async startAggregation(round: AIFederatedRound, threshold = 5): Promise<AISecureAggregation> {
    await delay(150);
    if (round.participants < threshold) {
      throw new Error(`参与方 ${round.participants} 低于阈值 ${threshold}`);
    }
    const agg: AISecureAggregation = {
      id: uuid('agg'),
      roundId: round.id,
      participants: round.participants,
      threshold,
      status: 'collecting',
      noiseScale: 0.01 + Math.random() * 0.01,
      privacyEpsilon: 0.5 + Math.random() * 0.5,
    };
    _aggregations.push(agg);
    return agg;
  }

  async verifyShares(updates: AIFederatedUpdate[]): Promise<{ verified: number; failed: number; verificationLog: { siteId: string; status: 'ok' | 'invalid' | 'timeout' }[] }> {
    await delay(300);
    const log = updates.map((u) => ({
      siteId: u.siteId,
      status: (u.verified ? 'ok' : 'invalid') as 'ok' | 'invalid' | 'timeout',
    }));
    return { verified: log.filter((l) => l.status === 'ok').length, failed: log.filter((l) => l.status !== 'ok').length, verificationLog: log };
  }

  async aggregate(updates: AIFederatedUpdate[], noiseScale: number, privacyEpsilon: number): Promise<{ globalGradient: string; noiseAdded: number; privacySpent: number; aggregatedAt: string }> {
    if (updates.length === 0) throw new Error('无更新可聚合');
    await delay(800 + Math.random() * 600);
    const totalSamples = updates.reduce((s, u) => s + u.sampleCount, 0);
    const normSum = updates.reduce((s, u) => s + u.maskedNorm * u.sampleCount, 0);
    const meanNorm = normSum / totalSamples;
    return {
      globalGradient: `global-grad-${uuid('gg')}-${Date.now().toString(36)}`,
      noiseAdded: noiseScale * meanNorm,
      privacySpent: privacyEpsilon,
      aggregatedAt: new Date().toISOString(),
    };
  }

  async listAggregations(): Promise<AISecureAggregation[]> {
    await delay(80);
    return [..._aggregations];
  }

  async getAggregation(roundId: string): Promise<AISecureAggregation | null> {
    await delay(40);
    return _aggregations.find((a) => a.roundId === roundId) ?? null;
  }

  async runFullPipeline(roundId: string): Promise<{ ok: boolean; aggregation?: AISecureAggregation; result?: { globalGradient: string; noiseAdded: number; privacySpent: number }; error?: string }> {
    const round = await federatedClient.getRound(roundId);
    if (!round) return { ok: false, error: '轮次不存在' };
    if (round.participants < round.minParticipants) return { ok: false, error: '参与者不足' };

    const agg = await this.startAggregation(round, round.minParticipants);
    const updates = await federatedClient.listUpdates(roundId);
    const verification = await this.verifyShares(updates);
    if (verification.verified < round.minParticipants) {
      agg.status = 'failed';
      return { ok: false, aggregation: agg, error: '验证失败，参与方不足' };
    }
    agg.status = 'aggregated';
    agg.aggregatedAt = new Date().toISOString();
    const result = await this.aggregate(updates, agg.noiseScale, agg.privacyEpsilon);
    return { ok: true, aggregation: agg, result };
  }

  async simulateDifferentialPrivacy(epsilon: number, sensitivity: number): Promise<{ noiseSigma: number; compositionBound: number }> {
    await delay(60);
    const noiseSigma = (sensitivity * Math.sqrt(2 * Math.log(1.25))) / epsilon;
    const compositionBound = epsilon * Math.sqrt(2 * Math.log(1 / 0.001));
    return { noiseSigma, compositionBound };
  }
}

export const secureAggregator = new SecureAggregator();
