// ============================================================
// G005 放射RIS系统 v3.0.6 - PHI 检测器
// PhiDetector - HIPAA Safe Harbor 18 类标识符
// ============================================================
import type { PhiMatch, PhiCategory } from '../../../types/security';

interface PhiRule {
  category: PhiCategory;
  regex: RegExp;
  confidence: number;
  description: string;
}

const PHI_RULES: PhiRule[] = [
  // 1. 姓名 (启发式)
  { category: 'name', regex: /(?:姓名|患者|医生|医师)[:：\s]*([一-龥]{2,4})/g, confidence: 0.85, description: '姓名' },
  // 2. 身份证号
  { category: 'id-card', regex: /[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]/g, confidence: 0.99, description: '身份证号' },
  // 3. 病历号
  { category: 'medical-record', regex: /(?:MRN|病历号)[:：\s]*[A-Z0-9-]{6,20}/gi, confidence: 0.97, description: '病历号' },
  // 4. 电话
  { category: 'phone', regex: /(?:\+?86[-\s]?)?1[3-9]\d{9}/g, confidence: 0.96, description: '手机号' },
  // 5. 邮箱
  { category: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, confidence: 0.99, description: '邮箱' },
  // 6. 地址
  { category: 'address', regex: /(?:地址|住址|户籍)[:：\s]*[一-鿿]{6,80}(?:号|室|楼|村|街|路|区|省|市|县|镇)/g, confidence: 0.88, description: '地址' },
  // 7. 出生日期
  { category: 'date-of-birth', regex: /(?:出生|出生日期|DOB)[:：\s]*(?:19|20)\d{2}[-/.](?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12]\d|3[01])/g, confidence: 0.95, description: '出生日期' },
  // 8. 死亡日期
  { category: 'date-of-death', regex: /(?:死亡|死亡日期|DOD)[:：\s]*(?:19|20)\d{2}[-/.](?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12]\d|3[01])/g, confidence: 0.95, description: '死亡日期' },
  // 9. 90 岁以上年龄
  { category: 'age-over-89', regex: /(?:年龄|岁)[:：\s]*([9][1-9]|[1-9]\d{2,})/g, confidence: 0.9, description: '90 岁以上年龄' },
  // 10. 银行账号
  { category: 'account', regex: /\b\d{16,19}\b/g, confidence: 0.7, description: '账号' },
  // 11. 执业证书号
  { category: 'certificate', regex: /(?:执业证|资格证|医师证)[:：\s]*[A-Z0-9-]{6,30}/gi, confidence: 0.9, description: '执业证书号' },
  // 12. 车牌号
  { category: 'vehicle-plate', regex: /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,6}/g, confidence: 0.92, description: '车牌号' },
  // 13. 设备序列号 (医疗器械)
  { category: 'biometric', regex: /(?:设备序列号|SN|Serial)[:：\s]*[A-Z0-9-]{8,30}/gi, confidence: 0.85, description: '设备标识符' },
  // 14. IP 地址
  { category: 'geo-location', regex: /\b(?:192\.168|10\.|172\.(?:1[6-9]|2\d|3[0-1]))\.\d{1,3}\.\d{1,3}\b/g, confidence: 0.95, description: 'IP 地址' },
];

export class PhiDetector {
  /** 检测文本中的 PHI */
  detect(text: string): PhiMatch[] {
    const matches: PhiMatch[] = [];
    for (const rule of PHI_RULES) {
      const re = new RegExp(rule.regex.source, rule.regex.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const originalValue = m[0];
        const startIndex = m.index;
        matches.push({
          category: rule.category,
          value: originalValue,        // 占位: 在 DeIdService 中替换为脱敏值
          originalValue,
          startIndex,
          endIndex: startIndex + originalValue.length,
          confidence: rule.confidence,
          rule: rule.description,
        });
      }
    }
    // 去重: 同一区间可能命中多个规则
    return matches
      .sort((a, b) => a.startIndex - b.startIndex)
      .filter((m, i, arr) => i === 0 || m.startIndex !== arr[i - 1]!.startIndex);
  }

  /** 按类别分组 */
  groupByCategory(matches: PhiMatch[]): Record<PhiCategory, PhiMatch[]> {
    const grouped: Record<PhiCategory, PhiMatch[]> = {
      'name': [], 'address': [], 'phone': [], 'email': [], 'id-card': [], 'medical-record': [],
      'account': [], 'certificate': [], 'vehicle-plate': [], 'biometric': [], 'photo': [],
      'date-of-birth': [], 'date-of-death': [], 'age-over-89': [], 'geo-location': [],
    };
    for (const m of matches) grouped[m.category].push(m);
    return grouped;
  }

  /** 风险评估 */
  assess(matches: PhiMatch[]): { riskLevel: 'low' | 'medium' | 'high' | 'critical'; score: number; categories: PhiCategory[] } {
    const categories = Array.from(new Set(matches.map(m => m.category)));
    const weights: Record<PhiCategory, number> = {
      'name': 10, 'address': 8, 'phone': 10, 'email': 8, 'id-card': 25, 'medical-record': 20,
      'account': 15, 'certificate': 12, 'vehicle-plate': 10, 'biometric': 18, 'photo': 30,
      'date-of-birth': 12, 'date-of-death': 12, 'age-over-89': 15, 'geo-location': 6,
    };
    const score = Math.min(100, matches.reduce((s, m) => s + weights[m.category], 0));
    const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
      score >= 70 ? 'critical' :
      score >= 45 ? 'high' :
      score >= 20 ? 'medium' : 'low';
    return { riskLevel, score, categories };
  }

  /** 列出所有规则 */
  listRules(): { category: PhiCategory; pattern: string; confidence: number; description: string }[] {
    return PHI_RULES.map(r => ({
      category: r.category,
      pattern: r.regex.source.slice(0, 80) + (r.regex.source.length > 80 ? '...' : ''),
      confidence: r.confidence,
      description: r.description,
    }));
  }
}

export const phiDetector = new PhiDetector();