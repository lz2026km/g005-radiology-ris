/**
 * Authentication & Session Management
 * G005 Radiology RIS System
 * S1: Token-based auth, S7: Session timeout & token refresh
 */

import { v4 as uuidv4 } from 'uuid';

// Token storage key
const TOKEN_KEY = 'ris_auth_token';
const REFRESH_TOKEN_KEY = 'ris_refresh_token';
const TOKEN_EXPIRY_KEY = 'ris_token_expiry';
const USER_KEY = 'ris_current_user';

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
  // Clear any existing intervals
  stopActivityMonitoring();

  // Check activity every 30 seconds
  activityCheckInterval = window.setInterval(() => {
    const elapsed = Date.now() - lastActivityTime;
    if (elapsed >= timeoutMs) {
      logout();
      sessionTimeoutCallback?.();
    }
  }, 30000);

  // Set up token refresh
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
    
    // Refresh if less than 5 minutes until expiry
    if (timeUntilExpiry > 0 && timeUntilExpiry <= TOKEN_REFRESH_INTERVAL) {
      refreshToken();
    }
  }, 60000); // Check every minute
}

/**
 * Generate new auth token (mock implementation)
 */
function generateToken(): string {
  return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
}

/**
 * Login with credentials
 */
export async function login(credentials: LoginCredentials): Promise<AuthToken> {
  // In a real app, this would call the backend
  // For now, generate a token based on credentials
  const token: AuthToken = {
    token: generateToken(),
    refreshToken: generateToken(),
    expiresAt: Date.now() + DEFAULT_SESSION_TIMEOUT,
    userId: uuidv4(),
    userName: credentials.username,
    role: '医生',
  };

  // Store tokens
  setToken(token);
  
  // Start session monitoring
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
 * Set auth token
 */
export function setToken(token: AuthToken): void {
  sessionStorage.setItem(TOKEN_KEY, token.token);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, token.expiresAt.toString());
  sessionStorage.setItem(USER_KEY, JSON.stringify({
    id: token.userId,
    name: token.userName,
    role: token.role,
  }));
}

/**
 * Get current token
 */
export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Get token expiry timestamp
 */
export function getTokenExpiry(): number | null {
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiry ? parseInt(expiry, 10) : null;
}

/**
 * Clear token
 */
export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  sessionStorage.removeItem(USER_KEY);
}

/**
 * Refresh token
 */
export async function refreshToken(): Promise<boolean> {
  const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  // In a real app, call backend to refresh
  // For now, just extend the session
  const newToken: AuthToken = {
    token: generateToken(),
    refreshToken: refreshToken,
    expiresAt: Date.now() + DEFAULT_SESSION_TIMEOUT,
    userId: getCurrentUser()?.id || '',
    userName: getCurrentUser()?.name || '',
    role: getCurrentUser()?.role || '医生',
  };

  setToken(newToken);
  return true;
}

/**
 * Get current user
 */
export function getCurrentUser(): { id: string; name: string; role: string } | null {
  const userStr = sessionStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
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