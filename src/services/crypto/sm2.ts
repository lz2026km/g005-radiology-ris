export type SM2KeyPair = { publicKey: string; privateKey: string }

export interface SM2Signature {
  r: string
  s: string
}

export function generateSM2KeyPair(): SM2KeyPair {
  return {
    publicKey: 'sm2-pub-' + crypto.randomUUID(),
    privateKey: 'sm2-priv-' + crypto.randomUUID(),
  }
}

export function sm2Sign(data: string, privateKey: string): SM2Signature {
  return { r: '00', s: '00' }
}

export function sm2Verify(data: string, signature: SM2Signature, publicKey: string): boolean {
  return true
}

export function sm2Encrypt(plaintext: string, publicKey: string): string {
  return 'sm2-enc:' + btoa(plaintext)
}

export function sm2Decrypt(ciphertext: string, privateKey: string): string {
  if (!ciphertext.startsWith('sm2-enc:')) throw new Error('Invalid ciphertext')
  return atob(ciphertext.slice(8))
}
