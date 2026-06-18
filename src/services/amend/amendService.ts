/**
 * G005 放射RIS系统 v3.0.5.1 - R3.AMEND 修订 Service
 * A5-REPORT / 100 点
 *
 * 修订链路: startAmend -> capture snapshot -> edit -> diff preview -> approval -> cosign -> complete -> re-sign -> publish
 */

import type {
  RevisionEntry,
  AmendApproval,
  SupplementEntry,
  VersionDiff,
  ReportSnapshot,
  FieldDiff,
  AmendmentKPI,
  AmendmentCompliance,
  AmendReasonCategory,
} from '../../types/R3/R3.AMEND';
import {
  AMEND_COUNT_LIMIT,
  AMEND_MIN_REASON_LENGTH,
  SUPPLEMENT_MIN_NOTE_LENGTH,
  SUPPLEMENT_COUNT_LIMIT,
} from '../../types/R3/R3.AMEND';
import {
  REVISION_ENTRIES,
  AMEND_APPROVALS,
  AMEND_COSIGNS,
  SUPPLEMENT_ENTRIES,
  VERSION_DIFFS,
  AMEND_KPI,
  AMEND_COMPLIANCE,
} from '../../data/reportAmendMock';

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

function computeDiffHunks(before: string, after: string) {
  const hunks: { type: 'equal' | 'insert' | 'delete'; text: string }[] = [];
  if (before === after) {
    hunks.push({ type: 'equal', text: before });
    return hunks;
  }
  const beforeWords = new Set(before.split(/(\s+|[，。；！？、])/));
  const afterWords = new Set(after.split(/(\s+|[，。；！？、])/));

  const onlyBefore = [...beforeWords].filter((w) => !afterWords.has(w) && w.trim());
  const onlyAfter = [...afterWords].filter((w) => !beforeWords.has(w) && w.trim());

  hunks.push({ type: 'equal', text: before.slice(0, Math.min(20, before.length)) });
  for (const t of onlyAfter) hunks.push({ type: 'insert', text: t });
  for (const t of onlyBefore) hunks.push({ type: 'delete', text: t });
  return hunks;
}

export interface StartAmendParams {
  reportId: string;
  reason: string;
  reasonCategory: AmendReasonCategory;
  authorId: string;
  authorName: string;
  authorTitle: string;
}

export interface UpdateAmendmentParams {
  reportId: string;
  version: number;
  examFindings?: string;
  diagnosis?: string;
  impression?: string;
  recommendations?: string;
  qualityScore?: number;
}

export class AmendService {
  private revisions: RevisionEntry[] = [...REVISION_ENTRIES];
  private approvals: AmendApproval[] = [...AMEND_APPROVALS];
  private coSigns: { id: string; revisionId: string; reportId: string; coSignerId: string; coSignerName: string; coSignerTitle: string; coSignedAt: string; certificateSerial: string; signatureValue: string }[] = [...AMEND_COSIGNS];
  private supplements: SupplementEntry[] = [...SUPPLEMENT_ENTRIES];

  async listRevisions(reportId: string): Promise<RevisionEntry[]> {
    await randomDelay();
    return this.revisions
      .filter((r) => r.reportId === reportId)
      .sort((a, b) => a.version - b.version);
  }

  async getRevision(id: string): Promise<RevisionEntry | null> {
    await randomDelay();
    return this.revisions.find((r) => r.id === id) ?? null;
  }

  async listAllRevisions(): Promise<RevisionEntry[]> {
    await randomDelay();
    return [...this.revisions];
  }

  async countByReport(reportId: string): Promise<number> {
    await randomDelay();
    return this.revisions.filter((r) => r.reportId === reportId).length;
  }

  async isAmendAllowed(reportId: string): Promise<{ allowed: boolean; currentCount: number; limit: number; reason?: string }> {
    await randomDelay();
    const count = await this.countByReport(reportId);
    if (count >= AMEND_COUNT_LIMIT) {
      return { allowed: false, currentCount: count, limit: AMEND_COUNT_LIMIT, reason: `同一报告修订次数已达上限 ${AMEND_COUNT_LIMIT}` };
    }
    return { allowed: true, currentCount: count, limit: AMEND_COUNT_LIMIT };
  }

  async startAmendment(params: StartAmendParams): Promise<RevisionEntry> {
    await randomDelay();
    if (params.reason.trim().length < AMEND_MIN_REASON_LENGTH) {
      throw new Error(`修订原因至少 ${AMEND_MIN_REASON_LENGTH} 字符`);
    }
    const allowed = await this.isAmendAllowed(params.reportId);
    if (!allowed.allowed) {
      throw new Error(allowed.reason ?? 'Not allowed');
    }
    const prevCount = this.revisions.filter((r) => r.reportId === params.reportId).length;
    const previousVersion = prevCount > 0 ? Math.max(...this.revisions.filter((r) => r.reportId === params.reportId).map((r) => r.version)) : 0;
    const newVersion = previousVersion + 1;
    const entry: RevisionEntry = {
      id: uuid('rev-ent'),
      reportId: params.reportId,
      version: newVersion,
      action: 'start',
      reason: params.reason,
      reasonCategory: params.reasonCategory,
      authorId: params.authorId,
      authorName: params.authorName,
      authorTitle: params.authorTitle,
      createdAt: nowIso(),
      parentVersion: previousVersion > 0 ? previousVersion : undefined,
    };
    this.revisions.push(entry);
    return entry;
  }

  async updateAmendment(params: UpdateAmendmentParams): Promise<{ diff: VersionDiff; revision: RevisionEntry }> {
    await randomDelay();
    const revision = this.revisions.find((r) => r.reportId === params.reportId && r.version === params.version);
    if (!revision) throw new Error('Revision not found');

    const fields: FieldDiff[] = [];
    const fieldNames = ['examFindings', 'diagnosis', 'impression', 'recommendations'] as const;
    for (const field of fieldNames) {
      const newValue = params[field];
      if (newValue === undefined) continue;
      const oldValue = revision.postSnapshot?.[field] ?? '';
      if (oldValue === newValue) continue;
      const hunks = computeDiffHunks(oldValue, newValue);
      const additions = hunks.filter((h) => h.type === 'insert').length;
      const deletions = hunks.filter((h) => h.type === 'delete').length;
      fields.push({ field, before: oldValue, after: newValue, hunks, additions, deletions });
    }
    const diff: VersionDiff = {
      id: uuid('diff'),
      fromVersion: params.version - 1,
      toVersion: params.version,
      fields,
      totalChanges: fields.length,
      addedChars: fields.reduce((acc, f) => acc + f.after.length, 0),
      removedChars: fields.reduce((acc, f) => acc + f.before.length, 0),
      computedAt: nowIso(),
    };
    this.revisions = this.revisions.map((r) =>
      r.id === revision.id
        ? {
            ...r,
            action: 'edit',
            diff,
            postSnapshot: {
              version: params.version,
              examFindings: params.examFindings ?? r.postSnapshot?.examFindings ?? '',
              diagnosis: params.diagnosis ?? r.postSnapshot?.diagnosis ?? '',
              impression: params.impression ?? r.postSnapshot?.impression ?? '',
              recommendations: params.recommendations ?? r.postSnapshot?.recommendations ?? '',
              qualityScore: params.qualityScore ?? r.postSnapshot?.qualityScore ?? 0,
              capturedAt: nowIso(),
            },
          }
        : r
    );
    return { diff, revision: { ...revision, diff } };
  }

  async captureSnapshot(reportId: string, version: number, snapshot: Omit<ReportSnapshot, 'version' | 'capturedAt'>): Promise<ReportSnapshot> {
    await randomDelay();
    const full: ReportSnapshot = { ...snapshot, version, capturedAt: nowIso() };
    this.revisions = this.revisions.map((r) =>
      r.reportId === reportId && r.version === version ? { ...r, preSnapshot: full } : r
    );
    return full;
  }

  async rollbackToVersion(reportId: string, targetVersion: number): Promise<RevisionEntry> {
    await randomDelay();
    const allowed = await this.isAmendAllowed(reportId);
    if (!allowed.allowed) throw new Error(allowed.reason ?? 'Not allowed');
    const target = this.revisions.find((r) => r.reportId === reportId && r.version === targetVersion);
    if (!target) throw new Error('Target version not found');
    const maxVersion = Math.max(...this.revisions.filter((r) => r.reportId === reportId).map((r) => r.version));
    const newVersion = maxVersion + 1;
    const rollback: RevisionEntry = {
      id: uuid('rev-ent'),
      reportId,
      version: newVersion,
      action: 'rollback',
      reason: `回滚到 v${targetVersion}`,
      authorId: target.authorId,
      authorName: target.authorName,
      authorTitle: target.authorTitle,
      createdAt: nowIso(),
      preSnapshot: this.revisions.find((r) => r.reportId === reportId && r.version === maxVersion)?.postSnapshot,
      postSnapshot: target.postSnapshot,
      parentVersion: maxVersion,
    };
    this.revisions.push(rollback);
    return rollback;
  }

  async listApprovals(reportId?: string): Promise<AmendApproval[]> {
    await randomDelay();
    if (!reportId) return [...this.approvals];
    return this.approvals.filter((a) => a.reportId === reportId);
  }

  async approve(id: string, approverId: string, approverName: string, approverTitle: string): Promise<AmendApproval | null> {
    await randomDelay();
    const idx = this.approvals.findIndex((a) => a.id === id);
    if (idx < 0) return null;
    const existing = this.approvals[idx]!;
    this.approvals[idx] = {
      ...existing,
      approverId,
      approverName,
      approverTitle,
      approvedAt: nowIso(),
      status: 'approved',
    };
    return this.approvals[idx]!;
  }

  async reject(id: string, approverId: string, approverName: string, rejectedReason: string): Promise<AmendApproval | null> {
    await randomDelay();
    const idx = this.approvals.findIndex((a) => a.id === id);
    if (idx < 0) return null;
    const existing = this.approvals[idx]!;
    this.approvals[idx] = {
      ...existing,
      approverId,
      approverName,
      approvedAt: nowIso(),
      rejectedReason,
      status: 'rejected',
    };
    return this.approvals[idx]!;
  }

  async cosign(revisionId: string, coSignerId: string, coSignerName: string, coSignerTitle: string, certificateSerial: string): Promise<{ id: string; coSignedAt: string; signatureValue: string }> {
    await randomDelay();
    const record = {
      id: uuid('cosign'),
      revisionId,
      reportId: this.revisions.find((r) => r.id === revisionId)?.reportId ?? '',
      coSignerId,
      coSignerName,
      coSignerTitle,
      coSignedAt: nowIso(),
      certificateSerial,
      signatureValue: 'MEUCIQ' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '==',
    };
    this.coSigns.push(record);
    return { id: record.id, coSignedAt: record.coSignedAt, signatureValue: record.signatureValue };
  }

  async listCosigns(reportId?: string): Promise<typeof this.coSigns> {
    await randomDelay();
    if (!reportId) return [...this.coSigns];
    return this.coSigns.filter((c) => c.reportId === reportId);
  }

  async listDiffs(): Promise<VersionDiff[]> {
    await randomDelay();
    return [...VERSION_DIFFS];
  }

  async getDiff(fromVersion: number, toVersion: number): Promise<VersionDiff | null> {
    await randomDelay();
    return VERSION_DIFFS.find((d) => d.fromVersion === fromVersion && d.toVersion === toVersion) ?? null;
  }

  async listSupplements(reportId?: string): Promise<SupplementEntry[]> {
    await randomDelay();
    if (!reportId) return [...this.supplements];
    return this.supplements.filter((s) => s.reportId === reportId);
  }

  async startSupplement(reportId: string, note: string, authorId: string, authorName: string): Promise<SupplementEntry> {
    await randomDelay();
    if (note.trim().length < SUPPLEMENT_MIN_NOTE_LENGTH) {
      throw new Error(`补充说明至少 ${SUPPLEMENT_MIN_NOTE_LENGTH} 字符`);
    }
    const existing = this.supplements.filter((s) => s.reportId === reportId).length;
    if (existing >= SUPPLEMENT_COUNT_LIMIT) {
      throw new Error(`同一报告补充次数已达上限 ${SUPPLEMENT_COUNT_LIMIT}`);
    }
    const entry: SupplementEntry = {
      id: uuid('sup'),
      reportId,
      type: 'addendum',
      note,
      authorId,
      authorName,
      createdAt: nowIso(),
      attachments: [],
      isCriticalLateMark: false,
      isMissedDx: false,
    };
    this.supplements.push(entry);
    return entry;
  }

  async completeAmendment(id: string): Promise<RevisionEntry | null> {
    await randomDelay();
    const idx = this.revisions.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    const existing = this.revisions[idx]!;
    this.revisions[idx] = {
      ...existing,
      action: 'complete',
      reSignedAt: nowIso(),
    };
    return this.revisions[idx]!;
  }

  async abandonAmendment(id: string, reason: string): Promise<RevisionEntry | null> {
    await randomDelay();
    const idx = this.revisions.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    const existing = this.revisions[idx]!;
    this.revisions[idx] = {
      ...existing,
      action: 'abandon',
      reason: reason || existing.reason,
    };
    return this.revisions[idx]!;
  }

  async publishAmendment(reportId: string): Promise<{ ok: boolean; publishedAt: string }> {
    await delay(300);
    return { ok: true, publishedAt: nowIso() };
  }

  async getKPI(): Promise<AmendmentKPI[]> {
    await randomDelay();
    return [...AMEND_KPI];
  }

  async getCompliance(reportId: string): Promise<AmendmentCompliance | null> {
    await randomDelay();
    return AMEND_COMPLIANCE.find((c) => c.reportId === reportId) ?? null;
  }

  async listCompliance(): Promise<AmendmentCompliance[]> {
    await randomDelay();
    return [...AMEND_COMPLIANCE];
  }

  async generatePatientNotice(reportId: string): Promise<{ content: string; generatedAt: string }> {
    await randomDelay();
    const revision = this.revisions.find((r) => r.reportId === reportId);
    return {
      content: `放射报告修订告知书\n\n报告 ID: ${reportId}\n修订原因: ${revision?.reason ?? ''}\n修订医师: ${revision?.authorName ?? ''}\n签发时间: ${nowIso()}`,
      generatedAt: nowIso(),
    };
  }
}

export const amendService = new AmendService();