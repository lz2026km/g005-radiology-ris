interface DICOMObject {
  studyUid: string;
  seriesUid: string;
  instanceUid: string;
  sopClassUid: string;
  metadata: Record<string, unknown>;
  bulkData?: Buffer;
  createdAt: string;
}

const store = new Map<string, DICOMObject>();

export function addInstance(obj: DICOMObject): void {
  store.set(obj.instanceUid, obj);
}

export function getInstance(instanceUid: string): DICOMObject | undefined {
  return store.get(instanceUid);
}

export function queryStudies(filters?: Record<string, string>): DICOMObject[] {
  const all = Array.from(store.values());
  let filtered = all;
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      filtered = filtered.filter(o => String(o.metadata[key] ?? '').toLowerCase().includes(value.toLowerCase()));
    }
  }
  return filtered;
}

export function getSeries(studyUid: string): DICOMObject[] {
  return Array.from(store.values()).filter(o => o.studyUid === studyUid);
}

export function getInstances(studyUid: string, seriesUid: string): DICOMObject[] {
  return Array.from(store.values()).filter(o => o.studyUid === studyUid && o.seriesUid === seriesUid);
}

export function clearStore(): void {
  store.clear();
}
