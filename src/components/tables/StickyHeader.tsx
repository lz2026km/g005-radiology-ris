/**
 * G005 放射RIS系统 v3.0.6.8-23c - StickyHeader 组件
 *
 * 提供粘性表头 (position: sticky) 统一实现,被 StandardTable 引用。
 * 单一职责: 渲染 <thead> 内含 <th> + 排序图标 + checkbox 列。
 */
import { useMemo, type CSSProperties, type ReactNode } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  CheckSquare,
  Square,
} from "lucide-react";

export type SortDirection = "asc" | "desc" | null;
export type ColumnAlign = "left" | "center" | "right";

export interface StickyHeaderColumn<T = Record<string, unknown>> {
  /** 列字段 key 或 dataIndex */
  key: string;
  /** 列标题 */
  title: ReactNode;
  /** 列宽 (CSS) */
  width?: number | string;
  /** 对齐方式 */
  align?: ColumnAlign;
  /** 是否可排序 */
  sortable?: boolean;
  /** 是否为 checkbox 列 */
  checkboxColumn?: boolean;
  /** 列头 scope */
  scope?: "col" | "row";
  /** 自定义类名 */
  className?: string;
  /** 自定义 style */
  style?: CSSProperties;
  /** 渲染 (列头) */
  renderHeader?: (col: StickyHeaderColumn<T>) => ReactNode;
  /** 渲染 (行单元格) — 高级用法 */
  render?: (row: T, index: number) => ReactNode;
}

export interface StickyHeaderProps<T = Record<string, unknown>> {
  /** 列定义 */
  columns: StickyHeaderColumn<T>[];
  /** 当前排序列 key */
  sortKey?: string;
  /** 当前排序方向 */
  sortOrder?: SortDirection;
  /** 排序回调 */
  onSort?: (key: string) => void;
  /** 是否全选 (checkbox 列) */
  allSelected?: boolean;
  /** 部分选中状态 */
  indeterminate?: boolean;
  /** 选择列 toggle 回调 */
  onToggleSelectAll?: () => void;
  /** 背景色 */
  background?: string;
  /** z-index */
  zIndex?: number;
  /** 顶部偏移 (用于多层 sticky) */
  top?: number;
  /** 主题 */
  theme?: "light" | "dark";
  /** 数据源 (用于 dataIndex) */
  dataSource?: T[];
  /** 子节点 (tbody) */
  children?: ReactNode;
}

const DEFAULT_BG = "#fff";
const LIGHT_HEADER_BG = "#f8fafc";
const DARK_HEADER_BG = "#1e3a5f";

export function StickyHeader<T = Record<string, unknown>>({
  columns,
  sortKey,
  sortOrder,
  onSort,
  allSelected = false,
  indeterminate = false,
  onToggleSelectAll,
  background = DEFAULT_BG,
  zIndex = 1,
  top = 0,
  theme = "light",
  children,
}: StickyHeaderProps<T>) {
  const headerBg = theme === "dark" ? DARK_HEADER_BG : LIGHT_HEADER_BG;
  const headerColor = theme === "dark" ? "#fff" : "#475569";

  const stickyStyle: CSSProperties = useMemo(
    () => ({
      position: "sticky",
      top,
      background,
      zIndex,
    }),
    [background, top, zIndex],
  );

  const renderSortIcon = (key: string) => {
    if (sortKey !== key || !sortOrder) {
      return <ArrowUpDown size={12} style={{ opacity: 0.45 }} />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={12} />
    ) : (
      <ArrowDown size={12} />
    );
  };

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        fontSize: 12,
      }}
    >
      <thead>
        <tr
          style={{
            background: headerBg,
            borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.15)" : "#e2e8f0"}`,
          }}
        >
          {columns.map((col) => {
            const align = col.align ?? "left";
            const isCheckbox = !!col.checkboxColumn;

            if (isCheckbox) {
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-label="选择"
                  style={{
                    ...stickyStyle,
                    width: col.width ?? 40,
                    padding: "10px 8px",
                    textAlign: "center",
                    color: headerColor,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {onToggleSelectAll ? (
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={allSelected ? "取消全选" : "全选"}
                      onClick={onToggleSelectAll}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onToggleSelectAll();
                        }
                      }}
                      style={{
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: allSelected
                          ? "#1e3a5f"
                          : indeterminate
                            ? "#3b82f6"
                            : "#cbd5e1",
                      }}
                    >
                      {allSelected || indeterminate ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </div>
                  ) : null}
                </th>
              );
            }

            const headerCellStyle: CSSProperties = {
              ...stickyStyle,
              padding: "10px 12px",
              textAlign: align,
              color: headerColor,
              fontWeight: 600,
              fontSize: 12,
              whiteSpace: "nowrap",
              cursor: col.sortable && onSort ? "pointer" : "default",
              userSelect: col.sortable ? "none" : "auto",
              width: col.width,
            };

            return (
              <th
                key={col.key}
                scope="col"
                style={{ ...headerCellStyle, ...col.style }}
                className={col.className}
                onClick={() => {
                  if (col.sortable && onSort) onSort(col.key);
                }}
                aria-sort={
                  sortKey === col.key
                    ? sortOrder === "asc"
                      ? "ascending"
                      : sortOrder === "desc"
                        ? "descending"
                        : "none"
                    : "none"
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent:
                      align === "right"
                        ? "flex-end"
                        : align === "center"
                          ? "center"
                          : "flex-start",
                  }}
                >
                  {col.renderHeader ? col.renderHeader(col) : col.title}
                  {col.sortable && onSort && (
                    <span
                      aria-hidden
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        opacity: sortKey === col.key ? 1 : 0.5,
                        color: sortKey === col.key ? "#1e3a5f" : headerColor,
                      }}
                    >
                      {renderSortIcon(col.key)}
                    </span>
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      {children && <tbody>{children}</tbody>}
    </table>
  );
}

export default StickyHeader;
