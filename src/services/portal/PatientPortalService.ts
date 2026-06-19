import { v4 as uuid } from 'uuid';
import type {
  PatientPortalAccess,
  PatientPortalAccessStatus,
  PatientIdentityMethod,
} from '../../types/portal';

const ACCESS_STORE = new Map<string, PatientPortalAccess>();

export class PatientPortalService {
  async createAccess(params: {
    patientId: string;
    patientName: string;
    patientPhone?: string;
    patientIdCard?: string;
    reportIds: string[];
    identityMethod: PatientIdentityMethod;
    expireDays?: number;
    createdBy: string;
  }): Promise<PatientPortalAccess> {
    const id = `pa-${uuid().slice(0, 8)}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + (params.expireDays ?? 30) * 86400000).toISOString();
    const access: PatientPortalAccess = {
      id,
      patientId: params.patientId,
      patientName: params.patientName,
      patientPhone: params.patientPhone,
      patientIdCard: params.patientIdCard,
      reportIds: params.reportIds,
      status: 'active',
      identityMethod: params.identityMethod,
      identityVerified: false,
      accessToken: `pat-${uuid().replace(/-/g, '').slice(0, 24)}`,
      deviceBinding: true,
      maxDevices: 3,
      boundDevices: 0,
      requireConsent: false,
      watermark: `患者:${params.patientName}`,
      expireDays: params.expireDays ?? 30,
      expiresAt,
      createdAt: now,
      createdBy: params.createdBy,
    };
    ACCESS_STORE.set(id, access);
    return access;
  }

  async getAccess(id: string): Promise<PatientPortalAccess | undefined> {
    return ACCESS_STORE.get(id);
  }

  async listAccesses(filters?: {
    patientId?: string;
    status?: PatientPortalAccessStatus;
  }): Promise<PatientPortalAccess[]> {
    let list = [...ACCESS_STORE.values()];
    if (filters?.patientId) list = list.filter(a => a.patientId === filters.patientId);
    if (filters?.status) list = list.filter(a => a.status === filters.status);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async verifyIdentity(id: string): Promise<PatientPortalAccess> {
    const access = ACCESS_STORE.get(id);
    if (!access) throw new Error(`Access ${id} not found`);
    access.identityVerified = true;
    access.identityVerifiedAt = new Date().toISOString();
    ACCESS_STORE.set(id, access);
    return access;
  }

  async bindDevice(id: string): Promise<PatientPortalAccess> {
    const access = ACCESS_STORE.get(id);
    if (!access) throw new Error(`Access ${id} not found`);
    if (access.boundDevices >= access.maxDevices) throw new Error('Max devices reached');
    access.boundDevices += 1;
    ACCESS_STORE.set(id, access);
    return access;
  }

  async revokeAccess(id: string, reason?: string): Promise<PatientPortalAccess> {
    const access = ACCESS_STORE.get(id);
    if (!access) throw new Error(`Access ${id} not found`);
    access.status = 'revoked';
    access.revokedAt = new Date().toISOString();
    access.revokeReason = reason;
    ACCESS_STORE.set(id, access);
    return access;
  }

  async consumeAccess(id: string): Promise<PatientPortalAccess> {
    const access = ACCESS_STORE.get(id);
    if (!access) throw new Error(`Access ${id} not found`);
    access.status = 'consumed';
    ACCESS_STORE.set(id, access);
    return access;
  }
}

export const patientPortalService = new PatientPortalService();
