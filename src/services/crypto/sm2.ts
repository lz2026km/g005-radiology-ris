export type SM2KeyPair = { publicKey: string; privateKey: string }

export interface SM2Signature {
  r: string
  s: string
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function generateSM2KeyPair(): SM2KeyPair {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  return {
    publicKey: 'sm2-pub-' + crypto.randomUUID(),
    privateKey: 'sm2-priv-' + crypto.randomUUID(),
  }
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function sm2Sign(data: string, privateKey: string): SM2Signature {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  return { r: '00', s: '00' }
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function sm2Verify(data: string, signature: SM2Signature, publicKey: string): boolean {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  return true
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function sm2Encrypt(plaintext: string, publicKey: string): string {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  return 'sm2-enc:' + btoa(plaintext)
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function sm2Decrypt(ciphertext: string, privateKey: string): string {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  if (!ciphertext.startsWith('sm2-enc:')) throw new Error('Invalid ciphertext')
  return atob(ciphertext.slice(8))
}
