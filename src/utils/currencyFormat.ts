/**
 * 货币格式化工具 - I3: Intl.NumberFormat处理CNY/USD格式
 * G005 Radiology RIS System
 */

type CurrencyLocale = 'zh-CN' | 'en-US';
type CurrencyCode = 'CNY' | 'USD';

/**
 * 格式化货币
 * @param amount 金额
 * @param locale 语言环境
 * @param showSymbol 是否显示货币符号
 */
export function formatCurrency(amount: number | string, locale: CurrencyLocale = 'zh-CN', showSymbol: boolean = true): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return showSymbol ? (locale === 'zh-CN' ? '¥0.00' : '$0.00') : '0.00';
  }

  const currencyMap: Record<CurrencyLocale, CurrencyCode> = {
    'zh-CN': 'CNY',
    'en-US': 'USD',
  };

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyMap[locale],
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(num);
}

/**
 * 格式化数字为本地化格式
 * @param num 数字
 * @param locale 语言环境
 * @param precision 小数位数
 */
export function formatNumber(num: number | string, locale: CurrencyLocale = 'zh-CN', precision: number = 2): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) {
    return '0';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(n);
}