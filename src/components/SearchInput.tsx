/**
 * SearchInput 组件 - 通用搜索输入框
 * G005 Radiology RIS System
 */
import React, { useCallback, useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = '搜索...',
  debounceMs = 300,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={16}
        className="absolute left-3 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        aria-label="搜索"
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 text-sm border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-gray-500 focus:outline-none focus:border-[var(--blue-accent)] focus:ring-2 focus:ring-[var(--blue-accent)]/15"
      />
      {localValue && (
        <button
          type="button"
          aria-label="清除搜索"
          onClick={handleClear}
          className="absolute right-2 p-1 hover:bg-gray-700 rounded"
        >
          <X size={14} className="text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;