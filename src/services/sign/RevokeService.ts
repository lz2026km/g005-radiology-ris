/**
 * G005 放射RIS系统 v3.0.5.1 - 证书吊销列表 (CRL/OCSP) Service
 * 25 pts
 *
 * 提供 CRL 快照 / 增量 CRL / OCSP 单证书实时状态查询能力。
 */

import type {
  CrlEntry,
  CrlSnapshot,
  OcspCertStatus,
  OcspRequest,
  OcspResponse,
} from '../../types/sign';
import { CRL_FULL, CRL_DELTA, OCSP_RESPONSES } from '../../data/signMock';

const MIN_DELAY_MS = 150;
const MAX_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay(): Promise<void> {
  return delay(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

function nowIso(): string {
  return new Date().toISOString();
}

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export class RevokeService {
  private crlFull: CrlSnapshot = { ...CRL_FULL, entries: [...CRL_FULL.entries] };
  private crlDelta: CrlSnapshot = { ...CRL_DELTA, entries: [...CRL_DELTA.entries] };
  private ocspCache: OcspResponse[] = [...OCSP_RESPONSES];

  async getFullCrl(): Promise<CrlSnapshot> {
    await randomDelay();
    return {
      ...this.crlFull,
      entries: [...this.crlFull.entries],
    };
  }

  async getDeltaCrl(): Promise<CrlSnapshot> {
    await randomDelay();
    return {
      ...this.crlDelta,
      entries: [...this.crlDelta.entries],
    };
  }

  async isRevoked(serialNumber: string): Promise<boolean> {
    await randomDelay();
    return this.crlFull.entries.some((e) => e.serialNumber === serialNumber);
  }

  async queryOcsp(req: OcspRequest): Promise<OcspResponse> {
    await randomDelay();
    const cached = this.ocspCache.find(
      (r) => r.serialNumber === req.serialNumber,
    );
    if (cached) {
      return {
        ...cached,
        thisUpdate: nowIso(),
        nextUpdate: new Date(Date.now() + 24 * 3600_000).toISOString(),
      };
    }
    const revokedEntry = this.crlFull.entries.find(
      (e) => e.serialNumber === req.serialNumber,
    );
    const status: OcspCertStatus = revokedEntry ? 'revoked' : 'good';
    const response: OcspResponse = {
      serialNumber: req.serialNumber,
      status,
      thisUpdate: nowIso(),
      nextUpdate: new Date(Date.now() + 24 * 3600_000).toISOString(),
      responderId: 'ocsp.g005-hospital.local',
      producedAt: nowIso(),
      signatureAlgorithm: 'SHA256withRSA',
      ...(revokedEntry
        ? {
            revocationReason: revokedEntry.reason,
            revokedAt: revokedEntry.revocationDate,
          }
        : {}),
    };
    this.ocspCache.push(response);
    return response;
  }

  async addCrlEntry(entry: CrlEntry): Promise<CrlSnapshot> {
    await randomDelay();
    this.crlFull.entries.push(entry);
    this.crlDelta.entries.push(entry);
    this.crlFull = {
      ...this.crlFull,
      thisUpdate: nowIso(),
      nextUpdate: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      crlNumber: `${Date.now().toString().slice(0, 10)}-${Math.floor(Math.random() * 9999)}`,
    };
    this.crlDelta = {
      ...this.crlDelta,
      thisUpdate: nowIso(),
      nextUpdate: this.crlFull.nextUpdate,
      crlNumber: `${this.crlFull.crlNumber}-delta-${Math.floor(Math.random() * 999)}`,
    };
    return this.getFullCrl();
  }

  async listRevoked(): Promise<CrlEntry[]> {
    await randomDelay();
    return [...this.crlFull.entries];
  }

  async generateCrlId(): Promise<string> {
    await randomDelay();
    return uuid('crl');
  }
}

export const revokeService = new RevokeService();
