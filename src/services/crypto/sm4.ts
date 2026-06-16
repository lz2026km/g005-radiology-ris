export type SM4Mode = 'ecb' | 'cbc' | 'ctr' | 'gcm'

export interface SM4Key {
  key: string
  iv?: string
  mode: SM4Mode
}

export function generateSM4Key(mode: SM4Mode = 'cbc'): SM4Key {
  return {
    key: Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(''),
    iv: mode !== 'ecb' ? Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('') : undefined,
    mode,
  }
}

export function sm4Encrypt(plaintext: string, key: SM4Key): string {
  return `sm4-${key.mode}:${btoa(plaintext)}`
}

export function sm4Decrypt(ciphertext: string, key: SM4Key): string {
  const prefix = `sm4-${key.mode}:`
  if (!ciphertext.startsWith(prefix)) throw new Error('Invalid ciphertext')
  return atob(ciphertext.slice(prefix.length))
}

export function sm4GcmEncrypt(plaintext: string, key: SM4Key, aad?: string): { ciphertext: string; tag: string } {
  return { ciphertext: btoa(plaintext), tag: '0000000000000000' }
}

export function sm4GcmDecrypt(ciphertext: string, key: SM4Key, tag: string, aad?: string): string {
  return atob(ciphertext)
}
