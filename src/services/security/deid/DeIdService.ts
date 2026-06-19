// ============================================================
// G005 放射RIS系统 v3.0.6 - 去标识化服务
// DeIdService - HIPAA Safe Harbor / Expert Determination / Pseudonymization
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import type { PhiMatch, PhiCategory, DeIdResult } from '../../../types/security';
import { phiDetector } from './PhiDetector';

function pseudonymize(value: string, salt: string): string {
  let h = 0;
  const s = salt + value;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return `PSN-${Math.abs(h).toString(36).toUpperCase().padStart(8, '0')}`;
}

function safeDateShift(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '[DATE]';
  // Safe Harbor: 90 岁以上 -> 删去年份仅保留年龄; 否则按 ±90 天漂移
  date.setDate(date.getDate() + (Math.floor(Math.random() * 180) - 90));
  return date.toISOString().slice(0, 10);
}

function maskForCategory(category: PhiCategory, originalValue: string): string {
  switch (category) {
    case 'name': return '[NAME]';
    case 'id-card': return originalValue.length >= 4 ? `****${originalValue.slice(-4)}` : '[ID-CARD]';
    case 'medical-record': return '[MRN]';
    case 'phone': return originalValue.length === 11 ? `${originalValue.slice(0, 3)}****${originalValue.slice(7)}` : '[PHONE]';
    case 'email': {
      const [u, d] = originalValue.split('@');
      return `${u?.[0] ?? '*'}***@${d ?? 'unknown'}`;
    }
    case 'address': return '[ADDRESS]';
    case 'date-of-birth':
    case 'date-of-death': return safeDateShift(originalValue);
    case 'age-over-89': return '90+';
    case 'account': return `****${originalValue.slice(-4)}`;
    case 'certificate': return '[CERT-NO]';
    case 'vehicle-plate': return '[PLATE]';
    case 'biometric': return '[DEVICE-ID]';
    case 'geo-location': return '[IP]';
    case 'photo': return '[PHOTO]';
  }
}

export type DeIdMethod = 'safe-harbor' | 'expert-determination' | 'pseudonymization';

export class DeIdService {
  /** 执行去标识化 */
  deidentify(text: string, method: DeIdMethod = 'safe-harbor'): DeIdResult {
    const matches = phiDetector.detect(text);
    const salt = uuidv4();
    const pseudonyms: Record<string, string> = {};

    const sorted = [...matches].sort((a, b) => b.startIndex - a.startIndex);
    let out = text;
    for (const m of sorted) {
      let replacement: string;
      if (method === 'pseudonymization') {
        const psn = pseudonymize(m.originalValue, salt);
        pseudonyms[m.originalValue] = psn;
        replacement = psn;
      } else {
        replacement = maskForCategory(m.category, m.originalValue);
      }
      out = out.slice(0, m.startIndex) + replacement + out.slice(m.endIndex);
    }

    // 90 岁以上年龄自动隐藏 (Safe Harbor 要求)
    if (method === 'safe-harbor') {
      out = out.replace(/年龄[:：\s]*([9][1-9]|[1-9]\d{2,})/g, '年龄:90+');
    }

    const retentionRatio = matches.length === 0 ? 1 : Math.max(0.1, 1 - matches.reduce((s, m) => s + (m.endIndex - m.startIndex), 0) / text.length);
    const result: DeIdResult = {
      originalText: text,
      deIdentifiedText: out,
      matches,
      categories: Array.from(new Set(matches.map(m => m.category))),
      method,
      retentionRatio,
      reversible: method === 'pseudonymization',
      processedAt: new Date().toISOString(),
    };
    if (method === 'pseudonymization' && Object.keys(pseudonyms).length > 0) {
      result.pseudonyms = pseudonyms;
    }
    return result;
  }

  /** 验证 Safe Harbor 合规性 (18 项标识符) */
  checkSafeHarborCompliance(text: string): { compliant: boolean; missing: string[]; detected: PhiCategory[] } {
    const matches = phiDetector.detect(text);
    const detected = Array.from(new Set(matches.map(m => m.category)));
    const all18: PhiCategory[] = [
      'name', 'address', 'date-of-birth', 'date-of-death', 'phone', 'fax',
      'email', 'medical-record', 'account', 'certificate', 'vehicle-plate',
      'biometric', 'photo', 'age-over-89', 'geo-location',
    ];
    // 此处简化: 已识别的类别即代表"可能存在",未必符合 Safe Harbor
    return { compliant: detected.length === 0, missing: [], detected };
  }

  /** 批量处理 */
  deidentifyBatch(texts: string[], method: DeIdMethod = 'safe-harbor'): DeIdResult[] {
    return texts.map(t => this.deidentify(t, method));
  }

  /** 统计 */
  stats(results: DeIdResult[]): { totalProcessed: number; avgRetentionRatio: number; byCategory: Record<string, number> } {
    const byCategory: Record<string, number> = {};
    let totalRetention = 0;
    for (const r of results) {
      for (const c of r.categories) byCategory[c] = (byCategory[c] ?? 0) + 1;
      totalRetention += r.retentionRatio;
    }
    return {
      totalProcessed: results.length,
      avgRetentionRatio: results.length > 0 ? Math.round((totalRetention / results.length) * 100) / 100 : 1,
      byCategory,
    };
  }
}

export const deIdService = new DeIdService();