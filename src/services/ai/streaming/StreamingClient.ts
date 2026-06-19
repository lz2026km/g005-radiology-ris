/**
 * G005 放射RIS系统 v3.0.6.5 - SSE/EventSource 流式客户端 (全 mock)
 * A5-AI-ORCH / 60 点
 *
 * 支持：subscribe(taskId) / onChunk / cancel
 * 真实环境用 EventSource，mock 环境使用定时器模拟 chunk 流。
 */

import type { AIStreamEvent, AIStreamSubscription } from '../../../types/ai/orchestrator';

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const _subscriptions = new Map<string, AIStreamSubscription>();
const _timers = new Map<string, ReturnType<typeof setTimeout>>();

function emitEvent(taskId: string, ev: AIStreamEvent): void {
  const sub = _subscriptions.get(taskId);
  if (!sub) return;
  sub.chunks.push(ev);
  if (ev.type === 'complete' || ev.type === 'error' || ev.type === 'cancelled') {
    sub.status = ev.type === 'complete' ? 'completed' : ev.type === 'cancelled' ? 'cancelled' : 'error';
    sub.completedAt = ev.timestamp;
  }
}

function simulateStream(taskId: string, totalChunks: number, totalContent: string): void {
  const chunkSize = Math.max(1, Math.floor(totalContent.length / totalChunks));
  let i = 0;
  let accumulated = '';
  emitEvent(taskId, { id: uuid('ev'), taskId, type: 'start', timestamp: new Date().toISOString() });

  const interval = setInterval(() => {
    const sub = _subscriptions.get(taskId);
    if (!sub || sub.status === 'cancelled') {
      clearInterval(interval);
      _timers.delete(taskId);
      return;
    }
    i += 1;
    const slice = totalContent.slice((i - 1) * chunkSize, i * chunkSize);
    accumulated += slice;
    emitEvent(taskId, {
      id: uuid('ev'),
      taskId,
      type: 'chunk',
      timestamp: new Date().toISOString(),
      data: slice,
      progress: Math.min(99, (i / totalChunks) * 100),
    });
    if (i >= totalChunks) {
      clearInterval(interval);
      _timers.delete(taskId);
      emitEvent(taskId, {
        id: uuid('ev'),
        taskId,
        type: 'complete',
        timestamp: new Date().toISOString(),
        progress: 100,
        usage: { prompt: 120, completion: accumulated.length, total: 120 + accumulated.length },
      });
    }
  }, 120);

  _timers.set(taskId, interval);
}

export class StreamingClient {
  subscribe(taskId?: string, mockContent?: string): AIStreamSubscription {
    const id = taskId ?? uuid('task');
    const sub: AIStreamSubscription = {
      taskId: id,
      status: 'pending',
      chunks: [],
      startedAt: new Date().toISOString(),
    };
    _subscriptions.set(id, sub);
    const content = mockContent ?? '这是一段模拟的流式输出内容，分块发送。'.repeat(20);
    const chunks = 10 + Math.floor(Math.random() * 15);
    setTimeout(() => simulateStream(id, chunks, content), 60);
    return sub;
  }

  onChunk(taskId: string, cb: (ev: AIStreamEvent) => void): () => void {
    const interval = setInterval(() => {
      const sub = _subscriptions.get(taskId);
      if (!sub) return;
      if (sub.chunks.length > 0) {
        const lastSeen = (cb as unknown as { __lastLen?: number }).__lastLen ?? 0;
        for (let i = lastSeen; i < sub.chunks.length; i++) cb(sub.chunks[i]!);
        (cb as unknown as { __lastLen?: number }).__lastLen = sub.chunks.length;
      }
      if (sub.status === 'completed' || sub.status === 'cancelled' || sub.status === 'error') {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }

  cancel(taskId: string): boolean {
    const sub = _subscriptions.get(taskId);
    if (!sub) return false;
    if (sub.status === 'completed' || sub.status === 'cancelled') return false;
    sub.status = 'cancelled';
    sub.completedAt = new Date().toISOString();
    const t = _timers.get(taskId);
    if (t) {
      clearInterval(t);
      _timers.delete(taskId);
    }
    emitEvent(taskId, { id: uuid('ev'), taskId, type: 'cancelled', timestamp: new Date().toISOString() });
    return true;
  }

  getSubscription(taskId: string): AIStreamSubscription | null {
    return _subscriptions.get(taskId) ?? null;
  }

  listActive(): AIStreamSubscription[] {
    return Array.from(_subscriptions.values()).filter((s) => s.status === 'pending' || s.status === 'active');
  }

  clearCompleted(olderThanMs = 60000): number {
    const now = Date.now();
    let count = 0;
    for (const [id, sub] of _subscriptions.entries()) {
      if (sub.completedAt && now - new Date(sub.completedAt).getTime() > olderThanMs) {
        _subscriptions.delete(id);
        count += 1;
      }
    }
    return count;
  }
}

export const streamingClient = new StreamingClient();
