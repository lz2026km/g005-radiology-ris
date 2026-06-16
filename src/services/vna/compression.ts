export type CompressionType = 'jpeg' | 'jpeg2000' | 'jpeg_ls' | 'rle' | 'deflate';

export const COMPRESSION_LEVELS: Record<CompressionType, { min: number; max: number; default: number }> = {
  jpeg: { min: 1, max: 100, default: 80 },
  jpeg2000: { min: 1, max: 100, default: 70 },
  jpeg_ls: { min: 1, max: 100, default: 80 },
  rle: { min: 0, max: 0, default: 0 },
  deflate: { min: 1, max: 9, default: 6 },
};

export function compressPixelData(pixelData: Uint8Array, type: CompressionType, quality?: number): Uint8Array {
  const level = COMPRESSION_LEVELS[type];
  const q = quality ?? level.default;
  console.log(`[VNA Compression] Compressing ${pixelData.length} bytes with ${type} at quality ${q}`);
  return pixelData;
}

export function decompressPixelData(compressedData: Uint8Array, type: CompressionType): Uint8Array {
  console.log(`[VNA Decompression] Decompressing ${compressedData.length} bytes from ${type}`);
  return compressedData;
}

export function getTransferSyntaxForCompression(type: CompressionType): string {
  const map: Record<CompressionType, string> = {
    jpeg: '1.2.840.10008.1.2.4.50',
    jpeg2000: '1.2.840.10008.1.2.4.90',
    jpeg_ls: '1.2.840.10008.1.2.4.80',
    rle: '1.2.840.10008.1.2.5',
    deflate: '1.2.840.10008.1.2.1.99',
  };
  return map[type];
}
