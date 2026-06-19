/**
 * G005 放射RIS系统 v3.0.6.0 - 批量导出引擎
 * Phase R7:批量报告导出 + 进度跟踪 + ZIP 归档
 */
import type {
  BulkExportOptions,
  BulkExportResult,
  BulkExportItemResult,
  ExportProgressInfo,
  ExportProgressEvent,
  ExportStatus,
} from '../../../types/export';
import { exportReport, type ExportOptions } from '../../exportService';

interface JobState {
  info: ExportProgressInfo;
  controller?: AbortController;
  resolve?: (r: BulkExportResult) => void;
  reject?: (e: unknown) => void;
}

class BulkExporterImpl {
  private jobs = new Map<string, JobState>();
  private listeners = new Map<string, Set<(info: ExportProgressInfo) => void>>();

  async exportBatch(reports: { id: string; [k: string]: unknown }[], format: BulkExportOptions['format'], options: Partial<BulkExportOptions> = {}): Promise<BulkExportResult> {
    const jobId = `bulk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const controller = new AbortController();
    const info: ExportProgressInfo = {
      jobId,
      status: 'queued',
      total: reports.length,
      processed: 0,
      failed: 0,
      startedAt: Date.now(),
      bytesProcessed: 0,
      estimatedTotalBytes: reports.length * 850_000,
      history: [{
        ts: Date.now(),
        level: 'info',
        message: `批量导出任务已创建:${reports.length} 份报告,格式 ${format}`,
      }],
    };
    const state: JobState = { info, controller };
    this.jobs.set(jobId, state);

    return new Promise<BulkExportResult>(async (resolve, reject) => {
      state.resolve = resolve;
      state.reject = reject;
      try {
        await this.runJob(jobId, reports, format, options);
      } catch (e) {
        this.update(jobId, { status: 'failed', errorMessage: String(e) });
        reject(e);
      }
    });
  }

  getProgress(id: string): ExportProgressInfo | null {
    return this.jobs.get(id)?.info ?? null;
  }

  cancel(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;
    job.controller?.abort();
    this.update(id, { status: 'cancelled' });
    return true;
  }

  subscribe(id: string, fn: (info: ExportProgressInfo) => void): () => void {
    let set = this.listeners.get(id);
    if (!set) {
      set = new Set();
      this.listeners.set(id, set);
    }
    set.add(fn);
    return () => {
      set?.delete(fn);
      if (set && set.size === 0) this.listeners.delete(id);
    };
  }

  private async runJob(
    jobId: string,
    reports: { id: string; [k: string]: unknown }[],
    format: BulkExportOptions['format'],
    options: Partial<BulkExportOptions>,
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    this.update(jobId, { status: 'running' });
    const items: BulkExportItemResult[] = [];

    for (let i = 0; i < reports.length; i++) {
      if (job.controller?.signal.aborted) break;
      const r = reports[i]!;
      this.update(jobId, { currentItem: r.id });
      const t0 = performance.now();
      try {
        const expOpts: ExportOptions = {
          format: format as ExportOptions['format'],
          reportId: r.id,
          includeImages: true,
          includeQR: true,
          includeSignature: true,
          includeWatermark: true,
          ...(options as Partial<ExportOptions>),
        };
        const result = await exportReport(expOpts);
        const dur = performance.now() - t0;
        items.push({
          reportId: r.id,
          success: result.success,
          blob: result.blob,
          fileName: result.fileName,
          error: result.error,
          durationMs: dur,
        });
        if (result.success) {
          this.update(jobId, {
            processed: job.info.processed + 1,
            bytesProcessed: job.info.bytesProcessed + (result.blob?.size ?? 0),
          });
          this.log(jobId, 'info', `已导出 ${r.id} (${(result.blob?.size ?? 0) / 1024 | 0} KB)`, r.id);
        } else {
          this.update(jobId, {
            failed: job.info.failed + 1,
            processed: job.info.processed + 1,
          });
          this.log(jobId, 'error', `导出失败 ${r.id}: ${result.error}`, r.id);
          if (options.stopOnError) throw new Error(result.error);
        }
      } catch (e) {
        const dur = performance.now() - t0;
        items.push({
          reportId: r.id,
          success: false,
          error: e instanceof Error ? e.message : String(e),
          durationMs: dur,
        });
        this.update(jobId, {
          failed: job.info.failed + 1,
          processed: job.info.processed + 1,
        });
        this.log(jobId, 'error', `异常 ${r.id}: ${e}`, r.id);
        if (options.stopOnError) throw e;
      }
    }

    const successCount = items.filter(i => i.success).length;
    const failureCount = items.length - successCount;
    const durationMs = Date.now() - job.info.startedAt;
    const fileName = options.archiveName ?? `bulk-export-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.zip`;

    const archiveBlob = await this.zipResults(items);

    const result: BulkExportResult = {
      jobId,
      archiveBlob,
      fileName,
      items,
      successCount,
      failureCount,
      durationMs,
    };

    this.update(jobId, {
      status: 'completed',
      finishedAt: Date.now(),
    });
    this.log(jobId, 'info', `批量导出完成:成功 ${successCount},失败 ${failureCount},耗时 ${(durationMs / 1000).toFixed(2)}s`);
    job.resolve?.(result);
  }

  private update(jobId: string, patch: Partial<ExportProgressInfo>): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.info = { ...job.info, ...patch };
    this.listeners.get(jobId)?.forEach(fn => {
      try {
        fn(job.info);
      } catch {
        // ignore
      }
    });
    if (jobId in (this as unknown as { jobs: Map<string, JobState> })) {
      // placeholder for any future global broadcast
    }
  }

  private log(jobId: string, level: ExportProgressEvent['level'], message: string, reportId?: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    const ev: ExportProgressEvent = { ts: Date.now(), level, message, ...(reportId ? { reportId } : {}) };
    job.info.history.push(ev);
    if (job.info.history.length > 200) {
      job.info.history = job.info.history.slice(-200);
    }
    this.listeners.get(jobId)?.forEach(fn => fn(job.info));
  }

  private async zipResults(items: BulkExportItemResult[]): Promise<Blob | undefined> {
    const successful = items.filter(i => i.success && i.blob);
    if (successful.length === 0) return undefined;
    const parts: Uint8Array[] = [];
    const central: Uint8Array[] = [];
    let offset = 0;
    const enc = new TextEncoder();
    const crcTable = makeCrcTable();
    for (const item of successful) {
      const name = item.fileName ?? `${item.reportId}.bin`;
      const nameBytes = enc.encode(name);
      const data = new Uint8Array(await item.blob!.arrayBuffer());
      const crc = crc32(data, crcTable);
      const lh = new Uint8Array(30 + nameBytes.length);
      const dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, 0, true);
      dv.setUint16(12, 0, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, data.length, true);
      dv.setUint32(22, data.length, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      lh.set(nameBytes, 30);
      parts.push(lh, data);
      const cd = new Uint8Array(46 + nameBytes.length);
      const cdv = new DataView(cd.buffer);
      cdv.setUint32(0, 0x02014b50, true);
      cdv.setUint16(4, 20, true);
      cdv.setUint16(6, 20, true);
      cdv.setUint16(8, 0, true);
      cdv.setUint16(10, 0, true);
      cdv.setUint16(12, 0, true);
      cdv.setUint16(14, 0, true);
      cdv.setUint32(16, crc, true);
      cdv.setUint32(20, data.length, true);
      cdv.setUint32(24, data.length, true);
      cdv.setUint16(28, nameBytes.length, true);
      cdv.setUint16(30, 0, true);
      cdv.setUint16(32, 0, true);
      cdv.setUint16(34, 0, true);
      cdv.setUint16(36, 0, true);
      cdv.setUint32(38, 0, true);
      cdv.setUint32(42, offset, true);
      cd.set(nameBytes, 46);
      central.push(cd);
      offset += lh.length + data.length;
    }
    const local = concat(parts);
    const cdConcat = concat(central);
    const end = new Uint8Array(22);
    const edv = new DataView(end.buffer);
    edv.setUint32(0, 0x06054b50, true);
    edv.setUint16(8, successful.length, true);
    edv.setUint16(10, successful.length, true);
    edv.setUint32(12, cdConcat.length, true);
    edv.setUint32(16, local.length, true);
    return new Blob([concat([local, cdConcat, end])], { type: 'application/zip' });
  }
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

function makeCrcTable(): Uint32Array {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
}

function crc32(data: Uint8Array, table: Uint32Array): number {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) c = table[(c ^ data[i]!) & 0xFF]! ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

export const BulkExporter = new BulkExporterImpl();
export function getBulkExporter(): BulkExporterImpl {
  return BulkExporter;
}

export type { ExportStatus };