import type { DicomInstance } from './types';

interface DuplicateResult {
  isDuplicate: boolean;
  existingStudyUid?: string;
  existingSeriesUid?: string;
  existingInstanceUid?: string;
  confidence: number;
}

const hashCache = new Map<string, string>();

function computeHash(data: Uint8Array): string {
  let hash = 0;
  for (let i = 0; i < Math.min(data.length, 1024 * 1024); i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash |= 0;
  }
  return `hash_${hash}_${data.length}`;
}

export function checkInstanceDuplicate(instance: DicomInstance): DuplicateResult {
  if (instance.hash && hashCache.has(instance.hash)) {
    const existing = hashCache.get(instance.hash)!;
    return { isDuplicate: true, existingInstanceUid: existing, confidence: 1.0 };
  }
  if (instance.pixelData) {
    const hash = computeHash(instance.pixelData);
    if (hashCache.has(hash)) {
      const existing = hashCache.get(hash)!;
      return { isDuplicate: true, existingInstanceUid: existing, confidence: 0.99 };
    }
    hashCache.set(hash, instance.sopInstanceUid);
  }
  return { isDuplicate: false, confidence: 0 };
}

export function registerInstanceHash(instance: DicomInstance): void {
  if (instance.hash) {
    hashCache.set(instance.hash, instance.sopInstanceUid);
  }
  if (instance.pixelData) {
    const hash = computeHash(instance.pixelData);
    hashCache.set(hash, instance.sopInstanceUid);
  }
}

export function checkStudyDuplicate(instances: DicomInstance[]): { isDuplicate: boolean; duplicateCount: number } {
  let duplicateCount = 0;
  for (const instance of instances) {
    const result = checkInstanceDuplicate(instance);
    if (result.isDuplicate) duplicateCount++;
  }
  return { isDuplicate: duplicateCount > 0, duplicateCount };
}
