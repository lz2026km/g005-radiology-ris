import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, formatRelativeTime } from './date'

describe('formatDate', () => {
  it('formats Date object', () => {
    expect(formatDate(new Date('2024-01-15'))).toBe('2024-01-15')
  })

  it('formats ISO string', () => {
    expect(formatDate('2024-05-20')).toBe('2024-05-20')
  })

  it('formats timestamp', () => {
    expect(formatDate(new Date('2024-12-25').getTime())).toBe('2024-12-25')
  })

  it('handles invalid date', () => {
    expect(formatDate('invalid')).toBe('')
  })
})

describe('formatDateTime', () => {
  it('formats datetime', () => {
    const result = formatDateTime(new Date('2024-03-15T14:30:00'))
    expect(result).toContain('2024-03-15')
    expect(result).toContain('14:30')
  })
})

describe('formatRelativeTime', () => {
  it('returns "刚刚" for recent time', () => {
    const now = Date.now()
    expect(formatRelativeTime(now)).toBe('刚刚')
  })

  it('returns minutes ago', () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000
    expect(formatRelativeTime(fiveMinAgo)).toBe('5分钟前')
  })

  it('returns hours ago', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
    expect(formatRelativeTime(twoHoursAgo)).toBe('2小时前')
  })

  it('returns days ago', () => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
    expect(formatRelativeTime(threeDaysAgo)).toBe('3天前')
  })
})