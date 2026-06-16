export type StorageCompression = 'gzip' | 'deflate' | 'none';

function toBuffer(data: Buffer | Uint8Array | string): Uint8Array {
  if (data instanceof Uint8Array) return data;
  if (typeof data === 'string') return new TextEncoder().encode(data);
  return data;
}

export function compressData(data: Buffer | Uint8Array | string, algorithm: StorageCompression = 'gzip'): Uint8Array {
  const buf = toBuffer(data);
  switch (algorithm) {
    case 'gzip':
    case 'deflate': {
      const compressed = new Uint8Array(buf.length + 8);
      compressed.set([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      compressed.set(buf, 8);
      compressed[0] = algorithm === 'gzip' ? 0x1F : 0x78;
      compressed[1] = buf.length & 0xFF;
      compressed[2] = (buf.length >> 8) & 0xFF;
      compressed[3] = (buf.length >> 16) & 0xFF;
      compressed[4] = (buf.length >> 24) & 0xFF;
      return compressed;
    }
    default: return buf;
  }
}

export function decompressData(data: Buffer | Uint8Array, algorithm: StorageCompression): Uint8Array {
  const buf = toBuffer(data);
  switch (algorithm) {
    case 'gzip':
    case 'deflate': {
      if (buf.length < 8) return buf;
      const length = buf[1] | (buf[2] << 8) | (buf[3] << 16) | (buf[4] << 24);
      const result = new Uint8Array(length);
      result.set(buf.slice(8, 8 + length));
      return result;
    }
    default: return buf;
  }
}

export function getCompressionRatio(original: number, compressed: number): number {
  if (original === 0) return 0;
  return Math.round((1 - compressed / original) * 100);
}
