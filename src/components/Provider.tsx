/**
 * G005 放射RIS系统 v3.0.0 - Provider 组合
 * Phase T2-W4/T3-W6: 应用全局 Provider
 *
 * 组合:
 *   - ErrorBoundary(全局错误兜底)
 *   - antd ConfigProvider(主题 + 中文 locale)
 *   - antd App(全局 message/notification)
 *   - SkipLink + LiveRegion(a11y)
 *   - Sentry 错误监控
 *   - Web Vitals 性能监控
 *   - CSP + Security Meta 注入
 *
 * 用法:
 *   <Provider>
 *     <App />
 *   </Provider>
 */

import { useEffect, useState, type ReactNode } from 'react';
import { ConfigProvider, App as AntdApp, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import i18n, { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';
import { initSentry, captureError } from '@/observability/sentry';
import { reportWebVitals, performanceMarks } from '@/observability/webVitals';
import { injectCSP, injectSecurityMetaTags } from '@/security/csp';
import { SkipLink, LiveRegion, MAIN_CONTENT_ID } from '@/a11y/SkipLink';

// ============= Design Tokens =============
const LIGHT_TOKENS = {
  colorPrimary: '#1e40af',
  colorSuccess: '#059669',
  colorWarning: '#d97706',
  colorError: '#dc2626',
  colorInfo: '#2563eb',
  colorBgLayout: '#f1f5f9',
  colorTextBase: '#0f172a',
  borderRadius: 8,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Roboto, sans-serif",
  fontSize: 14,
};

const DARK_TOKENS = {
  ...LIGHT_TOKENS,
  colorBgBase: '#0f172a',
  colorBgContainer: '#1e293b',
  colorBgLayout: '#0f172a',
  colorTextBase: '#f1f5f9',
  colorText: '#f1f5f9',
  colorTextSecondary: '#cbd5e1',
  colorBorder: '#334155',
};

// ============= Error Fallback =============
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }): JSX.Element {
  useEffect(() => {
    captureError(error, { source: 'ErrorBoundary' });
  }, [error]);

  return (
    <div
      role="alert"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#fef2f2',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ color: '#dc2626', fontSize: 24, marginBottom: 16 }}>
        ⚠️ 出现错误
      </h1>
      <pre
        style={{
          background: '#fff',
          padding: 16,
          borderRadius: 8,
          maxWidth: 800,
          overflow: 'auto',
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        {error.message}
      </pre>
      <button
        type="button"
        onClick={resetErrorBoundary}
        style={{
          padding: '8px 16px',
          background: '#1e40af',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        重试
      </button>
    </div>
  );
}

// ============= 主题切换器 =============
type ThemeMode = 'light' | 'dark';

function useThemeMode(): [ThemeMode, () => void, (mode: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('g005.theme') as ThemeMode) ?? 'light';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset['theme'] = mode;
    localStorage.setItem('g005.theme', mode);
  }, [mode]);

  return [mode, () => setMode((m) => (m === 'light' ? 'dark' : 'light')), setMode];
}

// ============= Locale 切换 =============
function useAntLocale(): typeof zhCN {
  const { i18n } = useTranslation();
  const lang = i18n.language as SupportedLanguage;
  return lang === 'en_US' ? enUS : zhCN;
}

// ============= Provider 主组件 =============
export function Provider({ children }: { children: ReactNode }): JSX.Element {
  // CSP + Security Meta 注入
  useEffect(() => {
    if (typeof document === 'undefined') return;
    injectCSP();
    injectSecurityMetaTags();
  }, []);

  // Sentry 初始化
  useEffect(() => {
    initSentry();
  }, []);

  // Web Vitals 监控
  useEffect(() => {
    const markName = 'g005.appMount';
    performanceMarks.mark(markName);
    reportWebVitals();
  }, []);

  const [themeMode] = useThemeMode();
  const antLocale = useAntLocale();
  const isDark = themeMode === 'dark';

  // 错误兜底(react-error-boundary)
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => captureError(error, { source: 'ErrorBoundary' })}
      onReset={() => {
        // 清空可能引起错误的本地状态
        if (typeof window !== 'undefined') {
          // 保留用户偏好
        }
      }}
    >
      <I18nextProvider i18n={i18n}>
        <ConfigProvider
          locale={antLocale}
          theme={{
            algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: isDark ? DARK_TOKENS : LIGHT_TOKENS,
            components: {
              Layout: {
                headerBg: isDark ? '#1e293b' : '#ffffff',
                siderBg: isDark ? '#0f172a' : '#1e40af',
                bodyBg: isDark ? '#0f172a' : '#f1f5f9',
              },
              Menu: {
                darkItemBg: '#0f172a',
                darkSubMenuItemBg: '#0f172a',
                darkItemSelectedBg: '#1e40af',
              },
            },
          }}
        >
          <AntdApp
            notification={{ placement: 'topRight', duration: 4 }}
            message={{ duration: 3 }}
          >
            <SkipLink targetId={MAIN_CONTENT_ID} />
            <LiveRegion message="" politeness="polite" />
            {children}
          </AntdApp>
        </ConfigProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}

// ============= 支持的语言类型导出 =============
export { SUPPORTED_LANGUAGES, type SupportedLanguage };
