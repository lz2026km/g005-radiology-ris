/**
 * G005 放射RIS系统 v3.0.5.1 - RFC 3161 时间戳 Service
 * 30 pts
 *
 * 支持 stamp(hash) / verify(timestampToken)。
 * 当前为 mock 实现, 保留 RFC 3161 TimeStampToken 字段结构。
 */

import type {
  TimeStampRequest,
  TimeStampToken,
  TimeStampVerifyResult,
  TimestampAlgo,
} from '../../types/sign';
import { TIMESTAMP_TOKENS } from '../../data/signMock';

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
  for (let i = 0; i < bytes * 2; i++) {
    s += Math.floor(Math.random() * 16).toString(16);
  }
  return s;
}

function pickAlgo(algo: TimestampAlgo | undefined): TimestampAlgo {
  return algo ?? 'sha256';
}

export class TimeStampService {
  private tokens: TimeStampToken[] = [...TIMESTAMP_TOKENS];

  async stamp(req: TimeStampRequest): Promise<TimeStampToken> {
    await randomDelay();
    const algo = pickAlgo(req.algo);
    const policyOid = req.policyOid ?? '1.2.3.4.5.6.7.8.1';
    const trustLevel: TimeStampToken['trustLevel'] = policyOid.startsWith('1.2.3.4.5.6.7.8.1')
      ? 'national'
      : 'hospital';
    const tsaName = trustLevel === 'national' ? '国家授时中心 TSA' : 'G005 医院 TSA';
    const tsaCommonName =
      trustLevel === 'national' ? 'CN Time Stamp Authority' : 'G005 Hospital TSA';
    const token: TimeStampToken = {
      id: uuid('tst'),
      reportId: req.reportId,
      hashAlgo: algo,
      messageImprint: req.contentHash,
      serialNumber: `${trustLevel === 'national' ? 'NTSA' : 'GHTSA'}-${Date.now().toString().slice(-9)}`,
      genTime: nowIso(),
      policyOid,
      tsaName,
      tsaCommonName,
      tsaCountry: 'CN',
      accuracySeconds: 1,
      ordering: false,
      nonce: req.nonce ?? randomHex(6),
      signatureAlgorithm: algo === 'sm3' ? 'SM3withSM2' : 'SHA256withRSA',
      signatureValue: 'ME' + (algo === 'sm3' ? 'QC' : 'UC') + 'IB' + randomHex(64),
      rawDerBase64: 'MIIR9AYJKoZIhvcNAQcCoIIR6TCCGu' + randomHex(32),
      trustLevel,
    };
    this.tokens.push(token);
    return token;
  }

  async verify(token: TimeStampToken, originalHash: string): Promise<TimeStampVerifyResult> {
    await randomDelay();
    const hashMatch = token.messageImprint.toLowerCase() === originalHash.toLowerCase();
    const notExpired = new Date(token.genTime).getTime() > Date.now() - 365 * 86_400_000;
    const signatureValid = hashMatch && notExpired;
    const certChainValid = token.trustLevel !== 'self-signed';
    const failureReasons: string[] = [];
    if (!hashMatch) failureReasons.push('message imprint mismatch');
    if (!notExpired) failureReasons.push('token expired');
    if (!certChainValid) failureReasons.push('untrusted TSA chain');
    const result: TimeStampVerifyResult = {
      tokenId: token.id,
      isValid: hashMatch && signatureValid && certChainValid && notExpired,
      hashMatch,
      signatureValid,
      certChainValid,
      notExpired,
      verifiedAt: nowIso(),
      failureReasons,
    };
    return result;
  }

  async listTokens(reportId?: string): Promise<TimeStampToken[]> {
    await randomDelay();
    return reportId ? this.tokens.filter((t) => t.reportId === reportId) : [...this.tokens];
  }

  async getToken(id: string): Promise<TimeStampToken | null> {
    await randomDelay();
    return this.tokens.find((t) => t.id === id) ?? null;
  }
}

export const timeStampService = new TimeStampService();
