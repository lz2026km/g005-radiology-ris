// ============================================================
// G005 放射科RIS系统 v1.0.1 - 结构化字段表单
// Phase R1：支持 7 种数据类型、字段联动、必填校验
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { StructuredFieldTemplate, TemplateFieldDefinition } from '../../data/structuredFieldTemplates';

export interface StructuredFieldFormProps {
  template: StructuredFieldTemplate;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onValidationChange?: (valid: boolean, errors: string[]) => void;
  readonly?: boolean;
  showGroups?: boolean;
}

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

  // 按字段分组
  const groupedFields = useMemo(() => {
    const groups: Record<string, TemplateFieldDefinition[]> = {};
    for (const field of template.fields) {
      if (!groups[field.fieldGroup]) groups[field.fieldGroup] = [];
      groups[field.fieldGroup].push(field);
    }
    // 按 order 排序
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

  // 判断字段是否显示（依赖字段）
  const isFieldVisible = (field: TemplateFieldDefinition): boolean => {
    if (!field.dependsOn) return true;
    const depVal = values[field.dependsOn];
    if (field.dataType === 'boolean') {
      return depVal === true;
    }
    return depVal !== undefined && depVal !== null && depVal !== '' && depVal !== 'none' && depVal !== 'normal';
  };

  // 字段值变化处理
  const handleChange = (key: string, value: any) => {
    onChange(key, value);
  };

  // 渲染单个字段
  const renderField = (field: TemplateFieldDefinition) => {
    if (!isFieldVisible(field)) return null;
    const value = values[field.fieldKey];
    const error = errors[field.fieldKey];
    const required = field.required;

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

    const errorEl = error && (
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
    );

    const containerStyle: React.CSSProperties = {
      padding: 8,
      background: '#fff',
      border: `1px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
      borderRadius: 6,
      transition: 'border-color 0.15s',
    };

    if (readonly) {
      return (
        <div key={field.id} style={containerStyle}>
          {labelEl}
          <div style={{ fontSize: 13, color: '#475569', minHeight: 20 }}>
            {value === undefined || value === '' || value === null ? <span style={{ color: '#cbd5e1' }}>—</span> : String(value)}
          </div>
        </div>
      );
    }

    switch (field.dataType) {
      case 'text':
        return (
          <div key={field.id} style={containerStyle}>
            {labelEl}
            <input
              type="text"
              value={value || ''}
              placeholder={field.placeholder}
              onChange={e => handleChange(field.fieldKey, e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #cbd5e1',
                borderRadius: 4,
                fontSize: 13,
                outline: 'none',
              }}
            />
            {errorEl}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} style={containerStyle}>
            {labelEl}
            <input
              type="number"
              value={value || ''}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              onChange={e => handleChange(field.fieldKey, e.target.value ? Number(e.target.value) : '')}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #cbd5e1',
                borderRadius: 4,
                fontSize: 13,
                outline: 'none',
              }}
            />
            {errorEl}
          </div>
        );

      case 'enum': {
        return (
          <div key={field.id} style={containerStyle}>
            {labelEl}
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
            {errorEl}
          </div>
        );
      }

      case 'multi-enum': {
        const currentArr: string[] = Array.isArray(value) ? value : [];
        return (
          <div key={field.id} style={containerStyle}>
            {labelEl}
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
            {errorEl}
          </div>
        );
      }

      case 'boolean':
        return (
          <div key={field.id} style={containerStyle}>
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
            {errorEl}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} style={containerStyle}>
            {labelEl}
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
            {errorEl}
          </div>
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
        return (
          <div key={field.id} style={containerStyle}>
            {labelEl}
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
            {errorEl}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Object.entries(groupedFields).map(([groupName, fields]) => {
        const isCollapsed = collapsedGroups.has(groupName);
        const visibleFields = fields.filter(f => isFieldVisible(f));
        if (visibleFields.length === 0) return null;

        return (
          <div key={groupName} style={{
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            {showGroups && (
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
                <span>{groupName} ({visibleFields.length})</span>
                {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            )}
            {!isCollapsed && (
              <div style={{
                padding: 10,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
                background: '#fff',
              }}>
                {visibleFields.map(renderField)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StructuredFieldForm;
