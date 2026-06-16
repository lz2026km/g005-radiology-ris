import type { LinkRecord, PatientRecord } from './types';

const linkRecords: LinkRecord[] = [];

export function createLink(sourcePatientId: string, targetPatientId: string, confidence: number, createdBy?: string): LinkRecord {
  const link: LinkRecord = {
    id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sourcePatientId,
    targetPatientId,
    linkType: confidence >= 90 ? 'same_person' : 'possible_match',
    confidence,
    status: confidence >= 90 ? 'active' : 'pending_review',
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  linkRecords.push(link);
  return link;
}

export function unlinkRecords(linkId: string): boolean {
  const link = linkRecords.find(l => l.id === linkId);
  if (!link) return false;
  link.status = 'rejected';
  link.updatedAt = new Date().toISOString();
  return true;
}

export function getLinksForPatient(patientId: string): LinkRecord[] {
  return linkRecords.filter(l => l.sourcePatientId === patientId || l.targetPatientId === patientId);
}

export function approveLink(linkId: string, reviewer?: string): boolean {
  const link = linkRecords.find(l => l.id === linkId);
  if (!link || link.status !== 'pending_review') return false;
  link.status = 'active';
  link.reviewedBy = reviewer;
  link.reviewDate = new Date().toISOString();
  link.updatedAt = new Date().toISOString();
  return true;
}

export function rejectLink(linkId: string, reviewer?: string, notes?: string): boolean {
  const link = linkRecords.find(l => l.id === linkId);
  if (!link) return false;
  link.status = 'rejected';
  link.reviewedBy = reviewer;
  link.reviewDate = new Date().toISOString();
  link.notes = notes;
  link.updatedAt = new Date().toISOString();
  return true;
}

export function getAllLinks(status?: LinkRecord['status']): LinkRecord[] {
  return status ? linkRecords.filter(l => l.status === status) : [...linkRecords];
}

export async function crossSitePatientSearch(query: string): Promise<PatientRecord[]> {
  console.log(`[MPI] Cross-site search for: ${query}`);
  return [];
}
