/**
 * G005 放射RIS系统 v3.0.4 - i18n 国际化基础设施
 * v3.0.1:18 命名空间 + 4 v3
 * v3.0.2:15 命名空间
 * v3.0.2.1 维持
 * v3.0.2.2 增量:3 命名空间 (v3quality / v3archive / v3cosign)
 * v3.0.2.3 增量:3 命名空间 (v3ai / v3pwa / v3statsV2)
 * v3.0.3.31 维持,共 58 命名空间
 * v3.0.4    ✦ 命名空间懒加载基础设施 (i18next-http-backend 风格)
 *          zh_CN / en_US 双语全部对齐
 *
 * ════════════════════════════════════════════════════════════════════════════
 * 命名空间懒加载模式 (v3.0.4)
 * ════════════════════════════════════════════════════════════════════════════
 * 之前:v3.0.3.x - 静态 import zh_CN.json (57KB) + en_US.json (56KB)
 *                   → 113KB 在初始 bundle,首屏阻塞
 * 现在:v3.0.4    - Custom HttpBackend 按需 fetch /locales/{lng}/{ns}.json
 *                 - 启动时仅加载 ['common', 'nav'] 两个最常用命名空间
 *                 - 路由切换时通过 i18n.loadNamespaces([...]) 触发按需加载
 *                 - 静态 import 作为 SSR / 测试 / 离线降级的 fallback
 *
 * 文件结构:
 *   src/i18n/locales/
 *     zh_CN.json          ← 聚合(zh_CN 命名空间,仅 fallback 用)
 *     en_US.json          ← 聚合(en_US 命名空间,仅 fallback 用)
 *     zh-CN/<ns>.json     ← 按命名空间拆分(运行时 fetch)
 *     en-US/<ns>.json     ← 按命名空间拆分(运行时 fetch)
 *
 * 迁移步骤(后续 PR 完成):
 *   1. 创建 58 个命名空间文件 ✅ v3.0.4 (本文)
 *   2. 各路由组件在 useEffect 中调用 i18n.loadNamespaces(['exam', 'report'])
 *   3. 删除聚合 zh_CN.json / en_US.json 静态导入(可选,保留作 fallback)
 * ════════════════════════════════════════════════════════════════════════════
 */

import i18nLib from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { z } from "zod";
import zhCN from "./locales/zh_CN.json";
import enUS from "./locales/en_US.json";

// jsdom(vitest) 下 LanguageDetector 导致 languageUtils 为 null,使用干净实例
const isTestEnv =
  typeof process !== "undefined" && process.env.NODE_ENV === "test";

// ────────────────────────────────────────────────────────────────────────────
// 自定义动态后端:懒加载 /locales/{lng}/{ns}.json
// 设计动机:不引入 i18next-http-backend 依赖(~5KB),改用 20 行原生 fetch
// ────────────────────────────────────────────────────────────────────────────
interface I18nBackendServices {
  backendConnector: {
    saveMissing: (...args: unknown[]) => void;
  };
}
class HttpBackend {
  static type = "backend" as const;
  type = "backend" as const;
  services!: I18nBackendServices;

  init(services: I18nBackendServices): void {
    this.services = services;
  }

  read(
    language: string,
    namespace: string,
    callback: (err: unknown, data?: Record<string, unknown>) => void,
  ): void {
    // 语言代码映射:i18next 期望 'zh-CN' / 'en-US',文件名同样
    const lng = language.replace("_", "-");
    const url = `/locales/${lng}/${namespace}.json`;
    fetch(url, { credentials: "same-origin" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        return res.json();
      })
      .then((data) => callback(null, data))
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] lazy load failed: ${url}`, err);
        }
        callback(err);
      });
  }
}

export const SUPPORTED_LANGUAGES = ["zh_CN", "en_US"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_META: Record<
  SupportedLanguage,
  { nativeName: string; englishName: string; flag: string }
> = {
  zh_CN: {
    nativeName: "简体中文",
    englishName: "Simplified Chinese",
    flag: "🇨🇳",
  },
  en_US: { nativeName: "English", englishName: "English (US)", flag: "🇺🇸" },
};

const i18n = i18nLib.createInstance();

// 插件列表:浏览器环境加载 HttpBackend + LanguageDetector + initReactI18next
// 测试环境(jsdom)跳过 HttpBackend(没有 fetch) 与 LanguageDetector(语言工具 null)
type I18nPlugin = Parameters<typeof i18n.use>[0];
const plugins: I18nPlugin[] = isTestEnv
  ? []
  : [HttpBackend, LanguageDetector, initReactI18next];
let instance = i18n;
for (const p of plugins) instance = instance.use(p);

const baseConfig: Record<string, unknown> = {
  // 静态 fallback:测试 / 离线 / 早期首屏渲染,HttpBackend fetch 未完成前可用
  resources: {
    zh_CN: { translation: zhCN },
    en_US: { translation: enUS },
  },
  // 懒加载相关:HttpBackend 配置 + 初始命名空间白名单
  backend: {
    loadPath: "/locales/{{lng}}/{{ns}}.json",
  },
  ns: ["common", "nav"],
  defaultNS: "common",
  fallbackNS: "common",
  lng: "zh_CN",
  fallbackLng: "zh_CN",
  partialBundledLanguages: true,
  interpolation: { escapeValue: false },
  returnNull: false,
};
const prodConfig: Record<string, unknown> = {
  supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
  nonExplicitSupportedLngs: true,
  detection: {
    order: ["localStorage", "navigator", "htmlTag"],
    caches: ["localStorage"],
    lookupLocalStorage: "g005.i18n.language",
  },
  react: { useSuspense: false },
  saveMissing: import.meta.env.DEV,
  missingKeyHandler: (lng: string, _ns: string, key: string) => {
    if (import.meta.env.DEV)
      console.warn(`[i18n] Missing key: ${key} (${lng})`);
  },
};
const initConfig = isTestEnv ? baseConfig : { ...baseConfig, ...prodConfig };
export const initPromise = instance.init(
  initConfig as unknown as Parameters<typeof instance.init>[0],
);

export default i18n;

export type TranslationKeys = typeof zhCN;

export const changeLanguage = (lang: SupportedLanguage): Promise<unknown> =>
  i18n.changeLanguage(lang);

export const getCurrentLanguage = (): SupportedLanguage =>
  (i18n.language as SupportedLanguage) ?? "zh_CN";

/**
 * 按需加载命名空间(路由切换时调用)
 * @example
 *   useEffect(() => { ensureNamespaces(['exam', 'report']) }, []);
 */
export const ensureNamespaces = (
  namespaces: string | string[],
): Promise<unknown> => {
  const list = Array.isArray(namespaces) ? namespaces : [namespaces];
  const loaded = Object.keys(
    i18n.getResourceBundle(i18n.language ?? "zh_CN", "translation") ?? {},
  );
  const missing = list.filter(
    (ns) => !loaded.includes(ns) && NAMESPACES.includes(ns as Namespace),
  );
  if (missing.length === 0) return Promise.resolve();
  return i18n.loadNamespaces(missing);
};

export const LanguageSchema = z.enum(SUPPORTED_LANGUAGES);

export const NAMESPACES = [
  "common",
  "nav",
  "status",
  "role",
  "exam",
  "report",
  "patient",
  "device",
  "critical",
  "dashboard",
  "error",
  "auth",
  "template",
  "review",
  "collab",
  "ai",
  "dicom",
  "worklist",
  "v3dicom",
  "v3report",
  "v3worklist",
  "v3collab",
  "v3patient",
  "v3exam",
  "v3admin",
  "v3stats",
  "v3mobile",
  "v3a11y",
  "v3security",
  "v3ui",
  "v3form",
  "v3chart",
  "v3error",
  "v3time",
  "v3notify",
  "v3keyword",
  "v3hl7",
  "phraseBank",
  "aiReview",
  "keywordHighlight",
  "voice",
  "revision",
  "audit",
  "similarCase",
  "sr",
  "v3criticalV2",
  "patientV2",
  "examV2",
  "adminV2",
  "statsV2",
  "mobileV2",
  "v3quality",
  "v3archive",
  "v3cosign",
  "v3ai",
  "v3pwa",
  "v3statsV2",
  "v3sign",
  "v3amend",
  "v3ge",
  "v3siemens",
  "v3philips",
  "v3canon",
  "v3061ai",
  "v3061perf",
  "v3061security",
  "v3061workflow",
  "app",
  "materials",
  "print",
  "reportV2",
  "regional",
] as const;
export type Namespace = (typeof NAMESPACES)[number];
