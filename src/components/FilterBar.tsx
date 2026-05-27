/**
 * FilterBar 组件 - 通用筛选栏
 * G005 Radiology RIS System
 */
import React, { useCallback } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import type { ModalityType, PatientType, Priority, ExamStatus } from '../types';

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface FilterBarProps {
  // 筛选状态
  modalities?: ModalityType[];
  patientTypes?: PatientType[];
  priorities?: Priority[];
  statuses?: ExamStatus[];
  dateStart?: string;
  dateEnd?: string;
  
  // 可选项目
  modalityOptions?: FilterOption<ModalityType>[];
  patientTypeOptions?: FilterOption<PatientType>[];
  priorityOptions?: FilterOption<Priority>[];
  statusOptions?: FilterOption<ExamStatus>[];
  
  // 回调
  onModalityChange?: (values: ModalityType[]) => void;
  onPatientTypeChange?: (values: PatientType[]) => void;
  onPriorityChange?: (values: Priority[]) => void;
  onStatusChange?: (values: ExamStatus[]) => void;
  onDateRangeChange?: (start: string, end: string) => void;
  onReset?: () => void;
  
  // 显示控制
  showModalityFilter?: boolean;
  showPatientTypeFilter?: boolean;
  showPriorityFilter?: boolean;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  
  className?: string;
}

interface MultiSelectProps<T extends string> {
  options: FilterOption<T>[];
  selected: T[];
  onChange: (values: T[]) => void;
  placeholder: string;
}

function MultiSelect<T extends string>({
  options,
  selected,
  onChange,
  placeholder,
}: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 h-9 px-3 text-sm rounded-lg border transition-colors ${
          selected.length > 0
            ? 'border-[var(--blue-accent)] bg-[var(--blue-accent)]/10 text-[var(--blue-accent)]'
            : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--blue-accent)]'
        }`}
      >
        <Filter size={14} />
        {placeholder}
        {selected.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--blue-accent)] text-white rounded">
            {selected.length}
          </span>
        )}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-lg z-50">
          <div className="p-1 max-h-60 overflow-y-auto">
            {options.map(opt => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-[var(--bg-elevated)] rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => handleToggle(opt.value)}
                  className="rounded border-[var(--border-subtle)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Import useState
import { useState } from 'react';

export const FilterBar: React.FC<FilterBarProps> = ({
  modalities = [],
  patientTypes = [],
  priorities = [],
  statuses = [],
  modalityOptions = [],
  patientTypeOptions = [],
  priorityOptions = [],
  statusOptions = [],
  onModalityChange,
  onPatientTypeChange,
  onPriorityChange,
  onStatusChange,
  onDateRangeChange,
  onReset,
  showModalityFilter = true,
  showPatientTypeFilter = true,
  showPriorityFilter = true,
  showStatusFilter = true,
  showDateFilter = true,
  className = '',
}) => {
  const hasActiveFilters = 
    modalities.length > 0 ||
    patientTypes.length > 0 ||
    priorities.length > 0 ||
    statuses.length > 0 ||
    dateStart ||
    dateEnd;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* 设备类型筛选 */}
      {showModalityFilter && modalityOptions.length > 0 && onModalityChange && (
        <MultiSelect
          options={modalityOptions}
          selected={modalities}
          onChange={onModalityChange}
          placeholder="设备类型"
        />
      )}

      {/* 患者类型筛选 */}
      {showPatientTypeFilter && patientTypeOptions.length > 0 && onPatientTypeChange && (
        <MultiSelect
          options={patientTypeOptions}
          selected={patientTypes}
          onChange={onPatientTypeChange}
          placeholder="患者类型"
        />
      )}

      {/* 优先级筛选 */}
      {showPriorityFilter && priorityOptions.length > 0 && onPriorityChange && (
        <MultiSelect
          options={priorityOptions}
          selected={priorities}
          onChange={onPriorityChange}
          placeholder="优先级"
        />
      )}

      {/* 状态筛选 */}
      {showStatusFilter && statusOptions.length > 0 && onStatusChange && (
        <MultiSelect
          options={statusOptions}
          selected={statuses}
          onChange={onStatusChange}
          placeholder="状态"
        />
      )}

      {/* 日期筛选 */}
      {showDateFilter && onDateRangeChange && (
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={dateStart || ''}
            onChange={e => onDateRangeChange(e.target.value, dateEnd || '')}
            className="h-9 px-2 text-sm border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)]"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={dateEnd || ''}
            onChange={e => onDateRangeChange(dateStart || '', e.target.value)}
            className="h-9 px-2 text-sm border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)]"
          />
        </div>
      )}

      {/* 重置按钮 */}
      {hasActiveFilters && onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 h-9 px-3 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <X size={14} />
          清除筛选
        </button>
      )}
    </div>
  );
};

export default FilterBar;