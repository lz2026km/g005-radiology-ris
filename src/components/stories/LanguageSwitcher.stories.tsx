/**
 * G005 放射RIS系统 v3.0.0 - i18n 语言切换 Story
 * Phase T2-W4: 国际化组件
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, LANGUAGE_META, type SupportedLanguage } from '@/i18n';
import { Select } from 'antd';

const meta: Meta = {
  title: 'Common/LanguageSwitcher',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'i18next 驱动的中英双语切换。Story 仅演示组件,真实 i18n 初始化在 src/i18n/index.ts。',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const LanguageSwitcherComponent = () => {
  const { t, i18n } = useTranslation();

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2>{t('nav.home')} / {t('common.save')} / {t('report.findings')}</h2>
      <p>当前语言: <strong>{LANGUAGE_META[getCurrentLanguage()].nativeName}</strong></p>
      <Select
        value={getCurrentLanguage()}
        style={{ width: 200 }}
        onChange={(lang: SupportedLanguage) => changeLanguage(lang)}
        options={Object.entries(LANGUAGE_META).map(([code, meta]) => ({
          value: code,
          label: `${meta.flag} ${meta.nativeName} (${meta.englishName})`,
        }))}
      />
      <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
        <p>检查 i18n 键:</p>
        <ul>
          <li>nav.home: <code>{t('nav.home')}</code></li>
          <li>report.findings: <code>{t('report.findings')}</code></li>
          <li>critical.categories.CV-RAD-001: <code>{t('critical.categories.CV-RAD-001')}</code></li>
          <li>status.published: <code>{t('status.published')}</code></li>
        </ul>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <LanguageSwitcherComponent />,
};
