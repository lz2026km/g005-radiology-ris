/**
 * 货币格式化工具
 * G005 Radiology RIS System
 */

/**
 * 格式化货币为 ¥xxx,xxx.xx
 */
export function formatCurrency(amount: number | string, showSymbol: boolean = true): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return showSymbol ? '¥0.00' : '0.00';
  }
  
  const [integer, decimal] = num.toFixed(2).split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return showSymbol ? `¥${formattedInteger}.${decimal}` : `${formattedInteger}.${decimal}`;
}

/**
 * 解析货币字符串为数字
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[¥,，\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}