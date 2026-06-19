/**
 * G005 放射RIS系统 v3.0.6.5 - 联邦学习客户端 (全 mock)
 * A5-AI-ORCH / 80 点
 *
 * 模拟联邦学习：站点本地训练 → 加密梯度上传 → 全局聚合。
 * 实际生产中需配合 SecureAggregator 使用安全聚合协议。
 */

import type {
  AIFederatedRound,
  AIFederatedUpdate,
} from '../../../types/ai/orchestrator';

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const ROUNDS: AIFederatedRound[] = [
  {
    id: 'fl-001',
    roundNumber: 1,
    status: 'completed',
    participants: 8,
    targetParticipants: 10,
    minParticipants: 5,
    startedAt: '2026-05-15T08:00:00Z',
    completedAt: '2026-05-15T18:00:00Z',
    modelVersion: 'global-v1.2',
    globalAccuracy: 0.88,
    loss: 0.245,
    privacyBudget: 1.0,
  },
  {
    id: 'fl-002',
    roundNumber: 2,
    status: 'completed',
    participants: 10,
    targetParticipants: 10,
    minParticipants: 5,
    startedAt: '2026-05-22T08:00:00Z',
    completedAt: '2026-05-22T20:00:00Z',
    modelVersion: 'global-v1.3',
    globalAccuracy: 0.9,
    loss: 0.198,
    privacyBudget: 1.8,
  },
  {
    id: 'fl-003',
    roundNumber: 3,
    status: 'aggregating',
    participants: 7,
    targetParticipants: 12,
    minParticipants: 5,
    startedAt: '2026-06-01T08:00:00Z',
    modelVersion: 'global-v1.4',
    privacyBudget: 2.5,
  },
  {
    id: 'fl-004',
    roundNumber: 4,
    status: 'recruiting',
    participants: 3,
    targetParticipants: 15,
    minParticipants: 6,
    startedAt: '2026-06-18T08:00:00Z',
    modelVersion: 'global-v1.5',
    privacyBudget: 3.0,
  },
];

const _updates: AIFederatedUpdate[] = [
  {
    id: uuid('u'),
    roundId: 'fl-002',
    siteId: 'site-A',
    siteName: '协和医院',
    sampleCount: 1280,
    encryptedGradients: 'gA==mockbase64==',
    maskedNorm: 12.4,
    uploadedAt: '2026-05-22T15:30:00Z',
    verified: true,
  },
  {
    id: uuid('u'),
    roundId: 'fl-002',
    siteId: 'site-B',
    siteName: '同济医院',
    sampleCount: 980,
    encryptedGradients: 'gB==mockbase64==',
    maskedNorm: 11.8,
    uploadedAt: '2026-05-22T16:00:00Z',
    verified: true,
  },
  {
    id: uuid('u'),
    roundId: 'fl-002',
    siteId: 'site-C',
    siteName: '湘雅医院',
    sampleCount: 1120,
    encryptedGradients: 'gC==mockbase64==',
    maskedNorm: 13.1,
    uploadedAt: '2026-05-22T16:30:00Z',
    verified: true,
  },
  {
    id: uuid('u'),
    roundId: 'fl-003',
    siteId: 'site-A',
    siteName: '协和医院',
    sampleCount: 1340,
    encryptedGradients: 'gA==mockbase64==',
    maskedNorm: 12.6,
    uploadedAt: '2026-06-01T12:00:00Z',
    verified: true,
  },
];

const SITE_ID = 'site-A';
const SITE_NAME = '本院 (协和医院)';

export class FederatedClient {
  private currentRoundId: string | null = null;
  private localEpochs = 5;
  private localBatchSize = 32;

  setLocalConfig(epochs: number, batchSize: number): void {
    this.localEpochs = epochs;
    this.localBatchSize = batchSize;
  }

  async listRounds(): Promise<AIFederatedRound[]> {
    await delay(120);
    return [...ROUNDS].sort((a, b) => b.roundNumber - a.roundNumber);
  }

  async getRound(id: string): Promise<AIFederatedRound | null> {
    await delay(60);
    return ROUNDS.find((r) => r.id === id) ?? null;
  }

  async getCurrentRound(): Promise<AIFederatedRound | null> {
    await delay(60);
    return ROUNDS.find((r) => r.status === 'aggregating' || r.status === 'recruiting') ?? null;
  }

  async joinRound(roundId: string): Promise<{ joined: boolean; roundId: string; trainingConfig: { epochs: number; batchSize: number; learningRate: number } }> {
    await delay(200);
    const r = ROUNDS.find((x) => x.id === roundId);
    if (!r) throw new Error('轮次不存在');
    if (r.status !== 'recruiting' && r.status !== 'aggregating') throw new Error('轮次已停止招募');
    r.participants += 1;
    this.currentRoundId = roundId;
    return {
      joined: true,
      roundId,
      trainingConfig: { epochs: this.localEpochs, batchSize: this.localBatchSize, learningRate: 0.001 },
    };
  }

  async leaveRound(roundId: string): Promise<{ left: boolean; roundId: string }> {
    await delay(150);
    const r = ROUNDS.find((x) => x.id === roundId);
    if (r) r.participants = Math.max(0, r.participants - 1);
    this.currentRoundId = null;
    return { left: true, roundId };
  }

  async trainLocal(roundId: string, onProgress?: (p: { epoch: number; totalEpochs: number; loss: number; accuracy: number }) => void): Promise<{ gradientsBlob: string; sampleCount: number; maskedNorm: number; loss: number; accuracy: number }> {
    const epochs = this.localEpochs;
    let loss = 0.5;
    let acc = 0.75;
    for (let i = 1; i <= epochs; i++) {
      await delay(180 + Math.random() * 220);
      loss = Math.max(0.05, loss * (0.85 + Math.random() * 0.1));
      acc = Math.min(0.99, acc + (Math.random() * 0.04));
      onProgress?.({ epoch: i, totalEpochs: epochs, loss, accuracy: acc });
    }
    const sampleCount = 800 + Math.floor(Math.random() * 600);
    const maskedNorm = 8 + Math.random() * 8;
    return {
      gradientsBlob: `enc-gr-${uuid('g')}-${Date.now().toString(36)}`,
      sampleCount,
      maskedNorm,
      loss,
      accuracy: acc,
    };
  }

  async uploadUpdate(roundId: string, update: { gradientsBlob: string; sampleCount: number; maskedNorm: number }): Promise<AIFederatedUpdate> {
    await delay(400 + Math.random() * 400);
    const u: AIFederatedUpdate = {
      id: uuid('u'),
      roundId,
      siteId: SITE_ID,
      siteName: SITE_NAME,
      sampleCount: update.sampleCount,
      encryptedGradients: update.gradientsBlob,
      maskedNorm: update.maskedNorm,
      uploadedAt: new Date().toISOString(),
      verified: true,
    };
    _updates.push(u);
    return u;
  }

  async listUpdates(roundId: string): Promise<AIFederatedUpdate[]> {
    await delay(80);
    return _updates.filter((u) => u.roundId === roundId);
  }

  async getPrivacyBudget(): Promise<{ total: number; used: number; remaining: number; perRound: number }> {
    await delay(40);
    return { total: 3.0, used: 2.5, remaining: 0.5, perRound: 0.5 };
  }

  async getSiteInfo(): Promise<{ siteId: string; siteName: string; dataVolume: number; lastActive: string }> {
    await delay(40);
    return { siteId: SITE_ID, siteName: SITE_NAME, dataVolume: 12580, lastActive: new Date().toISOString() };
  }
}

export const federatedClient = new FederatedClient();
