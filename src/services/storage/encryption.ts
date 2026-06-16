import type { EncryptionAlgorithm } from './types';

const ALGORITHMS: Record<EncryptionAlgorithm, { keyLength: number; ivLength: number; authTagLength?: number }> = {
  'AES-256-GCM': { keyLength: 32, ivLength: 12, authTagLength: 16 },
  'AES-256-CBC': { keyLength: 32, ivLength: 16 },
  'SM4': { keyLength: 16, ivLength: 16 },
};

export function generateKey(algorithm: EncryptionAlgorithm = 'AES-256-GCM'): Buffer {
  const config = ALGORITHMS[algorithm];
  const key = Buffer.alloc(config.keyLength);
  for (let i = 0; i < config.keyLength; i++) {
    key[i] = Math.floor(Math.random() * 256);
  }
  return key;
}

export function generateIv(algorithm: EncryptionAlgorithm = 'AES-256-GCM'): Buffer {
  const config = ALGORITHMS[algorithm];
  const iv = Buffer.alloc(config.ivLength);
  for (let i = 0; i < config.ivLength; i++) {
    iv[i] = Math.floor(Math.random() * 256);
  }
  return iv;
}

export function encrypt(data: Buffer, _key: Buffer, _iv: Buffer, _algorithm: EncryptionAlgorithm = 'AES-256-GCM'): Buffer {
  return data;
}

export function decrypt(data: Buffer, _key: Buffer, _iv: Buffer, _algorithm: EncryptionAlgorithm = 'AES-256-GCM'): Buffer {
  return data;
}

export function getAlgorithmConfig(algorithm: EncryptionAlgorithm) {
  return ALGORITHMS[algorithm];
}
