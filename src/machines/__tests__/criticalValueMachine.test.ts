/**
 * G005 放射RIS系统 v3.0.0 - 危急值 5 节点状态机测试
 * Phase T1-W2: 状态机单元测试
 */

import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { criticalValueMachine } from '../criticalValueMachine';

const INPUT = {
  criticalId: 'cv-001',
  reportId: 'rpt-001',
  examId: 'ex-001',
  patientId: 'P001',
  patientName: '张三',
  finding: '主动脉夹层',
  category: 'CV-RAD-001',
  severity: 'critical' as const,
  reportedBy: 'D001',
  reportedAt: '2026-06-06T08:00:00.000Z',
};

const startActor = () =>
  createActor(criticalValueMachine, { input: INPUT }).start();

describe('criticalValueMachine - 危急值 5 节点', () => {
  it('初始为 found 状态', () => {
    const actor = startActor();
    expect(actor.getSnapshot().value).toBe('found');
    expect(actor.getSnapshot().context.history).toHaveLength(1);
    expect(actor.getSnapshot().context.history[0]?.state).toBe('found');
  });

  it('found → notified (NOTIFY) 记录通知信息', () => {
    const actor = startActor();
    actor.send({ type: 'NOTIFY', to: 'D002', method: 'phone', by: 'D001' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('notified');
    expect(snapshot.context.notifiedTo).toBe('D002');
    expect(snapshot.context.notificationMethod).toBe('phone');
    expect(snapshot.context.notificationAttempts).toBe(1);
  });

  it('found → notified 支持 NOTIFY_FAILED 重试计数', () => {
    const actor = startActor();
    actor.send({ type: 'NOTIFY_FAILED', by: 'D001' });
    actor.send({ type: 'NOTIFY_FAILED', by: 'D001' });
    expect(actor.getSnapshot().context.notificationAttempts).toBe(2);
    expect(actor.getSnapshot().value).toBe('found');
  });

  it('notified → acknowledged (ACKNOWLEDGE)', () => {
    const actor = startActor();
    actor.send({ type: 'NOTIFY', to: 'D002', method: 'phone', by: 'D001' });
    actor.send({ type: 'ACKNOWLEDGE', by: 'D002' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('acknowledged');
    expect(snapshot.context.acknowledgedBy).toBe('D002');
    expect(snapshot.context.acknowledgedAt).toBeTruthy();
  });

  it('acknowledged → resolving (START_PROCESSING)', () => {
    const actor = startActor();
    actor.send({ type: 'NOTIFY', to: 'D002', method: 'phone', by: 'D001' });
    actor.send({ type: 'ACKNOWLEDGE', by: 'D002' });
    actor.send({ type: 'START_PROCESSING', doctorId: 'D002', note: '已联系神内' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('resolving');
    expect(snapshot.context.processingDoctor).toBe('D002');
    expect(snapshot.context.processingNote).toBe('已联系神内');
  });

  it('resolving → resolved (COMPLETE_PROCESSING) 最终态', () => {
    const actor = startActor();
    actor.send({ type: 'NOTIFY', to: 'D002', method: 'phone', by: 'D001' });
    actor.send({ type: 'ACKNOWLEDGE', by: 'D002' });
    actor.send({ type: 'START_PROCESSING', doctorId: 'D002' });
    actor.send({ type: 'COMPLETE_PROCESSING', note: '患者已手术' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('resolved');
    expect(snapshot.context.resolvedAt).toBeTruthy();
    expect(snapshot.context.processingNote).toBe('患者已手术');
    expect(snapshot.status).toBe('done');
  });

  it('notified → escalated (ESCALATE) 升级到上级', () => {
    const actor = startActor();
    actor.send({ type: 'NOTIFY', to: 'D002', method: 'phone', by: 'D001' });
    actor.send({ type: 'ESCALATE', to: 'D005', reason: '联系不上' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('escalated');
    expect(snapshot.context.escalatedTo).toBe('D005');
    expect(snapshot.context.escalatedAt).toBeTruthy();
  });

  it('escalated → acknowledged 可继续处理', () => {
    const actor = startActor();
    actor.send({ type: 'NOTIFY', to: 'D002', method: 'phone', by: 'D001' });
    actor.send({ type: 'ESCALATE', to: 'D005', reason: '联系不上' });
    actor.send({ type: 'ACKNOWLEDGE', by: 'D005' });
    expect(actor.getSnapshot().value).toBe('acknowledged');
  });

  it('found → cancelled (CANCEL) 任何早期状态可取消', () => {
    const actor = startActor();
    actor.send({ type: 'CANCEL', reason: '误判' });
    expect(actor.getSnapshot().value).toBe('cancelled');
  });
});
