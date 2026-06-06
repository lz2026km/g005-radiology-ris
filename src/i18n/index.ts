/**
 * G005 放射RIS系统 v3.0.0 - i18n 国际化
 * Phase T3-W6/W7: i18next 替换自研 + 800+ key + 中英完整
 *
 * 命名空间:common / nav / status / role / exam / report / patient / device / critical /
 *          dashboard / error / auth / template / review / collab / ai / dicom / worklist
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { z } from 'zod';
import zhCN from './locales/zh_CN.json';
import enUS from './locales/en_US.json';

/** 支持的语言 */
export const SUPPORTED_LANGUAGES = ['zh_CN', 'en_US'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** 语言元数据 */
export const LANGUAGE_META: Record<SupportedLanguage, { nativeName: string; englishName: string; flag: string }> = {
  zh_CN: { nativeName: '简体中文', englishName: 'Simplified Chinese', flag: '🇨🇳' },
  en_US: { nativeName: 'English', englishName: 'English (US)', flag: '🇺🇸' },
};

/** 初始化 i18next */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh_CN: { translation: zhCN },
      en_US: { translation: enUS },
    },
    fallbackLng: 'zh_CN',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,  // React 已转义
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'g005.i18n.language',
    },
    react: {
      useSuspense: false,
    },
    returnNull: false,
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lng, _ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing key: ${key} (${lng})`);
      }
    },
  });

export default i18n;

export type TranslationKeys = typeof zhCN;

/** 切换语言(类型安全) */
export const changeLanguage = (lang: SupportedLanguage): Promise<unknown> => i18n.changeLanguage(lang);

/** 获取当前语言 */
export const getCurrentLanguage = (): SupportedLanguage => (i18n.language as SupportedLanguage) ?? 'zh_CN';

/** Zod schema 校验语言 */
export const LanguageSchema = z.enum(SUPPORTED_LANGUAGES);

/** 命名空间 */
export const NAMESPACES = [
  'common',
  'nav',
  'status',
  'role',
  'exam',
  'report',
  'patient',
  'device',
  'critical',
  'dashboard',
  'error',
  'auth',
  'template',
  'review',
  'collab',
  'ai',
  'dicom',
  'worklist',
] as const;
export type Namespace = (typeof NAMESPACES)[number];
