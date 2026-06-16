export interface EncryptedData {
  iv: string
  data: string
  algorithm: string
}

class EncryptionService {
  private algorithm = 'AES-GCM'
  private key: CryptoKey | null = null
  private readonly keyStorageKey = 'g005_encryption_key'

  private async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      { name: this.algorithm, length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )
  }

  private async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key)
    const bytes = new Uint8Array(exported)
    return btoa(String.fromCharCode(...bytes))
  }

  private async importKey(keyBase64: string): Promise<CryptoKey> {
    const bytes = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0))
    return crypto.subtle.importKey('raw', bytes, { name: this.algorithm }, false, ['encrypt', 'decrypt'])
  }

  async initialize(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.keyStorageKey)
      if (stored) {
        this.key = await this.importKey(stored)
      } else {
        this.key = await this.generateKey()
        const exported = await this.exportKey(this.key)
        localStorage.setItem(this.keyStorageKey, exported)
      }
    } catch {
      this.key = await this.generateKey()
    }
  }

  async encrypt(plaintext: string): Promise<EncryptedData> {
    if (!this.key) await this.initialize()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(plaintext)
    const encrypted = await crypto.subtle.encrypt(
      { name: this.algorithm, iv },
      this.key!,
      encoded,
    )
    return {
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      algorithm: this.algorithm,
    }
  }

  async decrypt(encrypted: EncryptedData): Promise<string> {
    if (!this.key) await this.initialize()
    const iv = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0))
    const data = Uint8Array.from(atob(encrypted.data), c => c.charCodeAt(0))
    const decrypted = await crypto.subtle.decrypt(
      { name: this.algorithm, iv },
      this.key!,
      data,
    )
    return new TextDecoder().decode(decrypted)
  }

  async encryptObject<T>(obj: T): Promise<EncryptedData> {
    return this.encrypt(JSON.stringify(obj))
  }

  async decryptObject<T>(encrypted: EncryptedData): Promise<T> {
    const decrypted = await this.decrypt(encrypted)
    return JSON.parse(decrypted) as T
  }
}

export const encryptionService = new EncryptionService()
