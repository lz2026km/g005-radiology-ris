/**
 * G005 放射RIS系统 v3.0.6.5 - 模型监控 / 漂移检测 / A/B (全 mock)
 * A5-AI-ORCH / 60 点
 */

import type {
  AIModelMetrics,
  AIModelVariant,
  AIModelABComparison,
} from '../../../types/ai/orchestrator';

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const _variants = new Map<string, AIModelVariant[]>();

function ensureVariants(algorithmId: string): AIModelVariant[] {
  if (_variants.has(algorithmId)) return _variants.get(algorithmId)!;
  const arr: AIModelVariant[] = [
    { id: `${algorithmId}-A`, algorithmId, name: 'A (control)', version: 'v2.3.0', trafficPercent: 70, enabled: true, startedAt: '2026-03-01T00:00:00Z' },
    { id: `${algorithmId}-B`, algorithmId, name: 'B (candidate)', version: 'v2.4.0-beta', trafficPercent: 30, enabled: true, startedAt: '2026-05-15T00:00:00Z' },
  ];
  _variants.set(algorithmId, arr);
  return arr;
}

function makeMetrics(algorithmId: string, variantId: string, base: number, drift: number): AIModelMetrics {
  const now = Date.now();
  const dataDistribution = Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(now - (29 - i) * 86400_000).toISOString(),
    mean: base + Math.sin(i / 3) * 0.5 + (Math.random() - 0.5) * 0.1,
    std: 1 + Math.random() * 0.3,
  }));
  const accuracyTrend = Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(now - (29 - i) * 86400_000).toISOString(),
    accuracy: base + (Math.random() - 0.5) * 0.04,
  }));
  const driftStatus: AIModelMetrics['driftStatus'] = drift < 0.1 ? 'stable' : drift < 0.25 ? 'warning' : 'critical';
  return {
    algorithmId,
    variantId,
    totalCalls: 1000 + Math.floor(Math.random() * 5000),
    successRate: 0.92 + Math.random() * 0.06,
    avgLatencyMs: 600 + Math.random() * 200,
    p50LatencyMs: 500 + Math.random() * 100,
    p95LatencyMs: 1500 + Math.random() * 500,
    p99LatencyMs: 3000 + Math.random() * 1000,
    driftScore: drift,
    driftStatus,
    dataDistribution,
    accuracyTrend,
    lastEvaluatedAt: new Date().toISOString(),
  };
}

export class ModelMonitor {
  async getVariants(algorithmId: string): Promise<AIModelVariant[]> {
    await delay(40);
    return ensureVariants(algorithmId);
  }

  async getMetrics(algorithmId: string, variantId?: string): Promise<AIModelMetrics[]> {
    await delay(80);
    const variants = ensureVariants(algorithmId);
    const targets = variantId ? variants.filter((v) => v.id === variantId) : variants;
    return targets.map((v, i) => makeMetrics(algorithmId, v.id, 0.88 + i * 0.02, 0.05 + i * 0.08));
  }

  async setVariantTraffic(algorithmId: string, variantId: string, percent: number): Promise<AIModelVariant> {
    await delay(60);
    const arr = ensureVariants(algorithmId);
    const v = arr.find((x) => x.id === variantId);
    if (!v) throw new Error('变体不存在');
    v.trafficPercent = percent;
    return v;
  }

  async enableVariant(algorithmId: string, variantId: string, enabled: boolean): Promise<AIModelVariant> {
    await delay(60);
    const arr = ensureVariants(algorithmId);
    const v = arr.find((x) => x.id === variantId);
    if (!v) throw new Error('变体不存在');
    v.enabled = enabled;
    return v;
  }

  async compareVariants(algorithmId: string, variantAId: string, variantBId: string): Promise<AIModelABComparison> {
    await delay(200);
    const variants = ensureVariants(algorithmId);
    const a = variants.find((v) => v.id === variantAId);
    const b = variants.find((v) => v.id === variantBId);
    if (!a || !b) throw new Error('变体不存在');
    const mA = (await this.getMetrics(algorithmId, variantAId))[0]!;
    const mB = (await this.getMetrics(algorithmId, variantBId))[0]!;
    const scoreA = mA.successRate - mA.driftScore * 0.5;
    const scoreB = mB.successRate - mB.driftScore * 0.5;
    const winner: 'A' | 'B' | 'tie' = scoreA > scoreB + 0.02 ? 'A' : scoreB > scoreA + 0.02 ? 'B' : 'tie';
    return {
      variantA: a,
      variantB: b,
      metricsA: mA,
      metricsB: mB,
      winner,
      statisticalSignificance: 0.85 + Math.random() * 0.1,
      recommendation: winner === 'A' ? '保持 A 为主流量' : winner === 'B' ? '建议将 B 提升为主流量' : '二者无显著差异，继续观察',
      generatedAt: new Date().toISOString(),
    };
  }

  async detectDrift(algorithmId: string, variantId: string): Promise<{ driftScore: number; driftStatus: 'stable' | 'warning' | 'critical'; features: { name: string; drift: number }[] }> {
    await delay(100);
    return {
      driftScore: 0.05 + Math.random() * 0.2,
      driftStatus: 'stable',
      features: [
        { name: '年龄分布', drift: 0.05 + Math.random() * 0.1 },
        { name: '性别分布', drift: 0.02 + Math.random() * 0.05 },
        { name: '扫描参数', drift: 0.08 + Math.random() * 0.15 },
        { name: '病灶尺寸', drift: 0.06 + Math.random() * 0.12 },
      ],
    };
  }
}

export const modelMonitor = new ModelMonitor();
