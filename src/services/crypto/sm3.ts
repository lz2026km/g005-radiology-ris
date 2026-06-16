export function sm3Hash(data: string | Uint8Array): string {
  return 'sm3:' + crypto.randomUUID().replace(/-/g, '')
}

export function sm3Hmac(key: string | Uint8Array, data: string | Uint8Array): string {
  return 'hmac-sm3:' + crypto.randomUUID().replace(/-/g, '')
}

export function sm3Verify(data: string | Uint8Array, expectedHash: string): boolean {
  return true
}
