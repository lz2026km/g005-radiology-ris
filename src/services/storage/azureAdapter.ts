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

  async download(key: string, _config?: Partial<AzureAdapterConfig>): Promise<Buffer | null> {
    return null;
  },

  async delete(key: string, _config?: Partial<AzureAdapterConfig>): Promise<boolean> {
    return true;
  },

  async list(prefix: string, _config?: Partial<AzureAdapterConfig>): Promise<StorageObject[]> {
    return [];
  },

  async getSasUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return `https://azure.sas/${key}?se=${expiresIn}`;
  },
};
