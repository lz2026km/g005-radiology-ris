export type { IdentityDomain, PatientIdentity, EmpiPatient, EmpiMatchResult, EmpiMergeRequest } from './empiService'
export {
  registerPatientIdentity, queryByEmpiId, queryByDomain,
  queryByDemographics, crossReferencePatient, createMergeRequest,
  resolveMergeRequest, listMergeRequests, getAllPatients, getEmpiAuditLog,
} from './empiService'
