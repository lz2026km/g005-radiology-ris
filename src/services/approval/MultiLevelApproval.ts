/**
 * G005 放射RIS系统 v3.0.5.1 - 多级审批 Service (mock)
 * 40 pts
 *
 * 支持多级审批流程: 发起 → 逐级审批 → 完成/驳回
 */

import type {
  ApprovalAction,
  ApprovalDecision,
  ApprovalLevel,
  ApprovalLookupParams,
  MultiLevelApprovalRequest,
  MultiLevelApprovalState,
  ApprovalParticipant,
  ApprovalStatusSnapshot,
} from '../../types/sign';
import {
  APPROVAL_INFLIGHT,
  APPROVAL_COMPLETED,
  APPROVAL_PARTICIPANTS_POOL,
  APPROVAL_CHAIN_TEMPLATES,
} from '../../data/signMock';

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

export class MultiLevelApprovalService {
  private inflight: MultiLevelApprovalState[] = [...APPROVAL_INFLIGHT.map((a) => ({ ...a, levels: [...a.levels], actions: [...a.actions], pendingApprovers: [...a.pendingApprovers], completedLevelIds: [...a.completedLevelIds] }))];
  private completed: MultiLevelApprovalState[] = [...APPROVAL_COMPLETED.map((a) => ({ ...a, levels: [...a.levels], actions: [...a.actions], pendingApprovers: [...a.pendingApprovers], completedLevelIds: [...a.completedLevelIds] }))];

  async initiate(req: MultiLevelApprovalRequest): Promise<MultiLevelApprovalState> {
    await randomDelay();
    const template = APPROVAL_CHAIN_TEMPLATES.find((t) => t.appliesTo === 'critical-finding') ?? APPROVAL_CHAIN_TEMPLATES[0]!;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (req.priority === 'stat' ? 1 : req.priority === 'urgent' ? 4 : 24) * 3600_000);

    const levels: ApprovalLevel[] = template.levels.map((l) => ({ ...l }));

    const pendingApprovers = APPROVAL_PARTICIPANTS_POOL.filter(
      (p) => levels.some((l) => l.role === p.role) && p.isOnDuty,
    );

    const state: MultiLevelApprovalState = {
      approvalId: uuid('apr'),
      reportId: req.reportId,
      status: 'in-progress',
      priority: req.priority,
      initiatedBy: req.initiatedBy,
      initiatedByName: req.initiatedByName,
      initiatedAt: nowIso(),
      currentLevelId: levels[0]?.levelId,
      levels,
      actions: [],
      pendingApprovers,
      completedLevelIds: [],
      expiresAt: expiresAt.toISOString(),
      reason: req.reason,
      metadata: req.metadata,
    };
    this.inflight.push(state);
    return state;
  }

  async approve(approvalId: string, action: Omit<ApprovalAction, 'actedAt'>): Promise<MultiLevelApprovalState> {
    await randomDelay();
    const idx = this.inflight.findIndex((a) => a.approvalId === approvalId);
    if (idx < 0) throw new Error(`审批单 ${approvalId} 未找到`);

    const state = this.inflight[idx]!;
    if (state.status !== 'in-progress') throw new Error('审批单已结束');

    const acted: ApprovalAction = { ...action, actedAt: nowIso() };
    state.actions.push(acted);

    if (action.decision === 'rejected') {
      state.status = 'rejected';
      state.finishedAt = nowIso();
      this.inflight.splice(idx, 1);
      this.completed.push(state);
      return state;
    }

    if (!state.completedLevelIds.includes(action.levelId)) {
      state.completedLevelIds.push(action.levelId);
    }

    const currentOrder = state.levels.find((l) => l.levelId === action.levelId)?.order ?? 0;
    const nextLevel = state.levels.find((l) => l.order === currentOrder + 1);

    if (nextLevel) {
      state.currentLevelId = nextLevel.levelId;
      state.pendingApprovers = APPROVAL_PARTICIPANTS_POOL.filter(
        (p) => p.role === nextLevel.role && p.isOnDuty,
      );
    } else {
      state.status = 'completed';
      state.finishedAt = nowIso();
      state.currentLevelId = undefined;
      state.pendingApprovers = [];
      this.inflight.splice(idx, 1);
      this.completed.push(state);
    }

    return state;
  }

  async listInflight(): Promise<MultiLevelApprovalState[]> {
    await randomDelay();
    return this.inflight.map((a) => ({ ...a, levels: [...a.levels], actions: [...a.actions] }));
  }

  async listCompleted(): Promise<MultiLevelApprovalState[]> {
    await randomDelay();
    return this.completed.map((a) => ({ ...a, levels: [...a.levels], actions: [...a.actions] }));
  }

  async lookup(params: ApprovalLookupParams): Promise<ApprovalStatusSnapshot | null> {
    await randomDelay();
    const candidates = [...this.inflight, ...this.completed];
    let found: MultiLevelApprovalState | undefined;
    if (params.kind === 'by-id' && params.approvalId) {
      found = candidates.find((a) => a.approvalId === params.approvalId);
    } else if (params.kind === 'by-report' && params.reportId) {
      found = candidates.find((a) => a.reportId === params.reportId);
    } else if (params.kind === 'by-approver' && params.approverId) {
      found = candidates.find((a) =>
        a.actions.some((act) => act.approverId === params.approverId),
      );
    }
    if (!found) return null;
    return this.toSnapshot(found);
  }

  async listByApprover(approverId: string): Promise<MultiLevelApprovalState[]> {
    await randomDelay();
    return [...this.inflight, ...this.completed].filter((a) =>
      a.pendingApprovers.some((p) => p.userId === approverId) ||
      a.actions.some((act) => act.approverId === approverId),
    );
  }

  async getStatus(approvalId: string): Promise<ApprovalStatusSnapshot | null> {
    await randomDelay();
    const found = [...this.inflight, ...this.completed].find((a) => a.approvalId === approvalId);
    return found ? this.toSnapshot(found) : null;
  }

  async listApprovalTemplates() {
    await randomDelay();
    return [...APPROVAL_CHAIN_TEMPLATES];
  }

  private toSnapshot(state: MultiLevelApprovalState): ApprovalStatusSnapshot {
    const currentLevel = state.levels.find((l) => l.levelId === state.currentLevelId);
    const completedLevels = state.levels.filter((l) => state.completedLevelIds.includes(l.levelId));
    const pendingLevels = state.levels.filter((l) => !state.completedLevelIds.includes(l.levelId) && l.levelId !== state.currentLevelId);
    return {
      approvalId: state.approvalId,
      reportId: state.reportId,
      status: state.status,
      currentLevel,
      currentLevelApprovers: state.pendingApprovers,
      completedLevels,
      pendingLevels,
      finishedAt: state.finishedAt,
      expiresAt: state.expiresAt,
    };
  }
}

export const multiLevelApprovalService = new MultiLevelApprovalService();
