/**
 * G005 放射RIS系统 v3.0.6.5 - AI 反馈收集 (全 mock)
 * A5-AI-ORCH / 60 点
 *
 * 收集医师对 AI 输出的反馈（接受/拒绝/修改），用于 RLHF 训练。
 */

import type {
  AIFeedbackEntry,
  AIFeedbackAggregate,
} from '../../../types/ai/orchestrator';

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const _entries: AIFeedbackEntry[] = [];

export interface RecordFeedbackParams {
  algorithmId: string;
  algorithmName: string;
  studyId?: string;
  reportId?: string;
  userId: string;
  userName: string;
  verdict: 'accept' | 'reject' | 'modify';
  correction?: string;
  originalOutput?: string;
  rating: number;
  tags?: string[];
}

export class FeedbackCollector {
  async record(p: RecordFeedbackParams): Promise<AIFeedbackEntry> {
    await delay(80);
    const e: AIFeedbackEntry = {
      id: uuid('fb'),
      algorithmId: p.algorithmId,
      algorithmName: p.algorithmName,
      studyId: p.studyId,
      reportId: p.reportId,
      userId: p.userId,
      userName: p.userName,
      verdict: p.verdict,
      correction: p.correction,
      originalOutput: p.originalOutput,
      rating: p.rating,
      tags: p.tags ?? [],
      createdAt: new Date().toISOString(),
    };
    _entries.push(e);
    return e;
  }

  async list(algorithmId?: string): Promise<AIFeedbackEntry[]> {
    await delay(60);
    return algorithmId ? _entries.filter((e) => e.algorithmId === algorithmId) : [..._entries];
  }

  async aggregate(algorithmId: string): Promise<AIFeedbackAggregate> {
    await delay(150);
    const items = _entries.filter((e) => e.algorithmId === algorithmId);
    const total = items.length;
    if (total === 0) {
      return {
        algorithmId,
        total: 0,
        acceptRate: 0,
        rejectRate: 0,
        modifyRate: 0,
        avgRating: 0,
        commonCorrections: [],
        byDay: [],
      };
    }
    const accept = items.filter((e) => e.verdict === 'accept').length;
    const reject = items.filter((e) => e.verdict === 'reject').length;
    const modify = items.filter((e) => e.verdict === 'modify').length;
    const tagCounts = new Map<string, number>();
    items.forEach((e) => e.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)));
    const common = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const byDayMap = new Map<string, { count: number; accept: number }>();
    items.forEach((e) => {
      const day = e.createdAt.slice(0, 10);
      const prev = byDayMap.get(day) ?? { count: 0, accept: 0 };
      prev.count += 1;
      if (e.verdict === 'accept') prev.accept += 1;
      byDayMap.set(day, prev);
    });
    const byDay = Array.from(byDayMap.entries())
      .map(([date, v]) => ({ date, count: v.count, acceptRate: v.count > 0 ? v.accept / v.count : 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      algorithmId,
      total,
      acceptRate: accept / total,
      rejectRate: reject / total,
      modifyRate: modify / total,
      avgRating: items.reduce((s, e) => s + e.rating, 0) / total,
      commonCorrections: common,
      byDay,
    };
  }

  async aggregateAll(): Promise<AIFeedbackAggregate[]> {
    await delay(200);
    const algoIds = Array.from(new Set(_entries.map((e) => e.algorithmId)));
    const out: AIFeedbackAggregate[] = [];
    for (const id of algoIds) out.push(await this.aggregate(id));
    return out;
  }

  async export(algorithmId: string, format: 'json' | 'csv'): Promise<{ url: string; count: number; format: string }> {
    await delay(300);
    const items = _entries.filter((e) => e.algorithmId === algorithmId);
    return { url: `mock://feedback/${algorithmId}.${format}`, count: items.length, format };
  }
}

export const feedbackCollector = new FeedbackCollector();
