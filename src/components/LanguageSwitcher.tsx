/**
 * 语言切换器组件 - I8: 侧边栏底部Language Switcher下拉组件
 * G005 Radiology RIS System
 */
import React, { useRef, useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface Language {
  code: string;
  label: string;
  nativeLabel: string;
}

const languages: Language[] = [
  { code: 'zh-CN', label: '中文', nativeLabel: '简体中文' },
  { code: 'en-US', label: 'English', nativeLabel: 'US English' },
];

interface LanguageSwitcherProps {
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLocale = 'zh-CN',
  onLocaleChange,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const found = languages.find(l => l.code === currentLocale);
  const currentLanguage: Language = found ?? languages[0]!;

  const handleSelect = (locale: string) => {
    onLocaleChange?.(locale);
    setIsOpen(false);
    // 触发语言变更事件
    window.dispatchEvent(new CustomEvent('localechange', { detail: { locale } }));
    buttonRef.current?.focus();
  };

  const handleToggleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const opts = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
      if (opts.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? Array.from(opts).indexOf(active as HTMLButtonElement) : -1;
      const next = e.key === 'ArrowDown'
        ? (idx + 1) % opts.length
        : (idx - 1 + opts.length) % opts.length;
      opts[next]?.focus();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={currentLanguage.nativeLabel}
        onKeyDown={handleToggleKeyDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: compact ? '6px 8px' : '8px 12px',
          borderRadius: 6,
          cursor: 'pointer',
          background: isOpen ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
          transition: 'background 0.15s',
          border: 'none',
          color: 'inherit',
        }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'; }}
        onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
      >
        <Globe size={16} color="#8b919e" />
        {!compact && (
          <>
            <span style={{ fontSize: 12, color: '#c8ccd4' }}>{currentLanguage.nativeLabel}</span>
            <ChevronDown size={14} color="#8b919e" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="语言选择"
          onKeyDown={handleMenuKeyDown}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: compact ? 8 : 12,
            marginBottom: 4,
            background: '#1a1a2e',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 8,
            padding: '4px 0',
            minWidth: compact ? 100 : 140,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
          }}
        >
          {languages.map(lang => (
            <button
              type="button"
              key={lang.code}
              role="menuitem"
              aria-label={lang.nativeLabel}
              tabIndex={-1}
              onClick={() => handleSelect(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                cursor: 'pointer',
                width: '100%',
                background: currentLocale === lang.code ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                border: 'none',
                color: 'inherit',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (currentLocale !== lang.code) e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'; }}
              onMouseLeave={e => { if (currentLocale !== lang.code) e.currentTarget.style.background = 'transparent'; }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#f0f2f5', fontWeight: 500 }}>{lang.label}</div>
                {!compact && <div style={{ fontSize: 10, color: '#8b919e' }}>{lang.nativeLabel}</div>}
              </div>
              {currentLocale === lang.code && <Check size={14} color="#3b82f6" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;