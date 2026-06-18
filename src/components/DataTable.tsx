/**
 * @deprecated v3.0.5.0: Duplicate of `src/components/data/ProTable.tsx`. Use `ProTable` instead.
 * This component is kept for backward compatibility only and will be removed in v3.0.6.
 * @see src/components/data/ProTable.tsx
 */
/**
 * DataTable 组件 - 通用数据表格
 * G005 Radiology RIS System
 */
import React, { useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];

  // 分页
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  // 排序
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (key: string, order: "asc" | "desc") => void;

  // 选择
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;

  // 行点击
  onRowClick?: (row: T) => void;

  // 空状态
  emptyText?: string;

  className?: string;
}

/** @deprecated Use ProTable from '@/components/data/ProTable' instead. */
export function DataTable<T extends { id: string }>({
  data,
  columns,
  page = 1,
  pageSize = 20,
  total,
  onPageChange,
  onPageSizeChange,
  sortKey,
  sortOrder = "asc",
  onSortChange,
  selectedIds,
  onSelectionChange,
  onRowClick,
  emptyText = "暂无数据",
  className = "",
}: DataTableProps<T>) {
  const totalCount = total ?? data.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const handleSort = useCallback(
    (key: string) => {
      if (!onSortChange) return;
      const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
      onSortChange(key, newOrder);
    },
    [sortKey, sortOrder, onSortChange],
  );

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    if (selectedIds?.size === paginatedData.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(paginatedData.map((item) => item.id)));
    }
  }, [paginatedData, selectedIds, onSelectionChange]);

  const handleSelectRow = useCallback(
    (id: string) => {
      if (!onSelectionChange) return;
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      onSelectionChange(newSet);
    },
    [selectedIds, onSelectionChange],
  );

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ArrowUpDown size={14} className="text-gray-500" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-[var(--blue-accent)]" />
    ) : (
      <ArrowDown size={14} className="text-[var(--blue-accent)]" />
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--bg-card)]">
              {onSelectionChange && (
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds?.size === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-[var(--border-subtle)]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  style={{ width: col.width }}
                  className={`px-3 py-3 text-sm font-medium text-[var(--text-secondary)] border-b border-[var(--border-subtle)] ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                        ? "text-right"
                        : "text-left"
                  } ${col.sortable ? "cursor-pointer hover:text-white" : ""}`}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <div
                    className={`flex items-center gap-1 ${col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : ""}`}
                  >
                    {col.title}
                    {col.sortable && renderSortIcon(col.key as string)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                  className="px-3 py-12 text-center text-[var(--text-muted)]"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-[var(--border-subtle)] hover:bg-[var(--blue-accent)]/5 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${selectedIds?.has(row.id) ? "bg-[var(--blue-accent)]/10" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {onSelectionChange && (
                    <td
                      className="w-10 px-3 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds?.has(row.id) || false}
                        onChange={() => handleSelectRow(row.id)}
                        className="rounded border-[var(--border-subtle)]"
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const value = (row as unknown as Record<string, unknown>)[
                      col.key as string
                    ];
                    return (
                      <td
                        key={col.key as string}
                        className={`px-3 py-3 text-sm text-[var(--text-primary)] ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                              ? "text-right"
                              : ""
                        }`}
                      >
                        {col.render
                          ? col.render(value, row, index)
                          : String(value ?? "-")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {(onPageChange || onPageSizeChange) && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            {onPageSizeChange && (
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-8 px-2 text-sm border border-[var(--border-subtle)] rounded bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}条/页
                  </option>
                ))}
              </select>
            )}
            <span>
              显示 {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, totalCount)} 共 {totalCount}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(1)}
              disabled={page === 1}
              className="p-1.5 hover:bg-[var(--bg-elevated)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className="p-1.5 hover:bg-[var(--bg-elevated)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p =
                page <= 3
                  ? i + 1
                  : page >= totalPages - 2
                    ? totalPages - 4 + i
                    : page - 2 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className={`w-8 h-8 text-sm rounded ${
                    p === page
                      ? "bg-[var(--blue-accent)] text-white"
                      : "hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className="p-1.5 hover:bg-[var(--bg-elevated)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 hover:bg-[var(--bg-elevated)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** @deprecated Use ProTable from '@/components/data/ProTable' instead. */
export default DataTable;
