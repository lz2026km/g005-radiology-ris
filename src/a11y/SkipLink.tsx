/**
 * G005 鏀惧皠RIS绯荤粺 v3.0.0 - a11y 璺宠繃閾炬帴 / 鐒︾偣绠＄悊
 * Phase T3-W7: 閿洏瀵艰埅 + 灞忓箷闃呰鍣?
 *
 * 鍔熻兘:
 *   - 璺宠繃瀵艰埅,鐩磋揪涓诲唴瀹?
 *   - 鍏ㄥ眬蹇嵎閿?Ctrl+K 鍛戒护闈㈡澘,Ctrl+/ 甯姪)
 *   - 鐒︾偣闄烽槺(Modal)
 *   - 瀹炴椂鍏憡(aria-live)
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/** 璺宠繃閾炬帴(鏃犻殰纰? */
export function SkipLink({ targetId = 'main-content' }: { targetId?: string }): JSX.Element {
  return (
    <a
      href={`#${targetId}`}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '0',
        zIndex: 9999,
        padding: '12px 24px',
        background: '#1e40af',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '0 0 4px 0',
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = '0';
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px';
      }}
    >
      璺冲埌涓诲唴瀹?
    </a>
  );
}

/** 涓诲唴瀹?ID(閰嶅悎 SkipLink) */
export const MAIN_CONTENT_ID = 'main-content';

/** 瀹炴椂鍏憡(aria-live) - 瑙嗚闅愯棌浣嗗睆骞曢槄璇诲櫒鍙 */
export function LiveRegion({ message, politeness = 'polite' }: { message: string; politeness?: 'polite' | 'assertive' }): JSX.Element {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {message}
    </div>
  );
}

/** 鐒︾偣闄烽槺 hook(鐢ㄤ簬 Modal / Drawer) */
export function useFocusTrap(active = true): React.RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    container.addEventListener('keydown', handleKey);
    first?.focus();

    return () => container.removeEventListener('keydown', handleKey);
  }, [active]);

  return ref;
}

/** 鍏ㄥ眬蹇嵎閿?hook */
export function useGlobalShortcuts(shortcuts: Record<string, () => void>): void {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'Ctrl',
        e.metaKey && 'Meta',
        e.altKey && 'Alt',
        e.shiftKey && 'Shift',
        e.key.toUpperCase(),
      ].filter(Boolean).join('+');

      const handler = shortcuts[key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [shortcuts]);
}

/** 鍛戒护闈㈡澘(Ctrl+K) */
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  category?: string;
}

export function useCommandPalette(items: CommandItem[]): {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  filter: string;
  setFilter: (q: string) => void;
  filtered: CommandItem[];
} {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');

  useGlobalShortcuts({
    'Ctrl+K': () => setIsOpen(true),
    'Meta+K': () => setIsOpen(true),
  });

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(filter.toLowerCase()) ||
    item.description?.toLowerCase().includes(filter.toLowerCase())
  );

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => { setIsOpen(false); setFilter(''); },
    filter,
    setFilter,
    filtered,
  };
}

/** 灞忓箷闃呰鍣ㄥ弸濂?鍔ㄦ€佸唴瀹归€氱煡 */
export function useScreenReaderAnnouncer(): {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  Announcement: () => JSX.Element;
} {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((msg: string, pri: 'polite' | 'assertive' = 'polite') => {
    setMessage('');
    // 鐭殏娓呯┖鍐嶈鍊?纭繚灞忓箷闃呰鍣ㄩ噸鏂拌
    setTimeout(() => {
      setMessage(msg);
      setPriority(pri);
    }, 50);
  }, []);

  const Announcement = useCallback(() => <LiveRegion message={message} politeness={priority} />, [message, priority]);

  return { announce, Announcement };
}
