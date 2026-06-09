/**
 * G005 放射RIS系统 v3.0.2.1 - a11y 全面验证
 * v3.0.2.1 迁移 jest-axe → vitest-axe
 *
 * 验收:Lighthouse a11y ≥ 90 / axe-core 0 violations
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { ConfigProvider, App as AntdApp } from 'antd'
import { MemoryRouter } from 'react-router-dom'
import { axe, AxeMatchers } from 'vitest-axe'
import i18n from '@/i18n'

// v3.0.2.1:Vitest 模块扩展 — Assertion 包含 toHaveNoViolations
declare module 'vitest' {
  interface Assertion<T = any> extends AxeMatchers {}
}

// 测试包装器
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider>
        <AntdApp>
          <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
        </AntdApp>
      </ConfigProvider>
    </I18nextProvider>
  );
}

// 动态导入 V3 页面(懒加载)
const lazyImport = async (path: string) => {
  return await import(/* @vite-ignore */ path);
};

describe('V3 页面 a11y 验证', () => {
  it('HomeV3Page 无严重 a11y 违规', async () => {
    const { default: HomeV3Page } = await lazyImport('../pages/HomeV3Page');
    const { container } = render(
      <TestWrapper>
        <HomeV3Page />
      </TestWrapper>
    );
    const results = await axe(container as Element)
    expect(results).toHaveNoViolations()
  });

  it('PatientV3Page 无严重 a11y 违规', async () => {
    const { default: PatientV3Page } = await lazyImport('../pages/PatientV3Page');
    const { container } = render(
      <TestWrapper>
        <PatientV3Page />
      </TestWrapper>
    );
    const results = await axe(container as Element)
    expect(results).toHaveNoViolations()
  });

  it('StatisticsV3Page 无严重 a11y 违规', async () => {
    const { default: StatisticsV3Page } = await lazyImport('../pages/StatisticsV3Page');
    const { container } = render(
      <TestWrapper>
        <StatisticsV3Page />
      </TestWrapper>
    );
    const results = await axe(container as Element)
    expect(results).toHaveNoViolations()
  });

  it('DirectorDashboardV3Page 无严重 a11y 违规', async () => {
    const { default: DirectorDashboardV3Page } = await lazyImport('../pages/DirectorDashboardV3Page');
    const { container } = render(
      <TestWrapper>
        <DirectorDashboardV3Page />
      </TestWrapper>
    );
    const results = await axe(container as Element)
    expect(results).toHaveNoViolations()
  });
});

describe('V3 业务组件 a11y', () => {
  it('AppEmpty 无 a11y 违规', async () => {
    const { AppEmpty } = await lazyImport('../components/feedback');
    const { container } = render(
      <TestWrapper>
        <AppEmpty />
      </TestWrapper>
    );
    const results = await axe(container as Element)
    expect(results).toHaveNoViolations()
  });

  it('AppProgress role=progressbar aria-valuenow 正确', async () => {
    const { AppProgress } = await lazyImport('../components/feedback');
    const { container, getByRole } = render(
      <TestWrapper>
        <AppProgress percent={75} ariaLabel="加载中" />
      </TestWrapper>
    );
    const bar = getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-label', '加载中');
    const results = await axe(container as Element)
    expect(results).toHaveNoViolations()
  });

  it('AppAlert role 正确(error→alert,success→status)', async () => {
    const { AppAlert } = await lazyImport('../components/feedback');
    const { rerender, getByRole } = render(
      <TestWrapper>
        <AppAlert type="error" message="错误" />
      </TestWrapper>
    );
    expect(getByRole('alert')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <AppAlert type="success" message="成功" />
      </TestWrapper>
    );
    expect(getByRole('status')).toBeInTheDocument();
  });
});

describe('V3 Hook a11y', () => {
  it('useScreenReaderAnnouncer 提供 announce 函数', async () => {
    const { useScreenReaderAnnouncer } = await lazyImport('../a11y/SkipLink');
    const { renderHook } = await import('@testing-library/react');
    const { result } = renderHook(() => useScreenReaderAnnouncer());
    expect(result.current.announce).toBeTypeOf('function');
    expect(result.current.Announcement).toBeTypeOf('function');
  });
});

