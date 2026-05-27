/**
 * Security Middleware - Headers & CSRF
 * G005 Radiology RIS System
 */
export interface SecurityHeaders {
  'X-Frame-Options'?: string;
  'X-Content-Type-Options'?: string;
  'X-XSS-Protection'?: string;
  'Strict-Transport-Security'?: string;
  'Content-Security-Policy'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
}

// Default security headers
export const DEFAULT_SECURITY_HEADERS: SecurityHeaders = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Content Security Policy
export const CSP_HEADER = `
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
`.replace(/\s+/g, ' ').trim();

// CSRF Token Management
const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_HEADER_KEY = 'x-csrf-token';

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function setCSRFToken(token: string): void {
  // Store in sessionStorage (not localStorage for security)
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
}

export function getCSRFToken(): string | null {
  return sessionStorage.getItem(CSRF_TOKEN_KEY);
}

export function removeCSRFToken(): void {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
}

// CSRF Validation
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  if (!storedToken || !token) return false;
  return timingSafeEqual(storedToken, token);
}

// Timing-safe string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Apply security headers to response (for backend integration)
export function applySecurityHeaders(): Record<string, string> {
  return {
    ...DEFAULT_SECURITY_HEADERS,
    'Content-Security-Policy': CSP_HEADER,
  };
}

// CSRF Token header name for requests
export const CSRF_HEADER_NAME = CSRF_HEADER_KEY;