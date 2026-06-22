/**
 * G005 放射RIS系统 v3.0.6.8-23c - AppFormDatePicker 组件
 *
 * 三段式 DatePicker: label + 校验态边框 + 错误提示 + a11y 属性。
 * 基于 native input[type=date] (避免 antd 体积成本) + ISO 日期格式。
 */
import { type ReactNode, type CSSProperties } from "react";
import { AppFormField } from "./AppFormField";

export interface AppFormDatePickerProps {
  /** 字段标签 */
  label?: ReactNode;
  /** 是否必填 */
  required?: boolean;
  /** 校验错误信息 */
  error?: string;
  /** 字段说明 */
  description?: ReactNode;
  /** 字段提示 */
  tooltip?: ReactNode;
  /** 值 (YYYY-MM-DD 格式) */
  value?: string;
  /** 默认值 */
  defaultValue?: string;
  /** onChange (ISO YYYY-MM-DD) */
  onChange?: (value: string) => void;
  /** placeholder */
  placeholder?: string;
  /** 最小日期 */
  min?: string;
  /** 最大日期 */
  max?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** size */
  size?: "small" | "middle" | "large";
  /** a11y label */
  ariaLabel?: string;
  /** 名称 */
  name?: string;
  /** 布局 */
  layout?: "vertical" | "horizontal";
  /** label 宽度 (horizontal) */
  labelWidth?: number | string;
  /** 自定义 className */
  className?: string;
  /** 自定义 style */
  style?: CSSProperties;
  /** 是否显示时间选择 */
  showTime?: boolean;
}

export function AppFormDatePicker({
  label,
  required = false,
  error,
  description,
  tooltip,
  value,
  defaultValue,
  onChange,
  placeholder,
  min,
  max,
  disabled,
  size = "middle",
  ariaLabel,
  name,
  layout = "vertical",
  labelWidth,
  className,
  style,
}: AppFormDatePickerProps) {
  const paddingBySize =
    size === "small" ? "4px 8px" : size === "large" ? "10px 14px" : "6px 10px";
  const fontBySize = size === "small" ? 12 : size === "large" ? 15 : 13;

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: paddingBySize,
    border: `1px solid ${error ? "#dc2626" : "#e2e8f0"}`,
    borderRadius: 6,
    fontSize: fontBySize,
    color: "#1e293b",
    background: disabled ? "#f8fafc" : "#fff",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: error ? "0 0 0 2px rgba(220, 38, 38, 0.1)" : undefined,
    ...style,
  };

  return (
    <AppFormField
      label={label}
      required={required}
      error={error}
      description={description}
      tooltip={tooltip}
      layout={layout}
      labelWidth={labelWidth}
      className={className}
    >
      <input
        type="date"
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        name={name}
        aria-label={
          ariaLabel ?? (typeof label === "string" ? label : undefined)
        }
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        placeholder={placeholder}
        style={inputStyle}
      />
    </AppFormField>
  );
}

export default AppFormDatePicker;
