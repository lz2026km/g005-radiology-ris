// P3: react-window虚拟列表处理大数据检查列表
// 虚拟化列表组件，用于高效渲染大量数据（如检查列表）

import React, { useRef, useEffect, useState, useCallback } from "react";

// 虚拟列表配置
interface VirtualListConfig {
  itemHeight?: number; // 每项高度（px）
  overscan?: number; // 预渲染数量（默认3）
  buffer?: number; // 缓冲区比例（默认0.5）
}

// 虚拟列表Props
interface VirtualListProps<T> {
  data: T[]; // 数据列表
  renderItem: (item: T, index: number) => React.ReactNode; // 渲染函数
  height: number | string; // 列表可视区域高度
  config?: VirtualListConfig;
  onEndReached?: () => void; // 滚动到底部回调（分页加载）
  endThreshold?: number; // 触发底部加载的距离（默认200px）
}

// 虚拟化列表组件
export function VirtualList<T>({
  data,
  renderItem,
  height,
  config = {},
  onEndReached,
  endThreshold = 200,
}: VirtualListProps<T>) {
  const { itemHeight = 48, overscan = 3 } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // 计算可视区域能显示的项数
  const visibleCount = Math.ceil(
    (typeof height === "number" ? height : containerHeight) / itemHeight,
  );

  // 计算起始和结束索引
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    data.length - 1,
    startIndex + visibleCount + overscan * 2,
  );

  // 获取可见项
  const visibleItems = data.slice(startIndex, endIndex + 1);

  // 滚动处理
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const newScrollTop = target.scrollTop;
      setScrollTop(newScrollTop);

      // 检测是否滚动到底部
      const scrollBottom =
        target.scrollHeight - target.clientHeight - newScrollTop;
      if (scrollBottom < endThreshold && onEndReached) {
        onEndReached();
      }
    },
    [endThreshold, onEndReached],
  );

  // 测量容器高度
  useEffect(() => {
    if (typeof height === "number") return;
    if (!containerRef.current) return;
    const node = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [height]);

  const totalHeight = data.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: typeof height === "number" ? height : containerHeight,
        overflow: "auto",
        position: "relative",
      }}
    >
      {/* 虚拟滚动内容 */}
      <div
        style={{
          height: totalHeight,
          position: "relative",
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, startIndex + index),
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 大数据列表优化示例 - 用于检查列表/工作列表
// ============================================================

interface ExamItem {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  examType: string;
  examItemName: string;
  modality: string;
  device: string;
  examDate: string;
  status: string;
  priority: string;
}

// 虚拟化检查列表
export const VirtualExamList: React.FC<{
  exams: ExamItem[];
  onSelect: (examId: string) => void;
  onLoadMore?: () => void;
}> = ({ exams, onSelect, onLoadMore }) => {
  return (
    <div style={{ height: 500, overflow: "auto" }}>
      {exams.map((exam) => (
        <div
          key={exam.id}
          onClick={() => onSelect(exam.id)}
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            borderBottom: "1px solid #e5e7eb",
            cursor: "pointer",
          }}
        >
          <div style={{ width: 80, fontSize: 12, color: "#6b7280" }}>
            {exam.id}
          </div>
          <div
            style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#e0e7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "#4f46e5",
              }}
            >
              {exam.patientName.slice(-1)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {exam.patientName}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {exam.examType} · {exam.modality}
              </div>
            </div>
          </div>
          <div style={{ width: 120, fontSize: 13 }}>{exam.device}</div>
          <div style={{ width: 80, display: "flex", justifyContent: "center" }}>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
                background: exam.status === "已报告" ? "#d1fae5" : "#fef3c7",
                color: exam.status === "已报告" ? "#059669" : "#ca8a04",
              }}
            >
              {exam.status}
            </span>
          </div>
          {exam.priority !== "普通" && (
            <div
              style={{
                padding: "2px 6px",
                background: exam.priority === "危重" ? "#fee2e2" : "#fef3c7",
                color: exam.priority === "危重" ? "#dc2626" : "#d97706",
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              {exam.priority}
            </div>
          )}
        </div>
      ))}
      {onLoadMore && (
        <div
          onClick={onLoadMore}
          style={{
            padding: 16,
            textAlign: "center",
            cursor: "pointer",
            color: "#6b7280",
          }}
        >
          加载更多
        </div>
      )}
    </div>
  );
};

export function usePaginator<T>(initialData: T[] = [], pageSize = 50) {
  const [data, setData] = useState<T[]>(initialData);
  const [state, setState] = useState<{
    page: number;
    pageSize: number;
    hasMore: boolean;
    isLoading: boolean;
  }>({
    page: 1,
    pageSize,
    hasMore: true,
    isLoading: false,
  });

  const loadMore = useCallback(
    async (fetcher: (page: number, pageSize: number) => Promise<T[]>) => {
      if (state.isLoading || !state.hasMore) return;

      setState((s) => ({ ...s, isLoading: true }));

      try {
        const newItems = await fetcher(state.page, state.pageSize);
        setData((prev) => [...prev, ...newItems]);
        setState((s) => ({
          ...s,
          page: s.page + 1,
          hasMore: newItems.length >= pageSize,
        }));
      } finally {
        setState((s) => ({ ...s, isLoading: false }));
      }
    },
    [state.page, state.pageSize, state.isLoading, state.hasMore],
  );

  const reset = useCallback(
    (newData: T[] = []) => {
      setData(newData);
      setState({
        page: 1,
        pageSize,
        hasMore: true,
        isLoading: false,
      });
    },
    [pageSize],
  );

  return {
    data,
    state,
    loadMore,
    reset,
    hasMore: state.hasMore,
    isLoading: state.isLoading,
  };
}

export default {
  VirtualList,
  VirtualExamList,
  usePaginator,
};
