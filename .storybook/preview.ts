/**
 * G005 放射RIS系统 v3.0.0 - Storybook 预览配置
 * Phase T2-W5: 全局装饰器 + a11y 主题 + i18n
 */

import type { Preview, Decorator } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import { ConfigProvider, App as AntdApp, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useState } from 'react';
import i18n from '../src/i18n';
import '../src/styles/design-system.css';

// 全局 i18n 包装
const I18nDecorator: Decorator = (Story) => (
  <I18nextProvider i18n={i18n}>
    <Story />
  </I18nextProvider>
);

// 全局 antd 主题包装(浅色默认)
const AntdDecorator: Decorator = (Story, context) => {
  const [dark, setDark] = useState(false);
  const locale = context.globals.locale === 'en' ? enUS : zhCN;

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1e40af',
          colorSuccess: '#059669',
          colorWarning: '#d97706',
          colorError: '#dc2626',
          borderRadius: 8,
        },
      }}
    >
      <AntdApp notification={{ placement: 'topRight' }}>
        <div data-theme={dark ? 'dark' : 'light'} style={{ minHeight: '100vh', padding: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setDark(!dark)}
              style={{
                border: '1px solid var(--border-default)',
                background: 'transparent',
                padding: '4px 12px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              {dark ? '☀️ 浅色' : '🌙 暗色'}
            </button>
          </div>
          <Story />
        </div>
      </AntdApp>
    </ConfigProvider>
  );
};

const preview: Preview = {
  decorators: [I18nDecorator, AntdDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'gray-50', value: '#f8fafc' },
        { name: 'gray-100', value: '#f1f5f9' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
    a11y: {
      // WCAG 2.1 AA
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'image-alt', enabled: true },
          { id: 'link-name', enabled: true },
          { id: 'list', enabled: true },
          { id: 'listitem', enabled: true },
          { id: 'region', enabled: true },
        ],
      },
    },
  },
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'i18n locale',
      defaultValue: 'zh',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'zh', title: '中文' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
