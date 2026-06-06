/**
 * G005 放射RIS系统 v3.0.0 - 货币格式化工具
 * Phase T1-W2: 严格化 + 测试覆盖
 */

import Decimal from 'decimal.js';

/** 格式化货币为 ¥xxx,xxx.xx */
export function formatCurrency(amount: number | string | Decimal, showSymbol = true): string {
  try {
    const d = amount instanceof Decimal ? amount : new Decimal(amount);
    if (d.isNaN()) {
      return showSymbol ? '¥0.00' : '0.00';
    }
    const [integer, decimal] = d.toFixed(2).split('.');
    const formattedInteger = (integer ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return showSymbol ? `¥${formattedInteger}.${decimal}` : `${formattedInteger}.${decimal}`;
  } catch {
    return showSymbol ? '¥0.00' : '0.00';
  }
}

/** 解析货币字符串为数字 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[¥,，\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/** 金额相加(避免浮点精度问题) */
export function addCurrency(a: number | string, b: number | string): number {
  try {
    return new Decimal(a).plus(b).toNumber();
  } catch {
    return 0;
  }
}

/** 金额相减 */
export function subtractCurrency(a: number | string, b: number | string): number {
  try {
    return new Decimal(a).minus(b).toNumber();
  } catch {
    return 0;
  }
}

/** 金额乘法 */
export function multiplyCurrency(a: number | string, b: number | string): number {
  try {
    return new Decimal(a).times(b).toNumber();
  } catch {
    return 0;
  }
}

/** 金额除法 */
export function divideCurrency(a: number | string, b: number | string, defaultValue = 0): number {
  try {
    const result = new Decimal(a).dividedBy(b);
    if (result.isNaN() || !result.isFinite()) return defaultValue;
    return result.toNumber();
  } catch {
    return defaultValue;
  }
}

/** 金额四舍五入(2 位小数) */
export function roundCurrency(amount: number | string): number {
  try {
    return new Decimal(amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
  } catch {
    return 0;
  }
}

/** 折扣计算(支持 0-1 或 0-100) */
export function applyDiscount(amount: number, discount: number, isPercentage = true): number {
  if (isPercentage) {
    return multiplyCurrency(amount, 1 - divideCurrency(discount, 100));
  }
  return multiplyCurrency(amount, 1 - discount);
}

/** 增值税计算(中国 13% / 9% / 6%) */
export function calculateVAT(amount: number, rate: 0.13 | 0.09 | 0.06 = 0.13): number {
  return multiplyCurrency(amount, rate);
}
