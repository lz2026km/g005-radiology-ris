/**
 * G005 放射RIS系统 v3.0.2.3 - i18n 国际化
 * v3.0.1:18 命名空间 + 4 v3
 * v3.0.2:15 命名空间
 * v3.0.2.1 维持
 * v3.0.2.2 增量:3 命名空间 (v3quality / v3archive / v3cosign)
 * v3.0.2.3 增量:3 命名空间 (v3ai / v3pwa / v3statsV2)
 * zh_CN / en_US 双语全部对齐,共 58 命名空间
 */

import i18nLib from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { z } from 'zod';
import zhCN from './locales/zh_CN.json';
import enUS from './locales/en_US.json';

// jsdom(vitest) 下 LanguageDetector 导致 languageUtils 为 null,使用干净实例
const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
const i18n = i18nLib.createInstance()

export const SUPPORTED_LANGUAGES = ['zh_CN', 'en_US'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_META: Record<SupportedLanguage, { nativeName: string; englishName: string; flag: string }> = {
  zh_CN: { nativeName: '简体中文', englishName: 'Simplified Chinese', flag: '🇨🇳' },
  en_US: { nativeName: 'English', englishName: 'English (US)', flag: '🇺🇸' },
};

const plugins = isTestEnv ? [] : [LanguageDetector, initReactI18next]
let instance = i18n
for (const p of plugins) instance = instance.use(p as any)
const baseConfig: Record<string, unknown> = {
    resources: {
      zh_CN: { translation: zhCN },
      en_US: { translation: enUS },
    },
    lng: 'zh_CN',
    fallbackLng: 'zh_CN',
    interpolation: { escapeValue: false },
    returnNull: false,
  }
  const prodConfig: Record<string, unknown> = {
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true,
    detection: { order: ['localStorage', 'navigator', 'htmlTag'], caches: ['localStorage'], lookupLocalStorage: 'g005.i18n.language' },
    react: { useSuspense: false },
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lng: string, _ns: string, key: string) => { if (import.meta.env.DEV) console.warn(`[i18n] Missing key: ${key} (${lng})`) },
  }
  const initConfig = isTestEnv ? baseConfig : { ...baseConfig, ...prodConfig }
  export const initPromise = instance.init(initConfig as any);

export default i18n;

export type TranslationKeys = typeof zhCN;

export const changeLanguage = (lang: SupportedLanguage): Promise<unknown> => i18n.changeLanguage(lang);

export const getCurrentLanguage = (): SupportedLanguage => (i18n.language as SupportedLanguage) ?? 'zh_CN';

export const LanguageSchema = z.enum(SUPPORTED_LANGUAGES);

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
  'v3dicom',
  'v3report',
  'v3worklist',
  'v3collab',
  'v3patient',
  'v3exam',
  'v3admin',
  'v3stats',
  'v3mobile',
  'v3a11y',
  'v3security',
  'v3ui',
  'v3form',
  'v3chart',
  'v3error',
  'v3time',
  'v3notify',
  'v3keyword',
  'v3hl7',
  'phraseBank',
  'aiReview',
  'keywordHighlight',
  'voice',
  'review',
  'revision',
  'audit',
  'similarCase',
  'sr',
  'v3criticalV2',
  'patientV2',
  'examV2',
  'adminV2',
  'statsV2',
  'mobileV2',
  'v3quality',
  'v3archive',
  'v3cosign',
  'v3ai',
  'v3pwa',
  'v3statsV2',
] as const;
export type Namespace = (typeof NAMESPACES)[number];
