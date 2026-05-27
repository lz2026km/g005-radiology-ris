/**
 * XSS防护 - 安全工具函数
 * G005 Radiology RIS System
 */

interface SanitizeOptions {
  allowAttributes?: string[];
  stripTags?: boolean;
}

/**
 * HTML实体转义，防止XSS
 */
export function escapeHtml(str: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'/]/g, char => escapeMap[char] || char);
}

/**
 * HTML标签去除
 */
export function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * DOMPurify风格的HTML净化（简化实现）
 * 实际项目建议使用dompurify库
 */
export function sanitize(input: string, options: SanitizeOptions = {}): string {
  let result = input;
  
  // 移除script标签及内容
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // 移除style标签及内容
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // 移除on事件属性
  result = result.replace(/\s*on\w+\s*=\s*[^"']*/gi, '');
  // 移除javascript:协议
  result = result.replace(/javascript:/gi, '');
  // 移除data:协议
  result = result.replace(/data:/gi, '');
  // 转义剩余HTML
  result = escapeHtml(result);
  
  return result;
}

/**
 * 输入验证 - 验证字符串格式
 */
export function validateInput(
  input: string,
  rules: {
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
    allowedChars?: string;
    disallowChars?: string;
  }
): { valid: boolean; error?: string } {
  const { maxLength, minLength, pattern, allowedChars, disallowChars } = rules;

  if (maxLength && input.length > maxLength) {
    return { valid: false, error: `输入长度不能超过${maxLength}个字符` };
  }

  if (minLength && input.length < minLength) {
    return { valid: false, error: `输入长度不能少于${minLength}个字符` };
  }

  if (pattern && !pattern.test(input)) {
    return { valid: false, error: '输入格式不正确' };
  }

  if (allowedChars) {
    const invalidChars = input.split('').filter(c => !allowedChars.includes(c));
    if (invalidChars.length > 0) {
      return { valid: false, error: `包含非法字符: ${[...new Set(invalidChars)].join('')}` };
    }
  }

  if (disallowChars) {
    const foundChars = input.split('').filter(c => disallowChars.includes(c));
    if (foundChars.length > 0) {
      return { valid: false, error: `包含禁止字符: ${[...new Set(foundChars)].join('')}` };
    }
  }

  return { valid: true };
}

/**
 * 验证中文姓名
 */
export function validateChineseName(name: string): { valid: boolean; error?: string } {
  return validateInput(name, {
    minLength: 2,
    maxLength: 20,
    pattern: /^[\u4e00-\u9fa5a-zA-Z\s·]+$/
  });
}

/**
 * 验证身份证号
 */
export function validateIdCard(id: string): { valid: boolean; error?: string } {
  const pattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  return validateInput(id, { pattern });
}

/**
 * 验证手机号
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const pattern = /^1[3-9]\d{9}$/;
  return validateInput(phone, { pattern });
}

/**
 * 净化URL（防止javascript:或data:协议攻击）
 */
export function sanitizeUrl(url: string): string {
  const sanitized = url.trim().toLowerCase();
  if (sanitized.startsWith('javascript:') || sanitized.startsWith('data:')) {
    return '#';
  }
  return url;
}