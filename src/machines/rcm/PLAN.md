# Module 4: Revenue Cycle Management (RCM) — State Machines

## 4.7 Claims & Denial Management (25 pts)
- **File:** `src/machines/rcm/claimsMachine.ts`
- States: `idle` | `submitting` | `submitted` | `pending_review` | `approved` | `denied` | `appealing` | `resolved` | `error`
- Events: `SUBMIT`, `RECEIVE_RESPONSE`, `APPROVE`, `DENY`, `APPEAL`, `RESOLVE`, `RETRY`, `RESET`
- Context: `claims: ClaimItem[]`, `currentClaimId`, `error`
