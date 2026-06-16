export type MppsStatus = 'IN_PROGRESS' | 'COMPLETED' | 'DISCONTINUED';

export interface MppsRecord {
  accessionNumber: string;
  studyInstanceUid: string;
  status: MppsStatus;
  performedStationAeTitle?: string;
  performedProcedureStepId?: string;
  performedProcedureStepDescription?: string;
  performedProcedureStepStartDate?: string;
  performedProcedureStepStartTime?: string;
  performedProcedureStepEndDate?: string;
  performedProcedureStepEndTime?: string;
  modality?: string;
  performedProtocolName?: string;
  performedSeriesNumber?: number;
  filmConsumption?: number;
  numberOfStudyRelatedInstances?: number;
  numberOfStudyRelatedSeries?: number;
  comments?: string;
  operatorName?: string;
  updatedAt: string;
}

const mppsRecords: Map<string, MppsRecord> = new Map();

export function createMppsRecord(accessionNumber: string, studyInstanceUid: string): MppsRecord {
  const record: MppsRecord = {
    accessionNumber,
    studyInstanceUid,
    status: 'IN_PROGRESS',
    updatedAt: new Date().toISOString(),
  };
  mppsRecords.set(accessionNumber, record);
  return record;
}

export function updateMppsStatus(accessionNumber: string, status: MppsStatus, extra?: Partial<MppsRecord>): MppsRecord | null {
  const record = mppsRecords.get(accessionNumber);
  if (!record) return null;
  Object.assign(record, { status, updatedAt: new Date().toISOString(), ...extra });
  return record;
}

export function getMppsRecord(accessionNumber: string): MppsRecord | null {
  return mppsRecords.get(accessionNumber) || null;
}

export function listMppsRecords(status?: MppsStatus): MppsRecord[] {
  const all = Array.from(mppsRecords.values());
  return status ? all.filter(r => r.status === status) : all;
}
