/**
 * 语言切换器组件 - I8: 侧边栏底部Language Switcher下拉组件
 * G005 Radiology RIS System
 */
import React, { useState } from 'react';
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

  const currentLanguage = languages.find(l => l.code === currentLocale) || languages[0];

  const handleSelect = (locale: string) => {
    onLocaleChange?.(locale);
    setIsOpen(false);
    // 触发语言变更事件
    window.dispatchEvent(new CustomEvent('localechange', { detail: { locale } }));
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: compact ? '6px 8px' : '8px 12px',
          borderRadius: 6,
          cursor: 'pointer',
          background: isOpen ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
          transition: 'background 0.15s',
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
      </div>

      {isOpen && (
        <div
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
            <div
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                cursor: 'pointer',
                background: currentLocale === lang.code ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
              }}
              onMouseEnter={e => { if (currentLocale !== lang.code) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'; }}
              onMouseLeave={e => { if (currentLocale !== lang.code) e.currentTarget.style.background = 'transparent'; }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#f0f2f5', fontWeight: 500 }}>{lang.label}</div>
                {!compact && <div style={{ fontSize: 10, color: '#8b919e' }}>{lang.nativeLabel}</div>}
              </div>
              {currentLocale === lang.code && <Check size={14} color="#6366f1" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;