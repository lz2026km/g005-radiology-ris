/**
 * 数字精度工具 - I4: Decimal.js处理医学测量值精度
 * G005 Radiology RIS System
 */
import Decimal from 'decimal.js';

/**
 * 医学测量值精度配置
 */
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
});

/**
 * 处理医学测量值的加法
 */
export function medicalAdd(a: number | string, b: number | string): string {
  return new Decimal(a).plus(b).toString();
}

/**
 * 处理医学测量值的减法
 */
export function medicalSubtract(a: number | string, b: number | string): string {
  return new Decimal(a).minus(b).toString();
}

/**
 * 处理医学测量值的乘法
 */
export function medicalMultiply(a: number | string, b: number | string): string {
  return new Decimal(a).times(b).toString();
}

/**
 * 处理医学测量值的除法
 */
export function medicalDivide(a: number | string, b: number | string, precision: number = 2): string {
  return new Decimal(a).dividedBy(b).toDecimalPlaces(precision, Decimal.ROUND_HALF_UP).toString();
}

/**
 * 格式化医学测量值
 * @param value 值
 * @param precision 小数位数
 */
export function formatMedicalValue(value: number | string, precision: number = 2): string {
  return new Decimal(value).toDecimalPlaces(precision, Decimal.ROUND_HALF_UP).toString();
}

/**
 * 比较两个医学测量值
 * @returns -1 (a < b), 0 (a == b), 1 (a > b)
 */
export function medicalCompare(a: number | string, b: number | string): number {
  return new Decimal(a).comparedTo(b);
}