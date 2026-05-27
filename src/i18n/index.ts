/**
 * i18n 配置 - G005 Radiology RIS System
 * 支持中文(zh_CN)和英文(en_US)国际化
 */
import i18n from 'i18next';
import { init, use } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

import zhCN from './locales/zh_CN.json';
import enUS from './locales/en_US.json';

export const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
};

// 初始化配置
const initI18n = () => {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'zh-CN',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
    });
  return i18n;
};

// 便捷格式化方法 - I10: 参数化提示文案
export const format = (key: string, params?: Record<string, unknown>): string => {
  return i18n.t(key, params);
};

// 获取当前语言
export const getCurrentLocale = (): string => {
  return i18n.language || 'zh-CN';
};

// 获取方向 (RTL支持 - I6)
export const getDirection = (): 'ltr' | 'rtl' => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  const currentLang = i18n.language?.split('-')[0] || 'zh';
  return rtlLanguages.includes(currentLang) ? 'rtl' : 'ltr';
};

// 语言切换
export const changeLanguage = (locale: string) => {
  return i18n.changeLanguage(locale);
};

export default i18n;