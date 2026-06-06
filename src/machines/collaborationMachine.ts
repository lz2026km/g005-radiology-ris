/**
 * G005 放射RIS系统 v3.0.0 - 协同编辑状态机
 * Phase T3-W6: XState 5 完整落地
 *
 * 协同编辑 4 态:
 *   disconnected(未连接) → connecting(连接中) → connected(已连接) → syncing(同步中) → connected
 *   任何状态可: disconnect / error
 */

import { createMachine, assign } from 'xstate';

export type CollaborationStateName =
  | 'disconnected'  // 未连接
  | 'connecting'    // 连接中
  | 'connected'     // 已连接
  | 'syncing'       // 同步中
  | 'error';        // 错误

export const COLLABORATION_STATE_LABEL: Record<CollaborationStateName, string> = {
  disconnected: '未连接',
  connecting: '连接中',
  connected: '已连接',
  syncing: '同步中',
  error: '错误',
};

export interface CollaborationContext {
  reportId: string;
  userId: string;
  userName: string;
  /** 在线用户数 */
  userCount: number;
  /** 待同步的本地变更数 */
  pendingChanges: number;
  /** 最后一次同步时间 */
  lastSyncAt: string | null;
  /** 错误信息 */
  errorMessage: string | null;
  /** 重试次数 */
  retryCount: number;
  history: CollaborationStateEvent[];
}

export interface CollaborationStateEvent {
  state: CollaborationStateName;
  timestamp: string;
  detail?: string;
}

export type CollaborationEvent =
  | { type: 'CONNECT' }
  | { type: 'CONNECTED'; userCount: number }
  | { type: 'START_SYNC' }
  | { type: 'SYNC_COMPLETE' }
  | { type: 'PENDING_CHANGE' }
  | { type: 'USER_JOINED'; userCount: number }
  | { type: 'USER_LEFT'; userCount: number }
  | { type: 'ERROR'; message: string }
  | { type: 'DISCONNECT' }
  | { type: 'RETRY' };

const initialContext = (input: { reportId: string; userId: string; userName: string }): CollaborationContext => ({
  ...input,
  userCount: 1,
  pendingChanges: 0,
  lastSyncAt: null,
  errorMessage: null,
  retryCount: 0,
  history: [],
});

export const collaborationMachine = createMachine({
  id: 'collaboration',
  initial: 'disconnected',
  context: ({ input }: { input: Parameters<typeof initialContext>[0] }) => initialContext(input),
  types: {} as { context: CollaborationContext; events: CollaborationEvent; input: Parameters<typeof initialContext>[0] },
  states: {
    disconnected: {
      on: {
        CONNECT: 'connecting',
      },
    },

    connecting: {
      on: {
        CONNECTED: {
          target: 'connected',
          actions: assign({
            userCount: ({ event }) => event.userCount,
            lastSyncAt: () => new Date().toISOString(),
            retryCount: 0,
            errorMessage: null,
            history: ({ context }) => [...context.history, { state: 'connected', timestamp: new Date().toISOString() }],
          }),
        },
        ERROR: {
          target: 'error',
          actions: assign({
            errorMessage: ({ event }) => event.message,
            history: ({ context, event }) => [...context.history, { state: 'error', timestamp: new Date().toISOString(), detail: event.message }],
          }),
        },
        DISCONNECT: 'disconnected',
      },
    },

    connected: {
      on: {
        START_SYNC: 'syncing',
        PENDING_CHANGE: {
          actions: assign({
            pendingChanges: ({ context }) => context.pendingChanges + 1,
          }),
        },
        USER_JOINED: {
          actions: assign({
            userCount: ({ event }) => event.userCount,
          }),
        },
        USER_LEFT: {
          actions: assign({
            userCount: ({ event }) => event.userCount,
          }),
        },
        ERROR: {
          target: 'error',
          actions: assign({
            errorMessage: ({ event }) => event.message,
          }),
        },
        DISCONNECT: 'disconnected',
      },
    },

    syncing: {
      on: {
        SYNC_COMPLETE: {
          target: 'connected',
          actions: assign({
            pendingChanges: 0,
            lastSyncAt: () => new Date().toISOString(),
          }),
        },
        PENDING_CHANGE: {
          actions: assign({
            pendingChanges: ({ context }) => context.pendingChanges + 1,
          }),
        },
        ERROR: {
          target: 'error',
          actions: assign({
            errorMessage: ({ event }) => event.message,
          }),
        },
        DISCONNECT: 'disconnected',
      },
    },

    error: {
      on: {
        RETRY: {
          target: 'connecting',
          actions: assign({
            retryCount: ({ context }) => context.retryCount + 1,
            errorMessage: null,
          }),
        },
        DISCONNECT: 'disconnected',
      },
    },
  },
});

export type CollaborationMachine = typeof collaborationMachine;
