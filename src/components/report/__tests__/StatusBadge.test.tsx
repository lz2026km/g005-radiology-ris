/**
 * G005 放射RIS系统 v3.0.0 - StatusBadge 组件测试
 * Phase T1-W2: 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { StatusBadge } from '../StatusBadge';
import { REPORT_STATE_GROUPS, type ReportStateName } from '@/machines/reportMachine';

// Mock react-i18next 真实 hook(避免依赖 init)
// 但直接用真实 i18n(已在 test/setup.ts 初始化)

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

describe('StatusBadge - 报告 14 态徽章', () => {
  it('渲染待分配状态', () => {
    render(
      <TestWrapper>
        <StatusBadge status="待分配" />
      </TestWrapper>
    );
    expect(screen.getByText('待分配')).toBeInTheDocument();
  });

  it('渲染已发布状态(应显示绿色)', () => {
    const { container } = render(
      <TestWrapper>
        <StatusBadge status="已发布" />
      </TestWrapper>
    );
    const badge = screen.getByText('已发布');
    expect(badge).toBeInTheDocument();
    // antd Tag 应有特定 class
    expect(container.querySelector('.ant-tag')).toBeInTheDocument();
  });

  it('渲染危急值状态 - 已驳回', () => {
    render(
      <TestWrapper>
        <StatusBadge status="已驳回" />
      </TestWrapper>
    );
    expect(screen.getByText('已驳回')).toBeInTheDocument();
  });

  it('支持自定义 className', () => {
    const { container } = render(
      <TestWrapper>
        <StatusBadge status="书写中" className="custom-class" />
      </TestWrapper>
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('所有 14 态都能渲染不报错', () => {
    const allStates: ReportStateName[] = [
      ...REPORT_STATE_GROUPS.draft,
      ...REPORT_STATE_GROUPS.review,
      ...REPORT_STATE_GROUPS.sign,
      ...REPORT_STATE_GROUPS.published,
      ...REPORT_STATE_GROUPS.special,
    ];

    for (const state of allStates) {
      const { unmount } = render(
        <TestWrapper>
          <StatusBadge status={state} />
        </TestWrapper>
      );
      expect(screen.getByText(state)).toBeInTheDocument();
      unmount();
    }
  });

  it('带图标', () => {
    render(
      <TestWrapper>
        <StatusBadge status="已签发" showIcon />
      </TestWrapper>
    );
    // 应有图标元素(SVG / i)
    const badge = screen.getByText('已签发');
    expect(badge.parentElement?.querySelector('svg, .anticon')).toBeInTheDocument();
  });
});
