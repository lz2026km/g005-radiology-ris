import type { DicomStudy } from './types';

export interface ModalityWorklistItem {
  accessionNumber: string;
  patientId: string;
  patientName: string;
  patientBirthDate?: string;
  patientSex?: 'M' | 'F' | 'O';
  requestedProcedureId?: string;
  requestedProcedureDescription?: string;
  requestedProcedureCode?: string;
  scheduledStationAeTitle?: string;
  scheduledProcedureStepStartDate?: string;
  scheduledProcedureStepStartTime?: string;
  scheduledPerformingPhysicianName?: string;
  scheduledProcedureStepLocation?: string;
  modality: string;
  studyInstanceUid?: string;
  referringPhysician?: string;
  procedureCode?: string;
  procedureDescription?: string;
  bodyPart?: string;
  priority?: string;
}

const worklistItems: ModalityWorklistItem[] = [];

export function getModalityWorklist(modality?: string, stationAe?: string): ModalityWorklistItem[] {
  let items = worklistItems;
  if (modality) items = items.filter(i => i.modality === modality);
  if (stationAe) items = items.filter(i => i.scheduledStationAeTitle === stationAe);
  return items;
}

export function addWorklistItem(item: ModalityWorklistItem): void {
  worklistItems.push(item);
}

export function removeWorklistItem(accessionNumber: string): void {
  const idx = worklistItems.findIndex(i => i.accessionNumber === accessionNumber);
  if (idx >= 0) worklistItems.splice(idx, 1);
}

export function clearWorklist(): void {
  worklistItems.length = 0;
}

export async function mwlScpHandler(query: Partial<ModalityWorklistItem>): Promise<ModalityWorklistItem[]> {
  return getModalityWorklist(query.modality, query.scheduledStationAeTitle);
}
