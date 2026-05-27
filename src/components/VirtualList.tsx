// @ts-nocheck
// P3: react-window虚拟列表处理大数据检查列表
// 虚拟化列表组件，用于高效渲染大量数据（如检查列表）

import React, { useRef, useEffect, useState, useCallback } from 'react'

// 虚拟列表配置
interface VirtualListConfig {
  itemHeight: number       // 每项高度（px）
  overscan?: number       // 预渲染数量（默认3）
  buffer?: number         // 缓冲区比例（默认0.5）
}

// 虚拟列表Props
interface VirtualListProps<T> {
  data: T[]               // 数据列表
  renderItem: (item: T, index: number) => React.ReactNode  // 渲染函数
  height: number | string // 列表可视区域高度
  config?: VirtualListConfig
  onEndReached?: () => void  // 滚动到底部回调（分页加载）
  endThreshold?: number       // 触发底部加载的距离（默认200px）
}

// 虚拟化列表组件
export function VirtualList<T>({
  data,
  renderItem,
  height,
  config = {},
  onEndReached,
  endThreshold = 200
}: VirtualListProps<T>) {
  const { itemHeight, overscan = 3, buffer = 0.5 } = config
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  
  // 计算可视区域能显示的项数
  const visibleCount = Math.ceil(
    (typeof height === 'number' ? height : containerHeight) / itemHeight
  )
  
  // 计算起始和结束索引
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    data.length - 1,
    startIndex + visibleCount + overscan * 2
  )
  
  // 获取可见项
  const visibleItems = data.slice(startIndex, endIndex + 1)
  
  // 滚动处理
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const newScrollTop = target.scrollTop
    setScrollTop(newScrollTop)
    
    // 检测是否滚动到底部
    const scrollBottom = target.scrollHeight - target.clientHeight - newScrollTop
    if (scrollBottom < endThreshold && onEndReached) {
      onEndReached()
    }
  }, [endThreshold, onEndReached])
  
  // 测量容器高度
  useEffect(() => {
    if (typeof height !== 'number' && containerRef.current) {
      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height)
        }
      })
      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }
  }, [height])
  
  const totalHeight = data.length * itemHeight
  const offsetY = startIndex * itemHeight
  
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: typeof height === 'number' ? height : containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
    >
      {/* 虚拟滚动内容 */}
      <div style={{
        height: totalHeight,
        position: 'relative'
      }}>
        <div style={{
          transform: `translateY(${offsetY}px)`
        }}>
          {visibleItems.map((item, index) => 
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 大数据列表优化示例 - 用于检查列表/工作列表
// ============================================================

interface ExamItem {
  id: string
  patientName: string
  age: number
  gender: string
  examItemName: string
  modality: string
  examDate: string
  status: string
  priority: string
}

// 虚拟化检查列表
export const VirtualExamList: React.FC<{
  exams: ExamItem[]
  onSelect: (examId: string) => void
  onLoadMore?: () => void
}> = ({ exams, onSelect, onLoadMore }) => {
  const ITEM_HEIGHT = 72 // 每项高度
  
  return (
    <VirtualList<ExamItem>
      data={exams}
      height={500}
      config={{ itemHeight: ITEM_HEIGHT, overscan: 3 }}
      onEndReached={onLoadMore}
      renderItem={(exam, index) => (
        <div
          key={exam.id}
          onClick={() => onSelect(exam.id)}
          style={{
            height: ITEM_HEIGHT,
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: index % 2 === 0 ? '#fff' : '#f8fafc',
            transition: 'background 0.15s'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
          onMouseLeave={e => (e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#f8fafc')}
        >
          {/* 患者信息 */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              {exam.patientName}
              <span style={{ marginLeft: 8, fontSize: 12, color: '#64748b' }}>
                {exam.gender}/{exam.age}岁
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {exam.examItemName}
            </div>
          </div>
          
          {/* 模态 */}
          <div style={{
            padding: '4px 8px',
            background: '#eff6ff',
            color: '#3b82f6',
            borderRadius: 4,
            fontSize: 11
          }}>
            {exam.modality}
          </div>
          
          {/* 状态 */}
          <div style={{
            padding: '4px 8px',
            background: exam.status === '已报告' ? '#d1fae5' : '#fef3c7',
            color: exam.status === '已报告' ? '#059669' : '#ca8a04',
            borderRadius: 4,
            fontSize: 11
          }}>
            {exam.status}
          </div>
          
          {/* 优先级 */}
          {exam.priority !== '普通' && (
            <div style={{
              padding: '2px 6px',
              background: exam.priority === '危重' ? '#fee2e2' : '#fef3c7',
              color: exam.priority === '危重' ? '#dc2626' : '#d97706',
              borderRadius: 4,
              fontSize: 10
            }}>
              {exam.priority}
            </div>
          )}
        </div>
      )}
    </VirtualList>
  )
}

// ============================================================
// 分页加载器 (与虚拟列表配合使用)
// ============================================================

interface PaginatorState {
  page: number
  pageSize: number
  hasMore: boolean
  isLoading: boolean
}

export function usePaginator<T>(
  initialData: T[] = [],
  pageSize = 50
) {
  const [data, setData] = useState<T[]>(initialData)
  const [state, setState] = useState<PaginatorState>({
    page: 1,
    pageSize,
    hasMore: true,
    isLoading: false
  })
  
  const loadMore = useCallback(async (
    fetcher: (page: number, pageSize: number) => Promise<T[]>
  ) => {
    if (state.isLoading || !state.hasMore) return
    
    setState(s => ({ ...s, isLoading: true }))
    
    try {
      const newItems = await fetcher(state.page, state.pageSize)
      setData(prev => [...prev, ...newItems])
      setState(s => ({
        ...s,
        page: s.page + 1,
        hasMore: newItems.length >= pageSize
      }))
    } finally {
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [state.page, state.pageSize, state.isLoading, state.hasMore])
  
  const reset = useCallback((newData: T[] = []) => {
    setData(newData)
    setState({
      page: 1,
      pageSize,
      hasMore: true,
      isLoading: false
    })
  }, [pageSize])
  
  return {
    data,
    state,
    loadMore,
    reset,
    hasMore: state.hasMore,
    isLoading: state.isLoading
  }
}

export default {
  VirtualList,
  VirtualExamList,
  usePaginator
}