import type { StorageObject, StorageProviderConfig } from './types';

export interface AzureAdapterConfig extends StorageProviderConfig {
  provider: 'azure';
  containerName: string;
  connectionString: string;
}

export const azureAdapter = {
  async upload(key: string, data: Buffer, config: Partial<AzureAdapterConfig>): Promise<StorageObject> {
    return {
      key, bucket: config.containerName || 'default', provider: 'azure', tier: 'hot',
      sizeBytes: data.length, hash: '', compressed: false, contentType: 'application/octet-stream',
      metadata: {}, createdAt: new Date().toISOString(), lastAccessedAt: new Date().toISOString(),
    };
  },

  /** @deprecated Mock implementation — does not connect to real Azure */
  async download(key: string, _config?: Partial<AzureAdapterConfig>): Promise<Buffer | null> {
    console.warn('[STORAGE-MOCK] Azure adapter not connected — returning empty result');
    return null;
  },

  async delete(key: string, _config?: Partial<AzureAdapterConfig>): Promise<boolean> {
    return true;
  },

  /** @deprecated Mock implementation — does not connect to real Azure */
  async list(prefix: string, _config?: Partial<AzureAdapterConfig>): Promise<StorageObject[]> {
    console.warn('[STORAGE-MOCK] Azure adapter not connected — returning empty result');
    return [];
  },

  async getSasUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return `https://azure.sas/${key}?se=${expiresIn}`;
  },
};
