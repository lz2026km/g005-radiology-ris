import type { StorageObject, StorageProviderConfig, StorageClass } from './types';

export interface S3AdapterConfig extends StorageProviderConfig {
  provider: 's3';
  forcePathStyle: boolean;
  sseAlgorithm: 'AES256' | 'aws:kms';
  kmsKeyId?: string;
}

export const s3Adapter = {
  async upload(key: string, data: Buffer, config: Partial<S3AdapterConfig>): Promise<StorageObject> {
    return {
      key, bucket: config.bucket || 'default', provider: 's3', tier: 'hot',
      sizeBytes: data.length, hash: '', compressed: false, contentType: 'application/octet-stream',
      metadata: {}, createdAt: new Date().toISOString(), lastAccessedAt: new Date().toISOString(),
    };
  },

  async download(key: string, _config?: Partial<S3AdapterConfig>): Promise<Buffer | null> {
    return null;
  },

  async delete(key: string, _config?: Partial<S3AdapterConfig>): Promise<boolean> {
    return true;
  },

  async list(prefix: string, _config?: Partial<S3AdapterConfig>): Promise<StorageObject[]> {
    return [];
  },

  async copy(sourceKey: string, destKey: string, _config?: Partial<S3AdapterConfig>): Promise<boolean> {
    return true;
  },

  async exists(key: string, _config?: Partial<S3AdapterConfig>): Promise<boolean> {
    return false;
  },

  async getPresignedUrl(key: string, expiresIn: number = 3600, _config?: Partial<S3AdapterConfig>): Promise<string> {
    return `https://s3.presigned/${key}?expires=${expiresIn}`;
  },
};
