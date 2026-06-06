/**
 * G005 放射RIS系统 v3.0.0 - 数据脱敏与 XSS 防护
 * Phase T4-W10: 医疗数据脱敏
 *
 * 用途:
 *   - 列表展示时脱敏(姓名 / 身份证 / 手机)
 *   - Sentry 上报前脱敏(自动)
 *   - 第三方分享时脱敏
 */

import DOMPurify from 'dompurify';

/** 姓名脱敏:张明远 → 张*远 */
export function maskName(name: string): string {
  if (!name) return '';
  if (name.length === 1) return name;
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
}

/** 身份证脱敏:110101199003078888 → 110101********8888 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard;
  return `${idCard.slice(0, 6)}${'*'.repeat(idCard.length - 10)}${idCard.slice(-4)}`;
}

/** 手机号脱敏:13800138000 → 138****8000 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

/** 邮箱脱敏:zhangsan@hospital.com → zha***@hospital.com */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  if (local.length <= 3) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 3)}***@${domain}`;
}

/** 诊断脱敏(保留前 10 字 + ***) */
export function maskDiagnosis(text: string): string {
  if (!text) return '';
  if (text.length <= 20) return text;
  return `${text.slice(0, 10)}***[共 ${text.length} 字]`;
}

/** 患者信息整体脱敏(用于演示 / 培训 / 截图) */
export interface Patient {
  name: string;
  idCard?: string;
  phone?: string;
  email?: string;
  diagnosis?: string;
}

export function maskPatient(patient: Patient): Patient {
  return {
    name: maskName(patient.name),
    idCard: patient.idCard ? maskIdCard(patient.idCard) : undefined,
    phone: patient.phone ? maskPhone(patient.phone) : undefined,
    email: patient.email ? maskEmail(patient.email) : undefined,
    diagnosis: patient.diagnosis ? maskDiagnosis(patient.diagnosis) : undefined,
  };
}

/** XSS 清理(HTML 字符串) */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

/** URL 安全校验(防 javascript: / data:) */
export function isSafeURL(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** SQL 注入检测(基础) */
export function hasSQLInjection(input: string): boolean {
  const patterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(;\s*--)/,
    /('.*OR.*'=')/i,
  ];
  return patterns.some((p) => p.test(input));
}

/** XSS 检测(基础) */
export function hasXSSAttempt(input: string): boolean {
  const patterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i,  // onclick, onerror, etc.
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /eval\s*\(/i,
  ];
  return patterns.some((p) => p.test(input));
}
