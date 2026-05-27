/**
 * 日期格式化工具
 * G005 Radiology RIS System
 */

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 */
export function formatDateTimeFull(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}:${seconds}`;
}

/**
 * 相对时间（如"3分钟前"）
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  const now = Date.now();
  const diff = now - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}