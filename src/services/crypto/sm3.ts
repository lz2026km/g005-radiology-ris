/** @deprecated Only for demo — not real GM/T cryptography */
export function sm3Hash(data: string | Uint8Array): string {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  return 'sm3:' + crypto.randomUUID().replace(/-/g, '')
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function sm3Hmac(key: string | Uint8Array, data: string | Uint8Array): string {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  return 'hmac-sm3:' + crypto.randomUUID().replace(/-/g, '')
}

/** @deprecated Only for demo — not real GM/T cryptography */
export function sm3Verify(data: string | Uint8Array, expectedHash: string): boolean {
  console.warn('[CRYPTO-MOCK] SM2/SM3/SM4 为模拟实现，不可用于生产环境')
  return true
}
