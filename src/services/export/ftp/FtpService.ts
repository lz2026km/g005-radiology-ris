/**
 * G005 放射RIS系统 v3.0.6.0 - SFTP/FTP 上传服务
 * Phase R7:模拟 SFTP/FTP 文件传输 + 传输记录
 */
import type { FtpUploadTarget, ExportResult } from '../../types/export';

export type TransferStatus = 'connecting' | 'uploading' | 'completed' | 'failed';

export interface TransferRecord {
  id: string;
  target: FtpUploadTarget;
  fileName: string;
  fileSize: number;
  status: TransferStatus;
  startedAt: number;
  completedAt?: number;
  error?: string;
  bytesTransferred: number;
}

export class FtpService {
  private transfers: TransferRecord[] = [];
  private readonly STORAGE_KEY = 'g005:export:ftp:transfers';

  constructor() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) this.transfers = JSON.parse(raw) as TransferRecord[];
    } catch { /* ignore */ }
  }

  async upload(target: FtpUploadTarget, result: ExportResult): Promise<TransferRecord> {
    if (!result.blob || !result.fileName) {
      throw new Error('No blob or fileName in export result');
    }

    const id = `ftp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: TransferRecord = {
      id,
      target,
      fileName: result.fileName,
      fileSize: result.blob.size,
      status: 'connecting',
      startedAt: Date.now(),
      bytesTransferred: 0,
    };
    this.transfers.push(record);
    this.persist();

    try {
      record.status = 'uploading';
      this.emitUpdate(record);

      const chunkSize = 65536;
      const totalChunks = Math.ceil(result.blob.size / chunkSize);
      for (let chunk = 0; chunk < totalChunks; chunk++) {
        const start = chunk * chunkSize;
        const end = Math.min(start + chunkSize, result.blob.size);
        record.bytesTransferred = end;

        await this.simulateNetworkDelay();
        this.emitUpdate(record);
      }

      record.status = 'completed';
      record.completedAt = Date.now();
      this.emitUpdate(record);
    } catch (e) {
      record.status = 'failed';
      record.error = e instanceof Error ? e.message : String(e);
      this.emitUpdate(record);
    }

    this.persist();
    return record;
  }

  async uploadMultiple(target: FtpUploadTarget, results: ExportResult[]): Promise<TransferRecord[]> {
    const records: TransferRecord[] = [];
    for (const r of results) {
      const rec = await this.upload(target, r);
      records.push(rec);
    }
    return records;
  }

  listTransfers(): TransferRecord[] {
    return [...this.transfers];
  }

  getTransfer(id: string): TransferRecord | undefined {
    return this.transfers.find(t => t.id === id);
  }

  clearHistory(): void {
    this.transfers = [];
    this.persist();
  }

  validateConfig(config: Partial<FtpUploadTarget>): string | null {
    if (!config.host) return 'Host is required';
    if (!config.port || config.port < 1 || config.port > 65535) return 'Valid port required';
    if (!config.username) return 'Username is required';
    if (!config.remotePath) return 'Remote path is required';
    if (!config.protocol) return 'Protocol is required';
    if (!config.password && !config.privateKey) return 'Password or private key required';
    return null;
  }

  private simulateNetworkDelay(): Promise<void> {
    return new Promise(r => setTimeout(r, 50 + Math.random() * 100));
  }

  private emitUpdate(_record: TransferRecord): void {
    // placeholder for progress listener
  }

  private persist(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.transfers));
    } catch { /* ignore */ }
  }
}

let singleton: FtpService | null = null;
export function getFtpService(): FtpService {
  if (!singleton) singleton = new FtpService();
  return singleton;
}
