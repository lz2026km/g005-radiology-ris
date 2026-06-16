export type {
  IdentityDomain, PatientIdentity, PatientRecord,
  MatchCandidate, MatchResult, MatchConfig,
  ConsentRecord, LinkRecord,
} from './types';

export { calculateMatchScore, findMatches, getMatchConfig, setMatchConfig } from './matching';
export { createLink, unlinkRecords, getLinksForPatient, approveLink, rejectLink, getAllLinks, crossSitePatientSearch } from './linking';
export { createMergePlan, executeMerge, autoMergeRecords } from './merge';
export type { MergePlan } from './merge';
export { detectDuplicates, getDuplicateGroups, resolveDuplicateGroup, blockDuplicates } from './duplicate';
export type { DuplicateGroup } from './duplicate';
export { grantConsent, withdrawConsent, getConsentForPatient, hasActiveConsent, revokeExpiredConsents } from './consent';
export { logMpiAudit, queryMpiAuditLog } from './audit';
export type { MpiAuditAction, MpiAuditEntry } from './audit';
export { getMpiDashboardData } from './dashboard';
export type { MpiDashboardData } from './dashboard';
