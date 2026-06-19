// ============================================================
// G005 放射RIS系统 v3.0.6 - 数据防泄漏 (DLP)
// DataLossPrevention - 敏感数据扫描、阻断、掩码
// ============================================================
import type { DlpMatch, DlpScanResult, DlpSeverity, DlpPolicy } from '../../../types/security';

interface PatternDef {
  type: DlpMatch['type'];
  regex: RegExp;
  severity: DlpSeverity;
  confidence: number;
  recommendation: string;
}

const PATTERNS: PatternDef[] = [
  // 中国大陆身份证号 (18 位, 末位 X/x)
  { type: 'ID_CARD', regex: /\b[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/g, severity: 'critical', confidence: 0.97, recommendation: '掩码为 [ID-CARD],仅显示地区码' },
  // 中国大陆手机号
  { type: 'PHONE', regex: /\b1[3-9]\d{9}\b/g, severity: 'high', confidence: 0.96, recommendation: '掩码中间 4 位' },
  // 邮箱
  { type: 'EMAIL', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, severity: 'medium', confidence: 0.99, recommendation: '掩码用户名部分' },
  // 信用卡 (Luhn 校验)
  { type: 'CREDIT_CARD', regex: /\b(?:\d[ -]*?){13,19}\b/g, severity: 'critical', confidence: 0.85, recommendation: '阻断外发' },
  // 病历号 MRN-YYYY-NNNN
  { type: 'MEDICAL_RECORD', regex: /\bMRN[-/]?\d{4}[-/]?\d{4,6}\b/gi, severity: 'high', confidence: 0.95, recommendation: '掩码或去标识化' },
  // API Key / Bearer Token
  { type: 'CREDENTIAL', regex: /\b(?:sk-|pk-|ghp_|gho_|Bearer\s+)[A-Za-z0-9_\-]{20,}\b/g, severity: 'critical', confidence: 0.92, recommendation: '立即撤销并阻断外发' },
  // 中文姓名 (粗略启发式:常见姓氏后跟 1-3 字)
  { type: 'PII', regex: /(?:患者|姓名[::]\s*)?([赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闵席季麻强贾路娄危江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁])\s{0,2}[一-龥]{1,3}/g, severity: 'high', confidence: 0.7, recommendation: '掩码为 [NAME]' },
];

function luhnValid(num: string): boolean {
  const digits = num.replace(/\D/g, '').split('').reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i]!;
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

function maskValue(type: DlpMatch['type'], value: string): string {
  switch (type) {
    case 'ID_CARD': return value.length > 8 ? value.slice(0, 4) + '**********' + value.slice(-4) : '[ID-CARD]';
    case 'PHONE': return value.length === 11 ? value.slice(0, 3) + '****' + value.slice(7) : '[PHONE]';
    case 'EMAIL': {
      const [u, d] = value.split('@');
      return (u ? u[0] + '***' : '***') + '@' + (d ?? 'unknown');
    }
    case 'CREDIT_CARD': return '**** **** **** ' + value.slice(-4);
    case 'MEDICAL_RECORD': return '[MRN]';
    case 'CREDENTIAL': return '[REDACTED-CREDENTIAL]';
    case 'PII': return '[NAME]';
    case 'ADDRESS': return '[ADDRESS]';
    default: return '[REDACTED]';
  }
}

export class DataLossPrevention {
  /** 扫描内容,返回所有匹配 */
  scan(content: string): DlpScanResult {
    const start = performance.now();
    const matches: DlpMatch[] = [];

    for (const p of PATTERNS) {
      const re = new RegExp(p.regex.source, p.regex.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(content)) !== null) {
        const matchedText = m[0];
        if (p.type === 'CREDIT_CARD' && !luhnValid(matchedText)) continue;
        matches.push({
          type: p.type,
          pattern: p.regex.source.slice(0, 40),
          matchedText,
          position: { start: m.index, end: m.index + matchedText.length },
          confidence: p.confidence,
          severity: p.severity,
          recommendation: p.recommendation,
        });
      }
    }

    // 风险评分 = max(severity权重) * 命中数量系数
    const severityWeight: Record<DlpSeverity, number> = { low: 5, medium: 15, high: 30, critical: 50 };
    const maxSev = matches.reduce<DlpSeverity>((acc, m) => severityWeight[m.severity] > severityWeight[acc] ? m.severity : acc, 'low');
    const riskScore = Math.min(100, severityWeight[maxSev] + matches.length * 5);

    let action: DlpScanResult['action'] = 'allow';
    if (matches.some(m => m.severity === 'critical')) action = 'block';
    else if (matches.some(m => m.severity === 'high')) action = 'mask';
    else if (matches.some(m => m.severity === 'medium')) action = 'warn';

    const result: DlpScanResult = {
      scannedAt: new Date().toISOString(),
      contentLength: content.length,
      scanDurationMs: Math.round(performance.now() - start),
      matches,
      riskScore,
      action,
    };
    if (action === 'mask' || action === 'block') result.maskedContent = this.mask(content, matches);
    if (action === 'block') result.blockReason = `检测到 ${matches.filter(m => m.severity === 'critical').length} 项严重敏感数据`;
    return result;
  }

  /** 阻断 (返回阻断原因) */
  block(content: string): { blocked: boolean; reason: string; matches: DlpMatch[] } {
    const r = this.scan(content);
    return {
      blocked: r.action === 'block',
      reason: r.blockReason ?? 'no critical matches',
      matches: r.matches,
    };
  }

  /** 掩码 */
  mask(content: string, matches?: DlpMatch[]): string {
    const ms = matches ?? this.scan(content).matches;
    if (ms.length === 0) return content;
    const sorted = [...ms].sort((a, b) => b.position.start - a.position.start);
    let out = content;
    for (const m of sorted) {
      out = out.slice(0, m.position.start) + maskValue(m.type, m.matchedText) + out.slice(m.position.end);
    }
    return out;
  }

  /** 按 DLP 策略评估 */
  evaluatePolicy(content: string, policy: DlpPolicy): { allowed: boolean; action: DlpPolicy['action']; matches: DlpMatch[] } {
    if (!policy.enabled) return { allowed: true, action: 'allow', matches: [] };
    const result = this.scan(content);
    return { allowed: result.action !== 'block', action: policy.action, matches: result.matches };
  }

  /** 批量检查 */
  batchScan(contents: string[]): DlpScanResult[] {
    return contents.map(c => this.scan(c));
  }

  /** 列出所有内置正则模式 (供 UI 展示) */
  listPatterns(): { type: DlpMatch['type']; pattern: string; severity: DlpSeverity }[] {
    return PATTERNS.map(p => ({
      type: p.type,
      pattern: p.regex.source.slice(0, 80) + (p.regex.source.length > 80 ? '...' : ''),
      severity: p.severity,
    }));
  }
}

export const dataLossPrevention = new DataLossPrevention();