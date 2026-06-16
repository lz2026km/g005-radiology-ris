const contentHashStore = new Map<string, string>();

async function sha256Hex(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function computeContentHash(data: Uint8Array | string): Promise<string> {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  return sha256Hex(buf);
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
