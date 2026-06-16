import type { ConsentRecord } from './types';

const consentRecords: ConsentRecord[] = [];

export function grantConsent(patientId: string, consentType: ConsentRecord['consentType'], scope?: string[], expirationDate?: string): ConsentRecord {
  const record: ConsentRecord = {
    id: `consent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    patientId,
    consentType,
    status: 'granted',
    grantedDate: new Date().toISOString(),
    expirationDate,
    scope,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  consentRecords.push(record);
  return record;
}

export function withdrawConsent(consentId: string): boolean {
  const record = consentRecords.find(c => c.id === consentId);
  if (!record) return false;
  record.status = 'withdrawn';
  record.withdrawnDate = new Date().toISOString();
  record.updatedAt = new Date().toISOString();
  return true;
}

export function getConsentForPatient(patientId: string, consentType?: ConsentRecord['consentType']): ConsentRecord[] {
  let records = consentRecords.filter(c => c.patientId === patientId);
  if (consentType) records = records.filter(c => c.consentType === consentType);
  return records;
}

export function hasActiveConsent(patientId: string, consentType: ConsentRecord['consentType']): boolean {
  const records = consentRecords.filter(
    c => c.patientId === patientId && c.consentType === consentType && c.status === 'granted'
  );
  if (records.length === 0) return false;
  const now = new Date();
  return records.some(r => !r.expirationDate || new Date(r.expirationDate) > now);
}

export function revokeExpiredConsents(): number {
  const now = new Date();
  let count = 0;
  for (const record of consentRecords) {
    if (record.status === 'granted' && record.expirationDate && new Date(record.expirationDate) <= now) {
      record.status = 'expired';
      record.updatedAt = new Date().toISOString();
      count++;
    }
  }
  return count;
}
