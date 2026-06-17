/**
 * G005 放射RIS系统 v3.0.3.31 - 检查申请/排程状态机测试
 * Phase T1-W2: 状态机单元测试
 */

import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { orderMachine, ORDER_STATE_LABEL } from '../orderMachine';

const INPUT = {
  orderId: 'ord-001',
  patientId: 'P001',
  examItemId: 'EX001',
  modality: 'CT',
  bodyPart: '胸部',
  requestedBy: 'D001',
};

const startActor = () =>
  createActor(orderMachine, { input: INPUT }).start();

describe('orderMachine - 检查申请 6 态状态机', () => {
  it('初始为 submitted', () => {
    const actor = startActor();
    expect(actor.getSnapshot().value).toBe('submitted');
  });

  it('submitted → approved (APPROVE) 记录审批人', () => {
    const actor = startActor();
    actor.send({ type: 'APPROVE', by: 'D002' });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('approved');
    expect(ctx.approvedBy).toBe('D002');
  });

  it('submitted → rejected (REJECT) 记录原因', () => {
    const actor = startActor();
    actor.send({ type: 'REJECT', reason: '适应证不符', by: 'D002' });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('rejected');
    expect(ctx.rejectionReason).toBe('适应证不符');
  });

  it('approved → scheduled (SCHEDULE) 记录排程时间', () => {
    const actor = startActor();
    actor.send({ type: 'APPROVE', by: 'D002' });
    const scheduledAt = '2026-06-10T09:00:00.000Z';
    actor.send({ type: 'SCHEDULE', scheduledAt, by: 'D001' });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('scheduled');
    expect(ctx.scheduledAt).toBe(scheduledAt);
  });

  it('scheduled → confirmed (CONFIRM)', () => {
    const actor = startActor();
    actor.send({ type: 'APPROVE', by: 'D002' });
    actor.send({ type: 'SCHEDULE', by: 'D001' });
    actor.send({ type: 'CONFIRM', by: 'D001' });
    expect(actor.getSnapshot().value).toBe('confirmed');
  });

  it('approved → cancelled (CANCEL) 记录原因', () => {
    const actor = startActor();
    actor.send({ type: 'APPROVE', by: 'D002' });
    actor.send({ type: 'CANCEL', reason: '患者改约', by: 'D001' });
    const ctx = actor.getSnapshot().context;
    expect(actor.getSnapshot().value).toBe('cancelled');
    expect(ctx.rejectionReason).toBe('患者改约');
  });

  it('scheduled → cancelled (CANCEL)', () => {
    const actor = startActor();
    actor.send({ type: 'APPROVE', by: 'D002' });
    actor.send({ type: 'SCHEDULE', by: 'D001' });
    actor.send({ type: 'CANCEL', reason: '设备故障', by: 'D001' });
    expect(actor.getSnapshot().value).toBe('cancelled');
  });

  it('confirmed → cancelled (CANCEL)', () => {
    const actor = startActor();
    actor.send({ type: 'APPROVE', by: 'D002' });
    actor.send({ type: 'SCHEDULE', by: 'D001' });
    actor.send({ type: 'CONFIRM', by: 'D001' });
    actor.send({ type: 'CANCEL', reason: '患者退出', by: 'D001' });
    expect(actor.getSnapshot().value).toBe('cancelled');
  });

  it('submitted 不允许 CANCEL,需先审批或退回', () => {
    const actor = startActor();
    actor.send({ type: 'CANCEL', reason: '重复申请', by: 'D001' });
    expect(actor.getSnapshot().value).toBe('submitted');
  });

  it('状态标签完整（6 态）', () => {
    expect(ORDER_STATE_LABEL.submitted).toBe('已提交');
    expect(ORDER_STATE_LABEL.approved).toBe('已审批');
    expect(ORDER_STATE_LABEL.scheduled).toBe('已排程');
    expect(ORDER_STATE_LABEL.confirmed).toBe('已确认');
    expect(ORDER_STATE_LABEL.cancelled).toBe('已取消');
    expect(ORDER_STATE_LABEL.rejected).toBe('已退回');
  });
});
