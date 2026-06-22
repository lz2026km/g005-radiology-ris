/**
 * G005 鏀惧皠RIS绯荤粺 v3.0.0 - a11y SkipLink / LiveRegion 缁勪欢娴嬭瘯
 * Phase T1-W2: 鏃犻殰纰嶆祴璇?
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

describe('SkipLink - 璺宠繃閾炬帴', () => {
  it('娓叉煋璺宠繃閾炬帴', () => {
    render(
      <TestWrapper>
        <SkipLink targetId="main-content" />
      </TestWrapper>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link.textContent).toContain('璺冲埌涓诲唴瀹?);
  });

  it('鑱氱劍鏃舵樉绀?, () => {
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

  it('澶辩劍鏃堕殣钘?, () => {
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

  it('鏀寔鑷畾涔?targetId', () => {
    render(
      <TestWrapper>
        <SkipLink targetId="custom-target" />
      </TestWrapper>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#custom-target');
  });
});

describe('LiveRegion - 瀹炴椂鍏憡', () => {
  it('娓叉煋 status role + aria-live', () => {
    render(
      <TestWrapper>
        <LiveRegion message="鎿嶄綔鎴愬姛" politeness="polite" />
      </TestWrapper>
    );
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
    expect(region.textContent).toBe('鎿嶄綔鎴愬姛');
  });

  it('鏀寔 assertive politeness', () => {
    render(
      <TestWrapper>
        <LiveRegion message="閿欒" politeness="assertive" />
      </TestWrapper>
    );
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'assertive');
  });

  it('瑙嗚涓婇殣钘?灞忓箷闃呰鍣ㄤ笓鐢?', () => {
    const { container } = render(
      <TestWrapper>
        <LiveRegion message="闅愯棌鍐呭" />
      </TestWrapper>
    );
    const region = container.querySelector('[role="status"]') as HTMLElement;
    expect(region.style.position).toBe('absolute');
    expect(region.style.width).toBe('1px');
    expect(region.style.height).toBe('1px');
    expect(region.style.overflow).toBe('hidden');
    expect(region.style.whiteSpace).toBe('nowrap');
  });
});

describe('useScreenReaderAnnouncer hook', () => {
  it('鍒濆 announce 涓?Announcement', () => {
    const { result } = renderHook(() => useScreenReaderAnnouncer());
    expect(result.current.announce).toBeTypeOf('function');
    expect(result.current.Announcement).toBeTypeOf('function');
  });

  it('announce 璋冪敤鍚庢洿鏂?message', async () => {
    const { result } = renderHook(() => useScreenReaderAnnouncer());

    act(() => {
      result.current.announce('宸蹭繚瀛?);
    });

    // Announcement 娓叉煋鏃舵樉绀烘渶鏂?message
    await new Promise((resolve) => setTimeout(resolve, 100));
    const { getByRole } = render(<result.current.Announcement />);
    const region = getByRole('status');
    expect(region.textContent).toContain('宸蹭繚瀛?);
  });
});
