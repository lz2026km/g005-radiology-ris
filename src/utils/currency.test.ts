import { describe, it, expect } from 'vitest'
import { formatCurrency, parseCurrency } from './currency'

describe('formatCurrency', () => {
  it('formats number with symbol', () => {
    expect(formatCurrency(1234)).toBe('¥1,234.00')
  })

  it('formats small number', () => {
    expect(formatCurrency(100)).toBe('¥100.00')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('¥0.00')
  })

  it('formats negative number', () => {
    expect(formatCurrency(-500)).toBe('¥-500.00')
  })

  it('formats string number', () => {
    expect(formatCurrency('999')).toBe('¥999.00')
  })

  it('formats invalid input', () => {
    expect(formatCurrency(NaN)).toBe('¥0.00')
  })

  it('formats without symbol', () => {
    expect(formatCurrency(500, false)).toBe('500.00')
  })
})

describe('parseCurrency', () => {
  it('parses currency string', () => {
    expect(parseCurrency('¥1,234.00')).toBe(1234)
  })

  it('parses without symbol', () => {
    expect(parseCurrency('500.00')).toBe(500)
  })

  it('parses with Chinese comma', () => {
    expect(parseCurrency('¥1，234.00')).toBe(1234)
  })

  it('parses invalid as zero', () => {
    expect(parseCurrency('invalid')).toBe(0)
  })
})