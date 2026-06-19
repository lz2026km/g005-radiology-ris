import type { RealtimeTick, RealtimeDashboardConfig, RealtimeListener, Period, TimeRange } from '../../../types/analytics';
import { kpiEngine } from '../KpiEngine';

export class RealtimeDashboard {
  private config: RealtimeDashboardConfig;
  private intervalId: ReturnType<typeof setInterval> | null;
  private listeners: Set<RealtimeListener>;
  private lastValues: Map<string, number>;

  constructor(config?: Partial<RealtimeDashboardConfig>) {
    this.config = {
      intervalMs: config?.intervalMs ?? 5000,
      kpis: config?.kpis ?? kpiEngine.getAllDefinitions().map(d => d.id),
      paused: config?.paused ?? false,
    };
    this.intervalId = null;
    this.listeners = new Set();
    this.lastValues = new Map();
  }

  start(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), this.config.intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  pause(): void {
    this.config.paused = true;
  }

  resume(): void {
    this.config.paused = false;
  }

  setKpis(kpis: string[]): void {
    this.config.kpis = kpis;
  }

  subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  getConfig(): RealtimeDashboardConfig {
    return { ...this.config };
  }

  private tick(): void {
    if (this.config.paused) return;
    const now = Date.now();
    for (const kpiId of this.config.kpis) {
      const def = kpiEngine.getDefinition(kpiId);
      if (!def) continue;
      const base = Math.abs(this.hashCode(kpiId + now)) % 1000;
      const value = (base % 100) + Math.sin(now / 10000) * 10 + 50;
      const last = this.lastValues.get(kpiId) ?? value;
      const delta = value - last;
      this.lastValues.set(kpiId, value);
      const tick: RealtimeTick = { kpiId, value: Math.round(value * 10) / 10, delta: Math.round(delta * 10) / 10, ts: now };
      this.notify(tick);
    }
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private notify(tick: RealtimeTick): void {
    for (const listener of this.listeners) {
      try { listener(tick); } catch { /* ignore */ }
    }
  }

  destroy(): void {
    this.stop();
    this.listeners.clear();
  }
}

export const realtimeDashboard = new RealtimeDashboard();

export function useRealtimeKpi(kpiIds: string[], cb: (tick: RealtimeTick) => void): () => void {
  realtimeDashboard.setKpis(kpiIds);
  return realtimeDashboard.subscribe(cb);
}
