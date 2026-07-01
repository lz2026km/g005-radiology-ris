import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { SkipLink, LiveRegion, useScreenReaderAnnouncer } from '../SkipLink';
import { renderHook, act } from '@testing-library/react';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

describe('SkipLink', () => {
  it('renders skip link with correct href', () => {
    render(
      <TestWrapper>
        <SkipLink targetId="main-content" />
      </TestWrapper>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link.textContent).toBeTruthy();
  });

  it('hidden by default, visible on focus', () => {
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

  it('hidden after blur', () => {
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

  it('supports custom targetId', () => {
    render(
      <TestWrapper>
        <SkipLink targetId="custom-target" />
      </TestWrapper>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#custom-target');
  });
});

describe('LiveRegion', () => {
  it('renders status role + aria-live', () => {
    render(
      <TestWrapper>
        <LiveRegion message="Operation successful" politeness="polite" />
      </TestWrapper>
    );
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
    expect(region.textContent).toBe('Operation successful');
  });

  it('supports assertive politeness', () => {
    render(
      <TestWrapper>
        <LiveRegion message="Error" politeness="assertive" />
      </TestWrapper>
    );
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'assertive');
  });

  it('visually hidden - screen reader only', () => {
    const { container } = render(
      <TestWrapper>
        <LiveRegion message="Hidden content" />
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
  it('initial announce and Announcement', () => {
    const { result } = renderHook(() => useScreenReaderAnnouncer());
    expect(result.current.announce).toBeTypeOf('function');
    expect(result.current.Announcement).toBeTypeOf('function');
  });

  it('announce updates message', async () => {
    const { result } = renderHook(() => useScreenReaderAnnouncer());

    act(() => {
      result.current.announce('Saved');
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    const { getByRole } = render(<result.current.Announcement />);
    const region = getByRole('status');
    expect(region.textContent).toContain('Saved');
  });
});
