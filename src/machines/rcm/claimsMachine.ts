import { assign, setup } from 'xstate'

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
  denialReason: string | null
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

const claimStatusMap: Record<string, ClaimStatus> = {
  approved: 'approved',
  denied: 'denied',
  appealing: 'appealing',
  resolved: 'resolved',
  submitted: 'submitted',
  pending_review: 'pending_review',
}

const claimIdOf = (event: ClaimsEvent): string | null => {
  if (event.type === 'SUBMIT') return event.claim.id
  if (event.type === 'RECEIVE_RESPONSE' || event.type === 'APPROVE' || event.type === 'DENY' || event.type === 'APPEAL' || event.type === 'RESOLVE') {
    return event.claimId
  }
  return null
}

export const claimsMachine = setup({
  types: {} as {
    context: ClaimsContext
    events: ClaimsEvent
  },
  actions: {
    addClaim: assign({
      claims: ({ context, event }) => {
        if (event.type !== 'SUBMIT') return context.claims
        return [...context.claims, event.claim]
      },
    }),
    setCurrentClaim: assign({
      currentClaimId: ({ event }) => claimIdOf(event),
    }),
    updateClaimStatus: assign({
      claims: ({ context, event }) => {
        const targetId = claimIdOf(event) ?? context.currentClaimId
        if (!targetId) return context.claims
        let nextStatus: ClaimStatus | undefined
        if (event.type === 'RECEIVE_RESPONSE') nextStatus = claimStatusMap[event.status]
        else if (event.type === 'APPROVE') nextStatus = 'approved'
        else if (event.type === 'DENY') nextStatus = 'denied'
        else if (event.type === 'APPEAL') nextStatus = 'appealing'
        else if (event.type === 'RESOLVE') nextStatus = 'resolved'
        if (!nextStatus) return context.claims
        return context.claims.map((c) => c.id === targetId ? { ...c, status: nextStatus as ClaimStatus } : c)
      },
    }),
    setDenialReason: assign({
      denialReason: ({ context, event }) => {
        if (event.type === 'RECEIVE_RESPONSE' && event.status === 'denied') return event.denialReason ?? null
        if (event.type === 'DENY') return event.reason
        return context.denialReason
      },
      claims: ({ context, event }) => {
        if (event.type !== 'RECEIVE_RESPONSE' && event.type !== 'DENY') return context.claims
        const reason = event.type === 'RECEIVE_RESPONSE' ? event.denialReason : event.reason
        return context.claims.map((c) => c.id === event.claimId ? { ...c, denialReason: reason } : c)
      },
    }),
    resetContext: assign({
      claims: () => [] as ClaimItem[],
      currentClaimId: () => null,
      error: () => null,
      denialReason: () => null,
    }),
    clearError: assign({
      error: () => null,
    }),
  },
  guards: {
    isApproved: ({ event }) => event.type === 'RECEIVE_RESPONSE' && event.status === 'approved',
  },
}).createMachine({
  id: 'claims',
  initial: 'idle',
  context: {
    claims: [],
    currentClaimId: null,
    error: null,
    denialReason: null,
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
          { target: 'approved', guard: 'isApproved', actions: ['updateClaimStatus'] },
          { target: 'denied', actions: ['updateClaimStatus', 'setDenialReason'] },
        ],
        RETRY: { target: 'submitting' },
        RESET: { target: 'idle', actions: 'resetContext' },
      },
    },
    submitted: {
      on: {
        RECEIVE_RESPONSE: [
          { target: 'approved', guard: 'isApproved', actions: 'updateClaimStatus' },
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
          { target: 'approved', guard: 'isApproved', actions: 'updateClaimStatus' },
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
        RETRY: { target: 'submitting', actions: 'clearError' },
        RESET: { target: 'idle', actions: 'resetContext' },
      },
    },
  },
})

export type ClaimsMachine = typeof claimsMachine
