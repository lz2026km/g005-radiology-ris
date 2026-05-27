import { describe, it, expect } from 'vitest'
import { escapeHtml, stripHtmlTags, sanitize, sanitizeUrl, validatePhone } from './security'

describe('escapeHtml', () => {
  it('escapes HTML entities', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
    expect(escapeHtml('&')).toBe('&amp;')
    expect(escapeHtml('"')).toBe('&quot;')
  })
})

describe('stripHtmlTags', () => {
  it('removes HTML tags', () => {
    expect(stripHtmlTags('<p>Hello</p>')).toBe('Hello')
    expect(stripHtmlTags('<strong>Bold</strong>')).toBe('Bold')
  })
})

describe('sanitize', () => {
  it('removes script tags', () => {
    const result = sanitize('<script>alert(1)</script>Hello')
    expect(result).not.toContain('script')
    expect(result).toContain('Hello')
  })

  it('removes on* attributes', () => {
    const result = sanitize('<img onerror=alert(1)>')
    expect(result).not.toContain('onerror')
  })

  it('removes javascript protocol', () => {
    const result = sanitize('javascript:alert(1)')
    expect(result).not.toContain('javascript')
  })
})

describe('sanitizeUrl', () => {
  it('blocks javascript protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#')
  })

  it('blocks data protocol', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#')
  })

  it('allows valid URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
  })
})

describe('validatePhone', () => {
  it('validates correct phone', () => {
    expect(validatePhone('13812345678').valid).toBe(true)
  })

  it('rejects invalid phone', () => {
    expect(validatePhone('12345').valid).toBe(false)
  })
})