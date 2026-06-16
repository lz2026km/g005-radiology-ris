import type { AnonymizationRule } from './types';

const DEFAULT_RULES: AnonymizationRule[] = [
  { tag: '00100010', action: 'replace', replaceWith: 'ANONYMIZED' },
  { tag: '00100020', action: 'hash', hashSalt: 'g005-vna-salt' },
  { tag: '00100030', action: 'dateShift', dateShiftDays: -365 },
  { tag: '00100040', action: 'remove' },
  { tag: '00080080', action: 'replace', replaceWith: 'ANONYMIZED_INST' },
  { tag: '00080090', action: 'replace', replaceWith: 'ANONYMIZED_PHYS' },
  { tag: '00081048', action: 'remove' },
  { tag: '00081050', action: 'replace', replaceWith: 'ANONYMIZED_PHYS' },
  { tag: '001021B0', action: 'remove' },
  { tag: '00321032', action: 'remove' },
  { tag: '00321033', action: 'remove' },
  { tag: '00321034', action: 'remove' },
  { tag: '00324000', action: 'remove' },
  { tag: '00401001', action: 'remove' },
  { tag: '00402010', action: 'replace', replaceWith: 'ANONYMIZED' },
  { tag: '00402011', action: 'replace', replaceWith: 'ANONYMIZED_ID' },
  { tag: '00402012', action: 'remove' },
  { tag: '00880140', action: 'remove' },
];

let anonymizationRules: AnonymizationRule[] = [...DEFAULT_RULES];

export function getAnonymizationRules(): AnonymizationRule[] {
  return anonymizationRules;
}

export function setAnonymizationRules(rules: AnonymizationRule[]): void {
  anonymizationRules = rules;
}

export function anonymizeDicomTags(tags: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = { ...tags };
  for (const rule of anonymizationRules) {
    if (!(rule.tag in result)) continue;
    switch (rule.action) {
      case 'replace':
        result[rule.tag] = rule.replaceWith ?? 'ANONYMIZED';
        break;
      case 'remove':
        delete result[rule.tag];
        break;
      case 'hash': {
        const val = result[rule.tag];
        const salt = rule.hashSalt ?? '';
        result[rule.tag] = `HASH_${Buffer ? Buffer.from(val + salt).toString('base64').slice(0, 12) : val}`;
        break;
      }
      case 'dateShift': {
        const original = result[rule.tag];
        if (original && original.length >= 8) {
          const d = new Date(`${original.slice(0, 4)}-${original.slice(4, 6)}-${original.slice(6, 8)}`);
          d.setDate(d.getDate() + (rule.dateShiftDays ?? 0));
          result[rule.tag] = d.toISOString().slice(0, 10).replace(/-/g, '');
        }
        break;
      }
      case 'keep':
        break;
    }
  }
  return result;
}
