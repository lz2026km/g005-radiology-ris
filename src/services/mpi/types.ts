export type IdentityDomain = 'empi' | 'local_mrn' | 'national_id' | 'passport' | 'insurance_id' | 'drivers_license';

export interface PatientIdentity {
  id: string;
  patientId: string;
  domain: IdentityDomain;
  identifier: string;
  issuer?: string;
  assigningAuthority?: string;
  effectiveDate?: string;
  expirationDate?: string;
  status: 'active' | 'inactive' | 'merged';
  mergedIntoId?: string;
  createdAt: string;
}

export interface PatientRecord {
  id: string;
  identities: PatientIdentity[];
  name: string;
  givenName?: string;
  familyName?: string;
  dateOfBirth?: string;
  gender?: 'M' | 'F' | 'O' | 'UNKNOWN';
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  nationality?: string;
  language?: string;
  maritalStatus?: string;
  religion?: string;
  race?: string;
  ethnicity?: string;
  birthPlace?: string;
  multipleBirthIndicator?: boolean;
  birthOrder?: number;
  mothersMaidenName?: string;
  deathDate?: string;
  deathIndicator?: boolean;
  identitiesCount?: number;
  linksCount?: number;
  updatedAt: string;
  createdAt: string;
}

export interface MatchCandidate {
  record: PatientRecord;
  score: number;
  matchedFields: string[];
  scoreBreakdown: Record<string, number>;
}

export interface MatchResult {
  primaryRecord: PatientRecord;
  candidates: MatchCandidate[];
  threshold: number;
  matchType: 'exact' | 'probabilistic' | 'none';
  consensus: boolean;
}

export interface MatchConfig {
  exactMatchFields: string[];
  probabilisticFields: string[];
  thresholdExact: number;
  thresholdProbabilistic: number;
  thresholdPossible: number;
  blockingKeys: string[];
  weightName: number;
  weightDob: number;
  weightGender: number;
  weightPhone: number;
  weightId: number;
}

export interface ConsentRecord {
  id: string;
  patientId: string;
  consentType: 'data_sharing' | 'research' | 'marketing' | 'cross_site';
  status: 'granted' | 'denied' | 'withdrawn' | 'expired';
  grantedDate?: string;
  expirationDate?: string;
  withdrawnDate?: string;
  scope?: string[];
  restrictions?: string;
  consentMethod?: 'written' | 'electronic' | 'verbal';
  consentDocumentUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkRecord {
  id: string;
  sourcePatientId: string;
  targetPatientId: string;
  linkType: 'same_person' | 'possible_match' | 'related' | 'household';
  confidence: number;
  status: 'active' | 'pending_review' | 'rejected' | 'archived';
  createdBy?: string;
  reviewedBy?: string;
  reviewDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
