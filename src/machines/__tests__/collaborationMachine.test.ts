/**
 * G005 放射RIS系统 v3.0.0 - 协同编辑状态机测试
 * Phase T1-W2: 状态机单元测试
 */

import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { collaborationMachine } from '../collaborationMachine';

const INPUT = { reportId: 'rpt-001', userId: 'D001', userName: '张医生' };

const startActor = () =>
  createActor(collaborationMachine, { input: INPUT }).start();

describe('collaborationMachine - 协同编辑状态机', () => {
  it('初始为 disconnected', () => {
    const actor = startActor();
    expect(actor.getSnapshot().value).toBe('disconnected');
    expect(actor.getSnapshot().context.userCount).toBe(1);
  });

  it('disconnected → connecting (CONNECT)', () => {
    const actor = startActor();
    actor.send({ type: 'CONNECT' });
    expect(actor.getSnapshot().value).toBe('connecting');
  });

  it('connecting → connected (CONNECTED) 记录在线用户', () => {
    const actor = startActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'CONNECTED', userCount: 3 });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('connected');
    expect(snapshot.context.userCount).toBe(3);
    expect(snapshot.context.lastSyncAt).toBeTruthy();
  });

  it('connecting → error (ERROR) 重试计数保留', () => {
    const actor = startActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'ERROR', message: '网络断开' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('error');
    expect(snapshot.context.errorMessage).toBe('网络断开');
  });

  it('error → connecting (RETRY) 重试次数 +1', () => {
    const actor = startActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'ERROR', message: '超时' });
    actor.send({ type: 'RETRY' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('connecting');
    expect(snapshot.context.retryCount).toBe(1);
    expect(snapshot.context.errorMessage).toBeNull();
  });

  it('connected → syncing → connected (START_SYNC + SYNC_COMPLETE)', () => {
    const actor = startActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'CONNECTED', userCount: 2 });
    actor.send({ type: 'START_SYNC' });
    expect(actor.getSnapshot().value).toBe('syncing');
    actor.send({ type: 'SYNC_COMPLETE' });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('connected');
    expect(snapshot.context.pendingChanges).toBe(0);
  });

  it('PENDING_CHANGE 累加待同步变更', () => {
    const actor = startActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'CONNECTED', userCount: 1 });
    actor.send({ type: 'PENDING_CHANGE' });
    actor.send({ type: 'PENDING_CHANGE' });
    actor.send({ type: 'PENDING_CHANGE' });
    expect(actor.getSnapshot().context.pendingChanges).toBe(3);
  });

  it('USER_JOINED / USER_LEFT 更新用户数', () => {
    const actor = startActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'CONNECTED', userCount: 1 });
    actor.send({ type: 'USER_JOINED', userCount: 5 });
    expect(actor.getSnapshot().context.userCount).toBe(5);
    actor.send({ type: 'USER_LEFT', userCount: 3 });
    expect(actor.getSnapshot().context.userCount).toBe(3);
  });

  it('connected → disconnected (DISCONNECT) 重置', () => {
    const actor = startActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'CONNECTED', userCount: 2 });
    actor.send({ type: 'DISCONNECT' });
    expect(actor.getSnapshot().value).toBe('disconnected');
  });

  it('syncing 中断 → error', () => {
    const actor = startActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'CONNECTED', userCount: 1 });
    actor.send({ type: 'START_SYNC' });
    actor.send({ type: 'ERROR', message: '断网' });
    expect(actor.getSnapshot().value).toBe('error');
  });
});
