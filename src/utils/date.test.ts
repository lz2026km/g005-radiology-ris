/**
 * G005 放射RIS系统 v3.0.0 - date 工具测试
 * Phase T1-W2: 工具单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatDateTimeFull,
  formatRelativeTime,
  addDays,
  addMonths,
  addYears,
  diffMinutes,
  diffDays,
  diffYears,
  dayStart,
  dayEnd,
  isToday,
  isPast,
  isFuture,
} from './date';

describe('formatDate', () => {
  it('格式化 Date 对象', () => {
    const d = new Date(2026, 5, 6);  // 2026-06-06
    expect(formatDate(d)).toBe('2026-06-06');
  });

  it('格式化 ISO 字符串', () => {
    expect(formatDate('2026-06-06T10:00:00Z')).toMatch(/2026-06-0[56]/);
  });

  it('格式化 timestamp', () => {
    const ts = new Date(2026, 5, 6).getTime();
    expect(formatDate(ts)).toBe('2026-06-06');
  });

  it('无效日期返回空字符串', () => {
    expect(formatDate('invalid')).toBe('');
    expect(formatDate(NaN)).toBe('');
  });

  it('补零到 2 位', () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});

describe('formatDateTime', () => {
  it('格式化 YYYY-MM-DD HH:mm', () => {
    const d = new Date(2026, 5, 6, 14, 30);
    expect(formatDateTime(d)).toBe('2026-06-06 14:30');
  });

  it('无效日期', () => {
    expect(formatDateTime('invalid')).toBe('');
  });
});

describe('formatDateTimeFull', () => {
  it('包含秒', () => {
    const d = new Date(2026, 5, 6, 14, 30, 45);
    expect(formatDateTimeFull(d)).toBe('2026-06-06 14:30:45');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-06T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('刚刚(秒级)', () => {
    const d = new Date('2026-06-06T11:59:30Z');
    const result = formatRelativeTime(d, 'zh_CN');
    expect(result.length).toBeGreaterThan(0);
  });

  it('几分钟前', () => {
    const d = new Date('2026-06-06T11:55:00Z');
    expect(formatRelativeTime(d, 'zh_CN')).toContain('分钟');
  });

  it('几小时前', () => {
    const d = new Date('2026-06-06T08:00:00Z');
    expect(formatRelativeTime(d, 'zh_CN')).toContain('小时');
  });

  it('几天前', () => {
    const d = new Date('2026-06-03T12:00:00Z');
    expect(formatRelativeTime(d, 'zh_CN')).toContain('天');
  });
});

describe('addDays / addMonths / addYears', () => {
  it('addDays 加 7 天', () => {
    const result = addDays(new Date(2026, 5, 6), 7);
    expect(formatDate(result)).toBe('2026-06-13');
  });

  it('addDays 减 5 天', () => {
    const result = addDays(new Date(2026, 5, 6), -5);
    expect(formatDate(result)).toBe('2026-06-01');
  });

  it('addMonths 跨年', () => {
    const result = addMonths(new Date(2026, 11, 1), 2);
    expect(formatDate(result)).toBe('2027-02-01');
  });

  it('addYears 10 年', () => {
    const result = addYears(new Date(2026, 5, 6), 10);
    expect(formatDate(result)).toBe('2036-06-06');
  });
});

describe('diffMinutes / diffDays / diffYears', () => {
  it('diffMinutes 60 分钟', () => {
    const a = new Date(2026, 5, 6, 14, 0);
    const b = new Date(2026, 5, 6, 13, 0);
    expect(diffMinutes(a, b)).toBe(60);
  });

  it('diffDays 7 天', () => {
    const a = new Date(2026, 5, 13);
    const b = new Date(2026, 5, 6);
    expect(diffDays(a, b)).toBe(7);
  });

  it('diffYears 5 年', () => {
    const a = new Date(2031, 5, 6);
    const b = new Date(2026, 5, 6);
    expect(diffYears(a, b)).toBe(5);
  });
});

describe('dayStart / dayEnd', () => {
  it('dayStart 00:00:00', () => {
    const d = dayStart(new Date(2026, 5, 6, 14, 30));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });

  it('dayEnd 23:59:59', () => {
    const d = dayEnd(new Date(2026, 5, 6, 14, 30));
    expect(d.getHours()).toBe(23);
  });
});

describe('isToday / isPast / isFuture', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-06T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('isToday 今天', () => {
    expect(isToday(new Date('2026-06-06T15:00:00Z'))).toBe(true);
  });

  it('isToday 昨天', () => {
    expect(isToday(new Date('2026-06-05T15:00:00Z'))).toBe(false);
  });

  it('isPast 昨天', () => {
    expect(isPast(new Date('2026-06-05T12:00:00Z'))).toBe(true);
  });

  it('isFuture 明天', () => {
    expect(isFuture(new Date('2026-06-07T12:00:00Z'))).toBe(true);
  });
});
