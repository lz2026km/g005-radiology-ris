/**
 * G005 放射RIS系统 v3.0.0 - 设备状态机测试
 * Phase T1-W2: 状态机单元测试
 */

import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { deviceMachine } from '../deviceMachine';

const INPUT = { deviceId: 'dev-001', deviceCode: 'CT-1', modality: 'CT' as const };

const startActor = () =>
  createActor(deviceMachine, { input: INPUT }).start();

describe('deviceMachine - 设备 5 态', () => {
  it('初始为 idle', () => {
    const actor = startActor();
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('idle → inUse (START_USE) 记录患者和检查', () => {
    const actor = startActor();
    actor.send({ type: 'START_USE', patientId: 'P001', examId: 'EX001', by: 'D001' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('inUse');
    expect(snapshot.context.currentPatientId).toBe('P001');
    expect(snapshot.context.currentExamId).toBe('EX001');
    expect(snapshot.context.startedAt).toBeTruthy();
  });

  it('inUse → idle (COMPLETE_USE) 计数 +1', () => {
    const actor = startActor();
    actor.send({ type: 'START_USE', patientId: 'P001', examId: 'EX001', by: 'D001' });
    actor.send({ type: 'COMPLETE_USE', by: 'D001' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('idle');
    expect(snapshot.context.todayExamCount).toBe(1);
    expect(snapshot.context.currentPatientId).toBeNull();
  });

  it('idle → maintenance (START_MAINTENANCE)', () => {
    const actor = startActor();
    actor.send({ type: 'START_MAINTENANCE', by: 'D001', notes: '球管校准' });
    expect(actor.getSnapshot().value).toBe('maintenance');
  });

  it('maintenance → idle (COMPLETE_MAINTENANCE) 记录时间', () => {
    const actor = startActor();
    actor.send({ type: 'START_MAINTENANCE', by: 'D001', notes: '球管校准' });
    actor.send({ type: 'COMPLETE_MAINTENANCE', by: 'D001' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('idle');
    expect(snapshot.context.lastMaintenanceAt).toBeTruthy();
  });

  it('idle → broken (REPORT_FAULT) 记录原因', () => {
    const actor = startActor();
    actor.send({ type: 'REPORT_FAULT', reason: '探测器过热', by: 'D001' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('broken');
    expect(snapshot.context.faultReason).toBe('探测器过热');
  });

  it('broken → idle (REPAIR_COMPLETE) 清空原因', () => {
    const actor = startActor();
    actor.send({ type: 'REPORT_FAULT', reason: '探测器过热', by: 'D001' });
    actor.send({ type: 'REPAIR_COMPLETE', by: 'D001' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('idle');
    expect(snapshot.context.faultReason).toBeNull();
  });

  it('inUse → broken (REPORT_FAULT) 检查中故障', () => {
    const actor = startActor();
    actor.send({ type: 'START_USE', patientId: 'P001', examId: 'EX001', by: 'D001' });
    actor.send({ type: 'REPORT_FAULT', reason: '电源故障', by: 'D001' });
    expect(actor.getSnapshot().value).toBe('broken');
  });

  it('idle → offline (GO_OFFLINE) → idle (GO_ONLINE)', () => {
    const actor = startActor();
    actor.send({ type: 'GO_OFFLINE', reason: '停电', by: 'D001' });
    expect(actor.getSnapshot().value).toBe('offline');
    actor.send({ type: 'GO_ONLINE', by: 'D001' });
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('broken → maintenance (START_MAINTENANCE) 维修流程', () => {
    const actor = startActor();
    actor.send({ type: 'REPORT_FAULT', reason: '球管损坏', by: 'D001' });
    actor.send({ type: 'START_MAINTENANCE', by: 'D001', notes: '更换球管' });
    expect(actor.getSnapshot().value).toBe('maintenance');
  });
});
