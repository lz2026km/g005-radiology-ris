import type { StorageObject, StorageProviderConfig } from './types';

export interface GlacierAdapterConfig extends StorageProviderConfig {
  provider: 'glacier';
  vaultName: string;
  retrievalTier: 'Expedited' | 'Standard' | 'Bulk';
}

export const glacierAdapter = {
  async archive(key: string, data: Buffer, config: Partial<GlacierAdapterConfig>): Promise<StorageObject> {
    return {
      key, bucket: config.vaultName || 'default', provider: 'glacier', tier: 'glacier',
      sizeBytes: data.length, hash: '', compressed: false, contentType: 'application/octet-stream',
      metadata: {}, createdAt: new Date().toISOString(), lastAccessedAt: new Date().toISOString(),
    };
  },

  async initiateRetrieval(key: string, _tier: string = 'Standard', _config?: Partial<GlacierAdapterConfig>): Promise<string> {
    return `retrieval-job-${Date.now()}`;
  },

  async checkRetrievalStatus(_jobId: string): Promise<'in-progress' | 'completed' | 'failed'> {
    return 'completed';
  },

  /** @deprecated Mock implementation — does not connect to real Glacier */
  async downloadRetrieved(_jobId: string): Promise<Buffer | null> {
    console.warn('[STORAGE-MOCK] Glacier adapter not connected — returning empty result');
    return null;
  },

  async deleteArchive(key: string, _config?: Partial<GlacierAdapterConfig>): Promise<boolean> {
    return true;
  },

  /** @deprecated Mock implementation — does not connect to real Glacier */
  async listArchives(_config?: Partial<GlacierAdapterConfig>): Promise<StorageObject[]> {
    console.warn('[STORAGE-MOCK] Glacier adapter not connected — returning empty result');
    return [];
  },
};
