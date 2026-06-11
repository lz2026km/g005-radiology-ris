/**
 * G005 放射RIS系统 v3.0.0 - a11y SkipLink / LiveRegion 组件测试
 * Phase T1-W2: 无障碍测试
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { SkipLink, LiveRegion, useScreenReaderAnnouncer } from '../SkipLink';
import { renderHook, act } from '@testing-library/react';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

describe('SkipLink - 跳过链接', () => {
  it('渲染跳过链接', () => {
    render(
      <TestWrapper>
        <SkipLink targetId="main-content" />
      </TestWrapper>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link.textContent).toContain('跳到主内容');
  });

  it('聚焦时显示', () => {
    render(
      <TestWrapper>
        <SkipLink targetId="main-content" />
      </TestWrapper>
    );
    const link = screen.getByRole('link');
    expect(link.style.left).toBe('-9999px');
    fireEvent.focus(link);
    expect(link.style.left).toBe('0px');
  });

  it('失焦时隐藏', () => {
    render(
      <TestWrapper>
        <SkipLink targetId="main-content" />
      </TestWrapper>
    );
    const link = screen.getByRole('link');
    fireEvent.focus(link);
    fireEvent.blur(link);
    expect(link.style.left).toBe('-9999px');
  });

  it('支持自定义 targetId', () => {
    render(
      <TestWrapper>
        <SkipLink targetId="custom-target" />
      </TestWrapper>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#custom-target');
  });
});

describe('LiveRegion - 实时公告', () => {
  it('渲染 status role + aria-live', () => {
    render(
      <TestWrapper>
        <LiveRegion message="操作成功" politeness="polite" />
      </TestWrapper>
    );
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
    expect(region.textContent).toBe('操作成功');
  });

  it('支持 assertive politeness', () => {
    render(
      <TestWrapper>
        <LiveRegion message="错误" politeness="assertive" />
      </TestWrapper>
    );
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'assertive');
  });

  it('视觉上隐藏(屏幕阅读器专用)', () => {
    const { container } = render(
      <TestWrapper>
        <LiveRegion message="隐藏内容" />
      </TestWrapper>
    );
    const region = container.querySelector('[role="status"]') as HTMLElement;
    expect(region.style.position).toBe('absolute');
    expect(region.style.left).toBe('-9999px');
    expect(region.style.width).toBe('1px');
    expect(region.style.height).toBe('1px');
    expect(region.style.overflow).toBe('hidden');
  });
});

describe('useScreenReaderAnnouncer hook', () => {
  it('初始 announce 与 Announcement', () => {
    const { result } = renderHook(() => useScreenReaderAnnouncer());
    expect(result.current.announce).toBeTypeOf('function');
    expect(result.current.Announcement).toBeTypeOf('function');
  });

  it('announce 调用后更新 message', async () => {
    const { result } = renderHook(() => useScreenReaderAnnouncer());

    act(() => {
      result.current.announce('已保存');
    });

    // Announcement 渲染时显示最新 message
    await new Promise((resolve) => setTimeout(resolve, 100));
    const { getByRole } = render(<result.current.Announcement />);
    const region = getByRole('status');
    expect(region.textContent).toContain('已保存');
  });
});
