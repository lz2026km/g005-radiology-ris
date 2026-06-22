/**
 * G005 放射RIS系统 v3.0.6.8-23c - AppFormSelect 组件
 *
 * 三段式 Select: label + 校验态边框 + 错误提示 + a11y 属性。
 * 选项支持: string | number | { label, value, disabled }。
 */
import { type ReactNode, type CSSProperties } from "react";
import { AppFormField } from "./AppFormField";

export interface AppFormSelectOption {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
}

export interface AppFormSelectProps {
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
  value?: string | number | Array<string | number>;
  /** 默认值 */
  defaultValue?: string | number | Array<string | number>;
  /** 选项列表 */
  options: Array<string | number | AppFormSelectOption>;
  /** onChange */
  onChange?: (value: string | number | Array<string | number>) => void;
  /** placeholder */
  placeholder?: string;
  /** 是否多选 */
  multiple?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否允许清除 */
  allowClear?: boolean;
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
  /** 自定义渲染选项 (用于 native option 模式) */
  children?: ReactNode;
}

function normalizeOptions(
  options: AppFormSelectProps["options"],
): AppFormSelectOption[] {
  return options.map((opt) => {
    if (
      typeof opt === "object" &&
      opt !== null &&
      "label" in opt &&
      "value" in opt
    ) {
      return opt as AppFormSelectOption;
    }
    return { label: String(opt), value: opt as string | number };
  });
}

export function AppFormSelect({
  label,
  required = false,
  error,
  description,
  tooltip,
  value,
  defaultValue,
  options,
  onChange,
  placeholder,
  multiple = false,
  disabled,
  allowClear = false,
  size = "middle",
  ariaLabel,
  name,
  layout = "vertical",
  labelWidth,
  className,
  style,
}: AppFormSelectProps) {
  const opts = normalizeOptions(options);

  const paddingBySize =
    size === "small"
      ? "4px 26px 4px 8px"
      : size === "large"
        ? "10px 30px 10px 14px"
        : "6px 28px 6px 10px";
  const fontBySize = size === "small" ? 12 : size === "large" ? 15 : 13;

  const selectStyle: CSSProperties = {
    width: "100%",
    padding: paddingBySize,
    border: `1px solid ${error ? "#dc2626" : "#e2e8f0"}`,
    borderRadius: 6,
    fontSize: fontBySize,
    color: "#1e293b",
    background: disabled ? "#f8fafc" : "#fff",
    outline: "none",
    boxSizing: "border-box",
    appearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='2' fill='none' stroke-linecap='round'/></svg>\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    backgroundSize: "10px 6px",
    cursor: disabled ? "not-allowed" : "pointer",
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
      <select
        value={value as never}
        defaultValue={defaultValue as never}
        multiple={multiple}
        disabled={disabled}
        name={name}
        aria-label={
          ariaLabel ?? (typeof label === "string" ? label : undefined)
        }
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        style={selectStyle}
        onChange={(e) => {
          if (multiple) {
            const values = Array.from(e.target.selectedOptions).map(
              (o) => o.value,
            );
            onChange?.(values as Array<string | number>);
          } else {
            const v = e.target.value;
            const matched = opts.find((o) => String(o.value) === v);
            onChange?.(matched ? matched.value : v);
          }
        }}
      >
        {allowClear && !multiple && !required && (
          <option value="">{placeholder ?? "请选择"}</option>
        )}
        {allowClear && !multiple && required && (
          <option value="" disabled>
            {placeholder ?? "请选择"}
          </option>
        )}
        {!allowClear && (
          <option value="" disabled>
            {placeholder ?? "请选择"}
          </option>
        )}
        {opts.map((opt) => (
          <option
            key={String(opt.value)}
            value={String(opt.value)}
            disabled={opt.disabled}
          >
            {typeof opt.label === "string" ? opt.label : String(opt.label)}
          </option>
        ))}
      </select>
    </AppFormField>
  );
}

export default AppFormSelect;
