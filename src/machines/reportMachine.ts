/**
 * G005 放射RIS系统 v3.0.0 - 报告 14 态状态机
 * Phase T3-W6: XState 5 完整落地
 *
 * 状态流转:
 *   pendingAssignment → assigned → writing → submitted → reviewing → reviewed → signing → signed → published
 *   任意时刻可: withdraw / reject / amend / archive
 */

import { createMachine, assign } from 'xstate';

/** 报告 14 态(全) */
export type ReportStateName =
  | 'pendingAssignment'  // 待分配
  | 'assigned'           // 已分配
  | 'writing'            // 书写中
  | 'submitted'          // 已提交
  | 'reviewing'          // 初审中
  | 'reviewed'           // 已审核(初审通过)
  | 'signing'            // 签发中
  | 'signed'             // 已签发
  | 'published'          // 已发布
  | 'amending'           // 修订中
  | 'amended'            // 已修订
  | 'withdrawn'          // 已撤回
  | 'rejected'           // 已驳回
  | 'archived';          // 已归档

/** 报告状态中文映射 */
export const REPORT_STATE_LABEL: Record<ReportStateName, string> = {
  pendingAssignment: '待分配',
  assigned: '已分配',
  writing: '书写中',
  submitted: '已提交',
  reviewing: '初审中',
  reviewed: '已审核',
  signing: '签发中',
  signed: '已签发',
  published: '已发布',
  amending: '修订中',
  amended: '已修订',
  withdrawn: '已撤回',
  rejected: '已驳回',
  archived: '已归档',
};

/** 状态分组 */
export const REPORT_STATE_GROUPS = {
  draft: ['pendingAssignment', 'assigned', 'writing'] as ReportStateName[],
  review: ['submitted', 'reviewing', 'reviewed'] as ReportStateName[],
  sign: ['signing', 'signed'] as ReportStateName[],
  published: ['published'] as ReportStateName[],
  special: ['amending', 'amended', 'withdrawn', 'rejected', 'archived'] as ReportStateName[],
};

/** 状态机上下文 */
export interface ReportContext {
  reportId: string;
  patientId: string;
  radiologistId: string;
  findings: string;
  diagnosis: string;
  impression: string;
  recommendations: string;
  rejectReason: string | null;
  reviewerId: string | null;
  signedAt: string | null;
  amendmentReason: string | null;
  /** 操作历史 */
  history: ReportStateEvent[];
}

/** 状态机事件 */
export type ReportEvent =
  | { type: 'ASSIGN'; radiologistId: string }
  | { type: 'START_WRITING' }
  | { type: 'UPDATE_CONTENT'; findings?: string; diagnosis?: string; impression?: string; recommendations?: string }
  | { type: 'SUBMIT' }
  | { type: 'START_REVIEW'; reviewerId: string }
  | { type: 'APPROVE' }
  | { type: 'REJECT'; reason: string }
  | { type: 'RESTART' }
  | { type: 'START_SIGN' }
  | { type: 'COMPLETE_SIGN'; signedAt: string }
  | { type: 'PUBLISH' }
  | { type: 'WITHDRAW' }
  | { type: 'START_AMEND'; reason: string }
  | { type: 'COMPLETE_AMEND' }
  | { type: 'ARCHIVE' };

/** 状态机事件历史 */
export interface ReportStateEvent {
  event: ReportEvent['type'];
  timestamp: string;
  actorId?: string;
}

/** 初始上下文 */
const initialContext = (reportId: string, patientId: string, radiologistId: string): ReportContext => ({
  reportId,
  patientId,
  radiologistId,
  findings: '',
  diagnosis: '',
  impression: '',
  recommendations: '',
  rejectReason: null,
  reviewerId: null,
  signedAt: null,
  amendmentReason: null,
  history: [],
});

/** 报告 14 态状态机 */
export const reportMachine = createMachine({
  id: 'report',
  initial: 'pendingAssignment',
  context: ({ input }: { input: { reportId: string; patientId: string; radiologistId: string } }) =>
    initialContext(input.reportId, input.patientId, input.radiologistId),
  types: {} as { context: ReportContext; events: ReportEvent; input: { reportId: string; patientId: string; radiologistId: string } },
  states: {
    /** ========== Draft 三态 ========== */
    pendingAssignment: {
      on: {
        ASSIGN: {
          target: 'assigned',
          actions: assign({
            radiologistId: ({ event }) => event.radiologistId,
            history: ({ context, event }) => [...context.history, { event: event.type, timestamp: new Date().toISOString(), actorId: event.radiologistId }],
          }),
        },
        WITHDRAW: 'withdrawn',
        ARCHIVE: 'archived',
      },
    },

    assigned: {
      on: {
        START_WRITING: 'writing',
        REASSIGN: {
          target: 'assigned',
          actions: assign({
            radiologistId: ({ event }) => event.radiologistId,
            history: ({ context, event }) => [...context.history, { event: event.type, timestamp: new Date().toISOString() }],
          }),
        },
        WITHDRAW: 'withdrawn',
        ARCHIVE: 'archived',
      },
    },

    writing: {
      on: {
        UPDATE_CONTENT: {
          actions: assign({
            findings: ({ context, event }) => event.findings ?? context.findings,
            diagnosis: ({ context, event }) => event.diagnosis ?? context.diagnosis,
            impression: ({ context, event }) => event.impression ?? context.impression,
            recommendations: ({ context, event }) => event.recommendations ?? context.recommendations,
          }),
        },
        SUBMIT: 'submitted',
        WITHDRAW: 'withdrawn',
        ARCHIVE: 'archived',
      },
    },

    /** ========== Review 三态 ========== */
    submitted: {
      on: {
        START_REVIEW: {
          target: 'reviewing',
          actions: assign({
            reviewerId: ({ event }) => event.reviewerId,
            history: ({ context, event }) => [...context.history, { event: event.type, timestamp: new Date().toISOString(), actorId: event.reviewerId }],
          }),
        },
        WITHDRAW: 'withdrawn',
        ARCHIVE: 'archived',
      },
    },

    reviewing: {
      on: {
        APPROVE: {
          target: 'reviewed',
          actions: assign({
            history: ({ context, event }) => [...context.history, { event: event.type, timestamp: new Date().toISOString() }],
          }),
        },
        REJECT: {
          target: 'rejected',
          actions: assign({
            rejectReason: ({ event }) => event.reason,
            history: ({ context, event }) => [...context.history, { event: event.type, timestamp: new Date().toISOString() }],
          }),
        },
        WITHDRAW: 'withdrawn',
        ARCHIVE: 'archived',
      },
    },

    reviewed: {
      on: {
        START_SIGN: 'signing',
        REJECT: {
          target: 'rejected',
          actions: assign({
            rejectReason: ({ event }) => event.reason,
          }),
        },
        ARCHIVE: 'archived',
      },
    },

    /** ========== Sign 二态 ========== */
    signing: {
      on: {
        COMPLETE_SIGN: {
          target: 'signed',
          actions: assign({
            signedAt: ({ event }) => event.signedAt,
            history: ({ context, event }) => [...context.history, { event: event.type, timestamp: new Date().toISOString() }],
          }),
        },
        REJECT: {
          target: 'rejected',
          actions: assign({
            rejectReason: ({ event }) => event.reason,
          }),
        },
      },
    },

    signed: {
      on: {
        PUBLISH: {
          target: 'published',
          actions: assign({
            history: ({ context, event }) => [...context.history, { event: event.type, timestamp: new Date().toISOString() }],
          }),
        },
        ARCHIVE: 'archived',
      },
    },

    /** ========== Published 一态 ========== */
    published: {
      on: {
        START_AMEND: {
          target: 'amending',
          actions: assign({
            amendmentReason: ({ event }) => event.reason,
            history: ({ context, event }) => [...context.history, { event: event.type, timestamp: new Date().toISOString() }],
          }),
        },
        ARCHIVE: 'archived',
      },
    },

    /** ========== Special 五态 ========== */
    amending: {
      on: {
        UPDATE_CONTENT: {
          actions: assign({
            findings: ({ context, event }) => event.findings ?? context.findings,
            diagnosis: ({ context, event }) => event.diagnosis ?? context.diagnosis,
            impression: ({ context, event }) => event.impression ?? context.impression,
            recommendations: ({ context, event }) => event.recommendations ?? context.recommendations,
          }),
        },
        COMPLETE_AMEND: {
          target: 'amended',
          actions: assign({
            history: ({ context, event }) => [...context.history, { event: event.type, timestamp: new Date().toISOString() }],
          }),
        },
      },
    },

    amended: {
      on: {
        ARCHIVE: 'archived',
        PUBLISH: 'published',
      },
    },

    withdrawn: { type: 'final' },
    rejected: {
      on: {
        RESTART: {
          target: 'writing',
          actions: assign({
            rejectReason: null,
            history: ({ context, event }) => [...context.history, { event: event.type, timestamp: new Date().toISOString() }],
          }),
        },
        ARCHIVE: 'archived',
      },
    },
    archived: { type: 'final' },
  },
});

/** 状态机类型导出 */
export type ReportMachine = typeof reportMachine;
