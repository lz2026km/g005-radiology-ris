/**
 * DOMPurify Sanitization Utility
 * G005 Radiology RIS System
 * S3: DOMPurify sanitization, forbid dangerouslySetInnerHTML
 */
import DOMPurify from 'dompurify';

// Configure DOMPurify settings
DOMPurify.setConfig({
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id',
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
});

// Allowed URI schemes
DOMPurify.addHook('afterSanitizeAttributes', (node: any) => {
  // Make sure all links have safe targets
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
  // Remove javascript: and data: URIs
  if (node.hasAttribute('href')) {
    const href = node.getAttribute('href') || '';
    if (href.trim().toLowerCase().startsWith('javascript:') ||
        href.trim().toLowerCase().startsWith('data:')) {
      node.removeAttribute('href');
    }
  }
  if (node.hasAttribute('src')) {
    const src = node.getAttribute('src') || '';
    if (src.trim().toLowerCase().startsWith('javascript:') ||
        src.trim().toLowerCase().startsWith('data:')) {
      node.removeAttribute('src');
    }
  }
});

/**
 * Sanitize HTML string using DOMPurify
 * Use this instead of dangerouslySetInnerHTML
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}

/**
 * Sanitize and also return text-only (strip all HTML)
 */
export function sanitizeToText(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Sanitize URL - ensure it's safe
 */
export function sanitizeUrl(url: string): string {
  const clean = DOMPurify.sanitize(url, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  // Additional URL validation
  if (/^(javascript:|data:|vbscript:)/i.test(clean)) {
    return '#';
  }
  return clean;
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  if (!input) return '';
  
  // First pass: sanitize any HTML
  let clean = DOMPurify.sanitize(input);
  
  // Second pass: encode remaining characters
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // Truncate if needed
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }
  
  return clean;
}

/**
 * Check if a string contains any potentially dangerous content
 */
export function isDangerous(input: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:/i,
    /expression\s*\(/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
}

// Re-export DOMPurify types
export type Config = DOMPurify.Config;
export type HookEvent = DOMPurify.HookEvent;