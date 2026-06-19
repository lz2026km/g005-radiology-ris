/**
 * G005 放射RIS系统 v3.0.5.1 - 证书全生命周期 Service
 * 40 pts
 *
 * 支持证书的 issue / renew / revoke / suspend / resume / getStatus。
 * 所有变更都会写入 CertLifecycleEvent 审计日志。
 */

import type { CertificateInfo } from '../../types/R3/R3.SIGN';
import type {
  CertIssueRequest,
  CertLifecycleEvent,
  CertLifecycleEventType,
  CertLifecycleStatus,
  CertRenewRequest,
  CertRevokeRequestExt,
  CertStatusResponse,
  CertSuspensionRequest,
  CertRevocationReason,
} from '../../types/sign';
import { SIGN_CERTIFICATES } from '../../data/reportSignMock';
import {
  CERT_LIFECYCLE_EVENTS,
  CERT_STATUS_INDEX,
} from '../../data/signMock';

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 500;

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

function randomSerial(): string {
  const block = (): string =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
  return `${block()}-${block()}-${block()}-${block()}`;
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.floor((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000);
}

function mapStatusToCertStatus(s: CertLifecycleStatus): CertificateInfo['status'] {
  switch (s) {
    case 'active':
      return 'active';
    case 'expired':
      return 'expired';
    case 'revoked':
      return 'revoked';
    case 'suspended':
      return 'suspended';
    case 'pending-issue':
    case 'pending-csr':
    case 'renewed':
      return 'active';
    default:
      return 'active';
  }
}

export class CertLifecycleService {
  private certificates: CertificateInfo[] = [...SIGN_CERTIFICATES];
  private events: CertLifecycleEvent[] = [...CERT_LIFECYCLE_EVENTS];

  async issue(req: CertIssueRequest): Promise<CertificateInfo> {
    await randomDelay();
    const now = new Date();
    const notAfter = new Date(now.getTime() + req.validityDays * 86_400_000);
    const created: CertificateInfo = {
      id: uuid('cert'),
      serialNumber: randomSerial(),
      subject: {
        commonName: req.userName,
        userId: req.userId,
        role: 'doctor',
        title: req.userTitle,
        organization: req.organization ?? 'G005 放射科',
        country: 'CN',
      },
      issuer: {
        commonName: 'G005 医院 CA 中心',
        organization: 'G005 信息科',
        userId: 'root-ca-001',
      },
      certType: req.certType,
      publicKeyFingerprint: `SHA256:${Math.random().toString(16).slice(2, 14)}:${Math.random().toString(16).slice(2, 14)}`,
      notBefore: now.toISOString(),
      notAfter: notAfter.toISOString(),
      status: 'active',
      notes: req.reason,
      usageCount: 0,
      createdAt: now.toISOString(),
      createdBy: 'cert-lifecycle-service',
    };
    this.certificates.push(created);
    this.appendEvent(created.id, 'issue', req.userId, req.userName, req.reason);
    return created;
  }

  async renew(req: CertRenewRequest): Promise<CertificateInfo> {
    await randomDelay();
    const idx = this.certificates.findIndex((c) => c.id === req.certId);
    if (idx < 0) throw new Error(`Certificate ${req.certId} not found`);
    const existing = this.certificates[idx]!;
    if (existing.status === 'revoked') {
      throw new Error('已吊销的证书不能续期');
    }
    const newNotAfter = new Date(
      Math.max(Date.now(), new Date(existing.notAfter).getTime()) +
        req.newValidityDays * 86_400_000,
    );
    const renewed: CertificateInfo = {
      ...existing,
      notAfter: newNotAfter.toISOString(),
      status: 'active',
      notes: req.reason,
    };
    this.certificates[idx] = renewed;
    this.appendEvent(renewed.id, 'renew', req.operatorId, req.operatorName, req.reason);
    return renewed;
  }

  async revoke(req: CertRevokeRequestExt): Promise<CertificateInfo> {
    await randomDelay();
    const idx = this.certificates.findIndex((c) => c.id === req.certId);
    if (idx < 0) throw new Error(`Certificate ${req.certId} not found`);
    const existing = this.certificates[idx]!;
    const revoked: CertificateInfo = {
      ...existing,
      status: 'revoked',
      notes: `${req.reason}${req.reasonText ? ` - ${req.reasonText}` : ''}`,
    };
    this.certificates[idx] = revoked;
    this.appendEvent(revoked.id, 'revoke', req.operatorId, req.operatorName, req.reasonText ?? req.reason, {
      revocationReason: req.reason,
      invalidationDate: req.invalidationDate ?? nowIso(),
    });
    return revoked;
  }

  async suspend(req: CertSuspensionRequest): Promise<CertificateInfo> {
    await randomDelay();
    const idx = this.certificates.findIndex((c) => c.id === req.certId);
    if (idx < 0) throw new Error(`Certificate ${req.certId} not found`);
    const existing = this.certificates[idx]!;
    if (existing.status === 'revoked') {
      throw new Error('已吊销的证书不能挂起');
    }
    const suspended: CertificateInfo = {
      ...existing,
      status: 'suspended',
      notes: req.reason,
    };
    this.certificates[idx] = suspended;
    this.appendEvent(suspended.id, 'suspend', req.operatorId, req.operatorName, req.reason);
    return suspended;
  }

  async resume(certId: string, operatorId: string, operatorName: string, reason: string): Promise<CertificateInfo> {
    await randomDelay();
    const idx = this.certificates.findIndex((c) => c.id === certId);
    if (idx < 0) throw new Error(`Certificate ${certId} not found`);
    const existing = this.certificates[idx]!;
    if (existing.status !== 'suspended') {
      throw new Error(`Certificate ${certId} is not suspended`);
    }
    const resumed: CertificateInfo = {
      ...existing,
      status: 'active',
      notes: reason,
    };
    this.certificates[idx] = resumed;
    this.appendEvent(certId, 'resume', operatorId, operatorName, reason);
    return resumed;
  }

  async getStatus(certId: string): Promise<CertStatusResponse> {
    await randomDelay();
    const cert = this.certificates.find((c) => c.id === certId);
    if (!cert) throw new Error(`Certificate ${certId} not found`);
    const statusIndex = CERT_STATUS_INDEX.find((s) => s.certId === certId);
    const notBefore = cert.notBefore;
    const notAfter = cert.notAfter;
    const status: CertLifecycleStatus = statusIndex?.status ?? mapStatusToCertStatus(cert.status);
    return {
      certId: cert.id,
      serialNumber: cert.serialNumber,
      status,
      notBefore,
      notAfter,
      daysToExpiry: daysBetween(nowIso(), notAfter),
      isInCrL: statusIndex?.isInCrL ?? cert.status === 'revoked',
      ocspStatus: statusIndex?.ocspStatus ?? 'unknown',
      lastCheckedAt: nowIso(),
    };
  }

  async listCertificates(): Promise<CertificateInfo[]> {
    await randomDelay();
    return [...this.certificates];
  }

  async listEvents(certId?: string): Promise<CertLifecycleEvent[]> {
    await randomDelay();
    return certId ? this.events.filter((e) => e.certId === certId) : [...this.events];
  }

  async listExpiringSoon(days = 30): Promise<CertificateInfo[]> {
    await randomDelay();
    const now = Date.now();
    return this.certificates.filter((c) => {
      const ms = new Date(c.notAfter).getTime() - now;
      return ms > 0 && ms <= days * 86_400_000 && c.status === 'active';
    });
  }

  private appendEvent(
    certId: string,
    type: CertLifecycleEventType,
    actorId: string,
    actorName: string,
    reason?: string,
    metadata?: Record<string, string | number | boolean>,
  ): void {
    this.events.push({
      id: uuid('evt'),
      certId,
      type,
      occurredAt: nowIso(),
      actorId,
      actorName,
      reason,
      ...(metadata ? { metadata } : {}),
    });
  }
}

export const certLifecycleService = new CertLifecycleService();
