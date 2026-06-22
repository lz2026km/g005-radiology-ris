/**
 * G005 放射RIS系统 v3.0.6.8-23c - AppFormInput 组件
 *
 * 三段式 Input: 封装 label + 校验态边框 + 错误提示 + a11y 属性。
 * 自动注入: id / aria-invalid / aria-describedby。
 */
import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { AppFormField } from "./AppFormField";

export interface AppFormInputProps {
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
  /** 值 */
  value?: string | number;
  /** 默认值 */
  defaultValue?: string | number;
  /** placeholder */
  placeholder?: string;
  /** onChange */
  onChange?: (value: string) => void;
  /** type */
  type?: "text" | "password" | "email" | "tel" | "url" | "number" | "search";
  /** 最大长度 */
  maxLength?: number;
  /** 最小长度 */
  minLength?: number;
  /** pattern */
  pattern?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 前缀图标/节点 */
  prefix?: ReactNode;
  /** 后缀图标/节点 */
  suffix?: ReactNode;
  /** 是否显示清除按钮 */
  allowClear?: boolean;
  /** size */
  size?: "small" | "middle" | "large";
  /** a11y label */
  ariaLabel?: string;
  /** name */
  name?: string;
  /** 自动完成 */
  autoComplete?: string;
  /** 布局 */
  layout?: "vertical" | "horizontal";
  /** label 宽度 (horizontal) */
  labelWidth?: number | string;
  /** onBlur */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** onPressEnter */
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** 自定义 className */
  className?: string;
  /** 自定义 style */
  style?: CSSProperties;
}

const DEFAULT_BORDER = "#e2e8f0";
const ERROR_BORDER = "#dc2626";

export const AppFormInput = forwardRef<HTMLInputElement, AppFormInputProps>(
  function AppFormInput(
    {
      label,
      required = false,
      error,
      description,
      tooltip,
      value,
      defaultValue,
      placeholder,
      onChange,
      type = "text",
      maxLength,
      minLength,
      pattern,
      disabled,
      readOnly,
      prefix,
      suffix,
      allowClear = false,
      size = "middle",
      ariaLabel,
      name,
      autoComplete,
      layout = "vertical",
      labelWidth,
      className,
      style,
      onBlur,
      onPressEnter,
    },
    ref,
  ) {
    const paddingBySize =
      size === "small"
        ? "4px 8px"
        : size === "large"
          ? "10px 14px"
          : "6px 10px";
    const fontBySize = size === "small" ? 12 : size === "large" ? 15 : 13;

    const inputStyle: CSSProperties = {
      width: "100%",
      padding: paddingBySize,
      border: `1px solid ${error ? ERROR_BORDER : DEFAULT_BORDER}`,
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
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          {prefix && (
            <span
              style={{
                position: "absolute",
                left: 8,
                color: "#94a3b8",
                pointerEvents: "none",
                display: "inline-flex",
              }}
            >
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onPressEnter) onPressEnter(e);
            }}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            disabled={disabled}
            readOnly={readOnly}
            name={name}
            autoComplete={autoComplete}
            aria-label={
              ariaLabel ?? (typeof label === "string" ? label : undefined)
            }
            aria-required={required || undefined}
            style={{ ...inputStyle, paddingLeft: prefix ? 28 : paddingBySize }}
          />
          {suffix && (
            <span
              style={{
                position: "absolute",
                right: 8,
                color: "#94a3b8",
                display: "inline-flex",
              }}
            >
              {suffix}
            </span>
          )}
          {allowClear && value && !disabled && (
            <button
              type="button"
              aria-label="清除"
              onClick={() => onChange?.("")}
              style={{
                position: "absolute",
                right: suffix ? 28 : 8,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#94a3b8",
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>
      </AppFormField>
    );
  },
);

export default AppFormInput;
