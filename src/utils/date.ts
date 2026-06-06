/**
 * G005 放射RIS系统 v3.0.0 - 日期格式化工具
 * Phase T1-W2: 严格化 + 测试覆盖
 */

import { format, formatDistanceToNow, isValid, parseISO, addDays as fnsAddDays, addMonths as fnsAddMonths, addYears as fnsAddYears, differenceInMinutes, differenceInDays, differenceInYears, startOfDay, endOfDay } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

const LOCALE_MAP = { zh_CN: zhCN, en_US: enUS } as const;
type SupportedLocale = keyof typeof LOCALE_MAP;

function safeDate(input: Date | string | number): Date | null {
  if (input instanceof Date) return isValid(input) ? input : null;
  if (typeof input === 'string') {
    const parsed = parseISO(input);
    return isValid(parsed) ? parsed : null;
  }
  if (typeof input === 'number') {
    const d = new Date(input);
    return isValid(d) ? d : null;
  }
  return null;
}

/** 格式化日期 YYYY-MM-DD */
export function formatDate(date: Date | string | number, locale: SupportedLocale = 'zh_CN'): string {
  const d = safeDate(date);
  if (!d) return '';
  return format(d, 'yyyy-MM-dd', { locale: LOCALE_MAP[locale] });
}

/** 格式化日期时间 YYYY-MM-DD HH:mm */
export function formatDateTime(date: Date | string | number, locale: SupportedLocale = 'zh_CN'): string {
  const d = safeDate(date);
  if (!d) return '';
  return format(d, 'yyyy-MM-dd HH:mm', { locale: LOCALE_MAP[locale] });
}

/** 格式化日期时间(秒) YYYY-MM-DD HH:mm:ss */
export function formatDateTimeFull(date: Date | string | number, locale: SupportedLocale = 'zh_CN'): string {
  const d = safeDate(date);
  if (!d) return '';
  return format(d, 'yyyy-MM-dd HH:mm:ss', { locale: LOCALE_MAP[locale] });
}

/** 相对时间("3 分钟前") */
export function formatRelativeTime(date: Date | string | number, locale: SupportedLocale = 'zh_CN'): string {
  const d = safeDate(date);
  if (!d) return '';
  return formatDistanceToNow(d, { addSuffix: true, locale: LOCALE_MAP[locale] });
}

/** 加天数 */
export function addDays(date: Date | string | number, days: number): Date {
  const d = safeDate(date);
  if (!d) return new Date();
  return fnsAddDays(d, days);
}

/** 加月数 */
export function addMonths(date: Date | string | number, months: number): Date {
  const d = safeDate(date);
  if (!d) return new Date();
  return fnsAddMonths(d, months);
}

/** 加年数 */
export function addYears(date: Date | string | number, years: number): Date {
  const d = safeDate(date);
  if (!d) return new Date();
  return fnsAddYears(d, years);
}

/** 相差分钟数 */
export function diffMinutes(a: Date | string | number, b: Date | string | number): number {
  const dateA = safeDate(a);
  const dateB = safeDate(b);
  if (!dateA || !dateB) return 0;
  return differenceInMinutes(dateA, dateB);
}

/** 相差天数 */
export function diffDays(a: Date | string | number, b: Date | string | number): number {
  const dateA = safeDate(a);
  const dateB = safeDate(b);
  if (!dateA || !dateB) return 0;
  return differenceInDays(dateA, dateB);
}

/** 相差年数 */
export function diffYears(a: Date | string | number, b: Date | string | number): number {
  const dateA = safeDate(a);
  const dateB = safeDate(b);
  if (!dateA || !dateB) return 0;
  return differenceInYears(dateA, dateB);
}

/** 当天开始 */
export function dayStart(date: Date | string | number): Date {
  const d = safeDate(date);
  if (!d) return new Date();
  return startOfDay(d);
}

/** 当天结束 */
export function dayEnd(date: Date | string | number): Date {
  const d = safeDate(date);
  if (!d) return new Date();
  return endOfDay(d);
}

/** 解析 ISO 字符串 */
export function parseISODate(iso: string): Date | null {
  return safeDate(iso);
}

/** 是否今天 */
export function isToday(date: Date | string | number): boolean {
  const d = safeDate(date);
  if (!d) return false;
  const today = new Date();
  return formatDate(d) === formatDate(today);
}

/** 是否过去 */
export function isPast(date: Date | string | number): boolean {
  const d = safeDate(date);
  if (!d) return false;
  return d.getTime() < Date.now();
}

/** 是否未来 */
export function isFuture(date: Date | string | number): boolean {
  const d = safeDate(date);
  if (!d) return false;
  return d.getTime() > Date.now();
}
