import { v4 as uuid } from 'uuid';
import type {
  PatientConsent,
  PatientConsentType,
  PatientConsentStatus,
  PatientConsentMethod,
} from '../../types/portal';

const CONSENT_STORE = new Map<string, PatientConsent>();

export class ConsentService {
  async createTemplate(params: {
    type: PatientConsentType;
    templateName: string;
    contentSummary: string;
    fullContent: string;
    validDays?: number;
  }): Promise<{ templateId: string; templateVersion: string }> {
    return {
      templateId: `ct-${uuid().slice(0, 8)}`,
      templateVersion: '1.0.0',
    };
  }

  async requestConsent(params: {
    patientId: string;
    patientName: string;
    patientIdCard?: string;
    type: PatientConsentType;
    templateId: string;
    templateName: string;
    templateVersion: string;
    contentSummary: string;
    fullContent: string;
    relatedResourceIds?: string[];
    validDays?: number;
    createdBy: string;
  }): Promise<PatientConsent> {
    const id = `consent-${uuid().slice(0, 8)}`;
    const now = new Date().toISOString();
    const validFrom = new Date().toISOString();
    const validTo = new Date(Date.now() + (params.validDays ?? 365) * 86400000).toISOString();
    const consent: PatientConsent = {
      id,
      patientId: params.patientId,
      patientName: params.patientName,
      patientIdCard: params.patientIdCard,
      type: params.type,
      templateId: params.templateId,
      templateName: params.templateName,
      templateVersion: params.templateVersion,
      contentSummary: params.contentSummary,
      fullContent: params.fullContent,
      status: 'pending',
      validFrom,
      validTo,
      relatedResourceIds: params.relatedResourceIds ?? [],
      createdAt: now,
      createdBy: params.createdBy,
    };
    CONSENT_STORE.set(id, consent);
    return consent;
  }

  async signConsent(
    id: string,
    method: PatientConsentMethod,
    signatureData?: string,
    signatureCertId?: string,
    witnessName?: string,
    ipAddress?: string,
    deviceFingerprint?: string,
  ): Promise<PatientConsent> {
    const consent = CONSENT_STORE.get(id);
    if (!consent) throw new Error(`Consent ${id} not found`);
    consent.status = 'signed';
    consent.signedAt = new Date().toISOString();
    consent.signedMethod = method;
    consent.signatureData = signatureData;
    consent.signatureCertId = signatureCertId;
    consent.witnessName = witnessName;
    consent.ipAddress = ipAddress;
    consent.deviceFingerprint = deviceFingerprint;
    CONSENT_STORE.set(id, consent);
    return consent;
  }

  async rejectConsent(id: string): Promise<PatientConsent> {
    const consent = CONSENT_STORE.get(id);
    if (!consent) throw new Error(`Consent ${id} not found`);
    consent.status = 'rejected';
    CONSENT_STORE.set(id, consent);
    return consent;
  }

  async revokeConsent(id: string, reason?: string): Promise<PatientConsent> {
    const consent = CONSENT_STORE.get(id);
    if (!consent) throw new Error(`Consent ${id} not found`);
    consent.status = 'revoked';
    consent.revokedAt = new Date().toISOString();
    consent.revokeReason = reason;
    CONSENT_STORE.set(id, consent);
    return consent;
  }

  async getConsent(id: string): Promise<PatientConsent | undefined> {
    return CONSENT_STORE.get(id);
  }

  async listByPatient(patientId: string): Promise<PatientConsent[]> {
    return [...CONSENT_STORE.values()]
      .filter(c => c.patientId === patientId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listByType(type: PatientConsentType, status?: PatientConsentStatus): Promise<PatientConsent[]> {
    let list = [...CONSENT_STORE.values()].filter(c => c.type === type);
    if (status) list = list.filter(c => c.status === status);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export const consentService = new ConsentService();
