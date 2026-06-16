import { gzipSync, gunzipSync, deflateSync, inflateSync } from 'zlib';

export type StorageCompression = 'gzip' | 'deflate' | 'none';

export function compressData(data: Buffer, algorithm: StorageCompression = 'gzip'): Buffer {
  switch (algorithm) {
    case 'gzip': return gzipSync(data);
    case 'deflate': return deflateSync(data);
    default: return data;
  }
}

export function decompressData(data: Buffer, algorithm: StorageCompression): Buffer {
  switch (algorithm) {
    case 'gzip': return gunzipSync(data);
    case 'deflate': return inflateSync(data);
    default: return data;
  }
}

export function getCompressionRatio(original: number, compressed: number): number {
  if (original === 0) return 0;
  return Math.round((1 - compressed / original) * 100);
}
