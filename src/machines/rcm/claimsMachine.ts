import { createMachine, type StateFrom, type EventFrom } from 'xstate'

export type ClaimStatus = 'idle' | 'submitting' | 'submitted' | 'pending_review' | 'approved' | 'denied' | 'appealing' | 'resolved' | 'error'

export interface ClaimItem {
  id: string
  settlementId: string
  patientName: string
  amount: number
  status: ClaimStatus
  denialReason?: string
}

export interface ClaimsContext {
  claims: ClaimItem[]
  currentClaimId: string | null
  error: string | null
}

export type ClaimsEvent =
  | { type: 'SUBMIT'; claim: ClaimItem }
  | { type: 'RECEIVE_RESPONSE'; claimId: string; status: 'approved' | 'denied'; denialReason?: string }
  | { type: 'APPROVE'; claimId: string }
  | { type: 'DENY'; claimId: string; reason: string }
  | { type: 'APPEAL'; claimId: string }
  | { type: 'RESOLVE'; claimId: string }
  | { type: 'RETRY' }
  | { type: 'RESET' }

export const CLAIM_STATE_LABEL: Record<ClaimStatus, string> = {
  idle: '待提交',
  submitting: '提交中...',
  submitted: '已提交',
  pending_review: '审核中',
  approved: '已通过',
  denied: '已拒绝',
  appealing: '申诉中',
  resolved: '已解决',
  error: '异常',
}

export const CLAIM_STATE_GROUPS: Record<string, ClaimStatus[]> = {
  active: ['submitting', 'submitted', 'pending_review', 'appealing'],
  terminal: ['approved', 'resolved'],
  problem: ['denied', 'error'],
}

export const claimsMachine = createMachine({
  id: 'claims',
  initial: 'idle',
  schema: {
    context: {} as ClaimsContext,
    events: {} as ClaimsEvent,
  },
  predictableActionArguments: true,
  context: {
    claims: [],
    currentClaimId: null,
    error: null,
  },
  states: {
    idle: {
      on: {
        SUBMIT: {
          target: 'submitting',
          actions: ['addClaim', 'setCurrentClaim'],
        },
      },
    },
    submitting: {
      on: {
        RECEIVE_RESPONSE: [
          { target: 'approved', cond: 'isApproved', actions: ['updateClaimStatus'] },
          { target: 'denied', actions: ['updateClaimStatus', 'setDenialReason'] },
        ],
        RETRY: { target: 'submitting' },
        RESET: { target: 'idle', actions: 'resetContext' },
      },
    },
    submitted: {
      on: {
        RECEIVE_RESPONSE: [
          { target: 'approved', cond: 'isApproved', actions: 'updateClaimStatus' },
          { target: 'denied', actions: ['updateClaimStatus', 'setDenialReason'] },
        ],
        RESET: { target: 'idle', actions: 'resetContext' },
      },
    },
    pending_review: {
      on: {
        APPROVE: { target: 'approved', actions: 'updateClaimStatus' },
        DENY: { target: 'denied', actions: ['updateClaimStatus', 'setDenialReason'] },
        RESET: { target: 'idle', actions: 'resetContext' },
      },
    },
    approved: {
      on: {
        RESOLVE: { target: 'resolved', actions: 'updateClaimStatus' },
        RESET: { target: 'idle', actions: 'resetContext' },
      },
    },
    denied: {
      on: {
        APPEAL: { target: 'appealing', actions: 'updateClaimStatus' },
        RESOLVE: { target: 'resolved', actions: 'updateClaimStatus' },
        RESET: { target: 'idle', actions: 'resetContext' },
      },
    },
    appealing: {
      on: {
        RECEIVE_RESPONSE: [
          { target: 'approved', cond: 'isApproved', actions: 'updateClaimStatus' },
          { target: 'denied', actions: ['updateClaimStatus', 'setDenialReason'] },
        ],
        RESET: { target: 'idle', actions: 'resetContext' },
      },
    },
    resolved: {
      on: {
        RESET: { target: 'idle', actions: 'resetContext' },
      },
    },
    error: {
      on: {
        RETRY: { target: 'submitting' },
        RESET: { target: 'idle', actions: 'resetContext' },
      },
    },
  },
} as const)

export type ClaimsMachine = typeof claimsMachine
export type ClaimsState = StateFrom<typeof claimsMachine>
export type ClaimsEventType = EventFrom<typeof claimsMachine>
