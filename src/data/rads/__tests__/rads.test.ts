// ============================================================
// G005 放射RIS系统 v2.0.0 - 评分函数测试
// ============================================================

import { describe, it, expect } from 'vitest';
import { scoreBiRads } from '../biRads';
import { scoreLungRads } from '../lungRads';
import { scorePiRads } from '../piRads';
import { scoreTiRads } from '../tiRads';
import { scoreLiRads } from '../liRads';
import { scoreCadRads } from '../cadRads';
import { scoreViRads } from '../viRads';

describe('BI-RADS Scorer', () => {
  it('scores benign BI-RADS 2 for circumscribed oval mass', () => {
    const r = scoreBiRads({ hasMass: true, massShape: 'oval', massMargin: 'circumscribed' });
    expect(r.category).toBe('3');
  });

  it('scores BI-RADS 5 for spiculated mass', () => {
    const r = scoreBiRads({ hasMass: true, massMargin: 'spiculated' });
    expect(r.category).toBe('5');
    expect(r.riskLevel).toBe('very-high');
  });
});

describe('Lung-RADS Scorer', () => {
  it('scores Lung-RADS 2 for small solid nodule', () => {
    const r = scoreLungRads({ noduleType: 'solid', sizeMm: 4 });
    expect(r.category).toBe('2');
  });

  it('scores Lung-RADS 4B for 16mm solid nodule', () => {
    const r = scoreLungRads({ noduleType: 'solid', sizeMm: 16 });
    expect(r.category).toBe('4B');
  });
});

describe('PI-RADS Scorer', () => {
  it('scores PI-RADS 5 for high DWI', () => {
    const r = scorePiRads({ zone: 'peripheral', t2wScore: 2, dwiScore: 5, sizeMm: 18 });
    expect(r.category).toBe('5');
  });
});

describe('TI-RADS Scorer', () => {
  it('scores TI-RADS 3 for total 3 points', () => {
    const r = scoreTiRads({ composition: 3, echogenicity: 0, shape: 0, margin: 0, echogenicFoci: 0, sizeMm: 10 });
    expect(r.category).toBe('TR3');
  });
});

describe('LI-RADS Scorer', () => {
  it('scores LI-RADS 5 for classic HCC triad', () => {
    const r = scoreLiRads({
      sizeMm: 30,
      hasNonrimAPHE: true,
      hasWashout: true,
      hasThresholdGrowth: true,
    });
    expect(r.category).toBe('LR-5');
  });
});

describe('CAD-RADS Scorer', () => {
  it('scores CAD-RADS 0 for no stenosis', () => {
    const r = scoreCadRads({ maxStenosisPercent: 0, affectedVessels: 0 });
    expect(r.category).toBe('0');
  });

  it('scores CAD-RADS 4B for 3-vessel disease', () => {
    const r = scoreCadRads({ maxStenosisPercent: 80, affectedVessels: 3 });
    expect(r.category).toBe('4B');
  });
});

describe('VI-RADS Scorer', () => {
  it('scores VI-RADS 1 for small bladder tumor', () => {
    const r = scoreViRads({ sizeMm: 8 });
    expect(r.category).toBe('1');
  });

  it('scores VI-RADS 5 for perivesical invasion', () => {
    const r = scoreViRads({ sizeMm: 30, perivesicalInvasion: true });
    expect(r.category).toBe('5');
  });
});
