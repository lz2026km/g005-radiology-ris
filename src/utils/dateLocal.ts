/**
 * 日期本地化工具 - I2: date-fns-tz本地化
 * G005 Radiology RIS System
 */
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * 格式化日期为本地化格式
 * zh-CN: YYYY年MM月DD日
 * en-US: MMMM D, YYYY
 */
export function formatDateLocal(date: Date | string | number, locale: string = 'zh-CN'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }

  if (locale === 'zh-CN') {
    return formatInTimeZone(d, 'Asia/Shanghai', 'yyyy年MM月dd日');
  }
  return format(d, 'MMMM d, yyyy', { locale: locale === 'en-US' ? undefined : undefined });
}

/**
 * 格式化日期时间为本地化格式
 * zh-CN: YYYY年MM月DD日 HH:mm
 * en-US: MMMM d, yyyy h:mm a
 */
export function formatDateTimeLocal(date: Date | string | number, locale: string = 'zh-CN'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }

  if (locale === 'zh-CN') {
    return formatInTimeZone(d, 'Asia/Shanghai', 'yyyy年MM月dd日 HH:mm');
  }
  return format(d, 'MMMM d, yyyy h:mm a');
}

/**
 * 格式化完整日期时间为本地化格式
 * zh-CN: YYYY年MM月DD日 HH:mm:ss
 * en-US: MMMM d, yyyy h:mm:ss a
 */
export function formatDateTimeFullLocal(date: Date | string | number, locale: string = 'zh-CN'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }

  if (locale === 'zh-CN') {
    return formatInTimeZone(d, 'Asia/Shanghai', 'yyyy年MM月dd日 HH:mm:ss');
  }
  return format(d, 'MMMM d, yyyy h:mm:ss a');
}

/**
 * 获取本地化相对时间 (I5: timeago.js风格)
 */
export function formatRelativeTimeLocal(date: Date | string | number, locale: string = 'zh-CN'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (locale === 'zh-CN') {
    if (diffDay > 0) return `${diffDay}天前`;
    if (diffHour > 0) return `${diffHour}小时前`;
    if (diffMin > 0) return `${diffMin}分钟前`;
    return '刚刚';
  } else {
    // English formatting
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
}