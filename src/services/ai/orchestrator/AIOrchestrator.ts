/**
 * G005 放射RIS系统 v3.0.6.5 - AI 编排引擎 (全 mock)
 * A5-AI-ORCH / 150 点
 *
 * 算法路由：根据 study 上下文（部位/模态/优先级）匹配最佳算法。
 * 15+ 内置算法 mock，支持评分与拒绝。
 */

import type {
  AIAlgorithm,
  AIAlgorithmType,
  AIAlgorithmMatch,
  AIRouteRequest,
  AIRouteDecision,
} from '../../../types/ai/orchestrator';
import { AI_MARKETPLACE_ALGORITHMS } from '../../../data/aiMarketplace';

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface RoutingPolicy {
  id: string;
  name: string;
  rule: (req: AIRouteRequest, algo: AIAlgorithm) => { match: number; reason: string; reject?: string };
}

const DEFAULT_POLICIES: RoutingPolicy[] = [
  {
    id: 'modality-match',
    name: '模态匹配',
    rule: (req, algo) => {
      if (algo.modality.includes(req.modality)) {
        return { match: 0.25, reason: `模态 ${req.modality} 匹配` };
      }
      return { match: 0, reason: '模态不匹配', reject: `算法不支持 ${req.modality}` };
    },
  },
  {
    id: 'body-part',
    name: '部位匹配',
    rule: (req, algo) => {
      const partLower = req.bodyPart.toLowerCase();
      const hit = algo.bodyParts.some((b) => partLower.includes(b.toLowerCase()) || b.toLowerCase().includes(partLower));
      if (hit) return { match: 0.2, reason: `部位 ${req.bodyPart} 匹配` };
      return { match: 0.05, reason: '部位模糊匹配' };
    },
  },
  {
    id: 'priority-emergent',
    name: '急诊优先',
    rule: (req, algo) => {
      if (req.priority === 'stat' || req.priority === 'urgent') {
        if (algo.type === 'triage' && algo.avgLatencyMs < 1000) {
          return { match: 0.15, reason: '急诊场景 + 低延迟分诊算法' };
        }
        if (algo.deployment === 'edge' || algo.deployment === 'on-premise') {
          return { match: 0.08, reason: '急诊场景 + 本地部署' };
        }
      }
      return { match: 0, reason: '' };
    },
  },
  {
    id: 'accuracy-bonus',
    name: '精度加分',
    rule: (_req, algo) => {
      if (algo.accuracy >= 0.95) return { match: 0.1, reason: `高精度 ${(algo.accuracy * 100).toFixed(0)}%` };
      if (algo.accuracy >= 0.9) return { match: 0.06, reason: '高准确率' };
      return { match: 0.02, reason: '一般准确率' };
    },
  },
  {
    id: 'status-bonus',
    name: '稳定性加分',
    rule: (_req, algo) => {
      if (algo.status === 'stable') return { match: 0.05, reason: '已稳定' };
      if (algo.status === 'beta') return { match: 0.02, reason: 'Beta' };
      return { match: 0, reason: '实验性算法', reject: '算法处于实验阶段' };
    },
  },
  {
    id: 'regulatory',
    name: '法规准入',
    rule: (_req, algo) => {
      if (algo.regulatory.nmpa) return { match: 0.05, reason: 'NMPA 注册' };
      if (algo.regulatory.fda) return { match: 0.03, reason: 'FDA 批准' };
      return { match: 0, reason: '无监管认证' };
    },
  },
  {
    id: 'rating-bonus',
    name: '评分加分',
    rule: (_req, algo) => {
      if (algo.ratingAvg >= 4.5) return { match: 0.05, reason: `高评分 ${algo.ratingAvg}` };
      if (algo.ratingAvg >= 4.0) return { match: 0.03, reason: '良好评分' };
      return { match: 0, reason: '评分一般' };
    },
  },
  {
    id: 'contraindication',
    name: '禁忌检查',
    rule: (req, algo) => {
      if (algo.contraindications.length === 0) return { match: 0, reason: '' };
      const patientStr = req.patient ? `${req.patient.age}|${req.patient.gender}|${req.patient.pregnancy ? 'P' : ''}` : '';
      const historyStr = req.clinicalHistory + ' ' + patientStr;
      for (const ci of algo.contraindications) {
        if (historyStr.includes(ci)) {
          return { match: 0, reason: '禁忌', reject: `存在禁忌: ${ci}` };
        }
        if (ci.includes('孕妇') && req.patient?.pregnancy) {
          return { match: 0, reason: '孕妇', reject: '孕妇禁用' };
        }
        if (ci.includes('儿童') && req.patient && req.patient.age < 18) {
          return { match: 0, reason: '儿童', reject: '儿童禁用' };
        }
      }
      return { match: 0, reason: '' };
    },
  },
  {
    id: 'installed-pref',
    name: '已安装优先',
    rule: (_req, algo) => (algo.installed ? { match: 0.08, reason: '已安装' } : { match: 0, reason: '未安装' }),
  },
  {
    id: 'tag-overlap',
    name: '标签重叠',
    rule: (req, algo) => {
      if (!req.tags || req.tags.length === 0) return { match: 0, reason: '' };
      const overlap = req.tags.filter((t) => algo.tags.includes(t)).length;
      if (overlap > 0) return { match: Math.min(0.1, overlap * 0.04), reason: `标签重叠 ${overlap}` };
      return { match: 0, reason: '' };
    },
  },
];

export class AIOrchestrator {
  private policies: RoutingPolicy[];
  private customAlgorithms: AIAlgorithm[] = [];

  constructor(policies: RoutingPolicy[] = DEFAULT_POLICIES) {
    this.policies = policies;
  }

  getAlgorithms(): AIAlgorithm[] {
    return [...AI_MARKETPLACE_ALGORITHMS, ...this.customAlgorithms];
  }

  getInstalledAlgorithms(): AIAlgorithm[] {
    return this.getAlgorithms().filter((a) => a.installed);
  }

  getAlgorithmsByType(type: AIAlgorithmType): AIAlgorithm[] {
    return this.getAlgorithms().filter((a) => a.type === type);
  }

  getAlgorithm(id: string): AIAlgorithm | null {
    return this.getAlgorithms().find((a) => a.id === id) ?? null;
  }

  scoreMatch(algo: AIAlgorithm, context: AIRouteRequest): AIAlgorithmMatch {
    const reasons: string[] = [];
    const warnings: string[] = [];
    let total = 0;

    for (const p of this.policies) {
      const r = p.rule(context, algo);
      total += r.match;
      if (r.match > 0 && r.reason) reasons.push(`${p.name}: ${r.reason}`);
      if (r.reject) warnings.push(`[${p.name}] ${r.reject}`);
    }

    if (algo.avgLatencyMs > 5000) warnings.push('推理延迟较高');
    if (algo.status === 'beta') warnings.push('Beta 阶段算法');
    if (algo.status === 'experimental') warnings.push('实验性算法');
    if (algo.status === 'deprecated') warnings.push('算法已弃用');

    return {
      algorithm: algo,
      score: Math.min(1, total),
      reasons,
      warnings,
    };
  }

  rankAlgorithms(context: AIRouteRequest, topN = 5): AIAlgorithmMatch[] {
    const all = this.getAlgorithms();
    const matches = all
      .map((a) => this.scoreMatch(a, context))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);
    return matches.slice(0, topN);
  }

  async routeStudy(study: AIRouteRequest): Promise<AIRouteDecision> {
    await delay(80 + Math.random() * 120);

    const ranked = this.rankAlgorithms(study, 5);
    const rejected: { algorithmId: string; reason: string }[] = [];
    for (const a of this.getAlgorithms()) {
      const m = this.scoreMatch(a, study);
      if (m.warnings.length > 0 && m.score < 0.3) {
        for (const w of m.warnings) {
          if (w.includes('禁忌') || w.includes('不匹配') || w.includes('已弃用')) {
            rejected.push({ algorithmId: a.id, reason: w });
          }
        }
      }
    }

    if (ranked.length === 0) {
      return {
        studyId: study.studyId,
        primary: { algorithmId: 'algo-report-draft', confidence: 0.3, reason: '无可用算法，回退到报告生成' },
        secondary: [],
        rejected,
        estimatedLatencyMs: 3500,
        policy: 'fallback',
        decidedAt: new Date().toISOString(),
      };
    }

    const primary = ranked[0]!;
    const secondary = ranked.slice(1, 3).map((m) => ({
      algorithmId: m.algorithm.id,
      confidence: m.score,
      reason: m.reasons[0] ?? '次优匹配',
    }));

    return {
      studyId: study.studyId,
      primary: { algorithmId: primary.algorithm.id, confidence: primary.score, reason: primary.reasons[0] ?? '最佳匹配' },
      secondary,
      rejected,
      estimatedLatencyMs: primary.algorithm.avgLatencyMs,
      policy: study.priority === 'stat' ? 'emergent' : 'standard',
      decidedAt: new Date().toISOString(),
    };
  }

  registerCustomAlgorithm(algo: Omit<AIAlgorithm, 'id'>): AIAlgorithm {
    const a: AIAlgorithm = { ...algo, id: `algo-custom-${uuid('a')}` };
    this.customAlgorithms.push(a);
    return a;
  }

  setPolicyEnabled(policyId: string, enabled: boolean): void {
    if (!enabled) {
      this.policies = this.policies.filter((p) => p.id !== policyId);
    }
  }

  getPolicyInfo(): { id: string; name: string }[] {
    return this.policies.map((p) => ({ id: p.id, name: p.name }));
  }

  async simulateInference(algorithmId: string, input: Record<string, unknown>): Promise<{ algorithmId: string; result: unknown; latencyMs: number }> {
    const algo = this.getAlgorithm(algorithmId);
    if (!algo) throw new Error('算法不存在');
    const latency = algo.avgLatencyMs + Math.random() * 200 - 100;
    await delay(Math.min(200, latency));
    return {
      algorithmId,
      result: { mock: true, input, algorithm: algo.name, timestamp: new Date().toISOString() },
      latencyMs: latency,
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();
