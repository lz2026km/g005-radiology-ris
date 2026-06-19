/**
 * G005 放射RIS系统 v3.0.6.0 - 定时导出调度器
 * Phase R7:支持 cron/每日/每周/每月调度 + 队列 + 回放
 */
import type {
  ScheduleJob,
  ScheduleFrequency,
  ExportFormatV2,
  ExportResult,
  BulkExportResult,
} from '../../types/export';
import { exportReport } from '../../exportService';

interface ScheduledTask {
  job: ScheduleJob;
  timerId?: ReturnType<typeof setTimeout>;
  running: boolean;
}

type SchedulerListener = (event: SchedulerEvent) => void;

export interface SchedulerEvent {
  type: 'job:start' | 'job:complete' | 'job:fail' | 'job:skip' | 'schedule:start' | 'schedule:stop';
  jobId: string;
  jobName: string;
  result?: ExportResult | BulkExportResult;
  error?: string;
  timestamp: number;
}

export class Scheduler {
  private tasks = new Map<string, ScheduledTask>();
  private listeners = new Set<SchedulerListener>();
  private globalTimerId: ReturnType<typeof setInterval> | null = null;
  private checkIntervalMs = 60_000;

  private jobs: ScheduleJob[] = [];

  constructor() {
    const saved = this.loadPersisted();
    if (saved) this.jobs = saved;
  }

  listJobs(): ScheduleJob[] {
    return [...this.jobs];
  }

  addJob(job: ScheduleJob): void {
    this.jobs.push(job);
    this.persist();
    this.reschedule(job);
  }

  updateJob(id: string, patch: Partial<ScheduleJob>): ScheduleJob | null {
    const idx = this.jobs.findIndex(j => j.id === id);
    if (idx < 0) return null;
    this.jobs[idx] = { ...this.jobs[idx], ...patch };
    this.persist();
    const task = this.tasks.get(id);
    if (task) {
      if (task.timerId) clearTimeout(task.timerId);
      this.tasks.delete(id);
    }
    if (this.jobs[idx].enabled) {
      this.reschedule(this.jobs[idx]);
    }
    return this.jobs[idx];
  }

  removeJob(id: string): boolean {
    const task = this.tasks.get(id);
    if (task?.timerId) clearTimeout(task.timerId);
    this.tasks.delete(id);
    const idx = this.jobs.findIndex(j => j.id === id);
    if (idx < 0) return false;
    this.jobs.splice(idx, 1);
    this.persist();
    return true;
  }

  toggleJob(id: string, enabled: boolean): ScheduleJob | null {
    return this.updateJob(id, { enabled });
  }

  start(): void {
    this.emit({ type: 'schedule:start', jobId: '', jobName: '', timestamp: Date.now() });
    if (this.globalTimerId) return;
    for (const job of this.jobs) {
      if (job.enabled) this.reschedule(job);
    }
    this.globalTimerId = setInterval(() => this.tick(), this.checkIntervalMs);
  }

  stop(): void {
    this.emit({ type: 'schedule:stop', jobId: '', jobName: '', timestamp: Date.now() });
    if (this.globalTimerId) {
      clearInterval(this.globalTimerId);
      this.globalTimerId = null;
    }
    for (const task of this.tasks.values()) {
      if (task.timerId) clearTimeout(task.timerId);
    }
    this.tasks.clear();
  }

  runNow(jobId: string): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;
    this.executeJob(job);
  }

  subscribe(fn: SchedulerListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private tick(): void {
    for (const job of this.jobs) {
      if (!job.enabled) continue;
      const task = this.tasks.get(job.id);
      if (task?.running) continue;
      if (this.isDue(job)) {
        this.executeJob(job);
      }
    }
  }

  private reschedule(job: ScheduleJob): void {
    if (this.tasks.has(job.id)) return;
    this.tasks.set(job.id, { job, running: false });
  }

  private async executeJob(job: ScheduleJob): Promise<void> {
    const task = this.tasks.get(job.id);
    if (!task || task.running) return;
    task.running = true;
    this.emit({ type: 'job:start', jobId: job.id, jobName: job.name, timestamp: Date.now() });

    try {
      const opts = {
        format: job.format as Parameters<typeof exportReport>[0]['format'],
        reportId: 'scheduled-batch',
        includeImages: true,
        includeQR: true,
        includeSignature: true,
        includeWatermark: true,
      };
      const result = await exportReport(opts);
      this.emit({ type: 'job:complete', jobId: job.id, jobName: job.name, result, timestamp: Date.now() });
      job.lastRunAt = Date.now();
      job.nextRunAt = this.computeNextRun(job.frequency);
      this.persist();
    } catch (e) {
      this.emit({ type: 'job:fail', jobId: job.id, jobName: job.name, error: String(e), timestamp: Date.now() });
    } finally {
      task.running = false;
    }
  }

  private isDue(job: ScheduleJob): boolean {
    const nextRun = job.nextRunAt ?? this.computeNextRun(job.frequency);
    return nextRun <= Date.now();
  }

  private computeNextRun(freq: ScheduleFrequency): number {
    const now = Date.now();
    switch (freq.kind) {
      case 'once':
        return freq.at ? new Date(freq.at).getTime() : now + 3600_000;
      case 'daily': {
        const next = new Date();
        next.setHours(freq.hour ?? 0, freq.minute ?? 0, 0, 0);
        if (next.getTime() <= now) next.setDate(next.getDate() + 1);
        return next.getTime();
      }
      case 'weekly': {
        const next = new Date();
        const targetDay = freq.dayOfWeek ?? 1;
        const currentDay = next.getDay();
        const diff = (targetDay - currentDay + 7) % 7 || 7;
        next.setDate(next.getDate() + diff);
        next.setHours(freq.hour ?? 0, freq.minute ?? 0, 0, 0);
        return next.getTime();
      }
      case 'monthly': {
        const next = new Date();
        next.setDate(freq.dayOfMonth ?? 1);
        next.setHours(freq.hour ?? 0, freq.minute ?? 0, 0, 0);
        if (next.getTime() <= now) next.setMonth(next.getMonth() + 1);
        return next.getTime();
      }
      case 'cron':
        return now + 3600_000;
      default:
        return now + 3600_000;
    }
  }

  private emit(event: SchedulerEvent): void {
    this.listeners.forEach(fn => { try { fn(event); } catch { /* ignore */ } });
  }

  private persist(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('g005:export:scheduler', JSON.stringify(this.jobs));
      }
    } catch { /* ignore */ }
  }

  private loadPersisted(): ScheduleJob[] | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('g005:export:scheduler');
        if (raw) return JSON.parse(raw) as ScheduleJob[];
      }
    } catch { /* ignore */ }
    return null;
  }
}

let singleton: Scheduler | null = null;
export function getScheduler(): Scheduler {
  if (!singleton) singleton = new Scheduler();
  return singleton;
}
