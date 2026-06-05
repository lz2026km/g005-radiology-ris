// ============================================================
// G005 放射RIS系统 v2.0.0 - 单元测试
// Phase R8 W7-G: vitest 核心引擎 + 工具覆盖
// ============================================================

import { describe, it, expect } from 'vitest';
import { detectCriticalValues, sortBySeverity, CRITICAL_VALUE_RULES } from '../criticalValueEngine';
import { scoreQuality } from '../qualityScoreEngine';

describe('CriticalValueEngine', () => {
  it('detects brain hemorrhage keyword', () => {
    const matches = detectCriticalValues('右侧基底节区脑出血约 25ml', 'CT', '头颅');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].rule.id).toBe('cv-neuro-001');
    expect(matches[0].rule.severity).toBe('critical');
  });

  it('detects aortic dissection', () => {
    const matches = detectCriticalValues('主动脉夹层 Stanford A 型', 'CT', '胸部');
    expect(matches.some(m => m.rule.id === 'cv-cardio-001')).toBe(true);
  });

  it('detects pulmonary embolism', () => {
    const matches = detectCriticalValues('双侧大面积肺栓塞', 'CT', '胸部');
    expect(matches.some(m => m.rule.id === 'cv-cardio-002')).toBe(true);
  });

  it('detects pneumothorax', () => {
    const matches = detectCriticalValues('右侧张力性气胸，肺组织压缩 80%', 'DR', '胸部');
    expect(matches.some(m => m.rule.id === 'cv-pulmo-001')).toBe(true);
  });

  it('returns empty for normal text', () => {
    const matches = detectCriticalValues('双肺纹理清晰，未见明显异常', 'CT', '胸部');
    expect(matches).toEqual([]);
  });

  it('sorts by severity (critical first)', () => {
    const text = '主动脉夹层 Stanford A 型 + 张力性气胸';
    const matches = detectCriticalValues(text, 'CT', '胸部');
    const sorted = sortBySeverity(matches);
    expect(sorted[0].rule.severity).toBe('critical');
  });

  it('matches with proper types', () => {
    const text = '脑出血 25ml';
    const matches = detectCriticalValues(text, 'CT', '头颅');
    matches.forEach((m: any) => {
      expect(m.rule).toBeDefined();
      expect(m.matchedText).toBeTruthy();
      expect(['keyword', 'pattern']).toContain(m.matchType);
    });
  });

  it('detects free air (perforation)', () => {
    const matches = detectCriticalValues('膈下游离气体 考虑消化道穿孔', 'CT', '腹部');
    expect(matches.some((m: any) => m.rule.id === 'cv-abd-001')).toBe(true);
  });

  it('detects ectopic pregnancy', () => {
    const matches = detectCriticalValues('异位妊娠破裂 腹腔积血', 'US', '盆腔');
    expect(matches.some((m: any) => m.rule.id === 'cv-abd-003')).toBe(true);
  });

  it('filters by modality', () => {
    const matches = detectCriticalValues('脑出血 25ml', 'US', '头颅');
    expect(matches).toEqual([]);
  });

  it('has at least 10 rules', () => {
    expect(CRITICAL_VALUE_RULES.length).toBeGreaterThanOrEqual(10);
  });
});

describe('QualityScoreEngine', () => {
  it('scores 100 for perfect report', () => {
    const result = scoreQuality({
      reportId: 'r-001',
      hasFindings: true,
      hasImpression: true,
      findingsLength: 200,
      impressionLength: 50,
      hasMeasurement: true,
      hasPriorCompare: true,
      hasCriticalValue: false,
      hasImageAnnotation: true,
      signedBy: '张明远',
      modifiedAfterSign: false,
    });
    expect(result.grade).toBe('甲');
    expect(result.total).toBeGreaterThanOrEqual(90);
  });

  it('scores 丙 for incomplete report', () => {
    const result = scoreQuality({
      reportId: 'r-002',
      hasFindings: false,
      hasImpression: false,
      findingsLength: 0,
      impressionLength: 0,
      hasMeasurement: false,
      hasPriorCompare: false,
      hasCriticalValue: false,
      hasImageAnnotation: false,
      signedBy: '张明远',
      modifiedAfterSign: true,
    });
    expect(result.grade).toBe('丙');
    expect(result.total).toBeLessThan(75);
  });

  it('detects issues for missing findings', () => {
    const result = scoreQuality({
      reportId: 'r-003',
      hasFindings: false,
      hasImpression: true,
      findingsLength: 0,
      impressionLength: 50,
      hasMeasurement: true,
      hasPriorCompare: true,
      hasCriticalValue: false,
      hasImageAnnotation: true,
      signedBy: '张明远',
      modifiedAfterSign: false,
    });
    expect(result.dimensions.completeness.issues.length).toBeGreaterThan(0);
    expect(result.dimensions.completeness.score).toBeLessThan(80);
  });

  it('weights sum to 1.0', () => {
    const result = scoreQuality({
      reportId: 'r-004',
      hasFindings: true,
      hasImpression: true,
      findingsLength: 100,
      impressionLength: 30,
      hasMeasurement: true,
      hasPriorCompare: true,
      hasCriticalValue: false,
      hasImageAnnotation: true,
      signedBy: '张明远',
      modifiedAfterSign: false,
    });
    const totalWeight = Object.values(result.dimensions).reduce((s: number, d: any) => s + d.weight, 0);
    expect(Math.abs(totalWeight - 1.0)).toBeLessThan(0.01);
  });
});

describe('CriticalValueEngine - Modality Filter', () => {
  it('CT/MR for neuro', () => {
    const ctMatches = detectCriticalValues('急性脑梗死', 'CT', '头颅');
    const usMatches = detectCriticalValues('急性脑梗死', 'US', '头颅');
    expect(ctMatches.length).toBeGreaterThan(0);
    expect(usMatches.length).toBe(0);
  });
});
