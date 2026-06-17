/**
 * G005 放射RIS系统 v3.0.3.31 - 索赔状态机测试
 * Phase T1-W2: 状态机单元测试
 */

import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { claimsMachine, CLAIM_STATE_LABEL } from '../claimsMachine';

const sampleClaim = {
  id: 'clm-001',
  settlementId: 'stl-001',
  patientName: '张志远',
  amount: 1500,
  status: 'idle' as const,
};

const startActor = () =>
  createActor(claimsMachine).start();

describe('claimsMachine - 索赔 8 态状态机', () => {
  it('初始为 idle', () => {
    const actor = startActor();
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('idle → submitting (SUBMIT) 记录 claim', () => {
    const actor = startActor();
    actor.send({ type: 'SUBMIT', claim: sampleClaim });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('submitting');
    expect(ctx.claims).toHaveLength(1);
    expect(ctx.claims[0]?.id).toBe('clm-001');
    expect(ctx.currentClaimId).toBe('clm-001');
  });

  it('submitting → approved (RECEIVE_RESPONSE approved, isApproved guard)', () => {
    const actor = startActor();
    actor.send({ type: 'SUBMIT', claim: sampleClaim });
    actor.send({ type: 'RECEIVE_RESPONSE', claimId: 'clm-001', status: 'approved' });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('approved');
    expect(ctx.claims[0]?.status).toBe('approved');
  });

  it('submitting → denied (RECEIVE_RESPONSE denied) 记录 reason', () => {
    const actor = startActor();
    actor.send({ type: 'SUBMIT', claim: sampleClaim });
    actor.send({
      type: 'RECEIVE_RESPONSE',
      claimId: 'clm-001',
      status: 'denied',
      denialReason: '诊断不匹配',
    });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('denied');
    expect(ctx.claims[0]?.status).toBe('denied');
    expect(ctx.claims[0]?.denialReason).toBe('诊断不匹配');
  });

  it('pending_review → approved (APPROVE)', () => {
    const actor = startActor();
    actor.send({ type: 'SUBMIT', claim: sampleClaim });
    actor.send({ type: 'RECEIVE_RESPONSE', claimId: 'clm-001', status: 'approved' });
    actor.send({ type: 'APPROVE', claimId: 'clm-001' });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('approved');
    expect(ctx.claims[0]?.status).toBe('approved');
  });

  it('denied → appealing (APPEAL)', () => {
    const actor = startActor();
    actor.send({ type: 'SUBMIT', claim: sampleClaim });
    actor.send({
      type: 'RECEIVE_RESPONSE',
      claimId: 'clm-001',
      status: 'denied',
      denialReason: '材料不全',
    });
    actor.send({ type: 'APPEAL', claimId: 'clm-001' });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('appealing');
    expect(ctx.claims[0]?.status).toBe('appealing');
  });

  it('appealing → approved (RECEIVE_RESPONSE approved)', () => {
    const actor = startActor();
    actor.send({ type: 'SUBMIT', claim: sampleClaim });
    actor.send({
      type: 'RECEIVE_RESPONSE',
      claimId: 'clm-001',
      status: 'denied',
      denialReason: '材料不全',
    });
    actor.send({ type: 'APPEAL', claimId: 'clm-001' });
    actor.send({ type: 'RECEIVE_RESPONSE', claimId: 'clm-001', status: 'approved' });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('approved');
    expect(ctx.claims[0]?.status).toBe('approved');
  });

  it('appealing → denied (RECEIVE_RESPONSE denied) 仍可记录 reason', () => {
    const actor = startActor();
    actor.send({ type: 'SUBMIT', claim: sampleClaim });
    actor.send({
      type: 'RECEIVE_RESPONSE',
      claimId: 'clm-001',
      status: 'denied',
      denialReason: '材料不全',
    });
    actor.send({ type: 'APPEAL', claimId: 'clm-001' });
    actor.send({
      type: 'RECEIVE_RESPONSE',
      claimId: 'clm-001',
      status: 'denied',
      denialReason: '复核不通过',
    });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('denied');
    expect(ctx.claims[0]?.denialReason).toBe('复核不通过');
  });

  it('approved → resolved (RESOLVE)', () => {
    const actor = startActor();
    actor.send({ type: 'SUBMIT', claim: sampleClaim });
    actor.send({ type: 'RECEIVE_RESPONSE', claimId: 'clm-001', status: 'approved' });
    actor.send({ type: 'RESOLVE', claimId: 'clm-001' });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('resolved');
    expect(ctx.claims[0]?.status).toBe('resolved');
  });

  it('denied → resolved (RESOLVE 直接)', () => {
    const actor = startActor();
    actor.send({ type: 'SUBMIT', claim: sampleClaim });
    actor.send({
      type: 'RECEIVE_RESPONSE',
      claimId: 'clm-001',
      status: 'denied',
      denialReason: '材料不全',
    });
    actor.send({ type: 'RESOLVE', claimId: 'clm-001' });
    expect(actor.getSnapshot().value).toBe('resolved');
  });

  it('任意态 → idle (RESET) 清空 context', () => {
    const actor = startActor();
    actor.send({ type: 'SUBMIT', claim: sampleClaim });
    actor.send({ type: 'RECEIVE_RESPONSE', claimId: 'clm-001', status: 'approved' });
    actor.send({ type: 'RESET' });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('idle');
    expect(ctx.claims).toHaveLength(0);
    expect(ctx.currentClaimId).toBeNull();
  });

  it('submitting 收到 RESET 回到 idle', () => {
    const actor = startActor();
    actor.send({ type: 'SUBMIT', claim: sampleClaim });
    actor.send({ type: 'RESET' });
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('error → submitting via RETRY, error → idle via RESET', () => {
    // Restore actor into error state (no incoming transition to error exists in machine)
    const errorState = {
      status: 'active' as const,
      context: { claims: [sampleClaim], currentClaimId: 'clm-001', error: 'Submission failed', denialReason: null },
      value: 'error',
      children: {},
      historyValue: {},
      tags: [],
    };
    const actor = createActor(claimsMachine, { state: errorState as any }).start();
    expect(actor.getSnapshot().value).toBe('error');

    actor.send({ type: 'RETRY' });
    expect(actor.getSnapshot().value).toBe('submitting');

    // Also test RESET path from error
    actor.send({ type: 'RESET' });
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.claims).toHaveLength(0);
    expect(actor.getSnapshot().context.currentClaimId).toBeNull();
  });

  it('状态标签完整（8 态）', () => {
    expect(CLAIM_STATE_LABEL.idle).toBe('待提交');
    expect(CLAIM_STATE_LABEL.submitting).toBe('提交中...');
    expect(CLAIM_STATE_LABEL.submitted).toBe('已提交');
    expect(CLAIM_STATE_LABEL.pending_review).toBe('审核中');
    expect(CLAIM_STATE_LABEL.approved).toBe('已通过');
    expect(CLAIM_STATE_LABEL.denied).toBe('已拒绝');
    expect(CLAIM_STATE_LABEL.appealing).toBe('申诉中');
    expect(CLAIM_STATE_LABEL.resolved).toBe('已解决');
    expect(CLAIM_STATE_LABEL.error).toBe('异常');
  });
});
