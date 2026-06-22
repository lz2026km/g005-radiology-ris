/**
 * G005 放射RIS系统 v3.0.6.8-23c - AppFormField 组件
 *
 * 三段式表单字段封装: label (含必填 *) + control + error 提示
 *
 * 契约 (A6-A11 业务页引用):
 *  - label: 显示文本
 *  - required: 是否必填 (label 内联 <span style="color:#dc2626">*</span>)
 *  - error: 错误信息 (控件边框变红 + error 文案)
 *  - children: 控件 (Input/Select/DatePicker/...)
 *  - layout: 'vertical' | 'horizontal'
 *  - tooltip: 字段说明
 */
import { type ReactNode, type CSSProperties, useId } from "react";

export interface AppFormFieldProps {
  /** 字段标签 */
  label?: ReactNode;
  /** 是否必填 (在 label 内联 *) */
  required?: boolean;
  /** 校验错误信息 (控件边框变红 + 错误提示) */
  error?: string;
  /** 字段提示 (右上角 ? 图标) */
  tooltip?: ReactNode;
  /** 字段说明 (控件下方灰字) */
  description?: ReactNode;
  /** 控件 */
  children: ReactNode;
  /** 布局 */
  layout?: "vertical" | "horizontal";
  /** label 宽度 (horizontal 模式) */
  labelWidth?: number | string;
  /** 自定义 className */
  className?: string;
  /** 自定义 style */
  style?: CSSProperties;
  /** 是否隐藏 label */
  hideLabel?: boolean;
  /** 必填星号自定义颜色 */
  requiredColor?: string;
}

export function AppFormField({
  label,
  required = false,
  error,
  tooltip,
  description,
  children,
  layout = "vertical",
  labelWidth = 100,
  className,
  style,
  hideLabel = false,
  requiredColor = "#dc2626",
}: AppFormFieldProps) {
  const id = useId();
  const errId = error ? `${id}-err` : undefined;

  const labelStyle: CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "#334155",
    marginBottom: layout === "vertical" ? 6 : 0,
    display: "block",
  };

  if (layout === "horizontal") {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          ...style,
        }}
      >
        {!hideLabel && (
          <label
            htmlFor={id}
            style={{
              ...labelStyle,
              flexShrink: 0,
              width: labelWidth,
              paddingTop: 6,
              marginBottom: 0,
            }}
          >
            {label}
            {required && (
              <span
                style={{ color: requiredColor, marginLeft: 4 }}
                aria-label="必填"
              >
                *
              </span>
            )}
          </label>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {cloneWithErrorAndId(children, id, errId, !!error)}
          {description && (
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              {description}
            </div>
          )}
          {error && (
            <div
              id={errId}
              role="alert"
              style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ marginBottom: 12, ...style }}>
      {!hideLabel && label !== undefined && label !== null && (
        <label htmlFor={id} style={labelStyle}>
          {label}
          {required && (
            <span
              style={{ color: requiredColor, marginLeft: 4 }}
              aria-label="必填"
            >
              *
            </span>
          )}
          {tooltip && (
            <span
              title={typeof tooltip === "string" ? tooltip : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 14,
                height: 14,
                marginLeft: 4,
                borderRadius: "50%",
                background: "#cbd5e1",
                color: "#fff",
                fontSize: 10,
                cursor: "help",
                verticalAlign: "middle",
              }}
            >
              ?
            </span>
          )}
        </label>
      )}
      {cloneWithErrorAndId(children, id, errId, !!error)}
      {description && (
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
          {description}
        </div>
      )}
      {error && (
        <div
          id={errId}
          role="alert"
          style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * 在子控件上注入 id / aria-invalid / aria-describedby。
 * 控件的边框变红由 CSS aria-invalid="true" 选择器处理。
 */
function cloneWithErrorAndId(
  node: ReactNode,
  id: string,
  errId: string | undefined,
  hasError: boolean,
): ReactNode {
  if (
    !node ||
    typeof node !== "object" ||
    !("type" in (node as Record<string, unknown>))
  ) {
    return node;
  }
  const element = node as unknown as React.ReactElement<
    Record<string, unknown>
  >;
  const existingProps = (element.props ?? {}) as Record<string, unknown>;
  return {
    ...element,
    props: {
      ...existingProps,
      id,
      "aria-invalid": hasError || undefined,
      "aria-describedby": errId ?? existingProps["aria-describedby"],
      style: mergeStyleWithError(existingProps.style, hasError),
    },
  };
}

function mergeStyleWithError(style: unknown, hasError: boolean): CSSProperties {
  const base = (style ?? {}) as CSSProperties;
  if (!hasError) return base;
  const errBorder = "1px solid #dc2626";
  return {
    ...base,
    borderColor: "#dc2626",
    border: errBorder,
    borderTop: errBorder,
    borderRight: errBorder,
    borderBottom: errBorder,
    borderLeft: errBorder,
  };
}

export default AppFormField;
