// ============================================================
// G005 放射RIS系统 v2.0.0 - 危急值自动识别引擎
// Phase R8 W5-D: 文本匹配 + 规则触发 + 闭环通知
// ============================================================

export interface CriticalRule {
  id: string;
  name: string;
  category: 'neuro' | 'cardio' | 'pulmo' | 'abdomen' | 'trauma' | 'vascular';
  modality: string[];
  bodyPart: string[];
  keywords: string[];
  patterns: RegExp[];
  severity: 'critical' | 'urgent' | 'warning';
  notification: { sms: boolean; phone: boolean; popup: boolean };
  ackRequired: boolean;
  ackTimeout: number; // 分钟
}

export const CRITICAL_VALUE_RULES: CriticalRule[] = [
  // 神经
  { id: 'cv-neuro-001', name: '脑出血', category: 'neuro', modality: ['CT', 'MR'], bodyPart: ['头颅'],
    keywords: ['脑出血', '脑内血肿', '硬膜外血肿', '硬膜下血肿'],
    patterns: [/脑出血.*?约\s*\d+(\.\d+)?\s*ml/i, /脑内血肿.*?约\s*\d+(\.\d+)?\s*ml/i, /硬膜外血肿/i],
    severity: 'critical', notification: { sms: true, phone: true, popup: true }, ackRequired: true, ackTimeout: 15 },
  { id: 'cv-neuro-002', name: '急性脑梗死', category: 'neuro', modality: ['CT', 'MR'], bodyPart: ['头颅'],
    keywords: ['急性脑梗死', '脑梗死', '脑栓塞'],
    patterns: [/急性脑梗死/i, /急性大面积脑梗死/i],
    severity: 'critical', notification: { sms: true, phone: false, popup: true }, ackRequired: true, ackTimeout: 30 },
  { id: 'cv-neuro-003', name: '动脉瘤', category: 'neuro', modality: ['CT', 'MR', 'DSA'], bodyPart: ['头颅', '胸部'],
    keywords: ['动脉瘤', '动脉瘤破裂'],
    patterns: [/动脉瘤.*?(破裂|出血)/i],
    severity: 'critical', notification: { sms: true, phone: true, popup: true }, ackRequired: true, ackTimeout: 15 },

  // 心血管
  { id: 'cv-cardio-001', name: '主动脉夹层', category: 'vascular', modality: ['CT', 'MR'], bodyPart: ['胸部', '腹部'],
    keywords: ['主动脉夹层', '主动脉壁内血肿'],
    patterns: [/主动脉夹层/i, /主动脉壁内血肿/i],
    severity: 'critical', notification: { sms: true, phone: true, popup: true }, ackRequired: true, ackTimeout: 10 },
  { id: 'cv-cardio-002', name: '肺栓塞', category: 'pulmo', modality: ['CT'], bodyPart: ['胸部'],
    keywords: ['肺栓塞', '大面积肺栓塞', '肺动脉栓塞'],
    patterns: [/肺栓塞/i, /(大面积|广泛性|双侧性)肺栓塞/i],
    severity: 'critical', notification: { sms: true, phone: true, popup: true }, ackRequired: true, ackTimeout: 30 },
  { id: 'cv-cardio-003', name: '心包填塞', category: 'cardio', modality: ['CT', 'US', 'MR'], bodyPart: ['心脏', '胸部'],
    keywords: ['心包填塞', '心脏压塞', '心包积液'],
    patterns: [/心包填塞/i, /心包积液.*?压迫/i],
    severity: 'critical', notification: { sms: true, phone: true, popup: true }, ackRequired: true, ackTimeout: 10 },

  // 胸腹
  { id: 'cv-pulmo-001', name: '气胸', category: 'pulmo', modality: ['CT', 'DR'], bodyPart: ['胸部'],
    keywords: ['气胸', '张力性气胸', '液气胸'],
    patterns: [/(张力性|大量)气胸/i, /液气胸/i],
    severity: 'critical', notification: { sms: true, phone: false, popup: true }, ackRequired: true, ackTimeout: 30 },
  { id: 'cv-abd-001', name: '消化道穿孔', category: 'abdomen', modality: ['CT', 'DR'], bodyPart: ['腹部'],
    keywords: ['消化道穿孔', '膈下游离气体', '游离气体'],
    patterns: [/消化道穿孔/i, /膈下游离气体/i, /游离气体/],
    severity: 'critical', notification: { sms: true, phone: true, popup: true }, ackRequired: true, ackTimeout: 10 },
  { id: 'cv-abd-002', name: '肠扭转/绞窄', category: 'abdomen', modality: ['CT'], bodyPart: ['腹部'],
    keywords: ['肠扭转', '绞窄性肠梗阻', '肠系膜扭转'],
    patterns: [/肠扭转/i, /绞窄性肠梗阻/i, /肠系膜扭转/i],
    severity: 'critical', notification: { sms: true, phone: true, popup: true }, ackRequired: true, ackTimeout: 30 },
  { id: 'cv-abd-003', name: '异位妊娠破裂', category: 'abdomen', modality: ['US', 'CT'], bodyPart: ['盆腔'],
    keywords: ['异位妊娠', '宫外孕', '异位妊娠破裂'],
    patterns: [/异位妊娠.*?(破裂|出血)/i, /宫外孕.*?(破裂|出血)/i],
    severity: 'critical', notification: { sms: true, phone: true, popup: true }, ackRequired: true, ackTimeout: 10 },

  // 创伤
  { id: 'cv-trauma-001', name: '骨折伴脱位', category: 'trauma', modality: ['CT', 'DR'], bodyPart: ['四肢', '脊柱'],
    keywords: ['开放性骨折', '粉碎性骨折', '脱位'],
    patterns: [/开放性骨折/i, /粉碎性骨折.*?(移位|成角)/i, /关节脱位/i],
    severity: 'urgent', notification: { sms: false, phone: false, popup: true }, ackRequired: false, ackTimeout: 0 },
];

export interface CriticalMatch {
  rule: CriticalRule;
  matchedText: string;
  matchType: 'keyword' | 'pattern';
  timestamp: string;
}

export interface CriticalValueEvent extends CriticalMatch {
  id: string;
  reportId: string;
  status: 'pending' | 'acked' | 'escalated';
  ackBy?: string;
  ackAt?: string;
  escalateAt?: string;
  notifyChannels: string[];
}

// 匹配文本
export function detectCriticalValues(
  text: string,
  modality: string = 'CT',
  bodyPart: string = ''
): CriticalMatch[] {
  const matches: CriticalMatch[] = [];
  for (const rule of CRITICAL_VALUE_RULES) {
    if (rule.modality.length > 0 && !rule.modality.includes(modality)) continue;
    if (rule.bodyPart.length > 0 && !rule.bodyPart.includes(bodyPart)) continue;

    // 关键词匹配
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        matches.push({ rule, matchedText: kw, matchType: 'keyword', timestamp: new Date().toISOString() });
        break;
      }
    }
    if (matches.find(m => m.rule.id === rule.id)) continue;

    // 模式匹配
    for (const pat of rule.patterns) {
      const m = text.match(pat);
      if (m) {
        matches.push({ rule, matchedText: m[0], matchType: 'pattern', timestamp: new Date().toISOString() });
        break;
      }
    }
  }
  return matches;
}

// 严重度排序
export function sortBySeverity(matches: CriticalMatch[]): CriticalMatch[] {
  const order = { critical: 0, urgent: 1, warning: 2 };
  return [...matches].sort((a, b) => order[a.rule.severity] - order[b.rule.severity]);
}

export const CRITICAL_VALUE_TOTAL = CRITICAL_VALUE_RULES.length;
