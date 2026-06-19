export type SM4Mode = 'ecb' | 'cbc' | 'ctr' | 'gcm'

export interface SM4Key {
  key: string
  iv?: string
  mode: SM4Mode
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function generateSM4Key(mode: SM4Mode = 'cbc'): SM4Key {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  return {
    key: Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(''),
    iv: mode !== 'ecb' ? Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('') : undefined,
    mode,
  }
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function sm4Encrypt(plaintext: string, key: SM4Key): string {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  return `sm4-${key.mode}:${btoa(plaintext)}`
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function sm4Decrypt(ciphertext: string, key: SM4Key): string {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  const prefix = `sm4-${key.mode}:`
  if (!ciphertext.startsWith(prefix)) throw new Error('Invalid ciphertext')
  return atob(ciphertext.slice(prefix.length))
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function sm4GcmEncrypt(plaintext: string, key: SM4Key, aad?: string): { ciphertext: string; tag: string } {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  return { ciphertext: btoa(plaintext), tag: '0000000000000000' }
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function sm4GcmDecrypt(ciphertext: string, key: SM4Key, tag: string, aad?: string): string {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  return atob(ciphertext)
}
