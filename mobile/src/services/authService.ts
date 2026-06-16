import { useMobileStore } from '../store/mobileStore'

export interface BiometricAuthResult {
  success: boolean
  error?: string
  method: 'face' | 'fingerprint' | 'pin' | 'none'
}

export interface TokenInfo {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

const STORAGE_KEY = 'g005_mobile_auth'

class AuthService {
  private tokenInfo: TokenInfo | null = null

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.tokenInfo = JSON.parse(stored) as TokenInfo
        useMobileStore.getState().setAuthToken(this.tokenInfo.accessToken)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  private persistToken(info: TokenInfo): void {
    this.tokenInfo = info
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info))
    useMobileStore.getState().setAuthToken(info.accessToken)
    this.scheduleRefresh()
  }

  private scheduleRefresh(): void {
    if (!this.tokenInfo) return
    const expiresIn = this.tokenInfo.expiresAt - Date.now()
    const refreshIn = Math.max(0, expiresIn - 60000)
    setTimeout(() => this.refreshToken(), refreshIn)
  }

  async authenticate(username: string, password: string): Promise<TokenInfo> {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!response.ok) throw new Error('Authentication failed')
    const tokenInfo: TokenInfo = await response.json()
    this.persistToken(tokenInfo)
    return tokenInfo
  }

  async refreshToken(): Promise<void> {
    if (!this.tokenInfo?.refreshToken) throw new Error('No refresh token available')
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.tokenInfo.refreshToken }),
    })
    if (!response.ok) {
      this.logout()
      throw new Error('Token refresh failed')
    }
    const tokenInfo: TokenInfo = await response.json()
    this.persistToken(tokenInfo)
  }

  async biometricAuth(): Promise<BiometricAuthResult> {
    if ('PublicKeyCredential' in window) {
      try {
        const credential = await navigator.credentials.get({ publicKey: { challenge: new Uint8Array(32), timeout: 30000 } })
        if (credential) {
          return { success: true, method: 'face' }
        }
      } catch {
        return { success: false, error: 'Biometric authentication failed', method: 'none' }
      }
    }
    return { success: false, error: 'Biometric not supported', method: 'none' }
  }

  async checkBiometricSupport(): Promise<boolean> {
    return 'PublicKeyCredential' in window
  }

  logout(): void {
    this.tokenInfo = null
    localStorage.removeItem(STORAGE_KEY)
    useMobileStore.getState().logout()
  }

  isAuthenticated(): boolean {
    return !!this.tokenInfo && this.tokenInfo.expiresAt > Date.now()
  }
}

export const authService = new AuthService()
