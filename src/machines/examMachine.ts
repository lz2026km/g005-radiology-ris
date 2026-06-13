/**
 * G005 放射RIS系统 v3.0.2.10 - 检查执行 12 态状态机
 */
import { createMachine, assign } from 'xstate';

export type ExamStateName =
  | 'ordered' | 'scheduled' | 'registered' | 'arrived'
  | 'inProgress' | 'completed' | 'imageAvailable' | 'pendingReport'
  | 'reported' | 'published' | 'archived' | 'cancelled';

export const EXAM_STATE_LABEL: Record<ExamStateName, string> = {
  ordered: '已申请', scheduled: '已排程', registered: '已登记', arrived: '已报到',
  inProgress: '检查中', completed: '已完成', imageAvailable: '图像可用',
  pendingReport: '待报告', reported: '已报告', published: '已发布',
  archived: '已归档', cancelled: '已取消',
};

export const EXAM_STATE_GROUPS: Record<string, ExamStateName[]> = {
  order: ['ordered', 'scheduled'],
  exam: ['registered', 'arrived', 'inProgress', 'completed', 'imageAvailable'],
  report: ['pendingReport', 'reported', 'published'],
  final: ['archived', 'cancelled'],
};

export interface ExamContext {
  examId: string; patientId: string; modality: string; bodyPart: string;
  orderedBy: string; scheduledAt: string | null; deviceId: string | null;
  roomId: string | null; technologistId: string | null;
  imagesAcquired: number; imageCount: number;
  rejectionReason: string | null; history: ExamStateEvent[];
}

export interface ExamStateEvent { state: ExamStateName; timestamp: string; actorId: string; note?: string; }

export type ExamEvent =
  | { type: 'APPROVE_ORDER'; by: string }
  | { type: 'REJECT_ORDER'; reason: string; by: string }
  | { type: 'SCHEDULE'; scheduledAt?: string; by: string }
  | { type: 'REGISTER'; roomId: string; deviceId: string; by: string }
  | { type: 'ARRIVE'; by: string }
  | { type: 'START_EXAM'; by: string; technologistId: string }
  | { type: 'COMPLETE_EXAM'; imagesAcquired: number; by: string }
  | { type: 'IMAGES_READY'; imageCount: number; by: string }
  | { type: 'AWAIT_REPORT'; by: string }
  | { type: 'MARK_REPORTED'; by: string }
  | { type: 'PUBLISH'; by: string }
  | { type: 'ARCHIVE'; by: string }
  | { type: 'CANCEL'; reason: string; by: string };

function initExam(input: { examId: string; patientId: string; modality: string; bodyPart: string; orderedBy: string }): ExamContext {
  return { ...input, scheduledAt: null, deviceId: null, roomId: null, technologistId: null, imagesAcquired: 0, imageCount: 0, rejectionReason: null, history: [] };
}

export const examMachine = createMachine({
  id: 'exam',
  initial: 'ordered',
  context: ({ input }: { input: Parameters<typeof initExam>[0] }) => initExam(input),
  types: {} as { context: ExamContext; events: ExamEvent; input: Parameters<typeof initExam>[0] },
  states: {
    ordered: {
      on: {
        APPROVE_ORDER: { target: 'scheduled', actions: assign({ history: ({ context, event }) => [...context.history, { state: 'scheduled', timestamp: new Date().toISOString(), actorId: event.by }] }) },
        REJECT_ORDER: { target: 'cancelled', actions: assign({ rejectionReason: ({ event }) => event.reason, history: ({ context, event }) => [...context.history, { state: 'cancelled', timestamp: new Date().toISOString(), actorId: event.by, note: event.reason }] }) },
      },
    },
    scheduled: {
      on: {
        SCHEDULE: { target: 'scheduled', actions: assign({ scheduledAt: ({ context, event }) => event.scheduledAt ?? context.scheduledAt, history: ({ context, event }) => [...context.history, { state: 'scheduled', timestamp: new Date().toISOString(), actorId: event.by }] }) },
        REGISTER: { target: 'registered', actions: assign({ roomId: ({ event }) => event.roomId, deviceId: ({ event }) => event.deviceId, history: ({ context, event }) => [...context.history, { state: 'registered', timestamp: new Date().toISOString(), actorId: event.by }] }) },
        CANCEL: { target: 'cancelled', actions: assign({ rejectionReason: ({ event }) => event.reason, history: ({ context, event }) => [...context.history, { state: 'cancelled', timestamp: new Date().toISOString(), actorId: event.by, note: event.reason }] }) },
      },
    },
    registered: {
      on: {
        ARRIVE: { target: 'arrived', actions: assign({ history: ({ context, event }) => [...context.history, { state: 'arrived', timestamp: new Date().toISOString(), actorId: event.by }] }) },
        CANCEL: { target: 'cancelled', actions: assign({ rejectionReason: ({ event }) => event.reason, history: ({ context, event }) => [...context.history, { state: 'cancelled', timestamp: new Date().toISOString(), actorId: event.by, note: event.reason }] }) },
      },
    },
    arrived: {
      on: {
        START_EXAM: { target: 'inProgress', actions: assign({ technologistId: ({ event }) => event.technologistId, history: ({ context, event }) => [...context.history, { state: 'inProgress', timestamp: new Date().toISOString(), actorId: event.by }] }) },
        CANCEL: { target: 'cancelled', actions: assign({ rejectionReason: ({ event }) => event.reason, history: ({ context, event }) => [...context.history, { state: 'cancelled', timestamp: new Date().toISOString(), actorId: event.by, note: event.reason }] }) },
      },
    },
    inProgress: {
      on: {
        COMPLETE_EXAM: { target: 'completed', actions: assign({ imagesAcquired: ({ event }) => event.imagesAcquired, history: ({ context, event }) => [...context.history, { state: 'completed', timestamp: new Date().toISOString(), actorId: event.by }] }) },
        CANCEL: { target: 'cancelled', actions: assign({ rejectionReason: ({ event }) => event.reason, history: ({ context, event }) => [...context.history, { state: 'cancelled', timestamp: new Date().toISOString(), actorId: event.by, note: event.reason }] }) },
      },
    },
    completed: { on: { IMAGES_READY: { target: 'imageAvailable', actions: assign({ imageCount: ({ event }) => event.imageCount, history: ({ context, event }) => [...context.history, { state: 'imageAvailable', timestamp: new Date().toISOString(), actorId: event.by }] }) } } },
    imageAvailable: { on: { AWAIT_REPORT: { target: 'pendingReport', actions: assign({ history: ({ context, event }) => [...context.history, { state: 'pendingReport', timestamp: new Date().toISOString(), actorId: event.by }] }) } } },
    pendingReport: { on: { MARK_REPORTED: { target: 'reported', actions: assign({ history: ({ context, event }) => [...context.history, { state: 'reported', timestamp: new Date().toISOString(), actorId: event.by }] }) } } },
    reported: { on: { PUBLISH: { target: 'published', actions: assign({ history: ({ context, event }) => [...context.history, { state: 'published', timestamp: new Date().toISOString(), actorId: event.by }] }) } } },
    published: { on: { ARCHIVE: { target: 'archived', actions: assign({ history: ({ context, event }) => [...context.history, { state: 'archived', timestamp: new Date().toISOString(), actorId: event.by }] }) } } },
    archived: { type: 'final' },
    cancelled: { type: 'final' },
  },
});

export type ExamMachine = typeof examMachine;
