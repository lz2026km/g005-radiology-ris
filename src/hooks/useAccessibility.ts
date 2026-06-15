// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react';

const ANNOUNCER_ID = 'ris-live-announcer';

export function useAnnouncer() {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const existing = document.getElementById(ANNOUNCER_ID) as HTMLDivElement | null;
    if (existing) {
      elRef.current = existing;
      return;
    }
    const el = document.createElement('div');
    el.id = ANNOUNCER_ID;
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    Object.assign(el.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });
    document.body.appendChild(el);
    elRef.current = el;
    return () => { el.remove(); };
  }, []);

  const announce = useCallback((message: string) => {
    const el = elRef.current;
    if (el) {
      el.textContent = '';
      requestAnimationFrame(() => {
        if (el) el.textContent = message;
      });
    }
  }, []);

  return { announce };
}

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(selector));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const focusable = getFocusable();
    if (focusable.length > 0) focusable[0].focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return { containerRef };
}

export function useSkipLink() {
  const [isVisible, setIsVisible] = useState(false);
  const skipRef = useRef<HTMLAnchorElement>(null);

  const show = useCallback(() => { setIsVisible(true); }, []);
  const hide = useCallback(() => { setIsVisible(false); }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !isVisible) {
        setIsVisible(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  return { isVisible, skipRef, show, hide };
}
