/**
 * G005 放射RIS系统 v3.0.5.1 - 三人应急 (3-eye principle) Service (mock)
 * 30 pts
 *
 * 紧急越权: 生命危急场景下 3 名见证人同时授权
 */

import type {
  EmergencyEyeApproval,
  EmergencyOverrideRecord,
  EmergencyOverrideRequest,
  ApprovalParticipant,
} from '../../types/sign';
import { EMERGENCY_OVERRIDES, APPROVAL_PARTICIPANTS_POOL } from '../../data/signMock';

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay(): Promise<void> {
  return delay(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function randomHex(bytes: number): string {
  let s = '';
  for (let i = 0; i < bytes * 2; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

export class EmergencyOverrideService {
  private records: EmergencyOverrideRecord[] = [...EMERGENCY_OVERRIDES.map((r) => ({
    ...r,
    request: { ...r.request, witnesses: r.request.witnesses.map((w) => ({ ...w })) },
    approvals: r.approvals.map((a) => ({ ...a })),
  }))];

  async initiate(req: EmergencyOverrideRequest): Promise<EmergencyOverrideRecord> {
    await randomDelay();
    const now = new Date();
    const expiresAt = req.expiresAt || new Date(now.getTime() + 3600_000).toISOString();
    const record: EmergencyOverrideRecord = {
      id: uuid('emerg'),
      request: {
        ...req,
        witnesses: req.witnesses.map((w) => ({ ...w })),
        expiresAt,
      },
      approvals: [],
      status: 'pending',
      createdAt: nowIso(),
    };
    this.records.push(record);
    return record;
  }

  async approve(recordId: string, eye: EmergencyEyeApproval): Promise<EmergencyOverrideRecord> {
    await randomDelay();
    const idx = this.records.findIndex((r) => r.id === recordId);
    if (idx < 0) throw new Error(`应急记录 ${recordId} 未找到`);
    const record = this.records[idx]!;
    if (record.status !== 'pending') throw new Error('应急单已结束');

    const already = record.approvals.find((a) => a.witnessId === eye.witnessId);
    if (already) throw new Error('该见证人已授权');

    record.approvals.push({ ...eye, approvedAt: nowIso() });

    if (record.approvals.length >= record.request.eyesRequired) {
      record.status = 'authorized';
      record.authorizedAt = nowIso();
      record.signatureValue = 'EMERG-' + randomHex(32);
      record.auditHash = 'sha256:' + randomHex(32);
    }

    return record;
  }

  async reject(recordId: string, witnessId: string): Promise<EmergencyOverrideRecord> {
    await randomDelay();
    const idx = this.records.findIndex((r) => r.id === recordId);
    if (idx < 0) throw new Error(`应急记录 ${recordId} 未找到`);
    const record = this.records[idx]!;
    if (record.status !== 'pending') throw new Error('应急单已结束');
    record.status = 'rejected';
    return record;
  }

  async list(): Promise<EmergencyOverrideRecord[]> {
    await randomDelay();
    return this.records.map((r) => ({
      ...r,
      request: { ...r.request, witnesses: [...r.request.witnesses] },
      approvals: [...r.approvals],
    }));
  }

  async getById(id: string): Promise<EmergencyOverrideRecord | null> {
    await randomDelay();
    const found = this.records.find((r) => r.id === id);
    return found ? {
      ...found,
      request: { ...found.request, witnesses: [...found.request.witnesses] },
      approvals: [...found.approvals],
    } : null;
  }

  async listWitnessPool(role?: string): Promise<ApprovalParticipant[]> {
    await randomDelay();
    let pool = [...APPROVAL_PARTICIPANTS_POOL.filter((p) => p.isOnDuty)];
    if (role) pool = pool.filter((p) => p.role === role);
    return pool;
  }

  async expireStale(): Promise<number> {
    await randomDelay();
    const now = nowIso();
    let count = 0;
    for (let i = this.records.length - 1; i >= 0; i--) {
      const r = this.records[i]!;
      if (r.status === 'pending' && r.request.expiresAt < now) {
        this.records[i] = { ...r, status: 'expired' };
        count++;
      }
    }
    return count;
  }

  async consume(recordId: string): Promise<EmergencyOverrideRecord | null> {
    await randomDelay();
    const idx = this.records.findIndex((r) => r.id === recordId);
    if (idx < 0) return null;
    const record = this.records[idx]!;
    if (record.status !== 'authorized') throw new Error('仅已授权的记录可被消费');
    this.records[idx] = { ...record, status: 'consumed' };
    return this.records[idx]!;
  }
}

export const emergencyOverrideService = new EmergencyOverrideService();
