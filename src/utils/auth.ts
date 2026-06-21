/**
 * Authentication & Session Management
 * G005 Radiology RIS System
 * S1: Token-based auth, S7: Session timeout & token refresh
 * v3.0.3.32: Tokens moved from sessionStorage to in-memory only (XSS mitigation)
 */

import { v4 as uuidv4 } from 'uuid';

// ============= In-Memory Token Store (XSS-resilient) =============
// Tokens are NEVER persisted to storage. They live only in this module's
// scope, so a successful XSS payload cannot exfiltrate them across reloads.
// Trade-off: a full page reload forces a refresh-cookie based re-auth.

let inMemoryToken: AuthToken | null = null;

interface CurrentUser {
  id: string;
  name: string;
  role: string;
}

// Default session timeout (30 minutes of inactivity)
const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes before expiry

export interface AuthToken {
  token: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  userName: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Activity tracking for session timeout
let lastActivityTime = Date.now();
let activityCheckInterval: number | null = null;
let tokenRefreshInterval: number | null = null;
let sessionTimeoutCallback: (() => void) | null = null;

/**
 * Update last activity timestamp
 */
export function updateActivity(): void {
  lastActivityTime = Date.now();
}

/**
 * Set session timeout callback
 */
export function onSessionTimeout(callback: () => void): void {
  sessionTimeoutCallback = callback;
}

/**
 * Start activity monitoring
 */
export function startActivityMonitoring(timeoutMs: number = DEFAULT_SESSION_TIMEOUT): void {
  stopActivityMonitoring();

  activityCheckInterval = window.setInterval(() => {
    const elapsed = Date.now() - lastActivityTime;
    if (elapsed >= timeoutMs) {
      logout();
      sessionTimeoutCallback?.();
    }
  }, 30000);

  startTokenRefresh();
}

/**
 * Stop activity monitoring
 */
export function stopActivityMonitoring(): void {
  if (activityCheckInterval) {
    clearInterval(activityCheckInterval);
    activityCheckInterval = null;
  }
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }
}

/**
 * Start automatic token refresh
 */
function startTokenRefresh(): void {
  tokenRefreshInterval = window.setInterval(() => {
    const token = getToken();
    if (!token) return;

    const expiry = getTokenExpiry();
    if (!expiry) return;

    const timeUntilExpiry = expiry - Date.now();

    if (timeUntilExpiry > 0 && timeUntilExpiry <= TOKEN_REFRESH_INTERVAL) {
      void refreshToken();
    }
  }, 60000);
}

/**
 * Generate new auth token (mock implementation)
 */
function generateToken(): string {
  return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
}

/**
 * 根据用户名映射角色。医生: 含 doctor/physician/rad/medical, 主任/副主任医师是 senior,
 * 审核医师是 reviewer, 管理员: 含 admin/manager/director.
 * 默认医生。
 */
const ROLE_MAP: Array<{ pattern: RegExp; role: string }> = [
  { pattern: /admin|manager/i, role: '管理员' },
  { pattern: /director/i, role: '科室主任' },
  { pattern: /chief/i, role: '主任医师' },
  { pattern: /associate[-_]?chief|senior/i, role: '副主任医师' },
  { pattern: /attending/i, role: '主治医师' },
  { pattern: /resident|intern/i, role: '住院医师' },
  { pattern: /reviewer|review/i, role: '审核医师' },
  { pattern: /nurse/i, role: '护士' },
  { pattern: /tech/i, role: '技师' },
  { pattern: /doctor|physician|rad|medical/i, role: '医生' },
];

function deriveRole(username: string): string {
  for (const { pattern, role } of ROLE_MAP) {
    if (pattern.test(username)) return role;
  }
  return '医生';
}

/**
 * Login with credentials
 */
export async function login(credentials: LoginCredentials): Promise<AuthToken> {
  const token: AuthToken = {
    token: generateToken(),
    refreshToken: generateToken(),
    expiresAt: Date.now() + DEFAULT_SESSION_TIMEOUT,
    userId: uuidv4(),
    userName: credentials.username,
    role: deriveRole(credentials.username),
  };

  setToken(token);
  startActivityMonitoring();

  return token;
}

/**
 * Logout and clear session
 */
export function logout(): void {
  clearToken();
  stopActivityMonitoring();
}

/**
 * Set auth token (in-memory only)
 */
export function setToken(token: AuthToken): void {
  inMemoryToken = { ...token };
}

/**
 * Get current bearer token
 */
export function getToken(): string | null {
  return inMemoryToken?.token ?? null;
}

/**
 * Get token expiry timestamp
 */
export function getTokenExpiry(): number | null {
  return inMemoryToken?.expiresAt ?? null;
}

/**
 * Clear token from memory
 */
export function clearToken(): void {
  inMemoryToken = null;
}

/**
 * Refresh token via the refresh-cookie (HttpOnly) flow.
 * The browser sends the refresh cookie automatically; the server
 * returns a fresh access token that we keep in memory only.
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return false;
    const body = (await res.json()) as {
      success: boolean;
      data?: { token: string; expiresAt?: number; userId?: string; userName?: string; role?: string };
    };
    if (!body.success || !body.data?.token) return false;

    const previous = inMemoryToken;
    inMemoryToken = {
      token: body.data.token,
      refreshToken: previous?.refreshToken ?? generateToken(),
      expiresAt: body.data.expiresAt ?? Date.now() + DEFAULT_SESSION_TIMEOUT,
      userId: body.data.userId ?? previous?.userId ?? '',
      userName: body.data.userName ?? previous?.userName ?? '',
      role: body.data.role ?? previous?.role ?? '医生',
    };
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): CurrentUser | null {
  if (!inMemoryToken) return null;
  return {
    id: inMemoryToken.userId,
    name: inMemoryToken.userName,
    role: inMemoryToken.role,
  };
}

/**
 * Check if token is valid
 */
export function isTokenValid(): boolean {
  const token = getToken();
  const expiry = getTokenExpiry();

  if (!token || !expiry) return false;
  return Date.now() < expiry;
}

/**
 * Require authentication - returns true if valid, false otherwise
 */
export function requireAuth(): boolean {
  if (!isTokenValid()) {
    logout();
    return false;
  }
  return true;
}
