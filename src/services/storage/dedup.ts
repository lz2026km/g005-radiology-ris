import { createHash } from 'crypto';

const contentHashStore = new Map<string, string>();

export function computeContentHash(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

export function isDuplicate(hash: string): boolean {
  return contentHashStore.has(hash);
}

export function registerContent(hash: string, storageKey: string): void {
  if (!contentHashStore.has(hash)) {
    contentHashStore.set(hash, storageKey);
  }
}

export function getExistingKey(hash: string): string | undefined {
  return contentHashStore.get(hash);
}

export function getDedupStats(): { totalHashes: number; totalSavedBytes: number } {
  return { totalHashes: contentHashStore.size, totalSavedBytes: 0 };
}
