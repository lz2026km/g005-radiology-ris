/**
 * G005 放射RIS系统 v3.0.3.31 - 测量引擎测试
 * Phase T1-W2: 单元测试
 * 覆盖 RECIST 1.1 评估 + SUV 计算
 */

import { describe, it, expect } from 'vitest';
import {
  compareTemporal,
  calculateSuv,
  type MeasurementResult,
} from '../measurementEngine';

const mkResult = (value: number, id = 'les-1'): MeasurementResult => ({
  lesionId: id,
  standard: 'recist-1.1',
  value,
  unit: 'mm',
  confidence: 0.9,
  timestamp: '2026-06-06T08:00:00.000Z',
});

describe('measurementEngine - compareTemporal (RECIST 1.1)', () => {
  it('CR: changePercent <= -100% (完全消失)', () => {
    const baseline = mkResult(50);
    const followUp = mkResult(0);
    const r = compareTemporal(baseline, followUp);
    expect(r.assessment).toBe('CR');
    expect(r.changePercent).toBe(-100);
  });

  it('CR: changePercent < -100% (over-shrinkage, 仍判 CR)', () => {
    const baseline = mkResult(50);
    const followUp = mkResult(-10);
    const r = compareTemporal(baseline, followUp);
    expect(r.assessment).toBe('CR');
    expect(r.changePercent).toBe(-120);
  });

  it('PR: changePercent <= -30% (部分缓解)', () => {
    const baseline = mkResult(100);
    const followUp = mkResult(70);
    const r = compareTemporal(baseline, followUp);
    expect(r.assessment).toBe('PR');
    expect(r.changePercent).toBeCloseTo(-30, 6);
  });

  it('PR: changePercent 在 -30% ~ -100% 之间', () => {
    const baseline = mkResult(100);
    const followUp = mkResult(50);
    const r = compareTemporal(baseline, followUp);
    expect(r.assessment).toBe('PR');
    expect(r.changePercent).toBeCloseTo(-50, 6);
  });

  it('SD: changePercent 介于 -30% 与 20% 之间 (疾病稳定)', () => {
    const baseline = mkResult(100);
    const followUp = mkResult(100);
    const r = compareTemporal(baseline, followUp);
    expect(r.assessment).toBe('SD');
    expect(r.changePercent).toBe(0);
  });

  it('SD: changePercent = 19% (仍判 SD)', () => {
    const baseline = mkResult(100);
    const followUp = mkResult(119);
    const r = compareTemporal(baseline, followUp);
    expect(r.assessment).toBe('SD');
    expect(r.changePercent).toBe(19);
  });

  it('SD: changePercent = -29% (仍判 SD)', () => {
    const baseline = mkResult(100);
    const followUp = mkResult(71);
    const r = compareTemporal(baseline, followUp);
    expect(r.assessment).toBe('SD');
    expect(r.changePercent).toBeCloseTo(-29, 6);
  });

  it('PD: changePercent >= 20% (疾病进展)', () => {
    const baseline = mkResult(100);
    const followUp = mkResult(120);
    const r = compareTemporal(baseline, followUp);
    expect(r.assessment).toBe('PD');
    expect(r.changePercent).toBe(20);
  });

  it('PD: changePercent = 50% (明显进展)', () => {
    const baseline = mkResult(100);
    const followUp = mkResult(150);
    const r = compareTemporal(baseline, followUp);
    expect(r.assessment).toBe('PD');
    expect(r.changePercent).toBe(50);
  });

  it('baseline.value = 0 返回 NE (Not Evaluable)', () => {
    const baseline = mkResult(0);
    const followUp = mkResult(50);
    const r = compareTemporal(baseline, followUp);
    expect(r.assessment).toBe('NE');
    expect(r.changePercent).toBe(0);
  });
});

describe('measurementEngine - calculateSuv (PET SUV)', () => {
  it('正常体重计算 SUV', () => {
    const suv = calculateSuv(5, 370_000_000, 70);
    expect(suv).toBeCloseTo((5 * 70) / 370_000_000 * 1000, 6);
  });

  it('低体重患者 SUV 较高', () => {
    const suv = calculateSuv(5, 370_000_000, 50);
    expect(suv).toBeGreaterThan(0);
  });

  it('injectedDose = 0 返回 0', () => {
    const suv = calculateSuv(5, 0, 70);
    expect(suv).toBe(0);
  });

  it('bodyWeight = 0 返回 0', () => {
    const suv = calculateSuv(5, 370_000_000, 0);
    expect(suv).toBe(0);
  });

  it('高剂量 SUV 较低', () => {
    const low = calculateSuv(5, 100_000_000, 70);
    const high = calculateSuv(5, 500_000_000, 70);
    expect(low).toBeGreaterThan(high);
  });

  it('activityConcentration = 0 返回 0', () => {
    const suv = calculateSuv(0, 370_000_000, 70);
    expect(suv).toBe(0);
  });
});
