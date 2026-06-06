/**
 * G005 放射RIS系统 v3.0.0 - Storybook 主配置
 * Phase T2-W5: 全面启用 + a11y addon + 视觉回归
 */

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    // '@chromatic-com/storybook',  // 视觉回归(可选)
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
  },
  viteFinal: async (config) => {
    // 加入路径别名
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': new URL('../src', import.meta.url).pathname,
      '@components': new URL('../src/components', import.meta.url).pathname,
      '@hooks': new URL('../src/hooks', import.meta.url).pathname,
      '@utils': new URL('../src/utils', import.meta.url).pathname,
      '@machines': new URL('../src/machines', import.meta.url).pathname,
      '@i18n': new URL('../src/i18n', import.meta.url).pathname,
    };
    return config;
  },
  staticDirs: ['../public'],
  core: {
    disableTelemetry: true,
  },
};

export default config;
