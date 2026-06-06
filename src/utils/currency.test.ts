/**
 * G005 放射RIS系统 v3.0.0 - currency 工具测试
 * Phase T1-W2: 工具单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseCurrency,
  addCurrency,
  subtractCurrency,
  multiplyCurrency,
  divideCurrency,
  roundCurrency,
  applyDiscount,
  calculateVAT,
} from './currency';

describe('formatCurrency', () => {
  it('整数带符号', () => {
    expect(formatCurrency(1234)).toBe('¥1,234.00');
  });

  it('浮点数带符号', () => {
    expect(formatCurrency(1234.56)).toBe('¥1,234.56');
  });

  it('大额数字', () => {
    expect(formatCurrency(1_234_567.89)).toBe('¥1,234,567.89');
  });

  it('不带符号', () => {
    expect(formatCurrency(1234, false)).toBe('1,234.00');
  });

  it('NaN 返回 0', () => {
    expect(formatCurrency(NaN)).toBe('¥0.00');
  });

  it('字符串数字', () => {
    expect(formatCurrency('1234.56')).toBe('¥1,234.56');
  });

  it('负数', () => {
    expect(formatCurrency(-1234.56)).toBe('-¥1,234.56');
  });

  it('0', () => {
    expect(formatCurrency(0)).toBe('¥0.00');
  });
});

describe('parseCurrency', () => {
  it('解析带逗号', () => {
    expect(parseCurrency('1,234.56')).toBe(1234.56);
  });

  it('解析带 ¥ 符号', () => {
    expect(parseCurrency('¥1,234.56')).toBe(1234.56);
  });

  it('解析带中文逗号', () => {
    expect(parseCurrency('1，234.56')).toBe(1234.56);
  });

  it('解析带空格', () => {
    expect(parseCurrency('  1234.56  ')).toBe(1234.56);
  });

  it('无效返回 0', () => {
    expect(parseCurrency('abc')).toBe(0);
  });

  it('空字符串返回 0', () => {
    expect(parseCurrency('')).toBe(0);
  });
});

describe('addCurrency / subtractCurrency / multiplyCurrency', () => {
  it('相加(避免浮点精度)', () => {
    expect(addCurrency(0.1, 0.2)).toBeCloseTo(0.3, 10);
  });

  it('相减', () => {
    expect(subtractCurrency(1, 0.3)).toBeCloseTo(0.7, 10);
  });

  it('相乘', () => {
    expect(multiplyCurrency(0.1, 0.2)).toBeCloseTo(0.02, 10);
  });

  it('字符串相加', () => {
    expect(addCurrency('100.5', '200.3')).toBeCloseTo(300.8, 10);
  });
});

describe('divideCurrency', () => {
  it('正常除法', () => {
    expect(divideCurrency(10, 2)).toBe(5);
  });

  it('除以 0 返回默认值', () => {
    expect(divideCurrency(10, 0, 0)).toBe(0);
    expect(divideCurrency(10, 0)).toBe(0);
  });

  it('被除数为字符串', () => {
    expect(divideCurrency('100', '4')).toBe(25);
  });
});

describe('roundCurrency', () => {
  it('四舍五入到 2 位', () => {
    expect(roundCurrency(1.235)).toBe(1.24);
    expect(roundCurrency(1.234)).toBe(1.23);
  });

  it('大数字', () => {
    expect(roundCurrency(123.456789)).toBe(123.46);
  });
});

describe('applyDiscount', () => {
  it('百分比折扣', () => {
    expect(applyDiscount(100, 20, true)).toBe(80);
  });

  it('小数折扣', () => {
    expect(applyDiscount(100, 0.2, false)).toBe(80);
  });

  it('0 折扣', () => {
    expect(applyDiscount(100, 0)).toBe(100);
  });

  it('100 折扣', () => {
    expect(applyDiscount(100, 100, true)).toBe(0);
  });
});

describe('calculateVAT', () => {
  it('13% 增值税率', () => {
    expect(calculateVAT(1000, 0.13)).toBe(130);
  });

  it('9% 增值税率', () => {
    expect(calculateVAT(1000, 0.09)).toBe(90);
  });

  it('6% 增值税率', () => {
    expect(calculateVAT(1000, 0.06)).toBe(60);
  });

  it('默认 13%', () => {
    expect(calculateVAT(1000)).toBe(130);
  });
});
