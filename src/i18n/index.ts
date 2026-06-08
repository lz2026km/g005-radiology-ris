/**
 * G005 放射RIS系统 v3.0.1 - i18n 国际化
 * v3.0.1 升级:18 个原命名空间 + 4 个 v3 增量命名空间 (v3dicom / v3report / v3worklist / v3collab)
 * zh_CN / en_US 双语全部对齐,共 22 命名空间
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { z } from 'zod';
import zhCN from './locales/zh_CN.json';
import enUS from './locales/en_US.json';

export const SUPPORTED_LANGUAGES = ['zh_CN', 'en_US'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_META: Record<SupportedLanguage, { nativeName: string; englishName: string; flag: string }> = {
  zh_CN: { nativeName: '简体中文', englishName: 'Simplified Chinese', flag: '🇨🇳' },
  en_US: { nativeName: 'English', englishName: 'English (US)', flag: '🇺🇸' },
};

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
      escapeValue: false,
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
] as const;
export type Namespace = (typeof NAMESPACES)[number];
