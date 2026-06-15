// ============================================================
// G005 放射科RIS系统 v1.0.1 - 结构化字段表单
// Phase R1：支持 7 种数据类型、字段联动、必填校验
// ============================================================

// @ts-nocheck

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Check, X, Search, Star, MoreHorizontal } from 'lucide-react';
import type { StructuredFieldTemplate, TemplateFieldDefinition } from '../../data/structuredFieldTemplates';

export interface StructuredFieldFormProps {
  template: StructuredFieldTemplate;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onValidationChange?: (valid: boolean, errors: string[]) => void;
  readonly?: boolean;
  showGroups?: boolean;
}

const MEDICAL_COLORS = [
  { label: '红色 (危急)', value: '#dc2626' },
  { label: '橙色 (中度)', value: '#f97316' },
  { label: '黄色 (轻度)', value: '#f59e0b' },
  { label: '绿色 (正常)', value: '#10b981' },
  { label: '蓝色 (良性)', value: '#3b82f6' },
  { label: '紫色 (可疑)', value: '#8b5cf6' },
  { label: '灰色 (未见)', value: '#94a3b8' },
  { label: '黑色', value: '#1e293b' },
  { label: '白色', value: '#ffffff' },
];

const shakeKeyframesStyle = `
@keyframes sff-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
`;

// ---- Sub-components ----

interface FieldWrapperProps {
  field: TemplateFieldDefinition;
  error?: string;
  labelEl: React.ReactNode;
  errorEl?: React.ReactNode;
  submitted: boolean;
  children: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({ field, error, labelEl, errorEl, submitted, children }) => {
  const isShaking = submitted && !!error;
  return (
    <div key={field.id} id={`sff-field-${field.fieldKey}`} style={{
      padding: 8,
      background: '#fff',
      border: `1px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
      borderRadius: 6,
      transition: 'border-color 0.15s',
      animation: isShaking ? 'sff-shake 0.5s ease-in-out' : 'none',
    }}>
      {labelEl}
      {children}
      {errorEl}
    </div>
  );
};

interface AutocompleteFieldProps {
  field: TemplateFieldDefinition;
  value: any;
  onChange: (key: string, value: any) => void;
  readonly?: boolean;
}

const AutocompleteField: React.FC<AutocompleteFieldProps> = ({ field, value, onChange, readonly }) => {
  const options = field.options || [];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value || '');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput(value || '');
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.label.toLowerCase().includes(input.toLowerCase()));

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <input
        type="text"
        value={input}
        placeholder={field.placeholder}
        onChange={e => {
          setInput(e.target.value);
          setOpen(true);
          onChange(field.fieldKey, e.target.value);
        }}
        onFocus={() => setOpen(true)}
        style={inputBaseStyle}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          maxHeight: 160,
          overflowY: 'auto',
          marginTop: 2,
        }}>
          {filtered.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                setInput(opt.label);
                setOpen(false);
                onChange(field.fieldKey, opt.value);
              }}
              style={{
                padding: '6px 10px',
                fontSize: 12,
                cursor: 'pointer',
                color: '#334155',
                background: value === opt.value ? '#dbeafe' : 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = value === opt.value ? '#dbeafe' : 'transparent'; }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface TagsFieldProps {
  field: TemplateFieldDefinition;
  value: any;
  onChange: (key: string, value: any) => void;
  readonly?: boolean;
}

const TagsField: React.FC<TagsFieldProps> = ({ field, value, onChange, readonly }) => {
  const tags: string[] = Array.isArray(value) ? value : [];
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange(field.fieldKey, [...tags, trimmed]);
    setInput('');
  };

  const removeTag = (idx: number) => {
    onChange(field.fieldKey, tags.filter((_, i) => i !== idx));
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4,
      alignItems: 'center',
    }}>
      {tags.map((tag, i) => (
        <span key={i} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          padding: '2px 8px',
          background: '#dbeafe',
          color: '#1e40af',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
        }}>
          {tag}
          {!readonly && (
            <X
              size={12}
              style={{ cursor: 'pointer' }}
              onClick={() => removeTag(i)}
            />
          )}
        </span>
      ))}
      {!readonly && (
        <input
          type="text"
          value={input}
          placeholder={field.placeholder || '输入后回车添加'}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(input); }
            if (e.key === 'Backspace' && !input && tags.length > 0) removeTag(tags.length - 1);
          }}
          onBlur={() => { if (input) addTag(input); }}
          style={{
            width: 80,
            flex: 1,
            minWidth: 60,
            padding: '2px 4px',
            border: 'none',
            fontSize: 13,
            outline: 'none',
          }}
        />
      )}
    </div>
  );
};

interface ColorFieldProps {
  field: TemplateFieldDefinition;
  value: any;
  onChange: (key: string, value: any) => void;
  readonly?: boolean;
}

const ColorField: React.FC<ColorFieldProps> = ({ field, value, onChange, readonly }) => {
  const selected = value || MEDICAL_COLORS[6].value;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => !readonly && setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          border: '1px solid #cbd5e1',
          borderRadius: 4,
          background: '#fff',
          cursor: readonly ? 'default' : 'pointer',
          fontSize: 12,
        }}
      >
        <span style={{
          display: 'inline-block',
          width: 18,
          height: 18,
          borderRadius: 3,
          background: selected,
          border: selected === '#ffffff' ? '1px solid #cbd5e1' : 'none',
        }} />
        <span style={{ color: '#475569' }}>{MEDICAL_COLORS.find(c => c.value === selected)?.label || selected}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 4,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          padding: 6,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 4,
        }}>
          {MEDICAL_COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => { onChange(field.fieldKey, c.value); setOpen(false); }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                background: c.value,
                border: selected === c.value ? '2px solid #1e40af' : c.value === '#ffffff' ? '1px solid #cbd5e1' : '2px solid transparent',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Main component ----

export const StructuredFieldForm: React.FC<StructuredFieldFormProps> = ({
  template,
  values,
  onChange,
  onValidationChange,
  readonly = false,
  showGroups = true,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuGroup, setOpenMenuGroup] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // 按字段分组
  const groupedFields = useMemo(() => {
    const groups: Record<string, TemplateFieldDefinition[]> = {};
    for (const field of template.fields) {
      if (!groups[field.fieldGroup]) groups[field.fieldGroup] = [];
      groups[field.fieldGroup].push(field);
    }
    for (const key in groups) {
      groups[key].sort((a, b) => a.order - b.order);
    }
    return groups;
  }, [template]);

  // 校验
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    for (const field of template.fields) {
      const val = values[field.fieldKey];
      if (field.required) {
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[field.fieldKey] = `${field.fieldLabel}为必填项`;
          continue;
        }
      }
      if (val !== undefined && val !== null && val !== '' && field.validation) {
        if (field.validation.min !== undefined && Number(val) < field.validation.min) {
          newErrors[field.fieldKey] = `${field.fieldLabel}不能小于 ${field.validation.min}`;
        } else if (field.validation.max !== undefined && Number(val) > field.validation.max) {
          newErrors[field.fieldKey] = `${field.fieldLabel}不能大于 ${field.validation.max}`;
        }
      }
    }
    setErrors(newErrors);
    onValidationChange?.(Object.keys(newErrors).length === 0, Object.values(newErrors));
  }, [values, template, onValidationChange]);

  const isFieldVisible = (field: TemplateFieldDefinition): boolean => {
    if (!field.dependsOn) return true;
    const depVal = values[field.dependsOn];
    if (depVal === undefined || depVal === null || depVal === '') return false;
    if (typeof depVal === 'boolean') return depVal === true;
    return depVal !== 'none' && depVal !== 'normal';
  };

  const handleChange = (key: string, value: any) => {
    onChange(key, value);
  };

  // Inject keyframes once
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('sff-shake-style')) {
      const style = document.createElement('style');
      style.id = 'sff-shake-style';
      style.textContent = shakeKeyframesStyle;
      document.head.appendChild(style);
    }
  }, []);

  // Aggregate invalid count per group
  const groupInvalidCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const field of template.fields) {
      if (errors[field.fieldKey]) {
        counts[field.fieldGroup] = (counts[field.fieldGroup] || 0) + 1;
      }
    }
    return counts;
  }, [template, errors]);

  // Completion stats per group
  const groupCompletion = useMemo(() => {
    const stats: Record<string, { filled: number; total: number }> = {};
    for (const [groupName, fields] of Object.entries(groupedFields)) {
      let total = 0;
      let filled = 0;
      for (const f of fields) {
        if (!f.required) continue;
        if (!isFieldVisible(f)) continue;
        total++;
        const val = values[f.fieldKey];
        if (val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)) {
          filled++;
        }
      }
      stats[groupName] = { filled, total };
    }
    return stats;
  }, [groupedFields, values]);

  // Batch fill default values
  const batchFillDefaults = useCallback((groupName: string) => {
    const fields = groupedFields[groupName] || [];
    for (const f of fields) {
      const val = values[f.fieldKey];
      const isEmpty = val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
      if (isEmpty && f.defaultValue !== undefined && f.defaultValue !== null && f.defaultValue !== '') {
        onChange(f.fieldKey, f.defaultValue);
      }
    }
    setOpenMenuGroup(null);
  }, [groupedFields, values, onChange]);

  const matchesSearch = useCallback((field: TemplateFieldDefinition): boolean => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return field.fieldLabel.toLowerCase().includes(q) || field.fieldKey.toLowerCase().includes(q);
  }, [searchQuery]);

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const renderField = (field: TemplateFieldDefinition) => {
    if (!isFieldVisible(field)) return null;
    const value = values[field.fieldKey];
    const error = errors[field.fieldKey];
    const required = field.required;
    const matches = matchesSearch(field);

    const labelEl = (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
        fontSize: 12,
        fontWeight: 600,
        color: '#334155',
      }}>
        {required && <span style={{ color: '#dc2626' }}>*</span>}
        <span>{field.fieldLabel}</span>
        {field.unit && <span style={{ color: '#94a3b8', fontWeight: 400 }}>({field.unit})</span>}
        {field.category && (
          <span style={{
            fontSize: 9,
            padding: '1px 5px',
            background: '#dbeafe',
            color: '#1e40af',
            borderRadius: 3,
            fontWeight: 700,
          }}>{field.category}</span>
        )}
      </div>
    );

    const errorEl = error ? (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
        fontSize: 10,
        color: '#dc2626',
      }}>
        <AlertCircle size={11} />
        {error}
      </div>
    ) : null;

    const outerStyle: React.CSSProperties = {
      opacity: matches ? 1 : 0.3,
      transition: 'opacity 0.25s ease',
    };

    const renderWrapper = (children: React.ReactNode) => (
      <div key={field.id} id={`sff-field-${field.fieldKey}`} style={{ ...outerStyle }}>
        <FieldWrapper field={field} error={error} labelEl={labelEl} errorEl={errorEl} submitted={submitted}>
          {children}
        </FieldWrapper>
      </div>
    );

    if (readonly) {
      return renderWrapper(
        <div style={{ fontSize: 13, color: '#475569', minHeight: 20 }}>
          {value === undefined || value === '' || value === null ? <span style={{ color: '#cbd5e1' }}>—</span> : String(value)}
        </div>
      );
    }

    switch (field.dataType) {
      case 'text':
        return renderWrapper(
          <input
            type="text"
            value={value || ''}
            placeholder={field.placeholder}
            onChange={e => handleChange(field.fieldKey, e.target.value)}
            style={inputBaseStyle}
          />
        );

      case 'number':
        return renderWrapper(
          <input
            type="number"
            value={value || ''}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            onChange={e => handleChange(field.fieldKey, e.target.value ? Number(e.target.value) : '')}
            style={inputBaseStyle}
          />
        );

      case 'enum':
        return renderWrapper(
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {field.options?.map(opt => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange(field.fieldKey, opt.value)}
                  style={{
                    padding: '4px 10px',
                    border: `1px solid ${selected ? (opt.color || '#3b82f6') : '#cbd5e1'}`,
                    borderRadius: 14,
                    background: selected ? (opt.color ? `${opt.color}15` : '#dbeafe') : '#fff',
                    color: selected ? (opt.color || '#1e40af') : '#475569',
                    fontSize: 11,
                    fontWeight: selected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      case 'multi-enum': {
        const currentArr: string[] = Array.isArray(value) ? value : [];
        return renderWrapper(
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {field.options?.map(opt => {
              const selected = currentArr.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const newArr = selected
                      ? currentArr.filter(v => v !== opt.value)
                      : [...currentArr, opt.value];
                    handleChange(field.fieldKey, newArr);
                  }}
                  style={{
                    padding: '4px 10px',
                    border: `1px solid ${selected ? (opt.color || '#3b82f6') : '#cbd5e1'}`,
                    borderRadius: 14,
                    background: selected ? (opt.color ? `${opt.color}15` : '#dbeafe') : '#fff',
                    color: selected ? (opt.color || '#1e40af') : '#475569',
                    fontSize: 11,
                    fontWeight: selected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  {selected && <Check size={10} />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        );
      }

      case 'boolean':
        return (
          <div key={field.id} id={`sff-field-${field.fieldKey}`} style={{
            ...outerStyle,
            padding: 8,
            background: '#fff',
            border: `1px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
            borderRadius: 6,
            transition: 'border-color 0.15s',
            animation: submitted && error ? 'sff-shake 0.5s ease-in-out' : 'none',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={value === true}
                onChange={e => handleChange(field.fieldKey, e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
                {field.fieldLabel}{field.unit && <span style={{ color: '#94a3b8' }}> ({field.unit})</span>}
              </span>
            </label>
            {required && <span style={{ color: '#dc2626', fontSize: 10, marginLeft: 24 }}>*</span>}
            {errorEl}
          </div>
        );

      case 'date':
        return renderWrapper(
          <input
            type="date"
            value={value || ''}
            onChange={e => handleChange(field.fieldKey, e.target.value)}
            style={{
              padding: '6px 8px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 13,
              outline: 'none',
            }}
          />
        );

      case 'scale': {
        const scaleOptions = field.options || [
          { label: '0', value: '0' },
          { label: '1', value: '1' },
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
          { label: '5', value: '5' },
        ];
        return renderWrapper(
          <div style={{ display: 'flex', gap: 4 }}>
            {scaleOptions.map(opt => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange(field.fieldKey, opt.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: `1px solid ${selected ? (opt.color || '#3b82f6') : '#cbd5e1'}`,
                    borderRadius: 4,
                    background: selected ? (opt.color || '#dbeafe') : '#fff',
                    color: selected ? '#fff' : '#475569',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );
      }

      case 'autocomplete':
        return renderWrapper(
          <AutocompleteField field={field} value={value} onChange={handleChange} readonly={readonly} />
        );

      case 'tags':
        return renderWrapper(
          <TagsField field={field} value={value} onChange={handleChange} readonly={readonly} />
        );

      case 'slider': {
        const min = field.validation?.min ?? 0;
        const max = field.validation?.max ?? 100;
        const step = 1;
        const numVal = value !== undefined && value !== '' ? Number(value) : min;
        return renderWrapper(
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={numVal}
              onChange={e => handleChange(field.fieldKey, Number(e.target.value))}
              style={{ flex: 1, accentColor: '#3b82f6' }}
            />
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#334155',
              minWidth: 32,
              textAlign: 'right',
            }}>
              {numVal}{field.unit || ''}
            </span>
          </div>
        );
      }

      case 'rating': {
        const numVal = value !== undefined && value !== '' ? Number(value) : 0;
        return renderWrapper(
          <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(star => {
              const filled = star <= numVal;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleChange(field.fieldKey, star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: filled ? '#f59e0b' : '#e2e8f0',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => { if (!filled) e.currentTarget.style.color = '#fde68a'; }}
                  onMouseLeave={e => { if (!filled) e.currentTarget.style.color = '#e2e8f0'; }}
                >
                  <Star size={18} fill={filled ? '#f59e0b' : 'none'} />
                </button>
              );
            })}
            {numVal > 0 && (
              <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4, lineHeight: '22px' }}>
                {numVal}/5
              </span>
            )}
          </div>
        );
      }

      case 'color':
        return renderWrapper(
          <ColorField field={field} value={value} onChange={handleChange} readonly={readonly} />
        );

      default:
        return null;
    }
  };

  return (
    <div ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Search */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, color: '#94a3b8', pointerEvents: 'none' }} />
        <input
          type="text"
          value={searchQuery}
          placeholder="搜索字段..."
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px 8px 32px',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            fontSize: 12,
            outline: 'none',
            background: '#f8fafc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {Object.entries(groupedFields).map(([groupName, fields]) => {
        const isCollapsed = collapsedGroups.has(groupName);
        const visibleFields = fields.filter(f => isFieldVisible(f));
        if (visibleFields.length === 0) return null;

        const comp = groupCompletion[groupName];
        const invalidCount = groupInvalidCount[groupName] || 0;

        return (
          <div key={groupName} style={{
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            {showGroups && (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => {
                    const next = new Set(collapsedGroups);
                    if (isCollapsed) next.delete(groupName);
                    else next.add(groupName);
                    setCollapsedGroups(next);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    border: 'none',
                    borderBottom: isCollapsed ? 'none' : '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#1e40af',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{groupName} ({visibleFields.length})</span>
                    {comp.total > 0 && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: '#64748b',
                        background: '#f1f5f9',
                        padding: '1px 6px',
                        borderRadius: 8,
                      }}>
                        {comp.filled}/{comp.total} 已完成
                      </span>
                    )}
                    {invalidCount > 0 && submitted && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#dc2626',
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 700,
                      }}>
                        !
                      </span>
                    )}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        setOpenMenuGroup(openMenuGroup === groupName ? null : groupName);
                      }}
                      style={{
                        padding: '2px 4px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        color: '#64748b',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <MoreHorizontal size={14} />
                    </div>
                    {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </div>
                </button>
                {openMenuGroup === groupName && (
                  <div style={{
                    position: 'absolute',
                    right: 32,
                    top: '100%',
                    marginTop: 2,
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 200,
                    minWidth: 140,
                  }}>
                    <button
                      type="button"
                      onClick={() => batchFillDefaults(groupName)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: '#334155',
                        textAlign: 'left',
                        borderRadius: 6,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                    >
                      批量填充默认值
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Progress bar */}
            {comp.total > 0 && (
              <div style={{ height: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(comp.filled / comp.total) * 100}%`,
                  background: comp.filled === comp.total ? '#10b981' : '#3b82f6',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            )}

            {!isCollapsed && (
              <div style={{
                padding: 10,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
                background: '#fff',
              }}>
                {fields.map(f => {
                  const visible = isFieldVisible(f);
                  return (
                    <div
                      key={f.id}
                      id={`sff-dep-${f.id}`}
                      style={{
                        maxHeight: visible ? 200 : 0,
                        opacity: visible ? 1 : 0,
                        overflow: visible ? 'visible' : 'hidden',
                        transition: 'max-height 0.35s ease, opacity 0.3s ease',
                      }}
                    >
                      {visible ? renderField(f) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StructuredFieldForm;
